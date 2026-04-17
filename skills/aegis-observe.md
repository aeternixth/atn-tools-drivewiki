---
name: aegis-observe
description: "Agent observability: structured logging, cost tracking, decision traces"
profile: full
triggers:
  en: ["observe", "observability", "agent logs", "cost tracking", "decision trace"]
  th: ["สังเกตการณ์", "observe", "ดู log", "ติดตามค่าใช้จ่าย"]
---

## Quick Reference
Observability layer for AEGIS agent operations.
- **Logging**: Structured JSON logs per session in `_aegis-brain/logs/`
- **Cost**: Token usage tracking per agent per session
- **Traces**: Decision audit trail — why each agent made each choice
- **Dashboard**: Real-time status summary of active agents
- **Output**: `_aegis-brain/logs/` and `_aegis-output/observability/`
- **Agent**: Beast (haiku) — data collection; Lumen (sonnet) — analysis

## Full Instructions

### Invocation

```
/aegis-observe [status|logs|cost|trace|dashboard]
```
- `status` — Current agent activity status
- `logs` — View/search structured logs
- `cost` — Token usage and cost report
- `trace` — Decision audit trail
- `dashboard` — Full observability dashboard

### Structured Logging

All agent activity is logged in structured format:

#### Log Entry Schema
```json
{
  "timestamp": "2026-03-20T10:30:00Z",
  "session_id": "aegis-20260320-001",
  "agent": "spider-man",
  "agent_emoji": "⚡",
  "event_type": "task_start|task_complete|gate_check|error|decision",
  "severity": "info|warn|error",
  "message": "Implementing user authentication module",
  "context": {
    "skill": "code-review",
    "phase": "implementation",
    "target": "src/auth/auth.service.ts"
  },
  "tokens": {
    "input": 1500,
    "output": 3200,
    "total": 4700
  },
  "duration_ms": 45000
}
```

#### Log File Naming
```
_aegis-brain/logs/
  activity.log              # Append-only human-readable log
  sessions/
    YYYY-MM-DD_<session-id>.json  # Structured JSON per session
```

#### Human-Readable Log Format
```
[2026-03-20T10:30:00Z] [⚡] [START] — Implementing user authentication module
[2026-03-20T10:30:45Z] [⚡] [DONE] — auth.service.ts created (47 lines)
[2026-03-20T10:30:46Z] [🛡️] [GATE] — Code review: PASS (0 critical)
[2026-03-20T10:31:00Z] [🧭] [DECISION] — Routing to Black Panther for test generation
```

### Cost Tracking

Track token usage per agent and per session:

```markdown
## Cost Report: YYYY-MM-DD

### Session Summary
| Agent | Input Tokens | Output Tokens | Total | Model | Est. Cost |
|-------|-------------|--------------|-------|-------|-----------|
| Captain America (opus) | <n> | <n> | <n> | opus | $<cost> |
| Iron Man (opus) | <n> | <n> | <n> | opus | $<cost> |
| Spider-Man (sonnet) | <n> | <n> | <n> | sonnet | $<cost> |
| Black Panther (sonnet) | <n> | <n> | <n> | sonnet | $<cost> |
| Beast (haiku) | <n> | <n> | <n> | haiku | $<cost> |
| **Total** | **<n>** | **<n>** | **<n>** | — | **$<cost>** |

### Cost Per Skill
| Skill | Invocations | Total Tokens | Est. Cost |
|-------|------------|-------------|-----------|
| code-review | <n> | <n> | $<cost> |
| orchestrator | <n> | <n> | $<cost> |

### Trend (Last 7 Days)
| Date | Sessions | Total Tokens | Est. Cost |
|------|----------|-------------|-----------|
| <date> | <n> | <n> | $<cost> |
```

#### Cost Estimation Rates
| Model | Input (per 1M) | Output (per 1M) |
|-------|----------------|-----------------|
| opus | $15.00 | $75.00 |
| sonnet | $3.00 | $15.00 |
| haiku | $0.25 | $1.25 |

### Decision Trace

Record every significant decision made by agents:

```markdown
## Decision Trace: <session-id>

### DEC-001
- **Time**: <timestamp>
- **Agent**: <agent name>
- **Decision**: <what was decided>
- **Alternatives**: <other options considered>
- **Rationale**: <why this option was chosen>
- **Confidence**: High/Medium/Low
- **Impact**: <what this affects>
- **Reversible**: Yes/No

### DEC-002
...
```

**Decision categories:**
- Architecture decisions (Iron Man)
- Implementation choices (Spider-Man)
- Quality gate verdicts (Black Panther)
- Task routing decisions (Captain America)
- Security assessments (Loki)

### Real-Time Dashboard

```markdown
## AEGIS Dashboard — <timestamp>

### Active Agents
| Agent | Status | Current Task | Duration | Tokens Used |
|-------|--------|-------------|----------|-------------|
| 🧭 Captain America | 🟢 Active | Orchestrating build | 5m | 2,400 |
| ⚡ Spider-Man | 🟢 Active | Implementing auth | 3m | 4,700 |
| 🛡️ Black Panther | 🟡 Waiting | Pending review gate | — | 0 |

### Session Stats
- Session ID: <id>
- Duration: <time>
- Total Tokens: <n>
- Skills Invoked: <list>
- Gates Passed: <n>/<total>
- Errors: <n>

### Recent Events (Last 10)
<last 10 log entries>
```

### Alerts

Configurable alerts for anomalies:

| Alert | Trigger | Action |
|-------|---------|--------|
| High cost | Session > $5 estimated | Warn user |
| Context overflow | Token usage > 80% limit | Compress context |
| Error spike | 3+ errors in 5 minutes | Pause and report |
| Long running | Agent active > 15 minutes | Check status |
| Gate failure | 3 consecutive gate failures | Escalate to human |

### Output

```
_aegis-brain/logs/
  activity.log
  sessions/
    YYYY-MM-DD_<session-id>.json

_aegis-output/observability/
  cost-report.md
  decision-trace.md
  dashboard.md
```
