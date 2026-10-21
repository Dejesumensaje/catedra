/* Un cuerpo que rueda sobre un perfil. Sin estado propio ni dibujo.
 *
 * El perfil es una función altura(x). La velocidad `v` es a lo largo de la
 * pendiente y positiva hacia +x (cuesta arriba en las cuatro versiones).
 * `s` acumula el camino recorrido: el dibujo lo usa para girar la roca.
 */

export function tangente(perfil, x) {
  const h = 1e-3;
  return (perfil(x + h) - perfil(x - h)) / (2 * h);
}

export function seno(perfil, x) {
  const m = tangente(perfil, x);
  return m / Math.hypot(1, m);
}

/**
 * Avanza un paso. `fuerza` empuja hacia +x; `rodadura` es un rozamiento que
 * se opone al movimiento y, si la roca está quieta, la sostiene mientras
 * gravedad y fuerza juntas no lo superen. Por eso frenar nunca empuja.
 */
export function avanzar(c, perfil, { fuerza = 0, gravedad, arrastre = 0, rodadura = 0 }, dt) {
  const sen = seno(perfil, c.x);
  const cos = Math.sqrt(1 - sen * sen);
  const motriz = fuerza - gravedad * sen;

  if (c.v === 0 && Math.abs(motriz) <= rodadura) return c;

  const dir = c.v !== 0 ? Math.sign(c.v) : Math.sign(motriz);
  const a = motriz - arrastre * c.v - rodadura * dir;
  let v = c.v + a * dt;
  // El rozamiento detiene, no invierte.
  if (Math.sign(v) !== dir && Math.abs(motriz) <= rodadura) v = 0;

  c.v = v;
  c.x += v * cos * dt;
  c.s += v * dt;
  return c;
}

/**
 * Construye un perfil a partir de una función de tangentes, integrándola una
 * vez en una tabla. Sirve para pendientes por tramos sin escribir la altura a mano.
 */
export function perfilDesdeTangentes(tangenteEn, desde, hasta, paso = 0.01) {
  const n = Math.ceil((hasta - desde) / paso);
  const alturas = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) {
    const x = desde + (i - 0.5) * paso;
    alturas[i] = alturas[i - 1] + tangenteEn(x) * paso;
  }
  return (x) => {
    if (x <= desde) return tangenteEn(desde) * (x - desde);
    if (x >= hasta) return alturas[n] + tangenteEn(hasta) * (x - hasta);
    const f = (x - desde) / paso;
    const i = Math.floor(f);
    const t = f - i;
    return alturas[i] * (1 - t) + alturas[Math.min(i + 1, n)] * t;
  };
}

export const suave = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Azar con semilla (mulberry32), para que un camino o una roca se repitan si se quiere. */
export function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function barajar(lista, r) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
