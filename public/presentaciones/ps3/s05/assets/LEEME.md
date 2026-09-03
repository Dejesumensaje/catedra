# Assets — Deck S05

El deck `../index.html` referencia estos archivos. Mientras un archivo no exista,
su slide muestra un marcador punteado con el texto alternativo y la navegación no
se rompe.

## El QR

- `qr-por-que-una-experiencia.png` → `/pensamiento-sensorial/por-que-una-experiencia`
  (la consigna de la tarea para la sesión 6: inquietud, verbo, tres posibilidades,
  hipótesis de experiencia y prueba de fuego). Aparece una vez, al cerrar el
  bloque de la tarea, junto al enlace escrito.

Se carga con `data-src`, no con `src`: el deck trae un lazy-loader.

Generado con `CIQRCodeGenerator` de Core Image, corrección `Q` y escala 12. Quedó
**decodificado y verificado** contra su URL con Vision antes de publicarse.

Si se cambia la URL hay que regenerar el QR **y decodificarlo** antes de
proyectar. Un QR que no resuelve es peor que no tener QR.

## Los QR de los casos

Cada slide `slide--case` lleva su QR en la esquina inferior derecha
(`.case-qr`), apuntando al enlace principal del caso —el primero, el amarillo—.
Se generan y se verifican con `scripts/generar-qr.swift` (mismo método de
arriba: corrección Q, escala 12, decodificación con Vision):

- `qr-before-your-eyes.png` → beforeyoureyesgame.com
- `qr-pregoneros.png` → pregonerosdemedellin.com
- `qr-pulsaciones-raras.png` → noticia de Uniandes
- `qr-papers-please.png` → papersplea.se
- `qr-historical-cost-of-light.png` → pudding.cool
- `qr-shutterbug.png`, `qr-hellfiler.png`, `qr-picture-perfect.png`,
  `qr-mrs-modifier.png`, `qr-my-shadows-are-bright.png` → sus páginas en itch.io

## Imágenes de los casos añadidos

- `shutterbug.gif` · imagen social oficial de la página de vividfax en itch.io.
- `hellfiler.png` · imagen social oficial de la página de onefin en itch.io.
- `picture-perfect.gif` · imagen social oficial de la página de Incredulous en itch.io.
- `mrs-modifier.png` · imagen social oficial de la página de Walaber Entertainment en itch.io.
- `my-shadows-are-bright.gif` · imagen social oficial de la página de Buday en itch.io.
- `papers-please-booth.png` · captura oficial de `papersplea.se`.
- `historical-cost-of-light.jpg` · imagen social oficial de The Pudding.
