import { DataDto, sunsynkPowerFlowCardConfig } from '../types';

/**
 * Builds the inline CSS-variable string that drives the glass card's ambient
 * aura and the power-reactive glow. The aura colour follows the dominant live
 * flow (solar / grid / battery), and several effects scale with overall system
 * activity so the card visibly "ramps up" under load.
 *
 * Returns '' when glow is disabled.
 */
export function ambientStyle(
  config: sunsynkPowerFlowCardConfig,
  data: DataDto,
): string {
  if (config.glow !== true) {
    return '';
  }

  const solarColour = config.solar?.colour ?? '#ffa500';
  const battColour = config.battery?.colour ?? '#ffc0cb';
  const gridColour = config.grid?.colour ?? '#5490c2';

  // Live magnitudes (watts). data fields are plain numbers.
  const solar = Math.max(0, data.totalPV ?? 0);
  const batt = Math.abs(data.batteryPower ?? 0);
  const grid = Math.abs(data.gridPower ?? 0);

  const sources = [
    { p: solar, c: solarColour },
    { p: grid, c: gridColour },
    { p: batt, c: battColour },
  ].sort((a, b) => b.p - a.p);

  const primary = sources[0].p > 0 ? sources[0].c : solarColour;
  const secondary = sources[1].p > 0 ? sources[1].c : gridColour;

  // Activity 0..1 from the dominant flow relative to its configured max.
  const ref = Math.max(
    Number(config.solar?.max_power) || 0,
    Number(config.grid?.max_power) || 0,
    Number(config.battery?.max_power) || 0,
    2000,
  );
  const activity = Math.max(0, Math.min(1, sources[0].p / ref));

  // Pulse waves speed up as activity rises (3.4s idle -> 1.4s busy).
  const pulseDur = (3.4 - activity * 2).toFixed(2);

  return [
    `--ss-c-solar:${solarColour}`,
    `--ss-c-batt:${battColour}`,
    `--ss-c-grid:${gridColour}`,
    `--ss-ambient-1:${primary}`,
    `--ss-ambient-2:${secondary}`,
    `--ss-activity:${activity.toFixed(3)}`,
    `--ss-pulse-dur:${pulseDur}s`,
  ].join(';');
}
