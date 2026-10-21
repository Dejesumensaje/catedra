/* El lienzo: tamaño real del dispositivo, cámara en metros y un bucle de cuadros.
 * El mundo se dibuja en metros con el eje y hacia arriba; esta capa traduce. */

export const movimientoReducido = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export function crearLienzo(canvas) {
  const ctx = canvas.getContext('2d');
  const L = {
    canvas, ctx,
    ancho: 0, alto: 0, dpr: 1,
    cam: { x: 0, y: 0, k: 40 },   // centro en metros y píxeles CSS por metro
    temblor: 0,                   // píxeles de sacudida, decae solo
    desvio: [0, 0],               // la sacudida de este cuadro (igual para todas las capas)
    medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const r = canvas.getBoundingClientRect();
      L.ancho = r.width; L.alto = r.height; L.dpr = dpr;
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    },
    /** Pasa a coordenadas de mundo: metros, y hacia arriba. */
    mundo() {
      const { cam, dpr } = L;
      const [tx, ty] = L.desvio;
      ctx.setTransform(cam.k * dpr, 0, 0, -cam.k * dpr, (L.ancho / 2 - cam.x * cam.k + tx) * dpr, (L.alto / 2 + cam.y * cam.k + ty) * dpr);
    },
    /** Un golpe que se siente: la escena tiembla y se calma. Nunca con movimiento reducido. */
    sacudir(px) { if (!movimientoReducido()) L.temblor = Math.max(L.temblor, px); },
    /** Una vez por cuadro: decae la sacudida y fija su desvío. */
    calmar(dt) {
      L.temblor = L.temblor < 0.3 ? 0 : L.temblor * Math.exp(-9 * dt);
      L.desvio = L.temblor ? [(Math.random() - 0.5) * L.temblor, (Math.random() - 0.5) * L.temblor] : [0, 0];
    },
    /** Coordenadas de pantalla en píxeles CSS. */
    pantalla() { ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0); },
    aPantalla(x, y) {
      return [L.ancho / 2 + (x - L.cam.x) * L.cam.k, L.alto / 2 - (y - L.cam.y) * L.cam.k];
    },
    /** Rango de x del mundo visible, con margen. */
    visible(margen = 2) {
      const media = L.ancho / 2 / L.cam.k;
      return [L.cam.x - media - margen, L.cam.x + media + margen];
    },
  };
  L.medir();
  return L;
}

/**
 * Encuadra una caja del mundo. En pantallas angostas no se encoge por debajo de
 * `anchoMinimo` metros visibles: la cámara sigue al `foco` dentro de la caja.
 * `arriba` y `abajo` son píxeles reservados (barra, frases, controles).
 */
export function encuadrar(L, caja, foco, { anchoMinimo = 9, arriba = 70, abajo = 60 } = {}) {
  const [x0, y0, x1, y1] = caja;
  const util = Math.max(120, L.alto - arriba - abajo);
  const kCaja = Math.min(L.ancho / (x1 - x0), util / (y1 - y0));
  // Si la caja entera deja las figuras demasiado pequeñas (teléfono vertical),
  // se acerca hasta `anchoMinimo` metros visibles o 52 px por metro, lo que llegue antes.
  const k = Math.max(kCaja, Math.min(L.ancho / anchoMinimo, 52));
  const mediaX = L.ancho / 2 / k;
  let cx = (x0 + x1) / 2;
  if (mediaX * 2 < x1 - x0) cx = Math.min(x1 - mediaX, Math.max(x0 + mediaX, foco.x));
  // Vertical: la caja (o el foco, si no cabe) queda centrada en la franja útil.
  const mediaY = util / 2 / k;
  let yc = (y0 + y1) / 2;
  if (mediaY * 2 < y1 - y0) yc = Math.min(y1 - mediaY, Math.max(y0 + mediaY, foco.y));
  const y = yc + (arriba - abajo) / (2 * k);
  return { x: cx, y, k };
}

/** Bucle de cuadros con dt acotado (una pestaña dormida no produce saltos). */
export function bucle(alCuadro) {
  let antes = performance.now(), id = 0, vivo = true;
  const cuadro = (ahora) => {
    if (!vivo) return;
    const dt = Math.min(0.05, (ahora - antes) / 1000);
    antes = ahora;
    alCuadro(dt, ahora);
    id = requestAnimationFrame(cuadro);
  };
  id = requestAnimationFrame(cuadro);
  return () => { vivo = false; cancelAnimationFrame(id); };
}

/** Acerca suavemente un valor a otro, independiente de los cuadros por segundo. */
export const acercar = (actual, meta, rapidez, dt) => actual + (meta - actual) * (1 - Math.exp(-rapidez * dt));
