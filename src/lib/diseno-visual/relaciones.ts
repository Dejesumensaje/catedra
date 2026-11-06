/* ------------------------------------------------------------------
   Resolver conceptos y relaciones de /diseno-visual en el build.
------------------------------------------------------------------ */
import { getCollection, type CollectionEntry } from 'astro:content';
import { territorios, nombrePrevisto, type Territorio } from '../../data/diseno-visual/territorios';

export type Concepto = CollectionEntry<'conceptos'>;

export const BASE = '/diseno-visual';

export const rutaConcepto = (slug: string) => `${BASE}/${slug}`;
export const rutaTerritorio = (id: string) => `${BASE}#${id}`;

export async function conceptos(): Promise<Concepto[]> {
  return (await getCollection('conceptos')).sort((a, b) => a.data.orden - b.data.orden);
}

export interface ItemTerritorio {
  slug: string;
  nombre: string;
  entrada?: Concepto;
}

/** Lista de un territorio: lo previsto, en su orden, más cualquier entrada nueva. */
export function itemsDe(territorio: Territorio, todas: Concepto[]): ItemTerritorio[] {
  const porSlug = new Map(todas.map((c) => [c.id, c]));
  const previstos: ItemTerritorio[] = territorio.conceptos.map((c) => ({
    slug: c.slug,
    nombre: porSlug.get(c.slug)?.data.titulo ?? c.nombre,
    entrada: porSlug.get(c.slug),
  }));
  const extra = todas
    .filter((c) => c.data.territorio === territorio.id && !territorio.conceptos.some((p) => p.slug === c.id))
    .map((c) => ({ slug: c.id, nombre: c.data.titulo, entrada: c }));
  return [...previstos, ...extra];
}

export interface RelacionResuelta {
  slug: string;
  nombre: string;
  porQue: string;
  href?: string;
}

export function resolverRelaciones(concepto: Concepto, todas: Concepto[]): RelacionResuelta[] {
  const porSlug = new Map(todas.map((c) => [c.id, c]));
  return concepto.data.relaciones.map((r) => {
    const destino = porSlug.get(r.concepto);
    const nombre = destino?.data.titulo ?? nombrePrevisto(r.concepto);
    if (!nombre) {
      throw new Error(
        `La relación «${r.concepto}» de ${concepto.id} no apunta a ninguna entrada ni a un concepto previsto en territorios.ts.`,
      );
    }
    return { slug: r.concepto, nombre, porQue: r.porQue, href: destino ? rutaConcepto(destino.id) : undefined };
  });
}

export function territorioPorId(id: string): Territorio {
  return territorios.find((t) => t.id === id)!;
}

export interface PasoRuta {
  slug: string;
  porque: string;
}

export const RUTA_INICIAL: PasoRuta[] = [
  { slug: 'proximidad', porque: 'Empieza aquí: cómo la distancia agrupa lo que va junto.' },
  { slug: 'semejanza', porque: 'Qué pasa cuando el parecido dice otra cosa que la distancia.' },
  { slug: 'escalas-tipograficas', porque: 'Cómo el tamaño ordena qué se lee primero, segundo y tercero.' },
  { slug: 'interaccion-del-color', porque: 'Por qué ningún color se ve solo y cómo probar que el texto se lea.' },
  { slug: 'reticulas-y-alineacion', porque: 'Las columnas invisibles que sostienen todos los bloques de una página.' },
  { slug: 'sistemas-y-excepciones', porque: 'Cómo compartir reglas entre muchas piezas y romper una con intención.' },
  { slug: 'enfasis', porque: 'Cómo construir un único centro de atención sin que toda la página grite.' },
];

export interface VecinosRuta {
  indice: number;
  total: number;
  actual?: PasoRuta & { entrada: Concepto };
  anterior?: PasoRuta & { entrada: Concepto };
  siguiente?: PasoRuta & { entrada: Concepto };
}

export function vecinosEnRuta(slug: string, todas: Concepto[]): VecinosRuta | null {
  const porSlug = new Map(todas.map((c) => [c.id, c]));
  const resuelta = RUTA_INICIAL
    .map((r) => ({ ...r, entrada: porSlug.get(r.slug) }))
    .filter((r): r is PasoRuta & { entrada: Concepto } => Boolean(r.entrada));
  const idx = resuelta.findIndex((r) => r.slug === slug);
  if (idx === -1) return null;
  return {
    indice: idx + 1,
    total: resuelta.length,
    actual: resuelta[idx],
    anterior: idx > 0 ? resuelta[idx - 1] : undefined,
    siguiente: idx < resuelta.length - 1 ? resuelta[idx + 1] : undefined,
  };
}
