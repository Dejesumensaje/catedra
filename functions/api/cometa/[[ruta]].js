/**
 * Pages Function — salas de COMETA (/demos/cometa/).
 *
 * No guarda nada aquí: reenvía /api/cometa/* al Durable Object `Mundo`, que vive
 * en el Worker `cometa-mundo` (workers/cometa-mundo) y es la autoridad de todos
 * los cielos. Así el juego habla con su mismo origen y no hace falta CORS.
 *
 * Configuración en el panel de Cloudflare Pages → Settings → Bindings:
 *   Durable Object namespace  MUNDO_COMETA  →  Worker cometa-mundo, clase Mundo
 * Sin el binding responde 503 y el juego cae a su modo sin servidor
 * (presencia generada o pestañas del mismo navegador).
 */

import { reenviar } from '../../../workers/cometa-mundo/src/rutas.js';

export function onRequest({ request, env }) {
  return reenviar(request, env.MUNDO_COMETA);
}
