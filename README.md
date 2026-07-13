# InvitaPro Starter

Primera versión de un sistema para crear invitaciones digitales.

## Incluye

- Página de inicio.
- Panel administrativo de demostración.
- Formulario para crear una invitación.
- API de validación inicial.
- Invitación pública adaptable a celular.
- Cuenta regresiva y confirmación por WhatsApp.
- Esquema SQL para Supabase con políticas RLS.

## Ejecutar localmente

1. Instala Node.js 20 o superior.
2. Abre una terminal dentro de esta carpeta.
3. Ejecuta:

```bash
npm install
npm run dev
```

4. Abre `http://localhost:3000`.

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Abre SQL Editor y ejecuta `supabase/schema.sql`.
3. Copia `.env.example` como `.env.local`.
4. Coloca la URL y las claves de tu proyecto.

## Estado actual

El diseño y flujo principal ya funcionan como demostración. El formulario valida los datos mediante una API, pero todavía no inserta registros en Supabase. La siguiente etapa es conectar autenticación, almacenamiento y CRUD real.
