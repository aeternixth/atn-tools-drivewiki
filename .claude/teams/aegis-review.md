---
name: aegis-review
description: "Deep multi-perspective code review team"
lead: black-panther
members: [loki, beast]
mode: tmux
requires: tmux
---

## Team Purpose
Multi-perspective review combining quality enforcement (Black Panther), adversarial challenge (Loki), and data gathering (Beast).

## Task Breakdown
1. Beast (haiku): Scan codebase, gather metrics, identify hotspots
2. Loki (opus): Challenge assumptions, find edge cases, adversarial test
3. Black Panther (sonnet): Synthesize findings, enforce quality gate, write report

## Communication Flow
Beast → StatusUpdate → Black Panther
Loki → FindingReport → Black Panther
Black Panther → QualityGate → Lead (Captain America)

## Review Gate
- 0 critical findings = PASS
- 1+ critical = FAIL (with details)
- Warnings only = CONDITIONAL (human decides)

## Output
_aegis-output/team-reviews/YYYY-MM-DD_review.md
