/* Energía colectiva — solo en La comunidad.
 *
 * Tres capas, y ninguna toca la física:
 *   1. Impulso individual: cada toque aceptado por el servidor viaja como un
 *      trazo breve desde la figura de quien tocó hasta la roca, y la muerde.
 *   2. Energía continua: la fuerza colectiva frente a la resistencia (dato del
 *      servidor) tensa un halo alrededor de la roca y hace vibrar el suelo.
 *   3. El rush: cuando varias personas coinciden, una onda y un latido.
 * Todo se alimenta de mensajes reales del WebSocket. Si no llegan, no hay nada
 * que dibujar: la escena se apaga y queda la cuesta, quieta. */

import { C } from './dibujo.js';
import { COMUNIDAD } from '../nucleo/parametros.js';

const MAX_PULSOS = 24;
const VUELO_REMOTO = 0.36, VUELO_PROPIO = 0.22;

const suave = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export function crearEnergia({ reducido = false } = {}) {
  const E = {
    pulsos: [],          // { de:{x,y}, a:{x,y}, t, dura, propio, peso, n }
    abolladuras: [],     // { a, p }
    destellos: new Map(),// n → segundos restantes (movimiento reducido: la figura se enciende)
    intensidad: 0,       // 0..1 suavizada
    meta: 0,
    apagado: false,
    onda: null,          // { t } rush en curso
    latido: 0,
    ultimoRush: -Infinity,
    historia: [],        // [reloj, en] del último segundo y algo
    reloj: 0,
    cuenta: { remotos: 0, propios: 0, rushes: 0 },
  };

  function lanzar(de, a, propio, n) {
    if (E.apagado && !propio) return;
    if (reducido) {
      if (!propio) E.destellos.set(n, 0.3);
      E.abolladuras.push({ a: Math.atan2(de.y - a.y, de.x - a.x), p: propio ? 0.6 : 1, ang: null });
      return;
    }
    if (E.pulsos.length >= MAX_PULSOS) {
      // Demasiados a la vez: se funden en un trazo más grueso, no se multiplican.
      const otro = E.pulsos.filter((p) => !p.propio).at(-1);
      if (otro) { otro.peso = Math.min(2.4, otro.peso + 0.35); return; }
    }
    E.pulsos.push({ de, a, t: 0, dura: propio ? VUELO_PROPIO : VUELO_REMOTO, propio, peso: 1, n });
  }

  return {
    cuenta: E.cuenta,
    destellos: E.destellos,

    /** Un toque de otra persona, confirmado por el servidor. */
    toqueRemoto(de, a, n) { E.cuenta.remotos++; lanzar(de, a, false, n); },
    /** El toque propio: respuesta inmediata, antes de la ida y vuelta por la red. */
    toquePropio(de, a) { E.cuenta.propios++; lanzar(de, a, true, 0); },

    /** Estado del servidor: f (fase), en (fuerza/resistencia), co (coincidencia), ac (activas). */
    estado({ en = 0, co = 0, ac = 0, f: fase }) {
      E.apagado = false;
      E.meta = fase === 'juego' ? suave((en - 0.5) / 2.2) : 0;
      // El rush marca una oleada: varias personas a la vez Y la energía subiendo de
      // golpe. Un empuje parejo y sostenido no lo dispara: se ve en el halo.
      E.historia.push([E.reloj, en]);
      while (E.historia.length && E.reloj - E.historia[0][0] > COMUNIDAD.ventanaOleada) E.historia.shift();
      const minimo = Math.min(...E.historia.map(([, x]) => x));
      const umbral = ac <= 3 ? COMUNIDAD.umbralRushPequeno : COMUNIDAD.umbralRush;
      if (fase === 'juego' && co >= umbral && en - minimo >= COMUNIDAD.subidaOleada
        && E.reloj - E.ultimoRush > COMUNIDAD.enfriamientoRush) {
        E.ultimoRush = E.reloj;
        E.onda = { t: 0 };
        E.latido = 0.0001;
        E.cuenta.rushes++;
      }
    },

    /** La conexión calló: nada de energía inventada. */
    sinSenal() {
      E.apagado = true;
      E.meta = 0;
      E.pulsos.length = 0;
      E.onda = null;
    },

    actualizar(dt) {
      E.reloj += dt;
      // sube rápido, baja despacio: el esfuerzo se disipa y deja ver la resistencia
      const k = E.meta > E.intensidad ? 7 : 1.4;
      E.intensidad += (E.meta - E.intensidad) * (1 - Math.exp(-k * dt));
      for (const p of E.pulsos) {
        p.t += dt / p.dura;
        if (p.t >= 1 && !p.llego) {
          p.llego = true;
          E.abolladuras.push({ a: Math.atan2(p.de.y - p.a.y, p.de.x - p.a.x), p: p.propio ? 0.7 : Math.min(1.6, p.peso) });
        }
      }
      E.pulsos = E.pulsos.filter((p) => p.t < 1.25);
      for (const ab of E.abolladuras) ab.p -= dt / 0.18;
      E.abolladuras = E.abolladuras.filter((ab) => ab.p > 0);
      for (const [n, s] of E.destellos) { if (s - dt <= 0) E.destellos.delete(n); else E.destellos.set(n, s - dt); }
      if (E.onda) { E.onda.t += dt / (reducido ? 0.6 : 0.7); if (E.onda.t >= 1) E.onda = null; }
      if (E.latido) { E.latido += dt / 0.32; if (E.latido >= 1) E.latido = 0; }
    },

    /** Opciones para dibujar la roca: latido, mordidas, contorno del rush. */
    roca() {
      const o = { abolladuras: reducido ? [] : E.abolladuras };
      if (!reducido && E.latido) o.escala = 1 + 0.07 * Math.sin(Math.PI * E.latido);
      if (reducido) {
        // Sin desplazamientos: la energía engrosa el contorno; el rush lo dobla.
        if (E.intensidad > 0.05) { o.contorno = C.senal; o.grosor = 0.02 + 0.07 * E.intensidad; }
        if (E.onda) { o.contorno = C.senal; o.grosor = 0.11; o.doble = true; }
        if (E.abolladuras.length) { o.contorno = C.senal; o.grosor = Math.max(o.grosor || 0, 0.05); }
      }
      return o;
    },

    /** Detrás de la roca: halo y suelo vibrante. */
    dibujarDetras(L, c, r, perfil, contactoX) {
      const { ctx } = L;
      const I = E.intensidad;
      if (I < 0.02) return;
      L.mundo();
      ctx.lineCap = 'round';
      const color = E.apagado ? C.hueso : C.senal;
      if (!reducido) {
        for (let i = 0; i < 2; i++) {
          const nivel = (I - i * 0.45) / 0.4;
          if (nivel <= 0) continue;
          const radio = r + 0.2 + i * (0.22 - 0.08 * I);
          ctx.setLineDash([0.3 + 0.1 * i, 0.22 - 0.06 * I]);
          ctx.lineDashOffset = -E.reloj * (0.6 + 2.4 * I) * (i % 2 ? -1 : 1);
          ctx.globalAlpha = Math.min(1, nivel);
          ctx.beginPath(); ctx.arc(c.x, c.y, radio, 0, Math.PI * 2);
          ctx.strokeStyle = C.barniz; ctx.lineWidth = 0.055 + 0.025 * I; ctx.stroke();
          ctx.strokeStyle = color; ctx.lineWidth = 0.025 + 0.02 * I; ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
      // El suelo bajo la roca: un filo que vibra con la fuerza compartida.
      ctx.beginPath();
      for (let x = contactoX - 2; x <= contactoX + 0.9; x += 0.08) {
        const w = reducido ? 0 : Math.sin(x * 9 + E.reloj * 30) * 0.025 * I;
        ctx.lineTo(x, perfil(x) + 0.06 + w);
      }
      ctx.strokeStyle = C.barniz; ctx.lineWidth = 0.05 + 0.1 * I; ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = 0.02 + 0.07 * I; ctx.stroke();
    },

    /** Delante: pulsos en vuelo y la onda del rush. */
    dibujarDelante(L, c, r) {
      const { ctx } = L;
      L.mundo();
      ctx.lineCap = 'round';
      for (const p of E.pulsos) {
        if (p.t >= 1) continue;
        const pos = (t) => {
          const u = Math.max(0, Math.min(1, t));
          const x = p.de.x + (p.a.x - p.de.x) * u;
          const y = p.de.y + (p.a.y - p.de.y) * u + Math.sin(Math.PI * u) * 0.35;
          return [x, y];
        };
        const [x1, y1] = pos(p.t), [x0, y0] = pos(p.t - 0.3);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
        if (p.propio) {
          ctx.strokeStyle = C.barniz; ctx.lineWidth = 0.15; ctx.stroke();
          ctx.strokeStyle = C.hueso; ctx.lineWidth = 0.035; ctx.stroke();
        } else {
          ctx.strokeStyle = C.barniz; ctx.lineWidth = 0.1 * p.peso + 0.05; ctx.stroke();
          ctx.strokeStyle = C.senal; ctx.lineWidth = 0.06 * p.peso; ctx.stroke();
        }
      }
      if (E.onda && !reducido) {
        const t = E.onda.t;
        const radio = r + 0.2 + 2.4 * (1 - (1 - t) * (1 - t));
        ctx.globalAlpha = 1 - t;
        ctx.beginPath(); ctx.arc(c.x, c.y, radio, 0, Math.PI * 2);
        ctx.strokeStyle = C.barniz; ctx.lineWidth = 0.05 + 0.14 * (1 - t); ctx.stroke();
        ctx.strokeStyle = C.senal; ctx.lineWidth = 0.02 + 0.1 * (1 - t); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    },

    intensidad: () => E.intensidad,
    apagado: () => E.apagado,
  };
}
