---
name: aegis-context
description: "Check context window budget — usage breakdown and optimization suggestions"
triggers:
  en: context check, context budget, how much context left
  th: เช็ค context, context เหลือเท่าไหร่
---

# /aegis-context

## Quick Reference
Context budget monitoring tool. Estimates current context usage as a percentage,
shows breakdown (loaded files, agent prompts, conversation history), displays a
traffic light indicator (green <40%, yellow 40-70%, red >70%), suggests optimization
actions when high, and shows cost estimates for common pipeline operations.

## Full Instructions

### Step 1: Estimate Current Context Usage
- Approximate the current context window consumption.
- Factors to estimate:
  - System prompt and CLAUDE.md content
  - Loaded slash command definitions
  - Conversation history (messages so far)
  - Any files currently "in context" from recent reads
  - Agent/team prompts if any are active
- Express as a percentage of the model's context limit.
- Note: This is an approximation — exact token counts are not available.

### Step 2: Show Usage Breakdown
- Display a detailed breakdown:
  ```
  ┌─ Context Budget ─────────────────────────────┐
  │                                               │
  │  Total Estimated Usage: [X]%                  │
  │  ████████░░░░░░░░░░░░ [visual bar]           │
  │                                               │
  │  Breakdown:                                   │
  │  ├─ System prompt & config:  ~[X]%            │
  │  ├─ Conversation history:    ~[X]%            │
  │  ├─ Loaded files:            ~[X]%            │
  │  │  ├─ [file1.ts]            ~[N] tokens      │
  │  │  ├─ [file2.ts]            ~[N] tokens      │
  │  │  └─ [file3.ts]            ~[N] tokens      │
  │  ├─ Agent prompts:           ~[X]%            │
  │  └─ Tool definitions:       ~[X]%            │
  │                                               │
  └───────────────────────────────────────────────┘
  ```

### Step 3: Traffic Light Status
- Display the appropriate traffic light:
  - 🟢 **GREEN** (<40%): "Plenty of context remaining. Operate freely."
  - 🟡 **YELLOW** (40-70%): "Context getting warm. Be mindful of large file reads."
  - 🔴 **RED** (>70%): "Context critically high. Take action now."
- For each level, provide context-appropriate guidance.

### Step 4: Suggest Actions (if Yellow or Red)
- **Yellow (40-70%)**:
  ```
  Suggestions:
  • Avoid loading large files — use targeted reads with line ranges
  • Consider running /compact to summarize conversation history
  • Reduce active agent count if using teams
  • Summarize long outputs instead of displaying raw data
  ```
- **Red (>70%)**:
  ```
  ⚠️ URGENT — Context budget critical!
  Recommended actions:
  1. Run /compact immediately to reclaim space
  2. If running a pipeline, pause and save state
  3. Consider running /aegis-handoff and starting a fresh session
  4. Disable any agents that aren't actively needed
  5. Avoid reading new files — work from memory
  ```

### Step 5: Pipeline Cost Estimates
- Show estimated context cost for common operations:
  ```
  ┌─ Operation Cost Estimates ──────────────────┐
  │                                              │
  │  /aegis-pipeline (full)     ~25-35%          │
  │  /aegis-team-review         ~15-20%          │
  │  /aegis-team-build          ~15-20%          │
  │  /aegis-team-debate         ~20-25%          │
  │  /aegis-verify              ~5-10%           │
  │  Reading a large file       ~2-5% per file   │
  │  Spawning a subagent        ~5-8% each       │
  │                                              │
  │  Available budget: ~[remaining]%             │
  │  Can fit: [list feasible operations]         │
  └──────────────────────────────────────────────┘
  ```
- Based on remaining budget, note which operations are feasible and which would risk overflow.

### Step 6: Mother Brain Integration (Programmatic Mode)

When Mother Brain calls /aegis-context as part of her heartbeat BUDGET step,
she does NOT need the full visual display. Instead, she uses this quick-check protocol:

**Quick-Check Protocol (for Mother Brain's internal use):**
```
CONTEXT QUICK-CHECK:
  1. Count conversation turns (user + assistant messages)
  2. Count files read this session
  3. Count agents spawned this session
  4. Count tool calls this session
  5. Apply heuristic:
     estimated = 15 + (turns * 0.5) + (files * 2) + (agents * 6) + (tools * 0.5)
  6. Determine zone:
     < 40%  -> GREEN
     40-60% -> YELLOW
     60-80% -> ORANGE
     > 80%  -> RED
  7. Return: { estimate: N, zone: "ZONE", remaining: 100-N }
```

**Mother Brain reads this result and applies the Context Budget Protocol
defined in `.claude/agents/mother-brain.md` -- specifically the threshold
actions table and budget-aware decision override.**

**Zone-to-Action Mapping (aligned with Mother Brain):**
- GREEN: No restrictions. Continue normal heartbeat cycle.
- YELLOW: Caution mode. Limit concurrent agents to 2, prefer targeted reads.
- ORANGE: Wrap-up mode. Complete current task, one more small task max, write handoff.
- RED: Hard stop. Write handoff immediately, no new work.

**Note:** The traffic light thresholds in this command (Step 3) have been aligned
with Mother Brain's four-zone system. The old 3-zone (green/yellow/red) is replaced
by the 4-zone system (GREEN/YELLOW/ORANGE/RED) for consistency across all AEGIS components.

**Updated Traffic Light (4-zone):**
- GREEN (<40%): "Plenty of context remaining. Operate freely."
- YELLOW (40-60%): "Context getting warm. Be mindful of large file reads."
- ORANGE (60-80%): "Context high. Wrap up current work. One more small task max."
- RED (>80%): "Context critical. Stop all new work. Write handoff."
