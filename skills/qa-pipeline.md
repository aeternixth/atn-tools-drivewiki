---
name: qa-pipeline
description: "End-to-end QA pipeline — test planning, execution, review, and release gating"
profile: full
triggers:
  en: ["QA pipeline", "test pipeline", "quality pipeline", "run QA", "full QA"]
  th: ["คิวเอ", "ทดสอบทั้งหมด", "ไปป์ไลน์ทดสอบ"]
---

## Quick Reference
End-to-end quality assurance pipeline from test planning to release gate.
- **Plan**: War Machine analyzes scope and produces a test plan
- **Execute**: Vision runs all test cases, captures raw results
- **Review**: War Machine interprets results, identifies patterns
- **Verdict**: PASS / CONDITIONAL / FAIL gate decision
- **Test Types**: Functional, Integration, Regression, Acceptance
- **Output**: `_aegis-output/qa/sprint-N/`
- **Agents**: War Machine (sonnet) — QA Lead; Vision (haiku) — Executor

## Full Instructions

### Invocation

```
/qa-pipeline [full|functional|integration|regression|acceptance] [target]
```
- `full` — Complete QA pipeline, all test types (default)
- `functional` — Functional tests only
- `integration` — Integration tests only
- `regression` — Regression tests only
- `acceptance` — Acceptance criteria tests only

### Pipeline Flow

```
War Machine (Plan) --> Vision (Execute) --> War Machine (Review) --> Verdict
```

#### Phase 1: Test Planning (War Machine)

War Machine analyzes the target scope and produces a test plan:

1. **Scope Analysis**
   - Identify changed files (git diff against base branch)
   - Map changes to modules/features
   - Determine blast radius of changes

2. **Test Strategy**
   - Select appropriate test types based on change scope
   - Prioritize: critical paths first, edge cases second
   - Estimate execution time

3. **Test Plan Output**
   ```markdown
   # Test Plan — Sprint N
   **Date**: YYYY-MM-DD
   **Scope**: <description of what is being tested>
   **Strategy**: <test types selected and rationale>

   ## Test Cases
   | ID     | Type        | Description              | Priority | Expected Result |
   |--------|-------------|--------------------------|----------|-----------------|
   | TC-001 | Functional  | User login with valid creds | P0    | 200 OK, token returned |
   | TC-002 | Functional  | User login with bad password | P0   | 401 Unauthorized |
   | TC-003 | Integration | API -> DB write consistency  | P1   | Data persisted correctly |
   | TC-004 | Regression  | Cart total after discount    | P1   | Matches expected amount |

   ## Acceptance Criteria
   - [ ] All P0 tests pass
   - [ ] Pass rate >= 95%
   - [ ] No regression in existing features
   - [ ] Coverage does not decrease
   ```

#### Phase 2: Test Execution (Vision)

Vision receives the test plan and executes:

1. **Environment Detection**
   - Identify test runner (jest, vitest, pytest, cargo test, go test, etc.)
   - Check for test configuration files
   - Verify test dependencies are installed

2. **Execution**
   - Run each test case from the plan
   - Capture raw output for every test
   - Record: status, duration, error messages, stack traces
   - Flag flaky tests (pass on retry after initial failure)

3. **Raw Results Output**
   ```markdown
   # Test Results — Raw
   **Executed by**: Vision
   **Date**: YYYY-MM-DD HH:MM
   **Runner**: <test runner name>

   ## Summary
   | Status | Count |
   |--------|-------|
   | PASS   | <n>   |
   | FAIL   | <n>   |
   | SKIP   | <n>   |
   | ERROR  | <n>   |
   | Total  | <n>   |
   | Duration | <time> |

   ## Detailed Results
   | ID     | Name                | Status | Duration | Error |
   |--------|---------------------|--------|----------|-------|
   | TC-001 | user_login_valid    | PASS   | 120ms    | —     |
   | TC-002 | user_login_invalid  | FAIL   | 85ms     | Expected 401, got 500 |

   ## Failed Test Details
   ### TC-002: user_login_invalid
   - **Error**: Expected 401, got 500
   - **Stack Trace**: <verbatim stack trace>
   - **stdout**: <captured output>
   ```

#### Phase 3: Review & Verdict (War Machine)

War Machine reviews Vision's raw results and issues a verdict:

1. **Result Analysis**
   - Calculate pass rate
   - Classify failures: regression vs. new feature vs. flaky
   - Identify failure patterns (same module, same error type)
   - Compare against acceptance criteria

2. **Verdict Decision**
   - **PASS** — All acceptance criteria met, no critical failures
   - **CONDITIONAL** — Minor failures only, human review recommended
   - **FAIL** — Critical failures, regressions, or acceptance criteria not met

3. **QA Report Output**
   ```markdown
   # QA Report — Sprint N
   **Date**: YYYY-MM-DD
   **Reviewer**: War Machine (AEGIS)
   **Verdict**: PASS | CONDITIONAL | FAIL

   ## Executive Summary
   <2-3 sentences: overall quality assessment>

   ## Metrics
   | Metric          | Value    | Threshold | Status |
   |-----------------|----------|-----------|--------|
   | Pass Rate       | 98%      | >= 95%    | PASS   |
   | P0 Tests        | 12/12    | 100%      | PASS   |
   | Regressions     | 0        | 0         | PASS   |
   | Coverage Delta  | +1.2%    | >= 0%     | PASS   |
   | Flaky Tests     | 1        | <= 2      | PASS   |

   ## Failure Analysis
   ### TC-002: user_login_invalid
   - **Classification**: Bug (new)
   - **Severity**: High
   - **Root Cause**: Error handler returns 500 instead of 401
   - **Recommendation**: Fix error mapping in auth middleware

   ## Verdict
   PASS / CONDITIONAL / FAIL
   <justification>

   ## Recommendations
   - <actionable next steps>
   ```

### Test Types Reference

#### Functional Tests
- Verify individual features work as specified
- Input/output validation
- Business logic correctness
- Error handling paths

#### Integration Tests
- API endpoint integration
- Database read/write consistency
- Service-to-service communication
- External dependency mocking

#### Regression Tests
- Previously passing tests still pass
- Fixed bugs stay fixed
- Performance baselines maintained
- No unintended side effects from changes

#### Acceptance Tests
- User story criteria met
- End-to-end workflows complete
- UI/UX requirements satisfied
- Non-functional requirements (performance, accessibility)

### Output Structure

```
_aegis-output/qa/sprint-N/
  test-plan.md          # War Machine's test plan
  raw-results.md        # Vision's raw execution results
  qa-report.md          # War Machine's final review and verdict
  coverage/             # Coverage reports (if available)
```

### Gate Integration

QA pipeline integrates with release gates:
- PASS = Release can proceed
- CONDITIONAL = Human must review flagged items before release
- FAIL = Release blocked until failures are resolved
