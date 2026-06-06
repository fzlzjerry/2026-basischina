---
title: Hardware
description: Open-source hardware built by BASIS-China to make synthetic biology faster, cheaper, and more accessible for every lab.
author: BASIS-China Team
date: 2026-05-01
tags: [hardware, dry-lab, open-source, igem, devices]
---

This page documents the hardware our team designed to make synthetic biology
faster, cheaper, and more accessible, covering the design, bill of materials,
build instructions, validation, and open documentation.

> **Best Hardware prize.** This page supports our entry for the Best Hardware
> special prize: a documented, reproducible device that advances synthetic
> biology. See the
> [Awards page](https://competition.igem.org/judging/awards) for criteria.

## Design

Summarize what the device does and why existing tools fall short, anchored in a
concrete need from your wet lab or community.

- **Problem.** Describe the bottleneck the hardware removes (cost, throughput,
  precision, or accessibility).
- **Function.** Explain the core operating principle in one or two sentences.
- **Architecture.** Outline the subsystems (sensing, actuation, control, power,
  enclosure) and how they connect.

Include CAD renders, schematics, and a labeled photo. Link related work on the
[Measurement](/measurement) and [Contribution](/contribution) pages.

## Bill of materials

List every component needed to reproduce the build. Replace the rows below with
your actual parts, quantities, and sourcing notes.

| Component                  | Qty | Notes                                    |
| -------------------------- | --- | ---------------------------------------- |
| Microcontroller board      | 1   | Describe model and firmware target       |
| Sensor module              | 2   | Specify range, accuracy, and interface   |
| Actuator / pump / heater   | 1   | Note voltage, current, and driver needed |
| 3D-printed enclosure       | 1   | Material, infill, and print time         |
| Power supply               | 1   | Voltage, current rating, and connector   |
| Misc. wiring and fasteners | 1   | Consumables; estimate total cost         |

State the total approximate cost and any specialized tools required.

## Build instructions

Provide a numbered, reproducible procedure another team can follow:

1. Print and post-process the enclosure parts.
2. Assemble the electronics on a breadboard and verify connections.
3. Flash the firmware and confirm serial communication.
4. Mount components into the enclosure and route wiring.
5. Calibrate sensors against a known standard.
6. Run the end-to-end self-test described below.

## Validation

Show that the hardware works and meets its design targets.

- **Functional tests.** Pass/fail checks for each subsystem.
- **Accuracy.** Measured vs. expected values with error bars.
- **Reliability.** Repeat runs, uptime, or failure modes observed.
- **Comparison.** Benchmark against the manual or commercial alternative.

Include plots, raw data tables, and a brief discussion of limitations.

## Open documentation

We release everything needed to rebuild and improve the device:

- CAD files, schematics, firmware, and this BOM under an open license (e.g.,
  CERN-OHL or MIT).
- A public repository link and step-by-step assembly guide.
- A versioned changelog so other teams can track improvements.

## References

Cite datasheets, prior open-hardware projects, and papers that informed the
design. Use a consistent style and keep all sources in this section.
