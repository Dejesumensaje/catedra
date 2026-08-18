// Estrenos con fecha.
//
// Ciertas rutas públicas (hoy: el deck de la sesión) se suben antes de tiempo
// pero no deben ser visibles para los estudiantes hasta una fecha y hora. El
// middleware bloquea esas rutas hasta `abre`; el docente entra con
// ?clave=CLAVE_DOCENTE una vez y sigue navegando con una cookie (los assets
// relativos del deck no arrastran el query param).
//
// Para estrenar otra ruta: agregar una entrada a ESTRENOS y hacer push.
// Pasada la fecha la entrada queda inerte; se puede borrar en el próximo
// ritual semanal.

const ESTRENOS = [
  // jueves 20 de agosto de 2026, 3:00 p.m. hora de Colombia (UTC-5, sin DST)
  { ruta: '/presentaciones/ps3/s03', abre: '2026-08-20T15:00:00-05:00' },
  { ruta: '/pensamiento-sensorial/imagen-del-sistema', abre: '2026-08-20T15:00:00-05:00' },
  { ruta: '/pensamiento-sensorial/que-estamos-suponiendo', abre: '2026-08-20T15:00:00-05:00' },
];

const COOKIE = 'catedra_docente';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // una semana

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const estreno = ESTRENOS.find((e) => url.pathname.startsWith(e.ruta));

  if (!estreno || Date.now() >= Date.parse(estreno.abre)) {
    return context.next();
  }

  const clave = context.env.CLAVE_DOCENTE;
  const esperada = clave ? `${COOKIE}=${encodeURIComponent(clave)}` : null;
  const conCookie =
    esperada &&
    (context.request.headers.get('Cookie') || '')
      .split(';')
      .some((c) => c.trim() === esperada);
  const conParam = esperada && url.searchParams.get('clave') === clave;

  if (conCookie || conParam) {
    const resp = await context.next();
    const pasa = new Response(resp.body, resp);
    // Que el edge no guarde una copia obtenida con credencial.
    pasa.headers.set('Cache-Control', 'private, no-store');
    if (conParam) {
      pasa.headers.set(
        'Set-Cookie',
        `${esperada}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`
      );
    }
    return pasa;
  }

  return new Response(paginaBloqueo(estreno.abre), {
    status: 403,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function fechaLegible(iso) {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

function paginaBloqueo(abre) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Aún no está disponible — Pensamiento Sensorial 3.0</title>
<style>
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #ffffff; color: #222222;
    font-family: Roboto, system-ui, sans-serif; line-height: 1.5;
  }
  main { max-width: 34rem; padding: 2rem; }
  .mono {
    font-size: .8rem; letter-spacing: .08em; text-transform: uppercase;
    color: #6f6f6f; margin: 0 0 1rem;
  }
  h1 { font-size: 1.5rem; margin: 0 0 1rem; }
  mark { background: #eeff41; padding: 0 .2em; }
  a { color: #222222; }
</style>
</head>
<body>
<main>
  <p class="mono">Pensamiento Sensorial 3.0</p>
  <h1>Esta presentación aún no está disponible.</h1>
  <p>Se publica el <mark>${fechaLegible(abre)}</mark>, hora de Colombia.</p>
  <p><a href="/pensamiento-sensorial">Volver al programa del curso</a></p>
</main>
</body>
</html>`;
}
