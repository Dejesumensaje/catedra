/* Sonido mínimo y opcional: un golpe sordo por empujón y un retumbo para la
 * caída. Apagado por defecto; nada en el juego depende de él. */

let ctx = null;
let activo = false;
try { activo = localStorage.getItem('sisifo-sonido') === 'si'; } catch { /* sin almacenamiento */ }

const contexto = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

export const sonidoActivo = () => activo;
export function alternarSonido() {
  activo = !activo;
  try { localStorage.setItem('sisifo-sonido', activo ? 'si' : 'no'); } catch { /* nada */ }
  if (activo) contexto();
  return activo;
}

function ruido(duracion, frecuencia, volumen, caida = 0.9) {
  if (!activo) return;
  const c = contexto();
  if (!c) return;
  const n = Math.floor(c.sampleRate * duracion);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1 / (1 - caida + 0.05));
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = frecuencia;
  const g = c.createGain();
  g.gain.value = volumen;
  src.connect(f).connect(g).connect(c.destination);
  src.start();
}

export const golpe = (fuerza = 0.5) => ruido(0.09, 180 + 140 * fuerza, 0.25 + 0.3 * fuerza, 0.6);
export const retumbo = () => ruido(1.6, 120, 0.6, 0.3);
export const pulso = () => ruido(0.05, 900, 0.08, 0.7);
