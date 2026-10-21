/* II · El camino. El mismo gesto, sin cima. Las preguntas aparecen al andar. */

import * as regla from '../nucleo/reglas/camino.js';
import { CAMINO } from '../nucleo/parametros.js';
import { acercar, movimientoReducido } from '../escena/lienzo.js';
import { azar, barajar } from '../nucleo/fisica.js';
import * as D from '../escena/dibujo.js';
import { montarSolitaria } from './solitaria.js';

const PREGUNTAS = [
  '¿Adónde vas?',
  '¿Cuánto falta?',
  '¿Quién decidió que debías llegar?',
  '¿Qué esperas encontrar?',
  '¿Qué pasaría si dejaras de empujar?',
];
const TARDIA = '¿Por qué sigues?';            // solo después de varias
const QUIETUD = 'Puedes parar cuando quieras.'; // solo si ya te detuviste un rato

export function montar(app) {
  let cola, ultima, ultimaX, tiempoEmpujando, zoom, parada;
  const boton = document.getElementById('parar');
  document.body.classList.add('en-camino');

  const onParar = () => {
    const est = exp.estado();
    if (est.fase !== 'empujando') return;
    regla.parar(est);
    parada = performance.now();
    app.narrativa.callar();
    app.pista(null);
    setTimeout(() => {
      if (exp.estado() !== est || est.fase !== 'parado') return;
      app.cierre('Te detuviste aquí.', [
        { texto: 'seguir', accion: () => { est.fase = 'empujando'; app.cerrarCierre(); boton.hidden = false; } },
        { texto: 'índice', accion: 'indice', claro: true },
      ]);
    }, movimientoReducido() ? 300 : 2600);
    boton.hidden = true;
  };
  boton.addEventListener('click', onParar);
  boton.hidden = false;

  const exp = montarSolitaria(app, {
    regla,
    crear: () => regla.crear(),
    pista: 'toca para empujar',
    alIniciar(app) {
      cola = barajar(PREGUNTAS, Math.random).slice(0, 4);
      ultima = performance.now() / 1000; ultimaX = 0; tiempoEmpujando = 0; zoom = 1; parada = 0;
      boton.hidden = false;
    },
    manosEn: (est) => est.fase === 'empujando' && est.figura.pose === 'empuja',
    encuadre(app, est, c) {
      const L = app.L;
      // Más cerca que las otras versiones: el mundo pasa, no se abarca.
      const base = Math.max(L.ancho / 14, Math.min(L.ancho / 8.5, (L.alto - 120) / 7));
      zoom = acercar(zoom, est.fase === 'parado' ? 0.45 : 1, 0.6, 1 / 60);
      L.cam.k = base * zoom;
      const adelante = (L.ancho / L.cam.k) * 0.12;
      L.cam.x = acercar(L.cam.x || c.x, c.x + adelante, 2.5, 1 / 60);
      const metaY = c.y + 0.4 + ((L.alto / 2 - 90) / L.cam.k) * 0.25;
      L.cam.y = acercar(L.cam.y || metaY, metaY, 2, 1 / 60);
    },
    alCuadro(app, est, dt) {
      if (est.fase !== 'empujando') return;
      if (est.roca.v > 0.05) tiempoEmpujando += dt;
      const t = performance.now() / 1000;
      const P = CAMINO;
      const primera = ultimaX === 0;
      const listo = primera
        ? tiempoEmpujando > P.primeraTras && est.roca.x > P.primeraMetros
        : t - ultima > P.separacion && est.roca.x - ultimaX > P.separacionMetros;
      if (est.quieto > P.quietoParaHablar && !app.narrativa.dicha(QUIETUD) && tiempoEmpujando > 10) {
        if (app.narrativa.decir(QUIETUD)) { ultima = t; }
        return;
      }
      if (!listo || est.roca.v < 0.05) return;
      const frase = cola.length ? cola.shift() : (!app.narrativa.dicha(TARDIA) ? TARDIA : null);
      if (frase && app.narrativa.decir(frase)) { ultima = t; ultimaX = est.roca.x; }
    },
    alFondo(app, est) { paisaje(app.L, est); },
    alDesmontar() {
      boton.removeEventListener('click', onParar);
      document.body.classList.remove('en-camino');
    },
  });
  return exp;
}

/* El paisaje vive detrás del camino, en dos planos con paralaje: montes muy
 * lejos y, más cerca, una loma con cipreses, piedras y columnas caídas. Nada se
 * cruza con la roca ni aparece o desaparece: solo pasa, más despacio que el
 * camino. Determinado por la semilla: lo que se deja atrás no cambia. */
function paisaje(L, est) {
  const { ctx } = L;
  // horizonte de cada plano, en fracción de la altura de pantalla
  const capa = (paralaje, escala, horizonte) => {
    const k = L.cam.k * escala;
    const ox = L.ancho / 2 - L.cam.x * paralaje * k;
    ctx.setTransform(k * L.dpr, 0, 0, -k * L.dpr, (ox + L.desvio[0]) * L.dpr, (L.alto * horizonte + L.desvio[1]) * L.dpr);
    const media = L.ancho / 2 / k;
    return { k, x0: L.cam.x * paralaje - media - 4, x1: L.cam.x * paralaje + media + 4, abajo: -(L.alto * (1 - horizonte)) / k - 1 };
  };
  const s = est.semilla % 1000;

  // Montes lejanos.
  let c = capa(0.12, 0.45, 0.5);
  ctx.fillStyle = D.C.tierra;
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.moveTo(c.x0, c.abajo);
  for (let x = c.x0; x <= c.x1 + 0.5; x += 0.5) ctx.lineTo(x, 2.2 + 1.6 * Math.sin(x * 0.07 + s) + 0.7 * Math.sin(x * 0.19 + 2));
  ctx.lineTo(c.x1 + 0.5, c.abajo);
  ctx.fill();

  // Loma media con sus objetos.
  c = capa(0.4, 0.6, 0.56);
  const loma = (x) => 0.5 * Math.sin(x * 0.06 + s * 0.7) + 0.25 * Math.sin(x * 0.17 + 1);
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(c.x0, c.abajo);
  for (let x = c.x0; x <= c.x1 + 0.4; x += 0.4) ctx.lineTo(x, loma(x));
  ctx.lineTo(c.x1 + 0.4, c.abajo);
  ctx.fill();

  ctx.globalAlpha = 0.62;
  ctx.fillStyle = D.C.barniz;
  const tramo = 6;
  for (let i = Math.floor(c.x0 / tramo); i <= Math.ceil(c.x1 / tramo); i++) {
    const r = azar((est.semilla ^ Math.imul(i, 2654435761)) >>> 0);
    const tipo = r();
    if (tipo < 0.3) continue;
    const x = i * tramo + r() * tramo * 0.7;
    const y = loma(x) - 0.05;
    if (tipo < 0.5) {                       // piedra
      const t = 0.25 + r() * 0.3;
      ctx.beginPath(); ctx.ellipse(x, y + t * 0.35, t, t * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    } else if (tipo < 0.8) {                // ciprés (a veces dos)
      const n = r() < 0.4 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const h = 2.4 + r() * 1.8, xx = x + k * 0.9;
        ctx.beginPath();
        ctx.moveTo(xx, y + h);
        ctx.quadraticCurveTo(xx + 0.45, y + h * 0.45, xx + 0.09, y);
        ctx.lineTo(xx - 0.09, y);
        ctx.quadraticCurveTo(xx - 0.45, y + h * 0.45, xx, y + h);
        ctx.fill();
      }
    } else if (tipo < 0.92) {               // columna caída: un fuste estriado
      const largo = 1.6 + r() * 1;
      ctx.fillRect(x, y, largo, 0.45);
      ctx.strokeStyle = D.C.arcilla; ctx.lineWidth = 0.03;
      for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + 0.08, y + k * 0.15); ctx.lineTo(x + largo - 0.08, y + k * 0.15); ctx.stroke(); }
    } else {                                // columna en pie, sin techo
      const h = 2.2 + r() * 1.2;
      ctx.fillRect(x - 0.22, y, 0.44, h);
      ctx.fillRect(x - 0.36, y + h, 0.72, 0.18);
    }
  }
  ctx.globalAlpha = 1;
}
