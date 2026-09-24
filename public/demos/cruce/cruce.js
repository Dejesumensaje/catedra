// El cruce — cinco puntos de vista.
// Una sola simulación corre siempre; la cámara solo cambia de lugar.
// Ninguna vista reinicia el tiempo: lo que se ve desde el buzón es lo mismo que pasa arriba.

import * as THREE from 'three';

const body = document.body;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------ azar con semilla
// La ciudad es la misma cada vez que se abre la demo.
let semilla = 20260924;
function rnd() {
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const R = (a, b) => a + rnd() * (b - a);
const pick = (a) => a[(rnd() * a.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

// ------------------------------------------------------------------ render
const canvas = document.getElementById('escena');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  body.classList.add('sin-webgl');
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
const HORIZONTE = 0x4c5585;
scene.fog = new THREE.Fog(HORIZONTE, 45, 150);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.04, 500);

// ------------------------------------------------------------------ utilidades de modelado
const cacheMat = new Map();
function M(color, o = {}) {
  const k = color + JSON.stringify(o);
  if (!cacheMat.has(k)) cacheMat.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...o }));
  return cacheMat.get(k);
}
function mesh(geo, material, x = 0, y = 0, z = 0, parent = scene, sombra = true) {
  const m = new THREE.Mesh(geo, typeof material === 'number' ? M(material) : material);
  m.position.set(x, y, z);
  m.castShadow = sombra;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
const box = (w, h, d, mat, x, y, z, parent, sombra) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent, sombra);
function tono(hex, f) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, clamp(hsl.l + f, 0, 1));
  return c.getHex();
}
function halo(color, size) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: true,
  }));
  s.scale.setScalar(size);
  return s;
}

// ------------------------------------------------------------------ cielo y luz
{
  const geo = new THREE.SphereGeometry(320, 32, 16);
  const col = [];
  const arriba = new THREE.Color(0x141c38), medio = new THREE.Color(0x2f3d6c), abajo = new THREE.Color(HORIZONTE), rosa = new THREE.Color(0x8a6a8e);
  const p = geo.attributes.position, c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 320;
    const x = p.getX(i) / 320, z = p.getZ(i) / 320;
    if (y > 0.25) c.copy(medio).lerp(arriba, (y - 0.25) / 0.75);
    else if (y > 0) c.copy(abajo).lerp(medio, y / 0.25);
    else c.copy(abajo);
    // un resto de atardecer hacia el oeste-noroeste
    const oeste = clamp((-x - z * 0.4) * 0.8, 0, 1) * clamp(1 - Math.abs(y) * 3.5, 0, 1);
    c.lerp(rosa, oeste * 0.6);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false })));
}
scene.add(new THREE.HemisphereLight(0x9fb3ea, 0x5a4d66, 1.4));
const luna = new THREE.DirectionalLight(0xbac6ff, 1.25);
luna.position.set(-28, 48, 22);
luna.castShadow = true;
luna.shadow.mapSize.set(2048, 2048);
Object.assign(luna.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 5, far: 140 });
luna.shadow.bias = -0.0004;
luna.shadow.normalBias = 0.03;
scene.add(luna);

// ------------------------------------------------------------------ suelo
// Calles: la EO ocupa |z| < 6, la NS ocupa |x| < 6. Las aceras empiezan en 6 y los edificios en 10.5.
const ACERA = 0.15;
const suelo = (x, z) => (Math.abs(x) > 6 && Math.abs(z) > 6 ? ACERA : 0);
{
  const asfalto = mesh(new THREE.PlaneGeometry(500, 500), M(0x2a2f3e, { roughness: 0.38, metalness: 0.08 }), 0, 0, 0, scene, false);
  asfalto.rotation.x = -Math.PI / 2;
  const w = 90;
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    box(w, ACERA, w, M(0x5c6378, { roughness: 0.55 }), sx * (6 + w / 2), ACERA / 2, sz * (6 + w / 2), scene, false);
    // bordillo claro
    box(w, 0.02, 0.22, M(0x8a90a3), sx * (6 + w / 2), ACERA + 0.005, sz * 6.11, scene, false);
    box(0.22, 0.02, w, M(0x8a90a3), sx * 6.11, ACERA + 0.005, sz * (6 + w / 2), scene, false);
  }
}

// marcas viales: una sola malla instanciada
{
  const marcas = [];
  const add = (x, z, w, l, ry = 0, color = 0xdfe2ea) => marcas.push({ x, z, w, l, ry, color });
  for (const s of [-1, 1]) {
    for (let i = -5.5; i <= 5.5; i++) add(i, s * 8.5, 0.5, 3); // cebras norte y sur
    for (let i = -5.5; i <= 5.5; i++) add(s * 8.5, i, 3, 0.5); // cebras este y oeste
  }
  for (let t = -7.5; t <= 7.5; t++) {
    const d = t / Math.SQRT2;
    add(d, d, 0.5, 3, -Math.PI / 4); // diagonales: la X del cruce
    add(d, -d, 0.5, 3, Math.PI / 4);
  }
  add(-3, -10.6, 6, 0.4); add(3, 10.6, 6, 0.4); add(-10.6, 3, 0.4, 6); add(10.6, -3, 0.4, 6); // líneas de pare
  for (const s of [-1, 1]) {
    for (let d = 11.5; d < 90; d += 4.5) {
      for (const lado of [-1, 1]) {
        add(lado * 3, s * d, 0.14, 2.2); add(s * d, lado * 3, 2.2, 0.14);
      }
    }
    add(0.16, s * 50, 0.1, 78, 0, 0xe0b23a); add(-0.16, s * 50, 0.1, 78, 0, 0xe0b23a);
    add(s * 50, 0.16, 78, 0.1, 0, 0xe0b23a); add(s * 50, -0.16, 78, 0.1, 0, 0xe0b23a);
  }
  const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }), marcas.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  marcas.forEach((m, i) => {
    o.position.set(m.x, 0.012, m.z); o.rotation.set(0, m.ry, 0); o.scale.set(m.w, 1, m.l); o.updateMatrix();
    im.setMatrixAt(i, o.matrix); im.setColorAt(i, c.setHex(m.color));
  });
  im.receiveShadow = true;
  scene.add(im);
}

// ------------------------------------------------------------------ edificios
const ventanas = [];
const EVITAR_VENTANAS = []; // zonas donde un objeto propio reemplaza la ventana genérica
const LUCES = [0xffd58a, 0xffc56b, 0xffe7b0, 0xf7b267, 0xffd9a0, 0xcfe3ff];
function edificio(x0, x1, z0, z1, h, color, o = {}) {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  box(w, h, d, M(color), cx, h / 2, cz);
  box(w + 0.3, 0.4, d + 0.3, M(tono(color, -0.08)), cx, h + 0.2, cz);
  const caras = [
    { nx: 0, nz: 1, len: w, px: cx, pz: z1, ry: 0 },
    { nx: 0, nz: -1, len: w, px: cx, pz: z0, ry: Math.PI },
    { nx: 1, nz: 0, len: d, px: x1, pz: cz, ry: Math.PI / 2 },
    { nx: -1, nz: 0, len: d, px: x0, pz: cz, ry: -Math.PI / 2 },
  ];
  const paso = o.paso ?? 2.3;
  caras.forEach((f, fi) => {
    const cols = Math.floor((f.len - 1.4) / paso);
    const inicio = -((cols - 1) * paso) / 2;
    for (let y = o.piso ?? 4.6; y + 1.6 < h; y += 3.1) {
      for (let k = 0; k < cols; k++) {
        const t = inicio + k * paso;
        const x = f.px + f.nx * 0.04 + (f.nz !== 0 ? t : 0);
        const z = f.pz + f.nz * 0.04 + (f.nx !== 0 ? t : 0);
        if (EVITAR_VENTANAS.some((e) => Math.hypot(e.x - x, e.z - z) < e.r && Math.abs(e.y - y) < e.r)) continue;
        ventanas.push({ x, y, z, ry: f.ry, lit: rnd() < 0.45, c: pick(LUCES) });
      }
    }
    if (o.locales?.includes(fi)) {
      const len = f.len - 1.2;
      const lx = f.px + f.nx * 0.05, lz = f.pz + f.nz * 0.05;
      const vit = new THREE.Mesh(new THREE.PlaneGeometry(len, 2.3), new THREE.MeshBasicMaterial({ color: pick([0xffd9a0, 0xffe7c2, 0xd9ecff, 0xffc7a0]) }));
      vit.position.set(lx, ACERA + 1.4, lz);
      vit.rotation.y = f.ry;
      scene.add(vit);
      const toldo = box(f.nz !== 0 ? len : 1.3, 0.08, f.nz !== 0 ? 1.3 : len, M(pick([0xb4533a, 0x2f6f8f, 0x3f7f5f, 0x8a6a2f, 0x6b3f69])),
        lx + f.nx * 0.6, ACERA + 2.9, lz + f.nz * 0.6);
      if (f.nz !== 0) toldo.rotation.x = f.nz * 0.28; else toldo.rotation.z = -f.nx * 0.28;
    }
  });
  // azotea
  const n = 1 + ((rnd() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const rx = R(x0 + 1.5, x1 - 1.5), rz = R(z0 + 1.5, z1 - 1.5);
    if (rnd() < 0.45) {
      mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 8), 0x6a5a58, rx, h + 1.6, rz);
      mesh(new THREE.ConeGeometry(1, 0.5, 8), 0x55474a, rx, h + 2.65, rz);
      for (const [a, b] of [[-0.6, -0.6], [0.6, 0.6], [-0.6, 0.6], [0.6, -0.6]]) box(0.1, 0.8, 0.1, 0x2b2f38, rx + a, h + 0.4, rz + b);
    } else box(R(1, 2), R(0.6, 1), R(1, 2), 0x8b93a6, rx, h + 0.4, rz);
  }
}

// El gato vive en esta ventana (lado sur de la torre NE, cuarto piso).
const VENTANA = { x: 15.2, y: 13.9, z: -10.5 };
// Alguien mira desde esta otra (lado norte del edificio bajo SO). Desde arriba no se ve.
const TESTIGO = { x: -15.1, y: 4.6, z: 10.5 };
EVITAR_VENTANAS.push({ ...VENTANA, r: 1.6 }, { ...TESTIGO, r: 1.6 });

// cuadrante NO
edificio(-26, -10.5, -24, -10.5, 30, 0x3d4a6b, { locales: [0, 2] });
edificio(-44, -26, -22, -10.5, 18, 0x544a66, { locales: [0] });
edificio(-26, -10.5, -46, -24.5, 22, 0x4a5876);
edificio(-62, -44, -24, -10.5, 13, 0x5a6278, { locales: [0] });
// cuadrante NE
edificio(10.5, 22, -24, -10.5, 24, 0x6b4f52, { locales: [0, 3] });
edificio(22, 38, -20, -10.5, 14, 0x4f5b73, { locales: [0] });
edificio(10.5, 26, -44, -24.5, 34, 0x3b4766);
edificio(38, 58, -22, -10.5, 19, 0x5e5470, { locales: [0] });
// cuadrante SO: bajos, con azoteas que se ven desde arriba
edificio(-24, -10.5, 10.5, 22, 8, 0x7b6a5b, { locales: [1, 2], piso: 4.6 });
edificio(-38, -24, 10.5, 21, 11, 0x5c6a7a, { locales: [1] });
edificio(-24, -10.5, 22.5, 36, 12, 0x6a5a6e, { locales: [2] });
edificio(-58, -38, 10.5, 22, 9, 0x6f6456, { locales: [1] });
// fondo
edificio(-30, -8, -80, -58, 46, 0x2f3a5a);
edificio(8, 30, -82, -60, 52, 0x33405f);
edificio(-90, -70, -40, -12, 28, 0x3a4462);
edificio(70, 92, -40, -14, 30, 0x3a4462);
edificio(-92, -72, 12, 40, 16, 0x4a4f66);

{
  const geo = new THREE.PlaneGeometry(1.15, 1.45);
  const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }), ventanas.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  ventanas.forEach((v, i) => {
    o.position.set(v.x, v.y, v.z); o.rotation.set(0, v.ry, 0); o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    im.setColorAt(i, c.setHex(v.lit ? v.c : 0x1b2239));
  });
  scene.add(im);
  var mallaVentanas = im;
}

// pantalla gigante: un pez que cruza, como todos
const pantalla = (() => {
  const c = document.createElement('canvas');
  c.width = 320; c.height = 180;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.6), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  m.position.set(-17.2, 17, -10.42);
  scene.add(m);
  box(10.6, 6.2, 0.3, 0x1b1e27, -17.2, 17, -10.6);
  const luz = new THREE.PointLight(0x7fb8ff, 25, 26, 2);
  luz.position.set(-17.2, 15, -7.5);
  scene.add(luz);
  const g = c.getContext('2d');
  return (t) => {
    g.fillStyle = '#0f2c52';
    g.fillRect(0, 0, 320, 180);
    g.fillStyle = '#153a66';
    for (let i = 0; i < 6; i++) g.fillRect(0, 120 + i * 10 + Math.sin(t + i) * 3, 320, 4);
    const x = ((t * 34) % 420) - 60, y = 80 + Math.sin(t * 1.7) * 18;
    g.fillStyle = '#ff9f43';
    g.beginPath(); g.ellipse(x, y, 34, 18, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x - 28, y); g.lineTo(x - 58, y - 20 + Math.sin(t * 8) * 6); g.lineTo(x - 58, y + 20 + Math.sin(t * 8) * 6); g.fill();
    g.fillStyle = '#0f2c52';
    g.beginPath(); g.arc(x + 18, y - 5, 4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(200,230,255,.6)'; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const by = 150 - ((t * 40 + i * 45) % 150);
      g.beginPath(); g.arc(x + 44 + i * 6, by, 3 + i, 0, Math.PI * 2); g.stroke();
    }
    tex.needsUpdate = true;
  };
})();

// ropa tendida en la azotea baja
const ropa = [];
{
  const h = 8.4;
  box(0.06, 1.6, 0.06, 0x2b2f38, -21.5, h + 0.8, 14);
  box(0.06, 1.6, 0.06, 0x2b2f38, -13.5, h + 0.8, 14);
  box(8, 0.02, 0.02, 0xdddddd, -17.5, h + 1.55, 14, scene, false);
  const colores = [0xf2c230, 0xffffff, 0xc8413a, 0x7fb3d5, 0xffffff, 0x3aa6a0, 0xe7a1b0];
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Group();
    p.position.set(-21 + i * 1.1, h + 1.55, 14);
    box(0.7, 0.8, 0.02, colores[i], 0, -0.42, 0, p);
    scene.add(p);
    ropa.push(p);
  }
  // macetas en la azotea
  for (let i = 0; i < 5; i++) {
    box(0.6, 0.4, 0.6, 0x9a5b3f, -22 + i * 1.3, h + 0.2, 20.5);
    mesh(new THREE.IcosahedronGeometry(0.45, 0), pick([0x3b6e4f, 0x4f8a5b, 0x2f5d45]), -22 + i * 1.3, h + 0.75, 20.5);
  }
}

// ------------------------------------------------------------------ parque (cuadrante SE)
const copas = [];
{
  const G = 0.19;
  box(90, 0.04, 90, M(0x3c6a4c, { roughness: 0.95 }), 10.5 + 45, G - 0.02, 10.5 + 45, scene, false);
  const camino = box(3, 0.02, 80, M(0x8c8171, { roughness: 0.9 }), 0, G + 0.01, 0, scene, false);
  camino.position.set(10.5 + 28, G + 0.01, 10.5 + 28);
  camino.rotation.y = Math.PI / 4;
  // reja baja con entrada en la esquina
  const postes = [];
  for (let t = 13.4; t < 90; t += 1.4) postes.push([10.7, t], [t, 10.7]);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.9, 0.07), M(0x2b2f38), postes.length);
  const o = new THREE.Object3D();
  postes.forEach(([x, z], i) => { o.position.set(x, G + 0.45, z); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.castShadow = true;
  scene.add(im);
  for (const y of [0.45, 0.85]) {
    box(0.05, 0.05, 78, 0x2b2f38, 10.7, G + y, 13.4 + 39, scene, false);
    box(78, 0.05, 0.05, 0x2b2f38, 13.4 + 39, G + y, 10.7, scene, false);
  }
  const verdes = [0x2f5d45, 0x3b6e4f, 0x2a4f3f, 0x44795a];
  const arbol = (x, z, s = 1, y0 = G) => {
    mesh(new THREE.CylinderGeometry(0.12 * s, 0.2 * s, 2 * s, 5), 0x4a3a30, x, y0 + s, z);
    const copa = new THREE.Group();
    copa.position.set(x, y0 + 2.2 * s, z);
    mesh(new THREE.IcosahedronGeometry(1.35 * s, 0), pick(verdes), 0, 0.6 * s, 0, copa);
    mesh(new THREE.IcosahedronGeometry(0.95 * s, 0), pick(verdes), 0.7 * s, 1.35 * s, 0.3 * s, copa);
    mesh(new THREE.IcosahedronGeometry(0.8 * s, 0), pick(verdes), -0.6 * s, 1.1 * s, -0.4 * s, copa);
    scene.add(copa);
    copas.push({ g: copa, f: R(0, 6) });
  };
  for (const [x, z, s] of [[20, 13.5, 1.2], [26, 17, 1.4], [19.5, 24, 1.1], [30, 26, 1.5], [22, 32, 1.3], [34, 15, 1.2],
    [13, 36, 1.2], [36, 36, 1.6], [44, 22, 1.3], [26, 44, 1.4], [16.5, 18.5, 0.9], [40, 48, 1.5], [48, 34, 1.4]]) arbol(x, z, s);
  // árboles de calle
  for (const [x, z] of [[-9.3, -18], [-9.3, -30], [9.3, -32], [-18, -9.3], [-32, -9.3], [22, -9.3], [-30, 9.3], [-9.3, 26]]) arbol(x, z, 0.8, ACERA);
  // arbustos junto a la reja
  for (let t = 21; t < 60; t += R(2.5, 4)) {
    mesh(new THREE.IcosahedronGeometry(R(0.4, 0.7), 0), pick(verdes), 11.6, G + 0.3, t);
    mesh(new THREE.IcosahedronGeometry(R(0.4, 0.7), 0), pick(verdes), t, G + 0.3, 11.6);
  }
}

// ------------------------------------------------------------------ faroles
const faroles = [];
function farol(x, z, y0 = ACERA, rot = 0) {
  mesh(new THREE.CylinderGeometry(0.07, 0.1, 5, 6), 0x2b2f38, x, y0 + 2.5, z);
  const brazo = box(1, 0.08, 0.08, 0x2b2f38, x + Math.cos(rot) * 0.5, y0 + 5, z - Math.sin(rot) * 0.5);
  brazo.rotation.y = rot;
  const hx = x + Math.cos(rot) * 1, hz = z - Math.sin(rot) * 1;
  box(0.4, 0.14, 0.26, 0x2b2f38, hx, y0 + 4.95, hz);
  box(0.3, 0.04, 0.18, new THREE.MeshBasicMaterial({ color: 0xffe1a8 }), hx, y0 + 4.87, hz, scene, false);
  const l = new THREE.PointLight(0xffc877, 38, 16, 2);
  l.position.set(hx, y0 + 4.6, hz);
  scene.add(l);
  const s = halo(0xffc070, 2.6);
  s.position.set(hx, y0 + 4.8, hz);
  scene.add(s);
  faroles.push(l);
}
farol(-6.5, -11.5, ACERA, 0);
farol(6.5, -11.5, ACERA, Math.PI);
farol(6.5, 12.5, ACERA, Math.PI);
farol(-17, 6.5, ACERA, -Math.PI / 2);
farol(12.3, 15.6, 0.19, Math.PI * 0.75);

// ------------------------------------------------------------------ geometrías de persona
const GP = {
  torso: new THREE.CylinderGeometry(0.19, 0.25, 0.68, 6),
  cabeza: new THREE.IcosahedronGeometry(0.13, 0),
  pelo: new THREE.IcosahedronGeometry(0.145, 0).scale(1, 0.72, 1),
  pierna: new THREE.BoxGeometry(0.11, 0.76, 0.13).translate(0, -0.38, 0),
  brazo: new THREE.BoxGeometry(0.08, 0.56, 0.09).translate(0, -0.28, 0),
  sombrilla: new THREE.ConeGeometry(0.6, 0.27, 8, 1, true),
  baston: new THREE.CylinderGeometry(0.012, 0.012, 0.95, 4),
};
const PIEL = [0xf1c9a5, 0xe0ac7e, 0xc68642, 0x8d5524, 0xffdbac, 0xa86b4a, 0xd9a07a];
const PELO = [0x1b1714, 0x2e2320, 0x4a3426, 0x6b6b6b, 0x2a1d1a, 0x8a5a3b, 0xbdbdbd];
const ABRIGO = [0x2e3448, 0x3d3a4b, 0x4b5563, 0x5a4a42, 0x6b7280, 0x1f2937, 0x7c6f64, 0x44403c, 0x3f4a5c, 0x55504a];
const ABRIGO_VIVO = [0xb4533a, 0x2f6f8f, 0x8a6a2f, 0x6b3f69, 0x3f7f5f];
const PANTALON = [0x1f2230, 0x2b2f3f, 0x3b3f52, 0x514a44, 0x262a36];
const SOMBRILLA = [0x1b1e27, 0x22283a, 0x2a2f3a, 0x1b1e27, 0xcfd8e3, 0x3a3f4f];
const SOMBRILLA_VIVA = [0xc8413a, 0x2f6fd6, 0xe0b23a, 0x3aa6a0, 0xe7a1b0];

// Persona suelta (para los personajes que tienen historia propia).
function persona({ abrigo, piel, pelo, pantalon, sombrilla = null, escala = 1, sombra = true }) {
  const g = new THREE.Group();
  const cuerpo = new THREE.Group();
  g.add(cuerpo);
  const p = {};
  p.torso = mesh(GP.torso, abrigo, 0, 1.07, 0, cuerpo, sombra);
  p.cabeza = new THREE.Group();
  p.cabeza.position.set(0, 1.56, 0);
  cuerpo.add(p.cabeza);
  mesh(GP.cabeza, piel, 0, 0, 0, p.cabeza, sombra);
  mesh(GP.pelo, pelo, 0, 0.05, -0.02, p.cabeza, sombra);
  const pierna = (x) => { const q = new THREE.Group(); q.position.set(x, 0.76, 0); mesh(GP.pierna, pantalon, 0, 0, 0, q, sombra); g.add(q); return q; };
  const brazo = (x) => { const q = new THREE.Group(); q.position.set(x, 1.36, 0); mesh(GP.brazo, abrigo, 0, 0, 0, q, sombra); cuerpo.add(q); return q; };
  p.piernaI = pierna(-0.09); p.piernaD = pierna(0.09);
  p.brazoI = brazo(-0.24); p.brazoD = brazo(0.24);
  if (sombrilla !== null) {
    p.sombrilla = new THREE.Group();
    p.sombrilla.position.set(0.2, 0, 0.3);
    mesh(GP.baston, 0x222222, 0, 1.45, 0, p.sombrilla, sombra);
    const c = mesh(GP.sombrilla, M(sombrilla, { side: THREE.DoubleSide, roughness: 0.5 }), 0, 2.02, 0, p.sombrilla, sombra);
    c.rotation.x = -0.1;
    cuerpo.add(p.sombrilla);
    p.brazoD.rotation.x = -0.75;
  }
  p.cuerpo = cuerpo;
  g.scale.setScalar(escala);
  g.userData = p;
  return g;
}
function caminar(g, fase, cant) {
  const p = g.userData, s = Math.sin(fase) * cant;
  p.piernaI.rotation.x = s * 0.55;
  p.piernaD.rotation.x = -s * 0.55;
  p.brazoI.rotation.x = -s * 0.45;
  if (!p.sombrilla) p.brazoD.rotation.x = s * 0.45;
  p.cuerpo.position.y = Math.abs(Math.cos(fase)) * 0.035 * cant;
}

// ------------------------------------------------------------------ semáforos
// Fases: autos EO, amarillo, autos NS, amarillo, todos los peatones a la vez (incluida la X), parpadeo, despeje.
const FASES = [
  { n: 'eo', d: 10 }, { n: 'eo-a', d: 2.5 }, { n: 'rojo', d: 2 }, { n: 'ns', d: 10 }, { n: 'ns-a', d: 2.5 }, { n: 'rojo', d: 3 },
  { n: 'pasen', d: 21 }, { n: 'parpadeo', d: 4 }, { n: 'despeje', d: 2 },
];
const sem = { i: 0, t: 0 };
const fase = () => FASES[sem.i].n;
const peatonesPasan = () => fase() === 'pasen';

const matPeaton = {
  siga: new THREE.MeshStandardMaterial({ color: 0x0c1a12, emissive: 0x5cff9a, emissiveIntensity: 0 }),
  pare: new THREE.MeshStandardMaterial({ color: 0x1a0c0c, emissive: 0xff4a3d, emissiveIntensity: 2 }),
};
function semaforoPeatonal(x, z, ry, y = ACERA + 2.55, parent = scene) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(0.28, 0.56, 0.18, 0x2f3a48, 0, 0, 0, g);
  box(0.2, 0.2, 0.02, matPeaton.pare, 0, 0.12, 0.1, g, false);
  box(0.2, 0.2, 0.02, matPeaton.siga, 0, -0.13, 0.1, g, false);
  parent.add(g);
}
for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1]]) {
  mesh(new THREE.CylinderGeometry(0.06, 0.07, 3, 6), 0x3a4453, sx * 6.7, ACERA + 1.5, sz * 6.7);
  semaforoPeatonal(sx * 6.7, sz * 6.7 - sz * 0.12, sz > 0 ? Math.PI : 0);
  semaforoPeatonal(sx * 6.7 - sx * 0.12, sz * 6.7, sx > 0 ? -Math.PI / 2 : Math.PI / 2);
}

// ------------------------------------------------------------------ tocables
// Cada uno: grupo, volumen de toque (invisible, más grande que el objeto), guiño y vista.
const tocables = [];
function tocable(nombre, grupo, volumen, guino) {
  const mats = new Set();
  grupo.traverse((o) => { if (o.isMesh && !o.userData.sinBrillo) mats.add(o.material); });
  volumen.material = new THREE.MeshBasicMaterial({ visible: false });
  volumen.userData.tocable = nombre;
  scene.add(volumen);
  const t = { nombre, grupo, volumen, guino, mats: [...mats], g: -1, brillo: 0 };
  tocables.push(t);
  return t;
}
const matPropio = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...o });

// 1. semáforo (esquina SO, mira al norte: ve llegar a los autos y ve la cebra oeste desde arriba)
const semaforo = (() => {
  const g = new THREE.Group();
  g.position.set(-6.7, ACERA, 6.7);
  scene.add(g);
  const metal = matPropio(0x3a4453);
  mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.9, 6), metal, 0, 2.45, 0, g);
  const cabeza = new THREE.Group();
  cabeza.position.set(0, 4.55, 0);
  g.add(cabeza);
  box(0.46, 1.32, 0.34, metal, 0, 0, 0, cabeza);
  const lamparas = {};
  for (const [k, y, c] of [['rojo', 0.42, 0xff3b30], ['amarillo', 0, 0xffb020], ['verde', -0.42, 0x3dff8a]]) {
    const m = new THREE.MeshStandardMaterial({ color: 0x151515, emissive: c, emissiveIntensity: 0.1 });
    const l = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 12).rotateX(Math.PI / 2), m, 0, y, -0.18, cabeza, false);
    l.userData.sinBrillo = true;
    box(0.32, 0.03, 0.2, metal, 0, y + 0.16, -0.27, cabeza);
    lamparas[k] = m;
  }
  semaforoPeatonal(0.12, 2.55, Math.PI / 2, 2.55, g);
  semaforoPeatonal(0, 2.55, Math.PI, 2.55, g);
  g.children.forEach((c) => c.children?.forEach((h) => { if (h.material === matPeaton.siga || h.material === matPeaton.pare) h.userData.sinBrillo = true; }));
  const vol = new THREE.Mesh(new THREE.BoxGeometry(1.3, 5.6, 1.3));
  vol.position.set(-6.7, ACERA + 2.8, 6.7);
  const t = tocable('semaforo', g, vol, (u) => {
    const s = Math.sin(u * Math.PI);
    cabeza.scale.set(1 - s * 0.06, 1 + s * 0.1, 1 - s * 0.06);
    cabeza.rotation.z = Math.sin(u * Math.PI * 2) * 0.12;
    t.parpadeo = u < 1 && Math.sin(u * 30) > 0;
  });
  t.cabeza = cabeza;
  t.lamparas = lamparas;
  return t;
})();

// 2. buzón (acera SO, mira hacia la esquina)
const BUZON = { x: -12.5, z: 6.95 };
const buzon = (() => {
  const g = new THREE.Group();
  g.position.set(BUZON.x, ACERA, BUZON.z);
  g.scale.setScalar(1.25);
  scene.add(g);
  const rojo = matPropio(0xc8413a, { roughness: 0.45 });
  const oscuro = matPropio(0x8f2a25);
  box(0.24, 0.36, 0.24, matPropio(0x2b2f38), 0, 0.18, 0, g);
  const cuerpo = new THREE.Group();
  g.add(cuerpo);
  box(0.52, 0.86, 0.46, rojo, 0, 0.79, 0, cuerpo);
  box(0.58, 0.1, 0.52, oscuro, 0, 1.27, 0, cuerpo);
  mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.52, 8, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), rojo, 0, 1.32, 0, cuerpo);
  box(0.02, 0.05, 0.28, matPropio(0x1a1a1a), 0.265, 1.04, 0, cuerpo, false);
  const tapa = new THREE.Group();
  tapa.position.set(0.27, 1.1, 0);
  box(0.03, 0.08, 0.32, oscuro, 0, -0.04, 0, tapa);
  cuerpo.add(tapa);
  box(0.02, 0.08, 0.2, matPropio(0xf2efe6), 0.265, 0.72, 0, cuerpo, false);
  const carta = box(0.16, 0.012, 0.2, matPropio(0xf5f1e6), 0.33, 1.035, 0.02, cuerpo, false);
  carta.rotation.z = -0.2;
  const vol = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2, 1.4));
  vol.position.set(BUZON.x, ACERA + 0.9, BUZON.z);
  return tocable('buzon', g, vol, (u) => {
    const s = Math.sin(u * Math.PI);
    tapa.rotation.z = s * 1.1;
    cuerpo.position.y = Math.max(0, Math.sin(u * Math.PI * 2)) * 0.12;
    cuerpo.scale.set(1 + s * 0.05, 1 - Math.sin(u * Math.PI * 2) * 0.05, 1 + s * 0.05);
  });
})();

// 3. banca (en el parque, mira hacia el cruce)
const BANCA = { x: 14.2, z: 12.9, ry: -Math.PI * 0.75 };
const banca = (() => {
  const g = new THREE.Group();
  g.position.set(BANCA.x, 0.19, BANCA.z);
  g.rotation.y = BANCA.ry;
  scene.add(g);
  const madera = matPropio(0xa06d42), hierro = matPropio(0x2b2f38);
  const tablas = [];
  for (let i = 0; i < 4; i++) tablas.push(box(1.9, 0.05, 0.1, madera, 0, 0.45, -0.17 + i * 0.12, g));
  for (let i = 0; i < 2; i++) {
    const b = box(1.9, 0.11, 0.04, madera, 0, 0.66 + i * 0.16, -0.27 - i * 0.03, g);
    b.rotation.x = -0.18;
    tablas.push(b);
  }
  for (const x of [-0.82, 0.82]) {
    box(0.06, 0.44, 0.06, hierro, x, 0.22, 0.2, g);
    box(0.06, 0.9, 0.06, hierro, x, 0.45, -0.25, g);
    box(0.06, 0.05, 0.5, hierro, x, 0.66, 0, g);
  }
  const base = tablas.map((t) => t.position.y);
  const vol = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 1.6));
  vol.position.set(BANCA.x, 0.9, BANCA.z);
  vol.rotation.y = BANCA.ry;
  return tocable('banca', g, vol, (u) => {
    tablas.forEach((t, i) => { t.position.y = base[i] + Math.max(0, Math.sin(u * Math.PI * 2 - i * 0.7)) * 0.07 * (u < 1 ? 1 : 0); });
  });
})();

// 4. charco (en la cebra sur: todos lo esquivan)
const CHARCO = { x: 2.2, z: 8.6, r: 1.25 };
const ondas = [];
const charco = (() => {
  const g = new THREE.Group();
  g.position.set(CHARCO.x, 0.014, CHARCO.z);
  scene.add(g);
  const forma = new THREE.Shape();
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 2, r = CHARCO.r * (0.85 + 0.25 * Math.sin(a * 3 + 1) * 0.6 + (i % 2) * 0.06);
    const x = Math.cos(a) * r * 1.35, z = Math.sin(a) * r;
    i === 0 ? forma.moveTo(x, z) : forma.lineTo(x, z);
  }
  const agua = new THREE.Mesh(new THREE.ShapeGeometry(forma).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x5a74a8, emissive: 0x28365e, roughness: 0.04, metalness: 0.2, side: THREE.DoubleSide }));
  agua.receiveShadow = true;
  g.add(agua);
  const vol = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.6, 12));
  vol.position.set(CHARCO.x, 0.3, CHARCO.z);
  const grandes = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xe6efff, transparent: true, opacity: 0, depthWrite: false }));
    m.position.y = 0.01;
    m.userData.sinBrillo = true;
    g.add(m);
    grandes.push(m);
  }
  return tocable('charco', g, vol, (u) => {
    grandes.forEach((m, i) => {
      const k = clamp(u * 1.6 - i * 0.3, 0, 1);
      m.scale.setScalar(0.1 + k * 1.6);
      m.material.opacity = k > 0 && k < 1 ? (1 - k) * 0.9 : 0;
    });
  });
})();
// charcos comunes, con las gotas cayendo
const charcosComunes = [[-3.5, -2.2, 1.1], [4.5, 3.8, 0.8], [-9, -8.4, 0.7], [8.3, -7.8, 0.6], [-2, 13, 0.9], [-20, -3, 1.2], [24, 2.5, 1]];
for (const [x, z, r] of charcosComunes) {
  const m = mesh(new THREE.CircleGeometry(r, 9).rotateX(-Math.PI / 2).scale(1.3, 1, 1),
    M(0x4a6096, { emissive: 0x1f2b4c, roughness: 0.05 }), x, suelo(x, z) + 0.013, z, scene, false);
  m.rotation.y = R(0, 3);
}
for (let i = 0; i < 26; i++) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xdfe8ff, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(m);
  ondas.push({ m, t: R(0, 1), v: R(0.9, 1.4) });
}
const lugaresDeOnda = [[CHARCO.x, CHARCO.z, CHARCO.r], [CHARCO.x, CHARCO.z, CHARCO.r], ...charcosComunes];

// 5. ventana (torre NE, cuarto piso). Un gato en el alféizar.
const ventana = (() => {
  const g = new THREE.Group();
  g.position.set(VENTANA.x, VENTANA.y, VENTANA.z);
  scene.add(g);
  const vidrio = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffc56b, emissiveIntensity: 1.1 });
  const panel = box(1.3, 1.6, 0.02, vidrio, 0, 0, 0.05, g, false);
  panel.userData.sinBrillo = true;
  const marco = matPropio(0xe8dfcf);
  box(1.5, 0.08, 0.1, marco, 0, 0.82, 0.07, g);
  box(0.08, 1.7, 0.1, marco, -0.7, 0, 0.07, g);
  box(0.08, 1.7, 0.1, marco, 0.7, 0, 0.07, g);
  box(1.7, 0.1, 0.82, marco, 0, -0.86, 0.41, g);
  // cortina recogida
  const cortina = box(0.22, 1.5, 0.03, matPropio(0xc8413a), -0.55, 0.02, 0.09, g, false);
  cortina.userData.sinBrillo = true;
  // jardinera
  box(0.5, 0.22, 0.26, matPropio(0x9a5b3f), 0.8, -0.7, 0.22, g);
  for (let i = 0; i < 4; i++) mesh(new THREE.IcosahedronGeometry(0.08, 0), pick([0xe7a1b0, 0xf2c230, 0xffffff, 0xc8413a]), 0.62 + i * 0.12, -0.53, 0.22, g);
  // gato: de espaldas a la ventana, mirando el cruce
  const gato = new THREE.Group();
  gato.position.set(0.12, -0.81, 0.6);
  gato.rotation.y = -0.66;
  gato.scale.setScalar(0.85);
  g.add(gato);
  const pelaje = matPropio(0xd98a3d);
  const cuerpo = mesh(new THREE.IcosahedronGeometry(0.15, 0).scale(1, 1.25, 1), pelaje, 0, 0.17, 0, gato);
  const cabeza = new THREE.Group();
  cabeza.position.set(0, 0.4, 0.04);
  gato.add(cabeza);
  mesh(new THREE.IcosahedronGeometry(0.1, 0), pelaje, 0, 0, 0, cabeza);
  for (const x of [-0.06, 0.06]) {
    const o = mesh(new THREE.ConeGeometry(0.035, 0.08, 4), pelaje, x, 0.1, 0, cabeza);
    o.rotation.z = -x * 3;
  }
  const cola = [];
  let padre = gato;
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Group();
    s.position.set(i === 0 ? 0.1 : 0, i === 0 ? 0.04 : 0.1, i === 0 ? -0.08 : 0);
    box(0.035, 0.11, 0.035, pelaje, 0, 0.05, 0, s);
    padre.add(s);
    padre = s;
    cola.push(s);
  }
  const vol = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 1.4));
  vol.position.set(VENTANA.x, VENTANA.y, VENTANA.z + 0.4);
  const t = tocable('ventana', g, vol, (u) => {
    const s = Math.sin(u * Math.PI);
    vidrio.emissiveIntensity = 1.1 + s * 1.6;
    cortina.scale.x = 1 - s * 0.45;
    cortina.position.x = -0.55 - s * 0.05;
  });
  t.gato = { cabeza, cola, cuerpo };
  t.panel = panel;
  t.vidrio = vidrio;
  return t;
})();

// ------------------------------------------------------------------ personajes con historia
// El niño que solo pisa las franjas blancas (cebra oeste), con su mamá. Esperan a que pase el grueso de la gente.
const nino = persona({ abrigo: 0xf2c230, piel: 0xe0ac7e, pelo: 0xf2c230, pantalon: 0xc8413a, escala: 0.66 });
const mama = persona({ abrigo: 0x3d4a6b, piel: 0xc68642, pelo: 0x1b1714, pantalon: 0x262a36, sombrilla: 0x2a2f3a });
scene.add(nino, mama);
const historiaNino = { lado: 1, estado: 'espera', t: 0, z: 7.3, mz: 7.5 };

// El perro que se detiene frente al buzón y lo mira.
const perro = (() => {
  const g = new THREE.Group();
  const pel = 0xc9a27e;
  const cuerpo = box(0.24, 0.24, 0.56, pel, 0, 0.36, 0, g);
  const cabeza = new THREE.Group();
  cabeza.position.set(0, 0.52, 0.32);
  g.add(cabeza);
  box(0.2, 0.2, 0.22, pel, 0, 0, 0, cabeza);
  box(0.12, 0.1, 0.12, 0xb08a66, 0, -0.04, 0.14, cabeza);
  box(0.05, 0.04, 0.03, 0x1a1a1a, 0, -0.01, 0.21, cabeza, false);
  for (const x of [-0.1, 0.1]) box(0.05, 0.14, 0.09, 0x8a6a4a, x, 0.02, -0.03, cabeza);
  box(0.26, 0.04, 0.05, 0xc8413a, 0, 0.44, 0.24, g);
  const cola = new THREE.Group();
  cola.position.set(0, 0.44, -0.28);
  box(0.05, 0.05, 0.22, pel, 0, 0.05, -0.08, cola).rotation.x = 0.8;
  g.add(cola);
  const patas = [];
  for (const [x, z] of [[-0.08, 0.2], [0.08, 0.2], [-0.08, -0.2], [0.08, -0.2]]) {
    const p = new THREE.Group();
    p.position.set(x, 0.26, z);
    box(0.07, 0.26, 0.07, pel, 0, -0.13, 0, p);
    g.add(p);
    patas.push(p);
  }
  scene.add(g);
  g.userData = { cabeza, cola, patas, cuerpo };
  return g;
})();
const dueno = persona({ abrigo: 0x3f7f5f, piel: 0xffdbac, pelo: 0x6b6b6b, pantalon: 0x3b3f52, sombrilla: 0xcfd8e3 });
scene.add(dueno);
const correa = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xc8413a }));
scene.add(correa);
// ida por el borde del andén (pasa junto al buzón), vuelta por dentro
const rutaPerro = [
  { x: -26, z: 7.55 }, { x: -11.05, z: 7.55, parada: 'buzon' }, { x: -9.6, z: 8.2 }, { x: -9.6, z: 9.4, parada: 'esquina' }, { x: -26, z: 9.5 },
];
const historiaPerro = { i: 0, x: -22, z: 7.55, espera: 0, fase: 0 };

// Quien espera a alguien, inmóvil, en la esquina del parque.
const ESPERA = { x: 9.25, z: 9.35 };
const quieto = persona({ abrigo: 0x5a4a42, piel: 0xa86b4a, pelo: 0x2e2320, pantalon: 0x1f2230, sombrilla: 0x3aa6a0 });
quieto.position.set(ESPERA.x, ACERA, ESPERA.z);
quieto.rotation.y = -Math.PI * 0.72;
scene.add(quieto);

// La señora de las palomas, en la otra punta de la banca.
const senora = (() => {
  const g = new THREE.Group();
  const abrigo = 0x7a4b5c;
  const sentado = new THREE.Group();
  sentado.position.set(0.6, 0, 0.02);
  g.add(sentado);
  mesh(GP.torso, abrigo, 0, 0.8, -0.05, sentado).scale.set(1.05, 0.9, 1.05);
  box(0.26, 0.05, 0.12, 0xc8413a, 0, 1.12, 0, sentado);
  const cabeza = new THREE.Group();
  cabeza.position.set(0, 1.27, 0);
  sentado.add(cabeza);
  mesh(GP.cabeza, 0xf1c9a5, 0, 0, 0, cabeza);
  mesh(GP.pelo, 0xd6d6db, 0, 0.05, -0.02, cabeza);
  for (const x of [-0.09, 0.09]) {
    box(0.12, 0.12, 0.42, 0x3b3f52, x, 0.5, 0.2, sentado);
    box(0.11, 0.42, 0.12, 0x3b3f52, x, 0.26, 0.4, sentado);
  }
  box(0.2, 0.14, 0.14, 0xb08a5e, 0, 0.6, 0.25, sentado);
  const brazo = new THREE.Group();
  brazo.position.set(-0.24, 1.05, 0);
  box(0.08, 0.5, 0.09, abrigo, 0, -0.25, 0, brazo);
  brazo.rotation.x = -0.9;
  sentado.add(brazo);
  g.position.set(BANCA.x, 0.19, BANCA.z);
  g.rotation.y = BANCA.ry;
  scene.add(g);
  return { g, brazo, cabeza };
})();
const palomas = [];
for (let i = 0; i < 7; i++) {
  const g = new THREE.Group();
  mesh(new THREE.IcosahedronGeometry(0.09, 0).scale(1, 0.85, 1.5), pick([0x7d8699, 0x8a92a6, 0x6b7385, 0xd9dce4]), 0, 0.1, 0, g);
  const cabeza = new THREE.Group();
  cabeza.position.set(0, 0.17, 0.1);
  mesh(new THREE.IcosahedronGeometry(0.05, 0), 0x5d6680, 0, 0, 0, cabeza);
  box(0.02, 0.02, 0.04, 0xe0a060, 0, -0.01, 0.05, cabeza, false);
  g.add(cabeza);
  scene.add(g);
  const a = R(-0.9, 0.9), d = R(0.9, 2.4);
  palomas.push({ g, cabeza, lx: Math.sin(a) * d + 0.3, lz: Math.cos(a) * d + 0.4, ry: R(0, 6), picar: R(0, 3), salto: 0 });
}
const bancaMundo = (lx, ly, lz) => {
  const c = Math.cos(BANCA.ry), s = Math.sin(BANCA.ry);
  return new THREE.Vector3(BANCA.x + lx * c + lz * s, ly, BANCA.z - lx * s + lz * c);
};

// Alguien más mira el cruce, desde una ventana que solo se ve desde otra ventana.
const testigo = (() => {
  const g = new THREE.Group();
  g.position.set(TESTIGO.x, TESTIGO.y, TESTIGO.z);
  g.rotation.y = Math.PI;
  const vidrio = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
  box(1.3, 1.6, 0.02, vidrio, 0, 0, 0.05, g, false);
  box(1.5, 0.1, 0.4, 0xe8dfcf, 0, -0.85, 0.2, g);
  const p = persona({ abrigo: 0x2f6f8f, piel: 0xe0ac7e, pelo: 0x4a3426, pantalon: 0x2b2f3f, sombra: false });
  p.position.set(0.15, -1.55, 0.16);
  p.userData.piernaI.visible = p.userData.piernaD.visible = false;
  g.add(p);
  box(0.22, 0.12, 0.12, 0xffffff, -0.3, -0.72, 0.3, g, false);
  scene.add(g);
  return p;
})();

// ------------------------------------------------------------------ autos
const carriles = [];
function carril(eje, signo, desplazo, via) {
  const c = { eje, signo, desplazo, via, autos: [] };
  c.pos = (s, v) => (eje === 'x' ? v.set(signo * s, 0, desplazo) : v.set(desplazo, 0, signo * s));
  c.ry = eje === 'x' ? (signo > 0 ? Math.PI / 2 : -Math.PI / 2) : signo > 0 ? 0 : Math.PI;
  carriles.push(c);
  return c;
}
for (const d of [1.5, 4.5]) {
  carril('x', 1, d, 'eo'); carril('x', -1, -d, 'eo');
  carril('z', 1, -d, 'ns'); carril('z', -1, d, 'ns');
}
function auto(tipo) {
  const g = new THREE.Group();
  const faro = M(0xffffff, { emissive: 0xfff1c8, emissiveIntensity: 2 });
  const trasera = M(0x400000, { emissive: 0xff2a2a, emissiveIntensity: 1.6 });
  const vidrio = M(0x1b2239, { roughness: 0.2 });
  let L;
  if (tipo === 'bus') {
    L = 10;
    box(2.5, 2.4, 10, 0x2f7f8f, 0, 1.55, 0, g);
    box(2.52, 0.9, 9, M(0x000000, { emissive: 0xffe2a8, emissiveIntensity: 0.9 }), 0, 1.95, 0.2, g, false);
    box(2.55, 0.3, 10.05, 0xe8dfcf, 0, 0.55, 0, g);
    for (const z of [-3.5, 3.5]) for (const x of [-1.2, 1.2]) mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 8).rotateZ(Math.PI / 2), 0x16181f, x, 0.45, z, g);
    box(0.3, 0.2, 0.05, faro, -0.9, 0.9, 5.01, g, false); box(0.3, 0.2, 0.05, faro, 0.9, 0.9, 5.01, g, false);
    box(0.3, 0.2, 0.05, trasera, -0.9, 0.9, -5.01, g, false); box(0.3, 0.2, 0.05, trasera, 0.9, 0.9, -5.01, g, false);
  } else {
    L = 4.2;
    const color = tipo === 'taxi' ? 0xf2c230 : pick([0xc8413a, 0x2f6fd6, 0xdfe2ea, 0x3a3f4f, 0x6b7280, 0x3f7f5f, 0x8a6a8e]);
    box(1.8, 0.62, 4.2, M(color, { roughness: 0.4 }), 0, 0.6, 0, g);
    box(1.6, 0.56, 2.2, vidrio, 0, 1.18, -0.2, g);
    box(1.62, 0.1, 2.0, M(color, { roughness: 0.4 }), 0, 1.47, -0.2, g);
    if (tipo === 'taxi') box(0.5, 0.18, 0.25, M(0xffffff, { emissive: 0xffe9a8, emissiveIntensity: 1.2 }), 0, 1.6, -0.2, g);
    for (const z of [-1.35, 1.35]) for (const x of [-0.85, 0.85]) mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 8).rotateZ(Math.PI / 2), 0x16181f, x, 0.32, z, g);
    box(0.34, 0.14, 0.05, faro, -0.6, 0.66, 2.11, g, false); box(0.34, 0.14, 0.05, faro, 0.6, 0.66, 2.11, g, false);
    box(0.3, 0.12, 0.05, trasera, -0.62, 0.7, -2.11, g, false); box(0.3, 0.12, 0.05, trasera, 0.62, 0.7, -2.11, g, false);
  }
  const conos = halo(0xfff1c8, 1.2);
  conos.position.set(0, 0.7, L / 2 + 0.3);
  g.add(conos);
  scene.add(g);
  return { g, L, s: 0, v: 0, vmax: tipo === 'bus' ? 7.5 : R(8.5, 10.5) };
}
{
  const LARGO = 150;
  carriles.forEach((c, ci) => {
    const n = 3 + (ci % 2);
    let s = -LARGO / 2 + R(0, 20);
    for (let k = 0; k < n; k++) {
      const tipo = ci === 2 && k === 0 ? 'bus' : ci === 5 && k === 1 ? 'bus' : rnd() < 0.2 ? 'taxi' : 'auto';
      const a = auto(tipo);
      a.s = s;
      s += R(18, 34);
      c.autos.push(a);
    }
  });
}
const _v = new THREE.Vector3();
function moverAutos(dt, hayPeatonesEnLaCalle) {
  const LARGO = 150;
  const f = fase();
  for (const c of carriles) {
    const verde = f === c.via && !hayPeatonesEnLaCalle;
    const amarillo = f === c.via + '-a';
    const autos = c.autos.sort((a, b) => b.s - a.s);
    autos.forEach((a, k) => {
      const lider = k === 0 ? { s: autos[autos.length - 1].s + LARGO, L: autos[autos.length - 1].L } : autos[k - 1];
      const frente = a.s + a.L / 2;
      let hueco = lider.s - lider.L / 2 - frente - 2.2;
      // tolerancia: quien quedó a centímetros de la línea sigue detenido
      if (!verde && frente < -10.3) {
        const d = Math.max(0, -11 - frente);
        const alcanza = amarillo && d < (a.v * a.v) / 12;
        if (!alcanza) hueco = Math.min(hueco, d);
      }
      const objetivo = Math.min(a.vmax, Math.sqrt(Math.max(0, 2 * 3.2 * hueco)));
      a.v += clamp(objetivo - a.v, -9 * dt, 2.6 * dt);
      a.v = Math.max(0, a.v);
      a.s += a.v * dt;
      if (a.s > LARGO / 2) a.s -= LARGO;
      c.pos(a.s, a.g.position);
      a.g.rotation.y = c.ry;
    });
  }
}

// ------------------------------------------------------------------ multitud
const ESQUINAS = [[-1, -1], [1, -1], [1, 1], [-1, 1]]; // NO, NE, SE, SO
const N = 210;
const peatones = [];
const obstaculos = [
  { x: CHARCO.x, z: CHARCO.z, r: CHARCO.r * 1.25 },
  { x: BUZON.x, z: BUZON.z, r: 0.55 },
  { x: -6.7, z: 6.7, r: 0.3 }, { x: 6.7, z: -6.7, r: 0.3 }, { x: -6.7, z: -6.7, r: 0.3 }, { x: 6.7, z: 6.7, r: 0.3 },
  { x: ESPERA.x, z: ESPERA.z, r: 0.55 },
];
const moviles = { nino: { x: 0, z: 0, r: 0.35 }, mama: { x: 0, z: 0, r: 0.45 }, perro: { x: 0, z: 0, r: 0.4 }, dueno: { x: 0, z: 0, r: 0.45 } };
obstaculos.push(...Object.values(moviles));

const puntoEspera = (c) => {
  const [sx, sz] = ESQUINAS[c];
  return { x: sx * R(6.9, 9.9), z: sz * R(6.9, 9.9) };
};
function brazoDeAcera(c, saliendo) {
  const [sx, sz] = ESQUINAS[c];
  const lejos = R(58, 75);
  if (c === 2 && rnd() < 0.3) { // al parque, por el camino diagonal
    const l = R(-1, 1);
    return [{ x: 11.5 + l, z: 11.5 - l }, { x: 50 + l, z: 50 - l }];
  }
  const lat = R(6.9, 9.6);
  const tramo = rnd() < 0.5
    ? [{ x: sx * 11.5, z: sz * lat }, { x: sx * lejos, z: sz * lat }]
    : [{ x: sx * lat, z: sz * 11.5 }, { x: sx * lat, z: sz * lejos }];
  return saliendo ? tramo : tramo.reverse();
}
function destinoDesde(c) {
  const r = rnd();
  return r < 0.36 ? (c + 1) % 4 : r < 0.72 ? (c + 3) % 4 : (c + 2) % 4;
}
function nacer(p, repartir = false) {
  p.esquina = (rnd() * 4) | 0;
  p.destino = destinoDesde(p.esquina);
  const llegada = brazoDeAcera(p.esquina, false);
  p.ruta = [...llegada, puntoEspera(p.esquina)];
  p.wi = 0;
  p.estado = 'llega';
  const [a, b] = llegada;
  const t = repartir ? rnd() : 0;
  p.x = a.x + (b.x - a.x) * t;
  p.z = a.z + (b.z - a.z) * t;
  if (repartir) p.wi = 1;
  p.vx = p.vz = 0;
  p.rumbo = Math.atan2(b.x - a.x, b.z - a.z);
}
for (let i = 0; i < N; i++) {
  const vivo = rnd() < 0.14;
  const p = {
    vel: R(1.1, 1.55), fase: R(0, 6), cant: 0, esc: R(0.9, 1.07), demora: 0,
    abrigo: vivo ? pick(ABRIGO_VIVO) : pick(ABRIGO), piel: pick(PIEL), pelo: pick(PELO), pantalon: pick(PANTALON),
    sombrilla: rnd() < 0.5 ? (rnd() < 0.18 ? pick(SOMBRILLA_VIVA) : pick(SOMBRILLA)) : null,
  };
  nacer(p, true);
  if (rnd() < 0.28) { // ya esperando en la esquina
    const w = puntoEspera(p.esquina);
    p.x = w.x; p.z = w.z; p.estado = 'espera'; p.ruta = [w]; p.wi = 0;
  }
  peatones.push(p);
}

const mallas = {};
{
  const blanco = () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, flatShading: true });
  const hacer = (geo, n, mat = blanco()) => {
    const m = new THREE.InstancedMesh(geo, mat, n);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.castShadow = true;
    m.frustumCulled = false;
    scene.add(m);
    return m;
  };
  mallas.torso = hacer(GP.torso, N);
  mallas.cabeza = hacer(GP.cabeza, N);
  mallas.pelo = hacer(GP.pelo, N);
  mallas.pierna = hacer(GP.pierna, N * 2);
  mallas.brazo = hacer(GP.brazo, N * 2);
  mallas.sombrilla = hacer(GP.sombrilla, N, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, flatShading: true, side: THREE.DoubleSide }));
  mallas.baston = hacer(GP.baston, N);
  const c = new THREE.Color();
  peatones.forEach((p, i) => {
    mallas.torso.setColorAt(i, c.setHex(p.abrigo));
    mallas.cabeza.setColorAt(i, c.setHex(p.piel));
    mallas.pelo.setColorAt(i, c.setHex(p.pelo));
    mallas.pierna.setColorAt(i * 2, c.setHex(p.pantalon));
    mallas.pierna.setColorAt(i * 2 + 1, c);
    mallas.brazo.setColorAt(i * 2, c.setHex(p.abrigo));
    mallas.brazo.setColorAt(i * 2 + 1, c);
    mallas.sombrilla.setColorAt(i, c.setHex(p.sombrilla ?? 0));
    mallas.baston.setColorAt(i, c.setHex(0x222222));
  });
}

function hayAutosEnElCruce() {
  for (const c of carriles) for (const a of c.autos) if (a.s + a.L / 2 > -10.4 && a.s - a.L / 2 < 10.4) return true;
  return false;
}
function moverPeatones(dt) {
  const pasan = peatonesPasan() && !hayAutosEnElCruce();
  const f = fase();
  for (const p of peatones) {
    let dx = 0, dz = 0, quiere = 0;
    if (p.estado === 'espera') {
      if (pasan) {
        p.demora -= dt;
        if (p.demora <= 0) cruzar(p);
      }
    }
    if (p.estado !== 'espera') {
      const w = p.ruta[p.wi];
      dx = w.x - p.x; dz = w.z - p.z;
      const d = Math.hypot(dx, dz);
      const ultimo = p.wi === p.ruta.length - 1;
      if (d < (ultimo ? 0.45 : 1.2)) {
        if (!ultimo) p.wi++;
        else llegar(p, f);
      }
      if (d > 0.001) { quiere = p.vel * (p.estado === 'cruza' ? (f === 'parpadeo' ? 1.5 : 1.12) : 1); dx /= d; dz /= d; }
    }
    // separación
    let px = 0, pz = 0;
    const rad = p.estado === 'espera' ? 0.52 : p.estado === 'cruza' ? 0.58 : 0.66;
    for (const q of peatones) {
      if (q === p) continue;
      const ex = p.x - q.x, ez = p.z - q.z;
      if (Math.abs(ex) > rad || Math.abs(ez) > rad) continue;
      const d = Math.hypot(ex, ez);
      if (d > 0.0001 && d < rad) { const k = ((rad - d) / d) * 5; px += ex * k; pz += ez * k; }
    }
    for (const o of obstaculos) {
      const ex = p.x - o.x, ez = p.z - o.z, lim = o.r + 0.38;
      if (Math.abs(ex) > lim || Math.abs(ez) > lim) continue;
      const d = Math.hypot(ex, ez);
      if (d > 0.0001 && d < lim) {
        const k = ((lim - d) / d) * 7;
        px += ex * k; pz += ez * k;
        // rodear, no rebotar: empujón lateral según el lado por el que se viene
        const lado = Math.sign(ex * dz - ez * dx) || 1;
        px += -ez / d * lado * 1.2 * quiere; pz += ex / d * lado * 1.2 * quiere;
      }
    }
    const ax = dx * quiere + px, az = dz * quiere + pz;
    const k = Math.min(1, dt * (p.estado === 'espera' ? 3 : 5));
    p.vx += (ax - p.vx) * k;
    p.vz += (az - p.vz) * k;
    p.x += p.vx * dt;
    p.z += p.vz * dt;
    const rapidez = Math.hypot(p.vx, p.vz);
    if (rapidez > 0.25) p.rumbo += angDiff(p.rumbo, Math.atan2(p.vx, p.vz)) * Math.min(1, dt * 8);
    else if (p.estado === 'espera') {
      const [sx, sz] = ESQUINAS[p.destino];
      p.rumbo += angDiff(p.rumbo, Math.atan2(sx * 8.4 - p.x, sz * 8.4 - p.z)) * Math.min(1, dt * 2);
    }
    p.cant += (clamp(rapidez / 1.2, 0, 1) - p.cant) * Math.min(1, dt * 6);
    p.fase += rapidez * dt * 5.2;
  }
}
function cruzar(p) {
  p.estado = 'cruza';
  p.ruta = [puntoEspera(p.destino)];
  p.wi = 0;
}
function llegar(p, f) {
  if (p.estado === 'llega') {
    p.estado = 'espera';
    p.ruta = [{ x: p.x, z: p.z }];
    p.wi = 0;
    p.demora = f === 'pasen' ? R(0, 0.6) : R(0.15, 2.2) + (rnd() < 0.08 ? R(1.5, 3) : 0);
  } else if (p.estado === 'cruza') {
    p.estado = 'sale';
    p.esquina = p.destino;
    p.ruta = brazoDeAcera(p.esquina, true);
    p.wi = 0;
  } else if (p.estado === 'sale') nacer(p);
}
function hayPeatonesEnLaCalle() {
  for (const p of peatones) if (p.estado === 'cruza' && suelo(p.x, p.z) === 0) return true;
  return historiaNino.estado === 'cruza';
}

const _base = new THREE.Matrix4(), _loc = new THREE.Matrix4(), _tmp = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _Y = new THREE.Vector3(0, 1, 0);
function parte(m, i, x, y, z, rx = 0, esc = 1) {
  _loc.makeRotationFromEuler(_e.set(rx, 0, 0));
  if (esc !== 1) _loc.scale(_s.set(esc, esc, esc));
  _loc.setPosition(x, y, z);
  _tmp.multiplyMatrices(_base, _loc);
  m.setMatrixAt(i, _tmp);
}
function dibujarPeatones() {
  peatones.forEach((p, i) => {
    _q.setFromAxisAngle(_Y, p.rumbo);
    _base.compose(_p.set(p.x, suelo(p.x, p.z), p.z), _q, _s.set(p.esc, p.esc, p.esc));
    const sw = Math.sin(p.fase) * p.cant, bob = Math.abs(Math.cos(p.fase)) * 0.035 * p.cant;
    parte(mallas.torso, i, 0, 1.07 + bob, 0);
    parte(mallas.cabeza, i, 0, 1.56 + bob, 0);
    parte(mallas.pelo, i, 0, 1.61 + bob, -0.02);
    parte(mallas.pierna, i * 2, -0.09, 0.76, 0, sw * 0.55);
    parte(mallas.pierna, i * 2 + 1, 0.09, 0.76, 0, -sw * 0.55);
    parte(mallas.brazo, i * 2, -0.24, 1.36 + bob, 0, -sw * 0.45);
    if (p.sombrilla !== null) {
      parte(mallas.brazo, i * 2 + 1, 0.24, 1.36 + bob, 0, -0.75);
      parte(mallas.baston, i, 0.2, 1.45 + bob, 0.3);
      parte(mallas.sombrilla, i, 0.2, 2.02 + bob, 0.3, -0.1);
    } else {
      parte(mallas.brazo, i * 2 + 1, 0.24, 1.36 + bob, 0, sw * 0.45);
      parte(mallas.baston, i, 0, 0, 0, 0, 0);
      parte(mallas.sombrilla, i, 0, 0, 0, 0, 0);
    }
  });
  for (const m of Object.values(mallas)) m.instanceMatrix.needsUpdate = true;
}

// ------------------------------------------------------------------ historias
function moverNino(dt) {
  const h = historiaNino;
  const X = -8.1, XM = -9.3;
  const s = h.lado; // 1: en la esquina SO (z +), -1: en la esquina NO (z -)
  if (h.estado === 'espera') {
    h.z = s * 7.35;
    nino.scale.setScalar(0.66);
    if (peatonesPasan() && !hayAutosEnElCruce()) { h.t += dt; if (h.t > 5.5) { h.estado = 'cruza'; h.t = 0; } }
    nino.userData.cuerpo.position.y = Math.abs(Math.sin(performance.now() / 380)) * 0.04; // se balancea, impaciente
    caminar(nino, 0, 0);
  }
  if (h.estado === 'cruza') {
    // saltos de franja blanca en franja blanca: centros en z = ±5.5 … ±0.5
    const paradas = [s * 7.35];
    for (let k = 0; k < 12; k++) paradas.push(s * (5.5 - k));
    paradas.push(-s * 7.35);
    const DUR = 0.62;
    h.t += dt;
    const k = Math.floor(h.t / DUR);
    if (k >= paradas.length - 1) { h.estado = 'espera'; h.lado = -s; h.t = 0; h.z = -s * 7.35; }
    else {
      const u = clamp((h.t - k * DUR) / (DUR * 0.8), 0, 1);
      h.z = paradas[k] + (paradas[k + 1] - paradas[k]) * ease(u);
      const alto = Math.sin(u * Math.PI);
      nino.userData.cuerpo.position.y = alto * 0.42;
      nino.userData.piernaI.rotation.x = nino.userData.piernaD.rotation.x = -alto * 0.9;
      nino.userData.brazoI.rotation.x = nino.userData.brazoD.rotation.x = -alto * 2.6;
      const aplasta = u >= 1 ? 0.9 : 1;
      nino.scale.set(0.66 / Math.sqrt(aplasta), 0.66 * aplasta, 0.66 / Math.sqrt(aplasta));
    }
  }
  nino.position.set(X, suelo(X, h.z), h.z);
  nino.rotation.y = h.lado > 0 ? Math.PI : 0;
  if (h.estado === 'espera') nino.rotation.y += Math.sin(performance.now() / 900) * 0.4;
  // la mamá sigue al niño, sin saltar
  const antes = h.mz;
  h.mz += (h.z + s * (h.estado === 'cruza' ? 0.5 : 0.1) - h.mz) * Math.min(1, dt * 2.2);
  const v = Math.abs(h.mz - antes) / Math.max(dt, 1e-4);
  mama.position.set(XM, suelo(XM, h.mz), h.mz);
  mama.rotation.y = h.lado > 0 ? Math.PI : 0;
  mama.userData.sombrilla.position.x = h.lado > 0 ? 0.2 : -0.2;
  mama.userData.f = (mama.userData.f || 0) + v * dt * 5.2;
  caminar(mama, mama.userData.f, clamp(v / 1.1, 0, 1));
  moviles.nino.x = X; moviles.nino.z = h.z;
  moviles.mama.x = XM; moviles.mama.z = h.mz;
}

function moverPerro(dt, t) {
  const h = historiaPerro;
  const w = rutaPerro[h.i];
  const dx = w.x - h.x, dz = w.z - h.z, d = Math.hypot(dx, dz);
  let v = 0, mira = null;
  const u = perro.userData;
  if (h.espera > 0) {
    h.espera -= dt;
    if (w.parada === 'buzon') mira = -Math.PI / 2; // de frente al buzón
    if (h.espera <= 0) h.i = (h.i + 1) % rutaPerro.length;
  } else if (d < 0.08) {
    if (w.parada) h.espera = w.parada === 'buzon' ? 5.5 : 1.5;
    else h.i = (h.i + 1) % rutaPerro.length;
  } else {
    v = 1.05;
    const paso = Math.min(d, v * dt);
    h.x += (dx / d) * paso; h.z += (dz / d) * paso;
    h.rumbo = Math.atan2(dx, dz);
  }
  const rumbo = mira ?? h.rumbo ?? Math.PI / 2;
  perro.rotation.y += angDiff(perro.rotation.y, rumbo) * Math.min(1, dt * 6);
  perro.position.set(h.x, suelo(h.x, h.z), h.z);
  h.fase += v * dt * 11;
  u.patas.forEach((p, k) => { p.rotation.x = Math.sin(h.fase + (k % 3 === 0 ? 0 : Math.PI)) * 0.6 * (v > 0 ? 1 : 0); });
  const frente = mira !== null;
  u.cola.rotation.y = Math.sin(t * (frente ? 22 : 9)) * (frente ? 0.8 : 0.35);
  u.cabeza.rotation.x = frente ? -0.55 : Math.sin(h.fase * 0.5) * 0.05;
  u.cabeza.rotation.z = frente ? Math.sin(t * 1.6) * 0.3 : 0; // ladea la cabeza
  // el dueño va detrás, a lo largo de la correa
  const atras = new THREE.Vector3(Math.sin(perro.rotation.y), 0, Math.cos(perro.rotation.y));
  const objetivo = frente ? { x: h.x - 1.9, z: h.z + 0.55 } : { x: h.x - atras.x * 1.6, z: h.z - atras.z * 1.6 };
  const du = dueno.userData;
  du.x ??= objetivo.x; du.z ??= objetivo.z;
  const ax = du.x, az = du.z;
  du.x += (objetivo.x - du.x) * Math.min(1, dt * 2.5);
  du.z += (objetivo.z - du.z) * Math.min(1, dt * 2.5);
  const dv = Math.hypot(du.x - ax, du.z - az) / Math.max(dt, 1e-4);
  dueno.position.set(du.x, suelo(du.x, du.z), du.z);
  const mirarA = Math.atan2(h.x - du.x, h.z - du.z);
  dueno.rotation.y += angDiff(dueno.rotation.y, mirarA) * Math.min(1, dt * 4);
  du.f = (du.f || 0) + dv * dt * 5.2;
  caminar(dueno, du.f, clamp(dv / 1, 0, 1));
  const pos = correa.geometry.attributes.position;
  const mano = new THREE.Vector3(-0.24, 0.9, 0.15).applyMatrix4(dueno.matrixWorld);
  const collar = new THREE.Vector3(0, 0.46, 0.25).applyMatrix4(perro.matrixWorld);
  pos.setXYZ(0, mano.x, mano.y, mano.z);
  pos.setXYZ(1, collar.x, collar.y, collar.z);
  pos.needsUpdate = true;
  moviles.perro.x = h.x; moviles.perro.z = h.z;
  moviles.dueno.x = du.x; moviles.dueno.z = du.z;
}

function moverQuieto(t) {
  const u = quieto.userData;
  // mira el reloj cada tanto, y a veces voltea hacia el parque
  const c = t % 11;
  const reloj = c > 7 && c < 9 ? Math.sin(((c - 7) / 2) * Math.PI) : 0;
  u.brazoI.rotation.x = -reloj * 1.5;
  u.brazoI.rotation.z = reloj * 0.6;
  u.cabeza.rotation.x = reloj * 0.45;
  const v = t % 23;
  u.cabeza.rotation.y = v > 15 && v < 19 ? Math.sin(((v - 15) / 4) * Math.PI) * 1.1 : Math.sin(t * 0.4) * 0.15;
  caminar(quieto, 0, 0);
  // se balancea sobre los pies
  u.cuerpo.rotation.z = Math.sin(t * 0.9) * 0.025;
}

function moverParque(dt, t) {
  // la señora lanza migas; las palomas se acercan a picotear
  const c = t % 6.5;
  const lanza = c < 0.8 ? Math.sin((c / 0.8) * Math.PI) : 0;
  senora.brazo.rotation.x = -0.9 - lanza * 0.9;
  senora.cabeza.rotation.x = 0.25 - lanza * 0.2;
  senora.cabeza.rotation.y = Math.sin(t * 0.3) * 0.3;
  for (const p of palomas) {
    p.picar -= dt;
    let pica = 0;
    if (p.picar < 0) {
      if (p.picar < -0.45) {
        p.picar = R(0.3, 2.2);
        if (rnd() < 0.35) { p.salto = 1; p.dx = R(-0.3, 0.3); p.dz = R(-0.3, 0.3); p.ry += R(-1.5, 1.5); }
      } else pica = Math.sin((-p.picar / 0.45) * Math.PI);
    }
    if (p.salto > 0) {
      p.salto = Math.max(0, p.salto - dt * 4);
      p.lx = clamp(p.lx + p.dx * dt * 4, -1.2, 1.4);
      p.lz = clamp(p.lz + p.dz * dt * 4, 0.6, 2.8);
    }
    const w = bancaMundo(p.lx, 0.19, p.lz);
    p.g.position.set(w.x, 0.19 + Math.sin(p.salto * Math.PI) * 0.12, w.z);
    p.g.rotation.y = p.ry;
    p.cabeza.rotation.x = pica * 1.1;
    p.cabeza.position.z = 0.1 + Math.sin(t * 7 + p.ry) * 0.012;
  }
}

function moverTestigo(t) {
  const u = testigo.userData;
  const c = t % 13;
  const saluda = c > 9 && c < 11.5;
  u.brazoD.rotation.x = saluda ? -2.8 : -0.2;
  u.brazoD.rotation.z = saluda ? Math.sin(t * 9) * 0.5 : 0;
  u.brazoI.rotation.x = -0.9;
  u.cabeza.rotation.x = 0.35;
  u.cabeza.rotation.y = Math.sin(t * 0.5) * 0.3;
}

// ------------------------------------------------------------------ lluvia
const GOTAS = 3200;
const lluvia = (() => {
  const pos = new Float32Array(GOTAS * 6);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xb8c6ea, transparent: true, opacity: 0.32, depthWrite: false }));
  l.frustumCulled = false;
  scene.add(l);
  const d = [];
  for (let i = 0; i < GOTAS; i++) d.push({ x: R(-25, 25), y: R(0, 26), z: R(-25, 25), v: R(10, 14) });
  return { l, pos, d };
})();
function moverLluvia(dt) {
  const c = camera.position;
  const { pos, d } = lluvia;
  const LX = 0.06, LZ = 0.03, LARGO = 0.55;
  for (let i = 0; i < GOTAS; i++) {
    const g = d[i];
    g.y -= g.v * dt;
    if (g.y < 0) { g.y += 26; g.x = R(-25, 25); g.z = R(-25, 25); }
    const x = c.x + g.x, z = c.z + g.z, y = Math.max(0, c.y - 8) + g.y;
    const j = i * 6;
    pos[j] = x; pos[j + 1] = y; pos[j + 2] = z;
    pos[j + 3] = x + LX; pos[j + 4] = y + LARGO; pos[j + 5] = z + LZ;
  }
  lluvia.l.geometry.attributes.position.needsUpdate = true;
  for (const o of ondas) {
    o.t += dt * o.v;
    if (o.t >= 1) {
      o.t = 0;
      const [x, z, r] = pick(lugaresDeOnda);
      const a = R(0, Math.PI * 2), q = Math.sqrt(rnd()) * r * 0.8;
      o.m.position.set(x + Math.cos(a) * q * 1.3, suelo(x, z) + 0.02, z + Math.sin(a) * q);
    }
    o.m.scale.setScalar(0.04 + o.t * 0.26);
    o.m.material.opacity = (1 - o.t) * 0.55;
  }
}

// ------------------------------------------------------------------ puntos de vista
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const VISTAS = {
  general: { pos: V(13, 26, 37), mira: V(-0.5, 1.5, -0.5), fov: 44 },
  semaforo: { pos: V(-6.7, ACERA + 4.62, 6.34), mira: V(-7.6, 0, -0.8), fov: 66, rotulo: 'Desde el semáforo' },
  buzon: { pos: V(BUZON.x + 0.46, ACERA + 1.05, BUZON.z), mira: V(-3, 0.6, 8.9), fov: 66, rotulo: 'Desde el buzón' },
  banca: { pos: bancaMundo(-0.62, 1.34, 0.02), mira: V(4.5, 1.9, 5.2), fov: 56, rotulo: 'Desde la banca' },
  charco: { pos: V(CHARCO.x, 0.06, CHARCO.z), mira: V(CHARCO.x - 0.6, 6, CHARCO.z - 6.5), fov: 92, rotulo: 'Desde el charco' },
  ventana: { pos: V(VENTANA.x + 0.5, VENTANA.y + 0.02, VENTANA.z + 0.1), mira: V(3, 0, 6), fov: 44, rotulo: 'Desde la ventana del cuarto piso' },
};
const ORDEN = ['semaforo', 'buzon', 'banca', 'charco', 'ventana'];
// En pantallas angostas la vista general se aleja para que quepan los cinco objetos.
const GENERAL = VISTAS.general.pos.clone();
function ajustarGeneral() {
  const k = Math.max(1, Math.pow(1.35 / camera.aspect, 0.85));
  VISTAS.general.pos.copy(VISTAS.general.mira).addScaledVector(GENERAL.clone().sub(VISTAS.general.mira), k);
  scene.fog.near = 45 * k;
  scene.fog.far = 150 * k;
}
ajustarGeneral();

let actual = 'general';
let vuelo = null;
const mira = VISTAS.general.mira.clone();
camera.position.copy(VISTAS.general.pos);
camera.fov = VISTAS.general.fov;
camera.updateProjectionMatrix();
camera.lookAt(mira);
const giro = { yaw: 0, pitch: 0, yawObj: 0, pitchObj: 0 };

const rotulo = document.getElementById('rotulo');
const volver = document.getElementById('volver');

function ir(nombre) {
  if (!VISTAS[nombre] || (nombre === actual && !vuelo)) return;
  const destino = VISTAS[nombre];
  // punto de partida: hacia donde mira la cámara ahora mismo, incluido el giro manual
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const desde = { pos: camera.position.clone(), mira: camera.position.clone().addScaledVector(dir, camera.position.distanceTo(mira)), fov: camera.fov };
  giro.yaw = giro.pitch = giro.yawObj = giro.pitchObj = 0;
  const dist = desde.pos.distanceTo(destino.pos);
  const alto = clamp(dist * 0.22, 0.8, 9);
  const control = desde.pos.clone().lerp(destino.pos, 0.5);
  control.y = Math.max(desde.pos.y, destino.pos.y) * 0.6 + Math.min(desde.pos.y, destino.pos.y) * 0.4 + alto;
  vuelo = { desde, destino, control, t: 0, dur: reduceMotion ? 0.5 : clamp(1.9 + dist * 0.025, 2, 3.2) };
  actual = nombre;
  body.dataset.vista = nombre;
  body.classList.remove('llego');
  body.classList.toggle('en-vista', nombre !== 'general');
  volver.tabIndex = nombre === 'general' ? -1 : 0;
  rotulo.textContent = '';
  if (nombre !== 'general') body.classList.add('visto');
  if (reduceMotion) body.classList.add('cortando');
}
function aterrizar() {
  vuelo = null;
  body.classList.add('llego');
  body.classList.remove('cortando');
  rotulo.textContent = VISTAS[actual].rotulo ?? '';
}
function moverCamara(dt) {
  if (vuelo) {
    vuelo.t += dt;
    const u = clamp(vuelo.t / vuelo.dur, 0, 1);
    const { desde, destino, control } = vuelo;
    if (reduceMotion) {
      // corte con fundido: nada de viajes
      if (u > 0.5) { camera.position.copy(destino.pos); mira.copy(destino.mira); camera.fov = destino.fov; }
    } else {
      const e = ease(u);
      const a = 1 - e;
      camera.position.set(
        a * a * desde.pos.x + 2 * a * e * control.x + e * e * destino.pos.x,
        a * a * desde.pos.y + 2 * a * e * control.y + e * e * destino.pos.y,
        a * a * desde.pos.z + 2 * a * e * control.z + e * e * destino.pos.z,
      );
      // la mirada llega un poco antes que el cuerpo
      mira.lerpVectors(desde.mira, destino.mira, ease(clamp(u * 1.18, 0, 1)));
      camera.fov = desde.fov + (destino.fov - desde.fov) * e;
    }
    camera.updateProjectionMatrix();
    if (u >= 1) aterrizar();
  }
  camera.lookAt(mira);
  giro.yaw += (giro.yawObj - giro.yaw) * Math.min(1, dt * 8);
  giro.pitch += (giro.pitchObj - giro.pitch) * Math.min(1, dt * 8);
  if (giro.yaw || giro.pitch) {
    camera.rotateOnWorldAxis(_Y, giro.yaw);
    camera.rotateX(giro.pitch);
  }
  // cada objeto se esconde a sí mismo cuando uno está dentro
  const dentro = !vuelo || vuelo.t / vuelo.dur > 0.85;
  semaforo.cabeza.visible = !(actual === 'semaforo' && dentro);
}

// ------------------------------------------------------------------ toque
const ray = new THREE.Raycaster();
const puntero = new THREE.Vector2();
const volumenes = tocables.map((t) => t.volumen);
let sobre = null;
let arrastre = null;
function tocableEn(e) {
  puntero.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(puntero, camera);
  const hits = ray.intersectObjects(volumenes, false);
  for (const h of hits) {
    const n = h.object.userData.tocable;
    if (n !== actual) return tocables.find((t) => t.nombre === n);
  }
  return null;
}
canvas.addEventListener('pointerdown', (e) => {
  arrastre = { x: e.clientX, y: e.clientY, yaw: giro.yawObj, pitch: giro.pitchObj, movio: false };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (arrastre) {
    const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
    if (Math.hypot(dx, dy) > 6) arrastre.movio = true;
    if (arrastre.movio && actual !== 'general' && !vuelo) {
      body.classList.add('arrastrando');
      giro.yawObj = clamp(arrastre.yaw + dx * 0.0035, -0.75, 0.75);
      giro.pitchObj = clamp(arrastre.pitch + dy * 0.0028, -0.4, 0.4);
    }
    return;
  }
  if (e.pointerType !== 'mouse') return;
  const t = tocableEn(e);
  if (t !== sobre) {
    sobre = t;
    body.classList.toggle('sobre', !!t);
    if (t && t.g < 0) t.g = 0;
  }
});
canvas.addEventListener('pointerup', (e) => {
  body.classList.remove('arrastrando');
  const a = arrastre;
  arrastre = null;
  if (!a || a.movio) return;
  const t = tocableEn(e);
  if (t) ir(t.nombre);
});
canvas.addEventListener('pointerleave', () => { sobre = null; body.classList.remove('sobre'); });
volver.addEventListener('click', () => ir('general'));
document.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => ir(b.dataset.ir)));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === '0') ir('general');
  else if (e.key >= '1' && e.key <= '5') ir(ORDEN[+e.key - 1]);
  else if (e.key === 'f' || e.key === 'F') {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  ajustarGeneral();
  if (actual === 'general' && !vuelo) camera.position.copy(VISTAS.general.pos);
  renderer.setSize(innerWidth, innerHeight);
});

// Los tocables se guiñan por turnos: nunca dos a la vez, nunca el que uno ocupa.
let turno = 0, relojGuino = 1.2;
function guinos(dt) {
  relojGuino -= dt;
  if (relojGuino <= 0) {
    relojGuino = reduceMotion ? 4 : 2.3;
    for (let k = 0; k < tocables.length; k++) {
      const t = tocables[(turno + k) % tocables.length];
      if (t.nombre !== actual && t.g < 0) { t.g = 0; turno = (turno + k + 1) % tocables.length; break; }
    }
  }
  for (const t of tocables) {
    if (t.g >= 0) {
      t.g += dt / 1.1;
      if (t.g >= 1) { t.guino(1); t.g = -1; t.parpadeo = false; } else t.guino(t.g);
    }
    const quiere = t === sobre ? 0.55 : 0;
    t.brillo += (quiere - t.brillo) * Math.min(1, dt * 10);
    for (const m of t.mats) { m.emissive.setHex(0xffc870); m.emissiveIntensity = t.brillo; }
  }
}

// ------------------------------------------------------------------ semáforos: estado
function actualizarSemaforos(dt, t) {
  sem.t += dt;
  if (sem.t >= FASES[sem.i].d) { sem.t = 0; sem.i = (sem.i + 1) % FASES.length; }
  const f = fase();
  const parpa = f === 'parpadeo' ? (Math.sin(t * 9) > 0 ? 1 : 0) : 1;
  matPeaton.siga.emissiveIntensity = f === 'pasen' || f === 'parpadeo' ? 2.4 * parpa : 0;
  matPeaton.pare.emissiveIntensity = f === 'pasen' ? 0.05 : 2;
  const L = semaforo.lamparas;
  const ns = f === 'ns' ? 'verde' : f === 'ns-a' ? 'amarillo' : 'rojo';
  for (const k of ['rojo', 'amarillo', 'verde']) L[k].emissiveIntensity = semaforo.parpadeo ? 3 : k === ns ? 3 : 0.08;
  body.style.setProperty('--tinte', ns === 'verde' ? 'rgba(61,255,138,.55)' : ns === 'amarillo' ? 'rgba(255,176,32,.6)' : 'rgba(255,59,48,.55)');
}

// ------------------------------------------------------------------ bucle
let ventanasReloj = 0;
function paso(dt, t) {
  actualizarSemaforos(dt, t);
  moverPeatones(dt);
  moverNino(dt);
  moverPerro(dt, t);
  moverQuieto(t);
  moverParque(dt, t);
  moverTestigo(t);
  moverAutos(dt, hayPeatonesEnLaCalle());
}
// Calentar la simulación para abrir con la ciudad ya en marcha, cuatro segundos antes de que pase la gente.
{
  let t = 0;
  const hasta = FASES.slice(0, 6).reduce((a, f) => a + f.d, 0) - 4;
  while (t < hasta) { paso(0.05, t); t += 0.05; }
  var tiempo = t;
}

const reloj = new THREE.Timer();
function cuadro(ahora) {
  reloj.update(ahora);
  const dt = Math.min(reloj.getDelta(), 0.05);
  tiempo += dt;
  paso(dt, tiempo);
  dibujarPeatones();
  moverLluvia(dt);
  guinos(dt);
  moverCamara(dt);
  // detalles que respiran
  for (const c of copas) c.g.rotation.z = Math.sin(tiempo * 0.8 + c.f) * 0.025;
  ropa.forEach((p, i) => { p.rotation.x = Math.sin(tiempo * 1.7 + i) * 0.18; });
  const cola = ventana.gato.cola;
  cola.forEach((s, i) => { s.rotation.z = Math.sin(tiempo * 1.4 - i * 0.6) * 0.45; s.rotation.x = -0.25; });
  ventana.gato.cabeza.rotation.y = Math.sin(tiempo * 0.35) * 0.5;
  ventana.gato.cabeza.rotation.x = 0.35;
  if (Math.floor(tiempo * 10) % 2 === 0) pantalla(tiempo);
  ventanasReloj -= dt;
  if (ventanasReloj < 0) {
    ventanasReloj = 0.8;
    const i = (rnd() * ventanas.length) | 0, v = ventanas[i];
    v.lit = !v.lit;
    mallaVentanas.setColorAt(i, new THREE.Color(v.lit ? v.c : 0x1b2239));
    mallaVentanas.instanceColor.needsUpdate = true;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(cuadro);
}
dibujarPeatones();
requestAnimationFrame(cuadro);

// para la verificación automática
window.__cruce = { ir, get actual() { return actual; }, get vuelo() { return !!vuelo; }, fase, carriles, peatones, sem,
  enPantalla: (n) => { const v = tocables.find((t) => t.nombre === n).volumen.getWorldPosition(new THREE.Vector3()).project(camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; } };
