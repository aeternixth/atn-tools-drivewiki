---
name: aegis-flow
description: "Deterministic workflow runner — execute predefined flows like deploy, feature, bugfix"
triggers:
  en: flow, workflow, start flow, run flow
  th: ขั้นตอน, flow, เริ่ม flow
---

# /aegis-flow

## Quick Reference
Deterministic workflow runner inspired by CrewAI/LangGraph patterns. Accepts a flow name
(deploy, feature, bugfix, or custom), loads the flow template, executes steps in order
spawning agents/teams as needed, applies review gates between steps, reports progress
throughout, and saves the flow log to _aegis-output/flows/. Predefined flows: deploy
(lint-test-security-build-deploy), feature (spec-implement-test-review-merge), bugfix
(reproduce-diagnose-fix-test-review).

## Full Instructions

### Step 1: Accept Flow Name
- Parse command: `/aegis-flow [flow-name]`
- Valid predefined flows:
  - `deploy` — Deployment pipeline
  - `feature` — Feature development pipeline
  - `bugfix` — Bug fix pipeline
- Custom flows: check `.claude/teams/flows/` for custom flow definitions.
- If no flow name given:
  ```
  Available flows:
  • deploy   — lint → test → security-scan → build → deploy
  • feature  — spec → implement → test → review → merge
  • bugfix   — reproduce → diagnose → fix → test → review
  
  Custom flows in .claude/teams/flows/:
  • [list any .md or .yaml files found]
  
  Usage: /aegis-flow [flow-name]
  ```

### Step 2: Load Flow Template
- For predefined flows, use the definitions below.
- For custom flows, read the template from `.claude/teams/flows/[name].md`.
- Validate the flow has all required fields:
  - Flow name
  - Step definitions
  - Gate conditions
  - Agent assignments

### Step 3: Execute Flow

#### Flow: `deploy`
```
Step 1: LINT
  Agent: Black Panther
  Action: Run project linter, report errors/warnings
  Gate: Zero errors required (warnings OK)
  
Step 2: TEST
  Agent: Black Panther
  Action: Run full test suite
  Gate: All tests must pass
  
Step 3: SECURITY-SCAN
  Agent: Black Panther
  Action: Scan for secrets, vulnerabilities, unsafe patterns
  Gate: No critical or high severity findings
  
Step 4: BUILD
  Agent: Spider-Man
  Action: Run build command (detect from project config)
  Gate: Build succeeds without errors
  
Step 5: DEPLOY
  Agent: Spider-Man
  Action: Execute deployment (requires user confirmation at L1/L2)
  Gate: Deployment succeeds, health check passes
```

#### Flow: `feature`
```
Step 1: SPEC
  Agent: Iron Man
  Action: Write or validate feature specification
  Gate: User approves spec (always, regardless of autonomy)
  
Step 2: IMPLEMENT
  Agent: Spider-Man
  Action: Implement feature per spec
  Gate: Implementation compiles/runs without errors
  
Step 3: TEST
  Agent: Spider-Man + Black Panther
  Action: Write tests, run test suite
  Gate: All new and existing tests pass
  
Step 4: REVIEW
  Agent: Black Panther + Loki
  Action: Code review and adversarial testing
  Gate: Review approved (or iterate back to Step 2)
  
Step 5: MERGE
  Agent: Captain America
  Action: Prepare merge (squash commits, update CHANGELOG)
  Gate: User confirms merge
```

#### Flow: `bugfix`
```
Step 1: REPRODUCE
  Agent: Beast
  Action: Reproduce the bug, document reproduction steps
  Gate: Bug is reproducible (or confirmed from logs)
  
Step 2: DIAGNOSE
  Agent: Iron Man
  Action: Analyze root cause, identify affected code paths
  Gate: Root cause identified with confidence
  
Step 3: FIX
  Agent: Spider-Man
  Action: Implement the fix
  Gate: Fix compiles, doesn't break existing functionality
  
Step 4: TEST
  Agent: Spider-Man + Black Panther
  Action: Write regression test, run full suite
  Gate: Regression test passes, no other tests broken
  
Step 5: REVIEW
  Agent: Black Panther
  Action: Review fix for correctness and side effects
  Gate: Review approved
```

### Step 4: Review Gate Between Steps
- After each step completes, evaluate the gate condition.
- Display gate status:
  ```
  ┌─ Gate Check: [step name] ──────────────────┐
  │ Condition: [gate condition]                 │
  │ Result:    ✅ PASSED / ❌ FAILED            │
  │                                             │
  │ [details of what was checked]               │
  └─────────────────────────────────────────────┘
  ```
- If gate FAILS:
  - At L1/L2: Ask user how to proceed (retry, skip, abort).
  - At L3: Retry once automatically, then ask.
  - At L4: Retry up to 3 times, then abort with report.

### Step 5: Report Progress
- Show progress bar as flow executes:
  ```
  Flow: feature [████████████░░░░░░░░] Step 3/5 — TEST
  ✅ spec → ✅ implement → 🔄 test → ⬜ review → ⬜ merge
  ```
- Update after each step completes.

### Step 6: Save Flow Log
- Save detailed log to `_aegis-output/flows/[flow-name]-YYYY-MM-DD_HH-MM.md`:
  ```markdown
  # Flow Log: [flow-name] — [date]
  
  ## Summary
  - Flow: [name]
  - Status: [completed/failed/aborted]
  - Duration: [time]
  - Steps completed: [N/total]
  
  ## Step Details
  
  ### Step 1: [name] — [status]
  - Agent: [agent]
  - Duration: [time]
  - Gate: [pass/fail]
  - Output: [summary]
  
  ### Step 2: [name] — [status]
  ...
  
  ## Final Output
  [results or error details]
  ```
