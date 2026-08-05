-- InvitaPro v2.36.1 — evita confirmaciones públicas duplicadas
begin;

-- Normaliza teléfonos para detectar al mismo invitado aunque use espacios o prefijos visuales.
create or replace function public.normalizar_telefono_rsvp(p_telefono text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(coalesce(p_telefono,''), '[^0-9]', '', 'g'), '');
$$;

-- Conserva la respuesta más reciente cuando ya existen duplicados históricos.
with ranked as (
  select id,
         row_number() over (
           partition by invitacion_id, public.normalizar_telefono_rsvp(telefono)
           order by updated_at desc nulls last, created_at desc
         ) as rn
  from public.confirmaciones
  where invitado_id is null
    and public.normalizar_telefono_rsvp(telefono) is not null
)
delete from public.confirmaciones c
using ranked r
where c.id=r.id and r.rn>1;

create unique index if not exists confirmaciones_publicas_telefono_unique
on public.confirmaciones(invitacion_id, public.normalizar_telefono_rsvp(telefono))
where invitado_id is null and public.normalizar_telefono_rsvp(telefono) is not null;

-- La función existente debe usar UPSERT para RSVP público. Se reemplaza solamente el bloque INSERT
-- mediante una versión compatible con las modalidades actuales.
create or replace function public.registrar_confirmacion(
  p_slug text,
  p_asistira boolean,
  p_adultos integer default 0,
  p_ninos integer default 0,
  p_nombre text default null,
  p_telefono text default null,
  p_mensaje text default null,
  p_codigo text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitacion public.invitaciones%rowtype;
  v_evento public.eventos%rowtype;
  v_invitado public.invitados%rowtype;
  v_confirmacion_id uuid;
  v_modalidad text;
  v_phone text;
begin
  if coalesce(p_adultos,0)<0 or coalesce(p_ninos,0)<0 then raise exception 'Las cantidades no pueden ser negativas'; end if;
  select * into v_invitacion from public.invitaciones where slug=trim(p_slug) limit 1;
  if v_invitacion.id is null then raise exception 'La invitación no existe'; end if;
  if v_invitacion.estado<>'publicada' then raise exception 'La invitación todavía no está publicada'; end if;
  v_modalidad:=lower(trim(coalesce(v_invitacion.modalidad,'')));
  if v_modalidad not in ('rsvp','autoservicio','pases') then raise exception 'Esta invitación no acepta confirmaciones RSVP'; end if;
  if v_invitacion.fecha_expiracion is not null and v_invitacion.fecha_expiracion<=now() then raise exception 'Esta invitación ya no está disponible'; end if;
  select * into v_evento from public.eventos where id=v_invitacion.evento_id;
  if v_evento.id is null then raise exception 'El evento relacionado no está disponible'; end if;

  if v_modalidad='pases' then
    if nullif(trim(coalesce(p_codigo,'')),'') is null then raise exception 'Se requiere el código del pase'; end if;
    select * into v_invitado from public.invitados where invitacion_id=v_invitacion.id and upper(trim(codigo))=upper(trim(p_codigo)) limit 1;
    if v_invitado.id is null then raise exception 'Código de pase inválido'; end if;
    if coalesce(p_adultos,0)>v_invitado.adultos_permitidos or coalesce(p_ninos,0)>v_invitado.ninos_permitidos then raise exception 'La confirmación supera los lugares asignados'; end if;
    insert into public.confirmaciones(invitacion_id,invitado_id,nombre,asistira,adultos,ninos,mensaje,telefono)
    values(v_invitacion.id,v_invitado.id,v_invitado.nombre,p_asistira,case when p_asistira then coalesce(p_adultos,0) else 0 end,case when p_asistira then coalesce(p_ninos,0) else 0 end,p_mensaje,coalesce(p_telefono,v_invitado.telefono))
    on conflict (invitado_id) where invitado_id is not null do update set asistira=excluded.asistira,adultos=excluded.adultos,ninos=excluded.ninos,mensaje=excluded.mensaje,telefono=excluded.telefono,updated_at=now()
    returning id into v_confirmacion_id;
    update public.invitados set estado=case when p_asistira then 'confirmado' else 'no_asistira' end where id=v_invitado.id;
  else
    if p_nombre is null or char_length(trim(p_nombre))<2 then raise exception 'Es necesario indicar el nombre'; end if;
    v_phone:=public.normalizar_telefono_rsvp(p_telefono);
    if v_phone is null then raise exception 'Es necesario indicar un teléfono para evitar respuestas duplicadas'; end if;
    insert into public.confirmaciones(invitacion_id,nombre,asistira,adultos,ninos,mensaje,telefono)
    values(v_invitacion.id,trim(p_nombre),p_asistira,case when p_asistira then coalesce(p_adultos,0) else 0 end,case when p_asistira then coalesce(p_ninos,0) else 0 end,p_mensaje,v_phone)
    on conflict (invitacion_id, public.normalizar_telefono_rsvp(telefono)) where invitado_id is null and public.normalizar_telefono_rsvp(telefono) is not null
    do update set nombre=excluded.nombre,asistira=excluded.asistira,adultos=excluded.adultos,ninos=excluded.ninos,mensaje=excluded.mensaje,telefono=excluded.telefono,updated_at=now()
    returning id into v_confirmacion_id;
  end if;
  return v_confirmacion_id;
end;
$$;

grant execute on function public.registrar_confirmacion(text,boolean,integer,integer,text,text,text,text) to anon,authenticated;
commit;
