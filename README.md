# gta6-trophy-guide-01

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/SimplyMar/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/SimplyMar/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, single-page **GTA VI (PS5) Trophy Guide & Tracker** — all 55 official trophies with original, actionable guide text, explicit inline citations on every single step, a verified 4-stage Platinum Roadmap, and a master-detail checklist that saves your progress locally. 100% offline static files (HTML/CSS/ES modules/JSON) with zero network requests at runtime, zero Rockstar logos or official artwork.

## Features

- **Checklist view** — Every trophy with official grade, category, custom SVG trophy emblems, and missable/caution badges. Filterable by category, grade, and status, and searchable across names, descriptions, guides, and cutoff notes.
- **Platinum Roadmap view** — 4 comprehensive stages (Prologue & Hard Missable, Chapters 3–5 Story Campaign, 100% Checklist & Specialist Grinds, and Free-Roam Cleanup & Platinum Pop). Compact 1-row KPI ribbon (~200–250h, 4–7/10 difficulty, 1 playthrough, 15 rolling saves, cheats warning) with all 4 stages visible above the fold.
- **Missables & Counters dashboard** — 2-tier layout: (A) Hard Missable warnings (Positive Mental Attitude Chapter 1 balcony cutoff + Rolling 15-Save protocol + Cheat code warning), (B) Source Consensus & Dispute Audit (Stranger Strands post-story verification vs rolling-save caution) with full readable text, and (C) Interactive PSN Progress Counters grid for all 19 counted grind trophies.
- **Master-detail layout** — Select any trophy on the left to read its complete guide, numbered actionable steps with inline `[Source]` citation pills, explicit Cutoff & Missable Audit box, and clickable verified source cards on the right.
- **Spoiler Shield** — Unearned secret storyline trophies are masked as "Hidden Trophy" with descriptions hidden until earned or until Spoiler Shield is turned off. Earned story trophies stay visible with checkmarks.
- **Dual Showcase panel** — Passing `?panel=backup` or toggling the Backup Panel renders the Spoiler Shield Active status card alongside the Live Export/Import JSON backup panel with full formatted JSON preview.
- **Progress that sticks** — Saves earned status, PSN counters, and personal notes to `localStorage`. Export/Import moves progress as a clean JSON file.
- **Fully offline** — `app/` contains 100% static HTML/CSS/JS with local data (`app/data/trophies.json`); nothing is fetched over the network at runtime.

## Running it locally

```sh
node serve.ts
# then open http://localhost:8080
```

Pass `--port <n>` to `serve.ts` to use a different port.

## Building the dossier

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` via the vendored `vendor/makefun-frontend.ts`.

## Sourcing

Every trophy guide and step is written from scratch in original words. Across the 55 trophies, 26 verified live sources are cited with direct links and specific claim verification notes in `app/data/trophies.json`.

## Screenshots

See `screenshots/` for the 4 verified 1280x800 views:
1. `screenshots/1-cover.jpg` — Checklist + Positive Mental Attitude selected (Hard Missable alert, 12/18 PSN counter, inline cited steps, verified sources, Audit Strip, filter bar).
2. `screenshots/2-roadmap.jpg` — All 4 Platinum Roadmap stages clearly visible above the fold + A Long Road 100% checklist guide with inline citations.
3. `screenshots/3-missables.jpg` — Missables & Counters view (Hard Missable warnings, full Source Dispute Audit without truncation, Interactive PSN Counters + Cunning Stunts selected).
4. `screenshots/4-spoiler.jpg` — Story filter + Spoiler Shield ON masking unearned story trophies while earned ones stay visible, paired with Live Export/Import JSON Backup Panel.
