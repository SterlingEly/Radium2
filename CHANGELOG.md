# Radium 2 — Changelog

> Version numbers here are **public release** numbers. `master` can be ahead of the last release;
> everything after the latest published version is listed under "unreleased" until it ships.

---

## v2.4 (unreleased)

Not yet compiled or device-tested as of 2026-10-13 (a first Round 2 / Time 2 test is under way).

### Three overlay sizes (emery and gabbro)
- New **Large** overlay: LECO_60 time (the biggest system font, SDK 4.9.148+, emery/gabbro only), same info lines and icons as Medium, 80px circle on every platform (`OVERLAY_LARGE_R`; it started at 84 emery / 100 gabbro, was trimmed to 80 / 94 after the first device look, then standardized — see the 2026-10-14 overlay alignment pass below)
- The settings page now has a Small / Medium / Large selector instead of a single "Large overlay" toggle
- Existing settings are unaffected: the stored value `1` used to mean "Large" and now means **Medium** with exactly the same look; Medium is still the default on emery/gabbro
- Large geometry (line spacing and nudges) is an estimate scaled from Medium. After the first device look the two lines below the time were moved down 4px (`bot1_nudge` -11 → -7, `bot2_nudge` -10 → -6) because the first line above the time sat farther from it than the first line below; the 4px is a guess, so adjust both nudges together if the gaps still differ. Line spacing (`line_gap`) was deliberately not widened: the outer lines already sit near the circle edge
- On other platforms Large is treated as Medium (the font does not exist there)

### New info-line fields
- **UV Index** (`FIELD_UV` 15) — "UV 5", sun icon. From the Open-Meteo forecast request (`current=uv_index`)
- **Air Quality** (`FIELD_AQI` 16) — "AQI 42", new haze icon. US AQI (0–500) from the Open-Meteo air-quality API (`current=us_aqi`)
- **Step Pace %** (`FIELD_PACE` 17) — steps so far vs. a typical day, e.g. "112%"
- **Typical Steps** (`FIELD_TYPICAL` 18) — typical steps by now, e.g. "typ 4,200"
- **Light Left** (`FIELD_LIGHT_LEFT` 19) — daylight remaining by day, time until sunrise by night
- **Sleep** (`FIELD_SLEEP` 20) — "Zz 7h05m", sleep since 6pm yesterday
- UV and AQI read `--` after 3 hours without a phone update; pace, typical steps and sleep read `--` when there is no usable health history

### Pace on the outer ring
- **Color steps by pace** (option, color platforms): the lit steps arc takes a pace color; fill length is still steps ÷ goal. Brightest hue per step of the spectrum: ≤30% red, ≤60% orange, ≤90% yellow, ≤200% green, ≤400% blue, ≤700% violet, beyond magenta
- **Pace marker on ring** (option): a notch where a typical day would have put you (typical-so-far ÷ goal)
- "Typical" = same-weekday average over up to 4 weeks (Pebble Health, weekly scope). Pace is hidden when typical-so-far is under 300 steps (too noisy early in the day)
- Both options **default on** (Sterling's decision, 2026-10-13); Steps & Battery ring mode only; stored in their own persist key (`PACE_KEY=10`) so `RadiumSettings` and existing saved settings are untouched
- The settings page shows both toggles checked by default, matching the watch

### Overlay alignment pass (2026-10-14; labeled "v2.5" in `main.c`, still unreleased)
- **Icons match TallBoy's**: same pixel art and the same icon-to-text relation — small tier 12px icon / 3px gap / Gothic 18 Bold / 20px box / icon top +4; large tier 16px icon / 4px gap / Gothic 24 Bold / 28px box / icon top +9. Replaces the 11px/14px icons. The BT disconnected rune is centered and the "!" dot is gone
- **Circles standardized** to 60 / 70 / 80 on every platform (Small was 58; gabbro Large was 94 → now 80)
- **Bold Lecos**: Small `LECO_36_BOLD`, Large `LECO_60_BOLD_NUMBERS_AM_PM` (was regular). Medium stays regular `LECO_42` — no Leco 42 bold exists in the system fonts; an overstrike workaround was tried and removed. Sterling decides after use whether Large stays bold / Medium moves to `LECO_38_BOLD_NUMBERS`
- Next Gothic Bold above 24 is `GOTHIC_28_BOLD` (not used)

### Ring gap, marker color, battery colors (2026-10-14)
- **Gabbro ring gap doubled**: the bg-colored gap between the outer ring and the tick radials is now 4px on gabbro (`RING_GAP`), was 2px. Ring is still 6px thick (radius 124–130); ticks now end at radius 120. Other platforms stay at 2px; emery can follow if wanted
- **Pace marker color** (color platforms): its own color row on the settings page, shown next to the marker toggle. Every preset sets it to its time text color (`tt`, usually white). Until the settings page sends one, the marker simply follows the time color, so existing users see no change
- **Battery level colors** (option, color platforms, default **off**): ≤20% red, ≤50% yellow, above that green. Colors the **battery ring only** (Steps & Battery mode; solar mode's right side stays "day"); info line colors are untouched. On light backgrounds it switches to darker lit colors (dark red / amber / jade) and forces the unfilled track to a pale tint of the same hue; on dark backgrounds the track becomes a dark shade. Hidden on B&W platforms
- Both stored by extending the `PACE_KEY` blob (appended fields; an old 2-byte blob loads with defaults). New message keys `PaceMarkerColor`, `BattColorOverride`

### Data fetch
- One location lookup, then forecast then air-quality, then a **single** AppMessage to the watch (was: separate fetch + message per data source). A failure in one request no longer blocks the other
- New message keys appended: `UvIndex`, `AqiIndex`, `PaceColor`, `PaceMarker`, `PaceMarkerColor`, `BattColorOverride` (39 total)

### Bug fixes
- Large-overlay option now actually appears on gabbro (Pebble Round 2): `index.js` never passed `'gabbro'` to the config page. (The v2.3.1 entry below claimed this was fixed; only emery was.) Saves made while the option was hidden stored "Small", so it may show Small until set again
- Quick View on round platforms (gabbro, chalk) no longer shrinks or moves the face — it just covers it. Rect platforms still fit the visible area
- Aplite config page showed color pickers and hid the invert toggle (regression since v2.3.1 when `index.js` began passing `'aplite'`)
- Solar ring: choosing Sunrise & Sunset before any solar data had arrived drew the steps value with solar-night geometry; it now falls back to a normal steps ring
- Corrected a stale source comment that listed flint as having a heart-rate sensor (HR hardware: emery and diorite HR model only)

---

## v2.3.1

### Bug fixes
- Config page: large overlay toggle now appears on emery (Pebble Time 2); gabbro (Pebble Round 2) was *not* actually fixed here — see v2.4 (unreleased). The cause on emery was `index.js` not passing the platform string through
- Config page: large overlay toggle now defaults to checked on emery, matching the C default (`OVERLAY_LARGE`)
- Config page: `isLargePlatform` corrected to `emery || gabbro`; chalk (Pebble Time Round, small screen) was incorrectly included
- Heart rate: fixed — `health_service_metric_accessible` always returns false for HR; switched to `health_service_metric_aggregate_averaged_accessible` as the SDK requires
- Health updates (steps, distance, calories, heart rate) now all refresh once per minute in sync with the tick handler, rather than on separate background health events

---

## v2.3

### Solar ring mode
- New ring mode: **Sunrise & Sunset** — right arc = daylight remaining, left arc = night remaining until sunrise
- Day arc drains clockwise from 12 as daylight depletes; night arc drains clockwise from 6 as nighttime depletes
- Solar data fetched from Open-Meteo alongside weather: `&daily=sunrise,sunset&timezone=auto`, `forecast_days=2`
- JS sends `SunriseTime`, `SunsetTime`, `SunriseTomorrow` as Unix timestamps via AppMessage
- Config page radio: "Steps & Battery" / "Sunrise & Sunset"
- Solar cache persists independently via `SOLAR_KEY=9` (separate from settings struct)

### Sunrise/Sunset/Daylight info lines
- Three new info line fields: Sunrise time, Sunset time, Daylight duration
- Format: `6:23am` / `7:41pm` / `13h18m`
- Custom sun icon in C at both overlay sizes

### Graceful degradation on Bluetooth disconnect
- Solar data is always restored from cache on boot — no stale gate on load
- `prv_solar_present()` gates display (never expires once data received)
- Ring uses `eff_*` timestamp roll-forward loop — handles any number of days of stale data (~1 min/day drift)
- Info lines and ring degrade/recover together

### Bluetooth disconnect indicator
- `FIELD_BT`: info line showing BT rune + `!` when phone is disconnected; invisible when connected
- Custom pixel-art BT icon in C at both overlay sizes

### Heart rate info line
- `FIELD_HEART_RATE`: heart rate in BPM (`--` when unavailable)
- Custom heart icon in C at both overlay sizes
- Available on supported models only (emery, diorite HR model)

### Settings
- `SETTINGS_KEY` bumped to `8` (added `RingMode`)
- 3 new messageKeys: `RingMode`, `SunriseTime`, `SunsetTime`, `SunriseTomorrow`
- Info line dropdowns expanded: Heart Rate, Sunrise, Sunset, Daylight

### Bug fixes
- BT icon 11px upper-left diagonal: corrected to `(ox+2, oy+4)` / `(ox+1, oy+3)`
- BT icon 11px exclamation dot: 4 explicit `draw_pixel` calls (fix diagonal artifact on e-paper)
- Sun icon: drawn at `iy - 1` for correct vertical alignment with text baseline
- Solar ring multi-day stale: roll-forward changed from `if` to `while` — valid for any staleness duration

---

## v2.2

### Preset overhaul
- 5 new themes: Violet, Jungle, Lavender, Poison, Prism
- 7 themes tweaked: Volt, Dusk, Ember, Cobalt, Jade, Sapphire, Ruby
- Retired: Crimson, Hearth, Navy, Cinnabar, Horizon
- Dim color convention: monochromatic = dark hue shade; achromatic (Slate, Ash) = DarkGray

### Info lines
- 4 configurable lines (2 above, 2 below time)
- Fields: None, Day, Date, Day+Date, Steps, Distance, Calories, Temp °F, Temp °C, Battery
- Dynamic centering via `graphics_text_layout_get_content_size`

### Live weather
- Open-Meteo API (free, no key) — temp °F/°C + WMO code → 6 custom weather icons
- Plain ASCII format (e.g. "72F") — no degree symbol

### Health fields
- Distance (mi or km, locale-detected), Active calories (custom flame icon)

### Overlay improvements
- Two sizes: Small (58px/LECO_36) and Large (70px/LECO_42)
- 1-min auto-hide mode (OVERLAY_AUTO)

### Color system
- 17 color slots (added HourTipColor, MinuteTipColor, Line1–4Color)
- Leading-tick highlights independently colorable

### Bug fixes
- Rect ring battery fill: left-anchored at 6 o'clock origin (all rect platforms, since v2.0)
- Round hour tick off-by-one in 12h mode
- Calories icon 1px overflow on small overlay
- Degree symbol in weather format string caused silent render failure

---

## v2.1 (2026-03-11)

- Initial public release on Rebble appstore
- 40 color presets, 12 color slots, cascade color picker
- 3 overlay modes, battery + steps ring, 24h support, all 7 platforms, B&W invert

---

## v2.0 (2026-03-03, internal)

- From-scratch rebuild by Sterling Ely + Claude
- Full color customization, cross-platform layout, config page with preset system
