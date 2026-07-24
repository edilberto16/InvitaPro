-- InvitaPro v2.11.3 — Biblioteca de Bloques PRO
-- Buzón de deseos + Álbum colaborativo privado
begin;

create table if not exists public.mensajes_deseos (
  id uuid primary key default gen_random_uuid(),
  invitacion_id uuid not null references public.invitaciones(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 1 and 100),
  mensaje text not null check (char_length(trim(mensaje)) between 1 and 1200),
  aprobado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists mensajes_deseos_invitacion_idx
  on public.mensajes_deseos(invitacion_id, created_at desc);

alter table public.mensajes_deseos enable row level security;

drop policy if exists mensajes_deseos_public_insert on public.mensajes_deseos;
create policy mensajes_deseos_public_insert
on public.mensajes_deseos
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.invitaciones i
    where i.id = invitacion_id
      and i.estado = 'publicada'
      and coalesce((i.design_json->>'mostrar_deseos')::boolean, false) = true
  )
);

drop policy if exists mensajes_deseos_owner_select on public.mensajes_deseos;
create policy mensajes_deseos_owner_select
on public.mensajes_deseos
for select
to authenticated
using (private.owns_invitacion(invitacion_id));

drop policy if exists mensajes_deseos_owner_update on public.mensajes_deseos;
create policy mensajes_deseos_owner_update
on public.mensajes_deseos
for update
to authenticated
using (private.owns_invitacion(invitacion_id))
with check (private.owns_invitacion(invitacion_id));

drop policy if exists mensajes_deseos_owner_delete on public.mensajes_deseos;
create policy mensajes_deseos_owner_delete
on public.mensajes_deseos
for delete
to authenticated
using (private.owns_invitacion(invitacion_id));

create table if not exists public.album_colaborativo_fotos (
  id uuid primary key default gen_random_uuid(),
  invitacion_id uuid not null references public.invitaciones(id) on delete cascade,
  storage_path text not null unique,
  nombre_archivo text,
  mime_type text,
  tamano_bytes bigint,
  aprobado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists album_colaborativo_invitacion_idx
  on public.album_colaborativo_fotos(invitacion_id, created_at desc);

alter table public.album_colaborativo_fotos enable row level security;

drop policy if exists album_colaborativo_public_insert on public.album_colaborativo_fotos;
create policy album_colaborativo_public_insert
on public.album_colaborativo_fotos
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.invitaciones i
    where i.id = invitacion_id
      and i.estado = 'publicada'
      and coalesce((i.design_json->>'mostrar_album')::boolean, false) = true
  )
  and split_part(storage_path, '/', 1) = invitacion_id::text
);

drop policy if exists album_colaborativo_owner_select on public.album_colaborativo_fotos;
create policy album_colaborativo_owner_select
on public.album_colaborativo_fotos
for select
to authenticated
using (private.owns_invitacion(invitacion_id));

drop policy if exists album_colaborativo_owner_update on public.album_colaborativo_fotos;
create policy album_colaborativo_owner_update
on public.album_colaborativo_fotos
for update
to authenticated
using (private.owns_invitacion(invitacion_id))
with check (private.owns_invitacion(invitacion_id));

drop policy if exists album_colaborativo_owner_delete on public.album_colaborativo_fotos;
create policy album_colaborativo_owner_delete
on public.album_colaborativo_fotos
for delete
to authenticated
using (private.owns_invitacion(invitacion_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guest-album',
  'guest-album',
  false,
  15728640,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists guest_album_public_upload on storage.objects;
create policy guest_album_public_upload
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'guest-album'
  and exists (
    select 1
    from public.invitaciones i
    where i.id::text = (storage.foldername(name))[1]
      and i.estado = 'publicada'
      and coalesce((i.design_json->>'mostrar_album')::boolean, false) = true
  )
);

drop policy if exists guest_album_owner_read on storage.objects;
create policy guest_album_owner_read
on storage.objects
for select
to authenticated
using (
  bucket_id = 'guest-album'
  and exists (
    select 1
    from public.invitaciones i
    where i.id::text = (storage.foldername(name))[1]
      and private.owns_invitacion(i.id)
  )
);

drop policy if exists guest_album_owner_delete on storage.objects;
create policy guest_album_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'guest-album'
  and exists (
    select 1
    from public.invitaciones i
    where i.id::text = (storage.foldername(name))[1]
      and private.owns_invitacion(i.id)
  )
);

commit;
