# InvitaPro v2.11.1 — Block Builder Interactivo

## Mejoras

- Drag & drop real para reordenar bloques desde Studio.
- Controles ↑/↓ conservados como alternativa accesible.
- Nueva acción **Agregar sección** para recuperar bloques ocultos.
- El contenido de una sección no se elimina al ocultarla.
- Portada protegida como bloque esencial.
- Persistencia sobre `design_json.section_order` y flags `mostrar_*`.
- Sin migración SQL nueva.

## Flujo de prueba

1. Abrir Mi Cuenta → Studio.
2. Entrar a **Estructura**.
3. Arrastrar Galería por encima de Itinerario.
4. Ocultar Ubicación.
5. Abrir **Agregar sección** y volver a agregar Ubicación.
6. Guardar cambios.
7. Abrir Vista previa y validar el orden público.

## Base

Construido sobre `InvitaPro-Actual(20)` + v2.11.0 Block Builder Core.
