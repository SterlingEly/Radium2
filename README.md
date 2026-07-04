# Radium 2

**A radium dial watchface for Pebble — glowing tick marks, clean geometry, and a hidden clock.**

---

> **Technical contributors and AI collaborators:** Read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) before making any code changes. It contains the authoritative architecture, constants, platform table, build rules, and known traps for this project.

---

## The idea

Old radium dial watches are beautiful objects. The hour and minute markings glow independently of the hands, giving you a sense of time without needing to parse a needle position. Radium 2 brings that idea to Pebble: the right half of the screen fills with minute ticks, the left half with hour blocks, a thin outer ring tracks battery and steps — and in the center, optionally, a clean digital readout.

The face works on two levels. With the overlay on, it reads like a normal watchface: time, date, day. Shake it, and the overlay disappears to reveal the full radial display — a pure starburst of glowing geometry that tells time in a completely different way. Shake again to bring it back.

---

## Features

- **Radial time display** — right half: 60 minute ticks in groups of 5. Left half: 12 hour blocks (or 24 in 24h mode, each block split in two)
- **Overlay modes** — Always On, Shake, 1 min auto-hide, or Always Off (pure art mode)
- **4 configurable info lines** — Day, Date, Day+Date, Steps, Distance, Calories, Temp °F, Temp °C, Battery, Bluetooth status, Heart rate, Sunrise, Sunset, Daylight duration, or None
- **Solar Ring mode** — outer ring tracks daylight remaining and time until sunrise instead of steps and battery; stays alive on cached data if the phone disconnects
- **Live weather** — current conditions from Open-Meteo via phone, displayed with a custom icon
- **Outer ring** — battery level on the right, step count on the left, both filling from 6 o'clock toward 12
- **Leading tick highlights** — current hour and minute ticks glow brighter, independently colorable
- **Charging indicator** — battery icon swaps to a lightning bolt when on the charger
- **Bluetooth alert** — BT rune appears when phone connection is lost, with a double vibration
- **Heart rate** — live BPM on supported models
- **24h support** — each hour slot splits into two segments with a gap between
- **17 independently configurable color slots**
- **40 presets** in five rows (Dark, Dark+, Light, Color, Special)
- **B&W support** with optional invert toggle
- **All 7 platforms** — Aplite, Basalt, Chalk, Diorite, Emery, Flint, Gabbro

---

## Reading the face

```
         12
    ███░░░░░░░░░
  █               ░
 █    WEDNESDAY    ░
 █     10:42       ░
 █     MAR 09      ░
  █               ░
    ░░░████████
         6
```

- **Right half (3→12 o'clock):** minutes, filling clockwise — each group of 5 ticks = one 5-minute block
- **Left half (9→12 o'clock):** hours, filling counter-clockwise — each block = 1 hour
- **Outer ring right:** battery, filling up from 6 toward 12
- **Outer ring left:** steps toward daily goal, filling up from 6 toward 12
- **Center:** configurable info lines and time, with optional overlay circle

---

## Overlay modes

| Mode | Behavior |
|---|---|
| Always On | Overlay always visible |
| Shake | Starts visible; shake toggles. Resets to visible on reboot |
| 1 min | Shake to show; auto-hides after 60 seconds |
| Always Off | Pure art mode — full starburst, no center hole |

---

## Platforms

| Platform | Watch | Screen |
|---|---|---|
| Aplite | Pebble Classic, Steel | 144×168 B&W |
| Basalt | Pebble Time | 144×168 color |
| Chalk | Pebble Time Round | 180×180 color |
| Diorite | Pebble 2 SE | 144×168 B&W |
| Emery | Pebble Time 2 | 200×228 color |
| Flint | Pebble 2 | 144×168 B&W |
| Gabbro | Pebble Round 2 | 260×260 color |

---

## History and credits

**~2015 — Original design (Sterling Ely)**
The concept was designed for the Pebble Time Round: a radial bar graph where filled wedge segments encode time, battery, and steps — readable as pure geometry without a digital readout.

**December 2015 — Prototype (MathewReiss)**
GitHub: [MathewReiss/radium](https://github.com/MathewReiss/radium)

**December 2016 — v1.0 release (MicroByte)**

**March 2026 — Radium 2 (Sterling Ely and Claude)**
Full rebuild for all modern Pebble platforms. Adds color customization, 40 presets, 24h mode, 4 configurable info lines, live weather, solar ring, and health metrics.

---

## Store

- **Rebble:** https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926
- **Repebble:** https://apps.repebble.com/en_US/application/69a6531826cc4f0009c65926

---

## Building

Built with the Pebble SDK via CloudPebble. No external dependencies.

```
pebble build
pebble install --emulator basalt
```

Source files:
- `src/c/main.c` — all drawing, event handling, settings, health, and weather
- `src/pkjs/config.js` — config page (data URL)
- `src/pkjs/index.js` — PebbleKit JS: platform detection, settings relay, weather and solar fetch
- `package.json` — message keys, target platforms, version

---

## License

MIT
