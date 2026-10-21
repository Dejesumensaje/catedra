/* ------------------------------------------------------------------
   «Ponte a prueba» (código de cliente). Cada entrada genera sus rondas con
   azar, así que jugar otra vez no repite las mismas. Dos tipos de ronda:

     eleccion  una pregunta y opciones (texto o mini composiciones)
     ajuste    una composición rota y un control para arreglarla

   Cada respuesta, buena o mala, explica por qué. Al final se dice cuántas
   salieron bien y qué conviene repasar. Sin puntos acumulados ni rachas:
   solo se guarda el mejor resultado para que el índice lo recuerde.
------------------------------------------------------------------ */

export interface Opcion {
  texto?: string;
  pintar?: (destino: HTMLElement) => void;
  /** Descripción para lectores de pantalla cuando la opción es un dibujo. */
  describir?: string;
}

interface Base {
  pregunta: string;
  ayuda?: string;
  /** Explicación que se muestra después de responder. */
  porque: string;
  /** Qué repasar si falla, en pocas palabras. */
  repaso: string;
}

export interface RondaEleccion extends Base {
  tipo: 'eleccion';
  escena?: (destino: HTMLElement) => void;
  escenaDescrita?: string;
  opciones: Opcion[];
  correcta: number;
}

export interface RondaAjuste extends Base {
  tipo: 'ajuste';
  control: { etiqueta: string; min: number; max: number; paso?: number; valor: number; unidad?: string };
  pintar: (destino: HTMLElement, valor: number) => void;
  cumple: (valor: number) => boolean;
  /** Qué falta, si no se cumple. */
  falta?: (valor: number) => string;
}

export type Ronda = RondaEleccion | RondaAjuste;

const LETRAS = 'ABCDEF';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, clase?: string, texto?: string) {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

/** Baraja con el generador dado (o Math.random). */
export function barajar<T>(lista: T[], azar = Math.random): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function jugar(raiz: HTMLElement, generar: () => Ronda[]) {
  const slug = raiz.dataset.juego!;
  const zona = raiz.querySelector<HTMLElement>('[data-juego-zona]')!;
  const contador = raiz.querySelector<HTMLElement>('[data-juego-n]')!;
  const empezarBtn = raiz.querySelector<HTMLButtonElement>('[data-juego-empezar]')!;
  const intro = raiz.querySelector<HTMLElement>('[data-juego-intro]')!;

  let rondas: Ronda[] = [];
  let i = 0;
  let aciertos = 0;
  let fallos: Ronda[] = [];

  const guardar = () => {
    try {
      const prev = JSON.parse(localStorage.getItem(`dv-juego-${slug}`) ?? 'null');
      if (!prev || aciertos / rondas.length >= prev.aciertos / prev.total) {
        localStorage.setItem(`dv-juego-${slug}`, JSON.stringify({ aciertos, total: rondas.length }));
      }
    } catch { /* sin almacenamiento: no pasa nada */ }
  };

  const responder = (ronda: Ronda, bien: boolean, detalle: string, acciones: HTMLElement) => {
    if (bien) aciertos++; else fallos.push(ronda);
    const caja = el('div', 'dv-juego-respuesta');
    caja.tabIndex = -1;
    caja.setAttribute('role', 'status');
    caja.append(el('p', 'resultado', bien ? '✓ Correcto.' : `✗ ${detalle}`));
    caja.append(el('p', '', ronda.porque));
    zona.append(caja);
    const sig = el('button', 'dv-boton dv-boton-fuerte', i === rondas.length - 1 ? 'Ver el resultado' : 'Siguiente ronda →');
    sig.type = 'button';
    sig.addEventListener('click', () => { i++; i < rondas.length ? ronda_(i) : final(); });
    acciones.replaceChildren(sig);
    zona.append(acciones);
    caja.focus({ preventScroll: false });
  };

  const cabecera = (ronda: Ronda) => {
    contador.textContent = `Ronda ${i + 1} de ${rondas.length}`;
    const h = el('p', 'dv-juego-pregunta', ronda.pregunta);
    h.tabIndex = -1;
    zona.append(h);
    if (ronda.ayuda) zona.append(el('p', 'dv-juego-ayuda', ronda.ayuda));
    return h;
  };

  const ronda_ = (k: number) => {
    const ronda = rondas[k];
    zona.replaceChildren();
    const h = cabecera(ronda);
    const acciones = el('div', 'dv-juego-acciones');

    if (ronda.tipo === 'eleccion') {
      if (ronda.escena) {
        const esc = el('div', 'dv-juego-escena');
        esc.setAttribute('role', 'img');
        if (ronda.escenaDescrita) esc.setAttribute('aria-label', ronda.escenaDescrita);
        ronda.escena(esc);
        zona.append(esc);
      }
      const conDibujo = ronda.opciones.some((o) => o.pintar);
      const lista = el('div', `dv-juego-opciones${conDibujo ? '' : ' solo-texto'}`);
      lista.setAttribute('role', 'group');
      lista.setAttribute('aria-label', 'Opciones');
      const botones = ronda.opciones.map((o, j) => {
        const b = el('button', 'dv-juego-opcion');
        b.type = 'button';
        const cab = el('span', 'letra', LETRAS[j]);
        b.append(cab);
        if (o.pintar) {
          const d = el('span');
          d.setAttribute('aria-hidden', 'true');
          o.pintar(d);
          b.append(d);
        }
        if (o.texto) b.append(el('span', '', o.texto));
        if (o.describir) b.setAttribute('aria-label', `${LETRAS[j]}: ${o.describir}`);
        b.addEventListener('click', () => {
          for (const x of botones) x.disabled = true;
          const bien = j === ronda.correcta;
          botones[ronda.correcta].classList.add('es-correcta');
          botones[ronda.correcta].append(el('span', 'veredicto', '✓ Respuesta correcta'));
          if (!bien) {
            b.classList.add('es-elegida-mal');
            b.append(el('span', 'veredicto', '✗ Tu respuesta'));
          }
          responder(ronda, bien, `No es correcto. La respuesta es la ${LETRAS[ronda.correcta]}.`, acciones);
        });
        lista.append(b);
        return b;
      });
      zona.append(lista);
    } else {
      const esc = el('div', 'dv-juego-escena');
      zona.append(esc);
      const c = ronda.control;
      const id = `juego-${slug}-${k}`;
      const ctl = el('div', 'dv-control dv-deslizador dv-juego-ajuste');
      const cab = el('div', 'dv-control-cab');
      const lab = el('label', '', c.etiqueta);
      lab.htmlFor = id;
      const out = el('output');
      out.htmlFor.add(id);
      cab.append(lab, out);
      const input = el('input');
      input.type = 'range';
      input.id = id;
      input.min = String(c.min);
      input.max = String(c.max);
      input.step = String(c.paso ?? 1);
      input.value = String(c.valor);
      ctl.append(cab, input);
      zona.append(ctl);
      const pintar = () => {
        const v = Number(input.value);
        out.textContent = `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(v)}${c.unidad ? ` ${c.unidad}` : ''}`;
        ronda.pintar(esc, v);
      };
      input.addEventListener('input', pintar);
      pintar();
      const comprobar = el('button', 'dv-boton dv-boton-fuerte', 'Comprobar');
      comprobar.type = 'button';
      comprobar.addEventListener('click', () => {
        const v = Number(input.value);
        input.disabled = true;
        const bien = ronda.cumple(v);
        responder(ronda, bien, ronda.falta?.(v) ?? 'Todavía no es correcto.', acciones);
      });
      acciones.append(comprobar);
      zona.append(acciones);
    }
    h.focus({ preventScroll: true });
  };

  const final = () => {
    guardar();
    contador.textContent = 'Resultado';
    zona.replaceChildren();
    const caja = el('div', 'dv-juego-final');
    const h = el('h3', '', `${aciertos} de ${rondas.length} correctas`);
    h.tabIndex = -1;
    caja.append(h);
    const juicio = aciertos === rondas.length
      ? 'Respondiste todas bien. Ahora prueba con una composición propia: busca dónde actúa este principio.'
      : aciertos >= rondas.length - 1
        ? 'Respondiste casi todas bien. Abajo está la explicación de la que faltó.'
        : 'Te conviene volver a «Pruébalo» y repetir la guía, con atención a lo que falló.';
    caja.append(el('p', '', juicio));
    if (fallos.length) {
      caja.append(el('p', 'dv-juego-ayuda', 'Para repasar:'));
      const ul = el('ul');
      for (const f of fallos) {
        const li = el('li');
        li.append(el('strong', '', `${f.repaso}. `), document.createTextNode(f.porque));
        ul.append(li);
      }
      caja.append(ul);
    }
    const otra = el('button', 'dv-boton dv-boton-fuerte', 'Jugar con rondas nuevas');
    otra.type = 'button';
    otra.addEventListener('click', empezar);
    const acciones = el('div', 'dv-juego-acciones');
    acciones.append(otra);
    caja.append(acciones);
    zona.append(caja);
    h.focus();
  };

  const empezar = () => {
    rondas = generar();
    i = 0;
    aciertos = 0;
    fallos = [];
    intro.hidden = true;
    ronda_(0);
  };

  empezarBtn.addEventListener('click', empezar);
  empezarBtn.hidden = false;
}
