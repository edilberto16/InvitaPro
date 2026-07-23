# InvitaPro v2.8.3 — Estado y acciones

PATCH incremental.

## Corrige
- `Pendiente de activación` queda dentro de una sola píldora.
- El icono ⏳ ya no se sale del badge.
- Acciones ordenadas en una cuadrícula consistente.
- `Revisar y activar` ocupa una fila completa.
- En pendientes: `Archivar` y `Eliminar` quedan alineados debajo.
- En publicadas: `Pausar` y `Archivar` comparten fila; `Eliminar` ocupa el ancho completo.

## Archivo modificado
- `app/admin/activation-v2.7.1.css`

No requiere SQL.

Después:
`pnpm run build`
`pnpm dev`
