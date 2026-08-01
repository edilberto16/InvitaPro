# Aplicar corrección RSVP v2.31.1

Este parche contiene una migración de Supabase. Reemplazar los archivos del proyecto **no actualiza automáticamente la función SQL que ya está desplegada**.

## Opción recomendada: Supabase CLI

Desde la raíz del proyecto:

```bash
supabase db push
```

## Opción manual: SQL Editor

1. Abre Supabase → **SQL Editor**.
2. Copia todo el contenido de:

```text
supabase/migrations/20260801_v2_31_1_rsvp_publico_hotfix.sql
```

3. Ejecuta el script.
4. Vuelve a probar el RSVP público.

## Resultado esperado

La invitación con modalidad histórica `autoservicio` será aceptada como RSVP público y la confirmación aparecerá en `confirmaciones`, el Dashboard y el CRM.
