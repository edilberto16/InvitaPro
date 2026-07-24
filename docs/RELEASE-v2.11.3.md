# InvitaPro v2.11.3 — Biblioteca de Bloques PRO

## Incluye

### Biblioteca de bloques por categorías
- Todas
- Evento
- Multimedia
- Invitados
- Premium

### Nuevos bloques
- Personas especiales
- Hashtag y redes
- Buzón de deseos
- Álbum colaborativo QR / subida de fotos

### Buzón de deseos
- Formulario público.
- Mensajes guardados en `mensajes_deseos`.
- No se publican automáticamente.
- Solo propietario/admin puede consultarlos mediante RLS.

### Álbum colaborativo
- Invitados pueden subir fotografías desde la invitación publicada.
- Bucket `guest-album` PRIVADO.
- Archivos separados por `invitacion_id`.
- Metadatos en `album_colaborativo_fotos`.
- Solo propietario/admin puede leer los archivos mediante políticas de Storage.
- No utiliza la Biblioteca privada normal del cliente.

## Importante
Ejecutar una sola vez:

`supabase/migrations/20260723_v2_11_3_block_library_pro.sql`

## Prueba sugerida
1. Studio → Estructura → Biblioteca de bloques.
2. Activar Personas especiales, Hashtag, Buzón de deseos y Álbum.
3. Completar contenido y guardar.
4. Publicar o abrir una invitación ya publicada.
5. Enviar un deseo.
6. Subir una fotografía.
7. Verificar en Supabase que se creen:
   - `mensajes_deseos`
   - `album_colaborativo_fotos`
   - objetos en bucket privado `guest-album`

## Seguridad
El bucket del álbum colaborativo se crea como privado. No se generan URLs públicas para fotografías de invitados.
