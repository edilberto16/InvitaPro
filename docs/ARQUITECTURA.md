# Arquitectura de InvitaPro

## Objetivo

InvitaPro es un sistema web para crear, administrar y publicar invitaciones digitales para eventos.

## Primera versión

La primera versión será administrada por un solo usuario y tendrá:

- Panel administrativo.
- Clientes.
- Invitaciones.
- Plantillas.
- Confirmaciones de asistencia.
- Página pública por invitación.

## Tecnologías

- Next.js y TypeScript.
- CSS modular/global en la etapa inicial.
- PostgreSQL mediante Supabase en producción.
- Supabase Auth para autenticación.
- Supabase Storage para imágenes y audio.
- GitHub para control de versiones.
- Vercel para despliegue futuro.

## Flujo principal

1. El administrador inicia sesión.
2. Crea o selecciona un cliente.
3. Crea una invitación.
4. Captura datos, imágenes, música y ubicación.
5. Revisa la vista previa.
6. Publica la invitación.
7. Consulta las confirmaciones de asistencia.

## Principios

- Empezar con un MVP pequeño y funcional.
- Mantener separadas la administración y la página pública.
- No guardar secretos en GitHub.
- Versionar cambios importantes.
- Diseñar primero para celular.
