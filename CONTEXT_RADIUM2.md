# RADIUM 2 — CONTEXT SEED FOR NEW THREAD
*Everything a fresh Claude session needs to resume Radium 2.x development*

---

## 1. WHAT IS THIS PROJECT?

**Radium 2** is a Pebble watchface built around a *radial bar graph* concept — the entire screen is a starburst of wedge-shaped tick marks radiating from the center, hours on the bottom half, minutes on the top. Design by Sterling Ely (originated ~2015), rebuilt from scratch in 2026 with Claude as technical partner.

**Sterling:** Design/concept lead. **Claude:** Code, GitHub commits, documentation.

---

## 2. HISTORY

| Project | Year | Designer | Developer |
|---------|------|----------|-----------|
| Bar Graph v1 | 2013–2014 | Sterling Ely | Cameron MacFarland |
| Radium v1 | 2015–2016 | Sterling Ely | MathewReiss + MicroByte |
| Radium 2 | 2026 | Sterling Ely | Sterling Ely + Claude |

Original Radium repo: https://github.com/MathewReiss/radium

---

## 3. LIVE STATUS

- **v2.3.1 is LIVE** on Rebble and Repebble stores
- Store URL: https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926
- GitHub repo: https://github.com/SterlingEly/Radium2 (branch: `master`)
- HEAD: `91eda9f` (docs: v2.3.1 released)
- No active feature development; master is stable

---

## 4. REPO STRUCTURE

```
SterlingEly/Radium2 (master)
├── CHANGELOG.md
├── README.md
├── STORE_LISTING.md
├── CONTEXT_RADIUM2.md     ← this file
├── package.json           ← appinfo equivalent
├── wscript
└── src/
    ├── c/
    │   └── main.c         ← ~1640 lines, entire watchface
    └── pkjs/
        ├── config.js      ← config page (data URL, ~44KB)
        └── index.js       ← PebbleKit JS: weather + solar fetch, settings relay
```

---

## 5. VERSION SPEC

### v2.3.1 (current live)
All v2.3 features plus:
- Config page large overlay toggle working correctly on emery/gabbro
- Heart rate fixed (correct SDK accessibility check: `health_service_metric_aggregate_averaged_accessible`)
- Health data polled once/minute from tick_handler (no separate health event subscription)
- Code: removed redundant `update_steps_buffer()` call, removed unused `prv_solar_valid()`

### v2.3 (previous)
- `SETTINGS_KEY = 8` (bumped from 7; added `RingMode`)
- `SOLAR_KEY = 9` (separate persist key for solar timestamps)
- **messageKeys** (33 total): all v2.2 keys plus `RingMode`, `SunriseTime`, `SunsetTime`, `SunriseTomorrow`
- New info line fields: `FIELD_BT=10`, `FIELD_HEART_RATE=11`, `FIELD_SUNRISE=12`, `FIELD_SUNSET=13`, `FIELD_DAYLIGHT=14`
- New ring mode: `RING_SOLAR=1`

### v2.2 (older)
- `SETTINGS_KEY = 7`, messageKeys (29), `uuid`: `2609e817-f8f2-4ad2-8846-cb05bb67d047`

### v2.4 (next — no features defined yet)
- Next version is v2.4; no features planned at time of writing

---

## 6. C CONSTANTS (main.c, v2.3.1)

```c
#define SETTINGS_KEY      8
#define SOLAR_KEY         9
#define DEFAULT_STEP_GOAL 10000
#define RING_GAP          2
#define RING_THICK        6

#define OVERLAY_ALWAYS_ON   0
#define OVERLAY_OFF         1
#define OVERLAY_SHAKE       2
#define OVERLAY_AUTO        3
#define OVERLAY_AUTO_HIDE_MS  60000
#define OVERLAY_SMALL  0
#define OVERLAY_LARGE  1   // default on emery + gabbro

#define FIELD_NONE       0
#define FIELD_DAY_LONG   1   // "SATURDAY"
#define FIELD_DATE       2   // "MAR 21"
#define FIELD_DAY_DATE   3   // "SAT MAR 21"
#define FIELD_STEPS      4
#define FIELD_TEMP_F     5
#define FIELD_TEMP_C     6
#define FIELD_BATTERY    7
#define FIELD_DISTANCE   8
#define FIELD_CALORIES   9
#define FIELD_BT         10  // BT rune+! when disconnected
#define FIELD_HEART_RATE 11  // emery and diorite ONLY
#define FIELD_SUNRISE    12
#define FIELD_SUNSET     13
#define FIELD_DAYLIGHT   14

#define RING_STEPS_BATTERY  0
#define RING_SOLAR          1
```

---

## 7. SETTINGS STRUCT (v2.3+)

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

Defaults: Radium preset (GColorGreen lit, GColorDarkGreen dim, GColorMintGreen tips), OVERLAY_SHAKE, OVERLAY_SMALL (LARGE on emery/gabbro), ShowRing=false on aplite, RingMode=RING_STEPS_BATTERY.

---

## 8. SOLAR DATA SYSTEM

### Solar cache (SOLAR_KEY=9)
```c
typedef struct { time_t sunrise; time_t sunset; time_t sunrise_tomorrow; } SolarCache;
```
- **Load:** Always restores cached data (no stale gate on boot)
- **Display gate:** `prv_solar_present()` = `s_sunrise_tomorrow > 0` — never expires once received
- **Fetch:** JS manages its own 30-min refresh independently; no C-side fetch gate

### Stale data ring math
```c
time_t eff_sunrise = s_sunrise, eff_sunset = s_sunset, eff_sunrise_tomorrow = s_sunrise_tomorrow;
while (now_t > eff_sunrise_tomorrow) {
    time_t day_dur       = eff_sunset - eff_sunrise;
    eff_sunrise          = eff_sunrise_tomorrow;
    eff_sunset           = eff_sunrise_tomorrow + day_dur;
    eff_sunrise_tomorrow = eff_sunrise_tomorrow + 86400;
}
```
Ring and info lines degrade/recover together; both persist indefinitely on stale data.

### Solar ring fill direction
- **Right arc (day):** 100% at sunrise, drains CW toward 6 (same as battery)
- **Left arc (night):** 100% at sunset, drains CW toward 6 — anchored at 12-end (opposite of steps)

---

## 9. HEALTH DATA

All health data is polled once per minute from `tick_handler`. No `health_service_events_subscribe`.

```c
// In tick_handler (PBL_HEALTH platforms):
update_steps_health();   // steps, distance, calories via health_service_metric_accessible
update_heart_rate();     // HR via health_service_metric_aggregate_averaged_accessible
// On aplite (no health service):
update_steps_buffer();   // just format the zero-initialized s_steps
```

**HR SDK note:** `health_service_metric_accessible` always returns false for `HealthMetricHeartRateBPM`. Use `health_service_metric_aggregate_averaged_accessible(metric, now, now, HealthAggregationAvg, HealthServiceTimeScopeOnce)` instead.

---

## 10. DRAWING ARCHITECTURE

### Layer stack (bottom to top)
1. Background fill
2. Tick wedges / radial arcs (minutes top half, hours bottom half)
3. Inner gap strip (rect only)
4. Outer ring: right=battery/day, left=steps/night
5. Center overlay circle
6. Info lines + time digits

### Tick geometry — RECT
- **Minutes:** 12 groups × 5 ticks; 15° pitch (9° tick + 6° gap); start at 3°. Color: 1° sub-ticks with bg cuts. B&W: 2° solid.
- **Hours:** 12 slots; 15° pitch; start at 183°. 12h: solid 9°/slot. 24h: two 3° sub-ticks + 3° gap.
- Thickness: `inner_short * 19/164` (overlay on); full `inner_short` (overlay off)

### Tick geometry — ROUND
- `graphics_fill_radial()` on inset tick_rect; 60 × 1° minute arcs; 12 × 9° hour arcs

### Outer ring — RECT
- `gap=5`, `RING_THICK=6`, `half_w=cx-gap`, `total=half_w+h+half_w`
- Battery/day (right): left-anchored at `(cx+gap, h-t)`, fills CW (bottom→right→top)
- Steps (left): right-anchored at `(cx-gap, h-t)`, fills CCW (bottom→left→top)
- Solar night (left): anchored at 12-end, fills toward 6

### Overlay fonts
| | Small overlay | Large overlay |
|---|---|---|
| Time | `FONT_KEY_LECO_36_BOLD_NUMBERS` | `FONT_KEY_LECO_42_NUMBERS` |
| Info lines | `FONT_KEY_GOTHIC_18_BOLD` | `FONT_KEY_GOTHIC_24_BOLD` |

---

## 11. ICONS (drawn in C, two sizes: 11px small / 14px large)

| Icon | Function | Notes |
|------|----------|-------|
| Footprint pair | `draw_steps_icon` | Steps + distance |
| Battery | `draw_battery_icon` | Fill level; charging = lightning bolt |
| BT rune | `draw_bt_icon` | BT symbol + `!`; invisible when connected |
| Heart | `draw_heart_icon` | Heart rate (emery + diorite only) |
| Flame | `draw_calories_icon` | Active calories |
| Sun | `draw_sun_icon` | Solar fields; drawn at `iy-1` for vertical alignment |
| Weather | `draw_weather_icon` | sun / partly-cloudy / cloud / rain / snow / storm |

**BT icon (11px):** spine col=3, chevron peak col=6, upper-left diagonal at `(ox+2,oy+4)/(ox+1,oy+3)`, exclamation dot = 4 explicit `draw_pixel` (NOT `fill_rect` — e-paper artifact).

---

## 12. CONFIG PAGE (config.js + index.js)

### Platform strings passed by index.js
- `'aplite'` — B&W, no health slider
- `'bw'` — B&W with health (diorite, flint)
- `'emery'` — large overlay toggle shown + checked
- `'gabbro'` — large overlay toggle shown + checked
- `'color'` — default (basalt, chalk)

**chalk (Pebble Time Round, 180×180) = `'color'` — no large overlay toggle.**

### Color slots (17)
TimeColor · LitHourColor · LitMinuteColor · LitBatteryColor · LitStepsColor · HourTipColor · MinuteTipColor · DimHourColor · DimMinuteColor · DimBatteryColor · DimStepsColor · Line1–4Color · BackgroundColor · OverlayColor

### Settings persistence
`localStorage` key `'radium2_settings'` in `index.js`

---

## 13. PRESET SYSTEM (40 presets, 5 × 8)

**Dark (0–7):** Radium, Scarlet, Ember, Cobalt, Volt, Slate, Violet, Dusk
**Dark+ (8–15):** Ocean, Aurora, Solar, Venom, Reactor, Neon, Blossom, Jungle
**Light (16–23):** Paper, Jade, Sapphire, Ruby, Mint, Rose, Lavender, Sepia
**Color (24–31):** Teal, Flame, Midnight, Forest, Plum, Poison, Ultraviolet, Ash
**Special (32–39):** Boreal, Cosmos, Prism, Inferno, Triadic, GoldEye, Rainbow, Radium+

**Radium** (slot 0): GColorGreen lit, GColorMintGreen tips, GColorDarkGreen dim.
**Radium+** (slot 39): green hours/battery + cyan minutes/steps, white tips.

---

## 14. PLATFORM TABLE

| Platform | Watch | Screen | Color | HR | Touch |
|----------|-------|--------|-------|----|-------|
| aplite | Pebble Classic/Steel | 144×168 rect | B&W | No | No |
| basalt | Pebble Time | 144×168 rect | 64-color | No | No |
| chalk | **Pebble Time Round** | **180×180 round** | 64-color | No | No |
| diorite | Pebble 2 SE | 144×168 rect | B&W | **Yes** | No |
| emery | Pebble Time 2 | 200×228 rect | 64-color | **Yes** | **Yes** |
| flint | Pebble 2 | 144×168 rect | B&W | No | No |
| gabbro | **Pebble Round 2** (Core Devices 2026) | **260×260 round** | 64-color | No | No |

**HR sensors: emery and diorite ONLY.** flint, basalt, chalk, gabbro, aplite have NO HR.
**Touchscreen: emery ONLY.**
**Large overlay: emery + gabbro** (both high-res). chalk = small round, no large overlay.
**Store copy:** use "on supported models" for HR — never list specific platforms.

---

## 15. KEY BUGS FIXED

| Bug | Fixed |
|-----|-------|
| Battery ring bottom fill right-anchored from corner | v2.2 |
| Round hour tick off-by-one in 12h mode | v2.2 |
| Degree symbol in weather string: silent render failure | v2.2 |
| Calories icon 1px overflow on small overlay | v2.2 |
| BT icon exclamation dot: diagonal artifact on e-paper | v2.3 |
| Solar ring dying after 1 day stale (single `if`) | v2.3 |
| Solar ring dying after 2+ days (`if` → `while` loop) | v2.3 |
| Config page: large overlay toggle missing on emery/gabbro | v2.3.1 |
| Config page: large overlay defaulting to Small on emery/gabbro | v2.3.1 |
| Config page: `isLargePlatform` included chalk incorrectly | v2.3.1 |
| Heart rate: `health_service_metric_accessible` always returns false for HR | v2.3.1 |
| Health updates firing on background events instead of once/minute | v2.3.1 |

---

## 16. CLOUDPEBBLE / BUILD RULES

1. Remove `resources/media` block from appinfo.json
2. Menu icons via CloudPebble UI only
3. No tilde in resource filenames (breaks GitHub import)
4. Duplicate source files at different paths cause import errors
5. Always give full files for copy-paste; never partial diffs

---

## 17. GITHUB MCP NOTES

- `create_or_update_file` for all pushes — requires current file SHA (fetch first)
- `push_files` sends **empty content** — NEVER USE IT
- Cannot create release tags via MCP — use GitHub web UI
- Cannot truly delete files via MCP — use GitHub web UI trash icon
- Radium2 uses `master` branch
- main.c (~65KB): `create_or_update_file` may time out — retry or use GitHub web UI

---

## 18. QUICK REFERENCE

```
Repo:         https://github.com/SterlingEly/Radium2
Branch:       master
HEAD:         91eda9f
Live store:   https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926
UUID:         2609e817-f8f2-4ad2-8846-cb05bb67d047
Current live: v2.3.1 — SETTINGS_KEY=8, SOLAR_KEY=9, 33 messageKeys
Previous:     v2.3, v2.2 (SETTINGS_KEY=7, 29 messageKeys)
Next:         v2.4 — no features defined
```

---

*End of context seed. v2.3.1 live and stable. Next version is v2.4.*
