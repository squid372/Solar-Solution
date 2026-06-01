import { svg } from 'lit';
import { Utils } from '../../../helpers/utils';
import { globalData } from '../../../helpers/globals';

export function renderPVFlow(
  id: string,
  path: string,
  color: string,
  lineWidth: number,
  powerWatts: number,
  duration: number,
  invertFlow: boolean,
  minLineWidth: number,
  className: string = '',
  keyPoints: string = '0;1',
) {
  const lineId = `${id}-line`;
  const finalKeyPoints =
    invertFlow === true ? Utils.invertKeyPoints(keyPoints) : keyPoints;
  // Show animation dot whenever power is strictly positive (avoid rounding to 0)
  const showDot = powerWatts > 0;
  // Ensure a valid positive duration; default to 1s if unset/invalid
  const dur = Number.isFinite(duration) && duration > 0 ? duration : 1;
  const glow = globalData.glow;
  const lineClass = `${className}${glow ? ' ss-flow-line' : ''}`.trim();
  const dotClass = `${className}${glow ? ' ss-flow-dot' : ''}`.trim();
  const dotRadius = Math.min(2 + lineWidth + Math.max(minLineWidth - 2, 0), 8);

  // Effects-lite (intensity <= 1) and reduced-motion drop the moving extras.
  const lite = globalData.glowIntensity <= 1;
  const extras = showDot && glow && !lite && !globalData.reducedMotion;

  // Comet trail: ghost dots lag behind the head, fading and shrinking.
  const trail = extras
    ? [
        { r: dotRadius * 0.75, o: 0.45, lag: 0.06 },
        { r: dotRadius * 0.5, o: 0.22, lag: 0.12 },
      ]
    : [];

  // Hot-core (static) + pulse-wave line overlays cloned from the flow path.
  const pulseClass = invertFlow
    ? 'ss-flow-pulse ss-flow-pulse--rev'
    : 'ss-flow-pulse';
  const lineOverlays =
    showDot && glow
      ? svg`
				<use href="#${lineId}" xlink:href="#${lineId}" class="ss-flow-core" />
				${
          extras
            ? svg`<use href="#${lineId}" xlink:href="#${lineId}" class="${pulseClass}" />`
            : svg``
        }`
      : svg``;

  return svg`
		<svg
			id="${id}-flow"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			overflow="visible"
		>
			<path
				id="${lineId}"
				d="${path}"
				fill="none"
				stroke="${color}"
				stroke-width="${lineWidth}"
				stroke-miterlimit="10"
				pointer-events="stroke"
				class="${lineClass}"
				style="${glow ? `color:${color}` : ''}"
				pathLength="${glow ? '1000' : ''}"
			/>
			${lineOverlays}
			${trail.map(
        (t) => svg`<circle
						r="${t.r}"
						fill="${color}"
						opacity="${t.o}"
						class="${dotClass}"
					>
						<animateMotion
							dur="${dur}s"
							begin="${(dur * t.lag).toFixed(3)}s"
							repeatCount="indefinite"
							keyPoints="${finalKeyPoints}"
							keyTimes="0;1"
							calcMode="linear"
							rotate="auto"
						>
							<mpath href="#${lineId}" xlink:href="#${lineId}" />
						</animateMotion>
					</circle>`,
      )}
			${
        showDot
          ? svg`<circle
						id="${id}-dot"
						r="${dotRadius}"
						fill="${color}"
						class="${dotClass}"
					>
						<animateMotion
							dur="${dur}s"
							repeatCount="indefinite"
							keyPoints="${finalKeyPoints}"
							keyTimes="0;1"
							calcMode="linear"
							rotate="auto"
						>
							<mpath href="#${lineId}" xlink:href="#${lineId}" />
						</animateMotion>
					</circle>
					${
            extras
              ? svg`<circle r="${Math.max(dotRadius * 0.42, 1)}" fill="#ffffff" class="ss-dot-core">
							<animateMotion dur="${dur}s" repeatCount="indefinite"
								keyPoints="${finalKeyPoints}" keyTimes="0;1" calcMode="linear">
								<mpath href="#${lineId}" xlink:href="#${lineId}" />
							</animateMotion>
						</circle>`
              : svg``
          }`
          : svg``
      }
		</svg>
	`;
}
