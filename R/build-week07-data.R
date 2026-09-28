# Build the Session 7 data-menu copies (Sep 28, 2026) -------------------------
# Course-hosted CSV copies of datasets on the Final-Project Data Options page
# (project-data.qmd), so students can load every one with read_csv(URL) and
# install nothing. The page also gives each original source.
#
# Sources:
#   carData (GPL >= 2): Rossi, Arrests, MplsStops
#   MASS (GPL-2 | GPL-3, ships with R): UScrime
#   datasets (base R): USArrests
#   GSS 2024 public-use file (NORC, gss.norc.org), a copy of which sits in the
#   colleague's course folder; path below. Only CJ-relevant items are kept.
#
# NOT rehosted (read from their own GitHub URLs on the page):
#   Washington Post fatal police shootings (CC BY-NC-SA 4.0)
#   ProPublica COMPAS two-year file
#
# Outputs: data/rossi.csv, data/toronto-arrests.csv, data/mpls-stops.csv,
#          data/uscrime.csv, data/usarrests.csv, data/gss-2024-cj.csv
suppressMessages({
  library(tidyverse)
  library(carData)
  library(haven)
  library(MASS, exclude = "select")
})

site_data <- "data"

# --- Rossi: released prisoners, randomized financial-aid experiment ---------
# The 52 weekly employment columns (emp1 to emp52) are dropped: they are a
# wide time series beginners cannot use yet. The page says so.
rossi <- Rossi |>
  as_tibble() |>
  dplyr::select(-starts_with("emp")) |>
  mutate(across(where(is.factor), as.character))
write_csv(rossi, file.path(site_data, "rossi.csv"))

# --- Toronto arrests for simple possession of marijuana ---------------------
arrests <- Arrests |>
  as_tibble() |>
  mutate(across(where(is.factor), as.character))
write_csv(arrests, file.path(site_data, "toronto-arrests.csv"))

# --- Minneapolis police stops, 2017 -----------------------------------------
stops <- MplsStops |>
  as_tibble() |>
  mutate(across(where(is.factor), as.character),
         date = format(date, "%Y-%m-%d %H:%M:%S"))
write_csv(stops, file.path(site_data, "mpls-stops.csv"))

# --- US states, 1960 (Ehrlich's crime data) ---------------------------------
write_csv(as_tibble(UScrime), file.path(site_data, "uscrime.csv"))

# --- US states, 1973 arrests per 100,000 ------------------------------------
usarrests <- USArrests |>
  rownames_to_column("state") |>
  as_tibble()
write_csv(usarrests, file.path(site_data, "usarrests.csv"))

# --- GSS 2024, criminal-justice items ---------------------------------------
# zap_missing() turns every GSS missing code ("iap" = not asked on this
# respondent's ballot, don't know, no answer, refused, skipped) into NA;
# as_factor() turns the remaining codes into their words.
gss_path <- file.path("..", "CRCJ 8950 Spring 2026", "Datasets", "GSS2024.dta")
cj_items <- c("fear", "cappun", "gunlaw", "owngun", "courts", "grass",
              "natcrime", "polhitok", "polabuse", "polattak")
people   <- c("sex", "degree", "region", "partyid", "polviews")
numbers  <- c("age", "educ", "coninc")

gss <- read_dta(gss_path, col_select = all_of(c("id", numbers, people, cj_items))) |>
  mutate(across(everything(), zap_missing)) |>
  mutate(across(all_of(c(people, cj_items)), \(x) as.character(as_factor(x))),
         across(all_of(c("id", numbers)), \(x) as.numeric(x)))
write_csv(gss, file.path(site_data, "gss-2024-cj.csv"))

# --- Report ------------------------------------------------------------------
for (f in c("rossi", "toronto-arrests", "mpls-stops", "uscrime", "usarrests",
            "gss-2024-cj")) {
  d <- read_csv(file.path(site_data, paste0(f, ".csv")), show_col_types = FALSE)
  cat(sprintf("%-16s %6d rows %3d cols\n", f, nrow(d), ncol(d)))
}
