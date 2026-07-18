# InvitaPro v2.4.0 — Activación de clientes

## Qué agrega
- Botón **Dar acceso** en `/admin/clientes`.
- Busca de forma segura una cuenta registrada con el mismo correo.
- Vincula `clientes.user_id` únicamente desde el CMS administrativo.
- El cliente ve automáticamente sus eventos e invitaciones en `/mi-cuenta`.
- Estado **Acceso activo** para clientes ya vinculados.
- La cuenta cliente ya no se auto-vincula por sí sola.

## Instalación
1. Copia el PATCH sobre la raíz de tu proyecto.
2. Ejecuta en Supabase SQL Editor:
   `supabase/migrations/20260718_v2_4_0_activar_clientes.sql`
3. Reinicia `pnpm dev`.

## Prueba recomendada
1. En `/admin/clientes`, crea o edita un cliente usando exactamente el correo de una cuenta `cliente`.
2. Crea un evento para ese cliente y una invitación.
3. Pulsa **Dar acceso** > **Activar Mi InvitaPro**.
4. Cierra sesión del admin.
5. Entra con la cuenta del cliente.
6. `/mi-cuenta` debe mostrar su evento, invitación y estadísticas.

Si la cuenta todavía no existe, el CMS lo indicará. El cliente debe registrarse primero con ese mismo correo.
