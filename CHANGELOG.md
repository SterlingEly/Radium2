# Radium 2 — Changelog

---

## v2.2 (in development)

### Info lines — 4 configurable data fields
- Replaced the single fixed day/time/date overlay with **4 independently configurable info lines** (2 above, 2 below the time)
- Each line can display: None, Day, Date, Day+Date, Steps, Distance, Calories, Temp °F, Temp °C, or Battery
- Dynamic centering via `graphics_text_layout_get_content_size` — icon+text units always centered on the overlay circle
- Default layout on fresh install: None / Day / Date / None

### Live weather
- Phone JS (`index.js`) fetches current weather from **Open-Meteo** (free, no API key)
- Sends temperature (°F and °C) + WMO weather code to watch via AppMessage
- **6 custom weather icons** drawn in C at both 11px (small overlay) and 14px (large overlay): sun, partly cloudy, cloud, rain, snow, storm

### New health fields
- **Distance** — walked distance today in mi or km (auto-detected via `measurement_system_get_units`), footprint icon
- **Calories** — active kcal burned today, custom flame icon
- Health data (steps + distance + calories) consolidated into single `update_health_data()` call per movement event

### Overlay improvements
- **Two overlay sizes:** Small (58px, LECO_36_BOLD) and Large (70px, LECO_42) — Large is default on emery/gabbro
- **1 min mode** (OVERLAY_AUTO) — shake to show, auto-hides after 60 seconds
- Single-line and double-line info block positioning tuned per overlay size

### Color system expanded
- **17 color slots** (up from 12): added `HourTipColor`, `MinuteTipColor`, `Line1–4Color`
- **Leading-tick highlights** — the current hour and minute ticks independently colorable
- Color cascade improved: setting Hours/Minutes also sets their respective leading tips

### 40 presets (up from 24)
- Five rows of 8: Dark, Dark+, Light, Color, Special
- Radium is always preset #1 in Dark
- Navy (classic 2015 tweet blue/white scheme) moved to Light section (white background)
- Scarlet uses uniform red ticks matching hour and minute
- GoldEye info lines use lime green matching the outer ring

### Platform defaults
- emery/gabbro: `OVERLAY_LARGE` by default
- aplite: `ShowRing = false` by default; step goal slider hidden in config
- All platforms: default info lines = None / Day / Date / None

### Build fix
- Added forward declaration for `prv_overlay_auto_hide` to fix undeclared identifier error on gabbro

### Code quality
- `draw_info_line()` refactored with `DRAW_ICON_TEXT` helper macro — eliminates repeated measure→center→draw pattern
- Comments updated throughout for accuracy
- Stale v2.1 constants and references removed

---

## v2.1 (live)

- Initial public release on Rebble appstore
- 3 overlay modes: Always On, Shake, Always Off
- 12 color slots, 24 presets
- Battery + steps outer ring
- 24h clock support
- All 7 Pebble platforms
- B&W invert option

---

## v2.0 (internal)

- From-scratch rebuild by Sterling Ely + Claude
- Full color customization
- Cross-platform layout (rect + round)
- Config page with preset system
