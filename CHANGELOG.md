# Radium 2 — Changelog

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
- `prv_solar_valid()` gates fresh-data fetch only (36h window)
- Ring uses `eff_*` timestamp roll-forward loop — handles any number of days of stale data (~1 min/day drift)
- Info lines and ring degrade/recover together

### Bluetooth disconnect indicator
- `FIELD_BT`: info line showing BT rune + `!` when phone is disconnected; invisible when connected
- Custom pixel-art BT icon in C at both overlay sizes

### Heart rate info line
- `FIELD_HEART_RATE`: heart rate in BPM (`--` when unavailable)
- Custom heart icon in C at both overlay sizes
- Available on all health platforms (basalt, diorite, emery, flint, gabbro)

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
