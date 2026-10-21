/* Entrada del laboratorio: rutas por hash, montaje de cada versión y los pocos
 * controles compartidos (volver, otra vez, sonido, créditos). */

import { crearLienzo } from './escena/lienzo.js';
import { crearNarrativa } from './escena/narrativa.js';
import * as D from './escena/dibujo.js';
import * as sonido from './sonido.js';
import { CASTIGO, CUERPOS } from './nucleo/parametros.js';
import * as castigoRegla from './nucleo/reglas/castigo.js';

const EXPERIENCIAS = {
  castigo: () => import('./experiencias/castigo.js'),
  camino: () => import('./experiencias/camino.js'),
  caida: () => import('./experiencias/caida.js'),
  comunidad: () => import('./experiencias/comunidad.js'),
};
const TITULOS = { castigo: 'El castigo', camino: 'El camino', caida: 'La caída', comunidad: 'La comunidad' };

D.leerColores();
const escena = document.getElementById('escena');
const L = crearLienzo(escena.querySelector('canvas'));
const $ = (s) => document.querySelector(s);
const cierre = $('#cierre');
const pista = $('#pista');
const vivo = $('#estado-vivo');

const app = {
  L,
  escena,
  narrativa: crearNarrativa($('#inscripcion')),
  pista(texto) {
    if (!texto) { pista.classList.remove('visible'); return; }
    const teclado = matchMedia('(pointer: fine)').matches;
    pista.textContent = teclado ? `${texto} · o pulsa espacio` : texto;
    pista.classList.add('visible');
  },
  /** Cierre de partida: una inscripción y dos salidas. */
  cierre(texto, botones) {
    cierre.innerHTML = `<p id="cierre-texto" style="font: italic 500 clamp(26px,5.6vw,40px)/1.15 var(--serif); margin: 0 0 14px"></p><div class="botones"></div>`;
    cierre.querySelector('#cierre-texto').textContent = texto;
    const fila = cierre.querySelector('.botones');
    for (const b of botones) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = b.claro ? 'boton claro' : 'boton';
      el.textContent = b.texto;
      el.addEventListener('click', () => {
        if (b.accion === 'indice') location.hash = '';
        else if (b.accion === 'reiniciar') actual?.reiniciar();
        else b.accion();
      });
      fila.append(el);
    }
    cierre.classList.add('abierto');
    fila.querySelector('button')?.focus({ preventScroll: true });
  },
  cerrarCierre() { cierre.classList.remove('abierto'); cierre.innerHTML = ''; },
  anunciar(texto) { vivo.textContent = texto; },
};

/* ── rutas ──────────────────────────────────────────────────── */

let actual = null;
let ruta = null;
let pararReposo = null;

async function irA() {
  const [nombre, extra] = location.hash.replace(/^#/, '').split('/');
  const clave = location.hash;
  if (clave === ruta) return;
  ruta = clave;
  actual?.desmontar();
  actual = null;
  pararReposo?.();
  pararReposo = null;
  cerrarCreditos();

  if (nombre === 'creditos') { mostrarIndice(); abrirCreditos(); return; }
  if (!EXPERIENCIAS[nombre]) { mostrarIndice(); return; }

  document.body.classList.remove('indice');
  document.body.classList.add('jugando');
  document.title = `${TITULOS[nombre]} — Sísifo`;
  const mod = await EXPERIENCIAS[nombre]();
  if (ruta !== clave) return;           // se cambió de ruta mientras cargaba
  actual = mod.montar(app, extra);
}

/* El índice: la misma pendiente, con Sísifo quieto al pie de la roca. */
function mostrarIndice() {
  document.body.classList.add('indice');
  document.body.classList.remove('jugando');
  document.title = 'Sísifo — cuatro reglas para una roca';
  const est = castigoRegla.crear();
  const forma = D.crearForma(5);
  const alto = est.perfil(CASTIGO.largo);
  // Un pequeño escenario flotante, en el espacio que deja el texto: a la
  // derecha en pantallas anchas, debajo en los teléfonos.
  const pintar = () => {
    L.medir();
    D.fondo(L);
    const marco = document.querySelector('#indice .marco').getBoundingClientRect();
    const ancho = L.ancho - marco.right > 360;
    const zona = ancho
      ? { x: marco.right + 24, y: 60, w: L.ancho - marco.right - 48, h: L.alto - 100 }
      : { x: 16, y: marco.bottom + 24 - document.getElementById('indice').scrollTop, w: L.ancho - 32, h: L.alto - marco.bottom - 54 };
    if (zona.h < 110) { D.friso(L); return; }
    const caja = ancho ? [-3.6, -0.6, CASTIGO.largo + 1.2, alto + 2.4] : [-3.6, -0.6, 3.6, 3.4];
    const k = Math.min(zona.w / (caja[2] - caja[0]), zona.h / (caja[3] - caja[1]), 70);
    L.cam.k = k;
    L.cam.x = (caja[0] + caja[2]) / 2 - (zona.x + zona.w / 2 - L.ancho / 2) / k;
    L.cam.y = (caja[1] + caja[3]) / 2 + (zona.y + zona.h / 2 - L.alto / 2) / k;
    D.suelo(L, est.perfil, { desde: -3.6, hasta: ancho ? CASTIGO.largo + 1.2 : 3.6 });
    const c = D.centroRoca(est.perfil, 0);
    D.roca(L, forma, c, CUERPOS.radioRoca, 0);
    const x = -CUERPOS.separacion;
    D.figura(L, est.perfil, { x: x + 0.5, mira: 1, pose: 'quieto' });
    D.friso(L);
  };
  pintar();
  const indice = document.getElementById('indice');
  addEventListener('resize', pintar);
  indice.addEventListener('scroll', pintar, { passive: true });
  pararReposo = () => { removeEventListener('resize', pintar); indice.removeEventListener('scroll', pintar); };
}

/* ── controles ──────────────────────────────────────────────── */

const creditos = $('#creditos');
function abrirCreditos() { creditos.classList.add('abierto'); creditos.querySelector('[data-cerrar]').focus({ preventScroll: true }); }
function cerrarCreditos() { creditos.classList.remove('abierto'); }
$('#abrir-creditos').addEventListener('click', () => (creditos.classList.contains('abierto') ? cerrarCreditos() : abrirCreditos()));
creditos.querySelector('[data-cerrar]').addEventListener('click', cerrarCreditos);
document.querySelectorAll('[data-creditos]').forEach((b) => b.addEventListener('click', abrirCreditos));
addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarCreditos(); });

$('#reiniciar').addEventListener('click', () => actual?.reiniciar());

const botonSonido = $('#sonido');
const pintarSonido = () => {
  botonSonido.setAttribute('aria-pressed', String(sonido.sonidoActivo()));
  botonSonido.title = sonido.sonidoActivo() ? 'Silenciar' : 'Activar sonido';
};
botonSonido.addEventListener('click', () => { sonido.alternarSonido(); pintarSonido(); });
pintarSonido();

addEventListener('resize', () => L.medir());
addEventListener('hashchange', irA);
matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => { ruta = null; irA(); });
irA();
