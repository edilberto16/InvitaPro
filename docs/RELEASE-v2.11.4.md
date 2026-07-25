# InvitaPro v2.11.4 — Biblioteca del Cliente + Carga Directa

## Problema resuelto
El cliente podía abrir el selector de fotografías, pero no tenía una ruta visible para subir imágenes cuando su Biblioteca estaba vacía.

## Mejoras
- Carga directa dentro de `Elegir fotografías`.
- Drag & drop de imágenes en el selector.
- Las imágenes subidas desde Studio se guardan automáticamente en `media` y en el bucket `event-media`.
- Las imágenes recién subidas quedan seleccionadas automáticamente para la galería.
- Carga directa de música desde el mismo selector.
- Nueva ruta `/mi-cuenta/biblioteca`.
- Nuevo enlace `Biblioteca` en Mi InvitaPro y en la barra superior del Studio.
- Biblioteca del cliente con subida, filtros, búsqueda, vista previa y eliminación.
- Galería del Studio ahora muestra acciones claras: `+ Agregar fotografías` y `Abrir Biblioteca`.
- Corrección visual del contador de Estructura: usa el total real de bloques, no `/8`.

## Seguridad
La nueva Biblioteca utiliza las políticas RLS y rutas de Storage existentes:
`{user_id}/{event_id}/archivo.ext`.

No mezcla fotografías del Álbum colaborativo (`guest-album`) con la Biblioteca privada del cliente.

## Migración SQL
No requiere migración nueva.

## Prueba
1. Mi InvitaPro → Continuar editando.
2. Galería → `+ Agregar fotografías`.
3. Subir 2 o más imágenes desde el equipo.
4. Confirmar que aparecen seleccionadas.
5. Pulsar `Usar fotografías`.
6. Guardar cambios y abrir Vista previa.
7. Abrir `/mi-cuenta/biblioteca` y confirmar que las mismas fotos aparecen ahí.
