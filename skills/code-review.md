---
name: code-review
description: "5-pass code review: correctness, security, performance, maintainability, SDD"
profile: minimal
triggers:
  en: ["review code", "code review", "check code", "review PR"]
  th: ["รีวิวโค้ด", "ตรวจโค้ด", "ตรวจสอบโค้ด"]
---

## Quick Reference
5-pass structured code review pipeline with severity ratings.
- **Pass 1**: Correctness — logic bugs, edge cases, error handling
- **Pass 2**: Security — injection, auth, data exposure, OWASP
- **Pass 3**: Performance — O(n) issues, memory leaks, N+1 queries
- **Pass 4**: Maintainability — naming, structure, DRY, documentation
- **Pass 5**: SDD Compliance — architecture alignment, pattern adherence
- **Severity**: Critical / Warning / Suggestion
- **Gate**: 0 critical = PASS, 1+ critical = FAIL
- **Output**: `_aegis-output/review-report.md`

## Full Instructions

### Invocation

```
/code-review <target>
```
Where `<target>` can be:
- A file path: `/code-review src/api/users.ts`
- A directory: `/code-review src/api/`
- A PR/branch: `/code-review PR#42` or `/code-review feature/auth`
- Staged changes: `/code-review --staged`

### Pass 1: Correctness

Focus: Does the code do what it is supposed to do?

**Checklist:**
- [ ] Logic errors — incorrect conditionals, off-by-one, wrong operators
- [ ] Edge cases — null/undefined, empty arrays, boundary values
- [ ] Error handling — uncaught exceptions, missing try/catch, error propagation
- [ ] Type safety — type mismatches, unsafe casts, missing type guards
- [ ] Race conditions — async/await misuse, shared state, deadlocks
- [ ] Data integrity — mutations where immutability expected, stale data
- [ ] API contracts — request/response shape matches spec

### Pass 2: Security

Focus: Can this code be exploited?

**Checklist:**
- [ ] Injection — SQL, NoSQL, command, XSS, template injection
- [ ] Authentication — missing auth checks, weak token handling
- [ ] Authorization — privilege escalation, IDOR, missing RBAC checks
- [ ] Data exposure — sensitive data in logs, responses, error messages
- [ ] Secrets — hardcoded API keys, passwords, tokens
- [ ] Input validation — missing sanitization, size limits, type validation
- [ ] Dependencies — known CVEs in packages
- [ ] OWASP Top 10 alignment

### Pass 3: Performance

Focus: Will this code perform well at scale?

**Checklist:**
- [ ] Algorithm complexity — O(n^2) or worse in hot paths
- [ ] Database queries — N+1 queries, missing indexes, full table scans
- [ ] Memory — leaks, unbounded caches, large object retention
- [ ] Network — unnecessary API calls, missing caching, no pagination
- [ ] Rendering — unnecessary re-renders, missing memoization (React)
- [ ] Bundle size — large imports, tree-shaking blockers
- [ ] Concurrency — blocking operations on main thread

### Pass 4: Maintainability

Focus: Can another developer understand and modify this code?

**Checklist:**
- [ ] Naming — descriptive variable/function names, consistent conventions
- [ ] Structure — single responsibility, appropriate abstraction level
- [ ] DRY — duplicated logic that should be extracted
- [ ] Documentation — missing JSDoc/docstrings for public APIs
- [ ] Complexity — functions >50 lines, deeply nested conditionals
- [ ] Test coverage — untested logic, missing edge case tests
- [ ] Code style — consistent with project standards

### Pass 5: SDD Compliance

Focus: Does this code align with the system design?

**Checklist:**
- [ ] Architecture — follows defined patterns (MVC, Clean Architecture, etc.)
- [ ] Module boundaries — no circular dependencies, proper layering
- [ ] API design — RESTful conventions, consistent error format
- [ ] Data models — matches schema definitions, proper relationships
- [ ] Configuration — environment-based config, no hardcoded values
- [ ] Logging — structured logging, appropriate log levels
- [ ] Observability — metrics, tracing, health checks where required

### Severity Classification

| Level | Icon | Criteria | Action Required |
|-------|------|----------|-----------------|
| Critical | 🔴 | Bugs, security holes, data loss risk | Must fix before merge |
| Warning | 🟡 | Performance issues, code smells, minor risks | Should fix, may defer |
| Suggestion | 🔵 | Style, minor improvements, nice-to-have | Optional, at author discretion |

### Output Format

Generate `_aegis-output/review-report.md`:

```markdown
# Code Review Report
**Date**: YYYY-MM-DD
**Reviewer**: Black Panther (AEGIS)
**Target**: <file/PR/branch>
**Verdict**: PASS | FAIL | CONDITIONAL

## Summary
- 🔴 Critical: <count>
- 🟡 Warning: <count>
- 🔵 Suggestion: <count>

## Findings

### Pass 1: Correctness
#### 🔴 [CRIT-001] <title>
- **File**: `<path>:<line>`
- **Issue**: <description>
- **Fix**: <suggested fix>

### Pass 2: Security
...

### Pass 3: Performance
...

### Pass 4: Maintainability
...

### Pass 5: SDD Compliance
...

## Gate Decision
<PASS/FAIL/CONDITIONAL with justification>
```

### Gate Logic

```
IF critical_count == 0:
    verdict = "PASS"
ELIF critical_count > 0:
    verdict = "FAIL"
    block_merge = true
IF critical_count == 0 AND warning_count > 0:
    verdict = "CONDITIONAL"
    note = "Human review recommended for warnings"
```

### Multi-Agent Review

For high-stakes reviews, invoke the `aegis-review` team:
1. **Beast** (haiku): Fast scan — gather metrics, identify hotspots
2. **Loki** (opus): Adversarial — challenge assumptions, find edge cases
3. **Black Panther** (sonnet): Synthesize — combine findings, enforce gate, write report

Two-agent consensus required for PASS on critical findings.
