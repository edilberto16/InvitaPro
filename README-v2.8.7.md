# InvitaPro v2.8.7 — Acciones 2x2

Corrige los textos cortados de `Compartir` y `Revisión`.

## Cambio principal
Las cuatro acciones superiores ahora se muestran en una cuadrícula 2x2:

Vista previa | Compartir
Editar       | Revisión

Esto les da suficiente ancho y evita partir palabras de forma fea.

Además:
- `Revisar y activar` sigue a ancho completo.
- `Archivar` y `Eliminar` quedan en dos columnas.
- En publicadas: `Pausar` y `Archivar` en dos columnas, `Eliminar` a ancho completo.

Solo modifica:
`app/admin/activation-v2.7.1.css`

No requiere SQL.
