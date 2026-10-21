/* 4 · La comunidad.
 * Una roca, muchas personas. La fuerza es la suma de los esfuerzos activos, cada
 * uno con techo. La cuesta se empina con la altura: una persona sola se queda a
 * mitad de camino; un grupo pequeño llega. Arriba, la roca se queda arriba.
 *
 * Esta regla corre SOLO en el servidor (la sala es la autoridad). El navegador
 * la importa únicamente para dibujar el mismo perfil. */

import { COMUNIDAD } from '../parametros.js';
import { avanzar, perfilDesdeTangentes } from '../fisica.js';

export const id = 'comunidad';

export function tangenteEn(x, P = COMUNIDAD) {
  if (x < 0) return 0;
  if (x > P.largo) return 0;
  return P.pendienteBase + P.pendienteExtra * Math.pow(x / P.largo, P.curva);
}

export function crearPerfil(P = COMUNIDAD) {
  const integrado = perfilDesdeTangentes((x) => tangenteEn(x, P), 0, P.largo + 4);
  return (x) => (x < 0 ? Math.min(0.25 * x * x, 0.6) : integrado(x));
}

export function crear(P = COMUNIDAD) {
  return {
    P,
    perfil: crearPerfil(P),
    fase: 'espera',         // espera → juego → cima
    reloj: 0,
    roca: { x: 0, v: 0, s: 0 },
    fuerza: 0,
  };
}

/** Suma las contribuciones con techo por persona. */
export function fuerzaColectiva(esfuerzos, P = COMUNIDAD) {
  let suma = 0;
  for (const e of esfuerzos) suma += Math.min(e, P.techoPersona);
  return P.fuerza * suma;
}

export function paso(est, dt, { esfuerzos = [] } = {}) {
  const { P, roca } = est;
  const eventos = [];
  est.reloj += dt;
  if (est.fase !== 'juego') { est.fuerza = 0; return eventos; }

  est.fuerza = fuerzaColectiva(esfuerzos, P);
  avanzar(roca, est.perfil, {
    fuerza: est.fuerza, gravedad: P.gravedad, arrastre: P.arrastre, rodadura: P.rodadura,
  }, dt);
  if (roca.x < 0) { roca.x = 0; if (roca.v < 0) roca.v = 0; }
  if (roca.x >= P.largo) {
    roca.x = P.largo; roca.v = 0;
    est.fase = 'cima'; est.reloj = 0;
    eventos.push('cima');
  }
  return eventos;
}

/** Resistencia de la cuesta donde está la roca: para normalizar la «energía». */
export function resistenciaEn(est) {
  const m = tangenteEn(est.roca.x, est.P);
  return est.P.gravedad * (m / Math.hypot(1, m)) + est.P.rodadura;
}

/** Golpe de un toque aceptado por la sala. */
export function impulso(est) {
  if (est.fase === 'juego') est.roca.v += est.P.golpe;
}
