/**
 * Lista del curso. Es el desplegable de los dos formularios de bitácora y la
 * única llave que empareja el momento 1 con el momento 2.
 *
 * ── Cómo se edita ──
 * Una línea por estudiante, entre comillas, con coma al final. El orden de
 * este archivo es el orden del desplegable; alfabético por nombre es lo más
 * fácil de recorrer con el pulgar.
 *
 * ── Por qué escribir el nombre así ──
 * Esto se publica: el HTML del formulario sale del build y queda en el sitio,
 * que es público. Un nombre completo aquí es una lista de clase publicada.
 * La convención por defecto es NOMBRE + INICIAL DEL APELLIDO —suficiente para
 * que cada quien se reconozca, insuficiente para identificar a nadie desde
 * fuera del salón—. Si hay dos «Juan D.», se desempata con la segunda letra
 * («Juan Da.», «Juan De.»), no con el apellido completo.
 *
 * ── Qué NO cambiar a mitad de camino ──
 * La llave de emparejamiento se deriva del texto de esta lista. Si se corrige
 * un nombre entre el momento 1 y el momento 2, ese estudiante deja de
 * emparejarse. Corregir antes de clase o después, nunca en la mitad.
 */

export const ESTUDIANTES: string[] = [
  // ── Reemplazar estas líneas con la lista real del curso ──
  'Ana M.',
  'Camilo R.',
  'Daniela P.',
  'Esteban G.',
  'Juliana V.',
  'Mateo S.',
  'Valentina L.',
];

/**
 * Salida de emergencia para quien no aparezca en la lista (matrícula tardía,
 * un nombre mal escrito, alguien que entró de oyente). Sin esto, esa persona
 * no puede responder y se pierde el dato; con esto responde y queda marcada
 * aparte, sin ensuciar el emparejamiento de los demás.
 */
export const SIN_LISTA = 'no-estoy-en-la-lista';
