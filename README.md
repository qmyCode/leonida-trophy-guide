# Leonida Platinum Log

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/qmyCode/leonida-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/qmyCode/leonida-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Entry for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What this is

Leonida Platinum Log is a fully offline trophy guide and progress tracker for Grand Theft Auto VI. It covers the complete official PlayStation 5 trophy list — all 55 trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 of them hidden) — and pairs every entry with its official name, description and grade, plus a short guide written for this app. Nothing in the app talks to the network at runtime: open it, track your run, close it, and your progress is still there next time.

## Features

- **Full tracker** — tick trophies off as you earn them; progress is saved in local storage and the header always shows how far along the platinum is.
- **Filters** — slice the list by kind (story, collectibles, activities, completion, online), by roadmap stage, by missable status, or just search by name.
- **Count trackers** — trophies that need repeated actions carry their own step counters, so partial progress toward a total is never lost.
- **Spoiler shield** — a setting that keeps story trophies masked until you have earned them, so browsing the list never gives away what is coming.
- **Export / import** — download your progress as a JSON file and load it back on another machine or browser whenever you like.
- **6-stage roadmap** — the whole list is ordered into six play-order stages, from the opening chapter to the platinum itself, with per-stage progress shown in a "next up" rail.
- **Missable analysis** — trophies that can be locked out are flagged with their point of no return. The one genuinely disputed case is shown both ways, with the sources weighed and a clear recommendation, instead of a false certainty.

## How to run

Build the entry the way the competition harness does — this copies the app and screenshots into `/output` and writes the dossier:

```sh
node main.ts
```

For local viewing during development, serve the folder with the bundled dev server and open the printed address:

```sh
node serve.ts
```

The tracker itself lives under `app/` (`index.html`, `style.css`, `app.js`, with the trophy data in `app/data/trophies.json`); the four screenshots under `screenshots/` are real renders of the running app.

## Sources

Trophy names, descriptions and grades follow the official PlayStation trophy list, cross-checked against the list published by Exophase. Every guide in the app names the source it rests on: showcase guides are cited step by step to the published guides they were researched from (PowerPyx, OutputLag and GameTrek, read 21 November 2026), and the remaining guides cite the official list. Where sources disagree — the possibly-missable Chapter 1 meditation is the standing example — the app shows both versions rather than picking one silently.

---

<sub>Entered on [make.fun](https://make.fun/?ref=wd21nvpk&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
