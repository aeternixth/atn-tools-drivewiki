---
name: kanban-board
description: "Markdown-based kanban board with 6 columns, WIP limits, and transition rules for tracking task flow across a sprint"
profile: standard
triggers:
  en: ["kanban", "board", "task board", "move task", "task status"]
  th: ["คันบัง", "บอร์ด", "สถานะงาน"]
---

## Quick Reference

Visual task board for tracking work across a sprint. Six columns with WIP limits enforce flow discipline.

- **Columns**: BACKLOG | TODO | IN_PROGRESS | IN_REVIEW | QA | DONE
- **WIP Limits**: IN_PROGRESS max 3, IN_REVIEW max 2
- **Board file**: `_aegis-brain/sprints/current/kanban.md`
- **Command**: `/aegis-kanban` to view and update
- **Single writer rule**: Only Captain America writes to `kanban.md`; other agents send StatusUpdate messages

## Full Instructions

### Board File Format

The board is a single markdown file. Each task entry follows this pattern:

```
- [checkbox] TASK-NNN: <description> [<pts>pts] @<assignee>
```

Checkbox values:
- `[ ]` — not started (BACKLOG, TODO)
- `[~]` — in progress (IN_PROGRESS, IN_REVIEW, QA)
- `[x]` — done (DONE)

Full board template (`_aegis-brain/sprints/current/kanban.md`):

```markdown
# Kanban Board: Sprint <N>
Last updated: <YYYY-MM-DD HH:MM>

## BACKLOG
- [ ] TASK-005: <description> [3pts] @unassigned

## TODO
- [ ] TASK-004: <description> [2pts] @spider-man

## IN_PROGRESS
<!-- WIP limit: 3 -->
- [~] TASK-003: <description> [5pts] @spider-man

## IN_REVIEW
<!-- WIP limit: 2 -->
- [~] TASK-002: <description> [3pts] @black-panther

## QA
- [~] TASK-001: <description> [5pts] @war-machine

## DONE
- [x] TASK-000: <description> [2pts] @spider-man
```

### Transition Rules

Allowed transitions between columns:

| From | To | Trigger |
|------|----|---------|
| BACKLOG | TODO | Sprint planning selects the task |
| TODO | IN_PROGRESS | Agent picks up the task |
| IN_PROGRESS | IN_REVIEW | Agent completes implementation |
| IN_REVIEW | QA | Black Panther approves code review |
| IN_REVIEW | IN_PROGRESS | Black Panther rejects code review (with findings) |
| QA | DONE | War Machine approves QA verdict |
| QA | IN_PROGRESS | War Machine fails QA verdict (with findings) |
| Any | TODO | Task is blocked — returned to queue |

Transitions NOT allowed:
- Skipping columns (e.g., TODO directly to QA)
- Moving backwards past TODO without a finding (e.g., DONE back to IN_PROGRESS)
- Moving into IN_PROGRESS when WIP limit is reached

### WIP Limit Enforcement

Before moving any task INTO IN_PROGRESS or IN_REVIEW, count current occupants.

**IN_PROGRESS limit: 3 items**
- If count is already 3, the task MUST stay in TODO
- Log the block: `[BLOCKED] TASK-NNN: IN_PROGRESS WIP limit reached (3/3)`

**IN_REVIEW limit: 2 items**
- If count is already 2, the task MUST stay in IN_PROGRESS
- Log the block: `[BLOCKED] TASK-NNN: IN_REVIEW WIP limit reached (2/2)`

WIP limits are configurable by adding a comment header to the section:
```markdown
## IN_PROGRESS
<!-- WIP limit: 5 -->
```

### Task ID Format

Task IDs use the format `TASK-NNN` where NNN is a zero-padded integer starting at 001.
IDs are assigned at creation and never reused, even after a task is deleted or cancelled.

To find the next available ID, scan all kanban files and backlog for the highest existing number, then increment by one.

### Board Initialization

When no board exists for the current sprint:

1. Read `_aegis-brain/backlog.md` for all unassigned tasks
2. Create `_aegis-brain/sprints/current/` directory if it does not exist
3. Write a fresh `kanban.md` with all backlog items in the BACKLOG column
4. Set `Last updated` timestamp to now
5. Log: `[INIT] Kanban board created for Sprint <N>`

If `_aegis-brain/sprints/current/` is a symlink, resolve to the actual sprint directory.

### Updating the Board

Only Captain America writes to the board file. Agent workflow:

1. Agent sends a StatusUpdate message stating the desired transition:
   ```
   StatusUpdate: TASK-003 complete, ready for IN_REVIEW
   ```
2. Captain America reads the current board
3. Captain America validates the transition against the rules above
4. Captain America checks WIP limits
5. Captain America writes the updated board file
6. Captain America updates `Last updated` timestamp

### Board Display Format

When displaying the board to the human, use this compact visual format:

```
KANBAN — Sprint <N> | Updated: <timestamp>

BACKLOG (2)        TODO (1)           IN_PROGRESS (1/3)  IN_REVIEW (0/2)    QA (1)             DONE (1)
─────────────────  ─────────────────  ─────────────────  ─────────────────  ─────────────────  ─────────────────
TASK-005 [3pts]    TASK-004 [2pts]    TASK-003 [5pts]                       TASK-001 [5pts]    TASK-000 [2pts]
@unassigned        @spider-man              @spider-man                                  @war-machine          @spider-man
```

Column headers show current count and WIP limit where applicable.

### Output

```
_aegis-brain/
  sprints/
    current -> sprint-<N>/        # symlink or directory
    sprint-<N>/
      kanban.md                   # board state (source of truth)
```
