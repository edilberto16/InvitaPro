# InvitaPro v2.5.1 HOTFIX

Corrige:
1. Error `plantilla_id uuid` vs `text`.
   - Agrega `template_key text`.
   - Mantiene `plantilla_id` UUID intacto.
2. Vista previa del paso 2.
   - Ya no abre el catálogo general de Inspiración.
   - Abre una vista dedicada únicamente a la plantilla elegida.
3. Logo visible en el flujo de autoservicio.

## Instalar
1. Copia el PATCH sobre el proyecto.
2. Ejecuta:
   supabase/migrations/20260718_v2_5_1_template_key_hotfix.sql
3. Ejecuta:
   pnpm run build
4. Reinicia:
   pnpm dev
