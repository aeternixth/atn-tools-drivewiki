# Message Types — Inter-Agent Communication

> Structured message protocol for agent-to-agent communication.

## Message Format

```
--- [MESSAGE_TYPE] ---
From: [agent_emoji] [agent_name]
To: [agent_emoji] [agent_name] (or "all")
Timestamp: YYYY-MM-DD HH:MM UTC
Priority: [critical | high | normal | low]
---
[Type-specific fields]
---
```

## Types

| Type | Sender | Purpose | Key Fields |
|------|--------|---------|------------|
| TaskAssignment | Captain America | Delegate work | Task, Context, Deadline, Acceptance criteria |
| StatusUpdate | Any agent | Report progress | Task ID, Status, Progress, Blockers, Next |
| FindingReport | Review/research | Report discoveries | Category, Findings, Evidence, Recommendation |
| PlanProposal | Iron Man/Captain America | Propose plan | Steps, Risks, Estimated tokens, Requires approval |
| ApprovalRequest | Any agent | Request approval | Action, Risk level, Rationale, Alternatives |
| EscalationAlert | Any agent | Issue beyond authority | Issue, Severity, Impact, Suggested action |
| QualityGate | Black Panther | Review verdict | Gate name, Status (PASS/FAIL/CONDITIONAL), Findings count |
| SessionSummary | Captain America | End-of-session | Completed, Pending, Blockers, Lessons, Next priorities |

## Routing Rules

1. All messages pass through Captain America unless agents are in the same task group
2. Critical/high priority: processed immediately
3. Normal/low priority: batched when possible
4. EscalationAlerts always go to Captain America
5. SessionSummary broadcast to all agents
