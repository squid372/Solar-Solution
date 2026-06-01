import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

interface GBSide {
  entity?: string;
  label?: string;
  colour?: string;
}

interface GridBalanceConfig {
  type: string;
  title?: string;
  icon?: string;
  // Generic two-sided comparison (use this for e.g. Solar vs Grid):
  left?: GBSide;
  right?: GBSide;
  show_net?: boolean;
  decimals?: number;
  glow?: boolean;
  // Legacy / shorthand (grid imported vs exported):
  import?: string;
  export?: string;
  import_colour?: string;
  export_colour?: string;
}

/**
 * Solar-Solution — energy balance (diverging bar).
 * Generic: compares any two energy values (left vs right) with a proportional
 * bar — e.g. Solar vs Grid, or grid Imported vs Exported. The legacy
 * import/export shorthand still works.
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
      title: 'Solar vs Grid',
      left: { entity: '', label: 'Solar', colour: '#ffa500' },
      right: { entity: '', label: 'Grid', colour: '#5490c2' },
    };
  }

  private _num(entity?: string): number {
    const v = entity ? parseFloat(this.hass?.states?.[entity]?.state) : NaN;
    return Number.isFinite(v) ? v : 0;
  }

  private _unit(entity?: string): string {
    return (
      (entity && this.hass?.states?.[entity]?.attributes?.unit_of_measurement) ||
      'kWh'
    );
  }

  private _legacy(): boolean {
    return (
      !this._config.left &&
      !this._config.right &&
      (this._config.import !== undefined || this._config.export !== undefined)
    );
  }

  private _configured(): boolean {
    const c = this._config;
    return !!(c.left?.entity || c.right?.entity || c.import || c.export);
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const icon = this._config.icon ?? 'mdi:transmission-tower';
    const title = this._config.title ?? 'Energy balance';

    if (!this._configured()) {
      return html`<ha-card
        ><div class="head">
          <ha-icon .icon=${icon}></ha-icon><span class="title">${title}</span>
        </div>
        <div class="hint">
          Set <code>left</code> &amp; <code>right</code> entities (or
          <code>import</code>/<code>export</code>).
        </div>
      </ha-card>`;
    }

    const dp = this._config.decimals ?? 2;
    const fmt = (n: number) => n.toFixed(dp);
    const glow = this._config.glow !== false; // glow on by default; set glow: false to disable
    const legacy = this._legacy();

    let leftV: number;
    let rightV: number;
    let leftC: string;
    let rightC: string;
    let sum;

    if (legacy) {
      const imp = this._num(this._config.import);
      const exp = this._num(this._config.export);
      const impC = this._config.import_colour ?? '#5490c2';
      const expC = this._config.export_colour ?? '#b48be0';
      const unit = this._unit(this._config.import || this._config.export);
      const net = imp - exp;
      leftV = exp;
      rightV = imp;
      leftC = expC;
      rightC = impC;
      sum = html`<span style="color:${impC}">${fmt(imp)} ${unit}</span>
        <span class="op">−</span>
        <span style="color:${expC}">${fmt(exp)} ${unit}</span>
        <span class="op">=</span>
        <span class="net" style="color:${net >= 0 ? impC : expC}"
          >${fmt(net)} ${unit}</span
        >`;
    } else {
      const L = this._config.left ?? {};
      const R = this._config.right ?? {};
      leftV = this._num(L.entity);
      rightV = this._num(R.entity);
      leftC = L.colour ?? '#ffa500';
      rightC = R.colour ?? '#5490c2';
      const lu = this._unit(L.entity);
      const ru = this._unit(R.entity);
      const net = leftV - rightV;
      sum = html`<span style="color:${leftC}"
          >${fmt(leftV)} ${lu}${L.label ? ' ' + L.label : ''}</span
        >
        <span class="op">·</span>
        <span style="color:${rightC}"
          >${fmt(rightV)} ${ru}${R.label ? ' ' + R.label : ''}</span
        >
        ${this._config.show_net
          ? html`<span class="op">=</span><span class="net">${fmt(net)} ${lu}</span>`
          : ''}`;
    }

    const total = leftV + rightV;
    const leftPct = total > 0 ? (leftV / total) * 100 : 50;

    return html`
      <ha-card class="${glow ? 'ss-gb-glow' : ''}">
        <div class="head">
          <ha-icon .icon=${icon}></ha-icon>
          <span class="title">${title}</span>
        </div>
        <div class="sum">${sum}</div>
        <div
          class="bar"
          style="--left:${leftC};--right:${rightC};--split:${leftPct.toFixed(2)}%"
        >
          <div class="seg l"></div>
          <div class="divider"></div>
          <div class="seg r"></div>
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
    .seg.l {
      width: var(--split);
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--left) 55%, transparent),
        var(--left)
      );
    }
    .seg.r {
      flex: 1;
      background: linear-gradient(
        90deg,
        var(--right),
        color-mix(in srgb, var(--right) 55%, transparent)
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
    .ss-gb-glow .bar {
      box-shadow:
        0 0 10px rgba(0, 0, 0, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    }
    .ss-gb-glow .seg.l {
      box-shadow:
        0 0 16px var(--left),
        0 0 5px var(--left);
    }
    .ss-gb-glow .seg.r {
      box-shadow:
        0 0 16px var(--right),
        0 0 5px var(--right);
    }
    .ss-gb-glow .divider {
      box-shadow: 0 0 8px 1px rgba(255, 255, 255, 0.85);
    }
    /* Light shimmer sweeping across the whole bar. */
    .ss-gb-glow .bar::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      transform: translateX(-130%);
      animation: ss-gb-shimmer 3s ease-in-out infinite;
    }
    @keyframes ss-gb-shimmer {
      0% {
        transform: translateX(-130%);
      }
      55%,
      100% {
        transform: translateX(230%);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .ss-gb-glow .bar::after {
        animation: none;
        opacity: 0;
      }
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
