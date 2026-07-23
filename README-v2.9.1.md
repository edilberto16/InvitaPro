# InvitaPro v2.9.1 — Completar Planes y precios sobre Actual(18)

Revisé `InvitaPro-Actual(18).zip`.

Ya contiene la funcionalidad de v2.9.0:
- `Admin → Planes`
- edición de precios;
- límites y funciones por plan;
- `Admin → Ventas` con ticket promedio y pipeline;
- menú `Planes`;
- tablas `planes_comerciales` y `ventas_invitaciones`.

Lo que faltaba en el ZIP actual eran los estilos del módulo `Planes y precios`.

Este PATCH agrega únicamente esos estilos sin tocar las correcciones visuales v2.8.5–v2.8.7.

Archivo modificado:
- `app/admin/activation-v2.7.1.css`

No requiere SQL nuevo si ya ejecutaste la migración v2.8.0.
