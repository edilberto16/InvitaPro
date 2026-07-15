# InvitaPro

InvitaPro es una plataforma para crear y administrar invitaciones digitales, eventos, invitados y confirmaciones RSVP.

## Arquitectura actual

- Next.js
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase Realtime
- Supabase Storage

Supabase es la única fuente operativa de datos. Los módulos administrativos ya no dependen de `localStorage`.

## Configuración local

1. Instala las dependencias:

```powershell
npm install
```

2. Crea `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_LLAVE_PUBLICABLE
```

3. Inicia el proyecto:

```powershell
npm run dev
```

4. Abre:

```text
http://localhost:3000/login
```

## Módulos conectados a Supabase

- Dashboard
- Clientes
- Eventos
- Invitaciones
- Plantillas
- Invitados y pases
- Confirmaciones
- Notificaciones
- Invitación pública
- RSVP

## Base de datos

El esquema definitivo se encuentra en:

```text
supabase/schema-v1.sql
```

No debes ejecutar nuevamente el esquema sobre una base que ya contiene datos sin revisar previamente los cambios.


## Contenido de demostración

El proyecto incluye recursos locales para preparar demostraciones rápidas:

```text
public/demo/
├── portada-boda.jpg
├── galeria/
│   ├── foto1.jpg
│   └── ... foto8.jpg
└── music/
    └── romantic-demo.mp3
```

En el constructor de invitaciones, usa el botón **Usar contenido demo** para cargar estos recursos.
