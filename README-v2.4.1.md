# InvitaPro v2.4.1 — Registro comercial automático

A partir de esta versión, una persona que se registra en `/registro`:

1. Se crea en Supabase Authentication.
2. Se crea su `profile` con rol `cliente`.
3. Se crea automáticamente una ficha en `public.clientes`.
4. Aparece en `/admin/clientes` como **Prospecto**.
5. Si ya existía un cliente manual con el mismo correo, se vincula esa ficha y no se duplica.

La migración también hace backfill de cuentas cliente ya existentes, por lo que `eddy.tomay@gmail.com` debería aparecer automáticamente en Clientes después de ejecutarla.

## Instalar
1. Copia este PATCH sobre tu proyecto.
2. Ejecuta en Supabase SQL Editor:
   `supabase/migrations/20260718_v2_4_1_registro_comercial_automatico.sql`
3. Reinicia `pnpm dev`.
4. Recarga `/admin/clientes`.

## Etapas
- prospecto: se registró pero aún no tiene contratación activa.
- cliente: cuenta vinculada / contratación iniciada.
- cliente_activo: reservado para automatizarlo cuando tenga evento activo/publicado.
