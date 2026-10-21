/* ------------------------------------------------------------------
   Los seis pasos de una entrada de /diseno-visual. Sirven a quien no sabe
   nada (se leen en orden) y a quien ya sabe (salta con el índice).
------------------------------------------------------------------ */
export const PASOS = [
  { id: 'idea', titulo: 'La idea', corto: 'La idea', proposito: 'Qué es, en palabras simples, antes de tocar nada.' },
  { id: 'miralo', titulo: 'Míralo', corto: 'Míralo', proposito: 'La misma pieza, sin el principio y con él. Toca los números para ver dónde actúa.' },
  { id: 'pruebalo', titulo: 'Pruébalo', corto: 'Pruébalo', proposito: 'Sigue la guía: cada paso te pide mover un control y luego explica lo que viste.' },
  { id: 'usalo', titulo: 'Úsalo en tus composiciones', corto: 'Úsalo', proposito: 'Una receta para aplicarlo, los errores más frecuentes y piezas reales donde ya actúa.' },
  { id: 'juega', titulo: 'Ponte a prueba', corto: 'Ponte a prueba', proposito: 'Rondas que cambian cada vez que juegas. Después de responder, ves por qué.' },
  { id: 'a-fondo', titulo: 'A fondo', corto: 'A fondo', proposito: 'Para quien ya domina lo básico: límites, matices, fuentes y relaciones con otros conceptos.' },
] as const;

export type IdPaso = (typeof PASOS)[number]['id'];
