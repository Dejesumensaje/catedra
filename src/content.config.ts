import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
// `import { z } from 'astro:content'` está deprecado en Astro 7.
import { z } from 'astro/zod';

/* ------------------------------------------------------------------
   Cursos
   Un archivo por curso. Añadir un curso nuevo = un .mdx, cero código.
------------------------------------------------------------------ */
const cursos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/cursos' }),
  schema: z.object({
    titulo: z.string(),
    version: z.string().optional(),          // "3.0"
    subtitulo: z.string().optional(),
    institucion: z.string(),
    programa: z.string(),                    // pregrado / facultad

    // Identificadores. El id del archivo no sirve para las dos cosas:
    // el archivo es pensamiento-sensorial-3, la URL es /pensamiento-sensorial
    // y los decks viven en /presentaciones/ps3/. Explícitos, no derivados.
    //
    // OJO: no llamar `slug` a este campo. El loader `glob` de Astro trata
    // `slug` como reservado y lo usa como id de la entrada, lo que rompe
    // todas las `reference()` sin decir por qué.
    ruta: z.string(),                        // "pensamiento-sensorial" → segmento de URL
    prefijo: z.string(),                     // "ps3" → nombres de archivo y ruta del deck

    periodo: z.object({
      inicio: z.coerce.date(),
      fin: z.coerce.date(),
      etiqueta: z.string(),                  // "2026-2"
    }),
    intensidad: z.object({
      sesiones: z.number().int().positive(),
      horasPorSesion: z.number().positive(),
      modalidad: z.enum(['presencial', 'virtual', 'mixta']).default('presencial'),
    }),
    estado: z.enum(['proximo', 'en-curso', 'archivado']),
    descripcion: z.string(),
    // Texto largo de la página del curso ("El curso"). `descripcion` es la
    // línea corta para tarjeta y meta; `introduccion` es la presentación en
    // la interna. Párrafos separados por línea en blanco.
    introduccion: z.string().optional(),
    preguntaCentral: z.string().optional(),
    propositos: z.array(z.string()).default([]),   // propósitos de formación
    escalaValoracion: z.array(z.object({
      desde: z.number(),
      hasta: z.number(),
      nivel: z.string(),                     // "Sobresaliente"
      descripcion: z.string(),
    })).default([]),
    orden: z.number().int().default(0),      // orden en el hub
  }),
});

/* ------------------------------------------------------------------
   Tensiones
   Específicas de cada curso. Son la navegación transversal del sitio.
------------------------------------------------------------------ */
const tensiones = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/tensiones' }),
  schema: z.object({
    curso: reference('cursos'),
    poloA: z.string(),                       // "Usabilidad"
    poloB: z.string(),                       // "Experiencia"
    pregunta: z.string(),                    // la que introduce la tensión
    orden: z.number().int(),
  }),
});

/* ------------------------------------------------------------------
   Evaluaciones
   Un archivo por evaluación. El frontmatter lleva lo que se navega y se
   enlaza (porcentaje, sesiones, criterios); el cuerpo lleva qué se
   documenta y el desempeño esperado.
------------------------------------------------------------------ */
const evaluaciones = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/evaluaciones' }),
  schema: z.object({
    curso: reference('cursos'),
    numero: z.number().int().positive(),
    titulo: z.string(),
    porcentaje: z.number().positive().max(100),
    sesiones: z.array(z.number().int()).default([]),  // enlaza desde cada sesión
    momento: z.string(),                     // "Sesiones 2–5", legible
    individual: z.boolean().default(false),
    criterios: z.array(z.object({
      nombre: z.string(),
      valor: z.number().positive().max(100),
    })).default([]),
  }).refine(
    (d) => d.criterios.length === 0
      || d.criterios.reduce((s, c) => s + c.valor, 0) === 100,
    { message: 'Los criterios de una evaluación deben sumar 100.' },
  ),
});

/* ------------------------------------------------------------------
   Referentes
   `porQue` es obligatorio: un link sin razón pedagógica no entra.
------------------------------------------------------------------ */
const referentes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/referentes' }),
  schema: z.object({
    titulo: z.string(),
    url: z.url(),
    tipo: z.enum([
      'videojuego', 'instalacion', 'obra', 'lectura', 'articulo',
      'video', 'herramienta', 'objeto', 'sitio', 'otro',
    ]),
    autor: z.string().optional(),
    anio: z.number().int().optional(),
    porQue: z.string().min(20),              // por qué está en el curso
    curso: reference('cursos'),
    sesiones: z.array(z.number().int()).default([]),
  }),
});

/* ------------------------------------------------------------------
   Trabajos de estudiantes
   `permisos` por defecto = anonimo. Sin consentimiento no se publica.
------------------------------------------------------------------ */
const trabajos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/trabajos' }),
  schema: z.object({
    titulo: z.string(),
    curso: reference('cursos'),
    sesion: z.number().int(),
    descripcion: z.string(),
    permisos: z.enum(['nombre-completo', 'iniciales', 'anonimo']).default('anonimo'),
    autores: z.array(z.string()).default([]),
    consentimientoRegistrado: z.boolean().default(false),
    media: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      tipo: z.enum(['imagen', 'video']).default('imagen'),
    })).default([]),
  }).refine(
    (d) => d.consentimientoRegistrado || d.permisos === 'anonimo',
    { message: 'Sin consentimiento registrado el trabajo solo puede publicarse como anonimo.' },
  ),
});

/* ------------------------------------------------------------------
   Sesiones
   Dos capas: programa (antes) y memoria (después).
------------------------------------------------------------------ */
const momento = z.object({
  titulo: z.string(),
  cuerpo: z.string(),
});

const sesiones = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/sesiones' }),
  schema: z.object({
    curso: reference('cursos'),
    numero: z.number().int().positive(),
    titulo: z.string(),
    fecha: z.coerce.date(),
    estado: z.enum(['programada', 'dictada', 'con-memoria']).default('programada'),

    // ── capa programa ─────────────────────────────────────────────
    preguntaCentral: z.string(),
    tension: reference('tensiones').optional(),
    conceptos: z.array(z.string()).default([]),
    momentos: z.array(momento).default([]),   // apertura, laboratorio, discusión...
    puenteAudiovisual: z.string().optional(),
    proposito: z.string().optional(),
    referentes: z.array(reference('referentes')).default([]),
    materiales: z.array(z.object({
      titulo: z.string(),
      url: z.string(),
      tipo: z.enum(['pdf', 'enlace', 'plantilla', 'video', 'otro']).default('enlace'),
    })).default([]),
    presentacion: z.string().optional(),      // /presentaciones/ps3/s07/

    // ── capa memoria ──────────────────────────────────────────────
    memoria: z.object({
      esperado: z.string(),
      observado: z.string(),
      evidencia: z.array(z.string()).default([]),
      sorpresa: z.string().optional(),
      cambio: z.string().optional(),          // qué ajustar para la próxima versión
      escritaEl: z.coerce.date(),
    }).optional(),
  }).refine(
    (d) => d.estado !== 'con-memoria' || d.memoria !== undefined,
    { message: 'Una sesión con-memoria necesita el bloque memoria.' },
  ).refine(
    (d) => d.estado === 'programada' || d.presentacion !== undefined,
    { message: 'Una sesión dictada necesita ruta de presentación.' },
  ),
});

export const collections = {
  cursos, sesiones, evaluaciones, referentes, tensiones, trabajos,
};
