/* III · La caída. La roca ya viene. Tocar no empuja: resiste. */

import * as regla from '../nucleo/reglas/caida.js';
import { CAIDA } from '../nucleo/parametros.js';
import { encuadrar, acercar } from '../escena/lienzo.js';
import { barajar } from '../nucleo/fisica.js';
import { montarSolitaria } from './solitaria.js';
import * as sonido from '../sonido.js';

/* Cada frase espera una conducta: no todas aparecen en una misma caída. */
const FRASES = {
  sostener: ['¿Qué estás intentando salvar?', '¿Es tu responsabilidad impedirlo?'],
  soltar: ['¿Qué ocurriría si la dejaras caer?', '¿Y si no hicieras nada?'],
  insistir: ['¿Por qué intentas detenerla?'],
};
const TODAS = Object.values(FRASES).flat();

export function montar(app) {
  const perfil = regla.crearPerfil();
  const caja = [-4.2, -0.6, CAIDA.largo + 1.8, perfil(CAIDA.largo) + 2.8];
  let dichas, tocó, finalizada, vivo = true;

  const decir = (grupo) => {
    if (dichas.length >= 2) return;
    const libre = barajar(FRASES[grupo], Math.random).find((f) => !dichas.includes(f));
    if (libre && app.narrativa.decir(libre)) dichas.push(libre);
  };

  return montarSolitaria(app, {
    regla,
    crear: () => regla.crear(),
    pista: 'toca',
    alIniciar(app) {
      dichas = []; tocó = false; finalizada = false;
      Object.assign(app.L.cam, encuadrar(app.L, caja, { x: CAIDA.largo, y: perfil(CAIDA.largo) }, { anchoMinimo: 9 }));
    },
    alToque() { tocó = true; },
    encuadre(app, est, c) {
      const meta = encuadrar(app.L, caja, c, { anchoMinimo: 9 });
      const cam = app.L.cam;
      cam.k = meta.k;
      cam.x = acercar(cam.x, meta.x, 3, 1 / 60);
      cam.y = acercar(cam.y, meta.y, 3, 1 / 60);
    },
    manosEn: (est) => est.fase !== 'fondo',
    alCuadro(app, est) {
      if (est.fase !== 'cayendo') return;
      if (est.sostenido > 2.2) decir('sostener');
      else if (est.sinTocar > 3.5 && est.reloj > 3) decir('soltar');
      else if (tocó && est.frenando > 9) decir('insistir');
    },
    alDesmontar() { vivo = false; },
    alEventos(app, est, eventos) {
      for (const ev of eventos) {
        if (ev === 'cede') sonido.golpe(0.2);
        if (ev === 'fondo' && !finalizada) {
          finalizada = true;
          sonido.retumbo();
          app.pista(null);
          const resto = barajar(TODAS.filter((f) => !dichas.includes(f)), Math.random);
          setTimeout(() => {
            if (!vivo || !finalizada) return;
            app.narrativa.callar();
            app.cierre(resto[0] || 'Ya está abajo.', [
              { texto: 'otra vez', accion: 'reiniciar' },
              { texto: 'índice', accion: 'indice', claro: true },
            ]);
          }, 1600);
        }
      }
    },
  });
}
