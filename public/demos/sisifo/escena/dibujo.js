/* Dibujo del teatro: suelo, roca y figuras, a la manera de la cerámica de
 * figuras negras —siluetas de barniz sobre arcilla, con incisiones en hueso
 * que separan miembros y marcan la tensión—.
 *
 * Todo se dibuja en metros (ver lienzo.mundo()). Nada aquí decide reglas:
 * recibe posiciones y poses y las pinta. */

import { azar, tangente } from '../nucleo/fisica.js';
import { CUERPOS } from '../nucleo/parametros.js';

const css = (v, porDefecto) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim() || porDefecto;

export const C = {
  arcilla: '#c8703c', tierra: '#9c4c24', barniz: '#17120e', hueso: '#f1e6d0', senal: '#ffe45c',
};
export function leerColores() {
  for (const k of Object.keys(C)) C[k] = css(`--${k}`, C[k]);
}

/* ── fondo y suelo ─────────────────────────────────────────── */

export function fondo(L) {
  L.pantalla();
  L.ctx.fillStyle = C.arcilla;
  L.ctx.fillRect(0, 0, L.ancho, L.alto);
}

export function suelo(L, perfil, { desde, hasta } = {}) {
  const { ctx } = L;
  const [v0, v1] = L.visible(1);
  const a = Math.max(v0, desde ?? v0), b = Math.min(v1, hasta ?? v1);
  const fondoY = L.cam.y - L.alto / L.cam.k;
  L.mundo();
  ctx.beginPath();
  ctx.moveTo(a, fondoY);
  for (let x = a; x <= b + 0.1; x += 0.1) ctx.lineTo(x, perfil(x));
  ctx.lineTo(b, fondoY);
  ctx.closePath();
  ctx.fillStyle = C.tierra;
  ctx.fill();
  // Filo del suelo y, debajo, una línea de registro incisa.
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let x = a; x <= b + 0.1; x += 0.1) ctx.lineTo(x, perfil(x));
  ctx.strokeStyle = C.barniz;
  ctx.lineWidth = 0.08;
  ctx.stroke();
  ctx.beginPath();
  for (let x = a; x <= b + 0.1; x += 0.1) ctx.lineTo(x, perfil(x) - 0.26);
  ctx.strokeStyle = C.barniz;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 0.025;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Friso de meandro al pie de la pantalla: el borde del vaso. */
export function friso(L) {
  const { ctx } = L;
  if (L.alto < 380) return;
  L.pantalla();
  const h = 14, y0 = L.alto - h;
  ctx.fillStyle = C.barniz;
  ctx.fillRect(0, y0, L.ancho, h);
  ctx.strokeStyle = C.arcilla;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const u = 14;
  for (let x = -((L.cam.x * L.cam.k * 0.5) % u) - u; x < L.ancho + u; x += u) {
    // una vuelta de greca: └┐ cuadrada
    const t = y0 + 3, bt = y0 + h - 3;
    ctx.moveTo(x, bt); ctx.lineTo(x, t); ctx.lineTo(x + u * 0.7, t); ctx.lineTo(x + u * 0.7, bt - 4);
    ctx.lineTo(x + u * 0.35, bt - 4); ctx.lineTo(x + u * 0.35, bt); ctx.lineTo(x + u, bt);
  }
  ctx.stroke();
}

/* ── roca ──────────────────────────────────────────────────── */

export function crearForma(semilla = 3) {
  const r = azar(semilla);
  const n = 13;
  const puntos = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.25;
    puntos.push([a, 0.9 + r() * 0.13]);
  }
  const grietas = [];
  for (let g = 0; g < 3; g++) {
    const a = r() * Math.PI * 2;
    const linea = [[Math.cos(a) * 0.86, Math.sin(a) * 0.86]];
    let [x, y] = linea[0];
    for (let k = 0; k < 3; k++) {
      x *= 0.62; y *= 0.62;
      x += (r() - 0.5) * 0.35; y += (r() - 0.5) * 0.35;
      linea.push([x, y]);
    }
    grietas.push(linea);
  }
  return { puntos, grietas };
}

/** Centro de la roca apoyada en el perfil en x (el contacto está en x). */
export function centroRoca(perfil, x, r = CUERPOS.radioRoca) {
  const m = tangente(perfil, x);
  const n = Math.hypot(1, m);
  return { x: x - (m / n) * r, y: perfil(x) + (1 / n) * r };
}

/**
 * opciones: escala (latido), abolladuras [{a (ángulo en mundo), p (0..1)}],
 * contorno: color de un segundo trazo exterior, grosor del contorno en metros.
 */
export function roca(L, forma, c, r, giro, { escala = 1, abolladuras = [], contorno = null, grosor = 0.06, doble = false } = {}) {
  const { ctx } = L;
  L.mundo();
  const R = r * escala;
  ctx.beginPath();
  forma.puntos.forEach(([a, k], i) => {
    const am = a + giro;
    let d = 0;
    for (const ab of abolladuras) {
      const dif = Math.atan2(Math.sin(am - ab.a), Math.cos(am - ab.a));
      d += ab.p * 0.09 * Math.max(0, 1 - Math.abs(dif) / 0.7);
    }
    const rr = R * (k - d);
    const px = c.x + Math.cos(am) * rr, py = c.y + Math.sin(am) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  });
  ctx.closePath();
  if (contorno) {
    ctx.lineJoin = 'round';
    if (doble) {
      ctx.strokeStyle = C.barniz; ctx.lineWidth = grosor * 2 + 0.08; ctx.stroke();
    }
    ctx.strokeStyle = contorno; ctx.lineWidth = grosor * 2; ctx.stroke();
  }
  ctx.fillStyle = C.barniz;
  ctx.fill();
  // Grietas incisas: giran con la roca.
  ctx.strokeStyle = C.hueso;
  ctx.lineWidth = 0.022;
  ctx.lineCap = 'round';
  const cos = Math.cos(giro), sin = Math.sin(giro);
  for (const g of forma.grietas) {
    ctx.beginPath();
    g.forEach(([x, y], i) => {
      const px = c.x + (x * cos - y * sin) * R * 0.95, py = c.y + (x * sin + y * cos) * R * 0.95;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    });
    ctx.stroke();
  }
}

/* ── figura ────────────────────────────────────────────────── */

const MUSLO = 0.47, PIERNA = 0.47, TORSO = 0.6, BRAZO = 0.32, ANTEBRAZO = 0.32, CABEZA = 0.135;

/** Cinemática inversa de dos huesos. `doblez` = ±1 elige hacia dónde se dobla. */
function ik(ax, ay, bx, by, l1, l2, doblez) {
  let dx = bx - ax, dy = by - ay;
  let d = Math.hypot(dx, dy) || 1e-6;
  const max = l1 + l2 - 1e-4;
  if (d > max) { bx = ax + (dx / d) * max; by = ay + (dy / d) * max; dx = bx - ax; dy = by - ay; d = max; }
  d = Math.max(d, Math.abs(l1 - l2) + 1e-3);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const ang = Math.atan2(dy, dx) + doblez * Math.acos(Math.max(-1, Math.min(1, cosA)));
  const jx = ax + Math.cos(ang) * l1, jy = ay + Math.sin(ang) * l1;
  return [jx, jy, bx, by];
}

/**
 * Calcula el esqueleto. f = { x, mira (±1), pose, inclinacion (0..1), zancada (m),
 * mov (0..1), manos: {x,y} | null, golpe (0..1) }.
 * Poses: empuja · camina · agotado · quieto · sentado.
 */
export function esqueleto(perfil, f) {
  const m = f.mira || 1;
  const pose = f.pose || 'quieto';
  const g = (x) => perfil(x);
  if (pose === 'tendido') return tendido(perfil, f, m);
  const golpe = f.golpe || 0;
  let lean, alturaCadera, adelante = 0;
  switch (pose) {
    case 'empuja': lean = 0.3 + 0.36 * (f.inclinacion || 0) + 0.12 * golpe; alturaCadera = 0.87 - 0.06 * (f.inclinacion || 0) - 0.06 * golpe; break;
    case 'camina': lean = 0.07; alturaCadera = 0.92; break;
    case 'agotado': lean = 0.42; alturaCadera = 0.8; break;
    case 'sentado': lean = -0.22; alturaCadera = 0.3; adelante = -0.15; break;
    default: lean = 0.04; alturaCadera = 0.93;
  }
  const hx = f.x + m * adelante;
  const hy = g(f.x) + alturaCadera;
  const sx = hx + m * Math.sin(lean) * TORSO, sy = hy + Math.cos(lean) * TORSO;
  const cabezaLean = lean + (pose === 'agotado' ? 0.5 : pose === 'empuja' ? 0.15 : 0);
  const cx = sx + m * Math.sin(cabezaLean) * (CABEZA + 0.07), cy = sy + Math.cos(cabezaLean) * (CABEZA + 0.07);

  // Pies: una zancada que avanza con la distancia recorrida.
  const fase = ((f.zancada || 0) / 0.95) * Math.PI * 2;
  const pies = [0, 1].map((i) => {
    const u = fase + i * Math.PI;
    let dx, alza = 0;
    if (pose === 'sentado') {
      dx = m * (0.55 + i * 0.12);
    } else if (pose === 'empuja') {
      dx = m * (-0.2 - 0.2 * (f.inclinacion || 0) + 0.28 * Math.sin(u));
      alza = 0.1 * Math.max(0, Math.cos(u)) * (f.mov || 0);
    } else if (pose === 'camina') {
      dx = m * 0.26 * Math.sin(u);
      alza = 0.1 * Math.max(0, Math.cos(u)) * (f.mov || 0);
    } else {
      dx = m * (i ? -0.12 : 0.1);
    }
    const px = hx + dx;
    return [px, g(px) + 0.05 + alza];
  });
  const piernas = pies.map(([px, py]) =>
    pose === 'sentado'
      ? [hx + m * 0.4, hy + 0.32, px, py]
      : ik(hx, hy, px, py, MUSLO, PIERNA, m)); // rodilla hacia delante

  // Brazos: a la roca si hay manos; si no, colgando o balanceándose.
  const brazos = [0, 1].map((i) => {
    let tx, ty;
    if (f.manos) {
      tx = f.manos.x + (i ? -0.03 : 0.02) * m; ty = f.manos.y + (i ? -0.12 : 0.06) + golpe * 0.04;
      tx += m * golpe * 0.08;
    } else if (pose === 'sentado') {
      tx = piernas[i][0] + m * 0.05; ty = piernas[i][1] + 0.02;
    } else if (pose === 'agotado') {
      tx = sx + m * 0.28; ty = sy - 0.5;
    } else {
      const sw = pose === 'camina' ? Math.sin(fase + i * Math.PI) * 0.45 * (f.mov || 0) : 0;
      tx = sx + m * Math.sin(sw) * 0.58; ty = sy - Math.cos(sw) * 0.58;
    }
    return ik(sx, sy, tx, ty, BRAZO, ANTEBRAZO, -m); // codo hacia abajo y atrás
  });
  return { m, pose, lean, hx, hy, sx, sy, cx, cy, piernas, brazos, golpe };
}

/* Derribado: de espaldas sobre la cuesta, la cabeza hacia abajo, una rodilla
 * doblada y un brazo echado atrás. */
function tendido(perfil, f, m) {
  const hx = f.x, hy = perfil(f.x) + 0.17;
  const t = tangente(perfil, hx), n = Math.hypot(1, t);
  const dx = -m / n, dy = (-m * t) / n;               // a lo largo del suelo, cuesta abajo
  const sx = hx + dx * TORSO, sy = hy + dy * TORSO + 0.04;
  const cx = sx + dx * (CABEZA + 0.08), cy = sy + dy * (CABEZA + 0.08) + 0.03;
  const pie = (k) => { const px = hx - dx * k; return [px, perfil(px) + 0.06]; };
  const [p0x, p0y] = pie(0.62), [p1x, p1y] = pie(0.88);
  const piernas = [ik(hx, hy, p0x, p0y, MUSLO, PIERNA, -m), ik(hx, hy, p1x, p1y, MUSLO, PIERNA, m)];
  const brazos = [
    ik(sx, sy, sx + dx * 0.35, sy + 0.42, BRAZO, ANTEBRAZO, m),
    ik(sx, sy, sx - dx * 0.45, perfil(sx - dx * 0.45) + 0.06, BRAZO, ANTEBRAZO, -m),
  ];
  return { m, pose: 'tendido', lean: 0, hx, hy, sx, sy, cx, cy, piernas, brazos, golpe: 0 };
}

/**
 * Dibuja la figura. opciones: contorno (color de un borde exterior, para
 * distinguir la propia o separar filas), relleno (por defecto barniz), etiqueta.
 */
export function figura(L, perfil, f, { contorno = null, relleno = null, grosorContorno = 0.05 } = {}) {
  const { ctx } = L;
  const e = esqueleto(perfil, f);
  L.mundo();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const tinta = relleno || C.barniz;

  const miembro = (ax, ay, j, ancho, borde) => {
    const [jx, jy, bx, by] = j;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(jx, jy); ctx.lineTo(bx, by);
    if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = ancho + 0.028; ctx.stroke(); }
    ctx.strokeStyle = tinta; ctx.lineWidth = ancho; ctx.stroke();
  };
  const cuerpo = (trazo, extra) => {
    ctx.lineWidth = extra;
    ctx.strokeStyle = trazo;
    // torso como trapecio: hombros anchos, cintura estrecha
    const dx = e.sx - e.hx, dy = e.sy - e.hy, d = Math.hypot(dx, dy);
    const nx = -dy / d, ny = dx / d;
    ctx.beginPath();
    ctx.moveTo(e.hx + nx * 0.12, e.hy + ny * 0.12);
    ctx.lineTo(e.sx + nx * 0.19, e.sy + ny * 0.19);
    ctx.lineTo(e.sx - nx * 0.15, e.sy - ny * 0.15);
    ctx.lineTo(e.hx - nx * 0.13, e.hy - ny * 0.13);
    ctx.closePath();
    if (extra) ctx.stroke();
    else { ctx.fillStyle = trazo; ctx.fill(); }
    ctx.beginPath(); ctx.arc(e.cx, e.cy, CABEZA + (extra ? extra / 2 : 0), 0, Math.PI * 2);
    if (extra) ctx.stroke(); else ctx.fill();
  };

  // Contorno exterior (figura propia, fila trasera).
  if (contorno) {
    ctx.strokeStyle = contorno;
    const trazo = (ax, ay, j, ancho) => {
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(j[0], j[1]); ctx.lineTo(j[2], j[3]);
      ctx.lineWidth = ancho + grosorContorno * 2; ctx.stroke();
    };
    for (const p of e.piernas) trazo(e.hx, e.hy, p, 0.15);
    for (const b of e.brazos) trazo(e.sx, e.sy, b, 0.12);
    cuerpo(contorno, grosorContorno * 2);
  }

  // Miembros lejanos, cuerpo, y miembros cercanos separados por una incisión.
  miembro(e.hx, e.hy, e.piernas[1], 0.15, null);
  miembro(e.sx, e.sy, e.brazos[1], 0.12, null);
  cuerpo(tinta, 0);
  miembro(e.hx, e.hy, e.piernas[0], 0.15, C.hueso);
  miembro(e.sx, e.sy, e.brazos[0], 0.12, C.hueso);
  // la pierna cercana tapa su propia incisión en la cadera
  ctx.beginPath(); ctx.arc(e.hx, e.hy, 0.085, 0, Math.PI * 2); ctx.fillStyle = tinta; ctx.fill();

  // Barba y detalles incisos: ojo, cinta del pelo, línea del pecho y, con esfuerzo, tensión.
  const m = e.m;
  const ang = Math.atan2(e.cy - e.sy, e.cx - e.sx);
  ctx.beginPath();
  const bx = e.cx + Math.cos(ang - m * 1.9) * CABEZA * 0.9, by = e.cy + Math.sin(ang - m * 1.9) * CABEZA * 0.9;
  ctx.moveTo(e.cx + Math.cos(ang - m * 1.2) * CABEZA, e.cy + Math.sin(ang - m * 1.2) * CABEZA);
  ctx.lineTo(bx + Math.cos(ang - m * 1.6) * 0.1, by + Math.sin(ang - m * 1.6) * 0.1);
  ctx.lineTo(e.cx + Math.cos(ang - m * 2.6) * CABEZA * 0.7, e.cy + Math.sin(ang - m * 2.6) * CABEZA * 0.7);
  ctx.fillStyle = tinta; ctx.fill();

  ctx.strokeStyle = C.hueso;
  ctx.lineWidth = 0.018;
  ctx.beginPath(); ctx.arc(e.cx, e.cy, CABEZA * 0.72, ang + m * 0.2 - 1.2, ang + m * 0.2 + 1.2); ctx.stroke();
  ctx.beginPath();
  ctx.arc(e.cx + Math.cos(ang - m * 0.75) * CABEZA * 0.55, e.cy + Math.sin(ang - m * 0.75) * CABEZA * 0.55, 0.018, 0, Math.PI * 2);
  ctx.fillStyle = C.hueso; ctx.fill();
  const t = 0.35;
  ctx.beginPath();
  ctx.moveTo(e.hx + (e.sx - e.hx) * 0.9 + m * 0.05, e.hy + (e.sy - e.hy) * 0.9);
  ctx.quadraticCurveTo(e.hx + (e.sx - e.hx) * 0.55 + m * 0.12, e.hy + (e.sy - e.hy) * 0.55, e.hx + (e.sx - e.hx) * t + m * 0.07, e.hy + (e.sy - e.hy) * t);
  ctx.stroke();
  const tension = f.pose === 'empuja' ? Math.min(1, (f.inclinacion || 0) + e.golpe) : 0;
  if (tension > 0.35) {
    ctx.globalAlpha = Math.min(1, (tension - 0.35) * 2.5);
    for (const p of [e.piernas[0]]) {
      const mx = (p[0] + p[2]) / 2, my = (p[1] + p[3]) / 2;
      ctx.beginPath(); ctx.moveTo(p[0] - m * 0.02, p[1] - 0.04); ctx.quadraticCurveTo(mx - m * 0.05, my, p[2] - m * 0.03, p[3] + 0.12); ctx.stroke();
    }
    const b = e.brazos[0];
    ctx.beginPath(); ctx.moveTo(e.sx, e.sy - 0.03); ctx.lineTo(b[0], b[1] - 0.02); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Pies que resbalan: rayas cortas en el suelo, detrás.
  if ((f.resbala || 0) > 0.08) {
    ctx.strokeStyle = C.barniz;
    ctx.lineWidth = 0.03;
    for (const [px] of e.piernas.map((p) => [p[2]])) {
      for (let k = 1; k <= 3; k++) {
        const x0 = px + m * (0.12 + k * 0.14 * f.resbala), y0 = perfil(x0) + 0.03;
        ctx.globalAlpha = f.resbala * (1 - k / 4);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + m * 0.12 * f.resbala, perfil(x0 + m * 0.12) + 0.03); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  return e;
}

/** Punto de la superficie de la roca más cercano a (px, py): donde se apoyan las manos. */
export function apoyo(c, r, px, py) {
  const dx = px - c.x, dy = py - c.y, d = Math.hypot(dx, dy) || 1;
  return { x: c.x + (dx / d) * r * 0.97, y: c.y + (dy / d) * r * 0.97 };
}

/** Altura de los hombros de una figura que empuja, para orientar las manos. */
export const alturaHombros = (perfil, x) => perfil(x) + 1.35;

/** Texto pequeño en el mundo (etiquetas «tú», nombres). */
export function rotulo(L, x, y, texto, { color = C.barniz, tam = 17, fondo = null } = {}) {
  const [sx, sy] = L.aPantalla(x, y);
  const { ctx } = L;
  L.pantalla();
  ctx.font = `italic 500 ${tam}px Cormorant, Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  if (fondo) {
    const w = ctx.measureText(texto).width + 8;
    ctx.fillStyle = fondo; ctx.fillRect(sx - w / 2, sy - tam - 2, w, tam + 4);
  }
  ctx.fillStyle = color;
  ctx.fillText(texto, sx, sy);
}
