import { CSSResultGroup, css, html } from 'lit';

export const styles: CSSResultGroup = css`
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 5px;
  }

  .card {
    border-radius: var(--ha-card-border-radius, 10px);
    box-shadow: var(
      --ha-card-box-shadow,
      0px 0px 0px 1px rgba(0, 0, 0, 0.12),
      0px 0px 0px 0px rgba(0, 0, 0, 0.12),
      0px 0px 0px 0px rgba(0, 0, 0, 0.12)
    );
    background: var(--ha-card-background, var(--card-background-color, white));
    border-width: var(--ha-card-border-width);
    padding: 0px;
  }

  text {
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .left-align {
    text-anchor: start;
  }
  .right-align {
    text-anchor: end;
  }
  .st1 {
    fill: #ff9b30;
  }
  .st2 {
    fill: #f3b3ca;
  }
  .st3 {
    font-size: 9px;
  }
  .st4 {
    font-size: 14px;
  }
  .st5 {
    fill: #969696;
  }
  .st6 {
    fill: #5fb6ad;
  }
  .st7 {
    fill: #5490c2;
  }
  .st8 {
    font-weight: 500;
  }
  .st9 {
    fill: #959595;
  }
  .st10 {
    font-size: 16px;
  }
  .st11 {
    fill: transparent;
  }
  .st12 {
    display: none;
  }
  .st13 {
    font-size: 22px;
  }
  .st14 {
    font-size: 12px;
  }
  .remaining-energy {
    font-size: 9px;
  }

  /* ===== Neon glow flow effects (opt-in via the \`glow\` config) ===== */
  /* The filters referenced here are injected as <defs> inside the card SVG
	   when glow is enabled, so they resolve within this shadow root. */
  /* Region-free glow: drop-shadow uses the element's own colour (set inline as
     CSS color) and never collapses on horizontal/vertical lines the way an
     objectBoundingBox SVG filter does. */
  .ss-glow .ss-flow-line {
    filter: drop-shadow(0 0 2px currentColor) drop-shadow(0 0 5px currentColor);
  }

  .ss-glow .ss-flow-dot {
    filter: url(#ss-glow-dot);
    will-change: transform, filter;
  }

  /* Hot-core / pulse tint, themeable via the ss-theme-* class. */
  .ss-glow {
    --ss-hot: #ffffff;
  }
  .ss-glow.ss-theme-ice {
    --ss-hot: #abe9ff;
  }
  .ss-glow.ss-theme-fire {
    --ss-hot: #ffd08a;
  }
  .ss-glow.ss-theme-aurora {
    --ss-hot: #b6ffd9;
  }
  .ss-glow.ss-theme-mono {
    --ss-hot: #ffffff;
  }
  /* Mono actually desaturates the glowing elements (grayscale before the
	   colour-preserving glow filter). */
  .ss-glow.ss-theme-mono .ss-flow-line {
    filter: grayscale(1) drop-shadow(0 0 2px #fff) drop-shadow(0 0 5px #fff);
  }
  .ss-glow.ss-theme-mono .ss-flow-dot {
    filter: grayscale(1) url(#ss-glow-dot);
  }
  .ss-glow.ss-theme-mono .ss-flow-stream {
    filter: grayscale(1) drop-shadow(0 0 3px #fff);
  }
  .ss-glow.ss-theme-mono .ss-soc-ring {
    filter: grayscale(1) drop-shadow(0 0 3px #fff);
  }
  .ss-glow.ss-theme-mono svg#sun {
    filter: grayscale(1) url(#ss-glow-node);
  }
  .ss-glow.ss-theme-mono.card::before {
    filter: blur(30px) grayscale(1);
  }

  /* Hot core down the centre of each active flow line (a <use> clone
	   of the path). CSS beats the path's own stroke attribute. */
  .ss-glow .ss-flow-core {
    fill: none;
    stroke: var(--ss-hot, #ffffff);
    stroke-opacity: 0.55;
    stroke-width: 1.2;
    stroke-linecap: round;
    pointer-events: none;
    /* No filter here: a bounding-box filter would collapse on horizontal /
       vertical core lines and hide them. The plain bright stroke is enough —
       the underlying ss-flow-line already supplies the glow. */
  }

  /* Hot core inside the comet head. */
  .ss-glow .ss-dot-core {
    fill: var(--ss-hot, #ffffff);
    fill-opacity: 0.92;
    pointer-events: none;
    filter: drop-shadow(0 0 2px var(--ss-hot, #fff));
  }

  /* Luminous pulse wave sweeping along the line (a second <use> clone).
	   pathLength is normalised to 1000 on the source path. Speed comes from
	   --ss-pulse-dur, which the card lowers as system activity rises. */
  .ss-glow .ss-flow-pulse {
    fill: none;
    stroke: var(--ss-hot, #ffffff);
    stroke-opacity: 0.85;
    stroke-width: 2.6;
    stroke-linecap: round;
    pointer-events: none;
    stroke-dasharray: 34 1000;
    stroke-dashoffset: 1000;
    filter: drop-shadow(0 0 3px var(--ss-hot, #fff))
      drop-shadow(0 0 6px var(--ss-hot, #fff));
    animation: ss-pulse-move var(--ss-pulse-dur, 2.6s) linear infinite;
    will-change: stroke-dashoffset;
  }

  .ss-glow .ss-flow-pulse--rev {
    animation-name: ss-pulse-move-rev;
  }

  /* Continuously flowing energy: a repeating dash that scrolls along the whole
	   pipe non-stop, so active lines feel like liquid is running through them.
	   The dash period (9 + 27 = 36 in the normalised pathLength of 1000) is what
	   the keyframe shifts by, giving a seamless infinite loop. Speed rises with
	   system activity via --ss-stream-dur. */
  .ss-glow .ss-flow-stream {
    fill: none;
    stroke: var(--ss-hot, #ffffff);
    stroke-opacity: 0.5;
    stroke-width: 1.5;
    stroke-linecap: round;
    pointer-events: none;
    stroke-dasharray: 9 27;
    filter: drop-shadow(0 0 3px var(--ss-hot, #fff));
    animation: ss-stream-move var(--ss-stream-dur, 1.1s) linear infinite;
    will-change: stroke-dashoffset;
  }

  .ss-glow .ss-flow-stream--rev {
    animation-name: ss-stream-move-rev;
  }

  @keyframes ss-stream-move {
    from {
      stroke-dashoffset: 36;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes ss-stream-move-rev {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 36;
    }
  }

  @keyframes ss-pulse-move {
    from {
      stroke-dashoffset: 1000;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes ss-pulse-move-rev {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 1000;
    }
  }

  @keyframes ss-node-pulse {
    0%,
    100% {
      filter: drop-shadow(0 0 1px currentColor);
    }
    50% {
      filter: drop-shadow(0 0 4px currentColor)
        drop-shadow(0 0 8px currentColor);
    }
  }

  /* Breathe a soft halo around the major nodes so they feel "alive".
	   Pulse speed rises with system activity (--ss-activity 0..1). */
  .ss-glow .grid-icon,
  .ss-glow .grid-icon-small,
  .ss-glow .aux-icon,
  .ss-glow .noness-icon,
  .ss-glow .essload1-icon,
  .ss-glow .essload1-icon-full,
  .ss-glow .essload2-icon,
  .ss-glow .nonessload1-icon {
    animation: ss-node-pulse calc(3.4s - var(--ss-activity, 0) * 1.6s)
      ease-in-out infinite;
    will-change: filter;
  }

  /* Solar (sun) node — rendered as <svg id="sun"> with a coloured path;
	   the node filter blooms it in its own colour. */
  .ss-glow svg#sun {
    filter: url(#ss-glow-node);
  }

  /* ===== Battery SOC ring ===== */
  .ss-glow .ss-soc-ring {
    filter: drop-shadow(0 0 3px currentColor);
  }

  .ss-glow .ss-soc-arc {
    animation: ss-soc-pulse 2.6s ease-in-out infinite;
    will-change: stroke-opacity, stroke-width;
  }

  /* Orbiting sweep shown only while charging. */
  .ss-glow .ss-soc-sweep {
    stroke-opacity: 0.95;
    animation: ss-soc-orbit 1.8s linear infinite;
    will-change: transform;
  }

  @keyframes ss-soc-orbit {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ss-soc-pulse {
    0%,
    100% {
      stroke-opacity: 0.85;
      stroke-width: 2.5;
    }
    50% {
      stroke-opacity: 1;
      stroke-width: 3;
    }
  }

  /* ===== Glass card shell + ambient state glow ===== */
  .ss-glow.card {
    position: relative;
    overflow: hidden;
    /* Fallback for webviews without color-mix(): keep the theme background. */
    background: var(
      --ha-card-background,
      var(--card-background-color, #161a23)
    );
    background: color-mix(
      in srgb,
      var(--ha-card-background, var(--card-background-color, #161a23)) 72%,
      transparent
    );
    -webkit-backdrop-filter: blur(10px) saturate(135%);
    backdrop-filter: blur(10px) saturate(135%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 10px 44px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
  }

  /* Soft ambient aura behind the diagram. The two strongest layers follow
	   the dominant live flow (--ss-ambient-1/-2, set by the card); the third is
	   the battery palette tint. Overall intensity scales with --ss-activity so
	   the aura swells under load. The keyframe only drifts; opacity is reactive. */
  .ss-glow.card::before {
    content: '';
    position: absolute;
    inset: -20%;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(
        46% 56% at 26% 30%,
        var(--ss-ambient-1, var(--ss-c-solar, #ffa500)) 0%,
        transparent 70%
      ),
      radial-gradient(
        44% 54% at 74% 70%,
        var(--ss-ambient-2, var(--ss-c-grid, #5490c2)) 0%,
        transparent 70%
      ),
      radial-gradient(
        40% 50% at 60% 22%,
        var(--ss-c-batt, #ffc0cb) 0%,
        transparent 72%
      );
    opacity: calc(0.08 + var(--ss-activity, 0.15) * 0.26);
    filter: blur(30px);
    animation: ss-ambient 16s ease-in-out infinite alternate;
  }

  .ss-glow.card > * {
    position: relative;
    z-index: 1;
  }

  @keyframes ss-ambient {
    0% {
      transform: translate3d(-2%, -1%, 0) scale(1.02);
    }
    100% {
      transform: translate3d(2%, 2%, 0) scale(1.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ss-glow .grid-icon,
    .ss-glow .grid-icon-small,
    .ss-glow .aux-icon,
    .ss-glow .noness-icon,
    .ss-glow .essload1-icon,
    .ss-glow .essload1-icon-full,
    .ss-glow .essload2-icon,
    .ss-glow .nonessload1-icon {
      animation: none;
      filter: drop-shadow(0 0 3px currentColor);
    }
    .ss-glow .ss-flow-pulse,
    .ss-glow .ss-flow-stream,
    .ss-glow .ss-soc-arc,
    .ss-glow .ss-soc-sweep,
    .ss-glow.card::before {
      animation: none;
    }
  }
`;

export const getDynamicStyles = (data) => html`
  <style>
    .essload1-icon {
      color: ${data.dynamicColourEssentialLoad1} !important;
      --mdc-icon-size: 32px;
    }

    .essload2-icon {
      color: ${data.dynamicColourEssentialLoad2} !important;
      --mdc-icon-size: 32px;
    }

    .essload1-small-icon {
      color: ${data.dynamicColourEssentialLoad1} !important;
      --mdc-icon-size: 20px;
    }

    .essload2-small-icon {
      color: ${data.dynamicColourEssentialLoad2} !important;
      --mdc-icon-size: 20px;
    }

    .essload3-small-icon {
      color: ${data.dynamicColourEssentialLoad3} !important;
      --mdc-icon-size: 20px;
    }

    .essload4-small-icon {
      color: ${data.dynamicColourEssentialLoad4} !important;
      --mdc-icon-size: 20px;
    }

    .essload5-small-icon {
      color: ${data.dynamicColourEssentialLoad5} !important;
      --mdc-icon-size: 20px;
    }

    .essload6-small-icon {
      color: ${data.dynamicColourEssentialLoad6} !important;
      --mdc-icon-size: 20px;
    }

    .grid-icon {
      color: ${data.customGridIconColour} !important;
      --mdc-icon-size: 64px;
    }

    .essload1-icon-full {
      color: ${data.dynamicColourEssentialLoad1} !important;
      --mdc-icon-size: 36px;
    }

    .aux-icon {
      color: ${data.auxDynamicColour} !important;
      --mdc-icon-size: 70px;
    }

    .aux-small-icon-1 {
      color: ${data.auxDynamicColourLoad1} !important;
      --mdc-icon-size: 24px;
    }

    .aux-small-icon-2 {
      color: ${data.auxDynamicColourLoad2} !important;
      --mdc-icon-size: 24px;
    }

    .aux-off-icon {
      color: ${data.auxOffColour} !important;
      --mdc-icon-size: 70px;
    }

    .nonessload1-icon {
      color: ${data.dynamicColourNonEssentialLoad1} !important;
      --mdc-icon-size: 32px;
    }

    .nonessload2-icon {
      color: ${data.dynamicColourNonEssentialLoad2} !important;
      --mdc-icon-size: 32px;
    }

    .nonessload3-icon {
      color: ${data.dynamicColourNonEssentialLoad3} !important;
      --mdc-icon-size: 32px;
    }

    .noness-icon {
      color: ${data.gridColour} !important;
      --mdc-icon-size: 70px;
    }

    .grid-icon-small {
      color: ${data.customGridIconColour} !important;
      --mdc-icon-size: 32px;
    }
  </style>
`;
