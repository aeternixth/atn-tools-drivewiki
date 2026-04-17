---
name: aegis-kanban
description: "View and manage the kanban board — show board, move tasks, add tasks, check WIP limits"
triggers:
  en: kanban, board
  th: คันบัง, บอร์ด
---

# /aegis-kanban

## Quick Reference
Interact with the sprint kanban board. Default action shows the board. Subcommands let you
move tasks, add new ones, and check WIP status.

- **Board file**: `_aegis-brain/sprints/current/kanban.md`
- **Skill**: `kanban-board` (see `skills/kanban-board.md` for full rules)
- **Single writer**: Only Captain America writes to `kanban.md`

**Usage**:
```
/aegis-kanban                          # Show board (default)
/aegis-kanban move TASK-NNN COLUMN     # Move task to column
/aegis-kanban add "description" [pts]  # Add task to BACKLOG
/aegis-kanban wip                      # Show WIP limit status
```

## Full Instructions

### Subcommand: (default) — Show Board

**When**: `/aegis-kanban` with no arguments.

1. Read `_aegis-brain/sprints/current/kanban.md`.
2. If file does not exist, attempt to regenerate it from `_aegis-brain/tasks/*/meta.json` files
   that have the current sprint set. If no sprint task data exists either, report:
   `No kanban board found. Run sprint planning first or use /aegis-kanban add to seed the backlog.`
3. Display the board using the compact visual format defined in `skills/kanban-board.md`:

```
KANBAN — Sprint <N> | Updated: <timestamp>

BACKLOG (2)        TODO (1)           IN_PROGRESS (1/3)  IN_REVIEW (0/2)    QA (1)             DONE (1)
─────────────────  ─────────────────  ─────────────────  ─────────────────  ─────────────────  ─────────────────
TASK-005 [3pts]    TASK-004 [2pts]    TASK-003 [5pts]                       TASK-001 [5pts]    TASK-000 [2pts]
@unassigned        @spider-man              @spider-man                                  @war-machine          @spider-man
```

4. Below the board, show summary stats:
```
Total: <N> tasks | <pts> points | Done: <pts>/<total> (<pct>%)
```

---

### Subcommand: move TASK-ID COLUMN

**When**: `/aegis-kanban move PROJ-T-003 IN_REVIEW`

1. Read `_aegis-brain/tasks/{TASK-ID}/meta.json`. If not found, also check legacy mapping:
   treat `TASK-NNN` as `PROJ-T-NNN` and look up `_aegis-brain/tasks/PROJ-T-NNN/meta.json`.
   If still not found, error: `Task {TASK-ID} not found. No meta.json in _aegis-brain/tasks/`.
2. Record the current status as `from_status`.
3. Validate the transition using the transition rules from `skills/kanban-board.md` and
   `.claude/references/pm-state-protocol.md`:
   - Check the move is an allowed transition (no skipping columns).
   - Check WIP limits by reading ALL `meta.json` files in the current sprint (NOT from kanban.md).
4. If validation fails, report the specific reason:
   - `[BLOCKED] Cannot move {TASK-ID} to IN_PROGRESS: WIP limit reached (3/3)`
   - `[INVALID] Cannot move {TASK-ID} from TODO to QA: skipping columns not allowed`
5. **GATE ENFORCEMENT (mandatory, not advisory):**
   Before moving, check quality gates based on target column:

   **→ IN_REVIEW** (from IN_PROGRESS):
   - No gate check needed. Developer self-reports completion.

   **→ QA** (from IN_REVIEW):
   - REQUIRE: File exists at `_aegis-output/reviews/` containing review for this task
   - REQUIRE: Review verdict is PASS or CONDITIONAL
   - If missing/FAIL → BLOCK: `[BLOCKED] Gate 1 not passed. Run code review first.`

   **→ DONE** (from QA):
   - REQUIRE: File exists at `_aegis-output/qa/` with QA report for this task
   - REQUIRE: QA verdict is PASS
   - If missing/FAIL → BLOCK: `[BLOCKED] Gate 2 not passed. Run /aegis-qa first.`

   **BYPASS**: Tasks under 3 story points can skip Gate 1→2 checks (move directly IN_REVIEW→DONE).

   **OVERRIDE**: User can type `/aegis-kanban move TASK-NNN DONE --force` to bypass gates (logged as warning).

6. If gates pass and validation passes:
   a. Update `meta.json`: set `status` to the target column and `updated` to the current ISO 8601 timestamp. Write the file.
   b. Append to `_aegis-brain/tasks/{TASK-ID}/history.md`:
      ```
      | {YYYY-MM-DD HH:MM} | captain-america | MOVED | {from_status} | {to_status} | {optional note} |
      ```
   c. Recompute `_aegis-brain/sprints/sprint-N/metrics.json` (see pm-state-protocol.md "Recomputing Sprint Metrics").
   d. Regenerate `_aegis-brain/sprints/sprint-N/kanban.md` from all sprint meta.json files (see pm-state-protocol.md "Regenerating Kanban Board").
7. Display the updated board.
8. Log to `_aegis-brain/logs/activity.log`:
   ```
   [YYYY-MM-DD HH:MM] KANBAN_MOVE | task={TASK-ID} | from={from_status} | to={to_status}
   ```
9. **Auto-Learn Trigger** (only when target column is DONE):
   After successfully moving a task to DONE, trigger the Auto-Learn Protocol
   (see `.claude/references/auto-learn-protocol.md`):
   a. Read the task's `history.md` to extract time-per-phase and gate retry counts.
   b. Map the task to skills used via `meta.json` fields (`task_type`, `labels`).
   c. Append a new `LEARN-{N}` entry to `_aegis-brain/learnings/auto-learned.md`.
   d. Check for pattern promotion (3+ similar patterns -> `_aegis-brain/resonance/evolved-patterns.md`).
   e. Check for anti-pattern detection (2+ similar gate failures -> `_aegis-brain/resonance/anti-patterns.md`).
   f. If a reusable insight was found, write to `_aegis-brain/skill-cache/{CATEGORY}.md`
      and update `_aegis-brain/skill-cache/stats.json`.

---

### Subcommand: add "description" [pts]

**When**: `/aegis-kanban add "Implement auth middleware" 5`

1. Read `_aegis-brain/counters.json`. If it does not exist, create it (see pm-state-protocol.md).
2. Increment the `T` counter and write the updated `counters.json` with the current timestamp.
3. Derive the task ID: `PROJ-T-NNN` (zero-padded to 3 digits).
4. Default points to 3 if not specified.
5. Create the task directory and files:
   - `_aegis-brain/tasks/PROJ-T-NNN/meta.json` — set status: BACKLOG, assignee: unassigned, sprint: null
   - `_aegis-brain/tasks/PROJ-T-NNN/history.md` — CREATED entry
   - `_aegis-brain/tasks/PROJ-T-NNN/comments.md` — empty header
6. If a sprint is currently active and the board exists, regenerate `_aegis-brain/sprints/sprint-N/kanban.md`
   from meta.json files so the new BACKLOG task appears on the board.
7. Display confirmation:
   ```
   Added PROJ-T-NNN: <description> [<pts>pts] to BACKLOG
   ```
8. Log to `_aegis-brain/logs/activity.log`:
   ```
   [YYYY-MM-DD HH:MM] KANBAN_ADD | task=PROJ-T-NNN | points=<pts> | column=BACKLOG
   ```

---

### Subcommand: wip

**When**: `/aegis-kanban wip`

1. Read current board.
2. Count tasks in each WIP-limited column.
3. Display WIP status:

```
WIP Status:
  IN_PROGRESS: 2/3 (1 slot available)
  IN_REVIEW:   2/2 (FULL — no moves allowed)
```

4. If any column is at limit, list the tasks occupying it so the user can decide what to unblock.

---


---

### Subcommand: history TASK-ID

**When**: `/aegis-kanban history PROJ-T-003`

1. Read `_aegis-brain/tasks/{TASK-ID}/history.md`. Apply legacy ID mapping if needed (`TASK-NNN` → `PROJ-T-NNN`).
2. If the file does not exist, error: `No history found for {TASK-ID}. Task directory may not exist.`
3. Display the full history table:

```
History: PROJ-T-003

| Timestamp        | Agent    | Action  | From        | To          | Note                          |
|------------------|----------|---------|-------------|-------------|-------------------------------|
| 2026-03-24 10:00 | captain-america     | CREATED | -           | BACKLOG     | Created from breakdown        |
| 2026-03-25 09:15 | captain-america     | MOVED   | BACKLOG     | TODO        | Sprint 1 planning             |
| 2026-03-25 14:00 | captain-america     | MOVED   | TODO        | IN_PROGRESS | spider-man started work             |
```

No file is written — this is a read-only display.

---

### Subcommand: comment TASK-ID 'text'

**When**: `/aegis-kanban comment PROJ-T-003 'Fixed the null pointer issue in auth.ts'`

1. Validate TASK-ID by checking `_aegis-brain/tasks/{TASK-ID}/meta.json` exists.
2. Append to `_aegis-brain/tasks/{TASK-ID}/comments.md`:
   ```
   ---
   **{YYYY-MM-DD HH:MM}** | @{current_agent}
   {comment text}

   ```
3. Append to `_aegis-brain/tasks/{TASK-ID}/history.md`:
   ```
   | {YYYY-MM-DD HH:MM} | {agent} | COMMENT | - | - | "{first 50 chars}" |
   ```
4. Display confirmation:
   ```
   Comment added to PROJ-T-003
   ```

### Error Handling

- **No board file**: Prompt to run sprint planning or use `add` subcommand.
- **Invalid TASK-ID format**: Report expected format `PROJ-T-NNN` (new) or `TASK-NNN` (legacy, auto-mapped).
- **Invalid COLUMN name**: Report valid columns: `BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, QA, DONE`.
- **Concurrent write conflict**: If file changed between read and write, re-read and retry once.
