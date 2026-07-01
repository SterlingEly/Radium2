# Sterling Ely — Pebble Watchfaces — Project Context

> **AI collaborators: read this file before making any code changes.**
> Each watchface has its own detailed context file linked below. This hub covers shared infrastructure, the authoritative platform table, and cross-project conventions.

---

## Purpose

This repository is the working space for Sterling Ely's Pebble watchface portfolio, rebuilt in 2026 for the Rebble ecosystem and Core Devices hardware.

| Watchface | Status | Detailed Context |
|-----------|--------|-----------------|
| **Radium 2** | ✅ Live (v2.3.1) | [CONTEXT_RADIUM2.md](./CONTEXT_RADIUM2.md) |
| **Bar Graph 2** | 🔨 In development (aplite locked) | [CONTEXT_BARGRAPH2.md](https://github.com/SterlingEly/BarGraph2/blob/master/CONTEXT_BARGRAPH2.md) |
| **Monogram** | 🌱 Early stage (scaffold only) | [CONTEXT_MONOGRAM.md](https://github.com/SterlingEly/Monogram/blob/main/CONTEXT_MONOGRAM.md) |

---

## Human / AI Role Split

**Sterling Ely** — Design direction, product decisions, visual aesthetic, device testing, store submissions, final approval on all changes.

**AI collaborator (Claude)** — Technical implementation: C code, JavaScript config pages, GitHub commits, documentation. Proposes and executes changes; Sterling approves. Does not invent design decisions.

---

## Platform Table (Authoritative)

Training data is frequently wrong about these platforms — always defer to this table.

| Platform | Watch | Screen | Color | HR | Touch |
|----------|-------|--------|-------|----|-------|
| aplite | Pebble Classic/Steel | 144×168 rect | B&W | No | No |
| basalt | Pebble Time | 144×168 rect | 64-color | No | No |
| chalk | **Pebble Time Round** | **180×180 round** | 64-color | No | No |
| diorite | Pebble 2 SE | 144×168 rect | B&W | **Yes** | No |
| emery | Pebble Time 2 | 200×228 rect | 64-color | **Yes** | **Yes** |
| flint | Pebble 2 | 144×168 rect | B&W | **No** | No |
| gabbro | **Pebble Round 2** (Core Devices 2026) | **260×260 round** | 64-color | No | No |

**Critical — AI models frequently get these wrong:**
- HR sensors: **emery and diorite ONLY** — flint does NOT have HR
- Touchscreen: **emery ONLY**
- gabbro is large high-res round (260×260) — do NOT group with B&W platforms
- chalk is small original round (180×180) — does NOT get large overlay
- Large overlay toggle (Radium 2): emery + gabbro only
- Store copy for HR: always say "on supported models" — never list specific platforms

---

## Build / Deployment Rules (All Projects)

1. **Remove `resources/media` block** from appinfo.json — causes "Unsupported published resource type" errors
2. **Menu icons** must be added via CloudPebble UI — not via GitHub import
3. **No tilde (~) in resource filenames** — breaks CloudPebble GitHub import
4. **Duplicate source files at different paths** cause CloudPebble import errors
5. **Always provide full files** for copy-paste — never partial diffs

### GitHub MCP Rules
- Use `create_or_update_file` — fetch current SHA first before every push
- **NEVER use `push_files`** — sends empty content silently (data loss)
- Cannot create release tags via MCP — use GitHub web UI
- Cannot truly delete files via MCP — use GitHub web UI trash icon
- main.c (~65KB on Radium 2) may time out on push — retry or use GitHub web UI

### Dev Environment
- CloudPebble: https://cloudpebble.repebble.com (Core Devices account)
- Rebble Developer Portal: https://dev.rebble.io
- Store (Rebble): https://apps.rebble.io
- Store (Repebble mirror): https://apps.repebble.com

---

## Design Philosophy (Shared)

Ambient information over precise readability. Watchfaces display data as atmosphere, not content. Color, arc fill, position = mood and direction at a 2-second glance. The watch is the barometer; the phone is the app.

---

## Current TODO (Cross-Project)

- **Radium 2:** Create v2.3.1 GitHub release tag via web UI; v2.4 features TBD
- **Bar Graph 2:** Progress emery → basalt → chalk/gabbro
- **Monogram:** Await Sterling's 40 Photoshop digit assets; then implement rendering (JS/Alloy SDK preferred)

---

## Source of Truth / External Links

| Resource | URL |
|----------|-----|
| Radium 2 repo | https://github.com/SterlingEly/Radium2 |
| Bar Graph 2 repo | https://github.com/SterlingEly/BarGraph2 |
| Monogram repo | https://github.com/SterlingEly/Monogram |
| Radium 2 store | https://apps.rebble.io/en_US/application/69a6531826cc4f0009c65926 |
| Original Radium v1 repo | https://github.com/MathewReiss/radium |
| Original Bar Graph v1 store | https://apps.repebble.com/en_US/application/5305a587b704cb4e7d0000e5 |

---

## Last Updated

2026-07-01 — Radium 2 v2.3.1 live. Bar Graph 2 aplite locked. Monogram scaffold only.
