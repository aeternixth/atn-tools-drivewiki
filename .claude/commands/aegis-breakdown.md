---
name: aegis-breakdown
description: "Decompose a user story into journeys, epics, tasks, and subtasks using Iron Man sub-agent"
triggers:
  en: breakdown, decompose
  th: แตกงาน, แยกย่อย
---

# /aegis-breakdown

## Quick Reference
Break down a user story or feature description into a structured work hierarchy using the
Iron Man sub-agent. Produces ready-to-plan task lists that feed into sprint planning and the kanban board.

- **Skill**: `work-breakdown` (see `skills/work-breakdown.md` for full hierarchy rules)
- **Agent**: Iron Man (opus) — decomposition lead
- **Output**: `_aegis-output/breakdown/<US-NNN>/`

**Usage**:
```
/aegis-breakdown "As a user, I want to reset my password so that I can regain access"
/aegis-breakdown "Add dark mode support"
```

## Full Instructions

### Step 1: Parse Input

Accept the user story text from the command argument.

- If in full "As a... I want... So that..." format, use as-is.
- If in short format (just a feature description), Iron Man will infer and write the full user story format.
- If no argument provided, prompt: `Please provide a user story or feature description to break down.`

### Step 2: Assign Story ID

- Read `_aegis-brain/counters.json`. If it does not exist, create it (see `.claude/references/pm-state-protocol.md`).
- Increment the `US` counter and write the updated `counters.json` with the current timestamp.
- Derive the user story ID: `PROJ-US-NNN` (zero-padded to 3 digits).
- Continue to also create the legacy `_aegis-output/breakdown/US-NNN/` output path for backward compatibility.

### Step 3: Spawn Iron Man for Decomposition

Delegate to the Iron Man sub-agent with the `work-breakdown` skill loaded:

```
Iron Man, decompose this user story using the work-breakdown skill:

Story: <full user story text>
ID: PROJ-US-NNN

Follow the 5-step decomposition process:
1. Parse the user story
2. Identify user journeys (PROJ-J-NNN) — increment J counter in counters.json per journey
3. Break journeys into epics (PROJ-E-NNN) — increment E counter per epic
4. Break epics into tasks (PROJ-T-NNN) with types and point estimates — increment T counter per task
5. Optionally break tasks >= 5pts into subtasks (PROJ-ST-NNN) — increment ST counter per subtask

For EACH entity created, after incrementing its counter:
- Create directory: _aegis-brain/tasks/{ID}/
- Write meta.json with all required fields (follow .claude/references/pm-state-protocol.md)
  - parent: set to the direct parent entity's ID
  - children: populate on the parent's meta.json as each child is created
  - status: "BACKLOG", assignee: "unassigned", sprint: null
  - priority: "high" for first-journey tasks, "medium" otherwise
- Write history.md with the CREATED entry
- Write empty comments.md with the header block

Write breakdown output to: _aegis-output/breakdown/PROJ-US-NNN/
Validate against all rules before finalizing.
```

### Step 4: Validate Output

After Iron Man completes, verify:

1. Directory `_aegis-output/breakdown/PROJ-US-NNN/` exists with required files:
   - `summary.md` — overview with stats and hierarchy tree
   - `journeys/J-NNN.md` — one file per journey
   - `epics/E-NNN.md` — one file per epic
   - `tasks.md` — flat task list ready for backlog import
   - `tree.md` — visual hierarchy tree
2. No task exceeds 13 story points.
3. No epic exceeds 40 story points total.
4. All IDs are unique and properly formatted.
5. Dependencies are acyclic.

If validation fails, report the issues and ask Iron Man to fix them.

### Step 5: Display Summary

Show the breakdown summary to the human:

```
BREAKDOWN COMPLETE — PROJ-US-NNN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Story: As a <persona>, I want <action> so that <benefit>

Journeys:  <N>
Epics:     <N>
Tasks:     <N>
Subtasks:  <N>
Total pts: <sum>
Est sprints: <pts / avg_velocity>

Tree:
PROJ-US-NNN: <story>
├── PROJ-J-001: <journey>
│   ├── PROJ-E-001: <epic> [<pts>pts]
│   │   ├── PROJ-T-001: <task> [<pts>pts] @<type>
│   │   └── PROJ-T-002: <task> [<pts>pts] @<type>
│   └── PROJ-E-002: <epic> [<pts>pts]
│       └── PROJ-T-003: <task> [<pts>pts] @<type>
└── PROJ-J-002: <journey>
    └── PROJ-E-003: <epic> [<pts>pts]
        └── PROJ-T-004: <task> [<pts>pts] @<type>

Output: _aegis-output/breakdown/PROJ-US-NNN/
Tasks ready for backlog: _aegis-output/breakdown/PROJ-US-NNN/tasks.md

Next: Run sprint planning to pull tasks into backlog,
      or use /aegis-kanban add to add individual tasks.
```

### Step 6: Log

Append to `_aegis-brain/logs/activity.log`:
```
[YYYY-MM-DD HH:MM] BREAKDOWN | story=PROJ-US-NNN | journeys=<N> | epics=<N> | tasks=<N> | subtasks=<N> | total_pts=<pts>
```

Verify PM state files were written correctly:
- `_aegis-brain/counters.json` — reflects final counter values after all entities
- `_aegis-brain/tasks/PROJ-US-NNN/` — user story meta.json, history.md, comments.md
- `_aegis-brain/tasks/PROJ-J-NNN/` — one directory per journey
- `_aegis-brain/tasks/PROJ-E-NNN/` — one directory per epic
- `_aegis-brain/tasks/PROJ-T-NNN/` — one directory per task
- `_aegis-brain/tasks/PROJ-ST-NNN/` — one directory per subtask (if any)

### Error Handling

- **Empty input**: Prompt for a user story or feature description.
- **Iron Man unavailable**: Fall back to Captain America performing the decomposition directly using the `work-breakdown` skill.
- **Output directory conflict**: The counter protocol prevents ID collisions. If a task directory already exists (recovery scenario), increment the counter past the conflicting ID.
- **Validation failure**: Report specific issues, retry decomposition with corrections.
- **Very large story (> 100 estimated points)**: Suggest splitting into multiple user stories before breakdown.
