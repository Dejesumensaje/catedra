/*
 * Durable Object «Mundo»: la autoridad de todos los cielos de COMETA.
 *
 * Hay un solo Mundo para todo el juego. Dentro viven todas las salas con la
 * lógica de server.ts (src/salas.ts, generado): entrar al cielo del enlace, o
 * al primero con 1 a 3 personas, o abrir uno nuevo. Un solo objeto basta para
 * el tamaño de una clase y evita repartir el emparejamiento entre objetos.
 *
 * Rutas (las mismas en producción, vía la Pages Function, y en local):
 *   GET /api/cometa/ws      → WebSocket del juego
 *   GET /api/cometa/salud   → { status, activeRooms, connectedClients }
 */
import { DurableObject } from 'cloudflare:workers';
import { alPersistir, cargarMemoria, estadoSalud, manejarConexion } from './salas';

const CLAVE_MEMORIA = 'memoria-cielo';

export class Mundo extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    // La memoria del cielo (cometas soltadas) sobrevive a reinicios y despliegues.
    ctx.blockConcurrencyWhile(async () => {
      cargarMemoria(await ctx.storage.get(CLAVE_MEMORIA));
    });
    alPersistir((store) => {
      ctx.storage.put(CLAVE_MEMORIA, store);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/cometa/salud') {
      return Response.json(estadoSalud(), { headers: { 'cache-control': 'no-store' } });
    }

    if (pathname !== '/api/cometa/ws') {
      return Response.json({ error: 'No existe.' }, { status: 404 });
    }
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return Response.json({ error: 'Se esperaba un WebSocket.' }, { status: 426 });
    }

    const { 0: cliente, 1: servidor } = new WebSocketPair();
    servidor.accept();
    manejarConexion(servidor);
    return new Response(null, { status: 101, webSocket: cliente });
  }
}
