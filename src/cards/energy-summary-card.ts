import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

interface EnergySummaryConfig {
  type: string;
  title?: string;
  solar?: string;
  load?: string;
  battery_charge?: string;
  battery_discharge?: string;
  grid_import?: string;
  grid_export?: string;
  decimals?: number;
  glow?: boolean;
}

const ROWS: {
  key: keyof EnergySummaryConfig;
  label: string;
  colour: string;
  icon: string;
}[] = [
  { key: 'solar', label: 'Solar', colour: '#ffa500', icon: 'mdi:solar-power' },
  { key: 'load', label: 'Load', colour: '#5fb6ad', icon: 'mdi:home-lightning-bolt' },
  { key: 'battery_charge', label: 'Charged', colour: '#5fd07a', icon: 'mdi:battery-arrow-up' },
  { key: 'battery_discharge', label: 'Discharged', colour: '#ff5fa2', icon: 'mdi:battery-arrow-down' },
  { key: 'grid_import', label: 'Imported', colour: '#5490c2', icon: 'mdi:transmission-tower-export' },
  { key: 'grid_export', label: 'Exported', colour: '#b48be0', icon: 'mdi:transmission-tower-import' },
];

/**
 * Solar-Solution — Daily energy summary.
 * Horizontal bars of today's energy totals (solar / load / charged /
 * discharged / imported / exported), each scaled to the largest value.
 */
@customElement('solar-solution-energy-summary')
export class SolarSolutionEnergySummary extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: EnergySummaryConfig;

  public setConfig(config: EnergySummaryConfig): void {
    // Lenient: never hard-error (keeps the card-picker preview working).
    this._config = config || ({} as EnergySummaryConfig);
  }

  public getCardSize(): number {
    return 3;
  }

  public static getStubConfig() {
    return { title: 'Daily energy', solar: '', load: '' };
  }

  private _num(entity?: string): number {
    const v = entity ? parseFloat(this.hass?.states?.[entity]?.state) : NaN;
    return Number.isFinite(v) ? v : 0;
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const dp = this._config.decimals ?? 1;
    const glow = this._config.glow === true;

    const rows = ROWS.filter((r) => this._config[r.key]).map((r) => ({
      ...r,
      value: this._num(this._config[r.key] as string),
    }));
    if (!rows.length) {
      return html`<ha-card
        ><div class="head">
          <ha-icon icon="mdi:chart-box-outline"></ha-icon
          ><span class="title">${this._config.title ?? 'Daily energy'}</span>
        </div>
        <div class="hint">
          Add energy entities: <code>solar</code>, <code>load</code>,
          <code>grid_import</code>, …
        </div>
      </ha-card>`;
    }
    const max = Math.max(...rows.map((r) => r.value), 0.001);

    return html`
      <ha-card class="${glow ? 'ss-es-glow' : ''}">
        <div class="head">
          <ha-icon icon="mdi:chart-box-outline"></ha-icon>
          <span class="title">${this._config.title ?? 'Daily energy'}</span>
        </div>
        <div class="rows">
          ${rows.map(
            (r) => html`
              <div class="row">
                <span class="label">${r.label}</span>
                <div class="track">
                  <div
                    class="fill"
                    style="width:${((r.value / max) * 100).toFixed(1)}%;--c:${r.colour}"
                  ></div>
                </div>
                <span class="val">${r.value.toFixed(dp)} kWh</span>
              </div>
            `,
          )}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      padding: 16px;
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
    .head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .head ha-icon {
      --mdc-icon-size: 26px;
      color: var(--primary-text-color);
    }
    .title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    .rows {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .row {
      display: grid;
      grid-template-columns: 84px 1fr 86px;
      align-items: center;
      gap: 10px;
    }
    .label {
      color: var(--secondary-text-color);
      font-size: 0.92rem;
    }
    .track {
      height: 14px;
      border-radius: 7px;
      background: var(--divider-color, rgba(127, 127, 127, 0.18));
      overflow: hidden;
    }
    .fill {
      height: 100%;
      border-radius: 7px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--c) 60%, transparent),
        var(--c)
      );
      transition: width 0.6s ease;
    }
    .val {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
    .ss-es-glow {
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #161a23)) 78%,
        transparent
      );
      -webkit-backdrop-filter: blur(8px) saturate(130%);
      backdrop-filter: blur(8px) saturate(130%);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .ss-es-glow .fill {
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 14px -2px var(--c);
      filter: drop-shadow(0 0 3px var(--c));
    }
    /* Light shimmer sweeping along each glowing bar. */
    .ss-es-glow .fill::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.45),
        transparent
      );
      transform: translateX(-130%);
      animation: ss-shimmer 2.8s ease-in-out infinite;
    }
    @keyframes ss-shimmer {
      0% {
        transform: translateX(-130%);
      }
      55%,
      100% {
        transform: translateX(230%);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .ss-es-glow .fill::after {
        animation: none;
        opacity: 0;
      }
    }
  `;
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'solar-solution-energy-summary',
  name: 'Solar-Solution — Daily energy summary',
  preview: true,
  description: "Today's energy totals as proportional bars.",
});
