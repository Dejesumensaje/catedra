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

/* Montes lejanos con paralaje y, en el camino, piedras, cipreses y columnas
 * caídas. Determinado por la semilla: lo que se deja atrás no cambia. */
function paisaje(L, est) {
  const { ctx } = L;
  const [v0, v1] = L.visible(4);
  L.mundo();
  // Montes: se mueven a un tercio de la velocidad.
  const par = 0.3;
  ctx.fillStyle = D.C.tierra;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  const base = L.cam.y - L.alto / L.cam.k;
  ctx.moveTo(v0, base);
  for (let x = v0; x <= v1 + 0.5; x += 0.5) {
    const xm = x - L.cam.x * (1 - par);
    const y = L.cam.y - 0.8 + 1.1 * Math.sin(xm * 0.21 + est.semilla) + 0.5 * Math.sin(xm * 0.57 + 2);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(v1 + 0.5, base);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Objetos sobre el camino, uno cada tantos metros, a veces ninguno.
  const tramo = 7;
  for (let i = Math.floor(v0 / tramo); i <= Math.ceil(v1 / tramo); i++) {
    const r = azar((est.semilla ^ (i * 2654435761)) >>> 0);
    const tipo = r();
    if (tipo < 0.35 || i < 1) continue;
    const x = i * tramo + r() * tramo * 0.6;
    if (Math.abs(x - est.roca.x) < 2.5) continue;
    const y = est.perfil(x);
    ctx.fillStyle = D.C.barniz;
    if (tipo < 0.6) {                       // piedra
      const s = 0.18 + r() * 0.2;
      ctx.beginPath();
      ctx.ellipse(x, y + s * 0.4, s, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (tipo < 0.82) {               // ciprés
      const h = 2.2 + r() * 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.quadraticCurveTo(x + 0.42, y + h * 0.45, x + 0.08, y);
      ctx.lineTo(x - 0.08, y);
      ctx.quadraticCurveTo(x - 0.42, y + h * 0.45, x, y + h);
      ctx.fill();
    } else {                                // columna caída: un fuste estriado
      const largo = 1.4 + r() * 0.8;
      ctx.fillRect(x, y, largo, 0.42);
      ctx.strokeStyle = D.C.hueso; ctx.lineWidth = 0.02;
      for (let k = 1; k < 3; k++) {
        ctx.beginPath(); ctx.moveTo(x + 0.06, y + k * 0.14); ctx.lineTo(x + largo - 0.06, y + k * 0.14); ctx.stroke();
      }
    }
  }
}
