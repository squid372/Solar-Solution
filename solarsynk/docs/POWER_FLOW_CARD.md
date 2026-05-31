# Visualising SolarSynk with the Sunsynk Power Flow Card

Once SolarSynk is publishing `sensor.solarsynkv3_<serial>_*` entities, you can
display them with the animated **Sunsynk Power Flow Card**.

A ready-to-use preset (already mapped to SolarSynk's sensor names, with the
neon-glow visuals enabled) lives alongside the card source:

- [`examples/solarsynk/card.yaml`](../../examples/solarsynk/card.yaml) — drop-in card
- [`examples/solarsynk/dashboard.yaml`](../../examples/solarsynk/dashboard.yaml) — full view
- [`examples/solarsynk/README.md`](../../examples/solarsynk/README.md) — setup + entity map

Replace `YOURSERIAL` with your inverter serial and paste into your dashboard.
