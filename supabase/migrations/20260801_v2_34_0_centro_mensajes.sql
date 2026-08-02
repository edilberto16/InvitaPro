-- InvitaPro v2.34.0 — Centro de Mensajes
begin;

alter table public.mensajes_deseos
  add column if not exists destacado boolean not null default false;

create index if not exists mensajes_deseos_destacados_idx
  on public.mensajes_deseos(invitacion_id, destacado, created_at desc);

commit;
