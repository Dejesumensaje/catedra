import React, { useEffect } from 'react';
import { ConceptNode, StudentProject } from '../data/bitacoraData';
import { ArrowUpRight } from 'lucide-react';

interface ProjectsArchiveViewProps {
  projects: StudentProject[];
  nodes: ConceptNode[];
  highlightedProjectId?: string | null;
  onInspectNodeOnMap: (nodeId: string) => void;
}

export const ProjectsArchiveView: React.FC<ProjectsArchiveViewProps> = ({
  projects,
  nodes,
  highlightedProjectId,
  onInspectNodeOnMap,
}) => {
  const getNodeTitle = (id: string) =>
    nodes.find((n) => n.id === id)?.shortTitle || id;

  // Llegar a un proyecto desde el mapa o desde un enlace lo pone a la vista.
  useEffect(() => {
    if (!highlightedProjectId) return;
    const el = document.getElementById(highlightedProjectId);
    if (!el) return;
    requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }, [highlightedProjectId]);

  return (
    <div className="max-w-[1180px] mx-auto py-6 sm:py-10 space-y-12">
      {/* Unboxed Header */}
      <header className="max-w-3xl pb-8 border-b-[1.5px] border-[#1F1147]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0D47FF] allo-sharp">
          Seis procesos estudiantiles · dos prototipos del docente
        </div>
        <h1 className="allo-display text-3xl sm:text-5xl font-black text-[#1F1147] mt-3 leading-[1.05]">
          Cómo encarnaron las ideas en los proyectos
        </h1>
        <p className="text-base text-[#5B5275] mt-4 leading-relaxed max-w-2xl">
          Cada proyecto llegó al laboratorio en un nivel distinto de madurez: desde exploraciones metodológicas iniciales hasta prototipos en realidad virtual, Kinect o instalación espacial. Aquí se registra su apuesta, la deriva en las sesiones, el giro decisivo y las tensiones abiertas hacia el cierre.
        </p>
      </header>

      {/* Open Curatorial Ledger (divided by hairlines, zero card wrappers) */}
      <div className="divide-y divide-[#1F1147]/15">
        {projects.map((project, index) => {
          const isHighlighted = highlightedProjectId === project.id;
          return (
            <article
              key={project.id}
              id={project.id}
              className={`scroll-mt-28 md:scroll-mt-20 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start transition-colors ${
                isHighlighted ? 'bg-[#F1EDFF]/50 -mx-4 sm:-mx-5 px-4 sm:px-5 rounded-2xl' : ''
              }`}
            >
              {/* Left Column: Attribution, Title & Map Links */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5B5275] allo-tabular">
                  <span className="text-[#0D47FF] font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {project.author && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#1F1147]">{project.author}</span>
                    </>
                  )}
                </div>

                <h2 className="allo-display text-2xl sm:text-[26px] font-extrabold text-[#1F1147] leading-tight">
                  {project.title}
                </h2>

                <p className="text-xs font-medium text-[#5B5275]">
                  {project.medium}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onInspectNodeOnMap(project.nodeId)}
                    className="inline-flex items-center gap-1 py-1 font-bold text-[#0D47FF] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] rounded-sm"
                  >
                    <span>Ubicar en el mapa</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="text-[#5B5275]">Se cruza con</span>
                  {project.relatedConcepts.map((cId) => (
                    <button
                      key={cId}
                      type="button"
                      onClick={() => onInspectNodeOnMap(cId)}
                      className="py-1 text-[#5B5275] hover:text-[#1F1147] underline underline-offset-4 decoration-[#1F1147]/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] rounded-sm"
                    >
                      {getNodeTitle(cId)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Structured Depth Without Nested Boxes */}
              <dl className="lg:col-span-7 space-y-5 text-[15px] leading-[1.68] max-w-[62ch]">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-[#5B5275] allo-sharp">
                    Apuesta central
                  </dt>
                  <dd className="text-[#1F1147] font-semibold mt-1">
                    {project.centralBet}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-[#5B5275] allo-sharp">
                    Deriva en el laboratorio
                  </dt>
                  <dd className="text-[#1F1147]/85 mt-1">{project.evolution}</dd>
                </div>

                <div className="bg-[#F1EDFF] rounded-xl px-4 py-3.5">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-[#3B1D8F] allo-sharp">
                    Giro o hallazgo clave
                  </dt>
                  <dd className="text-[#1F1147] mt-1 text-sm font-medium leading-relaxed">
                    {project.keyShift}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-[#5B5275] allo-sharp">
                    Tensión o reto abierto
                  </dt>
                  <dd className="text-[#5B5275] mt-1 text-sm leading-relaxed">
                    {project.openTension}
                  </dd>
                </div>

                {(() => {
                  const q = nodes.find((n) => n.id === project.nodeId)?.quotes[0];
                  if (!q) return null;
                  return (
                    <div>
                      <dt className="sr-only">En sus palabras</dt>
                      <dd>
                        <blockquote className="py-3.5 border-y border-[#1F1147]/15 italic text-[15px] leading-relaxed text-[#1F1147]/85">
                          “{q.text}”
                          <footer className="not-italic text-xs font-semibold text-[#5B5275] mt-1.5">
                            {q.speaker} · {q.sessionLabel}
                          </footer>
                        </blockquote>
                      </dd>
                    </div>
                  );
                })()}
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
};
