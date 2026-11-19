# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/coral-fox-12/leonida-platinum-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/coral-fox-12/leonida-platinum-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, open-source trophy guide and tracker for **Grand Theft Auto VI** (PlayStation 5), built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01) on [make.fun](https://make.fun). No ads, no account, no network — open `app/index.html` and the whole guide runs from its own files.

> **Referral:** use code `bz33p674` — [https://make.fun/r/bz33p674](https://make.fun/r/bz33p674)

## What it is

- **All 55 official trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — each with its official name, description and grade, plus a guide written in our own words that cites its source.
- **A tracker that remembers.** Tick trophies off, watch the progress bar climb toward the platinum, and export or import your progress as JSON. Progress is saved in your browser — nothing leaves your machine.
- **Filters that matter.** By grade, by kind (story, missable, collectibles, activities, not earned yet), by search — and deep links, so `#grade=silver` or `#q=meditate` opens the guide pre-filtered.
- **A spoiler setting.** Story trophies (28 of them) stay hidden until earned when the toggle is on.
- **The one missable, flagged loud.** *Positive Mental Attitude* — meditate at all 18 spots — is the only missable trophy, and the guide says so up front, in the roadmap and on the trophy itself.
- **A roadmap to the platinum.** Story first, the missable as you travel, activities and collectibles second, cleanup and 100% last.

## Run it

```sh
# just open it — no build step, no dependencies
python3 -m http.server 8080 --directory app
# then open http://localhost:8080
```

Or run the entrypoint, which assembles the submission (Node 22, standard library only):

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Where the facts come from

Names, descriptions and grades are the official PlayStation trophy list. Each guide names the community guide its how-to draws on — PowerPyx, PlayStationTrophies.org, PSNProfiles, TrueTrophies or Exophase — and is written in our own words; nothing is copied from those guides. Counts and objectives (250 stunts, 100 vehicles, 52 areas) come straight from the official descriptions.

## Files

| Path | What it is |
| --- | --- |
| `app/index.html` | The guide page: search, filters, roadmap, tracker |
| `app/js/app.js` | The tracker: rendering, filters, progress, suggest-next |
| `app/style.css` | The look: dusk-over-Vice-City, system fonts only |
| `app/data/trophies.json` | All 55 trophies with guides, grades, flags and sources |
| `main.ts` | Entrypoint: validates the 55 and writes the dossier |
| `screenshots/` | Four screenshots of the guide in action |

## License

MIT. Unofficial fan work — Grand Theft Auto and GTA are trademarks of Rockstar Games; this guide uses no Rockstar artwork or logos.
