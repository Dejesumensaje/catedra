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
- Color de texto: **gris oscuro `#444`** (títulos) y **`#888`** (subtítulos)
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

### Señal de que el editorial pass funcionó

Al leer el guión editado en voz alta, cada oración debe añadir algo que la anterior no
dijo. Si se puede saltar un slide y la narrativa sigue teniendo sentido, ese slide sobra.

---

## HTML: estructura técnica

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
- [ ] No hay bullet points en ningún slide
- [ ] Las frases suenan como monólogo continuo al leerse en voz alta
- [ ] Las imágenes van solas, sin texto
- [ ] El archivo HTML funciona solo con click o flechas de teclado
- [ ] Fondo blanco, texto `#444`/`#888`, fuentes Roboto desde Google Fonts
- [ ] Slides de transición/título tienen fondo `#eeff41` con texto `#111`
- [ ] Si el tema tiene 3+ dimensiones, comparación o proceso → hay un slide SVG
- [ ] Los SVG usan solo los tokens del sistema: `#eeff41`, `#222`, `#444`, `#888`, Roboto
- [ ] El slide visual va después de la explicación textual, nunca antes
- [ ] Sin número de slide visible, sin barra de progreso

---

## Notas sobre contenido académico

William es estricto con las fuentes: **nunca fabricar frameworks o autores**. Si el tema
requiere citar a alguien (ej: Wensveen et al., Dan Saffer), usar solo fuentes verificables
o preguntar. El skill es para forma y estructura — el contenido académico lo aporta William
o se basa en fuentes reales confirmadas.
