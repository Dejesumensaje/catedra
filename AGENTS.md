# Cátedra — repositorio docente de William Montoya

Sitio estático de los cursos que dicto. Público desde el día uno. En español.
Primer curso: **Pensamiento Sensorial 3.0** (Universidad de Antioquia, ago–nov 2026).

Este archivo es la especificación del sistema. `CLAUDE.md` apunta aquí.
Cualquier modelo o herramienta que trabaje en este repo lee este archivo primero.

---

## 1. Qué es este sitio y qué no es

**Es** el complemento público de Google Classroom: programa navegable, presentaciones,
referentes, materiales, y —lo más importante— la **memoria** de lo que realmente pasó
en cada sesión.

**No es** un LMS. No hay login, no hay entregas, no hay notas. Eso vive en Classroom.

La tesis del sitio: un curso que enseña que el conocimiento está en la distancia entre
lo que esperábamos y lo que ocurrió, debe publicar esa distancia. Por eso cada sesión
tiene dos capas:

| Capa | Cuándo se escribe | Qué contiene |
|---|---|---|
| **Programa** | antes de la clase | pregunta central, tensión, conceptos, laboratorio, referentes, deck |
| **Memoria** | después de la clase | qué esperaba, qué pasó, qué evidencia hay, qué cambia |

Una sesión sin memoria está incompleta. Una sesión sin programa no se publica.

---

## 2. Stack y restricciones

- **Astro 5+**, salida 100% estática. Sin backend, sin base de datos, sin runtime.
- **Content collections** con schema Zod en `src/content.config.ts`. El schema es la ley:
  si el build falla por validación, el contenido está mal, no el schema.
- **CSS propio.** Sin Tailwind, sin librerías de componentes, sin frameworks de UI.
- **Cero JavaScript de cliente** salvo que una pieza lo exija de verdad.
- Deploy en push a `main`.

### Regla no negociable

**El `.mdx` de la sesión es la fuente de verdad. El deck es una renderización.**

Nunca escribir contenido que solo exista dentro del HTML de una presentación. Si algo
importa, va primero en el `.mdx`. Al terminar el semestre debe ser posible reconstruir
todo el curso sin abrir un solo deck.

---

## 3. Estructura

```
.
├── AGENTS.md               ← este archivo
├── CLAUDE.md               ← puntero a este archivo
├── .claude/commands/       ← comandos del flujo semanal
├── skills/
│   └── pensamiento-sensorial-slides/   ← estilo de las presentaciones (NO TOCAR)
├── src/
│   ├── content.config.ts   ← schema
│   ├── content/
│   │   ├── cursos/         ← un .mdx por curso
│   │   ├── sesiones/       ← un .mdx por sesión: {curso-slug}-sNN.mdx
│   │   ├── referentes/     ← un .mdx por referente
│   │   └── tensiones/      ← un .mdx por tensión (específicas de cada curso)
│   ├── layouts/
│   ├── components/
│   ├── styles/
│   └── pages/
├── public/
│   └── presentaciones/
│       └── ps3/s01/index.html   ← decks standalone, se abren solos para proyectar
└── outlines/
    └── ps3-s01.outline.md       ← paso intermedio del deck (ver §5)
```

### Rutas

```
/                              hub docente
/pensamiento-sensorial         curso: programa, recorrido, evaluación
/pensamiento-sensorial/s07     sesión
/pensamiento-sensorial/tensiones
/pensamiento-sensorial/referentes
/politica-de-uso               consentimiento y créditos
/licencia                      CC BY-NC-ND 4.0 para el material; código con derechos reservados
```

---

## 4. Trabajo con varios modelos

Este repo se trabaja mezclando modelos para optimizar costo. La división no es
arbitraria: **el modelo caro decide, el modelo barato produce.**

| Tarea | Modelo | Por qué |
|---|---|---|
| Editar el guión, decidir la estructura de una sesión | alto (Opus) | juicio pedagógico |
| Revisar el outline del deck | alto | es donde se juega la calidad |
| Convertir outline aprobado → HTML del deck | bajo (Sonnet/Kimi) | mecánico, muchos tokens |
| Escribir la memoria desde notas dictadas | bajo | reformateo |
| Indexar referentes, generar índices | bajo | mecánico |
| Ajustes de CSS y layout | bajo | acotado |
| Refactors del schema o de rutas | alto | rompe cosas |

### Consecuencias para cómo se escriben las instrucciones

- **Nada implícito.** No asumir que el modelo descubre un skill solo. Los comandos citan
  rutas de archivo explícitas.
- **Nada específico de un proveedor** en este archivo ni en los comandos.
- El estilo de las presentaciones vive en `skills/pensamiento-sensorial-slides/SKILL.md`
  y se lee como documento normal, no como capacidad automática.
- Si un modelo no puede leer un archivo referenciado, **para y pregunta**. No improvisar
  el estilo de las presentaciones: es muy específico y no se deduce.

---

## 5. Flujo semanal

Tres pasos. El segundo existe para que el paso caro sea corto.

```
/nueva-clase 07        →  sesión .mdx + referentes + outlines/ps3-s07.outline.md
   [William revisa el outline: una línea por slide, barato de leer]
/generar-deck 07       →  public/presentaciones/ps3/s07/index.html
   [clase]
/memoria-clase 07      →  bloque memoria en el .mdx, estado → con-memoria
```

**Por qué el outline intermedio:** revisar 40 slides en HTML cuesta miles de tokens y es
incómodo. Revisar 40 líneas de texto cuesta poco y es donde realmente se decide si la
clase está bien construida. Una vez aprobado el outline, generar el HTML es mecánico y
puede hacerlo el modelo barato.

Ningún comando hace `git push` sin confirmación explícita.

---

## 6. Estados de una sesión

El sitio está en vivo desde antes de la primera clase. Que 15 de 16 sesiones estén
vacías no es un defecto: es el arco del curso, visible desde el día uno.

- `programada` — existe el programa, no se ha dictado. Se muestra con la pregunta
  central y la tensión, sin deck.
- `dictada` — ya ocurrió, hay deck y materiales, falta la memoria.
- `con-memoria` — completa.

Nunca inventar contenido para llenar una sesión futura. Una sesión `programada` con solo
su pregunta central es correcta.

---

## 7. Trabajo de estudiantes y consentimiento

Todo trabajo estudiantil publicado requiere consentimiento registrado. El campo
`permisos` es obligatorio y **su valor por defecto es `anonimo`**.

- `nombre-completo` — se acredita con nombre
- `iniciales` — solo iniciales
- `anonimo` — sin atribución

Si no hay registro de consentimiento, no se publica. Ni fotos, ni prototipos, ni citas.
Ante cualquier duda: no publicar y preguntar.

Esto aplica también a la memoria: al describir lo que pasó en clase, nunca identificar a
un estudiante por su error. Los comportamientos se describen sin dueño.

---

## 8. Voz

La misma del programa del curso: precisa, sin entusiasmo de marketing, sin emojis en el
contenido publicado.

- Frases cortas. Una idea por párrafo.
- Nunca "descubre", "potencia", "revoluciona", "sumérgete".
- La memoria se escribe en primera persona y admite lo que no funcionó. Es el punto.
- No inventar autores, frameworks ni citas. Si algo requiere fuente y no está confirmada,
  se deja marcado `[fuente pendiente]` y se pregunta.

---

## 9. Dirección visual

El sistema deriva de materiales que ya existen, no de una identidad nueva.

**Distinción deliberada:** las presentaciones son Roboto sobre blanco (se proyectan, se
leen a distancia, una idea por slide). El sitio es un objeto de lectura y usa **PT Serif**
para el cuerpo — la tipografía del portafolio. Misma familia de decisiones, dos registros.

```
Amarillo señal   #eeff41    solo para marcar tensión y estado, nunca decorativo
Tinta            #222222
Texto            #444444
Secundario       #888888
Papel            #ffffff
Regla            #e5e5e5
```

**Tipografía:** PT Serif para cuerpo y citas. Roboto para navegación, etiquetas y datos.
Nada más.

**Elemento distintivo:** el símbolo `↔` de las tensiones como dispositivo estructural del
sitio. Las tensiones son la columna vertebral del programa 3.0; el sitio las usa como
sistema de navegación transversal, no como una página más. Una sesión se puede alcanzar
por número o por la tensión que trabaja.

**Restricciones:** sin border-radius decorativo, sin iconos genéricos. El amarillo aparece
poco; cuando aparece, significa algo. Responsive real, foco de teclado visible,
`prefers-reduced-motion` respetado.

- **Sin sombras suaves.** La única sombra permitida es dura y desplazada, sin desenfoque
  (`box-shadow: 8px 8px 0 …`): es un segundo contorno, no profundidad.
- **Sin degradados.** El `linear-gradient` solo se usa con parada dura, como marcador o
  como filo de color (`.hl`, el hover de la lista de sesiones).
- **Contraste AA como piso.** Ningún texto por debajo de 4.5:1 sobre papel. Por eso
  `--secundario` es `#6f6f6f` y no un gris más claro.
- **Nada comunica solo por color.** Un estado que se ve (una sesión con presentación,
  una sesión programada) también se escribe.
- **Todo rótulo de sección es un encabezado real.** `.mono` es una voz tipográfica, no un
  sustituto de `<h2>`.
- **Una superficie que se mueve al pasar el mouse tiene que ser clicable.** Es lo que este
  curso enseña; el sitio no puede contradecirlo.

---

## 10. Alcance por fases

**Antes del 6 de agosto:** schema, rutas, programa y evaluación navegables, página de
tensiones, sesión 1 completa, política de uso, deploy.

**Sesiones 1–5:** solo el ritual semanal. Ninguna feature nueva.

**Sesión 6 (10 sept):** primera revisión del modelo de contenido. Si algo no aguanta, se
refactoriza aquí. Este es el único momento planeado para refactorizar.

**Después de sesión 6:** capa de memoria, vista de referentes, lo que haga falta.

**No construir hasta que el ritual lleve 6 semanas funcionando:** buscador, modo oscuro,
RSS, comentarios, vista de bitácora estudiantil.

**Analytics:** ya resuelto con Cloudflare Web Analytics, activado desde el panel de Pages
(Settings → Web Analytics). La inyección es automática en el edge: **no agregar ningún
snippet de analítica al código**, ni GA, ni ningún otro.
