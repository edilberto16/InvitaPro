# InvitaPro v2.7.0 — Publicación y activación comercial

## Incluido
- Botón Publicar invitación en InvitaPro Studio.
- Validación previa de nombre, fecha y plantilla.
- Pantalla de activación con planes Clásico, Premium y Signature.
- Nuevo estado pendiente_activacion.
- Solicitud de activación desde autoservicio.
- Estado visible en Mi InvitaPro.
- Filtro Por activar en Admin > Invitaciones.
- Acción Activar y publicar desde administración.
- El enlace definitivo solo aparece al quedar publicada.

## Paso obligatorio en Supabase
Ejecutar antes de probar la activación:
supabase/migrations/20260721_v2_7_0_activation_flow.sql

## Prueba
1. Mi InvitaPro > Continuar editando.
2. Guardar cambios > Publicar invitación.
3. Elegir plan > Solicitar activación.
4. Admin > Invitaciones > Por activar.
5. Activar y publicar.
6. Volver a Mi InvitaPro y comprobar el enlace público.

## Build
Ejecutar en tu PC: pnpm install y pnpm run build.
