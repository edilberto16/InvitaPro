<div align="center">

# 💌 InvitaPro

### Plataforma para crear, administrar y publicar invitaciones digitales profesionales

Studio visual · Plantillas · RSVP · Invitados · Álbum · Check-in · WhatsApp

![Version](https://img.shields.io/badge/version-v2.20.0-72264f)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)
![License](https://img.shields.io/badge/license-Private-red)

</div>

## Descripción

InvitaPro es una plataforma web para diseñar y administrar invitaciones digitales. Incluye un Studio visual basado en bloques, catálogo de plantillas, gestión de invitados, confirmaciones RSVP y herramientas para publicar y compartir eventos.

El proyecto está pensado para bodas, XV años, cumpleaños, campamentos, retiros, graduaciones, eventos empresariales y otras celebraciones.

## Funciones principales

### Studio visual

- Biblioteca de bloques con búsqueda y categorías.
- Ordenamiento de secciones mediante drag and drop.
- Vista previa para móvil, tableta y escritorio.
- Zoom y modo enfoque.
- Panel contextual para editar, mover, ocultar y cambiar variantes.
- Guardado automático y sincronización con la vista previa.
- Cambio de plantilla desde el Studio.

### Invitaciones

- Catálogo de plantillas y colecciones.
- Portada, introducción y cuenta regresiva.
- Ubicación y mapas.
- Itinerario, dress code e historia.
- Galería, video y música.
- Hospedaje y mesa de regalos.
- FAQ, personas especiales, hashtag y buzón de deseos.
- Álbum colaborativo y confirmación RSVP.

### Administración

- Gestión de eventos, invitaciones y clientes.
- Administración de invitados y confirmaciones.
- Catálogo de plantillas y biblioteca multimedia.
- Planes comerciales y solicitudes de activación.
- Herramientas de check-in y álbum.

## Tecnologías

- Next.js 15 con App Router.
- React 19.
- TypeScript 5.
- Supabase para autenticación, datos y almacenamiento.
- CSS del proyecto para la interfaz y las plantillas.
- pnpm como gestor de paquetes.

## Requisitos

- Node.js 22.x.
- pnpm 11.13.1 o compatible.
- Proyecto de Supabase configurado.

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd InvitaPro
pnpm install
```

Crea un archivo `.env.local` con las variables utilizadas por tu entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Inicia el entorno de desarrollo:

```bash
pnpm run dev
```

Abre `http://localhost:3000` en el navegador.

## Scripts disponibles

```bash
pnpm run dev      # Entorno de desarrollo
pnpm run build    # Compilación de producción
pnpm run start    # Servidor de producción
pnpm run lint     # Validación de lint
```

## Estructura principal

```text
app/
├── admin/                  Panel administrativo
├── api/                    Rutas de servidor
├── invitacion/[slug]/      Invitación pública
├── mi-cuenta/              Portal del cliente
│   └── studio/[id]/        Editor visual
└── preview/                Vistas previas de plantillas

components/
├── admin/
├── editor/
├── marketing/
├── media/
└── templates/

lib/
├── studio/                 Registro y configuración de bloques
├── supabase/               Clientes de Supabase
├── template-catalog.ts     Catálogo maestro
├── template-engine.ts      Orden y motor de secciones
└── theme-studio.ts         Configuración visual del Studio
```

## Motor de bloques del Studio

Desde la versión 2.20.0, la metadata de los bloques se concentra en:

```text
lib/studio/block-registry.ts
```

Cada definición registra:

- identificador del bloque;
- nombre, descripción e icono;
- categoría;
- editor asociado;
- variantes visuales;
- reglas como bloqueo o disponibilidad.

Esto evita duplicar configuraciones dentro de la página principal del Studio y prepara la arquitectura para componentes reutilizables, edición inline y nuevos bloques.

## Validación antes de subir cambios

```bash
pnpm install
pnpm run build
pnpm run lint
git status
```

También se recomienda probar manualmente:

1. Abrir una invitación en el Studio.
2. Cambiar de plantilla y comprobar la vista previa.
3. Agregar, mover, ocultar y editar bloques.
4. Guardar y recargar para confirmar persistencia.
5. Abrir la invitación publicada en móvil y escritorio.

## Flujo Git sugerido

```bash
git checkout -b feature/nombre-del-cambio
pnpm run build
git add .
git commit -m "Descripción del cambio"
git push origin feature/nombre-del-cambio
```

## Versionado y cambios

El historial se mantiene únicamente en [`CHANGELOG.md`](./CHANGELOG.md). No deben crearse nuevos archivos `CAMBIOS-vX.Y.Z.md`.

El proyecto utiliza versionado semántico cuando corresponde:

- `MAJOR`: cambios incompatibles o rediseños estructurales.
- `MINOR`: nuevas funciones compatibles.
- `PATCH`: correcciones y ajustes menores.

## Roadmap

- [x] Catálogo maestro de plantillas.
- [x] Biblioteca visual de bloques.
- [x] Sincronización Studio–vista previa.
- [x] Registro central de bloques.
- [ ] Componentes de bloque desacoplados.
- [ ] Edición inline.
- [ ] Temas globales por plantilla.
- [ ] Historial visual de cambios.
- [ ] Notificaciones push de RSVP.
- [ ] Check-in QR en tiempo real.
- [ ] Marketplace de plantillas y bloques.

## Seguridad

- No subas `.env.local` ni claves privadas al repositorio.
- Mantén `SUPABASE_SERVICE_ROLE_KEY` únicamente en el servidor.
- Revisa las políticas RLS de Supabase antes de desplegar cambios de datos.
- Valida permisos del cliente y del administrador en cualquier ruta nueva.

## Licencia

Proyecto privado. Todos los derechos reservados © InvitaPro.
