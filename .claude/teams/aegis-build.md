---
name: aegis-build
description: "Spec-to-implementation build team with explicit input/output contracts"
lead: spider-man
members: [iron-man, black-panther]
mode: tmux
requires: tmux
---

## Team Purpose
End-to-end build pipeline: Iron Man designs -> Spider-Man implements -> Black Panther reviews.

## Input Contract

```json
{
  "team": "build",
  "trigger": "task_status == TODO && task.sprint == active_sprint",
  "required_inputs": {
    "task_meta": "_aegis-brain/tasks/{TASK-ID}/meta.json",
    "acceptance_criteria": "from meta.json or parent user story",
    "existing_spec": "optional -- _aegis-output/specs/{TASK-ID}-spec.md"
  }
}
```

## Task Breakdown

### 1. Iron Man (opus): Write/refine technical spec
- Reads: task meta.json, parent story, any existing spec
- Produces: `_aegis-output/specs/{TASK-ID}-spec.md`
- ISO trigger: Coulson generates SI.02 (Design Document) and updates SI.03 (Traceability Matrix)
- Skip condition: If spec exists and task <= 2 story points, Iron Man validates rather than rewrites

### 2. Spider-Man (sonnet): Implement based on spec
- Reads: Iron Man's spec file
- Produces: Source code in src/, unit tests in tests/
- Validation: Runs `lint + build + test` before reporting done
- ISO trigger: Coulson generates SI.04 (Test Cases)
- Escalation: If spec has ambiguity, sends EscalationAlert to Iron Man (does not guess)

### 3. Black Panther (sonnet): Review implementation against spec
- Reads: Spider-Man's code diff, Iron Man's spec
- Produces: `_aegis-output/reviews/{TASK-ID}-review.md`
- Gate 1 checklist: correctness, security, performance, style, test coverage
- On PASS: task status -> QA, emit HandoffEnvelope to aegis-qa
- On FAIL: task status -> IN_PROGRESS, findings appended to task comments

## Communication Flow
Iron Man -> PlanProposal -> Spider-Man
Spider-Man -> StatusUpdate -> Black Panther
Black Panther -> FindingReport -> Spider-Man (iterate if needed)
Spider-Man -> CompletionReport -> Lead

## Pipeline
Iron Man spec -> GATE -> Spider-Man implement -> GATE -> Black Panther review -> GATE -> Done

## Output Contract

```json
{
  "from_team": "build",
  "to_team": "qa",
  "task_id": "PROJ-T-XXX",
  "status": "READY_FOR_QA",
  "artifacts": {
    "spec": "_aegis-output/specs/{TASK-ID}-spec.md",
    "code_files": ["list of changed files"],
    "review": "_aegis-output/reviews/{TASK-ID}-review.md"
  },
  "gate_results": {
    "gate_1": "PASS",
    "gate_1_reviewer": "black-panther",
    "gate_1_timestamp": "ISO timestamp"
  }
}
```

## Handoff Rules
- **PASS** -> aegis-qa team receives HandoffEnvelope with all artifacts
- **FAIL** -> self-fix cycle: Black Panther findings go to Spider-Man, Spider-Man iterates, Black Panther re-reviews

## ISO Triggers
- **SI.02** (Design Document): Generated during Iron Man phase from spec output
- **SI.04** (Test Cases): Generated during Spider-Man phase from unit test mapping

## Output
_aegis-output/builds/YYYY-MM-DD_build.md
