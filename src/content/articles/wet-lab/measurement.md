---
title: Measurement
description: How we measure and characterize biological parts and systems with calibrated instruments, defined units, and reproducible replicates.
author: BASIS-China Team
date: 2026-05-01
tags: [measurement, characterization, calibration, parts, data]
---

This page documents how we measure and characterize our parts and systems so that
results are quantitative, comparable, and reproducible by other teams.

> **Measurement Special Prize.** Develop a robust measurement approach,
> characterize parts in standard units, and share data others can reuse. See the
> [Project prizes page](https://competition.igem.org/judging/awards) for details.

## Goals and scope

- State exactly what is being measured (e.g., promoter strength, RBS efficiency,
  enzyme activity) and for which parts.
- Define the readout (fluorescence, absorbance, luminescence) and the biological
  context (strain, medium, temperature, induction).
- Link each measurement back to a protocol on the [Experiments](/experiments)
  page so the workflow is fully traceable.

## Instruments, units, and calibration

Report results in absolute, comparable units rather than raw instrument values.
Always document the device, settings, and calibrants used.

| Quantity             | Calibrant                   | Standard unit                              |
| -------------------- | --------------------------- | ------------------------------------------ |
| Cell density (OD600) | LUDOX / microsphere ladder  | particles per mL                           |
| GFP fluorescence     | Fluorescein dilution series | MEFL (molecules of equivalent fluorescein) |
| Plate reader gain    | Manufacturer reference      | a.u. with stated gain                      |

- Run a fresh calibration curve on each measurement day; do not assume gain
  stability across sessions.
- Record instrument model, firmware, optical path, gain, and integration time.
- Describe blank subtraction and how background autofluorescence is handled.

## Replicates and controls

1. Include at least three biological replicates and two or more technical
   replicates per condition.
2. Run positive, negative, and "no-cell" media-only controls on every plate.
3. Randomize well positions or include plate-edge controls to detect edge
   effects.
4. Report the mean, the standard deviation, and the number of replicates ($n$)
   for every data point.

## Converting readouts to standard units

Fit a linear standard curve to the calibrant dilution series, then apply it to
sample readings. For a fluorescein curve with slope $m$ and intercept $b$:

$$
\text{MEFL} = \frac{F_{\text{sample}} - b}{m}
$$

where $F_{\text{sample}}$ is the blank-corrected fluorescence. Normalize by cell
count to obtain per-cell expression, and report the curve's $R^2$ so readers can
judge fit quality.

## Characterizing many parts efficiently

- Use a plate-reader kinetic assay to capture growth and expression for dozens of
  parts in parallel from a single run.
- Adopt a consistent plate layout template and a barcode or naming scheme so data
  files map unambiguously to constructs.
- Automate analysis with a script that ingests raw exports, applies calibration,
  and outputs tidy per-part tables; share it alongside your data.
- Summarize findings on the [Results](/results) page and deposit characterized
  parts in the Registry with units and conditions.

## References

Cite measurement protocols, calibration standards, and analysis methods using a
consistent style. List the iGEM interlab/measurement resources, plate-reader
manuals, and any published characterization papers you relied on, with a dedicated
references section here.
