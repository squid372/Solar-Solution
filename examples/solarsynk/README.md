# SolarSynk V3 → Solar-Solution

A ready-to-use preset that wires the [SolarSynk V3 add-on](https://github.com/martinville/solarsynkv3)
(which pulls your Sunsynk cloud data into Home Assistant) directly into the
Solar-Solution card — with the **neon glow** visuals enabled.

> ✅ The entity names below are validated against a **real SolarSynk V3** install.
> **The only thing you change is your serial number** — everything else maps
> automatically. No hand-mapping each sensor.

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
     into your dashboard's raw configuration editor. This lays out the
     **full suite**: the power-flow card plus all the companion cards below.
5. Adjust `solar.mppts` (1–6), `battery.energy`, and the `max_power` values to
   match your system. The `full` style shows up to 4 MPPT strings; use
   `cardstyle: lite`/`compact` (with `wide: true`) to display 5–6 strings.

The preset enables `wide: true` (16:9) so the full layout isn't cramped. Remove
that line for the narrower 4:3 layout.

## Companion cards in the preset

[`dashboard.yaml`](dashboard.yaml) also wires up the extra Solar-Solution cards,
so no live data is left unseen:

| Card | Shows |
|------|-------|
| **Battery status** (`solar-solution-battery`) | Animated liquid SOC fill, charge/discharge, voltage, current, temperature |
| **Self-sufficiency** (`solar-solution-self-sufficiency`) | Share of today's load met by solar + battery vs the grid |
| **Daily energy** (`solar-solution-energy-summary`) | Today's solar / load / charged / discharged / imported / exported totals |
| **Solar vs Grid** (`solar-solution-grid-balance`) | Today's energy mix as a diverging bar |
| **Inverter** (`solar-solution-inverter`) | Work mode, priority, solar-sell, max-sell, output, load, frequency, grid voltage, temps, capacity, lifetime PV, battery state |

## Entity mapping

| Card slot | SolarSynk sensor (`…_<name>`) |
|-----------|-------------------------------|
| `inverter_power_175` | `inverter_power` |
| `inverter_status_59` | `status` |
| `priority_load_243` | `energymode` † |
| `use_timer_248` | `sysworkmode` † |
| `inverter_voltage_154` | `inverter_voltager_phase_0` |
| `inverter_current_164` | `inverter_current_phase_0` |
| `load_frequency_192` | `load_frequency` |
| `grid_connected_status_194` | `gridsignal` |
| `dc_transformer_temp_90` | `inverter_dc_temperature` |
| `radiator_temp_91` | `inverter_ac_temperature` |
| `battery_soc_184` | `battery_soc` |
| `battery_power_190` | `battery_power` |
| `battery_voltage_183` | `battery_voltage` |
| `battery_current_191` | `battery_bms_current` (some inverters: `battery_current`) |
| `battery_temp_182` | `battery_bms_temperature` (some inverters: `battery_temperature`) |
| `battery_status` | `battery_status` |
| `battery_rated_capacity` | `battery_capacity` (Ah) |
| `battery_efficiency` | `battery_efficiency` (%) |
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
| `total_pv_generation` | `pv_etotal` |
| `solar_sell_247` | `solarsell` |
| `max_sell_power` | `solarmaxsellpower` |
| `grid_power_169` / `grid_ct_power_172` | `grid_pac` |
| `grid_voltage` | `grid_phase0_voltage` |
| `day_grid_import_76` | `grid_etoday_from` * |
| `day_grid_export_77` | `grid_etoday_to` * |
| `essential_power` | `load_total_power` |
| `day_load_energy_84` | `load_daily_used` |

\* SolarSynk's `_from` = imported, `_to` = exported. If your daily buy/sell read
swapped, swap `_from` and `_to`. `pv_total` is intentionally unmapped — the card
sums the mapped `pv1…pvN` strings instead.

† `energymode` / `sysworkmode` are inverter integers driving the Energy-Pattern
and Use-Timer icons. If an icon shows the wrong state, swap these two — or remove
both lines to hide the icons.

### Not available from SolarSynk

These card features need data SolarSynk doesn't publish, so they're left unmapped
(the card derives or hides them):

- **AUX** output (`aux_power_166`, `day_aux_energy`, `aux_load*`) — Sunsynk AUX port isn't exposed.
- **Non-essential / per-circuit loads** (`nonessential_power`, `essential_load1…6`, `non_essential_load1…3`).
- **Battery health** (`battery_soh`) and **`battery2_power_190`** (no `battery_power2`).
- **Energy cost / prepaid** (`energy_cost_buy/sell`, `prepaid_units`).
- **Environment temp**, **solar forecast** (`remaining_solar`).

Everything SolarSynk *does* publish is mapped above, so the card shows the full
flow plus per-MPPT, both-battery, grid, temps, daily totals, solar-sell and
self-sufficiency.

## Turning the glow off

The preset ships with the neon glow on (`glow: true`). To return to the classic
look, set `glow: false` (or remove the `glow` / `glow_intensity` lines).
