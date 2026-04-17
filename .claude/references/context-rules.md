# Context Rules — Budget Management & Progressive Disclosure

> Critical rules for all agents to manage context window efficiently.

## Master Brain Protocol (v8.4 — MANDATORY)

> **The Golden Rule of Questions: Ask Nick Fury, not the human.**

Nick Fury is the **single point of contact** for the team. Every agent except
Nick Fury is **forbidden** from asking the human questions directly. If you need
a decision, send `QUESTION_TO_BRAIN` to Nick Fury.

### Why
In L3 Autonomous mode the team must behave like a team with a lead, not 13 parallel
supplicants peppering the human with mid-task questions. Nick Fury answers from
brain/instincts/ADRs/policy — 90% of questions never need the human at all.

### When you (non–Nick Fury agent) want to ask a question

❌ **Don't write:**
> "Should I use PostgreSQL or MongoDB for this?"
> "What name should I use for this component?"
> "Is this approach okay?"

✅ **Instead, send to Nick Fury:**
```
QUESTION_TO_BRAIN
From: <your-agent-name>
Task: <TASK-ID>
Context: <1-2 sentences>
Options:
  A) PostgreSQL — ACID, already in stack, familiar to Spider-Man
  B) MongoDB — flexible schema, but new dependency
Recommendation: A
```

Nick Fury will respond with:
```
BRAIN_ANSWER
Decision: A
Rationale: Matches promoted instinct "prefer-single-db-per-service".
           See _aegis-brain/instincts/promoted/prefer-single-db-per-service.yaml
Applies to: all similar tasks in this project
```

Then proceed. Do NOT pause to ask the human.

### The only four escalation categories (Nick Fury → Human)

Only these four categories ever reach the human — and only Nick Fury escalates them:

| Category | Example |
|----------|---------|
| **Identity** (P10 only) | "What is this project?" on empty repo |
| **Irreversible scope** | "Delete the legacy module permanently?" |
| **External access** | "Provide API keys / credentials" |
| **Explicit approval gate** | "Production deploy approved?" |

Everything else — design trade-offs, naming, libraries, test strategy, file structure,
commit messages, refactor scope — is decided by Nick Fury or delegated back to you.

### Violation consequences
If an agent bypasses Nick Fury and asks the human directly, Nick Fury:
1. Intercepts (via Captain America if in-process)
2. Returns a "route through me" reminder
3. Logs a pending instinct: `agent-must-route-questions-through-brain`
4. On 3+ violations, creates active instinct → hard enforcement

---


## Context Budget Thresholds

| Threshold | Action |
|-----------|--------|
| **0-20%** | Session start zone. Load only essential agent prompts and task context. |
| **20-40%** | Normal working zone. Full agent operation with standard references. |
| **40-60%** | Caution zone. Avoid loading new large files. Summarize instead of quoting. |
| **60%** | **Auto-compact warning.** Notify Captain America. Begin condensing working memory. |
| **80%** | **Emergency compact.** Captain America triggers immediate compaction protocol. |
| **83.5%** | **Hard ceiling.** Reserve remaining 16.5% for response generation. |

## Progressive Disclosure Rules

### Skill Loading
- Scan skills by **Quick Reference only** (~50 tokens each)
- Quick Reference format: `[SkillName]: [one-line description] → [trigger command]`
- Full skill content loaded **only when invoked** by a trigger phrase
- Unload skill content after task completion to reclaim budget

### File Reading
- **Reference-not-content**: store file paths, re-read when actively needed
- Never load an entire file if only a section is relevant
- Use line-range reads: `Read file:lines 45-80` instead of full file
- After processing a file section, summarize findings and release the raw content

### Agent Prompts
- Only the active agent's full prompt is loaded at any time
- Other agents are represented by their Quick Reference (~50 tokens)
- Agent switching: unload current agent prompt, load new agent prompt

## Token Budget Per Agent

- **Max output per report**: 2000 tokens
- **Max context window**: varies by model tier (Claude 4.x)
  - Opus 4.6 agents (Nick Fury, Captain America, Iron Man, Loki): **1M tokens** context
  - Sonnet 4.6 agents (Spider-Man, Black Panther, Wasp, War Machine, Coulson, Thor): **1M tokens** context
  - Haiku 4.5 agents (Beast, Songbird, Vision): **200k tokens** context
- **Max input context per task** (working budget, stay within):
  - Opus/Sonnet agents: up to 8000 tokens input loaded per task
  - Haiku agents: up to 4000 tokens input loaded per task

## Compaction Protocol

When Captain America triggers compaction:

1. **Preserve**: Active task state, pending blockers, critical findings
2. **Summarize**: Completed task results into 1-2 sentence summaries
3. **Release**: Raw file contents, completed review details, resolved discussion threads
4. **Archive**: Full details written to `_aegis-brain/logs/` before release

### Compaction Format
```
[COMPACT] Session state at [timestamp]:
- Active: [list of in-progress tasks with status]
- Completed: [list of done tasks with 1-line summaries]
- Blockers: [list of unresolved blockers]
- Key decisions: [list of decisions made this session]
```

## Emergency Procedures

If context reaches 80% without planned compaction:

1. Captain America immediately pauses all non-critical agent tasks
2. All agents dump current state to `_aegis-brain/logs/emergency-dump.md`
3. Captain America produces a session checkpoint
4. Context is aggressively compacted
5. Only the highest-priority task resumes

## Anti-Patterns (MUST AVOID)

- Loading multiple full files "just in case"
- Copying entire file contents into messages instead of referencing paths
- Keeping resolved discussion threads in active context
- Loading all 8 agent prompts simultaneously
- Repeating information already present in referenced files

## Related References

- @references/adaptive-thinking-guide.md — Effort levels and thinking budget
- @references/context-editing-protocol.md — Mid-session tool result cleanup
