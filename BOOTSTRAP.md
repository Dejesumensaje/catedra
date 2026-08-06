# Arranque — primera sesión de Claude Code

Instrucciones para montar el repo. Borra este archivo cuando el scaffold esté en pie.

## Antes de abrir Claude Code

```bash
mkdir catedra && cd catedra
git init
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
npm install
npx astro add mdx
```

Luego copia dentro del repo:

- `AGENTS.md`, `CLAUDE.md`, `BOOTSTRAP.md` → raíz
- `.claude/commands/` → raíz
- `src/content.config.ts` → reemplaza el que genere Astro
- `src/content/` → los tres ejemplos
- tu `pensamiento-sensorial-slides/SKILL.md` → `skills/pensamiento-sensorial-slides/`

## Prompt de apertura (modelo alto)

> Lee `AGENTS.md` completo y `src/content.config.ts`. Este repo está recién inicializado
> con Astro; el schema y tres archivos de contenido de ejemplo ya existen.
>
> Antes de escribir código, dame un plan de la fase 1 (§10 de AGENTS.md) desglosado en
> tareas, marcando cuáles conviene delegar a un modelo barato según §4. No construyas
> nada todavía.
>
> Después de que apruebe el plan, empieza por hacer que `npm run build` pase con el
> contenido de ejemplo. Ese es el primer hito: schema validado y una ruta de sesión
> renderizando. El diseño viene después.

## Orden de construcción

1. Build verde con el contenido de ejemplo — antes que cualquier CSS.
2. Rutas: `/`, `/pensamiento-sensorial`, `/pensamiento-sensorial/s[numero]`.
3. Sistema visual según §9 (esto sí en modelo alto: es donde se decide el carácter).
4. Programa y evaluación como contenido navegable, no PDF colgado.
5. Página de tensiones con la navegación transversal.
6. `/politica-de-uso` con el consentimiento — **antes del primer deploy público**.
7. Deploy y dominio.

## Migración de contenido

Las 16 sesiones del programa 3.0 ya están escritas. Cárgalas todas de una vez como
`estado: programada` — así el sitio publica el arco completo desde el día uno, que es lo
que dice §6. Es una tarea mecánica: delegable a modelo barato con el schema a la vista.

Las 10 tensiones también entran completas de entrada. Son la navegación del sitio.

## Cuándo NO seguir el plan

Si en la fase 1 el schema se vuelve incómodo, no lo fuerces: ajústalo ahora, cuando hay
tres archivos de contenido. En septiembre habrá dieciséis y el costo será otro.

Todo lo demás espera a la revisión de la sesión 6.
