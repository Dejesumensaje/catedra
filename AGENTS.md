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

### Rutas

```
/                              hub docente
/pensamiento-sensorial         curso: programa, recorrido, evaluación
/pensamiento-sensorial/s07     sesión
/pensamiento-sensorial/tensiones
/pensamiento-sensorial/referentes
/politica-de-uso               consentimiento y créditos
/licencia                      CC BY-NC-ND 4.0 para el material; código con derechos reservados
/diseno-visual                 enciclopedia de diseño visual: índice de territorios
/diseno-visual/proximidad      una entrada por concepto
```

### /diseno-visual

Publicación independiente de los cursos: una enciclopedia hecha de instrumentos
manipulables. No es material de una sesión y no sigue el flujo semanal.

- **Contenido:** `src/content/conceptos/<slug>.mdx` (schema `conceptos`). El `.mdx`
  importa sus propias experiencias y las intercala con el texto: no hay plantilla única.
- **Territorios y conceptos previstos:** `src/data/diseno-visual/territorios.ts`. El
  índice enlaza lo que tiene `.mdx` y lista el resto como «sin entrada».
- **Relaciones:** en el frontmatter, cada una con `porQue` obligatorio. Pueden apuntar
  a un concepto previsto sin entrada; el build falla si el slug no existe en ninguna parte.
- **Instrumentos:** `src/components/diseno-visual/experiencias/`, sobre el marco
  `controles/Instrumento.astro` y `src/lib/diseno-visual/estado.ts` (controles nativos,
  lectura en vivo, comparación A/B, estado en la URL).
- **JS de cliente:** aquí sí lo exige la pieza: los instrumentos son el contenido. TS
  vanilla en `<script>` de cada componente, sin dependencias.
- **Añadir un concepto:** escribir el `.mdx` y su experiencia. Si el slug no estaba
  previsto, aparece al final de su territorio sin tocar nada más. Su glifo del índice va
  en `components/diseno-visual/Glifo.astro`.
- **Voz:** todo texto de la sección sigue `docs/voz-editorial.md`, que precisa §8 para
  `/diseno-visual` y manda en lo que difiera. Leerla antes de escribir o revisar un texto.
- Mismo sistema visual (§9). Dentro del escenario de un instrumento, los colores son los
  que el fenómeno exija.

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

El paso de revisión es aparte y lo hacen subagentes baratos:

```
[antes de dar por terminada la sesión]
   subagente revisor-de-textos sobre el deck, las consignas y el .mdx
   subagente verificador-de-fuentes si hay referentes, citas o enlaces nuevos
   → reportan hallazgos con evidencia y propuesta; no editan nada
   → el modelo alto decide qué se aplica
```

Todo cambio visual se mira renderizado antes de darlo por bueno:
`node .claude/skills/verificar-render/verificar.mjs <ruta>` (ver su `SKILL.md`).

**Sobre el SKILL de las presentaciones.** Antes decía «NO TOCAR». La regla real es más
precisa: **no se improvisa el estilo**, porque es muy específico y no se deduce. Pero el
documento sí se actualiza cuando dictar una clase enseña algo —un tipo de diapositiva
nuevo, un error que se repitió, una contradicción entre lo que dice y lo que hacen los
decks—. Si un deck se desvía del SKILL y funciona mejor, manda el deck y el SKILL se
corrige.

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
