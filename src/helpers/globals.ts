import { HomeAssistant } from 'custom-card-helpers';

// Globalise the hass object so that localize can utilise it.

export const globalData = {
	hass: null as HomeAssistant | null,
	// Neon glow / comet-trail flow effects (opt-in via the `glow` card config).
	// Set once per render by the card so the shared flow helpers can self-gate
	// without threading the flag through every call site.
	glow: false,
	glowIntensity: 2,
};

export function setHass(hass: HomeAssistant) {
	globalData.hass = hass;
}

export function setGlow(enabled: boolean, intensity: number = 2) {
	globalData.glow = enabled === true;
	globalData.glowIntensity =
		Number.isFinite(intensity) && intensity > 0 ? intensity : 2;
}
