# Radium 2 — Project Context

> **AI collaborators: read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) first** for the authoritative platform table, shared build rules, and role split before making any changes here.

---

## Purpose

Radium 2 is a Pebble watchface built around a radial bar graph concept — the entire screen is a starburst of wedge-shaped tick marks radiating from center. Hours fill the bottom half, minutes the top half. An optional center overlay shows digital time and up to four configurable info lines. A secondary Solar Ring mode tracks daylight instead of steps/battery.

Design originated ~2015 (Sterling Ely). First implemented by MathewReiss + MicroByte. Radium 2 is a from-scratch rebuild by Sterling Ely + Claude (2026).

---

## Current Status

| | |
|---|---|
| **Live version** | v2.3.1 |
| **Store** | https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926 |
| **Repo** | https://github.com/SterlingEly/Radium2 (branch: `master`) |
| **Next version** | v2.4 — no features defined |
| **Pending** | Create v2.3.1 GitHub release tag via web UI (MCP cannot do this) |

### Version History
| Version | SETTINGS_KEY | Key Changes |
|---------|-------------|-------------|
| v2.3.1 | 8 | HR API fix, large overlay config fix, health tick consolidation |
| v2.3 | 8 | Solar ring, BT indicator, HR, solar info lines |
| v2.2 | 7 | 4 info lines, weather, distance/calories, presets overhaul |
| v2.1 | — | Initial public release |

---

## Human / AI Role Split

**Sterling:** Design direction, visual aesthetic, preset colors, device testing, store submissions.
**Claude:** C code, JavaScript config page, GitHub commits, documentation.

---

## Repository Structure

```
SterlingEly/Radium2 (master)
├── PROJECT_CONTEXT.md     ← cross-project hub (read first)
├── CONTEXT_RADIUM2.md     ← this file
├── CHANGELOG.md
├── README.md
├── STORE_LISTING.md
└── src/
    ├── c/
    │   └── main.c         ← ~1640 lines, entire watchface
    └── pkjs/
        ├── config.js      ← config page (data URL, ~44KB)
        └── index.js       ← PebbleKit JS: weather + solar, settings relay
```

---

## Build / Deployment Rules

See `PROJECT_CONTEXT.md` for shared rules. Radium 2 specifics:
- Source path: `src/c/main.c`
- main.c (~65KB) — MCP `create_or_update_file` may time out; retry or use GitHub web UI
- UUID: `2609e817-f8f2-4ad2-8846-cb05bb67d047`

---

## Architecture

### Layer Stack (bottom to top)
1. Background fill
2. Tick wedges / radial arcs (minutes: top half from 3°; hours: bottom half from 183°)
3. Inner gap strip (rect only — erases tick bleed into ring area)
4. Outer ring: right = battery/day, left = steps/night
5. Center overlay circle
6. Info lines + time digits

### Tick Geometry — RECT
- **Minutes:** 12 groups × 5; 15° pitch (9° tick + 6° gap); start at 3°. Color: 1° sub-ticks with bg cuts. B&W: 2° solid.
- **Hours:** 12 slots; 15° pitch; start at 183°. 12h: solid 9°/slot. 24h: two 3° sub-ticks + 3° gap.
- Thickness: `inner_short * 19/164` (overlay on); full `inner_short` (overlay off)

### Tick Geometry — ROUND
- `graphics_fill_radial()` on inset tick_rect; 60 × 1° minute arcs; 12 × 9° hour arcs

### Outer Ring — RECT
- `RING_GAP=2`, `RING_THICK=6`, `half_w=cx-gap`, `total=half_w+h+half_w`
- Battery/day (right): left-anchored at `(cx+gap, h-t)`, fills CW (bottom→right→top)
- Steps (left): right-anchored, fills CCW (bottom→left→top)
- Solar night (left): anchored at 12-end, fills toward 6

### Overlay Fonts
| Size | Time font | Info line font |
|------|-----------|----------------|
| Small (58px) | `LECO_36_BOLD_NUMBERS` | `GOTHIC_18_BOLD` |
| Large (70px) | `LECO_42_NUMBERS` | `GOTHIC_24_BOLD` |

Large is default on emery + gabbro.

### Health Data
All health data polled once/minute from `tick_handler`. No `health_service_events_subscribe`.
```c
#if defined(PBL_HEALTH)
  update_steps_health();   // steps, distance, calories
  update_heart_rate();     // HR via aggregate_averaged_accessible
#else
  update_steps_buffer();   // aplite: format zero-initialized steps
#endif
```

**HR SDK quirk (v2.3.1 fix):** `health_service_metric_accessible` always returns false for `HealthMetricHeartRateBPM`. Use `health_service_metric_aggregate_averaged_accessible(metric, now, now, HealthAggregationAvg, HealthServiceTimeScopeOnce)` instead.

### Solar Ring System
- `SOLAR_KEY=9` — separate persist key, independent of settings struct
- On boot: always restore cached data (stale is still useful for display)
- Display gate: `prv_solar_present()` = `s_sunrise_tomorrow > 0` — never expires
- Stale roll-forward: `while (now_t > eff_sunrise_tomorrow)` — handles any days of staleness
- JS fetches via Open-Meteo `&daily=sunrise,sunset&forecast_days=2`

---

## Critical Constants / Message Keys

```c
#define SETTINGS_KEY         8    // v2.3+; bumped from 7 (added RingMode)
#define SOLAR_KEY            9    // separate solar cache
#define DEFAULT_STEP_GOAL    10000
#define RING_GAP             2
#define RING_THICK           6
#define OVERLAY_ALWAYS_ON    0
#define OVERLAY_OFF          1
#define OVERLAY_SHAKE        2
#define OVERLAY_AUTO         3    // shake shows, auto-hides after 60s
#define OVERLAY_AUTO_HIDE_MS 60000
#define OVERLAY_SMALL        0
#define OVERLAY_LARGE        1    // default on emery + gabbro
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
#define FIELD_BT             10   // BT rune+! when disconnected
#define FIELD_HEART_RATE     11   // emery and diorite ONLY — no HR on flint
#define FIELD_SUNRISE        12
#define FIELD_SUNSET         13
#define FIELD_DAYLIGHT       14
#define RING_STEPS_BATTERY   0
#define RING_SOLAR           1
```

### Settings Struct (v2.3+)
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
} RadiumSettings;
```

### Config Page Platform Strings (index.js → config.js)
`'aplite'` | `'bw'` (diorite/flint) | `'emery'` | `'gabbro'` | `'color'` (basalt/chalk)

chalk = `'color'` — does NOT get large overlay toggle.

### Preset System (40 presets, 5 × 8)
**Dark (0–7):** Radium, Scarlet, Ember, Cobalt, Volt, Slate, Violet, Dusk
**Dark+ (8–15):** Ocean, Aurora, Solar, Venom, Reactor, Neon, Blossom, Jungle
**Light (16–23):** Paper, Jade, Sapphire, Ruby, Mint, Rose, Lavender, Sepia
**Color (24–31):** Teal, Flame, Midnight, Forest, Plum, Poison, Ultraviolet, Ash
**Special (32–39):** Boreal, Cosmos, Prism, Inferno, Triadic, GoldEye, Rainbow, Radium+

**Radium** (slot 0, default): GColorGreen lit, GColorMintGreen tips, GColorDarkGreen dim.
**Radium+** (slot 39): green hours/battery + cyan minutes/steps, white tips.

---

## Known Bugs / Known Traps

| Bug | Fixed |
|-----|-------|
| Battery ring right-anchored from corner (rect) | v2.2 |
| Round hour tick off-by-one in 12h mode | v2.2 |
| Degree symbol (°/0xB0) in weather string → silent render failure | v2.2 |
| Calories icon 1px overflow on small overlay | v2.2 |
| BT icon exclamation dot: diagonal artifact on e-paper | v2.3 |
| Solar ring dying after 1+ days stale (`if` → `while`) | v2.3 |
| Config page large overlay toggle missing on emery/gabbro | v2.3.1 |
| Config page large overlay defaulting to Small on emery/gabbro | v2.3.1 |
| `isLargePlatform` incorrectly included chalk | v2.3.1 |
| `health_service_metric_accessible` always false for HR metric | v2.3.1 |
| Health events firing on background events instead of once/minute | v2.3.1 |

**Active traps:**
- Weather strings must be plain ASCII — degree symbol (0xB0) silently breaks rendering
- `push_files` MCP tool sends **empty content** — never use it
- flint does NOT have HR sensor — only emery and diorite do
- Weather format: `"%dF"` / `"%dC"` — no degree symbol, no space

---

## Current TODO

- Create v2.3.1 GitHub release tag via web UI
- v2.4 features: none defined

---

## Verification Plan

Before any new release:
1. Build and install on emery (physical device)
2. Verify overlay size toggle appears + defaults to Large on emery
3. Verify HR shows BPM reading (not `--`) on emery
4. Verify solar ring transitions correctly at sunrise/sunset
5. Verify config page saves and restores all settings after watchface restart
6. Verify BT disconnect indicator appears on phone disconnect

---

## Source of Truth / External Links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/SterlingEly/Radium2 |
| Rebble store | https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926 |
| Repebble store | https://apps.repebble.com/69a6531826cc4f0009c65926 |
| Original Radium v1 | https://github.com/MathewReiss/radium |

---

## Last Updated

2026-07-01 — v2.3.1 live. Next: v2.4, no features defined.
