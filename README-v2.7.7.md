# InvitaPro v2.7.7 — Botón Revisar y activar a ancho completo

PATCH incremental.

## Corrección
El botón `Revisar y activar` ahora:
- ocupa el ancho completo de las dos columnas de acciones secundarias;
- muestra el texto completo en una sola línea;
- mantiene el icono ✓ junto al texto;
- deja `Archivar` y `Eliminar` debajo, cada uno en su mitad;
- no afecta Estado ni Enlace;
- no cambia ninguna lógica.

## Archivo modificado
- `app/admin/activation-v2.7.1.css`

No requiere SQL.

Después:
`pnpm run build`
`pnpm dev`
