# Aplicar migración v2.36.2

Esta versión sincroniza el estado RSVP con la ficha CRM y protege los límites de pases importados por CSV.

## Supabase CLI

```bash
supabase db push
```

## SQL Editor

Ejecuta el contenido de:

```text
supabase/migrations/20260805_v2_36_2_limites_pases_crm.sql
```

Después prueba con un invitado importado: una respuesta con el mismo teléfono debe actualizar su estado y no debe aceptar más adultos o niños que los asignados.
