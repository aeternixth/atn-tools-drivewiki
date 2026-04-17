---
name: aegis-start
description: "Initialize AEGIS session — load brain, activate Nick Fury, auto-execute"
triggers:
  en: start session, begin, init, start work
  th: เริ่ม session, เริ่มงาน
---

# /aegis-start

## Quick Reference
Initialize AEGIS and hand control to Nick Fury. Nick Fury scans the project,
decides what to do, and starts executing — NO human input needed. The human
watches via tmux and can interrupt anytime.

## Flags
| Flag | Effect |
|------|--------|
| (none) | Default — leave dashboard alone (start nothing, kill nothing) |
| `--dashboard` | Start dashboard on `localhost:4321` (auto-fetch + install on first run) |
| `--no-dashboard` | **Explicit off** — kill any dashboard process running on port 4321 |

## Full Instructions

### Step 0: Dashboard Web App (opt-in via `--dashboard`)

**Default = leave dashboard alone.** Only act when the user explicitly passes a flag.

**Argument parsing:**
- `/aegis-start` → no dashboard action (default)
- `/aegis-start --dashboard` → start the dashboard (auto-fetch + install if missing)
- `/aegis-start --no-dashboard` → **kill** any dashboard running on port 4321

```bash
# Detect dashboard flags from the command's $ARGUMENTS
WANT_DASHBOARD=false
KILL_DASHBOARD=false
if echo "$ARGUMENTS" | grep -qE '(^|\s)--dashboard(\s|$)'; then
  WANT_DASHBOARD=true
fi
if echo "$ARGUMENTS" | grep -qE '(^|\s)--no-dashboard(\s|$)'; then
  KILL_DASHBOARD=true
fi

# --no-dashboard: explicit off — kill any process on port 4321
if [ "$KILL_DASHBOARD" = "true" ]; then
  PIDS=$(lsof -ti:4321 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    kill $PIDS 2>/dev/null && sleep 1
    # Force kill if still alive
    STILL=$(lsof -ti:4321 2>/dev/null || true)
    if [ -n "$STILL" ]; then
      kill -9 $STILL 2>/dev/null
    fi
    echo "🛑 Dashboard stopped (port 4321 freed)"
  else
    echo "ℹ️  No dashboard running on port 4321"
  fi
fi

if [ "$WANT_DASHBOARD" = "true" ]; then
  # 1. If dashboard/ doesn't exist, sparse-fetch it from the AEGIS-Team repo
  if [ ! -d "dashboard" ]; then
    echo "🖥️  Dashboard not installed. Fetching from AEGIS-Team repo..."
    TMP_FETCH="/tmp/aegis-dashboard-fetch-$$"
    git clone --depth 1 --filter=blob:none --sparse \
      https://github.com/phariyawitjiap-aeternix/AEGIS-Team.git "$TMP_FETCH" 2>/dev/null
    if [ -d "$TMP_FETCH" ]; then
      (cd "$TMP_FETCH" && git sparse-checkout set dashboard 2>/dev/null)
      cp -R "$TMP_FETCH/dashboard" ./dashboard
      rm -rf "$TMP_FETCH"
      echo "✅ Dashboard fetched (~3MB)"
    else
      echo "❌ Failed to fetch dashboard. Check network or git access."
    fi
  fi

  # 2. Node available?
  if [ -d "dashboard" ]; then
    if ! command -v node &>/dev/null; then
      echo "⚠️  Node.js not found. Install Node 18+ then re-run /aegis-start --dashboard"
    else
      # 3. Install deps if missing
      if [ ! -d "dashboard/node_modules" ]; then
        echo "📦 Installing dashboard dependencies (~50MB, ~30s)..."
        (cd dashboard && npm install --silent)
      fi

      # 4. Already running on 4321?
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 1 http://localhost:4321 2>/dev/null || echo "000")
      if [ "$HTTP_CODE" = "200" ]; then
        echo "🖥️  Dashboard: RUNNING on http://localhost:4321 ✅"
      else
        echo "🖥️  Starting dashboard on http://localhost:4321 ..."
        (cd dashboard && nohup npx next dev -p 4321 >/dev/null 2>&1 &)
        sleep 5
        echo "✅ Dashboard started"
      fi
    fi
  fi
fi
# If --dashboard was NOT passed: silent skip — Step 0 does nothing.
```

**Display to user (only when `--dashboard` was used and start succeeded):**
```
🖥️ Dashboard: http://localhost:4321
   ├── Home:         http://localhost:4321
   ├── Kanban:       http://localhost:4321/kanban
   ├── Pixel Office: http://localhost:4321/pixel-office
   └── Timeline:     http://localhost:4321/timeline
```

### Step 1: Check Context Budget
- Estimate current context window usage as a percentage.
- If >20%, display warning and suggest `/compact`.

### Step 2: Load Brain
- Read all files in `_aegis-brain/resonance/` (project identity, conventions, decisions).
- Read latest 3 files in `_aegis-brain/learnings/`.
- Read `_aegis-brain/logs/activity.log` for pending tasks.
- Read `_aegis-brain/handoffs/` for last session's handoff.

### Step 3: Display Dashboard (brief, 5 seconds max)

```
🛡️ ═══════════════════════════════════════════════════
🛡️  AEGIS HQ v8.3 — Session Started
🛡️  "Context is King, Memory is Soul"
🛡️ ═══════════════════════════════════════════════════

📋 Project:    [name from resonance]
📅 Date:       [current date]
🎚️  Profile:    [tier] ([N] skills)
🔐 Autonomy:   L3 — Autonomous (Nick Fury active)
📊 Context:    [X]% used

🧬 Nick Fury: ONLINE — scanning project now...
```

### Step 4: Activate Nick Fury (DO NOT ASK HUMAN)

**This is the critical step.** Do NOT display "What would you like to do?" or
present options. Instead, immediately execute the Nick Fury scan loop:

**Spawn Mother Brain:**
```
Agent tool call:
  subagent_type: "mother-brain"
  name: "mother-brain"
  mode: "bypassPermissions"
  run_in_background: true
  prompt: |
    You are 🧬 Mother Brain — the autonomous controller of AEGIS.
    Read .claude/agents/mother-brain.md for your full protocol.

    SESSION CONTEXT:
    - Date: [current date]
    - Autonomy: L3 (Autonomous)
    - Profile: [tier]
    - Context budget: [X]%
    - Handoff data: [summary from Step 2, or "none"]
    - Brain resonance: [key points from Step 2]

    IMMEDIATE ACTIONS:
    1. Run your first SCAN (git, tests, sprint, kanban, specs, deps, debt)
    2. Apply Decision Matrix — pick highest-priority action
    3. Announce your decision
    4. DISPATCH sub-agents to execute (use Agent tool, run_in_background=true)
    5. Enter HEARTBEAT LOOP:
       - Monitor spawned agents via SendMessage
       - Nudge agents idle > 120s
       - Re-spawn agents that timeout > 300s
       - After each task completes: verify gates, log results, pick next task
       - Check context budget each cycle
       - Continue until context >= 80% or all tasks done
    6. When wrapping up: log final state to activity.log, report summary

    RULES:
    - NEVER ask "what would you like to do?" — analyze, decide, execute
    - ALWAYS announce decisions with rationale before acting
    - ALWAYS spawn sub-agents with run_in_background=true
    - ALWAYS include SUCCESS CRITERIA in sub-agent prompts
    - ALWAYS instruct sub-agents to SendMessage back when done
    - Log every heartbeat pulse to _aegis-brain/logs/heartbeat.log
    - Log every decision to _aegis-brain/logs/activity.log
```

#### 4b. Check Planning Artifacts — BLOCK 0 (MANDATORY)

Before ANY task enters IN_PROGRESS, verify all 5 BLOCK 0 checks pass:

```
BLOCK 0A: PM.01 Project Plan    → ls _aegis-output/iso-docs/PM-01-project-plan/plan.md
BLOCK 0B: SI.01 Requirements    → ls _aegis-output/iso-docs/SI-01-requirements-spec/spec.md
BLOCK 0C: Epic/Task hierarchy   → ls _aegis-brain/tasks/*.md
BLOCK 0D: Kanban initialized    → ls _aegis-brain/sprints/current/kanban.md
BLOCK 0E: SI.02 Traceability    → ls _aegis-output/iso-docs/SI-02-traceability-matrix/matrix.md
```

If ANY block check fails AND the task is P3+ (not a hotfix):
→ **Dispatch Coulson immediately** to generate missing documents BEFORE any other agent acts.
→ Coulson generates PM.01 skeleton, SI.01 skeleton, task hierarchy, kanban, SI.02 skeleton.
→ The entire team is BLOCKED until Coulson signals BLOCK 0 COMPLETE.

**NEVER assign any task to IN_PROGRESS without BLOCK 0 cleared.**

#### 4b-ENFORCE. Hard Stops (Pipeline Gates)

If ANY BLOCK 0 check fails, Nick Fury MUST apply these hard stops in order:

1. BLOCK 0C fails (no tasks/) → Run /aegis-breakdown NOW → Coulson generates hierarchy
2. BLOCK 0D fails (no kanban) → Run /aegis-sprint plan NOW → Coulson initializes board
3. BLOCK 0A fails (no PM.01) → Dispatch Coulson → generate PM.01 from spec + backlog
4. BLOCK 0B fails (no SI.01) → Run /super-spec or Iron Man → Coulson formats as SI.01
5. BLOCK 0E fails (no SI.02) → Dispatch Coulson → generate SI.02 skeleton from SI.01

6. Git check: at least 1 commit exists → If not: create initial commit before any work.

None of these are skippable. These are pipeline gates, not suggestions.
Response if user pushes: "AEGIS pipeline requires BLOCK 0 docs first. Takes ~2 min. Starting now..."

#### 4c. Analyze & Decide
Apply the Decision Matrix (P0-P10):

| Priority | Signal | Action |
|----------|--------|--------|
| P0 | Test failures / build broken | Fix immediately (hotfix — skip planning) |
| P1 | Security vulnerabilities | Audit + fix (hotfix — skip planning) |
| P2 | Pending handoff tasks | Resume from last session |
| P2.5 | Active sprint + kanban TODO | Pick next task from kanban board |
| P3 | Spec + breakdown + sprint all exist | Build next task from kanban |
| P3.1 | Spec + breakdown exist, NO sprint | /aegis-sprint plan → then build |
| P3.2 | Spec exists, NO breakdown | /aegis-breakdown → sprint plan → build |
| P4 | Code exists but no tests | QA: War Machine + Vision |
| P5 | Code exists but no review | Review team |
| P5.5 | QA passed, ISO docs stale | Coulson generates docs |
| P6 | TODOs/FIXMEs in codebase | Tech debt sweep |
| P7 | Outdated dependencies | Update cycle |
| P7.5 | Backlog exists, no sprint | /aegis-sprint plan |
| P8 | No spec exists | /super-spec → /aegis-breakdown → /aegis-sprint plan → build |
| P9 | Everything clean | Optimize / refactor |
| P10 | Empty project | Ask purpose → /super-spec → breakdown → sprint → build |

**P8 and P10 ALWAYS follow the full planning chain (never skip):**
```
Ask/Analyze → /super-spec → /aegis-breakdown → /aegis-sprint plan → build tasks
```

#### 4c. Announce Decision (not ask)

```
🧬 Nick Fury: Scan complete.

📊 Scan Results:
  ├── Git: [status]
  ├── Tests: [status]
  ├── Spec: [status]
  ├── Coverage: [status]
  └── Tech Debt: [count]

🎯 Decision: P[N] — [description]
   Rationale: [why this is the highest priority]

⚡ Action: [what will happen next]
   → [Agent 1]: [task]
   → [Agent 2]: [task]
   → [Agent 3]: [task]

🖥️ Spawning team in tmux...
```

#### 4d. Execute
- Spawn the appropriate team via tmux (see team configs in `.claude/teams/`)
- Use `tmux new-session -d -s aegis-team` with split panes per agent
- Each pane runs a Claude agent with the persona loaded
- Monitor progress, apply quality gates
- When complete, report results and loop back to scan

### Step 5: Log Session
Mother Brain logs automatically, but the main session should also log:
```
[YYYY-MM-DD HH:MM] SESSION_START | autonomy=L3 | mode=nick-fury | context=[X]%
[YYYY-MM-DD HH:MM] SCAN | git=[status] | tests=[status] | spec=[status]
[YYYY-MM-DD HH:MM] DECISION | priority=P[N] | action=[description]
[YYYY-MM-DD HH:MM] EXECUTE | team=[name] | agents=[list]
```

### The ONE Exception
P10 (completely empty project with no identity) — Nick Fury may ask:
"What is this project? One sentence is enough."
After that single answer, she takes over completely.

### Human Interaction Model
```
┌──────────────────────────────────────────────────┐
│  BEFORE (v6.0):                                  │
│  /aegis-start → Dashboard → "What to do?" → Wait │
│                                                  │
│  AFTER (v6.0 + Nick Fury):                    │
│  /aegis-start → Dashboard → Scan → Decide → GO! │
│  Human watches tmux, interrupts only if needed   │
└──────────────────────────────────────────────────┘
```

### Error Handling
- If scan finds nothing actionable: report "Project healthy, no action needed"
- If Mother Brain spawn fails: fall back to inline mode with warning
- If brain directory missing: create it, then scan
- If 2+ consecutive failures: downgrade to L1, ask human for guidance
- If agent unresponsive > 300s: Mother Brain auto-respawns it

### Step 2.5: Load Latest Handoff (NEW -- cross-session pickup)

After loading the brain (Step 2), explicitly check for and load the latest handoff:

1. **Find latest handoff:**
   - List files in `_aegis-brain/handoffs/` (exclude .gitkeep)
   - Sort by filename (date-based: YYYY-MM-DD_HH-MM.md)
   - Pick the most recent file
   - If no handoffs exist: skip to Step 3 (first session or clean start)

2. **Parse handoff frontmatter:**
   - Read the `mother_brain_state` section from the YAML frontmatter
   - Extract: sprint, kanban counts, context info, tasks done, last decision
   - If frontmatter is missing or malformed: fall back to reading the body text

3. **Build handoff summary for Mother Brain:**
   - Create a structured summary string:
     ```
     HANDOFF FROM PREVIOUS SESSION:
     - Sprint: [sprint-N] (day [N])
     - Kanban: [TODO/WIP/DONE counts]
     - Tasks done last session: [list]
     - Recommended first action: [from handoff body]
     - Last decision point: [P-level]
     - Blockers: [from handoff body]
     ```

4. **Pass to Mother Brain spawn prompt:**
   - Include the handoff summary in the SESSION CONTEXT section
   - Set `Handoff data: [summary]` instead of "none"
   - This allows Mother Brain to skip redundant scans and jump to P2
     (Pending handoff tasks) in her Decision Matrix

5. **Log:**
   ```
   [YYYY-MM-DD HH:MM] HANDOFF_LOADED | file=[filename] | sprint=[sprint-N] | pending=[N]
   ```

**If handoff is stale (> 7 days old):**
- Log warning: "Handoff is [N] days old, may be outdated"
- Still load it but tell Mother Brain to do a full scan anyway
- Do not auto-delete old handoffs (git preserves history)
