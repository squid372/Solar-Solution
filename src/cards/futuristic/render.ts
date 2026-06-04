import { html, svg, nothing } from 'lit';
import { FuturisticModel } from './model';

// ---- layout (viewBox 0 0 800 470) ----------------------------------------
const C = { x: 400, y: 252 }; // reactor core
const SUN = { x: 122, y: 120 };
const BAT = { cx: 110, top: 312, h: 116, w: 64 }; // battery cell
const GRID = { x: 690, y: 352 };
const HOME = { x: 682, y: 122 };

const BWAVE = 'M0 0 q16 -4 32 0 t32 0 t32 0 t32 0 L128 220 L0 220 Z';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hx = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0');
const lerpA = (c1: number[], c2: number[], t: number) => [
  lerp(c1[0], c2[0], t),
  lerp(c1[1], c2[1], t),
  lerp(c1[2], c2[2], t),
];
const toHexA = (c: number[]) => `#${hx(c[0])}${hx(c[1])}${hx(c[2])}`;
const fmtW = (w: number) =>
  Math.abs(w) >= 1000 ? `${(w / 1000).toFixed(2)} kW` : `${Math.round(w)} W`;

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

// A glowing conduit: a faint pipe, a flowing light stream, and energy packets.
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
        ? svg`<path class="fz-stream ${reverse ? 'rev' : ''}" d="${d}"
            style="color:${colour}" pathLength="100" />`
        : nothing
    }
    ${
      active && !reduced
        ? Array.from(
            { length: count },
            (_, i) => svg`
        <circle r="${(2.6 + intensity * 1.8).toFixed(1)}" class="fz-particle" style="color:${colour}">
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
  <g transform="translate(${x} ${y})">
    <rect x="-44" y="-15" width="88" height="32" rx="7" class="fz-chip-bg" />
    <text class="fz-chip-v" y="-1">${value}</text>
    <text class="fz-chip-l" y="11">${label}</text>
  </g>`;

const cloudPuff = (
  x: number,
  y: number,
  s: number,
  op: number,
  dur: number,
  delay: number,
) => svg`
  <g class="fz-cloud" style="opacity:${op.toFixed(2)};animation-duration:${dur}s;animation-delay:${delay}s">
    <g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="7" rx="42" ry="15" />
      <circle cx="-19" cy="2" r="14" />
      <circle cx="2" cy="-7" r="19" />
      <circle cx="21" cy="0" r="14" />
    </g>
  </g>`;

const cloudsGroup = (cloudiness: number) => {
  const defs = [
    { x: 150, y: 92, s: 1.1, dur: 36 },
    { x: 540, y: 70, s: 0.9, dur: 44 },
    { x: 680, y: 150, s: 1.0, dur: 40 },
    { x: 330, y: 132, s: 0.8, dur: 48 },
    { x: 70, y: 168, s: 0.7, dur: 42 },
  ];
  const n = 2 + Math.round(cloudiness * 3);
  const op = 0.14 + cloudiness * 0.2;
  return svg`<g>${defs
    .slice(0, n)
    .map((c, i) => cloudPuff(c.x, c.y, c.s, op, c.dur, i * -7))}</g>`;
};

const rainGroup = () => svg`<g class="fz-rain">
  ${Array.from({ length: 26 }, (_, i) => {
    const x = ((i * 61) % 788) + 6;
    return svg`<line x1="${x}" y1="-12" x2="${x - 5}" y2="6" style="animation-delay:${((i % 11) * 0.11).toFixed(2)}s" />`;
  })}
</g>`;

const snowGroup = () => svg`<g class="fz-snowg">
  ${Array.from({ length: 30 }, (_, i) => {
    const x = ((i * 53) % 788) + 6;
    return svg`<circle class="fz-snow" cx="${x}" cy="-6" r="${(1.4 + (i % 3) * 0.5).toFixed(1)}" style="animation-delay:${((i % 13) * 0.2).toFixed(2)}s" />`;
  })}
</g>`;

const fogGroup = () => svg`<g class="fz-fog">
  <rect class="fz-fog-band" x="-220" y="118" width="1240" height="60" rx="30" />
  <rect class="fz-fog-band slow" x="-220" y="214" width="1240" height="84" rx="42" />
</g>`;

export const futuristicCard = (m: FuturisticModel) => {
  const reduced = m.reducedMotion;
  const e = m.sunElevation;
  const cloud = m.cloudiness;
  const night = m.isNight;

  // Sky: a clear-sky gradient (night→day) blended toward overcast grey by cloud.
  const baseTop = lerpA([5, 7, 16], [9, 24, 49], e);
  const baseBot = lerpA([10, 14, 30], [20, 50, 92], e);
  const overTop = lerpA([20, 24, 32], [60, 66, 76], e);
  const overBot = lerpA([28, 32, 40], [88, 92, 100], e);
  const skyTop = toHexA(lerpA(baseTop, overTop, cloud * 0.7));
  const skyBot = toHexA(lerpA(baseBot, overBot, cloud * 0.7));
  const starOp = night ? Math.max(0, 1 - cloud) * 0.9 : 0;
  const moonR = 22;

  const soc = Math.max(0, Math.min(100, m.batterySoc));
  const liq = soc >= 70 ? '#33c463' : soc > 30 ? '#ffc63a' : '#ff5252';
  const surfaceY = BAT.top + (1 - soc / 100) * BAT.h;
  const batLeft = BAT.cx - BAT.w / 2;

  const solarI = Math.min(1, m.solarW / 5000);
  const sunR = 24 + solarI * 14;
  const loadI = Math.min(1, m.loadW / 4000);
  const coreI = Math.min(1, m.inverterW / 6000);

  const net = m.netGridW;
  const heroSub =
    Math.abs(net) < 20
      ? 'GRID BALANCED'
      : net > 0
        ? `+${fmtW(net)} EXPORTING`
        : `${fmtW(Math.abs(net))} IMPORTING`;

  const stars = Array.from({ length: 34 }, (_, i) => {
    const x = ((i * 137) % 786) + 8;
    const y = ((i * 53) % 200) + 8;
    const r = (i % 3) * 0.4 + 0.45;
    return svg`<circle cx="${x}" cy="${y}" r="${r}" class="fz-star" style="animation-delay:${(i % 7) * 0.5}s" />`;
  });

  // Perspective grid floor (Tron) lines converging toward the core.
  const floorLines: unknown[] = [];
  for (let bx = -220; bx <= 1020; bx += 120) {
    const tx = 400 + (bx - 400) * 0.72;
    floorLines.push(svg`<line x1="${tx.toFixed(0)}" y1="404" x2="${bx}" y2="470" />`);
  }

  // Reactor sun rays (alternating length).
  const rays = Array.from({ length: 16 }, (_, i) => {
    const long = i % 2 === 0;
    const r0 = sunR + 5;
    const r1 = sunR + (long ? 18 : 11) + solarI * 9;
    const [x1, y1] = polar(0, 0, r0, i * 22.5);
    const [x2, y2] = polar(0, 0, r1, i * 22.5);
    return svg`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
  });

  // Reactor core plasma spokes.
  const spokes = Array.from({ length: 10 }, (_, i) => {
    const [x, y] = polar(0, 0, 30, i * 36);
    return svg`<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`;
  });
  // Bolts seated on the outer reactor ring.
  const bolts = Array.from({ length: 6 }, (_, i) => {
    const [x, y] = polar(0, 0, 74, i * 60 - 90);
    return svg`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" class="fz-bolt" />`;
  });

  return html`
    <ha-card>
      <style>
        .fz-wrap {
          border-radius: var(--ha-card-border-radius, 12px);
          overflow: hidden;
          background: #05070f;
        }
        .fz-svg {
          display: block;
          width: 100%;
          height: auto;
        }
        text {
          text-anchor: middle;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        .fz-hero {
          fill: #fff;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .fz-hero-sub {
          fill: #9fc6ff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .fz-bar {
          fill: #9fb6d8;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .fz-online {
          fill: #46d97c;
        }
        .fz-star {
          fill: #cfe0ff;
          animation: fz-tw 3s ease-in-out infinite;
        }
        @keyframes fz-tw {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
        /* weather */
        .fz-cloud {
          fill: #c6d2e6;
          filter: blur(0.4px);
          animation-name: fz-drift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        @keyframes fz-drift {
          from {
            transform: translateX(-24px);
          }
          to {
            transform: translateX(24px);
          }
        }
        .fz-rain line {
          stroke: #a9ccff;
          stroke-width: 1.4;
          stroke-linecap: round;
          opacity: 0.5;
          animation: fz-rainfall 0.8s linear infinite;
        }
        @keyframes fz-rainfall {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(492px);
          }
        }
        .fz-snow {
          fill: #eaf2ff;
          opacity: 0;
          animation: fz-snowfall 4.6s linear infinite;
        }
        @keyframes fz-snowfall {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          50% {
            transform: translate(12px, 244px);
          }
          100% {
            transform: translate(0, 488px);
            opacity: 0.2;
          }
        }
        .fz-fog-band {
          fill: #b3c2da;
          opacity: 0.1;
          filter: blur(9px);
          animation: fz-fog 26s linear infinite alternate;
        }
        .fz-fog-band.slow {
          animation-duration: 38s;
          opacity: 0.07;
        }
        @keyframes fz-fog {
          from {
            transform: translateX(-60px);
          }
          to {
            transform: translateX(60px);
          }
        }
        .fz-lightning {
          fill: #ffffff;
          opacity: 0;
          animation: fz-flash 7s linear infinite;
        }
        @keyframes fz-flash {
          0%,
          92%,
          100% {
            opacity: 0;
          }
          93%,
          95% {
            opacity: 0.22;
          }
          94% {
            opacity: 0.02;
          }
        }
        .fz-floor {
          stroke: #4aa8ff;
          stroke-opacity: 0.16;
          stroke-width: 1;
        }
        .fz-floor-rung {
          stroke: #4aa8ff;
          stroke-opacity: 0.12;
          stroke-width: 1;
          animation: fz-rung 2.6s linear infinite;
        }
        @keyframes fz-rung {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(22px);
          }
        }
        /* conduits */
        .fz-pipe {
          fill: none;
          stroke: currentColor;
          stroke-width: 3.5;
          stroke-opacity: 0.3;
          stroke-linecap: round;
          filter: drop-shadow(0 0 3px currentColor);
        }
        .fz-stream {
          fill: none;
          stroke: currentColor;
          stroke-width: 3.5;
          stroke-opacity: 0.7;
          stroke-linecap: round;
          stroke-dasharray: 3 7;
          filter: drop-shadow(0 0 4px currentColor);
          animation: fz-flow 0.9s linear infinite;
        }
        .fz-stream.rev {
          animation-direction: reverse;
        }
        @keyframes fz-flow {
          to {
            stroke-dashoffset: -10;
          }
        }
        .fz-particle {
          fill: #fff;
          filter: drop-shadow(0 0 4px currentColor)
            drop-shadow(0 0 9px currentColor);
        }
        /* reactor core */
        .fz-hex {
          fill: none;
          stroke: #5aa8ff;
          stroke-opacity: 0.22;
          stroke-width: 1.5;
        }
        .fz-radar {
          fill: url(#fz-radar);
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-spin 6s linear infinite;
        }
        .fz-gauge-bg {
          fill: none;
          stroke: #2a3f63;
          stroke-width: 4;
        }
        .fz-gauge {
          fill: none;
          stroke: #7fe0ff;
          stroke-width: 4;
          stroke-linecap: round;
          filter: drop-shadow(0 0 5px #7fe0ff);
          transition: stroke-dasharray 0.8s ease;
        }
        .fz-ring,
        .fz-ring2,
        .fz-ring3 {
          fill: none;
          stroke: #bfe3ff;
        }
        .fz-ring {
          stroke-width: 2;
          stroke-opacity: 0.6;
          stroke-dasharray: 18 12;
        }
        .fz-ring2 {
          stroke-width: 5;
          stroke-opacity: 0.8;
          stroke-dasharray: 22 11.33;
        }
        .fz-ring3 {
          stroke-width: 1.2;
          stroke-opacity: 0.45;
          stroke-dasharray: 4 7;
        }
        .fz-rot {
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-spin 16s linear infinite;
        }
        .fz-rot.rev {
          animation: fz-spin 11s linear infinite reverse;
        }
        .fz-rot.fast {
          animation: fz-spin 7s linear infinite;
        }
        @keyframes fz-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .fz-bolt {
          fill: #cfeaff;
          filter: drop-shadow(0 0 3px #7fd0ff);
        }
        .fz-core-aura {
          fill: url(#fz-core-grad);
          opacity: 0.45;
          filter: blur(6px);
          animation: fz-breathe 3.4s ease-in-out infinite;
        }
        .fz-core-body {
          fill: url(#fz-core-grad);
          filter: drop-shadow(0 0 10px #7fd0ff) drop-shadow(0 0 24px #3aa0ff);
        }
        .fz-spokes {
          stroke: #ffffff;
          stroke-width: 1;
          stroke-opacity: 0.4;
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-spin 5s linear infinite;
        }
        .fz-core-pulse {
          fill: none;
          stroke: #cfeaff;
          stroke-width: 2;
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-pulse 2.6s ease-out infinite;
        }
        .fz-core-val {
          fill: #fff;
          font-size: 19px;
          font-weight: 800;
        }
        .fz-core-unit {
          fill: #bcd6ff;
          font-size: 8px;
          letter-spacing: 2px;
        }
        @keyframes fz-pulse {
          0% {
            transform: scale(1);
            stroke-opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            stroke-opacity: 0;
          }
        }
        @keyframes fz-breathe {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.65;
          }
        }
        /* sun */
        .fz-sun {
          fill: url(#fz-sun-grad);
          filter: drop-shadow(0 0 12px currentColor)
            drop-shadow(0 0 26px currentColor);
        }
        .fz-sun-halo {
          fill: none;
          stroke: currentColor;
          stroke-opacity: 0.3;
          stroke-width: 6;
          filter: blur(3px);
        }
        .fz-rays {
          stroke: currentColor;
          stroke-width: 2.2;
          stroke-linecap: round;
          opacity: 0.6;
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-spin 30s linear infinite;
        }
        .fz-moon {
          fill: url(#fz-moon-grad);
          filter: drop-shadow(0 0 10px #b9ccff) drop-shadow(0 0 22px #6f8fd8);
        }
        .fz-moon-halo {
          fill: none;
          stroke: #b9ccff;
          stroke-opacity: 0.3;
          stroke-width: 6;
          filter: blur(3px);
        }
        .fz-crater {
          fill: #b3c0e2;
          opacity: 0.55;
        }
        /* battery */
        .fz-cell {
          fill: none;
          stroke: rgba(255, 255, 255, 0.55);
          stroke-width: 2;
        }
        .fz-cell-glow {
          fill: none;
          stroke: ${liq};
          stroke-width: 2;
          opacity: 0.6;
          filter: drop-shadow(0 0 6px ${liq});
        }
        .fz-liquid {
          transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fz-wave {
          animation: fz-wave 3s linear infinite;
        }
        @keyframes fz-wave {
          to {
            transform: translateX(-64px);
          }
        }
        .fz-tick {
          stroke: rgba(255, 255, 255, 0.25);
          stroke-width: 1;
        }
        .fz-bubble {
          fill: #fff;
          opacity: 0;
          animation: fz-bub 2.4s ease-in infinite;
        }
        @keyframes fz-bub {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
        .fz-soc {
          fill: #fff;
          font-size: 16px;
          font-weight: 800;
          paint-order: stroke;
          stroke: rgba(0, 0, 0, 0.45);
          stroke-width: 3;
        }
        /* structures */
        .fz-struct {
          fill: none;
          stroke: currentColor;
          stroke-width: 2.2;
          stroke-linejoin: round;
          stroke-linecap: round;
          filter: drop-shadow(0 0 5px currentColor);
        }
        .fz-house-fill {
          fill: currentColor;
          opacity: 0.1;
        }
        .fz-window {
          fill: #ffe9a8;
        }
        .fz-panelglow {
          fill: #76e6ff;
        }
        .fz-spark {
          fill: none;
          stroke: #cfeaff;
          stroke-width: 1.6;
          stroke-linecap: round;
          opacity: 0;
          animation: fz-spark 2.4s ease-in infinite;
        }
        @keyframes fz-spark {
          0%,
          60%,
          100% {
            opacity: 0;
          }
          70%,
          85% {
            opacity: 0.9;
          }
        }
        .fz-label {
          fill: #cfe0ff;
          font-size: 9px;
          letter-spacing: 1.5px;
          opacity: 0.85;
        }
        .fz-val {
          fill: #fff;
          font-size: 13px;
          font-weight: 700;
        }
        .fz-chip-bg {
          fill: rgba(120, 170, 255, 0.08);
          stroke: rgba(140, 190, 255, 0.22);
          stroke-width: 1;
        }
        .fz-chip-v {
          fill: #eaf2ff;
          font-size: 11px;
          font-weight: 700;
        }
        .fz-chip-l {
          fill: #8fa6c8;
          font-size: 7px;
          letter-spacing: 0.5px;
        }
        @media (prefers-reduced-motion: reduce) {
          .fz-star,
          .fz-radar,
          .fz-rot,
          .fz-spokes,
          .fz-core-aura,
          .fz-core-pulse,
          .fz-rays,
          .fz-wave,
          .fz-bubble,
          .fz-floor-rung,
          .fz-spark,
          .fz-stream,
          .fz-cloud,
          .fz-rain line,
          .fz-snow,
          .fz-fog-band,
          .fz-lightning {
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
              <stop offset="1" stop-color="#13386b" />
            </radialGradient>
            <radialGradient id="fz-sun-grad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="#fff7e0" />
              <stop offset="0.5" stop-color="${m.solarColour}" />
              <stop offset="1" stop-color="${m.solarColour}" stop-opacity="0.2" />
            </radialGradient>
            <radialGradient id="fz-moon-grad" cx="0.42" cy="0.4" r="0.62">
              <stop offset="0" stop-color="#ffffff" />
              <stop offset="0.6" stop-color="#dfe7fb" />
              <stop offset="1" stop-color="#aab8df" />
            </radialGradient>
            <radialGradient id="fz-neb1" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="${m.solarColour}" stop-opacity="0.25" />
              <stop offset="1" stop-color="${m.solarColour}" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="fz-neb2" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="${m.gridColour}" stop-opacity="0.22" />
              <stop offset="1" stop-color="${m.gridColour}" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="fz-radar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#7fe0ff" stop-opacity="0.5" />
              <stop offset="1" stop-color="#7fe0ff" stop-opacity="0" />
            </linearGradient>
            <radialGradient id="fz-vign" cx="0.5" cy="0.5" r="0.65">
              <stop offset="0.6" stop-color="#000000" stop-opacity="0" />
              <stop offset="1" stop-color="#000000" stop-opacity="0.45" />
            </radialGradient>
            <clipPath id="fz-bclip">
              <rect x="${batLeft}" y="${BAT.top}" width="${BAT.w}" height="${BAT.h}" rx="9" />
            </clipPath>
          </defs>

          <!-- background -->
          <rect x="0" y="0" width="800" height="470" fill="url(#fz-sky)" />
          <g style="opacity:${starOp.toFixed(2)}">${stars}</g>
          <ellipse cx="160" cy="120" rx="260" ry="200" fill="url(#fz-neb1)" />
          <ellipse cx="660" cy="330" rx="260" ry="200" fill="url(#fz-neb2)" />

          <!-- weather -->
          ${cloud > 0.12 ? cloudsGroup(cloud) : nothing}
          ${(m.weather === 'rain' || m.weather === 'storm') && !reduced ? rainGroup() : nothing}
          ${m.weather === 'snow' && !reduced ? snowGroup() : nothing}
          ${m.weather === 'fog' ? fogGroup() : nothing}
          ${m.weather === 'storm' && !reduced ? svg`<rect class="fz-lightning" x="0" y="0" width="800" height="470" />` : nothing}

          <!-- perspective grid floor -->
          <g class="fz-floor">${floorLines}</g>
          <g class="fz-floor-rung">
            <line x1="0" y1="418" x2="800" y2="418" />
            <line x1="0" y1="440" x2="800" y2="440" />
            <line x1="0" y1="462" x2="800" y2="462" />
          </g>

          <!-- HUD corner brackets + status bar -->
          <g stroke="#7fd0ff" stroke-opacity="0.35" fill="none" stroke-width="2">
            <path d="M16 42 L16 16 L42 16" />
            <path d="M784 42 L784 16 L758 16" />
            <path d="M16 428 L16 454 L42 454" />
            <path d="M784 428 L784 454 L758 454" />
          </g>
          <text class="fz-bar" x="64" y="26" text-anchor="start">
            ${night ? 'NIGHT' : 'DAY'}${m.frequency !== undefined ? ` · ${m.frequency.toFixed(2)} Hz` : ''}${m.acTemp !== undefined ? ` · AC ${m.acTemp.toFixed(0)}°` : ''}
          </text>
          <text class="fz-bar" x="736" y="26" text-anchor="end">
            ${m.dcTemp !== undefined ? `DC ${m.dcTemp.toFixed(0)}° · ` : ''}${m.acVoltage !== undefined ? `${m.acVoltage.toFixed(0)} V · ` : ''}<tspan class="fz-online">● ONLINE</tspan>
          </text>

          <!-- hero -->
          <text class="fz-hero" x="400" y="46">${m.selfSufficiency.toFixed(0)}% SELF-POWERED</text>
          <text class="fz-hero-sub" x="400" y="65">${heroSub}</text>

          <!-- conduits -->
          ${conduit(0, `M${SUN.x + 22} ${SUN.y + 22} C ${SUN.x + 130} ${SUN.y + 110}, ${C.x - 150} ${C.y - 30}, ${C.x - 34} ${C.y - 18}`, m.solarColour, m.solarW, false, reduced)}
          ${conduit(1, `M${BAT.cx + 6} ${BAT.top + BAT.h - 14} C ${BAT.cx + 120} ${BAT.top + BAT.h - 40}, ${C.x - 150} ${C.y + 60}, ${C.x - 30} ${C.y + 16}`, liq, m.batteryW, m.batteryCharging, reduced)}
          ${conduit(2, `M${GRID.x - 18} ${GRID.y - 22} C ${GRID.x - 150} ${GRID.y - 60}, ${C.x + 150} ${C.y + 40}, ${C.x + 32} ${C.y + 16}`, m.gridColour, m.gridW, !m.gridImporting, reduced)}
          ${conduit(3, `M${C.x + 30} ${C.y - 18} C ${C.x + 150} ${C.y - 60}, ${HOME.x - 140} ${HOME.y + 70}, ${HOME.x - 26} ${HOME.y + 24}`, m.loadColour, m.loadW, false, reduced)}

          <!-- ===== reactor core ===== -->
          <g transform="translate(${C.x} ${C.y})">
            <path class="fz-hex" d="${[0, 60, 120, 180, 240, 300]
              .map((a, i) => {
                const [x, y] = polar(0, 0, 92, a - 90);
                return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(' ')} Z" />
            <path class="fz-radar" d="M0 0 L82 -20 A84 84 0 0 1 82 20 Z" />
            <circle class="fz-core-aura" r="80" />
            <circle class="fz-gauge-bg" r="74" />
            <circle class="fz-gauge" r="74" pathLength="100"
              stroke-dasharray="${(loadI * 100).toFixed(1)} 100"
              transform="rotate(-90)" />
            <g class="fz-rot"><circle class="fz-ring" r="66" /></g>
            <g class="fz-rot rev"><circle class="fz-ring2" r="56" pathLength="100" /></g>
            <g class="fz-rot fast"><circle class="fz-ring3" r="46" /></g>
            ${bolts}
            <circle class="fz-core-body" r="36" />
            <g class="fz-spokes">${spokes}</g>
            <circle class="fz-core-pulse" r="36" />
            <text class="fz-core-val" y="0">${fmtW(m.inverterW)}</text>
            <text class="fz-core-unit" y="14">INVERTER</text>
          </g>

          <!-- ===== sun / moon ===== -->
          ${
            night
              ? svg`<g transform="translate(${SUN.x} ${SUN.y})">
                  <circle class="fz-moon-halo" r="${moonR + 10}" />
                  <circle class="fz-moon" r="${moonR}" />
                  <circle class="fz-crater" cx="-7" cy="-6" r="4.5" />
                  <circle class="fz-crater" cx="6" cy="3" r="6" />
                  <circle class="fz-crater" cx="9" cy="-8" r="3" />
                  <circle class="fz-crater" cx="-9" cy="8" r="3.4" />
                </g>`
              : svg`<g transform="translate(${SUN.x} ${SUN.y})" style="color:${m.solarColour}">
                  <circle class="fz-sun-halo" r="${sunR + 10}" />
                  <g class="fz-rays">${rays}</g>
                  <circle class="fz-sun" r="${sunR}" />
                </g>`
          }
          <text class="fz-label" x="${SUN.x}" y="${SUN.y + (night ? moonR : sunR) + 28}">SOLAR</text>
          <text class="fz-val" x="${SUN.x}" y="${SUN.y + (night ? moonR : sunR) + 44}">${fmtW(m.solarW)}</text>

          <!-- ===== battery cell ===== -->
          <g clip-path="url(#fz-bclip)">
            <rect x="${batLeft}" y="${BAT.top}" width="${BAT.w}" height="${BAT.h}" fill="rgba(255,255,255,0.03)" />
            <g class="fz-tick">
              ${[0.25, 0.5, 0.75].map((f) => {
                const y = BAT.top + BAT.h * f;
                return svg`<line x1="${batLeft}" y1="${y}" x2="${batLeft + BAT.w}" y2="${y}" />`;
              })}
            </g>
            <g class="fz-liquid" style="transform: translate(${batLeft}px, ${surfaceY.toFixed(1)}px)">
              <path class="fz-wave" d="${BWAVE}" fill="${liq}" opacity="0.92" />
            </g>
            ${
              m.batteryCharging && !reduced
                ? svg`<g>${[BAT.cx - 16, BAT.cx, BAT.cx + 14].map(
                    (x, i) =>
                      svg`<circle class="fz-bubble" cx="${x}" cy="${BAT.top + BAT.h - 6}" r="${1.8 + (i % 2)}" style="animation-delay:${i * 0.7}s" />`,
                  )}</g>`
                : nothing
            }
          </g>
          <rect x="${BAT.cx - 6}" y="${BAT.top - 6}" width="12" height="7" rx="2" fill="rgba(255,255,255,0.5)" />
          <rect x="${batLeft}" y="${BAT.top}" width="${BAT.w}" height="${BAT.h}" rx="9" class="fz-cell-glow" />
          <rect x="${batLeft}" y="${BAT.top}" width="${BAT.w}" height="${BAT.h}" rx="9" class="fz-cell" />
          ${m.batteryValid ? svg`<text class="fz-soc" x="${BAT.cx}" y="${BAT.top + 56}">${soc.toFixed(0)}%</text>` : nothing}
          <text class="fz-label" x="${BAT.cx}" y="${BAT.top + BAT.h + 18}">BATTERY</text>
          <text class="fz-val" x="${BAT.cx}" y="${BAT.top + BAT.h + 34}">
            ${m.batteryCharging ? '▲ ' : m.batteryW > 15 ? '▼ ' : ''}${fmtW(m.batteryW)}
          </text>

          <!-- ===== grid pylon ===== -->
          <g transform="translate(${GRID.x} ${GRID.y})" style="color:${m.gridColour}">
            <path class="fz-struct" d="M-16 36 L-6 -36 L6 -36 L16 36
              M-12 18 L12 18 M-9 0 L9 0 M-6 -18 L6 -18
              M-12 18 L0 0 L12 18 M-9 0 L0 -18 L9 0
              M-22 -24 L22 -24 M-26 -34 L26 -34" />
            <circle cx="-22" cy="-24" r="2.4" class="fz-bolt" />
            <circle cx="22" cy="-24" r="2.4" class="fz-bolt" />
            ${!reduced ? svg`<path class="fz-spark" d="M-22 -24 q-6 8 0 16 q6 8 0 16" />` : nothing}
          </g>
          <text class="fz-label" x="${GRID.x}" y="${GRID.y + 54}">GRID</text>
          <text class="fz-val" x="${GRID.x}" y="${GRID.y + 70}">
            ${m.gridW > 15 ? (m.gridImporting ? '↓ ' : '↑ ') : ''}${fmtW(m.gridW)}
          </text>

          <!-- ===== home ===== -->
          <g transform="translate(${HOME.x} ${HOME.y})" style="color:${m.loadColour}">
            <path class="fz-house-fill" d="M-34 -2 L0 -32 L34 -2 L34 34 L-34 34 Z" />
            <path class="fz-struct" d="M-38 -2 L0 -34 L38 -2 M-32 1 L-32 34 L32 34 L32 1" />
            <!-- roof solar panel, glows with production -->
            <path d="M-22 -14 L4 -14 L-2 -2 L-28 -2 Z" class="fz-panelglow"
              style="opacity:${(0.18 + solarI * 0.7).toFixed(2)}; filter: drop-shadow(0 0 ${(1 + solarI * 6).toFixed(1)}px #76e6ff)" />
            <!-- door -->
            <rect x="-6" y="18" width="12" height="16" rx="1.5" fill="currentColor" opacity="0.5" />
            <!-- windows brighten with load -->
            ${[-24, 14].map(
              (x) =>
                svg`<rect class="fz-window" x="${x}" y="6" width="10" height="10" rx="1.5"
                  style="opacity:${(0.25 + loadI * 0.7).toFixed(2)}; filter: drop-shadow(0 0 ${(2 + loadI * 6).toFixed(1)}px #ffe9a8)" />`,
            )}
          </g>
          <text class="fz-label" x="${HOME.x}" y="${HOME.y + 54}">HOME</text>
          <text class="fz-val" x="${HOME.x}" y="${HOME.y + 70}">${fmtW(m.loadW)}</text>

          <!-- daily totals strip -->
          ${m.dailySolar !== undefined ? chip(316, 452, 'SOLAR', `${m.dailySolar.toFixed(1)} kWh`) : nothing}
          ${m.dailyLoad !== undefined ? chip(408, 452, 'LOAD', `${m.dailyLoad.toFixed(1)} kWh`) : nothing}
          ${m.dailyImport !== undefined ? chip(500, 452, 'IMPORT', `${m.dailyImport.toFixed(1)} kWh`) : nothing}
          ${m.dailyExport !== undefined ? chip(592, 452, 'EXPORT', `${m.dailyExport.toFixed(1)} kWh`) : nothing}

          <rect x="0" y="0" width="800" height="470" fill="url(#fz-vign)" pointer-events="none" />
        </svg>
      </div>
    </ha-card>
  `;
};
