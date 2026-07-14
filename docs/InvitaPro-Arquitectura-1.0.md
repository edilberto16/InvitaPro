# InvitaPro 1.0 — Documento de Arquitectura Funcional y de Datos

**Versión:** 1.0  
**Estado:** Propuesta para aprobación  
**Fecha:** 14 de julio de 2026  

## 1. Objetivo

InvitaPro será una plataforma web para crear, publicar y administrar invitaciones digitales para eventos.

Debe soportar tres modalidades:

1. **Invitación simple:** enlace público, sin invitados y sin RSVP.
2. **Invitación con RSVP:** enlace público con formulario de confirmación.
3. **Invitación con pases:** lista de invitados, códigos privados, cupos y confirmaciones individuales.

## 2. Tipos de usuario

### Superadministrador
Administra clientes, eventos, invitaciones, plantillas, usuarios, archivos, confirmaciones y configuración general.

### Cliente
Ve únicamente sus propios eventos, invitados, confirmaciones, notificaciones y reportes.

### Invitado
No inicia sesión. Accede mediante enlace público o código privado y puede confirmar asistencia cuando aplique.

## 3. Módulos de InvitaPro 1.0

### Administración
- Dashboard
- Clientes
- Eventos
- Invitaciones
- Plantillas
- Invitados
- Confirmaciones
- Notificaciones
- Usuarios
- Multimedia
- Configuración

### Portal del cliente
- Resumen del evento
- Invitación
- Invitados
- Confirmaciones
- Notificaciones
- Compartir
- Reportes

### Área pública
- Invitación pública
- Invitación personalizada
- RSVP
- Confirmación de respuesta

## 4. Flujo principal

```text
Administrador
    ↓
Cliente
    ↓
Evento
    ↓
Invitación
    ↓
Plantilla y contenido
    ↓
Publicación
    ↓
Invitados o enlace público
    ↓
Confirmaciones
    ↓
Dashboard y notificaciones
```

## 5. Tablas principales

Supabase Auth administrará `auth.users`.

InvitaPro utilizará:

1. `profiles`
2. `clientes`
3. `eventos`
4. `plantillas`
5. `invitaciones`
6. `invitados`
7. `confirmaciones`
8. `media`
9. `notificaciones`
10. `actividad`

## 6. profiles

Extiende a `auth.users`.

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Igual al ID de `auth.users` |
| nombre | text | Sí | Nombre mostrado |
| telefono | text | No | Teléfono |
| avatar_url | text | No | Imagen de perfil |
| rol | text | Sí | `admin`, `cliente`, `colaborador` |
| activo | boolean | Sí | Control de acceso |
| created_at | timestamptz | Sí | Creación |
| updated_at | timestamptz | Sí | Modificación |

## 7. clientes

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| owner_id | uuid | Sí | Administrador propietario |
| user_id | uuid | No | Usuario cliente vinculado |
| nombre | text | Sí | Nombre |
| empresa | text | No | Empresa |
| telefono | text | No | Teléfono |
| correo | text | No | Correo |
| direccion | text | No | Dirección |
| notas | text | No | Información interna |
| estado | text | Sí | `activo`, `inactivo` |
| created_at | timestamptz | Sí | Creación |
| updated_at | timestamptz | Sí | Modificación |

Reglas:
- Un cliente puede existir sin cuenta.
- Un cliente puede tener varios eventos.
- `user_id` se usa cuando el cliente dispone de portal.

## 8. eventos

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| cliente_id | uuid | Sí | Cliente |
| nombre | text | Sí | Nombre del evento |
| tipo | text | Sí | Boda, XV años, etc. |
| fecha | date | Sí | Fecha principal |
| hora | time | No | Hora |
| zona_horaria | text | Sí | Zona horaria |
| lugar | text | No | Lugar |
| direccion | text | No | Dirección |
| maps_url | text | No | Google Maps |
| estado | text | Sí | `borrador`, `confirmado`, `finalizado`, `cancelado` |
| notas | text | No | Información interna |
| created_at | timestamptz | Sí | Creación |
| updated_at | timestamptz | Sí | Modificación |

## 9. plantillas

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| owner_id | uuid | No | Creador |
| nombre | text | Sí | Nombre |
| categoria | text | Sí | Categoría |
| descripcion | text | No | Descripción |
| preview_url | text | No | Vista previa |
| design_json | jsonb | Sí | Diseño visual |
| premium | boolean | Sí | Premium |
| activa | boolean | Sí | Disponible |
| created_at | timestamptz | Sí | Creación |
| updated_at | timestamptz | Sí | Modificación |

## 10. invitaciones

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| evento_id | uuid | Sí | Evento |
| plantilla_id | uuid | No | Plantilla |
| titulo | text | Sí | Título |
| slug | text | Sí | Enlace público |
| modalidad | text | Sí | `simple`, `rsvp`, `pases` |
| estado | text | Sí | `borrador`, `publicada`, `pausada`, `vencida` |
| design_json | jsonb | Sí | Diseño personalizado |
| color_principal | text | No | Color |
| musica_url | text | No | Música |
| whatsapp | text | No | WhatsApp |
| fecha_publicacion | timestamptz | No | Publicación |
| fecha_expiracion | timestamptz | No | Vencimiento |
| created_at | timestamptz | Sí | Creación |
| updated_at | timestamptz | Sí | Modificación |

Reglas:
- `slug` único.
- `simple`: sin RSVP ni invitados.
- `rsvp`: confirmación pública.
- `pases`: invitados y códigos únicos.
- Solo las publicadas son visibles.

## 11. invitados

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| invitacion_id | uuid | Sí | Invitación |
| nombre | text | Sí | Persona o familia |
| telefono | text | No | Teléfono |
| correo | text | No | Correo |
| adultos_permitidos | integer | Sí | Cupos adultos |
| ninos_permitidos | integer | Sí | Cupos niños |
| mesa | text | No | Mesa |
| codigo | text | Sí | Código privado |
| estado | text | Sí | `pendiente`, `confirmado`, `no_asistira` |
| notas | text | No | Notas |
| created_at | timestamptz | Sí | Creación |
| updated_at | timestamptz | Sí | Modificación |

## 12. confirmaciones

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| invitacion_id | uuid | Sí | Invitación |
| invitado_id | uuid | No | Pase |
| nombre | text | No | Nombre público |
| asistira | boolean | Sí | Respuesta |
| adultos | integer | Sí | Adultos |
| ninos | integer | Sí | Niños |
| mensaje | text | No | Mensaje |
| telefono | text | No | Teléfono |
| created_at | timestamptz | Sí | Respuesta |
| updated_at | timestamptz | Sí | Modificación |

Reglas:
- En `pases`, no superar cupos.
- En `rsvp`, puede no existir `invitado_id`.
- La respuesta puede actualizarse.
- Cada actualización genera actividad y notificación.

## 13. media

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| evento_id | uuid | No | Evento |
| invitacion_id | uuid | No | Invitación |
| owner_id | uuid | Sí | Usuario |
| tipo | text | Sí | `imagen`, `audio`, `video`, `documento` |
| bucket | text | Sí | Bucket |
| path | text | Sí | Ruta |
| nombre_original | text | No | Nombre original |
| mime_type | text | No | MIME |
| size_bytes | bigint | No | Tamaño |
| created_at | timestamptz | Sí | Carga |

## 14. notificaciones

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| profile_id | uuid | Sí | Receptor |
| evento_id | uuid | No | Evento |
| tipo | text | Sí | Tipo |
| titulo | text | Sí | Título |
| mensaje | text | Sí | Mensaje |
| url | text | No | Ruta interna |
| leida | boolean | Sí | Estado |
| created_at | timestamptz | Sí | Fecha |

Tipos:
- `rsvp_confirmado`
- `rsvp_rechazado`
- `evento_proximo`
- `invitacion_publicada`
- `sistema`

## 15. actividad

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| id | uuid | Sí | Identificador |
| actor_id | uuid | No | Usuario |
| evento_id | uuid | No | Evento |
| entidad | text | Sí | Módulo |
| entidad_id | uuid | No | Registro |
| accion | text | Sí | Acción |
| detalles | jsonb | No | Datos extra |
| created_at | timestamptz | Sí | Fecha |

## 16. Relaciones

```text
auth.users
    └── profiles
         ├── clientes.user_id
         ├── plantillas.owner_id
         ├── media.owner_id
         └── notificaciones.profile_id

clientes
    └── eventos
         ├── invitaciones
         │    ├── invitados
         │    │    └── confirmaciones
         │    ├── confirmaciones
         │    └── media
         └── media
```

## 17. Seguridad RLS

### Administrador
Accede a clientes, eventos, invitaciones, invitados, confirmaciones y archivos bajo su propiedad.

### Cliente
Accede únicamente a su cliente, eventos, invitaciones, invitados, confirmaciones y notificaciones.

### Invitado público
No accede directamente a tablas. Las acciones públicas se ejecutan mediante funciones SQL seguras o rutas API.

## 18. Storage

Buckets:

- `event-media`
- `event-audio`
- `avatars`

## 19. Realtime

Tablas iniciales:

- `confirmaciones`
- `notificaciones`
- `actividad`

Usos:
- Nueva confirmación sin recargar.
- Dashboard dinámico.
- Contador de campana.
- Actividad reciente.

## 20. Reglas de negocio

1. Un cliente puede tener varios eventos.
2. Un evento puede tener varias invitaciones.
3. La invitación simple no requiere invitados.
4. RSVP puede recibir respuestas públicas.
5. Pases requiere códigos únicos.
6. Una confirmación no supera los lugares asignados.
7. El slug público es único.
8. Invitaciones pausadas o vencidas no aceptan respuestas.
9. El cliente solo ve sus eventos.
10. El invitado nunca entra al panel.
11. Eliminar clientes requiere validar relaciones.
12. Los registros importantes deben usar baja lógica antes que eliminación física.

## 21. Fases de implementación

### A. Base de datos
- Tablas
- Relaciones
- Índices
- Triggers
- RLS
- Políticas
- Funciones RSVP

### B. Autenticación
- Login
- Perfil automático
- Protección `/admin`
- Roles

### C. Migración de módulos
1. Clientes
2. Eventos
3. Invitaciones
4. Invitados
5. Confirmaciones
6. Dashboard
7. Notificaciones

### D. Storage
- Portadas
- Galería
- Música
- Avatares

### E. Portal del cliente
- Login
- Resumen
- Confirmaciones
- Invitados
- Reportes

### F. Editor visual
- Componentes
- Canvas
- Propiedades
- JSON
- Plantillas
- Vista previa
- Publicación

## 22. Decisiones técnicas

- PostgreSQL: Supabase.
- Autenticación: Supabase Auth.
- Archivos: Supabase Storage.
- Tiempo real: Supabase Realtime.
- Aplicación: Next.js.
- Tres modalidades de invitación.
- Diseño visual en JSONB.
- Portal del cliente separado del panel administrador.
- Invitados sin usuario.
- Migración directa desde `localStorage`.

## 23. Próximo entregable

Crear:

```text
supabase/schema-v1.sql
```

Debe incluir:

- Tipos y restricciones.
- Tablas y relaciones.
- Índices.
- Triggers.
- RLS.
- Políticas.
- Funciones RSVP seguras.
- Configuración Realtime.
