# Cometa — una acuarela viva

Juego cooperativo en Three.js: de dos a cuatro presencias tiran de hilos para
sostener una cometa en un paisaje de acuarela. Si la sostienen el tiempo
suficiente, la cometa se suelta y queda en el cielo compartido.

Ruta: `/demos/cometa/`. Parámetros: `?cielo=ID` (entrar a un cielo concreto; es lo
que copia «Compartir cielo»), `?espera=10..45` (segundos antes de que llegue una
presencia del viento generada, por defecto 32), `?lab=1` (panel de diagnóstico;
también con la tecla Tab).

## Procedencia

Llega como zip exportado de Google AI Studio (React 19 + Vite + Tailwind +
Three.js, con un servidor Express/WebSocket en `server.ts`). El código fuente
del juego no está en este repositorio: aquí vive la build, más el servidor
portado a Cloudflare.

## Arquitectura

```
public/demos/cometa/                  build del juego (vite, base /demos/cometa/)
functions/api/cometa/[[ruta]].js      Pages Function: reenvía /api/cometa/* al Durable Object
workers/cometa-mundo/                 Worker + Durable Object «Mundo»: la autoridad de los cielos
  src/salas.ts                        GENERADO desde server.ts (no editar a mano)
  src/mundo.ts                        el Durable Object: WebSocket y memoria del cielo
scripts/construir-cometa.mjs          zip de AI Studio → todo lo de arriba
```

Hay **un solo `Mundo`** para todo el juego. Dentro viven todos los cielos, con el
mismo emparejamiento de `server.ts`: entrar al cielo del enlace, o al primero con
1 a 3 personas, o abrir uno nuevo. Para una clase sobra. Si un día hubiera cientos
de personas a la vez, habría que repartir los cielos en un objeto por sala.

**La memoria del cielo** (las cometas soltadas, hasta 40) queda en el
almacenamiento del Durable Object y sobrevive a reinicios y despliegues.

El juego trae su propio respaldo: si `/api/cometa/ws` no responde, sigue
funcionando con la presencia generada y entre pestañas del mismo navegador
(`BroadcastChannel`).

## Actualizar con un zip nuevo

```sh
node scripts/construir-cometa.mjs ruta/al/Cometa.zip
```

El script descomprime el zip, cambia en el cliente `/ws` por `/api/cometa/ws`,
hace la build, la copia aquí (conserva este LEEME y `og.png`) y vuelve a generar
`workers/cometa-mundo/src/salas.ts` desde `server.ts`. Si el zip cambió tanto
que no encuentra lo que busca, se detiene y dice qué falta.

Si `salas.ts` cambió en el diff, hay que volver a desplegar el Worker (abajo).

## Desplegar el multijugador (una sola vez)

1. `cd workers/cometa-mundo && npx wrangler login && npx wrangler deploy`.
2. Panel de Cloudflare → el proyecto de Pages → **Settings → Bindings → Add →
   Durable Object namespace**: nombre `MUNDO_COMETA`, Worker `cometa-mundo`,
   clase `Mundo`. En Production y, si se usan previews, también en Preview.
3. Redespliega Pages (un push basta).

Para comprobarlo: `https://catedra.dejesumensaje.com/api/cometa/salud` debe
responder `{"status":"ok",…}`. Sin el binding responde 503 y el juego queda en su
modo sin servidor.

## Correr en local

```sh
# 1. servidor de salas
cd workers/cometa-mundo && npx wrangler dev --port 8787

# 2. el sitio como en producción (Pages Function incluida)
npm run build
npx wrangler pages dev dist --do MUNDO_COMETA=Mundo@cometa-mundo
#    → http://127.0.0.1:8788/demos/cometa/
```

Para probar con teléfonos en la misma red, levanta ambos con `--ip 0.0.0.0` y abre
la IP del computador.

## Cosas a saber

- **El servidor confía en el cliente**, como en `server.ts`. Cualquiera puede abrir
  el laboratorio (Tab o `?lab=1`) y usar «Conseguir cometa ahora», o mandar
  mensajes a mano, y llenar el cielo compartido, que es público y persistente.
  Como guarda 40 cometas, el abuso desplaza las de los demás.
- **Sin datos personales.** Cada navegador trae un id al azar que cambia al recargar. El
  servidor no guarda nombres ni direcciones; solo posición y color de las
  cometas soltadas.
