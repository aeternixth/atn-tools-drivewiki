# Quality Protocol — Reviews, Output, Progress & Metrics

> Combined reference for: review methodology, output formatting, progress reporting, performance benchmarks, and token tracking.

---

## 5-Pass Review Checklist

Every review MUST execute all 5 passes in order (used by Black Panther, any review agent):

### Pass 1: Correctness
- Does code match spec? Edge cases handled? Return types correct? Loops terminate? Null states handled?

### Pass 2: Security
- Input validation? Auth checks? Authorization scoping? Sensitive data excluded? Known CVEs? Injection vectors?

### Pass 3: Performance
- N+1 queries? Caching? Pagination? Unnecessary recomputations? Memory leaks?

### Pass 4: Maintainability
- Readable? Clear naming? DRY? Focused modules? No circular deps? Constants extracted?

### Pass 5: SDD Compliance
- Matches approved spec? All interfaces implemented? Deviations documented? Required tests present?

### Finding Format

```
[SEVERITY] [PASS_NAME] — [Description]
Location: [file]:[line_range]
Evidence: [code snippet or reference]
Recommendation: [what to change]
```

### Gate Criteria

| Condition | Result | Action |
|-----------|--------|--------|
| 0 critical findings | PASS | Approved |
| 0 critical + warnings | CONDITIONAL | Approved with follow-up |
| 1+ critical findings | FAIL | Blocked |

Consensus: at least 2 agents agree on PASS. Captain America arbitrates disagreements.

---

## Gate 0 — Pre-Work Documentation (Coulson)

**Gate 0 blocks all other gates.** No task enters IN_PROGRESS until Gate 0 passes.

| Check | Document | Gate 0 Criterion |
|-------|----------|-----------------|
| 0A | PM.01 Project Plan | File exists at `_aegis-output/iso-docs/PM-01-project-plan/plan.md` |
| 0B | SI.01 Requirements Spec | File exists at `_aegis-output/iso-docs/SI-01-requirements-spec/spec.md` |
| 0C | Epic/Task/Sub-task hierarchy | Files exist in `_aegis-brain/tasks/` |
| 0D | Kanban board with tickets | File exists at `_aegis-brain/sprints/current/kanban.md` |
| 0E | SI.02 Traceability Matrix | File exists at `_aegis-output/iso-docs/SI-02-traceability-matrix/matrix.md` |

Gate 0 owner: **Coulson**. Nick Fury enforces. Captain America arbitrates if Coulson is blocked.

---

## Output Format — Standardized Reports

### Report Header

```
[AGENT_EMOJI] [AGENT_NAME] — [REPORT_TITLE]
Timestamp: YYYY-MM-DD HH:MM UTC
Task ID: [reference]
```

### Required Sections (in order)

1. **Summary**: 2-3 sentences, conclusion first, verdict if applicable
2. **Findings**: Bulleted, ordered by severity (critical first)
3. **Recommendations**: Actionable, with who/what/effort
4. **Next Steps**: Who acts, deadlines, dependencies

### Severity Tags

| Tag | Emoji | Action |
|-----|-------|--------|
| Critical | 🔴 | Must fix before proceeding |
| Warning | 🟡 | Fix before next review |
| Suggestion | 🔵 | Consider for future |
| Info | ⚪ | Awareness only |

### Constraints

- Max 2000 tokens per report. Split into `-part1.md`, `-part2.md` if exceeded.
- File naming: `YYYY-MM-DD_HH-MM_[slug].md`
- Output paths: `_aegis-output/[category]/` per agent's designated folder.

---

## Progress Protocol — Heartbeat Reporting

### Report Format

```
[AGENT_EMOJI] [STATUS] — [one-line summary]
   Current: [what was just completed]
   Next: [what happens next]
   Tokens: ~N used / ~N remaining
```

### Status Types

| Status | Emoji | Meaning |
|--------|-------|---------|
| WORKING | 🟢 | Actively executing |
| BLOCKED | 🟡 | Waiting on dependency |
| ERROR | 🔴 | Failure needs attention |
| DONE | ✅ | Completed |
| WAITING | ⏸️ | Awaiting assignment |

### Rules

- Report after each significant step (not every tool call).
- Log destination: `_aegis-brain/logs/activity.log` (append-only).
- If BLOCKED 2+ cycles -> auto-escalate to Captain America.
- If context budget >60% -> notify Captain America.

### Decision Trace

Before significant actions: `Decision: I am about to [ACTION] because [REASON], based on [EVIDENCE].`

---

## Performance Benchmarks

Measured per sprint to prove improvement over time.

### Metrics

| Category | Metric | Target Direction |
|----------|--------|-----------------|
| Speed | Time per point | decrease |
| Speed | Gate pass rate | increase |
| Speed | Rework rate | decrease |
| Quality | G0 first-pass rate | increase |
| Quality | G1 first-pass rate | increase |
| Quality | G2 first-pass rate | increase |
| Quality | Critical findings | decrease |
| Quality | Post-deploy issues | zero |
| Efficiency | Tokens per point | decrease |
| Efficiency | Cache hit rate | increase |
| Learning | Evolved patterns (HIGH) | grow |
| Learning | Anti-patterns detected | grow then plateau |

Storage: `_aegis-brain/metrics/benchmarks.json`

---

## Token Tracking

### When to Track

Every agent phase completion: log agent, task_id, phase (spec/build/review/qa/comply/deploy), estimated tokens.

### How to Estimate

- Record context % at task start and end.
- Opus 4.6 / Sonnet 4.6: `tokens = (end_pct - start_pct) x 1000000`
- Haiku 4.5: `tokens = (end_pct - start_pct) x 200000`

### Key Metric: Tokens Per Story Point

- Sprint 1: baseline (e.g., 15K tokens/point)
- Target: 46% reduction by sprint 3+

Storage: `_aegis-brain/metrics/token-usage.json`

Dashboard: `/aegis-dashboard` shows token usage trends, most expensive agent/phase.
