/* Prueba de «La comunidad» con navegadores de verdad y el servidor de salas real.
 *
 * Abre un anfitrión y tres participantes en contextos aislados (cada uno es un
 * dispositivo distinto para el servidor: su propio sessionStorage y su propio
 * WebSocket) y recorre la partida completa: crear, unirse por enlace, empezar,
 * tocar, ver los impulsos ajenos, perder a alguien, llegar a la cima, reiniciar.
 *
 * Necesita dos cosas corriendo:
 *   1. El servidor de salas:   cd workers/sisifo-sala && npx wrangler dev --port 8787
 *   2. Los archivos del demo:  cd public && python3 -m http.server 8080
 *
 * Playwright no es dependencia del sitio. En una carpeta aparte:
 *   npm i playwright-core   y   npx playwright install chromium   (o CHROMIUM=/ruta/al/binario)
 *
 * Uso:
 *   node scripts/prueba-sisifo-sala.mjs
 *   BASE=http://127.0.0.1:8080/demos/sisifo/ SERVIDOR=http://127.0.0.1:8787 CAPTURAS=/tmp/cap node scripts/prueba-sisifo-sala.mjs
 */

import { createRequire } from 'node:module';

const require = createRequire(process.env.PLAYWRIGHT_DESDE || import.meta.url);
const { chromium } = require('playwright-core');

const BASE = process.env.BASE || 'http://127.0.0.1:8080/demos/sisifo/';
const SERVIDOR = process.env.SERVIDOR || 'http://127.0.0.1:8787';
const CAPTURAS = process.env.CAPTURAS || '';
const url = (hash) => `${BASE}?servidor=${encodeURIComponent(SERVIDOR)}&depurar${hash}`;

let fallas = 0;
const ok = (cond, msg) => {
  if (cond) console.log('  ✓ ' + msg);
  else { fallas++; console.error('  ✗ ' + msg); }
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const errores = [];
async function dispositivo(nombre, opciones = {}) {
  const ctx = await navegador.newContext({ viewport: { width: 1100, height: 720 }, ...opciones });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errores.push(`${nombre}: ${e.message}`));
  p.nombre = nombre;
  p.ctx = ctx;
  return p;
}
const estado = (p) => p.evaluate(() => window.__sisifo?.estado());
const energia = (p) => p.evaluate(() => ({ ...window.__sisifo?.energia }));
/** Toca la escena a `hz` veces por segundo, por el mismo camino que un dedo. */
const empezarATocar = (p, hz) => p.evaluate((hz) => {
  const el = document.getElementById('escena');
  window.__tocando = setInterval(() => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })), 1000 / hz);
}, hz);
const dejarDeTocar = (p) => p.evaluate(() => clearInterval(window.__tocando));
const captura = async (p, nombre) => { if (CAPTURAS) await p.screenshot({ path: `${CAPTURAS}/${nombre}.png` }); };
async function hasta(cond, ms, paso = 200) {
  const fin = Date.now() + ms;
  while (Date.now() < fin) { if (await cond()) return true; await espera(paso); }
  return false;
}

console.log('Comunidad (navegadores reales + servidor):');

// ── crear ──────────────────────────────────────────────────────────
const A = await dispositivo('anfitrión');
await A.goto(url('#comunidad'));
await A.fill('#nombre', 'Ana');
await A.click('#crear');
await A.waitForFunction(() => /^#comunidad\/[A-Z]{4}$/.test(location.hash), null, { timeout: 8000 });
const codigo = (await A.evaluate(() => location.hash)).split('/')[1];
ok(/^[A-Z]{4}$/.test(codigo), `se crea una sala con código (${codigo})`);
await A.waitForSelector('#sala .qr svg', { timeout: 8000 });
ok(true, 'la pantalla anfitriona muestra el código QR');
const enlace = await A.textContent('#sala .enlace');
ok(enlace.includes(`#comunidad/${codigo}`), 'y un enlace compartible');
await captura(A, 'comunidad-sala-anfitrion');

// ── unirse ─────────────────────────────────────────────────────────
const B = await dispositivo('teléfono B', { viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const Cc = await dispositivo('C');
const Dd = await dispositivo('D');
for (const p of [B, Cc, Dd]) await p.goto(url(`#comunidad/${codigo}`));
ok(await hasta(async () => (await estado(A))?.roster.personas.filter((p) => p.conectada).length === 4, 8000),
  'tres dispositivos más entran a la misma sala por el enlace');
ok(await hasta(async () => (await estado(B))?.roster.personas.filter((p) => p.conectada).length === 4, 4000),
  'todos ven a las cuatro personas');
ok((await B.textContent('#sala')).includes('empieza cuando'), 'quien entra espera a que el anfitrión empiece');
ok(!(await B.$('#empezar')), 'solo el anfitrión tiene el botón de empezar');
await captura(B, 'comunidad-espera-telefono');

// ── empezar ────────────────────────────────────────────────────────
await A.click('#empezar');
ok(await hasta(async () => (await Promise.all([A, B, Cc, Dd].map(estado))).every((e) => e.st?.f === 'juego'), 4000),
  'el anfitrión empieza y la partida empieza en todos');

// ── impulsos ajenos: A no toca ─────────────────────────────────────
const antes = await energia(A);
await espera(1500);
ok((await energia(A)).remotos === antes.remotos, 'sin toques no aparece ningún impulso');
await empezarATocar(B, 5);
await empezarATocar(Cc, 5);
await espera(3000);
const despues = await energia(A);
ok(despues.remotos > 10, `A, sin tocar, recibe los impulsos de B y C (${despues.remotos})`);
ok(despues.propios === 0, 'A no dibuja impulsos propios que no hizo');
const xs = (await Promise.all([A, B, Cc, Dd].map(estado))).map((e) => e.st.x);
ok(xs[0] > 0.2, `las contribuciones mueven la roca (x = ${xs[0].toFixed(2)} m)`);
ok(Math.max(...xs) - Math.min(...xs) < 0.15, `los cuatro ven la roca en el mismo lugar (${xs.map((x) => x.toFixed(2)).join(' / ')})`);
const eA = await estado(A);
ok(eA.st.es.length === 4 && eA.st.es.filter(([, e]) => e > 0.1).length === 2, 'el estado distingue quién está aportando');
await captura(A, 'comunidad-impulsos');

// ── rush ───────────────────────────────────────────────────────────
await empezarATocar(Dd, 6);
await empezarATocar(A, 6);
const rush = await hasta(async () => (await energia(A)).rushes > 0, 6000, 50);
ok(rush, 'cuando varias personas coinciden se dispara el rush');
await captura(A, 'comunidad-rush');
const xCuatro = (await estado(A)).st.x;

// ── alguien se va ──────────────────────────────────────────────────
await Dd.ctx.close();
ok(await hasta(async () => (await estado(A)).roster.personas.find((p) => p.n === 4)?.conectada === false, 6000),
  'quien cierra su navegador aparece desconectado');
const st = (await estado(A)).st;
ok(st.f === 'juego' && st.es.length === 3, 'la partida sigue sin su contribución');
await espera(1500);
ok((await estado(A)).st.x > xCuatro, 'la roca sigue respondiendo a quienes quedan');

// ── cima ───────────────────────────────────────────────────────────
const llego = await hasta(async () => (await estado(A)).st.f === 'cima', 150000, 500);
ok(llego, `tres personas llevan la roca a la cima (x = ${(await estado(A)).st.x})`);
for (const p of [A, B, Cc]) await dejarDeTocar(p);
await espera(2600);
ok((await A.textContent('#cierre')).includes('La roca se queda arriba'), 'la victoria es colectiva y sin puntuaciones');
ok((await B.textContent('#cierre')).includes('La roca se queda arriba'), 'también en los teléfonos de quienes empujaron');
const arriba = (await Promise.all([A, B, Cc].map(estado))).map((e) => e.st.x);
await espera(2000);
const sigue = (await Promise.all([A, B, Cc].map(estado))).map((e) => e.st.x);
ok(arriba.every((x, i) => x === sigue[i] && x === 12), 'la roca se queda arriba aunque nadie toque');
await captura(A, 'comunidad-cima');
await captura(B, 'comunidad-cima-telefono');

// ── reiniciar ──────────────────────────────────────────────────────
ok(!(await B.$('#cierre button:text("otra vez")')), 'solo el anfitrión puede reiniciar');
await A.click('#cierre button:text("otra vez")');
ok(await hasta(async () => (await Promise.all([A, B, Cc].map(estado))).every((e) => e.st?.f === 'espera' && e.st.x === 0), 4000),
  'el anfitrión reinicia y todos vuelven a la sala de espera');

// ── conexión que se corta ──────────────────────────────────────────
await A.click('#empezar');
await empezarATocar(B, 5);
await espera(800);
await B.ctx.setOffline(true);
await B.evaluate(() => window.dispatchEvent(new Event('offline')));
const sinSenal = await hasta(async () => /sin señal|reconectando|sin conexión/.test(await B.textContent('#conexion')), 9000);
ok(sinSenal, `sin red, la pantalla lo dice («${(await B.textContent('#conexion')).trim()}»)`);
const eB = await energia(B);
await espera(1000);
ok((await energia(B)).remotos === eB.remotos, 'sin red no se inventan impulsos');
await B.ctx.setOffline(false);
ok(await hasta(async () => /^sala /.test((await B.textContent('#conexion')).trim()), 20000), 'al volver la red, se reconecta solo');
await dejarDeTocar(B);

// ── movimiento reducido ────────────────────────────────────────────
const R = await dispositivo('reducido', { reducedMotion: 'reduce' });
await R.goto(url(`#comunidad/${codigo}`));
await hasta(async () => (await estado(R))?.st?.f === 'juego', 6000);
await empezarATocar(Cc, 6);
await empezarATocar(A, 6);
await espera(2500);
ok((await energia(R)).remotos > 5, 'con movimiento reducido los impulsos llegan igual (como cambio de forma)');
await captura(R, 'comunidad-reducido');
for (const p of [A, Cc]) await dejarDeTocar(p);

ok(errores.length === 0, `sin errores de JavaScript${errores.length ? ': ' + errores.join(' | ') : ''}`);
await navegador.close();
console.log(fallas ? `\n${fallas} fallas` : '\nTodo en orden.');
process.exit(fallas ? 1 : 0);
