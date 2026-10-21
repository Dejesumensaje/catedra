/* IV · La comunidad. Una roca compartida, autoritativa en el servidor.
 *
 * Este módulo no simula la roca: la dibuja donde la sala dice que está. Lo único
 * local es la respuesta inmediata al toque propio (puro dibujo) y la
 * interpolación entre estados para que el movimiento sea continuo. */

import { ESFUERZO, CUERPOS, COMUNIDAD } from '../nucleo/parametros.js';
import { crearEsfuerzo, tocar } from '../nucleo/esfuerzo.js';
import * as regla from '../nucleo/reglas/comunidad.js';
import { bucle, acercar, encuadrar, movimientoReducido } from '../escena/lienzo.js';
import * as D from '../escena/dibujo.js';
import { crearEnergia } from '../escena/energia.js';
import { crearPolvo } from '../escena/polvo.js';
import { escucharToques } from '../entrada/toque.js';
import { conectar, crearSala, miId } from '../red/cliente.js';
import { salaLocal } from '../red/local.js';
import * as sonido from '../sonido.js';
import qrcode from '../vendor/qrcode.mjs';

const leerNombre = () => { try { return localStorage.getItem('sisifo-nombre') || ''; } catch { return ''; } };
const guardarNombre = (n) => { try { localStorage.setItem('sisifo-nombre', n); } catch { /* nada */ } };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CODIGO = /^[ACDEFHJKMNPRTUVWXY]{4}$/;

export function montar(app, codigoRuta) {
  const { L } = app;
  const panel = document.getElementById('sala');
  const lineaConexion = document.getElementById('conexion');
  const botonInvitar = document.getElementById('invitar');
  const depurar = new URLSearchParams(location.search).has('depurar');
  const reducido = movimientoReducido();
  const perfil = regla.crearPerfil();
  const largo = COMUNIDAD.largo;
  const caja = [-7, -0.6, largo + 2.4, perfil(largo) + 2.9];
  const forma = D.crearForma(5);
  const energia = crearEnergia({ reducido });
  const polvo = crearPolvo({ reducido });
  document.body.classList.add('en-comunidad');

  const id = miId();
  const codigo = (codigoRuta || '').toUpperCase();
  const prueba = codigo === 'PRUEBA';   // sala local con personas simuladas
  let cliente = null;
  let yo = null, roster = { personas: [], fase: 'espera', anfitrion: null };
  let st = null;                    // último estado del servidor
  let estadoConexion = '';
  const vista = { x: 0, s: 0, figuras: new Map() };  // n → { golpe, incl }
  const propio = crearEsfuerzo();   // solo para no mandar más toques de los que cuentan
  let invitarAbierto = false, cierreMostrado = false, abajo = 90, rushesVistos = 0;

  if (depurar) window.__sisifo = { energia: energia.cuenta, estado: () => ({ st, roster, yo, estadoConexion }) };

  /* ── panel ────────────────────────────────────────────────── */

  function panelInicio(error = '') {
    panel.innerHTML = `
      <h2>La comunidad</h2>
      <p>Una sola roca. Cada persona empuja desde su teléfono.</p>
      <label for="nombre">Tu nombre <span class="menor">(opcional, solo para esta sala)</span></label>
      <input id="nombre" maxlength="18" autocomplete="off" value="${esc(leerNombre())}">
      <div class="botones"><button class="boton" id="crear" type="button">Crear sala</button></div>
      <label for="entrar-codigo">o entra con un código</label>
      <div class="botones">
        <input id="entrar-codigo" class="codigo-entrada" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" aria-label="Código de la sala">
        <button class="boton claro" id="entrar" type="button">Entrar</button>
      </div>
      <p class="error" role="alert">${esc(error)}</p>
      <p class="menor"><a href="#comunidad/prueba">Probar sola o solo, con personas simuladas</a></p>`;
    panel.classList.add('abierto');
    const nombre = panel.querySelector('#nombre');
    nombre.addEventListener('change', () => guardarNombre(nombre.value.trim()));
    panel.querySelector('#crear').addEventListener('click', async (ev) => {
      guardarNombre(nombre.value.trim());
      ev.target.disabled = true;
      ev.target.textContent = 'Creando…';
      try {
        const c = await crearSala(id);
        location.hash = `#comunidad/${c}`;
      } catch (e) {
        panelInicio(e.message === 'Failed to fetch' ? 'No hay conexión con el servidor de salas.' : e.message);
      }
    });
    const entrar = () => {
      const c = panel.querySelector('#entrar-codigo').value.trim().toUpperCase();
      guardarNombre(nombre.value.trim());
      if (!CODIGO.test(c)) { panel.querySelector('.error').textContent = 'El código tiene cuatro letras.'; return; }
      location.hash = `#comunidad/${c}`;
    };
    panel.querySelector('#entrar').addEventListener('click', entrar);
    panel.querySelector('#entrar-codigo').addEventListener('keydown', (e) => { if (e.key === 'Enter') entrar(); });
  }

  const enlace = () => {
    const s = new URLSearchParams(location.search).get('servidor');
    return `${location.origin}${location.pathname}${s ? `?servidor=${encodeURIComponent(s)}` : ''}#comunidad/${codigo}`;
  };
  const qr = (texto) => {
    const q = qrcode(0, 'M');
    q.addData(texto);
    q.make();
    return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: 'Código QR para entrar a la sala' });
  };
  const conectadas = () => roster.personas.filter((p) => p.conectada);
  const soyAnfitrion = () => yo != null && roster.anfitrion === yo;
  const cuantas = () => {
    const n = conectadas().length;
    return n <= 1 ? 'Solo tú, por ahora.' : `${n} personas en la sala.`;
  };

  function panelSala() {
    if (!codigo) return;
    const fase = roster.fase;
    const anf = soyAnfitrion();
    document.body.classList.toggle('anfitrion', anf);
    if (fase !== 'espera' && !invitarAbierto) { panel.classList.remove('abierto'); return; }
    if (prueba) { panelPrueba(fase); return; }
    const invitar = `
      <div class="fila">
        <div class="qr">${qr(enlace())}</div>
        <div>
          <p class="menor" style="margin:0">Sala</p>
          <div class="codigo">${codigo}</div>
          <p class="enlace">${esc(enlace().replace(/^https?:\/\//, ''))}</p>
        </div>
      </div>`;
    if (fase !== 'espera') {
      panel.innerHTML = `<button class="glifo cerrar" type="button" data-cerrar-sala aria-label="Cerrar">×</button>${invitar}`;
    } else if (anf) {
      panel.innerHTML = `${invitar}
        <p>${cuantas()}</p>
        <div class="botones"><button class="boton" id="empezar" type="button">Empezar</button></div>
        <p class="menor" style="margin-top:10px">Se puede entrar en cualquier momento, también con la roca en marcha.</p>`;
      panel.querySelector('#empezar').addEventListener('click', () => cliente?.enviar({ t: 'empezar' }));
    } else {
      panel.innerHTML = `
        <p class="menor" style="margin:0">Sala</p>
        <div class="codigo">${codigo}</div>
        <p>${cuantas()} La partida empieza cuando la abra quien creó la sala.</p>
        <label for="nombre">Tu nombre <span class="menor">(opcional)</span></label>
        <input id="nombre" maxlength="18" autocomplete="off" value="${esc(leerNombre())}">`;
      const nombre = panel.querySelector('#nombre');
      nombre.addEventListener('change', () => {
        guardarNombre(nombre.value.trim());
        cliente?.enviar({ t: 'nombre', nombre: nombre.value.trim() });
      });
    }
    panel.querySelector('[data-cerrar-sala]')?.addEventListener('click', () => { invitarAbierto = false; panelSala(); });
    panel.classList.add('abierto');
  }

  /* Sala de prueba: sin QR; en su lugar, cuántas personas simuladas empujan. */
  function panelPrueba(fase) {
    const sim = cliente?.simuladas?.() ?? 0;
    panel.innerHTML = `
      ${fase !== 'espera' ? '<button class="glifo cerrar" type="button" data-cerrar-sala aria-label="Cerrar">×</button>' : ''}
      <h2>Sala de prueba</h2>
      <p>Tú y ${sim === 1 ? 'una persona simulada' : `${sim} personas simuladas`}. Las reglas son las del servidor; las demás manos las mueve este navegador.</p>
      <div class="botones">
        <button class="boton claro" type="button" data-quitar aria-label="Quitar una persona simulada" ${sim === 0 ? 'disabled' : ''}>− persona</button>
        <button class="boton claro" type="button" data-agregar aria-label="Agregar una persona simulada" ${sim >= cliente?.maximo ? 'disabled' : ''}>+ persona</button>
        ${fase === 'espera' ? '<button class="boton" id="empezar" type="button">Empezar</button>' : ''}
      </div>`;
    panel.querySelector('[data-quitar]').addEventListener('click', () => { cliente.quitar(); });
    panel.querySelector('[data-agregar]').addEventListener('click', () => { cliente.agregar(); });
    panel.querySelector('#empezar')?.addEventListener('click', () => cliente.enviar({ t: 'empezar' }));
    panel.querySelector('[data-cerrar-sala]')?.addEventListener('click', () => { invitarAbierto = false; panelSala(); });
    panel.classList.add('abierto');
  }

  const onInvitar = () => { invitarAbierto = !invitarAbierto; panelSala(); };
  botonInvitar.addEventListener('click', onInvitar);
  if (prueba) { botonInvitar.setAttribute('aria-label', 'Personas simuladas'); botonInvitar.title = 'Personas simuladas'; }

  function pintarConexion() {
    const textos = {
      conectando: 'conectando…',
      conectada: prueba
        ? `sala de prueba · tú y ${Math.max(0, conectadas().length - 1)} simuladas`
        : `sala ${codigo} · ${conectadas().length} ${conectadas().length === 1 ? 'persona' : 'personas'}`,
      reconectando: 'reconectando…',
      'sin-señal': 'sin señal…',
      'sin-conexion': 'sin conexión',
      'no-existe': `No existe la sala ${codigo}.`,
      llena: 'La sala está llena.',
    };
    lineaConexion.innerHTML = esc(textos[estadoConexion] || '');
    if (estadoConexion === 'sin-conexion') {
      lineaConexion.insertAdjacentHTML('beforeend', ' — <button type="button">reintentar</button>');
      lineaConexion.querySelector('button').addEventListener('click', () => cliente.reintentar());
    }
    if (estadoConexion === 'no-existe' || estadoConexion === 'llena') {
      lineaConexion.insertAdjacentHTML('beforeend', ' <a href="#comunidad" style="pointer-events:auto">Crear otra</a>');
    }
  }

  /* ── red ──────────────────────────────────────────────────── */

  function alMensaje(m) {
    if (m.t === 'hola') { yo = m.n; }
    else if (m.t === 'sala') {
      const antes = roster.fase;
      roster = m;
      if (m.fase === 'espera' && antes !== 'espera') { cierreMostrado = false; app.cerrarCierre(); app.narrativa.callar(); }
      if (m.fase === 'juego' && antes !== 'juego') { app.pista('toca para empujar'); invitarAbierto = false; }
      panelSala();
      pintarConexion();
    } else if (m.t === 'e') {
      st = m;
      energia.estado(m);
      // Impulsos de otras personas: un trazo por toque aceptado.
      for (const [n] of m.tq) {
        if (n === yo) continue;
        const f = vista.figuras.get(n);
        if (!f) continue;
        f.golpe = 1;
        if (f.pie != null) polvo.levantar(f.pie, perfil(f.pie), 2, 0.7, -1);
        if (f.pecho && vista.c) energia.toqueRemoto(f.pecho, D.apoyo(vista.c, CUERPOS.radioRoca, f.pecho.x, f.pecho.y), n);
      }
      if (m.tq.some(([n]) => n !== yo)) sonido.pulso();
      if (energia.cuenta.rushes > rushesVistos) { rushesVistos = energia.cuenta.rushes; L.sacudir(3); }
    } else if (m.t === 'evento' && m.e === 'cima') {
      app.anunciar('La roca llegó a la cima.');
      L.sacudir(7);
      polvo.levantar(largo, perfil(largo), 16, 2.2);
      sonido.retumbo();
    }
  }

  if (prueba) {
    cliente = salaLocal({
      id, nombre: leerNombre, alMensaje,
      alEstado(e) { estadoConexion = e; pintarConexion(); },
    });
  } else if (codigo) {
    if (!CODIGO.test(codigo)) {
      estadoConexion = 'no-existe'; pintarConexion();
    } else {
      cliente = conectar({
        codigo, id, nombre: leerNombre,
        alMensaje,
        alEstado(e) { estadoConexion = e; pintarConexion(); if (e === 'no-existe') panel.classList.remove('abierto'); },
      });
    }
  } else {
    panelInicio();
  }

  /* ── toques ───────────────────────────────────────────────── */

  const soltarEntrada = escucharToques(app.escena, (t) => {
    if (!st || roster.fase !== 'juego' || estadoConexion !== 'conectada') return;
    if (!tocar(propio, t / 1000, ESFUERZO)) return;
    cliente.enviar({ t: 'toque' });
    app.pista(null);
    const f = vista.figuras.get(yo);
    if (f) {
      f.golpe = 1;
      if (f.pie != null) polvo.levantar(f.pie, perfil(f.pie), 3, 1, -1);
      if (f.pecho && vista.c) energia.toquePropio(f.pecho, D.apoyo(vista.c, CUERPOS.radioRoca, f.pecho.x, f.pecho.y));
    }
    sonido.golpe(0.5);
    if (navigator.vibrate) navigator.vibrate(8);
  });

  /* ── cuadro ───────────────────────────────────────────────── */

  Object.assign(L.cam, encuadrar(L, caja, { x: 0, y: 1 }, { anchoMinimo: 10.5, abajo: 90 }));

  const parar = bucle((dt) => {
    // Sin estados durante más de un segundo: la energía se apaga, no se inventa.
    if (cliente && st && cliente.silencioMs() > 1000) {
      energia.sinSenal();
      if (estadoConexion === 'conectada') { estadoConexion = 'sin-señal'; pintarConexion(); }
    } else if (estadoConexion === 'sin-señal' && cliente?.estado() === 'conectada') {
      estadoConexion = 'conectada'; pintarConexion();
    }
    energia.actualizar(dt);
    polvo.actualizar(dt);
    L.calmar(dt);

    // La roca va hacia donde la sala dice, con un poco de anticipación por su velocidad.
    if (st) {
      const meta = st.x + st.v * 0.06;
      if (Math.abs(meta - vista.x) > 2) vista.x = meta;
      const antes = vista.x;
      vista.x = acercar(vista.x, meta, 12, dt);
      vista.s += vista.x - antes;
    }
    if (st && st.f === 'cima' && !cierreMostrado) {
      cierreMostrado = true;
      app.pista(null);
      setTimeout(() => {
        if (roster.fase !== 'cima') return;
        app.cierre('La roca se queda arriba.', soyAnfitrion()
          ? [{ texto: 'otra vez', accion: () => cliente.enviar({ t: 'reiniciar' }) }, { texto: 'índice', accion: 'indice', claro: true }]
          : [{ texto: 'índice', accion: 'indice', claro: true }]);
      }, reducido ? 200 : 2200);
    }

    const c = D.centroRoca(perfil, vista.x);
    vista.c = c;
    // Con el panel abierto en un teléfono, la escena sube para no quedar debajo.
    const tapa = panel.classList.contains('abierto') && L.ancho < 900 ? panel.offsetHeight + 24 : 90;
    abajo = acercar(abajo, tapa, 4, dt);
    const meta = encuadrar(L, caja, c, { anchoMinimo: 10.5, abajo });
    L.cam.k = meta.k;
    L.cam.x = acercar(L.cam.x, meta.x, 3, dt);
    L.cam.y = acercar(L.cam.y, meta.y, 3, dt);
    dibujar(c, dt);
  });

  function dibujar(c, dt) {
    D.fondo(L);
    D.suelo(L, perfil);
    energia.dibujarDetras(L, c, CUERPOS.radioRoca, perfil, vista.x);

    // Figuras: una por persona conectada, en dos filas que se empujan unas a otras.
    const personas = conectadas().slice().sort((a, b) => a.n - b.n);
    const esfuerzos = new Map(st ? st.es : []);
    const fase = roster.fase;
    const enMarcha = fase === 'juego';
    const sep = CUERPOS.separacion;
    const huecos = personas.map((p, i) => {
      const fila = i % 2, col = Math.floor(i / 2);
      return { p, fila, col, x: vista.x - sep - col * 0.95 - fila * 0.47 };
    });
    // atrás primero
    huecos.sort((a, b) => b.fila - a.fila || b.col - a.col);
    const delante = new Map(huecos.map((h) => [`${h.fila}-${h.col}`, h]));
    for (const h of huecos) {
      let f = vista.figuras.get(h.p.n);
      if (!f) { f = { golpe: 0, incl: 0 }; vista.figuras.set(h.p.n, f); }
      const e = esfuerzos.get(h.p.n) || 0;
      f.incl = acercar(f.incl, enMarcha ? Math.min(1, e / 0.6) : 0, 6, dt);
      f.golpe = acercar(f.golpe, 0, 9, dt);
      const hombro = { x: h.x + 0.42, y: D.alturaHombros(perfil, h.x) };
      let manos = null;
      if (!enMarcha) { /* en la espera y en la cima, los brazos descansan */ }
      else if (h.col === 0) manos = D.apoyo(c, CUERPOS.radioRoca, hombro.x, hombro.y);
      else {
        const otro = delante.get(`${h.fila}-${h.col - 1}`);
        if (otro) manos = { x: otro.x - 0.12, y: D.alturaHombros(perfil, otro.x) - 0.2 };
      }
      const destello = energia.destellos.has(h.p.n);
      const esYo = h.p.n === yo;
      D.figura(L, perfil, {
        x: h.x, mira: 1,
        pose: enMarcha ? 'empuja' : 'quieto',
        inclinacion: f.incl, golpe: f.golpe, mov: enMarcha ? Math.min(1, Math.abs(st?.v || 0) * 3) : 0,
        zancada: vista.s + h.p.n * 0.37,
        manos,
      }, {
        contorno: esYo ? D.C.hueso : h.fila ? D.C.arcilla : null,
        grosorContorno: esYo ? 0.045 : 0.03,
        relleno: destello ? D.C.senal : null,
      });
      f.pecho = { x: h.x + 0.3, y: perfil(h.x) + 1.25 };
      f.pie = h.x - 0.35;
      // «tú» siempre; los nombres solo en la sala de espera, escalonados para no encimarse.
      const etiqueta = esYo ? 'tú' : fase === 'espera' ? h.p.nombre : '';
      if (etiqueta) D.rotulo(L, h.x + 0.2, perfil(h.x) + 2.1 + (huecos.indexOf(h) % 3) * 0.32, etiqueta);
    }
    D.roca(L, forma, c, CUERPOS.radioRoca, -vista.s / CUERPOS.radioRoca, energia.roca());
    polvo.dibujar(L);
    energia.dibujarDelante(L, c, CUERPOS.radioRoca);
    D.friso(L);
  }

  return {
    reiniciar() { if (soyAnfitrion()) cliente?.enviar({ t: 'reiniciar' }); },
    desmontar() {
      parar(); soltarEntrada();
      cliente?.cerrar();
      botonInvitar.removeEventListener('click', onInvitar);
      botonInvitar.setAttribute('aria-label', 'Mostrar código para invitar'); botonInvitar.title = 'Invitar';
      panel.classList.remove('abierto'); panel.innerHTML = '';
      lineaConexion.textContent = '';
      document.body.classList.remove('en-comunidad', 'anfitrion');
      app.cerrarCierre(); app.narrativa.limpiar(); app.pista(null);
      if (depurar) delete window.__sisifo;
    },
  };
}
