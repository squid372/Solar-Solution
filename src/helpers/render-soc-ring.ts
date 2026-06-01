import { svg } from 'lit';
import { globalData } from './globals';

/**
 * Renders a glowing neon arc ring around the battery node that fills to the
 * current state-of-charge. Only drawn when glow effects are enabled.
 *
 * The arc uses pathLength=100 so stroke-dasharray maps directly to SOC %.
 * The group is rotated -90deg so the fill starts at 12 o'clock. CSS
 * (.ss-soc-ring / .ss-soc-arc) applies the glow filter and a gentle pulse.
 *
 * @param cx - Centre x of the ring.
 * @param cy - Centre y of the ring.
 * @param r - Ring radius.
 * @param soc - State of charge (0-100).
 * @param color - Stroke colour (battery colour).
 * @param show - Whether to render (e.g. SOC entity present/valid).
 * @param charging - When true, a rotating sweep is overlaid to signal charging.
 */
export function renderSocRing(
  cx: number,
  cy: number,
  r: number,
  soc: number,
  color: string,
  show: boolean = true,
  charging: boolean = false,
) {
  if (!globalData.glow || !globalData.socRing || !show) {
    return svg``;
  }

  const pct = Math.max(0, Math.min(100, Number.isFinite(soc) ? soc : 0));

  // While charging, a short bright arc orbits the ring to convey inflow.
  const sweep = charging
    ? svg`<circle class="ss-soc-sweep" cx="${cx}" cy="${cy}" r="${r}" fill="none"
				stroke="${color}" stroke-width="2.5" stroke-linecap="round"
				pathLength="100" stroke-dasharray="10 90"
				style="transform-origin:${cx}px ${cy}px" />`
    : svg``;

  return svg`
		<g class="ss-soc-ring${charging ? ' ss-soc-ring--charging' : ''}"
			transform="rotate(-90 ${cx} ${cy})" pointer-events="none">
			<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
				stroke="${color}" stroke-opacity="0.16" stroke-width="2.5" />
			<circle class="ss-soc-arc" cx="${cx}" cy="${cy}" r="${r}" fill="none"
				stroke="${color}" stroke-width="2.5" stroke-linecap="round"
				pathLength="100" stroke-dasharray="${pct} 100" />
			${sweep}
		</g>
	`;
}
