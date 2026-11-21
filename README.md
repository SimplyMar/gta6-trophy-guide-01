# gta6-trophy-guide-01

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/SimplyMar/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/SimplyMar/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, single-page **GTA VI (PS5) Trophy Guide & Tracker** — all 55 official trophies with
original, actionable guide text, a cited source on every entry, a 3-stage Platinum Roadmap, and a
master-detail checklist that saves your progress locally. No network requests at runtime, no
Rockstar logos or official artwork — just the trophy list, the roadmap, and your own ticks.

## Features

- **Checklist view** — every trophy with grade, category and missable/hidden badges, filterable by
  category and grade, searchable by name/description/guide text.
- **Platinum Roadmap view** — the 55 trophies grouped into 3 practical stages (early game, mid-game
  & stranger strands, endgame/100% grind) so you always know what to chase next and what you must
  not let lapse.
- **Master-detail layout** — pick a trophy on the left, read its original guide text and cited
  source on the right.
- **Spoiler toggle** — hidden/secret trophies show as "Hidden Trophy" until you either earn them or
  flip Spoiler mode on.
- **Missable badges** — the stranger-strand and other missable trophies are flagged so you don't
  lock yourself out of them.
- **Progress that sticks** — earned trophies save to `localStorage`; Export/Import moves your
  progress as a plain JSON file.
- **Fully offline** — `app/` is static HTML/CSS/JS with one local data file
  (`app/data/trophies.json`); nothing is fetched from the network at runtime.

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

This copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` via the vendored
`vendor/makefun-frontend.ts`.

## Sourcing

Every trophy's guide text is written from scratch in this project's own words. Each trophy cites
its named source and URL directly in `app/data/trophies.json` (`source.name`, `source.url`); no
guide text is copied from any source.

## Screenshots

See `screenshots/` for the checklist, roadmap, spoiler-mode and collectibles-filter views, taken
headlessly via `serve.ts` + Playwright against the deterministic `?shot=` query parameters
documented in `shots.json`.
