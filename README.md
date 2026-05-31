# Solar-Solution

An animated Home Assistant dashboard card for visualizing solar, battery, grid
and load power flow — with an optional **neon glow** theme that makes the card
really stand out. It works with many inverter brands (Sunsynk, Deye, Solis, Lux,
FoxESS, Goodwe, Huawei and more) as long as you have the required sensor data,
and pairs out of the box with the [SolarSynk](examples/solarsynk/) add-on.

[![Open your Home Assistant instance and open this repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=squid372&repository=Solar-Solution&category=plugin)

![Solar-Solution power flow card with the neon glow theme](docs/images/solar-solution-glow.svg)

## Features

- **Neon glow theme** (opt-in) — glowing flow lines with white-hot cores,
  comet-trail dots, energy pulse waves, pulsing nodes, a frosted-glass card with
  a live ambient aura, charging-aware battery state-of-charge rings, and five
  colour themes. See [below](#neon-glow-theme).
- Three card styles — `compact`, `lite` or `full`, plus a wide 16:9 layout.
- Animated power flow with configurable, power-reactive speed (supports inverted
  battery / AUX / grid power).
- Dynamic battery image based on SOC, with optional runtime-to-shutdown estimate.
- Up to **6 MPPT** solar strings and **dual-battery** support.
- Daily totals, self-sufficiency / ratio, temperatures, energy cost and more —
  each toggleable.
- Dynamic colours, custom colours and images, and clickable entities (more-info).
- Per-inverter status and battery messages (Sunsynk, Lux, Goodwe, Solis, …).

## Neon glow theme

An optional, opt-in visual theme. Enable it with:

```yaml
type: custom:solar-solution
cardstyle: full
glow: true
glow_intensity: 3 # 1 (subtle / lighter render) … 5 (intense)
glow_theme: neon # neon | ice | fire | aurora | mono
```

What it adds (all off by default, so the classic look is untouched):

- Glowing flow lines with white-hot cores and comet-trail dots
- Energy pulse waves that sweep each active line
- Pulsing node halos and a softly glowing solar node
- A frosted-glass card with a **live ambient aura** tinted to the dominant flow
  (solar / grid / battery) and scaled to system activity
- A charging-aware **battery state-of-charge ring** (both batteries)
- Five colour themes via `glow_theme`

Performance & accessibility: `glow_intensity: 1` renders a lighter "effects-lite"
variant (no comet trails / pulse waves), and `prefers-reduced-motion` is
respected (the moving extras are dropped and CSS animations are paused).

**Preview it locally:** the [`demo/`](demo/) folder contains a standalone,
glow-on-vs-off comparison across all themes — serve it with any static server
(e.g. `npx http-server demo`) and open `index.html`.

## Installation

### HACS (recommended)

1. In HACS, open the menu → **Custom repositories**.
2. Add `https://github.com/squid372/Solar-Solution` with category **Dashboard**.
3. Search for **Solar-Solution** and install it, or use the button above.

### Manual

1. Create `www/solar-solution/` in your Home Assistant config directory.
2. Copy `dist/solar-solution.js` into it.
3. Add it as a Dashboard resource (JavaScript Module). Append `?ver=x` to the
   URL and bump `x` after each update to bypass the browser cache.

## Use with the SolarSynk add-on

If you use the SolarSynk add-on to pull your inverter data into Home Assistant,
a ready-to-use, pre-mapped card preset (with the glow theme enabled) lives in
[`examples/solarsynk/`](examples/solarsynk/) — just replace `YOURSERIAL` and paste it in.

## Configuration

Every option is documented in [`docs/configuration.md`](docs/configuration.md).

## Development

```bash
npm install      # install dependencies
npm run build    # bundle to dist/solar-solution.js
npm run watch    # rebuild on change
```

## License

MIT © 2026 squid372. Built on the open-source
[Sunsynk Power Flow Card](https://github.com/slipx06/sunsynk-power-flow-card) (MIT).
