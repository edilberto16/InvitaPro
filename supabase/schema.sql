-- InvitaPro v0.9.0
-- Ejecuta este archivo completo en Supabase > SQL Editor.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  rol text not null default 'administrador' check (rol in ('super_admin','administrador','cliente')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text not null default '',
  correo text not null default '',
  notas text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  nombre text not null,
  tipo text not null,
  fecha date,
  hora time,
  lugar text not null default '',
  direccion text not null default '',
  estado text not null default 'borrador' check (estado in ('borrador','confirmado','finalizado')),
  notas text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references auth.users(id) on delete cascade,
  evento_id uuid not null references public.eventos(id) on delete cascade,
  titulo text not null,
  slug text not null unique,
  modalidad text not null default 'simple' check (modalidad in ('simple','rsvp','pases')),
  plantilla text not null default 'elegante',
  estado text not null default 'borrador' check (estado in ('borrador','publicada','pausada')),
  mensaje text not null default '',
  mapa_url text not null default '',
  whatsapp text not null default '',
  vestimenta text not null default '',
  color_principal text not null default '#a46a3f',
  portada_url text,
  musica_url text,
  contenido jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.invitados (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references auth.users(id) on delete cascade,
  invitacion_id uuid not null references public.invitaciones(id) on delete cascade,
  nombre text not null,
  telefono text not null default '',
  correo text not null default '',
  adultos integer not null default 1 check (adultos >= 0),
  ninos integer not null default 0 check (ninos >= 0),
  mesa text not null default '',
  codigo text not null unique,
  estado text not null default 'pendiente' check (estado in ('pendiente','confirmado','declinado')),
  notas text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.confirmaciones (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references auth.users(id) on delete cascade,
  invitado_id uuid not null references public.invitados(id) on delete cascade,
  invitacion_id uuid not null references public.invitaciones(id) on delete cascade,
  asistencia text not null check (asistencia in ('confirmado','declinado')),
  adultos_confirmados integer not null default 0 check (adultos_confirmados >= 0),
  ninos_confirmados integer not null default 0 check (ninos_confirmados >= 0),
  mensaje text not null default '',
  respondido_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (invitado_id)
);

create index if not exists clientes_propietario_idx on public.clientes(propietario_id);
create index if not exists eventos_propietario_idx on public.eventos(propietario_id);
create index if not exists eventos_cliente_idx on public.eventos(cliente_id);
create index if not exists invitaciones_propietario_idx on public.invitaciones(propietario_id);
create index if not exists invitaciones_evento_idx on public.invitaciones(evento_id);
create index if not exists invitados_propietario_idx on public.invitados(propietario_id);
create index if not exists invitados_invitacion_idx on public.invitados(invitacion_id);
create index if not exists confirmaciones_propietario_idx on public.confirmaciones(propietario_id);
create index if not exists confirmaciones_invitacion_idx on public.confirmaciones(invitacion_id);

-- Triggers de actualización.
drop trigger if exists perfiles_updated_at on public.perfiles;
create trigger perfiles_updated_at before update on public.perfiles for each row execute function public.set_updated_at();
drop trigger if exists clientes_updated_at on public.clientes;
create trigger clientes_updated_at before update on public.clientes for each row execute function public.set_updated_at();
drop trigger if exists eventos_updated_at on public.eventos;
create trigger eventos_updated_at before update on public.eventos for each row execute function public.set_updated_at();
drop trigger if exists invitaciones_updated_at on public.invitaciones;
create trigger invitaciones_updated_at before update on public.invitaciones for each row execute function public.set_updated_at();
drop trigger if exists invitados_updated_at on public.invitados;
create trigger invitados_updated_at before update on public.invitados for each row execute function public.set_updated_at();
drop trigger if exists confirmaciones_updated_at on public.confirmaciones;
create trigger confirmaciones_updated_at before update on public.confirmaciones for each row execute function public.set_updated_at();

-- Crea automáticamente el perfil cuando se registra un usuario.
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', ''), 'administrador')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.crear_perfil_usuario();

-- RLS
alter table public.perfiles enable row level security;
alter table public.clientes enable row level security;
alter table public.eventos enable row level security;
alter table public.invitaciones enable row level security;
alter table public.invitados enable row level security;
alter table public.confirmaciones enable row level security;

create policy "usuario administra su perfil" on public.perfiles
for all using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "propietario administra clientes" on public.clientes
for all using ((select auth.uid()) = propietario_id) with check ((select auth.uid()) = propietario_id);

create policy "propietario administra eventos" on public.eventos
for all using ((select auth.uid()) = propietario_id) with check ((select auth.uid()) = propietario_id);

create policy "propietario administra invitaciones" on public.invitaciones
for all using ((select auth.uid()) = propietario_id) with check ((select auth.uid()) = propietario_id);

create policy "publico ve invitaciones publicadas" on public.invitaciones
for select using (estado = 'publicada');

create policy "propietario administra invitados" on public.invitados
for all using ((select auth.uid()) = propietario_id) with check ((select auth.uid()) = propietario_id);

create policy "publico consulta pase por codigo" on public.invitados
for select using (
  exists (
    select 1 from public.invitaciones i
    where i.id = invitacion_id and i.estado = 'publicada'
  )
);

create policy "propietario administra confirmaciones" on public.confirmaciones
for all using ((select auth.uid()) = propietario_id) with check ((select auth.uid()) = propietario_id);

-- RSVP público seguro: el invitado responde con slug + código, sin acceso directo a tablas privadas.
create or replace function public.registrar_confirmacion(
  p_slug text,
  p_codigo text,
  p_asistencia text,
  p_adultos integer default 0,
  p_ninos integer default 0,
  p_mensaje text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitado public.invitados%rowtype;
  v_invitacion public.invitaciones%rowtype;
  v_id uuid;
begin
  if p_asistencia not in ('confirmado','declinado') then
    raise exception 'Respuesta de asistencia inválida';
  end if;

  select i.* into v_invitacion
  from public.invitaciones i
  where i.slug = p_slug and i.estado = 'publicada';

  if not found then raise exception 'Invitación no disponible'; end if;

  select g.* into v_invitado
  from public.invitados g
  where g.invitacion_id = v_invitacion.id and upper(g.codigo) = upper(p_codigo);

  if not found then raise exception 'Código de invitado inválido'; end if;
  if p_adultos < 0 or p_adultos > v_invitado.adultos then raise exception 'Cantidad de adultos inválida'; end if;
  if p_ninos < 0 or p_ninos > v_invitado.ninos then raise exception 'Cantidad de niños inválida'; end if;

  insert into public.confirmaciones (
    propietario_id, invitado_id, invitacion_id, asistencia,
    adultos_confirmados, ninos_confirmados, mensaje, respondido_en
  ) values (
    v_invitado.propietario_id, v_invitado.id, v_invitacion.id, p_asistencia,
    case when p_asistencia = 'confirmado' then p_adultos else 0 end,
    case when p_asistencia = 'confirmado' then p_ninos else 0 end,
    coalesce(p_mensaje, ''), now()
  )
  on conflict (invitado_id) do update set
    asistencia = excluded.asistencia,
    adultos_confirmados = excluded.adultos_confirmados,
    ninos_confirmados = excluded.ninos_confirmados,
    mensaje = excluded.mensaje,
    respondido_en = now(),
    actualizado_en = now()
  returning id into v_id;

  update public.invitados
  set estado = case when p_asistencia = 'confirmado' then 'confirmado' else 'declinado' end
  where id = v_invitado.id;

  return v_id;
end;
$$;

grant execute on function public.registrar_confirmacion(text,text,text,integer,integer,text) to anon, authenticated;

-- Agrega tablas a Realtime para el dashboard y la campana.
do $$
begin
  alter publication supabase_realtime add table public.confirmaciones;
exception when duplicate_object then null;
end $$;
