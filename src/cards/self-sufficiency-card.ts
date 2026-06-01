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

    return html`
      <ha-card class="${glow ? 'ss-ss-glow' : ''}">
        <div class="head">
          <ha-icon icon="mdi:leaf"></ha-icon>
          <span class="title">${this._config.title ?? 'Self-sufficiency'}</span>
        </div>
        <div class="gauge">
          <svg viewBox="0 0 120 120" style="--c:${colour}">
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
            <text x="60" y="58" class="pct">${pct.toFixed(dp)}%</text>
            <text x="60" y="76" class="sub">self-sufficient</text>
          </svg>
        </div>
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
    /* A full-circle arc has a valid bounding box, so drop-shadow glows safely. */
    .ss-ss-glow {
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #161a23)) 78%,
        transparent
      );
      -webkit-backdrop-filter: blur(8px) saturate(130%);
      backdrop-filter: blur(8px) saturate(130%);
      border: 1px solid rgba(255, 255, 255, 0.12);
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
    @keyframes ss-gauge-breathe {
      0%,
      100% {
        filter: drop-shadow(0 0 4px var(--c));
      }
      50% {
        filter: drop-shadow(0 0 11px var(--c));
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .arc {
        animation: none;
        transition: none;
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
