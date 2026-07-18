# InvitaPro v2.4.8 — Solicitudes: estados + eliminar

Incluye:
- Botón **Eliminar** en cada solicitud.
- Confirmación antes de borrar.
- Eliminar una solicitud NO elimina al cliente/prospecto.
- Estados más claros:
  - Nueva
  - En seguimiento
  - Cerrada
- Botón WhatsApp mueve la solicitud a En seguimiento.
- Botón Cerrar mantiene la solicitud en historial.
- Contadores actualizados incluyendo Cerradas.

No requiere SQL nuevo: la política RLS de v2.4.6 ya permite DELETE a administradores.

Aplicar el patch sobre el proyecto y reiniciar `pnpm dev`.
