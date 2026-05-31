import { svg } from 'lit';
import { Utils } from './utils';
import { globalData } from './globals';

/**
 * Renders an animated circle element.
 * @param id - The ID of the circle.
 * @param radius - The radius of the circle.
 * @param fill - The fill color of the circle.
 * @param duration - The duration of the animation in seconds.
 * @param keyPoints - The key points for the animation (e.g., "1;0" or "0;1").
 * @param mpathHref - The ID of the path to follow (e.g., "#bat-line").
 * @param invertFlow - Whether to invert the animation flow (optional, default: false).
 * @returns A Lit SVG template for the animated circle element.
 */
export const renderCircle = (
	id: string,
	radius: number,
	fill: string,
	duration: number,
	keyPoints: string,
	mpathHref: string,
	invertFlow: boolean = false,
) => {
	// If fill is transparent, skip rendering the animated dot entirely to avoid
	// running animations and triggering paints when power is zero or the flow is hidden.
	if (fill === 'transparent') {
		return svg``;
	}

	const finalKeyPoints = invertFlow
		? Utils.invertKeyPoints(keyPoints)
		: keyPoints;

	const motion = svg`
        <animateMotion dur="${duration}s" repeatCount="indefinite"
            keyPoints="${finalKeyPoints}"
            keyTimes="0;1" calcMode="linear">
            <mpath href="${mpathHref}"/>
        </animateMotion>`;

	// Plain dot (default look) when glow is disabled.
	if (!globalData.glow) {
		return svg`
        <circle id="${id}" cx="0" cy="0" r="${radius}" fill="${fill}">
            ${motion}
        </circle>
    `;
	}

	// Comet trail: ghost dots phase-offset behind the head, fading and
	// shrinking so the moving dot reads as a glowing comet.
	const trail = [
		{ r: radius * 0.75, o: 0.45, lag: 0.06 },
		{ r: radius * 0.5, o: 0.22, lag: 0.12 },
	];

	// Line overlays cloned from the flow path (mpathHref): a thin white-hot
	// core down the centre, plus a luminous pulse wave that sweeps the line.
	// CSS (.ss-flow-core / .ss-flow-pulse) styles + animates these; CSS wins
	// over the path's own stroke attribute. Pulse direction follows flow.
	const pulseClass = invertFlow ? 'ss-flow-pulse ss-flow-pulse--rev' : 'ss-flow-pulse';
	const lineOverlays = svg`
        <use href="${mpathHref}" xlink:href="${mpathHref}" class="ss-flow-core" />
        <use href="${mpathHref}" xlink:href="${mpathHref}" class="${pulseClass}" />`;

	return svg`
        ${lineOverlays}
        ${trail.map(
					(t) => svg`
        <circle cx="0" cy="0" r="${t.r}" fill="${fill}" opacity="${t.o}" class="ss-flow-dot">
            <animateMotion dur="${duration}s" begin="${(duration * t.lag).toFixed(3)}s"
                repeatCount="indefinite" keyPoints="${finalKeyPoints}"
                keyTimes="0;1" calcMode="linear">
                <mpath href="${mpathHref}"/>
            </animateMotion>
        </circle>`,
				)}
        <circle id="${id}" cx="0" cy="0" r="${radius}" fill="${fill}" class="ss-flow-dot">
            ${motion}
        </circle>
        <circle cx="0" cy="0" r="${Math.max(radius * 0.42, 1)}" fill="#ffffff" class="ss-dot-core">
            <animateMotion dur="${duration}s" repeatCount="indefinite"
                keyPoints="${finalKeyPoints}" keyTimes="0;1" calcMode="linear">
                <mpath href="${mpathHref}"/>
            </animateMotion>
        </circle>
    `;
};
