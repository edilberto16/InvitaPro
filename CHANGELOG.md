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
