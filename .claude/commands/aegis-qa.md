---
name: aegis-qa
description: "QA command — plan tests, run tests, generate reports, gate releases"
triggers:
  en: QA, test, run tests, quality assurance, test plan
  th: คิวเอ, ทดสอบ, รันเทสต์
---

# /aegis-qa

## Quick Reference
QA command that plans test strategies, executes tests, reviews results, and gates
releases. Solo mode uses sub-agent War Machine for single targets. Team mode spawns
a full QA team (War Machine + Vision) via TeamCreate for multi-target work.

## Full Instructions

### Subcommands

```
/aegis-qa plan [target]     — Generate test plan for target scope
/aegis-qa run [target]      — Execute tests against target
/aegis-qa report [target]   — Generate QA report from existing results
/aegis-qa full [target]     — Full pipeline: plan -> run -> report -> gate
/aegis-qa gate [target]     — Release gate check (pass/conditional/fail)
```

### Mode Selection

**Solo Mode** (1 target, simple scope):
- Uses sub-agent War Machine directly
- War Machine plans, coordinates Vision internally, reviews, and gates
- Best for: single module, single feature, quick checks

**Team Mode** (2+ targets, complex scope):
- Spawns full QA team via TeamCreate in tmux
- War Machine as QA Lead, Vision as parallel executor
- Best for: sprint-wide QA, multi-module changes, release candidates

Mode is auto-detected based on scope, or forced with `--mode solo|team`.

### Subcommand Details

#### `/aegis-qa plan [target]`

Generate a test plan without executing tests.

1. Analyze target scope:
   - If target is a branch: `git diff main...<branch>` to find changed files
   - If target is a path: scan files in that directory
   - If target is `--sprint`: analyze all changes since last sprint tag
2. Map changes to test categories (functional, integration, regression, acceptance)
3. Generate prioritized test plan
4. Output: `_aegis-output/qa/sprint-N/test-plan.md`

#### `/aegis-qa run [target]`

Execute tests for the target. Requires a test plan (auto-generates one if missing).

1. Load or generate test plan
2. Detect test runner and environment
3. Execute test cases via Vision
4. Capture raw results
5. Output: `_aegis-output/qa/sprint-N/raw-results.md`

#### `/aegis-qa report [target]`

Generate QA report from existing test results.

1. Load raw results from `_aegis-output/qa/sprint-N/raw-results.md`
2. War Machine analyzes and interprets results
3. Calculate metrics: pass rate, regression count, coverage delta
4. Classify failures by severity and type
5. Output: `_aegis-output/qa/sprint-N/qa-report.md`

#### `/aegis-qa full [target]`

Run the complete pipeline end-to-end.

```
Plan --> Run --> Report --> Gate
```

1. Generate test plan (plan)
2. Execute all test cases (run)
3. Analyze results and generate report (report)
4. Issue release gate verdict (gate) — includes PM state writes (see gate subcommand above)
5. Output: all files in `_aegis-output/qa/sprint-N/`

#### `/aegis-qa gate [target]`

Release gate check — issues a verdict based on existing QA report.

1. Load QA report from `_aegis-output/qa/sprint-N/qa-report.md`
2. Evaluate against gate criteria:
   - **PASS** — All P0 tests pass, pass rate >= 95%, 0 regressions
   - **CONDITIONAL** — Minor failures only (P2+), pass rate >= 90%
   - **FAIL** — P0/P1 failures, regressions, or pass rate < 90%
3. Output verdict with justification
4. **Record gate result in PM state** (if a TASK-ID is associated with this gate check):
   - Identify the task ID from the target (e.g. from report metadata or command argument).
   - Read `_aegis-brain/tasks/{TASK-ID}/meta.json` to confirm task exists.
   - Determine gate number: Gate 1 if this is a review gate (IN_REVIEW → QA), Gate 2 if QA gate (QA → DONE).
   - Append to `_aegis-brain/tasks/{TASK-ID}/history.md`:
     - On PASS or CONDITIONAL:
       ```
       | {YYYY-MM-DD HH:MM} | war-machine | GATE_PASS | - | Gate {N} | {one-line summary} |
       ```
     - On FAIL:
       ```
       | {YYYY-MM-DD HH:MM} | war-machine | GATE_FAIL | - | Gate {N} | {one-line summary} |
       ```
   - If verdict is FAIL or CONDITIONAL with findings, append a comment to
     `_aegis-brain/tasks/{TASK-ID}/comments.md` (use comment format from pm-state-protocol.md)
     containing the key QA findings summary (max 10 bullet points).
   - Update task status in `meta.json` based on verdict:
     - PASS from Gate 2 (QA gate): set `status = "DONE"`, `updated` = now, then regenerate kanban.md.
     - FAIL from any gate: set `status = "IN_PROGRESS"` (task is returned to developer), `updated` = now.
     - CONDITIONAL: leave status unchanged; developer and reviewer decide next step.

### Gate Criteria

| Criterion          | PASS       | CONDITIONAL | FAIL       |
|--------------------|------------|-------------|------------|
| P0 Tests           | 100% pass  | 100% pass   | Any fail   |
| P1 Tests           | 100% pass  | >= 90% pass | < 90% pass |
| Overall Pass Rate  | >= 95%     | >= 90%      | < 90%      |
| Regressions        | 0          | 0           | Any        |
| Coverage Delta     | >= 0%      | >= -1%      | < -1%      |

### Team Mode Details

When team mode is activated:

```
TeamCreate: aegis-qa-team
  War Machine (sonnet) — QA Lead: plans, reviews, gates
  Vision (haiku)     — Executor: runs tests in parallel
```

- War Machine breaks work into parallel test batches for Vision
- Vision instances run test batches concurrently
- War Machine collects and merges results
- Human monitors via `tmux attach -t aegis-qa-team`

### Examples

```bash
# Plan tests for current branch
/aegis-qa plan

# Run tests for a specific module
/aegis-qa run src/auth/

# Full QA pipeline for the sprint
/aegis-qa full --sprint

# Check release gate
/aegis-qa gate

# Force team mode for complex scope
/aegis-qa full --mode team src/
```

### Output Structure

```
_aegis-output/qa/sprint-N/
  test-plan.md      # Test strategy and case list
  raw-results.md    # Vision's raw execution output
  qa-report.md      # War Machine's analysis and verdict
  coverage/         # Coverage reports (if available)
```

**PM State Writes** (gate subcommand only, when TASK-ID is known):

```
_aegis-brain/tasks/{TASK-ID}/
  history.md        # Appended: GATE_PASS or GATE_FAIL row
  comments.md       # Appended: QA summary (FAIL/CONDITIONAL only)
  meta.json         # Updated: status field (PASS → DONE, FAIL → IN_PROGRESS)
_aegis-brain/sprints/sprint-N/
  kanban.md         # Regenerated if status changed
  metrics.json      # Recomputed if status changed
```

### Step 0: Initialize QA Output Directory (NEW -- auto-setup)

Before running any subcommand, ensure the output directory exists:

```
INITIALIZATION:
  1. Determine sprint name from _aegis-brain/sprints/current/plan.md
  2. Create directory: _aegis-output/qa/sprint-{N}/
  3. Create subdirectory: _aegis-output/qa/sprint-{N}/results/
  4. If directories already exist: skip (no-op)
  5. Log: "QA output directory ready: _aegis-output/qa/sprint-{N}/"
```

This ensures Sentinel and Probe can write their outputs without directory errors.

### Agent Permissions Note

**Sentinel** has Write access scoped to `_aegis-output/qa/` -- she produces:
- test-plan.md (test strategy)
- qa-report.md (analysis and verdict)

**Probe** has Write access scoped to `_aegis-output/qa/results/` -- she produces:
- raw-results.md (execution output)
- Individual test case logs

Neither agent can write outside their scoped blast radius.
