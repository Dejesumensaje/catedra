#!/usr/bin/env node
/**
 * Convierte un zip de COMETA exportado de Google AI Studio en:
 *   - public/demos/cometa/              la build del juego (vite, base /demos/cometa/)
 *   - workers/cometa-mundo/src/salas.ts la lógica de server.ts, portada a Workers
 *
 * Uso:
 *   node scripts/construir-cometa.mjs ruta/al/Cometa.zip
 *
 * Después: revisar el diff, y si salas.ts cambió, volver a desplegar el Worker
 * (cd workers/cometa-mundo && npx wrangler deploy). Ver public/demos/cometa/LEEME.md.
 *
 * El zip trae un proyecto completo (React + Vite + Three.js + un servidor Express
 * con WebSocket). Este script le hace solo dos cambios al juego:
 *   1. el cliente se conecta a /api/cometa/ws en vez de /ws (mismo origen que el sitio)
 *   2. la build no incluye public/assets/aistudio/, que es una versión vieja
 * Si server.ts o el cliente cambiaron tanto que las marcas de abajo no aparecen,
 * el script se detiene y dice cuál falta: hay que portar a mano.
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEMO = join(RAIZ, 'public/demos/cometa');
const SALAS = join(RAIZ, 'workers/cometa-mundo/src/salas.ts');
const BASE = '/demos/cometa/';
const URL_SITIO = 'https://catedra.dejesumensaje.com/demos/cometa/';

const zip = process.argv[2];
if (!zip || !existsSync(zip)) {
  console.error('Uso: node scripts/construir-cometa.mjs ruta/al/Cometa.zip');
  process.exit(1);
}

const falla = (msg) => {
  console.error(`\n✗ ${msg}\n  El zip cambió respecto de lo que este script sabe portar. Hay que revisarlo a mano.`);
  process.exit(1);
};
const correr = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

// 1. Descomprimir en una carpeta temporal --------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'cometa-'));
correr('unzip', ['-q', resolve(zip), '-d', tmp]);
const proyecto = existsSync(join(tmp, 'package.json'))
  ? tmp
  : falla('El zip no tiene package.json en la raíz.');
console.log(`→ proyecto en ${proyecto}`);

// 2. El cliente habla con /api/cometa/ws ----------------------------------------
const rutaCliente = join(proyecto, 'src/world/multiplayerClient.ts');
const cliente = readFileSync(rutaCliente, 'utf8');
const MARCA_WS = '${window.location.host}/ws`';
const veces = cliente.split(MARCA_WS).length - 1;
if (veces !== 1) falla(`En multiplayerClient.ts esperaba una vez «${MARCA_WS}» y aparece ${veces}.`);
writeFileSync(rutaCliente, cliente.replace(MARCA_WS, '${window.location.host}/api/cometa/ws`'));

// 3. Build del juego ------------------------------------------------------------
// vite 8 y esbuild 0.25 chocan en peer deps: de ahí --legacy-peer-deps.
correr('npm', ['install', '--legacy-peer-deps', '--no-audit', '--no-fund'], proyecto);
correr('npx', ['vite', 'build', `--base=${BASE}`], proyecto);
const dist = join(proyecto, 'dist');
rmSync(join(dist, 'assets/aistudio'), { recursive: true, force: true });

// 4. Copiar a public/demos/cometa, conservando LEEME.md y og.png ------------------
rmSync(join(DEMO, 'assets'), { recursive: true, force: true });
rmSync(join(DEMO, 'index.html'), { force: true });
cpSync(dist, DEMO, { recursive: true });

const rutaIndex = join(DEMO, 'index.html');
let index = readFileSync(rutaIndex, 'utf8');
const MARCA_META = '    <meta name="twitter:card"';
if (!index.includes(MARCA_META)) falla('index.html ya no trae <meta name="twitter:card">.');
index = index.replace(
  MARCA_META,
  [
    `    <link rel="canonical" href="${URL_SITIO}" />`,
    '    <meta property="og:site_name" content="Cátedra · William Montoya" />',
    `    <meta property="og:url" content="${URL_SITIO}" />`,
    `    <meta property="og:image" content="${URL_SITIO}og.png" />`,
    '    <meta property="og:image:width" content="1200" />',
    '    <meta property="og:image:height" content="630" />',
    MARCA_META,
  ].join('\n'),
);
writeFileSync(rutaIndex, index);
console.log('→ juego copiado a public/demos/cometa/');

// 5. Portar server.ts a workers/cometa-mundo/src/salas.ts --------------------------
const L = readFileSync(join(proyecto, 'server.ts'), 'utf8').split('\n');
const linea = (pred, desc, desde = 0) => {
  const i = L.findIndex((l, j) => j >= desde && pred(l));
  if (i < 0) falla(`server.ts: no encuentro ${desc}.`);
  return i;
};
const iPaleta = linea((l) => l.startsWith('const SERVER_KITE_PALETTE_HEX'), 'la paleta de cometas');
const iCargar = linea((l) => l.startsWith('function loadPersistedSkyMemory'), 'loadPersistedSkyMemory()');
const iLlamada = linea((l) => l.startsWith('loadPersistedSkyMemory();'), 'la llamada a loadPersistedSkyMemory');
const iRooms = linea((l) => l.startsWith('const rooms = '), 'const rooms');
const iStart = linea((l) => l.startsWith('async function startServer'), 'startServer()');
const iConexion = linea((l) => l.includes("wss.on('connection', (ws) => {"), "wss.on('connection')");
const iClose = linea((l) => l.includes("ws.on('close', () => {"), "ws.on('close')", iConexion);
const iFin = linea((l) => l === '  });', 'el cierre del manejador de conexión', iClose + 1);
if (!(iPaleta < iCargar && iCargar < iLlamada && iLlamada < iRooms && iRooms < iStart && iStart < iConexion)) {
  falla('server.ts: las secciones no están en el orden esperado.');
}

const persistencia = `
const MAX_SALAS_GUARDADAS = 60;
let persistir: (store: PersistedSkyStore) => void = () => {};

export function alPersistir(fn: (store: PersistedSkyStore) => void): void {
  persistir = fn;
}

export function cargarMemoria(parsed: Partial<PersistedSkyStore> | undefined): void {
  if (!parsed) return;
  if (Array.isArray(parsed.globalKites)) {
    persistedSkyStore.globalKites = parsed.globalKites.slice(-40);
  }
  if (parsed.rooms && typeof parsed.rooms === 'object') {
    persistedSkyStore.rooms = parsed.rooms;
  }
}

function savePersistedSkyMemory(roomId: string, roomKites: SkyKiteRecord[]): void {
  persistedSkyStore.rooms[roomId] = roomKites.slice(-40);
  const mergedById = new Map<string, SkyKiteRecord>();
  for (const k of persistedSkyStore.globalKites) mergedById.set(k.id, k);
  for (const k of roomKites) mergedById.set(k.id, k);
  persistedSkyStore.globalKites = Array.from(mergedById.values())
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-40);

  // Cada partida nueva abre una sala con nombre al azar: sin tope, el registro
  // crecería para siempre. Se conservan las salas con la cometa más reciente.
  const ultima = (ks: SkyKiteRecord[]) =>
    ks.reduce((m, k) => Math.max(m, k.createdAt || 0), 0);
  const ids = Object.keys(persistedSkyStore.rooms);
  if (ids.length > MAX_SALAS_GUARDADAS) {
    ids
      .sort((a, b) => ultima(persistedSkyStore.rooms[b]) - ultima(persistedSkyStore.rooms[a]))
      .slice(MAX_SALAS_GUARDADAS)
      .forEach((id) => delete persistedSkyStore.rooms[id]);
  }
  persistir(persistedSkyStore);
}
`;

const salud = `
export function estadoSalud() {
  return {
    status: 'ok',
    activeRooms: rooms.size,
    connectedClients: clientSockets.size,
  };
}
`;

let conexion = [
  'export function manejarConexion(ws: WebSocket): void {',
  ...L.slice(iConexion + 1, iFin),
  '}',
].join('\n');
const reemplazar = (txt, de, a, desc) => {
  if (txt.split(de).length - 1 !== 1) falla(`server.ts: esperaba una vez ${desc}.`);
  return txt.replace(de, a);
};
conexion = reemplazar(
  conexion,
  "ws.on('message', (data) => {",
  "ws.addEventListener('message', (ev: MessageEvent) => {\n      const data = ev.data;",
  "ws.on('message', (data) => {",
);
conexion = reemplazar(conexion, "ws.on('close', () => {", "ws.addEventListener('close', () => {", "ws.on('close')");

let salas = [
  '/*',
  ' * GENERADO por scripts/construir-cometa.mjs a partir del server.ts del zip de',
  ' * AI Studio. No editar a mano: se sobrescribe en cada actualización.',
  ' *',
  ' * Las funciones de sala, el emparejamiento y el manejo de mensajes son las',
  ' * mismas líneas de server.ts. Cambia solo:',
  " *   - ws.on('message'|'close') -> addEventListener (WebSocket de Workers)",
  ' *   - la constante OPEN del WebSocket -> 1',
  ' *   - la memoria del cielo va al almacenamiento del Durable Object',
  ' *     (cargarMemoria / alPersistir), no a .data/sky-memory.json',
  ' *   - el registro por sala se limita a las 60 salas más recientes',
  ' *',
  ' * El estado vive a nivel de módulo, como en server.ts. Es seguro porque hay un',
  ' * único Durable Object (Mundo) que usa este módulo.',
  ' */',
  ...L.slice(iPaleta, iCargar),
  persistencia,
  ...L.slice(iRooms, iStart),
  salud,
  conexion,
  '',
].join('\n');
salas = reemplazar(salas, 'WebSocket.OPEN', '1 /* OPEN */', 'WebSocket.OPEN');
for (const prohibido of ['fs.', 'path.', '__dirname', 'express', "from 'ws'"]) {
  if (salas.includes(prohibido)) falla(`salas.ts quedaría usando «${prohibido}», que no existe en Workers.`);
}
writeFileSync(SALAS, salas);
console.log('→ server.ts portado a workers/cometa-mundo/src/salas.ts');

rmSync(tmp, { recursive: true, force: true });
console.log('\n✓ Listo. Revisa `git diff`. Si salas.ts cambió: cd workers/cometa-mundo && npx wrangler deploy');
