# Radium 2 — Changelog

> Version numbers here are **public release** numbers. `master` can be ahead of the last release;
> everything after the latest published version is listed under "unreleased" until it ships.

---

## v2.4 (unreleased)

Not yet compiled or device-tested as of 2026-10-13.

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
- Both options default off; Steps & Battery ring mode only; stored in their own persist key (`PACE_KEY=10`) so `RadiumSettings` and existing saved settings are untouched

### Data fetch
- One location lookup, then forecast then air-quality, then a **single** AppMessage to the watch (was: separate fetch + message per data source). A failure in one request no longer blocks the other
- New message keys appended: `UvIndex`, `AqiIndex`, `PaceColor`, `PaceMarker` (37 total)

### Bug fixes
- Large-overlay toggle now actually appears on gabbro (Pebble Round 2): `index.js` never passed `'gabbro'` to the config page. (The v2.3.1 entry below claimed this was fixed; only emery was.) Saves made while the toggle was hidden stored "Small", so it may show unchecked until set again
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
