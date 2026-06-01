import { HomeAssistant } from 'custom-card-helpers';

// Globalise the hass object so that localize can utilise it.

export const globalData = {
  hass: null as HomeAssistant | null,
  // Neon glow / comet-trail flow effects (opt-in via the `glow` card config).
  // Set once per render by the card so the shared flow helpers can self-gate
  // without threading the flag through every call site.
  glow: false,
  glowIntensity: 2,
  // When the user prefers reduced motion, the flow helpers drop the extra
  // SMIL-animated elements (comet trails, moving hot-core) that CSS media
  // queries can't pause.
  reducedMotion: false,
  // Battery state-of-charge ring (a glow feature). On by default; can be
  // disabled via the `soc_ring` config without turning off the rest of glow.
  socRing: true,
};

export function setHass(hass: HomeAssistant) {
  globalData.hass = hass;
}

export function setGlow(
  enabled: boolean,
  intensity: number = 2,
  reducedMotion: boolean = false,
  socRing: boolean = true,
) {
  globalData.glow = enabled === true;
  globalData.glowIntensity =
    Number.isFinite(intensity) && intensity > 0 ? intensity : 2;
  globalData.reducedMotion = reducedMotion === true;
  globalData.socRing = socRing !== false;
}
