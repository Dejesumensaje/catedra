# Assets — Deck S03

El deck `../index.html` referencia estos archivos. Basta con soltarlos en esta
carpeta con el nombre exacto; no hay que tocar el HTML.

Mientras un archivo no exista, su slide muestra un marcador punteado con el
texto alternativo y la navegación no se rompe.

## Los QR — dos en el deck

Las consignas viven en el sitio y el deck solo las apunta. Ningún deck repite
una consigna que ya está publicada.

- `qr-imagen-del-sistema.svg` → `/pensamiento-sensorial/imagen-del-sistema`
  (la actividad: las dos fichas, el protocolo de la prueba y el entregable).
  Va inmediatamente después de la pauta de la investigación, cuando los grupos
  ya saben qué van a hacer y necesitan las fichas en la mano.
- `qr-tarea-suponiendo.svg` → `/pensamiento-sensorial/que-estamos-suponiendo`
  (la tarea, en sus dos partes). Va al final, después del par que la resume.

Se generan con `qrcode` (Python), `box_size=12`, `border=2`, corrección M, que
es la misma receta del deck s02. Si una ruta cambia, hay que regenerar el SVG:
un QR viejo no avisa que está roto.

## Imágenes — ninguna, y es a propósito

Este deck no depende de ningún archivo de imagen. Los dos diagramas son SVG
inline con su variante `.diagram-mobile`, y las tres palabras —wireframe,
mockup, prototipo— van en una `rejilla--3` de texto y no en una lámina.

La versión de trabajo traía un slide con `wmp-domicilios.png`: la misma pantalla
de una app de domicilios en tres niveles. Se cambió por la rejilla porque el
archivo no existía y porque las tres palabras necesitan definición, no ejemplo.
Si alguna vez se hace esa lámina, va **antes** de la rejilla, muda, y la rejilla
se queda: primero se ve la diferencia, después se nombra.

## GIFs

El único es el de espera, que va por URL de Giphy como en los decks anteriores.
El slide de receso es un divisor de texto; si se quiere un GIF ahí, el archivo
sería `gif-receso.gif` y habría que agregarle el slide.

## Los dos slides de QR no se pueden mover sin pensarlo

El de la actividad tiene que ir **después** de la pauta 01–04 y **antes** de que
los grupos empiecen: la página trae las fichas y el protocolo de la prueba, y sin
eso la actividad no arranca.

El de la tarea va al final, después del par que la resume. Ahí ya se explicó de
qué se trata; el QR solo recoge.
