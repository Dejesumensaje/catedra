import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CONCEPT_EDGES,
  CONCEPT_NODES,
  NodeCategory,
  SESSIONS,
  STUDENT_PROJECTS,
  SessionId,
} from './data/bitacoraData';
import { CoverDestination, CoverPage } from './components/CoverPage';
import { ConceptMapCanvas, MapViewState } from './components/ConceptMapCanvas';
import { NodeDossierPanel } from './components/NodeDossierPanel';
import { EditorialReadingView } from './components/EditorialReadingView';
import { ProjectsArchiveView } from './components/ProjectsArchiveView';
import { SessionsTimelineView } from './components/SessionsTimelineView';
import { ChevronDown } from 'lucide-react';

/* Cada vista tiene su dirección: #/mapa, #/mapa/n5, #/hallazgos, #/proyectos/p-abeja,
   #/sesiones. Así funcionan el botón atrás, recargar y compartir un enlace. */
interface Route {
  view: ActiveView;
  nodeId: string | null;
  projectId: string | null;
}

const VIEWS: ActiveView[] = ['portada', 'mapa', 'hallazgos', 'proyectos', 'sesiones'];

function parseHash(hash: string): Route {
  const [rawView, param] = hash.replace(/^#\/?/, '').split('/');
  const view = (VIEWS as string[]).includes(rawView) ? (rawView as ActiveView) : 'portada';
  const nodeId =
    view === 'mapa' && param && CONCEPT_NODES.some((n) => n.id === param) ? param : null;
  const projectId =
    view === 'proyectos' && param && STUDENT_PROJECTS.some((p) => p.id === param) ? param : null;
  return { view, nodeId, projectId };
}

function routeToHash(view: ActiveView, nodeId: string | null, projectId: string | null): string {
  if (view === 'portada') return '#/';
  if (view === 'mapa' && nodeId) return `#/mapa/${nodeId}`;
  if (view === 'proyectos' && projectId) return `#/proyectos/${projectId}`;
  return `#/${view}`;
}

const NAV_ITEMS = [
  { id: 'mapa', label: 'Mapa' },
  { id: 'hallazgos', label: 'Hallazgos' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'sesiones', label: 'Sesiones' },
] as const;

type ActiveView = 'portada' | CoverDestination;

const INDEX_GROUPS: { category: NodeCategory; heading: string }[] = [
  { category: 'concepto', heading: 'Núcleo · Fundamentos conceptuales' },
  { category: 'apuesta', heading: 'Apuestas metodológicas' },
  { category: 'proyecto', heading: 'Proyectos y prototipos' },
];

export function App() {
  const initialRoute = useMemo(() => parseHash(window.location.hash), []);
  const [activeView, setActiveView] = useState<ActiveView>(initialRoute.view);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialRoute.nodeId);
  const [categoryFilter, setCategoryFilter] = useState<NodeCategory | 'todos'>('todos');
  const [sessionFilter, setSessionFilter] = useState<SessionId | 'todas'>('todas');
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(
    initialRoute.projectId
  );
  const [indexOpen, setIndexOpen] = useState(false);

  const [mapViewState, setMapViewState] = useState<MapViewState>({
    scale: 0.9,
    pan: { x: 20, y: 12 },
    initialized: false,
  });
  const [focusRequest, setFocusRequest] = useState<{ nodeId: string; nonce: number } | null>(
    initialRoute.nodeId ? { nodeId: initialRoute.nodeId, nonce: 0 } : null
  );

  const indexContainerRef = useRef<HTMLDivElement | null>(null);
  const focusNonceRef = useRef<number>(0);

  const orderedNodes = useMemo(
    () => [...CONCEPT_NODES].sort((a, b) => a.order - b.order),
    []
  );

  const selectedNodeIndex = useMemo(
    () => (selectedNodeId ? orderedNodes.findIndex((n) => n.id === selectedNodeId) : -1),
    [orderedNodes, selectedNodeId]
  );

  const selectedNode = selectedNodeIndex >= 0 ? orderedNodes[selectedNodeIndex] : null;
  const prevNode = selectedNodeIndex > 0 ? orderedNodes[selectedNodeIndex - 1] : null;
  const nextNode =
    selectedNodeIndex >= 0 && selectedNodeIndex < orderedNodes.length - 1
      ? orderedNodes[selectedNodeIndex + 1]
      : null;

  // Estado → dirección. Cambiar de vista crea una entrada en el historial; moverse
  // entre nodos o proyectos dentro de la misma vista solo la reemplaza.
  const lastViewRef = useRef<ActiveView>(activeView);
  useEffect(() => {
    const hash = routeToHash(activeView, selectedNodeId, highlightedProjectId);
    if (hash !== (window.location.hash || '#/')) {
      const url = `${window.location.pathname}${window.location.search}${hash}`;
      if (lastViewRef.current !== activeView) window.history.pushState(null, '', url);
      else window.history.replaceState(null, '', url);
    }
    lastViewRef.current = activeView;
    const viewTitle: Record<ActiveView, string> = {
      portada: 'Bitácora',
      mapa: 'Mapa',
      hallazgos: 'Hallazgos',
      proyectos: 'Proyectos',
      sesiones: 'Sesiones',
    };
    document.title = `${viewTitle[activeView]} · Laboratorio de Narrativa Interactiva`;
  }, [activeView, selectedNodeId, highlightedProjectId]);

  // Dirección → estado (atrás, adelante, enlace pegado a mano).
  useEffect(() => {
    const onHashChange = () => {
      const r = parseHash(window.location.hash);
      lastViewRef.current = r.view;
      setActiveView(r.view);
      setSelectedNodeId(r.nodeId);
      setHighlightedProjectId(r.projectId);
      setIndexOpen(false);
      if (r.nodeId) {
        focusNonceRef.current += 1;
        setFocusRequest({ nodeId: r.nodeId, nonce: focusNonceRef.current });
      }
    };
    window.addEventListener('popstate', onHashChange);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onHashChange);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  // Close index dropdown on click outside or Escape
  useEffect(() => {
    if (!indexOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        indexContainerRef.current &&
        !indexContainerRef.current.contains(e.target as Node)
      ) {
        setIndexOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndexOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [indexOpen]);

  // Complementary keyboard navigation ONLY while reading an open node drawer on the map
  // Never hijacks internal interactive widgets (sliders, switches, groups, selects, inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeView !== 'mapa' || indexOpen || !selectedNodeId) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      const targetEl = e.target as HTMLElement | null;
      if (targetEl) {
        const tag = targetEl.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          targetEl.isContentEditable
        ) {
          return;
        }
        if (
          targetEl.closest(
            '[role="slider"], [role="switch"], [role="group"], [role="tablist"], [data-no-arrow-nav="true"]'
          )
        ) {
          return;
        }
      }

      if (e.key === 'ArrowRight' && nextNode) {
        e.preventDefault();
        setSelectedNodeId(nextNode.id);
      } else if (e.key === 'ArrowLeft' && prevNode) {
        e.preventDefault();
        setSelectedNodeId(prevNode.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, indexOpen, selectedNodeId, prevNode, nextNode]);

  const handleEnterFromCover = (destination: CoverDestination, focusNodeId?: string) => {
    setSelectedNodeId(focusNodeId ?? null);
    if (focusNodeId) {
      focusNonceRef.current += 1;
      setFocusRequest({ nodeId: focusNodeId, nonce: focusNonceRef.current });
    }
    setCategoryFilter('todos');
    setSessionFilter('todas');
    setHighlightedProjectId(null);
    setIndexOpen(false);
    setActiveView(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectNodeOnMap = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setCategoryFilter('todos');
    setSessionFilter('todas');
    setIndexOpen(false);
    focusNonceRef.current += 1;
    setFocusRequest({ nodeId, nonce: focusNonceRef.current });
    setActiveView('mapa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProjectTab = (projectId: string) => {
    setHighlightedProjectId(projectId);
    setSelectedNodeId(null);
    setIndexOpen(false);
    setActiveView('proyectos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuidedTourStep = () => {
    setIndexOpen(false);
    if (activeView !== 'mapa') {
      setCategoryFilter('todos');
      setSessionFilter('todas');
      setSelectedNodeId('n1');
      focusNonceRef.current += 1;
      setFocusRequest({ nodeId: 'n1', nonce: focusNonceRef.current });
      setActiveView('mapa');
      return;
    }
    if (!selectedNodeId) {
      setSelectedNodeId('n1');
      return;
    }
    const nextIdx = selectedNodeIndex >= orderedNodes.length - 1 ? 0 : selectedNodeIndex + 1;
    setSelectedNodeId(orderedNodes[nextIdx].id);
  };

  if (activeView === 'portada') {
    return <CoverPage onEnter={handleEnterFromCover} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1F1147]">
      {/* Top Bar Contract: 3 zones — Wordmark ("Narrativa Interactiva") — Nav Links — Dropdown Índice */}
      <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-xs border-b border-[#1F1147]/15">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: vuelta al sitio + wordmark (lleva a la portada de la bitácora) */}
          <div className="flex items-baseline gap-3 min-w-0">
          <a
            href="/"
            className="hidden sm:inline text-xs font-semibold text-[#5B5275] hover:text-[#1F1147] whitespace-nowrap underline-offset-4 hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
          >
            <span aria-hidden="true">← </span>Cátedra
          </a>
          <button
            type="button"
            onClick={() => {
              setIndexOpen(false);
              setActiveView('portada');
            }}
            className="allo-display text-xl font-black tracking-tight text-[#1F1147] whitespace-nowrap shrink-0 cursor-pointer hover:text-[#0D47FF] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
          >
            Narrativa Interactiva
          </button>
          </div>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Secciones de la bitácora"
            className="hidden md:flex items-center gap-7 text-sm font-semibold"
          >
            {NAV_ITEMS.map((navItem) => {
              const isActive = activeView === navItem.id;
              return (
                <button
                  key={navItem.id}
                  aria-current={isActive ? "page" : undefined}
                  type="button"
                  onClick={() => {
                    if (navItem.id !== 'proyectos') setHighlightedProjectId(null);
                    if (navItem.id !== 'mapa') setSelectedNodeId(null);
                    setIndexOpen(false);
                    setActiveView(navItem.id);
                  }}
                  className={`py-1.5 border-b-[2.5px] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] rounded-t-sm ${
                    isActive
                      ? 'border-[#0D47FF] text-[#1F1147]'
                      : 'border-transparent text-[#5B5275] hover:text-[#1F1147] hover:border-[#1F1147]/30'
                  }`}
                >
                  {navItem.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Dropdown Índice (direct access to any of the 16 nodes + guided tour) */}
          <div ref={indexContainerRef} className="relative shrink-0">
            <button
              type="button"
              aria-expanded={indexOpen}
              aria-haspopup="true"
              onClick={() => setIndexOpen((prev) => !prev)}
              className={`keycap-surface rounded-xl px-3.5 py-2 sm:py-1.5 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] ${
                indexOpen
                  ? 'bg-[#1F1147] text-[#FFE94D]'
                  : 'bg-[#FFE94D] text-[#1F1147] hover:bg-[#FFF078]'
              }`}
            >
              <span>Índice</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${indexOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {indexOpen && (
              <div
                role="dialog"
                aria-label="Índice de nodos de la bitácora"
                className="absolute right-0 mt-2.5 w-[min(92vw,390px)] rounded-2xl bg-[#FAFAF8] border-[1.5px] border-[#1F1147] shadow-[6px_6px_0_0_#1F1147] overflow-hidden z-50"
              >
                {/* Guided tour trigger inside index */}
                <div className="px-4 py-3 bg-[#F1EDFF] border-b border-[#1F1147]/15 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#1F1147] allo-sharp">
                      Índice cartográfico
                    </div>
                    <div className="text-[11px] text-[#5B5275]">
                      Salta directo a cualquier nodo en el mapa
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGuidedTourStep}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F1147] text-[#FFE94D] hover:bg-[#0D47FF] hover:text-white px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                  >
                    <span>
                      {activeView === 'mapa' && selectedNodeId ? 'Siguiente' : 'Recorrido'}
                    </span>
                  </button>
                </div>

                <div className="max-h-[65vh] overflow-y-auto divide-y divide-[#1F1147]/12">
                  {INDEX_GROUPS.map((group) => {
                    const groupNodes = orderedNodes.filter(
                      (n) => n.category === group.category
                    );
                    return (
                      <div key={group.category} className="px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B5275] mb-1.5 allo-sharp">
                          {group.heading}
                        </div>
                        <ul className="space-y-0.5">
                          {groupNodes.map((n) => {
                            const isCurrent =
                              activeView === 'mapa' && n.id === selectedNodeId;
                            return (
                              <li key={n.id}>
                                <button
                                  type="button"
                                  onClick={() => handleInspectNodeOnMap(n.id)}
                                  className={`w-full text-left px-2.5 py-2 sm:py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] ${
                                    isCurrent
                                      ? 'bg-[#1F1147] text-[#FFE94D] font-bold'
                                      : 'text-[#1F1147] hover:bg-[#F1EDFF]'
                                  }`}
                                >
                                  <span className="truncate">
                                    <span className="allo-tabular font-bold mr-2 opacity-70">
                                      {String(n.order).padStart(2, '0')}
                                    </span>
                                    {n.title}
                                  </span>
                                  <span
                                    className={`text-[10px] allo-tabular shrink-0 ${
                                      isCurrent ? 'text-[#FFE94D]/80' : 'text-[#5B5275]'
                                    }`}
                                  >
                                    {n.sessionSpan}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Mobile Navigation Row */}
        <nav
          aria-label="Navegación móvil"
          className="md:hidden border-t border-[#1F1147]/10 px-4 flex items-center gap-5 overflow-x-auto text-sm font-semibold"
        >
          {NAV_ITEMS.map((navItem) => (
            <button
              key={navItem.id}
              aria-current={activeView === navItem.id ? "page" : undefined}
              type="button"
              onClick={() => {
                if (navItem.id !== 'proyectos') setHighlightedProjectId(null);
                if (navItem.id !== 'mapa') setSelectedNodeId(null);
                setIndexOpen(false);
                setActiveView(navItem.id);
              }}
              className={`min-h-[44px] py-2.5 border-b-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] ${
                activeView === navItem.id
                  ? 'border-[#0D47FF] text-[#1F1147]'
                  : 'border-transparent text-[#5B5275]'
              }`}
            >
              {navItem.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Container */}
      <main
        className={`flex-1 w-full mx-auto ${
          activeView === 'mapa'
            ? 'max-w-[1480px] px-3 sm:px-6 lg:px-8 py-4'
            : 'max-w-[1440px] px-4 sm:px-6 lg:px-8 py-4'
        }`}
      >
        {activeView === 'mapa' && (
          <>
            <ConceptMapCanvas
              nodes={CONCEPT_NODES}
              edges={CONCEPT_EDGES}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              categoryFilter={categoryFilter}
              onChangeCategoryFilter={setCategoryFilter}
              sessionFilter={sessionFilter}
              onChangeSessionFilter={setSessionFilter}
              viewState={mapViewState}
              onChangeViewState={setMapViewState}
              focusRequest={focusRequest}
            />

            {selectedNode && (
              <NodeDossierPanel
                node={selectedNode}
                allNodes={CONCEPT_NODES}
                edges={CONCEPT_EDGES}
                prevNode={prevNode}
                nextNode={nextNode}
                onSelectNode={setSelectedNodeId}
                onClose={() => setSelectedNodeId(null)}
                onOpenProjectTab={handleOpenProjectTab}
              />
            )}
          </>
        )}

        {activeView === 'hallazgos' && (
          <EditorialReadingView
            nodes={orderedNodes}
            onInspectOnMap={handleInspectNodeOnMap}
            onOpenProjects={() => {
              setHighlightedProjectId(null);
              setActiveView('proyectos');
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {activeView === 'proyectos' && (
          <ProjectsArchiveView
            projects={STUDENT_PROJECTS}
            nodes={CONCEPT_NODES}
            highlightedProjectId={highlightedProjectId}
            onInspectNodeOnMap={handleInspectNodeOnMap}
          />
        )}

        {activeView === 'sesiones' && (
          <SessionsTimelineView
            sessions={SESSIONS}
            nodes={CONCEPT_NODES}
            onInspectNodeOnMap={handleInspectNodeOnMap}
          />
        )}
      </main>

      {/* Pie: de dónde viene la bitácora y cómo volver al sitio */}
      {activeView !== 'mapa' && (
        <footer className="border-t border-[#1F1147]/12 bg-[#FAFAF8] mt-6">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-[#5B5275]">
            <p>Laboratorio de Narrativa Interactiva · Universidad de Antioquia · 2026</p>
            <div className="flex items-center gap-5 font-semibold">
              <a
                href="/"
                className="text-[#1F1147] underline underline-offset-4 decoration-[#1F1147]/30 hover:decoration-[#0D47FF] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
              >
                Cátedra · William Montoya
              </a>
              <a
                href="/licencia"
                className="text-[#1F1147] underline underline-offset-4 decoration-[#1F1147]/30 hover:decoration-[#0D47FF] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
              >
                Licencia
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
