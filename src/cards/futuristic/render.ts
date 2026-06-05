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

// A frosted-glass module panel with a glowing node-coloured accent bar on top.
const panel = (
  x: number,
  y: number,
  w: number,
  h: number,
  accent: string,
) => svg`
  <rect class="fz-panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="11" />
  <rect x="${x + 14}" y="${y - 1}" width="${w - 28}" height="2.5" rx="1.25"
    fill="${accent}" opacity="0.9" style="filter:drop-shadow(0 0 4px ${accent})" />`;

// A small sparkline polyline auto-scaled to its own min/max within a box.
const sparkline = (
  x: number,
  y: number,
  w: number,
  h: number,
  data: number[] | undefined,
  colour: string,
) => {
  if (!data || data.length < 2) return nothing;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${(x + (i / (data.length - 1)) * w).toFixed(1)},${(y + h - ((v - min) / rng) * h).toFixed(1)}`,
    )
    .join(' ');
  return svg`<polyline class="fz-spark" points="${pts}" style="color:${colour}" />`;
};

// Fire HA's more-info dialog for an entity when a node is tapped.
const more = (entityId?: string) => (e: Event) => {
  if (!entityId) return;
  e.stopPropagation();
  (e.currentTarget as Element).dispatchEvent(
    new CustomEvent('hass-more-info', {
      detail: { entityId },
      bubbles: true,
      composed: true,
    }),
  );
};

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

  // HUD accent palette, themeable via glow_theme.
  const THEMES: Record<string, { a: string; soft: string; deep: string }> = {
    neon: { a: '#7fd0ff', soft: '#cfeaff', deep: '#13386b' },
    ice: { a: '#9fe8ff', soft: '#e2f7ff', deep: '#0d4a66' },
    fire: { a: '#ff9e5c', soft: '#ffd8b0', deep: '#5c2410' },
    aurora: { a: '#73f0b0', soft: '#c6ffe4', deep: '#0d5a3a' },
    mono: { a: '#dfe7ff', soft: '#ffffff', deep: '#2a3550' },
  };
  const th = THEMES[m.theme] || THEMES.neon;

  const soc = Math.max(0, Math.min(100, m.batterySoc));
  const liq = soc >= 70 ? '#33c463' : soc > 30 ? '#ffc63a' : '#ff5252';
  const surfaceY = BAT.top + (1 - soc / 100) * BAT.h;
  const batLeft = BAT.cx - BAT.w / 2;

  const solarI = Math.min(1, m.solarW / 5000);
  const sunR = 24 + solarI * 14;
  const loadI = Math.min(1, m.loadW / 4000);
  const coreI = Math.min(1, m.inverterW / 6000);

  // Inverter readout split into a big number + small unit for the core orb.
  const invBig =
    Math.abs(m.inverterW) >= 1000
      ? (m.inverterW / 1000).toFixed(2)
      : Math.round(m.inverterW).toString();
  const invUnit = Math.abs(m.inverterW) >= 1000 ? 'kW' : 'W';
  // Prepaid balance colour (green → amber → red as it runs low).
  const ppColor =
    m.prepaidKwh === undefined
      ? '#46d97c'
      : m.prepaidKwh <= 20
        ? '#ff6b6b'
        : m.prepaidKwh <= 50
          ? '#ffc63a'
          : '#46d97c';

  const net = m.netGridW;
  const heroSub =
    Math.abs(net) < 20
      ? 'GRID BALANCED'
      : net > 0
        ? `+${fmtW(net)} EXPORTING`
        : `${fmtW(Math.abs(net))} IMPORTING`;

  const rs = (m.runStatus || '').toLowerCase();
  const runText = (m.runStatus || 'ONLINE').toUpperCase();
  const runTone = /fault|error|alarm|fail|trip|off/.test(rs)
    ? 'bad'
    : /standby|wait|idle|sleep/.test(rs)
      ? 'warn'
      : 'ok';
  const gridOn = (m.gridSignal || 'on').toLowerCase() !== 'off';

  const fmtE = (kwh: number) =>
    kwh >= 1000 ? `${(kwh / 1000).toFixed(1)} MWh` : `${kwh.toFixed(0)} kWh`;

  // Battery readout lines.
  const batHeader = `BATTERY${m.batteryStatusMsg ? ` · ${m.batteryStatusMsg.toUpperCase()}` : ''}`;
  const batLine1 = [
    m.batteryVoltage !== undefined ? `${m.batteryVoltage.toFixed(1)} V` : null,
    m.batteryCurrent !== undefined ? `${m.batteryCurrent.toFixed(1)} A` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const batLine2 = [
    m.batteryTemp !== undefined ? `${m.batteryTemp.toFixed(0)}°C` : null,
    m.batteryCapacityAh !== undefined
      ? `${m.batteryCapacityAh.toFixed(0)} Ah`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const batLine3 = [
    m.batteryEfficiency !== undefined
      ? `${m.batteryEfficiency.toFixed(0)}% eff`
      : null,
    m.batterySoh !== undefined ? `SOH ${m.batterySoh.toFixed(0)}%` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // Solar readout lines.
  const pvLine =
    m.pvStrings.length > 1
      ? m.pvStrings
          .slice(0, 3)
          .map((s) => `${s.name} ${(s.power / 1000).toFixed(2)}`)
          .join(' · ') + ' kW'
      : '';
  const sellRaw = (m.solarSell || '').toLowerCase();
  const sellOn = /^(on|1|true|enabled|yes)$/.test(sellRaw);

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
    floorLines.push(svg`<line x1="${tx.toFixed(0)}" y1="404" x2="${bx}" y2="520" />`);
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

  if (!m.configured) {
    return html`
      <ha-card>
        <div class="fz-setup">
          <div class="fz-setup-badge">⚡</div>
          <div class="fz-setup-title">SOLAR-SOLUTION</div>
          <div class="fz-setup-sub">
            Add your entities to begin — map at least one of battery&nbsp;SOC, PV
            power, grid power or inverter power in the card editor.
          </div>
        </div>
        <style>
          .fz-setup {
            background: #0a1020;
            border-radius: var(--ha-card-border-radius, 12px);
            padding: 36px 26px;
            text-align: center;
            color: #dce8ff;
            font-family: ui-sans-serif, system-ui, sans-serif;
          }
          .fz-setup-badge {
            font-size: 30px;
          }
          .fz-setup-title {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 2px;
            margin: 6px 0;
          }
          .fz-setup-sub {
            font-size: 13px;
            color: #9fb6d8;
            max-width: 320px;
            margin: 0 auto;
            line-height: 1.5;
          }
        </style>
      </ha-card>
    `;
  }

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
        .fz-online,
        .fz-st-ok {
          fill: #46d97c;
        }
        .fz-st-warn {
          fill: #ffc63a;
        }
        .fz-st-bad {
          fill: #ff6b6b;
        }
        .fz-sub {
          fill: #9fb6d8;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .fz-val,
        .fz-core-val,
        .fz-sub,
        .fz-bar,
        .fz-chip-v,
        .fz-hero {
          font-variant-numeric: tabular-nums;
        }
        .fz-sweep {
          animation: fz-sweep 7s linear infinite;
        }
        @keyframes fz-sweep {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(580px);
          }
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
          stroke: var(--fz-a);
          stroke-opacity: 0.16;
          stroke-width: 1;
        }
        .fz-floor-rung {
          stroke: var(--fz-a);
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
          stroke: var(--fz-a);
          stroke-opacity: 0.22;
          stroke-width: 1.5;
        }
        .fz-gauge-bg {
          fill: none;
          stroke: #1c3450;
          stroke-width: 5;
        }
        .fz-gauge {
          fill: none;
          stroke: var(--fz-a);
          stroke-width: 5;
          stroke-linecap: round;
          filter: drop-shadow(0 0 6px var(--fz-a));
          transition: stroke-dasharray 0.8s ease;
        }
        .fz-rot {
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-spin 26s linear infinite;
        }
        @keyframes fz-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .fz-orb-aura {
          fill: url(#fz-orbglow);
          animation: fz-breathe 3.6s ease-in-out infinite;
        }
        .fz-orb {
          fill: url(#fz-orb);
          filter: drop-shadow(0 0 18px var(--fz-a));
        }
        .fz-orb-ring {
          fill: none;
          stroke: var(--fz-soft);
          stroke-width: 1.4;
          stroke-opacity: 0.45;
          stroke-dasharray: 2 10;
        }
        .fz-orb-spec {
          fill: #ffffff;
          opacity: 0.22;
        }
        .fz-orb-plate {
          fill: #07111f;
          fill-opacity: 0.6;
        }
        .fz-prepaid {
          fill: rgba(4, 10, 20, 0.55);
          stroke: var(--pp);
          stroke-width: 1.5;
          filter: drop-shadow(0 0 8px var(--pp));
        }
        .fz-prepaid-dot {
          fill: var(--pp);
          filter: drop-shadow(0 0 4px var(--pp));
        }
        .fz-prepaid-v {
          fill: #fff;
          font-size: 13px;
          font-weight: 800;
          text-anchor: middle;
        }
        .fz-prepaid-l {
          fill: var(--pp);
          font-size: 7px;
          font-weight: 600;
          letter-spacing: 1px;
          text-anchor: middle;
        }
        .fz-core-val {
          fill: #fff;
          font-size: 30px;
          font-weight: 800;
        }
        .fz-core-unit {
          fill: #9fc6ff;
          font-size: 9px;
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
        .fz-panel {
          fill: rgba(90, 140, 220, 0.06);
          stroke: rgba(150, 190, 255, 0.16);
          stroke-width: 1;
        }
        .fz-strip {
          fill: rgba(110, 160, 240, 0.07);
          stroke: rgba(150, 190, 255, 0.2);
          stroke-width: 1;
        }
        .fz-strip-div {
          stroke: rgba(150, 190, 255, 0.18);
          stroke-width: 1;
        }
        .fz-hit {
          fill: transparent;
          cursor: pointer;
        }
        .fz-hit:hover {
          fill: rgba(255, 255, 255, 0.035);
        }
        .fz-spark {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.6;
          stroke-linejoin: round;
          stroke-linecap: round;
          opacity: 0.85;
          filter: drop-shadow(0 0 3px currentColor);
        }
        .fz-soctrace {
          fill: none;
          stroke: rgba(255, 255, 255, 0.6);
          stroke-width: 1.4;
          stroke-linejoin: round;
          stroke-linecap: round;
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
        }
        .fz-orb-pulse {
          fill: none;
          stroke: var(--fz-soft);
          stroke-width: 2;
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: fz-opulse 3s ease-out infinite;
        }
        @keyframes fz-opulse {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
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
          .fz-rot,
          .fz-orb-aura,
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
          .fz-lightning,
          .fz-sweep {
            animation: none;
          }
        }
      </style>

      <div
        class="fz-wrap"
        style="--fz-a:${th.a};--fz-soft:${th.soft};--fz-deep:${th.deep}"
      >
        <svg class="fz-svg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="fz-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="${skyTop}" />
              <stop offset="1" stop-color="${skyBot}" />
            </linearGradient>
            <radialGradient id="fz-core-grad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="#ffffff" />
              <stop offset="0.35" stop-color="${th.a}" />
              <stop offset="1" stop-color="${th.deep}" />
            </radialGradient>
            <radialGradient id="fz-orb" cx="0.4" cy="0.34" r="0.78">
              <stop offset="0" stop-color="#ffffff" />
              <stop offset="0.44" stop-color="${th.a}" />
              <stop offset="1" stop-color="${th.deep}" />
            </radialGradient>
            <radialGradient id="fz-orbglow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="${th.a}" stop-opacity="0.4" />
              <stop offset="1" stop-color="${th.a}" stop-opacity="0" />
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
              <stop offset="0" stop-color="${th.a}" stop-opacity="0.5" />
              <stop offset="1" stop-color="${th.a}" stop-opacity="0" />
            </linearGradient>
            <pattern
              id="fz-scan"
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
            >
              <rect width="3" height="1" fill="#ffffff" opacity="0.035" />
            </pattern>
            <linearGradient id="fz-sweep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="${th.a}" stop-opacity="0" />
              <stop offset="0.5" stop-color="${th.a}" stop-opacity="0.12" />
              <stop offset="1" stop-color="${th.a}" stop-opacity="0" />
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
          <rect x="0" y="0" width="800" height="520" fill="url(#fz-sky)" />
          <g style="opacity:${starOp.toFixed(2)}">${stars}</g>
          <ellipse cx="160" cy="120" rx="260" ry="200" fill="url(#fz-neb1)" />
          <ellipse cx="660" cy="330" rx="260" ry="200" fill="url(#fz-neb2)" />

          <!-- weather -->
          ${cloud > 0.12 ? cloudsGroup(cloud) : nothing}
          ${(m.weather === 'rain' || m.weather === 'storm') && !reduced ? rainGroup() : nothing}
          ${m.weather === 'snow' && !reduced ? snowGroup() : nothing}
          ${m.weather === 'fog' ? fogGroup() : nothing}
          ${m.weather === 'storm' && !reduced ? svg`<rect class="fz-lightning" x="0" y="0" width="800" height="520" />` : nothing}

          <!-- perspective grid floor -->
          <g class="fz-floor">${floorLines}</g>
          <g class="fz-floor-rung">
            <line x1="0" y1="418" x2="800" y2="418" />
            <line x1="0" y1="440" x2="800" y2="440" />
            <line x1="0" y1="462" x2="800" y2="462" />
          </g>

          <!-- HUD corner brackets + status bar -->
          <g stroke="${th.a}" stroke-opacity="0.4" fill="none" stroke-width="2">
            <path d="M16 42 L16 16 L42 16" />
            <path d="M784 42 L784 16 L758 16" />
            <path d="M16 480 L16 506 L42 506" />
            <path d="M784 480 L784 506 L758 506" />
          </g>
          <text class="fz-bar" x="64" y="26" text-anchor="start">
            ${night ? 'NIGHT' : 'DAY'}${m.frequency !== undefined ? ` · ${m.frequency.toFixed(2)} Hz` : ''}${m.acTemp !== undefined ? ` · AC ${m.acTemp.toFixed(0)}°` : ''}${m.envTemp !== undefined ? ` · AMB ${m.envTemp.toFixed(0)}°` : ''}
          </text>
          <text class="fz-bar" x="736" y="26" text-anchor="end">
            ${m.dcTemp !== undefined ? `DC ${m.dcTemp.toFixed(0)}° · ` : ''}${m.acVoltage !== undefined ? `${m.acVoltage.toFixed(0)} V · ` : ''}<tspan class="fz-st-${runTone}">● ${runText}</tspan>
          </text>

          <!-- hero -->
          <text class="fz-hero" x="400" y="46">${m.selfSufficiency.toFixed(0)}% SELF-POWERED</text>
          <text class="fz-hero-sub" x="400" y="65">${heroSub}</text>

          <!-- conduits -->
          ${conduit(0, `M${SUN.x + 22} ${SUN.y + 22} C ${SUN.x + 130} ${SUN.y + 110}, ${C.x - 150} ${C.y - 30}, ${C.x - 34} ${C.y - 18}`, m.solarColour, m.solarW, false, reduced)}
          ${conduit(1, `M${BAT.cx + 6} ${BAT.top + BAT.h - 14} C ${BAT.cx + 120} ${BAT.top + BAT.h - 40}, ${C.x - 150} ${C.y + 60}, ${C.x - 30} ${C.y + 16}`, liq, m.batteryW, m.batteryCharging, reduced)}
          ${conduit(2, `M${GRID.x - 18} ${GRID.y - 22} C ${GRID.x - 150} ${GRID.y - 60}, ${C.x + 150} ${C.y + 40}, ${C.x + 32} ${C.y + 16}`, m.gridColour, m.gridW, !m.gridImporting, reduced)}
          ${conduit(3, `M${C.x + 30} ${C.y - 18} C ${C.x + 150} ${C.y - 60}, ${HOME.x - 140} ${HOME.y + 70}, ${HOME.x - 26} ${HOME.y + 24}`, m.loadColour, m.loadW, false, reduced)}

          <!-- ===== reactor core (clean orb) ===== -->
          <g transform="translate(${C.x} ${C.y})">
            <circle class="fz-orb-aura" r="96" />
            ${reduced ? nothing : svg`<circle class="fz-orb-pulse" r="60" />`}
            <circle class="fz-gauge-bg" r="80" />
            <circle class="fz-gauge" r="80" pathLength="100"
              stroke-dasharray="${(coreI * 100).toFixed(1)} 100"
              transform="rotate(-90)" />
            <g class="fz-rot"><circle class="fz-orb-ring" r="68" /></g>
            <circle class="fz-orb" r="60" />
            <ellipse class="fz-orb-spec" cx="-18" cy="-22" rx="22" ry="13" />
            <circle class="fz-orb-plate" r="46" />
            <text class="fz-core-val" y="-2">${invBig}</text>
            <text class="fz-core-unit" y="16">${invUnit} · INVERTER</text>
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
          ${panel(30, SUN.y + (night ? moonR : sunR) + 20, 184, 82, m.solarColour)}
          <text class="fz-label" x="${SUN.x}" y="${SUN.y + (night ? moonR : sunR) + 28}">SOLAR</text>
          <text class="fz-val" x="${SUN.x}" y="${SUN.y + (night ? moonR : sunR) + 44}">${fmtW(m.solarW)}</text>
          ${pvLine ? svg`<text class="fz-sub" x="${SUN.x}" y="${SUN.y + (night ? moonR : sunR) + 59}">${pvLine}</text>` : nothing}
          ${
            m.solarSell !== undefined
              ? svg`<text class="fz-sub" x="${SUN.x}" y="${SUN.y + (night ? moonR : sunR) + 73}"><tspan class="fz-st-${sellOn ? 'ok' : 'bad'}">●</tspan> SELL${m.maxSellW !== undefined ? ` · ${(m.maxSellW / 1000).toFixed(1)} kW max` : ''}</text>`
              : nothing
          }
          ${m.lifetimePV !== undefined ? svg`<text class="fz-sub" x="${SUN.x}" y="${SUN.y + (night ? moonR : sunR) + 87}">Σ ${fmtE(m.lifetimePV)} lifetime</text>` : nothing}

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
            ${
              m.sparkSoc && m.sparkSoc.length > 1
                ? svg`<polyline class="fz-soctrace" points="${m.sparkSoc
                    .map(
                      (v, i) =>
                        `${(batLeft + (i / (m.sparkSoc!.length - 1)) * BAT.w).toFixed(1)},${(BAT.top + (1 - Math.max(0, Math.min(100, v)) / 100) * BAT.h).toFixed(1)}`,
                    )
                    .join(' ')}" />`
                : nothing
            }
          </g>
          <rect x="${BAT.cx - 6}" y="${BAT.top - 6}" width="12" height="7" rx="2" fill="rgba(255,255,255,0.5)" />
          <rect x="${batLeft}" y="${BAT.top}" width="${BAT.w}" height="${BAT.h}" rx="9" class="fz-cell-glow" />
          <rect x="${batLeft}" y="${BAT.top}" width="${BAT.w}" height="${BAT.h}" rx="9" class="fz-cell" />
          ${m.batteryValid ? svg`<text class="fz-soc" x="${BAT.cx}" y="${BAT.top + 56}">${soc.toFixed(0)}%</text>` : nothing}
          ${panel(24, BAT.top + BAT.h + 8, 172, 82, liq)}
          <text class="fz-label" x="${BAT.cx}" y="${BAT.top + BAT.h + 18}">${batHeader}</text>
          <text class="fz-val" x="${BAT.cx}" y="${BAT.top + BAT.h + 34}">
            ${m.batteryCharging ? '▲ ' : m.batteryW > 15 ? '▼ ' : ''}${fmtW(m.batteryW)}
          </text>
          ${batLine1 ? svg`<text class="fz-sub" x="${BAT.cx}" y="${BAT.top + BAT.h + 49}">${batLine1}</text>` : nothing}
          ${batLine2 ? svg`<text class="fz-sub" x="${BAT.cx}" y="${BAT.top + BAT.h + 63}">${batLine2}</text>` : nothing}
          ${batLine3 ? svg`<text class="fz-sub" x="${BAT.cx}" y="${BAT.top + BAT.h + 77}">${batLine3}</text>` : nothing}

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
          ${panel(612, GRID.y + 44, 156, 54, m.gridColour)}
          <text class="fz-label" x="${GRID.x}" y="${GRID.y + 54}">GRID</text>
          <text class="fz-val" x="${GRID.x}" y="${GRID.y + 70}">
            ${m.gridW > 15 ? (m.gridImporting ? '↓ ' : '↑ ') : ''}${fmtW(m.gridW)}
          </text>
          ${
            m.gridSignal !== undefined
              ? svg`<text class="fz-sub" x="${GRID.x}" y="${GRID.y + 84}"><tspan class="fz-st-${gridOn ? 'ok' : 'bad'}">●</tspan> ${gridOn ? 'ON-GRID' : 'OFF-GRID'}</text>`
              : nothing
          }
          ${
            m.prepaidKwh !== undefined
              ? svg`<g transform="translate(${GRID.x} ${GRID.y + 112})" style="--pp:${ppColor}">
                  <rect x="-60" y="-16" width="120" height="32" rx="16" class="fz-prepaid" />
                  <circle class="fz-prepaid-dot" cx="-44" cy="0" r="3.5" />
                  <text class="fz-prepaid-v" x="2" y="-1">${m.prepaidKwh.toFixed(1)} kWh</text>
                  <text class="fz-prepaid-l" x="2" y="10">PREPAID BALANCE</text>
                </g>`
              : nothing
          }

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
          ${panel(612, HOME.y + 44, 140, 42, m.loadColour)}
          <text class="fz-label" x="${HOME.x}" y="${HOME.y + 54}">HOME</text>
          <text class="fz-val" x="${HOME.x}" y="${HOME.y + 70}">${fmtW(m.loadW)}</text>
          ${
            m.sparkLoad && m.sparkLoad.length > 1
              ? svg`<g>
                  <text class="fz-sub" x="${HOME.x}" y="${HOME.y + 92}">LOAD · 24H</text>
                  ${sparkline(HOME.x - 64, HOME.y + 96, 128, 22, m.sparkLoad, m.loadColour)}
                </g>`
              : nothing
          }

          <!-- unified daily totals strip -->
          ${(() => {
            const items = [
              ['SOLAR', m.dailySolar],
              ['LOAD', m.dailyLoad],
              ['IMPORT', m.dailyImport],
              ['EXPORT', m.dailyExport],
            ].filter((d) => d[1] !== undefined) as [string, number][];
            if (!items.length) return nothing;
            const seg = 84;
            const w = items.length * seg;
            const x0 = 400 - w / 2;
            return svg`<g transform="translate(${x0} 452)">
              <rect class="fz-strip" x="0" y="-16" width="${w}" height="32" rx="9" />
              ${items.map(
                ([label, val], i) => svg`
                ${i > 0 ? svg`<line class="fz-strip-div" x1="${i * seg}" y1="-9" x2="${i * seg}" y2="9" />` : nothing}
                <text class="fz-chip-v" x="${i * seg + seg / 2}" y="-2">${val.toFixed(1)}</text>
                <text class="fz-chip-l" x="${i * seg + seg / 2}" y="10">${label} kWh</text>`,
              )}
            </g>`;
          })()}

          <!-- tap targets → more-info -->
          <g class="fz-hits">
            ${m.ids.solar ? svg`<rect class="fz-hit" x="20" y="78" width="206" height="186" @click=${more(m.ids.solar)} />` : nothing}
            ${m.ids.battery ? svg`<rect class="fz-hit" x="18" y="300" width="186" height="216" @click=${more(m.ids.battery)} />` : nothing}
            ${m.ids.grid ? svg`<rect class="fz-hit" x="600" y="320" width="194" height="168" @click=${more(m.ids.grid)} />` : nothing}
            ${m.ids.home ? svg`<rect class="fz-hit" x="600" y="88" width="194" height="126" @click=${more(m.ids.home)} />` : nothing}
            ${m.ids.inverter ? svg`<circle class="fz-hit" cx="${C.x}" cy="${C.y}" r="92" @click=${more(m.ids.inverter)} />` : nothing}
          </g>

          <rect x="0" y="0" width="800" height="520" fill="url(#fz-scan)" pointer-events="none" />
          ${reduced ? nothing : svg`<rect class="fz-sweep" x="0" y="-60" width="800" height="60" fill="url(#fz-sweep)" pointer-events="none" />`}
          <rect x="0" y="0" width="800" height="520" fill="url(#fz-vign)" pointer-events="none" />
        </svg>
      </div>
    </ha-card>
  `;
};
