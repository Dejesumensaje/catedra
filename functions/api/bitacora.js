/**
 * Pages Function — recibe y devuelve las bitácoras de la sesión 2.
 *
 * Vive en `functions/` y no en `src/`: Cloudflare Pages recoge esta carpeta
 * aparte del build de Astro, así que el sitio sigue siendo 100% estático
 * (sin adapter, sin SSR) y esto es lo único que corre en el edge.
 *
 * Configuración en el panel de Cloudflare Pages → Settings:
 *   - Bindings → KV namespace:  BITACORA  →  (el namespace que crees)
 *   - Environment variables:    CLAVE_DOCENTE = la que quieras (solo tú)
 *                               CLAVE_CLASE   = opcional; si falta, udea2026
 *
 * Sin el binding KV nada se guarda y el endpoint responde 503 con un mensaje
 * legible, para que el formulario pueda decirle al estudiante que su respuesta
 * quedó en el teléfono y hay que reintentar.
 *
 * Qué se expone y a quién:
 *   - POST                → guarda; pide la clave de clase.
 *   - GET de un estudiante → devuelve SOLO etiqueta y tipo. Nunca el relato.
 *     Es lo mínimo que el momento 2 necesita para precargar, y así la clave de
 *     clase no alcanza para leerle el relato a un compañero.
 *   - GET completo         → todo, incluidos los relatos. Pide CLAVE_DOCENTE.
 */

const LIMITES = {
  entradas: 5,
  etiqueta: 80,
  relato: 2000,
  emocion: 40,
  estudiante: 64,
};

const TIPOS = ['confianza', 'duda', 'frustracion'];
const CATEGORIAS = ['affordance', 'significante', 'restriccion', 'mapping', 'retroalimentacion'];
const CUANDOS = ['antes', 'durante', 'despues'];
const ATRIBUCIONES = ['mia', 'diseno', 'no-se'];

const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Nada de esto se guarda en caché: son respuestas de clase, en vivo.
      'cache-control': 'no-store',
    },
  });

const claveClase = (env) => env.CLAVE_CLASE || 'udea2026';

/** Recorta y limpia. Devuelve '' si no es texto. */
const texto = (valor, max) =>
  typeof valor === 'string' ? valor.trim().slice(0, max) : '';

/** Un id de sesión con forma de id de sesión, para no dejar escribir cualquier llave. */
const sesionValida = (s) => typeof s === 'string' && /^[a-z0-9-]{3,32}$/.test(s);

const estudianteValido = (e) =>
  typeof e === 'string' && /^[a-z0-9-]{1,64}$/.test(e) && e.length <= LIMITES.estudiante;

const kv = (env) => env.BITACORA;

// ── guardar ────────────────────────────────────────────────────────────────
export async function onRequestPost({ request, env }) {
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: 'Cuerpo ilegible.' }, 400);
  }

  if (cuerpo?.clave !== claveClase(env)) {
    return json({ error: 'Clave incorrecta.' }, 401);
  }

  const { sesion, momento, estudiante } = cuerpo || {};

  if (!sesionValida(sesion)) return json({ error: 'Sesión inválida.' }, 400);
  if (momento !== 1 && momento !== 2) return json({ error: 'Momento inválido.' }, 400);
  if (!estudianteValido(estudiante)) return json({ error: 'Estudiante inválido.' }, 400);

  const entradasCrudas = Array.isArray(cuerpo.entradas) ? cuerpo.entradas : [];
  if (entradasCrudas.length === 0) return json({ error: 'Sin entradas.' }, 400);
  if (entradasCrudas.length > LIMITES.entradas) return json({ error: 'Demasiadas entradas.' }, 400);

  // Se reconstruye entrada por entrada en vez de guardar lo que llegó: así el
  // que se ponga creativo con el fetch no mete campos que el dashboard no
  // espera, ni relatos de 4 MB.
  const entradas = entradasCrudas.map((e) => {
    const base = {
      etiqueta: texto(e?.etiqueta, LIMITES.etiqueta),
      tipo: TIPOS.includes(e?.tipo) ? e.tipo : null,
    };
    if (momento === 1) {
      return {
        ...base,
        relato: texto(e?.relato, LIMITES.relato),
        emocion: texto(e?.emocion, LIMITES.emocion).toLowerCase(),
      };
    }
    return {
      ...base,
      categoria: CATEGORIAS.includes(e?.categoria) ? e.categoria : null,
      cuando: CUANDOS.includes(e?.cuando) ? e.cuando : null,
      atribucion: ATRIBUCIONES.includes(e?.atribucion) ? e.atribucion : null,
    };
  });

  if (entradas.some((e) => !e.etiqueta)) {
    return json({ error: 'Cada experiencia necesita un nombre corto.' }, 400);
  }

  const almacen = kv(env);
  if (!almacen) {
    return json(
      { error: 'El almacenamiento no está configurado (falta el binding KV BITACORA).' },
      503,
    );
  }

  const registro = {
    estudiante,
    momento,
    entradas,
    timestamp: new Date().toISOString(),
  };

  // Una sola llave por (sesión, momento, estudiante): reenviar el formulario
  // corrige la respuesta en vez de duplicarla. En una clase donde alguien va a
  // tocar «enviar» dos veces, eso es lo que se quiere.
  await almacen.put(`${sesion}:m${momento}:${estudiante}`, JSON.stringify(registro));

  return json({ ok: true, guardado: registro.timestamp });
}

// ── leer ───────────────────────────────────────────────────────────────────
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sesion = url.searchParams.get('sesion');
  const clave = url.searchParams.get('clave');

  if (!sesionValida(sesion)) return json({ error: 'Sesión inválida.' }, 400);

  const almacen = kv(env);
  if (!almacen) {
    return json(
      { error: 'El almacenamiento no está configurado (falta el binding KV BITACORA).' },
      503,
    );
  }

  // ── volcado completo: solo el docente ──
  if (url.searchParams.get('todo') === '1') {
    if (!env.CLAVE_DOCENTE) {
      return json({ error: 'Falta configurar CLAVE_DOCENTE.' }, 503);
    }
    if (clave !== env.CLAVE_DOCENTE) {
      return json({ error: 'Clave incorrecta.' }, 401);
    }

    const registros = { m1: [], m2: [] };
    // Con ~30 estudiantes por sesión el list de una página sobra; el cursor
    // está por si alguna vez esto crece o quedan llaves de varias corridas.
    let cursor;
    do {
      const pagina = await almacen.list({ prefix: `${sesion}:`, cursor });
      for (const llave of pagina.keys) {
        const crudo = await almacen.get(llave.name);
        if (!crudo) continue;
        try {
          const registro = JSON.parse(crudo);
          if (registro.momento === 1) registros.m1.push(registro);
          else if (registro.momento === 2) registros.m2.push(registro);
        } catch {
          // Una llave corrupta no puede tumbar la proyección en clase.
        }
      }
      cursor = pagina.list_complete ? undefined : pagina.cursor;
    } while (cursor);

    return json({ sesion, ...registros });
  }

  // ── precarga del momento 2: solo etiqueta y tipo ──
  if (clave !== claveClase(env)) return json({ error: 'Clave incorrecta.' }, 401);

  const estudiante = url.searchParams.get('estudiante');
  if (!estudianteValido(estudiante)) return json({ error: 'Estudiante inválido.' }, 400);

  const crudo = await almacen.get(`${sesion}:m1:${estudiante}`);
  if (!crudo) return json({ entradas: [] });

  try {
    const registro = JSON.parse(crudo);
    const entradas = (registro.entradas || []).map((e) => ({
      etiqueta: e.etiqueta,
      tipo: e.tipo,
    }));
    return json({ entradas });
  } catch {
    return json({ entradas: [] });
  }
}
