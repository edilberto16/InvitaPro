# Modelo de datos inicial de InvitaPro

## Relación principal

```text
Cliente 1 ─── N Evento 1 ─── 1 Invitación 1 ─── N Invitado 1 ─── N Confirmación
```

## Cliente

- `id`
- `nombre`
- `telefono`
- `correo`
- `notas`
- `creado_en`
- `actualizado_en`

## Evento

- `id`
- `cliente_id`
- `nombre`
- `tipo`
- `fecha`
- `hora`
- `lugar`
- `direccion`
- `mapa_url`
- `estado`

## Invitación

- `id`
- `evento_id`
- `slug`
- `plantilla_id`
- `estado`
- `configuracion_json`
- `publicada_en`

## Invitado

- `id`
- `invitacion_id`
- `nombre`
- `telefono`
- `adultos_permitidos`
- `ninos_permitidos`
- `codigo_acceso`
- `mesa`

## Confirmación

- `id`
- `invitado_id`
- `asistira`
- `adultos_confirmados`
- `ninos_confirmados`
- `mensaje`
- `confirmado_en`

## Etapa actual

El módulo Clientes v0.3.0 guarda información en `localStorage` para validar la interfaz y el flujo de trabajo sin instalar todavía una base de datos. En la siguiente etapa se sustituirá esta capa por PostgreSQL/Supabase manteniendo la misma interfaz.


### Evento
- id
- clienteId
- nombre
- tipo
- fecha
- hora
- lugar
- direccion
- estado: borrador | confirmado | finalizado
- notas
- creadoEn

Relación: un Cliente puede tener muchos Eventos. En v0.4.0 se almacena localmente; posteriormente se migrará a PostgreSQL.

## Invitado / Pase (v0.6.0)

- `id`: identificador único.
- `invitacionId`: invitación a la que pertenece.
- `nombre`: persona, pareja o familia invitada.
- `telefono`, `correo`: datos opcionales de contacto.
- `adultos`, `ninos`: cantidad máxima de pases asignados.
- `mesa`: mesa asignada, opcional.
- `codigo`: token único usado en el enlace personalizado.
- `estado`: pendiente, confirmado o declinado.
- `notas`: información interna.
- `creadoEn`: fecha de alta.
