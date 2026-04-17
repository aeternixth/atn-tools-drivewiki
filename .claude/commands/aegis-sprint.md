---
name: aegis-sprint
description: "Sprint management — plan, standup, review, retro, status, close. Full scrum lifecycle via Captain America."
triggers:
  en: sprint, scrum, standup, sprint plan, sprint review, sprint retro, sprint status, sprint close
  th: สปรินต์, สครัม, สแตนอัพ, วางแผนสปรินต์
---

# /aegis-sprint

## Quick Reference

Full sprint lifecycle management. Captain America (opus) orchestrates all ceremonies.

| Subcommand | Purpose |
|-----------|---------|
| `/aegis-sprint plan` | Start sprint planning: read backlog, calculate capacity, select stories, create sprint dir, init kanban |
| `/aegis-sprint standup` | Auto-generate daily standup from activity logs |
| `/aegis-sprint review` | Summarize completed work and demo links |
| `/aegis-sprint retro` | Sprint retrospective with action items (integrates with `/aegis-retro`) |
| `/aegis-sprint status` | Show burndown: points done vs remaining |
| `/aegis-sprint close` | Close sprint, calculate velocity, carry over incomplete tasks |

- **Sprint data**: `_aegis-brain/sprints/sprint-<N>/`
- **Orchestrator**: Captain America (opus) — ceremony facilitator, single writer to kanban
- **Skill reference**: `skills/sprint-tracker.md` (full templates and rules)

### ⚠️ MANDATORY: ISO 29110 Documents Per Sprint

**Documents are generated AT ACTIVITY TIME by Coulson, not batch-generated at sprint close.**
**Sprint close only VERIFIES all required docs exist — it does not generate them.**

| Sprint Phase | Activity | Coulson Auto-Generates |
|-------------|----------|----------------------|
| Sprint Plan | PM.1 | Project Plan (update), Meeting Record |
| Daily Work | PM.2 | Progress Status (per standup) |
| When Scope Changes | PM.2 | Change Request |
| When Issues Found | PM.3 | Correction Register entry |
| After /aegis-breakdown | SI.2 | Requirements Spec, Traceability Matrix |
| After Iron Man specs | SI.3 | Design Document, Traceability Matrix |
| After Spider-Man builds | SI.4 | Test Cases, Traceability Matrix |
| After /aegis-qa | SI.5 | Test Report, Traceability Matrix (final) |
| Sprint Close | PM.4 | Acceptance Record, Meeting Record |
| Release | SI.6 | Software Configuration |

**Sprint close is BLOCKED if ISO docs are not current:**
```
/aegis-sprint close
  → Runs: /aegis-compliance check
  → If ANY required doc is missing/stale: "Cannot close sprint. Docs missing: [list]"
    → Team identifies WHICH ACTIVITY was skipped and completes it
  → If all docs current: Proceed with close
```

**First sprint = more work (up to 14 work products). Subsequent sprints = incremental updates only.**

---

## Full Instructions

### Routing

Parse the subcommand from the user's input. If no subcommand is given, show the
quick reference table above and ask which ceremony to run.

```
/aegis-sprint plan    → go to "Sprint Planning"
/aegis-sprint standup → go to "Daily Standup"
/aegis-sprint review  → go to "Sprint Review"
/aegis-sprint retro   → go to "Sprint Retrospective"
/aegis-sprint status  → go to "Sprint Status"
/aegis-sprint close   → go to "Sprint Close"
```

### Common: Determine Current Sprint Number

Before any subcommand, detect the current sprint number:

1. List directories in `_aegis-brain/sprints/` matching `sprint-*`.
2. Sort numerically. The highest number is the current (or most recent) sprint.
3. If no sprint directories exist, the next sprint is sprint-1.
4. Store this as `CURRENT_SPRINT` for the subcommand to use.

---

### Subcommand: Sprint Planning

**When**: Beginning of a new sprint.

#### Step 1: Determine Sprint Number
- If there is an open sprint (no `close.md` in the latest sprint dir), warn:
  "Sprint <N> is still open. Run `/aegis-sprint close` first, or pass `--force` to start a new one anyway."
- Otherwise, new sprint number = `CURRENT_SPRINT + 1`.

#### Step 2: Read Inputs
- Read `_aegis-brain/tasks/*/meta.json` for all tasks with `status = BACKLOG` and `sprint = null`.
  These are the candidates for the new sprint. Also read `_aegis-brain/backlog.md` if it exists
  (for any tasks not yet migrated to meta.json format).
- Read `_aegis-brain/sprints/sprint-<N-1>/metrics.json` for `velocity_history` (if exists).
- Collect carry-over tasks: any meta.json with `sprint = null` and a note of "Carried over from sprint-<N-1>"
  in their history.md.

#### Step 3: Calculate Capacity
- Read `velocity_history` from `_aegis-brain/sprints/sprint-<N-1>/metrics.json`.
  If no metrics.json exists, fall back to reading the last 5 `close.md` files.
- If no history exists at all, use 20 points as default starting capacity.
- Recommended capacity = rolling average of last 5 velocity_history values * 0.9 (10% buffer).

#### Step 4: Select Stories
- Sort candidate tasks by priority (critical > high > medium > low). Carry-over tasks
  (those with a "Carried over" note in history.md) take precedence over fresh backlog items
  at the same priority level.
- Select tasks from the top until 85-95% of recommended capacity is reached.
- Do not exceed 100% capacity.

#### Step 5: Assign to Agents
Map each task to the appropriate agent by type:
- Architecture / design → @iron-man
- Implementation / code → @spider-man
- Code review / security → @black-panther
- UI / content → @wasp or @songbird
- Test planning → @war-machine
- Test execution → @vision
- Documentation → @coulson
- Research / adversarial → @loki
- Data / analytics → @beast

#### Step 6: Create Sprint Directory and Files
- Create `_aegis-brain/sprints/sprint-<N>/` and `daily/` subdirectory.
- Write `plan.md` using the Sprint Plan Template from `skills/sprint-tracker.md`.
- Write `_aegis-brain/sprints/sprint-<N>/metrics.json` with initial values:
  - `sprint`: "sprint-<N>"
  - `started`: current date
  - `planned_end`: start + sprint duration
  - `actual_end`: null
  - `goal`: sprint goal text
  - `capacity_pts`: recommended capacity
  - `committed_pts`: sum of selected task points
  - `completed_pts`: 0
  - `daily_burndown`: [ { "date": today, "day": 1, "remaining": committed_pts, "completed": 0 } ]
  - `velocity_history`: copied from previous metrics.json (or empty array)
  - `tasks`: counts by status (all TODO initially)
  - `carry_over`: { "count": 0, "points": 0, "task_ids": [] }
- For each selected task, update `_aegis-brain/tasks/{ID}/meta.json`:
  - Set `sprint` to `"sprint-<N>"` and `status` to `"TODO"`.
  - Set `updated` to the current timestamp.
- For each selected task, append to `_aegis-brain/tasks/{ID}/history.md`:
  ```
  | {timestamp} | captain-america | SPRINT_ASSIGNED | - | sprint-<N> | Sprint <N> planning |
  | {timestamp} | captain-america | MOVED | BACKLOG | TODO | Sprint <N> planning |
  ```
- Generate `_aegis-brain/sprints/sprint-<N>/kanban.md` by reading all selected tasks'
  meta.json files and rendering the board view (see pm-state-protocol.md "Regenerating Kanban Board").
- Update the `current` symlink: `_aegis-brain/sprints/current` → `sprint-<N>/`.

#### Step 7: Log
Append to `_aegis-brain/logs/activity.log`:
```
[YYYY-MM-DD HH:MM] SPRINT_START | sprint=<N> | capacity=<pts> | stories=<count> | load=<pct>%
```

#### Step 8: Display Summary
```
Sprint <N> Planning Complete

  Sprint Goal:  <goal>
  Capacity:     <committed>/<total> pts (<pct>% load)
  Stories:      <count> tasks across <agent-count> agents
  Carry-over:   <count> tasks from sprint <N-1>
  Duration:     <start> to <end>

  Sprint dir:   _aegis-brain/sprints/sprint-<N>/
  Kanban:       _aegis-brain/sprints/sprint-<N>/kanban.md
```

---

### Subcommand: Daily Standup

**When**: Any time during an active sprint. Generates automatically from logs.

#### Step 1: Read Activity Logs
- Read `_aegis-brain/sprints/sprint-<N>/metrics.json` for sprint summary data.
- Read all `meta.json` files where `sprint = "sprint-<N>"` for current task states.
- Read `_aegis-brain/tasks/*/history.md` — collect entries from the last 24 hours
  (filter rows where timestamp >= 24 hours ago). These replace activity.log as the
  source of state-change truth.
- Also read `_aegis-brain/logs/activity.log` filtered to the last 24 hours for
  any non-task events (reviews, deploys, etc.).

#### Step 2: Identify Blockers
- Scan log entries for BLOCKED, FAILURE, ERROR, or STALLED markers.
- Flag tasks in IN_PROGRESS for more than 1 day without a log entry.

#### Step 3: Calculate Burndown
- Points completed = sum of `points` from meta.json files with `status = DONE`.
- Points remaining = sum of `points` from meta.json files with status in TODO, IN_PROGRESS, IN_REVIEW, QA.
- Read sprint duration from `plan.md` and `metrics.json` to compute ideal remaining.
- Append a `daily_burndown` entry to `metrics.json` if today's date is not already present.
- Determine status: ON_TRACK / AT_RISK / OFF_TRACK (see thresholds in skill).

#### Step 4: Write Standup
- Write to `_aegis-brain/sprints/sprint-<N>/daily/YYYY-MM-DD.md` using the
  Daily Standup Template from `skills/sprint-tracker.md`.

#### Step 5: Display Summary
```
Daily Standup: <YYYY-MM-DD> (Sprint <N>, Day <D>/<total>)

  Completed:  <pts> / <total> pts
  Remaining:  <pts> pts
  Status:     ON_TRACK / AT_RISK / OFF_TRACK
  Blockers:   <count>

  Full report: _aegis-brain/sprints/sprint-<N>/daily/<YYYY-MM-DD>.md
```

---

### Subcommand: Sprint Review

**When**: Last day of the sprint, before retrospective.

#### Step 1: Collect Completed Work
- Read `kanban.md` — list all tasks in DONE with their output paths.
- For each DONE task, locate its deliverable in `_aegis-output/` or `src/`.

#### Step 2: Collect Incomplete Work
- List all tasks NOT in DONE — these are carry-over candidates.
- Note each task's current column and reason for incompletion.

#### Step 3: Assess Sprint Goal
- Re-read sprint goal from `plan.md`.
- Determine: YES / PARTIAL / NO — was the goal achieved?

#### Step 4: Write Review
- Write to `_aegis-brain/sprints/sprint-<N>/review.md` using the Sprint Review
  Template from `skills/sprint-tracker.md`.
- Log to `_aegis-brain/logs/activity.log`:
  ```
  [YYYY-MM-DD HH:MM] SPRINT_REVIEW | sprint=<N> | completed=<pts>/<total> | goal=ACHIEVED/PARTIAL/NOT_ACHIEVED
  ```

#### Step 5: Display Summary
```
Sprint <N> Review

  Goal:       <sprint goal>
  Achieved:   YES / PARTIAL / NO
  Completed:  <pts> / <total> pts (<count> tasks)
  Incomplete: <pts> pts (<count> tasks — carry-over candidates)
  Outputs:    <count> deliverables produced

  Full report: _aegis-brain/sprints/sprint-<N>/review.md
```

---

### Subcommand: Sprint Retrospective

**When**: Last day of the sprint, after review. Integrates with `/aegis-retro`.

#### Step 1: Read Context
- Read `_aegis-brain/sprints/sprint-<N>/review.md`.
- Read `_aegis-brain/logs/activity.log` filtered to this sprint's date range.
- Read any blocker entries from daily standups.

#### Step 2: Generate Retro Sections
- **What went well**: Tasks ahead of schedule, effective collaboration, clean gates.
- **What went wrong**: Blockers, context overruns, failed QA gates, carry-over causes.
- **Action items**: Specific, assignable changes for next sprint (not vague).

#### Step 3: Write Retrospective
- Write to `_aegis-brain/sprints/sprint-<N>/retro.md` using the Sprint
  Retrospective Template from `skills/sprint-tracker.md`.
- Feed "What went wrong" and "Action items" into `/aegis-retro` for long-term
  storage in `_aegis-brain/learnings/`.

#### Step 4: Log
```
[YYYY-MM-DD HH:MM] SPRINT_RETRO | sprint=<N> | action_items=<count>
```

#### Step 5: Display Summary
```
Sprint <N> Retrospective

  Went well:    <count> items
  Went wrong:   <count> items
  Action items: <count> (assigned for sprint <N+1>)

  Lessons saved to _aegis-brain/learnings/
  Full report:  _aegis-brain/sprints/sprint-<N>/retro.md
```

---

### Subcommand: Sprint Status

**When**: Any time during a sprint. Quick burndown check.

#### Step 1: Read Current State
- Read `_aegis-brain/sprints/sprint-<N>/metrics.json` for committed points, completed points,
  daily_burndown history, and task status counts.
- Read `plan.md` for sprint duration and goal (metrics.json is the primary source for numeric data).
- Calculate the current sprint day from `metrics.json.started` and today's date.
- Calculate ideal remaining from committed_pts and sprint day.

#### Step 2: Display Burndown
```
Sprint <N> Status (Day <D> of <total>)

  DONE:         <count> tasks, <pts> pts
  IN_REVIEW:    <count> tasks, <pts> pts
  QA:           <count> tasks, <pts> pts
  IN_PROGRESS:  <count> tasks, <pts> pts
  TODO:         <count> tasks, <pts> pts

  Burndown:
    Completed:       <pts> / <total> pts (<pct>%)
    Remaining:       <pts> pts
    Ideal remaining: <pts> pts
    Delta:           <+/- pts>
    Status:          ON_TRACK / AT_RISK / OFF_TRACK

  Blockers: <count active blockers or "none">
```

No file is written for status — it is a read-only display. Do NOT write to metrics.json during this subcommand.

---

### Subcommand: Sprint Close

**When**: After review and retro are complete.

#### Step 1: Calculate Velocity
- Read `_aegis-brain/sprints/sprint-<N>/metrics.json` and all `meta.json` files where
  `sprint = "sprint-<N>"`.
- Sum `points` of all tasks with `status = DONE`. This is the sprint velocity (`completed_pts`).

#### Step 2: Calculate Rolling Average
- Read `velocity_history` from the current `metrics.json`.
- Append the current sprint's `completed_pts` to `velocity_history`.
- Keep only the last 5 entries (drop the oldest if length > 5).
- Rolling average = sum of velocity_history / len(velocity_history).
- This becomes the recommended capacity for sprint N+1.

#### Step 3: Handle Carry-Over
- For each task NOT in DONE (read from meta.json where sprint = "sprint-<N>" and status != DONE and status != CANCELLED):
  - Update `_aegis-brain/tasks/{ID}/meta.json`: set `sprint = null`, `status = "BACKLOG"`, `updated` to now.
  - Append to `_aegis-brain/tasks/{ID}/history.md`:
    ```
    | {timestamp} | captain-america | MOVED | {current_status} | BACKLOG | Carried over from sprint-<N> |
    ```
  - Also add it back to `_aegis-brain/backlog.md` (if that file is still in use) at the top of its
    priority tier, marked with `[carried from sprint-<N>]`.
- Populate `carry_over` in `metrics.json`: count, total points, and list of task IDs.
- Carry-over tasks must not be silently dropped.

#### Step 4: Write Close Report and Finalize Metrics
- Update `_aegis-brain/sprints/sprint-<N>/metrics.json`:
  - Set `actual_end` to today's date.
  - Set `completed_pts` to final velocity.
  - Update `velocity_history` (last 5 sprints, step 2).
  - Set final `tasks` counts from meta.json files.
  - Set `carry_over` object (step 3).
- Write to `_aegis-brain/sprints/sprint-<N>/close.md` using the Sprint Close
  Template from `skills/sprint-tracker.md`.

#### Step 5: Compute and Save Token Usage
- Read `_aegis-brain/metrics/token-usage.json`.
- For the closing sprint, compute:
  - `total_tokens`: sum of all task token estimates (from task history context % deltas x 200000).
  - `per_task_avg`: total_tokens / number_of_tasks.
  - `per_agent`: sum tokens by agent name from task history entries.
  - `per_phase`: sum tokens by phase (spec, build, review, qa, comply).
  - `tasks`: for each task, record tokens, points, and tokens_per_point.
- Append sprint entry to `sprints` object.
- Update `trend.tokens_per_point` array (append this sprint's avg tokens/point).
- Compute `trend.improvement_pct` vs sprint-1 baseline: `(1 - current/baseline) * 100`.
- Write updated `_aegis-brain/metrics/token-usage.json`.

#### Step 6: Compute and Save Performance Benchmarks
- Read `_aegis-brain/metrics/benchmarks.json`.
- For the closing sprint, compute:
  - **Speed**: time_per_point (from timestamps), gate_pass_rate (GATE_PASS / total gates), rework_rate (tasks sent back / total).
  - **Quality**: g1_first_pass (Black Panther first-pass %), g2_first_pass (War Machine first-pass %), critical_findings count, post_deploy_issues (PM.03 count).
  - **Efficiency**: tokens_per_point (from token-usage.json), cache_hit_rate (from skill cache stats if available), auto_learn_count (new patterns this sprint).
  - **Learning**: evolved_high (HIGH confidence patterns), anti_patterns (detected count), skill_evolutions (skill file updates).
- Save sprint entry to `sprints` object.
- If sprint-1 exists as baseline, compute `improvement_over_baseline`:
  - speed: `((baseline.time_per_point - current.time_per_point) / baseline.time_per_point) * 100`
  - quality: average improvement across quality metrics
  - efficiency: `((baseline.tokens_per_point - current.tokens_per_point) / baseline.tokens_per_point) * 100`
  - overall: geometric mean of improvements as multiplier (e.g., "4.1x")
- Write updated `_aegis-brain/metrics/benchmarks.json`.

#### Step 7: Display Benchmark Report
After saving metrics, display the benchmark comparison:
```
Performance Benchmark -- Sprint-<N> vs Sprint-1 (baseline)

Speed:
  Time/point:     <baseline> -> <current>   (<change>%)
  Gate pass rate:  <baseline> -> <current>   (<change>%)
  Rework rate:     <baseline> -> <current>   (<change>%)

Quality:
  G1 first-pass:   <baseline> -> <current>  (<change>%)
  G2 first-pass:   <baseline> -> <current>  (<change>%)
  Criticals:        <baseline> -> <current>  (<change>%)
  Post-deploy:      <baseline> -> <current>  (<change>%)

Efficiency:
  Tokens/point:   <baseline> -> <current>   (<change>%)
  Cache hit rate:  <baseline> -> <current>   (<change>)
  Auto-patterns:   <baseline> -> <current>   (<change>)

Overall improvement: <multiplier>x
```
If this is sprint-1, display: "Sprint-1 baseline recorded. Improvements tracked from sprint-2 onward."

#### Step 8: Log
```
[YYYY-MM-DD HH:MM] SPRINT_CLOSE | sprint=<N> | velocity=<pts> | rolling_avg=<pts> | carry_over=<count> tasks
```

Also update the `current` symlink to point to the new sprint if one is planned immediately,
or leave it pointing to the closed sprint until `/aegis-sprint plan` creates the next one.

#### Step 9: Display Summary
```
Sprint <N> Closed

  Velocity:         <pts> pts (<pct>% of committed)
  Rolling Average:  <pts> pts (last <N> sprints)
  Recommended Next: <rolling_avg * 0.9> pts capacity
  Carry-Over:       <count> tasks (<pts> pts) added back to backlog

  Close report: _aegis-brain/sprints/sprint-<N>/close.md
  Token usage:  _aegis-brain/metrics/token-usage.json
  Benchmarks:   _aegis-brain/metrics/benchmarks.json

  Ready for: /aegis-sprint plan (to start sprint <N+1>)
```

---

### Error Handling

- **No backlog exists** (plan): Create `_aegis-brain/backlog.md` with a header and prompt the user to add stories.
- **No active sprint** (standup/status/review/retro/close): Report "No active sprint found. Run `/aegis-sprint plan` first."
- **Sprint already closed** (close): Report "Sprint <N> is already closed."
- **Missing brain directory**: Create `_aegis-brain/sprints/` and `_aegis-brain/logs/` automatically.
- **Kanban write conflict**: Only Captain America writes to `kanban.md` and `meta.json` files. Other agents send StatusUpdate messages; Captain America performs the actual file writes.
- **Missing metrics.json**: If `metrics.json` is absent, recompute it from all task `meta.json` files in the sprint (see pm-state-protocol.md "Recomputing Sprint Metrics").
