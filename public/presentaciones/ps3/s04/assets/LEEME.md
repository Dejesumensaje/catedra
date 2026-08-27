# Assets — Deck S04

El deck `../index.html` referencia estos archivos. Basta con soltarlos en esta
carpeta con el nombre exacto; no hay que tocar el HTML.

Mientras un archivo no exista, su slide muestra un marcador punteado con el
texto alternativo y la navegación no se rompe.

## Este deck no tiene imágenes, y tiene nueve diagramas

A propósito. La única imagen externa es el GIF de espera, que va por URL de
Giphy con el **mismo ID que ya se usó en s03** (`JIX9t2j0ZTN9S`): está
verificado en producción y no se inventan IDs.

El trabajo visual lo hacen **nueve SVG inline**, cada uno con su
`.diagram-mobile`. En orden: los tres modelos, el bucle persona-interfaz-sistema
con sus cinco preguntas, la matriz de cuatro interfaces sin pantalla, las tres
secuencias de verbos, la lente espacio/tiempo/cuerpo, «Pon eso ahí», el
vocabulario de interacción de la actividad, la hoja del paso 02 y las capas de
conocimiento de Sanders.

La prueba de cada diagrama es la misma: **si el profesor no puede señalar una
parte y hacer una pregunta sin explicar nada antes, el diagrama no está
haciendo su trabajo.** Si alguno se reemplaza, hay que conservar esa propiedad y
su variante móvil.

Si en una versión futura se quiere ilustrar «¿Dónde está la interfaz aquí?», los
tres casos ya están enlazados desde sus slides: *Body Movies*, *Wooden Mirror* y
*Chants of Sennaar*. Irían como imagen sola, sin texto, **antes** del slide de
preguntas de cada uno — nunca después.

## Los tres videos

Cada uno de los tres casos de «¿Dónde está la interfaz aquí?» tiene ahora su
video, en su propia diapositiva, después de la oración que lo presenta y antes
de las preguntas.

| Caso | Fuente | Cómo va montado |
|---|---|---|
| *Body Movies* | mp4 del sitio de Lozano-Hemmer | `<video>` con dos `<source>` |
| Espejos de Rozin | WIRED, canal oficial | iframe de YouTube |
| *Chants of Sennaar* | Focus Entertainment, el editor | iframe de YouTube |

**Tres cosas que hay que saber antes de proyectar:**

1. **Los embebidos de YouTube solo funcionan si el deck se sirve.** Abierto como
   archivo (doble clic en `index.html`) YouTube devuelve «Error 153». Para la
   clase: `npm run preview` y abrirlo por `http://localhost:…`, o usarlo desde el
   sitio publicado. El enlace de crédito debajo de cada video es el respaldo: si
   el iframe no carga, un clic abre el video en otra pestaña.
2. **El video de Body Movies se transmite desde el servidor del artista.** Si la
   red del salón no es de fiar, basta con dejar el archivo en
   `assets/bodymovies-lisboa.mp4`: el `<video>` lo prefiere y solo cae a la URL
   remota si no existe. Está en `.gitignore` a propósito — es del artista, se usa
   en clase y no se republica desde el sitio.
3. **El audio se corta solo al cambiar de diapositiva.** El iframe se monta al
   entrar y se desmonta al salir, y los `<video>` se pausan. Sin eso, un tráiler
   sigue sonando encima del bloque siguiente.

Los iframes van con `data-src`, no con `src`: así el deck no abre dos
reproductores de YouTube al arrancar.

## Los QR — dos en el deck

Las consignas viven en el sitio y el deck solo las apunta. Ningún deck repite
una consigna que ya está publicada.

- `qr-pedir-sin-mirar.svg` → `/pensamiento-sensorial/pedir-sin-mirar`
  (el brief de la actividad: hallazgos, escenario, vocabulario de interacción
  verificado, los cuatro pasos, la hoja del paso 02 y los tiempos)
- `qr-tres-experiencias.svg` → `/pensamiento-sensorial/tres-experiencias`
  (la tarea para la sesión 5: las siete preguntas con su ejemplo bueno y su
  ejemplo malo)

Los dos se cargan con `data-src`, no con `src`: el deck trae un lazy-loader.

Generados con la librería `qrcode` de Python, `SvgPathImage`, `box_size=12`,
`border=2` y `error_correction=ERROR_CORRECT_Q` — los mismos parámetros de s03.
Ambos salieron en versión 6 y quedaron **decodificados y verificados** contra su
URL antes de publicarse (rasterizados a PNG y leídos con `cv2.QRCodeDetector`).
Para rehacer uno:

```python
import qrcode, qrcode.image.svg
q = qrcode.QRCode(box_size=12, border=2,
                  error_correction=qrcode.constants.ERROR_CORRECT_Q,
                  image_factory=qrcode.image.svg.SvgPathImage)
q.add_data('https://catedra.dejesumensaje.com/pensamiento-sensorial/pedir-sin-mirar')
q.make(fit=True)
q.make_image().save('qr-pedir-sin-mirar.svg')
```

Si se cambia una URL hay que regenerar el QR **y decodificarlo** antes de
proyectar. Un QR que no resuelve es peor que no tener QR: treinta personas
apuntando el teléfono a una pared.

## Lo que no se puede mover

**Los cinco nombres (9) van antes de la revelación (10), y solos.** Si la
revelación cae en la misma diapositiva no hay pausa, y esa pausa es todo el
efecto.

**Las tres `slide--cita`** llevan las definiciones de interfaz, modalidad y
sistema multimodal, completas y sin fragmentar. Son los términos que el curso
sigue usando y el estudiante tiene que poder copiarlos del proyector.

**La definición de interfaz va antes de la matriz de los cuatro casos.** Los
cuatro ejemplos están escritos contra los verbos de esa definición; leídos sin
ella son cuatro anécdotas.

**La restricción de los gestos de cabeza (54) se queda.** Los AirPods solo los
reconocen respondiendo a un anuncio de Siri, así que usarlos obliga a que el
sistema hable primero. Es una restricción real, verificada, y es el mejor
material de discusión del ejercicio: decide quién abre la interacción.

## La tira de componentes (diapositiva 25)

No es una imagen: son seis controles HTML de verdad —botón, botón desactivado,
slider, enlace, campo de texto y tarjeta arrastrable— con sus cursores y sus
estados de hover. La diapositiva afirma que las convenciones visuales se aprenden
mirando; proyectarla sin mostrarlas era pedir un acto de fe.

Dos cosas del deck la sostienen y no se pueden romper:

- El manejador de clic **ignora todo lo que esté dentro de `.demo`**, para que
  tocar un control no pase de diapositiva.
- El manejador de teclado **se desactiva cuando el foco está en un `input`**, para
  que escribir un espacio en el campo no avance. Sin eso, escribir «sin sal»
  salta de página en la primera palabra.

Si se agregan más componentes interactivos, van dentro de `.demo`.

## Verificación de hardware

Las capacidades que el deck ofrece como material de la actividad se comprobaron
en `support.apple.com` antes de publicarse. Lo que hay que conservar si esto se
actualiza:

- **Doble toque** — Apple Watch Series 9, SE 3, Ultra 2 y posteriores, desde
  watchOS 10.1. No existe en Series 8 ni en SE de 1.ª o 2.ª generación.
- **Giro de muñeca** — los mismos modelos, desde watchOS 26.
- **Gestos de cabeza** — AirPods Pro 2 y posteriores, AirPods 4, AirPods Max 2.
  Solo dentro de un anuncio de Siri.
- **Deslizar el vástago para el volumen** — AirPods Pro 2 y 3, no la 1.ª generación.

Ninguna de estas se puede presentar como universal. Si el deck se reutiliza en
otro semestre, hay que volver a verificarlas: cambian con cada versión.

