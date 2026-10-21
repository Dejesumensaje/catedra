/**
 * Pages Function — salas de «Sísifo · La comunidad» (/demos/sisifo/#comunidad).
 *
 * No guarda nada aquí: reenvía al Durable Object `SalaSisifo`, que vive en el
 * Worker `sisifo-sala` (workers/sisifo-sala) y es la autoridad de cada partida.
 * Así el juego habla con su mismo origen y no hace falta CORS ni otra URL.
 *
 * Configuración en el panel de Cloudflare Pages → Settings → Bindings:
 *   Durable Object namespace  SALAS_SISIFO  →  Worker sisifo-sala, clase SalaSisifo
 * Sin el binding responde 503 y el juego lo dice en pantalla.
 */

import { manejar } from '../../../workers/sisifo-sala/src/rutas.js';

export function onRequest({ request, env }) {
  return manejar(request, env.SALAS_SISIFO);
}
