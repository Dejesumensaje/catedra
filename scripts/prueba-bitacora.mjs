// Prueba de aceptación del ejercicio de bitácoras (sesión 2).
//
// Recorre el ejercicio completo en un navegador de verdad: llenar el momento 1
// en un teléfono, comprobar que el momento 2 precarga esas mismas etiquetas,
// clasificarlas, y proyectar el tablero. Cubre también los caminos que
// importan cuando algo sale mal en el salón: alguien que responde desde otro
// dispositivo, alguien que no hizo el momento 1, y alguien que se equivoca de
// nombre y lo corrige.
//
// Playwright no es dependencia del repositorio —el sitio no lo necesita para
// nada— así que se instala aparte cuando se vaya a correr:
//
//   npm run build
//   npx wrangler pages dev dist --kv BITACORA --binding CLAVE_DOCENTE=prueba
//   mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright
//   node <ruta>/scripts/prueba-bitacora.mjs /tmp/tomas
//
// El argumento es la carpeta donde deja las capturas.
import { createRequire } from 'node:module';

// Playwright se busca desde donde se corre el comando y no desde esta carpeta:
// así puede vivir fuera del repositorio y `package.json` se queda como está.
const exigir = createRequire(process.cwd() + '/');
const { chromium } = exigir('playwright');
const BASE = 'http://127.0.0.1:8788';
const OUT = process.argv[2];
const ok = [], mal = [];
const check = (c, m) => (c ? ok : mal).push(m);

const navegador = await chromium.launch();
// Un teléfono: así se va a llenar esto de verdad.
const tel = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await tel.newPage();
p.on('pageerror', e => mal.push('error de JS: ' + e.message));

// ── 1. momento 1 ──────────────────────────────────────────────
await p.goto(BASE + '/pensamiento-sensorial/bitacora');
check(!(await p.content()).match(/affordance|significante|mapping/i), 'm1 sin vocabulario técnico');
await p.selectOption('#estudiante', 'ana-m');

const experiencias = [
  ['confianza',   'el torniquete del metro', 'Puse la tarjeta y abrió de una. Ni lo pensé.', 'tranquila'],
  ['duda',        'la app del banco',        'No supe si ya había pagado. Se quedó cargando y no dijo nada.', 'insegura'],
  ['frustracion', 'la estufa de la casa',    'Prendí la hornilla equivocada tres veces seguidas.', 'rabia'],
];
for (const [tipo, etiqueta, relato, emocion] of experiencias) {
  await p.fill(`#etiqueta-${tipo}`, etiqueta);
  await p.fill(`#relato-${tipo}`, relato);
  await p.fill(`#emocion-${tipo}`, emocion);
}
await p.screenshot({ path: `${OUT}/1-m1-telefono.png`, fullPage: true });

// falta algo → no debe enviar
await p.fill('#emocion-frustracion', '');
await p.click('#enviar');
check((await p.textContent('#estado')).includes('Falta'), 'm1 avisa cuando falta un campo');
await p.fill('#emocion-frustracion', 'rabia');

await p.click('#enviar');
await p.waitForSelector('#gracias:not([hidden])', { timeout: 5000 });
check(true, 'm1 confirma el envío');
await p.screenshot({ path: `${OUT}/2-m1-confirmado.png` });

// ── 2. momento 2, mismo teléfono ──────────────────────────────
await p.goto(BASE + '/pensamiento-sensorial/bitacora-otra-vez');
await p.waitForSelector('#form-bitacora:not([hidden])', { timeout: 5000 });
check(await p.inputValue('#estudiante') === 'ana-m', 'm2 recuerda el nombre elegido');

const precargadas = await p.$$eval('.experiencia-titulo', e => e.map(x => x.textContent.trim()));
const esperadas = experiencias.map(e => e[1]);
check(JSON.stringify(precargadas) === JSON.stringify(esperadas),
      'm2 precarga las 3 etiquetas del m1: ' + JSON.stringify(precargadas));
check((await p.textContent('#aviso-carga')).includes('Estas son las tuyas'), 'm2 lo dice en pantalla');
const manualesOcultos = await p.$$eval('[data-campo="etiqueta-manual"]', e => e.every(x => x.hidden));
check(manualesOcultos, 'm2 no pide reescribir la etiqueta cuando la precargó');
await p.screenshot({ path: `${OUT}/3-m2-precargado.png`, fullPage: true });

for (const [tipo] of experiencias) {
  await p.check(`input[name="categoria-${tipo}"][value="retroalimentacion"]`);
  await p.check(`input[name="cuando-${tipo}"][value="despues"]`);
  await p.check(`input[name="culpa-${tipo}"][value="diseno"]`);
}
await p.screenshot({ path: `${OUT}/4-m2-marcado.png`, fullPage: true });
await p.click('#enviar');
await p.waitForSelector('#gracias:not([hidden])', { timeout: 5000 });
check(true, 'm2 confirma el envío');

// ── 3. degradación: alguien que no hizo el m1, en otro teléfono ─
const otro = await navegador.newContext({ viewport: { width: 390, height: 844 } });
const q = await otro.newPage();
await q.goto(BASE + '/pensamiento-sensorial/bitacora-otra-vez');
await q.selectOption('#estudiante', 'valentina-l');
await q.waitForSelector('#form-bitacora:not([hidden])', { timeout: 5000 });
const desdeApi = await q.$$eval('.experiencia-titulo', e => e.map(x => x.textContent.trim()));
check(desdeApi.filter(Boolean).length === 3, 'm2 en otro teléfono precarga desde la API: ' + JSON.stringify(desdeApi));

// deja marcada una respuesta antes de cambiar de nombre
await q.check('input[name="culpa-confianza"][value="mia"]');
await q.selectOption('#estudiante', 'no-estoy-en-la-lista');
await q.waitForTimeout(600);
const manuales = await q.$$eval('[data-campo="etiqueta-manual"]', e => e.filter(x => !x.hidden).length);
const arrastradas = await q.$$eval('[data-campo="etiqueta"]', e => e.map(x => x.value).filter(Boolean));
check(arrastradas.length === 0, 'al cambiar de nombre no arrastra las etiquetas del anterior' +
      (arrastradas.length ? ': ' + JSON.stringify(arrastradas) : ''));
const marcaVieja = await q.$$eval('input[type=radio]:checked', e => e.length);
check(marcaVieja === 0, 'al cambiar de nombre no arrastra las respuestas marcadas');
check(manuales === 3, 'sin m1 previo, deja escribir las 3 etiquetas a mano');
check((await q.textContent('#aviso-carga')).includes('No encontré'), 'y lo explica');
await q.screenshot({ path: `${OUT}/5-m2-sin-precarga.png`, fullPage: true });
await otro.close();

// ── 4. tablero, proyectado ────────────────────────────────────
const proyector = await navegador.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const t = await proyector.newPage();
t.on('pageerror', e => mal.push('error de JS en el tablero: ' + e.message));
await t.goto(BASE + '/pensamiento-sensorial/bitacora-resultados');
await t.fill('#clave', 'malaclave');
await t.click('button[type=submit]');
await t.waitForTimeout(800);
check((await t.textContent('#estado')).includes('Esa no es'), 'el tablero rechaza la clave mala');

await t.fill('#clave', 'prueba');
await t.click('button[type=submit]');
await t.waitForSelector('#tablero:not([hidden])', { timeout: 5000 });
const cifras = await t.$$eval('.cifra', e => e.map(x => x.textContent));
check(cifras.join('/') === '7/6/6', 'contador: ' + cifras.join(' · ') + ' (llegaron/salieron/ambas)');
check((await t.textContent('#nota-cobertura')).includes('no al salir'), 'degrada con gracia: avisa quién falta');
const filas = await t.$$eval('#pares .par', e => e.length);
check(filas === 18, 'emparejamiento: ' + filas + ' filas (6 estudiantes × 3)');
await t.screenshot({ path: `${OUT}/6-tablero.png`, fullPage: true });

// refrescar debe volver a cargar sin pedir la clave
await t.reload();
await t.waitForSelector('#tablero:not([hidden])', { timeout: 5000 });
check(true, 'al refrescar no vuelve a pedir la clave');

await navegador.close();
console.log('\n' + ok.map(m => '  ok   ' + m).join('\n'));
if (mal.length) console.log('\n' + mal.map(m => '  MAL  ' + m).join('\n'));
console.log(`\n${ok.length} pasan, ${mal.length} fallan`);
process.exit(mal.length ? 1 : 0);
