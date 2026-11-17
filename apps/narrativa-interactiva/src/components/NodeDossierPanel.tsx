import React, { useEffect, useRef } from 'react';
import {
  ConceptEdge,
  ConceptNode,
  EDGE_KIND_LABELS,
  EdgeKind,
} from '../data/bitacoraData';
import { MicroLabExperiment } from './MicroLabExperiment';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';

interface NodeDossierPanelProps {
  node: ConceptNode;
  allNodes: ConceptNode[];
  edges: ConceptEdge[];
  prevNode: ConceptNode | null;
  nextNode: ConceptNode | null;
  onSelectNode: (id: string) => void;
  onClose: () => void;
  onOpenProjectTab?: (projectId: string) => void;
}

const RELATION_MARK: Record<EdgeKind, string> = {
  fundamenta: '—',
  tensiona: '┄',
  deriva: '→',
};

export const NodeDossierPanel: React.FC<NodeDossierPanelProps> = ({
  node,
  allNodes,
  edges,
  prevNode,
  nextNode,
  onSelectNode,
  onClose,
  onOpenProjectTab,
}) => {
  const asideRef = useRef<HTMLElement | null>(null);
  const scrollBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    asideRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    scrollBodyRef.current?.scrollTo({ top: 0 });
  }, [node.id]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const outgoing = edges
    .filter((e) => e.from === node.id)
    .map((e) => ({
      edge: e,
      target: allNodes.find((n) => n.id === e.to),
    }))
    .filter((item): item is { edge: ConceptEdge; target: ConceptNode } => Boolean(item.target));

  const incoming = edges
    .filter((e) => e.to === node.id)
    .map((e) => ({
      edge: e,
      source: allNodes.find((n) => n.id === e.from),
    }))
    .filter((item): item is { edge: ConceptEdge; source: ConceptNode } => Boolean(item.source));

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Subtle Backdrop (click outside to close and return to full map) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-[#1F1147]/15 backdrop-blur-[1px] pointer-events-auto transition-opacity"
      />

      {/* Editorial Reading Drawer */}
      <aside
        ref={asideRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Lectura del nodo ${node.title}`}
        className="relative z-10 w-full max-w-[560px] h-full bg-[#FAFAF8] border-l border-[#1F1147]/20 shadow-2xl flex flex-col pointer-events-auto focus:outline-none"
      >
        {/* Minimal Editorial Top Strip */}
        <div className="px-6 sm:px-8 py-4 border-b border-[#1F1147]/12 flex items-center justify-between gap-4 bg-[#FAFAF8]">
          <div className="text-xs font-semibold allo-sharp text-[#5B5275] truncate">
            <span className="text-[#0D47FF]">{String(node.order).padStart(2, '0')}</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span className="text-[#1F1147]">{node.categoryLabel}</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>{node.sessionSpan}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar cajón de lectura"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#5B5275] hover:text-[#1F1147] hover:bg-[#1F1147]/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
          >
            <span>Cerrar</span>
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Editorial Essay (4 clear typographic weight tiers) */}
        <div ref={scrollBodyRef} className="flex-1 overflow-y-auto px-6 sm:px-8 py-7 space-y-8">
          {/* TIER 1: Primary Prose & Thesis (Highest Weight) */}
          <header className="space-y-2">
            <p className="text-xs font-semibold text-[#0D47FF]">{node.subtitle}</p>
            <h2 className="allo-display text-3xl leading-[1.1] font-extrabold text-[#1F1147]">
              {node.title}
            </h2>
          </header>

          <div className="space-y-4 text-[15.5px] leading-[1.72] text-[#1F1147]/90 max-w-[60ch]">
            {node.summary.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* TIER 2: Lab Finding / Bet (Focal Accent without heavy box border) */}
          <div className="bg-[#F1EDFF] rounded-2xl px-5 py-4 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#3B1D8F] allo-sharp">
              Hallazgo y apuesta del laboratorio
            </div>
            <p className="text-[15px] leading-relaxed font-semibold text-[#1F1147]">
              {node.betOrFinding}
            </p>
          </div>

          {/* TIER 2B: Interactive Micro-Experiment (when conceptually warranted) */}
          {node.microLab && (
            <div>
              <MicroLabExperiment type={node.microLab} />
            </div>
          )}

          {/* TIER 3: Single Select Oblique Quote + Unboxed Key Points (Medium Weight) */}
          {node.quotes[0] && (
            <figure className="rounded-2xl bg-[#1F1147] px-5 py-4 space-y-2">
              <blockquote className="italic text-[15px] leading-relaxed text-[#FFE94D] font-medium">
                “{node.quotes[0].text}”
              </blockquote>
              <figcaption className="text-xs text-white/75">
                <span className="font-semibold text-white">{node.quotes[0].speaker}</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>{node.quotes[0].sessionLabel}</span>
              </figcaption>
            </figure>
          )}

          {node.keyTakeaways.length > 0 && (
            <div className="pt-2 border-t border-[#1F1147]/12">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5B5275] mb-3 allo-sharp">
                Ideas y matices registrados
              </h3>
              <ul className="space-y-2.5 text-sm text-[#1F1147]/80 leading-relaxed">
                {node.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-[#0D47FF] font-semibold shrink-0">
                      —
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {node.quotes.length > 1 && (
            <blockquote className="py-3 border-y border-[#1F1147]/12 italic text-sm text-[#5B5275] leading-relaxed">
              “{node.quotes[1].text}” —{' '}
              <span className="not-italic font-semibold text-[#1F1147]">
                {node.quotes[1].speaker}
              </span>
            </blockquote>
          )}

          {node.linkedProjectId && onOpenProjectTab && (
            <div>
              <button
                type="button"
                onClick={() => onOpenProjectTab(node.linkedProjectId!)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D47FF] hover:underline cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
              >
                <span>Abrir ficha completa en Proyectos</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* TIER 4: Semantic Connections (Primary relational navigation) */}
          {(outgoing.length > 0 || incoming.length > 0) && (
            <div className="pt-5 border-t border-[#1F1147]/15 space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5B5275] allo-sharp">
                Continuar explorando por relación
              </h3>
              <div className="divide-y divide-[#1F1147]/10">
                {incoming.map(({ edge, source }) => (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => onSelectNode(source.id)}
                    className="w-full text-left py-2.5 flex items-center justify-between gap-3 text-xs hover:text-[#0D47FF] transition-colors cursor-pointer group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                  >
                    <span className="text-[#5B5275] truncate">
                      <span className="font-mono text-[#0D47FF] mr-1.5">
                        {RELATION_MARK[edge.kind]}
                      </span>
                      <span className="text-[10.5px] uppercase tracking-wider text-[#5B5275]/80 mr-1.5 allo-sharp">
                        {EDGE_KIND_LABELS[edge.kind]}:
                      </span>
                      <span className="font-semibold text-[#1F1147] group-hover:text-[#0D47FF]">
                        {source.shortTitle}
                      </span>
                      <span className="mx-1.5 text-[#5B5275]">({edge.label})</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#5B5275] group-hover:text-[#0D47FF] shrink-0" aria-hidden="true" />
                  </button>
                ))}
                {outgoing.map(({ edge, target }) => (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => onSelectNode(target.id)}
                    className="w-full text-left py-2.5 flex items-center justify-between gap-3 text-xs hover:text-[#0D47FF] transition-colors cursor-pointer group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                  >
                    <span className="text-[#5B5275] truncate">
                      <span className="font-mono text-[#0D47FF] mr-1.5">
                        {RELATION_MARK[edge.kind]}
                      </span>
                      <span className="mr-1.5">{edge.label}</span>
                      <span className="font-semibold text-[#1F1147] group-hover:text-[#0D47FF]">
                        {target.shortTitle}
                      </span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#5B5275] group-hover:text-[#0D47FF] shrink-0" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Complementary Sequential Footer (subordinate to semantic connections above) */}
        <nav
          aria-label="Navegación complementaria por índice numérico"
          className="px-6 sm:px-8 py-2.5 border-t border-[#1F1147]/12 bg-[#FAFAF8] flex items-center justify-between gap-3"
        >
          <button
            type="button"
            disabled={!prevNode}
            onClick={() => prevNode && onSelectNode(prevNode.id)}
            className={`min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] ${
              prevNode
                ? 'text-[#5B5275] hover:text-[#1F1147] hover:bg-[#1F1147]/5 cursor-pointer'
                : 'text-[#5B5275]/35 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Anterior</span>
            {prevNode && (
              <span className="hidden sm:inline text-[11px] font-normal text-[#5B5275] truncate max-w-[140px]">
                · {prevNode.shortTitle}
              </span>
            )}
          </button>

          <span className="text-[11px] allo-tabular text-[#5B5275]/75 shrink-0">
            {String(node.order).padStart(2, '0')} / {String(allNodes.length).padStart(2, '0')}
          </span>

          <button
            type="button"
            disabled={!nextNode}
            onClick={() => nextNode && onSelectNode(nextNode.id)}
            className={`min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] ${
              nextNode
                ? 'text-[#5B5275] hover:text-[#1F1147] hover:bg-[#1F1147]/5 cursor-pointer'
                : 'text-[#5B5275]/35 cursor-not-allowed'
            }`}
          >
            {nextNode && (
              <span className="hidden sm:inline text-[11px] font-normal text-[#5B5275] truncate max-w-[140px]">
                {nextNode.shortTitle} ·
              </span>
            )}
            <span>Siguiente</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </button>
        </nav>
      </aside>
    </div>
  );
};
