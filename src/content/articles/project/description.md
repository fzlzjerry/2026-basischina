---
title: Project Description
description: The problem we tackle, why we chose it, and the science behind our solution.
author: BASIS-China Team
date: 2026-05-01
tags: [project, description, iGEM, synthetic biology]
---

Describe how and why you chose your iGEM project. This page introduces the
problem, the motivation behind the team's choice, and a high-level overview of
the proposed solution.

> **Bronze Medal Criterion #1 — Wiki.** Describe how and why you chose your
> iGEM project. Visit the [Medals page](https://competition.igem.org/judging/medals)
> for more information.

## The problem

Explain the problem your project addresses and its potential impact. Ground the
challenge in real-world data, prior research, or community needs so readers
understand why it matters.

## Our solution

Provide a clear and concise summary of your project's goals and objectives, and
the synthetic-biology approach you take to reach them.

### Design overview

Use diagrams to make the system legible. The diagram below renders on the client
from a Mermaid code block:

```mermaid
flowchart LR
  A[Input signal] --> B[Engineered circuit]
  B --> C[Reporter output]
  C --> D[Measurable result]
```

### A note on modeling

Quantitative claims should be backed by models. For example, simple growth can
be modeled with the logistic equation:

$$
\frac{dN}{dt} = rN\left(1 - \frac{N}{K}\right)
$$

where $N$ is the population size, $r$ the growth rate, and $K$ the carrying
capacity.

## What this page should contain

- The problem your project addresses and its potential impact.
- A concise summary of your project's goals and objectives.
- The specific reasons your team chose this project.
- The inspiration behind your project, including prior research.
- Illustrations, diagrams, and other visual aids.
- Relevant scientific background and experimental approaches.

## Reproducible snippets

Document key parameters so other teams can build on your work:

```python
def doubling_time(growth_rate: float) -> float:
    """Return the population doubling time for a given growth rate."""
    from math import log
    return log(2) / growth_rate
```

## References

Cite all relevant research papers, scientific articles, and other sources that
informed your project. Use a consistent citation style and keep a dedicated
references section at the end of the page.
