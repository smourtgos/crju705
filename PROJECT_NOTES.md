# CRJU 705 Modernization — Project Notes

*Last updated: July 2026. Working notes for picking this back up.*

## What this is

Rebuild of **CRJU 705** (master's CJ statistics, USC, Fall 2026) from the Fall 2025 materials. Two goals drove it:

1. **Modernize the R** — old base-R examples → tidyverse (dplyr/ggplot2/readr), native pipe `|>`.
2. **Fix two pain points from last year** — (a) data wrangling was introduced too late, so students hit the final project underprepared; (b) students found the first half repetitive/theoretical.

Textbook stays **Stanton, *Reasoning with Data*** (the only intro text doing frequentist + Bayesian side by side — non-negotiable). Added **R for Data Science (2e)** as a free parallel readings thread through the early weeks. Everything now lives on a **Quarto website** so Canvas just links to it instead of hosting individual files.

## Where everything lives

| Thing | Location |
|---|---|
| **Live site** | <https://smourtgos.github.io/crju705/> |
| **GitHub repo** | <https://github.com/smourtgos/crju705> (public) |
| **Working source** | `crju705-site/` (this folder) |
| **2025 archive (untouched source material)** | `../CRJU 705/` |
| **Colleague's course (lab template + datasets borrowed)** | `../CRCJ 8950 Spring 2026/` |

## How to work on it

```bash
# from crju705-site/
quarto preview            # live local preview while editing
quarto render             # build the whole site to _site/
# then publish:
git add -A && git commit -m "..." && git push
quarto publish gh-pages --id crju705-gh-pages --no-prompt --no-browser
```

- **`CONVENTIONS.md`** is the rulebook — read it before adding anything. File naming, slide YAML template, lab structure, code style, the video rule, the slide-density rule.
- **Answer keys & exams** live in `_private/` — that folder is BOTH render-excluded (in `_quarto.yml`) AND gitignored, so it never reaches the public site or git history. Render a key locally on demand: `quarto render _private/keys/hw-0N-key.qmd --to docx`.
- **After any `_quarto.yml` change**, re-check nothing leaked: `grep -ri "answer" _site/ --exclude-dir=site_libs | grep -i key` should return nothing.

## Design decisions (already made — don't relitigate)

- **14 sessions** (16-week semester, assume ≥2 cancellations): 11 content + midterm (S9) + project help session (S13) + presentations (S14).
- **R4DS threaded through S2–S6** as readings + short wrangling labs, alongside Stanton. Completes the "Whole Game" before the final project.
- **Theory taught simulation-first** on real data (the fix for "repetitive/theoretical").
- **Anchor dataset = real Chicago 2025 crime**, at two levels (see below), running through lecture examples all semester. Labs rotate the colleague's simulated datasets for breadth.
- **Slides = Quarto reveal.js**, rebuilt from the old PowerPoints.
- **Pipe = `|>`** (native), because R4DS uses it. Materials note that `%>%` (which Scott uses by habit, and Stanton uses) is equivalent.
- **Improvements to slides are logged** in `_private/notes/CHANGES-week-NN.md` for Scott's review — see below.

## The anchor dataset

Built by `R/build-anchor-dataset.R` (reproducible; raw downloads go in gitignored `data-raw/`). Codebook + caveats on the site: `chicago-data.qmd`.

- **`data/chicago-crimes-2025.csv`** — 30,000-incident random sample (seed 705) of real 2025 Chicago Police data. Columns incl. `primary_type`, `crime_category` (Violent/Property/Other, course-defined), `arrest`, `domestic`, `community_area`, `hour`, coords.
- **`data/chicago-areas.csv`** — all 2025 incidents aggregated to the 77 community areas, joined with CMAP/ACS socioeconomic covariates (poverty, unemployment, income, education, race, rent…). Has `high_violence` (binary) for the logistic-regression week.

Lab datasets (from colleague, CSV-cleaned, in `data/`): `prisoners`, `neighborhoods`, `cities-wide`, `reentry-wide`, `crash-ak` (+ `.xlsx` twin), `officers`, `population-data`.

## STATUS: Phase 1 COMPLETE ✅

Infrastructure + **Sessions 1–5** fully built, verified, and live.

| Session | Topic | Slides | Lab | HW + key | Status |
|---|---|---|---|---|---|
| 1 | Intro / R setup / data types | ✅ (+ swirl page, robbery animations) | — | swirl | live |
| 2 | Descriptive statistics & EDA | ✅ | Lab 2 (ggplot2, prisoners) | ✅ | live |
| 3 | Probability, via simulation | ✅ | Lab 3 (dplyr, neighborhoods) | ✅ | live |
| 4 | Sampling distributions | ✅ | Lab 4 (pivots, cities/reentry) | ✅ | live |
| 5 | Confidence intervals | ✅ | Lab 5 (import, crash-ak) | ✅ | live |

Also done: site scaffold, GitHub Pages pipeline, syllabus (migrated + reparameterized), schedule, resources, anchor dataset + codebook, answer-key privacy (verified), full slide-overflow audit (all 176 slides fit the canvas), video embedding fixed.

**Verification performed:** full render clean; key-leak grep zero; all 4 labs run top-to-bottom in fresh R sessions as a student would; every live URL returns 200; browser-measured slide-overflow audit clean on all decks.

## TODO when you come back

### Phase 2 — Sessions 6–14 (not started)
Same per-session pattern as S2–S5 (deck from old pptx + tidyverse recode + anchor-data thread; lab where applicable; HW + private key; hub page; schedule row; CHANGES log). Build order:
- **S6 — Hypothesis testing: frequentist + Bayesian t-tests** (Stanton Ch. 5). *This is the Bayesian week* — keep `BayesFactor` and reuse the existing animations in `../CRJU 705/Week 6 - Bayes vs. Freq/` (.gif/.mp4). R4DS Ch. 19 joins lab.
- **S7 — Applied data workshop** + final-project dataset selection due. Full pipeline on messy data.
- **S8 — ANOVA** (Ch. 6). Project checkpoint 1 starts in HW.
- **S9 — Midterm** (covers S1–8). Build from `../CRJU 705/Week 8 - Midterm/`.
- **S10 — Correlation** (Ch. 7). Project checkpoint 2.
- **S11 — Multiple regression** (Ch. 8). Project checkpoint 3. **Keep the 3D plotly visualization** — regenerate live, don't redesign (`../CRJU 705/Week 10.../regression_plane.html`).
- **S12 — Logistic regression** (Ch. 10). Project checkpoint 4. **Keep the 3D logistic viz.** Use `chicago-areas.csv`'s `high_violence` binary outcome.
- **S13 — Final-project help session** (page only, no deck).
- **S14 — Presentations** (page only).
- **Final project materials** — overview, dataset-selection HW, rubric. Source: `../CRJU 705/Week 9.../Final_Project_Overview.docx`.

### Loose ends / decisions needed from Scott
- [ ] **Confirm Fall 2026 dates.** Session dates are PROVISIONAL — set `firstday` and the break/conference dates at the top of `syllabus.qmd` once USC's official calendar is out. Everything recomputes from those.
- [ ] **Canvas vs. Blackboard** — materials say "Canvas"; 2025 syllabus said Blackboard. Confirm which the course uses.
- [ ] **Install ffmpeg** (`brew install ffmpeg`) before Phase 2 — needed to compress the weeks 10–11 `.mov` screen recordings (37/38/22 MB) into web-friendly mp4.
- [ ] **Review the `_private/notes/CHANGES-week-*.md` files** — every substantive change I made vs. your 2025 materials is itemized there. Notable ones flagged for you:
  - S2–S5 each add a real-Chicago-data example/section not in the originals.
  - **S3 fixed two real bugs in your 2025 materials** — a HW question worded as conditional but keyed as joint, and a mis-numbered answer-key item.
  - S4 condensed the 2025 in-class exercise onto a slide (not a separate handout) and *assumed* the reentry data's `month_*` columns mean monthly employment — confirm that reading.
  - S5 retired the iris in-class exercise (absorbed into deck + HW) and deliberately sets up S6's significance-vs-importance lesson with a "detectable but tiny" real difference.
- [ ] **Optional:** eyeball the decks at projector resolution once. Videos are capped at 480px tall; if that's small in your room there's ~90px of headroom to enlarge.

### Handy tools
- `tools/audit-slide-overflow.js` — paste into browser console on a rendered deck to list any slide taller than the canvas. Run before publishing new decks.
