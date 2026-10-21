/* Prueba de las reglas de «Sísifo» (public/demos/sisifo/nucleo) y de la lógica
   de sala multijugador (public/demos/sisifo/nucleo/sala.js). Sin dependencias.

   Simula personas que tocan a distintos ritmos (con un poco de irregularidad,
   como una mano de verdad) y comprueba que cada regla hace lo que promete.
   Al final imprime la tabla de equilibrio de la comunidad.

   Uso: node scripts/prueba-sisifo-reglas.mjs            (pruebas + tabla)
        node scripts/prueba-sisifo-reglas.mjs --tabla    (solo la tabla) */

import { ESFUERZO, COMUNIDAD } from '../public/demos/sisifo/nucleo/parametros.js';
import { crearEsfuerzo, tocar, decaer } from '../public/demos/sisifo/nucleo/esfuerzo.js';
import { azar } from '../public/demos/sisifo/nucleo/fisica.js';
import * as castigo from '../public/demos/sisifo/nucleo/reglas/castigo.js';
import * as camino from '../public/demos/sisifo/nucleo/reglas/camino.js';
import * as caida from '../public/demos/sisifo/nucleo/reglas/caida.js';
import * as comunidad from '../public/demos/sisifo/nucleo/reglas/comunidad.js';

const soloTabla = process.argv.includes('--tabla');
let fallas = 0;
const ok = (cond, msg) => {
  if (soloTabla) return;
  if (cond) console.log('  ✓ ' + msg);
  else { fallas++; console.error('  ✗ ' + msg); }
};
const DT = 1 / 60;

/** Una mano que toca a `hz` veces por segundo, con ±20 % de irregularidad. */
function mano(hz, semilla = 1) {
  const r = azar(semilla);
  const es = crearEsfuerzo();
  let proximo = hz > 0 ? r() / hz : Infinity;
  return {
    es,
    golpes: 0,
    avanzar(t, dt) {
      decaer(es, dt, ESFUERZO);
      while (t >= proximo) {
        if (tocar(es, proximo, ESFUERZO)) this.golpes++;
        proximo += (1 / hz) * (0.8 + 0.4 * r());
      }
      return es.e;
    },
  };
}

function correr(regla, est, hz, segundos, alPaso) {
  const m = mano(hz);
  let t = 0;
  const eventos = [];
  for (; t < segundos; t += DT) {
    const antes = m.golpes;
    const e = m.avanzar(t, DT);
    if (m.golpes > antes && regla.impulso) regla.impulso(est);
    for (const ev of regla.paso(est, DT, { e: regla.aceptaToques(est) ? e : 0 })) eventos.push([ev, t]);
    if (alPaso && alPaso(est, t) === false) break;
  }
  return { eventos, t };
}

if (!soloTabla) {
  /* ── esfuerzo ─────────────────────────────────────────────── */
  console.log('Esfuerzo:');
  const medio = (hz) => {
    const m = mano(hz); let s = 0, n = 0;
    for (let t = 0; t < 30; t += DT) { const e = m.avanzar(t, DT); if (t > 5) { s += e; n++; } }
    return s / n;
  };
  const e2 = medio(2), e4 = medio(4), e6 = medio(6), e8 = medio(8), e30 = medio(30);
  console.log(`    medio a 2/4/6/8/30 toques/s: ${[e2, e4, e6, e8, e30].map((x) => x.toFixed(2)).join(' / ')}`);
  ok(e2 < e4 && e4 < e6 && e6 < e8, 'más frecuencia, más esfuerzo');
  ok(e30 - e8 < 0.1, 'tocar a 30/s apenas rinde más que a 8/s (límite de entrada)');

  /* ── 1 · castigo ──────────────────────────────────────────── */
  console.log('1 · El castigo:');
  {
    const est = castigo.crear();
    let max = 0;
    correr(castigo, est, 0, 20, (e) => { max = Math.max(max, e.roca.x); });
    ok(max < 0.01, 'sin toques la roca no sube');
  }
  {
    const est = castigo.crear();
    let max = 0;
    correr(castigo, est, 2, 60, (e) => { max = Math.max(max, e.roca.x); });
    ok(max < est.P.largo * 0.5, `a 2 toques/s no llega a la cima (máx ${max.toFixed(1)} m de ${est.P.largo})`);
  }
  const tiempoCima = {};
  for (const hz of [4, 5, 6, 8]) {
    const est = castigo.crear();
    const { eventos } = correr(castigo, est, hz, 400, (e) => e.ciclos < 3);
    const cimas = eventos.filter(([e]) => e === 'cima');
    const caidas = eventos.filter(([e]) => e === 'fondo');
    const vueltas = eventos.filter(([e]) => e === 'otra-vez');
    tiempoCima[hz] = cimas[0]?.[1];
    ok(cimas.length >= 3 && caidas.length >= 3 && vueltas.length >= 3,
      `a ${hz}/s: llega a la cima (${cimas[0]?.[1].toFixed(0)} s), cae, vuelve abajo; tres ciclos sin fin`);
    ok(cimas.every(([, t], i) => caidas[i] && caidas[i][1] > t), `a ${hz}/s: cada cima va seguida de una caída`);
  }
  ok(tiempoCima[4] > tiempoCima[6] && tiempoCima[6] > tiempoCima[8], 'más frecuencia, menos tiempo de subida');
  {
    const est = castigo.crear();
    let tSubida = null, tCae = null, tFondo = null;
    correr(castigo, est, 6, 200, (e, t) => {
      if (tSubida === null && e.fase === 'cima') tSubida = t;
      if (tCae === null && e.fase === 'cayendo') tCae = t;
      if (tCae !== null && tFondo === null && e.fase === 'bajando') { tFondo = t; return false; }
    });
    ok(tFondo - tCae < tSubida / 3, `la caída (${(tFondo - tCae).toFixed(1)} s) es mucho más rápida que la subida (${tSubida.toFixed(1)} s)`);
  }
  {
    // No hay salida: ninguna frecuencia produce otra cosa que cima → caída.
    const fases = new Set();
    for (const hz of [3, 5, 7, 9, 12, 20]) {
      const est = castigo.crear();
      correr(castigo, est, hz, 200, (e) => { fases.add(e.fase); });
    }
    ok([...fases].every((f) => ['empujando', 'cima', 'cayendo', 'bajando'].includes(f)), 'no existe un estado de victoria');
  }

  /* ── 2 · camino ───────────────────────────────────────────── */
  console.log('2 · El camino:');
  {
    const lejos = {};
    for (const hz of [2, 4, 6]) {
      const est = camino.crear(undefined, 11);
      correr(camino, est, hz, 120);
      lejos[hz] = est.roca.x;
    }
    console.log(`    metros en 2 min a 2/4/6 toques/s: ${lejos[2].toFixed(0)} / ${lejos[4].toFixed(0)} / ${lejos[6].toFixed(0)}`);
    ok(lejos[2] < lejos[4] && lejos[4] < lejos[6], 'más frecuencia, más avance');
    ok(lejos[2] > 3, 'aun despacio se avanza');
  }
  {
    const est = camino.crear(undefined, 3);
    const fases = new Set();
    correr(camino, est, 5, 3600, (e) => { fases.add(e.fase); });
    ok(fases.size === 1 && fases.has('empujando'), `una hora simulada (${est.roca.x.toFixed(0)} m) sin cima ni final`);
  }
  {
    // Parar no castiga: en cualquier punto del camino la roca se queda quieta.
    let retrocesos = 0;
    for (let s = 1; s <= 40; s++) {
      const est = camino.crear(undefined, s);
      correr(camino, est, 6, 20 + s);
      const x = est.roca.x;
      correr(camino, est, 0, 15);
      if (est.roca.x < x - 0.01) retrocesos++;
    }
    ok(retrocesos === 0, 'si dejas de empujar, la roca no retrocede (40 caminos)');
  }

  /* ── 3 · caída ────────────────────────────────────────────── */
  console.log('3 · La caída:');
  const caer = (hz) => {
    const est = caida.crear();
    let vmax = 0, quieta = 0;
    const { t } = correr(caida, est, hz, 600, (e) => {
      vmax = Math.max(vmax, -e.roca.v);
      if (e.fase === 'cayendo' && e.roca.v === 0) quieta += DT;
      return e.fase !== 'fondo';
    });
    return { t, vmax, quieta, fondo: est.fase === 'fondo' };
  };
  const sin = caer(0), poco = caer(3), mucho = caer(7);
  console.log(`    al fondo en: sin tocar ${sin.t.toFixed(1)} s · 3/s ${poco.t.toFixed(1)} s · 7/s ${mucho.t.toFixed(1)} s`);
  console.log(`    vel. máx.: ${sin.vmax.toFixed(2)} · ${poco.vmax.toFixed(2)} · ${mucho.vmax.toFixed(2)} m/s; quieta: ${mucho.quieta.toFixed(1)} s a 7/s`);
  ok(sin.fondo && sin.t < 10, 'sin hacer nada cae sola, sin pedir una acción');
  ok(poco.t > sin.t * 1.3 && mucho.t > poco.t, 'tocar retrasa la caída, más con más frecuencia');
  ok(mucho.vmax < sin.vmax * 0.85 && mucho.t > sin.t * 2.5, 'tocar reduce la velocidad máxima y la media');
  ok(mucho.quieta > 1, 'en las mesetas se puede sostener un momento');
  ok(mucho.fondo, 'aun tocando al máximo, termina en el fondo');
  {
    // Frenar nunca empuja hacia arriba.
    const est = caida.crear();
    let sube = false;
    correr(caida, est, 9, 200, (e) => { if (e.roca.v > 1e-9) sube = true; return e.fase !== 'fondo'; });
    ok(!sube, 'el freno nunca devuelve la roca cuesta arriba');
  }
}

/* ── 4 · comunidad: tabla de equilibrio ─────────────────────── */
function partida(ritmos, segundos = 300) {
  const est = comunidad.crear();
  est.fase = 'juego';
  const manos = ritmos.map((hz, i) => mano(hz, 100 + i));
  let t = 0, max = 0;
  for (; t < segundos && est.fase === 'juego'; t += DT) {
    const antes = manos.map((m) => m.golpes);
    const esf = manos.map((m) => m.avanzar(t, DT));
    manos.forEach((m, i) => { for (let k = antes[i]; k < m.golpes; k++) comunidad.impulso(est); });
    comunidad.paso(est, DT, { esfuerzos: esf });
    max = Math.max(max, est.roca.x);
  }
  return { cima: est.fase === 'cima', t, max: max / COMUNIDAD.largo };
}

const RITMOS = [2, 3, 4, 6, 8, 15];
console.log('\n4 · La comunidad — en 5 min: «t s» = llegan a la cima; «nn %» = altura máxima');
console.log('personas │ ' + RITMOS.map((r) => `${r}/s`.padStart(7)).join(' '));
const tabla = {};
for (let n = 1; n <= 6; n++) {
  const fila = RITMOS.map((hz) => {
    const r = partida(Array(n).fill(hz));
    tabla[`${n}@${hz}`] = r;
    return (r.cima ? `${r.t.toFixed(0)} s` : `${(r.max * 100).toFixed(0)} %`).padStart(7);
  });
  console.log(`   ${n}     │ ${fila.join(' ')}`);
}
const mezcla = partida([6, 3, 2, 0]);
console.log(`   mezcla 6/3/2/0 toques/s: ${mezcla.cima ? mezcla.t.toFixed(0) + ' s' : (mezcla.max * 100).toFixed(0) + ' %'}`);

if (!soloTabla) {
  console.log('Comunidad:');
  ok(!tabla['1@15'].cima && tabla['1@15'].max < 0.5, `una persona, aun a 15/s, no pasa de la mitad (${(tabla['1@15'].max * 100).toFixed(0)} %)`);
  ok(tabla['1@4'].max > 0.05, 'una persona sola sí mueve la roca: su esfuerzo se nota');
  ok(tabla['3@4'].cima && tabla['3@4'].t < 180, `tres personas a 4/s llegan (${tabla['3@4'].t.toFixed(0)} s)`);
  ok(!tabla['2@4'].cima, 'dos personas a ritmo cómodo no llegan');
  ok(tabla['4@3'].cima, 'cuatro personas a 3/s llegan: no hace falta tocar rápido');
  ok(tabla['4@4'].t < tabla['3@4'].t, 'más personas, menos tiempo');
  {
    // Si el grupo deja de aportar, la roca retrocede.
    const est = comunidad.crear(); est.fase = 'juego';
    const manos = [mano(5, 1), mano(5, 2), mano(5, 3)];
    let t = 0;
    for (; t < 20; t += DT) comunidad.paso(est, DT, { esfuerzos: manos.map((m) => m.avanzar(t, DT)) });
    const x = est.roca.x;
    for (let k = 0; k < 600; k++) comunidad.paso(est, DT, { esfuerzos: [] });
    ok(est.roca.x < x - 0.5, 'sin aporte, la roca retrocede');
  }
  {
    // Techo por persona: un dispositivo que reporte esfuerzos absurdos no domina.
    const f1 = comunidad.fuerzaColectiva([50]);
    const f3 = comunidad.fuerzaColectiva([0.6, 0.6, 0.6]);
    ok(f1 < f3, 'una sola persona con esfuerzo inflado aporta menos que tres normales');
  }
  {
    const est = comunidad.crear(); est.fase = 'juego';
    const manos = [mano(6, 1), mano(6, 2), mano(6, 3), mano(6, 4)];
    let t = 0;
    for (; t < 300 && est.fase === 'juego'; t += DT) comunidad.paso(est, DT, { esfuerzos: manos.map((m) => m.avanzar(t, DT)) });
    for (let k = 0; k < 600; k++) comunidad.paso(est, DT, { esfuerzos: [] });
    ok(est.fase === 'cima' && est.roca.x === COMUNIDAD.largo, 'en la cima la roca se queda arriba, aunque nadie toque');
  }
}

/* ── lógica de sala ─────────────────────────────────────────── */
if (!soloTabla) {
  const { pruebasSala } = await import('./prueba-sisifo-sala-logica.mjs');
  await pruebasSala(ok);
  console.log(fallas ? `\n${fallas} fallas` : '\nTodo en orden.');
  process.exit(fallas ? 1 : 0);
}
