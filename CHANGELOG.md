# CHANGELOG

## [2.26.0] — 2026-08-01

### Añadido
- Edición inline mediante doble clic sobre textos compatibles dentro de la vista previa del Studio.
- Confirmación con `Enter`, cancelación con `Esc` y soporte de `Shift + Enter` en textos multilínea.
- Sincronización inmediata con el State Engine, History Engine y autoguardado.
- Indicadores visuales de texto editable y estado activo de edición.

### Campos compatibles
- Nombre del evento, introducción, código de vestimenta, historia, regalos, hashtag, buzón de deseos, álbum, ubicación y mensaje RSVP.

### Compatibilidad
- La edición inline solo se habilita en modo Studio.
- No modifica la invitación pública, el panel administrativo ni la estructura de `design_json`.
- No requiere migraciones.

Todos los cambios relevantes de InvitaPro se documentan en este archivo. A partir de la versión 2.20.0 no se crearán archivos `CAMBIOS-vX.Y.Z.md` separados.

## [2.25.0] — 2026-08-01

### Añadido
- Reordenamiento directo mediante arrastre en la vista previa real del Studio.
- Indicadores visuales para insertar un bloque antes o después del destino.
- Drag & Drop en el navegador horizontal del canvas.
- Soporte táctil mediante Pointer Events en el navegador de bloques.
- Mensaje accesible y persistencia automática del nuevo `section_order`.

### Cambiado
- La portada permanece fija y no puede arrastrarse.
- El reordenamiento se integra con el State Engine, History Engine y autoguardado existentes.
- `design_json.studio_version` y la versión del proyecto se actualizaron a `2.25.0`.

### Compatibilidad
- No requiere migraciones de base de datos.
- No modifica el portal del cliente, el panel administrativo ni la invitación pública fuera del modo Studio.

## [2.24.0.1] — 2026-07-31

### Corregido

- Se corrigió el alcance de la variable que identifica bloques bloqueados dentro de `StudioCanvasNavigator`.
- El botón Mostrar/Ocultar ahora usa el bloque seleccionado para determinar si la acción debe quedar deshabilitada.
- Se resolvió el error de TypeScript `Cannot find name 'locked'` durante `pnpm run build`.

### Compatibilidad

- No requiere migraciones.
- No modifica `design_json` ni el comportamiento de cliente o administrador.

---

## [2.24.0] — 2026-07-31

### Agregado

- Navegador visual horizontal para recorrer todos los bloques del canvas sin perder el contexto de la vista previa.
- Indicador claro del bloque activo, posición dentro de la invitación y estado visible/oculto.
- Acciones rápidas para mover, ocultar o volver a mostrar el bloque seleccionado.
- Componente reutilizable `StudioCanvasNavigator` separado del archivo principal del Studio.

### Cambiado

- La selección desde el navegador abre automáticamente el editor contextual correspondiente y sincroniza el bloque activo en la vista previa.
- `design_json.studio_version` y la versión del proyecto se actualizaron a `2.24.0`.

### Compatibilidad

- No modifica la estructura de `design_json`.
- No requiere migraciones de base de datos.
- No altera el panel administrativo, el portal del cliente ni la invitación pública fuera del modo Studio.

### Validación recomendada

1. Ejecutar `pnpm run build`.
2. Abrir una invitación en Studio y recorrer los bloques desde el navegador superior del canvas.
3. Confirmar que el bloque seleccionado se centra en la vista previa y abre su editor.
4. Probar mover, ocultar y mostrar bloques, incluyendo los límites de la portada.
5. Guardar, recargar y confirmar que orden y visibilidad se conservan.

---

## [2.21.0] — 2026-07-30

### Agregado

- Componente reutilizable `StudioSectionNavigation` para la navegación lateral del editor.
- Componente reutilizable `StudioBlockVariantSelector` para seleccionar estilos de bloques tanto en Estructura como en el editor contextual.
- Registro centralizado de secciones editoriales mediante `STUDIO_EDITOR_SECTIONS`.

### Cambiado

- El archivo principal del Studio deja de renderizar manualmente la navegación y los selectores de variantes.
- Se eliminó la duplicación de metadatos de las secciones desde `page.tsx`.
- El motor del Studio avanza hacia una arquitectura de componentes desacoplados y reutilizables.
- `design_json.studio_version` y la versión del proyecto se actualizaron a `2.21.0`.

### Compatibilidad

- No modifica la estructura existente de `design_json`.
- No requiere migraciones de base de datos.
- Conserva el comportamiento actual de selección, visibilidad y variantes.

### Validación recomendada

1. Ejecutar `pnpm run build`.
2. Abrir Studio y navegar por todas las secciones del menú lateral.
3. Abrir Estructura, seleccionar bloques y cambiar sus variantes.
4. Confirmar que el selector de variantes también funciona dentro del editor de cada sección.
5. Guardar y recargar la invitación.

---

## [2.20.0.1] — 2026-07-30

### Corregido

- Se corrigió el error de TypeScript en el Studio causado por consultar `description` en las entradas locales de `SECTIONS`, cuyo campo correcto es `desc`.
- Se ajustaron la lista lateral y el encabezado del editor para utilizar la propiedad correcta.
- La versión del proyecto se actualizó a `2.20.0.1`.

### Validación recomendada

1. Ejecutar `pnpm run build`.
2. Abrir Studio y seleccionar varios apartados del menú lateral.
3. Confirmar que las descripciones aparecen correctamente.

---

## [2.20.0] — 2026-07-30

### Agregado

- `README.md` profesional con instalación, arquitectura, validaciones, seguridad y roadmap.
- Registro central de bloques en `lib/studio/block-registry.ts`.
- Tipos reutilizables para categorías, variantes y metadata de bloques.

### Cambiado

- El Studio obtiene nombres, descripciones, iconos, categorías, editores y variantes desde un único registro.
- Se eliminó configuración duplicada del archivo principal del Studio.
- La versión del proyecto se actualizó a `2.20.0`.
- El historial de versiones se consolidó en un único `CHANGELOG.md`.

### Arquitectura

- Esta fase inicia el Motor de Componentes del Studio sin alterar el formato actual de `design_json`.
- No requiere migraciones de base de datos.

### Validación recomendada

1. Ejecutar `pnpm install`.
2. Ejecutar `pnpm run build`.
3. Abrir Studio y validar la lista de bloques.
4. Probar búsqueda, categorías, variantes, mover, ocultar y agregar bloques.
5. Guardar y recargar una invitación.

---

## Historial anterior consolidado

# InvitaPro v2.17.1.1

## Archivos modificados

- `app/client-portal.css`
- `package.json`

## Error corregido

- El control de zoom de la vista previa se recortaba cuando el encabezado intentaba colocar el título y todos los controles en una sola fila dentro del panel lateral.

## Ajustes aplicados

- El encabezado lateral mantiene el título y la barra de controles en dos filas.
- El control de zoom puede reducirse sin ocultar los botones `−`, `+` ni el porcentaje.
- La distribución horizontal se reserva para el modo enfoque, donde existe espacio suficiente.
- Se agregaron ajustes compactos para pantallas muy angostas.

## Migraciones

No requiere migraciones de base de datos.

## Validación recomendada

1. Abrir Studio en vista normal.
2. Probar celular, tableta y escritorio.
3. Confirmar que se vean `−`, porcentaje, `+` y enfoque.
4. Probar zoom de 60 % a 120 %.
5. Activar modo enfoque y verificar la distribución horizontal.
6. Ejecutar:

```bash
pnpm run build
```

## Comandos Git

```bash
git status
git add .
git commit -m "v2.17.1.1 - Hotfix controles de zoom"
git push origin main
```

---

# InvitaPro v2.17.1 — Preview Header Refresh

## Versión

- **Versión anterior:** 2.17.0
- **Versión nueva:** 2.17.1

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/client-portal.css`
- `package.json`

## Mejoras agregadas

- Se reemplazó el título partido “Vista previa real” por **Vista previa** en una sola línea.
- Se agregó indicador discreto **EN VIVO** con punto de estado.
- Los controles de dispositivo, zoom y enfoque ahora ocupan una fila propia cuando el panel es angosto.
- El control de zoom se adapta al ancho disponible sin empujar ni cortar el título.
- En pantallas amplias, título y controles vuelven a compartir una sola fila.
- Se redujo el espacio superior para aprovechar mejor el lienzo.
- Se eliminó el texto auxiliar permanente que saturaba el encabezado.

## Errores corregidos

- El título ya no se divide en tres líneas.
- Los controles ya no se enciman ni desbordan el panel de vista previa.
- El encabezado deja de verse cortado en resoluciones intermedias.

## Migraciones

- No requiere migraciones de base de datos.

## Comandos Git

```bash
pnpm run build
git status
git add .
git commit -m "v2.17.1 - Preview Header Refresh"
git push origin main
```

## Pruebas recomendadas

1. Abrir Studio con el navegador entre 1200 y 1450 px de ancho.
2. Confirmar que “Vista previa” permanezca en una sola línea.
3. Probar celular, tableta y escritorio.
4. Probar zoom de 60 % a 120 %.
5. Activar y salir del modo enfoque.
6. Verificar que ningún control se corte o se superponga.
7. Ejecutar `pnpm run build`.

---

# InvitaPro v2.17.2 — Editor de Introducción

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `package.json`

## Funciones agregadas

- Se agregó **Introducción** como sección editable independiente en el menú lateral del Studio.
- El bloque `intro` ahora abre directamente su editor al pulsar **Editar contenido** desde Estructura.
- El mensaje de bienvenida puede modificarse desde un campo dedicado.
- Los cambios utilizan el mismo valor `design_json.mensaje`, por lo que se reflejan en la vista previa, el borrador y la invitación publicada.
- La visibilidad de Introducción queda sincronizada entre el menú lateral y el constructor de bloques.

## Ajustes de interfaz

- La sección Portada conserva el título, la frase de portada, el color y la imagen.
- El mensaje largo de bienvenida se movió a la nueva sección Introducción para evitar confusión.
- Se agregó una nota indicando dónde se mostrará el contenido editado.

## Migraciones

No requiere migraciones de base de datos.

## Validación recomendada

1. Abrir Studio y entrar en **Introducción** desde el menú lateral.
2. Cambiar el mensaje y comprobar que se actualiza en la vista previa.
3. Entrar en **Estructura**, seleccionar Introducción y pulsar **Editar contenido**.
4. Ocultar y volver a mostrar el bloque para validar la sincronización.
5. Guardar y volver a abrir la invitación para confirmar la persistencia.
6. Ejecutar `pnpm run build`.

## Comandos Git

```bash
pnpm run build
git status
git add .
git commit -m "v2.17.2 - Editor de introduccion"
git push origin main
```

---

# InvitaPro v2.18.0.1 — Sincronización inmediata de plantilla

## Versión

`2.18.0.1`

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `package.json`
- `CAMBIOS-v2.18.0.1.md`

## Funciones agregadas

- El estado enviado al iframe de vista previa ahora incluye explícitamente `templateKey`.
- La vista previa administrativa se recarga al aplicar una plantilla para garantizar que el motor visual use el nuevo diseño.

## Errores corregidos

- Al pulsar **Aplicar plantilla**, el catálogo y el resumen lateral cambiaban, pero la vista previa podía conservar la plantilla anterior.
- La función que sincroniza el Studio con el iframe no reaccionaba a cambios de `template_key` porque esa propiedad no formaba parte de sus dependencias.

## Migraciones

No requiere migraciones de base de datos.

## Pruebas recomendadas

1. Abrir una invitación en Studio.
2. Pulsar **Cambiar plantilla**.
3. Elegir una plantilla distinta y pulsar **Aplicar plantilla**.
4. Confirmar que el modal se cierre y la vista previa cambie inmediatamente.
5. Cambiar nuevamente a otra familia de plantilla para verificar colores, tipografía y composición.
6. Recargar la página y confirmar que la plantilla seleccionada permanezca guardada.
7. Ejecutar `pnpm run build`.

## Comandos Git

```bash
pnpm run build
git status
git add .
git commit -m "v2.18.0.1 - Sincronizacion inmediata de plantilla"
git push origin main
```

---

# InvitaPro v2.18.0 — Studio Visual, fase 1

## Versión

`2.18.0`

## Archivos modificados

- `app/invitacion/[slug]/page.tsx`
- `app/client-portal.css`
- `package.json`
- `CAMBIOS-v2.18.0.md`

## Funciones agregadas

- Etiqueta visual con el nombre de cada bloque al pasar el cursor.
- Resaltado profesional para bloques en hover y seleccionados.
- Barra flotante contextual dentro de la vista previa.
- Botón **Editar** visible que abre el editor correspondiente en Studio.
- Acciones rápidas para subir, bajar y ocultar bloques.
- Ajustes responsivos para que las herramientas no cubran el contenido en móvil.

## Errores corregidos

- Se eliminó la etiqueta genérica “Editar sección”, que competía con los controles.
- Se mejoró la identificación del bloque activo.
- Se redujo el riesgo de que la barra flotante quede fuera del ancho visible.

## Migraciones

No requiere migraciones de base de datos.

## Pruebas recomendadas

1. Abrir Studio y pasar el cursor sobre varios bloques.
2. Verificar que aparezca el nombre correcto del bloque.
3. Seleccionar Introducción y confirmar que se abra su editor.
4. Probar subir, bajar y ocultar un bloque distinto de Portada.
5. Validar la vista previa en celular, tableta y escritorio.
6. Ejecutar `pnpm run build`.

## Comandos Git

```bash
git status
git add .
git commit -m "v2.18.0 - Studio Visual fase 1"
git push origin main
```

---

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

## [2.22.0] - 2026-07-30

### Añadido
- Motor de estado central del Studio mediante `useStudioState`.
- Tipos compartidos `StudioState` y `StudioSnapshot` en `lib/studio/studio-types.ts`.
- Valores iniciales de contenido, visibilidad, orden y variantes centralizados fuera de la página principal.
- Setters compatibles con actualizaciones directas y funcionales para facilitar la migración gradual del editor.

### Cambiado
- El Studio dejó de administrar más de treinta estados de contenido independientes dentro de `page.tsx`.
- El estado editable ahora vive en una sola fuente de verdad preparada para historial, edición inline e inspector visual.
- `studio_version` se actualizó a `2.22.0` sin modificar el formato existente de `design_json`.

### Compatibilidad
- No requiere migraciones de base de datos.
- Mantiene los nombres de campos y el comportamiento actual de autoguardado, vista previa, deshacer y rehacer.

## [2.23.0] - 2026-07-30

### Añadido
- Motor de historial reutilizable en `lib/studio/use-studio-history.ts`.
- Controles visibles para deshacer y rehacer en la barra superior del Studio.
- Atajos `Ctrl/Cmd + Z`, `Ctrl/Cmd + Y` y `Ctrl/Cmd + Shift + Z`.
- Indicador de posición dentro del historial de cambios.
- Límite configurable de 50 estados y agrupación de cambios mediante debounce.

### Cambiado
- La lógica de historial dejó de vivir dentro de `page.tsx`.
- La restauración de snapshots ahora actualiza el estado central completo en una sola operación.
- Los cambios nuevos eliminan correctamente la rama futura después de deshacer.
- `studio_version` se actualizó a `2.23.0`.

### Compatibilidad
- No requiere migraciones de base de datos.
- Mantiene el formato actual de `design_json` y el autoguardado existente.
