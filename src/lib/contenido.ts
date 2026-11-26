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

/**
 * El estado que se muestra de una sesión se deriva de lo que existe, no del
 * campo `estado`, que en 2026-2 no se mantuvo: una sesión con memoria tiene
 * memoria; una con presentación, presentación; las demás, ninguna de las dos.
 */
export type EstadoVisible = 'con-memoria' | 'con-presentacion' | 'sin-presentacion';

export function estadoVisible(sesion: CollectionEntry<'sesiones'>): EstadoVisible {
  if (sesion.data.memoria) return 'con-memoria';
  if (sesion.data.presentacion) return 'con-presentacion';
  return 'sin-presentacion';
}

export const etiquetaEstado: Record<EstadoVisible, string> = {
  'con-memoria': 'Con memoria',
  'con-presentacion': 'Con presentación',
  'sin-presentacion': 'Sin presentación',
};

type Fase = CollectionEntry<'cursos'>['data']['fases'][number];

/** La fase del arco a la que pertenece una sesión, si el curso las define. */
export function faseDeSesion(
  curso: CollectionEntry<'cursos'>,
  numero: number,
): Fase | undefined {
  return curso.data.fases.find((f) => numero >= f.desde && numero <= f.hasta);
}

/** "S01–S05", o "S06" si la fase es de una sola sesión. */
export function rangoFase(fase: Fase): string {
  const desde = numeroSesion(fase.desde).toUpperCase();
  return fase.desde === fase.hasta
    ? desde
    : `${desde}–${numeroSesion(fase.hasta).toUpperCase()}`;
}
