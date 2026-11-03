# On Point Strategies — Landing

Landing de **On Point Strategies**, agencia de marketing e identidad de marca en Lima.
Hecha con el *Manual de identidad visual v1.0*: paleta 60 / 30 / 10 (papel y blanco / negro / plomo),
Archivo + IBM Plex Mono y el isotipo de mira de precisión.

> Dar en el punto, no cerca del punto.

## Estructura de la página

| # | Sección | Para qué sirve |
| --- | --- | --- |
| — | Hero | Promesa, selector «¿Qué necesitas hoy?» y la órbita animada (estrategia, identidad, campañas) |
| 01 | Enfoque | Estrategia primero; después, la pieza (Pensar · Crear · Medir) |
| 02 | Servicios y precios | Carta de 5 servicios con filtro por objetivo y la mira (Imagen · Captación · Crecimiento) |
| 03 | Cómo trabajamos | Descubrir · Enfocar · Ejecutar · Mejorar |
| 04 | Identidad de marca | El librito de 16 páginas de nuestra propia marca, que se hojea como un libro |
| 05 | Cada servicio, a detalle | Pestañas con ilustración y tiempos: tarjetas, kit digital, captación y crecimiento |
| 06 | Para quién | Negocios locales, profesionales independientes y marcas en crecimiento |
| 07 | Preguntas frecuentes | Sin letra pequeña |
| 08 | Contacto | Formulario con tipo de negocio que abre WhatsApp (o Instagram) con el mensaje listo |

## Precios publicados

| Servicio | Precio |
| --- | --- |
| Tarjetas de presentación (evaluación + diseño + 1,000 impresas + envío en Lima) | S/179 |
| Kit comercial digital (creación de redes y WhatsApp Business) | S/449 |
| Identidad de marca | aprox. S/890 – 1,490 |
| Captación de clientes (incluye S/400 de anuncios) | S/1,190 al mes |
| Crecimiento comercial (incluye S/600 de anuncios) | S/1,890 al mes |

## Archivos

```
index.html        estructura y contenido
styles.css        estilos con la identidad del manual
script.js         configuración, menú, formulario y medición
assets/
  brand/          logos SVG (horizontal, vertical, isotipos, favicon) con el texto en trazos
  fonts/          Archivo e IBM Plex Mono (OFL), alojadas aquí: no dependen de Google Fonts
  img/            og-image.jpg (vista previa al compartir) y apple-touch-icon.png
.nojekyll
```

## Configuración rápida

Todo lo editable está al inicio de `script.js`, en el bloque `CONFIG`:

| Campo | Para qué sirve |
| --- | --- |
| `whatsapp` | Número comercial con código de país, solo dígitos (Perú: `51` + 9 dígitos). Si se llena, el formulario abre WhatsApp con el mensaje y aparece el botón flotante. |
| `instagram` / `instagramHandle` | Respaldo del formulario mientras no haya WhatsApp. |
| `email` | Correo de contacto opcional para el footer. |
| `metaPixelId` / `ga4Id` | Medición opcional. El envío del formulario se registra como `Lead` / `generate_lead`. |

## Publicar con GitHub Pages

1. **Settings → Pages → Source:** *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
2. La página queda en `https://fabricioonpoint-bot.github.io/onpoint-strategies/`.
3. Si se usa un dominio propio, añadir un archivo `CNAME` y cambiar la URL en `canonical`, `og:url`, `og:image` y el bloque JSON-LD de `index.html`.

## Caché

`index.html` carga `styles.css`, `script.js` y las imágenes con `?v=N`. Cuando cambies alguno, sube ese número.

## Logos

Los SVG de `assets/brand` se generaron con la geometría del manual (anillo Ø 64 u, trazo 7 u, punto Ø 21 u,
tic 10 × 3 u) y el texto convertido a trazos. Si tienes los archivos vectoriales originales del manual
(`ops-logo-horizontal.svg`, etc.), reemplázalos con el mismo nombre.
