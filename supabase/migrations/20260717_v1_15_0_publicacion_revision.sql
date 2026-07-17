-- InvitaPro v1.15.0 - Estados y enlaces privados de revisión
alter table public.invitaciones
  add column if not exists review_token text,
  add column if not exists review_enabled boolean not null default false;

create unique index if not exists invitaciones_review_token_uidx
  on public.invitaciones(review_token)
  where review_token is not null;

-- Amplía el estado para permitir archivar. El bloque ignora instalaciones sin constraint nombrado.
do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.invitaciones'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%estado%'
  loop
    execute format('alter table public.invitaciones drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.invitaciones
  add constraint invitaciones_estado_check
  check (estado in ('borrador','publicada','pausada','vencida','archivada'));

create or replace function public.obtener_invitacion_revision(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  resultado jsonb;
begin
  select jsonb_build_object(
    'invitacion', jsonb_build_object(
      'id', i.id,
      'titulo', i.titulo,
      'slug', i.slug,
      'modalidad', i.modalidad,
      'design_json', coalesce(i.design_json, '{}'::jsonb),
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
    'invitado', null
  )
  into resultado
  from public.invitaciones i
  join public.eventos e on e.id = i.evento_id
  where i.review_token = p_token
    and i.review_enabled = true
  limit 1;

  return resultado;
end;
$$;

grant execute on function public.obtener_invitacion_revision(text) to anon, authenticated;
