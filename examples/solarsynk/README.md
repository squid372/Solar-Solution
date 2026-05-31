# SolarSynk V3 → Sunsynk Power Flow Card

A ready-to-use preset that wires the [SolarSynk V3 add-on](https://github.com/martinville/solarsynkv3)
(which pulls your Sunsynk cloud data into Home Assistant) directly into the
Sunsynk Power Flow Card — with the new **neon glow** visuals enabled.

## How it works

SolarSynk publishes every value as a sensor named:

```
sensor.solarsynkv3_<SERIAL>_<name>
```

where `<SERIAL>` is your inverter serial. This preset maps those sensors onto
the card's entity slots so the card works out of the box.

> **Heads up:** SolarSynk indexes MPPT strings and phases from **0**, so the
> first PV string is `pv_mppt0`, the first grid phase is `grid_phase0`, etc.
> The preset already accounts for this.

## Setup

1. Install and configure the **SolarSynk V3** add-on and confirm the
   `sensor.solarsynkv3_*` entities exist (Developer Tools → States).
2. Install the **Sunsynk Power Flow Card** (HACS or manual).
3. Personalise the preset by replacing `YOURSERIAL` with your serial:

   ```bash
   sed 's/YOURSERIAL/1234567890/g' card.yaml > my-card.yaml
   ```

   (or just find-and-replace `YOURSERIAL` in your editor)
4. Add the card:
   - **Single card** → copy [`card.yaml`](card.yaml) into a *Manual* card, or
   - **Whole view** → paste [`dashboard.yaml`](dashboard.yaml)'s `views:` entry
     into your dashboard's raw configuration editor.
5. Adjust `solar.mppts` (1–6), `battery.energy`, and the `max_power` values to
   match your system. The `full` style shows up to 4 MPPT strings; use
   `cardstyle: lite`/`compact` (with `wide: true`) to display 5–6 strings.

## Entity mapping

| Card slot | SolarSynk sensor (`…_<name>`) |
|-----------|-------------------------------|
| `inverter_power_175` | `inverter_power` |
| `inverter_voltage_154` | `inverter_voltager_phase_0` |
| `inverter_current_164` | `inverter_current_phase_0` |
| `load_frequency_192` | `load_frequency` |
| `grid_connected_status_194` | `grid_status` |
| `dc_transformer_temp_90` | `inverter_dc_temperature` |
| `radiator_temp_91` | `inverter_ac_temperature` |
| `battery_soc_184` | `battery_soc` |
| `battery_power_190` | `battery_power` |
| `battery_voltage_183` | `battery_voltage` |
| `battery_current_191` | `battery_current` |
| `battery_temp_182` | `battery_temperature` |
| `battery_status` | `battery_status` |
| `day_battery_charge_70` | `battery_etoday_charge` |
| `day_battery_discharge_71` | `battery_etoday_discharge` |
| `battery2_soc_184` | `battery_soc2` |
| `battery2_voltage_183` | `battery_voltage2` |
| `battery2_current_191` | `battery_current2` |
| `battery2_temp_182` | `battery_temperature2` |
| `battery2_status` | `battery_status2` |
| `pv1_power_186` … `pv4_power_189`, `pv5_power`, `pv6_power` | `pv_mppt0_power` … `pv_mppt5_power` |
| `pv1_voltage_109` … `pv6_voltage` | `pv_mppt0_voltage` … `pv_mppt5_voltage` |
| `pv1_current_110` … `pv6_current` | `pv_mppt0_current` … `pv_mppt5_current` |
| `day_pv_energy_108` | `pv_etoday` |
| `pv_total` | `pv_pac` |
| `total_pv_generation` | `pv_etotal` |
| `grid_power_169` | `grid_pac` |
| `grid_ct_power_172` / `grid_ct_power_total` | `grid_limiter_total_power` |
| `grid_voltage` | `grid_phase0_voltage` |
| `day_grid_import_76` | `grid_etoday_from` |
| `day_grid_export_77` | `grid_etoday_to` |
| `essential_power` | `load_total_power` |
| `day_load_energy_84` | `load_daily_used` |

### No SolarSynk equivalent

Some card slots have no matching SolarSynk sensor and are intentionally left
unmapped: `battery2_power_190` (SolarSynk exposes no `battery_power2`),
`nonessential_power`, and the AUX load entities. The card derives or hides
these as needed.

## Turning the glow off

The preset ships with the neon glow on (`glow: true`). To return to the classic
look, set `glow: false` (or remove the `glow` / `glow_intensity` lines).
