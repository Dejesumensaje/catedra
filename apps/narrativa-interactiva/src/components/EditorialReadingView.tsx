import React from 'react';
import { ConceptNode } from '../data/bitacoraData';
import { ArrowUpRight } from 'lucide-react';

interface EditorialReadingViewProps {
  nodes: ConceptNode[];
  onInspectOnMap: (nodeId: string) => void;
  onOpenProjects: () => void;
}

/* La dirección (#/hallazgos) la usa el enrutador: los saltos internos van por
   scrollIntoView y no por anclas, para no cambiar de vista. */
const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};

export const EditorialReadingView: React.FC<EditorialReadingViewProps> = ({
  nodes,
  onInspectOnMap,
  onOpenProjects,
}) => {
  const concepts = nodes.filter((n) => n.category === 'concepto');
  const bets = nodes.filter((n) => n.category === 'apuesta');

  const sections = [
    {
      id: 'eje-conceptos',
      numeral: 'Parte I',
      title: 'Fundamentos conceptuales: del arco lineal al gesto con sentido',
      intro:
        'Cuatro nociones estructuraron las conversaciones del laboratorio sobre qué significa narrar interactivamente más allá de la pieza audiovisual cerrada.',
      items: concepts,
    },
    {
      id: 'eje-apuestas',
      numeral: 'Parte II',
      title: 'Apuestas metodológicas y de creación',
      intro:
        'Decisiones compartidas para desbloquear proyectos: cómo evitar la literalidad, depurar la dispersión y usar la colaboración como método.',
      items: bets,
    },
  ];

  return (
    <div className="max-w-[1180px] mx-auto py-6 sm:py-10">
      {/* Unboxed Editorial Masthead */}
      <header className="max-w-3xl pb-10 border-b-[1.5px] border-[#1F1147]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0D47FF] allo-sharp">
          Documento memoria · Universidad de Antioquia · 2026
        </div>
        <h1 className="allo-display text-3xl sm:text-5xl font-black text-[#1F1147] mt-3 leading-[1.05]">
          Fundamentos y apuestas del laboratorio
        </h1>
        <p className="text-base sm:text-lg text-[#5B5275] mt-4 leading-relaxed max-w-2xl">
          Registro de las cuatro sesiones del laboratorio (23 de septiembre al 4 de noviembre). Más que inventariar herramientas técnicas, esta síntesis recoge el giro desde la preocupación por el software hacia la pregunta por el gesto, las reglas del mundo y la intención autoral.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Clean Unboxed Sticky Index */}
        <nav
          aria-label="Índice de la bitácora"
          className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 pr-4"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-[#5B5275] pb-2 border-b border-[#1F1147]/15 allo-sharp">
            Índice de lectura
          </div>
          {sections.map((sec) => (
            <div key={sec.id} className="space-y-2">
              <button
                type="button"
                onClick={() => scrollToId(sec.id)}
                className="block text-left text-xs font-bold text-[#1F1147] hover:text-[#0D47FF] cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
              >
                {sec.numeral} · {sec.title}
              </button>
              <ul className="space-y-1 pl-3 border-l border-[#1F1147]/15">
                {sec.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollToId(`doc-${item.id}`)}
                      className="block w-full text-left text-xs text-[#5B5275] hover:text-[#0D47FF] py-0.5 truncate allo-tabular cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                    >
                      {String(item.order).padStart(2, '0')}. {item.shortTitle}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Main Long-Form Essay Column (no cards-within-cards) */}
        <div className="lg:col-span-8 space-y-20">
          {sections.map((sec, secIndex) => (
            <section
              key={sec.id}
              id={sec.id}
              className="scroll-mt-28 md:scroll-mt-20 space-y-12"
            >
              <div className="pt-6 border-t-[1.5px] border-[#1F1147]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0D47FF] allo-sharp">
                  {sec.numeral}
                </div>
                <h2 className="allo-display text-2xl sm:text-3xl font-extrabold text-[#1F1147] mt-1.5">
                  {sec.title}
                </h2>
                <p className="text-sm text-[#5B5275] mt-2.5 max-w-[62ch] leading-relaxed">
                  {sec.intro}
                </p>
              </div>

              <div className="space-y-14">
                {sec.items.map((item, itemIdx) => (
                  <article
                    key={item.id}
                    id={`doc-${item.id}`}
                    className="scroll-mt-28 md:scroll-mt-20 max-w-[64ch] space-y-5 pb-12 border-b border-[#1F1147]/12 last:border-b-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-[#5B5275] allo-tabular">
                        {String(item.order).padStart(2, '0')} · {item.categoryLabel} · {item.sessionSpan}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInspectOnMap(item.id)}
                        className="inline-flex items-center gap-1 py-1 text-xs font-bold text-[#0D47FF] hover:underline cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] rounded-sm"
                      >
                        <span>{item.microLab ? 'Probarlo en el mapa' : 'Ver en el mapa'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <h3 className="allo-display text-2xl sm:text-[28px] font-extrabold text-[#1F1147] leading-tight">
                      {item.title}
                    </h3>

                    <div className="space-y-4 text-[15.5px] leading-[1.72] text-[#1F1147]/90">
                      {item.summary.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>

                    {/* Unbordered soft lavender emphasis for the lab bet */}
                    <div className="bg-[#F1EDFF] rounded-xl px-5 py-4 text-[14.5px] leading-relaxed text-[#1F1147]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B1D8F] block mb-1 allo-sharp">
                        Apuesta y hallazgo principal
                      </span>
                      <span className="font-medium">{item.betOrFinding}</span>
                    </div>

                    {/* Full Key Takeaways preserved in clean typographic list */}
                    {item.keyTakeaways.length > 0 && (
                      <ul className="space-y-2 text-sm text-[#1F1147]/80 leading-relaxed pt-1">
                        {item.keyTakeaways.map((pt, idx) => (
                          <li key={idx} className="flex gap-2.5">
                            <span aria-hidden="true" className="text-[#0D47FF] font-semibold shrink-0">
                              —
                            </span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Use the high-contrast Oblique block sparingly (1st item of each chapter); clean hairline quote for the rest */}
                    {item.quotes[0] &&
                      (itemIdx === 0 && secIndex < 2 ? (
                        <blockquote className="rounded-2xl bg-[#1F1147] px-6 py-5 italic text-[15px] leading-relaxed text-[#FFE94D]">
                          “{item.quotes[0].text}”
                          <footer className="not-italic text-xs text-white/75 mt-2">
                            {item.quotes[0].speaker} · {item.quotes[0].sessionLabel}
                          </footer>
                        </blockquote>
                      ) : (
                        <blockquote className="py-3.5 border-y border-[#1F1147]/15 italic text-[15px] leading-relaxed text-[#5B5275]">
                          “{item.quotes[0].text}” —{' '}
                          <span className="not-italic text-xs font-semibold text-[#1F1147]">
                            {item.quotes[0].speaker} ({item.quotes[0].sessionLabel})
                          </span>
                        </blockquote>
                      ))}
                  </article>
                ))}
              </div>
            </section>
          ))}

          <section className="pt-6 border-t-[1.5px] border-[#1F1147] max-w-[64ch]">
            <h2 className="allo-display text-2xl sm:text-3xl font-extrabold text-[#1F1147]">
              Estas ideas, puestas a prueba
            </h2>
            <p className="text-[15.5px] leading-[1.72] text-[#1F1147]/90 mt-3">
              Seis procesos estudiantiles y dos prototipos del docente: qué apostó cada uno, qué
              cambió durante las sesiones y qué quedó abierto.
            </p>
            <button
              type="button"
              onClick={onOpenProjects}
              className="mt-5 keycap-surface min-h-[44px] rounded-2xl bg-[#FFE94D] hover:bg-[#FFF078] text-[#1F1147] px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
            >
              Ir a los proyectos <span aria-hidden="true">→</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
