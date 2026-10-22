/* ------------------------------------------------------------------
   Guía paso a paso (código de cliente). Se engancha a un instrumento ya
   conectado con `conectar` y escucha su evento `estado`.

   Un paso se cumple solo con lo que movió la persona (origen «usuario»):
   ni el estado de partida ni una configuración de «Prueba» lo resuelven.
------------------------------------------------------------------ */
import type { Estado } from './estado';

export type Condicion<E extends Estado> = (estado: E, inicio: E) => boolean;

interface Paso {
  titulo?: string;
  hacer: string;
  logro: string;
  pista?: string;
  preparar?: Estado;
  abrir?: boolean;
}

export function guiar<E extends Estado>(raiz: HTMLElement, condiciones: Condicion<E>[]) {
  const caja = raiz.querySelector<HTMLElement>('[data-guia]');
  if (!caja) return;
  const pasos: Paso[] = JSON.parse(caja.dataset.pasos ?? '[]');
  const items = [...caja.querySelectorAll<HTMLElement>('[data-guia-paso]')];
  const avance = caja.querySelector<HTMLElement>('[data-guia-avance]')!;
  const sig = caja.querySelector<HTMLButtonElement>('[data-guia-sig]')!;
  const pistaBtn = caja.querySelector<HTMLButtonElement>('[data-guia-pista-btn]')!;
  const saltar = caja.querySelector<HTMLButtonElement>('[data-guia-saltar]')!;
  const final = caja.querySelector<HTMLElement>('[data-guia-final]')!;
  const anuncio = caja.querySelector<HTMLElement>('[data-guia-anuncio]')!;
  const detalles = raiz.querySelector<HTMLDetailsElement>('details.dv-avanzados');

  let actual = 0;
  let logrado = false;
  let inicio: E | null = null;
  let ultimo: E | null = null;

  // En pantallas estrechas el escenario fijo puede tapar la guía: al lograr
  // un paso, un aviso dentro del escenario lleva a la explicación.
  const escenas = raiz.querySelector<HTMLElement>('.dv-ins-escenas');
  const aviso = document.createElement('button');
  aviso.type = 'button';
  aviso.className = 'dv-guia-aviso';
  aviso.hidden = true;
  aviso.textContent = '✓ Paso logrado. Ver la explicación ↓';
  aviso.addEventListener('click', () => {
    const alto = escenas && getComputedStyle(escenas).position === 'sticky' ? escenas.offsetHeight : 0;
    window.scrollTo({ top: caja.getBoundingClientRect().top + scrollY - alto - 12, behavior: 'smooth' });
    aviso.hidden = true;
    (items[actual]?.querySelector('.dv-guia-logro') as HTMLElement | null)?.setAttribute('tabindex', '-1');
    (items[actual]?.querySelector('.dv-guia-logro') as HTMLElement | null)?.focus({ preventScroll: true });
  });
  escenas?.append(aviso);

  caja.classList.add('dv-guia-activa');
  saltar.hidden = false;

  const mostrar = () => {
    items.forEach((li, i) => {
      li.classList.toggle('es-actual', i === actual);
      li.classList.toggle('es-hecho', i < actual || (i === actual && logrado));
      li.classList.toggle('es-futuro', i > actual);
      li.querySelector<HTMLElement>('.dv-guia-logro')!.hidden = !(i < actual || (i === actual && logrado));
      const pista = li.querySelector<HTMLElement>('.dv-guia-pista');
      if (pista && i !== actual) pista.hidden = true;
    });
    const terminado = actual >= pasos.length;
    avance.textContent = terminado ? 'Completa' : `Paso ${actual + 1} de ${pasos.length}`;
    sig.hidden = !logrado || terminado;
    sig.textContent = actual === pasos.length - 1 ? 'Terminar la guía' : 'Siguiente paso →';
    pistaBtn.hidden = terminado || logrado || !pasos[actual]?.pista;
    final.hidden = !terminado;
    caja.classList.toggle('dv-guia-terminada', terminado);
    raiz.classList.toggle('con-guia', !terminado);
    saltar.hidden = terminado;
  };

  const empezar = (i: number) => {
    aviso.hidden = true;
    actual = i;
    logrado = false;
    const p = pasos[i];
    if (p?.abrir && detalles) detalles.open = true;
    if (p?.preparar) raiz.dispatchEvent(new CustomEvent('aplicar', { detail: p.preparar }));
    inicio = ultimo;
    mostrar();
    if (p) anuncio.textContent = `Paso ${i + 1}. ${p.titulo ? p.titulo + ' ' : ''}${p.hacer}`;
  };

  raiz.addEventListener('estado', (ev) => {
    const e = (ev as CustomEvent<E>).detail;
    ultimo = e;
    if (inicio === null) inicio = e;
    if (raiz.dataset.origen !== 'usuario' || logrado || actual >= pasos.length) return;
    if (condiciones[actual]?.(e, inicio)) {
      logrado = true;
      mostrar();
      aviso.hidden = false;
      anuncio.textContent = `Paso logrado. ${pasos[actual].logro}`;
      sig.focus({ preventScroll: true });
    }
  });

  sig.addEventListener('click', () => {
    if (actual === pasos.length - 1) {
      actual = pasos.length;
      logrado = false;
      mostrar();
      anuncio.textContent = final.textContent ?? '';
    } else {
      empezar(actual + 1);
      // El foco vuelve al instrumento: el siguiente paso pide moverlo.
      items[actual]?.querySelector<HTMLElement>('.dv-guia-hacer')?.setAttribute('tabindex', '-1');
      items[actual]?.querySelector<HTMLElement>('.dv-guia-hacer')?.focus({ preventScroll: true });
    }
  });

  pistaBtn.addEventListener('click', () => {
    const pista = items[actual]?.querySelector<HTMLElement>('.dv-guia-pista');
    if (pista) { pista.hidden = false; anuncio.textContent = pista.textContent ?? ''; }
  });

  saltar.addEventListener('click', () => {
    actual = pasos.length;
    logrado = false;
    caja.classList.add('dv-guia-saltada');
    mostrar();
    final.textContent = 'Guía omitida. Puedes usar el instrumento libremente. Para volver a la guía, recarga la página.';
  });

  // El estado inicial llega antes de que la guía escuche: se pide uno nuevo.
  raiz.dispatchEvent(new CustomEvent('aplicar', { detail: {} }));
  empezar(0);
}
