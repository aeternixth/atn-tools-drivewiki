---
name: bug-lifecycle
description: "Bug tracking from report to resolution with root cause analysis"
profile: minimal
triggers:
  en: ["bug report", "fix bug", "debug", "bug lifecycle", "root cause"]
  th: ["แก้บัก", "จัดการบัก", "รายงานบัก", "หาสาเหตุ"]
---

## Quick Reference
End-to-end bug lifecycle management: report, reproduce, analyze, fix, verify.
- **Phases**: Report → Triage → Reproduce → Root Cause → Fix → Verify → Close
- **Severity**: P0 (critical) / P1 (high) / P2 (medium) / P3 (low)
- **RCA**: Structured root cause analysis with 5-Whys technique
- **Output**: Bug report in `_aegis-output/bugs/`
- **Verification**: Fix must include regression test

## Full Instructions

### Invocation

```
/bug-lifecycle [report|triage|investigate|fix|verify] <description>
```

### Phase 1: Bug Report

Generate a structured bug report:

```markdown
# Bug Report: <BUG-ID>

## Summary
<One-line description>

## Environment
- **OS**: <os/version>
- **Runtime**: <node/python/browser version>
- **Branch**: <branch name>
- **Commit**: <commit hash>

## Steps to Reproduce
1. <step 1>
2. <step 2>
3. <step 3>

## Expected Behavior
<what should happen>

## Actual Behavior
<what actually happens>

## Evidence
- Screenshots: <if applicable>
- Logs: <relevant log output>
- Error message: <exact error>

## Severity
<P0|P1|P2|P3> — <justification>

## Impact
- Users affected: <scope>
- Functionality blocked: <what breaks>
- Workaround available: <yes/no — describe>
```

### Phase 2: Triage

Severity classification:

| Priority | Label | Response Time | Examples |
|----------|-------|---------------|---------|
| P0 | 🔴 Critical | Immediate | Data loss, security breach, full outage |
| P1 | 🟠 High | < 4 hours | Major feature broken, significant perf degradation |
| P2 | 🟡 Medium | < 24 hours | Minor feature broken, UI glitch with workaround |
| P3 | 🔵 Low | Next sprint | Cosmetic, edge case, minor inconvenience |

**Triage checklist:**
1. Confirm bug is reproducible
2. Assign severity based on impact
3. Check for duplicates
4. Assign to appropriate agent/developer
5. Set target resolution date

### Phase 3: Reproduce

Reliable reproduction is mandatory before investigation:

1. **Isolate** — Identify minimum steps to reproduce
2. **Confirm** — Reproduce at least 2 times consecutively
3. **Document** — Record exact reproduction steps
4. **Environment** — Note any environment-specific factors
5. **Automate** — Write a failing test that demonstrates the bug

```typescript
// Example: Failing test that proves the bug
test('BUG-001: user login fails with special characters in password', () => {
  const result = loginUser('test@example.com', 'p@ss!w0rd&');
  expect(result.success).toBe(true); // Currently fails
});
```

### Phase 4: Root Cause Analysis

Use the 5-Whys technique:

```markdown
## Root Cause Analysis: <BUG-ID>

### 5-Whys
1. **Why** did the login fail? → Password validation rejected special characters
2. **Why** were special characters rejected? → Regex pattern was too restrictive
3. **Why** was the regex restrictive? → Copied from an outdated security guideline
4. **Why** wasn't this caught? → No test coverage for special character passwords
5. **Why** no test coverage? → Test suite only used alphanumeric test data

### Root Cause
<Concise statement of the actual root cause>

### Contributing Factors
- <factor 1>
- <factor 2>

### Classification
- [ ] Logic error
- [ ] Missing validation
- [ ] Race condition
- [ ] Data corruption
- [ ] Configuration error
- [ ] Dependency issue
- [ ] Environment issue
```

### Phase 5: Fix Implementation

Fix protocol:
1. Create branch: `bugfix/<BUG-ID>-<short-description>`
2. Write failing test FIRST (from reproduction step)
3. Implement minimum fix for the root cause
4. Ensure failing test now passes
5. Run full test suite — no regressions
6. Commit with conventional format: `fix(<scope>): <description>`
7. Reference bug ID in commit footer: `Fixes: BUG-001`

**Fix quality checklist:**
- [ ] Addresses root cause (not just symptoms)
- [ ] Includes regression test
- [ ] No unrelated changes in the fix
- [ ] Performance impact assessed
- [ ] Security implications reviewed

### Phase 6: Verification

Post-fix verification:
1. Run the originally failing test — must pass
2. Run full test suite — no regressions
3. Manual verification of the original reproduction steps
4. Verify in the same environment where bug was reported
5. Check related functionality for side effects

### Phase 7: Close

```markdown
## Resolution: <BUG-ID>

**Status**: RESOLVED
**Fix**: <commit hash / PR link>
**Root Cause**: <one-line summary>
**Regression Test**: <test file:test name>
**Verified By**: <agent/human>
**Closed Date**: YYYY-MM-DD

### Lessons Learned
- <what to do differently to prevent similar bugs>

### Prevention Actions
- [ ] <action to prevent recurrence>
```

### Output

All bug artifacts are saved to `_aegis-output/bugs/`:
```
_aegis-output/bugs/
  BUG-001/
    report.md
    rca.md
    resolution.md
```
