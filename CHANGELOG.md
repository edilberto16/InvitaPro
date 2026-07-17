## 1.8.0 - Apertura cinematográfica y música

- Agrega una pantalla de bienvenida opcional.
- La música comienza al presionar `Abrir invitación`, compatible con las políticas de los navegadores.
- Permite personalizar el texto del botón de apertura.
- Añade cinco efectos configurables para la fotografía de portada.
- Incluye Zoom cinematográfico, Desenfoque a enfoque, Movimiento lateral, Fundido y Sin efecto.
- Aplica la apertura y los efectos a invitaciones públicas y pases personalizados.
- Respeta la preferencia de accesibilidad `prefers-reduced-motion`.
- Guarda toda la configuración dentro de `design_json`, sin migración SQL.

## 1.7.1 - Romantic Garden Signature

- Rediseña Romantic Garden como plantilla editorial botánica de alta gama.
- Agrega navegación flotante por secciones.
- Añade un botón para guardar el evento en Google Calendar.
- Incorpora formas orgánicas, arcos, fondos fotográficos y ornamentos vegetales.
- Rediseña cuenta regresiva, detalles, itinerario, galería, ubicación, RSVP y footer.
- Aplica la misma identidad visual a los pases personalizados.
- La propuesta toma inspiración general de invitaciones editoriales de boda, sin copiar el diseño ni los recursos de terceros.

## 1.7.0 - Catálogo Premium de plantillas

- Incorpora el catálogo maestro de 24 plantillas.
- Organiza las plantillas en Wedding, XV, Infantil y Empresarial.
- Incluye filtros visuales por colección.
- Habilita seis diseños comerciales iniciales:
  - Elegante Classic
  - Luxury Black
  - Romantic Garden
  - Princess Rose
  - Safari
  - Corporativo
- Muestra las próximas plantillas como `En desarrollo`.
- Cambiar de plantilla conserva evento, modalidad, textos, fotos y música.
- Cada plantilla disponible tiene una identidad visual pública diferente.

## 1.6.0 - Compartir invitaciones y pases

- Agrega un modal profesional para compartir invitaciones.
- Permite copiar el enlace completo usando el dominio actual.
- Genera automáticamente un mensaje listo para WhatsApp.
- Permite utilizar el menú nativo de compartir del teléfono.
- Las invitaciones Solo enlace y RSVP usan un enlace público.
- Los pases personalizados generan un enlace único por invitado.
- Usa el teléfono guardado para abrir directamente la conversación de WhatsApp.
- Impide compartir invitaciones públicas que todavía no están publicadas.

## 1.5.3 - Plantilla premium para pases personalizados

- Unifica la invitación con pase con la plantilla pública premium.
- Aplica correctamente portada, galería, música, colores y textos demo.
- Añade cuenta regresiva y datos completos del evento.
- Rediseña el pase personalizado con cupos, mesa y código.
- Conserva el formulario RSVP con límites por invitado.
- Corrige la diferencia visual entre RSVP público y pases personalizados.

## 1.5.2 - Selector de música simplificado

- Elimina el campo técnico `Música URL` del formulario.
- La música se administra únicamente mediante el selector de archivos.
- Permite cambiar o quitar la pista cargada.
- Muestra claramente si la pista proviene del paquete demo o de Supabase Storage.
- Evita la validación incorrecta del navegador para rutas locales `/demo/...`.

## 1.5.1 - Paquete multimedia de demostración

- Incluye una portada de boda de ejemplo.
- Incluye ocho fotografías de galería.
- Incluye una pista instrumental original de demostración.
- Agrega el botón `Usar contenido demo` al constructor.
- El contenido demo se guarda como rutas públicas dentro de `design_json`.
- Los archivos personalizados continúan cargándose en Supabase Storage.

## 1.5.0 - Supabase Storage para invitaciones

- Permite subir la fotografía de portada desde el constructor.
- Permite cargar hasta ocho imágenes de galería.
- Permite subir música de fondo.
- Guarda los archivos en los buckets `event-media` y `event-audio`.
- Registra referencias en la tabla `media`.
- Guarda las URLs en `design_json` y `musica_url`.
- Muestra portada, galería y reproductor en la invitación pública.
- No requiere cambios adicionales en el esquema de base de datos.

## 1.4.0 - Invitación pública premium por bloques

- Rediseña la experiencia pública con portada premium.
- Corrige y mejora la cuenta regresiva mediante tarjetas independientes.
- Añade bloques configurables para detalles, programa, ubicación y RSVP.
- Permite activar o desactivar secciones desde el formulario de invitación.
- Guarda la configuración de bloques en `design_json` de Supabase.
- Añade título introductorio y programa editable.
- Conserva las tres modalidades: Solo enlace, RSVP público y Pases personalizados.

## 1.3.1 - Vista previa de pases y contador

- Permite al administrador previsualizar invitaciones con pases sin exponerlas públicamente.
- El enlace de Vista previa agrega un modo administrativo seguro para la modalidad `pases`.
- Mantiene bloqueado el enlace público sin código para los invitados.
- Agrega una franja que identifica la vista previa administrativa.
- Corrige el contador cuando la fecha u hora no tienen un formato válido.

## 1.3.0 - Constructor comercial de invitaciones

- Sustituye el selector de modalidad por tres tarjetas visuales.
- Explica claramente Solo enlace, RSVP público y Pases personalizados.
- Agrega formulario organizado por secciones.
- Muestra campos y avisos según la modalidad elegida.
- Incluye una vista previa móvil en tiempo real.
- Conserva el CRUD directo con Supabase.

## 1.2.0 - Limpieza definitiva de Supabase

- Elimina la pantalla `/admin/migracion`.
- Elimina la opción Migración del menú administrativo.
- Elimina la documentación y el esquema temporal de migración.
- Supabase queda como única fuente operativa de datos.
- Conserva el formulario profesional de nuevo/editar invitado.
- Actualiza README, Roadmap y documentación técnica.

## 1.1.1 - Formulario de invitados mejorado

- Rediseño del modal de nuevo/editar invitado.
- Secciones claras para datos, lugares y acceso.
- Distribución compacta en columnas.
- Pie fijo con acciones visibles.
- Mejor adaptación a pantallas pequeñas.

# Changelog

## 1.0.0 - Migración completa a Supabase

- Motor de migración compatible con `schema-v1.sql`.
- Migra clientes, eventos, invitaciones, invitados y confirmaciones respetando relaciones.
- Mapa persistente de identificadores para evitar duplicados al repetir la migración.
- Validación de sesión, tablas y errores por módulo.
- Conserva `localStorage` como respaldo hasta completar la validación.

## 0.9.0 - Base de migración a Supabase

- Agrega clientes Supabase para navegador y servidor.
- Agrega inicio de sesión por correo y contraseña.
- Protege las rutas administrativas cuando Supabase está configurado.
- Incorpora un esquema PostgreSQL completo con RLS y función pública RSVP.
- Agrega el asistente para migrar datos desde localStorage.
- Prepara confirmaciones para Supabase Realtime.

## 0.6.1
- Rediseño completo del formulario de invitados.
- Formulario dividido en tres secciones claras.
- Modal con altura controlada y desplazamiento interno.
- Botones de acción fijos y diseño adaptable a celular.

## [0.4.0] - 2026-07-13

### Agregado
- Módulo funcional de Eventos asociado a Clientes.
- Crear, editar, buscar, filtrar y eliminar eventos.
- Estados borrador, confirmado y finalizado.
- Agenda local persistente mediante localStorage.
- Confirmación profesional antes de eliminar un evento.
- Acceso a Eventos desde el menú administrativo.

## 0.3.1 - Confirmación de eliminación

- Se reemplazó la alerta nativa del navegador por un modal profesional.
- El modal muestra los datos del cliente antes de eliminarlo.
- Se agregó una advertencia visual y botones claros de cancelar/confirmar.
- Diseño adaptable para celular y accesible con `alertdialog`.

## 0.3.0
- Módulo Clientes funcional con alta, edición, eliminación y búsqueda.
- Validación de nombre y correo electrónico.
- Persistencia local provisional mediante localStorage.
- Documento inicial del modelo de datos.

## 0.2.0
- Nuevo layout administrativo con menú lateral y barra superior.
- Dashboard con tarjetas, tabla de invitaciones y actividad reciente.
- Navegación inicial para Clientes, Invitaciones, Plantillas, Invitados, Confirmaciones y Configuración.
- Diseño adaptable para escritorio, tableta y celular.

## 0.1.0
- Base inicial de InvitaPro con Next.js.
- Panel demostrativo y vista pública de invitación.

## [0.5.0] - 2026-07-13
### Agregado
- Módulo funcional de invitaciones vinculado a eventos y clientes.
- Crear, editar, publicar, pausar y eliminar invitaciones.
- Slugs únicos y enlaces públicos personalizados.
- Selección de plantilla, color, mensaje, vestimenta, Maps y WhatsApp.
- Vista pública dinámica con cuenta regresiva y diseño adaptable.
- Persistencia local provisional mediante localStorage.

## [0.6.0] - 2026-07-13
### Agregado
- Módulo funcional de invitados vinculado a invitaciones.
- Pases separados para adultos y niños.
- Código único y enlace privado para cada familia o invitado.
- Asignación de mesa, datos de contacto, estado y notas internas.
- Búsqueda y filtros por invitación y estado.
- Copiado de enlace personalizado desde el panel.
- Vista pública personalizada con nombre, lugares asignados, mesa y código de acceso.
- Modal profesional de eliminación y persistencia local mediante localStorage.

## [0.7.0] - 2026-07-13

### Agregado
- Formulario RSVP integrado en cada pase personalizado.
- Confirmación de adultos y niños respetando los pases asignados.
- Mensaje opcional para los anfitriones.
- Módulo administrativo de confirmaciones con búsqueda y filtros.
- Estadísticas de respuestas, asistentes, negativas y pendientes.
- Actualización automática del estado del invitado.
- Edición de respuestas y eliminación con confirmación profesional.

## [0.8.0] - Centro de notificaciones y dashboard RSVP

- Campana con contador de respuestas nuevas.
- Panel desplegable con confirmaciones recientes.
- Dashboard alimentado por los datos reales guardados localmente.
- Porcentaje de respuesta y resumen de confirmados, declinados y pendientes.
- Actividad RSVP reciente y accesos rápidos.
- Actualización automática dentro de la misma computadora y navegador.

## 1.1.0 - Supabase CRUD completo

- Clientes, eventos, invitaciones, invitados, confirmaciones y plantillas leen y escriben directamente en Supabase.
- El dashboard obtiene métricas reales de la nube.
- Confirmaciones y notificaciones se actualizan mediante Supabase Realtime.
- Las invitaciones públicas se cargan mediante funciones SQL seguras.
- RSVP público y pases personalizados guardan las respuestas directamente en Supabase.
- Se elimina el uso operativo de localStorage en los módulos principales.

## 1.10.0 - Configuración comercial
- Nuevo módulo de configuración con secciones General, Marca y WhatsApp.
- Preferencias persistentes por usuario mediante la tabla `configuracion`.
- Mensajes de interfaz orientados al usuario, sin referencias visibles a la infraestructura.
- Limpieza de archivos temporales y respaldos locales.
