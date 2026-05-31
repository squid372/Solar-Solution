import { html, svg, render } from 'lit';
import { globalData } from '../src/helpers/globals';
import { renderGlowDefs } from '../src/helpers/render-glow-defs';
import { renderPVFlow } from '../src/components/shared/pv/render-pv-flow';
import { renderCircle } from '../src/helpers/render-circle';
import { renderPath } from '../src/helpers/render-path';
import { renderSocRing } from '../src/helpers/render-soc-ring';
import { styles } from '../src/style';

// Three representative flows: solar (orange), battery (pink), grid (blue).
const FLOWS = [
	{ id: 'pv', color: '#ffa500', d: 'M 60 40 C 140 40 140 110 220 110', dur: 2 },
	{ id: 'bat', color: '#ff5fa2', d: 'M 60 110 L 220 110', dur: 1.4 },
	{ id: 'grid', color: '#3fa9ff', d: 'M 60 180 C 140 180 140 110 220 110', dur: 2.6 },
];

// Build the flow group. Reads globalData.glow at call time, so toggle before calling.
function buildFlows() {
	return svg`
		${FLOWS.map((f) =>
			renderPVFlow(f.id, f.d, f.color, 3, 1000, f.dur, false, 1),
		)}
		<!-- a couple of full-card style path+circle flows too -->
		${renderPath('extra-line', 'M 220 110 L 260 110', true, '#5fb6ad', 3)}
		${renderCircle('extra-dot', 4, '#5fb6ad', 1.6, '0;1', '#extra-line')}
	`;
}

function panel(
	title: string,
	glow: boolean,
	opts: { theme?: string; activity?: number; charging?: boolean } = {},
) {
	const { theme = 'neon', activity = 0.7, charging = true } = opts;
	globalData.glow = glow;
	globalData.glowIntensity = 3;
	const flows = buildFlows();
	const nodes = svg`
		<circle cx="40" cy="40" r="14" fill="#ffa500" class="grid-icon" style="color:#ffa500"/>
		${renderSocRing(40, 110, 22, 72, '#ff5fa2', true, charging)}
		<circle cx="40" cy="110" r="14" fill="#ff5fa2" class="aux-icon" style="color:#ff5fa2"/>
		<circle cx="40" cy="180" r="14" fill="#3fa9ff" class="noness-icon" style="color:#3fa9ff"/>
		<circle cx="278" cy="110" r="16" fill="#5fb6ad" class="essload1-icon" style="color:#5fb6ad"/>
		${/* second battery ring (discharging) to demo dual-battery */ ''}
		${renderSocRing(278, 110, 24, 48, '#c08cff', true, false)}
	`;
	const ambientVars = glow
		? `--ss-c-solar:#ffa500;--ss-c-batt:#ff5fa2;--ss-c-grid:#3fa9ff;` +
			`--ss-ambient-1:#ffa500;--ss-ambient-2:#3fa9ff;` +
			`--ss-activity:${activity};--ss-pulse-dur:${(3.4 - activity * 2).toFixed(2)}s;`
		: '';
	const cls = glow ? `ss-glow ss-theme-${theme}` : '';
	return html`
		<figure class="panel">
			<figcaption>${title}</figcaption>
			<div class="container card ${cls}" style="${ambientVars}">
				<svg viewBox="0 0 300 220" width="380" height="280"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink">
					${renderGlowDefs(glow, 3)}
					${nodes}
					${flows}
				</svg>
			</div>
		</figure>
	`;
}

// Inject the card's real styles (CSSResult) plus demo chrome as a stylesheet.
const styleEl = document.createElement('style');
styleEl.textContent = `
	${(styles as unknown as { cssText: string }).cssText}
	body { margin: 0; background: #0c1018; color: #cfd6e4; font-family: system-ui, sans-serif; }
	.wrap { display: flex; gap: 32px; padding: 32px; flex-wrap: wrap; justify-content: center; }
	.panel { margin: 0; }
	figcaption { text-align: center; margin-bottom: 10px; font-size: 14px; letter-spacing: .5px; opacity: .85; }
	.card { background: #11161f; padding: 8px; }
`;
document.head.appendChild(styleEl);

const root = document.getElementById('app')!;
// Build OFF first (captures templates with glow=false), then themed ON panels.
const off = panel('Default (glow: false)', false);
const neon = panel('Neon · high activity · charging', true, {
	theme: 'neon',
	activity: 0.9,
	charging: true,
});
const ice = panel('Ice theme · low activity', true, {
	theme: 'ice',
	activity: 0.25,
	charging: false,
});
const fire = panel('Fire theme · charging', true, {
	theme: 'fire',
	activity: 0.6,
	charging: true,
});

render(html`<div class="wrap">${off}${neon}${ice}${fire}</div>`, root);
