/* 1 · El castigo.
 * Empujar sube la roca. Llegar arriba no termina nada: la cima es un filo. La
 * roca llega con su inercia, se frena, duda un instante en el punto de
 * equilibrio y vuelve por su propio peso. En el camino de vuelta se lleva por
 * delante a Sísifo, que se levanta y baja a buscarla. No existe estado de victoria.
 *
 * Todo es continuo: la llegada y la caída son la misma física, sin saltos. */

import { CASTIGO, CUERPOS } from '../parametros.js';
import { avanzar } from '../fisica.js';

export const id = 'castigo';

/** Perfil: valle al pie, cuesta que se empina y, pasado `largo`, un filo y un rellano. */
export function crearPerfil(P = CASTIGO) {
  const cuesta = (x) => {
    const extra = Math.max(0, x - P.inicioEmpinado);
    return P.pendienteBase * x + P.curvaEmpinado * extra * extra;
  };
  const filo = P.largo + P.labio;
  return (x) => {
    if (x < 0) return Math.min(0.28 * x * x, 2);          // valle: la roca va y viene y se asienta aquí
    if (x > filo) return cuesta(filo);                    // rellano de la cima, inalcanzable
    return cuesta(x);
  };
}

/* Distancia horizontal entre el punto de contacto de la roca y los pies. */
export const separacion = () => CUERPOS.separacion;

export function crear(P = CASTIGO) {
  return {
    P,
    perfil: crearPerfil(P),
    fase: 'empujando',      // empujando → cima → cayendo → bajando → empujando
    reloj: 0,
    ciclos: 0,
    duda: 0,                // 0..1 mientras la roca se sostiene en el filo
    roca: { x: 0, v: 0, s: 0 },
    // La figura tiene su propio estado: empuja, la arrastra la roca, cae, se levanta, baja.
    figura: { x: -separacion(), s: 0, pose: 'empuja', mira: 1, resbala: 0, reloj: 0 },
  };
}

export const aceptaToques = (est) => est.fase === 'empujando';

/** El golpe de un toque: un empujón inmediato, además del esfuerzo sostenido. */
export function impulso(est) {
  if (!aceptaToques(est)) return;
  est.roca.v += est.P.golpe;
}

/** Un paso de simulación. `e` es el esfuerzo actual. Devuelve eventos. */
export function paso(est, dt, { e = 0 } = {}) {
  const { P, roca, figura } = est;
  const eventos = [];
  est.reloj += dt;
  figura.reloj += dt;
  const filo = P.largo + P.labio;

  if (est.fase === 'empujando') {
    avanzar(roca, est.perfil, {
      fuerza: P.fuerza * e, gravedad: P.gravedad, arrastre: P.arrastre, rodadura: P.rodadura,
    }, dt);
    if (roca.x < 0) { roca.x = 0; if (roca.v < 0) roca.v = 0; }
    // Si la roca retrocede, empuja a Sísifo cuesta abajo: los pies resbalan.
    seguir(figura, roca.x - separacion());
    figura.pose = 'empuja';
    figura.resbala = roca.v < -0.04 ? Math.min(1, -roca.v * 2.2) : 0;
    if (roca.x >= P.largo) {
      est.fase = 'cima'; est.reloj = 0;
      eventos.push('cima');
    }
  } else if (est.fase === 'cima') {
    // Ya no cuenta el esfuerzo: la inercia la sube un poco más y la gravedad la frena.
    if (est.duda === 0) {
      avanzar(roca, est.perfil, { gravedad: P.gravedad, arrastre: P.arrastre, rodadura: 0 }, dt);
      if (roca.x > filo - 0.05) { roca.x = filo - 0.05; roca.v = 0; }
      if (roca.v <= 0) { roca.v = 0; est.duda = 1e-6; }
    } else {
      // El punto de equilibrio: un instante quieta, y vuelve.
      est.duda = Math.min(1, est.duda + dt / P.pausaCima);
      if (est.duda >= 1) {
        est.fase = 'cayendo'; est.reloj = 0; est.duda = 0;
        roca.v = -0.05;
        eventos.push('cae');
      }
    }
    seguir(figura, Math.min(figura.x, roca.x - separacion()));
    figura.pose = 'empuja';
    figura.resbala = 0;
  } else {
    // Cayendo y bajando: la roca rueda sola hasta el valle y se asienta.
    const enValle = roca.x < 0.4;
    avanzar(roca, est.perfil, {
      gravedad: P.gravedad,
      arrastre: enValle ? P.arrastreValle : P.arrastreCaida,
      rodadura: enValle ? 0.25 : 0,
    }, dt);
    if (est.fase === 'cayendo' && roca.x < 0.05) {
      est.fase = 'bajando'; est.reloj = 0;
      eventos.push('fondo');
    }
    moverFigura(est, dt, eventos);
  }
  return eventos;
}

/** La figura frente a una roca que viene de vuelta: aguanta, la arrastra, cae, se levanta, baja. */
function moverFigura(est, dt, eventos) {
  const { P, roca, figura } = est;
  const contacto = roca.x - separacion();
  if (figura.pose === 'empuja') {
    if (contacto < figura.x) {
      // Colisión: la roca empuja a Sísifo hacia abajo mientras él resiste.
      figura.s += figura.x - contacto;
      figura.x = contacto;
      figura.resbala = Math.min(1, -roca.v * 1.5);
      if (roca.v < -P.velocidadDerribo) {
        figura.pose = 'tendido'; figura.reloj = 0; figura.resbala = 0;
        eventos.push('arrollado');
      }
    }
    if (est.fase !== 'bajando') return;
    figura.pose = 'camina'; figura.reloj = 0;   // por si la roca nunca lo alcanzó
  }
  const quieta = est.fase === 'bajando' && Math.abs(roca.v) < 0.05 && Math.abs(roca.x) < 0.2;
  if (figura.pose === 'tendido') {
    if (est.fase === 'bajando' && est.reloj > P.tendido) { figura.pose = 'sentado'; figura.reloj = 0; }
    return;
  }
  if (figura.pose === 'sentado') {
    if (figura.reloj > 0.7) { figura.pose = 'camina'; figura.mira = -1; figura.reloj = 0; }
    return;
  }
  // Camina cuesta abajo hasta ponerse detrás de la roca.
  const destino = contacto;
  const dx = destino - figura.x;
  const pasoMax = P.pasoBajada * dt;
  if (Math.abs(dx) > pasoMax) {
    figura.mira = Math.sign(dx);
    figura.x += Math.sign(dx) * pasoMax;
    figura.s += pasoMax;
  } else if (quieta) {
    roca.x = 0; roca.v = 0;
    figura.x = -separacion(); figura.mira = 1; figura.pose = 'empuja';
    est.fase = 'empujando'; est.reloj = 0; est.ciclos += 1;
    eventos.push('otra-vez');
  }
}

function seguir(figura, x) {
  figura.s += Math.abs(x - figura.x);
  figura.x = x;
}
