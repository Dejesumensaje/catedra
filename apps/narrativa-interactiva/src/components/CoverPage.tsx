import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export type CoverDestination = 'mapa' | 'hallazgos' | 'proyectos' | 'sesiones';

interface CoverPageProps {
  onEnter: (destination: CoverDestination, focusNodeId?: string) => void;
}

export const CoverPage: React.FC<CoverPageProps> = ({ onEnter }) => {
  const [rondValue, setRondValue] = useState<number>(75);
  const [gridActive, setGridActive] = useState<boolean>(true);

  const morphRadius = `${Math.round((rondValue / 95) * 9)}px`;

  return (
    <div
      className={`min-h-screen text-[#1F1147] flex flex-col justify-between overflow-x-hidden transition-colors duration-300 ${
        gridActive ? 'specimen-grid bg-[#FAFAF8]' : 'bg-[#FAFAF8]'
      }`}
    >
      {/* Minimal Institutional Top Strip */}
      <header className="w-full border-b border-[#1F1147]/10">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 min-h-14 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs font-medium text-[#5B5275] allo-tabular">
          <a
            href="/"
            className="text-[#1F1147] font-semibold whitespace-nowrap underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] rounded-sm"
          >
            <span aria-hidden="true">← </span>Cátedra · William Montoya
          </a>
          <span>Universidad de Antioquia · 23 sep – 4 nov 2026</span>
        </div>
      </header>

      {/* Main Asymmetric Editorial Stage */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 sm:px-10 py-10 lg:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Primary Editorial Axis (6 cols): Title + Conceptual Thesis + Single CTA */}
          <div className="lg:col-span-6 space-y-8 relative z-10">
            <div className="space-y-4 sm:space-y-5">
              <h1 className="allo-display text-[44px] sm:text-6xl xl:text-[68px] font-black leading-[0.95] tracking-tight text-[#1F1147]">
                Laboratorio de
                <br />
                Narrativa
                <br />
                Interactiva
              </h1>

              {/* Conceptual Subtitle */}
              <div className="pt-2 flex items-baseline gap-4">
                <span
                  aria-hidden="true"
                  className={`hidden sm:inline-block h-[2px] transition-all duration-300 ${
                    gridActive ? 'w-11 bg-[#0D47FF]' : 'w-6 bg-[#1F1147]/30'
                  }`}
                />
                <p
                  className="text-2xl sm:text-3xl xl:text-[34px] font-semibold italic leading-tight text-[#0D47FF] transition-all duration-150"
                  style={{
                    fontVariationSettings: `"opsz" 32, "ROND" ${rondValue}`,
                    letterSpacing: '-0.02em',
                  }}
                >
                  La interfaz como puente
                </p>
              </div>

              <p className="max-w-[46ch] pt-2 text-base sm:text-lg leading-relaxed text-[#1F1147]">
                Bitácora de una asesoría a seis trabajos de grado: cuatro sesiones para destrabar
                proyectos de narrativa interactiva. Aquí quedan las ideas que salieron, cómo se
                conectan y qué cambió en cada proyecto.
              </p>
            </div>

            {/* Single Primary CTA + Quiet Secondary Navigation */}
            <div className="pt-3 flex flex-wrap items-center gap-x-7 gap-y-4">
              <button
                type="button"
                onClick={() => onEnter('mapa')}
                className="keycap-surface min-h-[44px] rounded-2xl bg-[#FFE94D] hover:bg-[#FFF078] text-[#1F1147] px-6 py-3 text-sm font-bold inline-flex items-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
              >
                <span>Explorar mapa</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <nav
                aria-label="Secciones de la bitácora"
                className="flex flex-wrap items-center gap-6 text-sm font-semibold text-[#5B5275]"
              >
                <button
                  type="button"
                  onClick={() => onEnter('hallazgos')}
                  className="min-h-[44px] inline-flex items-center hover:text-[#1F1147] underline underline-offset-4 decoration-[#1F1147]/20 hover:decoration-[#0D47FF] transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                >
                  Hallazgos
                </button>
                <button
                  type="button"
                  onClick={() => onEnter('proyectos')}
                  className="min-h-[44px] inline-flex items-center hover:text-[#1F1147] underline underline-offset-4 decoration-[#1F1147]/20 hover:decoration-[#0D47FF] transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                >
                  Proyectos
                </button>
                <button
                  type="button"
                  onClick={() => onEnter('sesiones')}
                  className="min-h-[44px] inline-flex items-center hover:text-[#1F1147] underline underline-offset-4 decoration-[#1F1147]/20 hover:decoration-[#0D47FF] transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                >
                  Sesiones
                </button>
              </nav>
            </div>
          </div>

          {/* Right Field (6 cols): Radial Outward-Flowing Constellation of Text-Free UI & Expressive Stickers */}
          <div className="lg:col-span-6 relative lg:h-[500px] flex flex-wrap items-center justify-center gap-4 py-2 lg:py-0 lg:block">
            {/* Subtle radial orbit guide (responds to grid toggle) */}
            <div
              aria-hidden="true"
              className={`hidden lg:block absolute left-[48%] top-[49%] -translate-x-1/2 -translate-y-1/2 w-[310px] h-[310px] rounded-full border border-dashed border-[#1F1147] transition-opacity duration-300 pointer-events-none ${
                gridActive ? 'opacity-[0.13]' : 'opacity-0'
              }`}
            />

            {/* ── INNER RADIAL CORE ── */}

            {/* Centerpiece: Expressive Dark Indigo Symbol Strip */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[35%] lg:top-[44%] select-none -rotate-2 z-20 transition-transform duration-200 ease-out hover:scale-[1.05] hover:rotate-1"
            >
              <div className="inline-flex items-center gap-3.5 rounded-full bg-[#1F1147] border-[1.5px] border-[#1F1147] px-4 py-2 text-sm">
                <span className="text-[#FFE94D]">★</span>
                <span className="text-[#FF4D8D]">♥</span>
                <span className="text-[#F1EDFF]">☺</span>
                <span className="text-[#FFE94D]">⌘</span>
                <span className="text-white">→</span>
              </div>
            </div>

            {/* Vector Cursor poised near center hub */}
            <div
              aria-hidden="true"
              className="hidden lg:block lg:absolute lg:left-[64%] lg:top-[43%] select-none z-30 transition-transform duration-200 ease-out hover:scale-[1.12] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 3 L19 10.5 L12.2 12.6 L9.8 19.5 Z"
                  fill="#FF4D8D"
                  stroke="#1F1147"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Inner 11:30: Yellow Circular Smiley */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[31%] lg:top-[24%] select-none -rotate-6 z-10 transition-transform duration-200 ease-out hover:scale-[1.07] hover:rotate-6"
            >
              <div className="w-[66px] h-[66px] rounded-full bg-[#FFE94D] border-[1.5px] border-[#1F1147] border-b-[3px] flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 42 42" fill="none">
                  <circle cx="15" cy="16" r="2.3" fill="#1F1147" />
                  <circle cx="27" cy="16" r="2.3" fill="#1F1147" />
                  <path
                    d="M13 24.5 C15.2 29, 26.8 29, 29 24.5"
                    stroke="#1F1147"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Inner 1:30: Curved Map Connector */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[54%] lg:top-[22%] select-none transition-transform duration-200 ease-out hover:scale-[1.05] hover:-rotate-2"
            >
              <svg
                width="146"
                height="54"
                viewBox="0 0 146 54"
                fill="none"
                className="overflow-visible"
              >
                <path
                  d="M 14 38 C 52 8, 92 44, 132 14"
                  stroke={gridActive ? '#0D47FF' : '#1F1147'}
                  strokeOpacity={gridActive ? 0.9 : 0.28}
                  strokeWidth={gridActive ? '1.8' : '1.25'}
                  strokeDasharray="5 4"
                  className="transition-all duration-300"
                />
                <rect
                  x="6"
                  y="30"
                  width="16"
                  height="16"
                  rx="5"
                  fill="#FFFFFF"
                  stroke="#1F1147"
                  strokeWidth="1.4"
                />
                <circle
                  cx="14"
                  cy="38"
                  r="2.6"
                  fill={gridActive ? '#0D47FF' : '#5B5275'}
                />
                <rect
                  x="124"
                  y="6"
                  width="16"
                  height="16"
                  rx="5"
                  fill="#F1EDFF"
                  stroke="#1F1147"
                  strokeWidth="1.4"
                />
                <circle
                  cx="132"
                  cy="14"
                  r="2.8"
                  fill={gridActive ? '#FF4D8D' : '#5B5275'}
                />
              </svg>
            </div>

            {/* Inner 4:00: Functional Text-Free Roundness Slider */}
            <div className="lg:absolute lg:left-[50%] xl:left-[54%] lg:top-[57%] rotate-1 z-10 transition-transform duration-200 ease-out hover:scale-[1.03] hover:rotate-0">
              <div className="w-[196px] min-h-[44px] rounded-2xl bg-[#F1EDFF] border-[1.5px] border-[#1F1147] border-b-[3px] px-3.5 py-2.5 flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="w-3.5 h-3.5 border-[1.5px] border-[#1F1147] bg-white shrink-0"
                />
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={rondValue}
                  aria-label="Ajustar curvatura tipográfica"
                  onChange={(e) => setRondValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-white rounded-full appearance-none cursor-pointer accent-[#0D47FF] border border-[#1F1147]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF]"
                />
                <span
                  aria-hidden="true"
                  className="w-4 h-4 border-[1.5px] border-[#1F1147] bg-[#FFE94D] shrink-0 transition-all duration-150"
                  style={{ borderRadius: morphRadius }}
                />
              </div>
            </div>

            {/* ── MIDDLE RADIAL RING ── */}

            {/* 10:30: Pink Heart Badge */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[16%] lg:top-[16%] select-none rotate-6 transition-transform duration-200 ease-out hover:scale-[1.1] hover:-rotate-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FF4D8D] border-[1.5px] border-[#1F1147] border-b-[3px] flex items-center justify-center text-white text-base leading-none">
                ♥
              </div>
            </div>

            {/* 12:30: Connection Dots Chain */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[47%] lg:top-[11%] select-none -rotate-3 transition-transform duration-200 ease-out hover:scale-[1.08] hover:rotate-0"
            >
              <svg width="72" height="18" viewBox="0 0 72 18" fill="none">
                <line
                  x1="9"
                  y1="9"
                  x2="63"
                  y2="9"
                  stroke="#1F1147"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="4.5"
                  fill="#FFE94D"
                  stroke="#1F1147"
                  strokeWidth="1.4"
                />
                <circle
                  cx="36"
                  cy="9"
                  r="3.5"
                  fill="#FFFFFF"
                  stroke="#1F1147"
                  strokeWidth="1.4"
                />
                <circle
                  cx="63"
                  cy="9"
                  r="4.5"
                  fill="#0D47FF"
                  stroke="#1F1147"
                  strokeWidth="1.4"
                />
              </svg>
            </div>

            {/* 2:30: Simple Diagonal Arrow Chip */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[79%] xl:left-[83%] lg:top-[28%] select-none rotate-6 transition-transform duration-200 ease-out hover:scale-[1.1] hover:rotate-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F2EFE9] border-[1.5px] border-[#1F1147] border-b-[2.5px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 11 L11 3 M5 3 H11 V9"
                    stroke="#1F1147"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* 5:00: Abstract Cobalt Window Controls */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[66%] lg:top-[73%] select-none -rotate-3 transition-transform duration-200 ease-out hover:scale-[1.06] hover:rotate-1"
            >
              <div className="inline-flex items-center gap-2.5 rounded-2xl bg-[#0D47FF] border-[1.5px] border-[#1F1147] border-b-[3px] px-3.5 py-2.5">
                <span className="w-3 h-[2px] bg-white rounded-full" />
                <span className="w-3 h-3 border-[1.8px] border-[#FFE94D] rounded-[3px]" />
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 2 L10 10 M10 2 L2 10"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* 6:30: Abstract Expand-Corners Control */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[44%] lg:top-[73%] select-none rotate-3 transition-transform duration-200 ease-out hover:scale-[1.1] hover:-rotate-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F2EFE9] border-[1.5px] border-[#1F1147] border-b-[2.5px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2.5 6 V2.5 H6 M10 2.5 H13.5 V6 M13.5 10 V13.5 H10 M6 13.5 H2.5 V10"
                    stroke="#1F1147"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* 7:30: Simple Arrows & Dots Pill */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[18%] lg:top-[64%] select-none -rotate-3 transition-transform duration-200 ease-out hover:scale-[1.06] hover:rotate-1"
            >
              <div className="inline-flex items-center gap-2 rounded-xl bg-white border-[1.5px] border-[#1F1147] border-b-[3px] px-3 py-2 text-xs font-bold">
                <span className="text-[#1F1147]">←</span>
                <span className="w-1 h-1 rounded-full bg-[#1F1147]/30" />
                <span className="text-[#0D47FF]">→</span>
                <span className="w-1 h-1 rounded-full bg-[#1F1147]/30" />
                <span className="text-[#FF4D8D]">↗</span>
              </div>
            </div>

            {/* 9:00: Functional Text-Free Grid Toggle */}
            <div className="lg:absolute lg:left-[3%] lg:top-[44%] -rotate-2 transition-transform duration-200 ease-out hover:scale-[1.04] hover:rotate-0">
              <div className="min-h-[44px] inline-flex items-center gap-2.5 rounded-xl bg-white border-[1.5px] border-[#1F1147] border-b-[3px] px-3 py-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="3" cy="3" r="1.3" fill="#1F1147" />
                  <circle cx="7" cy="3" r="1.3" fill="#1F1147" />
                  <circle cx="11" cy="3" r="1.3" fill="#1F1147" />
                  <circle cx="3" cy="7" r="1.3" fill="#1F1147" />
                  <circle cx="7" cy="7" r="1.3" fill="#0D47FF" />
                  <circle cx="11" cy="7" r="1.3" fill="#1F1147" />
                  <circle cx="3" cy="11" r="1.3" fill="#1F1147" />
                  <circle cx="7" cy="11" r="1.3" fill="#1F1147" />
                  <circle cx="11" cy="11" r="1.3" fill="#1F1147" />
                </svg>
                <button
                  type="button"
                  role="switch"
                  aria-checked={gridActive}
                  aria-label="Alternar retícula visual"
                  onClick={() => setGridActive((prev) => !prev)}
                  className={`relative w-10 h-5 rounded-full border border-[#1F1147] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] focus-visible:ring-offset-1 ${
                    gridActive ? 'bg-[#FFE94D]' : 'bg-[#F2EFE9]'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-[#1F1147] transition-transform duration-150 ${
                      gridActive ? 'translate-x-[21px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 9:45: Pure Symbol Keycap */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[13%] lg:top-[32%] select-none -rotate-6 transition-transform duration-200 ease-out hover:scale-[1.08] hover:rotate-2"
            >
              <div className="inline-flex items-center justify-center w-10 h-9 rounded-xl bg-[#FFF8E7] border-[1.5px] border-[#1F1147] border-b-[3px] text-sm font-bold text-[#1F1147]">
                ↵
              </div>
            </div>

            {/* ── OUTER DRIFTING PUNCTUATION ── */}

            {/* 12:00: Pink 4-point Sparkle */}
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 28 28"
              fill="none"
              className="hidden lg:block lg:absolute lg:left-[39%] lg:top-[5%] transition-transform duration-200 ease-out hover:scale-[1.18] hover:rotate-12"
            >
              <path
                d="M14 2 L16.8 11.2 L26 14 L16.8 16.8 L14 26 L11.2 16.8 L2 14 L11.2 11.2 Z"
                fill="#FF4D8D"
                stroke="#1F1147"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* 2:00: Circular '×' Close Control */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[79%] xl:left-[83%] lg:top-[10%] select-none rotate-6 transition-transform duration-200 ease-out hover:scale-[1.12] hover:-rotate-6"
            >
              <div className="w-8 h-8 rounded-full bg-white border-[1.5px] border-[#1F1147] border-b-[2.5px] flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5"
                    stroke="#1F1147"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* 3:30: Minimal 2-Dot Connector */}
            <svg
              aria-hidden="true"
              width="40"
              height="12"
              viewBox="0 0 40 12"
              fill="none"
              className="hidden lg:block lg:absolute lg:left-[82%] xl:left-[86%] lg:top-[48%] transition-transform duration-200 ease-out hover:scale-[1.12] hover:-rotate-6"
            >
              <circle cx="6" cy="6" r="3" fill="#1F1147" />
              <line
                x1="9"
                y1="6"
                x2="31"
                y2="6"
                stroke="#1F1147"
                strokeWidth="1.4"
              />
              <circle cx="34" cy="6" r="3" fill="#FF4D8D" />
            </svg>

            {/* 5:30: Lavender 4-point Sparkle */}
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="hidden lg:block lg:absolute lg:left-[57%] lg:top-[87%] transition-transform duration-200 ease-out hover:scale-[1.18] hover:-rotate-12"
            >
              <path
                d="M12 2 L14.4 9.6 L22 12 L14.4 14.4 L12 22 L9.6 14.4 L2 12 L9.6 9.6 Z"
                fill="#F1EDFF"
                stroke="#1F1147"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>

            {/* 7:00: Yellow 5-Point Star */}
            <svg
              aria-hidden="true"
              width="40"
              height="40"
              viewBox="0 0 48 48"
              fill="none"
              className="lg:absolute lg:left-[28%] lg:top-[81%] -rotate-12 select-none transition-transform duration-200 ease-out hover:scale-[1.12] hover:rotate-6"
            >
              <path
                d="M24 3 L29.8 16.2 L44 17.8 L33.2 27.4 L36.2 41.5 L24 34.2 L11.8 41.5 L14.8 27.4 L4 17.8 L18.2 16.2 Z"
                fill="#FFE94D"
                stroke="#1F1147"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>

            {/* 8:00: Expansion / Collapse Dash Chip */}
            <div
              aria-hidden="true"
              className="lg:absolute lg:left-[6%] lg:top-[73%] select-none rotate-3 transition-transform duration-200 ease-out hover:scale-[1.1] hover:-rotate-3"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F1EDFF] border-[1.5px] border-[#1F1147] border-b-[2.5px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7 H11"
                    stroke="#1F1147"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-[#1F1147]/12">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-xs text-[#5B5275]">
          <p>
            <span className="font-semibold text-[#1F1147]">William Montoya</span>, docente.
            Los nombres de quienes participaron se omiten: cada proceso se nombra por su proyecto.
          </p>
          <a
            href="/licencia"
            className="font-semibold text-[#1F1147] underline underline-offset-4 decoration-[#1F1147]/30 hover:decoration-[#0D47FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47FF] rounded-sm"
          >
            Licencia y usos
          </a>
        </div>
      </footer>
    </div>
  );
};
