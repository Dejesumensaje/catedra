/* Conexión con la sala. El navegador no decide nada del juego: manda toques y
 * recibe el estado. Esta capa se ocupa de reconectar y de decir, en palabras,
 * en qué estado está la conexión. */

/** Base del servidor: el mismo sitio, o ?servidor=http://localhost:8787 para probar. */
export function baseServidor() {
  const p = new URLSearchParams(location.search).get('servidor');
  const base = p ? p.replace(/\/$/, '') : location.origin;
  return { http: base, ws: base.replace(/^http/, 'ws') };
}

export function miId() {
  const nuevo = () => {
    const b = crypto.getRandomValues(new Uint8Array(12));
    return [...b].map((x) => x.toString(36).padStart(2, '0')).join('').slice(0, 20);
  };
  try {
    let id = sessionStorage.getItem('sisifo-id');
    if (!id) { id = nuevo(); sessionStorage.setItem('sisifo-id', id); }
    return id;
  } catch { return nuevo(); }
}

export async function crearSala(id) {
  const { http } = baseServidor();
  const r = await fetch(`${http}/api/sisifo/salas`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ anfitrion: id }),
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || 'No se pudo crear la sala.');
  return datos.codigo;
}

export async function existeSala(codigo) {
  const { http } = baseServidor();
  const r = await fetch(`${http}/api/sisifo/salas/${codigo}`);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Sin servidor.');
  return (await r.json()).existe;
}

/**
 * estados: conectando · conectada · reconectando · sin-conexion · no-existe · llena
 */
export function conectar({ codigo, id, nombre, alMensaje, alEstado }) {
  const { ws: base } = baseServidor();
  let ws = null, intentos = 0, vivo = true, ultimo = 0, reintento = 0, latido = 0;
  let estado = '';
  const poner = (e) => { if (e !== estado) { estado = e; alEstado(e); } };

  const abrir = () => {
    if (!vivo) return;
    poner(intentos ? 'reconectando' : 'conectando');
    const q = new URLSearchParams({ id, nombre: nombre() || '' });
    ws = new WebSocket(`${base}/api/sisifo/salas/${codigo}/ws?${q}`);
    ws.onopen = () => { ultimo = performance.now(); };
    ws.onmessage = (ev) => {
      ultimo = performance.now();
      let m;
      try { m = JSON.parse(ev.data); } catch { return; }
      if (m.t === 'hola') { intentos = 0; poner('conectada'); }
      if (m.t === 'error') {
        if (m.motivo === 'no-existe') { vivo = false; poner('no-existe'); }
        if (m.motivo === 'llena') { vivo = false; poner('llena'); }
      }
      alMensaje(m);
    };
    ws.onclose = () => {
      if (!vivo) return;
      ws = null;
      intentos++;
      if (intentos > 8) { poner('sin-conexion'); return; }
      poner('reconectando');
      reintento = setTimeout(abrir, Math.min(8000, 400 * 2 ** (intentos - 1)));
    };
  };

  // Latido: el servidor desconecta a quien calla; y si el servidor calla, se reconecta.
  latido = setInterval(() => {
    if (!ws || ws.readyState !== 1) return;
    ws.send('{"t":"ping"}');
    if (ultimo && performance.now() - ultimo > 4000) ws.close();
  }, 1500);

  const alVolver = () => {
    if (document.visibilityState === 'visible' && vivo && (!ws || ws.readyState > 1)) {
      clearTimeout(reintento); intentos = Math.min(intentos, 1); abrir();
    }
  };
  document.addEventListener('visibilitychange', alVolver);
  abrir();

  return {
    enviar(m) { if (ws && ws.readyState === 1) { ws.send(JSON.stringify(m)); return true; } return false; },
    reintentar() { vivo = true; intentos = 1; clearTimeout(reintento); abrir(); },
    cerrar() {
      vivo = false;
      clearTimeout(reintento); clearInterval(latido);
      document.removeEventListener('visibilitychange', alVolver);
      try { ws && ws.close(1000, 'adios'); } catch { /* nada */ }
    },
    silencioMs: () => (ultimo ? performance.now() - ultimo : Infinity),
    estado: () => estado,
  };
}
