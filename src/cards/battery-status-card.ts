import { LitElement, html, css, svg, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

interface BatteryStatusConfig {
  type: string;
  title?: string;
  soc?: string; // % entity (required for the fill)
  power?: string; // W entity (sign → charging/discharging)
  voltage?: string;
  current?: string;
  temp?: string;
  invert_power?: boolean;
  colour?: string; // override the dynamic SOC colour
  decimals?: number;
  glow?: boolean;
}

// One wave cycle is 41 wide; the path is 164 wide (4 cycles) so a -82 shift loops.
const WAVE =
  'M0 0 q10.25 -5 20.5 0 t20.5 0 t20.5 0 t20.5 0 t20.5 0 t20.5 0 t20.5 0 t20.5 0 L164 230 L0 230 Z';
// Just the crest line of the wave (a bright surface highlight).
const WAVE_LINE =
  'M0 0 q10.25 -5 20.5 0 t20.5 0 t20.5 0 t20.5 0 t20.5 0 t20.5 0 t20.5 0 t20.5 0';

/**
 * Solar-Solution — Battery status.
 * A battery glyph with an animated liquid fill: the level rises/falls with SOC,
 * the surface waves, bubbles rise while charging, and the liquid colour shifts
 * green → yellow → red as the charge drops.
 */
@customElement('solar-solution-battery')
export class SolarSolutionBattery extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: BatteryStatusConfig;

  public setConfig(config: BatteryStatusConfig): void {
    this._config = config || ({} as BatteryStatusConfig);
  }

  public getCardSize(): number {
    return 4;
  }

  public static getStubConfig() {
    return { title: 'Battery', soc: '', power: '' };
  }

  private _num(entity?: string): number {
    const v = entity ? parseFloat(this.hass?.states?.[entity]?.state) : NaN;
    return Number.isFinite(v) ? v : 0;
  }

  private _unit(entity: string | undefined, fallback: string): string {
    return (
      (entity && this.hass?.states?.[entity]?.attributes?.unit_of_measurement) ||
      fallback
    );
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const title = this._config.title ?? 'Battery';
    if (!this._config.soc) {
      return html`<ha-card
        ><div class="head">
          <ha-icon icon="mdi:battery"></ha-icon><span class="title">${title}</span>
        </div>
        <div class="hint">Set a <code>soc</code> (battery %) entity.</div>
      </ha-card>`;
    }

    const pct = Math.max(0, Math.min(100, this._num(this._config.soc)));
    const dp = this._config.decimals ?? 0;
    const glow = this._config.glow !== false;
    const liq =
      this._config.colour ??
      (pct >= 70 ? '#33c463' : pct > 30 ? '#ffc63a' : '#ff5252');

    const power = this._num(this._config.power);
    const inv = this._config.invert_power === true;
    const absP = Math.abs(power);
    const charging = absP > 1 && (inv ? power > 0 : power < 0);
    const discharging = absP > 1 && !charging;

    // Interior of the battery body (clip region): x 19..101, y 19..209 (h 190).
    const top = 19;
    const height = 190;
    const surfaceY = top + (1 - pct / 100) * height;

    const bubbles = charging
      ? svg`<g class="bubbles">
          ${[
            { x: 38, d: 0, s: 2.4 },
            { x: 60, d: 0.8, s: 3 },
            { x: 80, d: 1.6, s: 2 },
            { x: 50, d: 2.3, s: 1.7 },
          ].map(
            (b) =>
              svg`<circle cx="${b.x}" cy="205" r="${b.s}" style="animation-delay:${b.d}s"/>`,
          )}
        </g>`
      : nothing;

    const stat = (
      entity: string | undefined,
      label: string,
      fallbackUnit: string,
      d = 1,
    ) =>
      entity
        ? html`<div class="stat">
            <span class="v">${this._num(entity).toFixed(d)} ${this._unit(entity, fallbackUnit)}</span>
            <span class="l">${label}</span>
          </div>`
        : nothing;

    return html`
      <ha-card class="${glow ? 'ss-bat-glow' : ''}">
        <div class="head">
          <ha-icon icon="mdi:battery-charging"></ha-icon>
          <span class="title">${title}</span>
        </div>

        <div class="body" style="--liq:${liq}">
          <svg viewBox="0 0 120 232" class="batt">
            <defs>
              <clipPath id="bclip">
                <rect x="19" y="19" width="82" height="190" rx="12" />
              </clipPath>
              <linearGradient id="surf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ffffff" stop-opacity="0.5" />
                <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="caseg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ffffff" stop-opacity="0.75" />
                <stop offset="1" stop-color="#ffffff" stop-opacity="0.3" />
              </linearGradient>
            </defs>
            <g clip-path="url(#bclip)">
              <rect x="19" y="19" width="82" height="190" class="empty" />
              <g class="guides">
                <line x1="19" y1="66.5" x2="101" y2="66.5" />
                <line x1="19" y1="114" x2="101" y2="114" />
                <line x1="19" y1="161.5" x2="101" y2="161.5" />
              </g>
              <g
                class="liquid ${charging ? 'chg' : ''}"
                style="transform: translate(19px, ${surfaceY.toFixed(2)}px)"
              >
                ${svg`<path class="wave back" d="${WAVE}" />`}
                ${svg`<path class="wave front" d="${WAVE}" />`}
                <rect
                  class="surface-lit"
                  x="0"
                  y="0"
                  width="164"
                  height="50"
                  fill="url(#surf)"
                />
                ${svg`<path class="surface-line" d="${WAVE_LINE}" />`}
              </g>
              ${bubbles}
              <rect class="sheen" x="27" y="27" width="15" height="150" rx="7.5" />
            </g>
            <!-- casing -->
            <rect x="44" y="3" width="32" height="12" rx="3.5" class="cap" />
            <rect
              x="13"
              y="13"
              width="94"
              height="202"
              rx="18"
              class="case"
              fill="none"
              stroke="url(#caseg)"
            />
            <rect
              x="16.5"
              y="16.5"
              width="87"
              height="195"
              rx="15"
              class="case-inner"
              fill="none"
            />
            <text x="60" y="120" class="soc">${pct.toFixed(dp)}%</text>
          </svg>

          <div class="stats">
            ${this._config.power
              ? html`<div class="stat">
                  <span class="v power ${charging ? 'chg' : discharging ? 'dis' : ''}">
                    ${charging ? '▲' : discharging ? '▼' : ''}
                    ${absP.toFixed(0)} ${this._unit(this._config.power, 'W')}
                  </span>
                  <span class="l">
                    ${charging ? 'Charging' : discharging ? 'Discharging' : 'Idle'}
                  </span>
                </div>`
              : nothing}
            ${stat(this._config.voltage, 'Voltage', 'V')}
            ${stat(this._config.current, 'Current', 'A')}
            ${stat(this._config.temp, 'Temp', '°C')}
          </div>
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
      margin-bottom: 6px;
    }
    .head ha-icon {
      --mdc-icon-size: 26px;
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
    .body {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .batt {
      width: 120px;
      height: 232px;
      flex: none;
    }
    .case {
      stroke-width: 3;
    }
    .case-inner {
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 1.5;
    }
    .cap {
      fill: var(--primary-text-color);
      fill-opacity: 0.6;
    }
    .empty {
      fill: var(--divider-color, rgba(127, 127, 127, 0.16));
    }
    .guides line {
      stroke: var(--primary-text-color);
      stroke-opacity: 0.1;
      stroke-width: 1;
      stroke-dasharray: 2 4;
    }
    .surface-lit {
      opacity: 0.85;
    }
    .surface-line {
      fill: none;
      stroke: rgba(255, 255, 255, 0.65);
      stroke-width: 2;
      stroke-linecap: round;
    }
    .sheen {
      fill: rgba(255, 255, 255, 0.1);
    }
    .soc {
      text-anchor: middle;
      font-size: 26px;
      font-weight: 800;
      fill: #fff;
      paint-order: stroke;
      stroke: rgba(0, 0, 0, 0.35);
      stroke-width: 3;
    }
    .wave {
      fill: var(--liq);
      transition: fill 0.6s ease;
    }
    .wave.front {
      opacity: 0.95;
      animation: ss-wave 3s linear infinite;
    }
    .wave.back {
      opacity: 0.45;
      transform: translateY(2px);
      animation: ss-wave-rev 4.6s linear infinite;
    }
    /* The level rises/falls smoothly as SOC changes. */
    .liquid {
      transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes ss-wave {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-82px);
      }
    }
    @keyframes ss-wave-rev {
      from {
        transform: translateX(-82px) translateY(2px);
      }
      to {
        transform: translateX(0) translateY(2px);
      }
    }
    /* While charging, the surface highlight and rim glow pulse. */
    .liquid.chg .surface-line {
      animation: ss-bat-surf 1.8s ease-in-out infinite;
    }
    @keyframes ss-bat-surf {
      0%,
      100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }
    .ss-bat-glow .liquid.chg .wave.front {
      animation:
        ss-wave 3s linear infinite,
        ss-bat-pulse 1.8s ease-in-out infinite;
    }
    @keyframes ss-bat-pulse {
      0%,
      100% {
        filter: drop-shadow(0 0 6px var(--liq));
      }
      50% {
        filter: drop-shadow(0 0 15px var(--liq)) drop-shadow(0 0 6px var(--liq));
      }
    }
    .bubbles circle {
      fill: #fff;
      opacity: 0;
      animation: ss-bubble 2.6s ease-in infinite;
    }
    @keyframes ss-bubble {
      0% {
        transform: translateY(0);
        opacity: 0;
      }
      15% {
        opacity: 0.7;
      }
      100% {
        transform: translateY(-150px);
        opacity: 0;
      }
    }
    .stats {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .stat .v {
      font-size: 1.2rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .stat .l {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .power.chg {
      color: #33c463;
    }
    .power.dis {
      color: #ffa14e;
    }
    /* Glow */
    .ss-bat-glow {
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
    .ss-bat-glow .wave.front {
      filter: drop-shadow(0 0 6px var(--liq));
    }
    .ss-bat-glow .case {
      filter: drop-shadow(0 0 4px var(--liq));
    }
    @media (prefers-reduced-motion: reduce) {
      .wave,
      .surface-line,
      .bubbles circle {
        animation: none;
      }
      .bubbles {
        display: none;
      }
    }
  `;
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'solar-solution-battery',
  name: 'Solar-Solution — Battery status',
  preview: true,
  description: 'Liquid-fill battery: animated level, colour by SOC, charge bubbles.',
});
