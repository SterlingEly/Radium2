# RADIUM 2 — CONTEXT SEED FOR NEW THREAD
*Everything a fresh Claude session needs to resume Radium 2.x development*

---

## 1. WHAT IS THIS PROJECT?

**Radium 2** is a Pebble watchface built around a *radial bar graph* concept — the entire screen acts as a starburst of wedge-shaped tick marks radiating from the center, with hours occupying the bottom half and minutes the top half of the circle. The "Radium/radial" naming is a happy coincidence. The design originated ~9 years ago (Sterling's concept), was first implemented by MathewReiss, then completed by MicroByte. Radium 2 is a from-scratch rebuild by Sterling Ely + Claude (2026), modernizing the watchface for all 7 Pebble platforms and the Rebble ecosystem.

**Sterling's role:** Design/concept lead.  
**Claude's role:** Technical implementation partner.

---

## 2. HISTORY & ATTRIBUTION

| Project | Year | Designer | Developer |
|---------|------|----------|-----------|
| Bar Graph (v1) | 2013–2014 | Sterling Ely | Cameron MacFarland (distantcam) |
| Radium (v1) | 2015–2016 | Sterling Ely | MathewReiss + MicroByte |
| Radium 2 | 2026 | Sterling Ely | Sterling Ely + Claude |

**Original Radium repo:** https://github.com/MathewReiss/radium  
**Original Radium appstore:** https://apps.repebble.com/en_US/application/584b212dce45dc907d00008f

---

## 3. LIVE STATUS

- **Radium 2 v2.2 is LIVE on the Rebble/Repebble app stores**
- Store URL: https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926
- GitHub repo: https://github.com/SterlingEly/Radium2 (branch: `master`)
- HEAD: `148b767` — feat: add Bluetooth and Heart rate to info line dropdowns (v2.3)
- GitHub Release: `v2.2` tag at `37dfe37`
- **v2.3 development is open on `master`** — C pass 1 committed, config.js updated, solar ring pending

---

## 4. REPO STRUCTURE

```
SterlingEly/Radium2 (master)
├── CHANGELOG.md
├── README.md
├── STORE_LISTING.md
├── CONTEXT_RADIUM2.md     ← this file
├── CONTEXT_MONOGRAM.md    ← separate project
├── CONTEXT_BARGRAPH2.md   ← separate project
├── package.json           ← appinfo equivalent (new SDK format)
├── wscript
└── src/
    ├── c/
    │   └── main.c
    └── pkjs/
        ├── config.js      ← config page HTML/JS built as a data URL
        └── index.js       ← PebbleKit JS: platform detection, settings relay, weather
```

**Note:** `resources/fonts/` contains orphaned Roboto font files from an earlier iteration. They are unused and do not affect the build.

---

## 5. CURRENT VERSION SPEC

### v2.2 (live, tagged)
- SETTINGS_KEY: 7
- Version: 2.2.0
- 29 messageKeys, 40 presets, 4 info lines, weather support

### v2.3 (in progress, open on master)
- SETTINGS_KEY: **still 7** (no struct change in C pass 1)
- New FIELD constants added (no struct change needed):
  - `FIELD_BT = 10` — bluetooth rune, shown when disconnected
  - `FIELD_HEART_RATE = 11` — heart icon + BPM
- Charging bolt replaces battery icon when `s_is_charging`
- config.js: Bluetooth and Heart rate added to all 4 info line dropdowns
- **Next:** solar ring mode (SETTINGS_KEY bump to 8 when struct changes)

### package.json (v2.2 baseline)
- `version`: `"2.2.0"`
- `uuid`: `2609e817-f8f2-4ad2-8846-cb05bb67d047`
- `displayName`: `"Radium 2"`
- `sdkVersion`: `"3"`
- `capabilities`: `["configurable", "health"]`
- `targetPlatforms`: `["aplite", "basalt", "chalk", "diorite", "emery", "gabbro", "flint"]`
- **messageKeys** (29, in order):
  `BackgroundColor`, `OverlayColor`, `TimeColor`,
  `LitHourColor`, `LitMinuteColor`, `LitBatteryColor`, `LitStepsColor`,
  `DimHourColor`, `DimMinuteColor`, `DimBatteryColor`, `DimStepsColor`,
  `HourTipColor`, `MinuteTipColor`,
  `Line1Color`, `Line2Color`, `Line3Color`, `Line4Color`,
  `Line1Field`, `Line2Field`, `Line3Field`, `Line4Field`,
  `StepGoal`, `OverlayMode`, `OverlaySize`, `InvertBW`, `ShowRing`,
  `WeatherTempF`, `WeatherTempC`, `WeatherCode`

### C constants (main.c, current)
```c
#define SETTINGS_KEY      7          // increment when struct layout changes
#define DEFAULT_STEP_GOAL 10000
#define RING_GAP          2          // px gap between outer ring and tick radials
#define RING_THICK        6          // outer ring thickness (px)

// Overlay visibility modes
#define OVERLAY_ALWAYS_ON   0
#define OVERLAY_OFF         1
#define OVERLAY_SHAKE       2
#define OVERLAY_AUTO        3        // shake to show for ~60s, then art mode

#define OVERLAY_AUTO_HIDE_MS  60000

// Overlay size
#define OVERLAY_SMALL  0
#define OVERLAY_LARGE  1

// Info line field IDs
#define FIELD_NONE      0
#define FIELD_DAY_LONG  1   // "SATURDAY"
#define FIELD_DATE      2   // "MAR 21"
#define FIELD_DAY_DATE  3   // "SAT MAR 21"
#define FIELD_STEPS     4   // footprint icon + step count
#define FIELD_TEMP_F    5   // weather icon + temperature in F
#define FIELD_TEMP_C    6   // weather icon + temperature in C
#define FIELD_BATTERY   7   // battery icon + charge % (bolt when charging)
#define FIELD_DISTANCE  8   // footprint icon + walked distance (mi or km)
#define FIELD_CALORIES  9   // flame icon + active kcal
#define FIELD_BT        10  // bluetooth rune -- shown when disconnected (v2.3)
#define FIELD_HEART_RATE 11 // heart icon + BPM (v2.3, requires HR sensor)
```

### Settings struct (RadiumSettings) — SETTINGS_KEY 7
```c
typedef struct {
  GColor BackgroundColor;   // watchface background
  GColor OverlayColor;      // center overlay circle fill
  GColor TimeColor;         // LECO time digits
  GColor LitHourColor;      // lit hour ticks
  GColor LitMinuteColor;    // lit minute ticks
  GColor LitBatteryColor;   // lit battery ring
  GColor LitStepsColor;     // lit steps ring
  GColor DimHourColor;      // dim hour ticks
  GColor DimMinuteColor;    // dim minute ticks
  GColor DimBatteryColor;   // dim battery ring
  GColor DimStepsColor;     // dim steps ring
  GColor HourTipColor;      // leading hour tick highlight
  GColor MinuteTipColor;    // leading minute tick highlight
  GColor Line1Color;        // top-outer info line
  GColor Line2Color;        // top-inner info line
  GColor Line3Color;        // bottom-inner info line
  GColor Line4Color;        // bottom-outer info line
  int Line1Field;           // FIELD_* value for line 1
  int Line2Field;
  int Line3Field;
  int Line4Field;
  int  StepGoal;
  int  OverlayMode;
  int  OverlaySize;
  bool InvertBW;
  bool ShowRing;
} RadiumSettings;
```

### Runtime state (not persisted)
```c
// Added in v2.3 C pass 1:
static bool s_is_charging  = false; // captured in battery_handler
static bool s_bt_connected = true;  // managed by bt_handler + connection_service
static int  s_heart_rate   = 0;    // 0 = unavailable; set via health_service_peek_current_value
static char s_heart_rate_buffer[8]; // "72bpm" or "--"
```

### Defaults (prv_default_settings) — matches Radium preset
- Background/Overlay: black
- Color: lit = GColorGreen (#00ff00), dim = GColorDarkGreen (#005500), tips = GColorMintGreen (#aaffaa), time = White
- Color lines: outer (1,4) = GColorGreen; inner (2,3) = GColorMintGreen
- B&W: lit = White, dim = DarkGray
- Line1=NONE, Line2=DAY_LONG, Line3=DATE, Line4=NONE
- OverlayMode = OVERLAY_SHAKE
- OverlaySize = OVERLAY_LARGE on emery/gabbro; OVERLAY_SMALL elsewhere
- ShowRing = false on aplite; true elsewhere

---

## 6. DRAWING ARCHITECTURE

### Layer stack (bottom to top)
1. Background fill (BackgroundColor)
2. Tick wedges / radial arcs (hours + minutes)
3. Inner gap strip (rect only — cleans up tick bleed inside ring gap)
4. Outer ring: battery (right) + steps (left)
5. Center overlay circle (filled with OverlayColor)
6. Info lines + time digits (GOTHIC_18_BOLD or GOTHIC_24_BOLD + LECO_36 or LECO_42)

### Tick geometry — RECT platforms
- **Minutes:** 12 groups × 5 ticks; 15° pitch (9° tick + 6° gap); start at 3°
  - Color: 1° sub-ticks with 1° bg-color gap cuts between them
  - B&W: 2° wide ticks, no within-group gaps (9° block)
- **Hours:** 12 slots; 15° pitch (9° tick + 6° gap); start at 183°
  - 12h: solid 9° per slot
  - 24h: each slot split into two 3° sub-ticks with 3° gap (perfect thirds)
  - Inter-slot separator: 1° bg-color cut (color only)
- Tick thickness: `inner_short * 19/164` when overlay is showing; full inner_short otherwise
- Wedge radius extends beyond screen edge (full-bleed)

### Tick geometry — ROUND platforms
- Uses `graphics_fill_radial()` on the inset tick_rect
- 60 individual 1° minute arcs; same 12-slot × 9° hour arcs
- Ring: `graphics_fill_radial` on bounds, RING_THICK=6px

### Outer ring — RECT platforms
- Battery (right half): origin at bottom-center-right (cx+gap=5), left-anchored at origin
- Steps (left half): origin at bottom-center-left (cx-gap), right-anchored at origin
- gap=5, RING_THICK=6, half_w=cx-gap, total=half_w+h+half_w

### Icon sizes
- Small (OVERLAY_SMALL): 11×11px, paired with GOTHIC_18_BOLD
- Large (OVERLAY_LARGE): 14×14px, paired with GOTHIC_24_BOLD
- `SMALL_FONT_PAD=8`, `LARGE_FONT_PAD=10`, `SMALL_ICON_W=11`, `LARGE_ICON_W=14`, `ICON_TEXT_GAP=2`

### Icons (drawn in C, all at 11px and 14px)
- **Footprint** (`draw_steps_icon`) — two overlapping feet, used for steps and distance
- **Battery** (`draw_battery_icon`) — outline + fill bar. When `s_is_charging`: shows diagonal Z lightning bolt instead
- **Bluetooth** (`draw_bt_icon`) — classic BT rune: spine + two right-pointing chevrons + left serifs. Centered, no text. Only drawn when `!s_bt_connected`.
- **Heart** (`draw_heart_icon`) — two bumps at top, tapering to single-pixel point. Paired with BPM text.
- **Flame** (`draw_calories_icon`) — base→mid→upper→tip
- **Weather icons** — sun, partly-cloudy, cloud, rain, snow, storm (`draw_weather_icon`)

### Overlay
- Small: 58px radius, LECO_36_BOLD, GOTHIC_18_BOLD
- Large: 70px radius, LECO_42, GOTHIC_24_BOLD
- Dynamic centering: all icon+text fields use `graphics_text_layout_get_content_size`

---

## 7. CONFIG PAGE (config.js)

### Color model — 17 independent slots
```
TimeColor
LitHourColor, LitMinuteColor, LitBatteryColor, LitStepsColor
HourTipColor, MinuteTipColor
DimHourColor, DimMinuteColor, DimBatteryColor, DimStepsColor
Line1Color, Line2Color, Line3Color, Line4Color
BackgroundColor, OverlayColor
```

### Cascade hierarchy
```
LitAll    → LitHourColor + LitMinuteColor + LitBatteryColor + LitStepsColor + HourTipColor + MinuteTipColor
LitTicks  → LitHourColor + LitMinuteColor + HourTipColor + MinuteTipColor
LitHourColor   → LitHourColor + HourTipColor
LitMinuteColor → LitMinuteColor + MinuteTipColor
LitRing   → LitBatteryColor + LitStepsColor
DimAll    → DimHourColor + DimMinuteColor + DimBatteryColor + DimStepsColor
DimTicks  → DimHourColor + DimMinuteColor
DimRing   → DimBatteryColor + DimStepsColor
TextAll   → TimeColor + Line1Color + Line2Color + Line3Color + Line4Color
InfoLinesAll → Line1Color + Line2Color + Line3Color + Line4Color
BaseAll   → BackgroundColor + OverlayColor
```

### UI sections
1. **Info Overlay** — 4 radio buttons: Always On / Always Off / Shake / 1 min (OVERLAY_AUTO)
2. **Info Lines** — 4 dropdowns (Line1–4), inner lines get full field list, outer lines get compact list
3. **Presets** — 40 presets in 5 rows of 8
4. **Colors** — 4-level expandable tree (Text, Lit, Unlit, Base)
5. **Display** — InvertBW toggle (B&W only)
6. **Outer Ring** — ShowRing toggle
7. **Health** — StepGoal slider (hidden on aplite)
8. **Save to Watch** button

### Field options (current, v2.3)
- Inner lines (2 & 3): None, Day, Date, Day+Date, Steps, Temp(F), Temp(C), Battery, Distance, Active calories, **Bluetooth, Heart rate**
- Outer lines (1 & 4): None, Date, Steps, Temp(F), Temp(C), Battery, Distance, Active calories, **Bluetooth, Heart rate**

### Settings persistence
- `index.js` uses `localStorage` with key `'radium2_settings'`

### Platform detection
- `platform === 'aplite'` → hide health slider, ring unchecked by default
- `platform === 'bw'` (aplite/diorite/flint) → hide color section, show B&W section
- `platform === 'emery' || 'chalk'` → show large overlay toggle
- `chalk` = gabbro in the CloudPebble simulator

---

## 8. PRESET SYSTEM (40 presets, 5 groups of 8)

All presets define: bg, obg, tt, lH, lM, lB, lS, dH, dM, dB, dS, tH, tM, l1, l2, l3, l4

**Dark (0–7):** Radium, Scarlet, Ember, Cobalt, Volt, Slate, Violet, Dusk  
**Dark+ (8–15):** Ocean, Aurora, Solar, Venom, Reactor, Neon, Blossom, Jungle  
**Light (16–23):** Paper, Jade, Sapphire, Ruby, Mint, Rose, Lavender, Sepia  
**Color (24–31):** Teal, Flame, Midnight, Forest, Plum, Poison, Ultraviolet, Ash  
**Special (32–39):** Boreal, Cosmos, Prism, Inferno, Triadic, GoldEye, Rainbow, Radium+

### Dim color convention
- Monochromatic dark themes: dim = dark shade of same hue (e.g. #550000 for red, not gray)
- Achromatic themes (Slate, Ash): dim = DarkGray (#555555) — only exceptions
- Light bg themes: dim = pale/pastel of the accent color
- Split themes: each channel's dim = dark of that channel's hue

### Key preset notes
- **Radium** (Dark #0, system default): GColorGreen (#00ff00) lit everywhere, GColorMintGreen (#aaffaa) tips, GColorDarkGreen (#005500) dim
- **Radium+** (Special #7): green hours/battery + cyan minutes/steps, white tips, DukeBlue (#0000aa) dim minutes

---

## 9. HEALTH DATA (PBL_HEALTH guard)

All health metrics gated with `#if defined(PBL_HEALTH)` — aplite compiles cleanly without.

`update_health_data()` reads on every `HealthEventMovementUpdate`:
- **Steps** → `HealthMetricStepCount` → `s_steps`
- **Distance** → `HealthMetricWalkedDistanceMeters` → locale check: en_US → miles, else km
- **Calories** → `HealthMetricActiveKCalories` → active only (not resting)
- **Heart rate** (v2.3) → `HealthMetricHeartRateBPM` → `health_service_peek_current_value` → `s_heart_rate`

HR sensors: basalt (PT), diorite (PT SE), emery (PT2), flint (PT2 Duo). Gabbro (Round 2) does NOT have HR.

---

## 10. WEATHER (phone → watch via AppMessage)

Fetched by `index.js` using Open-Meteo API:
- `WeatherTempF` → `s_weather_temp_f` (INT_MIN = not yet received)
- `WeatherTempC` → `s_weather_temp_c`
- `WeatherCode` → `s_weather_code` (WMO → icon type 0–5)

**Critical:** NO degree symbol in format strings — `0xB0` causes weather text to silently not render. Use plain `"72F"` / `"22C"`.

---

## 11. BLUETOOTH (v2.3)

```c
static void bt_handler(bool connected) {
  s_bt_connected = connected;
  if (!connected) vibes_double_pulse();
  layer_mark_dirty(s_canvas_layer);
}
// In init(): connection_service_subscribe + peek_pebble_app_connection
// In deinit(): connection_service_unsubscribe
```

FIELD_BT (10): renders centered BT rune when disconnected, blank when connected.

---

## 12. CLOUDPEBBLE / BUILD RULES (CRITICAL)

1. **Remove `resources/media` block** from appinfo.json — causes "Unsupported published resource type" errors
2. **Menu icons** via CloudPebble UI only, not GitHub import
3. **No tilde (~) in resource filenames** — breaks CloudPebble GitHub import
4. CloudPebble imports from GitHub `master`; Sterling pastes raw content manually when needed
5. **Always give Sterling full files** — never surgical diffs or partial replacements
6. `chalk` = gabbro in the CloudPebble simulator

### Platform table
| Platform | Watch | Screen | Colors | Health | HR |
|----------|-------|--------|--------|--------|----|
| aplite | Pebble Classic / Steel | 144×168 rect | B&W | No | No |
| basalt | Pebble Time | 144×168 rect | 64 color | Yes | Yes |
| chalk | Pebble Time Round | 180×180 round | 64 color | Yes | No |
| diorite | Pebble 2 SE | 144×168 rect | B&W | Yes | Yes |
| emery | Pebble Time 2 | 200×228 rect | 64 color | Yes | Yes |
| flint | Pebble 2 | 144×168 rect | B&W | Yes | Yes |
| gabbro | Pebble Round 2 (Core Devices, 2026) | 260×260 round | 64 color | Yes | No |

**gabbro** = Pebble Round 2 — color, round, health, NO HR sensor. NOT B&W. `chalk` = gabbro in CloudPebble simulator.  
**flint** has PBL_HEALTH — only aplite does not.

---

## 13. KEY BUGS FIXED (history)

| Bug | Fix |
|-----|-----|
| Platform detection inversion | Fixed v2.0 |
| Settings not persisting | Fixed: localStorage in index.js |
| Overlay default "always on" | Changed to OVERLAY_SHAKE |
| Noon/midnight showed 0 | `(s_hour % 12) ?: 12` |
| B&W tick gaps | Group-based rendering, 2° B&W ticks |
| Round battery ring direction | Fixed v2.0 |
| 24h separator too large | 3° cut (perfect thirds of 9°) |
| `prv_overlay_auto_hide` undeclared | Forward declaration added |
| Degree symbol in weather format | Removed — plain "72F"/"22C" |
| gabbro listed as B&W | Corrected: color + round + health |
| Calories icon overflow | base h=3 not 4 |
| Round hour tip off-by-one (12h) | Added `if (!is_24h)` in round section |
| Ember/Cobalt dim wrong color | Ember=#550000, Cobalt=#000055 |
| Battery ring bottom right-anchored | Fixed: left-anchored at cx+gap origin (all rect, v2.2) |

---

## 14. DESIGN PHILOSOPHY

- **Radial bar graph:** Minutes = top half, hours = bottom half. No hands, no numerals.
- **Overlay / art mode:** Four modes — Always On, Always Off, Shake, 1 min auto-hide.
- **"Radium" naming:** Accidental pun — glowing dial + "radial" design.
- **Ring toggle:** ShowRing=false → pure starburst, ticks to screen edge.
- **64-color palette:** lit=bright, tip=mid, dim=dark within each hue family.

---

## 15. BANNER / STORE ASSETS

**Banner script:** `assets/banner_mockup.py` — Python/Pillow  
**Banner PNG:** `assets/radium2_banner_mockup.png` — committed to repo

Design: 470×320px, text left / watch mockup right, blurred starburst bg, mint glow on "Ra".

---

## 16. OPEN ITEMS / v2.3 REMAINING

### C pass 1 — DONE (commit 1a445f0)
- [x] Charging bolt (replaces battery icon when `s_is_charging`)
- [x] BT disconnect icon (`draw_bt_icon`, `FIELD_BT=10`, `bt_handler`, connection_service)
- [x] Heart rate (`draw_heart_icon`, `FIELD_HEART_RATE=11`, `HealthMetricHeartRateBPM`)

### config.js — DONE (commit 148b767)
- [x] Bluetooth and Heart rate in all 4 info line dropdowns

### Still pending for v2.3
- [ ] **Solar ring mode** — `RingMode` setting (Steps & Battery vs Sunrise & Sunset)
  - Requires struct change: add `RingMode` field → bump SETTINGS_KEY to 8
  - C: new ring draw logic using sunrise/sunset Unix timestamps
  - JS: extend Open-Meteo call with `&daily=sunrise,sunset` → send sunrise[0], sunset[0], sunrise[1] as AppMessage ints
  - New FIELD constants: FIELD_SUNRISE, FIELD_SUNSET, FIELD_DAYLIGHT
  - Solar ring math: nighttime fills left toward sunrise; daytime drains right toward sunset
- [ ] CHANGELOG update for v2.3
- [ ] README update for v2.3 features
- [ ] `v2.2` branch cleanup (redundant; proper release tag exists)

### Post-v2.3 ideas
- Sleep data (`HealthMetricSleepSeconds`)
- Gabbro hardware verification on actual Round 2

---

## 17. DEV ENVIRONMENT

- **CloudPebble:** https://cloudpebble.repebble.com — primary build/test (Core Devices account)
- **GitHub MCP connector:** Live on Mac desktop — Claude commits directly to GitHub
- **Rebble Developer Portal:** https://dev.rebble.io — for store submissions
- **Python / Pillow:** Banner/asset generation
- **Alloy/XS SDK:** For Monogram (JavaScript/TypeScript, ES2025)

---

## 18. QUICK REFERENCE

```
Repo:         https://github.com/SterlingEly/Radium2
Branch:       master
HEAD:         148b767  (v2.3 in progress: C pass 1 + config.js done; solar ring pending)
Release tag:  v2.2 at 37dfe37
Live store:   https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926
UUID:         2609e817-f8f2-4ad2-8846-cb05bb67d047
Version:      2.2.0 live → 2.3.0 next
SETTINGS_KEY: 7 (will bump to 8 when solar ring RingMode field added)
messageKeys:  29 (BackgroundColor … WeatherCode) — no change yet in v2.3

GitHub tooling note:
  create_or_update_file works for files up to ~50KB with correct SHA
  push_files can fail on large content payloads
  For large files: get SHA → create_or_update_file with SHA
```

---

*End of Radium 2 context seed. v2.2 live and tagged; v2.3 C pass 1 done; solar ring next.*
