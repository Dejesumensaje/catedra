/* ------------------------------------------------------------------
   Estado de un instrumento de /diseno-visual (código de cliente).

   Un instrumento es un `[data-lab="id"]` que contiene controles nativos
   marcados con `data-var`. Este módulo los lee, llama a `pintar` y
   `describir` en cada cambio, guarda el estado en la URL para que una
   configuración se pueda compartir, y resuelve las acciones comunes:

     [data-escenario]           donde se pinta el estado actual
     [data-lectura]             texto vivo que nombra la relación (aria-live)
     [data-salida="var"]        valor legible de un control
     [data-accion="fijar"]      guarda el estado actual como A
     [data-accion="soltar"]     cierra la comparación
     [data-comparacion]         contenedor de A (oculto hasta fijar)
       [data-escenario-a]       donde se pinta A
       [data-diferencias]       qué cambió entre A y el estado actual
     [data-accion="restablecer"]
     [data-accion="enlace"]     copia el enlace a esta configuración
     [data-preset='{"var":1}']  aplica un estado parcial
     [data-aviso]               confirmaciones breves (aria-live)

   Cada control lleva `data-etiqueta` (cómo se nombra en las diferencias)
   y, si es numérico, `data-unidad` y `data-decimales`.
------------------------------------------------------------------ */

export type Valor = number | string | boolean;
export type Estado = Record<string, Valor>;

export interface Instrumento<E extends Estado> {
  raiz: HTMLElement;
  estado: () => E;
  aplicar: (parcial: Partial<E>) => void;
}

interface Opciones<E extends Estado> {
  raiz: HTMLElement;
  pintar: (destino: HTMLElement, estado: E, rol: 'actual' | 'a') => void;
  /** HTML breve que nombra la relación; `<b class="dv-cifra">` para la cifra. */
  describir?: (estado: E) => string;
  /** Texto propio para una variable en la lista de diferencias. */
  formatear?: (variable: string, valor: Valor, estado: E) => string | undefined;
}

const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 });

function controles(raiz: HTMLElement): HTMLInputElement[] {
  return [...raiz.querySelectorAll<HTMLInputElement>('input[data-var], select[data-var]')]
    // Un instrumento puede contener otro; cada uno lee solo los suyos.
    .filter((c) => c.closest('[data-lab]') === raiz);
}

function leer(raiz: HTMLElement): Estado {
  const e: Estado = {};
  for (const c of controles(raiz)) {
    const v = c.dataset.var!;
    if (c.type === 'radio') {
      if (c.checked) e[v] = c.value;
    } else if (c.type === 'checkbox') {
      e[v] = c.checked;
    } else if (c.type === 'range' || c.type === 'number') {
      e[v] = Number(c.value);
    } else {
      e[v] = c.value;
    }
  }
  return e;
}

function escribir(raiz: HTMLElement, parcial: Estado) {
  for (const c of controles(raiz)) {
    const v = c.dataset.var!;
    if (!(v in parcial)) continue;
    const valor = parcial[v];
    if (c.type === 'radio') c.checked = c.value === String(valor);
    else if (c.type === 'checkbox') c.checked = valor === true || valor === 'true' || valor === '1';
    else c.value = String(valor);
  }
}

function etiqueta(raiz: HTMLElement, variable: string): string {
  const c = controles(raiz).find((c) => c.dataset.var === variable);
  return c?.dataset.etiqueta ?? variable;
}

function textoValor(raiz: HTMLElement, variable: string, valor: Valor): string {
  const cs = controles(raiz).filter((c) => c.dataset.var === variable);
  const c = cs[0];
  if (!c) return String(valor);
  if (c.type === 'checkbox') return valor ? 'sí' : 'no';
  if (c.type === 'radio') {
    const elegido = cs.find((r) => r.value === String(valor));
    return elegido?.dataset.texto ?? String(valor);
  }
  if (typeof valor === 'number') {
    const dec = Number(c.dataset.decimales ?? 0);
    const unidad = c.dataset.unidad ?? '';
    const n = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(valor);
    // «30°» va pegado; «94 %» y «12 px» llevan espacio (norma del español).
    return unidad ? (unidad === '°' ? `${n}°` : `${n} ${unidad}`) : n;
  }
  return String(valor);
}

/** Serializa el estado en la query, con el id del instrumento como prefijo. */
export function aQuery(id: string, e: Estado, params = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(e)) {
    params.set(`${id}.${k}`, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  }
  return params;
}

export function deQuery(id: string, params: URLSearchParams): Estado {
  const e: Estado = {};
  for (const [k, v] of params) {
    if (!k.startsWith(`${id}.`)) continue;
    e[k.slice(id.length + 1)] = v;
  }
  return e;
}

export function diferencias(a: Estado, b: Estado): { cambio: string[]; igual: string[] } {
  const cambio: string[] = [];
  const igual: string[] = [];
  for (const k of Object.keys(b)) {
    if (String(a[k]) === String(b[k])) igual.push(k);
    else cambio.push(k);
  }
  return { cambio, igual };
}

export function conectar<E extends Estado>(op: Opciones<E>): Instrumento<E> {
  const { raiz, pintar, describir } = op;
  const id = raiz.dataset.lab!;
  const inicial = leer(raiz) as E;
  const escenario = raiz.querySelector<HTMLElement>('[data-escenario]')!;
  const lectura = raiz.querySelector<HTMLElement>('[data-lectura]');
  const aviso = raiz.querySelector<HTMLElement>('[data-aviso]');
  const comparacion = raiz.querySelector<HTMLElement>('[data-comparacion]');
  const escenarioA = raiz.querySelector<HTMLElement>('[data-escenario-a]');
  const listaDif = raiz.querySelector<HTMLElement>('[data-diferencias]');
  let fijado: E | null = null;
  let guardado: number | undefined;

  const desdeUrl = deQuery(id, new URLSearchParams(location.search));
  if (Object.keys(desdeUrl).length) escribir(raiz, desdeUrl);

  const avisar = (texto: string) => {
    if (!aviso) return;
    aviso.textContent = texto;
    window.setTimeout(() => { if (aviso.textContent === texto) aviso.textContent = ''; }, 2600);
  };

  const formatear = (k: string, v: Valor, e: E) =>
    op.formatear?.(k, v, e) ?? textoValor(raiz, k, v);

  const pintarDiferencias = (actual: E) => {
    if (!fijado || !listaDif) return;
    const { cambio, igual } = diferencias(fijado, actual);
    const a = fijado;
    listaDif.innerHTML = '';
    const bloque = (titulo: string, items: string[], conValores: boolean) => {
      if (!items.length) return;
      const h = document.createElement('p');
      h.className = 'dif-titulo';
      h.textContent = titulo;
      const ul = document.createElement('ul');
      for (const k of items) {
        const li = document.createElement('li');
        li.textContent = conValores
          ? `${etiqueta(raiz, k)}: ${formatear(k, a[k], a)} → ${formatear(k, actual[k], actual)}`
          : etiqueta(raiz, k);
        ul.append(li);
      }
      listaDif.append(h, ul);
    };
    if (!cambio.length) {
      const p = document.createElement('p');
      p.className = 'dif-titulo';
      p.textContent = 'A y B son iguales. Cambia un control para compararlas.';
      listaDif.append(p);
      return;
    }
    bloque('Cambió', cambio, true);
    if (igual.length) {
      const p = document.createElement('p');
      p.className = 'dif-igual';
      p.textContent = `Quedó igual: ${igual.map((k) => etiqueta(raiz, k).toLowerCase()).join(', ')}.`;
      listaDif.append(p);
    }
  };

  /** `origen` distingue lo que hizo la persona de lo que hizo el programa:
   *  la guía solo reconoce como logro lo que movió quien aprende. */
  type Origen = 'usuario' | 'preset' | 'programa';
  const actualizar = (origen: Origen = 'usuario') => {
    const e = leer(raiz) as E;
    for (const s of raiz.querySelectorAll<HTMLElement>('[data-salida]')) {
      if (s.closest('[data-lab]') !== raiz) continue;
      const k = s.dataset.salida!;
      if (k in e) s.textContent = formatear(k, e[k], e);
    }
    pintar(escenario, e, 'actual');
    // `describir` devuelve HTML propio (sin texto del usuario): los valores
    // vienen de inputs nativos que ya sanean números, radios y colores.
    if (lectura && describir) lectura.innerHTML = describir(e);
    pintarDiferencias(e);
    raiz.dataset.origen = origen;
    raiz.dispatchEvent(new CustomEvent('estado', { detail: e }));

    // La URL guarda la configuración, sin llenar el historial.
    window.clearTimeout(guardado);
    guardado = window.setTimeout(() => {
      const params = new URLSearchParams(location.search);
      for (const k of [...params.keys()]) if (k.startsWith(`${id}.`)) params.delete(k);
      const distinto = Object.fromEntries(
        Object.entries(e).filter(([k, v]) => String(inicial[k]) !== String(v)),
      );
      aQuery(id, distinto, params);
      const q = params.toString();
      history.replaceState(history.state, '', `${location.pathname}${q ? `?${q}` : ''}${location.hash}`);
    }, 250);
  };

  raiz.addEventListener('input', (ev) => {
    if ((ev.target as HTMLElement).closest('[data-lab]') === raiz) actualizar();
  });
  raiz.addEventListener('change', (ev) => {
    if ((ev.target as HTMLElement).closest('[data-lab]') === raiz) actualizar();
  });

  raiz.addEventListener('click', (ev) => {
    const boton = (ev.target as HTMLElement).closest<HTMLElement>('[data-accion], [data-preset]');
    if (!boton || boton.closest('[data-lab]') !== raiz) return;

    if (boton.dataset.preset) {
      escribir(raiz, JSON.parse(boton.dataset.preset));
      actualizar('preset');
      return;
    }

    switch (boton.dataset.accion) {
      case 'restablecer':
        escribir(raiz, inicial);
        actualizar('programa');
        avisar('Volvió al estado inicial.');
        break;
      case 'fijar':
        fijado = leer(raiz) as E;
        if (comparacion && escenarioA) {
          comparacion.hidden = false;
          raiz.classList.add('comparando');
          pintar(escenarioA, fijado, 'a');
          pintarDiferencias(fijado);
        }
        avisar('Esta configuración quedó fijada como A. Cambia los controles para compararla.');
        break;
      case 'soltar':
        fijado = null;
        if (comparacion) comparacion.hidden = true;
        raiz.classList.remove('comparando');
        avisar('Comparación cerrada.');
        break;
      case 'enlace': {
        const url = new URL(location.href);
        url.hash = raiz.id ? raiz.id : '';
        navigator.clipboard?.writeText(url.toString()).then(
          () => avisar('Enlace copiado. Abre el instrumento con esta misma configuración.'),
          () => avisar(url.toString()),
        );
        break;
      }
    }
  });

  actualizar('programa');

  // Un visor más alto que la ventana no puede quedarse fijo: escondería la
  // lectura. Se suelta y se lee con el desplazamiento normal.
  const visor = raiz.querySelector<HTMLElement>('.dv-visor');
  const revisarVisor = () => {
    if (!visor) return;
    visor.classList.remove('dv-visor-suelto');
    visor.classList.toggle('dv-visor-suelto', visor.offsetHeight > window.innerHeight - 32);
  };
  revisarVisor();
  window.addEventListener('resize', revisarVisor);
  raiz.addEventListener('estado', () => requestAnimationFrame(revisarVisor));

  // Otros módulos (la guía) piden cambios con un evento, sin conocer esta API.
  raiz.addEventListener('aplicar', (ev) => {
    escribir(raiz, (ev as CustomEvent<Estado>).detail);
    actualizar('programa');
  });

  // Los escenarios pintan en píxeles reales: si cambia el ancho (girar el
  // teléfono, abrir la comparación), se vuelven a pintar.
  if ('ResizeObserver' in window) {
    const anchos = new WeakMap<Element, number>();
    let pendiente = 0;
    const ro = new ResizeObserver((entradas) => {
      let cambio = false;
      for (const en of entradas) {
        const w = Math.round(en.contentRect.width);
        if (anchos.get(en.target) !== w) { anchos.set(en.target, w); cambio = true; }
      }
      if (!cambio) return;
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(() => {
        pintar(escenario, leer(raiz) as E, 'actual');
        if (fijado && escenarioA && !escenarioA.closest('[hidden]')) pintar(escenarioA, fijado, 'a');
      });
    });
    ro.observe(escenario);
    if (escenarioA) ro.observe(escenarioA);
  }

  return {
    raiz,
    estado: () => leer(raiz) as E,
    aplicar: (parcial) => { escribir(raiz, parcial as Estado); actualizar('programa'); },
  };
}

/** Formato de número para textos de lectura: «3,2». */
export function n(valor: number, decimales = 1): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  }).format(valor);
}

export { numero };

/** Crea un elemento SVG con atributos. */
export function svg<K extends keyof SVGElementTagNameMap>(
  tipo: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tipo);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** Generador pseudoaleatorio con semilla: el mismo estado pinta lo mismo. */
export function azar(semilla: number) {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
