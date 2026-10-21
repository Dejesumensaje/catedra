/* ------------------------------------------------------------------
   Territorios de /diseno-visual
   Agrupaciones para orientarse, no compartimentos: un concepto vive en un
   territorio y se cruza con los de otros por sus `relaciones`.

   `conceptos` es el mapa previsto. Si existe un .mdx en
   src/content/conceptos/ con ese `slug`, el índice lo enlaza; si no, lo
   lista como «en preparación». Una entrada nueva cuyo slug no esté aquí
   aparece igual al final de su territorio: añadir un concepto es escribir
   un .mdx, no tocar este archivo.
------------------------------------------------------------------ */

export interface ConceptoPrevisto {
  slug: string;
  nombre: string;
}

export interface Territorio {
  id: string;
  nombre: string;
  pregunta: string;
  conceptos: ConceptoPrevisto[];
}

export const territorios = [
  {
    id: 'percepcion',
    nombre: 'Percepción',
    pregunta: 'Cómo organizamos lo que vemos antes de leerlo.',
    conceptos: [
      { slug: 'gestalt', nombre: 'Gestalt' },
      { slug: 'proximidad', nombre: 'Proximidad' },
      { slug: 'semejanza', nombre: 'Semejanza' },
      { slug: 'region-comun', nombre: 'Región común' },
      { slug: 'continuidad', nombre: 'Continuidad' },
      { slug: 'cierre', nombre: 'Cierre' },
      { slug: 'figura-fondo', nombre: 'Figura y fondo' },
    ],
  },
  {
    id: 'tipografia',
    nombre: 'Tipografía',
    pregunta: 'Cómo la apariencia del texto influye en lo que leemos y en qué orden.',
    conceptos: [
      { slug: 'escalas-tipograficas', nombre: 'Escalas tipográficas' },
      { slug: 'jerarquia', nombre: 'Jerarquía' },
      { slug: 'familias-tipograficas', nombre: 'Familias tipográficas' },
      { slug: 'peso-y-contraste', nombre: 'Peso y contraste' },
      { slug: 'interlineado', nombre: 'Interlineado' },
      { slug: 'ancho-de-linea', nombre: 'Ancho de línea' },
      { slug: 'ritmo-tipografico', nombre: 'Ritmo tipográfico' },
      { slug: 'legibilidad', nombre: 'Legibilidad' },
    ],
  },
  {
    id: 'color',
    nombre: 'Color',
    pregunta: 'Cómo percibimos los colores en relación con lo que los rodea.',
    conceptos: [
      { slug: 'interaccion-del-color', nombre: 'Interacción del color' },
      { slug: 'contraste', nombre: 'Contraste' },
      { slug: 'armonia', nombre: 'Armonía' },
      { slug: 'roles-semanticos', nombre: 'Roles semánticos' },
      { slug: 'accesibilidad-del-color', nombre: 'Accesibilidad' },
      { slug: 'dependencia-del-contexto', nombre: 'Dependencia del contexto' },
    ],
  },
  {
    id: 'composicion',
    nombre: 'Composición',
    pregunta: 'Cómo la posición y las relaciones entre los elementos organizan una superficie.',
    conceptos: [
      { slug: 'reticulas-y-alineacion', nombre: 'Retículas y alineación' },
      { slug: 'proporcion', nombre: 'Proporción' },
      { slug: 'equilibrio', nombre: 'Equilibrio' },
      { slug: 'espacio-negativo', nombre: 'Espacio negativo' },
      { slug: 'densidad-visual', nombre: 'Densidad visual' },
    ],
  },
  {
    id: 'sistemas',
    nombre: 'Sistemas',
    pregunta: 'Cómo construir reglas compartidas y decidir cuándo una pieza puede apartarse de ellas.',
    conceptos: [
      { slug: 'sistemas-y-excepciones', nombre: 'Sistemas y excepciones' },
      { slug: 'tokens', nombre: 'Tokens' },
      { slug: 'componentes', nombre: 'Componentes' },
      { slug: 'patrones', nombre: 'Patrones' },
      { slug: 'variantes', nombre: 'Variantes' },
    ],
  },
  {
    id: 'expresion',
    nombre: 'Expresión',
    pregunta: 'Cómo una decisión visual puede alterar las reglas y cambiar el sentido de una composición.',
    conceptos: [
      { slug: 'enfasis', nombre: 'Énfasis' },
      { slug: 'tension', nombre: 'Tensión' },
      { slug: 'asimetria', nombre: 'Asimetría' },
      { slug: 'ruptura', nombre: 'Ruptura' },
      { slug: 'ambiguedad', nombre: 'Ambigüedad' },
      { slug: 'extranamiento', nombre: 'Extrañamiento' },
    ],
  },
] as const satisfies readonly Territorio[];

export type IdTerritorio = (typeof territorios)[number]['id'];

export const idsTerritorio = territorios.map((t) => t.id) as [IdTerritorio, ...IdTerritorio[]];

export const modos = ['laboratorio', 'comparacion', 'diseccion', 'provocacion'] as const;
export type Modo = (typeof modos)[number];

export const nombreModo: Record<Modo, string> = {
  laboratorio: 'Laboratorio',
  comparacion: 'Comparación',
  diseccion: 'Disección',
  provocacion: 'Provocación',
};

/** Nombre legible de un slug previsto, para relaciones hacia conceptos sin entrada. */
export function nombrePrevisto(slug: string): string | undefined {
  for (const t of territorios) {
    const c = t.conceptos.find((c) => c.slug === slug);
    if (c) return c.nombre;
  }
  return undefined;
}

export function territorioDe(slug: string): Territorio | undefined {
  return territorios.find((t) => t.conceptos.some((c) => c.slug === slug));
}
