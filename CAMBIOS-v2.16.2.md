# InvitaPro v2.16.2 — Studio 3.0 Fase 2

## Drag & Drop real de bloques

- Se agregó un indicador visual antes/después para mostrar con precisión dónde se insertará cada bloque.
- El orden se sincroniza inmediatamente con la vista previa y el autosave existente.
- El reordenamiento continúa integrado con Deshacer/Rehacer.
- Se mejoró el estado visual del bloque arrastrado y del destino.
- Se añadió navegación accesible por teclado: `Alt + ↑` y `Alt + ↓`.
- Se añadió anuncio accesible de cada cambio de orden.
- En dispositivos táctiles se mantienen botones de orden más grandes y cómodos.
- La portada continúa bloqueada en la primera posición.

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/client-portal.css`
- `package.json`

## Migraciones

No requiere migraciones de Supabase.

## Validación recomendada

1. Ejecutar `pnpm run build`.
2. Abrir Studio → Estructura.
3. Arrastrar un bloque por encima y por debajo de otros bloques.
4. Confirmar que la línea de inserción coincide con el nuevo orden.
5. Probar Deshacer/Rehacer.
6. Probar `Alt + ↑` y `Alt + ↓` con un bloque enfocado.
7. Verificar el orden en la vista previa y después de recargar.
