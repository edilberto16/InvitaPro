# InvitaPro v2.11.2 — Bloques Premium Modulares

## Nuevos bloques opcionales

- Nuestra historia
- Hospedaje
- Mesa de regalos
- Video
- Preguntas frecuentes

## Qué cambia

- Los nuevos bloques forman parte real de `section_order`.
- Nacen ocultos en invitaciones existentes para no alterar diseños publicados.
- Se activan desde **Studio → Estructura → Agregar sección**.
- Se pueden reordenar con drag & drop.
- Cada bloque tiene su editor dentro del Studio.
- El render público ya muestra los nuevos bloques respetando el orden elegido.
- YouTube, Vimeo y video directo son compatibles en el bloque Video.
- No requiere migración SQL; el contenido se guarda dentro de `design_json`.

## Seguridad de compatibilidad

Las invitaciones existentes no mostrarán automáticamente estos bloques.
Solo aparecen cuando `mostrar_historia`, `mostrar_hospedaje`, `mostrar_regalos`, `mostrar_video` o `mostrar_faq` están activados.

## Próximo paso recomendado

v2.11.3:
- biblioteca de bloques con categorías,
- presets por tipo de evento,
- duplicar bloques compatibles,
- edición de estilo por bloque.
