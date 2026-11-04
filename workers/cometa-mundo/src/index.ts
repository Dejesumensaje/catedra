/* Worker de las salas de COMETA. En producción el sitio llega aquí a través de
 * la Pages Function functions/api/cometa/[[ruta]].js, que usa el Durable Object
 * por binding. Este fetch existe para probar en local (`npx wrangler dev`) y por
 * si se quiere exponer el Worker directamente. */

import { reenviar } from './rutas.js';
export { Mundo } from './mundo';

export default {
  fetch(request: Request, env: { MUNDO_COMETA: DurableObjectNamespace }) {
    return reenviar(request, env.MUNDO_COMETA);
  },
};
