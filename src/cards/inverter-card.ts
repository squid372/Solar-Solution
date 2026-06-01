import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

interface InvItem {
  entity?: string;
  label?: string;
  icon?: string;
  unit?: string;
}

interface InverterConfig {
  type: string;
  title?: string;
  icon?: string;
  status?: string; // entity shown as a big status badge
  entities?: (string | InvItem)[];
  columns?: number;
  decimals?: number;
  glow?: boolean;
}

/**
 * Solar-Solution — Inverter settings.
 * A clean tile grid of any inverter settings / readouts you map (work mode,
 * priority, solar-sell, max-sell power, frequency, temperatures, …) with an
 * optional status badge. Tiles are clickable (more-info).
 */
@customElement('solar-solution-inverter')
export class SolarSolutionInverter extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: InverterConfig;

  public setConfig(config: InverterConfig): void {
    this._config = config || ({} as InverterConfig);
  }

  public getCardSize(): number {
    return 4;
  }

  public static getStubConfig() {
    return { title: 'Inverter', status: '', entities: [] };
  }

  private _items(): InvItem[] {
    return (this._config.entities ?? []).map((e) =>
      typeof e === 'string' ? { entity: e } : e,
    );
  }

  private _state(entity?: string): string {
    return (entity && this.hass?.states?.[entity]?.state) ?? '';
  }

  private _attr(entity?: string) {
    return (entity && this.hass?.states?.[entity]?.attributes) || {};
  }

  // Title-case a raw state string ("selfuse" / "grid_first" → "Self Use" / …).
  private _pretty(raw: string): string {
    return raw
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  private _fmt(item: InvItem): { value: string; unit: string } {
    const raw = this._state(item.entity);
    const attrs = this._attr(item.entity);
    const unit = item.unit ?? attrs.unit_of_measurement ?? '';
    const num = parseFloat(raw);
    if (raw !== '' && Number.isFinite(num) && /^-?\d/.test(raw.trim())) {
      const dp = this._config.decimals ?? (Math.abs(num) >= 100 ? 0 : 1);
      return { value: num.toFixed(dp), unit };
    }
    if (raw === '' || raw === 'unknown' || raw === 'unavailable')
      return { value: '—', unit: '' };
    return { value: this._pretty(raw), unit: '' };
  }

  private _label(item: InvItem): string {
    if (item.label) return item.label;
    const fn = this._attr(item.entity).friendly_name as string | undefined;
    if (fn) return fn;
    return this._pretty((item.entity ?? '').split('.').pop() ?? '');
  }

  private _icon(item: InvItem): string {
    return item.icon ?? (this._attr(item.entity).icon as string) ?? 'mdi:cog';
  }

  private _more(entity?: string) {
    if (!entity) return;
    this.dispatchEvent(
      new CustomEvent('hass-more-info', {
        detail: { entityId: entity },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _statusTone(raw: string): string {
    const s = raw.toLowerCase();
    if (/fault|error|alarm|fail|shutdown|off|standby/.test(s)) return 'bad';
    if (/normal|ok|run|on|grid|self|export|charg|discharg/.test(s)) return 'ok';
    return 'neutral';
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const title = this._config.title ?? 'Inverter';
    const icon = this._config.icon ?? 'mdi:solar-power-variant';
    const items = this._items().filter((i) => i.entity);
    const glow = this._config.glow !== false;

    if (!items.length && !this._config.status) {
      return html`<ha-card
        ><div class="head">
          <ha-icon .icon=${icon}></ha-icon><span class="title">${title}</span>
        </div>
        <div class="hint">
          Add a <code>status</code> entity and/or an <code>entities</code> list
          of inverter settings to display.
        </div>
      </ha-card>`;
    }

    const cols = this._config.columns;
    const gridStyle = cols
      ? `grid-template-columns:repeat(${cols},minmax(0,1fr))`
      : '';

    let badge: unknown = nothing;
    if (this._config.status) {
      const raw = this._state(this._config.status);
      const tone = this._statusTone(raw);
      badge = html`<button
        class="badge ${tone}"
        @click=${() => this._more(this._config.status)}
      >
        <span class="led"></span>${this._pretty(raw) || '—'}
      </button>`;
    }

    return html`
      <ha-card class="${glow ? 'ss-inv-glow' : ''}">
        <div class="head">
          <ha-icon .icon=${icon}></ha-icon>
          <span class="title">${title}</span>
          ${badge}
        </div>
        <div class="grid" style="${gridStyle}">
          ${items.map((it) => {
            const { value, unit } = this._fmt(it);
            return html`<button class="tile" @click=${() => this._more(it.entity)}>
              <ha-icon .icon=${this._icon(it)}></ha-icon>
              <span class="val">${value}${unit ? html` <i>${unit}</i>` : ''}</span>
              <span class="lab">${this._label(it)}</span>
            </button>`;
          })}
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
      margin-bottom: 14px;
    }
    .head ha-icon {
      --mdc-icon-size: 28px;
      color: var(--primary-text-color);
    }
    .title {
      font-size: 1.25rem;
      font-weight: 600;
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
    .badge {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary-text-color);
      padding: 4px 11px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: var(--divider-color, rgba(127, 127, 127, 0.18));
      cursor: pointer;
    }
    .badge .led {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #8a93a6;
    }
    .badge.ok {
      color: #6fe09a;
    }
    .badge.ok .led {
      background: #46d97c;
      box-shadow: 0 0 8px #46d97c;
    }
    .badge.bad {
      color: #ff8b8b;
    }
    .badge.bad .led {
      background: #ff5a5a;
      box-shadow: 0 0 8px #ff5a5a;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
      gap: 10px;
    }
    .tile {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
      padding: 11px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: var(--divider-color, rgba(127, 127, 127, 0.1));
      color: var(--primary-text-color);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        transform 0.15s ease,
        border-color 0.15s ease;
    }
    .tile:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.22);
    }
    .tile ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      margin-bottom: 2px;
    }
    .tile .val {
      font-size: 1.18rem;
      font-weight: 700;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
      word-break: break-word;
    }
    .tile .val i {
      font-style: normal;
      font-size: 0.72em;
      font-weight: 600;
      color: var(--secondary-text-color);
    }
    .tile .lab {
      font-size: 0.78rem;
      color: var(--secondary-text-color);
      line-height: 1.15;
    }
    /* Glow */
    .ss-inv-glow {
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
    .ss-inv-glow .tile {
      background: rgba(255, 255, 255, 0.04);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    }
    .ss-inv-glow .tile:hover {
      box-shadow:
        0 0 16px rgba(120, 170, 255, 0.25),
        inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
  `;
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'solar-solution-inverter',
  name: 'Solar-Solution — Inverter settings',
  preview: true,
  description: 'A tile grid of inverter settings & readouts with a status badge.',
});
