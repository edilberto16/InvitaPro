-- InvitaPro v2.14.0 — Álbum Inteligente
begin;

alter table public.album_colaborativo_fotos
  add column if not exists autor_nombre text,
  add column if not exists estado text not null default 'pendiente',
  add column if not exists portada boolean not null default false,
  add column if not exists moderado_at timestamptz,
  add column if not exists moderado_por uuid references auth.users(id) on delete set null;

update public.album_colaborativo_fotos
set estado = case when aprobado then 'aprobada' else 'pendiente' end
where estado is null or estado not in ('pendiente','aprobada','rechazada');

alter table public.album_colaborativo_fotos
  drop constraint if exists album_colaborativo_fotos_estado_check;
alter table public.album_colaborativo_fotos
  add constraint album_colaborativo_fotos_estado_check
  check (estado in ('pendiente','aprobada','rechazada'));

create index if not exists album_colaborativo_estado_idx
  on public.album_colaborativo_fotos(invitacion_id, estado, created_at desc);

create unique index if not exists album_colaborativo_una_portada_idx
  on public.album_colaborativo_fotos(invitacion_id)
  where portada = true;

create or replace function public.moderar_foto_album(
  p_foto_id uuid,
  p_estado text,
  p_portada boolean default false
)
returns public.album_colaborativo_fotos
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_row public.album_colaborativo_fotos;
begin
  if p_estado not in ('pendiente','aprobada','rechazada') then
    raise exception 'Estado de moderación inválido';
  end if;

  select * into v_row
  from public.album_colaborativo_fotos
  where id = p_foto_id;

  if v_row.id is null or not private.owns_invitacion(v_row.invitacion_id) then
    raise exception 'No tienes permisos para moderar esta fotografía';
  end if;

  if p_portada then
    update public.album_colaborativo_fotos
    set portada = false
    where invitacion_id = v_row.invitacion_id;
  end if;

  update public.album_colaborativo_fotos
  set estado = p_estado,
      aprobado = (p_estado = 'aprobada'),
      portada = case when p_estado = 'aprobada' then p_portada else false end,
      moderado_at = now(),
      moderado_por = auth.uid()
  where id = p_foto_id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.moderar_foto_album(uuid,text,boolean) to authenticated;

-- La inserción pública solo se permite si la invitación está publicada y el bloque está activo.
drop policy if exists album_colaborativo_public_insert on public.album_colaborativo_fotos;
create policy album_colaborativo_public_insert
on public.album_colaborativo_fotos
for insert
to anon, authenticated
with check (
  estado = 'pendiente'
  and aprobado = false
  and portada = false
  and exists (
    select 1 from public.invitaciones i
    where i.id = invitacion_id
      and i.estado = 'publicada'
      and coalesce((i.design_json->>'mostrar_album')::boolean, false) = true
  )
  and split_part(storage_path, '/', 1) = invitacion_id::text
);

commit;
