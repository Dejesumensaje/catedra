/* El gesto de tocar, igual en las cuatro versiones: dedo, ratón o barra
 * espaciadora. Un toque es un pointerdown (o un keydown sin repetición): ni
 * los clics sintéticos ni el autorepeat del teclado cuentan dos veces.
 * El límite de frecuencia efectiva lo pone el esfuerzo (nucleo/esfuerzo.js). */

export function escucharToques(elemento, alTocar) {
  const alPuntero = (ev) => {
    if (ev.button > 0) return;
    ev.preventDefault();
    alTocar(performance.now(), ev);
  };
  const alTecla = (ev) => {
    if (ev.repeat) return;
    if (ev.code !== 'Space' && ev.key !== ' ') return;
    if (ev.target.closest && ev.target.closest('input, textarea, button, a, select')) return;
    ev.preventDefault();
    alTocar(performance.now(), ev);
  };
  // iOS: evita el zoom por doble toque y el menú contextual al mantener.
  const nada = (ev) => ev.preventDefault();
  elemento.addEventListener('pointerdown', alPuntero);
  elemento.addEventListener('touchend', nada, { passive: false });
  elemento.addEventListener('contextmenu', nada);
  window.addEventListener('keydown', alTecla);
  return () => {
    elemento.removeEventListener('pointerdown', alPuntero);
    elemento.removeEventListener('touchend', nada);
    elemento.removeEventListener('contextmenu', nada);
    window.removeEventListener('keydown', alTecla);
  };
}
