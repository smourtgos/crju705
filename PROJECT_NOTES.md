# CRJU 705 Modernization — Project Notes

*Last updated: July 21, 2026 — after the Phase 3 course-review overhaul shipped and was published live. Working notes for picking this back up.*

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

Source directories, in student-facing terms: `weeks/` (hub pages — objectives, story, links), `slides/` (reveal.js decks), `labs/`, `homework/`, `demos/` (per-session "lecture written down" walkthroughs, self-contained), `practice/` (ungraded problem banks, collapsed solutions), `final-project-exemplar.qmd` (+ downloadable script). Non-public: `_private/keys/` (HW answer keys), `_private/exams/` (2025 archive + **midterm-2026.R draft**, worked key, pre-fit `midterm-anova-fit.rds`, `make-midterm-fit.R`), `_private/notes/` (per-week CHANGES logs + the midterm review checklist).

## How to work on it

```bash
# from crju705-site/
quarto preview            # live local preview while editing
quarto render             # build the whole site to _site/
# then publish:
git add -A && git commit -m "..." && git push
quarto publish gh-pages --id crju705-gh-pages --no-prompt --no-browser
```

**⚠️ Publishing gotcha — GitHub Pages builds can hang.** `quarto publish` pushes the
built site to the `gh-pages` branch, but GitHub's Pages builder then has to deploy
it, and it occasionally sticks in "building" for 15+ minutes (happened twice in
July 2026; also sent Scott spurious "Page build failed" emails during initial setup).
The live site serves STALE content until the build completes. After publishing:

```bash
# check the build finished:
gh api repos/smourtgos/crju705/pages/builds/latest --jq '.status'   # want: "built"
# if stuck on "building" for >5 min, kick it:
gh api -X POST repos/smourtgos/crju705/pages/builds
```

Then hard-refresh the browser (Cmd+Shift+R) — reveal.js decks cache aggressively.

**⚠️ Render gotcha — `quarto render` takes ONE input file.** `quarto render a.qmd b.qmd`
does not render both: the extra paths get misparsed, the run half-fails with only a
WARN, and `_site` silently keeps stale HTML. Render multiple files with a shell loop
(`for f in …; do quarto render "$f"; done`) or do a full project render. Also: stale
`*.rmarkdown` intermediates left in `slides/` by an interrupted render will crash the
NEXT full render (globbed as targets, then not found) — delete them if a render dies.

- **`CONVENTIONS.md`** is the rulebook — read it before adding anything. File naming, slide YAML template, lab structure, code style, the video rule, the slide-density rule.
- **Answer keys & exams** live in `_private/` — that folder is BOTH render-excluded (in `_quarto.yml`) AND gitignored, so it never reaches the public site or git history. Render a key locally on demand: `quarto render _private/keys/hw-0N-key.qmd --to docx`.
- **After any `_quarto.yml` change**, re-check nothing leaked. The old `grep "answer" | grep key` check is RETIRED (public pages now legitimately contain "answer" near "key" — join keys, practice solutions). Current checks, both must return nothing:
  ```bash
  grep -ril "answer key" _site/ --exclude-dir=site_libs
  find _site -name "*key*" -not -path "*site_libs*"
  ```
  (And don't name chunks `key-*` in public pages — the `find` will flag the figure files.)

## Design decisions (already made — don't relitigate)

- **14 sessions** (16-week semester, assume ≥2 cancellations): 11 content + midterm (S9) + project help session (S13) + presentations (S14).
- **R4DS threaded through S2–S6** as readings + short wrangling labs, alongside Stanton. Completes the "Whole Game" before the final project.
- **Theory taught simulation-first** on real data (the fix for "repetitive/theoretical").
- **Anchor dataset = real Chicago 2025 crime**, at two levels (see below), running through lecture examples all semester. Labs rotate the colleague's simulated datasets for breadth.
- **Slides = Quarto reveal.js**, rebuilt from the old PowerPoints.
- **Pipe = `|>`** (native), because R4DS uses it. Materials note that `%>%` (which Scott uses by habit, and Stanton uses) is equivalent.
- **Improvements to slides are logged** in `_private/notes/CHANGES-week-NN.md` for Scott's review — see below.
- **(Phase 3) Bayes is threaded, not concentrated**: intuition seeded S1, theorem taught S3, machinery S6, priors named consistently S8–S12. Don't move it back into one deck.
- **(Phase 3) Demos + practice banks are the missed-class recovery path** — a deliberate choice over recorded lectures. Slides may depend on `R/setup.R`; demo pages must NOT (public URLs, plain colors, visible setup).
- **(Phase 3) Grade weights 45/25/30** (HW·labs·in-class / midterm / project), project 30% split 22 report + 8 presentation (split still a draft); final model reported in **both traditions**; presentations 8 min + 2 Q&A; midterm ships a pre-fit brms `.rds` (never a live Stan compile in the exam).

## The anchor dataset

Built by `R/build-anchor-dataset.R` (reproducible; raw downloads go in gitignored `data-raw/`). Codebook + caveats on the site: `chicago-data.qmd`.

- **`data/chicago-crimes-2025.csv`** — 30,000-incident random sample (seed 705) of real 2025 Chicago Police data. Columns incl. `primary_type`, `crime_category` (Violent/Property/Other, course-defined), `arrest`, `domestic`, `community_area`, `hour`, coords.
- **`data/chicago-areas.csv`** — all 2025 incidents aggregated to the 77 community areas, joined with CMAP/ACS socioeconomic covariates (poverty, unemployment, income, education, race, rent…). Has `high_violence` (binary) for the logistic-regression week.

Lab datasets (from colleague, CSV-cleaned, in `data/`): `prisoners`, `neighborhoods`, `cities-wide`, `reentry-wide`, `crash-ak` (+ `.xlsx` twin), `officers`, `population-data`.

## STATUS: Phase 3 (July 2026 course-review overhaul) COMPLETE ✅

A full pedagogical review (three parallel deep-reads: architecture/student journey, sessions 1–7, sessions 8–14 + assessments) found the teaching strong but flagged: S6 overloaded (all first-half Bayes in one 622-line deck), no grade weights anywhere, a project-deadline contradiction, hubs as bare pointer pages, an assessment envelope lagging the teaching (2025 iris midterm, no rubric weights, no exemplar, no presentation spec), and a set of smaller seams. Everything below was then built/fixed in one pass (per-decision sign-offs from Scott: grade weights 45/25/30, midterm ships a pre-fit brms .rds, final model reported in BOTH traditions, presentations 8 min + 2 Q&A):

- **Bayes thread from week 1**: Bayes' theorem + base-rate screening MOVED from S6 to S3 (S6's Act II is now a 2-slide recap; MCMC demoted to a visible optional appendix; BF scale extended 10–30/30–100/100+ so S10's "extreme" reference resolves); seed slides in S1 ("You Already Think Like a Bayesian"), S4 (base-rate redux), S5 (forbidden-sentence → credible-interval setup); "Two Threads, One Course" bridge slides S2–S6; simulation-verbs aside (S3) + used-before-taught captions (S4/S5); hw-03 gained Part 5 (Bayes counting table) + key; coinflip gif now in media/week-03/.
- **Prior-narrative consistency**: "The Prior We Just Used" beat added to S8; S11/S12 now state the brms defaults + the "say which prior you used" reporting rule (S10 was already the standard).
- **Self-contained infrastructure**: 11 demo walkthrough pages (`demos/`) reproducing every deck's live demos with public-URL data and no instructor-only dependencies; 9 practice banks (`practice/`) with collapsed public solutions; all 14 hubs upgraded (story paragraph, learning objectives, demo/practice links, missed-class pointers, two-threads lines); resources.qmd gained the demos/practice index + a plain-language simulation-verbs reference; CONVENTIONS.md documents the two new file families; `demos/` + `practice/` added to the _quarto.yml render allowlist.
- **Assessment envelope**: syllabus grade-weights table (HW/labs/in-class 45 · midterm 25 · project 30 [report 22 + presentation 8 — split is a DRAFT for Scott]); project deadline reconciled everywhere to Canvas-Sunday; **midterm-2026.R drafted** + worked key + pre-fit `midterm-anova-fit.rds` (see `_private/notes/MIDTERM-REVIEW-NEEDED.md` — now a review checklist); final-project.qmd gained a weighted rubric grid + the 8-min presentation spec + the both-traditions final-model requirement (hw-12 + key updated to match); public worked exemplar (`final-project-exemplar.qmd` + downloadable script) on crash-ak.
- **Accuracy fixes caught during the build**: S2 "Who's Dragging the Mean?" prose credited the Loop but the output shows Fuller Park (fixed); S11 "Watch the Units" said ~6/−0.0006 for a −5.22 coefficient (now ~5/−0.0005). All logged in the CHANGES files.

Every substantive change has a bullet in `_private/notes/CHANGES-week-NN.md` (new "Course-review pass (July 2026)" sections).

**Phase 3 verification & ship (July 21, 2026):** full project render clean (one stale-`.rmarkdown` crash fixed en route — see render gotcha above); sharpened key-leak checks return nothing; `_private/` absent from `_site`; browser overflow audit clean on all 10 touched decks (the only overflows found were in the new material itself — six slides trimmed, plus one edit that had swallowed the "Simulating Probabilities in CJ (2)" heading, caught and restored); every new page's numbers verified by executing the code (demos/practice via Rscript, exemplar's Bayesian twin refit); committed (149 files), pushed, published to gh-pages, Pages build confirmed "built", live spot-checks all 200 (moved gif, demo, practice, exemplar + script, rebuilt decks, grade-weights table, S6 appendix).

## Earlier phases (history, condensed)

- **Phases 1–2 (completed July 2026):** full 14-session course built from the 2025 PowerPoints — decks, labs 2–12, homework + keys, workshop session, project checkpoints 1–4, midterm/help/presentations pages, final-project page, site scaffold, GitHub Pages pipeline, anchor dataset + codebook, media transcoded via macOS `avconvert`. Verified then: render clean, key privacy, labs run top-to-bottom in fresh R sessions, overflow audit clean.
- 2025-material bugs found & fixed during the rebuild: S3 HW conditional/joint wording + key numbering; S8's 2025 key printed a fabricated ANOVA table (claimed F=17.78, actual 72.71); S12's saved 3D logistic widget had a transposed z-matrix (live version regenerated correctly; the RECORDING still shows the old surface — on the TODO).

## TODO when you come back

### Decisions / reviews needed from Scott
- [ ] **Confirm Fall 2026 dates.** Session dates are PROVISIONAL — set `firstday` and the break/conference dates at the top of `syllabus.qmd` once USC's official calendar is out. Everything recomputes from those (including the new Sunday-before-S14 project deadline, computed as `final_day - days(3)`). Also update the placeholder date language on `final-project.qmd`.
- [ ] **Review the July 2026 course-review pass** — the new "Course-review pass (July 2026)" sections in `_private/notes/CHANGES-week-*.md` itemize every change. Highest-value eyeballs: the rebuilt S3 Bayes act + trimmed S6 (`slides/week-03-probability.qmd`, `week-06-hypothesis-testing.qmd`), the grade-weights table + report/presentation split (`syllabus.qmd` — the 22/8 split of the project 30% is a draft), the rubric grid + presentation spec (`final-project.qmd`), and the exemplar (`final-project-exemplar.qmd`).
- [ ] **Approve the drafted midterm** — `_private/exams/midterm-2026.R` + key + pre-fit `.rds`; `_private/notes/MIDTERM-REVIEW-NEEDED.md` is now the review checklist. (2025 exam stays archived unmodified.)
- [ ] **Re-record the S12 3D walkthrough video** — the live widget was fixed but `media/week-12/3d-logistic.mp4` still shows the pre-fix transposed surface (CHANGES-week-12).
- [ ] **Confirm the S6 reading** — the hub assigns Scott's own *Police Forum* Bayes article; confirm that's the intended piece.
- [ ] **Optional:** eyeball decks at projector resolution; videos cap at 480px tall with headroom to enlarge. Note the exemplar and practice-12 both analyze crash-ak injury~intoxication (different covariates) — coherent by design, but flag if you'd rather they diverge.

### Standing decision-records (already handled)
- S11 homework's deliberately honest-null officers model stayed in (flagged for veto, not vetoed).
- Canvas-vs-Blackboard: resolved — site is all-Canvas. (2025-material bug history now lives under "Earlier phases" above.)

### Known conventions/gotchas (all documented in CONVENTIONS.md)
- Publish loop + the GitHub Pages stuck-build check (see "Publishing gotcha" above)
- `media/` + `data/` must stay in `_quarto.yml` `resources:` (videos silently vanish otherwise)
- Plain `<video>` tags only, never the `{{< video >}}` shortcut
- Slide-density rules + `tools/audit-slide-overflow.js` (v2: measures flow AND visual bottom) before publishing any deck edit
- Bayesian stack: `BayesFactor` for t-tests (S6) · `brms` + `emmeans` for ANOVA (S8) · `correlation` pkg (S10) · `brms` for regression/logistic (S11/S12) — matches Scott's 2025 workflow and the midterm
- brms chunks: chains=2, iter=2000, seed=705, refresh=0; `freeze: auto` caches them (first render of those decks is slow — don't panic)
