# CRJU 705 Modernization — Project Notes

*Last updated: September 21, 2026 — the Session 6 rebuild (no Bayes factors or Cohen's d; the course function `bayes_prop_test()`; arrest-rate example in percent; new Lab 6 with no Exit Ticket; hw-06 on the crash data; R4DS Ch. 17). Before that, September 15, 2026 (overnight) — Session 6 aligned with Session 5 (factor line, clock times, no alphabetical flip; demo, hw-06 + key, practice-06 likewise); the repo renamed `crju705-site.nosync` to leave iCloud Drive sync; `_private` moved to `../crju705-private/` behind a committed symlink; iCloud diagnosed as the source of the duplicate-file junk. Before that, September 14, 2026 — the Session 5 pass: Scott's five deck fixes (Snow map label, the 100-intervals demonstration run twice, a width plot, one subtraction direction with clock times, the "does not cross zero" pictures), Lab 5 simplified again, hw-05 cut to what lecture and lab cover, R4DS Ch. 19 + 18 replaced by Ch. 16. Previously September 7, 2026 — the Session 4 rebalance: labs now practice the lecture instead of running a parallel wrangling thread, R4DS Ch. 7–8 dropped for Ch. 10, Session 3 trimmed to what was actually assigned. Before that August 25, 2026 — the first-week-of-teaching pass: the week-01 swirl-list rendering bug (found grading HW 1), the week-02 dispersion reorder, and the slide-overflow audit finally run for real (week 8's two overflows fixed). All shipped live. Working notes for picking this back up.*

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
| **Working source** | `crju705-site.nosync/` (this folder) |
| **2025 archive (untouched source material)** | `../CRJU 705/` |
| **Colleague's course (lab template + datasets borrowed)** | `../CRCJ 8950 Spring 2026/` |
| **Keys, exams, CHANGES logs (`_private/`)** | `../crju705-private/`, reached through the committed symlink `_private` (iCloud-synced, not in git; since Sep 14, 2026) |

Source directories, in student-facing terms: `weeks/` (hub pages — objectives, story, links), `slides/` (reveal.js decks), `labs/`, `homework/`, `demos/` (per-session "lecture written down" walkthroughs, self-contained), `practice/` (ungraded problem banks, collapsed solutions), `final-project-exemplar.qmd` (+ downloadable script). `syllabus.qmd` renders **both HTML and PDF** — `_site/syllabus.pdf` is a build artifact, not committed, so it only reaches students on a publish. Note `weeks/week-13.qmd` is **presentations** (the old help-session page was deleted and week-14 renamed into its place). Non-public: `_private/keys/` (HW answer keys), `_private/exams/` (2025 archive + **midterm-2026.R draft**, worked key, pre-fit `midterm-anova-fit.rds`, `make-midterm-fit.R`), `_private/notes/` (per-week CHANGES logs + the midterm review checklist).

## How to work on it

```bash
# from crju705-site.nosync/
git pull                  # FIRST, every session: the other Mac may have pushed
quarto preview            # live local preview while editing
quarto render             # build the whole site to _site/
# then publish:
git add -A && git commit -m "..." && git push
quarto publish gh-pages --id crju705-gh-pages --no-prompt --no-browser

# ...or, after you have already rendered and VERIFIED _site yourself:
quarto publish gh-pages --id crju705-gh-pages --no-prompt --no-browser --no-render
```

**Prefer `--no-render` when you have just verified a clean build.** Without it,
`quarto publish` re-renders, and you then ship output you never inspected.

**Two machines (since Sep 14, 2026).** The repo moves between Scott's Macs through
GitHub only (it is `.nosync`, so iCloud no longer carries it); `_private/` moves through
iCloud only (it is a symlink to `../crju705-private/`, which is synced and gitignored).
So: `git pull` before every session, push before switching machines, and expect
`_private/` to arrive a little later than the clone on a fresh machine. The full
two-machine workflow, including how a Claude Code session on the other Mac picks this
up, is in `../PROJECT_NOTES.md` under "Working from two computers."

**⚠️ This repo lives inside iCloud Drive sync, and the sync daemon breaks build
hygiene.** Diagnosed Sep 14, 2026: `~/Documents` carries the
`com.apple.file-provider-domain-id` xattr and `brctl status` shows CloudDocs syncing
it, with a sync landing minutes after every render. Two symptoms, both seen that
night:

1. **Conflict duplicates.** Copies named `name 2.png`, `index 2.html`,
   `syllabus 2.pdf`, `resources.qmd 3.json`, … appear next to the originals in
   `_freeze/`, `_site/`, `.quarto/`, and `_private/` shortly after a render. Two such
   PNGs had already been committed under `_freeze/` and published to `gh-pages` by
   an earlier pass (weeks 1 and 2); both were removed from the repo and the branch
   on Sep 14. `_site` is gitignored, so **git never warns about junk there, and
   `quarto publish` (copy-over) would ship it.**
2. **Resurrected intermediates.** A project render writes each page beside its
   source and then moves it into `_site`; the daemon uploads the intermediate and
   later puts it back. After a clean `git add -A` commit, `syllabus.html` +
   `syllabus_files/`, `homework/hw-05.html`, `labs/lab-05-intervals.html`,
   `demos/demo-05-confidence-intervals.html` + `_files/`, and
   `slides/week-05-confidence-intervals_files/` reappeared next to their sources
   with render-time mtimes. Deleted.

**The repo itself left iCloud that night** (renamed `crju705-site.nosync`), and no
duplicates have appeared in it since. `_private/` is still synced (it is a symlink to
`../crju705-private/`), so the check below matters there, and it is cheap insurance
after any render. **List first, delete only what the list shows.** A bare
`find -name "* [0-9].*" -delete` is not safe outside the repo: legitimate names such
as `Problem Set 4.docx` or a student's `Exercise 1.2.5 5.R` match it too. An iCloud
conflict copy is `name N.ext` sitting *next to* its original `name.ext`, so test for
the original:

```bash
# from the repo root: iCloud conflict copies = "name N.ext" whose "name.ext" exists beside it
find . \( -path ./.git -o -path ./.claude \) -prune -o -name "* [0-9].*" -type f -print \
  | while IFS= read -r f; do o="$(printf '%s' "$f" | sed -E 's/ [0-9]+(\.[^.]+)$/\1/')"; [ -e "$o" ] && echo "$f"; done
# review that list, then delete exactly those paths; then:
git status --short      # must be empty of stray .html/_files next to sources
```

The `* [0-9].html` ignore rule is not protection: it only hides junk from
`git status`.

**⚠️ Publishing gotcha — `quarto publish` is copy-over, NOT sync.** It copies `_site`
onto the `gh-pages` branch but does **not delete** files that disappeared since the
last publish. In August 2026 this left `weeks/week-14.html` live and reachable for
weeks after the 13-session renumber, still serving "Fourteen sessions ago" and
pointing at the deleted help session. Nothing linked to it, so nothing surfaced it.
After any rename or deletion, audit and clean the branch by hand:

```bash
git fetch -q origin gh-pages
git ls-tree -r --name-only origin/gh-pages | sort > /tmp/ghp.txt
(cd _site && find . -type f | sed 's|^\./||' | sort) > /tmp/loc.txt
comm -23 /tmp/ghp.txt /tmp/loc.txt        # on gh-pages but NOT in _site = stale
```

Remove stale files via a worktree (`git worktree add <tmp> gh-pages`, `git rm`,
commit, push, `git worktree remove`), then re-check the URL 404s.

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

**⚠️ Content gotcha — never put a meaningful number in a Markdown ordered list.** Markdown
renumbers ordered lists **sequentially from the first item**, so a list written `1.` `2.`
… `8.` `12.` `15.` renders as **1–10** and the real numbers vanish silently — no warning,
and the source still *looks* correct. This bit for real in Week 1 2026: the week-01 swirl
lesson list used swirl's own menu numbers, and four of thirteen students did the wrong two
lessons. **If a number is data — a menu position, a step ID, a statute or exercise number —
make it literal text** (bulleted list with the number in bold, or a table). To check the
whole source at once, flag any adjacent ordered-list pair where the second number isn't
first + 1 (skip fenced code blocks — chunk contents are full of `1.`-looking lines):

```bash
# quick, noisy version — eyeball the hits; a real check needs fence awareness
grep -rn --include="*.qmd" -E '^\s*[0-9]+\.\s' . | grep -v '^\./_site/' | grep -v '^\./_freeze/'
```

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

  **If the `find` check trips, look in `_freeze/`, not just `_site/`.** `_freeze` is
  git-tracked, so a stale figure there is recopied into `_site` on every render and the
  check keeps failing no matter how often you delete it from `_site`. That is exactly
  what happened with `key-figure-1.png`, orphaned by a July chunk rename to
  `headline-figure` and only truly fixed in August by deleting it from `_freeze`.

**⚠️ Two cosmetic build quirks, neither harmful:**
- Renders sometimes emit duplicate `bootstrap-<hash>.min 2.css`, `min 3.css`, … in
  `_site/site_libs/bootstrap/` — byte-identical, ~500 KB each, referenced by nothing.
  Reproducible even from an empty `_site`. Sweep before publishing:
  `find "_site/site_libs/bootstrap" -name "*min [0-9]*.css" -delete`
- A clean rebuild (`rm -rf _site && quarto render`) is cheap because `_freeze` caches
  the R execution — no brms refits — and it is the only way to guarantee `_site` holds
  nothing stale. Worth doing before any publish that involved a rename or deletion.

**⚠️ PDF output requires xelatex.** `syllabus.qmd` sets `pdf-engine: xelatex` and this is
load-bearing, not stylistic: the page contains `² · – — →` and curly quotes, every one of
which is a hard failure under the default pdflatex. Any new PDF-rendered page needs the
same. kableExtra tables also **float** in LaTeX and will drift pages away from their
introducing text — branch on `knitr::is_latex_output()` and pin with
`latex_options = "HOLD_position"` plus `\usepackage{float}` (see the grading table).

## Design decisions (already made — don't relitigate)

- **13 sessions** (Fall 2026 actual): 11 content + midterm (S9) + presentations (S13). Was 14 with a dedicated project help session at S13; the Tuesday calendar left only 13 teaching days, so the help session was cut and folded into S12's final half hour as a code clinic + presentation-order draw. See `_private/notes/CHANGES-calendar-2026.md`.
- **R4DS threaded through S2–S6** as readings, alongside Stanton. **(Superseded in part, Sep 7 2026 — see "The lecture/lab split" below: the labs are no longer the wrangling thread.)**
- **(Aug 2026) R4DS exercises are GRADED homework, not self-check** (Scott's call). A curated subset per week — chosen for what the final project needs, not for coverage — submitted in the *same* `.R` script as that week's problem set, under a `# ---- R4DS ----` header. They live as a numbered section of `hw-02`…`hw-05`; Session 1 has no `hw-01.qmd`, so its set is submitted with the swirl scripts. **Every exercise section number was verified against the live r4ds.hadley.nz chapters** — do not add more from memory. Ch. 5 has only one exercise block (5.2.1, the pivot sections have none) and Ch. 8 has none.

  **(Sep 7, 2026) The arc changed.** It is now S1→S2 Ch. 1–2 · S2→S3 Ch. 3–4 · S3→S4 **Ch. 5 only** · S4→S5 **Ch. 10 (EDA)** · S5→S6 **Ch. 16 (Factors)**. **Ch. 6, 7, 8, 18, and 19 are no longer assigned** — Ch. 6's RStudio Project substitute was cut with the rest of the Session 3 over-assignment (the instruction survives in Lab 4's workflow-hygiene section), and Ch. 7–8 were dropped when Lab 5 stopped being an import lab. Chapter 10's exercises are **10.3.3 #1/#2/#3 and 10.4.1 #2**; the others were rejected because 10.5.1.1 #4 and #6 need `lvplot` and `ggbeeswarm` (not installed) and 10.5.3.1 #5–#6 reference `smaller`, an object defined only in the chapter prose. **Chapter 10's URL is `EDA.html`, capitalized — `eda.html` 404s.** **(Sep 14, 2026)** Ch. 19 + 18 gave way to **Ch. 16 (Factors)**, URL `factors.html`, because the factor-levels line ("tell R which group comes first") is now what Session 5's two-group comparison and Lab 5 turn on. Its exercises are **16.3.1 #2, 16.3.1 #1, 16.4.1 #2, and 16.5.1 #2** (the last with a runnable `fct_collapse()` scaffold in the prompt, since the raw exercise means typing sixteen inconsistent level strings); 16.5.1 #1 was rejected as a four-step pipeline plus a line plot, 16.4.1 #1 as Week 2's mean-vs-median again, and 16.3.1 #3 / 16.4.1 #3 / 16.5.1 #3 as doc-reading. `gss_cat` ships with forcats, so nothing to install. Lab 6 (joins) is now the only thing that still assumes Ch. 19 — see the TODO.
- **Theory taught simulation-first** on real data (the fix for "repetitive/theoretical").
- **Anchor dataset = real Chicago 2025 crime**, at two levels (see below), running through lecture examples all semester. Labs rotate the colleague's simulated datasets for breadth.
- **Meets Tuesdays, 6:00–8:45 pm, Currell College 204** (confirmed Aug 2026). Blackouts: Oct 27 conference, Nov 3 election day, Nov 24 Thanksgiving. Fall break is Thu–Fri and misses Tuesdays.
- **Homework is due Sunday 11:59 pm** ahead of the next session (was "noon Tuesday," which only made sense under the old Wednesday meeting pattern).
- **Slides = Quarto reveal.js**, rebuilt from the old PowerPoints.
- **Pipe = `|>`** (native), because R4DS uses it. Materials note that `%>%` (which Scott uses by habit, and Stanton uses) is equivalent.
- **Improvements to slides are logged** in `_private/notes/CHANGES-week-NN.md` for Scott's review — see below.
- **(Phase 3) Bayes is threaded, not concentrated**: intuition seeded S1, theorem taught S3, machinery S6, priors named consistently S8–S12. Don't move it back into one deck.
- **(Phase 3) Demos + practice banks are the missed-class recovery path** — a deliberate choice over recorded lectures. Slides may depend on `R/setup.R`; demo pages must NOT (public URLs, plain colors, visible setup).
- **(Aug 2026) ANOVA is demoted, not cut.** Scott's read — ANOVA is near-absent as a final model in CJ journals — is correct, but S8 is really the **`brms` onboarding session**: it is where students install brms/emmeans, meet the Stan compile pause, and learn the crossing-0 interval rule, all of which S11's lab and demo explicitly depend on (`labs/lab-11-regression.qmd:114,139`, `demos/demo-11-regression.qmd:262`). The midterm's Bayesian half and Project Checkpoint 1 also ride on S8. So the machinery was compressed (−3 slides) and reframed (+3 slides: where ANOVA actually lives, the workflow is the point, it was regression all along) while the session, the midterm, and the checkpoint stayed put. **Don't cut S8 later without re-homing brms onboarding first.**
- **(Aug 2026) S2 dispersion order: chart, then practice, at every step.** Scott's call while
  teaching it. The three "Seeing the Machinery" charts are interleaved with the practice
  slides rather than grouped after them, and "Practice — Variance and SD" is split so
  "Standard Deviation, in Words" sits *between* the variance practice and the SD practice —
  students meet the concept in words before computing it. Don't re-group the charts.
- **(Phase 3) Grade weights 45/25/30** (HW·labs·in-class / midterm / project), project 30% split 22 report + 8 presentation (split still a draft); final model reported in **both traditions**; presentations 8 min + 2 Q&A; midterm ships a pre-fit brms `.rds` (never a live Stan compile in the exam).

## The anchor dataset

Built by `R/build-anchor-dataset.R` (reproducible; raw downloads go in gitignored `data-raw/`). Codebook + caveats on the site: `chicago-data.qmd`.

- **`data/chicago-crimes-2025.csv`** — 30,000-incident random sample (seed 705) of real 2025 Chicago Police data. Columns incl. `primary_type`, `crime_category` (Violent/Property/Other, course-defined), `arrest`, `domestic`, `community_area`, `hour`, coords.
- **`data/chicago-areas.csv`** — all 2025 incidents aggregated to the 77 community areas, joined with CMAP/ACS socioeconomic covariates (poverty, unemployment, income, education, race, rent…). Has `high_violence` (binary) for the logistic-regression week.

Lab datasets (from colleague, CSV-cleaned, in `data/`): `prisoners`, `neighborhoods`, `cities-wide`, `reentry-wide`, `crash-ak` (+ `.xlsx` twin), `officers`, `population-data`.

## STATUS: Session 6 rebuild (September 21, 2026) COMPLETE ✅ — shipped live

Scott's review the night before Session 6. Full itemization in
`_private/notes/CHANGES-week-06.md` (two Sep 21 sections: lecture, then everything else).

- **No Bayes factors, no BayesFactor package, no Cohen's d in Session 6.** The Bayesian
  half is the posterior and the credible interval only, from one course function:
  **`bayes_prop_test()` in `R/bayes.R`**, called exactly like `prop.test()` with an
  optional `prior = c(yes, no)` written as imaginary prior cases. Students load it with
  `source("https://smourtgos.github.io/crju705/R/bayes.R")`; nothing to install. It is
  published through `resources:` in `_quarto.yml` (that one file, not `R/setup.R`). Exact
  beta posteriors; the difference uses 100,000 draws with a seed fixed inside the function
  and the caller's RNG restored, so every student's numbers match the slides and keys. It
  never prints a flat 0 or 1 probability.
- **New real-data question, in percent:** among violent crimes, domestic 19.7% (740 of
  3,749) vs not 13.2% (714 of 5,399), read Domestic minus Not domestic. The time-of-day
  example is gone from Session 6 (decimal hours confused students badly).
- **Recidivism prior in plain words:** "about 60%, held as firmly as if we had watched 10
  people, 6 reoffended and 4 did not" = `prior = c(6, 4)`. 0.91 with it, 0.92 without.
- "Bootstrap" is "repeated sampling" everywhere; the thesis sentence and every "collision"
  are gone; the deck's three simulation figures are `echo: false` (code is on the demo).
- **Lab 6 is `labs/lab-06-testing.qmd`** (officers.csv, PTSD screen by gender, then by
  facility; both tests, a prior, and the p-value line of `t.test()`). The joins lab is
  deleted, which closes the old "Lab 6 has no reading behind it" TODO. **No Exit Ticket**
  (see CONVENTIONS).
- **hw-06 Part 3 mirrors Lab 6 on crash-ak.csv** (anyone hurt 62.5% vs 46.6%; fatal 6.1% vs
  2.5%; a pretend DUI-court pilot with `prior = c(9, 11)`, p = 0.13 vs 0.93; "how big, in
  real units"). **R4DS S6→S7 is Ch. 17 (Dates and times):** 17.2.5 #1, 17.2.5 #3
  (lubridate half, d1–d5), 17.3.4 #5 (starter given; Saturday), 17.4.4 #2 (2015 half),
  quoted from the live page Sep 21. The R4DS thread now runs through Problem Set 6.
- **GOTCHA — pages that `source()` the public URL cannot render until that file is live.**
  Publish order used: render everything that does not load it, publish `--no-render`, wait
  for the URL to return 200, render the lab/demo/practice, publish again. Only matters when
  `R/bayes.R` is new or changed.
- **GOTCHA — `here::here()` from `_private/` resolves to `crju705-private/`, not the repo**
  (the symlink's real path). `hw-06-key.qmd` sources the public URL with a relative-path
  fallback (`../../crju705-site.nosync/R/bayes.R`).
- Verification: every typed number read against rendered output (deck, demo, lab, key,
  practice); forbidden-term grep clean (the only "bootstrap" hits in the built deck are
  Quarto's own JS); overflow audit v3 clean twice (48 slides); privacy checks clean after
  the `_quarto.yml` change; `comm -23` audit found the old joins page and seven stale
  figures on gh-pages, removed through a worktree; live deck and lab are byte-identical to
  the verified local build.

**Now stale elsewhere, to fix in their own weeks:** `labs/lab-07-workshop.qmd` and
`demos/demo-07-workshop.qmd` run `ttestBF()` (**before Sep 29**); Labs 7–8 Exit Ticket;
`slides/week-08-anova.qmd:363` and `demos/demo-08-anova.qmd:227` ("`ttestBF()` (S6)");
Session 10's deck, lab, practice, demo, key, and `weeks/week-10.qmd:37` ("Session 6's
scale," "the Bayes factor lets you say so"); `resources.qmd:45` and the Session 1 deck
(BayesFactor in the install line); the midterm, its key, and `midterm.qmd` (test
`ttestBF()` and the BF scale; Scott: adjust later). No Bayesian answer for a difference in
*means* exists before Session 8's brms.

## STATUS: Session 6 alignment + `.nosync` rename (September 14, 2026, later the same night) COMPLETE ✅ — shipped live

Two follow-ups Scott asked for after the Session 5 pass, plus one consequence. (1) **The
repo is now `crju705-site.nosync`**, which takes it out of iCloud Drive sync; see the
publishing gotcha and the closed TODO. Because that also stopped `_private/` from
reaching the other Mac, **`_private/` was moved to `../crju705-private/` (synced) and
replaced in the repo by a committed symlink**; `quarto inspect` confirms none of the 72
render inputs are under it, and the privacy checks still pass. (2) **Session 6 matches Session 5**: `vp`
carries the factor line, the deck reads Violent minus Property everywhere (t =
2.61), times are clock times and minutes, "Two Threads, One Course" became "How
Today Works," and the closing slide no longer credits an R4DS reading students did
not do. The demo mirrors it; hw-06 hands students the Domestic-first factor line
and its key grades a direction *check* instead of a FALSE − TRUE trap; practice-06
stops teaching the alphabetical flip. Audit v3 clean (48 slides). Itemized in
`_private/notes/CHANGES-week-06.md`. Lab 6 and the week-06 hub's joins lines are
deliberately untouched.

## STATUS: Session 5 pass (September 14, 2026) COMPLETE ✅ — shipped live

Shipped the night before Session 5 from Scott's review of the deck and lab. Full
itemized log in `_private/notes/CHANGES-week-05.md` (the September 14 section);
the short version:

- **Deck.** The Snow map's "77 deaths within r = 1" label came off the dots (the
  count is in the subtitle; the Broad St pump is a gold triangle, no label box at
  all). The "In Practice" slide no longer ends in a stage direction; three new
  figure slides run the 100-intervals demonstration a second time (no truth line,
  then the truth line, then two researchers side by side), with a local
  `set.seed(1854)`. "Sample Size Buys Precision" kept its table and gained a
  pointrange plot. The two-group section reads **Violent minus Property** start to
  finish via `factor(levels = ...)` (its own slide, "One Extra Line: Who Comes
  First"), times are clock times and minutes, and two new `patchwork` figures show
  what "does not cross zero" looks like (Violent vs Property) and what crossing
  looks like (violent crimes, arrest vs no arrest: CI −40 to +9 minutes, p = 0.22),
  followed by that t-test in full. 40 content slides plus 4 section dividers (47 in
  reveal's count, with the title slide and two `output-location: slide` outputs);
  audit v3 clean after `{.smaller}` on the precision slide and on "A Real
  Question," plus the split above.
- **Lab 5** simplified again: `count()` then `prop.test(42, 192)` with the numbers
  typed, full `t.test()` output read from the bottom up, no `$conf.int`, no
  `nrow()`, a *given* factor line so the interval reads Positive minus Negative, and
  a Your Turn that repeats the walkthrough on `rank` and `job_satisfaction`. **The
  deliverable is the Your Turn script** with four reflection comments at the
  bottom (Scott's call; the Exit-Ticket-only submissions in Week 4 were the trigger).
- **hw-05** cut to what lecture and lab cover: the date-parsing Part 1 and the
  bootstrap Part 5 are gone; the groups are labeled in words with a given
  `if_else()` line (alphabetical order already puts Intoxicated first); the t-test
  reads +0.33 to +0.45 injuries with a direction *check* against the group means;
  `prop.test(1545, 20000)`. Key rewritten to match; nothing in the homework is
  random any more.
- **R4DS S5→S6 is Ch. 16 (Factors)**, changed in the hw, both hubs, the deck's
  read-ahead line, `schedule.qmd`, `syllabus.qmd`, and `weeks/week-07.qmd`.
- Every typed number was recomputed in a fresh session and re-read on the rendered
  pages. Removing the deck's `ggrepel` layer shifted the RNG stream by two draws,
  and every typed sample number (14.8%, 10.8–20.0%, "12% and 21%", 97 of 100)
  survived; the deck and demo now produce identical outputs.

## STATUS: Session 4 rebalance (September 7, 2026) COMPLETE ✅ — shipped live

Shipped the night before Session 4, all committed, pushed, published, Pages-build-confirmed,
and verified on the live pages. Driver: **the lecture/lab split** (see Standing
decision-records). Grading Weeks 1–3 showed students who have never coded getting
discouraged by the coding load in lecture; Week 3 went better when the lecture stayed
conceptual and the code happened in the in-class exercise.

- **The Session 4 drug-test slide was rewritten, and it carried a real error.** It said
  "2% of tested drivers actually carry" with no object and never named what the test
  detects. It also computed `P(carrying | +)` ≈ 29% and then said "the courtroom cares
  about `P(clean | +)`" — the complement, not the same quantity.
  Both fixed, arithmetic re-verified (980 clean × 5% = 49 false alarms; 69 positives;
  20/69 = 29%; 49/69 = 71% wrong). Retitled off "(Session 3 Redux)": Session 3's worked
  example was **Ianfluenza**, a disease, at 1% / .90 / .95 → 15%, so students never saw
  these numbers there.
- **Labs 4 and 5 replaced, and renamed.** `lab-04-tidy.qmd` → **`lab-04-sampling.qmd`**
  (build a sampling distribution on `crash-ak.csv`, ending with the CLT on a TRUE/FALSE
  variable) and `lab-05-import.qmd` → **`lab-05-intervals.qmd`** (`prop.test()`, `t.test()`,
  and saying an interval out loud honestly, on `officers.csv`). Both use deliberately
  simple code — `replicate()` rather than the decks' `map_dbl()` + list-column idiom — and
  every task was executed end to end before shipping.
  - Lab 4's CLT task uses `injuries > 0` (47.8%) rather than `intox_any` (7.7%), because at
    np ≈ 48 you actually get a bell curve; at np ≈ 8 you get a lumpy right-skewed histogram
    that undercuts the point.
  - Lab 5 uses `officers.csv` because `hw-05` already runs `prop.test`/`t.test` on the crash
    data and `practice-05` uses `prisoners` + Chicago. Its two-group CI (**−0.77 to +0.26
    hours**) contains zero on purpose: the honest-null sentence is the harder one to teach.
    `officers.csv` has 8 NAs in `ptsd_screen`, filtered in Setup **out loud** rather than
    left to bite mid-task.
- **hw-04 Part 5 cut** (its CLT-on-a-binary task moved into Lab 4, where it is walked
  through), R4DS renumbered Part 6 → Part 5, and **Ch. 7–8 replaced by Ch. 10**. The key's
  Part 5 block was removed and its stale "Parts 4–5 are new for 2026" line corrected.
- **Session 3 trimmed to what was actually assigned** (hw-03 Parts 1–3 + R4DS Ch. 5; Lab 3
  Your Turn 1–3), including a standing contradiction: `syllabus.qmd`, `weeks/week-03.qmd`,
  and the deck all described the graded in-class exercise as the factory-accidents table,
  which is the Lab 3 stretch task that was never run.
- **Session 7's false claims corrected** — its pipeline table credited "Tidy · Session 4"
  and "Import · Session 5" for skills that will no longer be taught. The redesign is still
  open; see the TODO.

**Two defects found by the verification rather than by the request:**

- **`tools/audit-slide-overflow.js` was unreliable and is rewritten (v3).** v2 measured
  immediately after `Reveal.slide()`, so any slide still mid-transition was measured at an
  animated offset — it returned a *different* false positive on each pass over the same
  deck, and sent this session chasing two slides that were fine. v3 forces
  `transition:'none'` and makes every fragment visible before measuring. Repeated runs on
  an unchanged deck now agree exactly. **Re-audit any deck you audited with v2.**
- **`slides/week-03-probability.qmd` "The Dreaded *Adamsitis* Strain of *Ianfluenza*"
  overflowed by 81px** — pre-existing, and live during the Sept 1 session. The Aug 25 audit
  covered only weeks 1, 2, 8, and 12, so week 3 had never been checked. Fixed with
  `{.smaller}`. All four touched decks (3, 4, 5, 7) now audit clean and stable.

Render 72/72 exit 0 (two renames, so the count is unchanged), both privacy checks clean.
Grading-side material for Week 3 lives **outside this repo** in
`../Homework Assignments/Week 3 Work/_grading/`.

## Prior status: First-week-of-teaching pass (August 25, 2026) COMPLETE ✅ — shipped live

The semester is now **running** — Session 1 met Aug 18 and HW 1 came back Aug 24, so from
here changes are being made to a live course with students in it. Three things shipped
Aug 25, all committed, published, Pages-build-confirmed, and verified on the live page:

- **Week-01 swirl lesson list fixed (a real teaching cost, not cosmetic).** The list used
  swirl's own menu numbers as a Markdown ordered list — `1.`–`8.`, then `12.` and `15.` —
  and **Markdown renumbers ordered lists sequentially**, so the live page silently showed
  1–10. Four of thirteen students navigated swirl's menu by number and completed lessons 9
  (Functions) and 10 (lapply and sapply) instead of the assigned 12 (Looking at Data) and
  15 (Base Graphics). Now a **bulleted** list with the swirl number in bold, plus an
  explicit note that lessons 9–11, 13, and 14 are not assigned. A fence-aware scan of every
  `.qmd`/`.md` in the source found **no other non-consecutive ordered lists**; the two decks
  that name the lesson numbers (`slides/week-01-stats-is-awesome.qmd:608`,
  `slides/week-02-descriptives.qmd:35`) write them inline as literal text, which is safe.
- **Week-02 dispersion section reordered** (Scott's call): each "Seeing the Machinery" chart
  now immediately *precedes* its practice slide (raw votes → Practice Range; deviations →
  Practice Deviations; squares → Practice Sum of Squares), and the old "Practice — Variance
  and SD" slide is **split in two around "Standard Deviation, in Words"** — variance before
  it, SD (plus the `var()`/`sd()` built-ins and the n−1 IOU) after. `demos/demo-02` §3 was
  reordered to mirror the arc (chart then numbers at each step, now five named steps). One
  mechanical consequence: `votes1`/`votes2` are now *also* defined hidden (`echo: false`) in
  the Step-1 chunk, because the charts precede the visible definitions on Practice — Range.
- **Slide-overflow audit run for real, and week 8 fixed.** See the TODO entry — the
  local-server problem that blocked it in August is gone.

Grading-side follow-through for the swirl bug (regrade, Canvas announcement, walkthrough
edits) lives **outside this repo** in `../Homework Assignments/Week 1 Homework/_grading/`;
student work never enters this repo or the site.

## Prior status: Fall 2026 delivery pass (August 2026) COMPLETE ✅ — shipped live

Everything below is committed, published, and verified on the live site. Detail lives in
`_private/notes/CHANGES-calendar-2026.md` and the per-week CHANGES files.

- **Calendar rewired to the real Fall 2026 schedule.** Tuesdays 6:00–8:45 pm, Currell 204.
  Blackouts Oct 27 (conference), Nov 3 (election day), Nov 24 (Thanksgiving) leave **13
  teaching Tuesdays against a 14-session design**. `syllabus.qmd`'s engine now walks
  Tuesdays, uses `n_sessions <- length(session_dates)` instead of a hard-coded `[14]`, and
  computes `project_due <- final_day - days(2)` (the old `days(3)` was right for Wednesday
  classes and lands on Saturday for Tuesday ones).
- **Session 13 (project help session) cut**; presentations renumbered into its place
  (`week-14.qmd` → `week-13.qmd` via `git mv`). Its duties folded into **S12's final half
  hour** as a code clinic + presentation-order draw. HW 12 / Checkpoint 4 re-anchored to the
  Sunday *after* S12, since the clinic now precedes the checkpoint rather than following it.
- **All homework moved to Sunday 11:59 pm** (23 occurrences of "before noon Tuesday", which
  only made sense under Wednesday meetings). One title-cased heading survived the first
  sweep because it matched case-sensitively — fixed later; a case-insensitive grep is now clean.
- **ANOVA demoted, not cut** (see the design-decisions note above). Three slides of machinery
  compressed, three of framing added, including a verified `anova(lm())` ≡ `aov()` bridge.
- **R4DS exercises added across S1–S5 and made graded.** Session 1 had *no* R4DS assignment
  at all — every other hub pointed forward correctly, but S1 named only Stanton Ch. 1 while
  S2's "Before class" required R4DS Ch. 1–2.
- **Downloadable syllabus PDF** (13 pp., xelatex) linked from the syllabus page.
- **Syllabus session outline completed.** Eight of the thirteen homework lines were
  incomplete, in five distinct ways (missing R4DS entirely on S2–S5; S6 said "begin scouting"
  when selection is *due* at S7; S7 omitted the formal dataset selection; S10 omitted Stanton
  Ch. 8; S12 omitted both HW 12's different due date and the project deadline).
- **Session 1 slide fixes:** two slides printing 80-character output got `{.smaller}`; the
  chi-squared/ANOVA/correlation preview was rebuilt on real Chicago data (it had run on
  independently simulated columns, so every test was null *by construction* on top of the
  pairings being arbitrary); worked-answer slides added for both Your Turns.

**Verification performed:** clean full renders from an empty `_site` (72/72, exit 0); all
three privacy checks clean; every number on new slides executed rather than asserted; PDF
content checked (13 sessions, correct dates, no "Session 14"); live-site spot-checks after
each publish. **Not performed at ship time: the slide-overflow audit** — it needs a browser console and
the local preview server would not bind in that environment. A static density proxy was used
instead and two slides trimmed. The real audit ran Aug 25, 2026, and week 8's two flagged
slides were fixed the same day (see TODO).

## Prior status: Phase 3 (July 2026 course-review overhaul) COMPLETE ✅

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
- [ ] **Confirm the semester start/end against USC's official Fall 2026 calendar.** The meeting pattern and blackouts are now CONFIRMED (Tue 6:00–8:45, Currell 204; out Oct 27 / Nov 3 / Nov 24), but `firstday`, `semester_start`, and `semester_end` in `syllabus.qmd` are still provisional (Aug 18 → Dec 5). Everything recomputes from them. **If the semester starts Aug 25 instead of Aug 18 the course drops to 12 sessions** and something else has to give. Also update the placeholder date language on `final-project.qmd`.
- [ ] **Decide on the project deadline vs. Thanksgiving.** As computed, the full project is due **Sun Nov 29 — the last day of Thanksgiving break** (`project_due <- final_day - days(2)`, preserving the Canvas-Sunday convention). Students get Nov 17–21 plus the break. Moving it to Sun Nov 22 protects the break but leaves only 5 days after S12. One-line change in `syllabus.qmd` plus prose in `final-project.qmd`.
- [ ] **Decide whether to bridge the 3-week S10→S11 gap.** Oct 27 and Nov 3 fall back-to-back, so correlation (Oct 20) and multiple regression (Nov 10) are three weeks apart — the tightest conceptual handoff in the second half. No clean reordering exists (the midterm must follow S8; S10 must follow the midterm), so the options are an asynchronous bridging task over the gap or an extended S11 warm-up.
- [ ] **Review the July 2026 course-review pass** — the new "Course-review pass (July 2026)" sections in `_private/notes/CHANGES-week-*.md` itemize every change. Highest-value eyeballs: the rebuilt S3 Bayes act + trimmed S6 (`slides/week-03-probability.qmd`, `week-06-hypothesis-testing.qmd`), the grade-weights table + report/presentation split (`syllabus.qmd` — the 22/8 split of the project 30% is a draft), the rubric grid + presentation spec (`final-project.qmd`), and the exemplar (`final-project-exemplar.qmd`).
- [ ] **Approve the drafted midterm** — `_private/exams/midterm-2026.R` + key + pre-fit `.rds`; `_private/notes/MIDTERM-REVIEW-NEEDED.md` is now the review checklist. (2025 exam stays archived unmodified.)
- [x] **Slide-overflow audit — RUN Aug 25, 2026; week-8 overflows FIXED same day** (browser console reached by serving `_site` with `python3 -m http.server`; the server binds fine now). Weeks 1 and 12 clean; week 2 clean after the dispersion reorder. Week 8's two overflows from the August ANOVA-demotion edits — slide 2 "This Week" (169px over the 700px canvas) and slide 36 "This Workflow Is the Point" (45px over) — trimmed without touching the demotion framing: `{.smaller}` on the opener (no text changed), one-line intro trim on the workflow slide (details in CHANGES-week-08 items 27–28). Re-audit clean: 0 of 47 slides overflow.
- [ ] **Decide about `options(scipen = 999)` in `R/setup.R`.** It prints p-values as `p-value < 0.00000000000000022` and `0.0000000000105` instead of `2.2e-16` / `1.05e-11`. On the Session 1 slide that introduces p-values for the first time that is arguably *harder* to read, not easier. Left alone because the setting is global across every deck, lab, and homework page — changing it is a one-liner but affects everything.
- [ ] **(Sep 7, 2026) Decide what Session 7 is now.** It is billed as the session where "the two threads meet," and after the lecture/lab split there is only one thread. Its workshop asks students to import and clean a messy file with no import or tidying instruction anywhere behind it. Tonight only corrected the false claims in the pipeline table and Lab 7's missingness block (see CHANGES-week-07). The redesign is a real decision and S7 is Sep 29, but **decide before Session 6**, because Lab 6 (joins, R4DS Ch. 19) is the next lab that hits the same tension. **(Sep 14, 2026)** Sharper now: Ch. 19 is no longer assigned anywhere (S5→S6 is Ch. 16), so `labs/lab-06-joins.qmd:6` ("assumes you've read Ch. 19") and `weeks/week-06.qmd` lines 3, 19, 30, 40 describe a lab with no reading behind it. Scott chose to leave Lab 6 alone on Sep 14 and decide with this item.
- [x] **(Sep 14, 2026) Repo moved out of iCloud Drive sync — DONE the same night.** The folder was renamed `crju705-site.nosync` (iCloud skips `.nosync` names); a full copy was taken first, git and `_private/` were verified intact afterwards, and the stale worktree registrations (`bold-volhard-1820af`, two `quarto-publish-worktree-*`) were pruned. No `name 2.ext` duplicates appeared in the renders that followed. Both notes files now use the new path. **Keep the purge-and-`git status` habit for one more pass** to confirm the daemon is really gone.
- [x] **(Sep 14, 2026) Session 6 deck brought into line with Session 5 — DONE the same night** (Scott's ask). Factor line, "How Today Works," clock times and minutes, no "alphabetically"; demo, hw-06 + key, and practice-06 fixed for the same contradictions. Detail in `_private/notes/CHANGES-week-06.md` (September 14 section). Lab 6 and the week-06 hub's joins lines are untouched, per the Lab 6 decision above.
- [ ] **(Sep 14, 2026) Propagate the lab-deliverable wording.** Lab 5's "How labs work" and Exit Ticket sections now say to submit the whole Your Turn script with the reflection comments at the bottom. Labs 2–4 and 6–8 still say to submit an Exit Ticket.
- [ ] **(Sep 14, 2026) `practice/practice-05.qmd`** still models `$conf.int`, `sum(x == ...)`, `nrow()`, and the alphabetical-direction language in all five solutions, and its Problem 4 reuses the deck's variable and machinery (CONVENTIONS line 85). Ungraded and public; align when convenient. `midterm.qmd:12` "pivot/join weeks" wording is also slightly off now.
- [ ] **Re-record the S12 3D walkthrough video** — the live widget was fixed but `media/week-12/3d-logistic.mp4` still shows the pre-fix transposed surface (CHANGES-week-12).
- [ ] **Confirm the S6 reading** — the hub assigns Scott's own *Police Forum* Bayes article; confirm that's the intended piece.
- [ ] **Optional:** eyeball decks at projector resolution; videos cap at 480px tall with headroom to enlarge. Note the exemplar and practice-12 both analyze crash-ak injury~intoxication (different covariates) — coherent by design, but flag if you'd rather they diverge.

### Standing decision-records (already handled)
- **(Sep 7, 2026) The lecture/lab split — the biggest structural change since the rebuild.** Scott's call, after grading Weeks 1–3: **lectures teach concepts; the in-class exercise is where code is written, together, step by step, with simple code.** Several students have never coded and a few have never taken a stats class, and the lecture coding load was discouraging them. Demos stay complete, both as student catch-up and as something to throw on screen mid-lecture. Consequences already shipped: Lab 4 became sampling distributions (`lab-04-sampling.qmd`), Lab 5 became confidence intervals (`lab-05-intervals.qmd`), and the "Two Threads, One Course" bridge slides in S4 and S5 became "How Today Works." **This dissolves the wrangling thread.** Labs 6 and 7 have not been converted yet — Lab 6 (joins, R4DS Ch. 19) is the next one that will hit this tension, and S7's workshop is still billed as "where the two threads meet." Do not re-add a wrangling lab without talking to Scott first.
- **(Sep 14, 2026) Two-group comparisons state their direction once, with `factor(levels = ...)`, and never flip.** Scott's call: the deck used to bootstrap Violent − Property and then let `t.test()` report Property − Violent alphabetically, explaining the flipped sign. Now the factor line goes in where the data are built (deck, lab, and the homework's given `if_else()` recode, which happens to sort the right way), and `t.test()` output is read from its `mean in group` lines. Known trap: `summarize(.by = )` prints groups in first-appearance order regardless of the factor, so either `arrange()` the table or skip it and read the means off `t.test()`.
- **(Sep 14, 2026) Times in the Chicago hour-of-day examples are clock times and minutes**, never decimal hours ("12:48 pm vs 12:33 pm", "4 to 27 minutes later"). A `clock()` helper formats axes.
- **(Sep 14, 2026) Lab code idiom for intervals: `count()`, read two numbers, type them into `prop.test(x, n)`; one `t.test(y ~ group, data = ...)` line read in full.** No `$conf.int`, `nrow()`, or `sum(x == ...)` in student-facing lab or homework code. `$conf.int` survives only inside the deck's simulation loops.
- **(Sep 14, 2026) The in-class deliverable is the Your Turn script**, with the reflection comments at the bottom, from Lab 5 on. Grading is completion of the Your Turn; the page now says so.
- S11 homework's deliberately honest-null officers model stayed in (flagged for veto, not vetoed).
- **R4DS exercises: graded, not self-check.** Proposed as self-check to avoid disturbing the 45/25/30 weights; Scott overruled. Syllabus grading row and *General Assignment Information* were updated to match, so the graded envelope is consistent.
- **13 sessions, not 14.** The help session was the cut (cheapest — demos and practice banks already cover that ground). Do NOT cut a content session to recover time without re-reading the ANOVA note above.
- Canvas-vs-Blackboard: resolved — site is all-Canvas. (2025-material bug history now lives under "Earlier phases" above.)

### Known conventions/gotchas (all documented in CONVENTIONS.md)
- Publish loop + the GitHub Pages stuck-build check (see "Publishing gotcha" above)
- **Two machines, two channels (since Sep 14, 2026):** the repo is `crju705-site.nosync` and moves only through GitHub (`git pull` first, push before switching); `_private/` is a committed symlink to `../crju705-private/`, which moves only through iCloud and is where `name 2.ext` sync duplicates can still appear. Purge them before trusting a listing. Full workflow in `../PROJECT_NOTES.md`, "Working from two computers."
- **`quarto publish` is copy-over, not sync** — deleted/renamed pages stay live on `gh-pages` until removed by hand (see "Publishing gotcha" above). Prefer `--no-render` to ship a build you actually verified.
  **(Sep 7, 2026 — this may no longer hold.)** Under Quarto 1.8.27, renaming `lab-04-tidy` → `lab-04-sampling` and `lab-05-import` → `lab-05-intervals` removed the old files from `gh-pages` automatically: both old URLs return 404, and a `comm -23` of the branch tree against `_site` showed only `.nojekyll` (which belongs there). `week-14.html` is also gone. So the manual worktree cleanup was not needed this time. **Still run the `comm -23` audit after any rename or deletion** rather than assuming either behavior.
- **Stale figures hide in `_freeze/`, which is git-tracked** — deleting them from `_site` alone does nothing; they come back on the next render
- **PDF pages need `pdf-engine: xelatex`** (the content routinely contains `· – — → ²`), and kableExtra tables need `HOLD_position` or they float away from their text
- `media/` + `data/` must stay in `_quarto.yml` `resources:` (videos silently vanish otherwise)
- Plain `<video>` tags only, never the `{{< video >}}` shortcut
- **Never put a meaningful number in a Markdown ordered list** — Markdown renumbers them sequentially and the real numbers vanish silently (see "Content gotcha" above; it cost four students the wrong swirl lessons in Week 1)
- Slide-density rules + `tools/audit-slide-overflow.js` (v3: measures flow AND visual bottom, with transitions off and every fragment forced visible) before publishing any deck edit. It can be run from this tool's browser pane too: serve `_site`, open the deck, paste the IIFE into `javascript_exec` with a `return` of the results array. **The audit is runnable now:** `python3 -m http.server` in `_site`, open the deck, paste the script in the browser console — the bind problem from the August pass is gone, so there is no excuse for the static-density proxy
- Bayesian stack: `BayesFactor` for t-tests (S6) · `brms` + `emmeans` for ANOVA (S8) · `correlation` pkg (S10) · `brms` for regression/logistic (S11/S12) — matches Scott's 2025 workflow and the midterm
- brms chunks: chains=2, iter=2000, seed=705, refresh=0; `freeze: auto` caches them (first render of those decks is slow — don't panic)
