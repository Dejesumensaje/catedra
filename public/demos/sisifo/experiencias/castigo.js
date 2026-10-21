/* I · El castigo. La roca sube con el esfuerzo y, arriba, cae. Siempre. */

import * as regla from '../nucleo/reglas/castigo.js';
import { CASTIGO } from '../nucleo/parametros.js';
import { encuadrar, acercar, movimientoReducido as reducido } from '../escena/lienzo.js';
import { montarSolitaria } from './solitaria.js';
import * as sonido from '../sonido.js';

// Muy pocas palabras, y solo después de que la regla ya se dijo sola.
const TRAS_CICLO = { 3: 'Otra vez.', 7: 'Y otra vez.', 12: 'Arriba no hay nada que guardar.' };

export function montar(app) {
  const alto = regla.crearPerfil()(CASTIGO.largo);
  const caja = [-3.2, -0.6, CASTIGO.largo + 2.6, alto + 2.8];
  return montarSolitaria(app, {
    regla,
    crear: () => regla.crear(),
    pista: 'toca para empujar',
    encuadre(app, est, c) {
      // Mientras Sísifo baja a buscarla, la cámara lo acompaña a él.
      const foco = est.fase === 'bajando' ? { x: est.figura.x, y: c.y } : c;
      const meta = encuadrar(app.L, caja, foco, { anchoMinimo: 9 });
      const cam = app.L.cam;
      cam.k = meta.k;
      cam.x = acercar(cam.x, meta.x, 3, 1 / 60);
      cam.y = acercar(cam.y, meta.y, 3, 1 / 60);
    },
    alIniciar(app) {
      const c = { x: 0, y: 1 };
      Object.assign(app.L.cam, encuadrar(app.L, caja, c, { anchoMinimo: 9 }));
    },
    manosEn: (est) => est.fase === 'empujando',
    figuraDetras: (est) => est.fase === 'cayendo' || est.fase === 'bajando',
    // Arriba, la roca duda antes de caer: un temblor que crece. La anticipación es parte del castigo.
    tambaleo: (est) => (est.fase === 'cima' && !reducido()
      ? Math.sin(est.reloj * 26) * 0.07 * Math.min(1, est.reloj / CASTIGO.pausaCima) : 0),
    alEventos(app, est, eventos) {
      for (const ev of eventos) {
        if (ev === 'cae') { sonido.retumbo(); app.anunciar('La roca cae.'); }
        if (ev === 'otra-vez' && TRAS_CICLO[est.ciclos]) app.narrativa.decir(TRAS_CICLO[est.ciclos]);
      }
    },
  });
}
