/* Rutas HTTP de las salas. Las comparten el Worker (para probar en local con
 * `wrangler dev`) y la Pages Function del sitio (functions/api/sisifo), que es
 * lo que se usa en producción: mismo origen que el juego.
 *
 *   POST /api/sisifo/salas              → { codigo }          crea una sala
 *   GET  /api/sisifo/salas/ABCD         → { existe }          ¿hay sala con ese código?
 *   GET  /api/sisifo/salas/ABCD/ws?id=… → WebSocket           entrar a la sala
 */

// Sin letras que se confundan al dictarlas o leerlas (B/8, G/6, I/1, L, O/0, Q, S/5, Z/2).
const ALFABETO = 'ACDEFHJKMNPRTUVWXY';
export const codigoValido = (c) => typeof c === 'string' && new RegExp(`^[${ALFABETO}]{4}$`).test(c);

const nuevoCodigo = () => {
  const b = crypto.getRandomValues(new Uint8Array(4));
  return [...b].map((x) => ALFABETO[x % ALFABETO.length]).join('');
};

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...CORS },
  });

export async function manejar(request, salas) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (!salas) return json({ error: 'El servidor de salas no está configurado.' }, 503);

  const m = url.pathname.match(/^\/api\/sisifo\/salas(?:\/([A-Za-z]{4})(\/ws)?)?\/?$/);
  if (!m) return json({ error: 'No existe.' }, 404);
  const codigo = m[1]?.toUpperCase();

  if (!codigo) {
    if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
    let cuerpo = {};
    try { cuerpo = await request.json(); } catch { /* sin cuerpo */ }
    for (let intento = 0; intento < 6; intento++) {
      const c = nuevoCodigo();
      const r = await salas.get(salas.idFromName(c)).fetch('https://sala/crear', {
        method: 'POST',
        body: JSON.stringify({ codigo: c, anfitrion: cuerpo.anfitrion }),
      });
      if (r.status === 201) return json({ codigo: c }, 201);
      if (r.status !== 409) return json({ error: 'No se pudo crear la sala.' }, 502);
    }
    return json({ error: 'No hay códigos libres; prueba otra vez.' }, 503);
  }

  if (!codigoValido(codigo)) return json({ error: 'Código inválido.' }, 400);
  const sala = salas.get(salas.idFromName(codigo));

  if (m[2]) {
    if (request.headers.get('Upgrade') !== 'websocket') return json({ error: 'Se esperaba un WebSocket.' }, 426);
    return sala.fetch(new Request(`https://sala/ws${url.search}`, request));
  }
  const r = await sala.fetch('https://sala/existe');
  return json({ existe: r.status === 200 });
}
