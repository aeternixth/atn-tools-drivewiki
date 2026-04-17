---
name: sprint-manager
description: "Full scrum ceremony management — sprint planning, daily standup, sprint review, sprint retrospective, velocity tracking, and carry-over"
profile: standard
triggers:
  en: ["sprint", "scrum", "ceremony", "standup", "sprint planning", "sprint review", "sprint retro", "velocity"]
  th: ["สปรินต์", "สครัม", "สแตนอัพ", "วางแผนสปรินต์"]
---

## Quick Reference

Full scrum lifecycle management: planning ceremonies, daily standups, reviews, retrospectives, velocity tracking, and carry-over.

- **Plan**: Select stories from backlog, estimate capacity, assign to agents, initialize kanban
- **Standup**: Auto-generated from agent activity logs in `_aegis-brain/logs/`
- **Review**: Summarize completed work, link to outputs in `_aegis-output/`
- **Retro**: What went well / what to improve / action items (integrates with `/aegis-retro`)
- **Close**: Calculate velocity, carry over incomplete tasks, update rolling average
- **Sprint data**: `_aegis-brain/sprints/sprint-<N>/`
- **Agent**: Captain America (opus) — ceremony facilitator and orchestrator

---

## Full Instructions

### Sprint Directory Structure

Each sprint lives in `_aegis-brain/sprints/sprint-<N>/`:

```
_aegis-brain/sprints/sprint-<N>/
  plan.md          # Sprint goal, stories, capacity, assignments
  kanban.md        # Kanban board state (source of truth for task status)
  daily/
    YYYY-MM-DD.md  # Daily standup record
  review.md        # Sprint review summary (end of sprint)
  retro.md         # Sprint retrospective (action items)
  close.md         # Sprint close report — velocity, carry-over
```

---

### Ceremony 1: Sprint Planning (Day 1)

#### Inputs
- `_aegis-brain/backlog.md` — prioritized product backlog
- `_aegis-brain/sprints/sprint-<N-1>/close.md` — velocity from previous sprint (if exists)
- Any carry-over tasks from the previous sprint

#### Process

**Step 1: Determine Capacity**
- Read rolling average velocity from velocity history (see Velocity Tracking section).
- If no history exists, use a default starting capacity of 20 points.
- Recommended capacity = rolling average * 0.9 (10% buffer for unknowns).

**Step 2: Select Stories**
- Read backlog, sorted by priority (P0 highest).
- Select stories from the top of the backlog until capacity is reached.
- Carry-over tasks from the previous sprint take priority over new backlog items.
- Do not exceed 100% capacity. Aim for 85-95% load.

**Step 3: Assign to Agents**
- Map each selected task to the appropriate agent based on its type:
  - Architecture / design work → @iron-man
  - Implementation / code → @spider-man
  - Code review / security → @black-panther
  - UI / content → @wasp or @songbird
  - Test planning → @war-machine
  - Test execution → @vision
  - Document generation → @coulson
  - Research / adversarial → @loki
  - Data / analytics → @beast

**Step 4: Create Sprint Plan**
- Write `_aegis-brain/sprints/sprint-<N>/plan.md` using the template below.
- Initialize `_aegis-brain/sprints/sprint-<N>/kanban.md` with all sprint tasks in the TODO column (see kanban template in Ceremony 1 outputs).

**Step 5: Log and Notify**
- Append to `_aegis-brain/logs/activity.log`:
  ```
  [YYYY-MM-DD HH:MM] SPRINT_START | sprint=<N> | capacity=<pts> | stories=<count> | load=<pct>%
  ```

#### Sprint Plan Template

```markdown
# Sprint Plan: Sprint <N>

**Sprint Goal**: <one-sentence sprint goal — what is the team trying to achieve?>
**Duration**: <YYYY-MM-DD> to <YYYY-MM-DD> (<N> days)
**Capacity**: <total story points available>
**Load**: <committed points> / <capacity> = <pct>%

---

## Sprint Backlog

| ID | Story / Task | Points | Assignee | Priority | Dependencies | Status |
|----|-------------|--------|----------|----------|-------------|--------|
| T-001 | <task description> | <pts> | @<agent> | P<N> | none | TODO |
| T-002 | <task description> | <pts> | @<agent> | P<N> | T-001 | TODO |

**Total Committed Points**: <sum>

---

## Carry-Over from Sprint <N-1>

| ID | Story / Task | Points | Original Sprint | Reason Not Completed |
|----|-------------|--------|-----------------|---------------------|
| T-XXX | <task> | <pts> | sprint-<N-1> | <reason> |

*(Empty if this is sprint 1 or there are no carry-overs)*

---

## Capacity Calculation

| Factor | Value |
|--------|-------|
| Rolling average velocity | <pts> |
| Recommended capacity (avg * 0.9) | <pts> |
| Actual committed points | <pts> |
| Load | <pct>% |

---

## Risks and Dependencies

| Risk | Affected Task | Impact | Mitigation |
|------|--------------|--------|------------|
| <risk> | T-XXX | <impact> | <plan> |

---

## Definition of Done

- [ ] Code complete and passing lint / standards checks
- [ ] Unit tests written and passing
- [ ] Code review approved by @black-panther (Gate 1)
- [ ] QA verdict PASS from @war-machine (Gate 2) — for tasks >= 3 pts
- [ ] Documentation updated if user-facing behavior changed
- [ ] Kanban status updated to DONE
- [ ] Relevant ISO 29110 docs updated by @coulson (Gate 3) — if compliance mode active
```

#### Initial Kanban Template (written to `kanban.md`)

```markdown
# Kanban Board: Sprint <N>

Last updated: <YYYY-MM-DD HH:MM> by Captain America

## BACKLOG
*(tasks not yet in this sprint)*

## TODO
- [ ] T-001: <description> [<pts>pts] @<agent>
- [ ] T-002: <description> [<pts>pts] @<agent>

## IN_PROGRESS
*(none)*

## IN_REVIEW
*(none)*

## QA
*(none)*

## DONE
*(none)*
```

---

### Ceremony 2: Daily Standup (Every Day)

The standup is auto-generated from agent activity. Captain America reads the logs and produces the standup — no manual input required from the team.

#### Process

**Step 1: Read Activity Logs**
- Read `_aegis-brain/logs/activity.log` — filter entries from the last 24 hours.
- Read any StatusUpdate messages written by agents in the last 24 hours.
- Check kanban.md for column transitions that happened since the last standup.

**Step 2: Identify Blockers**
- Scan log entries for BLOCKED, FAILURE, ERROR, or STALLED markers.
- Check for tasks that have been in IN_PROGRESS for more than 1 day without a log entry.

**Step 3: Calculate Burndown**
- Count points in DONE column of kanban.md — this is points completed.
- Count points in TODO + IN_PROGRESS + IN_REVIEW + QA — this is points remaining.
- Calculate ideal remaining: `(total_points * (days_remaining / total_sprint_days))`.
- Determine on-track status.

**Step 4: Write Standup File**
- Write to `_aegis-brain/sprints/sprint-<N>/daily/YYYY-MM-DD.md`.

#### Daily Standup Template

```markdown
# Daily Standup: <YYYY-MM-DD>

**Sprint**: <N> | **Day**: <D> of <total_days> | **Generated by**: Captain America (auto)

---

## Agent Updates

### @<agent-name>
- **Yesterday**: <what was done — from log entries>
- **Today**: <what is in IN_PROGRESS on kanban>
- **Blockers**: <none / description>

*(repeat for each active agent)*

---

## Burndown

| Metric | Value |
|--------|-------|
| Total sprint points | <pts> |
| Points completed (DONE) | <pts> |
| Points remaining | <pts> |
| Ideal remaining at this point | <pts> |
| Delta (actual vs ideal) | <+/- pts> |
| Status | ON_TRACK / AT_RISK / OFF_TRACK |

**Status thresholds**:
- ON_TRACK: actual remaining <= ideal + 10%
- AT_RISK: actual remaining > ideal + 10% but < ideal + 25%
- OFF_TRACK: actual remaining > ideal + 25%

---

## Blockers Requiring Attention

| Blocker | Affected Task | Owner | Action Needed |
|---------|-------------|-------|--------------|
| <description> | T-XXX | @<agent> | <escalation or action> |

*(Empty if no blockers)*

---

## Kanban Transitions Since Last Standup

| Task | From | To | Agent | Time |
|------|------|----|-------|------|
| T-XXX | IN_PROGRESS | IN_REVIEW | @spider-man | <timestamp> |

---

## Notes

<Any notable context from Nick Fury or Captain America>
```

---

### Ceremony 3: Sprint Review (Last Day, Before Retro)

The sprint review summarizes completed work and links to all outputs produced. It is written by Captain America and acts as the formal demo record.

#### Process

**Step 1: Collect Completed Work**
- Read kanban.md — list all tasks in the DONE column.
- For each DONE task, find its corresponding output:
  - Implementation tasks → `src/` or relevant code paths
  - Spec tasks → `_aegis-output/specs/`
  - Architecture tasks → `_aegis-output/architecture/`
  - QA tasks → `_aegis-output/qa/sprint-<N>/`
  - Breakdown tasks → `_aegis-output/breakdown/`

**Step 2: Collect Incomplete Work**
- List all tasks NOT in DONE — these are carry-over candidates.
- Note which column each is in (IN_PROGRESS, IN_REVIEW, QA, or TODO).

**Step 3: Compare to Sprint Goal**
- Re-read the sprint goal from `plan.md`.
- Assess: was the goal achieved? (YES / PARTIAL / NO)
- A PARTIAL is still valuable — document what was achieved vs what was not.

**Step 4: Write Review**
- Write to `_aegis-brain/sprints/sprint-<N>/review.md`.
- Log to `_aegis-brain/logs/activity.log`:
  ```
  [YYYY-MM-DD HH:MM] SPRINT_REVIEW | sprint=<N> | completed=<pts>/<total> | goal=ACHIEVED/PARTIAL/NOT_ACHIEVED
  ```

#### Sprint Review Template

```markdown
# Sprint Review: Sprint <N>

**Date**: <YYYY-MM-DD>
**Sprint Goal**: <goal from plan.md>
**Goal Achieved**: YES / PARTIAL / NO
**Facilitator**: Captain America

---

## Completed Work

| ID | Task | Points | Assignee | Output / Deliverable |
|----|------|--------|----------|---------------------|
| T-001 | <description> | <pts> | @spider-man | [link or path to output] |

**Total Points Completed**: <pts>

---

## Incomplete Work (Carry-Over Candidates)

| ID | Task | Points | Current Status | Reason |
|----|------|--------|---------------|--------|
| T-005 | <description> | <pts> | IN_PROGRESS | <why not done> |

**Total Points Incomplete**: <pts>

---

## Outputs Produced This Sprint

- `_aegis-output/...` — <description>
- `_aegis-output/...` — <description>

---

## Sprint Goal Assessment

<One paragraph: was the goal met? What was the meaningful outcome? What was left undone and why?>

---

## Notes for Retrospective

<Items that surfaced during the review that should be discussed in the retro — process issues, surprises, improvements>
```

---

### Ceremony 4: Sprint Retrospective (Last Day, After Review)

The sprint retrospective is the process-improvement ceremony. It runs as part of or immediately after `/aegis-retro` and produces action items for the next sprint.

#### Process

**Step 1: Read Review and Activity Logs**
- Read `_aegis-brain/sprints/sprint-<N>/review.md` for context.
- Read `_aegis-brain/logs/activity.log` filtered to this sprint.
- Read any friction points recorded during the sprint.

**Step 2: Generate Retro Sections**
- **What went well**: Tasks completed ahead of time, processes that worked, effective agent collaboration, clean outputs.
- **What went wrong**: Blockers that stalled tasks, context overruns, unclear specs, failed QA gates, carry-over.
- **Action items**: Specific, assignable changes for the next sprint (not vague platitudes).

**Step 3: Write Retrospective**
- Write to `_aegis-brain/sprints/sprint-<N>/retro.md`.
- Also feed the "What went wrong" and "Action items" sections into the `/aegis-retro` diary step so lessons are preserved in `_aegis-brain/learnings/`.

**Step 4: Log**
- Append to `_aegis-brain/logs/activity.log`:
  ```
  [YYYY-MM-DD HH:MM] SPRINT_RETRO | sprint=<N> | action_items=<count>
  ```

#### Sprint Retrospective Template

```markdown
# Sprint Retrospective: Sprint <N>

**Date**: <YYYY-MM-DD>
**Facilitator**: Captain America
**Participants**: <list active agents this sprint>

---

## What Went Well

- <item — be specific, not generic>
- <item>
- <item>

---

## What Went Wrong

- <item — include root cause if known>
- <item>
- <item>

---

## Action Items

| # | Action | Owner | Target Sprint |
|---|--------|-------|--------------|
| 1 | <specific, actionable change> | @<agent or Captain America> | Sprint <N+1> |
| 2 | <specific, actionable change> | @<agent or Captain America> | Sprint <N+1> |

---

## Retrospective Notes

<Any additional context, patterns noticed across sprints, or meta-observations>

---

## Carry Into /aegis-retro

The following friction points and lessons from this sprint have been passed to `/aegis-retro` for long-term storage in `_aegis-brain/learnings/`:

- <lesson 1>
- <lesson 2>
```

---

### Sprint Close

#### Process

**Step 1: Calculate Velocity**
- Count total points in the DONE column of kanban.md.
- This is the sprint's velocity.

**Step 2: Calculate Rolling Average**
- Read `close.md` from the last 5 sprints (or however many exist).
- Rolling average = sum of completed points across those sprints / number of sprints.
- This rolling average becomes the recommended capacity for sprint N+1.

**Step 3: Handle Carry-Over**
- For each task NOT in DONE: add it back to `_aegis-brain/backlog.md` at the top of the appropriate priority tier.
- Mark it with a carry-over indicator: `[carried from sprint-<N>]`.
- Do not lose carry-over tasks — they must be explicitly re-triaged or re-planned.

**Step 4: Write Close Report**
- Write to `_aegis-brain/sprints/sprint-<N>/close.md`.

**Step 5: Log**
- Append to `_aegis-brain/logs/activity.log`:
  ```
  [YYYY-MM-DD HH:MM] SPRINT_CLOSE | sprint=<N> | velocity=<pts> | rolling_avg=<pts> | carry_over=<count> tasks
  ```

#### Sprint Close Template

```markdown
# Sprint Close: Sprint <N>

**Date**: <YYYY-MM-DD>
**Sprint Duration**: <start> to <end> (<N> days)
**Sprint Goal**: <goal> — Achieved: YES / PARTIAL / NO

---

## Velocity

| Metric | Value |
|--------|-------|
| Committed points | <pts> |
| Completed points | <pts> |
| Completion rate | <pct>% |
| Carry-over tasks | <count> |
| Carry-over points | <pts> |

---

## Velocity History (Rolling Average)

| Sprint | Committed | Completed | Rate |
|--------|-----------|-----------|------|
| <N> | <pts> | <pts> | <pct>% |
| <N-1> | <pts> | <pts> | <pct>% |
| <N-2> | <pts> | <pts> | <pct>% |
| <N-3> | <pts> | <pts> | <pct>% |
| <N-4> | <pts> | <pts> | <pct>% |

**Rolling Average Velocity**: <pts>
**Recommended Sprint <N+1> Capacity**: <rolling_avg * 0.9> points

---

## Carry-Over Tasks (Added Back to Backlog)

| ID | Task | Points | Reason | New Backlog Priority |
|----|------|--------|--------|---------------------|
| T-XXX | <description> | <pts> | <reason> | P<N> |

*(Empty if all tasks completed)*

---

## Artifacts Produced This Sprint

- `_aegis-brain/sprints/sprint-<N>/plan.md`
- `_aegis-brain/sprints/sprint-<N>/kanban.md`
- `_aegis-brain/sprints/sprint-<N>/daily/*.md` (<count> standup records)
- `_aegis-brain/sprints/sprint-<N>/review.md`
- `_aegis-brain/sprints/sprint-<N>/retro.md`
- <any additional outputs from `_aegis-output/`>
```

---

### Story Point Scale

| Points | Complexity | Agent Time Estimate | Example |
|--------|-----------|--------------------|---------|
| 1 | Trivial | < 1 agent-hour | Config change, copy update, single-file fix |
| 2 | Simple | 1-2 agent-hours | Small bug fix, add a field, update a template |
| 3 | Small | 2-4 agent-hours | New endpoint, simple feature, basic test suite |
| 5 | Medium | 4-8 agent-hours | Feature with tests and review, integration work |
| 8 | Large | 1-2 agent-days | Complex feature, significant refactoring |
| 13 | Very Large | 2-4 agent-days | Major feature, cross-module changes |
| 21 | Epic | Should be broken down | Run `/aegis-breakdown` first |

---

### Velocity Tracking

Velocity data is the source of truth for capacity planning. It lives in the `close.md` of each sprint.

**Rules**:
- Only count points for tasks in the DONE column at sprint close time. Partially completed work counts as zero.
- Rolling average uses the last 5 sprints. If fewer than 5 sprints exist, use all available.
- First sprint has no history — use 20 points as the default starting capacity.
- After a sprint with unusual circumstances (holiday, blocked dependencies, major pivot), note it as an anomaly and weight it less in future averages.

---

### Kanban Transition Rules

Tasks move through columns with these rules:

| Transition | Condition | Who Moves It |
|-----------|-----------|-------------|
| BACKLOG → TODO | Sprint planning assigns it | Captain America at sprint start |
| TODO → IN_PROGRESS | Agent picks it up | Captain America (on agent's behalf) |
| IN_PROGRESS → IN_REVIEW | Agent completes implementation | Spider-Man / implementing agent |
| IN_REVIEW → QA | Black Panther approves code review (Gate 1 PASS) | Black Panther |
| IN_REVIEW → IN_PROGRESS | Black Panther rejects code review (Gate 1 FAIL) | Black Panther |
| QA → DONE | War Machine approves QA verdict (Gate 2 PASS) | War Machine |
| QA → IN_PROGRESS | War Machine fails QA verdict (Gate 2 FAIL, with findings) | War Machine |
| Any → TODO | Task becomes blocked | Captain America |

**WIP Limits**:
- IN_PROGRESS: max 3 tasks at once
- IN_REVIEW: max 2 tasks at once

If WIP limit is hit, agents must complete in-flight work before picking up new tasks.

**Single-writer rule**: Only Captain America writes to `kanban.md`. All other agents send a StatusUpdate message; Captain America performs the actual column move. This prevents concurrent write conflicts.
