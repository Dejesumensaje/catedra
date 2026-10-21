/* Polvo: trazos cortos que salen del suelo cuando un pie empuja, cuando la roca
 * rueda deprisa o cuando golpea abajo. Es lo que le da peso al contacto.
 * Barniz sobre arcilla, pocos y breves. Con movimiento reducido no hay polvo. */

import { C } from './dibujo.js';

const MAX = 90;

export function crearPolvo({ reducido = false } = {}) {
  let motas = [];
  return {
    /** Levanta `n` motas en (x, y). `dir` empuja el polvo hacia un lado (−1 / 1). */
    levantar(x, y, n = 3, fuerza = 1, dir = 0) {
      if (reducido) return;
      for (let i = 0; i < n && motas.length < MAX; i++) {
        const a = Math.PI * (0.15 + Math.random() * 0.7);
        const v = (0.6 + Math.random() * 1.4) * fuerza;
        motas.push({
          x: x + (Math.random() - 0.5) * 0.2, y: y + 0.03,
          vx: Math.cos(a) * v + dir * v * 0.8, vy: Math.sin(a) * v * 0.7,
          vida: 0, dura: 0.25 + Math.random() * 0.35 * fuerza,
          largo: 0.05 + Math.random() * 0.08,
        });
      }
    },
    actualizar(dt) {
      for (const m of motas) {
        m.vida += dt;
        m.vy -= 4 * dt;
        m.vx *= Math.exp(-3 * dt);
        m.x += m.vx * dt; m.y += m.vy * dt;
      }
      motas = motas.filter((m) => m.vida < m.dura);
    },
    dibujar(L) {
      if (!motas.length) return;
      const { ctx } = L;
      L.mundo();
      ctx.strokeStyle = C.barniz;
      ctx.lineCap = 'round';
      for (const m of motas) {
        const t = m.vida / m.dura;
        ctx.globalAlpha = 1 - t;
        ctx.lineWidth = 0.035 * (1 - t * 0.5);
        const s = Math.hypot(m.vx, m.vy) || 1;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - (m.vx / s) * m.largo, m.y - (m.vy / s) * m.largo);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}
