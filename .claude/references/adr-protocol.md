# ADR Protocol -- Architecture Decision Records

## Purpose
Every significant technical decision gets recorded, debated, and searchable.
Prevents "why did we choose X?" questions 3 months later.

## When to Create an ADR
- Technology choice (SQL vs NoSQL, React vs Vue)
- Architecture pattern (monolith vs microservice)
- API design decision (REST vs GraphQL)
- Infrastructure choice (AWS vs GCP vs self-hosted)
- Any decision that took >5 minutes to debate

## ADR Format
File: `_aegis-brain/adrs/ADR-NNN-{slug}.md`

```markdown
---
id: ADR-NNN
title: {Decision title}
status: PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED
date: YYYY-MM-DD
deciders: [agent names who participated]
supersedes: ADR-NNN (if applicable)
superseded_by: ADR-NNN (if applicable)
---

## Context
{What is the problem? Why does this decision need to be made?}

## Decision
{What was decided?}

## Options Considered
| Option | Pros | Cons | Risk |
|--------|------|------|------|
| A | ... | ... | ... |
| B | ... | ... | ... |

## Consequences
{What are the implications of this decision?}
- Positive: ...
- Negative: ...
- Neutral: ...

## Validation
How we'll know this was the right call:
- Metric 1: ...
- Metric 2: ...
- Review date: YYYY-MM-DD (3 months from decision)
```

## Integration with AEGIS
- `/aegis-team-debate` auto-generates ADR from debate outcome
- Iron Man reads all ADRs before designing (avoid contradicting past decisions)
- ADR counter in `counters.json` (`ADR: N`)
- ADRs are searchable by Nick Fury during SCAN
