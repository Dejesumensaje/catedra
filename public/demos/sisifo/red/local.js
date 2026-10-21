/* Sala de prueba: «La comunidad» para una sola persona, con las demás simuladas.
 *
 * No es otra versión del juego. Corre la MISMA autoridad que el servidor
 * (nucleo/sala.js) dentro del navegador y le habla a la pantalla con los mismos
 * mensajes, con un poco de latencia. Las personas simuladas solo pueden hacer
 * lo que haría un teléfono: mandar toques, que la sala acepta o rechaza con
 * las mismas reglas. Sirve para probar la mecánica sin reunir a nadie; la
 * pantalla dice siempre que las demás personas son simuladas. */

import { LogicaSala } from '../nucleo/sala.js';
import { COMUNIDAD } from '../nucleo/parametros.js';

const LATENCIA = 45;       // ms, ida o vuelta
const MAX_SIMULADAS = 8;

/** Una mano simulada: ritmo propio, rachas y descansos, y reacción al grupo. */
function crearMano(semilla) {
  let a = semilla >>> 0;
  const r = () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), a | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return {
    id: `simulada-${semilla.toString(36)}-${Math.floor(r() * 1e6).toString(36)}`,
    ritmo: 2.4 + r() * 3.4,        // toques por segundo cuando toca
    toca: true,
    hasta: 0,                      // fin de la racha o del descanso
    proximo: 0,
    r,
  };
}

export function salaLocal({ id, nombre, alMensaje, alEstado }) {
  const logica = new LogicaSala({ codigo: 'PRUEBA', anfitrionInicial: id });
  const manos = [];
  let ultimo = 0, vivo = true, semilla = (Math.random() * 1e9) | 0;
  const entregar = (m) => setTimeout(() => { if (vivo) { ultimo = performance.now(); alMensaje(m); } }, LATENCIA);

  alEstado('conectando');
  setTimeout(() => {
    const r = logica.unir(id, nombre(), Date.now());
    entregar({ t: 'hola', n: r.persona.n, codigo: 'PRUEBA' });
    setTimeout(() => alEstado('conectada'), LATENCIA);
    // Llegan de a poco, como en un salón.
    [700, 1600, 2700].forEach((ms) => setTimeout(() => vivo && agregar(), ms));
  }, 250);

  function agregar() {
    const conectadas = manos.length;
    if (conectadas >= MAX_SIMULADAS) return;
    const m = crearMano(++semilla);
    manos.push(m);
    logica.unir(m.id, '', Date.now());
  }
  function quitar() {
    const m = manos.pop();
    if (m) logica.soltar(m.id, Date.now());
  }

  const dt = 1 / COMUNIDAD.hz;
  const intervalo = setInterval(() => {
    const ahora = Date.now();
    const j = logica.juego;
    for (const m of manos) {
      logica.mensaje(m.id, { t: 'ping' }, ahora);
      if (j.fase !== 'juego') continue;
      if (ahora >= m.hasta) {
        // Alterna rachas (3–9 s) y descansos (0,6–3 s). Si la roca retrocede, descansa menos.
        const cede = j.roca.v < -0.05;
        m.toca = m.toca ? (m.r() < (cede ? 0.15 : 0.35) ? false : true) : true;
        m.hasta = ahora + (m.toca ? 3000 + m.r() * 6000 : 600 + m.r() * 2400);
      }
      if (!m.toca) continue;
      if (ahora >= m.proximo) {
        logica.mensaje(m.id, { t: 'toque' }, ahora);
        const empuje = j.roca.v < -0.05 ? 1.25 : 1;   // cuando la ven volver, aprietan
        m.proximo = ahora + (1000 / (m.ritmo * empuje)) * (0.75 + 0.5 * m.r());
      }
    }
    logica.mensaje(id, { t: 'ping' }, ahora);
    const { difundir } = logica.tick(dt, ahora);
    for (const msg of difundir) entregar(msg);
  }, 1000 / COMUNIDAD.hz);

  return {
    prueba: true,
    enviar(m) { setTimeout(() => vivo && logica.mensaje(id, m, Date.now()), LATENCIA); return true; },
    agregar, quitar,
    simuladas: () => manos.length,
    maximo: MAX_SIMULADAS,
    reintentar() {},
    cerrar() { vivo = false; clearInterval(intervalo); },
    silencioMs: () => (ultimo ? performance.now() - ultimo : Infinity),
    estado: () => 'conectada',
  };
}
