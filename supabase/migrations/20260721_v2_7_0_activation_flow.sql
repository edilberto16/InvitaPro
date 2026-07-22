-- InvitaPro v2.7.0 - Flujo comercial de activación
-- Ejecutar en Supabase SQL Editor antes de probar la solicitud de publicación.

do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.invitaciones'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%estado%'
  loop
    execute format('alter table public.invitaciones drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.invitaciones
  add constraint invitaciones_estado_check
  check (estado in ('borrador','pendiente_activacion','publicada','pausada','vencida','archivada'));

-- El plan, fecha de solicitud y origen se guardan en design_json para mantener compatibilidad.
-- La publicación pública continúa protegida por obtener_invitacion_publica, que solo entrega estado publicada.
