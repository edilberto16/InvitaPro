# CRUD completo con Supabase

InvitaPro utiliza Supabase como fuente única de información.

Los siguientes módulos realizan operaciones directas contra PostgreSQL:

- Clientes
- Eventos
- Invitaciones
- Plantillas
- Invitados
- Confirmaciones
- Notificaciones

Cada alta, edición o eliminación se refleja inmediatamente en Supabase.

## Seguridad

- Las rutas administrativas requieren autenticación.
- Row Level Security limita el acceso por usuario.
- Las invitaciones públicas y RSVP utilizan funciones seguras.
- La llave secreta de Supabase nunca debe exponerse en el navegador.

## Realtime

Las confirmaciones, notificaciones y actividad pueden actualizar el panel sin recargar la página.
