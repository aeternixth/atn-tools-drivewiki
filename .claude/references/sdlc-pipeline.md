# SDLC Pipeline -- AEGIS v8.2.1 Master Workflow

> Reference for: Nick Fury, Captain America, all /aegis-* commands
> This is THE single pipeline connecting all agents from idea to production.
> All team handoffs follow the Handoff Protocol (see handoff-protocol.md).

---

## Pipeline Overview (ASCII)

```
  IDEA ──> BREAKDOWN ──> SPRINT_PLAN
               |               |
               v               v
           [backlog]     [sprint active]
                              |
              ┌───────────────┘
              |
              v
     ╔═══════════════════════════════════╗
     ║   PER-TASK CYCLE (stages 4-11)   ║
     ║                                   ║
     ║   SPEC ──> BUILD ──> REVIEW(G1)  ║
     ║              ^          |         ║
     ║              |       PASS/FAIL    ║
     ║              +--FAIL----+         ║
     ║                         |         ║
     ║                      (PASS)       ║
     ║                         v         ║
     ║   QA_PLAN ──> QA_EXECUTE          ║
     ║                   |               ║
     ║                   v               ║
     ║            QA_VERDICT(G2)         ║
     ║              ^     |              ║
     ║              |  PASS/FAIL         ║
     ║      FAIL----+     |              ║
     ║     (to BUILD)  (PASS)            ║
     ║                    v              ║
     ║              COMPLY(G3)           ║
     ║              ^     |              ║
     ║              |  PASS/FAIL         ║
     ║      FAIL----+     |              ║
     ║    (missing docs)(PASS)           ║
     ║                    v              ║
     ║              KANBAN_DONE          ║
     ╚═══════════════════════════════════╝
              |
              v
        SPRINT_CLOSE ──> DEPLOY(G4) ──> MONITOR(G5)
                                            |
                                       ┌────+────┐
                                       |         |
                                    STABLE    ERROR
                                    (done)      |
                                                v
                                         FEEDBACK ──> BACKLOG
                                        (hotfix task)
```

---

## Stage Definitions

### Stage 1: IDEA

| Field | Value |
|-------|-------|
| WHO | Human + Captain America (Nick Fury may detect via P8/P10 scan) |
| INPUT | User request (text), feature idea, or scan finding |
| OUTPUT | Captured requirement saved to `_aegis-brain/ideas/` |
| GATE | None -- ideas are ungated |
| ISO DOC | None |
| COMMAND | Manual or auto-detected by Nick Fury |

---

### Stage 2: BREAKDOWN

| Field | Value |
|-------|-------|
| WHO | Iron Man (sub-agent via `/aegis-breakdown`) |
| INPUT | Requirement text or spec file |
| OUTPUT | User Story -> Journeys -> Epics -> Tasks (meta.json + history.md for each) |
| GATE | All entities have meta.json with valid schema + history.md with CREATED entry |
| ISO DOC | Coulson generates SI.01 Requirements Spec, SI.03 Traceability (initial) |
| STORAGE | `_aegis-brain/tasks/{ID}/meta.json`, `_aegis-brain/tasks/{ID}/history.md` |
| ID FORMAT | `PROJ-{TYPE}-NNN` per pm-state-protocol.md |

---

### Stage 3: SPRINT_PLAN

| Field | Value |
|-------|-------|
| WHO | Captain America (via `/aegis-sprint plan`) |
| INPUT | Backlog tasks (meta.json files with status=BACKLOG), velocity history |
| OUTPUT | Sprint plan (plan.md), kanban board (kanban.md), metrics.json |
| GATE | Committed points <= average velocity (capacity check) |
| ISO DOC | Coulson updates PM.01 Project Plan, PM.04 Meeting Record |
| STORAGE | `_aegis-brain/sprints/sprint-N/` |
| TASK UPDATE | status: BACKLOG -> TODO, sprint: null -> sprint-N |

---

### Stages 4-11: PER-TASK CYCLE

> Repeats for each task in the active sprint. Tasks flow through these stages
> independently. WIP limits apply (see pm-state-protocol.md).

#### Stage 4: SPEC

| Field | Value |
|-------|-------|
| WHO | Iron Man (Build Team) |
| INPUT | Task meta.json (status=TODO) |
| OUTPUT | Spec file in `_aegis-output/specs/{TASK-ID}-spec.md` |
| GATE | Spec must contain: problem statement, solution, file list, acceptance criteria |
| ISO DOC | Coulson updates SI.02 Design Doc, SI.03 Traceability |
| SKIP | If spec exists and task <= 2 story points, Iron Man validates instead of rewriting |

#### Stage 5: BUILD

| Field | Value |
|-------|-------|
| WHO | Spider-Man (Build Team), Wasp (if UI task) |
| INPUT | Spec from Iron Man |
| OUTPUT | Source files (src/) + test files (tests/) |
| GATE | Code compiles, lint passes, unit tests pass |
| ISO DOC | Coulson updates SI.04 Test Cases, SI.03 Traceability |
| TASK UPDATE | status: TODO -> IN_PROGRESS (at start), IN_PROGRESS -> IN_REVIEW (at end) |

#### Stage 6: REVIEW -- Gate 1

| Field | Value |
|-------|-------|
| WHO | Black Panther (Build Team) |
| INPUT | Code diff from Spider-Man |
| OUTPUT | Review report in `_aegis-output/reviews/{TASK-ID}-review.md` |
| GATE | 0 critical findings. Verdict: PASS / CONDITIONAL / FAIL |
| ISO DOC | None (review is internal artifact) |
| ON PASS | Emit HandoffEnvelope to QA team. Task status -> QA |
| ON FAIL | Task status -> IN_PROGRESS. Findings appended to comments.md. Back to BUILD |
| ESCALATION | If CONDITIONAL with >= 2 high findings, triggers Review Team (Beast -> Loki -> Black Panther) |

#### Stage 7: QA_PLAN

| Field | Value |
|-------|-------|
| WHO | War Machine (QA Team) |
| INPUT | Code + review report (Gate 1 PASS) via HandoffEnvelope |
| OUTPUT | Test plan in `_aegis-output/qa/sprint-N/test-plan-{TASK-ID}.md` |
| ISO DOC | Coulson updates SI.04 Test Plan |

#### Stage 8: QA_EXECUTE

| Field | Value |
|-------|-------|
| WHO | Vision (QA Team) |
| INPUT | Test plan from War Machine |
| OUTPUT | Raw test results in `_aegis-output/qa/sprint-N/raw-results-{TASK-ID}.md` |
| ISO DOC | None (raw data) |

#### Stage 9: QA_VERDICT -- Gate 2

| Field | Value |
|-------|-------|
| WHO | War Machine (QA Team) |
| INPUT | Test results from Vision |
| OUTPUT | QA verdict in `_aegis-output/qa/sprint-N/qa-report-{TASK-ID}.md` |
| GATE | P0 tests 100%, overall >= 95%, 0 regressions |
| ISO DOC | Coulson generates SI.05 Test Report, SI.03 Traceability (final) |
| ON PASS | Emit HandoffEnvelope to Compliance. Task continues to COMPLY |
| ON FAIL | Task status -> IN_PROGRESS. Back to BUILD with QA findings |

#### Stage 10: COMPLY -- Gate 3

| Field | Value |
|-------|-------|
| WHO | Coulson |
| INPUT | All artifacts from Build + QA via HandoffEnvelope |
| OUTPUT | ISO docs updated in `_aegis-output/iso-docs/` |
| GATE | All required ISO docs exist, are current version, traceability matrix complete |
| ISO DOC | Self-check all applicable docs |
| ON PASS | Task is deploy-ready |
| ON FAIL | Block until missing docs generated. Coulson self-heals if possible |

#### Stage 11: KANBAN_DONE

| Field | Value |
|-------|-------|
| WHO | Captain America |
| INPUT | All 3 gates PASS for this task |
| OUTPUT | Task moved to DONE on kanban |
| ISO DOC | PM.02 Progress Status updated |
| TASK UPDATE | status -> DONE, metrics.json recomputed, kanban.md regenerated |

---

### Stage 12: SPRINT_CLOSE

| Field | Value |
|-------|-------|
| WHO | Captain America (via `/aegis-sprint close`) |
| INPUT | All tasks in sprint (done or carry-over) |
| OUTPUT | Sprint report (close.md), velocity update, retrospective |
| GATE | Sprint goal met or carry-over documented. ISO docs not stale |
| ISO DOC | PM.04 Meeting Record (review + retro), PM.02 Progress Status |
| CARRY-OVER | Incomplete tasks: status -> BACKLOG, sprint -> null |

---

### Stage 13: DEPLOY -- Gate 4

| Field | Value |
|-------|-------|
| WHO | Thor (via `/aegis-deploy`) |
| INPUT | All gates passed, sprint closed, release artifact built |
| OUTPUT | Deployment report in `_aegis-output/deploys/` |
| GATE | Health check passes within 60 seconds (Gate 4) |
| ISO DOC | SI.06 Software Configuration |
| ON FAIL | Automatic rollback. PM.03 Correction Register entry |
| PRE-REQUISITE | All 3 gates (Code, QA, Compliance) passed for every task in scope |

---

### Stage 14: MONITOR -- Gate 5

| Field | Value |
|-------|-------|
| WHO | Thor |
| INPUT | Deployed application, health endpoints, error rate baseline |
| OUTPUT | Monitor report in `_aegis-output/deploys/monitor-{timestamp}.log` |
| GATE | Error rate < 2x baseline for 5 minutes |
| ISO DOC | PM.03 Correction Register (if issues found) |
| ON STABLE | Pipeline complete |
| ON ERROR | Trigger FEEDBACK: create hotfix task in backlog with CRITICAL priority |

---

## Gate Summary Table

| Gate | Name | Stage | Owner | Pass Criteria | Fail Action |
|------|------|-------|-------|--------------|-------------|
| G1 | Code Review | 6 (REVIEW) | Black Panther | 0 critical findings, code matches spec | Return to BUILD |
| G2 | QA Verdict | 9 (QA_VERDICT) | War Machine | P0=100%, overall>=95%, 0 regressions | Return to BUILD |
| G3 | Compliance | 10 (COMPLY) | Coulson | All ISO docs current, traceability complete | Block until docs generated |
| G4 | Deploy Health | 13 (DEPLOY) | Thor | Health check pass within 60s | Auto-rollback + Correction Register |
| G5 | Post-Deploy | 14 (MONITOR) | Thor | Error rate < 2x baseline for 5 min | Auto-rollback + hotfix task |

---

## Agent Routing Table

| Stage | Primary Agent | Backup / Escalation | Team |
|-------|--------------|---------------------|------|
| IDEA | Human / Captain America | Nick Fury (auto-detect) | -- |
| BREAKDOWN | Iron Man | Loki (challenge completeness if >= 8pts) | -- |
| SPRINT_PLAN | Captain America | -- | -- |
| SPEC | Iron Man | Wasp (UI tasks) | Build |
| BUILD | Spider-Man | Wasp (frontend) | Build |
| REVIEW | Black Panther | Beast + Loki (deep review if triggered) | Build / Review |
| QA_PLAN | War Machine | -- | QA |
| QA_EXECUTE | Vision | -- | QA |
| QA_VERDICT | War Machine | -- | QA |
| COMPLY | Coulson | -- | Compliance |
| KANBAN_DONE | Captain America | -- | -- |
| SPRINT_CLOSE | Captain America | Coulson (ISO doc check) | -- |
| DEPLOY | Thor | -- | DevOps |
| MONITOR | Thor | Captain America (alert routing) | DevOps |

---

## Status Mapping (Pipeline Stage -> Task Status)

| Pipeline Stage | meta.json status | Transition |
|---------------|-----------------|------------|
| BACKLOG (pre-sprint) | BACKLOG | -- |
| SPRINT_PLAN | TODO | BACKLOG -> TODO |
| SPEC | TODO | (no change, spec is prep work) |
| BUILD (start) | IN_PROGRESS | TODO -> IN_PROGRESS |
| BUILD (complete) | IN_REVIEW | IN_PROGRESS -> IN_REVIEW |
| REVIEW PASS | QA | IN_REVIEW -> QA |
| REVIEW FAIL | IN_PROGRESS | IN_REVIEW -> IN_PROGRESS |
| QA PASS | DONE | QA -> DONE |
| QA FAIL | IN_PROGRESS | QA -> IN_PROGRESS |
| COMPLY | (no status change) | Checked during QA->DONE transition |
| KANBAN_DONE | DONE | (confirmed) |

---

## ISO 29110 Document Triggers

| ISO Doc | Code | Generated At Stage | Owner |
|---------|------|-------------------|-------|
| Requirements Specification | SI.01 | BREAKDOWN | Coulson |
| Design Document | SI.02 | SPEC | Coulson |
| Traceability Matrix | SI.03 | BREAKDOWN (init), SPEC, QA_VERDICT (final) | Coulson |
| Test Cases / Test Plan | SI.04 | BUILD, QA_PLAN | Coulson |
| Test Report | SI.05 | QA_VERDICT | Coulson |
| Software Configuration | SI.06 | DEPLOY | Coulson |
| Project Plan | PM.01 | SPRINT_PLAN | Coulson |
| Progress Status | PM.02 | KANBAN_DONE, SPRINT_CLOSE | Coulson |
| Correction Register | PM.03 | MONITOR (on error), DEPLOY (on failure) | Coulson |
| Meeting Record | PM.04 | SPRINT_PLAN, SPRINT_CLOSE | Coulson |

---

## Feedback Loop

```
MONITOR detects error spike (error_rate > 2x baseline)
    |
    v
Thor creates finding report
    |
    v
Thor triggers auto-rollback (if needed)
    |
    v
Captain America creates hotfix task:
  - type: task
  - task_type: impl
  - priority: critical
  - labels: ["hotfix", "production"]
  - status: BACKLOG (or directly TODO if sprint active)
    |
    v
Coulson creates PM.03 Correction Register entry
    |
    v
Hotfix enters PER-TASK CYCLE (stages 4-11)
  - Accelerated: spec can be minimal, review still required
  - All 3 gates still apply (no shortcuts for hotfixes)
```

---

## Command-to-Stage Mapping

| Command | Triggers Stage(s) |
|---------|-------------------|
| `/aegis-breakdown` | BREAKDOWN (stage 2) |
| `/aegis-sprint plan` | SPRINT_PLAN (stage 3) |
| `/aegis-team-build` | SPEC + BUILD + REVIEW (stages 4-6) |
| `/aegis-team-review` | REVIEW deep review (stage 6, escalated) |
| `/aegis-team-qa` | QA_PLAN + QA_EXECUTE + QA_VERDICT (stages 7-9) |
| `/aegis-sprint close` | SPRINT_CLOSE (stage 12) |
| `/aegis-deploy` | DEPLOY + MONITOR (stages 13-14) |
| `/aegis-pipeline` | Stages 2 through 12 (full sprint cycle) |
| `/aegis-start` | Nick Fury scans, may trigger any stage |

---

## Cross-References

- Task lifecycle and meta.json schema: `pm-state-protocol.md`
- Handoff envelope format: `handoff-protocol.md`
- Agent definitions: `.claude/agents/*.md`
- ISO 29110 doc templates: `_aegis-output/iso-docs/`
- Sprint storage: `_aegis-brain/sprints/sprint-N/`
- Task storage: `_aegis-brain/tasks/{ID}/`
