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
Written 2026-10-13 and 2026-10-14 without a build; treat each item as unverified until Sterling has run it on a watch. (Sterling began testing the Round 2 / Time 2 builds on the evening of 2026-10-13; results not yet recorded here, except where noted.)

**Fixes**
- Large-overlay option now appears on gabbro: `index.js` was passing `'chalk'` through and never `'gabbro'` (the v2.3.1 fix only changed `config.js`, so only emery was actually fixed). chalk now correctly gets the plain `'color'` UI. Saves made while the option was hidden stored "Small", so on first opening settings it may show Small — pick the size you want and save.
- Round platforms (gabbro, chalk) ignore Quick View: `draw_layer` uses `layer_get_bounds` instead of `layer_get_unobstructed_bounds`, so Quick View just covers the face instead of shrinking/moving it. Rect platforms (emery) still fit to the unobstructed area (Sterling is reviewing whether he likes that — see TODO).
- Aplite config page: `applyPlatform()` treated `'aplite'` as a color platform (shown color pickers, hid the invert toggle) ever since `index.js` started passing `'aplite'` in v2.3.1. Fixed.
- Solar-mode ring fallback: with Sunrise & Sunset selected but no solar data cached yet, the ring drew the steps value with solar-night geometry. It now falls back to Steps & Battery completely (`solar_active = RING_SOLAR && prv_solar_present()`).
- Stale `FIELD_HEART_RATE` comment corrected (HR is emery and diorite HR model only).

**Three overlay sizes** (emery and gabbro): Small / Medium / **Large**. Stored `OverlaySize` value 1 used to be "large" and is now **Medium** with an identical look, so no saved setting changes meaning; Medium remains the default on emery. The new **Large** (value 2) uses `FONT_KEY_LECO_60_NUMBERS_AM_PM` (biggest system LECO, regular cut; emery/gabbro only, SDK 4.9.148+), the same GOTHIC_24_BOLD lines and 16px icons as Medium, and a **90px-radius** circle (`OVERLAY_LARGE_R`; history 84 emery / 100 gabbro → 80 / 94 → 80 → 86 → 91 → 85 → 90 — see the final-state section below). The Large line spacing and nudges were a first estimate scaled from Medium and have been tuned on device since (top lines +4 on 2026-10-16); expect further tweaks. **Gabbro now defaults to Large** (emery stays on Medium). Elsewhere Large is clamped to Medium. The settings page has a three-way selector in place of the old checkbox.

**New info-line fields** (IDs 15–20): UV index, Air quality (US AQI), Step pace %, Typical steps, Light left, Sleep. See Constants.

**Pace** (steps vs. a typical day: same-weekday average, last 4 weeks, via the SDK):
- *Color steps by pace* (color platforms): the lit steps arc takes the pace color; fill length is still steps ÷ goal. Medium palette, brightest/boldest hue per step (≤30% red, ≤60% orange, ≤90% yellow, ≤200% green, ≤400% blue, ≤700% violet, beyond magenta — same thresholds as TallBoy).
- *Pace marker on ring*: a notch on the steps arc where a typical day would have put you (typical-so-far ÷ goal).
- Both **default on** (Sterling's decision, 2026-10-13, committed by him in `main.c`; the settings page shows them checked to match). Apply only in Steps & Battery ring mode, and fall back silently (preset color / no marker) when there is no usable typical-steps history. A freshly set-up watch has no history, so pace shows nothing for about a week.
- **Pace marker color** (color platforms, added 2026-10-14): a color picker on the settings page (`PaceMarkerColor`). Until the config page has sent one (`MarkerSet` false) the marker follows `TimeColor`; choosing a preset in the config page sets the picker to that preset's time-text color. B&W platforms have no picker.

**Battery ring color override** (color platforms, added 2026-10-14; `BattColorOverride`, **default off**): an optional setting that colors the battery **ring** by level — ≤20% red, ≤50% yellow, otherwise green. It applies to the ring only and only in Steps & Battery mode; the info-line battery text keeps the theme's line colors (an earlier version that also recolored the info line was rejected by Sterling). On light backgrounds (`prv_is_light`: R+G+B ≥ 6 of 9) the bright hues wash out, so `prv_batt_level_colors` uses darker lit colors (DarkCandyAppleRed / WindsorTan / JaegerGreen) and forces the unfilled track to a pale tint of the same hue (Melon / PastelYellow / MintGreen); on dark backgrounds the lit colors are Red / Yellow / Green and the track is a dark shade (BulgarianRose / ArmyGreen / DarkGreen). B&W platforms have no such option.

**Ring and gap (gabbro):** `RING_THICK` is **8** and `RING_GAP` is **6** on gabbro (Sterling, 2026-10-17; it was 6 / 4 after 2026-10-14, and 6 / 2 before). Everywhere else they stay 6 / 2. On gabbro the ring spans radius 122..130 and the ticks end at 130 − 8 − 6 = 116. Both are per-platform `#define`s; making thickness/gap user-configurable is still only a candidate. `MARKER_EXTRA` (gabbro 3, others 2) sets how far the pace notch reaches past the ring: ring + 3 = halfway across gabbro's 6px gap (Sterling, 2026-10-17).

**Data fetch**: `index.js` does one location lookup, then forecast (now with `uv_index`) then air-quality (`us_aqi`), and sends everything in a **single** AppMessage. If one request fails the other's data is still sent.

**Overlay alignment pass (2026-10-14, labeled "v2.5" in the `main.c` comments; unreleased, uncompiled — fold into whichever public number Sterling picks, per the versioning rule):**
- **Icons are now TallBoy's** — same pixel art, and the same icon-to-text relation: small tier = 12px icon, 3px gap, Gothic 18 Bold, 20px text box, icon top 4px below the box top; large tier = 16px icon, 4px gap, Gothic 24 Bold, 28px text box, icon top 9px below the box top (`SMALL_/LARGE_ICON_W`, `_ICON_GAP`, `_ICON_DY`, `_BOX_H`). Replaces the old 11px/14px set. The BT disconnected rune is centered and no longer has the "!" dot. `draw_weather_icon` (type 0–5) is kept as the dispatcher.
- **Circles standardized** to **60 / 70 / 80** (`OVERLAY_SMALL_R / MEDIUM_R / LARGE_R`) on every platform; the per-platform `#if` for Large is gone. Small was 58. Side effect: gabbro Large dropped from 94 to 80. (Large was later raised to **90** — see the final-state section below.)
- **Fonts (as of 2026-10-14; Large was reverted to regular on 2026-10-16):** Small = `LECO_36_BOLD_NUMBERS` (already bold), Large = `LECO_60_BOLD_NUMBERS_AM_PM` (was the regular cut). Medium = regular `LECO_42_NUMBERS` — **Pebble has no Leco 42 bold** (system bold Lecos are 20, 26_AM_PM, 32, 36, 38, 60_BOLD_NUMBERS_AM_PM). A 3×3 overstrike hack for Medium was tried and removed the same day at Sterling's request; Sterling found the bold Large too heavy on device and reverted it; he has not asked for Medium to become `LECO_38_BOLD_NUMBERS` (a downsize close to Small's 36).
- **Next Gothic Bold size up** from 24 is `GOTHIC_28_BOLD` (then 36) — not implemented; it would need a ≈20px icon set and probably a bigger circle.

**Final state after device review (Sterling, 2026-10-16 / 2026-10-17; code on `master` at `d3ae670`, uncompiled except for what Sterling has run on a Round 2):**
- **Fonts:** Small `LECO_36_BOLD_NUMBERS` (no regular 36 exists), Medium `LECO_42_NUMBERS` regular, Large `LECO_60_NUMBERS_AM_PM` **regular** (reverted from bold 2026-10-16, commit `783ce91`). TODO 2b is resolved for Large.
- **Circles are radii 60 / 70 / 90** (diameters 120 / 140 / 180). `OVERLAY_*_R` are passed to `graphics_fill_circle`, which draws 2r+1 px across — they are radii, not diameters (Sterling remembered "70/80/90"; the real values were 60/70/80 until Large moved). Large's path: 80 → 86 (commit `82dbb7d`, "+6px" read as +6 radius) → 91 (`615b57d`, "+10px" stacked on 86) → 85 (`2005812`, "+10 diameter from the original 80", which looked identical on device) → **90** (`b677182`, Sterling's call after seeing 85). One constant for all platforms, so emery's Large is also 90 and reaches into the tick zone there (the ticks start around radius 92 horizontally); emery defaults to Medium so this only shows if Large is chosen.
- **Large top info lines** moved +4px toward the time (`top1_nudge` 4, `top2_nudge` 1) in `82dbb7d`.
- **Gabbro ring 8 / gap 6**, notch ring + 3 (see Ring and gap above).
- **Gabbro defaults to Large** in `prv_default_settings`. Saved settings win: `prv_load_settings` applies the defaults then `persist_read_data`, so an existing gabbro install keeps its saved size until Large is picked once in the config page. **Known inconsistency:** `config.js` still has the Medium radio `checked` by default for every platform (see the platform table), so a gabbro with nothing saved would show Medium in the page and send Medium on save.
- **Pace marker color** picker moved to Colors → Lit → Outer Ring (commit `23ab04e`).

### Version history

| Version | SETTINGS_KEY | Summary |
|---------|-------------|---------|
| v2.4 (unreleased; includes the 2026-10-14 "v2.5" overlay pass) | 8 | Three overlay sizes (60/70/90 radii; Large default on gabbro), TallBoy icon set, bold Small Leco only (Medium/Large regular), UV/AQI/pace/typical/light-left/sleep lines, pace color + marker (default on) + marker color, optional battery ring color override (default off), gabbro ring 8 / gap 6, Quick View on round, gabbro option, aplite/solar fixes |
| v2.3.1 | 8 | HR API fix, large overlay config fix (emery), health polling consolidation |
| v2.3 | 8 | Solar ring, BT disconnect indicator, HR field, solar info lines |
| v2.2 | 7 | Four configurable info lines, live weather, distance, calories, preset overhaul |
| v2.1 | — | Initial public release |

---

## Human / AI Role Split

**Sterling Ely** — Design direction, visual aesthetic, preset colors, device testing, store submissions, final approval on all changes. (Sterling also edits the repo directly at times — e.g. he flipped the pace defaults himself on 2026-10-13 — so fetch the current file and SHA before every push.)

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
    │   └── main.c       ← ~84KB, entire watchface C implementation
    └── pkjs/
        ├── config.js    ← config page (data URL, ~46KB+ HTML/JS)
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

- Use `create_or_update_file` only — fetch the current SHA first before every push (a stale SHA fails with a generic "error or invalid response")
- Never use `push_files` — it sends empty content silently
- Cannot create release tags via MCP — use GitHub web UI
- Cannot truly delete files via MCP — use GitHub web UI trash icon
- `get_file_contents` / pushes of `main.c` (~84KB) have timed out in some sessions and worked in others (the bridge to the Mac can also disconnect) — retry before falling back to the GitHub web UI. Fetching a directory path (e.g. `src/c`) returns file SHAs cheaply without the content.
- After pushing a large file, compare the returned blob SHA with `git hash-object` of the local copy — equal means the upload is byte-identical

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
| gabbro | Pebble Round 2 (Core Devices 2026) | **260×260 round** | 64-color | **No** | Yes (Sterling, 2026-10-13) |

**HR sensors: emery and diorite (HR model) only.** flint, gabbro, basalt, chalk, aplite have none.
**Overlay sizes:** emery and gabbro get Small / Medium / Large (Medium default on emery, Large default on gabbro since 2026-10-17); chalk and the rest only have the small overlay (no size selector).
**Large LECO_60 (regular) font:** emery and gabbro only (SDK 4.9.148+) — guarded with `HAS_LARGE_OVERLAY`.
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

`graphics_fill_radial()` on inset tick_rect. 60 × 1° minute arcs; 12 × 9° hour arcs. The inset is `RING_THICK + RING_GAP` when the ring is shown.

### Quick View

- **Round (gabbro, chalk):** draw against `layer_get_bounds` — the face never resizes; Quick View covers it.
- **Rect (emery etc.):** draw against `layer_get_unobstructed_bounds` — the face fits the visible area.

### Outer ring — rect

- Constants: `RING_GAP=2`, `RING_THICK=6` (rect is never gabbro), `half_w=cx-gap`, `total=half_w+h+half_w`
- Battery / day (right): left-anchored at `(cx+gap, h-t)`, fills CW — bottom → right → top
- Steps (left): right-anchored, fills CCW — bottom → left → top
- Solar night (left): anchored at 12-end, fills toward 6 — opposite of steps
- Pace marker: a 3px notch along the steps path at `total * (typical ÷ goal)`, protruding `MARKER_EXTRA` (2) px inward (into the ring gap strip), drawn in the marker color (`TimeColor` unless a custom marker color has been set)

### Outer ring — round

`graphics_fill_radial` on the full bounds. Steps arc spans 183°→357°; battery 3°→177°. Pace marker is a ~3° arc at `183 + 174 * (typical ÷ goal)`, thickness `RING_THICK + MARKER_EXTRA`, in the marker color. On gabbro `RING_THICK` is 8, `RING_GAP` 6 and `MARKER_EXTRA` 3 (ring radius 122..130, notch to 119, ticks end at 116); other round/rect platforms use 6 / 2 / 2.

### Overlay sizes and fonts

| Size | `OverlaySize` | Radius | Time font | Info line font / icons |
|------|---------------|--------|-----------|------------------------|
| Small | 0 | 60px | `LECO_36_BOLD_NUMBERS` | `GOTHIC_18_BOLD`, 12px icons, gap 3, icon top +4 of a 20px box |
| Medium | 1 (was "Large" through v2.3.1) | 70px | `LECO_42_NUMBERS` (regular — no bold cut exists) | `GOTHIC_24_BOLD`, 16px icons, gap 4, icon top +9 of a 28px box |
| Large | 2 (emery/gabbro only) | 90px (`OVERLAY_LARGE_R`, all platforms; radius, 180px across) | `LECO_60_NUMBERS_AM_PM` (regular) | `GOTHIC_24_BOLD`, 16px icons (same as Medium) |

Medium is the default on emery; Large is the default on gabbro. In `draw_layer`, the local `large` means "Medium or Large" (the 16px icon tier) and `xl` means Large. Per-size layout metrics (`time_h`, `cap_h`, `line_gap`, `single_offset`, `time_dy`, and the three info-line nudges) are set in one block in the overlay section; the Large values started as estimates (Medium's scaled by font size) and have been tuned on device once (top lines +4); they are still the first thing to adjust. A future bigger Large could use `GOTHIC_28_BOLD` lines but would need a third (≈20px) icon set.

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
- Pace options live in their own persist blob (`PACE_KEY=10`), **not** in `RadiumSettings`, so adding them never changed the settings layout or reset anyone's saved settings:

```c
typedef struct {
  bool   PaceColor;    // default true
  bool   PaceMarker;   // default true
  bool   BattColors;   // default false -- battery ring color override (2026-10-14)
  bool   MarkerSet;    // default false -- true once the config page sent a marker color
  GColor MarkerColor;  // only meaningful when MarkerSet
} PaceSettings;        // static s_pace = { true, true, false, false, { 0 } }
```

Fields were appended, so an older 2-byte blob loads fine and the new fields keep their defaults. The defaults apply only when nothing is stored yet; once the config page has saved, its values win. Message keys: `PaceColor`, `PaceMarker`, `PaceMarkerColor`, `BattColorOverride`.

### Battery ring color override (v2.4)

`if (s_pace.BattColors && !solar_active) prv_batt_level_colors(s_battery, prv_is_light(col_bg), &col_batt, &col_dbatt);` — ring only, color platforms only, Steps & Battery mode only (solar mode's right side is "day"). See Current Status for the palettes. The info-line battery text is intentionally **not** affected.

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
| `'bw'` | diorite, flint | B&W section, health shown; pace marker only (no pace color, no marker color, no battery override) |
| `'emery'` | emery | Color, Small/Medium/Large overlay selector (Medium checked by default — matches the C default) |
| `'gabbro'` | gabbro | Color, Small/Medium/Large overlay selector (Medium checked by default in `config.js`, but the C default is now Large — **mismatch to fix**) |
| `'color'` | basalt, chalk | Color, no overlay-size selector |

`applyPlatform()` shows the color section only when the platform is neither `'bw'` nor `'aplite'`. The overlay size radio group is `name="osize"` (ids `os0`–`os2`), saved with `rad("osize")`; platforms without the selector send 0. For `'bw'` and `'aplite'`, `PaceMarkerColor` and `BattColorOverride` are deleted from the saved payload.

---

## Critical Constants / Message Keys

**STABLE** — Changes only when the settings struct is bumped.

```c
#define SETTINGS_KEY         8    // bumped v2.3 when RingMode was added
#define SOLAR_KEY            9    // solar cache, separate from settings
#define PACE_KEY             10   // pace options, separate from settings (v2.4)
#define DEFAULT_STEP_GOAL    10000
#define RING_GAP             2    // 6 on gabbro (2026-10-17)
#define RING_THICK           6    // 8 on gabbro (2026-10-17)
#define MARKER_EXTRA         2    // pace notch reach past the ring; 3 on gabbro
#define ENV_MAX_AGE          (3*3600)   // UV/AQI age-out
#define PACE_MIN_EXPECTED    300        // below this, pace is hidden

#define OVERLAY_ALWAYS_ON    0
#define OVERLAY_OFF          1
#define OVERLAY_SHAKE        2
#define OVERLAY_AUTO         3    // shake to show, auto-hides after 60 seconds
#define OVERLAY_AUTO_HIDE_MS 60000
#define OVERLAY_SMALL        0
#define OVERLAY_MEDIUM       1    // the old "large" (value unchanged); default on emery
#define OVERLAY_LARGE        2    // v2.4: emery/gabbro only, LECO_60
// HAS_LARGE_OVERLAY is defined for emery/gabbro (SDK 4.9.148+ has the LECO_60 fonts)
// OVERLAY_SMALL_R / MEDIUM_R / LARGE_R = 60 / 70 / 90 radii on every platform (Large 80 -> 90 on 2026-10-17); gabbro defaults to Large

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

`config.js` dropdown values must match the `FIELD_*` IDs above, and the overlay size radio values must match `OVERLAY_*`.

### Settings struct (v2.3+, unchanged in v2.4)

```c
typedef struct {
  GColor BackgroundColor, OverlayColor, TimeColor;
  GColor LitHourColor, LitMinuteColor, LitBatteryColor, LitStepsColor;
  GColor DimHourColor, DimMinuteColor, DimBatteryColor, DimStepsColor;
  GColor HourTipColor, MinuteTipColor;
  GColor Line1Color, Line2Color, Line3Color, Line4Color;
  int Line1Field, Line2Field, Line3Field, Line4Field;
  int StepGoal, OverlayMode, OverlaySize;   // OverlaySize: 0 small, 1 medium, 2 large
  bool InvertBW, ShowRing;
  int RingMode;
} RadiumSettings;  // persisted at SETTINGS_KEY=8
```

### Message keys (39 total in `package.json`)

The original 33 (colors, fields, `StepGoal`, `OverlayMode`, `OverlaySize`, `InvertBW`, `ShowRing`, `WeatherTempF/C`, `WeatherCode`, `RingMode`, `SunriseTime`, `SunsetTime`, `SunriseTomorrow`) plus, appended in v2.4: `UvIndex`, `AqiIndex`, `PaceColor`, `PaceMarker`, `PaceMarkerColor`, `BattColorOverride`. New keys were appended so existing key numbering is unchanged.

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
| Battery override washed out on light themes (now darker lit colors + pale track) | v2.4 (unreleased) |

### Active traps

- Weather strings must be plain ASCII — degree symbol (0xB0) silently prevents rendering; format is `"%dF"` / `"%dC"`
- `push_files` MCP tool sends empty content — never use it
- **HR:** `health_service_metric_accessible` is useless for heart rate; only emery and diorite (HR model) have the sensor — flint, gabbro, basalt, chalk and aplite do not
- **Gabbro is a 260×260 round color screen with no HR** — never group it with the B&W rect platforms or with chalk (180×180)
- **Overlay size values:** `1` means **Medium** (it was called "large" until v2.4). Do not renumber the stored values; new sizes are appended (`2` = Large)
- **LECO_60 fonts** (`FONT_KEY_LECO_60_NUMBERS_AM_PM` / `FONT_KEY_LECO_60_BOLD_NUMBERS_AM_PM`) exist only for emery/gabbro (SDK 4.9.148+); any reference outside `#if defined(HAS_LARGE_OVERLAY)` breaks the other platforms' builds
- **Platform strings:** `index.js` and `config.js` must agree — a platform handled in one but not the other silently falls back to the default UI (this is how both the gabbro toggle bug and the aplite regression happened)
- **Settings blob:** do not append fields to `RadiumSettings` casually — it is read/written whole at `SETTINGS_KEY`. Put new options in their own small persist blob (as `PACE_KEY` does; `PaceSettings` has already grown by appending fields)
- **Battery override scope:** ring only. Do not recolor the info-line battery text — Sterling rejected that
- **Light-theme colors:** fixed bright hues (red/yellow/green) wash out on light backgrounds; any new level-based color needs a light-theme variant (see `prv_is_light`)
- `package.json` `version` lags the live release; it is only a manifest value — bump it deliberately at release time
- Aplite memory: v2.4 added ~14KB of C source; aplite's app-size limit has not been checked against it — watch the CloudPebble build output for aplite
- Sterling edits files directly too; always fetch the current SHA (and re-read the file if the commit log shows a newer commit) before pushing

---

## Current TODO

**LIVE** — Update as work progresses.

1. **Build v2.4 in CloudPebble and device-test** (nothing in v2.4 has been compiled yet). Priorities: gabbro overlay size selector; Quick View on gabbro; gabbro ring 8 / gap 6 and the Large default; UV/AQI lines populate; pace color + marker + marker color; battery ring override on dark and light themes; new info lines; aplite config page and aplite binary size
2. **Tune the overlays** on emery (gabbro Large has had a first pass): time box height and the info-line nudges in the Large block; check the LECO_60 time fits the 90px circle at 24h and with long date strings, and that emery's Large 90 is acceptable (consider a per-platform radius)
2b. ~~Large bold vs regular~~ resolved 2026-10-16 (regular). Still open only if Sterling wants Medium on `LECO_38_BOLD_NUMBERS`
2c. **Config page default:** make the `config.js` overlay-size radio default to Large on gabbro so it matches the C default
3. Decide whether Large should also get bigger info lines (`GOTHIC_28_BOLD` + a ≈17px icon set) — larger job, not started
4. Tune `PACE_MIN_EXPECTED` (300) if the early-morning cutoff feels wrong
5. Sterling is reviewing whether emery should keep its fit-to-Quick-View behavior or ignore Quick View like the round watches (he currently likes the fitted behavior)
6. Possibly make ring thickness and gap user-configurable (gabbro is now 8 / 6, chosen by Sterling on device 2026-10-17)
7. Before release: add the CAMS ENSEMBLE / Open-Meteo attribution to `STORE_LISTING.md` and README; add v2.4 release notes; set `package.json` version (currently the stale `2.3.0`); create the GitHub release tag via the web UI
8. Candidate lines not yet added: typical full-day step total, total (active + resting) calories

---

## Verification Plan

Before shipping any new version:

1. Build for all seven platforms in CloudPebble (watch aplite size) and install on at least one physical device (emery and gabbro both available)
2. Overlay size selector appears on emery and gabbro with Medium checked by default; Small/Medium/Large each draw correctly with 0, 1 and 2 info lines above and below; Quick View leaves the gabbro face unmoved
3. HR shows a live BPM (not `--`) on emery
4. UV and AQI lines show values after the phone connects, and read `--` after 3 hours without an update
5. Pace: with *Color steps by pace* on, the steps arc color tracks pace; fill length still matches steps ÷ goal; the marker sits at typical ÷ goal in the chosen marker color; both disappear cleanly with no history or in solar mode
6. Battery ring override: off by default; when on, ring colors follow ≤20/≤50/else on a dark theme and on a light theme (darker lit color, pale track), and the info-line battery text is unchanged
7. Solar ring transitions at sunrise/sunset; selecting Sunrise & Sunset before any data arrives shows a normal steps ring
8. Config page saves and restores all settings across watchface restart; aplite shows the B&W section
9. BT disconnect indicator appears on phone disconnect

---

## Related Projects

| Repository | URL | Relationship |
|------------|-----|-------------|
| TallBoy | https://github.com/SterlingEly/TallBoy | Sibling watchface; the pace color, UV/AQI/sleep/typical-steps data types and the 3-hour hide-when-stale rule were ported from here. TallBoy's round wide mode later followed Radium's few-short-lines approach |
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
| Pebble system fonts (LECO_60 availability) | https://developer.repebble.com/guides/app-resources/system-fonts/ |

---

## Unresolved Questions

- Whether the 90px-radius Large overlay fits emery's 200px width (it reaches the tick zone there) — judge on device; gabbro Large at 90 looks right to Sterling.
- Whether gabbro exposes calories/sleep/steps in the SDK as expected (PixelSampler flagged calories as unconfirmed pending hardware).
- Whether an appended `RadiumSettings` field would have been safe without a `SETTINGS_KEY` bump (never tested; avoided by using `PACE_KEY`).
- Whether the new gabbro 8px ring / 6px gap reads well over a longer wear (Sterling: "damn near perfect" on first look, 2026-10-17).

(Resolved 2026-10-13: gabbro has a touchscreen, per Sterling; the earlier "touch: emery only" note was wrong.)

---

## Last Updated

2026-10-24 — Final overlay/ring state documented: Large radius 90 (regular LECO_60), gabbro ring 8 / gap 6, notch ring + 3 (`MARKER_EXTRA`), gabbro defaults to Large, marker color under Colors → Lit → Outer Ring; stale 80px / bold-Large / gap-4 statements corrected. Code on `master` at `d3ae670`. Known follow-up: `config.js` size default on gabbro (TODO 2c).

2026-10-15 — Overlay alignment pass documented (TallBoy icons/spacing, 60/70/80 circles, bold Small/Large Leco, Medium overstrike hack removed); stale 84/100 radii corrected. Code pushed: `641a7f4` then `88fde31`.

2026-10-14 — v2.3.1 live and stable. v2.4 (unreleased) work on master, uncompiled: three overlay sizes (Large/LECO_60), gabbro/Quick View/aplite/solar fixes, UV/AQI/pace/typical/light-left/sleep lines, pace color + marker (default on) + marker color, optional battery ring color override (default off, ring only, light-theme palette), gabbro ring gap 4, 39 message keys.

Previous: 2026-10-13 — three overlay sizes and the first v2.4 batch; 2026-09-28 — v2.3.1 GitHub release created (tag `v2.3.1` on `91eda9f`, the 2026-05-24 release commit); release-tag TODO closed.
