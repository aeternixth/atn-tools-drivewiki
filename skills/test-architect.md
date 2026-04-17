---
name: test-architect
description: "Test strategy, architecture, and automation framework design"
profile: standard
triggers:
  en: ["test strategy", "test plan", "test architect", "testing framework"]
  th: ["วางแผนเทสต์", "test strategy", "สร้างเทสต์", "ออกแบบเทสต์"]
---

## Quick Reference
Designs comprehensive test strategies and automation frameworks.
- **Test Pyramid**: Unit (70%) → Integration (20%) → E2E (10%)
- **Coverage targets**: Configurable per project maturity
- **Framework selection**: Based on detected tech stack
- **Deliverables**: Test plan, framework config, sample tests
- **Output**: `_aegis-output/test-strategy/`
- **Agent**: Black Panther (sonnet) — primary; Iron Man (opus) for strategy

## Full Instructions

### Invocation

```
/test-architect [strategy|setup|generate|coverage] [target]
```
- `strategy` — Design test strategy document (default)
- `setup` — Configure test framework for the project
- `generate` — Generate test cases from code/spec
- `coverage` — Analyze current coverage and gaps

### Phase 1: Test Strategy Design

#### Test Pyramid

```
         /  E2E  \          10% — Critical user journeys
        /----------\
       / Integration \      20% — Module boundaries, API contracts
      /----------------\
     /     Unit Tests    \  70% — Business logic, pure functions
    /----------------------\
```

#### Strategy Document

```markdown
# Test Strategy
**Project**: <name>
**Stack**: <detected>
**Date**: YYYY-MM-DD

## Coverage Targets
| Level | Target | Current | Gap |
|-------|--------|---------|-----|
| Unit | 80% | <current>% | <gap>% |
| Integration | 60% | <current>% | <gap>% |
| E2E | Critical paths | <count> | <missing> |

## Framework Selection
| Level | Framework | Runner | Reason |
|-------|-----------|--------|--------|
| Unit | <framework> | <runner> | <why> |
| Integration | <framework> | <runner> | <why> |
| E2E | <framework> | <runner> | <why> |

## Test Categories
### Unit Tests
- Pure functions and utilities
- Service methods (mocked dependencies)
- Data transformations
- Validation logic
- Error handling paths

### Integration Tests
- API endpoint contracts
- Database operations
- External service interactions (mocked)
- Middleware chains
- Authentication/authorization flows

### E2E Tests
- Critical user journeys (login, purchase, etc.)
- Cross-module workflows
- Happy path + top failure scenarios

## Mocking Strategy
| Dependency | Mock Method | When |
|-----------|------------|------|
| Database | In-memory / test DB | Integration |
| External APIs | MSW / nock | Integration |
| File system | memfs / tmp dirs | Unit |
| Time | Fake timers | Unit |

## Test Data Strategy
- Factories for consistent test data generation
- Fixtures for complex data structures
- Seeded database for integration tests
- Avoid sharing state between tests
```

### Phase 2: Framework Setup

#### TypeScript/Node.js
```
Recommended:
- Unit/Integration: Vitest or Jest
- E2E (API): Supertest
- E2E (UI): Playwright
- Mocking: MSW (API), vi.mock/jest.mock (modules)
- Coverage: c8 or istanbul
```

#### Python
```
Recommended:
- Unit/Integration: pytest
- E2E (API): httpx + pytest
- E2E (UI): Playwright for Python
- Mocking: pytest-mock, responses
- Coverage: pytest-cov
```

#### React
```
Recommended:
- Component: React Testing Library + Vitest
- Hooks: @testing-library/react-hooks
- E2E: Playwright or Cypress
- Visual: Storybook + Chromatic
- Coverage: c8
```

### Phase 3: Test Case Generation

For each function/module, generate:

```markdown
### Test Suite: <ModuleName>

#### Happy Path
- TEST: <description> — GIVEN <context> WHEN <action> THEN <result>

#### Edge Cases
- TEST: handles empty input — GIVEN empty array WHEN process() THEN returns []
- TEST: handles null — GIVEN null input WHEN validate() THEN throws ValidationError

#### Error Cases
- TEST: network failure — GIVEN API unavailable WHEN fetch() THEN retries 3 times
- TEST: invalid data — GIVEN malformed JSON WHEN parse() THEN returns error result

#### Boundary Cases
- TEST: max length — GIVEN string at max length WHEN validate() THEN passes
- TEST: over max length — GIVEN string over max WHEN validate() THEN fails
```

### Phase 4: Coverage Analysis

1. Run existing test suite
2. Identify uncovered code paths
3. Prioritize by risk:
   - 🔴 High risk uncovered: auth, payment, data mutation
   - 🟡 Medium risk uncovered: business logic, validation
   - 🔵 Low risk uncovered: utilities, formatting
4. Generate test suggestions for gaps

### Output

```
_aegis-output/test-strategy/
  test-strategy.md
  framework-config.md
  test-cases/
    <module>.test-cases.md
  coverage-report.md
```
