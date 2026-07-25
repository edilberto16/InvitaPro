# InvitaPro v2.12.1

## Planes y modalidades unificados

- La landing obtiene precios, descripciones, límites y beneficios desde `planes_comerciales`.
- Solo se muestran planes activos.
- Si Supabase no responde, se usan los planes predeterminados como respaldo.
- Nueva invitación separa Plan comercial de Modalidad de invitación.
- RSVP y Pases personalizados se bloquean según las funciones habilitadas del plan.
- La invitación guarda una instantánea del plan comercial en `design_json`.
- Incluye migración RLS para lectura pública de planes activos.
