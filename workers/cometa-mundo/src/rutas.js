/* Reenvío de /api/cometa/* al único Durable Object «Mundo». Lo comparten el
 * Worker (para probar en local) y la Pages Function del sitio
 * (functions/api/cometa), que es lo que se usa en producción. */

export function reenviar(request, mundo) {
  if (!mundo) {
    return new Response(JSON.stringify({ error: 'El servidor de salas no está configurado.' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  return mundo.get(mundo.idFromName('mundo')).fetch(request);
}
