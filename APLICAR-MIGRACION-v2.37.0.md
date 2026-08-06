# Aplicar migración v2.37.0

Esta versión crea el bucket público `avatars` y sus políticas de acceso.

## Supabase CLI

```bash
supabase db push
```

## SQL Editor

Ejecuta el archivo:

```text
supabase/migrations/20260805_v2_37_0_perfil_avatar.sql
```

La eliminación de cuentas desde Admin requiere la variable de servidor:

```env
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

Configúrala localmente y también en Vercel. Nunca la expongas con prefijo `NEXT_PUBLIC_`.
