/* Lógica de una sala de «La comunidad», sin nada de Cloudflare ni del navegador.
 * La usan el Durable Object (workers/sisifo-sala), la sala de prueba local
 * (red/local.js) y las pruebas en Node: una sola autoridad, tres lugares.
 *
 * Esta clase es la autoridad. Recibe toques, decide cuáles cuentan, simula la
 * roca con la regla compartida y produce los mensajes que se difunden. Los
 * navegadores no simulan nada: dibujan lo que esta clase dice.
 *
 * Identidad: cada persona trae un `id` efímero (sessionStorage) que solo ella y
 * el servidor conocen, y que sirve para reconectarse. A los demás se les muestra
 * únicamente su número de llegada `n` y un nombre opcional.
 */

import { ESFUERZO, COMUNIDAD } from './parametros.js';
import { crearEsfuerzo, tocar, decaer } from './esfuerzo.js';
import * as regla from './reglas/comunidad.js';

const P = COMUNIDAD;
const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;

export const limpiarNombre = (s) =>
  typeof s === 'string' ? s.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 18) : '';

export const idValido = (s) => typeof s === 'string' && /^[a-zA-Z0-9_-]{8,40}$/.test(s);

export class LogicaSala {
  constructor({ codigo, anfitrionInicial }) {
    this.codigo = codigo;
    this.anfitrionInicial = anfitrionInicial;
    this.anfitrion = null;        // id
    this.personas = new Map();    // id → persona
    this.siguienteN = 1;
    this.juego = regla.crear();
    this.toquesPendientes = [];   // [n, t] aceptados desde el último tick
    this.ultimosToques = new Map(); // n → t del último toque aceptado (para la coincidencia)
    this.rosterSucio = true;
  }

  /* ── personas ─────────────────────────────────────────────── */

  unir(id, nombre, ahora) {
    let p = this.personas.get(id);
    if (!p) {
      const conectadas = [...this.personas.values()].filter((x) => x.conectada).length;
      if (conectadas >= P.maxPersonas) return { error: 'llena' };
      p = { id, n: this.siguienteN++, nombre: '', es: crearEsfuerzo(), llegada: ahora };
      this.personas.set(id, p);
    }
    p.nombre = limpiarNombre(nombre) || p.nombre;
    p.conectada = true;
    p.visto = ahora;
    p.caidaDesde = null;
    p.es.e = 0;
    // Quien creó la sala la recupera siempre; si no, la primera persona que llega.
    if (!this.anfitrion || id === this.anfitrionInicial) this.anfitrion = id;
    this.rosterSucio = true;
    return { persona: p };
  }

  /** La conexión se cerró o calló. Su esfuerzo deja de contar en el acto. */
  soltar(id, ahora) {
    const p = this.personas.get(id);
    if (!p || !p.conectada) return;
    p.conectada = false;
    p.caidaDesde = ahora;
    p.es.e = 0;
    this.rosterSucio = true;
  }

  anfitrionConectado() {
    const a = this.personas.get(this.anfitrion);
    return !!(a && a.conectada);
  }

  conectadas() {
    return [...this.personas.values()].filter((p) => p.conectada);
  }

  /* ── mensajes de las personas ─────────────────────────────── */

  /** Devuelve una respuesta para esa persona, o null. */
  mensaje(id, msg, ahora) {
    const p = this.personas.get(id);
    if (!p || !p.conectada || !msg || typeof msg !== 'object') return null;
    p.visto = ahora;
    switch (msg.t) {
      case 'toque': {
        if (this.juego.fase !== 'juego') return null;
        if (tocar(p.es, ahora / 1000, ESFUERZO)) {
          regla.impulso(this.juego);
          this.toquesPendientes.push([p.n, ahora]);
          this.ultimosToques.set(p.n, ahora);
        }
        return null;
      }
      case 'empezar':
        if (id !== this.anfitrion) return { t: 'aviso', texto: 'solo-anfitrion' };
        if (this.juego.fase !== 'espera') return null;
        this.juego.fase = 'juego';
        this.juego.reloj = 0;
        this.rosterSucio = true;
        return null;
      case 'reiniciar':
        if (id !== this.anfitrion) return { t: 'aviso', texto: 'solo-anfitrion' };
        this.juego = regla.crear();
        for (const q of this.personas.values()) q.es.e = 0;
        this.ultimosToques.clear();
        this.rosterSucio = true;
        return null;
      case 'nombre':
        p.nombre = limpiarNombre(msg.nombre);
        this.rosterSucio = true;
        return null;
      case 'ping':
        return { t: 'pong', c: msg.c };
      default:
        return null;
    }
  }

  /* ── el paso del mundo ────────────────────────────────────── */

  /**
   * Avanza dt segundos. Devuelve { difundir: [mensajes], cerrar: [ids] }.
   * `cerrar` son las personas que callaron demasiado: el adaptador cierra su socket.
   */
  tick(dt, ahora) {
    const cerrar = [];
    for (const p of this.personas.values()) {
      if (p.conectada && ahora - p.visto > P.silencioMax * 1000) {
        this.soltar(p.id, ahora);
        cerrar.push(p.id);
      }
      if (!p.conectada && ahora - p.caidaDesde > P.graciaReconexion * 1000) {
        this.personas.delete(p.id);
        this.rosterSucio = true;
      }
    }
    // El anfitrionazgo pasa a quien lleva más tiempo, si el anfitrión no está.
    if (!this.anfitrionConectado()) {
      const a = this.personas.get(this.anfitrion);
      const ausente = !a || ahora - a.caidaDesde > 8000;
      const otra = this.conectadas().sort((x, y) => x.n - y.n)[0];
      if (ausente && otra && otra.id !== this.anfitrion) {
        this.anfitrion = otra.id;
        this.rosterSucio = true;
      }
    }

    const activas = this.conectadas();
    for (const p of activas) decaer(p.es, dt, ESFUERZO);
    const faseAntes = this.juego.fase;
    const eventos = regla.paso(this.juego, dt, { esfuerzos: activas.map((p) => p.es.e) });
    if (this.juego.fase !== faseAntes) this.rosterSucio = true;

    const difundir = [];
    if (this.rosterSucio) { difundir.push(this.roster()); this.rosterSucio = false; }
    difundir.push(this.estado(ahora, activas));
    for (const ev of eventos) difundir.push({ t: 'evento', e: ev });
    return { difundir, cerrar };
  }

  estado(ahora, activas = this.conectadas()) {
    const j = this.juego;
    const ventana = P.ventanaCoincidencia * 1000;
    let coincidencia = 0;
    for (const [n, t] of this.ultimosToques) {
      if (ahora - t <= ventana) coincidencia++;
      else this.ultimosToques.delete(n);
    }
    const toques = this.toquesPendientes.map(([n, t]) => [n, t - ahora]);
    this.toquesPendientes = [];
    return {
      t: 'e',
      f: j.fase,
      x: r3(j.roca.x),
      v: r3(j.roca.v),
      // energía: fuerza colectiva frente a la resistencia de la cuesta en ese punto (1 = equilibrio)
      en: r2(j.fase === 'juego' ? j.fuerza / regla.resistenciaEn(j) : 0),
      co: coincidencia,
      ac: activas.filter((p) => p.es.e > 0.05).length,
      es: activas.map((p) => [p.n, r2(Math.min(p.es.e, P.techoPersona))]),
      tq: toques,
    };
  }

  roster() {
    const a = this.personas.get(this.anfitrion);
    return {
      t: 'sala',
      codigo: this.codigo,
      fase: this.juego.fase,
      anfitrion: a ? a.n : null,
      personas: [...this.personas.values()]
        .sort((x, y) => x.n - y.n)
        .map((p) => ({ n: p.n, nombre: p.nombre, conectada: p.conectada })),
    };
  }

  vacia() {
    return this.conectadas().length === 0;
  }
}
