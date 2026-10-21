/* De toques a esfuerzo. Puro: el tiempo entra como argumento, así lo usan igual
 * el navegador (performance.now) y el servidor (Date.now). */

export function crearEsfuerzo() {
  return { e: 0, ultimo: -Infinity };
}

/** Registra un toque en el instante t (segundos). Devuelve si contó. */
export function tocar(es, t, P) {
  if (t - es.ultimo < P.intervaloMin) return false;
  es.ultimo = t;
  es.e += P.impulso * (1 - es.e / P.maximo);
  return true;
}

export function decaer(es, dt, P) {
  es.e *= Math.exp(-dt / P.tau);
  if (es.e < 1e-4) es.e = 0;
}
