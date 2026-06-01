import { LitElement, html, css, svg, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

interface SelfSufficiencyConfig {
  type: string;
  title?: string;
  // Either a direct percentage sensor…
  value?: string;
  // …or compute from energy totals: (1 − import / load) × 100.
  load?: string;
  grid_import?: string;
  colour?: string; // override the dynamic red→amber→green colour
  glow?: boolean;
  decimals?: number;
}

/**
 * Solar-Solution — Self-sufficiency gauge.
 * A glowing radial ring showing what share of the home's energy came from
 * solar + battery rather than the grid. Either reads a % sensor directly or
 * derives it from load and grid-import energy.
 */
@customElement('solar-solution-self-sufficiency')
export class SolarSolutionSelfSufficiency extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: SelfSufficiencyConfig;

  public setConfig(config: SelfSufficiencyConfig): void {
    // Lenient: never hard-error (keeps the card-picker preview working).
    this._config = config || ({} as SelfSufficiencyConfig);
  }

  private _configured(): boolean {
    return !!(
      this._config?.value ||
      (this._config?.load && this._config?.grid_import)
    );
  }

  public getCardSize(): number {
    return 3;
  }

  public static getStubConfig() {
    return { title: 'Self-sufficiency', load: '', grid_import: '' };
  }

  private _num(entity?: string): number {
    const v = entity ? parseFloat(this.hass?.states?.[entity]?.state) : NaN;
    return Number.isFinite(v) ? v : 0;
  }

  private _pct(): number {
    if (this._config.value) return this._num(this._config.value);
    const load = this._num(this._config.load);
    const imp = this._num(this._config.grid_import);
    if (load <= 0) return 0;
    return (1 - imp / load) * 100;
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    if (!this._configured()) {
      return html`<ha-card
        ><div class="head">
          <ha-icon icon="mdi:leaf"></ha-icon
          ><span class="title">${this._config.title ?? 'Self-sufficiency'}</span>
        </div>
        <div class="hint">
          Set a <code>value</code> (% sensor) or both <code>load</code> and
          <code>grid_import</code>.
        </div>
      </ha-card>`;
    }
    const raw = this._pct();
    const pct = Math.max(0, Math.min(100, raw));
    const dp = this._config.decimals ?? 0;
    const colour =
      this._config.colour ??
      (pct >= 67 ? '#5fd07a' : pct >= 34 ? '#ffb14e' : '#ff6b6b');
    const glow = this._config.glow !== false; // glow on by default; set glow: false to disable
    const cx = 60;
    const cy = 60;
    const r = 46;

    // Tick marks every 10% around the dial.
    const ticks: { x1: string; y1: string; x2: string; y2: string }[] = [];
    for (let i = 0; i < 10; i++) {
      const a = ((-90 + i * 36) * Math.PI) / 180;
      ticks.push({
        x1: (cx + 53 * Math.cos(a)).toFixed(2),
        y1: (cy + 53 * Math.sin(a)).toFixed(2),
        x2: (cx + 58 * Math.cos(a)).toFixed(2),
        y2: (cy + 58 * Math.sin(a)).toFixed(2),
      });
    }
    // Glowing knob at the leading edge of the fill.
    const ka = ((-90 + pct * 3.6) * Math.PI) / 180;
    const kx = (cx + r * Math.cos(ka)).toFixed(2);
    const ky = (cy + r * Math.sin(ka)).toFixed(2);

    // kWh breakdown (only when derived from load + grid_import).
    let breakdown: unknown = nothing;
    if (!this._config.value && this._config.load && this._config.grid_import) {
      const load = this._num(this._config.load);
      const imp = this._num(this._config.grid_import);
      const self = Math.max(0, load - imp);
      const unit =
        this.hass?.states?.[this._config.load]?.attributes
          ?.unit_of_measurement || 'kWh';
      breakdown = html`<div class="breakdown">
        <span style="color:${colour}">${self.toFixed(1)} ${unit} self</span>
        <span class="dot">·</span>
        <span class="grid">${imp.toFixed(1)} ${unit} grid</span>
      </div>`;
    }

    return html`
      <ha-card class="${glow ? 'ss-ss-glow' : ''}">
        <div class="head">
          <ha-icon icon="mdi:leaf"></ha-icon>
          <span class="title">${this._config.title ?? 'Self-sufficiency'}</span>
        </div>
        <div class="gauge">
          <svg viewBox="0 0 120 120" style="--c:${colour}">
            <g class="ticks">
              ${ticks.map(
                (t) =>
                  svg`<line x1="${t.x1}" y1="${t.y1}" x2="${t.x2}" y2="${t.y2}" />`,
              )}
            </g>
            <circle
              cx="${cx}"
              cy="${cy}"
              r="${r}"
              fill="none"
              stroke="${colour}"
              stroke-opacity="0.16"
              stroke-width="11"
            />
            ${svg`<circle class="arc" cx="${cx}" cy="${cy}" r="${r}" fill="none"
              stroke="${colour}" stroke-width="11" stroke-linecap="round"
              pathLength="100" stroke-dasharray="${pct.toFixed(2)} 100"
              transform="rotate(-90 ${cx} ${cy})" />`}
            ${svg`<circle class="knob" cx="${kx}" cy="${ky}" r="5.5" fill="${colour}" />`}
            ${svg`<circle class="knob-core" cx="${kx}" cy="${ky}" r="2.3" fill="#ffffff" />`}
            <text x="60" y="58" class="pct">${pct.toFixed(dp)}%</text>
            <text x="60" y="76" class="sub">self-sufficient</text>
          </svg>
        </div>
        ${breakdown}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      padding: 16px;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }
    .head ha-icon {
      --mdc-icon-size: 26px;
      color: var(--primary-text-color);
    }
    .title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    .gauge {
      display: flex;
      justify-content: center;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 0.9rem;
    }
    .hint code {
      background: var(--divider-color, rgba(127, 127, 127, 0.2));
      padding: 1px 4px;
      border-radius: 4px;
    }
    svg {
      width: 200px;
      height: 200px;
      max-width: 100%;
    }
    text {
      text-anchor: middle;
      fill: var(--primary-text-color);
    }
    .pct {
      font-size: 22px;
      font-weight: 700;
    }
    .sub {
      font-size: 7px;
      fill: var(--secondary-text-color);
      letter-spacing: 0.5px;
    }
    .ticks line {
      stroke: var(--primary-text-color);
      stroke-opacity: 0.22;
      stroke-width: 1.6;
      stroke-linecap: round;
    }
    .knob-core {
      pointer-events: none;
    }
    .breakdown {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 4px;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .breakdown .dot {
      color: var(--secondary-text-color);
    }
    .breakdown .grid {
      color: #5490c2;
    }
    /* A full-circle arc has a valid bounding box, so drop-shadow glows safely. */
    .ss-ss-glow {
      --ha-card-background: color-mix(
        in srgb,
        var(--card-background-color, #161a23) 80%,
        transparent
      );
      background: color-mix(
        in srgb,
        var(--card-background-color, #161a23) 80%,
        transparent
      );
      -webkit-backdrop-filter: blur(9px) saturate(135%);
      backdrop-filter: blur(9px) saturate(135%);
      border: 1px solid rgba(255, 255, 255, 0.14);
    }
    /* Animate the arc filling in, and breathe its glow. */
    .arc {
      transition: stroke-dasharray 0.9s ease;
    }
    .ss-ss-glow .arc {
      animation: ss-gauge-breathe 2.8s ease-in-out infinite;
    }
    .ss-ss-glow .pct {
      filter: drop-shadow(0 0 4px var(--c));
    }
    .knob {
      transition:
        cx 0.9s ease,
        cy 0.9s ease;
    }
    .ss-ss-glow .knob {
      animation: ss-gauge-breathe 2.8s ease-in-out infinite;
    }
    .ss-ss-glow .knob-core {
      filter: drop-shadow(0 0 2px #fff);
    }
    @keyframes ss-gauge-breathe {
      0%,
      100% {
        filter: drop-shadow(0 0 6px var(--c));
      }
      50% {
        filter: drop-shadow(0 0 16px var(--c)) drop-shadow(0 0 6px var(--c));
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .arc,
      .knob {
        animation: none;
        transition: none;
      }
      .arc {
        filter: drop-shadow(0 0 5px var(--c));
      }
    }
  `;
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'solar-solution-self-sufficiency',
  name: 'Solar-Solution — Self-sufficiency gauge',
  preview: true,
  description: 'Share of energy from solar + battery vs the grid.',
});
