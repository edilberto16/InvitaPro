# InvitaPro v2.3.2 — Acceso y recuperación de cuenta

Incluye:
- Mensajes de login en español.
- ¿Olvidaste tu contraseña?
- /recuperar-contrasena
- /restablecer-contrasena
- Flujo con Supabase Auth.

En Supabase > Authentication > URL Configuration agrega como Redirect URLs:
- http://localhost:3000/restablecer-contrasena
- https://TU-DOMINIO/restablecer-contrasena

No requiere SQL adicional.
