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

  // Colours
  solarColour: string;
  batteryColour: string;
  gridColour: string;
  loadColour: string;

  // Sky (0 = night … 1 = noon)
  sunElevation: number;
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

  // Sun elevation from local time: a smooth bell, 0 at 06:00/18:00, ~1 at noon.
  let sunElevation = 0.5;
  if (typeof Date !== 'undefined') {
    const now = new Date();
    const hr = now.getHours() + now.getMinutes() / 60;
    sunElevation = Math.max(0, Math.sin(((hr - 6) / 12) * Math.PI));
  }

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

    solarColour: (data as any).solarColour || '#ffb300',
    batteryColour: (data as any).batteryColour || '#ff5fa2',
    gridColour: (data as any).gridColour || '#5490c2',
    loadColour: (data as any).loadColour || '#5fb6ad',

    sunElevation,
  };
}
