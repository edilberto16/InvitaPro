# InvitaPro v2.11.4-fix1

Corrige el error de TypeScript en la Biblioteca del cliente.

## Error

Supabase devolvía la relación `eventos(nombre)` como arreglo, mientras el tipo local esperaba un objeto.

## Corrección

La relación `eventos` fue eliminada de la consulta porque la página no la utiliza. La consulta ahora recupera únicamente los campos requeridos de `media`.

No requiere migración SQL.
