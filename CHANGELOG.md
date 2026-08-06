# CHANGELOG

## [2.36.3] - 2026-08-05

### Cambiado
- Landing, Studio y modal de publicación usan la misma definición central de beneficios por plan.
- El plan seleccionado se identifica claramente como `Plan seleccionado`; el plan vigente se muestra como `Plan actual`.
- El resumen de activación muestra precio, pago por transferencia y todos los beneficios incluidos.
- El botón de activación indica explícitamente el plan que se solicitará.
- Clásico, Premium y Signature comunican de forma consistente sus límites y funciones comerciales.

### Técnico
- `lib/commercial-plans.ts` es la fuente única para precios, límites y beneficios visibles.
- No requiere migración de Supabase.


## [2.36.2] - 2026-08-05

### Corregido
- La ficha CRM utiliza el mismo registro unificado que Gestión de Invitados y muestra el estado confirmado en tiempo real.
- Los pases asignados desde CSV ya no se sustituyen por las cantidades confirmadas.
- La ficha separa pases asignados, asistentes confirmados y check-in.
- Se muestran el comentario y la fecha de la respuesta RSVP en la ficha del invitado.
- RSVP público vincula la respuesta con un invitado importado cuando coincide el teléfono.
- La función SQL rechaza cantidades superiores a los pases de adulto o niño asignados.
- Una reconfirmación actualiza la respuesta existente y sincroniza `invitados.estado`.

### Migración
- Añadida `20260805_v2_36_2_limites_pases_crm.sql`.

## [2.36.1] - 2026-08-05

- Álbum Inteligente: eliminación definitiva de fotografía y archivo en Storage con ConfirmDialog.
- Invitación pública: corrección responsive para títulos grandes en celulares.
- RSVP: evita respuestas duplicadas por teléfono y actualiza la respuesta existente.
- Incluye migración `20260805_v2_36_1_rsvp_sin_duplicados.sql`.

## [2.36.0] - 2026-08-05

### Añadido
- Centro de Compartir con enlace, compartir nativo, WhatsApp y descarga de código QR.
- Selección de invitados por segmento y cola de envío asistido uno por uno.
- Plantilla editable con variables para nombre, evento, fecha, ubicación, mesa, pases y enlace.
- Enlaces personalizados para invitaciones con pases.
- Estados locales de envío: pendiente, abierto, enviado y omitido.

### Cambiado
- El botón Compartir ahora abre un centro completo en lugar del modal básico.

## [2.35.4] - 2026-08-04

### Corregido
- Se normalizan fechas en formato `YYYY-MM-DD` y `MM/DD/YYYY` antes de mostrarlas o usarlas en la cuenta regresiva.
- Se convierten horas de 12 horas (`06:00 PM`) y 24 horas (`18:00`) a un valor seguro antes de calcular el evento.
- `longDate()` deja de lanzar `RangeError: Invalid time value`; cuando el dato no es válido muestra **Fecha por definir**.
- La vista previa lateral del Studio ya no se rompe mientras el usuario cambia la fecha o la hora.
- El selector del Álbum colaborativo usa un botón real conectado mediante referencia al `input[type=file]`, evitando fallos de clic por `label`, capas o estilos.
- El álbum permanece disponible antes, durante y después del evento siempre que la invitación esté publicada y el bloque esté visible.

### Compatibilidad
- No requiere migración de Supabase.
- Conserva el bucket `guest-album` y las políticas existentes, que ya permiten subir mientras la invitación esté publicada y el álbum activo.
- Se mantiene un único `CHANGELOG.md`.

## [2.35.3] - 2026-08-02

### Corregido
- El selector de fotografías del Álbum colaborativo ahora abre correctamente el explorador de archivos.
- Se separó el campo **Tu nombre (opcional)** del control de archivo para evitar que el `label` activara el campo equivocado.
- Se añadieron estados visibles de selección, carga, éxito y error durante la subida.
- Si falla el registro en `album_colaborativo_fotos`, el archivo recién subido se elimina de Storage para evitar archivos huérfanos.
- El Centro de Mensajes dejó de usar `window.confirm()` y ahora reutiliza el `ConfirmDialog` del Design System.
- El modal de eliminación de mensajes incluye nombre, contenido, estado de carga y advertencia de acción irreversible.

### Compatibilidad
- No requiere migración de Supabase.
- Conserva el bucket `guest-album` y la tabla `album_colaborativo_fotos` existentes.
- Se mantiene un único `CHANGELOG.md`.

## [2.35.2] - 2026-08-02

### Corregido
- La actividad RSVP eliminada deja de mostrarse en el Dashboard cuando su confirmación de origen ya no existe.
- El Timeline valida la relación `actividad.entidad_id` con las confirmaciones activas para evitar registros históricos huérfanos en la interfaz.
- El indicador verde fue sustituido por un icono compacto, alineado y contenido dentro de la tarjeta.
- Se añadieron iconos diferenciados para RSVP, mensajes y check-in.
- Se mejoraron la alineación, el espaciado, la fecha y el comportamiento responsive de Actividad reciente.

### Compatibilidad
- No requiere migración de Supabase.
- No elimina el historial técnico almacenado en `actividad`; únicamente evita mostrar referencias cuyo registro de origen ya fue eliminado.
- Se mantiene un único `CHANGELOG.md`.

## [2.35.1] - 2026-08-01

### Añadido
- Nuevo componente reutilizable `components/ui/confirm-dialog.tsx` para confirmaciones destructivas consistentes.
- El diálogo se monta mediante portal sobre `document.body`, evitando que quede atrapado dentro del layout del portal.
- Soporte para cerrar con `Esc`, bloquear el scroll de fondo y mostrar hasta cinco registros afectados.

### Corregido
- Eliminar un invitado o varios ahora abre un modal centrado con fondo oscuro y desenfoque.
- Los mensajes distinguen correctamente entre singular y plural.
- Los botones **Cancelar** y **Eliminar invitado(s)** mantienen una jerarquía visual consistente.
- El modal se adapta a pantallas pequeñas y conserva visibles sus acciones.

### Compatibilidad
- No requiere migración de Supabase.
- No cambia la lógica de eliminación individual o masiva.
- Se mantiene un único `CHANGELOG.md`.

## [2.34.0] - 2026-08-01

### Añadido
- Se agregó un módulo dedicado para consultar y moderar el Buzón de deseos.
- Se añadieron filtros por pendientes, aprobados y destacados, además de búsqueda y exportación CSV.
- Los anfitriones pueden aprobar, ocultar, destacar y eliminar mensajes.
- Los mensajes nuevos aparecen en tiempo real y se integran en la actividad reciente del Dashboard.
- El Dashboard muestra el total de mensajes recibidos y el menú indica mensajes pendientes.
- Se añadió la columna `mensajes_deseos.destacado` mediante una migración segura.

## [2.33.1.1] - 2026-08-01

### Corregido
- Se reorganizó la barra de selección masiva del Centro de Gestión de Invitados.
- El checkbox **Seleccionar visibles** ahora permanece junto a su etiqueta.
- El contador muestra correctamente singular y plural, con separación visual.
- El botón **Eliminar seleccionados** queda alineado y muestra un estado deshabilitado claro cuando no hay selección.
- La barra se adapta a pantallas móviles sin separar controles ni provocar desbordamiento.

### Compatibilidad
- No requiere migración de Supabase.
- No modifica la lógica de selección o eliminación de invitados.
- Se mantiene un único `CHANGELOG.md`.

## [2.33.1] - 2026-08-01

### Añadido
- Nueva capa `guest-unified.service.ts` para combinar invitados importados/manuales con respuestas de RSVP público.
- Gestión de Invitados ahora muestra también las confirmaciones públicas aunque no exista un registro previo en `invitados`.
- Las respuestas enlazadas por `invitado_id`, teléfono o nombre se fusionan con el invitado existente para evitar duplicados visuales.
- Los comentarios RSVP y el origen `RSVP público` aparecen dentro del Centro de Gestión de Invitados.

### Corregido
- Las métricas de Gestión de Invitados ahora coinciden con el Centro de Confirmaciones.
- Los registros generados únicamente desde RSVP público se muestran como solo lectura y no intentan eliminar filas inexistentes de `invitados`.
- Se mantiene la compatibilidad con CSV, altas manuales y pases personalizados.

### Compatibilidad
- No requiere migración de Supabase.
- No modifica el panel administrativo, el Studio ni la invitación pública.
- Se mantiene un único `CHANGELOG.md`.

## [2.33.0.1] - 2026-08-01

### Corregido
- La opción **Invitados** ahora aparece en la navegación principal para cualquier invitación activa, incluyendo RSVP público y pases personalizados.
- El enlace lleva directamente al nuevo Centro de Gestión de Invitados mediante `#invitados`.
- El módulo `GuestManagementCenter` ya no queda oculto en invitaciones configuradas como RSVP público.
- Se ajustaron los textos del módulo para que funcionen correctamente en ambas modalidades.

### Compatibilidad
- No requiere migración de Supabase.
- No modifica el panel administrativo, el Studio ni la invitación pública.
- Se mantiene un único `CHANGELOG.md`.

## [2.32.0] - 2026-08-01

### Añadido
- Centro de Confirmaciones para el portal del cliente.
- Lista en tiempo real de respuestas RSVP, comentarios, asistentes y rechazos.
- Filtros por estado, comentarios y búsqueda por nombre, teléfono, código o mesa.
- Exportación CSV de confirmaciones.
- Acceso a WhatsApp y ficha CRM cuando existe un pase personalizado.
- Nuevo componente `components/guests/confirmations-center.tsx`.

### Corregido
- El Dashboard ahora usa `confirmaciones` como fuente real para RSVP público, en lugar de depender de la tabla `invitados`.
- Los contadores de respuestas, confirmados y personas ya reflejan los registros públicos.
- El enlace superior `Confirmaciones` ahora lleva al módulo correcto.
- La pantalla se actualiza mediante Supabase Realtime cuando entra una nueva respuesta.
- Se cambió `align-items: end` por `flex-end` para eliminar la advertencia de Autoprefixer.

### Compatibilidad
- Funciona con RSVP público y pases personalizados.
- No requiere migración de Supabase.
- No modifica el panel administrativo ni la invitación pública.
- Se mantiene un único `CHANGELOG.md`.

## [2.31.1] - 2026-08-01

### Corregido
- El RSVP público ahora acepta invitaciones históricas cuya modalidad está guardada como `autoservicio`.
- La función `registrar_confirmacion` normaliza la modalidad antes de validar.
- Se separaron los mensajes de error para invitación inexistente, no publicada, modalidad sin RSVP, expiración y evento faltante.
- La comparación de códigos de pases ahora ignora mayúsculas y espacios accidentales.
- Se normalizaron cantidades nulas de adultos y niños para evitar errores en la función.

### Base de datos
- Añadida la migración `20260801_v2_31_1_rsvp_publico_hotfix.sql`.
- Esta migración debe ejecutarse en Supabase antes de volver a probar el formulario RSVP.
- `schema-v1.sql` quedó actualizado para instalaciones nuevas.

### Compatibilidad
- No modifica tablas ni elimina datos.
- No afecta el Buzón de deseos, invitaciones con pases ni invitaciones existentes.
- Se mantiene un único `CHANGELOG.md`.

## [2.30.0] - 2026-08-01

### Añadido
- Dashboard del Evento como vista principal de Mi InvitaPro.
- Resumen reutilizable de invitados, RSVP, check-in y fotografías.
- Panel de progreso, tareas recomendadas, acciones rápidas y actividad reciente.
- Nuevo componente `components/client/event-dashboard.tsx`.
- Lectura de actividad del evento y conteo del álbum mediante las políticas RLS existentes.

### Cambiado
- La cuenta del cliente prioriza la gestión del evento y mantiene el Studio como herramienta de diseño.
- Se conserva la administración de invitados, CSV, WhatsApp, check-in y álbum debajo del nuevo resumen.
- Versión actualizada a `2.30.0`.

### Compatibilidad
- No requiere migraciones de Supabase.
- No modifica el panel administrativo, las rutas públicas ni `design_json`.

## [2.29.0] - 2026-08-01

### Añadido
- Theme Gallery con buscador por nombre, colección y descripción.
- Filtros dinámicos por colección y vista de favoritos.
- Favoritos persistentes en el navegador mediante `localStorage`.
- Previsualización temporal al pasar el cursor o seleccionar un tema.
- Botón explícito para aplicar el tema y cancelación que restaura el tema original.
- Tarjetas visuales con paleta, tipografía, superficie y sombra del tema.
- Diseño responsive de pantalla completa para celular.

### Compatibilidad
- Mantiene `design_json.theme_id` y `design_json.theme_overrides`.
- No requiere migraciones de Supabase.
- No cambia el contenido de la invitación al explorar temas.

## [2.28.0.2] - 2026-08-01

### Cambiado
- Se retiraron los botones visibles de Deshacer y Rehacer de la barra superior del Studio.
- El History Engine y sus atajos de teclado continúan disponibles.
- La barra superior ahora separa herramientas de diseño y acciones de publicación.
- El selector de tema muestra el nombre y color del tema activo.
- El estado de guardado se presenta como un indicador más discreto.
- Se mejoró el comportamiento responsive de la toolbar.

### Compatibilidad
- No requiere migraciones.
- No modifica `design_json`, invitaciones públicas, cliente ni administrador.

## [2.28.0.1] - 2026-08-01

### Corregido

- Se movió `applyTheme()` fuera de `requestActivation()` para que el selector de temas pueda acceder a la función.
- Se corrigió el error de TypeScript `Cannot find name 'applyTheme'`.
- No requiere migración de Supabase.


## [2.27.0] — 2026-08-01

### Añadido
- Inspector Pro contextual para el bloque seleccionado dentro del Studio.
- Controles reutilizables para variante, alineación, espaciado, superficie, animación y color de acento.
- Nuevo componente `components/studio/inspector/studio-inspector.tsx`.
- Configuración visual por bloque persistida en `design_json.section_settings`.

### Integración
- Los cambios se sincronizan con State Engine, History Engine, autoguardado y vista previa real.
- La invitación publicada interpreta alineación, espaciado, superficie y animación sin romper configuraciones anteriores.
- Los valores ausentes conservan el comportamiento de la plantilla actual.

### Compatibilidad
- No requiere migraciones de Supabase.
- Mantiene las rutas, permisos y estructura histórica de las invitaciones.
- Se continúa utilizando un único `CHANGELOG.md`.

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


## [2.28.0] - 2026-08-01

### Añadido
- Theme Engine central en `lib/themes/` con tipos, registro y resolución de temas.
- Selector visual de temas dentro del Studio.
- Temas iniciales para Wedding, XV años, Infantil, Empresarial y Campamentos.
- Variables CSS globales para tipografías, espaciado, sombras y superficies.
- Persistencia de `theme_id` y `theme_overrides` dentro de `design_json`.

### Cambiado
- La invitación pública ahora resuelve su identidad visual desde el Theme Engine.
- Cambiar plantilla asigna automáticamente un tema compatible sin modificar el contenido.
- El Studio sincroniza tema, color principal, historial, autoguardado y vista previa.
- `lib/theme-studio.ts` se conserva como capa de compatibilidad para código existente.

### Compatibilidad
- No requiere migración de Supabase.
- Las invitaciones sin `theme_id` continúan usando un tema compatible derivado de su plantilla.
- Se conserva el formato actual de `design_json`.
## 2.31.0 — CRM de invitados

- Se agregó una ficha lateral completa para cada invitado.
- La ficha muestra contacto, pases, mesa, código, RSVP y check-in.
- Se agregó una línea de tiempo basada en el estado y los registros de llegada disponibles.
- Se incorporaron notas internas guardadas en `invitados.notas`.
- Se añadió acceso directo a WhatsApp desde la ficha.
- No requiere migración de Supabase.

## 2.33.0 — Gestión de invitados

- Se agregó un centro dedicado de invitados para pases personalizados.
- Se añadieron métricas de total, confirmados, pendientes, rechazos y check-in.
- Se incorporaron segmentos inteligentes: pendientes, confirmados, sin teléfono, con mesa y check-in.
- Se agregó búsqueda por nombre, teléfono, correo, código y mesa.
- Se centralizaron importación CSV, exportación, WhatsApp, ficha CRM y eliminación masiva.
- La importación CSV ahora detecta teléfonos, correos y códigos duplicados dentro del archivo y contra invitados existentes.
- No requiere migración de Supabase.


## 2.35.0 — Gestión de Invitados PRO

- Se habilitó la importación CSV tanto para RSVP público como para pases personalizados.
- Se corrigió la apertura del importador CSV desde Gestión de Invitados.
- Se habilitó la eliminación de respuestas RSVP públicas desde la misma gestión unificada.
- La eliminación masiva ahora separa correctamente registros de `invitados` y `confirmaciones`.
- Se agregó eliminación individual para invitados y respuestas públicas.
- Se mejoró la confirmación de eliminación para describir qué tipo de registros serán removidos.
- Se corrigió el indicador de Actividad reciente para que no se desborde del contenedor.
- Se mejoró el estado visual del botón “Eliminar seleccionados”.
- No requiere migración de Supabase.
