# =====================================================================
# CRJU 705 — Final Project Exemplar Script
# "Do intoxication-involved crashes injure more people?"
#
# This is the runnable companion to the exemplar report:
#   https://smourtgos.github.io/crju705/final-project-exemplar.html
# It runs top to bottom on the public course data. In your own
# project, this is the shape your submitted .R file should have:
# setup -> wrangling -> descriptives -> figure -> model (both
# traditions) -> the numbers you cite in your report.
# =====================================================================

# ---- Setup -----------------------------------------------------------
library(tidyverse)
library(brms)       # Bayesian twin of the final model

crashes <- read_csv("https://smourtgos.github.io/crju705/data/crash-ak.csv",
                    show_col_types = FALSE)

# ---- Wrangling: outcome + derived predictors ------------------------
crashes <- crashes |>
  mutate(
    any_injury = injuries > 0,                          # outcome: anyone hurt?
    hour       = lubridate::hour(time),
    night      = hour >= 20 | hour < 4,                 # 8 pm - 4 am
    weekend    = lubridate::wday(lubridate::mdy(date)) %in% c(1, 7)
  )

# ---- Descriptives ----------------------------------------------------
crashes |>
  summarize(
    crashes       = n(),
    p_any_injury  = mean(any_injury),
    mean_injuries = mean(injuries),
    .by = intox_any
  ) |>
  arrange(intox_any)

# ---- The key visualization ------------------------------------------
crashes |>
  mutate(
    intox  = if_else(intox_any == 1, "Intoxication involved", "No intoxication"),
    period = case_when(
      night & weekend ~ "Weekend night",
      night           ~ "Weekday night",
      weekend         ~ "Weekend day",
      .default        = "Weekday day"
    )
  ) |>
  summarize(p_injury = mean(any_injury), n = n(), .by = c(intox, period)) |>
  ggplot(aes(period, p_injury, fill = intox)) +
  geom_col(position = "dodge") +
  scale_fill_manual(values = c("firebrick", "grey55")) +
  scale_y_continuous(labels = scales::percent) +
  labs(
    title    = "Intoxication raises injury risk at every time of week",
    subtitle = "Share of crashes injuring at least one person (n = 20,000)",
    x = NULL, y = "Crashes with any injury", fill = NULL
  ) +
  theme_minimal(base_size = 13) +
  theme(legend.position = "bottom")

# ---- Final model, frequentist ---------------------------------------
m_freq <- glm(any_injury ~ intox_any + night + weekend + driver_age,
              data = crashes, family = binomial)

broom::tidy(m_freq) |>
  mutate(odds_ratio = exp(estimate))
exp(confint(m_freq))                    # 95% CIs as odds ratios

# Predicted probabilities for two concrete cases (35-year-old driver,
# weekday afternoon): sober vs. intoxication-involved
new_cases <- tibble(intox_any = c(0, 1), night = FALSE,
                    weekend = FALSE, driver_age = 35)
predict(m_freq, new_cases, type = "response")

# ---- Final model, Bayesian twin -------------------------------------
# Same formula; brms default priors (say so in your methods!).
# Expect the ~1 minute "Compiling Stan program..." pause.
set.seed(705)
m_bayes <- brm(any_injury ~ intox_any + night + weekend + driver_age,
               data = crashes, family = bernoulli(),
               chains = 2, iter = 2000, seed = 705, refresh = 0)

exp(fixef(m_bayes)[, c("Estimate", "Q2.5", "Q97.5")])   # posterior odds ratios

# ---- The comparison sentence (from the report) ----------------------
# Both traditions agree: intoxication ~doubles the odds of an injury
# crash (OR ~1.9; 95% CI and 95% credible interval both ~[1.7, 2.1]).
# The Bayesian fit licenses the direct sentence -- "given the data and
# priors, 95% probability the true OR is in this interval" -- while
# the frequentist CI describes the procedure, not this interval.
# night, weekend, and driver_age are honest nulls (ORs ~1.0) in BOTH
# fits, and are reported as such.
