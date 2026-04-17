---
name: code-coverage
description: "Test coverage analyzer with auto-suggested missing test cases"
profile: full
triggers:
  en: ["code coverage", "test coverage", "coverage report", "missing tests"]
  th: ["ครอบคลุมเทสต์", "coverage", "รายงาน coverage"]
---

## Quick Reference
Analyzes test coverage and suggests missing test cases.
- **Run**: Execute test suite with coverage instrumentation
- **Analyze**: Identify uncovered lines, branches, functions
- **Prioritize**: Rank uncovered code by risk and importance
- **Suggest**: Generate specific test cases for uncovered paths
- **Output**: `_aegis-output/coverage/`
- **Agent**: Black Panther (sonnet) — analysis; Spider-Man (sonnet) — test generation

## Full Instructions

### Invocation

```
/code-coverage [analyze|suggest|generate|report] [target]
```
- `analyze` — Run coverage and analyze gaps (default)
- `suggest` — Suggest test cases for uncovered code
- `generate` — Generate test code for suggested cases
- `report` — Generate formatted coverage report

### Phase 1: Run Coverage

Execute the test suite with coverage instrumentation:

#### TypeScript/JavaScript
```bash
# Vitest
npx vitest run --coverage

# Jest
npx jest --coverage

# c8 + node
npx c8 node src/index.ts
```

#### Python
```bash
# pytest
pytest --cov=src --cov-report=json --cov-report=html

# coverage.py
coverage run -m pytest && coverage report
```

### Phase 2: Analyze Coverage

Parse coverage output and identify gaps:

```markdown
## Coverage Summary
| Metric | Covered | Total | Percentage |
|--------|---------|-------|------------|
| Lines | <n> | <n> | <pct>% |
| Branches | <n> | <n> | <pct>% |
| Functions | <n> | <n> | <pct>% |
| Statements | <n> | <n> | <pct>% |

## Per-File Coverage
| File | Lines | Branches | Functions | Risk |
|------|-------|----------|-----------|------|
| <file> | <pct>% | <pct>% | <pct>% | 🔴/🟡/🟢 |
```

#### Risk Classification

| Coverage | Risk | Priority |
|----------|------|----------|
| < 30% | 🔴 High Risk | Immediate attention |
| 30-60% | 🟡 Medium Risk | Plan for next sprint |
| 60-80% | 🔵 Low Risk | Incremental improvement |
| > 80% | 🟢 Good | Maintain |

### Phase 3: Gap Analysis

For each uncovered section, analyze:

```markdown
## Uncovered Code Analysis

### File: <path>

#### Uncovered Function: <functionName> (line <N>-<M>)
- **Purpose**: <what this function does>
- **Risk**: 🔴 High — handles payment processing
- **Reason uncovered**: <why no test exists>
- **Suggested tests**:
  1. Happy path: <description>
  2. Error case: <description>
  3. Edge case: <description>

#### Uncovered Branch: <file>:<line> (else branch)
- **Condition**: `if (user.role === 'admin')`
- **Uncovered path**: Non-admin user flow
- **Risk**: 🟡 Medium — authorization logic
- **Suggested test**: Test with regular user role
```

### Phase 4: Test Suggestions

Generate specific test case descriptions:

```markdown
## Suggested Test Cases

### Priority 1 (High Risk, No Coverage)
| # | File | Function/Line | Test Description | Type |
|---|------|--------------|-----------------|------|
| TC-001 | auth.service.ts | validateToken:45 | Invalid JWT signature | Unit |
| TC-002 | payment.service.ts | processPayment:78 | Insufficient funds | Unit |
| TC-003 | api/users.ts | DELETE /users/:id | Delete non-existent user | Integration |

### Priority 2 (Medium Risk)
| # | File | Function/Line | Test Description | Type |
|---|------|--------------|-----------------|------|
| TC-010 | utils/date.ts | formatDate:12 | Leap year date | Unit |
```

### Phase 5: Test Generation

For each suggested test, generate implementation:

```typescript
// TC-001: Invalid JWT signature
describe('AuthService.validateToken', () => {
  it('should reject token with invalid signature', async () => {
    // Arrange
    const invalidToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiMSJ9.invalid';

    // Act
    const result = await authService.validateToken(invalidToken);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_SIGNATURE');
  });
});
```

### Coverage Targets by Project Maturity

| Maturity | Line | Branch | Function |
|----------|------|--------|----------|
| Prototype | 30% | 20% | 40% |
| MVP | 50% | 40% | 60% |
| Production | 70% | 60% | 80% |
| Critical System | 85% | 80% | 90% |

### Report Format

```markdown
# Coverage Report
**Date**: YYYY-MM-DD
**Analyzer**: Black Panther (AEGIS)
**Target**: <project/directory>

## Overall Coverage
<summary table>

## Gap Analysis
<top uncovered areas by risk>

## Suggested Tests
<prioritized test suggestions>

## Generated Tests
<test files created>

## Recommendations
- <actionable next steps>
```

### Output

```
_aegis-output/coverage/
  coverage-report.md
  gap-analysis.md
  suggested-tests.md
  generated/
    <test-files>
```
