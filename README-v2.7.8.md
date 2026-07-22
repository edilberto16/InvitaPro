# InvitaPro v2.7.8 — Estados de invitación legibles

PATCH incremental.

## Correcciones
- `Pendiente de activación` ahora se muestra en una sola línea.
- Badge horizontal tipo píldora con icono ⏳.
- Se normalizan los estilos de:
  - Borrador
  - Pendiente de activación
  - Publicada
  - Pausada
  - Finalizada / Vencida
  - Archivada
- No cambia ninguna lógica.

## Archivo modificado
- `app/admin/activation-v2.7.1.css`

No requiere SQL.

Después:
`pnpm run build`
`pnpm dev`
