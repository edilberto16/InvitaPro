# InvitaPro v2.15.2 — Modalidades unificadas

## Archivos modificados

- `lib/invitation-modality.ts`
- `app/admin/invitaciones/page.tsx`
- `app/mi-cuenta/page.tsx`
- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/invitacion/[slug]/page.tsx`
- `app/invitacion/[slug]/[codigo]/page.tsx`
- `app/client-portal.css`
- `package.json`

## Funciones agregadas

- Fuente única para normalizar las modalidades `simple`, `rsvp` y `pases`.
- Compatibilidad con valores históricos `autoservicio` y `codigo`.
- Capacidades por modalidad: enlace público, RSVP, CSV, pases individuales y check-in.
- El portal del cliente adapta navegación, estadísticas y herramientas según la modalidad.
- El Studio oculta RSVP cuando la invitación es de Solo enlace.
- Los pases personalizados solo abren en invitaciones configuradas con esa modalidad.
- El panel administrativo valida modalidad contra el plan comercial.

## Correcciones

- Ya no se muestran CSV, pases individuales ni check-in en modalidades que no los incluyen.
- La modalidad mostrada al cliente usa el mismo nombre que Administración.
- Se evita cambiar de modalidad silenciosamente cuando existen invitados, confirmaciones o check-ins.
- Se guarda una referencia normalizada de la modalidad dentro de `design_json`.

## Migraciones

No requiere migración de Supabase.

## Pruebas recomendadas

1. Configurar una invitación como `Solo enlace` y verificar que no aparezcan RSVP, CSV ni check-in.
2. Configurarla como `RSVP público` y verificar formulario público y enlace general.
3. Configurarla como `Pases personalizados` y verificar CSV, códigos individuales y check-in.
4. Intentar usar Pases personalizados con plan Clásico y confirmar el bloqueo.
5. Cambiar modalidad en una invitación con invitados o confirmaciones y comprobar la advertencia.
6. Abrir un enlace individual en una invitación que no sea de Pases y comprobar el mensaje de bloqueo.

## Git

```bash
git status
git add .
git commit -m "InvitaPro v2.15.2 modalidades unificadas"
git push origin main
```
