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

  // Effects-lite (intensity <= 1) and reduced-motion both drop the extra
  // SMIL-animated elements; lite keeps a static hot core, reduced-motion
  // keeps it too but without the moving extras.
  const lite = globalData.glowIntensity <= 1;
  const extras = !lite && !globalData.reducedMotion;

  // Static white-hot core down the centre of the line (a <use> clone). CSS
  // (.ss-flow-core) wins over the path's own stroke attribute.
  const coreOverlay = svg`<use href="${mpathHref}" xlink:href="${mpathHref}" class="ss-flow-core" />`;

  // Pulse wave sweeping the line + comet trail + moving hot core: only the
  // richer presentation.
  const pulseClass = invertFlow
    ? 'ss-flow-pulse ss-flow-pulse--rev'
    : 'ss-flow-pulse';
  const pulseOverlay = extras
    ? svg`<use href="${mpathHref}" xlink:href="${mpathHref}" class="${pulseClass}" />`
    : svg``;
  const trail = extras
    ? [
        { r: radius * 0.75, o: 0.45, lag: 0.06 },
        { r: radius * 0.5, o: 0.22, lag: 0.12 },
      ]
    : [];

  return svg`
        ${coreOverlay}
        ${pulseOverlay}
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
        ${
          extras
            ? svg`<circle cx="0" cy="0" r="${Math.max(radius * 0.42, 1)}" fill="#ffffff" class="ss-dot-core">
            <animateMotion dur="${duration}s" repeatCount="indefinite"
                keyPoints="${finalKeyPoints}" keyTimes="0;1" calcMode="linear">
                <mpath href="${mpathHref}"/>
            </animateMotion>
        </circle>`
            : svg``
        }
    `;
};
