# CRJU 705 Modernization — Project Notes

*Last updated: August 18, 2026 — after the Fall 2026 delivery pass: calendar rewire (Tuesday, 13 sessions), ANOVA demotion, R4DS exercises made graded, downloadable syllabus PDF, and a set of Session 1 slide fixes. All shipped live. Working notes for picking this back up.*

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

Source directories, in student-facing terms: `weeks/` (hub pages — objectives, story, links), `slides/` (reveal.js decks), `labs/`, `homework/`, `demos/` (per-session "lecture written down" walkthroughs, self-contained), `practice/` (ungraded problem banks, collapsed solutions), `final-project-exemplar.qmd` (+ downloadable script). `syllabus.qmd` renders **both HTML and PDF** — `_site/syllabus.pdf` is a build artifact, not committed, so it only reaches students on a publish. Note `weeks/week-13.qmd` is **presentations** (the old help-session page was deleted and week-14 renamed into its place). Non-public: `_private/keys/` (HW answer keys), `_private/exams/` (2025 archive + **midterm-2026.R draft**, worked key, pre-fit `midterm-anova-fit.rds`, `make-midterm-fit.R`), `_private/notes/` (per-week CHANGES logs + the midterm review checklist).

## How to work on it

```bash
# from crju705-site/
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
- **R4DS threaded through S2–S6** as readings + short wrangling labs, alongside Stanton. Completes the "Whole Game" before the final project.
- **(Aug 2026) R4DS exercises are GRADED homework, not self-check** (Scott's call). A curated subset per week — chosen for what the final project needs, not for coverage — submitted in the *same* `.R` script as that week's problem set, under a `# ---- R4DS ----` header. They live as a numbered section of `hw-02`…`hw-05`; Session 1 has no `hw-01.qmd`, so its set is submitted with the swirl scripts. **Every exercise section number was verified against the live r4ds.hadley.nz chapters** — do not add more from memory. Ch. 5 has only one exercise block (5.2.1, the pivot sections have none), Ch. 8 has none, and Ch. 6's only two are a stale Twitter link and a docs link, so S3 substitutes building an RStudio Project (§6.2.3).
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
- **(Phase 3) Grade weights 45/25/30** (HW·labs·in-class / midterm / project), project 30% split 22 report + 8 presentation (split still a draft); final model reported in **both traditions**; presentations 8 min + 2 Q&A; midterm ships a pre-fit brms `.rds` (never a live Stan compile in the exam).

## The anchor dataset

Built by `R/build-anchor-dataset.R` (reproducible; raw downloads go in gitignored `data-raw/`). Codebook + caveats on the site: `chicago-data.qmd`.

- **`data/chicago-crimes-2025.csv`** — 30,000-incident random sample (seed 705) of real 2025 Chicago Police data. Columns incl. `primary_type`, `crime_category` (Violent/Property/Other, course-defined), `arrest`, `domestic`, `community_area`, `hour`, coords.
- **`data/chicago-areas.csv`** — all 2025 incidents aggregated to the 77 community areas, joined with CMAP/ACS socioeconomic covariates (poverty, unemployment, income, education, race, rent…). Has `high_violence` (binary) for the logistic-regression week.

Lab datasets (from colleague, CSV-cleaned, in `data/`): `prisoners`, `neighborhoods`, `cities-wide`, `reentry-wide`, `crash-ak` (+ `.xlsx` twin), `officers`, `population-data`.

## STATUS: Fall 2026 delivery pass (August 2026) COMPLETE ✅ — shipped live

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
each publish. **Not performed: the slide-overflow audit** — it needs a browser console and
the local preview server would not bind in that environment. A static density proxy was used
instead and two slides trimmed; the real audit is still outstanding (see TODO).

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
- [ ] **Run the slide-overflow audit on the decks edited in August** — weeks 1, 8, and 12. `tools/audit-slide-overflow.js` needs a browser console, which was unavailable during the August pass (the local preview server would not bind). A static density proxy was substituted and two slides trimmed, but that is not the real check. Open the rendered deck, paste the script, confirm nothing overflows.
- [ ] **Decide about `options(scipen = 999)` in `R/setup.R`.** It prints p-values as `p-value < 0.00000000000000022` and `0.0000000000105` instead of `2.2e-16` / `1.05e-11`. On the Session 1 slide that introduces p-values for the first time that is arguably *harder* to read, not easier. Left alone because the setting is global across every deck, lab, and homework page — changing it is a one-liner but affects everything.
- [ ] **Re-record the S12 3D walkthrough video** — the live widget was fixed but `media/week-12/3d-logistic.mp4` still shows the pre-fix transposed surface (CHANGES-week-12).
- [ ] **Confirm the S6 reading** — the hub assigns Scott's own *Police Forum* Bayes article; confirm that's the intended piece.
- [ ] **Optional:** eyeball decks at projector resolution; videos cap at 480px tall with headroom to enlarge. Note the exemplar and practice-12 both analyze crash-ak injury~intoxication (different covariates) — coherent by design, but flag if you'd rather they diverge.

### Standing decision-records (already handled)
- S11 homework's deliberately honest-null officers model stayed in (flagged for veto, not vetoed).
- **R4DS exercises: graded, not self-check.** Proposed as self-check to avoid disturbing the 45/25/30 weights; Scott overruled. Syllabus grading row and *General Assignment Information* were updated to match, so the graded envelope is consistent.
- **13 sessions, not 14.** The help session was the cut (cheapest — demos and practice banks already cover that ground). Do NOT cut a content session to recover time without re-reading the ANOVA note above.
- Canvas-vs-Blackboard: resolved — site is all-Canvas. (2025-material bug history now lives under "Earlier phases" above.)

### Known conventions/gotchas (all documented in CONVENTIONS.md)
- Publish loop + the GitHub Pages stuck-build check (see "Publishing gotcha" above)
- **`quarto publish` is copy-over, not sync** — deleted/renamed pages stay live on `gh-pages` until removed by hand (see "Publishing gotcha" above). Prefer `--no-render` to ship a build you actually verified.
- **Stale figures hide in `_freeze/`, which is git-tracked** — deleting them from `_site` alone does nothing; they come back on the next render
- **PDF pages need `pdf-engine: xelatex`** (the content routinely contains `· – — → ²`), and kableExtra tables need `HOLD_position` or they float away from their text
- `media/` + `data/` must stay in `_quarto.yml` `resources:` (videos silently vanish otherwise)
- Plain `<video>` tags only, never the `{{< video >}}` shortcut
- Slide-density rules + `tools/audit-slide-overflow.js` (v2: measures flow AND visual bottom) before publishing any deck edit
- Bayesian stack: `BayesFactor` for t-tests (S6) · `brms` + `emmeans` for ANOVA (S8) · `correlation` pkg (S10) · `brms` for regression/logistic (S11/S12) — matches Scott's 2025 workflow and the midterm
- brms chunks: chains=2, iter=2000, seed=705, refresh=0; `freeze: auto` caches them (first render of those decks is slow — don't panic)
