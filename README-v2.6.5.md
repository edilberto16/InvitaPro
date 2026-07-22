# InvitaPro v2.6.5 — Modal visual para cambio de plantilla

## Mejora
Reemplaza el `window.confirm()` del navegador por un modal propio de InvitaPro.

Muestra:
- Vista previa visual de la plantilla.
- Categoría de origen.
- Aviso si pertenece a otra categoría.
- Lista de datos que se conservarán.
- Botón `Aplicar <plantilla>`.
- Estado `Aplicando…`.
- Toast `Plantilla aplicada ✓`.

No requiere SQL.

## Instalación
1. Copia el PATCH sobre tu proyecto.
2. Ejecuta `pnpm run build`.
3. Ejecuta `pnpm dev`.
4. Prueba: Mi InvitaPro → Continuar editando → Cambiar plantilla → Aplicar.
