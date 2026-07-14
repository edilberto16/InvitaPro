-- ============================================================
-- InvitaPro 1.0 - Esquema inicial para Supabase
-- Fecha: 2026-07-14
-- Ejecutar una sola vez en Supabase > SQL Editor
-- ============================================================

begin;

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ------------------------------------------------------------
-- Funciones generales
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Perfiles
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  telefono text,
  avatar_url text,
  rol text not null default 'cliente'
    check (rol in ('admin', 'cliente', 'colaborador')),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'rol', 'cliente');

  if requested_role not in ('admin', 'cliente', 'colaborador') then
    requested_role := 'cliente';
  end if;

  insert into public.profiles (id, nombre, telefono, avatar_url, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'telefono',
    new.raw_user_meta_data ->> 'avatar_url',
    requested_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function private.current_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.rol
  from public.profiles p
  where p.id = (select auth.uid())
    and p.activo = true
  limit 1;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_role() = 'admin', false);
$$;

-- ------------------------------------------------------------
-- Clientes
-- ------------------------------------------------------------

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  user_id uuid unique references public.profiles(id) on delete set null,
  nombre text not null check (char_length(trim(nombre)) >= 2),
  empresa text,
  telefono text,
  correo text,
  direccion text,
  notas text,
  estado text not null default 'activo'
    check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clientes_owner_id_idx on public.clientes(owner_id);
create index if not exists clientes_user_id_idx on public.clientes(user_id);
create index if not exists clientes_nombre_idx on public.clientes(lower(nombre));

-- ------------------------------------------------------------
-- Eventos
-- ------------------------------------------------------------

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  nombre text not null check (char_length(trim(nombre)) >= 2),
  tipo text not null,
  fecha date not null,
  hora time,
  zona_horaria text not null default 'America/Mexico_City',
  lugar text,
  direccion text,
  maps_url text,
  estado text not null default 'borrador'
    check (estado in ('borrador', 'confirmado', 'finalizado', 'cancelado')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eventos_cliente_id_idx on public.eventos(cliente_id);
create index if not exists eventos_fecha_idx on public.eventos(fecha);
create index if not exists eventos_estado_idx on public.eventos(estado);

-- ------------------------------------------------------------
-- Plantillas
-- ------------------------------------------------------------

create table if not exists public.plantillas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  nombre text not null,
  categoria text not null,
  descripcion text,
  preview_url text,
  design_json jsonb not null default '{"version":1,"componentes":[]}'::jsonb,
  premium boolean not null default false,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plantillas_owner_id_idx on public.plantillas(owner_id);
create index if not exists plantillas_categoria_idx on public.plantillas(categoria);
create index if not exists plantillas_activa_idx on public.plantillas(activa);

-- ------------------------------------------------------------
-- Invitaciones
-- ------------------------------------------------------------

create table if not exists public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  plantilla_id uuid references public.plantillas(id) on delete set null,
  titulo text not null,
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  modalidad text not null default 'simple'
    check (modalidad in ('simple', 'rsvp', 'pases')),
  estado text not null default 'borrador'
    check (estado in ('borrador', 'publicada', 'pausada', 'vencida')),
  design_json jsonb not null default '{"version":1,"componentes":[]}'::jsonb,
  color_principal text,
  musica_url text,
  whatsapp text,
  fecha_publicacion timestamptz,
  fecha_expiracion timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitaciones_expiracion_valida
    check (fecha_expiracion is null or fecha_publicacion is null or fecha_expiracion > fecha_publicacion)
);

create index if not exists invitaciones_evento_id_idx on public.invitaciones(evento_id);
create index if not exists invitaciones_estado_idx on public.invitaciones(estado);
create index if not exists invitaciones_modalidad_idx on public.invitaciones(modalidad);

-- ------------------------------------------------------------
-- Invitados y pases
-- ------------------------------------------------------------

create table if not exists public.invitados (
  id uuid primary key default gen_random_uuid(),
  invitacion_id uuid not null references public.invitaciones(id) on delete cascade,
  nombre text not null,
  telefono text,
  correo text,
  adultos_permitidos integer not null default 1 check (adultos_permitidos >= 0),
  ninos_permitidos integer not null default 0 check (ninos_permitidos >= 0),
  mesa text,
  codigo text not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmado', 'no_asistira')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invitacion_id, codigo)
);

create index if not exists invitados_invitacion_id_idx on public.invitados(invitacion_id);
create index if not exists invitados_estado_idx on public.invitados(estado);
create index if not exists invitados_codigo_idx on public.invitados(codigo);

-- ------------------------------------------------------------
-- Confirmaciones RSVP
-- ------------------------------------------------------------

create table if not exists public.confirmaciones (
  id uuid primary key default gen_random_uuid(),
  invitacion_id uuid not null references public.invitaciones(id) on delete cascade,
  invitado_id uuid references public.invitados(id) on delete cascade,
  nombre text,
  asistira boolean not null,
  adultos integer not null default 0 check (adultos >= 0),
  ninos integer not null default 0 check (ninos >= 0),
  mensaje text,
  telefono text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists confirmaciones_invitado_unique
  on public.confirmaciones(invitado_id)
  where invitado_id is not null;

create index if not exists confirmaciones_invitacion_id_idx on public.confirmaciones(invitacion_id);
create index if not exists confirmaciones_created_at_idx on public.confirmaciones(created_at desc);

-- ------------------------------------------------------------
-- Multimedia
-- ------------------------------------------------------------

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references public.eventos(id) on delete cascade,
  invitacion_id uuid references public.invitaciones(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  tipo text not null check (tipo in ('imagen', 'audio', 'video', 'documento')),
  bucket text not null,
  path text not null,
  nombre_original text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now(),
  constraint media_relacion_requerida
    check (evento_id is not null or invitacion_id is not null),
  unique (bucket, path)
);

create index if not exists media_evento_id_idx on public.media(evento_id);
create index if not exists media_invitacion_id_idx on public.media(invitacion_id);
create index if not exists media_owner_id_idx on public.media(owner_id);

-- ------------------------------------------------------------
-- Notificaciones
-- ------------------------------------------------------------

create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  evento_id uuid references public.eventos(id) on delete cascade,
  tipo text not null check (
    tipo in (
      'rsvp_confirmado',
      'rsvp_rechazado',
      'evento_proximo',
      'invitacion_publicada',
      'sistema'
    )
  ),
  titulo text not null,
  mensaje text not null,
  url text,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notificaciones_profile_id_idx on public.notificaciones(profile_id);
create index if not exists notificaciones_no_leidas_idx
  on public.notificaciones(profile_id, created_at desc)
  where leida = false;

-- ------------------------------------------------------------
-- Actividad
-- ------------------------------------------------------------

create table if not exists public.actividad (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  evento_id uuid references public.eventos(id) on delete cascade,
  entidad text not null,
  entidad_id uuid,
  accion text not null,
  detalles jsonb,
  created_at timestamptz not null default now()
);

create index if not exists actividad_evento_id_idx on public.actividad(evento_id);
create index if not exists actividad_created_at_idx on public.actividad(created_at desc);

-- ------------------------------------------------------------
-- Triggers updated_at
-- ------------------------------------------------------------

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'clientes', 'eventos', 'plantillas',
    'invitaciones', 'invitados', 'confirmaciones'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I
       for each row execute function public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- Helpers de autorización
-- ------------------------------------------------------------

create or replace function private.owns_cliente(target_cliente_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.clientes c
    where c.id = target_cliente_id
      and (
        c.owner_id = (select auth.uid())
        or c.user_id = (select auth.uid())
        or private.is_admin()
      )
  );
$$;

create or replace function private.owns_evento(target_evento_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.eventos e
    where e.id = target_evento_id
      and private.owns_cliente(e.cliente_id)
  );
$$;

create or replace function private.owns_invitacion(target_invitacion_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.invitaciones i
    where i.id = target_invitacion_id
      and private.owns_evento(i.evento_id)
  );
$$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.eventos enable row level security;
alter table public.plantillas enable row level security;
alter table public.invitaciones enable row level security;
alter table public.invitados enable row level security;
alter table public.confirmaciones enable row level security;
alter table public.media enable row level security;
alter table public.notificaciones enable row level security;
alter table public.actividad enable row level security;

-- Profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (id = (select auth.uid()) or private.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()) or private.is_admin())
with check (id = (select auth.uid()) or private.is_admin());

-- Clientes
drop policy if exists clientes_select on public.clientes;
create policy clientes_select on public.clientes
for select to authenticated
using (
  owner_id = (select auth.uid())
  or user_id = (select auth.uid())
  or private.is_admin()
);

drop policy if exists clientes_insert on public.clientes;
create policy clientes_insert on public.clientes
for insert to authenticated
with check (owner_id = (select auth.uid()) or private.is_admin());

drop policy if exists clientes_update on public.clientes;
create policy clientes_update on public.clientes
for update to authenticated
using (owner_id = (select auth.uid()) or private.is_admin())
with check (owner_id = (select auth.uid()) or private.is_admin());

drop policy if exists clientes_delete on public.clientes;
create policy clientes_delete on public.clientes
for delete to authenticated
using (owner_id = (select auth.uid()) or private.is_admin());

-- Eventos
drop policy if exists eventos_select on public.eventos;
create policy eventos_select on public.eventos
for select to authenticated
using (private.owns_cliente(cliente_id));

drop policy if exists eventos_insert on public.eventos;
create policy eventos_insert on public.eventos
for insert to authenticated
with check (private.owns_cliente(cliente_id));

drop policy if exists eventos_update on public.eventos;
create policy eventos_update on public.eventos
for update to authenticated
using (private.owns_cliente(cliente_id))
with check (private.owns_cliente(cliente_id));

drop policy if exists eventos_delete on public.eventos;
create policy eventos_delete on public.eventos
for delete to authenticated
using (private.owns_cliente(cliente_id));

-- Plantillas
drop policy if exists plantillas_select on public.plantillas;
create policy plantillas_select on public.plantillas
for select to authenticated
using (activa = true or owner_id = (select auth.uid()) or private.is_admin());

drop policy if exists plantillas_insert on public.plantillas;
create policy plantillas_insert on public.plantillas
for insert to authenticated
with check (owner_id = (select auth.uid()) or private.is_admin());

drop policy if exists plantillas_update on public.plantillas;
create policy plantillas_update on public.plantillas
for update to authenticated
using (owner_id = (select auth.uid()) or private.is_admin())
with check (owner_id = (select auth.uid()) or private.is_admin());

drop policy if exists plantillas_delete on public.plantillas;
create policy plantillas_delete on public.plantillas
for delete to authenticated
using (owner_id = (select auth.uid()) or private.is_admin());

-- Invitaciones
drop policy if exists invitaciones_select_authenticated on public.invitaciones;
create policy invitaciones_select_authenticated on public.invitaciones
for select to authenticated
using (private.owns_evento(evento_id));

drop policy if exists invitaciones_insert on public.invitaciones;
create policy invitaciones_insert on public.invitaciones
for insert to authenticated
with check (private.owns_evento(evento_id));

drop policy if exists invitaciones_update on public.invitaciones;
create policy invitaciones_update on public.invitaciones
for update to authenticated
using (private.owns_evento(evento_id))
with check (private.owns_evento(evento_id));

drop policy if exists invitaciones_delete on public.invitaciones;
create policy invitaciones_delete on public.invitaciones
for delete to authenticated
using (private.owns_evento(evento_id));

-- Invitados
drop policy if exists invitados_manage on public.invitados;
create policy invitados_manage on public.invitados
for all to authenticated
using (private.owns_invitacion(invitacion_id))
with check (private.owns_invitacion(invitacion_id));

-- Confirmaciones
drop policy if exists confirmaciones_manage on public.confirmaciones;
create policy confirmaciones_manage on public.confirmaciones
for all to authenticated
using (private.owns_invitacion(invitacion_id))
with check (private.owns_invitacion(invitacion_id));

-- Media
drop policy if exists media_select on public.media;
create policy media_select on public.media
for select to authenticated
using (
  owner_id = (select auth.uid())
  or (evento_id is not null and private.owns_evento(evento_id))
  or (invitacion_id is not null and private.owns_invitacion(invitacion_id))
  or private.is_admin()
);

drop policy if exists media_insert on public.media;
create policy media_insert on public.media
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and (
    (evento_id is not null and private.owns_evento(evento_id))
    or (invitacion_id is not null and private.owns_invitacion(invitacion_id))
  )
);

drop policy if exists media_delete on public.media;
create policy media_delete on public.media
for delete to authenticated
using (owner_id = (select auth.uid()) or private.is_admin());

-- Notificaciones
drop policy if exists notificaciones_select on public.notificaciones;
create policy notificaciones_select on public.notificaciones
for select to authenticated
using (profile_id = (select auth.uid()) or private.is_admin());

drop policy if exists notificaciones_update on public.notificaciones;
create policy notificaciones_update on public.notificaciones
for update to authenticated
using (profile_id = (select auth.uid()) or private.is_admin())
with check (profile_id = (select auth.uid()) or private.is_admin());

drop policy if exists notificaciones_delete on public.notificaciones;
create policy notificaciones_delete on public.notificaciones
for delete to authenticated
using (profile_id = (select auth.uid()) or private.is_admin());

-- Actividad
drop policy if exists actividad_select on public.actividad;
create policy actividad_select on public.actividad
for select to authenticated
using (
  actor_id = (select auth.uid())
  or (evento_id is not null and private.owns_evento(evento_id))
  or private.is_admin()
);

-- ------------------------------------------------------------
-- Funciones públicas seguras
-- ------------------------------------------------------------

create or replace function public.obtener_invitacion_publica(
  p_slug text,
  p_codigo text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'invitacion', jsonb_build_object(
      'id', i.id,
      'titulo', i.titulo,
      'slug', i.slug,
      'modalidad', i.modalidad,
      'design_json', i.design_json,
      'color_principal', i.color_principal,
      'musica_url', i.musica_url,
      'whatsapp', i.whatsapp,
      'fecha_expiracion', i.fecha_expiracion
    ),
    'evento', jsonb_build_object(
      'nombre', e.nombre,
      'tipo', e.tipo,
      'fecha', e.fecha,
      'hora', e.hora,
      'zona_horaria', e.zona_horaria,
      'lugar', e.lugar,
      'direccion', e.direccion,
      'maps_url', e.maps_url
    ),
    'invitado', case
      when g.id is null then null
      else jsonb_build_object(
        'id', g.id,
        'nombre', g.nombre,
        'adultos_permitidos', g.adultos_permitidos,
        'ninos_permitidos', g.ninos_permitidos,
        'mesa', g.mesa,
        'codigo', g.codigo,
        'estado', g.estado
      )
    end
  )
  into result
  from public.invitaciones i
  join public.eventos e on e.id = i.evento_id
  left join public.invitados g
    on g.invitacion_id = i.id
   and p_codigo is not null
   and g.codigo = p_codigo
  where i.slug = p_slug
    and i.estado = 'publicada'
    and (i.fecha_expiracion is null or i.fecha_expiracion > now())
    and (
      i.modalidad <> 'pases'
      or (p_codigo is not null and g.id is not null)
    )
  limit 1;

  return result;
end;
$$;

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
  v_owner_id uuid;
  v_cliente_user_id uuid;
  v_tipo_notificacion text;
begin
  if p_adultos < 0 or p_ninos < 0 then
    raise exception 'Las cantidades no pueden ser negativas';
  end if;

  select i.*
  into v_invitacion
  from public.invitaciones i
  where i.slug = p_slug
    and i.estado = 'publicada'
    and i.modalidad in ('rsvp', 'pases')
    and (i.fecha_expiracion is null or i.fecha_expiracion > now())
  limit 1;

  if v_invitacion.id is null then
    raise exception 'La invitación no existe, no acepta RSVP o no está disponible';
  end if;

  select e.*
  into v_evento
  from public.eventos e
  where e.id = v_invitacion.evento_id;

  if v_invitacion.modalidad = 'pases' then
    if p_codigo is null or trim(p_codigo) = '' then
      raise exception 'Se requiere el código del pase';
    end if;

    select g.*
    into v_invitado
    from public.invitados g
    where g.invitacion_id = v_invitacion.id
      and g.codigo = p_codigo
    limit 1;

    if v_invitado.id is null then
      raise exception 'Código de pase inválido';
    end if;

    if p_adultos > v_invitado.adultos_permitidos
       or p_ninos > v_invitado.ninos_permitidos then
      raise exception 'La confirmación supera los lugares asignados';
    end if;

    insert into public.confirmaciones (
      invitacion_id, invitado_id, nombre, asistira,
      adultos, ninos, mensaje, telefono
    )
    values (
      v_invitacion.id, v_invitado.id, v_invitado.nombre, p_asistira,
      case when p_asistira then p_adultos else 0 end,
      case when p_asistira then p_ninos else 0 end,
      p_mensaje, coalesce(p_telefono, v_invitado.telefono)
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

    insert into public.confirmaciones (
      invitacion_id, nombre, asistira, adultos, ninos, mensaje, telefono
    )
    values (
      v_invitacion.id, trim(p_nombre), p_asistira,
      case when p_asistira then p_adultos else 0 end,
      case when p_asistira then p_ninos else 0 end,
      p_mensaje, p_telefono
    )
    returning id into v_confirmacion_id;
  end if;

  select c.owner_id, c.user_id
  into v_owner_id, v_cliente_user_id
  from public.clientes c
  where c.id = v_evento.cliente_id;

  v_tipo_notificacion := case
    when p_asistira then 'rsvp_confirmado'
    else 'rsvp_rechazado'
  end;

  insert into public.notificaciones (
    profile_id, evento_id, tipo, titulo, mensaje, url
  )
  select receptor, v_evento.id, v_tipo_notificacion,
    case when p_asistira then 'Nueva confirmación' else 'No asistirá' end,
    coalesce(v_invitado.nombre, trim(p_nombre), 'Un invitado')
      || case
           when p_asistira
             then ' confirmó ' || (p_adultos + p_ninos)::text || ' lugar(es).'
           else ' indicó que no asistirá.'
         end,
    '/admin/confirmaciones'
  from (
    select v_owner_id as receptor
    union
    select v_cliente_user_id where v_cliente_user_id is not null
  ) r
  where receptor is not null;

  insert into public.actividad (
    actor_id, evento_id, entidad, entidad_id, accion, detalles
  )
  values (
    null,
    v_evento.id,
    'confirmaciones',
    v_confirmacion_id,
    case when p_asistira then 'rsvp_confirmado' else 'rsvp_rechazado' end,
    jsonb_build_object(
      'nombre', coalesce(v_invitado.nombre, trim(p_nombre)),
      'adultos', case when p_asistira then p_adultos else 0 end,
      'ninos', case when p_asistira then p_ninos else 0 end
    )
  );

  return v_confirmacion_id;
end;
$$;

revoke all on function public.obtener_invitacion_publica(text, text) from public;
grant execute on function public.obtener_invitacion_publica(text, text) to anon, authenticated;

revoke all on function public.registrar_confirmacion(
  text, boolean, integer, integer, text, text, text, text
) from public;
grant execute on function public.registrar_confirmacion(
  text, boolean, integer, integer, text, text, text, text
) to anon, authenticated;

-- ------------------------------------------------------------
-- Storage buckets
-- ------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('event-media', 'event-media', true, 10485760),
  ('event-audio', 'event-audio', true, 20971520),
  ('avatars', 'avatars', true, 5242880)
on conflict (id) do nothing;

-- Estructura esperada de ruta:
-- event-media/{user_id}/{event_id}/archivo.ext
-- event-audio/{user_id}/{event_id}/archivo.ext
-- avatars/{user_id}/archivo.ext

drop policy if exists storage_public_read_invitapro on storage.objects;
create policy storage_public_read_invitapro
on storage.objects for select
to public
using (bucket_id in ('event-media', 'event-audio', 'avatars'));

drop policy if exists storage_insert_own_folder_invitapro on storage.objects;
create policy storage_insert_own_folder_invitapro
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('event-media', 'event-audio', 'avatars')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists storage_update_own_folder_invitapro on storage.objects;
create policy storage_update_own_folder_invitapro
on storage.objects for update
to authenticated
using (
  bucket_id in ('event-media', 'event-audio', 'avatars')
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id in ('event-media', 'event-audio', 'avatars')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists storage_delete_own_folder_invitapro on storage.objects;
create policy storage_delete_own_folder_invitapro
on storage.objects for delete
to authenticated
using (
  bucket_id in ('event-media', 'event-audio', 'avatars')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- ------------------------------------------------------------
-- Realtime
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'confirmaciones'
  ) then
    alter publication supabase_realtime add table public.confirmaciones;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notificaciones'
  ) then
    alter publication supabase_realtime add table public.notificaciones;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'actividad'
  ) then
    alter publication supabase_realtime add table public.actividad;
  end if;
end $$;

commit;

-- ============================================================
-- Después de ejecutar:
-- 1. Crear tu usuario en Authentication > Users.
-- 2. Convertirlo en administrador con:
--
-- update public.profiles
-- set rol = 'admin', nombre = 'Edilberto May'
-- where id = (
--   select id from auth.users where email = 'TU_CORREO'
-- );
-- ============================================================
