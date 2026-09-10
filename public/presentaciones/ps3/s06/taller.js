// Cronómetro manual por consigna. Cambiar de diapositiva pausa el tiempo.
(() => {
  const control = document.createElement('div');
  control.className = 'workshop-timer demo';
  control.hidden = true;
  control.innerHTML = '<output aria-label="Tiempo restante">00:00</output><button type="button" class="timer-start">Iniciar</button><button type="button" class="timer-reset">Reiniciar</button>';
  document.body.append(control);
  const output = control.querySelector('output');
  const start = control.querySelector('.timer-start');
  const reset = control.querySelector('.timer-reset');
  const saved = new WeakMap();
  let active, state;
  function pause() {
    if (state?.end) { state.left = Math.max(0, state.end - Date.now()); state.end = null; }
  }
  function draw() {
    if (!state) return;
    const left = state.end ? Math.max(0, state.end - Date.now()) : state.left;
    const seconds = Math.ceil(left / 1000);
    output.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    start.textContent = state.end ? 'Pausar' : 'Iniciar';
    if (!left) { state.end = null; state.left = 0; start.textContent = 'Tiempo cumplido'; }
    start.disabled = !left;
  }
  function sync() {
    const next = document.querySelector('.slide.active');
    if (next === active) return;
    pause(); active = next;
    const minutes = Number(next?.dataset.minutes);
    control.hidden = !minutes;
    state = undefined;
    if (!minutes) return;
    if (!saved.has(next)) saved.set(next, {left: minutes * 60000, total: minutes * 60000, end: null});
    state = saved.get(next); draw();
  }
  start.addEventListener('click', () => {
    if (!state) return;
    if (state.end) pause(); else state.end = Date.now() + state.left;
    draw();
  });
  reset.addEventListener('click', () => {
    if (!state) return;
    state.end = null; state.left = state.total; draw();
  });
  document.addEventListener('keydown', e => {
    if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) e.stopPropagation();
  }, true);
  const observer = new MutationObserver(sync);
  document.querySelectorAll('.slide').forEach(slide => observer.observe(slide, {attributes:true, attributeFilter:['class']}));
  setInterval(draw, 250); sync();
})();
