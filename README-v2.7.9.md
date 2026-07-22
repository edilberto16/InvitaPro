# InvitaPro v2.7.9 — Estado y enlace bloqueado

PATCH incremental.

## Correcciones
- Separa visualmente las columnas `Estado` y `Enlace`.
- `Pendiente de activación` ya no invade la columna siguiente.
- `🔒 Se habilita al activar` queda centrado dentro de su propia píldora.
- Ajusta proporciones de columnas para evitar traslapes.
- Mantiene acciones y lógica sin cambios.

## Archivo modificado
- `app/admin/activation-v2.7.1.css`

No requiere SQL.

Después:
`pnpm run build`
`pnpm dev`
