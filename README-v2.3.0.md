# InvitaPro v2.3.0 — Cuentas de clientes + Mi InvitaPro

1. Copia este PATCH sobre la raíz del proyecto.
2. Ejecuta `supabase/migrations/20260718_v2_3_0_client_portal.sql` en Supabase SQL Editor.
3. `pnpm run build`
4. Prueba `/registro`, `/login` y `/mi-cuenta`.

Para vincular un cliente existente automáticamente, su correo en `clientes.correo` debe coincidir con el correo de su cuenta. La función SQL `vincular_mi_cuenta_cliente()` está preparada para ese flujo; la activación administrativa se añadirá en el siguiente patch comercial.
