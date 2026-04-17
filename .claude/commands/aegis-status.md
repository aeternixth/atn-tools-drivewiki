---
name: aegis-status
description: "Show team status dashboard — agents, tasks, progress, context, recent activity"
triggers:
  en: status, team status, what is happening, dashboard
  th: สถานะ, ตอนนี้ทำอะไรอยู่
---

# /aegis-status

## Quick Reference
Team status dashboard showing all active agents/teammates with their current task
and progress, overall pipeline progress, context budget summary, and last 5 actions
from activity.log. Formatted as a readable table. Use anytime to get a snapshot
of what AEGIS is doing.

## Full Instructions

### Step 1: Check Mother Brain Heartbeat
- Read `_aegis-brain/logs/heartbeat.log` for latest PULSE entry.
- Determine Mother Brain state:
  - If heartbeat.log has a PULSE within last 60 seconds: **ALIVE**
  - If heartbeat.log exists but last PULSE > 60 seconds ago: **STALE** (may need respawn)
  - If heartbeat.log doesn't exist: **OFFLINE** (Mother Brain not running)
- Display heartbeat status prominently at top of dashboard.

### Step 2: Check Active Agents
- Determine which agents/teammates are currently active in this session.
- Check for:
  - tmux sessions with AEGIS agent names
  - Subagent tasks in progress
  - The main orchestrator (Captain America) status
- For each agent, determine:
  - Name and role emoji
  - Current task (if any)
  - Status: idle / working / waiting / blocked / done
  - Last heartbeat check result (alive / unresponsive / respawned)
  - Progress percentage (estimate based on task completion)

### Step 3: Display Agent Status Table
- Format as a table:
  ```
  ╔══════════════════════════════════════════════════════════════════╗
  ║  AEGIS Team Status                              v8.2.1         ║
  ╠══════════════════════════════════════════════════════════════════╣
  ║                                                                 ║
  ║  💓 Mother Brain: ALIVE (last pulse: 12s ago)                   ║
  ║     Cycle: #7 | Agents spawned: 3 | Tasks done: 2              ║
  ║                                                                 ║
  ║  Agent          Task                    Status      Progress    ║
  ║  ─────────────  ──────────────────────  ──────────  ────────    ║
  ║  🧭 Captain America        Orchestrating session   ✅ Active   —           ║
  ║  🔨 Beast       Scanning codebase       🔄 Working  60%         ║
  ║  📖 Iron Man        (idle)                  💤 Idle     —           ║
  ║  🛡️ Black Panther       (idle)                  💤 Idle     —           ║
  ║  🎨 Songbird        (idle)                  💤 Idle     —           ║
  ║  ⚡ Spider-Man        (idle)                  💤 Idle     —           ║
  ║  💥 Loki       (idle)                  💤 Idle     —           ║
  ║                                                                 ║
  ╚══════════════════════════════════════════════════════════════════╝
  ```
- Only show agents relevant to the current session/profile.
- If Mother Brain is OFFLINE, show warning:
  ```
  ⚠️ Mother Brain: OFFLINE — run /aegis-start to activate
  ```

### Step 3: Show Pipeline Progress
- If a pipeline is running (/aegis-pipeline, /aegis-flow, etc.):
  ```
  Pipeline: /aegis-pipeline — Phase 2 of 3 (Deep Analysis)
  ██████████████░░░░░░░░ 65%
  Gate 1: ✅ Passed | Gate 2: 🔄 Pending | Gate 3: ⬜ Not started
  ```
- If no pipeline is active:
  ```
  Pipeline: None active
  ```

### Step 4: Show Context Budget
- Quick context summary (abbreviated version of /aegis-context):
  ```
  Context: 45% used 🟡 | ~55% remaining
  ```

### Step 5: Show Recent Activity
- Read last 5 entries from `_aegis-brain/logs/activity.log`.
- Display:
  ```
  Recent Activity:
  [14:32] Beast scanned 47 files in src/
  [14:30] Session started at L2 autonomy
  [14:28] Loaded handoff from previous session
  [13:45] (previous session) Black Panther completed code review
  [13:30] (previous session) Session ended
  ```
- If activity.log doesn't exist or is empty: "No activity recorded yet."

### Step 6: Format Final Output
- Combine all sections into a single cohesive dashboard.
- Keep it compact but informative.
- End with available actions:
  ```
  Quick actions: /aegis-context (detailed) | /aegis-pipeline (start) | /aegis-retro (end)
  ```
