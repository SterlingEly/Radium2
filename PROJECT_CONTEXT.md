# Radium 2 — Project Context

**This is the authoritative technical continuity document for this repository.**
Read this before making any code changes.

---

## Purpose

Radium 2 is a Pebble watchface built around a radial bar graph concept. The entire screen is a starburst of wedge-shaped tick marks radiating from center — hours on the bottom half, minutes on the top half. An optional center overlay shows digital time and up to four configurable info lines. A Solar Ring mode tracks daylight instead of steps and battery.

The design originated around 2015 (Sterling Ely). First implemented by MathewReiss and MicroByte. Radium 2 is a from-scratch rebuild by Sterling Ely and Claude (2026), targeting all seven Pebble platforms.

---

## Current Status

**STABLE** — Live section, changes frequently.

| | |
|---|---|
| Live version | v2.3.1 |
| Store (Rebble) | https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926 |
| Store (Repebble) | https://apps.repebble.com/69a6531826cc4f0009c65926 |
| Repo | https://github.com/SterlingEly/Radium2 (branch: `master`) |
| Next version | v2.4 — no features defined |
| Pending | Create v2.3.1 GitHub release tag via web UI |

### Version history

| Version | SETTINGS_KEY | Summary |
|---------|-------------|---------|
| v2.3.1 | 8 | HR API fix, large overlay config fix, health polling consolidation |
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
├── CONTEXT_RADIUM2.md   ← deprecated, see PROJECT_CONTEXT.md
├── README.md            ← human-facing overview
├── STORE_LISTING.md     ← store copy and release notes
├── CHANGELOG.md         ← developer changelog
└── src/
    ├── c/
    │   └── main.c       ← ~1640 lines, entire watchface C implementation
    └── pkjs/
        ├── config.js    ← config page (data URL, ~44KB HTML/JS)
        └── index.js     ← PebbleKit JS: weather fetch, solar fetch, settings relay
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
- `main.c` (~65KB) may time out on push — retry or use GitHub web UI as fallback

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
| diorite | Pebble 2 SE | 144×168 rect | B&W | Yes | No |
| emery | Pebble Time 2 | 200×228 rect | 64-color | Yes | Yes |
| flint | Pebble 2 | 144×168 rect | B&W | No | No |
| gabbro | Pebble Round 2 (Core Devices 2026) | 260×260 round | 64-color | No | No |

**HR sensors: emery and diorite only.** flint does not have HR.
**Touchscreen: emery only.**
**Large overlay default: emery and gabbro.** chalk (small round) does not get the large overlay.
**Store copy for HR:** always say "on supported models" — never list specific platforms.

### Layer stack (bottom to top)

1. Background fill
2. Tick wedges / radial arcs — minutes top half from 3°, hours bottom half from 183°
3. Inner gap strip (rect only) — prevents tick bleed into ring area
4. Outer ring — right = battery or day, left = steps or night
5. Center overlay circle
6. Info lines and time digits

### Tick geometry — rect

- **Minutes:** 12 groups × 5 ticks; 15° pitch (9° tick + 6° gap); starts at 3°. Color platforms: 1° sub-ticks with background cuts. B&W: 2° solid blocks.
- **Hours:** 12 slots; 15° pitch; starts at 183°. 12h mode: solid 9° per slot. 24h mode: two 3° sub-ticks with 3° gap (exact thirds).
- Tick thickness: `inner_short * 19/164` when overlay visible; full `inner_short` in Always Off mode.

### Tick geometry — round

`graphics_fill_radial()` on inset tick_rect. 60 × 1° minute arcs; 12 × 9° hour arcs.

### Outer ring — rect

- Constants: `RING_GAP=2`, `RING_THICK=6`, `half_w=cx-gap`, `total=half_w+h+half_w`
- Battery / day (right): left-anchored at `(cx+gap, h-t)`, fills CW — bottom → right → top
- Steps (left): right-anchored, fills CCW — bottom → left → top
- Solar night (left): anchored at 12-end, fills toward 6 — opposite of steps

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
  update_steps_health();   // steps, distance, calories via health_service_metric_accessible
  update_heart_rate();     // HR via health_service_metric_aggregate_averaged_accessible
#else
  update_steps_buffer();   // aplite: format zero-initialized steps
#endif
```

### Solar ring system

- `SOLAR_KEY=9` — separate persist key, independent of the settings struct
- On boot: always restore cached data regardless of age — stale solar data is still useful
- Display gate: `prv_solar_present()` = `s_sunrise_tomorrow > 0` — never expires once received
- Stale roll-forward: `while (now_t > eff_sunrise_tomorrow)` loop — handles any number of days
- JS fetches via Open-Meteo with `&daily=sunrise,sunset&forecast_days=2`

### Config page platform strings

`index.js` passes one of these to `config.js buildUrl()`:

| String | Platforms | Effect |
|--------|-----------|--------|
| `'aplite'` | aplite | B&W colors, no health slider |
| `'bw'` | diorite, flint | B&W colors, health slider shown |
| `'emery'` | emery | Color, large overlay toggle shown and checked |
| `'gabbro'` | gabbro | Color, large overlay toggle shown and checked |
| `'color'` | basalt, chalk | Color, no large overlay toggle |

chalk maps to `'color'` and does not receive the large overlay toggle.

---

## Critical Constants / Message Keys

**STABLE** — Changes only when settings struct is bumped.

```c
#define SETTINGS_KEY         8    // bumped v2.3 when RingMode was added
#define SOLAR_KEY            9    // solar cache, separate from settings
#define DEFAULT_STEP_GOAL    10000
#define RING_GAP             2
#define RING_THICK           6

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
#define FIELD_HEART_RATE     11   // emery and diorite only — flint has no HR sensor
#define FIELD_SUNRISE        12
#define FIELD_SUNSET         13
#define FIELD_DAYLIGHT       14

#define RING_STEPS_BATTERY   0
#define RING_SOLAR           1
```

### Settings struct (v2.3+)

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
| Config page large overlay toggle missing on emery and gabbro | v2.3.1 |
| Config page large overlay defaulting to Small despite C default being Large | v2.3.1 |
| `isLargePlatform` incorrectly included chalk | v2.3.1 |
| `health_service_metric_accessible` always returns false for HR metric | v2.3.1 |
| Health events firing on background events instead of once per minute | v2.3.1 |

### Active traps

- Weather strings must be plain ASCII — degree symbol (0xB0) silently prevents rendering
- `push_files` MCP tool sends empty content — never use it
- flint (Pebble 2) does not have an HR sensor — only emery and diorite do
- Weather format is `"%dF"` / `"%dC"` with no degree symbol and no space
- HR SDK quirk: `health_service_metric_accessible` always returns false for `HealthMetricHeartRateBPM`. Use `health_service_metric_aggregate_averaged_accessible(metric, now, now, HealthAggregationAvg, HealthServiceTimeScopeOnce)` instead.

---

## Current TODO

**LIVE** — Update as work progresses.

- Create v2.3.1 GitHub release tag via web UI (MCP cannot create tags)
- v2.4 features: none defined yet

---

## Verification Plan

Before shipping any new version:

1. Build and install on at least one physical device (currently: emery / Pebble Time 2)
2. Verify overlay size toggle appears and defaults to Large on emery
3. Verify HR shows a live BPM reading (not `--`) on emery
4. Verify solar ring transitions correctly at sunrise and sunset
5. Verify config page saves and restores all settings after watchface restart
6. Verify BT disconnect indicator appears on phone disconnect

---

## Related Projects

| Repository | URL | Relationship |
|------------|-----|-------------|
| BarGraph2 | https://github.com/SterlingEly/BarGraph2 | Sibling watchface; rebuilds Sterling's original 2013 bar graph design |
| Monogram | https://github.com/SterlingEly/Monogram | Sibling watchface; custom monogram-style digit display, currently blocked on asset creation |
| TallBoy | https://github.com/SterlingEly/TallBoy | Sibling watchface; oversized digit display, all platforms |
| PixelSampler | https://github.com/SterlingEly/PixelSampler | Developer reference tool for Pebble fonts and colors |
| radium (v1) | https://github.com/MathewReiss/radium | Original Radium v1 implementation (2016) |

---

## Source of Truth / External Links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/SterlingEly/Radium2 |
| Rebble store | https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926 |
| Repebble store | https://apps.repebble.com/69a6531826cc4f0009c65926 |

---

## Last Updated

2026-07-03 — v2.3.1 live and stable. v2.4 features not yet defined.
