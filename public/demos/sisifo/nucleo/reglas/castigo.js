/* 1 · El castigo.
 * Empujar sube la roca. Llegar arriba no termina nada: la roca cae, Sísifo
 * baja a buscarla y el ciclo empieza otra vez. No existe estado de victoria. */

import { CASTIGO, CUERPOS } from '../parametros.js';
import { avanzar } from '../fisica.js';

export const id = 'castigo';

export function crearPerfil(P = CASTIGO) {
  return (x) => {
    if (x < 0) return Math.min(0.28 * x * x, 0.7);        // valle: la roca se asienta aquí
    if (x > P.largo) return alturaCima(P);                // la cima es un rellano
    const extra = Math.max(0, x - P.inicioEmpinado);
    return P.pendienteBase * x + P.curvaEmpinado * extra * extra;
  };
}

const alturaCima = (P) => {
  const extra = P.largo - P.inicioEmpinado;
  return P.pendienteBase * P.largo + P.curvaEmpinado * extra * extra;
};

/* Distancia horizontal entre el centro de contacto de la roca y los pies. */
export const separacion = () => CUERPOS.separacion;

export function crear(P = CASTIGO) {
  return {
    P,
    perfil: crearPerfil(P),
    fase: 'empujando',      // empujando → cima → cayendo → bajando → empujando
    reloj: 0,
    ciclos: 0,
    roca: { x: 0, v: 0, s: 0 },
    figura: { x: -separacion(), s: 0, pose: 'empuja', mira: 1 },
  };
}

export const aceptaToques = (est) => est.fase === 'empujando';

/** Un paso de simulación. `e` es el esfuerzo actual. Devuelve eventos. */
export function paso(est, dt, { e = 0 } = {}) {
  const { P, roca, figura } = est;
  const eventos = [];
  est.reloj += dt;

  if (est.fase === 'empujando') {
    avanzar(roca, est.perfil, {
      fuerza: P.fuerza * e, gravedad: P.gravedad, arrastre: P.arrastre, rodadura: P.rodadura,
    }, dt);
    if (roca.x < 0) { roca.x = 0; if (roca.v < 0) roca.v = 0; }
    seguir(figura, roca.x - separacion());
    figura.pose = 'empuja';
    if (roca.x >= P.largo) {
      roca.x = P.largo; roca.v = 0;
      est.fase = 'cima'; est.reloj = 0;
      eventos.push('cima');
    }
  } else if (est.fase === 'cima') {
    figura.pose = 'agotado';
    if (est.reloj >= P.pausaCima) {
      est.fase = 'cayendo'; est.reloj = 0;
      roca.v = -0.4;
      eventos.push('cae');
    }
  } else if (est.fase === 'cayendo' || est.fase === 'bajando') {
    const enValle = roca.x < 0.4;
    avanzar(roca, est.perfil, {
      gravedad: P.gravedad,
      arrastre: enValle ? P.arrastreValle : P.arrastreCaida,
      rodadura: enValle ? 0.25 : 0,
    }, dt);
    if (est.fase === 'cayendo' && roca.x < 0.05) { est.fase = 'bajando'; eventos.push('fondo'); }
    // Sísifo mira la caída un momento y luego baja caminando.
    if (est.reloj > 0.8) {
      figura.mira = -1;
      figura.pose = 'camina';
      const destino = roca.x - separacion();
      const dx = destino - figura.x;
      const pasoMax = P.pasoBajada * dt;
      if (Math.abs(dx) > pasoMax) {
        figura.x += Math.sign(dx) * pasoMax; figura.s += pasoMax;
      } else if (est.fase === 'bajando' && Math.abs(roca.v) < 0.05 && Math.abs(roca.x) < 0.2) {
        roca.x = 0; roca.v = 0;
        figura.x = destino; figura.mira = 1; figura.pose = 'empuja';
        est.fase = 'empujando'; est.reloj = 0; est.ciclos += 1;
        eventos.push('otra-vez');
      }
    } else {
      figura.pose = 'agotado';
    }
  }
  return eventos;
}

function seguir(figura, x) {
  figura.s += Math.abs(x - figura.x);
  figura.x = x;
}

/** El golpe de un toque: un empujón inmediato, además del esfuerzo sostenido. */
export function impulso(est) {
  if (!aceptaToques(est) || est.fase === 'parado') return;
  est.roca.v += est.P.golpe;
}
