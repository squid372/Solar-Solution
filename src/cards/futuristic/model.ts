import { DataDto, sunsynkPowerFlowCardConfig } from '../../types';

export interface FzString {
  name: string;
  power: number;
}

/**
 * A compact, render-ready view-model for the futuristic card. All the messy
 * extraction from the data DTO happens here, so the renderer deals only with
 * plain numbers/strings (and a demo harness can hand-build one to iterate on
 * the visuals).
 */
export interface FuturisticModel {
  title?: string;
  theme: string;
  reducedMotion: boolean;

  // Hero headline
  selfSufficiency: number; // %
  netGridW: number; // + exporting, − importing

  // Nodes
  solarW: number;
  pvStrings: FzString[];
  batterySoc: number;
  batteryW: number; // magnitude
  batteryCharging: boolean;
  batteryValid: boolean;
  gridW: number; // magnitude
  gridImporting: boolean;
  loadW: number;
  inverterW: number;

  // Daily totals (kWh)
  dailySolar?: number;
  dailyLoad?: number;
  dailyImport?: number;
  dailyExport?: number;

  // Environment
  batteryTemp?: number;
  acTemp?: number;
  dcTemp?: number;
  frequency?: number;
  acVoltage?: number;

  // Status / extra readouts
  runStatus?: string;
  gridSignal?: string;
  batteryCapacityAh?: number;
  batteryEfficiency?: number;
  batteryVoltage?: number;
  batteryCurrent?: number;
  batterySoh?: number;
  batteryStatusMsg?: string;
  solarSell?: string;
  maxSellW?: number;
  lifetimePV?: number;
  envTemp?: number;
  prepaidKwh?: number;

  // Colours
  solarColour: string;
  batteryColour: string;
  gridColour: string;
  loadColour: string;

  // Sky (0 = night … 1 = noon)
  sunElevation: number;
  isNight: boolean;
  weather: 'clear' | 'clouds' | 'rain' | 'snow' | 'fog' | 'storm';
  cloudiness: number; // 0 … 1
}

// Normalise a HA weather condition string into our render buckets.
function normWeather(cond: string): FuturisticModel['weather'] {
  const c = (cond || '').toLowerCase();
  if (/pour|rain|hail|drizzle/.test(c)) return 'rain';
  if (/snow|sleet/.test(c)) return 'snow';
  if (/fog|mist|haz/.test(c)) return 'fog';
  if (/light|thunder|storm|exceptional/.test(c)) return 'storm';
  if (/cloud|overcast/.test(c)) return 'clouds';
  return 'clear';
}

const safeNum = (v: unknown, d = 0): number => {
  const n = typeof v === 'number' ? v : parseFloat(v as string);
  return Number.isFinite(n) ? n : d;
};

// Read a CustomEntity-ish value only when it's valid.
const maybe = (e: any, dp = 1): number | undefined =>
  e && typeof e.isValid === 'function' && e.isValid()
    ? e.toNum(dp)
    : undefined;

export function buildFuturisticModel(
  config: sunsynkPowerFlowCardConfig,
  data: DataDto,
  hass?: any,
): FuturisticModel {
  const invertBat = config.battery?.invert_flow === true;
  const batteryPower = safeNum((data as any).batteryPowerTotal);
  const batteryCharging = invertBat ? batteryPower > 0 : batteryPower < 0;

  const grid = safeNum((data as any).totalGridPower);
  const gridImporting = grid > 0;

  const autarky = (config.inverter as any)?.autarky;
  const selfSuff =
    autarky === 'energy'
      ? safeNum((data as any).autarkyEnergy)
      : safeNum((data as any).autarkyPower);

  const pvWatts = [
    (data as any).pv1PowerWatts,
    (data as any).pv2PowerWatts,
    (data as any).pv3PowerWatts,
    (data as any).pv4PowerWatts,
    (data as any).pv5PowerWatts,
    (data as any).pv6PowerWatts,
  ];
  const declared = safeNum(config.solar?.mppts, 0);
  const mppts =
    declared || pvWatts.filter((w) => Number.isFinite(safeNum(w, NaN))).length;
  const pvStrings: FzString[] = [];
  for (let i = 0; i < Math.min(mppts || 0, 6); i++) {
    pvStrings.push({ name: `PV${i + 1}`, power: safeNum(pvWatts[i]) });
  }

  // ---- Sky: prefer a real sun entity, else fall back to local time. ----
  const states = hass?.states ?? {};
  // Read a numeric / string state straight from an entity id.
  const sNum = (id?: string): number | undefined => {
    const n = id ? parseFloat(states[id]?.state) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };
  const sStr = (id?: string): string | undefined => {
    const s = id ? states[id]?.state : undefined;
    return s && !['unknown', 'unavailable', ''].includes(s) ? s : undefined;
  };
  const sunId =
    (config as any).sun_entity || (states['sun.sun'] ? 'sun.sun' : undefined);
  const sunEnt = sunId ? states[sunId] : undefined;
  const elevation = sunEnt ? parseFloat(sunEnt.attributes?.elevation) : NaN;

  let hr = 12;
  if (typeof Date !== 'undefined') {
    const now = new Date();
    hr = now.getHours() + now.getMinutes() / 60;
  }

  let sunElevation: number;
  let isNight: boolean;
  if (Number.isFinite(elevation)) {
    sunElevation = Math.max(0, Math.min(1, elevation / 35));
    isNight = sunEnt?.state === 'below_horizon' || elevation < 0;
  } else {
    sunElevation = Math.max(0, Math.sin(((hr - 6) / 12) * Math.PI));
    isNight = hr < 6.5 || hr >= 18.5;
  }

  // ---- Weather: from a configured entity, else the first weather.* entity. ----
  const weatherId =
    (config as any).weather_entity ||
    Object.keys(states).find((k) => k.startsWith('weather.'));
  const weatherEnt = weatherId ? states[weatherId] : undefined;
  const weather = normWeather(weatherEnt?.state ?? '');
  const cover = parseFloat(weatherEnt?.attributes?.cloud_coverage);
  const cloudiness = Number.isFinite(cover)
    ? Math.max(0, Math.min(1, cover / 100))
    : weather === 'clear'
      ? 0
      : weather === 'clouds'
        ? 0.65
        : 0.9;

  return {
    title: config.title,
    theme: (config as any).glow_theme ?? 'neon',
    reducedMotion:
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,

    selfSufficiency: Math.max(0, Math.min(100, selfSuff)),
    netGridW: -grid,

    solarW: safeNum((data as any).totalPV),
    pvStrings,
    batterySoc: (data as any).stateBatterySoc?.toNum?.() ?? 0,
    batteryW: Math.abs(batteryPower),
    batteryCharging,
    batteryValid: (data as any).stateBatterySoc?.isValid?.() ?? false,
    gridW: Math.abs(grid),
    gridImporting,
    loadW: safeNum((data as any).essentialPower),
    inverterW:
      safeNum((data as any).autoScaledInverterPower) ||
      safeNum((data as any).essentialPower),

    dailySolar: maybe((data as any).stateDayPVEnergy),
    dailyLoad: maybe((data as any).stateDayLoadEnergy),
    dailyImport: maybe((data as any).stateDayGridImport),
    dailyExport: maybe((data as any).stateDayGridExport),

    batteryTemp: maybe((data as any).stateBatteryTemp),
    acTemp: maybe((data as any).stateRadiatorTemp),
    dcTemp: maybe((data as any).stateDCTransformerTemp),
    frequency: maybe((data as any).loadFrequency, 2),
    acVoltage: maybe((data as any).inverterVoltage, 0),

    runStatus: (() => {
      const id = (config.entities as any)?.inverter_status_59;
      const s = id ? states[id]?.state : undefined;
      return s && !['unknown', 'unavailable', ''].includes(s) ? s : undefined;
    })(),
    gridSignal: (data as any).gridStatus,
    batteryCapacityAh: (() => {
      const id = (config.entities as any)?.battery_rated_capacity;
      const n = id ? parseFloat(states[id]?.state) : NaN;
      return Number.isFinite(n) ? n : undefined;
    })(),
    batteryEfficiency: (() => {
      const id = (config.entities as any)?.battery_efficiency;
      const n = id ? parseFloat(states[id]?.state) : NaN;
      return Number.isFinite(n) ? n : undefined;
    })(),
    batteryVoltage: sNum((config.entities as any)?.battery_voltage_183),
    batteryCurrent: sNum((config.entities as any)?.battery_current_191),
    batterySoh: sNum((config.entities as any)?.battery_soh),
    batteryStatusMsg: sStr((config.entities as any)?.battery_status),
    solarSell: sStr((config.entities as any)?.solar_sell_247),
    maxSellW: sNum((config.entities as any)?.max_sell_power),
    lifetimePV: sNum((config.entities as any)?.total_pv_generation),
    envTemp: sNum((config.entities as any)?.environment_temp),
    prepaidKwh: sNum((config.entities as any)?.prepaid_units),

    solarColour: (data as any).solarColour || '#ffb300',
    batteryColour: (data as any).batteryColour || '#ff5fa2',
    gridColour: (data as any).gridColour || '#5490c2',
    loadColour: (data as any).loadColour || '#5fb6ad',

    sunElevation,
    isNight,
    weather,
    cloudiness,
  };
}
