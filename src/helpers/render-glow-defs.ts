import { svg } from 'lit';

/**
 * Renders the SVG <defs> containing the neon-glow filters used by the
 * opt-in "glow" flow effects. Each filter blurs a copy of the source
 * graphic and merges it back underneath, so the bloom takes on the
 * element's own stroke/fill colour (giving every flow its own neon hue).
 *
 * Returns an empty fragment when glow is disabled so non-glow users pay
 * no cost.
 *
 * @param enabled - Whether glow effects are enabled.
 * @param intensity - Glow strength multiplier (defaults to 2).
 */
export const renderGlowDefs = (enabled: boolean, intensity: number = 2) => {
  if (!enabled) {
    return svg``;
  }

  const k = Number.isFinite(intensity) && intensity > 0 ? intensity : 2;
  // Tame blur radii so the bloom is striking but doesn't smear the diagram.
  const lineBlur = Math.min(1 + k * 0.6, 4).toFixed(2);
  const dotBlur = Math.min(1.4 + k * 0.9, 6).toFixed(2);
  const nodeBlur = Math.min(1 + k * 0.8, 5).toFixed(2);

  return svg`
		<defs>
			<filter id="ss-glow-line" x="-60%" y="-60%" width="220%" height="220%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="${lineBlur}" result="b" />
				<feMerge>
					<feMergeNode in="b" />
					<feMergeNode in="b" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
			<filter id="ss-glow-dot" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="${dotBlur}" result="b" />
				<feMerge>
					<feMergeNode in="b" />
					<feMergeNode in="b" />
					<feMergeNode in="b" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
			<filter id="ss-glow-node" x="-80%" y="-80%" width="260%" height="260%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="${nodeBlur}" result="b" />
				<feMerge>
					<feMergeNode in="b" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>
	`;
};
