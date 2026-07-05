# Shared setup for CRJU 705 course materials --------------------------------
# Sourced from the setup chunk of slides, labs, and homework documents.

# Course color palette (USC garnet + supporting colors)
crju_colors <- c(
  garnet = "#73000A",
  navy   = "#1B2A4A",
  gold   = "#F2BA66",
  blue   = "#6A8DBE",
  rust   = "#944C38",
  green  = "#18453B",
  gray   = "#6C757D"
)

# Default ggplot theme: minimal, readable at slide sizes
ggplot2::theme_set(ggplot2::theme_minimal(base_size = 14))

# Slide documents override with a larger base size:
# ggplot2::theme_set(ggplot2::theme_minimal(base_size = 18))

options(
  scipen = 999,            # no scientific notation in output
  pillar.print_min = 6     # compact tibble previews
)
