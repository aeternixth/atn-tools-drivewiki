---
name: adversarial-review
description: "Devil's advocate: challenge every design decision and assumption"
profile: full
triggers:
  en: ["adversarial review", "devil's advocate", "challenge", "stress test design"]
  th: ["ท้าทายการตัดสินใจ", "adversarial", "ทดสอบข้อสมมติ"]
---

## Quick Reference
Systematic challenge of design decisions, assumptions, and implementations.
- **Challenge**: Question every assumption and decision rationale
- **Edge cases**: Identify scenarios the design does not handle
- **Failure modes**: Propose how the system can break
- **Counter-arguments**: Generate alternative approaches
- **Output**: `_aegis-output/adversarial-review.md`
- **Agent**: Loki (opus) — primary challenger

## Full Instructions

### Invocation

```
/adversarial-review [design|code|spec|architecture] <target>
```
- `design` — Challenge system design decisions
- `code` — Find edge cases and failure modes in implementation
- `spec` — Challenge requirements and assumptions in specs
- `architecture` — Challenge architecture decisions

### Phase 1: Assumption Extraction

Read the target and extract every implicit and explicit assumption:

```markdown
## Assumptions Found

### Explicit Assumptions
| # | Assumption | Source | Validated? |
|---|-----------|--------|------------|
| A-001 | <assumption> | <file:line> | Yes/No |

### Implicit Assumptions
| # | Assumption | Why Risky | Impact if Wrong |
|---|-----------|-----------|-----------------|
| A-010 | <hidden assumption> | <why it might not hold> | <consequences> |
```

**Common implicit assumptions to check:**
- Network is always available
- Database transactions always succeed
- User input is within expected range
- External services respond within timeout
- Data is always in expected format
- Concurrent users won't conflict
- Time zones are handled correctly
- Unicode/special characters are supported
- Disk space is sufficient
- Memory is sufficient for data size

### Phase 2: Edge Case Discovery

For each component/feature, systematically explore edges:

```markdown
## Edge Cases

### Boundary Conditions
| # | Scenario | Expected Behavior | Actual/Likely | Risk |
|---|----------|-------------------|---------------|------|
| E-001 | Empty input | <expected> | <likely behavior> | 🟡 |
| E-002 | Max size input | <expected> | <likely behavior> | 🔴 |
| E-003 | Concurrent access | <expected> | <likely behavior> | 🔴 |

### Race Conditions
| # | Scenario | Components | Impact |
|---|----------|-----------|--------|
| R-001 | <scenario> | <components involved> | <impact> |

### Data Edge Cases
- Null/undefined values in required fields
- Empty strings vs null
- Extremely long strings
- Special characters (unicode, emoji, RTL)
- Negative numbers where positive expected
- Zero values
- Date boundary cases (leap year, DST, timezone)
- Large datasets (10x expected volume)
```

### Phase 3: Failure Mode Analysis

Systematic failure mode enumeration:

```markdown
## Failure Modes

### Infrastructure Failures
| # | Failure | Probability | Impact | Detection | Recovery |
|---|---------|-------------|--------|-----------|----------|
| F-001 | Database down | Medium | Critical | Health check | Retry + fallback |
| F-002 | API timeout | High | High | Timeout alert | Circuit breaker |

### Application Failures
| # | Failure | Trigger | Impact | Mitigation |
|---|---------|---------|--------|------------|
| F-010 | Memory leak | Long-running process | Crash | Monitoring + restart |
| F-011 | Deadlock | Concurrent transactions | Hang | Timeout + retry |

### Data Failures
| # | Failure | Trigger | Impact | Prevention |
|---|---------|---------|--------|------------|
| F-020 | Data corruption | Partial write | Data loss | Transactions + backups |
| F-021 | Schema mismatch | Migration error | Crash | Schema validation |

### Security Failures
| # | Failure | Attack Vector | Impact | Prevention |
|---|---------|--------------|--------|------------|
| F-030 | Auth bypass | Token manipulation | Full access | Token validation |
```

### Phase 4: Counter-Arguments

For each major design decision, generate alternatives:

```markdown
## Counter-Arguments

### Decision: <what was decided>
**Current rationale**: <why it was chosen>

#### Alternative 1: <different approach>
- **Pros**: <advantages over current>
- **Cons**: <disadvantages>
- **When better**: <scenarios where this wins>

#### Alternative 2: <another approach>
- **Pros**: <advantages>
- **Cons**: <disadvantages>
- **When better**: <scenarios>

#### Verdict
<Is the original decision still the best? Why or why not?>
```

### Phase 5: Stress Test Scenarios

```markdown
## Stress Test Scenarios

### Load Scenarios
1. **10x traffic spike**: What happens when traffic increases 10x in 5 minutes?
2. **Sustained peak**: 100% capacity for 24 hours — what degrades first?
3. **Data explosion**: Dataset grows 100x — what breaks?

### Chaos Scenarios
1. **Kill random service**: Remove one microservice — cascade effects?
2. **Network partition**: Split between regions — data consistency?
3. **Clock skew**: Nodes disagree on time — ordering issues?
4. **Disk full**: Primary storage fills up — graceful degradation?

### Human Scenarios
1. **Operator error**: Wrong config deployed — rollback time?
2. **Key rotation**: Credentials expire — automatic or manual?
3. **On-call response**: Alert at 3 AM — can someone fix it remotely?
```

### Report Format

```markdown
# Adversarial Review Report
**Date**: YYYY-MM-DD
**Reviewer**: Loki (AEGIS)
**Target**: <what was reviewed>
**Risk Level**: Critical / High / Medium / Low

## Summary
- Assumptions challenged: <N>
- Edge cases found: <N>
- Failure modes identified: <N>
- Counter-arguments raised: <N>

## Top Risks
| # | Risk | Severity | Likelihood | Recommendation |
|---|------|----------|------------|----------------|
| 1 | <risk> | 🔴 | High | <action> |

## Detailed Findings
<all phases above>

## Recommendations
### Must Address (Before Ship)
- <item>

### Should Address (Before Scale)
- <item>

### Nice to Have (Future)
- <item>
```

### Output

```
_aegis-output/adversarial-review.md
```
