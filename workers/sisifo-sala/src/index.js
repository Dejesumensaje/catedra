/* Worker de las salas de «La comunidad». En producción el sitio llega aquí a
 * través de la Pages Function functions/api/sisifo/[[ruta]].js, que usa el
 * Durable Object por binding. Este fetch existe para probar en local
 * (`npx wrangler dev`) y por si se quiere exponer el Worker directamente. */

import { manejar } from './rutas.js';
export { SalaSisifo } from './sala.js';

export default {
  fetch(request, env) {
    return manejar(request, env.SALAS_SISIFO);
  },
};
