---
title: Plant Synthetic Biology
description: How the BASIS-China team engineered a plant chassis, the methods we used, and the challenges we solved along the way.
author: BASIS-China Team
date: 2026-05-01
tags: [plant, synthetic biology, chassis, transformation, igem]
---

This page documents the plant synthetic biology work behind our project: the
chassis we chose, the plant-specific methods we developed, and the challenges we
encountered and overcame.

> **Special Prize — Best Plant Synthetic Biology.** This page presents
> exemplary engineering in a plant chassis and the systems and methods that
> support it. See the
> [Awards page](https://competition.igem.org/judging/awards) for details.

## Chassis and system

Introduce the plant system at the heart of your project and justify why it fits
the problem.

- **Organism.** Name the species (e.g. _Nicotiana benthamiana_, _Arabidopsis
  thaliana_, _Marchantia polymorpha_, or a crop) and the cultivar/ecotype.
- **System type.** Describe whether you used whole plants, hairy-root cultures,
  protoplasts, cell suspension, or a transient expression platform.
- **Genetic part.** List the circuit, pathway, or construct you introduced and
  link to your [parts](/results) and [engineering](/engineering) pages.
- **Rationale.** Explain why this chassis is the right context for the trait or
  product you target.

## Plant-specific methods

Document the techniques that distinguish plant work from microbial work.

1. Build and verify constructs in a binary vector suited to plant transformation.
2. Transform via your chosen route (see table) and select positive lines.
3. Confirm integration and expression (PCR, qRT-PCR, Western blot, or reporter).
4. Phenotype across generations or treatments and quantify the engineered trait.

| Method                       | Use case                  | Typical readout               |
| ---------------------------- | ------------------------- | ----------------------------- |
| _Agrobacterium_ infiltration | Fast transient expression | Reporter in 2-5 days          |
| Stable transformation        | Heritable lines           | Selectable marker, T1-T3      |
| Protoplast transfection      | Rapid prototyping         | Flow cytometry / fluorescence |

Replace these rows with the exact protocols, vectors, and parameters you used so
other teams can reproduce them.

## Challenges and solutions

- **Slow timelines.** Describe how long generations and growth cycles shaped your
  experimental schedule and what you did to parallelize work.
- **Silencing and variability.** Note any transgene silencing or position effects
  and how you screened multiple independent lines.
- **Containment.** Summarize how you handled regulated organisms; see our
  [Safety](/safety) page.

## What this page should contain

- A clear statement of the plant chassis and why it was chosen.
- Plant-specific design, transformation, and characterization methods.
- Quantitative results that demonstrate a working engineered trait.
- Honest discussion of failures, iterations, and lessons learned.

## References

Cite the protocols, vectors, and primary literature that informed your plant
work using a consistent citation style. List vector backbones and Agrobacterium
strains with their sources so the methods are fully reproducible.
