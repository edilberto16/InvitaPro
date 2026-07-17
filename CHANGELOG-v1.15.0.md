# InvitaPro v1.15.0

- Flujo de estados: borrador, publicada, pausada, vencida y archivada.
- Acciones de publicar, pausar y archivar desde el editor y el listado.
- Enlace privado de revisión para clientes, con opciones para copiar, abrir, regenerar y desactivar.
- Ruta `/revision/[token]` y banner diferenciado para revisión privada.
- El enlace público continúa disponible únicamente mediante la función pública existente.

## Requisito
Ejecutar `supabase/migrations/20260717_v1_15_0_publicacion_revision.sql` en el SQL Editor de Supabase antes de usar los enlaces de revisión.
