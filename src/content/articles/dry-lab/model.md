---
title: Modeling
description: How our model's assumptions, data, parameters, and results work and how they shaped the BASIS-China project design.
author: BASIS-China Team
date: 2026-05-01
tags: [modeling, dry-lab, ode, simulation, parameters]
---

This page explains our model so that anyone, regardless of background, can follow its logic. We describe the assumptions, the data and parameters behind it, the results it produced, and how those results steered our wet-lab and design decisions.

> **Gold Medal — Modeling.** Convince the judges your model is useful, well-documented, and that it informed your project design. See the [Medals page](https://competition.igem.org/judging/medals) for details.

## Overview and purpose

State, in one or two sentences, the question your model answers (e.g., "How does inducer concentration set steady-state reporter output?"). Then explain why a computational model was the right tool: it lets you predict behavior, choose experimental conditions, and avoid costly trial-and-error at the bench.

## Assumptions

List every simplifying assumption so readers can judge the model's scope:

- Describe the spatial assumption (e.g., a well-mixed culture, so concentrations are uniform).
- State which species are modeled and which are held constant.
- Note timescale separation (e.g., transcription/translation lumped into one production term).
- Record boundary conditions and initial values, and why they are reasonable.

## Governing equations

We model regulated protein production with a Hill activation term balanced by first-order degradation and dilution:

$$
\frac{dP}{dt} = \beta\,\frac{[S]^{n}}{K^{n} + [S]^{n}} - (\gamma + \mu)\,P
$$

Here $P$ is the protein concentration and $[S]$ is the inducer concentration. The first term captures production; the second captures loss. At steady state $dP/dt = 0$, giving a closed-form prediction the team can compare directly against measured fluorescence.

## Parameters and data

Document each parameter, its source, and its uncertainty. Replace the placeholder values with your fitted or literature values and cite them in [References](#references).

| Symbol   | Meaning                          | Value | Units    |
| -------- | -------------------------------- | ----- | -------- |
| $\beta$  | Maximal production rate          | TBD   | nM/min   |
| $K$      | Half-activation inducer level    | TBD   | nM       |
| $n$      | Hill coefficient (cooperativity) | TBD   | unitless |
| $\gamma$ | Protein degradation rate         | TBD   | 1/min    |
| $\mu$    | Growth-dilution rate             | TBD   | 1/min    |

Briefly state how each value was obtained: literature, calibration experiments, or parameter fitting to your own data.

## Results

Summarize the model output and validate it against experiment:

1. Present the predicted dose-response or time-course curve and describe its shape.
2. Overlay measured data points and report goodness-of-fit (e.g., R-squared or RMSE).
3. State the key quantitative finding (e.g., the inducer level for half-maximal output).
4. Note where prediction and data diverge, and explain the likely cause.

See the full experimental comparison on the [Results](/results) page.

## How the model informed the project

Explain concretely what changed because of the model: which construct or promoter you selected, which inducer concentrations you tested, or which design you ruled out. Link back to [Project Description](/project/description) and forward to wet-lab outcomes so the loop between modeling and experiment is clear.

## References

Cite all sources for equations, parameter values, and data using a consistent style. List literature parameters with DOIs, and note any values fitted from your own experiments along with the fitting method used.
