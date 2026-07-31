# InvitaPro v2.19.0 — Studio 4.0: Biblioteca visual

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/client-portal.css`
- `package.json`

## Funciones agregadas

- Buscador instantáneo dentro de la Biblioteca de bloques.
- Búsqueda por nombre, descripción y categoría.
- Contadores dinámicos por categoría.
- Resumen de resultados encontrados.
- Estado vacío con opción para restablecer filtros.
- Tarjetas de bloques con interacción y jerarquía visual mejoradas.
- La biblioteca conserva la selección automática del bloque después de agregarlo.
- Identificador interno de Studio actualizado a `2.19.0`.

## Mejoras de experiencia

- Biblioteca más limpia y fácil de explorar.
- Categorías desplazables en pantallas pequeñas.
- Mejor respuesta visual al pasar el cursor sobre una tarjeta.
- Mensajes diferentes cuando no hay bloques disponibles y cuando una búsqueda no produce resultados.

## Validación recomendada

1. Ejecutar `pnpm run build`.
2. Abrir Studio y entrar en **Estructura**.
3. Abrir **Biblioteca de bloques**.
4. Buscar términos como `mapa`, `galería`, `RSVP` o `video`.
5. Cambiar categorías y verificar sus contadores.
6. Agregar un bloque y confirmar que queda seleccionado y aparece en la vista previa.
7. Guardar y recargar Studio para confirmar persistencia.

## Git

```bash
git status
git add .
git commit -m "v2.19.0 - Studio 4.0 biblioteca visual"
git push origin main
```
