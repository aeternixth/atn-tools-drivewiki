# Autonomy Levels — Graduated Agent Autonomy System

> Defines how much independence agents have at each level, and how to transition between levels.

## Overview

The AEGIS framework supports four autonomy levels. Higher levels give agents more freedom; lower levels keep humans more involved. The right level depends on project maturity, trust, and risk tolerance.

## Level Definitions

### L1 — Supervised
**Human approves every action.**

| Aspect | Rule |
|--------|------|
| Planning | Human approves plan before agents start |
| Execution | Each agent step requires human confirmation |
| Review | Human reviews all outputs |
| Deployment | Human-only |
| Best for | New projects, unfamiliar codebases, high-risk changes |

Agent behavior at L1:
- Present every action as an ApprovalRequest before executing
- Wait for explicit human "proceed" before continuing
- No autonomous file modifications
- All outputs are drafts until human-approved

### L2 — Guided
**Human approves plans, agents execute steps.**

| Aspect | Rule |
|--------|------|
| Planning | Human approves the PlanProposal |
| Execution | Agents execute steps independently within the approved plan |
| Review | Black Panther reviews, human spot-checks |
| Deployment | Human approves final output |
| Best for | Established projects, well-defined tasks, moderate risk |

Agent behavior at L2:
- Captain America presents a PlanProposal for human approval
- Once approved, agents execute without per-step confirmation
- Agents still report progress via StatusUpdate
- Deviations from plan require re-approval
- Final deliverables require human sign-off

### L3 — Autonomous
**Agents operate freely, human reviews final output.**

| Aspect | Rule |
|--------|------|
| Planning | Agents plan and execute independently |
| Execution | Full agent autonomy within scope constraints |
| Review | Agent consensus (2+ agents agree) sufficient |
| Deployment | Human reviews final output before deploy |
| Best for | Trusted workflows, low-risk tasks, experienced teams |

Agent behavior at L3:
- Captain America assigns tasks without waiting for human plan approval
- Agents execute and review using standard protocols
- QualityGate consensus is sufficient for internal approvals
- Only the final deliverable goes to human for review
- EscalationAlerts still go to human when triggered

### L4 — Full Auto
**Fully autonomous with async monitoring.**

| Aspect | Rule |
|--------|------|
| Planning | Fully autonomous |
| Execution | Fully autonomous |
| Review | Fully autonomous (agent consensus) |
| Deployment | Autonomous with monitoring |
| Best for | CI/CD pipelines, automated maintenance, batch processing |

Agent behavior at L4:
- Complete end-to-end execution without human involvement
- Human receives SessionSummary asynchronously
- Automatic rollback on QualityGate FAIL
- Monitoring alerts sent to human only for critical issues
- Human can interrupt at any time

## Setting the Autonomy Level

```
/aegis-mode --autonomy L3
```

- Default after `/aegis-start`: **L3 (Autonomous) — Nick Fury active**
- Nick Fury scans project → decides → acts without asking human
- Human can downgrade: `/aegis-mode --autonomy L1` (manual mode)
- Captain America stores the current level in `_aegis-brain/config/autonomy.json`

## Nick Fury (L3/L4 Autonomous Controller)

When autonomy is L3 or L4, Nick Fury (`🧬`) takes control:
- Scans project state automatically (git, tests, specs, deps, debt)
- Applies Decision Matrix (P0-P10) to pick highest-priority action
- Spawns sub-agents in background without asking (Agent tool, run_in_background=true)
- Monitors agent health via heartbeat: nudges idle agents, respawns stuck ones
- Reports decisions with rationale (transparent, not secretive)
- Human watches via **Shift+Down** (agent detail) and interrupts if needed
- Only asks human for P10 (completely empty project with no identity)
- Logs every pulse to `_aegis-brain/logs/heartbeat.log`

### Two-Phase Autonomy (Spec Gate)

Even at L3/L4, autonomy is **not uniform** across the pipeline.
Mother Brain automatically adjusts based on spec status:

```
┌─────────────────────────────────────────────────────────────┐
│  Phase A: SPEC CREATION                                     │
│  Autonomy: L2 (Guided) — Human MUST answer questions        │
│                                                             │
│  • Sage asks human 10 clarifying questions                  │
│  • Human answers are saved to human-input.md                │
│  • Sage writes BRD + SRS + UX Blueprint                     │
│  • Human approves spec → approval.md                        │
│  • No build agents spawned until approval                   │
│                                                             │
│  Trigger: /super-spec OR P8/P10 in Decision Matrix          │
├─────────────────────────────────────────────────────────────┤
│  Phase B: POST-SPEC EXECUTION                               │
│  Autonomy: L3/L4 (Full) — Mother Brain as Spec Proxy        │
│                                                             │
│  • Mother Brain answers team questions using approved spec   │
│  • Does NOT ask human for spec-covered topics               │
│  • CAN research for technical details                       │
│  • ESCALATES only: business decisions, scope changes,       │
│    budget commitments, spec contradictions                   │
│  • Logs all proxy answers to spec-proxy.log                 │
│                                                             │
│  Trigger: spec approved by human                            │
└─────────────────────────────────────────────────────────────┘
```

**Rationale:** The spec is the most critical artifact — wrong spec = wrong product.
Human input here is worth 100x the time saved by skipping it. But once the spec
is locked, Mother Brain has all the context needed to drive autonomously.

See `.claude/agents/nick-fury.md` for full protocol.

## Escalation Rules

Any agent can request escalation (moving to a lower level for more oversight):

```
--- EscalationAlert ---
From: [agent]
To: 🧭 Captain America
...
Suggested action: Downgrade autonomy to L[N] for [scope]
---
```

Escalation scenarios:
- Unexpected error in a critical path
- Security vulnerability discovered
- Agent disagreement that consensus cannot resolve
- Context budget emergency
- Task scope exceeds agent capabilities

## Auto-Downgrade

The system automatically drops one autonomy level when:

| Trigger | Action |
|---------|--------|
| QualityGate FAIL with critical findings | Drop one level |
| EscalationAlert with severity: critical | Drop one level |
| 2+ consecutive task failures | Drop one level |
| Context emergency (80%+ usage) | Drop to L1 |

**Recovery**: After human confirms the issue is resolved, autonomy returns to its previous level. Captain America logs the downgrade and recovery in the session summary.

## Level Transitions

```
L4 ──[error]──▶ L3 ──[error]──▶ L2 ──[error]──▶ L1
L1 ──[human confirms]──▶ L2 ──[human confirms]──▶ L3 ──[human confirms]──▶ L4
```

- Downgrade: automatic, immediate
- Upgrade: requires explicit human confirmation
- Level changes are logged in `_aegis-brain/logs/activity.log`
- Captain America announces level changes to all agents via broadcast
