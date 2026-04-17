---
name: work-breakdown
description: "Decompose user stories into a structured hierarchy — User Story, User Journey, Epic, Task, Subtask — with consistent IDs and output artifacts"
profile: standard
triggers:
  en: ["breakdown", "user story", "epic", "decompose", "work breakdown", "story map"]
  th: ["แตกงาน", "ยูสเซอร์สตอรี่", "อีพิค", "แยกย่อย"]
---

## Quick Reference

Structured decomposition of user-facing requirements into implementable work items. Follows a five-level hierarchy with consistent ID schemes.

- **Hierarchy**: User Story -> User Journey -> Epic -> Task -> Subtask
- **IDs**: US-NNN, J-NNN, E-NNN, T-NNN, ST-NNN
- **Output**: `_aegis-output/breakdown/<story-id>/`
- **Agent**: Iron Man (opus) — decomposition lead
- **Command**: `/aegis-breakdown "user story text"`

---

## Full Instructions

### Hierarchy Levels

| Level | ID Format | Description | Contains |
|-------|-----------|-------------|----------|
| User Story | US-NNN | A user-facing need in "As a... I want... So that..." format | 1+ User Journeys |
| User Journey | J-NNN | A sequence of steps a user takes to accomplish the story | 1+ Epics |
| Epic | E-NNN | A large body of work that delivers part of a journey | 1+ Tasks |
| Task | T-NNN | A single implementable work item (fits in one sprint) | 0+ Subtasks |
| Subtask | ST-NNN | A fine-grained step within a task (< 1 day of agent work) | — |

### ID Assignment Rules

- IDs are globally unique within the project. Never reuse an ID.
- To find the next available ID for any prefix, scan all files in `_aegis-output/breakdown/` and `_aegis-brain/backlog.md` for the highest existing number in that prefix, then increment.
- Zero-pad to 3 digits: `US-001`, `T-042`, `ST-117`.

### Decomposition Process

#### Step 1: Parse the User Story

Accept input in one of these formats:
- Full format: `"As a <persona>, I want <action> so that <benefit>"`
- Short format: `"<action or feature description>"`
- If short format, Iron Man infers the persona and benefit and writes the full format.

Assign the next available `US-NNN` ID.

#### Step 2: Identify User Journeys

For the given user story, identify the distinct user journeys — the different paths or flows a user takes.

Each journey is a linear sequence of user-visible steps from trigger to outcome.

**Rules**:
- A story must have at least 1 journey.
- Each journey gets a `J-NNN` ID.
- Journeys are ordered by priority (happy path first, edge cases later).

#### Step 3: Break Journeys into Epics

For each journey, identify the epics — large groupings of related work that deliver a coherent piece of the journey.

**Rules**:
- An epic should be completable within 1-3 sprints.
- Each epic gets an `E-NNN` ID.
- An epic with an estimated total > 40 story points should be split further.

#### Step 4: Break Epics into Tasks

For each epic, create the concrete tasks that agents will execute.

**Rules**:
- A task must be completable within a single sprint (max 13 points).
- Tasks > 13 points must be split into smaller tasks.
- Each task gets a `T-NNN` ID.
- Tasks are typed for agent assignment:
  - `arch` — architecture/design (Iron Man)
  - `impl` — implementation (Spider-Man)
  - `test` — test creation/execution (War Machine/Vision)
  - `review` — code review (Black Panther)
  - `ui` — UI/content work (Wasp/Songbird)
  - `doc` — documentation (Coulson)
  - `research` — investigation/spike (Loki)
  - `data` — data/analytics (Beast)
- Assign story points using the scale from `skills/sprint-tracker.md`.

#### Step 5: Break Tasks into Subtasks (Optional)

For tasks >= 5 points, break them down into subtasks for finer tracking.

**Rules**:
- Subtasks should be < 1 day of agent work each.
- Each subtask gets an `ST-NNN` ID.
- Subtasks inherit the type and assignee of their parent task unless overridden.

### Output Structure

All breakdown artifacts are written to `_aegis-output/breakdown/<US-NNN>/`:

```
_aegis-output/breakdown/US-001/
  summary.md          # Overview: story, journeys, epics, stats
  journeys/
    J-001.md          # Journey detail with epic list
    J-002.md
  epics/
    E-001.md          # Epic detail with task list
    E-002.md
  tasks.md            # Flat list of all tasks (for import into backlog)
  tree.md             # Visual tree of the full hierarchy
```

### Summary Template (`summary.md`)

```markdown
# Work Breakdown: US-NNN

**User Story**: As a <persona>, I want <action> so that <benefit>
**Created**: <YYYY-MM-DD>
**Decomposed by**: Iron Man

---

## Statistics

| Metric | Value |
|--------|-------|
| Journeys | <count> |
| Epics | <count> |
| Tasks | <count> |
| Subtasks | <count> |
| Total story points | <sum> |
| Estimated sprints | <pts / avg_velocity> |

---

## Hierarchy Tree

US-NNN: <story title>
  J-001: <journey name>
    E-001: <epic name> [<pts>pts]
      T-001: <task name> [<pts>pts] @<agent-type>
        ST-001: <subtask>
        ST-002: <subtask>
      T-002: <task name> [<pts>pts] @<agent-type>
    E-002: <epic name> [<pts>pts]
      T-003: <task name> [<pts>pts] @<agent-type>
  J-002: <journey name>
    E-003: <epic name> [<pts>pts]
      T-004: <task name> [<pts>pts] @<agent-type>

---

## Ready for Backlog

The flat task list in `tasks.md` can be appended to `_aegis-brain/backlog.md`
for sprint planning. Run `/aegis-kanban add` or let sprint planning pick them up.
```

### Tasks List Template (`tasks.md`)

```markdown
# Tasks from US-NNN

Ready to import into `_aegis-brain/backlog.md`.

| ID | Task | Points | Type | Agent | Epic | Dependencies | Priority |
|----|------|--------|------|-------|------|-------------|----------|
| T-001 | <description> | <pts> | impl | @spider-man | E-001 | none | P3 |
| T-002 | <description> | <pts> | test | @war-machine | E-001 | T-001 | P4 |
| T-003 | <description> | <pts> | arch | @iron-man | E-002 | none | P2 |
```

### Tree Template (`tree.md`)

```markdown
# Breakdown Tree: US-NNN

US-NNN: <story>
├── J-001: <journey>
│   ├── E-001: <epic> [<total_pts>pts]
│   │   ├── T-001: <task> [<pts>pts] @<type>
│   │   │   ├── ST-001: <subtask>
│   │   │   └── ST-002: <subtask>
│   │   └── T-002: <task> [<pts>pts] @<type>
│   └── E-002: <epic> [<total_pts>pts]
│       └── T-003: <task> [<pts>pts] @<type>
└── J-002: <journey>
    └── E-003: <epic> [<total_pts>pts]
        └── T-004: <task> [<pts>pts] @<type>
```

### Integration with Other Skills

- **Sprint Tracker** (`skills/sprint-tracker.md`): Tasks from `tasks.md` are imported into the backlog and selected during sprint planning.
- **Kanban Board** (`skills/kanban-board.md`): Tasks use `T-NNN` IDs consistent with `TASK-NNN` kanban IDs. When importing, map `T-NNN` to `TASK-NNN`.
- **Backlog**: Append tasks to `_aegis-brain/backlog.md` with their priority and dependencies intact.

### Validation Rules

Before finalizing the breakdown:

1. **Every journey must have at least one epic.**
2. **Every epic must have at least one task.**
3. **No task exceeds 13 story points.** If it does, split it.
4. **No epic exceeds 40 story points total.** If it does, split it.
5. **Dependencies are acyclic.** No circular dependency chains.
6. **All IDs are unique.** No duplicate IDs across the breakdown.
7. **Story points sum up correctly.** Epic total = sum of its tasks. Journey total = sum of its epics.

### Logging

After completing a breakdown, log to `_aegis-brain/logs/activity.log`:
```
[YYYY-MM-DD HH:MM] BREAKDOWN | story=US-NNN | journeys=<N> | epics=<N> | tasks=<N> | subtasks=<N> | total_pts=<pts>
```
