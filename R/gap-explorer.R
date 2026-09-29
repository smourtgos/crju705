# Gap-explorer widget configs, built from real test output -------------------
# Used by slides/week-07-workshop.qmd and demos/demo-07-workshop.qmd (Sep 28,
# 2026). The widget itself is widgets/gap-explorer.js + .css, loaded on the
# page with include-in-header / include-after-body. Each ge_*() call returns one
# comparison; ge_widget() writes the <div> the JS turns into the animation.
# Needs bayes_prop_test() (R/bayes.R) loaded first for proportions.

# A yes/no outcome: two counts and two totals, group A first.
ge_prop <- function(label, A, B, out, xa, na, xb, nb, left, right, rerun, unit_group) {
  pt <- prop.test(x = c(xa, xb), n = c(na, nb))
  invisible(capture.output(bt <- bayes_prop_test(x = c(xa, xb), n = c(na, nb))))
  pa <- xa / na
  pb <- xb / nb
  obs <- 100 * (pa - pb)
  list(label = label, type = "prop", unit = "points", A = A, B = B, out = out,
       ea = 100 * pa, eb = 100 * pb, na = na, nb = nb, obs = obs,
       lo = 100 * pt$conf.int[1], hi = 100 * pt$conf.int[2],
       sa0 = 100 * sqrt(pa * (1 - pa) / na), sb0 = 100 * sqrt(pb * (1 - pb) / nb),
       prob_other = if (obs < 0) bt$prob_higher else bt$prob_lower,
       left = left, right = right, rerun = rerun, unit_group = unit_group)
}

# A number outcome in dollars: the two groups' raw values, group A first.
ge_mean <- function(label, A, B, a, b, left, right, rerun, unit_group) {
  tt <- t.test(a, b)
  list(label = label, type = "mean", unit = "dollars", A = A, B = B, out = "average",
       ea = mean(a), eb = mean(b), na = length(a), nb = length(b),
       obs = mean(a) - mean(b), lo = tt$conf.int[1], hi = tt$conf.int[2],
       sa0 = sd(a) / sqrt(length(a)), sb0 = sd(b) / sqrt(length(b)),
       prob_other = NULL,
       left = left, right = right, rerun = rerun, unit_group = unit_group)
}

# Write the widget. Use in a chunk with `#| output: asis` and `#| echo: false`.
ge_widget <- function(..., default = 1) {
  cfg <- list(default = default, comparisons = list(...))
  json <- jsonlite::toJSON(cfg, auto_unbox = TRUE, digits = NA, null = "null")
  cat("\n```{=html}\n<div class=\"gap-explorer\" data-config=\"",
      htmltools::htmlEscape(json, attribute = TRUE), "\"></div>\n```\n", sep = "")
}
