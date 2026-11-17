import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ConceptEdge,
  ConceptNode,
  EdgeKind,
  NodeCategory,
  SESSION_FILTERS,
  SessionId,
} from '../data/bitacoraData';
import { ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';

export interface MapViewState {
  scale: number;
  pan: { x: number; y: number };
  initialized: boolean;
}

interface ConceptMapCanvasProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  categoryFilter: NodeCategory | 'todos';
  onChangeCategoryFilter: (cat: NodeCategory | 'todos') => void;
  sessionFilter: SessionId | 'todas';
  onChangeSessionFilter: (sess: SessionId | 'todas') => void;
  viewState: MapViewState;
  onChangeViewState: React.Dispatch<React.SetStateAction<MapViewState>>;
  focusRequest?: { nodeId: string; nonce: number } | null;
}

const CANVAS_W = 1400;
const CANVAS_H = 880;
const NODE_W = 212;
const NODE_H = 78;

const CATEGORY_SURFACE: Record<
  NodeCategory,
  {
    bg: string;
    selectedBg: string;
    kickerColor: string;
  }
> = {
  concepto: {
    bg: '#FFFFFF',
    selectedBg: '#FFFFFF',
    kickerColor: '#0D47FF',
  },
  apuesta: {
    bg: '#F1EDFF',
    selectedBg: '#E6DEFF',
    kickerColor: '#3B1D8F',
  },
  proyecto: {
    bg: '#F2EFE9',
    selectedBg: '#EAE3D7',
    kickerColor: '#1F1147',
  },
};

const EDGE_STYLE: Record<
  EdgeKind,
  {
    stroke: string;
    mutedStroke: string;
    dasharray?: string;
    markerActive: string;
    markerMuted: string;
  }
> = {
  fundamenta: {
    stroke: '#1F1147',
    mutedStroke: '#B8B1C9',
    markerActive: 'url(#arrow-indigo)',
    markerMuted: 'url(#arrow-muted)',
  },
  tensiona: {
    stroke: '#0D47FF',
    mutedStroke: '#9BB2F5',
    dasharray: '6 5',
    markerActive: 'url(#arrow-cobalt)',
    markerMuted: 'url(#arrow-muted-cobalt)',
  },
  deriva: {
    stroke: '#0D47FF',
    mutedStroke: '#A59EC2',
    markerActive: 'url(#arrow-cobalt)',
    markerMuted: 'url(#arrow-muted)',
  },
};

export const ConceptMapCanvas: React.FC<ConceptMapCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  categoryFilter,
  onChangeCategoryFilter,
  sessionFilter,
  onChangeSessionFilter,
  viewState,
  onChangeViewState,
  focusRequest,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const lastFocusNonceRef = useRef<number | null>(null);

  const { scale, pan, initialized } = viewState;

  const fitToViewport = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 44;
    const scaleX = (rect.width - pad * 2) / CANVAS_W;
    const scaleY = (rect.height - pad * 2) / CANVAS_H;
    const nextScale = Math.max(0.45, Math.min(1.08, Math.min(scaleX, scaleY)));
    const nextX = (rect.width - CANVAS_W * nextScale) / 2;
    const nextY = (rect.height - CANVAS_H * nextScale) / 2;
    onChangeViewState({
      scale: Number(nextScale.toFixed(2)),
      pan: { x: Math.round(nextX), y: Math.round(nextY) },
      initialized: true,
    });
  }, [onChangeViewState]);

  const centerOnNode = useCallback(
    (nodeId: string) => {
      const el = viewportRef.current;
      const target = nodes.find((n) => n.id === nodeId);
      if (!el || !target) return;
      const rect = el.getBoundingClientRect();
      const isDesktopDrawer = rect.width >= 768;
      onChangeViewState((prev) => {
        const targetScale = Math.max(prev.initialized ? prev.scale : 0.94, 0.94);
        return {
          scale: targetScale,
          pan: {
            x: Math.round(rect.width * (isDesktopDrawer ? 0.36 : 0.5) - target.x * targetScale),
            y: Math.round(rect.height / 2 - target.y * targetScale),
          },
          initialized: true,
        };
      });
    },
    [nodes, onChangeViewState]
  );

  // Auto-fit only on first initialization when no explicit cross-view focus request is active
  useEffect(() => {
    if (!initialized && !focusRequest) {
      fitToViewport();
    }
  }, [initialized, focusRequest, fitToViewport]);

  // Center explicitly when navigating from Hallazgos, Proyectos, or Sesiones
  useEffect(() => {
    if (!focusRequest) return;
    if (lastFocusNonceRef.current === focusRequest.nonce) return;
    lastFocusNonceRef.current = focusRequest.nonce;
    centerOnNode(focusRequest.nodeId);
  }, [focusRequest, centerOnNode]);

  const matchingNodeIds = useMemo(() => {
    return new Set(
      nodes
        .filter((node) => {
          const matchesCat = categoryFilter === 'todos' || node.category === categoryFilter;
          const matchesSess = sessionFilter === 'todas' || node.sessions.includes(sessionFilter);
          return matchesCat && matchesSess;
        })
        .map((n) => n.id)
    );
  }, [nodes, categoryFilter, sessionFilter]);

  const activeFocusId = hoveredNodeId || selectedNodeId;

  const connectedIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const set = new Set<string>([activeFocusId]);
    edges.forEach((edge) => {
      if (edge.from === activeFocusId) set.add(edge.to);
      if (edge.to === activeFocusId) set.add(edge.from);
    });
    return set;
  }, [activeFocusId, edges]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-node-card="true"]')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    onChangeViewState((prev) => ({
      ...prev,
      pan: {
        x: dragStartRef.current!.panX + dx,
        y: dragStartRef.current!.panY + dy,
      },
      initialized: true,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      onChangeViewState((prev) => ({
        ...prev,
        scale: Number(Math.max(0.45, Math.min(1.4, prev.scale + delta)).toFixed(2)),
        initialized: true,
      }));
    }
  };

  const nodeMap = useMemo(() => {
    const m = new Map<string, ConceptNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  return (
    <section
      aria-label="Mapa conceptual navegable"
      className="relative w-full h-[calc(100dvh-132px)] md:h-[calc(100dvh-98px)] min-h-[520px] rounded-2xl border border-[#1F1147]/15 bg-[#FAFAF8] overflow-hidden"
    >
      {/* Floating Top-Left Filter Strip (quiet, editorial, non-SaaS) */}
      <div className="absolute top-3.5 left-3.5 right-3.5 sm:right-auto z-30 flex flex-wrap items-center gap-2">
        <div
          className="flex flex-wrap items-center gap-0.5 bg-white/95 backdrop-blur-xs border border-[#1F1147]/20 p-1 rounded-xl"
          role="group"
          aria-label="Filtrar por tipo de nodo"
          data-no-arrow-nav="true"
        >
          {(
            [
              { id: 'todos', label: 'Todo' },
              { id: 'concepto', label: 'Fundamentos' },
              { id: 'apuesta', label: 'Apuestas' },
              { id: 'proyecto', label: 'Proyectos' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeCategoryFilter(item.id)}
              className={`px-2.5 py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] ${
                categoryFilter === item.id
                  ? 'bg-[#1F1147] text-[#FFE94D]'
                  : 'text-[#5B5275] hover:text-[#1F1147]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Filtrar por sesión"
          value={sessionFilter}
          onChange={(e) => onChangeSessionFilter(e.target.value as SessionId | 'todas')}
          className="min-h-[36px] sm:min-h-0 text-xs font-semibold rounded-xl border border-[#1F1147]/20 bg-white/95 text-[#1F1147] px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] cursor-pointer"
        >
          {SESSION_FILTERS.map((sf) => (
            <option key={sf.id} value={sf.id}>
              {sf.label}
            </option>
          ))}
        </select>
      </div>

      {/* Interactive Full-Width Cartography Viewport */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className={`w-full h-full overflow-hidden specimen-grid select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
          className="relative transition-transform duration-75 ease-out"
        >
          {/* Organic Cartographic Contours & Whispered Annotations (no rigid grid boxes!) */}
          <svg
            width={CANVAS_W}
            height={CANVAS_H}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="arrow-muted"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B8B1C9" />
              </marker>
              <marker
                id="arrow-muted-cobalt"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#9BB2F5" />
              </marker>
              <marker
                id="arrow-indigo"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1F1147" />
              </marker>
              <marker
                id="arrow-cobalt"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0D47FF" />
              </marker>
            </defs>

            {/* Subtle asymmetric organic contour around conceptual core */}
            <ellipse
              cx="565"
              cy="460"
              rx="320"
              ry="215"
              transform="rotate(-8 565 460)"
              fill="rgba(255, 255, 255, 0.45)"
              stroke="rgba(31, 17, 71, 0.08)"
              strokeWidth="1.2"
              strokeDasharray="3 6"
            />

            {/* Subtle editorial zone whispers */}
            <text
              x="295"
              y="265"
              fontSize="11"
              fontFamily="Allo, system-ui, sans-serif"
              fontWeight="700"
              letterSpacing="0.08em"
              fill="#5B5275"
            >
              NÚCLEO · FUNDAMENTOS
            </text>
            <text
              x="695"
              y="176"
              fontSize="11"
              fontFamily="Allo, system-ui, sans-serif"
              fontWeight="700"
              letterSpacing="0.08em"
              fill="#5B5275"
            >
              APUESTAS METODOLÓGICAS
            </text>
            <text
              x="1055"
              y="76"
              fontSize="11"
              fontFamily="Allo, system-ui, sans-serif"
              fontWeight="700"
              letterSpacing="0.08em"
              fill="#5B5275"
            >
              PROYECTOS Y PROTOTIPOS
            </text>

            {/* Semantic Edges */}
            {edges.map((edge, idx) => {
              const source = nodeMap.get(edge.from);
              const target = nodeMap.get(edge.to);
              if (!source || !target) return null;

              const isConnected =
                activeFocusId !== null &&
                (edge.from === activeFocusId || edge.to === activeFocusId);
              const bothVisible =
                matchingNodeIds.has(edge.from) && matchingNodeIds.has(edge.to);

              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const dist = Math.hypot(dx, dy) || 1;
              const ux = dx / dist;
              const uy = dy / dist;

              const startX = source.x + ux * (NODE_W * 0.42);
              const startY = source.y + uy * (NODE_H * 0.48);
              const endX = target.x - ux * (NODE_W * 0.46);
              const endY = target.y - uy * (NODE_H * 0.52);

              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;
              // Alternate gentle curve direction so twin links never collide
              const bow = idx % 2 === 0 ? 22 : -22;
              const ctrlX = midX - uy * bow;
              const ctrlY = midY + ux * bow;
              const labelX = (startX + 2 * ctrlX + endX) / 4;
              const labelY = (startY + 2 * ctrlY + endY) / 4;

              const pathD = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
              const style = EDGE_STYLE[edge.kind];
              const labelWidth = Math.max(106, Math.round(edge.label.length * 6.5 + 22));

              return (
                <g
                  key={edge.id}
                  style={{
                    opacity: !bothVisible
                      ? 0.08
                      : activeFocusId === null
                        ? 0.72
                        : isConnected
                          ? 1
                          : 0.16,
                    transition: 'opacity 180ms ease',
                  }}
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isConnected ? style.stroke : style.mutedStroke}
                    strokeWidth={
                      isConnected
                        ? edge.kind === 'deriva'
                          ? 2.6
                          : 2.1
                        : 1.35
                    }
                    strokeDasharray={style.dasharray}
                    markerEnd={isConnected ? style.markerActive : style.markerMuted}
                  />
                  {isConnected && (
                    <g transform={`translate(${labelX}, ${labelY})`}>
                      <rect
                        x={-labelWidth / 2}
                        y={-11}
                        width={labelWidth}
                        height={21}
                        rx={6}
                        fill="#1F1147"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fontSize="10.5"
                        fontFamily="Allo, system-ui, sans-serif"
                        fontWeight={600}
                        fill="#FFE94D"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes (Editorial Cartographic Pieces) */}
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isMatch = matchingNodeIds.has(node.id);
            const isNeighbor = activeFocusId ? connectedIds.has(node.id) : true;
            const isDimmed = !isMatch || (activeFocusId !== null && !isNeighbor);
            const surface = CATEGORY_SURFACE[node.category];
            const isAnchor = node.id === 'n1';

            return (
              <button
                key={node.id}
                type="button"
                data-node-card="true"
                onClick={() => onSelectNode(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                style={{
                  left: node.x - NODE_W / 2,
                  top: node.y - NODE_H / 2,
                  width: isAnchor ? NODE_W + 18 : NODE_W,
                  minHeight: isAnchor ? NODE_H + 8 : NODE_H,
                  backgroundColor: isSelected ? surface.selectedBg : surface.bg,
                  borderColor: isSelected
                    ? '#0D47FF'
                    : isAnchor
                      ? '#1F1147'
                      : 'rgba(31, 17, 71, 0.22)',
                  opacity: isDimmed ? 0.25 : 1,
                }}
                className={`absolute text-left transition-all duration-150 px-3.5 py-2.5 flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] ${
                  node.category === 'proyecto' ? 'rounded-xl' : 'rounded-2xl'
                } ${
                  isSelected
                    ? 'border-2 shadow-[0_4px_0_0_#0D47FF] -translate-y-0.5 z-20'
                    : isAnchor
                      ? 'border-2 shadow-[0_3px_0_0_#1F1147] hover:-translate-y-0.5 z-10'
                      : isNeighbor && activeFocusId
                        ? 'border-[1.5px] border-[#1F1147] z-10'
                        : 'border-[1.2px] hover:border-[#1F1147] hover:-translate-y-0.5 z-10'
                }`}
              >
                <div
                  className="flex items-center justify-between gap-2 text-[10.5px] font-bold allo-sharp"
                  style={{ color: isSelected ? '#0D47FF' : surface.kickerColor }}
                >
                  <span>
                    {String(node.order).padStart(2, '0')} · {node.categoryLabel}
                  </span>
                </div>
                <div
                  className={`allo-display leading-snug font-bold text-[#1F1147] mt-0.5 ${
                    isAnchor ? 'text-[16px]' : 'text-[14.5px]'
                  }`}
                >
                  {node.shortTitle}
                </div>
                <div className="text-[11px] text-[#5B5275] mt-0.5 truncate allo-tabular">
                  {node.sessionSpan}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quiet Bottom-Left Semantic Legend (nodes + edge types) */}
        <div className="hidden md:flex absolute bottom-3.5 left-3.5 items-center gap-4 rounded-xl bg-white/95 backdrop-blur-xs border border-[#1F1147]/18 px-3.5 py-2 text-[11px] font-medium text-[#1F1147]/80 z-30">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-3 rounded-[3px] bg-white border border-[#1F1147]/60 inline-block" aria-hidden="true" />
            Fundamento
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-3 rounded-[3px] bg-[#F1EDFF] border border-[#1F1147]/60 inline-block" aria-hidden="true" />
            Apuesta
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-3 rounded-[3px] bg-[#F2EFE9] border border-[#1F1147]/60 inline-block" aria-hidden="true" />
            Proyecto
          </span>
          <span className="w-px h-3.5 bg-[#1F1147]/15" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#1F1147] inline-block" aria-hidden="true" />
            Fundamenta
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-[#0D47FF] inline-block" aria-hidden="true" />
            Tensiona
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#0D47FF] inline-block" aria-hidden="true" />
            Deriva en
          </span>
        </div>

        {/* Quiet Bottom-Right Canvas Controls */}
        <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 z-30">
          {selectedNodeId && (
            <button
              type="button"
              onClick={() => centerOnNode(selectedNodeId)}
              title="Centrar en nodo activo"
              className="min-h-[36px] sm:min-h-0 rounded-xl border border-[#1F1147]/20 bg-white/95 hover:bg-[#F1EDFF] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F1147] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
            >
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Centrar</span>
            </button>
          )}

          <div className="rounded-xl border border-[#1F1147]/20 bg-white/95 flex items-center px-1 py-0.5">
            <button
              type="button"
              onClick={() =>
                onChangeViewState((prev) => ({
                  ...prev,
                  scale: Number(Math.min(1.4, prev.scale + 0.12).toFixed(2)),
                  initialized: true,
                }))
              }
              aria-label="Acercar mapa"
              className="p-2 sm:p-1.5 text-[#1F1147] hover:bg-[#F1EDFF] rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold allo-tabular text-[#1F1147] px-1.5">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                onChangeViewState((prev) => ({
                  ...prev,
                  scale: Number(Math.max(0.45, prev.scale - 0.12).toFixed(2)),
                  initialized: true,
                }))
              }
              aria-label="Alejar mapa"
              className="p-2 sm:p-1.5 text-[#1F1147] hover:bg-[#F1EDFF] rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={fitToViewport}
              aria-label="Encuadrar mapa completo"
              title="Encuadrar mapa"
              className="p-2 sm:p-1.5 text-[#1F1147] hover:bg-[#F1EDFF] rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
