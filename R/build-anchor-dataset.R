# Build the CRJU 705 anchor dataset (two levels) from raw downloads ----------
# Snapshot pulled July 2026. To reproduce, download raw inputs to data-raw/
# (gitignored) before running:
#
# 1) chicago_2025_raw.csv — Chicago Data Portal, dataset ijzp-q8t2:
#    curl -s -G "https://data.cityofchicago.org/resource/ijzp-q8t2.csv" \
#      --data-urlencode '$where=year=2025' \
#      --data-urlencode '$select=id,date,primary_type,description,location_description,arrest,domestic,community_area,ward,latitude,longitude' \
#      --data-urlencode '$limit=500000' -o data-raw/chicago_2025_raw.csv
# 2) cca_names.csv — community area numbers/names (dataset igwz-8jzy):
#    curl -s -G "https://data.cityofchicago.org/resource/igwz-8jzy.csv" \
#      --data-urlencode '$select=area_numbe,community' --data-urlencode '$limit=100' \
#      -o data-raw/cca_names.csv
# 3) cca_cmap.csv — CMAP Community Data Snapshots 2026, CCA layer (JSON → CSV):
#    services5.arcgis.com/LcMXE3TFhi1BSaCY/ArcGIS/rest/services/
#    Community_Data_Snapshots_2026/FeatureServer/11
#
# Outputs: data/chicago-crimes-2025.csv, data/chicago-areas.csv
suppressMessages({
  library(tidyverse)
})

scratch <- "data-raw"
site_data <- "data"

set.seed(705)

# --- Community area names ---------------------------------------------------
cca_names <- read_csv(file.path(scratch, "cca_names.csv"), show_col_types = FALSE) |>
  rename(community_area = area_numbe, community = community) |>
  mutate(community = str_to_title(community))

# --- Incidents ---------------------------------------------------------------
raw <- read_csv(file.path(scratch, "chicago_2025_raw.csv"), show_col_types = FALSE,
                col_types = cols(date = col_datetime()))
cat("raw incidents:", nrow(raw), "\n")

violent_types <- c("HOMICIDE", "CRIMINAL SEXUAL ASSAULT", "ROBBERY",
                   "BATTERY", "ASSAULT")
property_types <- c("BURGLARY", "THEFT", "MOTOR VEHICLE THEFT", "ARSON")

incidents <- raw |>
  filter(!is.na(community_area), !is.na(primary_type)) |>
  mutate(
    datetime  = date,            # read_csv already parsed ISO datetimes
    date      = as_date(datetime),
    hour      = hour(datetime),
    crime_category = case_when(
      primary_type %in% violent_types  ~ "Violent",
      primary_type %in% property_types ~ "Property",
      .default = "Other"
    ),
    arrest   = as.logical(arrest),
    domestic = as.logical(domestic)
  ) |>
  left_join(cca_names, by = "community_area") |>
  select(id, date, hour, primary_type, description, location_description,
         crime_category, arrest, domestic, community_area, community,
         latitude, longitude)

cat("incidents with community area:", nrow(incidents), "\n")
cat("arrest rate:", round(mean(incidents$arrest), 3), "\n")

# Random sample of 30,000 for the student-facing incident file
crimes_sample <- slice_sample(incidents, n = 30000) |> arrange(date, id)
write_csv(crimes_sample, file.path(site_data, "chicago-crimes-2025.csv"))
cat("wrote chicago-crimes-2025.csv:", nrow(crimes_sample), "rows\n")

# --- Community-area file (aggregates use ALL incidents, not the sample) -----
crime_by_area <- incidents |>
  summarize(
    crimes_total    = n(),
    crimes_violent  = sum(crime_category == "Violent"),
    crimes_property = sum(crime_category == "Property"),
    arrest_rate     = mean(arrest),
    .by = c(community_area, community)
  )

cmap <- read_csv(file.path(scratch, "cca_cmap.csv"), show_col_types = FALSE) |>
  mutate(community_area = as.numeric(GEOID)) |>
  transmute(
    community_area,
    population        = TOT_POP,
    median_age        = round(MED_AGE, 1),
    pct_white         = round(100 * WHITE / TOT_POP, 1),
    pct_black         = round(100 * BLACK / TOT_POP, 1),
    pct_hispanic      = round(100 * HISP / TOT_POP, 1),
    pct_asian         = round(100 * ASIAN / TOT_POP, 1),
    unemployment_rate = round(100 * UNEMP / IN_LBFRC, 1),
    pct_bachelors     = round(100 * (BACH + GRAD_PROF) / POP_25OV, 1),
    pct_no_hs_diploma = round(100 * LT_HS / POP_25OV, 1),
    median_income     = round(MEDINC),
    income_per_capita = round(INCPERCAP),
    pct_renter        = round(100 * RENT_OCC_HU / TOT_HH, 1),
    pct_vacant        = round(100 * VAC_HU / HU_TOT, 1),
    median_rent       = round(MED_RENT)
  )

areas <- crime_by_area |>
  left_join(cmap, by = "community_area") |>
  mutate(
    crime_rate    = round(1000 * crimes_total / population, 1),
    violent_rate  = round(1000 * crimes_violent / population, 1),
    property_rate = round(1000 * crimes_property / population, 1),
    # Binary indicator used in class: was violent-crime rate above the
    # citywide median? (per-1,000 residents)
    high_violence = violent_rate > median(violent_rate),
    arrest_rate   = round(arrest_rate, 3)
  ) |>
  select(community_area, community, population, crimes_total, crimes_violent,
         crimes_property, crime_rate, violent_rate, property_rate,
         high_violence, arrest_rate, everything()) |>
  arrange(community_area)

stopifnot(nrow(areas) == 77, !anyNA(areas$population))
write_csv(areas, file.path(site_data, "chicago-areas.csv"))
cat("wrote chicago-areas.csv:", nrow(areas), "rows x", ncol(areas), "cols\n")
glimpse(areas)
