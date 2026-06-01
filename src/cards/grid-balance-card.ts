import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

interface GridBalanceConfig {
  type: string;
  title?: string;
  import?: string; // entity id — energy imported from grid
  export?: string; // entity id — energy exported to grid
  icon?: string;
  import_colour?: string;
  export_colour?: string;
  decimals?: number;
  glow?: boolean;
}

/**
 * Solar-Solution — Grid energy balance.
 * Shows imported − exported = net grid energy, with a proportional diverging
 * bar (export on the left, import on the right). Companion to the main card.
 */
@customElement('solar-solution-grid-balance')
export class SolarSolutionGridBalance extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: GridBalanceConfig;

  public setConfig(config: GridBalanceConfig): void {
    // Lenient: store the config and show a hint if entities are missing, so the
    // card-picker preview (preview: true) and partial configs never hard-error.
    this._config = config || ({} as GridBalanceConfig);
  }

  public getCardSize(): number {
    return 2;
  }

  public static getStubConfig() {
    return {
      title: 'Grid energy balance',
      import: '',
      export: '',
    };
  }

  private _num(entity?: string): number {
    const v = entity ? parseFloat(this.hass?.states?.[entity]?.state) : NaN;
    return Number.isFinite(v) ? v : 0;
  }

  private _unit(): string {
    const e = this._config.import || this._config.export;
    return (
      (e && this.hass?.states?.[e]?.attributes?.unit_of_measurement) || 'kWh'
    );
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    if (!this._config.import && !this._config.export) {
      return html`<ha-card
        ><div class="head">
          <ha-icon icon="mdi:transmission-tower"></ha-icon
          ><span class="title">${this._config.title ?? 'Grid energy balance'}</span>
        </div>
        <div class="hint">Set <code>import</code> and/or <code>export</code> energy entities.</div>
      </ha-card>`;
    }

    const imp = this._num(this._config.import);
    const exp = this._num(this._config.export);
    const net = imp - exp;
    const unit = this._unit();
    const dp = this._config.decimals ?? 2;
    const impC = this._config.import_colour ?? '#5490c2';
    const expC = this._config.export_colour ?? '#b48be0';
    const icon = this._config.icon ?? 'mdi:transmission-tower';
    const total = imp + exp;
    // Split point of the diverging bar (0..1): the export share of the total.
    const expPct = total > 0 ? (exp / total) * 100 : 50;
    const fmt = (n: number) => n.toFixed(dp);
    const glow = this._config.glow === true;

    return html`
      <ha-card class="${glow ? 'ss-gb-glow' : ''}">
        <div class="head">
          <ha-icon .icon=${icon}></ha-icon>
          <span class="title">${this._config.title ?? 'Grid energy balance'}</span>
        </div>
        <div class="sum">
          <span style="color:${impC}">${fmt(imp)} ${unit}</span>
          <span class="op">−</span>
          <span style="color:${expC}">${fmt(exp)} ${unit}</span>
          <span class="op">=</span>
          <span class="net" style="color:${net >= 0 ? impC : expC}"
            >${fmt(net)} ${unit}</span
          >
        </div>
        <div
          class="bar"
          style="--imp:${impC};--exp:${expC};--split:${expPct.toFixed(2)}%"
        >
          <div class="seg exp"></div>
          <div class="divider"></div>
          <div class="seg imp"></div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      padding: 16px;
    }
    .hint {
      margin-top: 8px;
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
      margin-bottom: 6px;
    }
    .head ha-icon {
      --mdc-icon-size: 28px;
      color: var(--primary-text-color);
    }
    .title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    .sum {
      font-size: 1.05rem;
      font-weight: 500;
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: baseline;
    }
    .sum .op {
      color: var(--secondary-text-color);
    }
    .bar {
      position: relative;
      display: flex;
      height: 26px;
      border-radius: 13px;
      overflow: hidden;
      background: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .seg {
      height: 100%;
    }
    .seg.exp {
      width: var(--split);
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--exp) 55%, transparent),
        var(--exp)
      );
    }
    .seg.imp {
      flex: 1;
      background: linear-gradient(
        90deg,
        var(--imp),
        color-mix(in srgb, var(--imp) 55%, transparent)
      );
    }
    .divider {
      width: 2px;
      height: 100%;
      background: var(--primary-text-color);
      opacity: 0.85;
    }
    /* Optional neon glow to match the main card */
    .ss-gb-glow {
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #161a23)) 78%,
        transparent
      );
      -webkit-backdrop-filter: blur(8px) saturate(130%);
      backdrop-filter: blur(8px) saturate(130%);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .ss-gb-glow .bar {
      box-shadow:
        0 0 10px rgba(0, 0, 0, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    }
    .ss-gb-glow .seg.exp {
      box-shadow: 0 0 12px -2px var(--exp);
    }
    .ss-gb-glow .seg.imp {
      box-shadow: 0 0 12px -2px var(--imp);
    }
  `;
}

// Register in the card picker.
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'solar-solution-grid-balance',
  name: 'Solar-Solution — Grid energy balance',
  preview: true,
  description: 'Imported − exported = net grid energy, with a diverging bar.',
});
