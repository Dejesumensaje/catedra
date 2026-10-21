/* Pruebas de la lógica de sala (sin red). Las llama prueba-sisifo-reglas.mjs. */

import { LogicaSala } from '../workers/sisifo-sala/src/logica-sala.js';
import { COMUNIDAD } from '../public/demos/sisifo/nucleo/parametros.js';

export async function pruebasSala(ok) {
  console.log('Sala multijugador (lógica):');
  const DT = 1 / COMUNIDAD.hz;
  let ahora = 1_000_000;
  const sala = new LogicaSala({ codigo: 'ACDE', anfitrionInicial: 'anfitrion-1' });
  const correr = (seg, tocan = [], hz = 5) => {
    const salidas = [];
    const cada = Math.round(COMUNIDAD.hz / hz);
    for (let i = 0; i < seg * COMUNIDAD.hz; i++) {
      ahora += DT * 1000;
      if (i % cada === 0) for (const id of tocan) sala.mensaje(id, { t: 'toque' }, ahora);
      for (const id of sala.personas.keys()) if (sala.personas.get(id).conectada) sala.mensaje(id, { t: 'ping' }, ahora);
      salidas.push(sala.tick(DT, ahora));
    }
    return salidas;
  };
  const ultimo = (salidas, t) => salidas.flatMap((s) => s.difundir).filter((m) => m.t === t).at(-1);

  sala.unir('persona-b-22', 'Bea', ahora);
  sala.unir('anfitrion-1', 'Ana', ahora);
  const a = sala.personas.get('anfitrion-1');
  ok(sala.anfitrion === 'anfitrion-1', 'quien crea la sala es anfitrión aunque llegue segundo');
  ok(sala.mensaje('persona-b-22', { t: 'empezar' }, ahora)?.texto === 'solo-anfitrion', 'solo el anfitrión empieza');
  ok(sala.juego.fase === 'espera', 'antes de empezar, la roca espera');
  correr(1, ['persona-b-22']);
  ok(sala.juego.roca.x === 0, 'en la sala de espera los toques no mueven la roca');
  sala.unir('persona-c-33', 'Cata', ahora);
  ok(ultimo(correr(0.1), 'sala').personas.length === 3, 'se puede entrar durante la espera');

  sala.mensaje('anfitrion-1', { t: 'empezar' }, ahora);
  ok(sala.juego.fase === 'juego', 'el anfitrión empieza la partida');

  // Una sola persona: sube algo y se estanca.
  let s = correr(20, ['anfitrion-1'], 5);
  const xSola = sala.juego.roca.x;
  ok(xSola > 0.3 && xSola < COMUNIDAD.largo * 0.45, `una persona mueve la roca, pero se estanca (${xSola.toFixed(1)} m)`);
  const est = ultimo(s, 'e');
  ok(est.tq.length >= 0 && est.es.length === 3, 'el estado difunde el esfuerzo de cada persona conectada');
  ok(s.flatMap((x) => x.difundir).filter((m) => m.t === 'e').some((m) => m.tq.length > 0), 'los toques aceptados se difunden como impulsos');

  // Spam: 60 toques en un mismo instante cuentan como uno.
  const antes = a.es.e;
  for (let i = 0; i < 60; i++) sala.mensaje('anfitrion-1', { t: 'toque' }, ahora);
  ok(a.es.e - antes < 0.36, 'un dispositivo que envía 60 toques de golpe aporta como uno');
  ok(sala.toquesPendientes.length <= 1, 'los toques rechazados no se difunden');

  // Tres personas: llegan.
  s = correr(150, ['anfitrion-1', 'persona-b-22', 'persona-c-33'], 5);
  ok(sala.juego.fase === 'cima', 'tres personas a 5 toques/s llegan a la cima');
  ok(s.flatMap((x) => x.difundir).some((m) => m.t === 'evento' && m.e === 'cima'), 'se difunde el evento de cima');
  ok(s.flatMap((x) => x.difundir).filter((m) => m.t === 'e').some((m) => m.co >= 3), 'la coincidencia cuenta personas distintas tocando a la vez');
  correr(10);
  ok(sala.juego.fase === 'cima' && sala.juego.roca.x === COMUNIDAD.largo, 'la roca se queda arriba');

  // Reiniciar.
  sala.mensaje('anfitrion-1', { t: 'reiniciar' }, ahora);
  ok(sala.juego.fase === 'espera' && sala.juego.roca.x === 0, 'el anfitrión reinicia la sala');

  // Desconexión durante la partida.
  sala.mensaje('anfitrion-1', { t: 'empezar' }, ahora);
  correr(3, ['anfitrion-1', 'persona-b-22', 'persona-c-33']);
  sala.soltar('persona-c-33', ahora);
  ok(sala.personas.get('persona-c-33').es.e === 0, 'quien se desconecta deja de aportar en el acto');
  const st = ultimo(correr(1, ['anfitrion-1', 'persona-b-22']), 'e');
  ok(st.es.length === 2 && sala.juego.fase === 'juego', 'la partida sigue con quienes quedan');
  sala.unir('persona-c-33', '', ahora);
  ok(sala.personas.get('persona-c-33').n === 3 && sala.personas.get('persona-c-33').nombre === 'Cata', 'quien vuelve recupera su lugar y su nombre');

  // Silencio: sin pings, se la desconecta.
  const muda = new LogicaSala({ codigo: 'FHJK', anfitrionInicial: 'x-anfitrion' });
  muda.unir('x-anfitrion', '', ahora);
  muda.unir('y-persona-1', '', ahora);
  let cerrar = [];
  for (let i = 0; i < (COMUNIDAD.silencioMax + 1) * COMUNIDAD.hz; i++) {
    ahora += DT * 1000;
    muda.mensaje('y-persona-1', { t: 'ping' }, ahora);
    cerrar.push(...muda.tick(DT, ahora).cerrar);
  }
  ok(cerrar.includes('x-anfitrion') && !cerrar.includes('y-persona-1'), 'quien calla más de unos segundos se desconecta');
  for (let i = 0; i < 9 * COMUNIDAD.hz; i++) { ahora += DT * 1000; muda.mensaje('y-persona-1', { t: 'ping' }, ahora); muda.tick(DT, ahora); }
  ok(muda.anfitrion === 'y-persona-1', 'si el anfitrión se va, el anfitrionazgo pasa a otra persona');
  for (let i = 0; i < (COMUNIDAD.graciaReconexion + 1) * COMUNIDAD.hz; i++) { ahora += DT * 1000; muda.mensaje('y-persona-1', { t: 'ping' }, ahora); muda.tick(DT, ahora); }
  ok(!muda.personas.has('x-anfitrion'), 'pasada la gracia, quien se fue sale de la sala');

  ok(sala.roster().personas.every((p) => !('id' in p)), 'el id privado nunca se difunde');
}
