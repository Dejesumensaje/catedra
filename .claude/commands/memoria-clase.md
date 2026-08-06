---
description: Convierte notas dictadas después de clase en el bloque de memoria de la sesión
argument-hint: <numero-de-sesion> [curso-slug]
---

Modelo recomendado: **bajo**. Es reformateo, no interpretación.

Sesión: **$1** · Curso: **${2:-pensamiento-sensorial-3}**

Esta es la parte del sistema que más fácil se abandona y la que más valor acumula.
Debe tomar menos de cinco minutos.

## Cómo funciona

William dicta o escribe sin estructura. Tú ordenas eso en el bloque `memoria` del
`.mdx` de la sesión:

- **`esperado`** — qué creía que iba a pasar. Sale del programa de la sesión si él no lo
  dice explícitamente, pero solo si el programa lo deja claro.
- **`observado`** — qué pasó realmente.
- **`evidencia`** — hechos concretos, no impresiones. "El lab tomó 90 min y estaban
  presupuestados 60" es evidencia. "Salió bien" no lo es.
- **`sorpresa`** — algo que no anticipó. Opcional, pero es lo más valioso del registro.
- **`cambio`** — qué ajustaría para la próxima versión del curso. Opcional.
- **`escritaEl`** — la fecha de hoy.

Después: `estado: con-memoria`.

## Reglas

**Nunca identificar a un estudiante por su error.** Los comportamientos se describen sin
dueño: "un equipo interpretó la consigna al revés", nunca el nombre ni el grupo.

**No suavices.** Si dictó que el laboratorio no funcionó, la memoria dice que no funcionó.
El sitio publica esto a propósito: un curso que enseña que la distancia entre intención y
resultado es conocimiento, no puede maquillar la suya. Si detectas que estás matizando
algo para que suene mejor, no lo hagas.

**No inventes evidencia.** Si dictó una impresión sin dato, va en `observado`, no en
`evidencia`. Si el array queda vacío, se queda vacío.

**Distingue lo que dijo de lo que interpretas.** Si necesitas rellenar un campo con una
inferencia tuya, mejor déjalo vacío y pregúntale.

## Si menciona trabajo de estudiantes

No lo publiques todavía. Crea el archivo en `src/content/trabajos/` con
`consentimientoRegistrado: false` y `permisos: anonimo`, y avísale que necesita verificar
el consentimiento antes de que aparezca con atribución. Ver §7 de `AGENTS.md`.

## Al terminar

Commit `memoria sesión NN`. **Sin push.** Reporta en dos líneas qué quedó registrado y
qué campos quedaron vacíos.
