/* Inscripciones: frases que aparecen en el espacio del juego, una a la vez.
 * El programador garantiza silencio entre frases; cada versión decide cuándo
 * pide hablar y con qué. */

export function crearNarrativa(el, { duracion = 6.5, silencioMin = 4 } = {}) {
  let actual = null, temporizador = 0, ultimaVez = -Infinity;
  const ya = new Set();
  const reloj = () => performance.now() / 1000;

  const ocultar = () => { el.classList.remove('visible'); actual = null; };

  return {
    /** Muestra una frase si no hay otra a la vista y pasó el silencio mínimo. */
    decir(texto, { dura = duracion, forzar = false } = {}) {
      const t = reloj();
      if (!forzar && (actual || t - ultimaVez < silencioMin)) return false;
      clearTimeout(temporizador);
      el.textContent = texto;
      // reflow para que la transición de opacidad vuelva a empezar
      void el.offsetWidth;
      el.classList.add('visible');
      actual = texto; ultimaVez = t + dura; ya.add(texto);
      if (dura < Infinity) temporizador = setTimeout(ocultar, dura * 1000);
      return true;
    },
    dicha: (texto) => ya.has(texto),
    hablando: () => !!actual,
    callar() { clearTimeout(temporizador); ocultar(); },
    limpiar() { clearTimeout(temporizador); ocultar(); el.textContent = ''; ya.clear(); ultimaVez = -Infinity; },
  };
}
