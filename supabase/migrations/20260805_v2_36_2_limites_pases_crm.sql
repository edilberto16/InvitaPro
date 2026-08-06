-- InvitaPro v2.36.2 — límites de pases y sincronización de estado CRM
begin;

create or replace function public.normalizar_telefono_rsvp(p_telefono text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(coalesce(p_telefono, ''), '[^0-9]', '', 'g'), '');
$$;

create unique index if not exists confirmaciones_publicas_telefono_unique
on public.confirmaciones(invitacion_id, public.normalizar_telefono_rsvp(telefono))
where invitado_id is null and public.normalizar_telefono_rsvp(telefono) is not null;

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
  v_adultos integer := greatest(coalesce(p_adultos, 0), 0);
  v_ninos integer := greatest(coalesce(p_ninos, 0), 0);
begin
  select * into v_invitacion
  from public.invitaciones
  where slug = trim(p_slug)
  limit 1;

  if v_invitacion.id is null then raise exception 'La invitación no existe'; end if;
  if v_invitacion.estado <> 'publicada' then raise exception 'La invitación todavía no está publicada'; end if;

  v_modalidad := lower(trim(coalesce(v_invitacion.modalidad, '')));
  if v_modalidad not in ('rsvp', 'autoservicio', 'pases') then
    raise exception 'Esta invitación no acepta confirmaciones RSVP';
  end if;
  if v_invitacion.fecha_expiracion is not null and v_invitacion.fecha_expiracion <= now() then
    raise exception 'Esta invitación ya no está disponible';
  end if;

  select * into v_evento from public.eventos where id = v_invitacion.evento_id;
  if v_evento.id is null then raise exception 'El evento relacionado no está disponible'; end if;

  v_phone := public.normalizar_telefono_rsvp(p_telefono);

  -- Pase personalizado: el código es la fuente de verdad.
  if v_modalidad = 'pases' then
    if nullif(trim(coalesce(p_codigo, '')), '') is null then
      raise exception 'Se requiere el código del pase';
    end if;

    select * into v_invitado
    from public.invitados
    where invitacion_id = v_invitacion.id
      and upper(trim(codigo)) = upper(trim(p_codigo))
    limit 1;
  else
    -- RSVP público: si el teléfono pertenece a un invitado importado, se vincula y se respetan sus pases.
    if v_phone is not null then
      select * into v_invitado
      from public.invitados
      where invitacion_id = v_invitacion.id
        and public.normalizar_telefono_rsvp(telefono) = v_phone
      order by created_at asc
      limit 1;
    end if;
  end if;

  if v_invitado.id is not null then
    if p_asistira and (
      v_adultos > coalesce(v_invitado.adultos_permitidos, 0)
      or v_ninos > coalesce(v_invitado.ninos_permitidos, 0)
    ) then
      raise exception 'Solo tienes asignados % pase(s) de adulto y % pase(s) de niño',
        coalesce(v_invitado.adultos_permitidos, 0),
        coalesce(v_invitado.ninos_permitidos, 0);
    end if;

    insert into public.confirmaciones(
      invitacion_id, invitado_id, nombre, asistira, adultos, ninos, mensaje, telefono
    ) values (
      v_invitacion.id,
      v_invitado.id,
      v_invitado.nombre,
      p_asistira,
      case when p_asistira then v_adultos else 0 end,
      case when p_asistira then v_ninos else 0 end,
      p_mensaje,
      coalesce(v_phone, public.normalizar_telefono_rsvp(v_invitado.telefono))
    )
    on conflict (invitado_id) where invitado_id is not null
    do update set
      asistira = excluded.asistira,
      adultos = excluded.adultos,
      ninos = excluded.ninos,
      mensaje = excluded.mensaje,
      telefono = excluded.telefono,
      updated_at = now()
    returning id into v_confirmacion_id;

    update public.invitados
    set estado = case when p_asistira then 'confirmado' else 'no_asistira' end
    where id = v_invitado.id;
  else
    if p_nombre is null or char_length(trim(p_nombre)) < 2 then
      raise exception 'Es necesario indicar el nombre';
    end if;
    if v_phone is null then
      raise exception 'Es necesario indicar un teléfono para evitar respuestas duplicadas';
    end if;

    insert into public.confirmaciones(
      invitacion_id, nombre, asistira, adultos, ninos, mensaje, telefono
    ) values (
      v_invitacion.id,
      trim(p_nombre),
      p_asistira,
      case when p_asistira then v_adultos else 0 end,
      case when p_asistira then v_ninos else 0 end,
      p_mensaje,
      v_phone
    )
    on conflict (
      invitacion_id,
      public.normalizar_telefono_rsvp(telefono)
    ) where invitado_id is null and public.normalizar_telefono_rsvp(telefono) is not null
    do update set
      nombre = excluded.nombre,
      asistira = excluded.asistira,
      adultos = excluded.adultos,
      ninos = excluded.ninos,
      mensaje = excluded.mensaje,
      telefono = excluded.telefono,
      updated_at = now()
    returning id into v_confirmacion_id;
  end if;

  return v_confirmacion_id;
end;
$$;

grant execute on function public.registrar_confirmacion(
  text, boolean, integer, integer, text, text, text, text
) to anon, authenticated;

commit;
