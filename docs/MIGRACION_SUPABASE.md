# Migración inicial a Supabase

## Objetivo de v0.9.0

Esta versión crea la infraestructura de Supabase y transfiere los datos existentes de `localStorage`. Las pantallas administrativas todavía conservan temporalmente su lógica local; se reemplazarán módulo por módulo después de comprobar la integridad de los datos.

## Configuración

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**, pega todo el contenido de `supabase/schema.sql` y ejecútalo.
3. En **Authentication > Users**, crea un usuario con correo y contraseña.
4. En **Project Settings > API**, copia la URL y la llave publicable.
5. Copia `.env.example` como `.env.local` y reemplaza los valores.
6. Reinicia el servidor de Next.js.
7. Entra a `/login`.
8. Abre `/admin/migracion`, comprueba la conexión y ejecuta la migración.

## Seguridad

- La llave publicable puede usarse en el navegador porque las tablas están protegidas mediante Row Level Security.
- Nunca coloques la `service_role` en variables `NEXT_PUBLIC_*`.
- Los datos locales no se borran durante esta primera migración.

## Próxima fase

Después de validar las tablas, se reemplazará `localStorage` en este orden:

1. Clientes.
2. Eventos.
3. Invitaciones.
4. Invitados.
5. Confirmaciones y Realtime.
