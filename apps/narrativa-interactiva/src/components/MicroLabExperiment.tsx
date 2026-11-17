import React, { useEffect, useRef, useState } from 'react';
import { MicroLabType } from '../data/bitacoraData';
import { RotateCcw, Hand, SlidersHorizontal, Eye, Wind } from 'lucide-react';

interface MicroLabExperimentProps {
  type: MicroLabType;
}

export const MicroLabExperiment: React.FC<MicroLabExperimentProps> = ({ type }) => {
  switch (type) {
    case 'gesture-to-meaning':
      return <GestureScrollRainExperiment />;
    case 'agency-levels':
      return <AgencyTriadExperiment />;
    case 'literal-vs-expressive':
      return <LiteralVsExpressiveExperiment />;
    case 'subtraction-mechanics':
      return <SubtractionMechanicsExperiment />;
    case 'kite-rhythm':
      return <KiteRhythmExperiment />;
    default:
      return null;
  }
};

/* 1. Subvertir el gesto: del desplazamiento neutro a la lluvia atmosférica */
const GestureScrollRainExperiment: React.FC = () => {
  const [intensity, setIntensity] = useState<number>(28);

  const atmosphereLabel =
    intensity < 25
      ? 'Calle despejada · espera latente'
      : intensity < 65
        ? 'Llovizna creciente · la ciudad cambia de tono'
        : 'Aguacero pleno · el gesto altera todo el entorno';

  const drops = Array.from({ length: Math.round(intensity / 4) }, (_, idx) => {
    const left = ((idx * 37) % 94) + 3;
    const top = ((idx * 53) % 72) + 8;
    const length = 10 + (idx % 4) * 5;
    return { id: idx, left, top, length };
  });

  return (
    <div className="rounded-2xl border-[1.5px] border-[#1F1147]/15 bg-[#FAFAF8] p-4">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1F1147]/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1147] allo-sharp">
          <Hand className="w-3.5 h-3.5 text-[#0D47FF]" aria-hidden="true" />
          <span>Micro-ensayo · Regla de gesto</span>
        </div>
        <span className="text-xs font-bold allo-tabular text-[#0D47FF]">{intensity}%</span>
      </div>

      <p className="text-xs text-[#5B5275] mt-3 mb-3 leading-relaxed">
        Mueve el deslizador como si hicieras scroll: en el demo del 7 de octubre, un gesto cotidiano deja de mover texto para regular la lluvia de la escena.
      </p>

      <div
        className="relative h-28 rounded-xl border-[1.5px] border-[#1F1147]/20 overflow-hidden transition-colors duration-200 flex items-end p-3"
        style={{
          backgroundColor:
            intensity < 25 ? '#FFFFFF' : intensity < 65 ? '#F1EDFF' : '#DCE7FF',
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          {drops.map((drop) => (
            <line
              key={drop.id}
              x1={`${drop.left}%`}
              y1={`${drop.top}%`}
              x2={`${drop.left - 2}%`}
              y2={`${drop.top + drop.length}%`}
              stroke="#0D47FF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeOpacity={0.4 + intensity / 180}
            />
          ))}
        </svg>
        <div className="relative z-10 flex items-center justify-between w-full text-xs">
          <span className="font-semibold text-[#1F1147] bg-white/95 px-2.5 py-1 rounded-lg border border-[#1F1147]/20">
            {atmosphereLabel}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <label htmlFor="rain-gesture-slider" className="text-xs font-semibold text-[#1F1147] whitespace-nowrap">
          Intensidad del gesto
        </label>
        <input
          id="rain-gesture-slider"
          type="range"
          min={0}
          max={100}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full accent-[#0D47FF] cursor-pointer"
        />
      </div>
    </div>
  );
};

/* 2. Tres niveles de agencia */
const AgencyTriadExperiment: React.FC = () => {
  const [level, setLevel] = useState<'revelar' | 'experimentar' | 'construir'>('experimentar');

  const specs = {
    revelar: {
      role: 'Explorador de capas',
      action: 'Hacer clic o desplazarse sobre un archivo ya estructurado.',
      system: 'Encuentra testimonios, sonidos o fragmentos ocultos.',
      example: 'Especial multimedia o capa de memoria previa en un relato.',
    },
    experimentar: {
      role: 'Cuerpo afectado',
      action: 'Sostener una postura incómoda o recorrer un entorno ruidoso.',
      system: 'Traduce una sensación física o emocional (peso, mareo, desorientación).',
      example: 'El duelo que pesa al recoger recuerdos, o el murciélago en el tráfico.',
    },
    construir: {
      role: 'Actor co-creador',
      action: 'Tomar decisiones abiertas frente a un sistema vivo con reglas.',
      system: 'Se transforma y devuelve consecuencias ambiguas para interpretar.',
      example: 'Dejar una huella territorial propia o dialogar con la flora urbana.',
    },
  }[level];

  return (
    <div className="rounded-2xl border-[1.5px] border-[#1F1147]/15 bg-[#FAFAF8] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1147] pb-2.5 border-b border-[#1F1147]/10 allo-sharp">
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#0D47FF]" aria-hidden="true" />
        <span>Comparador · Grados de agencia</span>
      </div>

      <div
        role="group"
        aria-label="Niveles de agencia"
        data-no-arrow-nav="true"
        className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#1F1147] mt-3"
      >
        {(
          [
            { id: 'revelar', label: '1. Revelar' },
            { id: 'experimentar', label: '2. Experimentar' },
            { id: 'construir', label: '3. Construir' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setLevel(tab.id)}
            className={`min-h-[38px] px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE94D] ${
              level === tab.id
                ? 'bg-[#FFE94D] text-[#1F1147]'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <dl className="mt-3.5 space-y-2 text-xs">
        <div className="flex justify-between gap-4 border-b border-[#1F1147]/10 pb-1.5">
          <dt className="text-[#5B5275] shrink-0">Rol asumido</dt>
          <dd className="font-bold text-[#1F1147] text-right">{specs.role}</dd>
        </div>
        <div className="border-b border-[#1F1147]/10 pb-1.5">
          <dt className="text-[#5B5275]">Qué hace quien participa</dt>
          <dd className="text-[#1F1147] mt-0.5">{specs.action}</dd>
        </div>
        <div className="border-b border-[#1F1147]/10 pb-1.5">
          <dt className="text-[#5B5275]">Qué responde el sistema</dt>
          <dd className="text-[#1F1147] mt-0.5">{specs.system}</dd>
        </div>
        <div>
          <dt className="text-[#5B5275]">Referencia del lab</dt>
          <dd className="text-[#0D47FF] italic font-medium mt-0.5">{specs.example}</dd>
        </div>
      </dl>
    </div>
  );
};

/* 3. Lo literal vs. lo expresivo */
const LiteralVsExpressiveExperiment: React.FC = () => {
  const [mode, setMode] = useState<'literal' | 'expresivo'>('expresivo');
  const [chirpActive, setChirpActive] = useState(false);

  return (
    <div className="rounded-2xl border-[1.5px] border-[#1F1147]/15 bg-[#FAFAF8] p-4">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1F1147]/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1147] allo-sharp">
          <Eye className="w-3.5 h-3.5 text-[#0D47FF]" aria-hidden="true" />
          <span>Contraste · Giro perceptual</span>
        </div>
        <div
          role="group"
          aria-label="Modo de representación"
          data-no-arrow-nav="true"
          className="flex items-center gap-1 bg-[#1F1147] rounded-lg p-0.5"
        >
          <button
            type="button"
            onClick={() => setMode('literal')}
            className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE94D] ${
              mode === 'literal' ? 'bg-[#FFE94D] text-[#1F1147]' : 'text-white/80'
            }`}
          >
            Literal
          </button>
          <button
            type="button"
            onClick={() => setMode('expresivo')}
            className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE94D] ${
              mode === 'expresivo' ? 'bg-[#FFE94D] text-[#1F1147]' : 'text-white/80'
            }`}
          >
            Metáfora
          </button>
        </div>
      </div>

      <div
        className="mt-3 h-32 rounded-xl border-[1.5px] border-[#1F1147] relative overflow-hidden flex flex-col justify-between p-3 cursor-pointer select-none bg-[#1F1147]"
        onMouseDown={() => setChirpActive(true)}
        onMouseUp={() => setChirpActive(false)}
        onMouseLeave={() => setChirpActive(false)}
        onTouchStart={() => setChirpActive(true)}
        onTouchEnd={() => setChirpActive(false)}
        style={{
          fontVariationSettings: mode === 'literal' ? '"ROND" 0' : '"ROND" 95',
        }}
      >
        {mode === 'literal' ? (
          <div className="space-y-2 text-white">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#FFE94D] allo-sharp">
              <span>ENERGÍA BIOSONAR</span>
              <span>62 / 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full w-3/5 bg-[#0D47FF]" />
            </div>
            <div className="flex items-center gap-3 pt-1.5">
              <span className="w-6 h-6 rounded-full border-2 border-[#0D47FF] inline-block" />
              <span className="w-8 h-8 rounded-full border-2 border-[#FFE94D] inline-block" />
              <span className="text-xs text-white/80">Ondas de color + barra HUD literal</span>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex flex-col justify-between">
            <div
              className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(255,233,77,0.3) 1px, transparent 0)',
                backgroundSize: chirpActive ? '10px 10px' : '4px 4px',
                opacity: chirpActive ? 0.25 : 0.85,
              }}
            />
            {chirpActive && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(13, 71, 255, 0.35) 0%, transparent 65%)',
                }}
              />
            )}
            <div className="relative z-10 flex items-center justify-between text-xs text-[#FFE94D]">
              <span className="font-semibold text-[11px] allo-tabular">
                {chirpActive ? 'CHILLIDO · CONO NÍTIDO' : 'RUIDO VEHICULAR · VISIÓN GRANULOSA'}
              </span>
            </div>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={() => setChirpActive((prev) => !prev)}
              className="keycap-surface relative z-10 self-start rounded-lg px-3 py-1.5 min-h-[36px] text-xs bg-white text-[#1F1147] font-semibold hover:bg-[#FFE94D] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE94D]"
            >
              {chirpActive ? 'Soltar chillido' : 'Mantener o pulsar para emitir eco'}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-[#5B5275] mt-2.5 leading-relaxed">
        {mode === 'literal'
          ? 'Versión inicial: indicadores de videojuego (barra de energía y ecos de colores literales) que explican el fenómeno desde fuera.'
          : 'Apuesta del cierre: el ruido vuelve granulosa la percepción; el chillido abre un cono breve de nitidez que compite contra el tráfico.'}
      </p>
    </div>
  );
};

/* 4. Diseñar por sustracción */
const SubtractionMechanicsExperiment: React.FC = () => {
  const [simplified, setSimplified] = useState(true);
  const [activeControl, setActiveControl] = useState<'mateo' | 'entidad'>('mateo');

  return (
    <div className="rounded-2xl border-[1.5px] border-[#1F1147]/15 bg-[#FAFAF8] p-4">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1F1147]/10">
        <span className="text-xs font-semibold text-[#1F1147] allo-sharp">Método · Sustracción</span>
        <button
          type="button"
          onClick={() => setSimplified((v) => !v)}
          className="text-xs font-bold text-[#0D47FF] hover:underline cursor-pointer"
        >
          {simplified ? 'Ver etapa dispersa' : 'Aplicar sustracción'}
        </button>
      </div>

      {!simplified ? (
        <div className="mt-3 rounded-xl p-3 bg-[#F2EFE9] border border-[#1F1147]/15 text-xs text-[#1F1147] space-y-1.5">
          <div className="font-bold">Divergencia inicial (7 inputs simultáneos)</div>
          <p className="text-[#5B5275] leading-relaxed">
            Cortometraje + mapa ramificado + teclado + arrastrar objetos + scroll + clic sostenido + módulo educativo. Muchas piezas compiten antes de probar cómo se siente el núcleo.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-2.5">
          <p className="text-xs text-[#5B5275]">
            Convergencia sugerida en el laboratorio: asignar identidad narrativa a dos gestos opuestos del mismo mouse.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveControl('mateo')}
              className={`p-2.5 rounded-xl border-[1.5px] text-left transition-colors cursor-pointer ${
                activeControl === 'mateo'
                  ? 'border-[#0D47FF] bg-[#F1EDFF] shadow-[0_2px_0_0_#0D47FF]'
                  : 'border-[#1F1147]/20 bg-white hover:border-[#1F1147]'
              }`}
            >
              <div className="text-xs font-bold text-[#1F1147]">Clic sostenido</div>
              <div className="text-[11px] text-[#5B5275] mt-0.5">Mateo · resistencia pausada</div>
            </button>
            <button
              type="button"
              onClick={() => setActiveControl('entidad')}
              className={`p-2.5 rounded-xl border-[1.5px] text-left transition-colors cursor-pointer ${
                activeControl === 'entidad'
                  ? 'border-[#0D47FF] bg-[#F1EDFF] shadow-[0_2px_0_0_#0D47FF]'
                  : 'border-[#1F1147]/20 bg-white hover:border-[#1F1147]'
              }`}
            >
              <div className="text-xs font-bold text-[#1F1147]">Toques rápidos</div>
              <div className="text-[11px] text-[#5B5275] mt-0.5">Entidad espejo · ansiedad</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* 5. La Cometa Compartida: ritmo y permanencia */
const KiteRhythmExperiment: React.FC = () => {
  const [altitude, setAltitude] = useState(20);
  const [skyKites, setSkyKites] = useState(3);
  const [sustained, setSustained] = useState(false);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    if (sustained) return;
    const timer = window.setInterval(() => {
      setAltitude((prev) => Math.max(12, prev - 3));
    }, 240);
    return () => window.clearInterval(timer);
  }, [sustained]);

  const handleRhythmPulse = () => {
    if (sustained) return;
    const now = Date.now();
    const delta = now - lastTapRef.current;
    lastTapRef.current = now;
    const boost = delta >= 220 && delta <= 950 ? 18 : 10;
    setAltitude((prev) => {
      const next = Math.min(100, prev + boost);
      if (next >= 94) {
        setSustained(true);
        setSkyKites((k) => k + 1);
      }
      return next;
    });
  };

  const resetKite = () => {
    setSustained(false);
    setAltitude(20);
  };

  return (
    <div className="rounded-2xl border-[1.5px] border-[#1F1147]/15 bg-[#FAFAF8] p-4">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1F1147]/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1147] allo-sharp">
          <Wind className="w-3.5 h-3.5 text-[#0D47FF]" aria-hidden="true" />
          <span>Prototipo · Cometa compartida</span>
        </div>
        <span className="text-xs font-bold allo-tabular text-[#0D47FF]">
          {skyKites} en el cielo
        </span>
      </div>

      <div className="mt-3 h-36 rounded-xl bg-[#F1EDFF] border-[1.5px] border-[#1F1147]/20 relative overflow-hidden p-3 flex flex-col justify-between">
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 320 140" aria-hidden="true">
          {Array.from({ length: Math.min(skyKites, 7) }).map((_, i) => {
            const cx = 36 + ((i * 47) % 240);
            const cy = 20 + ((i * 19) % 34);
            return (
              <g key={i} opacity={0.45}>
                <polygon points={`${cx},${cy - 8} ${cx + 6},${cy} ${cx},${cy + 10} ${cx - 6},${cy}`} fill="#0D47FF" />
              </g>
            );
          })}
          {(() => {
            const ky = 115 - (altitude / 100) * 84;
            const kx = 160 + (sustained ? 14 : 0);
            return (
              <g>
                <path
                  d={`M 160 138 Q 148 ${128 - altitude * 0.25} ${kx} ${ky + 11}`}
                  fill="none"
                  stroke="#1F1147"
                  strokeWidth="1.4"
                  strokeDasharray="3 2"
                />
                <polygon
                  points={`${kx},${ky - 12} ${kx + 10},${ky} ${kx},${ky + 14} ${kx - 10},${ky}`}
                  fill={sustained ? '#0D47FF' : '#FFE94D'}
                  stroke="#1F1147"
                  strokeWidth="1.5"
                />
              </g>
            );
          })()}
        </svg>

        <div className="relative z-10 flex justify-between items-center text-[11px] font-semibold text-[#1F1147]">
          <span className="bg-white/95 px-2 py-0.5 rounded-md border border-[#1F1147]/15">
            {sustained ? 'SUSPENDIDA · PERMANENCIA LOGRADA' : 'SOSTÉN EL RITMO PARA ELEVAR'}
          </span>
          <span className="allo-tabular bg-white/95 px-2 py-0.5 rounded-md border border-[#1F1147]/15">
            {altitude}%
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {!sustained ? (
            <button
              type="button"
              onClick={handleRhythmPulse}
              className="keycap-surface rounded-xl px-3 py-1.5 bg-[#FFE94D] text-[#1F1147] text-xs font-bold hover:bg-[#FFF078] cursor-pointer"
            >
              Dar impulso rítmico
            </button>
          ) : (
            <button
              type="button"
              onClick={resetKite}
              className="keycap-surface rounded-xl inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1F1147] text-xs font-semibold hover:bg-[#F1EDFF] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Elevar otra cometa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
