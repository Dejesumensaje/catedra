import React from 'react';
import { ConceptNode, SessionRecord } from '../data/bitacoraData';
import { ArrowUpRight } from 'lucide-react';

interface SessionsTimelineViewProps {
  sessions: SessionRecord[];
  nodes: ConceptNode[];
  onInspectNodeOnMap: (nodeId: string) => void;
}

export const SessionsTimelineView: React.FC<SessionsTimelineViewProps> = ({
  sessions,
  nodes,
  onInspectNodeOnMap,
}) => {
  return (
    <div className="max-w-[1180px] mx-auto py-6 sm:py-10 space-y-12">
      {/* Unboxed Editorial Masthead */}
      <header className="max-w-3xl pb-8 border-b-[1.5px] border-[#1F1147]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0D47FF] allo-sharp">
          Cronología · Septiembre a noviembre · 2026
        </div>
        <h1 className="allo-display text-3xl sm:text-5xl font-black text-[#1F1147] mt-3 leading-[1.05]">
          Recorrido por las cuatro sesiones del laboratorio
        </h1>
        <p className="text-base text-[#5B5275] mt-4 leading-relaxed max-w-2xl">
          La bitácora va de la definición de intención autoral en el arranque, por demos gestuales, diseño especulativo y una inversión de roles centrada en Sísifo, hasta la puesta en juego de prototipos reales en el cierre.
        </p>
      </header>

      {/* Open Chronological Ledger (divided by hairlines, no enclosing cards) */}
      <div className="divide-y divide-[#1F1147]/15">
        {sessions.map((session) => (
          <section
            key={session.id}
            className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          >
            {/* Left Column: Session Metadata, Title & Central Provocation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold text-[#0D47FF] allo-tabular tracking-wide">
                <span>{session.number}</span>
                <span aria-hidden="true" className="mx-1.5 text-[#5B5275]">
                  ·
                </span>
                <span>{session.dateLabel}</span>
              </div>

              <h2 className="allo-display text-2xl sm:text-[28px] font-extrabold text-[#1F1147] leading-tight">
                {session.title}
              </h2>

              <blockquote className="rounded-xl bg-[#1F1147] px-5 py-4 mt-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/65 mb-1.5 allo-sharp">
                  Pregunta detonante
                </div>
                <p className="italic text-[14.5px] text-[#FFE94D] leading-relaxed font-medium">
                  “{session.centralQuestion}”
                </p>
              </blockquote>
            </div>

            {/* Right Column: Full Synthesis, Demos/References List & Node Links */}
            <div className="lg:col-span-7 space-y-7">
              <p className="text-[15.5px] leading-[1.72] text-[#1F1147]/90">
                {session.synthesis}
              </p>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5B5275] pb-2 border-b border-[#1F1147]/15 allo-sharp">
                  Demos, referentes y provocaciones compartidas
                </h3>
                <dl className="divide-y divide-[#1F1147]/10">
                  {session.demosAndReferences.map((ref, idx) => (
                    <div
                      key={idx}
                      className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 text-[13.5px]"
                    >
                      <dt className="sm:col-span-4 font-bold text-[#1F1147]">
                        {ref.url ? (
                          <a
                            href={ref.url}
                            className="inline-flex items-baseline gap-1 text-[#0D47FF] underline underline-offset-4 decoration-[#0D47FF]/35 hover:decoration-[#0D47FF] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                          >
                            {ref.name}
                            <ArrowUpRight className="w-3.5 h-3.5 self-center shrink-0" aria-hidden="true" />
                            <span className="sr-only"> (abre la demo)</span>
                          </a>
                        ) : (
                          ref.name
                        )}
                      </dt>
                      <dd className="sm:col-span-8 text-[#5B5275] leading-relaxed">
                        {ref.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="pt-3 border-t border-[#1F1147]/12 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-[#5B5275] allo-sharp">
                  En el mapa
                </h3>
                {session.featuredNodeIds.map((nodeId) => {
                  const found = nodes.find((n) => n.id === nodeId);
                  if (!found) return null;
                  return (
                    <button
                      key={nodeId}
                      type="button"
                      onClick={() => onInspectNodeOnMap(nodeId)}
                      className="inline-flex items-center gap-1 py-1 font-bold text-[#0D47FF] hover:text-[#1F1147] underline underline-offset-4 decoration-[#0D47FF]/35 hover:decoration-[#1F1147] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] rounded-sm"
                    >
                      <span>{found.shortTitle}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
