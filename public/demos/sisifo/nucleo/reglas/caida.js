/* 3 · La caída.
 * La roca empieza arriba y cae sin esperar a nadie. Tocar ya no empuja: frena.
 * El freno es un rozamiento, así que nunca devuelve la roca hacia arriba.
 * Sostenerla quieta gasta el agarre, y lo que se sostiene termina por ceder. */

import { CAIDA, CUERPOS } from '../parametros.js';
import { avanzar, perfilDesdeTangentes, suave } from '../fisica.js';

export const id = 'caida';

export function crearPerfil(P = CAIDA) {
  const tangenteEn = (x) => {
    if (x < 0) return 0;
    let m = P.tramos[0][1];
    for (let i = 1; i < P.tramos.length; i++) {
      const [desde, t] = P.tramos[i];
      const k = suave((x - desde + P.suavizado / 2) / P.suavizado);
      m = m * (1 - k) + t * k;
    }
    return x > P.largo ? 0 : m;
  };
  const integrado = perfilDesdeTangentes(tangenteEn, 0, P.largo + 3);
  // Abajo, un valle suave donde la roca se detiene.
  return (x) => (x < 0 ? Math.min(0.22 * x * x, 0.6) : integrado(x));
}

/* Sísifo está del lado de abajo, de espaldas a la caída, empujando cuesta arriba. */
export const separacion = () => CUERPOS.separacion;

export function crear(P = CAIDA) {
  return {
    P,
    perfil: crearPerfil(P),
    fase: 'espera',         // espera → cayendo → fondo
    reloj: 0,
    agarre: 1,
    sostenido: 0,           // segundos seguidos con la roca quieta gracias al freno
    sinTocar: 0,
    frenando: 0,
    roca: { x: P.largo - 0.2, v: 0, s: 0 },
    figura: { x: P.largo - 0.2 - separacion(), s: 0, pose: 'empuja', mira: 1, resbala: 0 },
  };
}

export const aceptaToques = (est) => est.fase !== 'fondo';

export function paso(est, dt, { e = 0 } = {}) {
  const { P, roca, figura } = est;
  const eventos = [];
  est.reloj += dt;

  if (est.fase === 'espera') {
    if (est.reloj >= P.esperaInicial) {
      est.fase = 'cayendo'; est.reloj = 0;
      roca.v = -0.15;
      eventos.push('cae');
    }
    return eventos;
  }
  if (est.fase === 'fondo') {
    // La roca termina de rodar y se asienta en el valle.
    avanzar(roca, est.perfil, { gravedad: P.gravedad, arrastre: 1.4, rodadura: 0.25 }, dt);
    return eventos;
  }

  const freno = P.freno * e * est.agarre;
  const antes = roca.x;
  avanzar(roca, est.perfil, {
    gravedad: P.gravedad, arrastre: P.arrastre, rodadura: P.rodadura + freno,
  }, dt);

  // Sostener la roca quieta gasta el agarre. Cuando cede, los pies resbalan y
  // se pierde de golpe buena parte de lo que quedaba; luego vuelve despacio.
  const quieta = roca.v === 0;
  if (quieta && e > 0.08) {
    est.agarre = Math.max(P.agarreMinimo, est.agarre - P.desgasteAgarre * e * dt);
  } else {
    if (est.sostenido > 0.3) {
      est.agarre = Math.max(P.agarreMinimo, est.agarre * P.resbalon);
      eventos.push('cede');
    }
    // Se recupera el paso al soltar o cuando la roca ya rueda, no mientras se arrastra.
    if (e < 0.08 || Math.abs(roca.v) > 0.3) est.agarre = Math.min(1, est.agarre + P.recuperaAgarre * dt);
  }

  est.sostenido = roca.v === 0 && e > 0.08 ? est.sostenido + dt : 0;
  est.sinTocar = e < 0.05 ? est.sinTocar + dt : 0;
  est.frenando = e > 0.2 ? est.frenando + dt : est.frenando;

  // Los pies resbalan cuesta abajo con la roca encima.
  const nx = roca.x - separacion();
  figura.s += Math.abs(nx - figura.x);
  figura.resbala = Math.min(1, Math.abs(roca.x - antes) / dt / 2.5);
  figura.x = nx;
  figura.pose = 'empuja';

  if (roca.x <= 0.02) {
    est.fase = 'fondo'; est.reloj = 0;
    figura.x = -separacion() - 0.6;
    figura.pose = 'sentado';
    eventos.push('fondo');
  }
  return eventos;
}

/** El toque muerde: le quita a la caída un poco de velocidad en el acto. Nunca la invierte. */
export function impulso(est) {
  if (est.fase !== 'cayendo' || est.roca.v >= 0) return;
  est.roca.v *= 1 - est.P.mordida * est.agarre;
}
