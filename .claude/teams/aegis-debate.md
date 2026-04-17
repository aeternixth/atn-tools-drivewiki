---
name: aegis-debate
description: "Architecture decision debate team"
lead: captain-america
members: [iron-man, spider-man, loki]
mode: tmux
requires: tmux
---

## Team Purpose
Structured debate for architecture decisions. Multiple perspectives, devil's advocate, consensus building.

## Task Breakdown
1. Iron Man (opus): Present architecture options with trade-offs
2. Spider-Man (sonnet): Evaluate implementation feasibility of each option
3. Loki (opus): Challenge every option, find failure modes
4. Captain America (opus): Facilitate, synthesize, drive consensus

## Communication Flow
All → PlanProposal → Captain America (proposals)
Loki → CounterProposal → All (challenges)
Captain America → ApprovalRequest → All (vote)
Captain America → ArchitectureDecision → All (final)

## Output
_aegis-brain/resonance/architecture-decisions.md (append)
_aegis-output/debates/YYYY-MM-DD_debate.md
