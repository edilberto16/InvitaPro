# InvitaPro v2.7.3 — Alineación de “Antes de activar”

PATCH incremental.

## Corrección
Se corrige el bloque `Antes de activar` del modal `Revisar y publicar`:

- Checkbox alineado junto al texto.
- Cada validación ocupa una fila ordenada.
- El texto ya no queda separado hacia la derecha.
- Mejor lectura en escritorio y móvil.
- No cambia ninguna lógica de activación ni Supabase.

## Archivo modificado
- `app/admin/activation-v2.7.1.css`

## Instalación
Copia el PATCH sobre la raíz de InvitaPro y reemplaza el archivo existente.

Luego:
`pnpm run build`
`pnpm dev`
