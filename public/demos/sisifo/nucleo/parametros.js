/* Parámetros de equilibrio — el único lugar donde se ajusta cómo se siente cada regla.
 *
 * Unidades: metros, segundos, metros/segundo². La fuerza se expresa como
 * aceleración (la roca tiene masa 1), así que «fuerza» y «gravedad» se comparan
 * directamente: la roca sube cuando fuerza > gravedad · seno(pendiente).
 *
 * El navegador y el servidor multijugador importan este mismo archivo.
 * Cambiar un número aquí cambia el juego en los dos lados a la vez.
 * Antes de tocar la comunidad, correr `node scripts/prueba-sisifo-reglas.mjs`:
 * imprime la tabla de cuánto sube la roca según cuántas personas y a qué ritmo.
 */

/* Cómo un toque se vuelve esfuerzo. Común a las cuatro versiones.
 * Cada toque suma `impulso`, con rendimiento decreciente cerca de `maximo`;
 * el esfuerzo se disipa con constante de tiempo `tau`. Toques más seguidos que
 * `intervaloMin` no cuentan: así tocar más rápido que ~8 veces por segundo casi
 * no rinde y por encima de 10 no cuenta, y nadie necesita velocidad extrema.
 *
 * Esfuerzo medio sostenido según el ritmo (con estos valores):
 *   2 toques/s ≈ 0,33   4/s ≈ 0,50   6/s ≈ 0,60   8/s ≈ 0,66 (techo práctico)
 */
export const ESFUERZO = {
  impulso: 0.35,
  maximo: 1,
  tau: 0.6,
  intervaloMin: 0.1,
};

/* La figura y la roca, en metros. La roca es grande respecto a la persona. */
export const CUERPOS = {
  alturaFigura: 1.8,
  radioRoca: 1.3,
  separacion: 2.45,          // de los pies al punto donde la roca toca el suelo
};

/* 1 · El castigo
 * Pendiente de `largo` metros que se empina en el último tramo. Con 2 toques/s
 * la roca no sube; con 4/s sube despacio; con 6/s, con decisión. Al llegar a la
 * cima no hay victoria: tras `pausaCima` segundos la roca cae con poco
 * rozamiento (`arrastreCaida`), mucho más rápido de lo que subió.
 */
export const CASTIGO = {
  largo: 10,
  pendienteBase: 0.55,       // tangente del tramo principal (~29°)
  inicioEmpinado: 7.5,       // desde aquí la cuesta se empina
  curvaEmpinado: 0.035,       // cuánto se empina (cuadrático)
  gravedad: 3.1,
  fuerza: 3.6,               // aceleración por unidad de esfuerzo
  golpe: 0.07,               // m/s que suma cada toque en el acto: el ritmo de la mano se ve en la roca
  arrastre: 1.2,             // rozamiento proporcional a la velocidad al subir
  rodadura: 0.12,            // rozamiento constante: sin toques la roca vuelve despacio
  pausaCima: 0.9,            // segundos que la roca se sostiene arriba antes de caer
  arrastreCaida: 0.12,
  arrastreValle: 1.6,        // amortigua el vaivén cuando la roca llega abajo
  pasoBajada: 1.7,           // m/s de Sísifo cuando baja a buscar la roca
};

/* 2 · El camino
 * Un camino ondulado sin fin. La rodadura es mayor que la pendiente más empinada,
 * así que si dejas de empujar la roca se queda donde está: parar no castiga.
 */
export const CAMINO = {
  pendienteMedia: 0.06,
  ondas: [                   // [amplitud m, longitud de onda m]
    [0.5, 37],
    [0.22, 15.5],
    [0.07, 6.3],
  ],
  gravedad: 3.1,
  fuerza: 3.6,
  golpe: 0.07,
  arrastre: 1.0,
  rodadura: 1.05,
  /* Frases: la primera después de `primeraTras` s jugando y `primeraMetros`
   * recorridos; luego al menos `separacion` s y `separacionMetros` entre una y otra. */
  primeraTras: 22,
  primeraMetros: 14,
  separacion: 34,
  separacionMetros: 22,
  quietoParaHablar: 9,       // segundos sin empujar antes de la frase de la quietud
};

/* 3 · La caída
 * La roca empieza arriba y cae sola. Tocar frena (nunca empuja hacia arriba).
 * En los tramos empinados el freno máximo no alcanza a la gravedad: solo se
 * retrasa la caída. En las dos mesetas sí alcanza, pero sostenerla quieta gasta
 * el agarre y la roca termina por ceder.
 */
export const CAIDA = {
  largo: 10,
  tramos: [                  // [desde x, tangente] de abajo hacia arriba
    [0, 0.58],
    [2.2, 0.15],             // meseta baja
    [3.7, 0.72],
    [5.8, 0.17],             // meseta alta
    [7.3, 0.78],
  ],
  suavizado: 0.35,           // metros de transición entre tramos
  gravedad: 3.1,
  freno: 2.0,                // aceleración de freno por unidad de esfuerzo
  mordida: 0.1,              // fracción de la velocidad que cada toque le quita en el acto
  rodadura: 0.12,
  arrastre: 0.9,
  desgasteAgarre: 0.12,     // por segundo y por unidad de esfuerzo, mientras se sostiene quieta
  recuperaAgarre: 0.06,      // por segundo mientras no se sostiene
  resbalon: 0.45,            // fracción de agarre que queda cuando la roca cede
  agarreMinimo: 0.08,
  esperaInicial: 1.1,        // segundos antes de que empiece a caer (sin pedir nada)
};

/* 4 · La comunidad
 * La cuesta se empina con la altura: tangente = base + extra · (x/largo)^curva.
 * La fuerza es la suma de los esfuerzos de las personas activas, cada uno con
 * `techoPersona` como máximo, para que nadie domine con un dispositivo raro.
 * El objetivo de diseño (verificado por simulación, ver la tabla en LEEME):
 *   una persona, aun tocando al máximo, se queda a mitad de camino o antes;
 *   tres personas a ritmo cómodo llegan; dos es posible pero muy duro.
 */
export const COMUNIDAD = {
  largo: 12,
  pendienteBase: 0.16,
  pendienteExtra: 0.7,
  curva: 1.3,
  gravedad: 5,
  fuerza: 2.5,
  golpe: 0.015,              // m/s por toque aceptado (el servidor ya limita la frecuencia)
  techoPersona: 0.7,
  arrastre: 5,
  rodadura: 0.15,
  /* Servidor */
  hz: 20,                    // pasos de simulación por segundo
  silencioMax: 6,            // s sin mensajes: la persona deja de contar y se la desconecta
  graciaReconexion: 45,      // s que se guarda el lugar de quien se cayó de la red
  maxPersonas: 24,
  /* Energía colectiva (solo representación, no toca la física) */
  ventanaCoincidencia: 0.4,  // s: personas distintas que tocaron en esta ventana
  umbralRush: 3,             // coincidencia que dispara el rush…
  umbralRushPequeno: 2,      // …o esta, si hay 3 personas o menos activas
  enfriamientoRush: 1.5,
};
