---
description: Convierte un outline aprobado en el HTML de la presentación
argument-hint: <numero-de-sesion> [curso-slug]
---

Modelo recomendado: **bajo** (Sonnet o Kimi). Es una tarea mecánica y costosa en tokens.
Todas las decisiones ya se tomaron en el outline.

Sesión: **$1** · Curso: **${2:-pensamiento-sensorial-3}**

## Entradas obligatorias

1. `outlines/{curso}-s{NN}.outline.md` — el guion de slides aprobado.
2. `skills/pensamiento-sensorial-slides/SKILL.md` — **el estilo completo**.
3. `src/content/sesiones/{curso}-s{NN}.mdx` — para el contenido de apoyo.

**Si no puedes leer el SKILL.md, detente y avisa.** El estilo de estas presentaciones es
muy específico y no se deduce ni se improvisa. Sin ese archivo no hay tarea.

## Qué haces

Sigues el outline **línea por línea, sin añadir ni quitar slides**. Si crees que falta
algo, lo reportas al final — no lo agregas por tu cuenta. El outline ya fue revisado.

Aplicas literalmente las reglas del SKILL.md: plantilla HTML base, tipografía, colores,
tratamiento de GIFs, animaciones por tipo de slide, y su checklist final.

Salida: `public/presentaciones/{curso-corto}/s{NN}/index.html`, archivo único que se abre
solo, navegable con flechas y clicks.

## Al terminar

1. Actualiza el campo `presentacion` en el `.mdx` de la sesión.
2. Cambia `estado` a `dictada` solo si William lo indica.
3. Recorre la checklist del SKILL.md y reporta cualquier ítem que no se cumpla.
4. Commit `deck sesión NN`. **Sin push.**

## Lo que nunca haces

- Inventar IDs de Giphy. Solo URLs verificables.
- Añadir bullets. Nunca hay bullets.
- Poner dos ideas en un slide.
- Cambiar la paleta, las fuentes o las animaciones definidas en el SKILL.md.
- Reescribir las frases del outline "para mejorarlas".
