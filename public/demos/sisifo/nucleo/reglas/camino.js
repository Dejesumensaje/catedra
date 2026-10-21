/* 2 · El camino.
 * Mismo gesto, sin cima. El camino es infinito y la rodadura sostiene la roca
 * en cualquier punto: dejar de empujar no hace perder nada, solo detiene. */

import { CAMINO, CUERPOS } from '../parametros.js';
import { avanzar, azar } from '../fisica.js';

export const id = 'camino';

export function crearPerfil(P = CAMINO, semilla = 7) {
  const r = azar(semilla);
  const ondas = P.ondas.map(([a, l]) => [a, (2 * Math.PI) / l, r() * Math.PI * 2]);
  // Las ondas empiezan en cero para que el primer metro sea siempre suave.
  const base = ondas.reduce((s, [a, , f]) => s + a * Math.sin(f), 0);
  return (x) => P.pendienteMedia * x + ondas.reduce((s, [a, k, f]) => s + a * Math.sin(k * x + f), 0) - base;
}

export const separacion = () => CUERPOS.separacion;

export function crear(P = CAMINO, semilla = (Math.random() * 1e9) | 0) {
  return {
    P,
    semilla,
    perfil: crearPerfil(P, semilla),
    fase: 'empujando',      // empujando → parado (solo si la persona decide parar)
    reloj: 0,
    quieto: 0,
    roca: { x: 0, v: 0, s: 0 },
    figura: { x: -separacion(), s: 0, pose: 'empuja', mira: 1 },
  };
}

export const aceptaToques = (est) => est.fase === 'empujando';

export function paso(est, dt, { e = 0 } = {}) {
  const { P, roca, figura } = est;
  est.reloj += dt;
  if (est.fase !== 'empujando') { figura.pose = 'quieto'; return []; }
  avanzar(roca, est.perfil, {
    fuerza: P.fuerza * e, gravedad: P.gravedad, arrastre: P.arrastre, rodadura: P.rodadura,
  }, dt);
  const nx = roca.x - separacion();
  figura.s += Math.abs(nx - figura.x);
  figura.x = nx;
  est.quieto = roca.v === 0 && e < 0.05 ? est.quieto + dt : 0;
  figura.pose = est.quieto > 1.5 ? 'quieto' : 'empuja';
  return [];
}

/** Parar es una decisión, no una derrota. */
export function parar(est) {
  est.fase = 'parado';
  est.roca.v = 0;
}

/** El golpe de un toque: un empujón inmediato, además del esfuerzo sostenido. */
export function impulso(est) {
  if (!aceptaToques(est) || est.fase === 'parado') return;
  est.roca.v += est.P.golpe;
}
