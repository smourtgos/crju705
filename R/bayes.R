# CRJU 705 - bayes_prop_test(): the Bayesian partner of prop.test() ----------
#
# Load it once per script with:
#   source("https://smourtgos.github.io/crju705/R/bayes.R")
#
# Call it the way you call prop.test():
#   bayes_prop_test(x = c(40, 50), n = c(100, 100))                  # know-nothing prior
#   bayes_prop_test(x = c(40, 50), n = c(100, 100), prior = c(6, 4)) # a stated prior
#
#   x      how many "yes" in each group (one number, or two)
#   n      out of how many in each group
#   prior  what you believed before the data, written as imaginary cases:
#          c(yes, no). c(6, 4) means "about 60%, held as firmly as if I had
#          already seen 10 cases." The default c(1, 1) means "I know nothing."
#
# What it does: prior cases + observed cases = the posterior for each group's
# true rate (a beta distribution, the exact Bayesian answer for a proportion).
# With two groups it also reports the difference, group 1 minus group 2, the
# same direction prop.test() uses.

bayes_prop_test <- function(x, n, prior = c(1, 1)) {

  # ---- checks, with messages a person can act on ----
  if (length(x) != length(n))
    stop("x and n need the same number of groups: x is how many, n is out of how many.")
  if (!length(x) %in% c(1, 2))
    stop("Give one group or two groups, e.g. x = c(40, 50), n = c(100, 100).")
  if (any(x > n))
    stop("Each x must be no bigger than its n: how many first, out of how many second.")
  if (any(x < 0) || length(prior) != 2 || any(prior <= 0))
    stop("Counts cannot be negative, and prior must be two positive numbers: c(yes, no).")

  # ---- posterior = prior cases + observed cases ----
  yes <- prior[1] + x
  no  <- prior[2] + (n - x)

  pct <- function(p) sprintf("%.1f%%", 100 * p)
  est   <- yes / (yes + no)
  lower <- qbeta(0.025, yes, no)
  upper <- qbeta(0.975, yes, no)

  prior_words <- if (all(prior == c(1, 1))) {
    "know-nothing (1 yes, 1 no)"
  } else {
    sprintf("%s yes, %s no (about %s, worth %s cases)",
            format(prior[1]), format(prior[2]),
            sprintf("%.0f%%", 100 * prior[1] / sum(prior)), format(sum(prior)))
  }

  cat("\n\tBayesian test of", if (length(x) == 2) "two proportions" else "one proportion", "\n\n")
  for (i in seq_along(x))
    cat(sprintf("data, group %d:  %s of %s (%s)\n", i,
                format(x[i], big.mark = ","), format(n[i], big.mark = ","), pct(x[i] / n[i])))
  cat("prior:          ", prior_words,
      if (length(x) == 2) ", same for both groups" else "", "\n\n", sep = "")

  cat(sprintf("%-24s %-13s %s\n", "", "estimate", "95% credible interval"))
  for (i in seq_along(x))
    cat(sprintf("%-24s %-13s %s to %s\n", paste("group", i), pct(est[i]), pct(lower[i]), pct(upper[i])))

  out <- list(estimate = est, lower = lower, upper = upper, prior = prior)

  if (length(x) == 2) {
    # 100,000 plausible values per group. The seed is fixed INSIDE the function
    # so everyone gets the same answer, and your own random numbers are untouched.
    old_seed <- if (exists(".Random.seed", envir = globalenv())) get(".Random.seed", envir = globalenv()) else NULL
    set.seed(705)
    group1 <- rbeta(100000, yes[1], no[1])
    group2 <- rbeta(100000, yes[2], no[2])
    if (is.null(old_seed)) rm(".Random.seed", envir = globalenv()) else assign(".Random.seed", old_seed, envir = globalenv())

    difference <- group1 - group2
    d_ci <- quantile(difference, c(0.025, 0.975))

    cat(sprintf("%-24s %-13s %.1f to %.1f points\n", "difference (1 minus 2)",
                sprintf("%.1f points", 100 * mean(difference)), 100 * d_ci[1], 100 * d_ci[2]))
    # never print a flat 0 or 1: no amount of data makes anything certain
    prob <- function(p) if (p > 0.99) "more than 0.99" else if (p < 0.01) "less than 0.01" else sprintf("%.2f", p)
    cat("\nProbability group 1 is higher than group 2:", prob(mean(difference > 0)), "\n")
    cat("Probability group 1 is lower than group 2: ", prob(mean(difference < 0)), "\n\n")

    out$difference      <- mean(difference)
    out$difference_ci   <- unname(d_ci)
    out$prob_higher     <- mean(difference > 0)
    out$prob_lower      <- mean(difference < 0)
    out$draws           <- data.frame(group1 = group1, group2 = group2, difference = difference)
  } else {
    cat("\n")
  }

  invisible(out)
}
