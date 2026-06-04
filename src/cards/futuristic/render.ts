import { html, svg, nothing } from 'lit';
import { FuturisticModel } from './model';

// ---- layout (viewBox 0 0 800 470) ----------------------------------------
const C = { x: 400, y: 250 }; // reactor core
const SUN = { x: 120, y: 116 };
const BAT = { x: 110, y: 360 };
const GRID = { x: 690, y: 348 };
const HOME = { x: 680, y: 120 };

// Battery cell interior: x 80..140 (w60), y 306..418 (h112)
const BWAVE =
  'M0 0 q15 -4 30 0 t30 0 t30 0 t30 0 L120 200 L0 200 Z';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hex = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0');
const mix = (c1: number[], c2: number[], t: number) =>
  `#${hex(lerp(c1[0], c2[0], t))}${hex(lerp(c1[1], c2[1], t))}${hex(lerp(c1[2], c2[2], t))}`;

const fmtW = (w: number) =>
  Math.abs(w) >= 1000 ? `${(w / 1000).toFixed(2)} kW` : `${Math.round(w)} W`;

// A glowing conduit + flowing energy particles between two nodes.
const conduit = (
  idx: number,
  d: string,
  colour: string,
  watts: number,
  reverse: boolean,
  reduced: boolean,
) => {
  const active = watts > 15;
  const intensity = Math.min(1, watts / 4000);
  const count = active ? 2 + Math.round(intensity * 5) : 0;
  const dur = 2.4 - intensity * 1.3;
  const kp = reverse ? '1;0' : '0;1';
  const id = `fz-c${idx}`;
  return svg`
    <path id="${id}" class="fz-pipe" d="${d}" style="color:${colour}" />
    ${
      active && !reduced
        ? Array.from(
            { length: count },
            (_, i) => svg`
        <circle r="${(2.5 + intensity * 1.8).toFixed(1)}" class="fz-particle" style="color:${colour}">
          <animateMotion dur="${dur.toFixed(2)}s" begin="${((i * dur) / count).toFixed(2)}s"
            repeatCount="indefinite" keyPoints="${kp}" keyTimes="0;1" calcMode="linear">
            <mpath href="#${id}" />
          </animateMotion>
        </circle>`,
          )
        : nothing
    }
  `;
};

const chip = (x: number, y: number, label: string, value: string) => svg`
  <g class="fz-chip" transform="translate(${x} ${y})">
    <text class="fz-chip-v">${value}</text>
    <text class="fz-chip-l" y="11">${label}</text>
  </g>`;

export const futuristicCard = (m: FuturisticModel) => {
  const reduced = m.reducedMotion;
  const e = m.sunElevation; // 0 night .. 1 noon

  // Sky gradient interpolated between night and day.
  const skyTop = mix([5, 7, 16], [10, 26, 52], e);
  const skyBot = mix([11, 16, 32], [22, 54, 96], e);
  const starOp = (1 - e) * 0.9;

  // Battery liquid colour by SOC (green→amber→red), matching the battery card.
  const soc = Math.max(0, Math.min(100, m.batterySoc));
  const liq = soc >= 70 ? '#33c463' : soc > 30 ? '#ffc63a' : '#ff5252';
  const batTop = 306;
  const batH = 112;
  const surfaceY = batTop + (1 - soc / 100) * batH;

  // Sun size scales with production.
  const solarI = Math.min(1, m.solarW / 5000);
  const sunR = 26 + solarI * 16;

  // Home window glow scales with load.
  const loadI = Math.min(1, m.loadW / 4000);

  // Hero sub-line.
  const net = m.netGridW;
  const heroSub =
    Math.abs(net) < 20
      ? 'grid balanced'
      : net > 0
        ? `+${fmtW(net)} exporting`
        : `${fmtW(net)} importing`;

  // Stars (deterministic positions; no RNG).
  const stars = Array.from({ length: 26 }, (_, i) => {
    const x = ((i * 137) % 780) + 10;
    const y = ((i * 61) % 180) + 12;
    const r = (i % 3) * 0.4 + 0.5;
    const delay = (i % 7) * 0.5;
    return svg`<circle cx="${x}" cy="${y}" r="${r}" class="fz-star" style="animation-delay:${delay}s" />`;
  });

  return html`
    <ha-card>
      <style>
        .fz-wrap {
          position: relative;
          border-radius: var(--ha-card-border-radius, 12px);
          overflow: hidden;
          background: #05070f;
        }
        .fz-svg {
          display: block;
          width: 100%;
          height: auto;
        }
        .fz-title {
          fill: #eaf2ff;
          font-size: 13px;
          letter-spacing: 3px;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .fz-hero {
          fill: #ffffff;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .fz-hero-sub {
          fill: #9fc6ff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        text {
          text-anchor: middle;
          font-family:
            ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        .fz-star {
          fill: #cfe0ff;
          animation: fz-twinkle 3s ease-in-out infinite;
        }
        @keyframes fz-twinkle {
          0%,
          100% {
            opacity: 0.25;
          }
          50% {
            opacity: 1;
          }
        }
        /* conduits + particles */
        .fz-pipe {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-opacity: 0.32;
          stroke-linecap: round;
          filter: drop-shadow(0 0 3px currentColor);
        }
        .fz-particle {
          fill: currentColor;
          filter: drop-shadow(0 0 4px currentColor)
            drop-shadow(0 0 8px currentColor);
        }
        /* reactor core */
        .fz-core-aura {
          fill: url(#fz-core-grad);
          opacity: 0.5;
          filter: blur(6px);
          animation: fz-breathe 3.4s ease-in-out infinite;
        }
        .fz-ring,
        .fz-ring2 {
          fill: none;
          stroke: #bfe3ff;
          stroke-opacity: 0.7;
        }
        .fz-ring {
          stroke-width: 2;
          stroke-dasharray: 26 14;
        }
        .fz-ring2 {
          stroke-width: 1.2;
          stroke-dasharray: 6 10;
          stroke-opacity: 0.5;
        }
        .fz-ring-rot {
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-spin 14s linear infinite;
        }
        .fz-ring-rot.rev {
          animation: fz-spin 9s linear infinite reverse;
        }
        .fz-core-body {
          fill: url(#fz-core-grad);
          filter: drop-shadow(0 0 10px #7fd0ff)
            drop-shadow(0 0 22px #3aa0ff);
        }
        .fz-core-pulse {
          fill: none;
          stroke: #cfeaff;
          stroke-width: 2;
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-corepulse 2.6s ease-out infinite;
        }
        .fz-core-val {
          fill: #ffffff;
          font-size: 20px;
          font-weight: 800;
        }
        .fz-core-unit {
          fill: #bcd6ff;
          font-size: 10px;
          letter-spacing: 1px;
        }
        @keyframes fz-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fz-corepulse {
          0% {
            transform: scale(1);
            stroke-opacity: 0.8;
          }
          100% {
            transform: scale(2.1);
            stroke-opacity: 0;
          }
        }
        @keyframes fz-breathe {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }
        /* sun */
        .fz-sun {
          fill: url(#fz-sun-grad);
          filter: drop-shadow(0 0 12px currentColor)
            drop-shadow(0 0 26px currentColor);
        }
        .fz-sun-rays {
          stroke: currentColor;
          stroke-width: 2.4;
          stroke-linecap: round;
          opacity: 0.55;
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-spin 26s linear infinite;
        }
        /* battery cell */
        .fz-cell {
          fill: rgba(255, 255, 255, 0.04);
          stroke: rgba(255, 255, 255, 0.5);
          stroke-width: 2;
        }
        .fz-liquid {
          transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fz-wave {
          animation: fz-wave 3s linear infinite;
        }
        @keyframes fz-wave {
          to {
            transform: translateX(-60px);
          }
        }
        .fz-bubble {
          fill: #fff;
          opacity: 0;
          animation: fz-bubble 2.4s ease-in infinite;
        }
        @keyframes fz-bubble {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-95px);
            opacity: 0;
          }
        }
        .fz-soc {
          fill: #fff;
          font-size: 17px;
          font-weight: 800;
          paint-order: stroke;
          stroke: rgba(0, 0, 0, 0.4);
          stroke-width: 3;
        }
        /* grid pylon + home */
        .fz-struct {
          fill: none;
          stroke: currentColor;
          stroke-width: 2.4;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 5px currentColor);
        }
        .fz-house-fill {
          fill: currentColor;
          opacity: 0.12;
        }
        .fz-window {
          fill: #ffe9a8;
        }
        .fz-node-label {
          fill: #cfe0ff;
          font-size: 10px;
          letter-spacing: 1px;
          opacity: 0.8;
        }
        .fz-node-val {
          fill: #ffffff;
          font-size: 13px;
          font-weight: 700;
        }
        .fz-chip-v {
          fill: #eaf2ff;
          font-size: 12px;
          font-weight: 700;
        }
        .fz-chip-l {
          fill: #8fa6c8;
          font-size: 8px;
          letter-spacing: 0.5px;
        }
        @media (prefers-reduced-motion: reduce) {
          .fz-star,
          .fz-core-aura,
          .fz-core-pulse,
          .fz-ring-rot,
          .fz-sun-rays,
          .fz-wave,
          .fz-bubble {
            animation: none;
          }
        }
      </style>

      <div class="fz-wrap">
        <svg class="fz-svg" viewBox="0 0 800 470" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="fz-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="${skyTop}" />
              <stop offset="1" stop-color="${skyBot}" />
            </linearGradient>
            <radialGradient id="fz-core-grad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="#ffffff" />
              <stop offset="0.35" stop-color="#7fd0ff" />
              <stop offset="1" stop-color="#1c4f8f" />
            </radialGradient>
            <radialGradient id="fz-sun-grad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="#fff7e0" />
              <stop offset="0.5" stop-color="${m.solarColour}" />
              <stop offset="1" stop-color="${m.solarColour}" stop-opacity="0.2" />
            </radialGradient>
            <radialGradient id="fz-ground" cx="0.5" cy="1" r="0.7">
              <stop offset="0" stop-color="#1a3a6a" stop-opacity="0.5" />
              <stop offset="1" stop-color="#1a3a6a" stop-opacity="0" />
            </radialGradient>
            <clipPath id="fz-bclip">
              <rect x="80" y="306" width="60" height="112" rx="9" />
            </clipPath>
          </defs>

          <!-- sky + stars + ground -->
          <rect x="0" y="0" width="800" height="470" fill="url(#fz-sky)" />
          <g style="opacity:${starOp.toFixed(2)}">${stars}</g>
          <rect x="0" y="250" width="800" height="220" fill="url(#fz-ground)" />

          <!-- HUD corner brackets -->
          <g
            class="fz-hud"
            stroke="#7fd0ff"
            stroke-opacity="0.35"
            fill="none"
            stroke-width="2"
          >
            <path d="M16 42 L16 16 L42 16" />
            <path d="M784 42 L784 16 L758 16" />
            <path d="M16 428 L16 454 L42 454" />
            <path d="M784 428 L784 454 L758 454" />
          </g>

          <!-- hero -->
          <text class="fz-hero" x="400" y="44">
            ${m.selfSufficiency.toFixed(0)}% SELF-POWERED
          </text>
          <text class="fz-hero-sub" x="400" y="64">${heroSub}</text>
          ${
            m.title
              ? svg`<text class="fz-title" x="400" y="22">${m.title}</text>`
              : nothing
          }

          <!-- conduits (drawn under nodes) -->
          ${conduit(
            0,
            `M${SUN.x + 24} ${SUN.y + 24} C ${SUN.x + 130} ${SUN.y + 110}, ${C.x - 150} ${C.y - 30}, ${C.x - 34} ${C.y - 18}`,
            m.solarColour,
            m.solarW,
            false,
            reduced,
          )}
          ${conduit(
            1,
            `M${BAT.x + 5} ${BAT.y - 10} C ${BAT.x + 110} ${BAT.y - 30}, ${C.x - 150} ${C.y + 60}, ${C.x - 30} ${C.y + 14}`,
            liq,
            m.batteryW,
            m.batteryCharging,
            reduced,
          )}
          ${conduit(
            2,
            `M${GRID.x - 16} ${GRID.y - 20} C ${GRID.x - 150} ${GRID.y - 60}, ${C.x + 150} ${C.y + 40}, ${C.x + 32} ${C.y + 14}`,
            m.gridColour,
            m.gridW,
            !m.gridImporting,
            reduced,
          )}
          ${conduit(
            3,
            `M${C.x + 30} ${C.y - 18} C ${C.x + 150} ${C.y - 60}, ${HOME.x - 140} ${HOME.y + 70}, ${HOME.x - 26} ${HOME.y + 22}`,
            m.loadColour,
            m.loadW,
            false,
            reduced,
          )}

          <!-- ===== reactor core ===== -->
          <g transform="translate(${C.x} ${C.y})">
            <circle r="80" class="fz-core-aura" />
            <g class="fz-ring-rot"><circle r="60" class="fz-ring" /></g>
            <g class="fz-ring-rot rev"><circle r="49" class="fz-ring2" /></g>
            <circle r="37" class="fz-core-body" />
            <circle r="37" class="fz-core-pulse" />
            <text class="fz-core-val" y="-1">${fmtW(m.inverterW)}</text>
            <text class="fz-core-unit" y="15">INVERTER</text>
          </g>

          <!-- ===== sun ===== -->
          <g transform="translate(${SUN.x} ${SUN.y})" style="color:${m.solarColour}">
            <g class="fz-sun-rays">
              ${Array.from({ length: 12 }, (_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                const r0 = sunR + 6;
                const r1 = sunR + 16 + solarI * 10;
                return svg`<line x1="${(Math.cos(a) * r0).toFixed(1)}" y1="${(Math.sin(a) * r0).toFixed(1)}"
                  x2="${(Math.cos(a) * r1).toFixed(1)}" y2="${(Math.sin(a) * r1).toFixed(1)}" />`;
              })}
            </g>
            <circle r="${sunR}" class="fz-sun" />
          </g>
          <text class="fz-node-label" x="${SUN.x}" y="${SUN.y + sunR + 28}">SOLAR</text>
          <text class="fz-node-val" x="${SUN.x}" y="${SUN.y + sunR + 44}">${fmtW(m.solarW)}</text>

          <!-- ===== battery cell ===== -->
          <g clip-path="url(#fz-bclip)">
            <rect x="80" y="306" width="60" height="112" fill="rgba(255,255,255,0.03)" />
            <g class="fz-liquid" style="transform: translate(80px, ${surfaceY.toFixed(1)}px)">
              <path class="fz-wave" d="${BWAVE}" fill="${liq}" opacity="0.92" />
            </g>
            ${
              m.batteryCharging && !reduced
                ? svg`<g>
                ${[92, 110, 100].map(
                  (x, i) =>
                    svg`<circle class="fz-bubble" cx="${x}" cy="412" r="${1.8 + (i % 2)}" style="animation-delay:${i * 0.7}s" />`,
                )}
              </g>`
                : nothing
            }
          </g>
          <rect x="104" y="300" width="12" height="7" rx="2" fill="rgba(255,255,255,0.5)" />
          <rect x="80" y="306" width="60" height="112" rx="9" class="fz-cell" />
          ${
            m.batteryValid
              ? svg`<text class="fz-soc" x="110" y="368">${soc.toFixed(0)}%</text>`
              : nothing
          }
          <text class="fz-node-label" x="110" y="438">BATTERY</text>
          <text class="fz-node-val" x="110" y="454">
            ${m.batteryCharging ? '▲ ' : m.batteryW > 15 ? '▼ ' : ''}${fmtW(m.batteryW)}
          </text>

          <!-- ===== grid pylon ===== -->
          <g transform="translate(${GRID.x} ${GRID.y})" style="color:${m.gridColour}">
            <path class="fz-struct" d="M-18 34 L-7 -34 L7 -34 L18 34 M-13 6 L13 6 M-15 -8 L15 -8 M-9 -22 L9 -22 M-13 6 L0 -8 L13 6 M-15 -8 L0 -22 L15 -8" />
          </g>
          <text class="fz-node-label" x="${GRID.x}" y="${GRID.y + 52}">GRID</text>
          <text class="fz-node-val" x="${GRID.x}" y="${GRID.y + 68}">
            ${m.gridW > 15 ? (m.gridImporting ? '↓ ' : '↑ ') : ''}${fmtW(m.gridW)}
          </text>

          <!-- ===== home ===== -->
          <g transform="translate(${HOME.x} ${HOME.y})" style="color:${m.loadColour}">
            <path class="fz-house-fill" d="M-34 -2 L0 -32 L34 -2 L34 34 L-34 34 Z" />
            <path class="fz-struct" d="M-38 -2 L0 -34 L38 -2 M-32 2 L-32 34 L32 34 L32 2" />
            ${[-20, -2, 16].map(
              (x, i) =>
                svg`<rect class="fz-window" x="${x}" y="${6 + (i === 1 ? 2 : 0)}" width="11" height="11" rx="1.5"
                  style="opacity:${(0.25 + loadI * 0.7).toFixed(2)}; filter: drop-shadow(0 0 ${(2 + loadI * 6).toFixed(1)}px #ffe9a8)" />`,
            )}
          </g>
          <text class="fz-node-label" x="${HOME.x}" y="${HOME.y + 54}">HOME</text>
          <text class="fz-node-val" x="${HOME.x}" y="${HOME.y + 70}">${fmtW(m.loadW)}</text>

          <!-- ===== stat chips ===== -->
          ${m.dailySolar !== undefined ? chip(300, 430, 'SOLAR TODAY', `${m.dailySolar.toFixed(1)} kWh`) : nothing}
          ${m.dailyLoad !== undefined ? chip(400, 430, 'LOAD TODAY', `${m.dailyLoad.toFixed(1)} kWh`) : nothing}
          ${m.dailyImport !== undefined ? chip(500, 430, 'IMPORT', `${m.dailyImport.toFixed(1)} kWh`) : nothing}
          ${m.dailyExport !== undefined ? chip(595, 430, 'EXPORT', `${m.dailyExport.toFixed(1)} kWh`) : nothing}
          ${m.acTemp !== undefined ? chip(300, 250, 'AC TEMP', `${m.acTemp.toFixed(0)}°`) : nothing}
          ${m.dcTemp !== undefined ? chip(500, 250, 'DC TEMP', `${m.dcTemp.toFixed(0)}°`) : nothing}
        </svg>
      </div>
    </ha-card>
  `;
};
