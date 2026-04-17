# PM State Protocol — Task Lifecycle, Handoffs, Learning & Intelligence

> Reference for: aegis-breakdown, aegis-kanban, aegis-sprint, aegis-qa, all agents
> All commands that create or mutate tasks MUST follow this protocol.

---

## Creating a Task

1. Read `_aegis-brain/counters.json`. If the file does not exist, create it:
   ```json
   {
     "project_key": "PROJ",
     "counters": { "US": 0, "J": 0, "E": 0, "T": 0, "ST": 0, "DOC": 0, "HO": 0 },
     "last_updated": "<current ISO 8601 timestamp>"
   }
   ```
2. Increment the appropriate counter (US/J/E/T/ST/DOC).
3. Write updated `counters.json` with `last_updated`.
4. Derive ID: `{project_key}-{TYPE}-{NNN}` (zero-padded 3 digits, extends to 4 if >999).
5. Create directory: `_aegis-brain/tasks/{ID}/`
6. Write `meta.json` (see schema below).
7. Write initial `history.md` with CREATED entry.
8. Write empty `comments.md` with header block.

---

## meta.json Schema

```json
{
  "id": "PROJ-T-001",
  "title": "string",
  "type": "user_story|journey|epic|task|subtask|doc",
  "task_type": "arch|impl|test|review|ui|doc|research|data",
  "parent": "PROJ-E-001 or null",
  "children": [],
  "status": "BACKLOG|TODO|IN_PROGRESS|IN_REVIEW|QA|DONE|BLOCKED|CANCELLED",
  "assignee": "agent_name or unassigned",
  "points": 3,
  "priority": "critical|high|medium|low",
  "labels": [],
  "dependencies": { "blocks": [], "blocked_by": [] },
  "created": "ISO 8601",
  "updated": "ISO 8601",
  "sprint": null,
  "time_tracking": { "estimated_hours": null, "logged_hours": 0 }
}
```

- `task_type` required only when `type` is `task`.
- `points` must be Fibonacci: 1, 2, 3, 5, 8, or 13.

---

## Valid Status Transitions

```
BACKLOG -> TODO -> IN_PROGRESS -> IN_REVIEW -> QA -> DONE
                       ^              |         |
                       |              v         |
                       +---- REJECTED ----------+
                       |
                  BLOCKED  (from any active status)
                  CANCELLED (from any status, terminal)
```

---

## Moving a Task (State Transition)

1. Read `_aegis-brain/tasks/{ID}/meta.json`.
2. Validate transition against the table above.
3. Check WIP limits from all `meta.json` files in current sprint.
4. Update `status` and `updated` in `meta.json`.
5. Append to `history.md`:
   ```
   | {timestamp} | {agent} | MOVED | {from_status} | {to_status} | {note} |
   ```
6. Recompute `_aegis-brain/sprints/sprint-N/metrics.json`.
7. Regenerate `_aegis-brain/sprints/sprint-N/kanban.md` (derived view).
8. Append to `_aegis-brain/logs/activity.log`.

---

## history.md Format

```markdown
## {ID} History
| Timestamp | Agent | Action | From | To | Note |
|-----------|-------|--------|------|----|------|
```

Action types: CREATED, MOVED, ASSIGNED, COMMENT, POINTS_CHANGED, PRIORITY_CHANGED, DEPENDENCY_ADDED, DEPENDENCY_REMOVED, SPRINT_ASSIGNED, GATE_PASS, GATE_FAIL, TIME_LOGGED, LABEL_CHANGED, HANDOFF, CORRECTION, SYNC

### APPEND-ONLY Rule (NEVER violate)

history.md is an **immutable audit log**. Every entry is permanent evidence of what happened.

```
RULES:
  1. NEVER edit or delete existing rows in history.md
  2. NEVER reorder rows — new entries go at the BOTTOM only
  3. Timestamps MUST be monotonically increasing (each >= previous)
  4. To correct a mistake: append a CORRECTION row (do NOT edit the original)
     Example: | 2026-03-30 12:00 | Navi | CORRECTION | — | — | Fixes row at 11:45: status was IN_REVIEW not TODO |
  5. To sync after a conflict: append a SYNC row
     Example: | 2026-03-30 12:05 | Mother Brain | SYNC | — | DONE | Reconciled from meta.json after agent conflict |
  6. If history.md and meta.json disagree on status, meta.json is the source of truth.
     Append a SYNC row to history.md to reconcile.
```

**Integrity check (run by Mother Brain on session start):**
```
FOR each task in _aegis-brain/tasks/:
  1. Read history.md last row → extract "To" status
  2. Read meta.json → extract "status"
  3. IF mismatch → append SYNC row to history.md, update meta.json timestamp
  4. Check timestamps are monotonically increasing
  5. IF out of order → log warning to activity.log (do NOT reorder)
```

---

## comments.md Format

```markdown
## {ID} Comments
---
**{YYYY-MM-DD HH:MM}** | @{agent}
{comment text}
```

---

## Recording Gate Results

Append to history.md: `| {timestamp} | {agent} | GATE_PASS/GATE_FAIL | - | {gate_number} | {summary} |`
If gate produced findings, also append a comment to comments.md.

---

## Regenerating Kanban Board

`_aegis-brain/sprints/current/kanban.md` is a DERIVED VIEW. After any state change:
1. Read all `meta.json` where `sprint` = current sprint.
2. Group by `status`.
3. Write to `_aegis-brain/sprints/sprint-N/kanban.md`.

---

## Recomputing Sprint Metrics

After any task status change: count by status, sum completed/remaining points, update daily_burndown, write `metrics.json`.

---

## Handoff Protocol

Every team transition MUST use a HandoffEnvelope to carry context forward.

### HandoffEnvelope Schema

```json
{
  "id": "HO-{counter}",
  "timestamp": "ISO 8601",
  "from_team": "build|review|qa|compliance|devops",
  "to_team": "build|review|qa|compliance|devops",
  "task_id": "PROJ-T-NNN",
  "status": "READY_FOR_REVIEW|READY_FOR_QA|READY_FOR_COMPLIANCE|READY_FOR_DEPLOY|REJECTED",
  "artifacts": ["relative/path/to/file"],
  "gate_results": { "gate_1": "PASS|FAIL|PENDING", "gate_2": "...", "gate_3": "..." },
  "notes": "summary",
  "rejection_reason": "required if REJECTED"
}
```

### Valid Handoff Routes

```
BUILD -> REVIEW -> QA -> COMPLIANCE -> DEVOPS -> MONITOR -> BACKLOG
Any stage can REJECT back to BUILD.
```

### Gate-to-Handoff Mapping

| Gate | Boundary | Pass Status | Fail Status |
|------|----------|-------------|-------------|
| G1 (Code Review) | Build -> QA | READY_FOR_QA | REJECTED |
| G2 (QA Verdict) | QA -> Compliance | READY_FOR_COMPLIANCE | REJECTED |
| G3 (Compliance) | Compliance -> DevOps | READY_FOR_DEPLOY | REJECTED |
| G4 (Deploy Health) | Deploy -> Monitor | (internal) | Rollback + REJECTED |
| G5 (Post-Deploy) | Monitor -> Stable | Complete | Hotfix to backlog |

### Handoff Storage

`_aegis-brain/handoffs/HO-NNN.json` — counter managed in `counters.json` under `HO` key.

### Creating a Handoff

1. Validate route against routing table.
2. Collect and verify all artifacts exist.
3. Evaluate gate if crossing gate boundary.
4. Write envelope to `_aegis-brain/handoffs/HO-{NNN}.json`.
5. Update task history.md with HANDOFF action.
6. Update task status in meta.json.
7. Notify receiving team.

### Rejection Rules

- `rejection_reason` must be specific enough for Build team to act without reading every artifact.
- Task status moves back to IN_PROGRESS.
- Findings appended to task's comments.md.

---

## Auto-Learn Protocol

Automatic knowledge extraction when tasks complete. No human input needed.

### Trigger

When a task's `meta.json` status changes to DONE (after all gates pass).

### Auto-Extract Steps

1. **Pattern Detection**: Read task's `history.md`, extract time per phase, gate retry count, issue finder agent, fix type.
2. **Skill Match**: Map task to skills via `task_type` and `labels`.
3. **Auto-Write Learning**: Append to `_aegis-brain/learnings/auto-learned.md`:
   ```
   ### LEARN-{counter} | {YYYY-MM-DD} | {task_id}
   - **Task**: {title} [{points}pts]
   - **Duration**: {total_time}
   - **Gate retries**: G1:{n}, G2:{n}, G3:{n}
   - **Pattern**: {detected_pattern}
   - **Insight**: {auto-generated insight}
   - **Action**: {what to do differently}
   ```
4. **Pattern Promotion**: Same pattern 3+ times -> promote to `_aegis-brain/resonance/evolved-patterns.md` as PROVEN.
5. **Anti-Pattern Detection**: Gate fails 2+ times for similar reasons -> add to `_aegis-brain/resonance/anti-patterns.md`.

---

## Shared Intelligence (Skill Cache)

One agent learns -> ALL agents benefit. Location: `_aegis-brain/skill-cache/`

### Write to Cache (after task completion)

Only cache generally applicable insights (not task-specific). Categories:

| Category | File |
|----------|------|
| CODE_PATTERN | `_aegis-brain/skill-cache/CODE_PATTERN.md` |
| REVIEW_PATTERN | `_aegis-brain/skill-cache/REVIEW_PATTERN.md` |
| TEST_PATTERN | `_aegis-brain/skill-cache/TEST_PATTERN.md` |
| ARCH_PATTERN | `_aegis-brain/skill-cache/ARCH_PATTERN.md` |
| SECURITY_PATTERN | `_aegis-brain/skill-cache/SECURITY_PATTERN.md` |

Format: `### SC-{counter} | {date} | Source: {agent} | Task: {task_id}`

### Confidence Escalation

```
1st occurrence: LOW | 2nd validation: MEDIUM | 3rd validation: HIGH (auto-apply)
Contradiction (caused issue): DEMOTE by 1 level
```

### Read from Cache (at task start)

- `impl` -> CODE_PATTERN, ARCH_PATTERN, SECURITY_PATTERN
- `review` -> REVIEW_PATTERN, SECURITY_PATTERN
- `test` -> TEST_PATTERN, CODE_PATTERN
- All tasks -> always read SECURITY_PATTERN

Stats: `_aegis-brain/skill-cache/stats.json` (total_patterns, confidence counts, cache_hits/misses)

---

## Skill Evolution Engine

Skills evolve based on usage data. Triggered every 5 tasks that use a skill.

### Evolution Process

1. Read the skill file.
2. Read learnings tagged to that skill from `auto-learned.md`.
3. Read skill-cache patterns and anti-patterns.
4. Generate update: add new checklist items, remove zero-value steps, reorder by effectiveness, add "Common Pitfalls".
5. Write updated skill with version bump: `<!-- Evolved: v{N} | {date} | Based on {M} tasks -->`

### Evolution Constraints (HARD LIMITS)

1. NEVER remove safety-critical steps (security, gate validation, error handling).
2. NEVER change ISO 29110 required outputs.
3. MAX 3 changes per evolution.
4. All evolutions logged to `_aegis-brain/skill-cache/evolution-log.md`.
5. Human can freeze a skill: `<!-- FROZEN: do not evolve -->`

### Skill Usage Mapping

| task_type | Primary skill |
|-----------|--------------|
| impl | code patterns | test | qa-pipeline | review | code-review |
| arch | architecture | ui | frontend | doc | documentation | research | analysis |

---

## Knowledge Pipeline

```
TASK DONE -> AUTO-EXTRACT -> DISTILL -> PROPAGATE -> ALL AGENTS
```

1. **Raw Capture** (every task): Write to `_aegis-brain/learnings/raw/YYYY-MM-DD.md`
2. **Pattern Extraction** (every 3 tasks): Find recurring patterns -> write to skill-cache
3. **Knowledge Distill** (sprint close): Merge sprint learnings into `_aegis-brain/resonance/`
4. **Propagation** (session start): Load HIGH cache patterns + evolved/anti patterns into agent prompts

Metrics: `_aegis-brain/metrics/knowledge-pipeline.json`

---

## Legacy ID Compatibility

Existing IDs `TASK-NNN` or `US-NNN` (pre-v7.0) are NOT renamed. Commands treat `TASK-NNN` as equivalent to `PROJ-T-NNN`.
