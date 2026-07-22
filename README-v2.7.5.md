# InvitaPro v2.7.5 — Alineación del checklist de activación

PATCH incremental.

## Qué cambia
El bloque `Antes de activar` deja de usar checkboxes HTML heredando estilos globales.
Ahora usa filas propias de InvitaPro con un indicador visual ✓ perfectamente alineado.

Resultado:
- Ícono y texto quedan juntos.
- Todas las filas arrancan en la misma posición.
- El texto largo se adapta sin separarse hacia la derecha.
- No cambia ninguna lógica de activación/publicación.
- No requiere SQL.

## Archivos modificados
- `app/admin/invitaciones/page.tsx`
- `app/admin/activation-v2.7.1.css`

## Después de copiar
`pnpm run build`
`pnpm dev`
