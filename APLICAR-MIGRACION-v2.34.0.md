# Aplicar migración v2.34.0 — Centro de Mensajes

Esta versión añade la columna `destacado` al Buzón de deseos.

## Opción 1 — Supabase CLI

```bash
supabase db push
```

## Opción 2 — SQL Editor

Abre Supabase → SQL Editor y ejecuta el contenido de:

```text
supabase/migrations/20260801_v2_34_0_centro_mensajes.sql
```

Después recarga **Mi InvitaPro**. Los mensajes existentes se conservarán y aparecerán como no destacados.
