# Bitácoras de la sesión 2 — cómo se opera

Esta carpeta es lo único del repositorio que no es estático. Cloudflare Pages la
recoge aparte del build de Astro: el sitio sigue compilando a HTML plano, sin
adapter y sin SSR, y esto corre en el edge solo cuando alguien llama `/api/…`.

## 1. Configuración en Cloudflare (una sola vez, a mano)

Panel de Cloudflare → el proyecto de Pages → **Settings**:

| Dónde | Qué | Valor |
|---|---|---|
| Bindings → KV namespace | `BITACORA` | un namespace nuevo (crear en Workers & Pages → KV) |
| Environment variables | `CLAVE_DOCENTE` | la que quieras; solo la usas tú |
| Environment variables | `CLAVE_CLASE` | opcional. Si falta, queda `udea2026`, la misma del deck |

Hay que ponerlo en **Production** y, si vas a probar en una preview, también en
Preview. Sin el binding KV nada se guarda: el endpoint responde 503 y el
formulario le dice al estudiante que su respuesta quedó en el teléfono.

Es el único paso que no está en el repositorio, y es el único que hay que hacer
antes de la clase.

## 2. Las tres superficies

| Ruta | Cuándo | Quién entra |
|---|---|---|
| `/pensamiento-sensorial/bitacora` | al llegar, antes de la teoría | los estudiantes |
| `/pensamiento-sensorial/bitacora-otra-vez` | después de la teoría | los estudiantes |
| `/pensamiento-sensorial/bitacora-resultados` | la clase siguiente | solo tú, con `CLAVE_DOCENTE` |

Las tres llevan `noindex`, están fuera del sitemap y bloqueadas en `robots.txt`.
No están enlazadas entre sí; la del momento 1 aparece en los materiales de la
sesión y las otras dos se reparten por QR en el salón.

Los QR están en `public/presentaciones/ps3/s02/assets/qr-bitacora*.svg`.

## 3. La lista del curso

`src/data/estudiantes-ps3.ts`. Se edita antes de clase y **no se toca entre el
momento 1 y el momento 2**: la llave de emparejamiento se deriva del texto del
nombre, así que corregir una tilde a mitad de camino desempareja a esa persona.

Ese archivo se publica dentro del HTML del formulario. Por eso la convención es
nombre + inicial del apellido, no nombre completo.

## 4. El análisis, entre la clase 2 y la 3

```sh
ANTHROPIC_API_KEY=... CLAVE_DOCENTE=... node scripts/analizar-bitacora.mjs
```

Corre una vez, no en cada refresco. Baja las respuestas, le pide al modelo lo
único que un conteo no puede hacer —agrupar los relatos en temas y redactar
tensiones— y escribe `src/data/analisis-bitacora-s02.json`.

Después:

1. Lee el JSON completo. Es lo que se va a proyectar.
2. Edita lo que no suene tuyo y borra lo que no sea cierto.
3. Cambia `revisado` a `true`. El tablero dice en voz alta cuando sigue en
   `false`, que es la forma de que no se proyecte algo sin leer.
4. Commit y push.

## 5. Qué se guarda y dónde

- **En KV**: las respuestas crudas, relatos incluidos. Es operativo y efímero.
- **En el repositorio**: solo el análisis curado y los conteos. Nunca un relato.

Esa separación no es una preferencia: el repositorio es público y §7 de
`AGENTS.md` no admite trabajo estudiantil sin consentimiento registrado. El
tablero tampoco muestra nombres — cada fila del emparejamiento es una
experiencia, no una persona.

Al modelo se le mandan los relatos sin ningún identificador, y el system prompt
le prohíbe inferir datos sensibles y nombrar a terceros.

## 6. Si algo falla en el salón

- **«No se pudo enviar»**: la respuesta quedó en el `localStorage` del teléfono.
  El botón dice «Reintentar» y funciona. Si el wifi no vuelve, el momento 2
  igual precarga desde el teléfono.
- **El momento 2 no precarga**: el estudiante cambió de dispositivo o no
  respondió el momento 1. La página lo detecta y le deja escribir los tres
  nombres cortos a mano. El ejercicio sigue.
- **El tablero no carga**: revisa que `CLAVE_DOCENTE` esté puesta en el panel.
  Sin ella el volcado responde 503, no 401.

## 7. Probarlo localmente

```sh
npm run build
npx wrangler pages dev dist --kv BITACORA --binding CLAVE_DOCENTE=prueba
```

Levanta el sitio con un KV en memoria en `localhost:8788`. Las respuestas se
borran al apagarlo.

Con eso corriendo, `scripts/prueba-bitacora.mjs` recorre el ejercicio completo
en un navegador de verdad y comprueba dieciocho cosas, entre ellas las tres que
más duelen si fallan en clase: que el momento 2 precargue las etiquetas del
momento 1, que alguien sin momento 1 pueda seguir escribiéndolas a mano, y que
cambiar de nombre no arrastre las respuestas del anterior. Playwright no es
dependencia del sitio, así que se instala aparte; las instrucciones están en la
cabecera del propio archivo.
