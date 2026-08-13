/**
 * Vocabulario y utilidades del ejercicio de bitácoras (sesión 2).
 *
 * Vive aquí y no dentro de cada página porque los dos formularios y el
 * dashboard tienen que estar de acuerdo en tres cosas: cómo se convierte un
 * nombre en llave, qué categorías existen y cómo se llaman los tipos de
 * experiencia. Si se desincronizan, el emparejamiento m1 ↔ m2 se rompe en
 * silencio y no hay forma de notarlo hasta que ya pasó la clase.
 */

/** La sesión a la que pertenece esta corrida. Prefija todas las llaves en KV. */
export const SESION = 'ps3-s02';

/**
 * Nombre → llave estable. Sin tildes, sin espacios, sin mayúsculas.
 * El valor que sale de aquí es lo único que liga el momento 1 con el 2, así
 * que no puede depender de cómo esté escrito el nombre en el archivo: si
 * mañana se corrige una tilde en el roster, la llave no debe cambiar.
 */
export function llaveEstudiante(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quita los diacriticos que suelta NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Los tres tipos de experiencia que se pidieron en la bitácora, cada uno con
 * su propia redacción para el momento 2.
 *
 * El orden importa: es el orden en que aparecen en los dos formularios, y el
 * m2 precarga las etiquetas asumiendo que el m1 las guardó en este orden.
 *
 * Una de las tres experiencias salió bien: no falló, no se rompió y no hay a
 * quién culpar. Preguntarle «¿qué falló?» a la experiencia que dio confianza
 * no tiene respuesta posible, y forzarla ensucia un tercio de los datos.
 *
 * Se pregunta distinto y se guarda igual: los tres campos son los mismos, así
 * que los conteos y el emparejamiento no cambian. Y la asimetría que aparece
 * —a quién se le atribuye el acierto frente a quién carga con la falla— es más
 * interesante que preguntar solo por la culpa.
 */
export const TIPOS = [
  {
    id: 'confianza',
    titulo: 'La que te dio confianza',
    pista: 'Algo que usaste y supiste qué hacer de una, sin dudar.',
    salioBien: true,
    preguntas: {
      categoria: 'Qué hizo que funcionara',
      cuando: 'Cuándo supiste qué hacer',
      atribucion: 'De quién fue el mérito',
    },
  },
  {
    id: 'duda',
    titulo: 'La que te hizo dudar',
    pista: 'Algo donde te detuviste a pensar, o probaste a ver qué pasaba.',
    salioBien: false,
    preguntas: {
      categoria: 'Qué faltó, sobre todo',
      cuando: 'Cuándo te quedaste sin saber',
      atribucion: 'De quién fue la duda',
    },
  },
  {
    id: 'frustracion',
    titulo: 'La que te frustró',
    pista: 'Algo que no salió, o salió mal, o te tocó repetir.',
    salioBien: false,
    preguntas: {
      categoria: 'Qué falló, sobre todo',
      cuando: 'Cuándo se rompió',
      atribucion: 'De quién fue la culpa',
    },
  },
] as const;

/**
 * Las cinco categorías del momento 2. Los `id` son ASCII a propósito: viajan
 * en JSON, se guardan en KV y se cuentan en el dashboard; una eñe o una tilde
 * en una llave es una fuente de errores gratis.
 *
 * La glosa no es decorativa. El estudiante acaba de aprender la palabra hace
 * dos horas: sin la frase corta al lado, clasifica al azar y el dato no sirve.
 * Van en neutro —qué mira cada concepto, no si salió bien o mal— para que la
 * misma lista sirva para las tres experiencias.
 */
export const CATEGORIAS = [
  { id: 'affordance', nombre: 'Affordance', glosa: 'Lo que el objeto permitía hacer.' },
  { id: 'significante', nombre: 'Significante', glosa: 'La señal que lo decía.' },
  { id: 'restriccion', nombre: 'Restricción', glosa: 'Lo que el objeto impedía hacer.' },
  { id: 'mapping', nombre: 'Mapping', glosa: 'Qué control correspondía con qué efecto.' },
  { id: 'retroalimentacion', nombre: 'Retroalimentación', glosa: 'Lo que el objeto respondió.' },
] as const;

/** En qué momento se jugó: es la forma concreta de los dos golfos de Norman.
 *  La glosa cambia de signo según la experiencia haya salido bien o mal. */
export const CUANDOS = [
  {
    id: 'antes', nombre: 'Antes de actuar',
    bien: 'Supe qué iba a pasar antes de tocar nada.',
    mal: 'No sabía qué iba a pasar.',
  },
  {
    id: 'durante', nombre: 'Mientras actuaba',
    bien: 'Me fue guiando sobre la marcha.',
    mal: 'Se rompió en el camino.',
  },
  {
    id: 'despues', nombre: 'Después de actuar',
    bien: 'Supe enseguida que había funcionado.',
    mal: 'No supe qué había pasado.',
  },
] as const;

/** A quién se le atribuye lo que pasó: el mérito si salió bien, la culpa si
 *  salió mal. Es la pregunta del ejercicio, y la asimetría entre las dos es
 *  justo lo que se proyecta. */
export const ATRIBUCIONES = [
  { id: 'mia', nombre: 'Mía' },
  { id: 'diseno', nombre: 'Del diseño' },
  { id: 'no-se', nombre: 'No sé' },
] as const;

export type TipoId = (typeof TIPOS)[number]['id'];
export type CategoriaId = (typeof CATEGORIAS)[number]['id'];
export type CuandoId = (typeof CUANDOS)[number]['id'];
export type AtribucionId = (typeof ATRIBUCIONES)[number]['id'];

/** La misma clave del deck. El candado es social, no criptográfico. */
export const CLAVE_CLASE = 'udea2026';

/** Nombre de la marca en localStorage. Con la sesión adentro: el año que viene
 *  la sesión 2 del curso siguiente no debe leer las respuestas de esta. */
export const MARCA_LOCAL = `bitacora:${SESION}`;
