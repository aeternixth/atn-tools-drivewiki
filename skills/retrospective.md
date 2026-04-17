---
name: retrospective
description: "Sprint/epic retrospective: analyze, generate actionable improvements"
profile: full
triggers:
  en: ["retrospective", "retro", "sprint review", "what went well"]
  th: ["ย้อนดู sprint", "retrospective", "ทบทวน sprint"]
---

## Quick Reference
Structured retrospective analysis for sprints and epics.
- **Analyze**: What worked, what didn't, what to change
- **Patterns**: Recognize recurring themes across retrospectives
- **Actions**: Generate specific, assignable improvement items
- **Archive**: Store in `_aegis-brain/retrospectives/`
- **Output**: `_aegis-output/retrospectives/`
- **Agent**: Captain America (opus) — facilitation; Lumen (sonnet) — analysis

## Full Instructions

### Invocation

```
/retrospective [sprint|epic|project] [identifier]
```
- `sprint` — Sprint retrospective (default)
- `epic` — Epic-level retrospective
- `project` — Full project retrospective

### Phase 1: Data Collection

Gather inputs from:
1. **Sprint tracker** — completion data, velocity, carryover
2. **Activity logs** — agent events, errors, gate results
3. **Code review reports** — quality trends
4. **Bug reports** — defect patterns
5. **Team feedback** — human input (prompted)

### Phase 2: Analysis Framework

Use the 4Ls framework:

```markdown
# Retrospective: <Sprint/Epic N>
**Period**: <start-date> → <end-date>
**Facilitator**: Captain America (AEGIS)

## Liked (What went well)
- <positive outcome 1>
- <positive outcome 2>
- <positive outcome 3>

## Learned (What we discovered)
- <learning 1>
- <learning 2>
- <learning 3>

## Lacked (What was missing)
- <gap 1>
- <gap 2>
- <gap 3>

## Longed For (What we wish we had)
- <wish 1>
- <wish 2>
- <wish 3>
```

### Phase 3: Metrics Review

```markdown
## Sprint Metrics

### Delivery
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Stories completed | <n> | <n> | ✅/❌ |
| Points delivered | <n> | <n> | ✅/❌ |
| Velocity | <n> | <n> | ↑/↓/→ |
| Carryover | 0 | <n> | ✅/❌ |

### Quality
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Bugs found in sprint | <n> | <n> | ✅/❌ |
| Code review pass rate | >90% | <pct>% | ✅/❌ |
| Test coverage delta | +5% | <delta>% | ✅/❌ |
| Critical defects | 0 | <n> | ✅/❌ |

### Process
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Gate pass rate | >80% | <pct>% | ✅/❌ |
| Avg time to review | <4h | <time> | ✅/❌ |
| Blocker resolution | <1d | <time> | ✅/❌ |
```

### Phase 4: Pattern Recognition

Compare with previous retrospectives to find trends:

```markdown
## Recurring Patterns

### Positive Patterns (Keep Doing)
| Pattern | Frequency | Last Seen |
|---------|-----------|-----------|
| <pattern> | <N> sprints | Sprint <N> |

### Negative Patterns (Address)
| Pattern | Frequency | Last Seen | Action Taken? |
|---------|-----------|-----------|---------------|
| <pattern> | <N> sprints | Sprint <N> | Yes/No |

### New This Sprint
| Observation | Category | Recurring Risk |
|------------|----------|---------------|
| <new finding> | <liked/learned/lacked/longed> | Low/Med/High |
```

### Phase 5: Action Items

Generate specific, actionable improvements:

```markdown
## Action Items

### Immediate (This Week)
| # | Action | Owner | Due | Success Criteria |
|---|--------|-------|-----|-----------------|
| A-001 | <specific action> | <person/agent> | <date> | <measurable outcome> |

### Next Sprint
| # | Action | Owner | Priority | Success Criteria |
|---|--------|-------|----------|-----------------|
| A-010 | <specific action> | <person/agent> | High/Med | <measurable outcome> |

### Backlog
| # | Action | Category | Effort |
|---|--------|----------|--------|
| A-020 | <action> | Process/Tooling/Quality | Small/Med/Large |
```

**Action quality criteria:**
- Specific — clear what needs to be done
- Measurable — how to know it's done
- Assigned — someone owns it
- Time-bound — has a deadline
- Relevant — addresses an identified issue

### Phase 6: Knowledge Capture

Extract learnings for the knowledge base:

1. Write key learnings to `_aegis-brain/learnings/retro-sprint-<N>.md`
2. If pattern occurs 3+ times, trigger `/aegis-distill` recommendation
3. Update `_aegis-brain/resonance/team-conventions.md` if process changes agreed

### Output

```
_aegis-output/retrospectives/
  sprint-<N>-retro.md

_aegis-brain/retrospectives/
  sprint-<N>.md  (permanent archive)

_aegis-brain/learnings/
  retro-sprint-<N>.md  (for distillation)
```
