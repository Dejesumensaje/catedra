import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Zod valida una entrada a la vez. Lo que no puede validar es la relación
 * entre entradas: que las evaluaciones de un curso sumen 100%. Eso se
 * verifica aquí, en el momento de leerlas, para que el build falle.
 */
export async function evaluacionesDeCurso(
  cursoId: string,
): Promise<CollectionEntry<'evaluaciones'>[]> {
  const evaluaciones = (
    await getCollection('evaluaciones', (e) => e.data.curso.id === cursoId)
  ).sort((a, b) => a.data.numero - b.data.numero);

  if (evaluaciones.length === 0) return evaluaciones;

  const total = evaluaciones.reduce((suma, e) => suma + e.data.porcentaje, 0);
  if (total !== 100) {
    throw new Error(
      `Las evaluaciones de "${cursoId}" suman ${total}%, deben sumar 100%. ` +
        `Revisa src/content/evaluaciones/.`,
    );
  }

  return evaluaciones;
}

/** La evaluación a la que pertenece una sesión, si hay alguna. */
export async function evaluacionDeSesion(
  cursoId: string,
  numero: number,
): Promise<CollectionEntry<'evaluaciones'> | undefined> {
  const evaluaciones = await evaluacionesDeCurso(cursoId);
  return evaluaciones.find((e) => e.data.sesiones.includes(numero));
}

/** "7" → "s07". Las rutas y los nombres de archivo usan dos dígitos. */
export function numeroSesion(numero: number): string {
  return `s${String(numero).padStart(2, '0')}`;
}
