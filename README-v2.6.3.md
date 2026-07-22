# InvitaPro v2.6.3 — Ciclo de vida automático del evento

## Flujo
Borrador → Confirmado → Finalizado

## Comportamiento
- Un evento `confirmado` pasa a `finalizado` cuando su fecha ya quedó en el pasado.
- Se conserva todo el día del evento como ventana de gracia; finaliza desde el día siguiente.
- Mi InvitaPro sincroniza automáticamente el estado al entrar.
- El CMS de Eventos también sincroniza al cargar.
- La invitación pública detecta una fecha pasada aunque la BD todavía no se haya sincronizado.
- RSVP queda oculto/cerrado para eventos finalizados.
- La cuenta regresiva cambia a `Evento finalizado`.
- La invitación sigue visible como recuerdo.
- Mi InvitaPro muestra un mensaje de evento concluido.

## Instalación
1. Copia el PATCH sobre el proyecto.
2. Ejecuta en Supabase:
   `supabase/migrations/20260718_v2_6_3_ciclo_vida_eventos.sql`
3. Ejecuta:
   `pnpm run build`
4. Reinicia:
   `pnpm dev`

## Prueba rápida
Cambia temporalmente un evento confirmado a una fecha de ayer y abre:
- `/mi-cuenta`
- `/admin/eventos`
- su invitación pública/preview

Debe aparecer como Finalizado y no mostrar RSVP.
