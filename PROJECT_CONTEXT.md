# Radium 2 — Project Context

**This is the authoritative technical continuity document for this repository.**
Read this before making any code changes.

---

## Purpose

Radium 2 is a Pebble watchface built around a radial bar graph concept. The entire screen is a starburst of wedge-shaped tick marks radiating from center — hours on the bottom half, minutes on the top half. An optional center overlay shows digital time and up to four configurable info lines. A Solar Ring mode tracks daylight instead of steps and battery.

The design originated around 2015 (Sterling Ely). First implemented by MathewReiss and MicroByte. Radium 2 is a from-scratch rebuild by Sterling Ely and Claude (2026), targeting all seven Pebble platforms.

---

## Current Status

**LIVE** — update as work progresses.

| | |
|---|---|
| Live (public) version | v2.3.1 |
| Store (Rebble) | https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926 |
| Store (Repebble) | https://apps.repebble.com/radium-2_69a6531826cc4f0009c65926 (compatibility route also works: https://apps.repebble.com/69a6531826cc4f0009c65926) |
| Repo | https://github.com/SterlingEly/Radium2 (branch: `master`) |
| Next public version | **v2.4** — unreleased work is on `master` (below) |
| GitHub releases | v2.1, v2.2, v2.3, v2.3.1 (v2.3.1 release created 2026-09-28 on commit `91eda9f`) |

### Versioning rule
Sterling increments the version number **only on official store releases.** Everything on `master` after v2.3.1 is "v2.4 (unreleased)" regardless of how many internal iterations it took. `package.json` still says `2.3.0` (it lags the live v2.3.1) — set it to the real number when v2.4 ships.

### v2.4 (unreleased) — on master, NOT yet compiled or device-tested
All of the following was written in one pass on 2026-10-13 without a build; treat each item as unverified until Sterling has run it on a watch.

**Fixes**
- Large-overlay toggle now appears on gabbro: `index.js` was passing `'chalk'` through and never `'gabbro'` (the v2.3.1 fix only changed `config.js`, so only emery was actually fixed). chalk now correctly gets the plain `'color'` UI. Saves made while the toggle was hidden stored "Small", so on first opening settings it may show unchecked — flip it on and save.
- Round platforms (gabbro, chalk) ignore Quick View: `draw_layer` uses `layer_get_bounds` instead of `layer_get_unobstructed_bounds`, so Quick View just covers the face instead of shrinking/moving it. Rect platforms (emery) still fit to the unobstructed area.
- Aplite config page: `applyPlatform()` treated `'aplite'` as a color platform (shown color pickers, hid the invert toggle) ever since `index.js` started passing `'aplite'` in v2.3.1. Fixed.
- Solar-mode ring fallback: with Sunrise & Sunset selected but no solar data cached yet, the ring drew the steps value with solar-night geometry. It now falls back to Steps & Battery completely (`solar_active = RING_SOLAR && prv_solar_present()`).
- Stale `FIELD_HEART_RATE` comment corrected (HR is emery and diorite HR model only).

**New info-line fields** (IDs 15–20): UV index, Air quality (US AQI), Step pace %, Typical steps, Light left, Sleep. See Constants.

**Pace** (steps vs. a typical day: same-weekday average, last 4 weeks, via the SDK):
- *Color steps by pace* (color platforms): the lit steps arc takes the pace color; fill length is still steps ÷ goal. Medium palette, brightest/boldest hue per step (≤30% red, ≤60% orange, ≤90% yellow, ≤200% green, ≤400% blue, ≤700% violet, beyond magenta — same thresholds as TallBoy).
- *Pace marker on ring*: a notch on the steps arc where a typical day would have put you (typical-so-far ÷ goal).
- Both default **off**, apply only in Steps & Battery ring mode, and fall back silently (preset color / no marker) when there is no usable typical-steps history.

**Data fetch**: `index.js` does one location lookup, then forecast (now with `uv_index`) then air-quality (`us_aqi`), and sends everything in a **single** AppMessage. If one request fails the other's data is still sent.

### Version history

| Version | SETTINGS_KEY | Summary |
|---------|-------------|---------|
| v2.4 (unreleased) | 8 | UV/AQI/pace/typical/light-left/sleep lines, pace color + marker, Quick View on round, gabbro toggle, aplite/solar fixes |
| v2.3.1 | 8 | HR API fix, large overlay config fix (emery), health polling consolidation |
| v2.3 | 8 | Solar ring, BT disconnect indicator, HR field, solar info lines |
| v2.2 | 7 | Four configurable info lines, live weather, distance, calories, preset overhaul |
| v2.1 | — | Initial public release |

---

## Human / AI Role Split

**Sterling Ely** — Design direction, visual aesthetic, preset colors, device testing, store submissions, final approval on all changes.

**Claude (AI collaborator)** — C code, JavaScript config page, GitHub commits, documentation. Proposes and executes; Sterling approves. Does not invent design decisions.

---

## Repository Structure

```
SterlingEly/Radium2 (branch: master)
├── PROJECT_CONTEXT.md   ← this file — read before making changes
├── README.md            ← human-facing overview
├── STORE_LISTING.md     ← store copy and release notes
├── CHANGELOG.md         ← developer changelog
├── package.json         ← manifest: message keys, platforms, version (lags live release)
└── src/
    ├── c/
    │   └── main.c       ← ~78KB, entire watchface C implementation
    └── pkjs/
        ├── config.js    ← config page (data URL, ~46KB HTML/JS)
        └── index.js     ← PebbleKit JS: weather/UV/AQI/solar fetch, settings relay
```

---

## Build / Deployment Rules

**STABLE** — These rarely change.

### CloudPebble rules

1. Remove the `resources/media` block from `appinfo.json` — causes "Unsupported published resource type" errors
2. Add menu icons via CloudPebble UI directly — not via GitHub import
3. No tilde (`~`) in resource filenames — breaks CloudPebble GitHub import
4. No duplicate source files at different paths — causes import validation errors
5. Always provide full files for copy-paste — never partial diffs
6. Source is at `src/c/main.c` (nested path)

### GitHub MCP rules

- Use `create_or_update_file` only — fetch the current SHA first before every push
- Never use `push_files` — it sends empty content silently
- Cannot create release tags via MCP — use GitHub web UI
- Cannot truly delete files via MCP — use GitHub web UI trash icon
- `get_file_contents` / pushes of `main.c` (~78KB) have timed out in some sessions and worked in others — retry before falling back to the GitHub web UI

### Dev environment

- CloudPebble: https://cloudpebble.repebble.com (Core Devices account)
- Rebble Developer Portal: https://dev.rebble.io

---

## Architecture

**STABLE** — Changes only with major rewrites.

### Platform table

| Platform | Watch | Screen | Color | HR | Touch |
|----------|-------|--------|-------|----|-------|
| aplite | Pebble Classic / Steel | 144×168 rect | B&W | No | No |
| basalt | Pebble Time | 144×168 rect | 64-color | No | No |
| chalk | Pebble Time Round | 180×180 round | 64-color | No | No |
| diorite | Pebble 2 (SE and HR models) | 144×168 rect | B&W | HR model only | No |
| emery | Pebble Time 2 | 200×228 rect | 64-color | Yes | Yes |
| flint | Pebble 2 Duo | 144×168 rect | B&W | No | No |
| gabbro | Pebble Round 2 (Core Devices 2026) | **260×260 round** | 64-color | **No** | see Unresolved |

**HR sensors: emery and diorite (HR model) only.** flint, gabbro, basalt, chalk, aplite have none.
**Large overlay default: emery and gabbro.** chalk (small round) does not get the large overlay or its toggle.
**Store copy for HR:** always say "on supported models" — never list specific platforms.
(Naming note: an earlier version of this table called diorite "Pebble 2 SE" and flint "Pebble 2". Per the store listing and Pixel Sampler's hardware reference, flint is the Pebble 2 Duo, and diorite covers the Pebble 2 SE and HR models with the HR sensor only on the HR model.)

### Layer stack (bottom to top)

1. Background fill
2. Tick wedges / radial arcs — minutes top half from 3°, hours bottom half from 183°
3. Inner gap strip (rect only) — prevents tick bleed into ring area
4. Outer ring — right = battery or day, left = steps or night (+ optional pace marker notch)
5. Center overlay circle
6. Info lines and time digits

### Tick geometry — rect

- **Minutes:** 12 groups × 5 ticks; 15° pitch (9° tick + 6° gap); starts at 3°. Color platforms: 1° sub-ticks with background cuts. B&W: 2° solid blocks.
- **Hours:** 12 slots; 15° pitch; starts at 183°. 12h mode: solid 9° per slot. 24h mode: two 3° sub-ticks with 3° gap (exact thirds).
- Tick thickness: `inner_short * 19/164` when overlay visible; full `inner_short` in Always Off mode.

### Tick geometry — round

`graphics_fill_radial()` on inset tick_rect. 60 × 1° minute arcs; 12 × 9° hour arcs.

### Quick View

- **Round (gabbro, chalk):** draw against `layer_get_bounds` — the face never resizes; Quick View covers it.
- **Rect (emery etc.):** draw against `layer_get_unobstructed_bounds` — the face fits the visible area.

### Outer ring — rect

- Constants: `RING_GAP=2`, `RING_THICK=6`, `half_w=cx-gap`, `total=half_w+h+half_w`
- Battery / day (right): left-anchored at `(cx+gap, h-t)`, fills CW — bottom → right → top
- Steps (left): right-anchored, fills CCW — bottom → left → top
- Solar night (left): anchored at 12-end, fills toward 6 — opposite of steps
- Pace marker: a 3px notch along the steps path at `total * (typical ÷ goal)`, protruding 2px inward (into the ring gap strip), drawn in `col_time`

### Outer ring — round

`graphics_fill_radial` on the full bounds. Steps arc spans 183°→357°; battery 3°→177°. Pace marker is a ~3° arc at `183 + 174 * (typical ÷ goal)`, thickness `RING_THICK + 2`.

### Overlay sizes and fonts

| Size | Radius | Time font | Info line font |
|------|--------|-----------|----------------|
| Small | 58px | `LECO_36_BOLD_NUMBERS` | `GOTHIC_18_BOLD` |
| Large | 70px | `LECO_42_NUMBERS` | `GOTHIC_24_BOLD` |

Large is the default on emery and gabbro.

### Health data polling

All health data is polled once per minute from `tick_handler`. No background `health_service_events_subscribe` call. This is intentional.

```c
#if defined(PBL_HEALTH)
  update_steps_health();   // steps, distance, calories, typical-steps (weekly avg), sleep; then update_pace_buffers()
  update_heart_rate();     // HR via health_service_metric_aggregate_averaged_accessible
#else
  update_steps_buffer();   // aplite: format zero-initialized steps
#endif
```

**HR SDK quirk:** `health_service_metric_accessible()` always reports `HealthMetricHeartRateBPM` unavailable. Use `health_service_metric_aggregate_averaged_accessible(metric, now, now, HealthAggregationAvg, HealthServiceTimeScopeOnce)`, then `health_service_peek_current_value()`.

### Pace system (v2.4)

- `s_steps_expected` = `health_service_sum_averaged(StepCount, start_of_today, now, HealthServiceTimeScopeWeekly)` — same-weekday average up to now; `-1` when unavailable.
- `prv_pace_pct()` = steps ÷ typical ×100 (capped 999); `-1` when typical < `PACE_MIN_EXPECTED` (300) — early in the day the typical number is tiny and the percentage meaningless.
- Pace color applies only when `s_pace.PaceColor && !solar_active && pace >= 0`; marker only when `s_pace.PaceMarker && !solar_active && StepGoal > 0 && typical >= PACE_MIN_EXPECTED`.
- Pace options live in their own persist blob (`PACE_KEY=10`, `PaceSettings {bool PaceColor; bool PaceMarker;}`), **not** in `RadiumSettings`, so adding them never changed the settings layout or reset anyone's saved settings.

### UV / AQI (v2.4)

- JS sends `UvIndex` (forecast API `current=uv_index`) and `AqiIndex` (air-quality API `current=us_aqi`). `-1` on the watch = never received (UV 0 is a real reading).
- Both carry a receive timestamp and **hide ("--") after 3 hours** without an update (`ENV_MAX_AGE`). Sunrise/sunset never age out. Temperature keeps its older behavior (no age-out).
- US AQI runs 0–500, so the text can be three digits ("AQI 142").
- Attribution: Open-Meteo requires crediting the CAMS ENSEMBLE data provider for air-quality data — add to store/README copy before release.

### Solar ring system

- `SOLAR_KEY=9` — separate persist key, independent of the settings struct
- On boot: always restore cached data regardless of age — stale solar data is still useful
- Display gate: `prv_solar_present()` = `s_sunrise_tomorrow > 0` — never expires once received
- Stale roll-forward: `prv_solar_roll()` loops `while (now_t > sunrise_tomorrow)` — handles any number of days (shared by the ring and the "Light left" line)
- JS fetches via Open-Meteo with `&daily=sunrise,sunset&forecast_days=2`

### Config page platform strings

`index.js` passes one of these to `config.js buildUrl()`:

| String | Platforms | Effect |
|--------|-----------|--------|
| `'aplite'` | aplite | B&W section, no health (no step goal, no pace) |
| `'bw'` | diorite, flint | B&W section, health shown; pace marker only (no pace color) |
| `'emery'` | emery | Color, large overlay toggle shown and checked by default |
| `'gabbro'` | gabbro | Color, large overlay toggle shown and checked by default |
| `'color'` | basalt, chalk | Color, no large overlay toggle |

`applyPlatform()` shows the color section only when the platform is neither `'bw'` nor `'aplite'`.

---

## Critical Constants / Message Keys

**STABLE** — Changes only when the settings struct is bumped.

```c
#define SETTINGS_KEY         8    // bumped v2.3 when RingMode was added
#define SOLAR_KEY            9    // solar cache, separate from settings
#define PACE_KEY             10   // pace options, separate from settings (v2.4)
#define DEFAULT_STEP_GOAL    10000
#define RING_GAP             2
#define RING_THICK           6
#define ENV_MAX_AGE          (3*3600)   // UV/AQI age-out
#define PACE_MIN_EXPECTED    300        // below this, pace is hidden

#define OVERLAY_ALWAYS_ON    0
#define OVERLAY_OFF          1
#define OVERLAY_SHAKE        2
#define OVERLAY_AUTO         3    // shake to show, auto-hides after 60 seconds
#define OVERLAY_AUTO_HIDE_MS 60000
#define OVERLAY_SMALL        0
#define OVERLAY_LARGE        1    // default on emery and gabbro

#define FIELD_NONE           0
#define FIELD_DAY_LONG       1    // "SATURDAY"
#define FIELD_DATE           2    // "MAR 21"
#define FIELD_DAY_DATE       3    // "SAT MAR 21"
#define FIELD_STEPS          4
#define FIELD_TEMP_F         5
#define FIELD_TEMP_C         6
#define FIELD_BATTERY        7
#define FIELD_DISTANCE       8
#define FIELD_CALORIES       9
#define FIELD_BT             10   // BT rune visible when disconnected, blank when connected
#define FIELD_HEART_RATE     11   // emery and diorite HR model only
#define FIELD_SUNRISE        12
#define FIELD_SUNSET         13
#define FIELD_DAYLIGHT       14
#define FIELD_UV             15   // "UV 5"
#define FIELD_AQI            16   // "AQI 42", haze icon
#define FIELD_PACE           17   // "112%", footprint icon
#define FIELD_TYPICAL        18   // "typ 4,200", footprint icon
#define FIELD_LIGHT_LEFT     19   // daylight left by day / time to sunrise by night
#define FIELD_SLEEP          20   // "Zz 7h05m", no icon

#define RING_STEPS_BATTERY   0
#define RING_SOLAR           1
```

`config.js` dropdown values must match the `FIELD_*` IDs above.

### Settings struct (v2.3+, unchanged in v2.4)

```c
typedef struct {
  GColor BackgroundColor, OverlayColor, TimeColor;
  GColor LitHourColor, LitMinuteColor, LitBatteryColor, LitStepsColor;
  GColor DimHourColor, DimMinuteColor, DimBatteryColor, DimStepsColor;
  GColor HourTipColor, MinuteTipColor;
  GColor Line1Color, Line2Color, Line3Color, Line4Color;
  int Line1Field, Line2Field, Line3Field, Line4Field;
  int StepGoal, OverlayMode, OverlaySize;
  bool InvertBW, ShowRing;
  int RingMode;
} RadiumSettings;  // persisted at SETTINGS_KEY=8
```

### Message keys (37 total in `package.json`)

The original 33 (colors, fields, `StepGoal`, `OverlayMode`, `OverlaySize`, `InvertBW`, `ShowRing`, `WeatherTempF/C`, `WeatherCode`, `RingMode`, `SunriseTime`, `SunsetTime`, `SunriseTomorrow`) plus, appended in v2.4: `UvIndex`, `AqiIndex`, `PaceColor`, `PaceMarker`. New keys were appended so existing key numbering is unchanged.

### Preset system (40 presets, 5 × 8)

**Dark (0–7):** Radium, Scarlet, Ember, Cobalt, Volt, Slate, Violet, Dusk
**Dark+ (8–15):** Ocean, Aurora, Solar, Venom, Reactor, Neon, Blossom, Jungle
**Light (16–23):** Paper, Jade, Sapphire, Ruby, Mint, Rose, Lavender, Sepia
**Color (24–31):** Teal, Flame, Midnight, Forest, Plum, Poison, Ultraviolet, Ash
**Special (32–39):** Boreal, Cosmos, Prism, Inferno, Triadic, GoldEye, Rainbow, Radium+

Radium (slot 0, default): GColorGreen lit, GColorMintGreen tips, GColorDarkGreen dim.
Radium+ (slot 39): green hours/battery, cyan minutes/steps, white tips.

---

## Known Bugs / Known Traps

**LIVE** — Update as issues are found and fixed.

### Fixed bugs

| Bug | Version fixed |
|-----|---------------|
| Battery ring bottom fill right-anchored from corner (rect) | v2.2 |
| Round hour tick off-by-one in 12h mode | v2.2 |
| Degree symbol (0xB0) in weather format string causes silent render failure | v2.2 |
| Calories icon 1px overflow on small overlay | v2.2 |
| BT icon exclamation dot: diagonal artifact on e-paper | v2.3 |
| Solar ring dying after 1+ days of stale data (`if` → `while` roll-forward) | v2.3 |
| Config page large overlay toggle missing on emery | v2.3.1 |
| Config page large overlay defaulting to Small despite C default being Large (emery) | v2.3.1 |
| `health_service_metric_accessible` always returns false for HR metric | v2.3.1 |
| Health events firing on background events instead of once per minute | v2.3.1 |
| Large overlay toggle missing on gabbro (`index.js` passed `'chalk'`, never `'gabbro'`) | v2.4 (unreleased) |
| Quick View shrank/moved the face on round platforms | v2.4 (unreleased) |
| Aplite config page showed color pickers and hid invert (`applyPlatform`) — regression present in v2.3.1 | v2.4 (unreleased) |
| Solar mode with no cached data drew steps with night geometry | v2.4 (unreleased) |

### Active traps

- Weather strings must be plain ASCII — degree symbol (0xB0) silently prevents rendering; format is `"%dF"` / `"%dC"`
- `push_files` MCP tool sends empty content — never use it
- **HR:** `health_service_metric_accessible` is useless for heart rate; only emery and diorite (HR model) have the sensor — flint, gabbro, basalt, chalk and aplite do not
- **Gabbro is a 260×260 round color screen with no HR** — never group it with the B&W rect platforms or with chalk (180×180)
- **Platform strings:** `index.js` and `config.js` must agree — a platform handled in one but not the other silently falls back to the default UI (this is how both the gabbro toggle bug and the aplite regression happened)
- **Settings blob:** do not append fields to `RadiumSettings` casually — it is read/written whole at `SETTINGS_KEY`. Put new options in their own small persist blob (as `PACE_KEY` does)
- `package.json` `version` lags the live release; it is only a manifest value — bump it deliberately at release time
- Aplite memory: v2.4 added ~12KB of C source; aplite's app-size limit has not been checked against it — watch the CloudPebble build output for aplite

---

## Current TODO

**LIVE** — Update as work progresses.

1. **Build v2.4 in CloudPebble and device-test** (nothing in v2.4 has been compiled yet). Priorities: gabbro large-overlay toggle; Quick View on gabbro; UV/AQI lines populate; pace color + marker; new info lines; aplite config page and aplite binary size
2. Decide the default for *Color steps by pace* and *Pace marker* (currently both off)
3. Tune `PACE_MIN_EXPECTED` (300) if the early-morning cutoff feels wrong
4. Decide whether rect platforms (emery) should also ignore Quick View, for consistency with round
5. Before release: add the CAMS ENSEMBLE / Open-Meteo attribution to `STORE_LISTING.md` and README; add v2.4 release notes; set `package.json` version; create the GitHub release tag via the web UI
6. Candidate lines not yet added: typical full-day step total, total (active + resting) calories

---

## Verification Plan

Before shipping any new version:

1. Build for all seven platforms in CloudPebble (watch aplite size) and install on at least one physical device (currently emery; gabbro now available)
2. Large-overlay toggle appears and defaults correctly on emery and gabbro; Quick View leaves the gabbro face unmoved
3. HR shows a live BPM (not `--`) on emery
4. UV and AQI lines show values after the phone connects, and read `--` after 3 hours without an update
5. Pace: with *Color steps by pace* on, the steps arc color tracks pace; fill length still matches steps ÷ goal; the marker sits at typical ÷ goal; both disappear cleanly with no history or in solar mode
6. Solar ring transitions at sunrise/sunset; selecting Sunrise & Sunset before any data arrives shows a normal steps ring
7. Config page saves and restores all settings across watchface restart; aplite shows the B&W section
8. BT disconnect indicator appears on phone disconnect

---

## Related Projects

| Repository | URL | Relationship |
|------------|-----|-------------|
| TallBoy | https://github.com/SterlingEly/TallBoy | Sibling watchface; the pace color, UV/AQI/sleep/typical-steps data types and the 3-hour hide-when-stale rule were ported from here |
| BarGraph2 | https://github.com/SterlingEly/BarGraph2 | Sibling watchface; rebuilds Sterling's original 2013 bar graph design |
| Monogram | https://github.com/SterlingEly/Monogram | Sibling watchface scaffolded from this repo; custom monogram-style digits, blocked on asset creation |
| PixelSampler | https://github.com/SterlingEly/PixelSampler | Developer reference tool for Pebble fonts, colors and hardware capabilities (its hardware table is the best-sourced platform reference) |
| radium (v1) | https://github.com/MathewReiss/radium | Original Radium v1 implementation (2016) |

---

## Source of Truth / External Links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/SterlingEly/Radium2 |
| Rebble store | https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926 |
| Repebble store | https://apps.repebble.com/radium-2_69a6531826cc4f0009c65926 |
| Open-Meteo forecast API | https://open-meteo.com/en/docs |
| Open-Meteo air-quality API | https://open-meteo.com/en/docs/air-quality-api |

---

## Unresolved Questions

- **Gabbro touchscreen:** this file has said "touch: emery only"; PixelSampler's context says gabbro has a secondary touchscreen. Unverified — Sterling has the device and can confirm.
- Whether gabbro exposes calories/sleep/steps in the SDK as expected (PixelSampler flagged calories as unconfirmed pending hardware).
- Whether an appended `RadiumSettings` field would have been safe without a `SETTINGS_KEY` bump (never tested; avoided by using `PACE_KEY`).

---

## Last Updated

2026-10-13 — v2.3.1 live and stable. v2.4 (unreleased) work on master, uncompiled: gabbro/Quick View/aplite/solar fixes, UV/AQI/pace/typical/light-left/sleep lines, pace color + marker.

Previous: 2026-09-28 — v2.3.1 GitHub release created (tag `v2.3.1` on `91eda9f`, the 2026-05-24 release commit); release-tag TODO closed.
