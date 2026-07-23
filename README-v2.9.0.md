# InvitaPro v2.9.0 — Planes y precios administrables

## Funciones nuevas
- Nuevo módulo `Admin → Planes`.
- Editar precio de Clásico, Premium y Signature sin tocar código.
- Activar/desactivar planes.
- Editar descripción.
- Configurar límites de invitados y galería.
- Definir funciones incluidas: RSVP, música, plantillas Premium, Signature.
- `Admin → Ventas` ahora muestra:
  - ingresos cobrados;
  - ticket promedio;
  - valor de solicitudes pendientes de activación;
  - diferencia contra precios de lista/cortesías;
  - pipeline de activaciones pendientes.

## Importante
No requiere SQL nuevo si ya ejecutaste la migración de v2.8.0:
`20260721_v2_8_0_planes_ventas.sql`

Los precios modificados aplican a solicitudes nuevas.
Las ventas ya registradas conservan el precio histórico.

## Archivos
- `app/admin/planes/page.tsx` NUEVO
- `app/admin/ventas/page.tsx`
- `components/admin-shell.tsx`
- `app/admin/activation-v2.7.1.css`
