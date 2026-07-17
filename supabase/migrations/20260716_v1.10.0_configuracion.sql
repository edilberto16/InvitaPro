-- InvitaPro v1.10.0 - Configuración comercial
begin;

create table if not exists public.configuracion (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  nombre_comercial text not null default 'InvitaPro',
  correo text,
  telefono text,
  zona_horaria text not null default 'America/Mexico_City',
  formato_fecha text not null default 'dd/MM/yyyy',
  nombre_panel text not null default 'InvitaPro',
  logo_url text,
  favicon_url text,
  color_principal text not null default '#6d5dfc',
  color_secundario text not null default '#111827',
  whatsapp text,
  mensaje_whatsapp text not null default 'Hola {invitado}, te compartimos la invitación de {evento}: {enlace}',
  mensaje_recordatorio text not null default 'Hola {invitado}, te recordamos que el evento {evento} está próximo. Consulta tu invitación aquí: {enlace}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists configuracion_set_updated_at on public.configuracion;
create trigger configuracion_set_updated_at before update on public.configuracion
for each row execute function public.set_updated_at();

alter table public.configuracion enable row level security;

drop policy if exists configuracion_select_own on public.configuracion;
create policy configuracion_select_own on public.configuracion for select to authenticated
using (owner_id = (select auth.uid()) or private.is_admin());

drop policy if exists configuracion_insert_own on public.configuracion;
create policy configuracion_insert_own on public.configuracion for insert to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists configuracion_update_own on public.configuracion;
create policy configuracion_update_own on public.configuracion for update to authenticated
using (owner_id = (select auth.uid()) or private.is_admin())
with check (owner_id = (select auth.uid()) or private.is_admin());

commit;
