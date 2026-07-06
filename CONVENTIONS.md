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
- **Videos: use plain `<video>` tags, NEVER the `{{< video >}}` shortcode.** The shortcode's video.js "fluid" player mis-sizes in reveal slides (clips, then letterboxes in a black box). Pattern:
  `<video src="../media/week-NN/file.mp4" controls preload="metadata"></video>`
  Slide CSS caps videos at 480px tall; on a slide where anything sits below/beside the video, add an explicit smaller `style="max-height:430px;"` or use columns.
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

**After any change to `_quarto.yml`:** re-render and check
`grep -ri "answer" _site/ --exclude-dir=site_libs | grep -i key` returns nothing.
(`site_libs` is excluded because reveal.js's syntax-highlighter bundles contain
words like "answerCall" — known false positives.)

## Slide improvements (vs. the original PPT decks)

Improving decks is encouraged (extra examples, better plots, clearer explanations), but every **substantive** addition or change vs. the original PowerPoint gets one bullet in `_private/notes/CHANGES-week-NN.md` so Scott can review it. Straight conversion/recoding needs no flag; new content does. The 3D plotly visualizations (weeks 10–11) are keepers: regenerate live from code, do not redesign.

## Publishing

- Weekly loop: edit → `quarto preview` → commit → `quarto publish gh-pages --no-prompt`
- Source of truth is `main`; the built site lives on `gh-pages`; never edit `gh-pages` by hand
- `_freeze/` is COMMITTED (freeze: auto) so expensive chunks don't re-run needlessly
