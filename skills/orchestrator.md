---
name: orchestrator
description: "Multi-agent orchestration with dual-mode dispatch and review gates"
profile: minimal
triggers:
  en: ["orchestrate", "manage team", "dispatch", "coordinate agents"]
  th: ["จัดการทีม", "orchestrate", "ประสานงาน"]
---

## Quick Reference
Dual-mode multi-agent orchestration engine for AEGIS.
- **Mode 1 — Subagent**: Sequential agent calls within single Claude session
- **Mode 2 — Agent Team (in-process)**: Parallel background agents via Agent tool
- **Auto-select**: Simple tasks → Subagent; Complex/parallel → Agent Team
- **Review gates**: Phase transitions require quality checks before proceeding
- **Context budget**: Monitor token usage, compress when approaching limits
- **Agent Teams**: Run as in-process background agents with Mother Brain heartbeat monitoring
- **Output**: Task status logged to `_aegis-brain/logs/activity.log`

## Full Instructions

### Mode Selection Logic

```
IF task.complexity == "simple" OR task.agents <= 2:
    mode = "subagent"
ELIF agent_teams_enabled():
    mode = "agent-team"
ELSE:
    mode = "subagent"  # fallback
    log_warning("agent teams unavailable, falling back to subagent mode")
```

### Subagent Mode

Sequential execution within a single session. Best for:
- Tasks requiring 1-2 agents
- Linear workflows (A → B → C)
- Quick operations under 5 minutes

**Protocol:**
1. Parse task into subtasks
2. Assign persona to each subtask (see ai-personas.md)
3. Execute sequentially, passing context between steps
4. Apply review gate after each phase
5. Aggregate results and report

### Agent Team Mode (in-process)

Parallel execution via background agents. Best for:
- Tasks requiring 3+ agents
- Independent parallel workstreams
- Long-running operations

**Protocol:**
1. Parse task into independent workstreams
2. Load team config from `.claude/teams/` if applicable
3. Spawn agents via Agent tool (run_in_background=true, named)
4. Each agent reads its persona from `.claude/agents/{name}.md`
5. Mother Brain monitors health via heartbeat loop (nudge idle > 120s, respawn > 300s)
6. Agents communicate via SendMessage at synchronization points
7. Apply review gates before phase transitions
8. Synthesize final output

### Task Decomposition

1. **Analyze** the user request for scope and complexity
2. **Identify** required personas based on task patterns
3. **Determine** dependencies between subtasks
4. **Create** execution plan:
   ```
   Task: <description>
   Mode: subagent | agent-team
   Agents: [list]
   Phases:
     1. <phase> → Agent: <persona> → Gate: <yes/no>
     2. <phase> → Agent: <persona> → Gate: <yes/no>
   Expected Output: <location>
   ```

### Review Gates

Gates are checkpoints between phases. A gate evaluates the output of the previous phase before allowing the next phase to begin.

**Gate Types:**
| Gate | Criteria | Pass Condition |
|------|----------|----------------|
| Quality Gate | Code review findings | 0 critical findings |
| Spec Gate | Spec completeness check | All sections filled |
| Test Gate | Test results | All tests pass |
| Security Gate | Security scan | 0 high/critical vulns |
| Approval Gate | Human review | Explicit approval |

**Gate Protocol:**
1. Previous phase agent produces output
2. Gate evaluator (usually Black Panther) reviews output
3. Result: PASS / FAIL / CONDITIONAL
4. PASS → proceed to next phase
5. FAIL → return to previous agent with feedback
6. CONDITIONAL → flag for human decision

### Context Budget Management

Monitor token usage to prevent context overflow:

1. **Track** cumulative tokens per session
2. **Warn** at 60% capacity: compress non-essential context
3. **Compress** at 80% capacity: summarize completed phases, drop raw data
4. **Emergency** at 90%: archive to `_aegis-brain/learnings/`, start fresh sub-session

**Compression Strategy:**
- Replace detailed code with file paths + line references
- Summarize completed phase outputs into 3-5 bullet points
- Keep only active phase context in full detail
- Preserve all gate decisions (never compress these)

### Communication Protocol

Agents communicate via structured message types:

| Type | From | To | Purpose |
|------|------|----|---------|
| TaskAssignment | Captain America | Agent | Assign work |
| StatusUpdate | Agent | Captain America | Progress report |
| FindingReport | Black Panther/Loki | Lead | Quality/security findings |
| PlanProposal | Iron Man | Team | Architecture proposal |
| ApprovalRequest | Agent | Human | Needs human decision |
| CompletionReport | Agent | Captain America | Task done |

### Error Handling

1. **Agent timeout** (>10 min no response): Log warning, reassign task
2. **Gate failure** (3 consecutive): Escalate to human with summary
3. **Context overflow**: Archive and restart with summary
4. **tmux crash**: Fall back to subagent, resume from last gate
5. **Conflicting outputs**: Invoke Captain America for resolution

### Logging

All orchestration events are logged to `_aegis-brain/logs/activity.log`:
```
[2026-03-20T10:00:00Z] [🧭] [START] — Orchestrating: <task description>
[2026-03-20T10:00:01Z] [🧭] [MODE] — Selected: agent-team (3 agents)
[2026-03-20T10:05:00Z] [⚡] [DONE] — Phase 1 complete: implementation
[2026-03-20T10:05:01Z] [🛡️] [GATE] — Quality gate: PASS (0 critical)
[2026-03-20T10:10:00Z] [🧭] [COMPLETE] — Task finished successfully
```
