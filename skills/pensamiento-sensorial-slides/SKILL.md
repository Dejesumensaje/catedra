---
name: pensamiento-sensorial-slides
description: >
  Crea presentaciones HTML para William (Pensamiento Sensorial, Universidad de Antioquia)
  siguiendo exactamente su estilo pedagógico y visual. Usar siempre que el usuario pida
  crear, escribir o preparar una clase, presentación, diapositivas o slides para Pensamiento
  Sensorial o cualquier clase universitaria. También usar cuando diga "hazme la clase X",
  "prepara la presentación de hoy", o similares. Produce un único archivo HTML navegable
  con flechas de teclado o clicks, listo para proyectar.
---

# Skill: Presentaciones Pensamiento Sensorial

Genera presentaciones HTML que replican exactamente el estilo de William para sus clases
de Pensamiento Sensorial en la Universidad de Antioquia. Este estilo es muy específico —
no improvisar ni añadir elementos que no estén en estas instrucciones.

---

## Principio rector

**Una idea por slide. Punto.**

Nunca dos ideas en el mismo slide. Si hay dos pensamientos, son dos slides. La narrativa
avanza como si cada slide fuera una oración de un párrafo que se va revelando.

**La excepción, que es una sola:** cuando la idea *es* la comparación entre varias partes
—cuatro clases de restricción, tres momentos de una interacción, dos casos que solo se
entienden como diferencia—, partirla en slides la destruye. Distinguir exige ver junto. Para
eso están los **layouts compuestos** (ver §Layouts compuestos). Siguen siendo una idea por
slide: la idea es la comparación.

No confundir esto con un permiso general. Para narrar, argumentar o preguntar sigue siendo
una oración por slide, siempre.

---

## Estructura fija de cada presentación

### 1. Slide de espera (siempre primero)
- Imagen de meme/gif cómico (gato, animal, situación absurda — centrada)
- Título bold: **"Gracias por la puntualidad"**
- Subtítulo: *"En breve comenzamos"*
- Fondo blanco

### 2. Portada del curso
- Solo dos líneas centradas, tipografía grande
- Línea 1: "Pensamiento" — peso normal o regular
- Línea 2: "SENSORIAL" — bold, todo caps
- Sin más elementos. Sin número de clase, sin fecha.

### 3. (Opcional) Slide de sección especial
- Una palabra o frase corta en tipografía grande, centrada
- Ejemplos: "POSTMORTEM", "ACTIVIDAD", "CLASE 7 / SOBRE PROTOTIPOS Y BOCETOS"
- Dos líneas máximo, sin decoración adicional

### 4. Bloque de repaso (si aplica)
- 3–6 slides recordando la clase anterior
- Cada uno = una oración que reconstruye el hilo
- Estilo: "La clase pasada, hablamos de...", "Decíamos que...", "También hablamos del..."
- Tono de conversación, nunca lista, nunca bullet

### 5. Bloque de contenido nuevo
- Transición: slide solo con el nombre del nuevo concepto + subtítulo corto
  - Ej: "MICROINTERACCIONES / Detalles que importan"
- Luego: slides de una oración que van construyendo la definición y el argumento
- Intercalar slides de imagen pura cuando sea útil (ver reglas de imagen abajo)
- Para conceptos con subdimensiones (ej: Tiempo, Ubicación, Dirección...):
  - Slide de intro con la lista de dimensiones en una sola oración
  - Luego UN slide por dimensión: título en bold + párrafo explicativo de 3–5 líneas

### 6. Bloque de actividad (siempre al final si hay taller)
- Slide: solo la palabra "Actividad" o una instrucción breve
- Luego: una pregunta guía por slide
  - Ej: "¿Cómo empieza el videojuego / experiencia / instalación?"
  - Ej: "¿Qué ve, hace, percibe el usuario?"
- Cierre: instrucción de entrega en un slide

---

## Reglas de tipografía

```css
/* Fuentes — importar de Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=PT+Serif:ital@0;1&display=swap');

/* Slide normal (oración principal) */
font-family: 'Roboto', sans-serif;
font-size: clamp(1.8rem, 4vw, 3.2rem);
font-weight: 700;
color: #444444;
line-height: 1.3;
text-align: center;
max-width: 75%;

/* Subtítulo o apoyo */
font-family: 'Roboto', sans-serif;
font-size: clamp(1rem, 2vw, 1.5rem);
font-weight: 400;
color: #888888;

/* Slide de dimensión/concepto con párrafo */
Título: Roboto bold, ~1.8rem, #444
Párrafo: Roboto regular, ~1.1rem, #555, max-width: 60%, line-height: 1.7

/* Portada SENSORIAL */
"Pensamiento": Roboto 400, ~3rem, #444
"SENSORIAL": Roboto 700, ~5rem, #222, letter-spacing: 0.05em
```

**Nunca usar PT Serif en las slides de presentación.** PT Serif es para el portfolio/web de
William, no para las clases.

---

## Reglas de color y fondo

- Fondo predeterminado: **blanco puro `#ffffff`**
- Color de texto: **gris oscuro `#444`** (títulos) y **`#6f6f6f`** (subtítulos, fuentes,
  rótulos y texto de apoyo)

> **Corrección, deck s02 en adelante.** Este documento decía `#888` para el texto secundario.
> Sobre blanco eso queda en 3.5:1 y no llega al piso AA que fija `AGENTS.md` §9 — proyectado,
> al fondo del salón, se pierde. El secundario es `#6f6f6f` (5:1), el mismo del sitio.
> `#888` solo puede quedar en el cromo que no es contenido: la pista `← →` y el menú de
> secciones. Los decks anteriores conservan `#888`; no hay que volver atrás a corregirlos,
> pero ningún deck nuevo lo usa para texto que se lee.
- Acento principal: **`#eeff41`** (amarillo eléctrico) — tiene dos usos precisos:

### Uso 1 — Énfasis dentro del slide

Subrayar o destacar la idea clave de un slide de oración. Se aplica como `background-color`
en un `<span>` sobre la palabra o frase más importante de la oración. Nunca en más de
una frase por slide. No es decoración — es señal de qué debe recordar el estudiante.

```html
<p class="slide-title">
  Un prototipo siempre debe ser la respuesta a
  <span style="background-color: #eeff41; padding: 0 0.15em;">una pregunta</span>
</p>
```

### Uso 2 — Fondo de slides de título o transición

Los slides que introducen un nuevo bloque temático (nombre del concepto, sección,
actividad) usan `#eeff41` como fondo completo. El texto va en negro `#111` o `#222`.

```html
<div class="slide" style="background: #eeff41;">
  <p class="slide-title" style="color: #111;">MICROINTERACCIONES</p>
  <p class="slide-subtitle" style="color: #333;">Detalles que importan</p>
</div>
```

Slides que deben tener fondo `#eeff41`: nombre del tema nuevo, "POSTMORTEM",
"ACTIVIDAD", "CLASE N / SUBTÍTULO". La portada "Pensamiento / SENSORIAL" y el
slide de espera siempre van en blanco.

- Links: color teal `#1a9e9e` o azul estándar
- Slides de ejemplo visual (cuando se muestra UI de otra app): pueden tener fondo de color
  que imite el producto mostrado (ej: azul `#3d3df5` para el hamburger menu)
- No usar gradientes, sombras decorativas ni bordes en texto

---

## Reglas de imágenes estáticas

- Las imágenes van **solas en su slide**, sin texto encima ni debajo
- Centradas, con margen generoso (no full-bleed excepto que sea intencional)
- Sin caption, sin borde, sin sombra
- Ratio del slide: 16:9 siempre
- Tamaño máximo de imagen: ~70% del ancho del slide
- Para el slide de espera: imagen más pequeña (~40% del ancho), texto debajo

---

## GIFs: criterio, posición y cómo usarlos

Los GIFs son una herramienta pedagógica real en estas presentaciones — no decoración.
Mantienen la atención, funcionan como puntuación emocional del argumento y rompen
la densidad conceptual en los momentos correctos.

### Implementación técnica

Los GIFs se insertan como `<img>` con URLs directas de Giphy. El formato es:

```
https://media.giphy.com/media/{GIPHY_ID}/giphy.gif
```

Seleccionar GIFs de Giphy que sean temáticamente precisos. Usar el criterio de búsqueda
descrito abajo para cada momento. **No inventar IDs** — construir la URL con IDs reales
conocidos o usar el formato de búsqueda embed de Giphy:

```html
<!-- Opción A: URL directa con ID conocido -->
<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
     style="max-width: 45%; border-radius: 8px;">

<!-- Opción B: si no se tiene ID, usar iframe embed de Giphy -->
<iframe src="https://giphy.com/embed/JIX9t2j0ZTN9S"
        width="480" height="270" frameBorder="0"
        allowFullScreen style="border-radius: 8px;"></iframe>
```

### Slide de espera (obligatorio, siempre)

El primer slide **siempre** tiene un GIF de gato haciendo algo absurdo o adorable.
Términos de búsqueda sugeridos en Giphy: `cat waiting`, `cat judging`, `cat staring`,
`cat typing`, `cat professor`. El GIF va centrado, ocupa ~40% del ancho, con el texto
"Gracias por la puntualidad / En breve comenzamos" debajo.

```html
<div class="slide" style="gap: 2rem;">
  <img src="https://media.giphy.com/media/{ID}/giphy.gif"
       style="max-width: 40%; border-radius: 8px;" alt="gif de espera">
  <p class="slide-title">Gracias por la puntualidad</p>
  <p class="slide-subtitle">En breve comenzamos</p>
</div>
```

### GIFs dentro de la presentación (criterio de uso)

Evaluar en estos 4 momentos si un GIF aporta:

| Momento | Cuándo usarlo | Tipo de GIF |
|---|---|---|
| **Después de un bloque teórico denso** | +5 slides de concepto seguidos sin respiro | Reacción cómica, cerebro explotando, "mind blown" |
| **Para ilustrar un concepto en acción** | El concepto describe un comportamiento o emoción observable | GIF que muestre literalmente esa cosa (ej: para "feedback inmediato" → alguien presionando un botón con reacción exagerada) |
| **Transición hacia la actividad** | Justo antes del bloque de taller/ejercicio | GIF motivacional, persona preparándose, "let's go" |
| **Punchline o cierre de argumento** | Cuando una idea llega a su conclusión natural y hay espacio para humor | GIF de reacción que funcione como confirmación cómica |

**No usar GIF** si el slide que sigue es de concepto puro — el GIF cierra un momento,
no lo introduce. Máximo 2–3 GIFs por presentación fuera del slide de espera.

### Slide de GIF: estructura

Los GIFs van **solos en su slide**, igual que las imágenes estáticas. Sin texto.
Centrado. Tamaño: 50–60% del ancho del slide para que respire.

```html
<div class="slide">
  <img src="https://media.giphy.com/media/{ID}/giphy.gif"
       style="max-width: 55%; border-radius: 6px;" alt="">
</div>
```

Excepción: el slide de espera, donde el GIF convive con el texto de bienvenida.

---

## Infografías y mapas conceptuales

### La prueba de un diagrama: ¿se puede interrogar?

> **Estrenada en el deck s04, y es la regla más importante de esta sección.**

Un diagrama no está para resumir lo que ya se dijo. Está para que el profesor pueda
**señalar una parte concreta y hacer una pregunta sin explicar nada antes**:

> ¿Qué está pasando acá? · ¿Dónde empieza la interacción? · ¿Qué sabe la persona?
> ¿Qué sabe el sistema? · ¿Qué tiene que recordar? · ¿Qué información desaparece?

Si el diagrama no aguanta ese uso, no es una herramienta de pensamiento: es una
ilustración. La referencia viva es el esquema del cajero de s02, que sostuvo un bloque
teórico entero porque cada pieza podía encenderse y preguntarse aparte.

**Consecuencia práctica:** cuando haya que elegir entre una ficha elegante y un diagrama
que permita hacer una pregunta, va el diagrama.

### Mostrar la situación, no la taxonomía

El error más caro que cometió el s04 en su primera versión: dibujar los **roles** en vez
de la **escena**. Para explicar «Put-That-There» —alguien señala una pantalla de pared y
dice «pon eso ahí»— la v1 puso tres cajas que decían `VOZ · la acción`,
`GESTO · cuál objeto`, `GESTO · qué lugar`, con flechas que confluían. Nadie lo entendía,
y con razón: no había pantalla, no había dedo, no había objetos. Las cajas *nombraban* el
gesto en vez de mostrarlo, y la disposición en tres columnas sugería una secuencia que no
existe.

La versión que sí funciona dibuja la situación: la pantalla de pared con figuras encima,
la frase abajo con «eso» y «ahí» dentro de cajas de línea punteada —el contorno roto *es*
el argumento: son palabras huecas—, y dos flechas que suben desde esas palabras hasta lo
que el dedo resuelve.

**La regla:** si el concepto tiene una escena, dibuja la escena. Un diagrama de categorías
solo se entiende si ya se entendió el concepto, o sea, cuando ya no hace falta.

### Cuándo incluir uno (criterio de decisión)

Antes de generar cada bloque de contenido, evaluar si el concepto cumple al menos dos de
estas condiciones. Si cumple dos o más → generar un slide visual.

| Condición | Señal en el contenido |
|---|---|
| Tiene 3+ partes o dimensiones relacionadas | "Tiempo, Ubicación, Dirección, Dinámica..." |
| Muestra un proceso o secuencia con orden | "primero... luego... finalmente..." |
| Compara dos cosas con criterios comunes | "boceto vs prototipo", "diegético vs extradiegético" |
| Muestra jerarquía o composición | "X se divide en Y y Z, que a su vez..." |
| El estudiante necesita ver el todo antes de las partes | intro a un framework complejo |

No generar un visual si el concepto es lineal, narrativo o filosófico — esos funcionan
mejor como slides de oración. No forzar infografías donde no aporten claridad real.

### Sistema de diseño para visuales

Todos los visuales se generan como SVG inline dentro del slide HTML. Usar exclusivamente
estos tokens — nada fuera de este sistema:

```
Colores:
  Fondo slide:          #ffffff
  Nodo acento / fill:   #eeff41   ← nodos principales, pasos clave
  Nodo oscuro:          #222222   ← nodos secundarios, dimensiones
  Texto sobre #eeff41:  #111111
  Texto sobre #222:     #ffffff
  Líneas / bordes:      #444444
  Texto secundario:     #888888

Tipografía SVG (font-family="Roboto, sans-serif"):
  Etiqueta principal:   font-size="18" font-weight="700"
  Etiqueta secundaria:  font-size="14" font-weight="400"
  Texto de apoyo:       font-size="12" font-weight="400" fill="#888"

Formas:
  Nodo primario:   rect fill="#eeff41" rx="4" sin stroke
  Nodo secundario: rect fill="#222"    rx="4" texto blanco
  Nodo neutro:     rect fill="none" stroke="#444" rx="4" texto #444
  Conector:        line o path, stroke="#444" stroke-width="1.5"
  Flecha:          marker-end con fill="#444"

Proporciones:
  SVG viewBox: "0 0 900 500"  (proporcional al 16:9 del slide)
  Padding nodo: mínimo 16px horizontal, 10px vertical
  Separación entre nodos: mínimo 60px
```

### Tipos de visual y cuándo usar cada uno

**1. Mapa radial / estrella** — un concepto central con 4–7 dimensiones sin orden entre sí.
Ejemplo: las 6 dimensiones del Interaction Frogger. Centro en `#eeff41`, ramas hacia
nodos `#222`.

**2. Flujo / secuencia** — pasos con orden, proceso o ciclo. Ejemplo: "bocetar →
prototipar → testear → iterar". Nodos `#eeff41`, flechas `#444`.

**3. Tabla comparativa visual** — dos conceptos comparados en múltiples ejes. Ejemplo:
boceto vs prototipo. Encabezado izquierdo en `#222` (texto blanco), derecho en `#eeff41`
(texto `#111`).

**4. Venn / superposición** — dos conceptos con área común nombrable. Círculos con
stroke `#444`, intersección con fill `#eeff41` al 30% de opacidad.

**5. Árbol / jerarquía** — un concepto que se descompone en subcategorías. Raíz en
`#eeff41`, hijos en `#222`, nietos en nodo neutro.

### SVG o layout: la regla que evita decir lo mismo dos veces

Antes de dibujar un SVG, decidir cuál de los dos es:

> **SVG cuando hay flechas** — relación, dirección, proceso, algo que fluye entre nodos.
> **Layout compuesto cuando hay celdas** — partes paralelas que se comparan entre sí.

Un SVG que dibuja una tabla o una rejilla de cajas está haciendo a mano, en coordenadas
absolutas y sin responsive, algo que el HTML hace mejor. Si el diagrama no tiene ni una
flecha ni una línea de relación, no es un diagrama: es una rejilla, y va como layout.

Y nunca las dos: si un bloque ya tiene su rejilla, no lleva además un SVG que repita las
mismas celdas. Ese es el error más común al ampliar un deck.

### Posición del slide visual en la narrativa

El visual nunca reemplaza la explicación — va después de que las oraciones ya
construyeron el concepto, como cierre o síntesis. El orden es siempre:

1. Slides de oración que explican el concepto parte a parte
2. → Slide visual que muestra la estructura completa de un vistazo
3. (Opcional) Un slide de conclusión o pregunta

Nunca poner el visual primero. La narrativa textual siempre precede al visual.

### Plantilla SVG base

```html
<div class="slide slide--visual">
  <svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg"
       style="width: 85%; height: 85%;">
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8"
              refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#444"/>
      </marker>
    </defs>

    <!-- Nodo primario (#eeff41) -->
    <rect x="350" y="226" width="200" height="48" rx="4" fill="#eeff41"/>
    <text x="450" y="250" text-anchor="middle" dominant-baseline="middle"
          font-family="Roboto, sans-serif" font-size="18" font-weight="700"
          fill="#111">Concepto central</text>

    <!-- Nodo secundario (#222) -->
    <rect x="80" y="78" width="160" height="44" rx="4" fill="#222"/>
    <text x="160" y="100" text-anchor="middle" dominant-baseline="middle"
          font-family="Roboto, sans-serif" font-size="14" font-weight="700"
          fill="#fff">Dimensión</text>

    <!-- Conector con flecha -->
    <line x1="240" y1="100" x2="350" y2="240"
          stroke="#444" stroke-width="1.5" marker-end="url(#arrow)"/>
  </svg>
</div>
```

### Variante móvil obligatoria: `.diagram-mobile`

Todo slide `slide--visual` lleva, además del SVG, una variante móvil en HTML. A 390px de
ancho, las etiquetas de un viewBox de 900×500 quedan en ~5px: ilegibles. Subir la fuente
por CSS no es opción — desborda los nodos de tamaño fijo del viewBox. La solución no es
escalar el SVG sino **reemplazarlo** en pantalla angosta.

La regla: **ningún `slide--visual` se entrega sin su `.diagram-mobile`**. Estrenada en el
deck s02 (primero en el slide `slide--cuatro`, luego generalizada a sus diez visuales),
que es la referencia viva del patrón.

**Cómo se traduce el diagrama.** La variante repite el texto del SVG, sin reescribirlo,
en una pila vertical de cajas:

- Nodo `#eeff41` → `.dm-box.accent`; nodo `#222` → `.dm-box.dark`; nodo neutro
  (`fill="none" stroke="#444"`) → `.dm-box.neutral`.
- Etiqueta principal del nodo → `<strong>`; texto de apoyo → `<em>`.
- Etiqueta superior del diagrama → `.dm-label`.
- Si el SVG tiene flechas, la pila vertical ES el flujo: los nodos van en orden y cada
  flecha se traduce a `<span class="dm-arrow">↓</span>` (o `↑` cuando el ciclo devuelve).
- La sentencia de cierre que el SVG pone al pie → `.dm-note`.

Mapas radiales y jerarquías: nodo central primero, luego las ramas apiladas.

**Markup:**

```html
<div class="slide slide--visual">
  <svg viewBox="0 0 900 500" ...>…</svg>
  <div class="diagram-mobile">
    <p class="dm-label">Los dos golfos</p>
    <div class="dm-box dark"><strong>Persona</strong><em>intención · interpretación</em></div>
    <span class="dm-arrow">↓</span>
    <div class="dm-box accent"><strong>Golfo de la ejecución</strong><em>¿cómo hago lo que quiero hacer?</em></div>
    <span class="dm-arrow">↓</span>
    <div class="dm-box dark"><strong>Sistema</strong><em>acción · estado</em></div>
  </div>
</div>
```

**El toggle** vive en el media query de 700px, junto al colapso de los layouts compuestos:

```css
@media (max-width: 700px) {
  .slide--visual svg { display: none; }
  .slide--visual .diagram-mobile { display: flex; }
}
```

**CSS del sistema.** Se copia tal cual al `<style>` del deck. Las cajas heredan el
`border-radius: 6px` del `rx="4"` de los nodos SVG — es la traducción del nodo, no
decoración.

```css
.diagram-mobile {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  max-width: 380px;
}
.dm-label {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
  color: #999; text-transform: uppercase;
}
.dm-box {
  width: 100%; border-radius: 6px; padding: 0.85rem 1rem; text-align: center;
}
.dm-box.dark { background: #222; color: #fff; }
.dm-box.accent { background: #eeff41; color: #111; }
.dm-box.neutral { background: #fff; color: #444; border: 1.5px solid #444; }
.dm-box strong { display: block; font-size: 0.95rem; font-weight: 700; }
.dm-box em { display: block; font-style: normal; font-size: 0.72rem; opacity: 0.7; margin-top: 0.15rem; }
.dm-arrow { color: #444; font-size: 0.9rem; line-height: 0.6; }
.dm-note {
  font-size: 0.78rem; color: #6f6f6f; text-align: center;
  line-height: 1.45; max-width: 36ch; margin-top: 0.35rem;
}
```

Las cajas entran con el mismo stagger `drawIn` que los nodos del SVG que reemplazan:
añadir `.slide.active .diagram-mobile > *` a las reglas de stagger y al bloque de
`prefers-reduced-motion`, junto a los selectores ya existentes.

---

## Layouts compuestos

Cinco layouts que ponen varias celdas en un slide. Estrenados en el deck de la sesión 2
(`public/presentaciones/ps3/s02/index.html`), que es la referencia viva: si algo de esta
sección no se entiende, mirar cómo está resuelto ahí.

**Cuándo usarlos.** Solo cuando la idea es la comparación entre las celdas. La prueba: si
uno pudiera leer las celdas en cualquier orden y la idea sobrevive, es una rejilla; si tienen
que ir en un orden, es narrativa y van como oraciones sueltas.

**Cuándo NO usarlos.** Para resumir un argumento que ya se contó bien en oraciones. Para
meter más contenido en menos slides. Para hacer una agenda. Ninguna de esas es una razón.

**Y una razón más para no usarlos, aprendida en s04: el exceso de fichas.** Convertir cada
concepto en `rótulo + tarjeta + definición + fuente + dos celdas` produce un lenguaje
editorial y corporativo —una colección de tarjetas—, no un argumento visual. El s04 llegó
a tener tres `slide--ficha` seguidas para las tres modalidades; se reemplazaron por **un
solo diagrama de tres paneles** que se puede señalar, más un párrafo denso donde hacía
falta precisión. La presentación mejoró y quedó más corta.

Antes de poner una ficha, la pregunta es: ¿esto se entiende mejor como tarjeta, o como
algo que se puede recorrer con el dedo?

### Reglas comunes

- Roboto sobre blanco, como todo lo demás. Reglas de 1px `#e5e5e5` para separar.
- **Sin bordes redondeados, sin sombras, sin degradados, sin tarjetas.** Las celdas se separan
  con filetes y aire, nunca con un contorno cerrado.
- Texto alineado a la izquierda dentro de las celdas.
- **El amarillo marca una sola celda por slide, como máximo, y solo si el texto dice por qué
  esa celda es distinta.** Si las partes son equivalentes, ninguna lleva acento. Un amarillo
  que alterna para "dar ritmo" es decoración, y está prohibido.
- Máximo cuatro celdas. Con cinco, el slide dejó de ser legible a distancia.
- Todo layout compuesto colapsa a una columna en pantallas angostas. Como son CSS grid, basta
  cambiar `grid-template-columns`: no hace falta duplicar el markup.

### 1 · `slide--ficha` — la ficha de concepto

Un concepto entero en un slide, con las mismas ranuras siempre: número, término, definición,
fuente, y una o dos celdas abajo. Cuando un bloque presenta varios conceptos hermanos, la
repetición exacta de la estructura es lo que vuelve visible que son cosas del mismo orden.

El rótulo de la segunda celda es variable y es donde se juega la enseñanza: «Cuidado», «La
distinción bisagra», «Cuando falla», «Por qué importa». La primera es casi siempre «El ejemplo».

```html
<div class="slide slide--ficha">
  <div class="ficha">
    <p class="rotulo ficha-num">Concepto 1 de 5</p>
    <p class="ficha-termino">Affordance</p>
    <p class="ficha-def">Lo que un objeto <em>permite hacer</em>, por la relación entre sus
      propiedades y el cuerpo de quien lo enfrenta.</p>
    <p class="ficha-fuente">Gibson, 1979 · Norman, 1988 / 1999</p>
    <div class="ficha-celdas">          <!-- añadir .una si solo va una celda -->
      <div class="ficha-celda">
        <span class="rotulo">El ejemplo</span>
        <p>Una manija plana y horizontal afforda empujar…</p>
      </div>
      <div class="ficha-celda">
        <span class="rotulo">Cuidado</span>
        <p>La affordance existe aunque nadie la perciba…</p>
      </div>
    </div>
  </div>
</div>
```

El `<em>` dentro de `.ficha-def` pinta el amarillo sobre la palabra clave de la definición.
Uno por ficha.

### 2 · `slide--rejilla` — trío y 2×2

Tres columnas (`.rejilla--3`) o cuadro de cuatro (`.rejilla--2x2`). Cada celda: filete
superior, rótulo, titular corto, cuerpo de dos o tres líneas. Admite `.compuesto-titulo`
arriba —la pregunta que el conjunto responde— y `.compuesto-pie` abajo —la nota que lo cierra.

```html
<div class="slide slide--rejilla">
  <p class="compuesto-titulo">Las cuatro, al mismo tiempo</p>
  <div class="rejilla rejilla--2x2">
    <div class="celda acento">        <!-- .acento solo en la celda que el texto justifica -->
      <span class="rotulo">Física</span>
      <p class="celda-titulo">La forma impide la acción equivocada</p>
      <p class="celda-cuerpo">La SIM que solo entra por un lado…</p>
    </div>
    <div class="celda">…</div>
    <div class="celda">…</div>
    <div class="celda">…</div>
  </div>
  <p class="compuesto-pie">Los cuatro pueden fallar, pero no fallan igual.</p>
</div>
```

### 3 · `slide--par` — el contraste

Dos columnas enfrentadas con encabezado a sangre: la izquierda amarilla, la derecha oscura.
Es el mismo par que usan las tablas comparativas en SVG. Para ideas que solo existen como
diferencia: escondida ↔ falsa, dice la verdad ↔ miente, antes ↔ después.

```html
<div class="slide slide--par">
  <p class="compuesto-titulo">De ahí salen los dos casos que más nos van a interesar</p>
  <div class="par">
    <div class="par-col a">
      <p class="par-encabezado">Escondida — existe y nadie la ve</p>
      <p class="par-cuerpo">La acción <strong>es posible</strong>, pero nada lo anuncia…</p>
    </div>
    <div class="par-col b">
      <p class="par-encabezado">Falsa — no existe y todo el mundo la ve</p>
      <p class="par-cuerpo">Parece que se puede y <strong>no se puede</strong>…</p>
    </div>
  </div>
</div>
```

### 4 · `slide--pauta` — la lista operativa

Consignas de laboratorio y listas de entregables. **Es la única excepción a la prohibición de
listas**, y tiene una razón concreta: mientras los estudiantes copian una consigna, necesitan
verla completa; repartida en seis slides los obliga a pedir que uno devuelva.

Nunca usarla para argumentar. Si los ítems son ideas y no instrucciones, son oraciones sueltas.

```html
<div class="slide slide--pauta">
  <p class="pauta-titulo">Las reglas del laboratorio</p>
  <ol class="pauta">
    <li><span class="n">01</span><span>El objetivo del juego sigue igual…</span></li>
    <li><span class="n">02</span><span>Dejan el <strong>significante intacto</strong>…
      <span class="nota">Aclaración secundaria, si hace falta.</span></span></li>
  </ol>
</div>
```

### 5 · `slide--mapa` — dónde vamos

El índice de un bloque largo: los nombres apilados, `#444` los que faltan, `#6f6f6f` los ya
vistos, `#111` y marcado el actual. Va una vez al abrir el bloque y una vez al cerrarlo — no
antes de cada concepto, que se vuelve un tic.

Dos reglas que no se pueden relajar aquí:

- **Los tres estados cumplen AA sobre blanco.** La tentación es poner los pendientes en un
  gris muy claro; proyectado eso no se lee y el slide de apertura —donde todo está pendiente—
  queda en blanco. La diferencia entre estados es sutil a propósito.
- **El estado no se comunica solo por color:** el ítem actual lleva además fondo amarillo y
  una flecha, puesta por CSS.

```html
<div class="slide slide--mapa">
  <div class="mapa">
    <p class="mapa-item visto">Affordance</p>
    <p class="mapa-item actual"><span>Significante</span></p>
    <p class="mapa-item">Restricción</p>
    <p class="mapa-pie">Cada uno responde una pregunta distinta. Vamos en orden.</p>
  </div>
</div>
```

### 6 · `slide--preguntas-grandes` — la diapositiva que solo pregunta

No toda diapositiva tiene que explicar algo. Algunas existen para que el estudiante mire y
piense, y se proyectan **mientras se está mirando otra cosa**: una prueba en vivo, una
instalación, cinco propuestas pegadas en el tablero.

Sin número y sin viñeta, a propósito: no es una lista operativa —para eso está
`slide--pauta`— ni un argumento. Son preguntas para hacer en voz alta.

```html
<div class="slide slide--preguntas-grandes">
  <p class="pg-titulo">Mientras miran, busquen esto</p>
  <ul class="pg">
    <li>¿Dónde se atasca?</li>
    <li>¿Qué intenta hacer primero?</li>
    <li>¿Qué asumimos que iba a entender solo?</li>
  </ul>
</div>
```

Una diapositiva que solo diga **¿Dónde está la interfaz?** es perfectamente válida.

### 7 · `slide--demo` — componentes que funcionan de verdad

El deck es HTML. Cuando el tema *son* las convenciones de interfaz, proyectar una imagen
de un botón es pedir un acto de fe: pon el botón.

El s04 lo usa para las convenciones visuales —botón, botón desactivado, slider, enlace,
campo de texto y tarjeta arrastrable—, con sus cursores y sus estados de hover
funcionando. El profesor pasa el mouse y arrastra delante de todos.

**Dos cosas técnicas que hay que respetar o el deck se rompe:**

```js
// el clic no puede pasar de diapositiva si cae dentro de un control
if (e.target.closest('.deck-nav, a, button, .demo')) return;

// y el teclado se cede cuando el foco está en un campo:
// sin esto, escribir un espacio salta de página
const t = e.target;
if (t && (t.matches('input, textarea, select') || t.isContentEditable)) return;
```

Todo control interactivo va dentro de un contenedor con clase `.demo`.

**Y una regla de contenido:** la diapositiva no lleva instrucciones de uso. Si hay que
escribir «pasen el mouse por encima», la convención no estaba funcionando sola — que es
justo lo que la diapositiva afirma.

### 8 · `.visual-titulo` — el titular de un diagrama

Un `slide--visual` sin titular obliga al profesor a decir de qué es el diagrama antes de
poder señalarlo. El titular dice qué se está mirando; el diagrama responde el resto.

```html
<div class="slide slide--visual">
  <p class="visual-titulo">Lo que una interfaz sostiene, tenga la forma que tenga</p>
  <svg viewBox="0 0 900 430" ...>…</svg>
  <div class="diagram-mobile">…</div>
</div>
```

### CSS de los layouts compuestos

Se copia tal cual al bloque `<style>` del deck.

```css
.slide--ficha, .slide--rejilla, .slide--par,
.slide--pauta, .slide--mapa {
  align-items: stretch; justify-content: center;
  text-align: left; padding: 4rem 6rem;
}
.rotulo {
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em;
  text-transform: uppercase; color: #6f6f6f;
}
.compuesto-titulo {
  font-size: clamp(1.1rem, 2.2vw, 1.5rem); font-weight: 900; color: #444;
  max-width: 60ch; margin: 0 auto 2rem; text-align: center; line-height: 1.35;
}
.compuesto-pie {
  font-size: clamp(0.88rem, 1.3vw, 1rem); color: #6f6f6f;
  max-width: 66ch; margin: 2rem auto 0; text-align: center; line-height: 1.5;
}

/* Ficha */
.ficha { width: 100%; max-width: 62rem; margin: 0 auto; }
.ficha-num { margin-bottom: 1.6rem; }
.ficha-termino {
  font-size: clamp(1.6rem, 3.6vw, 2.4rem); font-weight: 900; color: #111;
  letter-spacing: 0.04em; text-transform: uppercase; line-height: 1.1;
}
.ficha-def {
  font-size: clamp(1.35rem, 2.8vw, 2rem); font-weight: 900; color: #444;
  line-height: 1.28; margin-top: 0.9rem; max-width: 40ch;
}
.ficha-def em { font-style: normal; background: #eeff41; padding: 0 0.15em; }
.ficha-fuente { font-size: 0.82rem; color: #6f6f6f; margin-top: 1rem; letter-spacing: 0.03em; }
.ficha-celdas {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0 3rem;
  margin-top: 2.4rem; padding-top: 2.2rem; border-top: 1px solid #e5e5e5;
}
.ficha-celdas.una { grid-template-columns: 1fr; max-width: 46ch; }
.ficha-celda .rotulo { display: block; margin-bottom: 0.7rem; }
.ficha-celda p { font-size: clamp(0.98rem, 1.5vw, 1.1rem); color: #555; line-height: 1.6; }
.ficha-celda + .ficha-celda { border-left: 1px solid #e5e5e5; padding-left: 3rem; }

/* Rejilla */
.rejilla { display: grid; gap: 2.2rem; width: 100%; max-width: 66rem; margin: 0 auto; }
.rejilla--3 { grid-template-columns: repeat(3, 1fr); }
.rejilla--2x2 { grid-template-columns: 1fr 1fr; }
.celda { border-top: 4px solid #444; padding-top: 1.1rem; }
.celda.acento { border-top-color: #eeff41; }
.celda .rotulo { display: block; margin-bottom: 0.7rem; }
.celda-titulo {
  font-size: clamp(1.1rem, 2.1vw, 1.45rem); font-weight: 900; color: #111;
  line-height: 1.2; margin-bottom: 0.7rem;
}
.celda-cuerpo { font-size: clamp(0.92rem, 1.4vw, 1.05rem); color: #555; line-height: 1.55; }
.celda-cuerpo .src { color: #6f6f6f; }

/* Par */
.par { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem;
       width: 100%; max-width: 62rem; margin: 0 auto; }
.par-encabezado {
  font-size: clamp(0.95rem, 1.8vw, 1.15rem); font-weight: 900;
  letter-spacing: 0.03em; padding: 0.8rem 1.1rem; line-height: 1.25;
}
.par-col.a .par-encabezado { background: #eeff41; color: #111; }
.par-col.b .par-encabezado { background: #222; color: #fff; }
.par-cuerpo { font-size: clamp(0.98rem, 1.5vw, 1.12rem); color: #555;
              line-height: 1.6; padding: 1.3rem 1.1rem 0; }
.par-cuerpo strong { color: #222; font-weight: 700; }

/* Pauta */
.pauta { list-style: none; width: 100%; max-width: 52rem; margin: 0 auto; }
.pauta-titulo {
  font-size: clamp(1.2rem, 2.4vw, 1.7rem); font-weight: 900; color: #111;
  margin: 0 auto 1.8rem; max-width: 52rem; width: 100%;
  line-height: 1.25; text-align: left;
}
.pauta li {
  display: flex; gap: 1.4rem; align-items: baseline; padding: 1rem 0;
  border-bottom: 1px solid #e5e5e5;
  font-size: clamp(1rem, 1.7vw, 1.25rem); color: #444; line-height: 1.45;
}
.pauta li:last-child { border-bottom: none; }
.pauta .n { font-size: 0.8rem; font-weight: 700; color: #6f6f6f;
            letter-spacing: 0.06em; flex: 0 0 1.8rem; }
.pauta li strong { color: #111; font-weight: 900; }
.pauta li .nota { display: block; font-size: 0.86em; color: #6f6f6f; margin-top: 0.25rem; }

/* Mapa */
.mapa { width: 100%; max-width: 44rem; margin: 0 auto; }
.mapa-item {
  font-size: clamp(1.3rem, 3.2vw, 2.2rem); font-weight: 900; letter-spacing: 0.03em;
  text-transform: uppercase; color: #444; padding: 0.55rem 0; line-height: 1.15;
}
.mapa-item.visto { color: #6f6f6f; }
.mapa-item.actual { color: #111; }
.mapa-item.actual span { background: #eeff41; padding: 0 0.2em; }
.mapa-item.actual::after { content: " ←"; color: #111; }
.mapa-pie { font-size: 0.9rem; color: #6f6f6f; margin-top: 1.6rem;
            padding-top: 1.2rem; border-top: 1px solid #e5e5e5; }

/* Entrada escalonada de las celdas, igual que los nodos de un SVG */
.slide.active .ficha-celda, .slide.active .celda, .slide.active .par-col,
.slide.active .pauta li, .slide.active .mapa-item {
  opacity: 0; animation: drawIn 0.18s ease-out forwards;
}
.ficha-celda:nth-child(1), .celda:nth-child(1), .par-col:nth-child(1),
.pauta li:nth-child(1), .mapa-item:nth-child(1) { animation-delay: 0.04s; }
.ficha-celda:nth-child(2), .celda:nth-child(2), .par-col:nth-child(2),
.pauta li:nth-child(2), .mapa-item:nth-child(2) { animation-delay: 0.08s; }
.celda:nth-child(3), .pauta li:nth-child(3), .mapa-item:nth-child(3) { animation-delay: 0.12s; }
.celda:nth-child(4), .pauta li:nth-child(4), .mapa-item:nth-child(4) { animation-delay: 0.16s; }
.pauta li:nth-child(5), .mapa-item:nth-child(5) { animation-delay: 0.20s; }
.pauta li:nth-child(n+6) { animation-delay: 0.24s; }

/* Una columna. Al ser grid, no hace falta markup duplicado. */
@media (max-width: 900px) {
  .slide--ficha, .slide--rejilla, .slide--par,
  .slide--pauta, .slide--mapa { padding: 2.5rem 3rem; }
  .rejilla { gap: 1.6rem; }
  .ficha-celdas { gap: 0 2rem; }
  .ficha-celda + .ficha-celda { padding-left: 2rem; }
}
@media (max-width: 700px) {
  .rejilla--3, .rejilla--2x2, .par { grid-template-columns: 1fr; gap: 1.6rem; }
  .ficha-celdas { grid-template-columns: 1fr; gap: 1.6rem; }
  .ficha-celda + .ficha-celda {
    border-left: none; padding-left: 0;
    border-top: 1px solid #e5e5e5; padding-top: 1.6rem;
  }
  .ficha-def { max-width: none; }
}
@media (max-width: 600px) {
  .slide--ficha, .slide--rejilla, .slide--par,
  .slide--pauta, .slide--mapa { padding: 1.5rem 1.5rem 3rem; overflow-y: auto; }
  .pauta li { gap: 0.9rem; }
}
```

### CSS de los tipos nuevos

```css
/* preguntas grandes */
.slide--preguntas-grandes { align-items: stretch; justify-content: center; text-align: left; padding: 4rem 6rem; }
.pg-titulo {
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em;
  text-transform: uppercase; color: #6f6f6f;
  max-width: 56rem; margin: 0 auto 1.8rem; width: 100%;
}
.pg { list-style: none; width: 100%; max-width: 56rem; margin: 0 auto; }
.pg li {
  font-size: clamp(1.25rem, 2.9vw, 2rem); font-weight: 900; color: #444;
  line-height: 1.25; padding: 0.7rem 0; border-bottom: 1px solid #e5e5e5;
}
.pg li:last-child { border-bottom: none; }
.pg--compacta li { font-size: clamp(1rem, 2.2vw, 1.5rem); padding: 0.5rem 0; }

/* titular de un diagrama */
.slide--visual { gap: 0.4rem; }
.visual-titulo {
  font-family: 'Roboto', sans-serif;
  font-size: clamp(1rem, 2.1vw, 1.45rem);
  font-weight: 900; color: #444; line-height: 1.3;
  max-width: 60ch; margin-bottom: 0.4rem;
}

/* fuente al pie de un slide--parrafo */
.slide-fuente {
  font-size: 0.82rem; color: #6f6f6f; max-width: 60%;
  margin-top: 1.4rem; line-height: 1.5; text-align: left;
}
```

La tira de componentes (`slide--demo`) no se copia: se escribe para cada caso, porque los
controles dependen de lo que la clase esté enseñando. Lo que sí se copia son las dos
guardas de JavaScript de más arriba.

Añadir también los cinco selectores al bloque de `prefers-reduced-motion`, junto a los demás.

---

## Clases de animación: cuándo aplicar cada una

Cada slide lleva una clase adicional según su función. El CSS ya define la animación
correspondiente — solo hay que aplicar la clase correcta.

| Clase | Animación | Cuándo usarla |
|---|---|---|
| *(ninguna)* | fade 300ms | Slides de oración narrativa — la mayoría |
| `slide--section` | scaleIn 400ms | Slides de título de bloque (`#eeff41`), portada, "ACTIVIDAD", "POSTMORTEM" |
| `slide--conclusion` | riseIn 450ms | El slide que cierra un argumento o un bloque temático. Máx. 1 por bloque. |
| `slide--visual` | drawIn stagger | Todo slide con SVG — los nodos aparecen uno a uno |
| `slide--ficha` | drawIn stagger | Ficha de concepto — las celdas entran una tras otra |
| `slide--rejilla` | drawIn stagger | Trío o 2×2 |
| `slide--par` | drawIn stagger | Dos columnas en contraste |
| `slide--pauta` | drawIn stagger | Lista operativa — los ítems entran en orden |
| `slide--mapa` | drawIn stagger | Índice de un bloque |

```html
<!-- Ejemplo de cada clase -->
<div class="slide slide--section" style="background:#eeff41;">...</div>
<div class="slide slide--conclusion">...</div>
<div class="slide slide--visual">...<svg>...</svg>...</div>
```

**Criterio para `slide--conclusion`:** ¿este slide cierra algo? Si la oración funciona como
remate de un argumento ("El usuario tiene que aprender las reglas del mundo, y el mundo
debe cumplirlas siempre") → es conclusión. Si simplemente avanza la narrativa → no lo es.

---

## Reglas de voz y redacción

| ✅ Usar | ❌ Evitar |
|---|---|
| Frases completas como oraciones | Listas con bullet points |
| "La clase pasada, hablamos de..." | "Recordemos que:" + lista |
| "Decíamos que cuando..." | Subtítulos + párrafos |
| "Hoy me gustaría que habláramos de..." | Títulos genéricos tipo "Introducción" |
| Primera persona plural (hablamos, vamos) | Tercera persona formal |
| Una pregunta retórica como slide completo | Preguntas dentro de párrafos |
| Frases que fluyen de una a otra | Ideas independientes sin hilo |

Cada slide debe poder leerse como continuación del anterior. Si se leen en voz alta uno
tras otro, deben sonar como un monólogo coherente.

---

### Las comas, que en español no funcionan como en inglés

Este es un error que se cuela solo cuando el texto lo produce un modelo, y hay que
buscarlo a propósito. En inglés se pone una coma antes de la conjunción por cadencia; en
español no.

**Coma serial: no existe.** «Presencialmente, por teléfono~~,~~ o por una app».
«Qué hace la persona, qué hace el sistema~~,~~ y cómo se reparten el trabajo».

**Coma de ritmo antes de conjunción: sobra** cuando la conjunción coordina dos predicados
o dos complementos del **mismo sujeto**, sin contraste ni cambio de sentido. El caso que
más se repite son las interrogativas coordinadas:

```
❌ ¿Qué información deja pasar, y cuál no?      ✅ ¿Qué información deja pasar y cuál no?
❌ Es lo más fácil, y lo primero que se agota.  ✅ Es lo más fácil y lo primero que se agota.
❌ Quién carga con el error, y cuándo se entera ✅ Quién carga con el error y cuándo se entera
```

**Sí lleva coma antes de y/o/e/u** en cuatro casos, y hay que dejarlos en paz:

1. La enumeración es compleja: sus miembros ya llevan comas dentro.
   *«…(Rozin, Wooden Mirror, 1999), y el juego cuyo idioma…»*
2. Se cierra un inciso.
   *«alguien que va caminando, con audífonos y un reloj, y que no quiere recorrer una lista»*
3. Hay cambio de sujeto con contraste.
   *«Alguien dice que siempre revisa el total, y uno lo mira pagar sin revisar nada»*
4. La coma desambigua porque el miembro anterior ya tiene un *y*.
   *«Sanders y Stappers (2012), y la documentación de Apple»*

**Y «porque»:** la causal pura va sin coma —explica la causa del hecho—; solo la
explicativa la lleva, cuando justifica por qué se dice lo que se dice.

```
❌ Tiene que acordarse de cuánta plata metió, porque la pantalla dejó de mostrarlo.
✅ Tiene que acordarse de cuánta plata metió porque la pantalla dejó de mostrarlo.
```

## Editorial pass — revisión final obligatoria

Antes de generar el HTML, aplicar este filtro al guión o al contenido recibido. El estilo
de William es directo y aforístico: una idea enunciada con precisión, sin rodeos, sin
confirmación de lo que acaba de decirse.

### Cortes obligatorios

**1. Reformulaciones con sinónimos.** Si dos slides consecutivos dicen lo mismo con
palabras distintas, conservar solo la versión más precisa o más directa. La redundancia
más común: enunciar una idea, luego "explicarla" con una oración que la repite.

```
❌ ANTES:
"Los constraints son límites que ayudan a prevenir errores"
"Son barreras que protegen la coherencia del sistema"

✅ DESPUÉS: solo el primero, o fusionar en uno más completo
```

**2. Preguntas retóricas que repiten el slide anterior.** Una pregunta retórica como slide
solo tiene sentido si abre algo nuevo, no si parafrasea lo que ya se dijo.

```
❌ ANTES:
"La acción emerge del contexto"
"¿Y qué pasa cuando el contexto falla?"  ← repite implícitamente lo anterior

✅ DESPUÉS: ir directo a la consecuencia
"Cuando el sistema interpreta mal el contexto, el usuario pierde el control"
```

**3. Frases puente vacías.** Eliminar frases de transición que no añaden contenido:
"Y aquí aparece un concepto importante", "Pero además de X, también tenemos Y",
"Porque al final...", "Y aquí es donde...". Si el slide siguiente ya introduce el
concepto, la transición sobra.

**4. Listas que podrían ser una sola oración.** Si una lista de 3–4 ítems puede decirse en
una frase, decirla en una frase.

```
❌ ANTES (lista):        ✅ DESPUÉS (oración):
· claras                 "Tienen que sentirse claras,
· coherentes              coherentes y predecibles"
· predecibles
· consistentes
```

**5. Cierres que anuncian el siguiente slide.** El último slide de un bloque no debe decir
lo que viene después. Cerrar el argumento actual; el siguiente slide ya se presenta solo.

**6. El tic del «no es X, sino Y».** Es el giro favorito de un modelo escribiendo en
español, y se nota. En la v1 del deck s04 aparecía en **diez diapositivas de noventa y
seis** —«no es la misma interfaz traducida a otro canal», «no es poner varias interfaces
juntas», «la pregunta no es cuál es mejor», «no están armando un acertijo»—. Leído
seguido, el argumento parece llevar siempre al mismo sitio.

Es contable, así que hay que contarlo antes de entregar:

```bash
grep -oE '\bno es\b|\bNo es\b' deck.html | wc -l
```

Se conserva solo donde **la distinción es el contenido** —una definición que se construye
por oposición, una precisión contra un lugar común—. En los demás sitios se reemplaza por
lo que la diapositiva realmente aporta: un dato, un mecanismo, una atribución, un ejemplo.

**7. La densidad no es el problema.** El problema es la información sin función. Una
diapositiva puede llevar definición, diagrama, etiquetas, ejemplo y pregunta al mismo
tiempo si todos esos elementos sirven a la misma idea. **No reduzcas contenido solo para
que se vea minimalista:** estas presentaciones son documentos autónomos, tienen que poder
leerse sin el profesor, y también usarse con él. Lo que sí hay que mantener es la
jerarquía visual y el aire.

Corolario: **una definición completa vive en una sola diapositiva.** No se parte en tres
para aligerarla. Si es un término que el curso va a seguir usando, va entera y en
`slide--cita`, para que se pueda copiar del proyector.

### Señal de que el editorial pass funcionó

Al leer el guión editado en voz alta, cada oración debe añadir algo que la anterior no
dijo. Si se puede saltar un slide y la narrativa sigue teniendo sentido, ese slide sobra.

---

## HTML: estructura técnica

> **Antes de copiar la plantilla de abajo: el shell técnico se toma del último deck
> publicado, no de este documento.** La plantilla que sigue es la base mínima y quedó por
> detrás de los decks reales. Desde s02 los decks traen cosas que acá no están y que no se
> pueden perder:
>
> - **barra de progreso** (`.progress-track` / `#progressFill`) — este documento decía
>   «sin barra de progreso»; los decks la llevan y funciona. Manda el deck.
> - **menú de secciones autogenerado** recorriendo `.section-theme` y `.tema-central`.
>   Es lo que hace que los rangos del outline se puedan recalcular, y conviene recortar
>   las etiquetas largas a ~52 caracteres o el menú se desborda.
> - **lazy-load por `data-src`** — así se cargan los QR.
> - **gestos táctiles** con umbral y descarte del swipe vertical, y `100dvh`.
> - **`e.stopPropagation()` en los `<a>`**, más la guarda de `.demo` y la del teclado en
>   campos de texto (ver `slide--demo`).
> - **portada con fondo `#eeff41`** — este documento dice blanco; los decks se desviaron
>   y se ven mejor así.
> - **`#6f6f6f` para texto secundario, nunca `#888`** (piso AA, ver §Reglas de color).
> - clases propias que conviene conservar: `.slide--cita`, `.tema-central` / `.tema-sub`,
>   `.section-kicker`, `.refs-title` / `.refs-list`, `.hl`.
>
> Lo práctico: partir el HTML del deck anterior en tres —cabecera con el `<style>`, las
> diapositivas, y el cromo con el `<script>`— y escribir solo las diapositivas.


```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clase N — [Tema] | Pensamiento Sensorial</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');

    /* Reset y base */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Roboto', sans-serif;
      background: #000;
      overflow: hidden;
      height: 100vh;
    }

    /* Contenedor de slides */
    .slides-container {
      width: 100%;
      height: 100vh;
    }

    /* Slide individual */
    .slide {
      display: none;
      width: 100%;
      height: 100vh;
      background: #fff;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 4rem;
      text-align: center;
    }

    .slide.active { display: flex; }

    /* Tipografía principal — Roboto Black */
    .slide-title {
      font-size: clamp(1.8rem, 4vw, 3.2rem);
      font-weight: 900;
      color: #444;
      line-height: 1.3;
      max-width: 75%;
    }

    .slide-subtitle {
      font-size: clamp(1rem, 2vw, 1.4rem);
      font-weight: 400;
      color: #888;
      margin-top: 0.75rem;
    }

    /* Slide de imagen */
    .slide-image {
      max-width: 65%;
      max-height: 70vh;
      object-fit: contain;
    }

    /* Slide de dimensión con párrafo */
    .slide-concept-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #444;
      margin-bottom: 1.5rem;
    }
    .slide-concept-body {
      font-size: 1.1rem;
      color: #555;
      max-width: 60%;
      line-height: 1.75;
      text-align: left;
    }

    /* Portada SENSORIAL */
    .portada-top {
      font-size: 3rem;
      font-weight: 400;
      color: #444;
      letter-spacing: 0.02em;
    }
    .portada-bottom {
      font-size: 5rem;
      font-weight: 700;
      color: #222;
      letter-spacing: 0.05em;
    }

    /* ── Animaciones selectivas ── */

    /* Base: fade suave para todos los slides */
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* Conclusión: el texto sube desde abajo (rise) */
    @keyframes riseIn {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Transición / sección: leve pulso de escala */
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.96); }
      to   { opacity: 1; transform: scale(1); }
    }

    /* Infografía SVG: los hijos animan con stagger */
    @keyframes drawIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .slide.active                    { animation: fadeIn  0.3s ease forwards; }
    .slide.active.slide--conclusion  { animation: riseIn  0.45s ease-out forwards; }
    .slide.active.slide--section     { animation: scaleIn 0.4s ease-out forwards; }
    .slide.active.slide--visual svg > * {
      opacity: 0;
      animation: drawIn 0.4s ease-out forwards;
    }
    /* Stagger para elementos SVG (hasta 12 nodos) */
    .slide--visual svg > *:nth-child(1)  { animation-delay: 0.05s; }
    .slide--visual svg > *:nth-child(2)  { animation-delay: 0.15s; }
    .slide--visual svg > *:nth-child(3)  { animation-delay: 0.25s; }
    .slide--visual svg > *:nth-child(4)  { animation-delay: 0.35s; }
    .slide--visual svg > *:nth-child(5)  { animation-delay: 0.45s; }
    .slide--visual svg > *:nth-child(6)  { animation-delay: 0.55s; }
    .slide--visual svg > *:nth-child(7)  { animation-delay: 0.65s; }
    .slide--visual svg > *:nth-child(8)  { animation-delay: 0.75s; }
    .slide--visual svg > *:nth-child(9)  { animation-delay: 0.85s; }
    .slide--visual svg > *:nth-child(10) { animation-delay: 0.95s; }
    .slide--visual svg > *:nth-child(11) { animation-delay: 1.05s; }
    .slide--visual svg > *:nth-child(12) { animation-delay: 1.15s; }

    /* Indicador de navegación */
    .nav-hint {
      position: fixed;
      bottom: 1.5rem;
      right: 2rem;
      font-size: 0.75rem;
      color: #ccc;
    }

    /* Accesibilidad */
    @media (prefers-reduced-motion: reduce) {
      .slide.active,
      .slide.active.slide--conclusion,
      .slide.active.slide--section,
      .slide.active.slide--visual svg > * {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }
  </style>
</head>
<body>
  <div class="slides-container">
    <!-- SLIDES AQUÍ -->
  </div>
  <div class="nav-hint">← →</div>

  <script>
    let current = 0;
    const slides = document.querySelectorAll('.slide');

    function show(n) {
      slides.forEach(s => {
        s.classList.remove('active');
        // Re-trigger animation: forzar reflow
        void s.offsetWidth;
      });
      current = (n + slides.length) % slides.length;
      const next = slides[current];
      next.classList.add('active');
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') show(current + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') show(current - 1);
    });

    document.addEventListener('click', () => show(current + 1));
    show(0);
  </script>
</body>
</html>
```

---

## Plantillas de slide por tipo

### Slide oración simple (el más común)
```html
<div class="slide">
  <p class="slide-title">La mayoría de las veces nos concentramos en el prototipo como sustantivo, y no en la acción, en el verbo prototipar</p>
</div>
```

### Slide de portada del curso
```html
<div class="slide slide--section">
  <p class="portada-top">Pensamiento</p>
  <p class="portada-bottom">SENSORIAL</p>
</div>
```

### Slide de sección/tema nuevo
```html
<div class="slide slide--section" style="background: #eeff41;">
  <p class="slide-title" style="font-size: 3.5rem; letter-spacing: 0.03em; color: #111;">MICROINTERACCIONES</p>
  <p class="slide-subtitle" style="color: #333;">Detalles que importan</p>
</div>
```

### Slide de imagen pura
```html
<div class="slide">
  <img src="ruta/imagen.jpg" class="slide-image" alt="">
</div>
```

### Slide de concepto con párrafo (para dimensiones del Frogger, etc.)
```html
<div class="slide" style="align-items: flex-start; padding: 6rem 10rem;">
  <p class="slide-concept-title">Tiempo — ¿Cuándo ocurre el feedback?</p>
  <p class="slide-concept-body">
    Puede ser inmediato —una reacción instantánea—, retardado —una respuesta que toma
    unos segundos—, o progresivo —un cambio que se desarrolla en el tiempo.<br><br>
    El tiempo afecta la percepción de causa y efecto. Si el feedback se retrasa, el usuario
    puede no relacionarlo con su acción.
  </p>
</div>
```

### Slide de espera (inicio de clase)
```html
<div class="slide" style="gap: 2rem;">
  <img src="https://media.giphy.com/media/{ID}/giphy.gif" style="max-width: 40%; border-radius: 8px;" alt="gif de espera">
  <p class="slide-title">Gracias por la puntualidad</p>
  <p class="slide-subtitle">En breve comenzamos</p>
</div>
```

---

## Checklist antes de entregar

- [ ] Slide 1 = espera con GIF de gato (URL de Giphy real) + texto de bienvenida
- [ ] Hay 1–3 GIFs adicionales en momentos de respiro, ilustración o punchline
- [ ] Todos los GIFs van solos en su slide (excepto el de espera)
- [ ] Títulos usan `font-weight: 900` (Roboto Black)
- [ ] Slides de sección llevan `slide--section` (scaleIn)
- [ ] Slides de cierre de argumento llevan `slide--conclusion` (riseIn), máx. 1 por bloque
- [ ] Slides con SVG llevan `slide--visual` (drawIn stagger)
- [ ] Editorial pass aplicado: sin reformulaciones, sin puentes vacíos, sin listas innecesarias
- [ ] Cada slide tiene máximo UNA idea
- [ ] No hay bullet points en ningún slide, salvo en un `slide--pauta`, que es una consigna
      para copiar y no un argumento
- [ ] Ningún bloque tiene a la vez su rejilla y un SVG que repite las mismas celdas
- [ ] Todo SVG tiene al menos una flecha o línea de relación; si no, debía ser una rejilla
- [ ] En cada layout compuesto, el amarillo marca una sola celda como máximo, y el texto de
      esa celda dice por qué es distinta
- [ ] Ningún layout compuesto pasa de cuatro celdas
- [ ] Las rejillas colapsan a una columna en pantallas angostas, sin markup duplicado
- [ ] Las frases suenan como monólogo continuo al leerse en voz alta
- [ ] Las imágenes van solas, sin texto
- [ ] El archivo HTML funciona solo con click o flechas de teclado
- [ ] Fondo blanco, texto `#444`/`#888`, fuentes Roboto desde Google Fonts
- [ ] Slides de transición/título tienen fondo `#eeff41` con texto `#111`
- [ ] Si el tema tiene 3+ dimensiones, comparación o proceso → hay un slide SVG
- [ ] Los SVG usan solo los tokens del sistema: `#eeff41`, `#222`, `#444`, `#888`, Roboto
- [ ] El slide visual va después de la explicación textual, nunca antes
- [ ] Sin número de slide visible
- [ ] El shell técnico salió del último deck, no de la plantilla mínima de este documento
- [ ] Cada diagrama aguanta que lo señalen: se puede apuntar a una parte y preguntar algo
- [ ] Ningún concepto quedó convertido en ficha cuando podía ser un diagrama
- [ ] Las definiciones están completas y en una sola diapositiva
- [ ] Se contó el giro «no es X, sino Y» y solo quedó donde la distinción es el contenido
- [ ] Ninguna diapositiva existe solo para anunciar la siguiente
- [ ] Comas revisadas: ni coma serial, ni coma de ritmo antes de conjunción
- [ ] Ninguna afirmación técnica sin verificar en documentación oficial, con modelo y versión
- [ ] Ningún bloque presenta como revelación algo que la clase ya sabía
- [ ] Si hay componentes interactivos, van dentro de `.demo` y el teclado se cede en los campos

---

## Notas sobre contenido académico

**No montar un bloque como revelación de algo que la clase ya sabe.** El s04 llegó a tener
un bloque construido sobre la idea de que los estudiantes creían que «interfaz = pantalla»
y había que corregirlos. Era falso: eso ya se les había dicho en clase —de viva voz, sin
diapositiva—, y presentarlo como novedad dejaba al profesor contradiciéndose delante de su
grupo. **Antes de escribir «casi todos creíamos que…», hay que preguntar qué se dijo ya,
incluso lo que no quedó proyectado.** El movimiento correcto casi nunca es corregir una
creencia: es empujar una que ya tienen hasta su consecuencia incómoda.

**Verificar toda capacidad técnica antes de publicarla.** Si el material afirma que un
aparato hace algo, hay que comprobarlo en la documentación oficial del fabricante y
escribir **el modelo y la versión exactos**. Presentar como universal algo que existe en
un solo modelo es un error de la misma familia que inventarse una cita. En el s04, la
verificación produjo además el mejor material del ejercicio: los gestos de cabeza de los
AirPods solo funcionan respondiendo a un anuncio de Siri, o sea que usarlos obliga a que
el sistema hable primero — una restricción real que decide quién abre la interacción.

William es estricto con las fuentes: **nunca fabricar frameworks o autores**. Si el tema
requiere citar a alguien (ej: Wensveen et al., Dan Saffer), usar solo fuentes verificables
o preguntar. El skill es para forma y estructura — el contenido académico lo aporta William
o se basa en fuentes reales confirmadas.
