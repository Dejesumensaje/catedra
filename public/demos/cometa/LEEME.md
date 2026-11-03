# Cometa — una acuarela viva

Juego contemplativo en Three.js: varias presencias tiran de hilos para sostener
una cometa en un paisaje de acuarela. Si la sostienen el tiempo suficiente, la
cometa se suelta y queda en el cielo compartido.

Ruta: `/demos/cometa/`. Parámetros: `?espera=10..45` (segundos antes de que llegue
una presencia del viento, por defecto 32), `?lab=1` (panel de diagnóstico; también
con la tecla Tab), `?cielo=ID` (cielo compartido).

## Procedencia

Llegó como proyecto de Google AI Studio (React 19 + Vite + Tailwind + Three.js, con
un servidor Express/WebSocket en `server.ts`). Lo que está aquí es **solo la build
estática** de `vite build --base=/demos/cometa/`. El código fuente no está en este
repositorio.

Para reconstruir desde el zip original:

```sh
npm install --legacy-peer-deps   # vite 8 y esbuild 0.25 chocan en peer deps
npx vite build --base=/demos/cometa/
# copiar dist/* a public/demos/cometa/ (sin dist/assets/aistudio: es una versión vieja)
```

## Qué funciona en este sitio y qué no

El sitio es estático: **no hay servidor de salas**. El cliente intenta abrir
`wss://…/ws`, recibe 404 y cae a su modo `local-tab`, que sincroniza pestañas del
mismo navegador por `BroadcastChannel`.

- Funciona: jugar solo con la presencia del viento generada, y jugar entre dos
  pestañas del mismo navegador.
- No funciona: jugar entre dispositivos distintos. El botón «Compartir cielo» copia
  un enlace, pero quien lo abre en otro equipo no entra al mismo cielo.
- El cliente reintenta `/ws` cada 3,5 s mientras la página está abierta. Es ruido
  en la consola, no rompe nada.

Para el multijugador real habría que portar `server.ts` a un Worker con Durable
Object, como `workers/sisifo-sala/` hace con Sísifo.
