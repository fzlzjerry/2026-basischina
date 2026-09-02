---
title: Scientific authoring validation fixture
description: Build-only fixture covering every structured research block.
author: BASIS-China Team
date: 2026-08-23
tags: [fixture, authoring]
---

This fixture validates citations [@igem-team-wiki-2026], notes,[^fixture-note]
and evidence links [[evidence:fixture-result|Open fixture result]].

```result
id: fixture-result
title: Result card fixture
claim: The structured result renderer preserves the evidence fields.
method: Static fixture
controls:
  - Unstructured prose
replicates:
  biological: 3
  technical: 2
result:
  value: 100
  unit: percent rendered
uncertainty: Not applicable
limitations:
  - Fixture data only
citations:
  - igem-special-awards-2026
```

```dbtl
id: fixture-dbtl
title: Engineering cycle fixture
cycles:
  - title: Cycle 1
    design: Define the authoring schema.
    build: Implement the Markdown fence.
    test: Run content validation.
    learn: Required fields prevent silent omissions.
    next: Add real project evidence.
    evidence:
      - fixture-result
citations:
  - igem-team-wiki-2026
```

```data-figure
id: fixture-data-figure
title: Accessible data figure fixture
caption: Demonstration table paired with a figure description.
description: The accessible table is the primary fixture representation.
columns:
  - Time (h)
  - Mean
  - SD
rows:
  - [0, 0.10, 0.01]
  - [4, 0.42, 0.03]
citations:
  - igem-special-awards-2026
```

```protocol
id: fixture-protocol
title: Protocol fixture
objective: Validate ordered experimental instructions.
version: "1.0"
date: 2026-08-23
materials:
  - Example material
steps:
  - Prepare the fixture.
  - Run the validator.
controls:
  - Keep a known-good fixture.
safety:
  - No biological material is used.
citations:
  - igem-team-wiki-2026
```

```notebook-timeline
id: fixture-notebook
title: Notebook timeline fixture
entries:
  - id: fixture-notebook-entry
    date: 2026-08-23
    workstream: dry-lab
    status: completed
    title: Added structured authoring
    outcome: All block schemas are represented in one build fixture.
    next: Replace fixtures with project records.
    evidence:
      - fixture-result
```

```stakeholder-impact
id: fixture-impact
title: Stakeholder impact fixture
entries:
  - stakeholder: Wiki editor
    method: Structured authoring review
    insight: Missing fields are difficult to notice in prose.
    change: Added required evidence fields and build validation.
    followUp: Recheck with real project content.
citations:
  - igem-special-awards-2026
```

```part
id: fixture-part
title: Part fixture
registryId: BBa_FIXTURE
function: Demonstrate the part schema.
chassis: Not applicable
status: Authoring fixture
characterization: No biological characterization is claimed.
registryUrl: https://parts.igem.org/
citations:
  - igem-team-wiki-2026
```

```model-summary
id: fixture-model
title: Model summary fixture
assumptions:
  - Fixture values are illustrative.
parameters:
  - name: alpha
    value: "1.0"
    unit: dimensionless
    source: Authoring fixture
validation: Schema validation only
sensitivity: Not applicable
limitations:
  - This is not a biological model.
citations:
  - igem-special-awards-2026
```

[^fixture-note]:
    The fixture is checked during every production build but is not
    registered as a public route.
