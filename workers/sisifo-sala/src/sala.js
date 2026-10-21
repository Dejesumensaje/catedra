/* Durable Object: una instancia por sala. Adaptador fino entre WebSockets y
 * LogicaSala; toda decisión de juego vive en logica-sala.js.
 *
 * La sala solo simula mientras hay alguien conectado (un intervalo a COMUNIDAD.hz).
 * Lo único que se guarda en disco es que la sala existe y quién la creó; el
 * estado de la partida vive en memoria, igual que la partida misma. */

import { LogicaSala, idValido } from './logica-sala.js';
import { COMUNIDAD } from '../../../public/demos/sisifo/nucleo/parametros.js';

const VIDA_SALA = 6 * 60 * 60 * 1000;     // una sala sin uso se borra a las 6 h
const MAX_MENSAJES_SEG = 40;              // más que esto por socket se ignora

export class SalaSisifo {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.logica = null;
    this.sockets = new Map();            // id → WebSocket
    this.intervalo = null;
    ctx.blockConcurrencyWhile(async () => {
      const datos = await ctx.storage.get('sala');
      if (datos) this.logica = new LogicaSala(datos);
    });
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/crear') {
      if (this.logica) return new Response('existe', { status: 409 });
      const { codigo, anfitrion } = await request.json();
      const datos = { codigo, anfitrionInicial: idValido(anfitrion) ? anfitrion : null };
      await this.ctx.storage.put('sala', datos);
      await this.ctx.storage.setAlarm(Date.now() + VIDA_SALA);
      this.logica = new LogicaSala(datos);
      return new Response('creada', { status: 201 });
    }

    if (url.pathname === '/existe') {
      return new Response(null, { status: this.logica ? 200 : 404 });
    }

    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      const [cliente, servidor] = Object.values(pair);
      servidor.accept();
      this.conectar(servidor, url.searchParams.get('id'), url.searchParams.get('nombre'));
      return new Response(null, { status: 101, webSocket: cliente });
    }

    return new Response('no', { status: 404 });
  }

  conectar(ws, id, nombre) {
    const enviar = (m) => { try { ws.send(JSON.stringify(m)); } catch { /* cerrado */ } };
    if (!this.logica) { enviar({ t: 'error', motivo: 'no-existe' }); ws.close(4404, 'no existe'); return; }
    if (!idValido(id)) { enviar({ t: 'error', motivo: 'id' }); ws.close(4400, 'id'); return; }

    const ahora = Date.now();
    const r = this.logica.unir(id, nombre, ahora);
    if (r.error) { enviar({ t: 'error', motivo: r.error }); ws.close(4409, r.error); return; }

    // Si la misma persona abre otra pestaña o se reconecta, la conexión vieja sobra.
    const vieja = this.sockets.get(id);
    if (vieja && vieja !== ws) { try { vieja.close(4000, 'reemplazada'); } catch { /* ya cerrada */ } }
    this.sockets.set(id, ws);

    enviar({ t: 'hola', n: r.persona.n, codigo: this.logica.codigo });

    let ventana = ahora, cuenta = 0;
    ws.addEventListener('message', (ev) => {
      const t = Date.now();
      if (t - ventana > 1000) { ventana = t; cuenta = 0; }
      if (++cuenta > MAX_MENSAJES_SEG) return;
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      const respuesta = this.logica.mensaje(id, msg, t);
      if (respuesta) enviar(respuesta);
    });
    const cerrar = () => {
      if (this.sockets.get(id) !== ws) return;   // ya reemplazada
      this.sockets.delete(id);
      this.logica.soltar(id, Date.now());
    };
    ws.addEventListener('close', cerrar);
    ws.addEventListener('error', cerrar);
    this.arrancar();
  }

  arrancar() {
    if (this.intervalo) return;
    const dt = 1 / COMUNIDAD.hz;
    let antes = Date.now();
    this.intervalo = setInterval(() => {
      const ahora = Date.now();
      // Paso fijo: si el intervalo se atrasa, se recupera con varios pasos (máx. 5).
      let pasos = Math.min(5, Math.round((ahora - antes) / (dt * 1000)));
      antes += pasos * dt * 1000;
      if (ahora - antes > 1000) antes = ahora;
      let salida = { difundir: [], cerrar: [] };
      while (pasos-- > 0) {
        const r = this.logica.tick(dt, ahora);
        salida.cerrar.push(...r.cerrar);
        salida.difundir = mezclar(salida.difundir, r.difundir);
      }
      for (const id of salida.cerrar) {
        const ws = this.sockets.get(id);
        this.sockets.delete(id);
        try { ws?.close(4408, 'silencio'); } catch { /* ya cerrada */ }
      }
      if (salida.difundir.length) {
        const textos = salida.difundir.map((m) => JSON.stringify(m));
        for (const ws of this.sockets.values()) {
          for (const t of textos) { try { ws.send(t); } catch { /* se limpiará al cerrar */ } }
        }
      }
      if (this.sockets.size === 0 && this.logica.vacia()) {
        clearInterval(this.intervalo);
        this.intervalo = null;
      }
    }, 1000 / COMUNIDAD.hz);
  }

  async alarm() {
    if (this.sockets.size > 0) {
      await this.ctx.storage.setAlarm(Date.now() + VIDA_SALA);
      return;
    }
    await this.ctx.storage.deleteAll();
    this.logica = null;
  }
}

/* Si en un intervalo hubo varios pasos, basta con el último estado; los toques y
 * eventos de los pasos intermedios no se pierden. */
function mezclar(previos, nuevos) {
  const anterior = previos.find((m) => m.t === 'e');
  const actual = nuevos.find((m) => m.t === 'e');
  if (anterior && actual) actual.tq = [...anterior.tq, ...actual.tq];
  return [...previos.filter((m) => m.t !== 'e'), ...nuevos];
}
