---
title: Experiments
description: Research, experiments, and step-by-step protocols from BASIS-China, documented in enough detail for other iGEM teams to replicate.
author: BASIS-China Team
date: 2026-05-01
tags: [experiments, protocols, wet-lab, reproducibility, methods]
---

This page records the wet-lab research behind our project, the experiments we ran, and the protocols we followed. Our aim is to give other teams everything they need to reproduce the work and build on it.

> **Bronze Medal Criterion — Documentation.** Describe the experiments and
> protocols you carried out in enough detail that another team could repeat them.
> See the [Medals page](https://competition.igem.org/judging/medals) for details.

## Experimental overview

Summarize the experimental campaign before diving into individual protocols.

- State the central hypothesis each experiment tested.
- Describe the engineered constructs, chassis, and controls used.
- Note how each experiment connects to your design-build-test-learn cycle.
- Link day-to-day records to the [Notebook](/notebook) and quantitative
  characterization to the [Measurement](/measurement) page.

## Protocols overview

List every protocol used so readers can find the exact method behind a result. Keep each protocol versioned and date-stamped in your [Notebook](/notebook).

| Protocol                              | Purpose                    | Key inputs               | Typical duration |
| ------------------------------------- | -------------------------- | ------------------------ | ---------------- |
| Plasmid assembly (Gibson/Golden Gate) | Build constructs           | Fragments, master mix    | ~2 h             |
| Chemical transformation               | Introduce DNA into chassis | Competent cells, plasmid | Overnight        |
| Colony PCR                            | Verify inserts             | Primers, polymerase      | ~3 h             |
| Overnight culture + induction         | Express construct          | Inducer, media           | 12-18 h          |
| Fluorescence/OD assay                 | Quantify output            | Plate reader             | ~6 h             |

For each protocol, document: reagents and catalog numbers, equipment, exact volumes and temperatures, incubation times, and expected outcomes plus troubleshooting notes.

## Detailed methods

Write one subsection per major experiment using the same template.

### Template for each experiment

1. **Objective.** State what the experiment was designed to show.
2. **Materials.** List strains, plasmids, reagents, and instruments.
3. **Procedure.** Give numbered steps with precise parameters.
4. **Controls.** Describe positive, negative, and blank controls.
5. **Readout.** Define the measured variable and acquisition settings.
6. **Result link.** Point to the analyzed data on the [Results](/results) page.

## Analysis snippet

Document how raw measurements are turned into reported values. Below is an example that normalizes fluorescence by optical density:

```python
def normalize(fluorescence: list[float], od600: list[float]) -> list[float]:
    """Return per-cell fluorescence (RFU/OD) for each well."""
    return [f / od for f, od in zip(fluorescence, od600) if od > 0]

# Example: average normalized signal across replicates
wells = normalize([1200, 1180, 1250], [0.42, 0.40, 0.45])
print(round(sum(wells) / len(wells), 1))  # mean RFU/OD
```

## Reproducibility checklist

- [ ] Strain genotypes and plasmid maps are published.
- [ ] All reagents list supplier and catalog or lot numbers.
- [ ] Each protocol states exact volumes, times, and temperatures.
- [ ] Controls and replicate counts are specified.
- [ ] Instrument settings (gains, wavelengths) are recorded.
- [ ] Raw data and analysis scripts are archived and linked.

## References

Cite kits, published protocols, and prior literature using a consistent style
(e.g., numbered or author-date). Include manufacturer protocol versions and DOIs
where available, and link any adapted methods back to their original source.
