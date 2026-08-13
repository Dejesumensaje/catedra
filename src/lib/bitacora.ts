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
 * Los tres tipos de experiencia que se pidieron en la bitácora.
 * El orden importa: es el orden en que aparecen en los dos formularios, y el
 * m2 precarga las etiquetas asumiendo que el m1 las guardó en este orden.
 */
export const TIPOS = [
  {
    id: 'confianza',
    titulo: 'La que te dio confianza',
    pista: 'Algo que usaste y supiste qué hacer de una, sin dudar.',
  },
  {
    id: 'duda',
    titulo: 'La que te hizo dudar',
    pista: 'Algo donde te detuviste a pensar, o probaste a ver qué pasaba.',
  },
  {
    id: 'frustracion',
    titulo: 'La que te frustró',
    pista: 'Algo que no salió, o salió mal, o te tocó repetir.',
  },
] as const;

/**
 * Las cinco categorías del momento 2. Los `id` son ASCII a propósito: viajan
 * en JSON, se guardan en KV y se cuentan en el dashboard; una eñe o una tilde
 * en una llave es una fuente de errores gratis.
 *
 * La glosa no es decorativa. El estudiante acaba de aprender la palabra hace
 * dos horas: sin la frase corta al lado, clasifica al azar y el dato no sirve.
 */
export const CATEGORIAS = [
  { id: 'affordance', nombre: 'Affordance', glosa: 'Lo que el objeto permitía hacer.' },
  { id: 'significante', nombre: 'Significante', glosa: 'La señal que lo decía (o que faltaba).' },
  { id: 'restriccion', nombre: 'Restricción', glosa: 'Lo que el objeto impedía hacer.' },
  { id: 'mapping', nombre: 'Mapping', glosa: 'Qué control correspondía con qué efecto.' },
  { id: 'retroalimentacion', nombre: 'Retroalimentación', glosa: 'Lo que el objeto respondió, o no respondió.' },
] as const;

/** Cuándo se rompió: es la forma concreta de los dos golfos de Norman. */
export const CUANDOS = [
  { id: 'antes', nombre: 'Antes de actuar', glosa: 'No sabía qué iba a pasar.' },
  { id: 'durante', nombre: 'Mientras actuaba', glosa: 'Se rompió en el camino.' },
  { id: 'despues', nombre: 'Después de actuar', glosa: 'No supe qué había pasado.' },
] as const;

/** La pregunta que importa: a quién se le atribuye el error. */
export const CULPAS = [
  { id: 'mia', nombre: 'Mía' },
  { id: 'diseno', nombre: 'Del diseño' },
  { id: 'no-se', nombre: 'No sé' },
] as const;

export type TipoId = (typeof TIPOS)[number]['id'];
export type CategoriaId = (typeof CATEGORIAS)[number]['id'];
export type CuandoId = (typeof CUANDOS)[number]['id'];
export type CulpaId = (typeof CULPAS)[number]['id'];

/** La misma clave del deck. El candado es social, no criptográfico. */
export const CLAVE_CLASE = 'udea2026';

/** Nombre de la marca en localStorage. Con la sesión adentro: el año que viene
 *  la sesión 2 del curso siguiente no debe leer las respuestas de esta. */
export const MARCA_LOCAL = `bitacora:${SESION}`;
