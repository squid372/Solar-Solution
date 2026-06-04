import { html, css, LitElement, TemplateResult } from 'lit';
import {
  fireEvent,
  HomeAssistant,
  LovelaceCardEditor,
} from 'custom-card-helpers';

import {
  AutarkyType,
  InverterModel,
  sunsynkPowerFlowCardConfig,
} from './types';
import { customElement, property } from 'lit/decorators.js';
import { localize } from './localize/localize';
import defaults from './defaults';
import { EDITOR_NAME } from './const';
import { LovelaceConfig } from 'custom-card-helpers/src/types';

// Local replacement for lodash's `capitalize` (first char upper, rest lower)
// to avoid pulling in the entire lodash package for a single function.
const capitalize = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

@customElement(EDITOR_NAME)
export class SunSynkCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property() public hass!: HomeAssistant;
  @property() private _config!: sunsynkPowerFlowCardConfig;
  @property() lovelace?: LovelaceConfig;

  // Cache for performance
  private _cachedSanitizedConfig?: sunsynkPowerFlowCardConfig;
  private _configVersion = 0;
  private _lastCachedVersion = -1;

  private static readonly _labelCache = new Map<string, string>();

  // Static color name mapping (avoid recreating on every call)
  private static readonly COLOR_NAME_MAP: Record<string, string> = {
    grey: '#9e9e9e',
    gray: '#9e9e9e',
    pink: '#ffc0cb',
    orange: '#ffa500',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    purple: '#800080',
    black: '#000000',
    white: '#ffffff',
  };

  // Precompiled regex patterns for helper text matching (avoid recreating on every call)
  private static readonly PATTERN_LOAD_NAME = /^load\d+_name$/;
  private static readonly PATTERN_LOAD_ICON = /^load\d+_icon$/;
  private static readonly PATTERN_LOAD_SWITCH = /^load\d+_switch$/;
  private static readonly PATTERN_LOAD_THRESHOLD = /^load\d+_max_threshold$/;
  private static readonly PATTERN_AUX_LOAD_NAME = /^aux_load\d+_name$/;
  private static readonly PATTERN_AUX_LOAD_ICON = /^aux_load\d+_icon$/;
  private static readonly PATTERN_PV_NAME = /^pv[1-6]_name$/;
  private static readonly PATTERN_SHOW_SECTION =
    /^show_(inverter|battery|battery2|solar|load|grid)$/;
  private static readonly PATTERN_SHOW_DAILY = /^show_daily(_.*)?$/;
  private static readonly PATTERN_ANY_NAME = /^.*_name$/;
  private static readonly PATTERN_DYNAMIC_ICON = /dynamic_icon$/;
  private static readonly PATTERN_ANY_SWITCH = /^.*_switch$/;
  private static readonly PATTERN_MAX_THRESHOLD = /^.*_max_threshold$/;
  private static readonly PATTERN_DYNAMIC_COLOUR = /dynamic_colour$/;
  private static readonly PATTERN_ANY_COLOUR = /^.*_colour$/;
  private static readonly PATTERN_OFF_COLOUR = /^.*_off_colour$/;
  private static readonly PATTERN_MAX_POWER = /^.*_max_power$/;

  // Precompiled regex for color normalization
  private static readonly PATTERN_COLOUR_SUFFIX = /colour$/i;
  private static readonly PATTERN_DYNAMIC_COLOUR_SUFFIX = /dynamic_colour$/i;

  // Static lookup for help text (faster than switch-case)
  private static readonly HELP_TEXT: Record<string, string> = {
    large_font: 'Use a larger font for card entities.',
    wide: 'Use a wide layout for the card.',
    glow_theme:
      'Colour theme for the futuristic HUD: neon, ice, fire, aurora or mono.',
    additional_loads: 'Number of additional loads to configure (0–6).',
    colour: 'Primary colour for this element.',
    efficiency:
      'Show the effeciency of the mppts strings based on their max power.',
    display_mode:
      'Chose how to display solar information next to the sun icon.',
    custom_label: 'Custom label shown in the UI.',
    label_daily_grid_buy: 'Label for daily grid buy.',
    label_daily_grid_sell: 'Label for daily grid sell.',
    count: 'Number of batteries to display.',
    energy: 'Total available energy of the battery in Wh.',
    shutdown_soc: 'State of charge below which the battery is considered off.',
    shutdown_soc_offgrid:
      'State of charge below which the battery is considered off when off-grid.',
    soc_end_of_charge:
      'State of charge at which the battery is considered fully charged.',
    invert_power: 'Invert the direction of power flow animation.',
    hide_soc: 'Hide additional current program capacity (SOC) or shutdown SOC.',
    show_absolute: 'Show absolute values for power.',
    show_remaining_energy: 'Show remaining energy of the battery.',
    remaining_energy_to_shutdown:
      'Show remaining energy of the battery until it shuts down.',
    invert_flow: 'Invert the direction of power flow.',
    linear_gradient: 'Display battery SOC as a linear gradient.',
    invert_load:
      'Set to true if your sensor provides a negative number when the load is drawing power',
    modern: 'Change inverter icon.',
    invert_grid:
      'Enable if your sensor provides a negative number for grid import and positive number for grid export.',
    aux_loads: 'Number of auxiliary loads to configure (0–2).',
    show_nonessential: 'Show non-essential loads.',
    show_aux:
      'Show the Aux subsection (separate auxiliary load configuration).',
    label_daily_load:
      'Alternate label for the daily load value displayed under Load.',
    label_daily_chrg:
      'Alternate label for the daily charge value displayed under Battery.',
    label_daily_dischrg:
      'Alternate label for the daily discharge value displayed under Battery.',
    label_autarky:
      'Alternate label for the autarky value displayed under Inverter.',
    label_ratio: 'Alternat label for the ratio value displayed under Inverter.',
    navigate: 'Optional navigation path to open when the icon is clicked.',
    import_icon:
      'Icon shown for the import flow. Can be set using a template sensor.',
    export_icon:
      'Icon shown for the export flow. Can be set using a template sensor.',
    disconnected_icon:
      'Icon shown when the grid is disconnected. Can be set using a template sensor.',
    aux_name: 'Aux group title shown in the UI.',
    aux_daily_name: 'Label used for daily Aux value.',
    aux_type: 'Icon shown for the Aux group.',
    invert_aux: 'Invert the direction of Aux flow arrows.',
    show_absolute_aux: 'Show Aux values as absolute (no sign) for clarity.',
    aux_dynamic_colour:
      'Aux elements on the card will be greyed out if aux power is 0.',
    aux_colour: 'Primary colour for Aux flow.',
    aux_off_colour: 'Colour used when Aux path is off/idle.',
    show_daily_aux: 'Display daily Aux energy beneath the Aux section.',
    decimal_places: 'Number of decimal places for power values (0-3).',
    decimal_places_energy: 'Number of decimal places for energy values (0-3).',
    soc_decimal_places: 'Decimal places for State of Charge display (0-3).',
    dynamic_line_width:
      'Animate line widths based on power level. Disable for a flatter look.',
    animation_speed: 'Adjusts the speed of flow animations. Higher = faster.',
    off_threshold: 'Below this power value the path is considered off/idle.',
    path_threshold:
      'The colour of the path will change to the source colour if the percentage supply by a single source equals or exceeds this value.',
    max_power: 'Optional cap used for scaling and progress calculations.',
    title_size: "CSS font-size for title, e.g. '1.2em' or '18px'.",
    card_height:
      'Card height: text value (e.g. 360) or an entity providing a numeric height.',
    card_width:
      'Card width: text value (e.g. 640) or an entity providing a numeric width.',
    center_no_grid:
      'When Grid is hidden, shift and narrow the view to center Solar/Battery/Loads.',
  };

  // Utility: Parse unknown to finite number
  private static _toFiniteNum(x: unknown): number | undefined {
    if (typeof x === 'number' && Number.isFinite(x)) return x;
    if (typeof x === 'string' && x.trim() !== '') {
      const n = Number(x);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  }

  // Utility: Clamp to 0-255 range
  private static _clamp255(n: number): number {
    return Math.max(0, Math.min(255, Math.round(n)));
  }

  static get styles() {
    return css`
      :host {
        display: block;
        box-sizing: border-box;
        width: 100%;
        max-width: 100%;
      }
      ha-form {
        width: 100%;
      }
      /* No global grid column override; Entities section is scoped via schema */
    `;
  }

  // Provide helper text hints in the editor form
  private _computeHelperCallback = (data: unknown): string | undefined => {
    // ha-form may call this for group/expandable items or items without a name
    if (!data || typeof data !== 'object') return undefined;
    const name = (data as { name?: string }).name;
    if (!name) return undefined;

    /*
		// Localization (commented out until help text is added to language files)
		const key = `config.helper.${name}`;
		try {
			const localized = localize(key);
			if (localized && localized !== key) return localized;
		} catch {
			// fall through to defaults below when localization lookup fails
		}
		*/

    // Pattern-based helper hints for dynamic load/aux subfields
    if (SunSynkCardEditor.PATTERN_LOAD_NAME.test(name))
      return 'Label for additional load.';
    if (SunSynkCardEditor.PATTERN_LOAD_ICON.test(name))
      return 'Additional load icon (Can be set via template sensor).';
    if (SunSynkCardEditor.PATTERN_LOAD_SWITCH.test(name))
      return 'Switch entity to control this additional load (optional).';
    if (SunSynkCardEditor.PATTERN_LOAD_THRESHOLD.test(name))
      return 'Set the threshold that will activate the Max Colour.';
    if (SunSynkCardEditor.PATTERN_AUX_LOAD_NAME.test(name))
      return 'Label for auxiliary load.';
    if (SunSynkCardEditor.PATTERN_AUX_LOAD_ICON.test(name))
      return 'Icon will be used for this auxiliary load.';

    // Global patterns across sections (safe and generic)
    if (SunSynkCardEditor.PATTERN_PV_NAME.test(name))
      return 'Custom label for a PV input.';
    if (name === 'mppts')
      return 'Number of MPPT inputs available on your inverter.';
    if (name === 'three_phase')
      return 'Enable if your system/card should display in three-phase mode.';
    if (SunSynkCardEditor.PATTERN_SHOW_SECTION.test(name))
      return 'Show or hide this section in the card.';
    if (SunSynkCardEditor.PATTERN_SHOW_DAILY.test(name))
      return 'Display daily energy on the card.';
    if (name === 'auto_scale')
      return 'Automatically scale values based on recent ranges.';
    if (SunSynkCardEditor.PATTERN_ANY_NAME.test(name))
      return 'Custom label shown in the UI.';
    if (SunSynkCardEditor.PATTERN_DYNAMIC_ICON.test(name))
      return 'The icon will change to represent power source.';
    if (SunSynkCardEditor.PATTERN_ANY_SWITCH.test(name))
      return 'Optional switch entity to control this element.';
    if (SunSynkCardEditor.PATTERN_MAX_THRESHOLD.test(name))
      return 'Maximum threshold used for progress/flow scaling.';
    // Must come before the generic *_colour rule; match both 'dynamic_colour' and '*_dynamic_colour'
    if (SunSynkCardEditor.PATTERN_DYNAMIC_COLOUR.test(name))
      return 'Change colour dynamically based on power level.';
    if (SunSynkCardEditor.PATTERN_ANY_COLOUR.test(name))
      return 'Primary colour for this element.';
    if (SunSynkCardEditor.PATTERN_OFF_COLOUR.test(name))
      return 'Colour used when the element is off/idle.';
    if (SunSynkCardEditor.PATTERN_MAX_POWER.test(name))
      return 'Optional cap used for scaling and progress calculations.';

    // Static lookups (O(1))
    if (name === 'max_line_width' || name === 'min_line_width') {
      const min = Number(this._config?.min_line_width ?? 1);
      const max = Number(this._config?.max_line_width ?? 1);
      if (min > max)
        return 'Warning: min_line_width is greater than max_line_width.';
      return name === 'max_line_width'
        ? 'Maximum dynamic line width (1-8).'
        : 'Minimum dynamic line width (1-8).';
    }

    return SunSynkCardEditor.HELP_TEXT[name];
  };

  // Humanize a schema name like "inverter_voltage_154" -> "Inverter Voltage 154"
  private _prettyLabel(name: string): string {
    const cached = SunSynkCardEditor._labelCache.get(name);
    if (cached) return cached;
    const result = name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    SunSynkCardEditor._labelCache.set(name, result);
    return result;
  }

  // Safe localize with fallback (treat 'unknown'/'undefined' as missing)
  private _t(key: string, fallback: string): string {
    try {
      const v = localize(key);
      if (typeof v === 'string') {
        const lower = v.toLowerCase();
        if (v && v !== key && lower !== 'unknown' && lower !== 'undefined') {
          return v;
        }
      }
    } catch {
      // fall through to fallback
    }
    return fallback;
  }

  // Map common CSS color names to hex; accept string, {r,g,b} object, or [r,g,b] array; return undefined if invalid
  private _normalizeColor(value?: unknown): string | undefined {
    if (value == null) return undefined;
    // If provided as an object or array with r,g,b channels (numbers or numeric strings)
    if (typeof value === 'object') {
      let r: unknown;
      let g: unknown;
      let b: unknown;
      if (Array.isArray(value) && value.length >= 3) {
        [r, g, b] = value as unknown[];
      } else {
        const v = value as Record<string, unknown>;
        r = v.r;
        g = v.g;
        b = v.b;
      }
      const rr = SunSynkCardEditor._toFiniteNum(r);
      const gg = SunSynkCardEditor._toFiniteNum(g);
      const bb = SunSynkCardEditor._toFiniteNum(b);
      if (rr === undefined || gg === undefined || bb === undefined)
        return undefined;
      const toHex = (n: number) =>
        SunSynkCardEditor._clamp255(n).toString(16).padStart(2, '0');
      return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`;
    }
    if (typeof value !== 'string') return undefined;
    const hex = value.trim();
    const lower = hex.toLowerCase();
    const fromMap = SunSynkCardEditor.COLOR_NAME_MAP[lower];
    let candidate = fromMap ?? hex;
    // Expand #rgb shorthand to #rrggbb
    const m = /^#([0-9a-f]{3})$/i.exec(candidate);
    if (m) {
      const [r, g, b] = m[1].split('');
      candidate = `#${r}${r}${g}${g}${b}${b}`;
    }
    return /^#([0-9a-f]{6})$/i.test(candidate) ? candidate : undefined;
  }

  // Convert supported inputs into [r, g, b] array for ha-form color_rgb
  private _toRgb(value?: unknown): [number, number, number] | undefined {
    if (value == null) return undefined;

    // Array [r,g,b]
    if (Array.isArray(value) && value.length >= 3) {
      const [r, g, b] = value as unknown[];
      const rr = SunSynkCardEditor._toFiniteNum(r);
      const gg = SunSynkCardEditor._toFiniteNum(g);
      const bb = SunSynkCardEditor._toFiniteNum(b);
      if (rr == null || gg == null || bb == null) return undefined;
      return [
        SunSynkCardEditor._clamp255(rr),
        SunSynkCardEditor._clamp255(gg),
        SunSynkCardEditor._clamp255(bb),
      ];
    }

    // Object { r,g,b }
    if (typeof value === 'object') {
      const v = value as Record<string, unknown>;
      const rr = SunSynkCardEditor._toFiniteNum(v.r);
      const gg = SunSynkCardEditor._toFiniteNum(v.g);
      const bb = SunSynkCardEditor._toFiniteNum(v.b);
      if (rr != null && gg != null && bb != null) {
        return [
          SunSynkCardEditor._clamp255(rr),
          SunSynkCardEditor._clamp255(gg),
          SunSynkCardEditor._clamp255(bb),
        ];
      }
    }

    // String: hex name or rgb(..)
    if (typeof value === 'string') {
      const s = value.trim();
      // rgb(a) pattern
      const m =
        /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(s);
      if (m) {
        return [
          SunSynkCardEditor._clamp255(Number(m[1])),
          SunSynkCardEditor._clamp255(Number(m[2])),
          SunSynkCardEditor._clamp255(Number(m[3])),
        ];
      }
      const hex = this._normalizeColor(s);
      if (!hex) return undefined;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    }
    return undefined;
  }

  // Produce a safe CSS color for preview chips from any input
  private _toCssColor(value?: unknown): string | undefined {
    if (value == null) return undefined;
    // Allow CSS variables directly
    if (typeof value === 'string' && value.trim().startsWith('var(')) {
      return value.trim();
    }
    // Prefer hex if we can normalize
    const hex = this._normalizeColor(value);
    if (hex) return hex;
    // Fallback: if it's a string (named color), let the browser try it
    if (typeof value === 'string') return value;
    return undefined;
  }

  // Safely extract a string value from an object by key
  private static _getStr(obj: unknown, key: string): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const val = (obj as Record<string, unknown>)[key];
    return typeof val === 'string' ? val : undefined;
  }

  // Shared color normalization visitor - recursively converts colour values to hex strings
  private _normalizeColorsInObject(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj;
    if (!obj || typeof obj !== 'object') return obj;
    const rec = obj as Record<string, unknown>;
    for (const [k, val] of Object.entries(rec)) {
      if (
        typeof k === 'string' &&
        SunSynkCardEditor.PATTERN_COLOUR_SUFFIX.test(k) &&
        !SunSynkCardEditor.PATTERN_DYNAMIC_COLOUR_SUFFIX.test(k)
      ) {
        rec[k] = this._normalizeColor(val) ?? undefined;
      } else if (val && typeof val === 'object') {
        rec[k] = this._normalizeColorsInObject(val) as unknown;
      }
    }
    return rec;
  }

  // Helper to convert colour fields in a section to RGB format for ha-form
  private _convertSectionColours(
    section: Record<string, unknown> | undefined,
    colourFields: string[],
  ): Record<string, unknown> | undefined {
    if (!section) return undefined;
    const result = { ...section };
    for (const field of colourFields) {
      result[field] = this._toRgb(section[field]) ?? undefined;
    }
    return result;
  }

  // Return a sanitized config so ha-form color_rgb selectors receive proper [r,g,b] values
  private _sanitizedConfig(): sunsynkPowerFlowCardConfig {
    // Return cached version if config hasn't changed
    if (
      this._cachedSanitizedConfig &&
      this._lastCachedVersion === this._configVersion
    ) {
      return this._cachedSanitizedConfig;
    }

    const c = this._config;
    const copy: Record<string, unknown> = {
      ...(this._config as unknown as Record<string, unknown>),
    };

    // top-level title colour as RGB object
    copy.title_colour =
      this._toRgb((c as unknown as Record<string, unknown>)['title_colour']) ??
      undefined;

    // Convert section colours to RGB format
    copy.inverter = this._convertSectionColours(
      c.inverter as Record<string, unknown>,
      ['colour'],
    );
    copy.solar = this._convertSectionColours(
      c.solar as Record<string, unknown>,
      ['colour'],
    );
    copy.battery = this._convertSectionColours(
      c.battery as Record<string, unknown>,
      ['colour', 'charge_colour'],
    );
    copy.battery2 = this._convertSectionColours(
      c.battery2 as Record<string, unknown>,
      ['colour', 'charge_colour'],
    );
    copy.load = this._convertSectionColours(c.load as Record<string, unknown>, [
      'colour',
      'off_colour',
      'max_colour',
      'aux_colour',
      'aux_off_colour',
    ]);
    copy.grid = this._convertSectionColours(c.grid as Record<string, unknown>, [
      'colour',
      'no_grid_colour',
      'export_colour',
      'grid_off_colour',
    ]);

    // Cache the result
    this._cachedSanitizedConfig = copy as unknown as sunsynkPowerFlowCardConfig;
    this._lastCachedVersion = this._configVersion;

    return this._cachedSanitizedConfig;
  }

  public setConfig(config: sunsynkPowerFlowCardConfig): void {
    // Migrate any existing *_colour arrays/objects in incoming config to hex strings
    const clone = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
    this._normalizeColorsInObject(clone);
    this._config = {
      ...defaults,
      ...this._config,
      ...(clone as unknown as sunsynkPowerFlowCardConfig),
    };
    this._configVersion++;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const themeOptions = [
      { value: 'neon', label: 'Neon' },
      { value: 'ice', label: 'Ice' },
      { value: 'fire', label: 'Fire' },
      { value: 'aurora', label: 'Aurora' },
      { value: 'mono', label: 'Mono' },
    ];
    const ent = (name: string) => ({ name, selector: { entity: {} } });
    const bool = (name: string) => ({ name, selector: { boolean: {} } });
    const num = (name: string, max: number) => ({
      name,
      selector: { number: { min: 0, max, step: 1, mode: 'box' } },
    });
    const pick = (name: string, options: string[]) => ({
      name,
      selector: {
        select: {
          options: options.map((x) => ({ label: capitalize(x), value: x })),
        },
      },
    });

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._sanitizedConfig()}
        .computeLabel=${this._computeLabelCallback.bind(this)}
        .computeHelper=${this._computeHelperCallback.bind(this)}
        .schema=${[
          {
            type: 'expandable',
            title: 'Card',
            expanded: true,
            schema: [
              {
                type: 'grid',
                schema: [
                  { name: 'title', selector: { text: {} } },
                  {
                    name: 'glow_theme',
                    selector: {
                      select: { mode: 'dropdown', options: themeOptions },
                    },
                  },
                  ent('sun_entity'),
                  ent('weather_entity'),
                  num('decimal_places', 3),
                ],
              },
              {
                type: 'grid',
                schema: [
                  bool('show_solar'),
                  bool('show_battery'),
                  bool('show_grid'),
                ],
              },
            ],
          },
          {
            type: 'expandable',
            title: 'Inverter',
            schema: [
              {
                name: 'inverter',
                type: 'grid',
                schema: [
                  pick('model', Object.values(InverterModel)),
                  pick('autarky', Object.values(AutarkyType)),
                  bool('auto_scale'),
                ],
              },
              {
                name: 'entities',
                type: 'grid',
                schema: [
                  ent('inverter_power_175'),
                  ent('inverter_status_59'),
                  ent('inverter_voltage_154'),
                  ent('inverter_current_164'),
                  ent('load_frequency_192'),
                  ent('radiator_temp_91'),
                  ent('dc_transformer_temp_90'),
                  ent('environment_temp'),
                ],
              },
            ],
          },
          {
            type: 'expandable',
            title: 'Solar',
            schema: [
              {
                name: 'solar',
                type: 'grid',
                schema: [
                  {
                    name: 'mppts',
                    selector: {
                      number: { min: 1, max: 6, step: 1, mode: 'box' },
                    },
                  },
                  bool('dynamic_colour'),
                  { name: 'colour', selector: { color_rgb: {} } },
                ],
              },
              {
                name: 'entities',
                type: 'grid',
                schema: [
                  ent('pv1_power_186'),
                  ent('pv2_power_187'),
                  ent('pv3_power_188'),
                  ent('pv4_power_189'),
                  ent('pv5_power'),
                  ent('pv6_power'),
                  ent('day_pv_energy_108'),
                  ent('total_pv_generation'),
                  ent('solar_sell_247'),
                  ent('max_sell_power'),
                ],
              },
            ],
          },
          {
            type: 'expandable',
            title: 'Battery',
            schema: [
              {
                name: 'battery',
                type: 'grid',
                schema: [
                  num('shutdown_soc', 100),
                  bool('invert_power'),
                  bool('dynamic_colour'),
                  { name: 'colour', selector: { color_rgb: {} } },
                ],
              },
              {
                name: 'entities',
                type: 'grid',
                schema: [
                  ent('battery_soc_184'),
                  ent('battery_power_190'),
                  ent('battery_voltage_183'),
                  ent('battery_current_191'),
                  ent('battery_temp_182'),
                  ent('battery_rated_capacity'),
                  ent('battery_efficiency'),
                  ent('battery_soh'),
                  ent('battery_status'),
                ],
              },
            ],
          },
          {
            type: 'expandable',
            title: 'Grid',
            schema: [
              {
                name: 'grid',
                type: 'grid',
                schema: [
                  bool('invert_grid'),
                  bool('dynamic_colour'),
                  { name: 'colour', selector: { color_rgb: {} } },
                ],
              },
              {
                name: 'entities',
                type: 'grid',
                schema: [
                  ent('grid_power_169'),
                  ent('grid_ct_power_172'),
                  ent('grid_voltage'),
                  ent('grid_connected_status_194'),
                  ent('day_grid_import_76'),
                  ent('day_grid_export_77'),
                  ent('prepaid_units'),
                ],
              },
            ],
          },
          {
            type: 'expandable',
            title: 'Home / Load',
            schema: [
              {
                name: 'load',
                type: 'grid',
                schema: [
                  bool('dynamic_colour'),
                  { name: 'colour', selector: { color_rgb: {} } },
                ],
              },
              {
                name: 'entities',
                type: 'grid',
                schema: [ent('essential_power'), ent('day_load_energy_84')],
              },
            ],
          },
        ]}
        @value-changed=${this._valueChanged.bind(this)}
      ></ha-form>
    `;
  }

  // (header removed)

  private _emitConfig(config: sunsynkPowerFlowCardConfig): void {
    this._config = config;
    this._configVersion++;
    // Clear cache when config changes
    this._cachedSanitizedConfig = undefined;
    this._lastCachedVersion = -1;
    fireEvent(this, 'config-changed', { config });
  }

  // (header reset actions removed)

  private _withSuffix(base: string, condition: boolean): string {
    const key = condition ? 'config.inline.shown' : 'config.inline.hidden';
    const fallback = condition ? 'shown' : 'hidden';
    return `${base} (${this._t(key, fallback)})`;
  }

  private _computeLabelCallback = (data: {
    name?: string;
    label?: string;
    title?: string;
  }): string => {
    // For group/expandable items, prefer provided label/title if exists
    if (typeof data?.label === 'string' && data.label.trim()) return data.label;
    if (typeof data?.title === 'string' && data.title.trim()) return data.title;

    const name = typeof data?.name === 'string' ? data.name : '';
    if (!name) return '';
    // Base label from i18n with graceful fallback
    const base = this._t(`config.${name}`, this._prettyLabel(name));

    const cfg = this._config as unknown as Record<string, unknown>;
    switch (name) {
      case 'show_solar':
        return this._withSuffix(base, Boolean(cfg.show_solar));
      case 'show_battery':
        return this._withSuffix(base, Boolean(cfg.show_battery));
      case 'show_grid':
        return this._withSuffix(base, Boolean(cfg.show_grid));
      case 'dynamic_line_width': {
        const on = Boolean(cfg.dynamic_line_width);
        if (!on) {
          return `${base} (${this._t('config.inline.disabled', 'disabled')})`;
        }
        const max = cfg.max_line_width as number | undefined;
        const min = cfg.min_line_width as number | undefined;
        if (typeof max === 'number' && typeof min === 'number') {
          return `${base} (min ${min} – max ${max})`;
        }
        return `${base} (${this._t('config.inline.enabled', 'enabled')})`;
      }
      case 'three_phase': {
        const on = Boolean(
          cfg?.inverter &&
          (cfg.inverter as Record<string, unknown>).three_phase,
        );
        const v = on ? '3P' : '1P';
        return `${base} (${v})`;
      }
      default:
        return base;
    }
  };

  private _title(opt) {
    // Use the same robust fallback as _t to handle missing/invalid translations
    return this._t(`config.cat_title.${opt}`, opt);
  }

  private _valueChanged(ev: CustomEvent): void {
    // ha-form returns color_rgb as arrays or {r,g,b}; ensure all '*_colour' values become hex strings before emitting
    const v = ev.detail.value as Record<string, unknown>;
    // IMPORTANT: do NOT mutate v (the form's live value). Clone before normalization to avoid breaking the picker UI.
    const out = JSON.parse(JSON.stringify(v)) as Record<string, unknown>;
    this._normalizeColorsInObject(out);

    // Normalize dynamic line width values if present
    if (out && typeof out === 'object' && out.dynamic_line_width) {
      const clampInt = (
        n: unknown,
        min: number,
        max: number,
      ): number | undefined => {
        const num = SunSynkCardEditor._toFiniteNum(n);
        if (num !== undefined)
          return Math.max(min, Math.min(max, Math.round(num)));
        return undefined;
      };
      const max = clampInt(out.max_line_width, 1, 8);
      const min = clampInt(out.min_line_width, 1, 8);
      if (max !== undefined) out.max_line_width = max;
      if (min !== undefined) out.min_line_width = min;
      const curMax = out.max_line_width as number | undefined;
      const curMin = out.min_line_width as number | undefined;
      if (
        typeof curMin === 'number' &&
        typeof curMax === 'number' &&
        curMin > curMax
      ) {
        // If swapped, align min to max to keep consistent
        out.min_line_width = curMax;
      }
    }
    // Update local config and emit cloned hex-normalized config; this keeps the form's RGB value intact
    this._emitConfig(out as unknown as sunsynkPowerFlowCardConfig);
  }
}
