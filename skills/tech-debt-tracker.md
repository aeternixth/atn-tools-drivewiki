---
name: tech-debt-tracker
description: "Technical debt radar: TODO/FIXME, complexity hotspots, outdated deps"
profile: standard
triggers:
  en: ["tech debt", "technical debt", "TODO scan", "code health", "debt tracker"]
  th: ["หนี้เทคนิค", "tech debt", "สแกน TODO", "สุขภาพโค้ด"]
---

## Quick Reference
Scans codebase for technical debt indicators and produces a health score.
- **Markers**: TODO, FIXME, HACK, WORKAROUND, XXX comments
- **Complexity**: Cyclomatic complexity hotspots (functions >10)
- **Dependencies**: Outdated packages, deprecated APIs
- **Debt Score**: 0-100 health rating (higher = healthier)
- **Output**: `_aegis-output/tech-debt-report.md`
- **Agent**: Lumen (sonnet) — analysis; Beast (haiku) — data gathering

## Full Instructions

### Invocation

```
/tech-debt-tracker [scan|report|trend] [target]
```
- `scan` — Full debt scan (default)
- `report` — Generate formatted report from last scan
- `trend` — Compare with previous scans (if available)

### Phase 1: Marker Scan

Search for debt markers in source code:

| Marker | Severity | Meaning |
|--------|----------|---------|
| `TODO` | 🔵 Low | Planned improvement |
| `FIXME` | 🟡 Medium | Known bug, needs fix |
| `HACK` | 🟠 High | Workaround, fragile |
| `WORKAROUND` | 🟠 High | Temporary solution |
| `XXX` | 🔴 Critical | Dangerous, needs immediate attention |
| `@deprecated` | 🟡 Medium | Should be removed/replaced |

For each marker found:
```markdown
| File | Line | Marker | Age | Content |
|------|------|--------|-----|---------|
| <path> | <line> | TODO | <days since commit> | <comment text> |
```

### Phase 2: Complexity Analysis

Identify functions/methods with high cyclomatic complexity:

**Thresholds:**
| Complexity | Rating | Action |
|-----------|--------|--------|
| 1-5 | 🟢 Simple | No action |
| 6-10 | 🟡 Moderate | Monitor |
| 11-20 | 🟠 Complex | Refactor recommended |
| 21+ | 🔴 Very Complex | Refactor required |

**Analysis targets:**
- Functions with >10 cyclomatic complexity
- Files with >300 lines
- Classes with >10 methods
- Deeply nested code (>4 levels)
- Functions with >5 parameters

### Phase 3: Dependency Health

Check for:
1. **Outdated packages**: Compare installed vs latest versions
2. **Deprecated packages**: No longer maintained
3. **Security vulnerabilities**: Known CVEs (cross-ref with security-audit)
4. **License issues**: Incompatible licenses

```markdown
| Package | Current | Latest | Behind | Status |
|---------|---------|--------|--------|--------|
| <pkg> | 1.0.0 | 3.2.1 | 2 major | 🔴 Outdated |
| <pkg> | 2.1.0 | 2.1.5 | 5 patch | 🟡 Minor |
| <pkg> | 4.0.0 | 4.0.0 | 0 | 🟢 Current |
```

### Phase 4: Debt Score Calculation

```
Score = 100 - penalties

Penalties:
- Each XXX marker:     -5 points
- Each HACK/WORKAROUND: -3 points
- Each FIXME:          -2 points
- Each TODO (>30 days): -1 point
- Each function complexity >20: -5 points
- Each function complexity 11-20: -2 points
- Each major version behind (dep): -3 points
- Each known CVE: -5 points (critical), -3 points (high)

Minimum score: 0
```

**Score Interpretation:**
| Score | Health | Meaning |
|-------|--------|---------|
| 90-100 | 🟢 Excellent | Minimal debt, well maintained |
| 70-89 | 🟡 Good | Some debt, manageable |
| 50-69 | 🟠 Fair | Significant debt, plan remediation |
| 30-49 | 🔴 Poor | High debt, blocking velocity |
| 0-29 | ⛔ Critical | Severe debt, urgent remediation needed |

### Report Format

```markdown
# Technical Debt Report
**Date**: YYYY-MM-DD
**Analyst**: Lumen (AEGIS)
**Health Score**: <score>/100 <emoji>

## Summary
| Category | Count | Severity |
|----------|-------|----------|
| Markers (TODO/FIXME/etc.) | <n> | <distribution> |
| Complexity Hotspots | <n> | <distribution> |
| Outdated Dependencies | <n> | <major/minor/patch> |
| Security Vulnerabilities | <n> | <crit/high/med/low> |

## Top 10 Debt Items (by Impact)
| # | Type | Location | Impact | Effort |
|---|------|----------|--------|--------|
| 1 | <type> | <file:line> | High | <hours> |
| ... |

## Marker Distribution
<breakdown by type and directory>

## Complexity Hotspots
<top 10 most complex functions>

## Dependency Health
<summary table>

## Recommended Actions
### Immediate (This Sprint)
- <action 1>

### Short-term (Next Sprint)
- <action 2>

### Long-term (Backlog)
- <action 3>

## Trend
<comparison with previous scan if available>
```

### Output

```
_aegis-output/tech-debt-report.md
_aegis-brain/learnings/debt-scan-YYYY-MM-DD.md  (for trend tracking)
```
