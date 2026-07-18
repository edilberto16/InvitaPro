-- InvitaPro v2.4.6 — Solicitudes y leads
-- Ejecutar UNA VEZ en Supabase > SQL Editor.
begin;

create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  nombre text not null,
  telefono text not null,
  correo text,
  tipo_evento text not null,
  fecha_evento date,
  plantilla text,
  detalle text,
  estado text not null default 'nueva'
    check (estado in ('nueva','contactado','cerrada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists solicitudes_estado_idx on public.solicitudes(estado);
create index if not exists solicitudes_created_at_idx on public.solicitudes(created_at desc);
create index if not exists solicitudes_cliente_id_idx on public.solicitudes(cliente_id);

drop trigger if exists set_solicitudes_updated_at on public.solicitudes;
create trigger set_solicitudes_updated_at
before update on public.solicitudes
for each row execute function public.set_updated_at();

alter table public.solicitudes enable row level security;

drop policy if exists solicitudes_admin_select on public.solicitudes;
create policy solicitudes_admin_select on public.solicitudes
for select to authenticated
using (private.is_admin());

drop policy if exists solicitudes_admin_update on public.solicitudes;
create policy solicitudes_admin_update on public.solicitudes
for update to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists solicitudes_admin_delete on public.solicitudes;
create policy solicitudes_admin_delete on public.solicitudes
for delete to authenticated
using (private.is_admin());

create or replace function public.registrar_solicitud_publica(
  p_nombre text,
  p_telefono text,
  p_correo text default null,
  p_tipo_evento text default 'Otro',
  p_fecha date default null,
  p_plantilla text default null,
  p_detalle text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_admin_id uuid;
  v_cliente_id uuid;
  v_id uuid;
  v_email text;
  v_tel text;
begin
  if char_length(trim(coalesce(p_nombre,''))) < 2 then
    raise exception 'Nombre inválido';
  end if;
  if char_length(regexp_replace(coalesce(p_telefono,''),'\D','','g')) < 8 then
    raise exception 'Teléfono inválido';
  end if;

  v_email:=lower(trim(coalesce(p_correo,'')));
  v_tel:=regexp_replace(coalesce(p_telefono,''),'\D','','g');

  select p.id into v_admin_id
  from public.profiles p
  where p.rol='admin' and p.activo=true
  order by p.created_at asc
  limit 1;

  -- Buscar prospecto existente por correo o teléfono.
  select c.id into v_cliente_id
  from public.clientes c
  where (v_email<>'' and lower(trim(coalesce(c.correo,'')))=v_email)
     or (v_tel<>'' and regexp_replace(coalesce(c.telefono,''),'\D','','g')=v_tel)
  order by c.created_at desc
  limit 1;

  -- Si no existe, crear prospecto automáticamente.
  if v_cliente_id is null and v_admin_id is not null then
    insert into public.clientes(
      owner_id,nombre,telefono,correo,estado,etapa_comercial,notas
    )
    values(
      v_admin_id,trim(p_nombre),trim(p_telefono),
      nullif(trim(coalesce(p_correo,'')),''),
      'activo','prospecto','Solicitud recibida desde la página pública'
    )
    returning id into v_cliente_id;
  elsif v_cliente_id is not null then
    update public.clientes
    set telefono=case when coalesce(trim(telefono),'')='' then trim(p_telefono) else telefono end,
        correo=case when coalesce(trim(correo),'')='' then nullif(trim(coalesce(p_correo,'')),'') else correo end,
        updated_at=now()
    where id=v_cliente_id;
  end if;

  insert into public.solicitudes(
    cliente_id,nombre,telefono,correo,tipo_evento,fecha_evento,plantilla,detalle
  )
  values(
    v_cliente_id,trim(p_nombre),trim(p_telefono),
    nullif(trim(coalesce(p_correo,'')),''),
    p_tipo_evento,p_fecha,nullif(trim(coalesce(p_plantilla,'')),''),
    nullif(trim(coalesce(p_detalle,'')),'')
  )
  returning id into v_id;

  -- Avisar al administrador.
  if v_admin_id is not null then
    insert into public.notificaciones(profile_id,tipo,titulo,mensaje,url)
    values(
      v_admin_id,'sistema','Nueva solicitud de invitación',
      trim(p_nombre)||' solicitó información para '||p_tipo_evento||
      case when nullif(trim(coalesce(p_plantilla,'')),'') is not null then ' · '||trim(p_plantilla) else '' end,
      '/admin/solicitudes'
    );
  end if;

  return v_id;
end;
$$;

revoke all on function public.registrar_solicitud_publica(text,text,text,text,date,text,text) from public;
grant execute on function public.registrar_solicitud_publica(text,text,text,text,date,text,text) to anon, authenticated;

commit;
