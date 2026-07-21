# CRJU 705 Site Conventions

Rules for all course materials in this repo. Follow these when adding or editing any file.

## File naming

Lowercase, hyphenated, zero-padded session numbers:

- Slides: `slides/week-02-descriptives.qmd`
- Weekly hub pages: `weeks/week-02.qmd` (topic goes in the page title, keeping nav links stable)
- Labs: `labs/lab-02-visualize.qmd`
- Homework: `homework/hw-02.qmd`
- Answer keys: `_private/keys/hw-02-key.qmd` (NEVER outside `_private/`)
- Slide-change review logs: `_private/notes/CHANGES-week-02.md`
- Data: `data/lowercase-hyphenated.csv`

## Slide documents (`slides/*.qmd`)

Standard YAML header:

```yaml
---
title: "Descriptive Statistics"
subtitle: "CRJU 705 · Session 2 · Fall 2026"
author: "Scott M. Mourtgos"
format:
  revealjs:
    slide-number: true
    preview-links: auto
    chalkboard: true
    footer: "CRJU 705 · Session 2"
    theme: [default, custom-slides.scss]
    fig-align: center
execute:
  echo: true
  warning: false
  message: false
---
```

- `echo: true` is the default — students should see code. Use `#| echo: false` per-chunk for pure-figure slides.
- NO `embed-resources: true` — slides are served from the site; Quarto manages `*_files/`.
- **Slide density:** the canvas is 700px tall and reveal auto-shrinks only images — NOT code output, tables, or prose. Rules of thumb: max ONE code chunk with a ~10-row tibble printout per slide (or pipe into `head(4)`); use `#| output-location: slide` for big tables; split rather than cram. Before publishing a new/edited deck, run `tools/audit-slide-overflow.js` in the browser console on the rendered deck — it lists every slide whose content exceeds the canvas.
- **Videos: use plain `<video>` tags, NEVER the `{{< video >}}` shortcode.** The shortcode's video.js "fluid" player mis-sizes in reveal slides (clips, then letterboxes in a black box). Pattern:
  `<video src="../media/week-NN/file.mp4" controls preload="metadata"></video>`
  Slide CSS caps videos at 480px tall; on a slide where anything sits below/beside the video, add an explicit smaller `style="max-height:430px;"` or use columns.
- **`media/` and `data/` MUST stay listed under `project: resources:` in `_quarto.yml`.** Raw `<video>` tags are not tracked by full-project renders — without the explicit resource declaration, `quarto render` silently drops `_site/media/` and every animation 404s live (symptom: tiny black video boxes that won't play). After publishing a deck with videos, spot-check one live mp4 URL returns 200.
- First chunk is always:

````
```{r}
#| label: setup
#| include: false
library(tidyverse)
source(here::here("R/setup.R"))
theme_set(theme_minimal(base_size = 18))
set.seed(705)
```
````

## Labs (`labs/*.qmd`)

Four-part structure (adapted from a colleague's proven template):

1. **Setup** — packages + `read_csv("data/…")`; chunk given to students, runs as-is
2. **Walkthrough** — worked examples, executed, output shown
3. **Your Turn (1..n)** — task prompts + empty chunks with `#| eval: false`
4. **Exit Ticket** — 3–5 prompts, submitted via Canvas

## Demo walkthroughs (`demos/demo-NN-topic.qmd`)

One per content session — "the lecture, written down." Purpose: a student who missed class can reproduce every key demo start to finish without the instructor's environment.

- Naming matches the slide topic: `demos/demo-08-anova.qmd`
- **MUST be fully self-contained**: a *visible* setup chunk with `library()` calls, data loaded from the public URL (`https://smourtgos.github.io/crju705/data/…`), plain color names (NO `crju_colors`, NO `source(R/setup.R)`, NO `here::`), `set.seed(705)`
- Structure: *What you'll build* → *Setup* → sections mirroring the deck's arc, reproducing every key demo → *Try a variation* prompts at the end
- brms chunks use the standard sampler settings (chains = 2, iter = 2000, seed = 705, refresh = 0) and a compile-pause warning; `freeze: auto` caches them
- `demos/` is in the `_quarto.yml` `render:` allowlist — a new page renders automatically once the file exists

## Practice banks (`practice/practice-NN.qmd`)

Ungraded self-check problems, 4–6 per stats session, solutions hidden in collapsed callouts.

- Solutions are public but collapsed: `::: {.callout-tip collapse="true"}` with a `**Solution**` lead — acceptable because ungraded. **Never put graded-assignment answers here** (those stay in `_private/keys/`)
- Problems must use *different numbers/variables* than the homework and slides (same change-the-numbers rule as HW)
- Each solution chunk executes (output shown) so students can check against real numbers
- `practice/` is in the `_quarto.yml` `render:` allowlist

## Code style

- tidyverse style; native pipe `|>` (never `%>%`)
- Hash-pipe chunk options only (`#| label:`, `#| echo: false`); every chunk gets a `#| label:`
- One setup chunk per document: `library(tidyverse)` first, then stats packages (BayesFactor etc.), alphabetized; never `require()`; never mid-document `library()`
- `set.seed(705)` in every document with randomness (per-lab seeds allowed when a specific simulated dataset depends on it — document in the chunk)
- **No `setwd()`, no absolute paths, ever.** Everything relative to project root
- Data ships as CSV (not .rda) for transparency and cross-platform safety

## Privacy — answer keys and exams

Three layers keep keys off the public site:

1. `_quarto.yml` render exclusion: `!_private/`
2. Underscore-prefixed directory (Quarto skips it for resource copying)
3. `.gitignore` excludes `_private/` — keys never enter git history

Render a key locally on demand:
`quarto render _private/keys/hw-02-key.qmd --to docx` (output stays local).

**After any change to `_quarto.yml`:** re-render and check both of these return nothing:

```bash
grep -ril "answer key" _site/ --exclude-dir=site_libs
find _site -name "*key*" -not -path "*site_libs*"
```

(The older `grep "answer" | grep -i key` check is retired: since the demos/practice/joins content landed, public pages legitimately contain "answer" near "key" — join keys, "pairwise answer," and the practice banks' *intentionally public* collapsed solutions. The two checks above target actual answer-key artifacts: the phrase "answer key" and key-named files. Avoid naming chunks `key-*` in public pages so the `find` stays clean.)

## Slide improvements (vs. the original PPT decks)

Improving decks is encouraged (extra examples, better plots, clearer explanations), but every **substantive** addition or change vs. the original PowerPoint gets one bullet in `_private/notes/CHANGES-week-NN.md` so Scott can review it. Straight conversion/recoding needs no flag; new content does. The 3D plotly visualizations (weeks 10–11) are keepers: regenerate live from code, do not redesign.

## Publishing

- Weekly loop: edit → `quarto preview` → commit → `quarto publish gh-pages --no-prompt`
- Source of truth is `main`; the built site lives on `gh-pages`; never edit `gh-pages` by hand
- `_freeze/` is COMMITTED (freeze: auto) so expensive chunks don't re-run needlessly
