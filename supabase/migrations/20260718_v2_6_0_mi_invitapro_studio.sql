-- InvitaPro v2.6.0 — Mi InvitaPro Studio
-- Ejecutar una sola vez. Idempotente y compatible con datos existentes.
begin;

alter table public.invitaciones add column if not exists template_key text;
alter table public.invitaciones add column if not exists contenido jsonb not null default '{}'::jsonb;

alter table public.invitaciones drop constraint if exists invitaciones_modalidad_check;
alter table public.invitaciones add constraint invitaciones_modalidad_check
check (modalidad in ('simple','rsvp','pases','autoservicio'));

-- Los clientes vinculados ya pueden leer/actualizar invitaciones de sus propios eventos
-- mediante private.owns_evento(), política existente en el esquema actual.

commit;
