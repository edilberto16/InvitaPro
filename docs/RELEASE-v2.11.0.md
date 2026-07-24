# InvitaPro v2.11.0 — Block Builder Core

Esta versión añade la primera base modular del Studio del cliente.

## Incluye

- Nuevo panel **Estructura** dentro de Mi InvitaPro Studio.
- Orden configurable de los bloques públicos con controles subir/bajar.
- Activar u ocultar bloques compatibles.
- Portada bloqueada como sección esencial.
- Persistencia en `design_json.section_order`.
- Persistencia de visibilidad mediante los campos `mostrar_*` ya compatibles con el render público.
- Sincronización entre la visibilidad del editor tradicional y el nuevo Block Builder.
- Compatible con el render público existente, que ya usa `section_order`.

## Bloques administrables

- Portada
- Introducción
- Cuenta regresiva
- Detalles del evento
- Itinerario
- Galería
- Ubicación
- RSVP

## Base preparada para próximas versiones

- Drag & drop
- Bloques duplicables
- Nuevos tipos de sección
- Presets por tipo de evento
- Studio Pro visual

## Base usada

InvitaPro-Actual(20)

## Validación

No se pudo ejecutar `pnpm install` / `tsc` en el entorno de generación porque el registro npm no estaba accesible desde el contenedor. Ejecuta localmente:

```powershell
pnpm install
pnpm run build
```

antes de hacer push a Git.
