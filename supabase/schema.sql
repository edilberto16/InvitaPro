create extension if not exists "pgcrypto";

create table public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id) on delete cascade,
  titulo text not null,
  slug text unique not null,
  tipo_evento text not null,
  fecha_evento date not null,
  hora_evento time,
  lugar text,
  mapa_url text,
  whatsapp text,
  mensaje text,
  portada_url text,
  musica_url text,
  plantilla text not null default 'elegante',
  estado text not null default 'borrador' check (estado in ('borrador','publicada','archivada')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.confirmaciones (
  id uuid primary key default gen_random_uuid(),
  invitacion_id uuid not null references public.invitaciones(id) on delete cascade,
  nombre text not null,
  telefono text,
  adultos integer not null default 1,
  ninos integer not null default 0,
  asistira boolean not null,
  mensaje text,
  creado_en timestamptz not null default now()
);

alter table public.invitaciones enable row level security;
alter table public.confirmaciones enable row level security;

create policy "Propietario administra invitaciones"
on public.invitaciones for all
using (auth.uid() = usuario_id)
with check (auth.uid() = usuario_id);

create policy "Invitaciones publicadas son visibles"
on public.invitaciones for select
using (estado = 'publicada');

create policy "Cualquiera confirma asistencia"
on public.confirmaciones for insert
with check (true);

create policy "Propietario ve confirmaciones"
on public.confirmaciones for select
using (
  exists (
    select 1 from public.invitaciones i
    where i.id = invitacion_id and i.usuario_id = auth.uid()
  )
);
