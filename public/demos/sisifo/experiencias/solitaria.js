/* Armazón común de las tres versiones en solitario: entrada → esfuerzo → regla
 * → dibujo. Cada versión aporta su regla y unos pocos ganchos (encuadre,
 * frases, cierre). La simulación corre a paso fijo, separada de los cuadros. */

import { ESFUERZO, CUERPOS } from '../nucleo/parametros.js';
import { crearEsfuerzo, tocar, decaer } from '../nucleo/esfuerzo.js';
import { bucle, acercar, movimientoReducido } from '../escena/lienzo.js';
import { crearPolvo } from '../escena/polvo.js';
import * as D from '../escena/dibujo.js';
import { escucharToques } from '../entrada/toque.js';
import * as sonido from '../sonido.js';

const PASO = 1 / 120;

/**
 * cfg = {
 *   regla,                         módulo de nucleo/reglas
 *   crear(): estado,               estado inicial
 *   encuadre(app, est, foco),      fija app.L.cam (puede suavizar)
 *   alFondo?(app, est),            dibuja detrás del suelo
 *   alEventos?(app, est, eventos), frases, sonidos, cierres
 *   alCuadro?(app, est, dt),       lógica de presentación por cuadro
 *   manosEn?(est): bool,           si la figura apoya las manos en la roca
 *   pista: 'toca' …
 * }
 */
export function montarSolitaria(app, cfg) {
  const { L } = app;
  const forma = D.crearForma(5);
  const polvo = crearPolvo({ reducido: movimientoReducido() });
  let est, es, acumulado, vista, toques;

  const iniciar = () => {
    est = cfg.crear();
    es = crearEsfuerzo();
    acumulado = 0;
    toques = 0;
    vista = { inclinacion: 0, mov: 0, golpe: 0, figX: est.figura.x, abolladuras: [] };
    app.narrativa.limpiar();
    app.cerrarCierre();
    app.pista(cfg.pista);
    cfg.alIniciar?.(app, est);
  };

  const soltarEntrada = escucharToques(app.escena, (t) => {
    if (!cfg.regla.aceptaToques(est)) return;
    if (tocar(es, t / 1000, ESFUERZO)) {
      toques++;
      // Gamefeel: el toque es un golpe físico (no solo esfuerzo acumulado), el cuerpo
      // se encoge y empuja, y el pie de atrás levanta tierra.
      cfg.regla.impulso?.(est);
      vista.golpe = 1;
      const f = est.figura;
      const pie = f.x - f.mira * 0.35;
      polvo.levantar(pie, est.perfil(pie), 2 + Math.round(es.e * 3), 0.6 + es.e, -f.mira);
      // Contacto: las manos hunden un poco la roca donde empujan.
      const c = D.centroRoca(est.perfil, est.roca.x);
      vista.abolladuras.push({ a: Math.atan2(D.alturaHombros(est.perfil, f.x) - c.y, f.x - c.x), p: 0.5 + es.e });
      sonido.golpe(es.e);
      if (toques === 3) app.pista(null);
      cfg.alToque?.(app, est, toques);
    }
  });

  iniciar();
  const parar = bucle((dt) => {
    // Simulación a paso fijo.
    acumulado += dt;
    const eventos = [];
    while (acumulado >= PASO) {
      decaer(es, PASO, ESFUERZO);
      eventos.push(...cfg.regla.paso(est, PASO, { e: cfg.regla.aceptaToques(est) ? es.e : 0 }));
      acumulado -= PASO;
    }
    for (const ev of eventos) impacto(ev);
    if (eventos.length) cfg.alEventos?.(app, est, eventos);
    cfg.alCuadro?.(app, est, dt);

    // Presentación: suaviza lo que el cuerpo muestra del esfuerzo.
    const vel = Math.abs(est.figura.x - vista.figX) / Math.max(dt, 1e-3);
    vista.figX = est.figura.x;
    vista.mov = acercar(vista.mov, Math.min(1, vel * 2), 10, dt);
    vista.inclinacion = acercar(vista.inclinacion, Math.min(1, es.e / 0.7), 6, dt);
    vista.golpe = acercar(vista.golpe, 0, 9, dt);

    // La roca que rueda deprisa va levantando polvo donde toca el suelo.
    const rapidez = Math.abs(est.roca.v);
    if (rapidez > 1.1 && Math.random() < rapidez * dt * 5) {
      polvo.levantar(est.roca.x, est.perfil(est.roca.x), 2, Math.min(2, rapidez / 2), -Math.sign(est.roca.v));
    }
    // Pies que resbalan porque la roca los empuja cuesta abajo.
    const f = est.figura;
    if ((f.resbala || 0) > 0.15 && Math.random() < f.resbala * dt * 14) {
      const pie = f.x + f.mira * 0.1;
      polvo.levantar(pie, est.perfil(pie), 2, 0.5 + f.resbala, f.mira);
    }
    for (const ab of vista.abolladuras) ab.p -= dt / 0.16;
    vista.abolladuras = vista.abolladuras.filter((ab) => ab.p > 0);
    polvo.actualizar(dt);
    L.calmar(dt);

    const c = D.centroRoca(est.perfil, est.roca.x);
    const tiembla = cfg.tambaleo?.(est) || 0;
    c.x += tiembla * 0.4;
    cfg.encuadre(app, est, c);
    dibujar(c, tiembla);
  });

  /** Los golpes del mundo: la caída y el fondo se sienten en la cámara y en el suelo. */
  function impacto(ev) {
    const x = est.roca.x, y = est.perfil(x);
    if (ev === 'fondo') { L.sacudir(10); polvo.levantar(x, y, 14, 2.2); }
    if (ev === 'cae') { polvo.levantar(x, y, 4, 0.8); }
    if (ev === 'arrollado') { L.sacudir(6); const p = est.figura.x; polvo.levantar(p, est.perfil(p), 10, 1.6); }
    if (ev === 'cede') { L.sacudir(2.5); const p = est.figura.x - 0.3; polvo.levantar(p, est.perfil(p), 6, 1.4, -1); }
  }

  function dibujar(c, tiembla = 0) {
    D.fondo(L);
    cfg.alFondo?.(app, est);
    D.suelo(L, est.perfil);
    const f = est.figura;
    const manos = (cfg.manosEn ? cfg.manosEn(est) : f.pose === 'empuja')
      ? D.apoyo(c, CUERPOS.radioRoca, f.x + f.mira * 0.45, D.alturaHombros(est.perfil, f.x))
      : null;
    const giro = -est.roca.s / CUERPOS.radioRoca + tiembla;
    const pintarFigura = () => D.figura(L, est.perfil, {
      x: f.x, mira: f.mira, pose: f.pose, zancada: f.s, mov: vista.mov,
      inclinacion: f.pose === 'empuja' ? vista.inclinacion : 0,
      golpe: vista.golpe, manos, resbala: f.resbala || 0,
    });
    // Si la figura queda detrás de la roca (la roca le pasa por delante), una
    // línea de arcilla separa las dos siluetas, como una incisión.
    if (cfg.figuraDetras?.(est)) {
      pintarFigura();
      D.roca(L, forma, c, CUERPOS.radioRoca, giro, { contorno: D.C.arcilla, grosor: 0.04, abolladuras: vista.abolladuras });
    } else {
      D.roca(L, forma, c, CUERPOS.radioRoca, giro, { abolladuras: vista.abolladuras });
      pintarFigura();
    }
    polvo.dibujar(L);
    cfg.alFrente?.(app, est, c);
    D.friso(L);
  }

  return {
    reiniciar: iniciar,
    estado: () => est,
    desmontar() { parar(); soltarEntrada(); app.narrativa.limpiar(); app.pista(null); app.cerrarCierre(); cfg.alDesmontar?.(app); },
  };
}
