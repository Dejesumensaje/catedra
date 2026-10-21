# Sísifo — cuatro reglas para una roca

Laboratorio jugable sobre la fricción como mecánica narrativa. Parte de
*Let's Play: Ancient Greek Punishment*, de Pippin Barr
(<https://pippinbarr.com/lets-play-ancient-greek-punishment/>). Sus variaciones
experimentales cambian la relación entre esfuerzo, resistencia y resultado.

Ruta: `/demos/sisifo/` (`#castigo`, `#camino`, `#caida`, `#comunidad`, `#comunidad/CÓDIGO`,
`#comunidad/prueba`, `#creditos`).

**Sala de prueba** (`#comunidad/prueba`): sirve para jugar la comunidad sin reunir
a nadie y sin servidor. Corre en el navegador la misma autoridad que el servidor
(`nucleo/sala.js`), con personas simuladas que tocan a su ritmo, con rachas,
descansos y más empeño cuando la roca retrocede. Se suman o se quitan en vivo
(glifo `+`). La pantalla dice siempre que son simuladas. Ver `red/local.js`.

**Relación con la obra original.** El repositorio público de Pippin Barr no
declara licencia, así que aquí no se reutiliza su código, sus imágenes ni sus
sonidos. Todo es una implementación propia de la mecánica, con crédito en la
entrada y en `#creditos`.

## Arquitectura

```
public/demos/sisifo/
  nucleo/            reglas puras, sin DOM. Las usan el navegador, el servidor y las pruebas
    parametros.js    TODOS los números de equilibrio
    esfuerzo.js      toques → esfuerzo (decae, satura, ignora toques demasiado seguidos)
    fisica.js        cuerpo que rueda sobre un perfil
    sala.js          lógica autoritativa de una sala (servidor y sala de prueba)
    reglas/          castigo · camino · caida · comunidad: avance, resistencia, final
  escena/            dibujo (lienzo, figuras, roca, frases, polvo, energía colectiva)
  entrada/toque.js   el gesto: dedo, ratón o barra espaciadora
  red/cliente.js     WebSocket con reconexión y estados legibles
  experiencias/      cada versión: une regla + escena + entrada
workers/sisifo-sala/ Worker + Durable Object: la autoridad de cada sala multijugador
functions/api/sisifo/[[ruta]].js   Pages Function que reenvía /api/sisifo/* al Durable Object
```

Las versiones 1–3 simulan en el navegador. En la 4 el navegador **no simula**:
manda toques y dibuja el estado que difunde la sala, que es la única autoridad.
La sala usa la misma `nucleo/reglas/comunidad.js` (wrangler la empaqueta).

Para añadir una variación: una regla nueva en `nucleo/reglas/` (con `crear`,
`paso`, `aceptaToques` y, si quiere, `impulso`), sus números en `parametros.js`
y una experiencia de pocas líneas sobre `experiencias/solitaria.js`.

## Correr en local

```sh
# 1. servidor de salas (Durable Object en memoria)
cd workers/sisifo-sala && npx wrangler dev --port 8787

# 2a. solo el demo, contra ese servidor
cd public && python3 -m http.server 8080
#    → http://127.0.0.1:8080/demos/sisifo/?servidor=http://127.0.0.1:8787

# 2b. o el sitio completo como en producción (mismo origen, Pages Function incluida)
npm run build
npx wrangler pages dev dist --do SALAS_SISIFO=SalaSisifo@sisifo-sala
#    → http://127.0.0.1:8788/demos/sisifo/
```

Para probar con teléfonos de verdad en la misma red, levanta ambos con
`--ip 0.0.0.0` y abre la IP de la computadora. El QR de la sala ya lleva esa dirección.

## Desplegar el multijugador (una sola vez)

Las versiones 1–3 no necesitan nada. La 4 necesita el Worker con su Durable Object:

1. `cd workers/sisifo-sala && npx wrangler login && npx wrangler deploy`.
   Usa almacenamiento SQLite (`new_sqlite_classes`), que también está disponible
   en el plan gratuito de Workers.
2. Panel de Cloudflare → el proyecto de Pages → **Settings → Bindings → Add →
   Durable Object namespace**: nombre `SALAS_SISIFO`, Worker `sisifo-sala`,
   clase `SalaSisifo`. Hazlo en Production y, si se usan previews, también en Preview.
3. Redespliega Pages (un push basta).

No hay secretos ni variables de entorno. Sin el binding, `/api/sisifo/*`
responde 503 y la pantalla de la comunidad dice que no hay conexión con el
servidor de salas. Las otras tres versiones siguen funcionando.

Las salas no guardan datos personales. Cada persona trae un id efímero
(`sessionStorage`) que solo conocen ella y el servidor, y un nombre opcional.
A los demás solo les llega su número de llegada. Una sala sin uso se borra a las 6 h.

## Pruebas

```sh
node scripts/prueba-sisifo-reglas.mjs     # reglas + lógica de sala, sin red (≈5 s)
node scripts/prueba-sisifo-reglas.mjs --tabla
node scripts/prueba-sisifo-sala.mjs       # navegadores reales contra el servidor real
```

La segunda necesita los dos servidores de arriba y `playwright-core` instalado
aparte (las instrucciones están en su cabecera). Abre un anfitrión y tres
participantes en contextos aislados y recorre esto: crear la sala, unirse por
enlace, empezar, recibir impulsos ajenos, rush, una desconexión a mitad de la
partida, cima, reinicio, corte de red y movimiento reducido.

## Parámetros de equilibrio (`nucleo/parametros.js`)

La fuerza se expresa como aceleración. La roca sube cuando
`fuerza · esfuerzo > gravedad · seno(pendiente) + rozamientos`.

**Esfuerzo (común).** Cada toque suma `impulso` con rendimiento decreciente
hacia `maximo`, y el esfuerzo se disipa con `tau`. Los toques a menos de
`intervaloMin` (0,1 s) no cuentan. Esfuerzo medio sostenido según el ritmo:
2 toques/s → 0,34; 4/s → 0,51; 6/s → 0,61; 8/s → 0,68; 30/s → 0,69 (techo).
Tocar más rápido de 8 veces por segundo no sirve.

**Golpe por toque.** Además del esfuerzo, cada toque aceptado tiene un efecto
inmediato (`golpe` o `mordida`). Así el ritmo de la mano se ve en el ritmo de la
roca, que es el gamefeel de la mecánica.

| Versión | Parámetro | Efecto |
|---|---|---|
| Castigo | `pendienteBase`, `inicioEmpinado`, `curvaEmpinado` | forma de la cuesta; el final se empina |
| | `fuerza`, `golpe`, `gravedad`, `arrastre`, `rodadura` | cuánto rinde el toque y cuánto se resiste |
| | `labio`, `pausaCima` | el filo de la cima: la inercia sube la roca, duda y vuelve sola |
| | `arrastreCaida`, `velocidadDerribo`, `tendido`, `pasoBajada` | la vuelta casi sin freno, cuándo derriba a Sísifo, cuánto tarda en levantarse y bajar |
| Camino | `ondas`, `pendienteMedia` | el terreno ondulado e infinito |
| | `rodadura` | mayor que cualquier pendiente: parar nunca hace retroceder |
| | `primeraTras`, `separacion`, `…Metros`, `quietoParaHablar` | cadencia de las preguntas |
| Caída | `tramos`, `suavizado` | cuesta con dos mesetas donde frenar alcanza |
| | `freno`, `mordida` | resistencia por esfuerzo y por toque; nunca empuja hacia arriba |
| | `desgasteAgarre`, `resbalon`, `recuperaAgarre` | sostener quieta la roca cansa y al final cede |
| Comunidad | `pendienteBase`, `pendienteExtra`, `curva` | la cuesta se empina con la altura |
| | `fuerza`, `golpe`, `techoPersona` | aporte de cada persona, con techo |
| | `silencioMax`, `graciaReconexion` | cuándo deja de contar y cuándo sale quien se va |
| | `ventanaCoincidencia`, `umbralRush…`, `ventanaOleada`, `subidaOleada`, `enfriamientoRush` | la energía colectiva y el rush: varias personas a la vez y la energía subiendo de golpe (solo dibujo) |

Comportamiento actual, medido por simulación con manos irregulares (±20 %):

- **Castigo**: a 2 toques/s no se mueve; a 4/s llega en ~34 s, a 6/s en ~16 s,
  a 8/s en ~11 s. Arriba duda medio segundo, vuelve, derriba a Sísifo y cae en ~4 s.
  Siempre vuelve a empezar.
- **Camino**: en 2 minutos, ~10 m a 2/s, ~88 m a 4/s, ~159 m a 6/s. No hay final.
- **Caída**: sin tocar llega abajo en 10 s; tocando a 3/s, en ~35 s; a 7/s, en ~38 s,
  con pausas en las mesetas. Nunca se detiene del todo.
- **Comunidad** (5 min de partida; «t s» = llegan; «%» = altura máxima):

| personas | 2/s | 3/s | 4/s | 6/s | 8/s | 15/s |
|---|---|---|---|---|---|---|
| 1 | 7 % | 18 % | 26 % | 36 % | 41 % | 40 % |
| 2 | 41 % | 58 % | 72 % | 95 % | 85 s | 104 s |
| 3 | 72 % | 144 s | 49 s | 29 s | 23 s | 24 s |
| 4 | 104 s | 34 s | 24 s | 17 s | 14 s | 15 s |
| 5 | 37 s | 21 s | 16 s | 12 s | 10 s | 11 s |
| 6 | 25 s | 16 s | 12 s | 10 s | 8 s | 9 s |

Una persona sola no pasa del 41 %. Dos solo llegan tocando al máximo durante
minuto y medio. Tres a ritmo cómodo llegan en menos de un minuto. Un grupo
mixto (6, 3, 2 y 0 toques/s) llega en ~80 s: no hace falta que todos toquen igual.
Si cambias un número, vuelve a correr la tabla.

## Pendiente

- Probar en iPhone (Safari) y Android (Chrome) reales. Las pruebas automáticas
  usan Chromium con viewport y eventos táctiles de teléfono, que no es lo mismo.
- Desplegar el Worker y crear el binding: requiere la cuenta de Cloudflare.
- Ajustar el equilibrio con un grupo real. La tabla viene de manos simuladas.
