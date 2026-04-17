# Sprint 1 Kanban Board — DriveWiki

| Field | Value |
|-------|-------|
| Sprint | S1 |
| Start | 2026-04-17 |
| End | 2026-05-01 |
| Goal | Auth foundation + data model + audit engine |
| Velocity Target | 39 story points |
| WIP Limit | 3 |
| Review Limit | 2 |

---

## TODO

| Task ID | Task Name | Points | Priority | Assignee | Dependencies | FR Links |
|---------|-----------|--------|----------|----------|-------------|----------|
| T-030 | HMAC Audit Logging Engine | 8 | P0 | Spider-Man | None | FR-AUDIT-01..03,06..08 |
| T-001 | Google OAuth SSO Login | 5 | P0 | Spider-Man | None | FR-AUTH-01,02,03 |
| T-002 | JWT Token Management | 5 | P0 | Spider-Man | T-001 | FR-AUTH-04,05,08,09 |
| T-003 | PDPA Consent Flow | 3 | P0 | Spider-Man | T-001 | FR-AUTH-10 |
| T-004 | RBAC Role System & Dept Scoping | 8 | P0 | Spider-Man | T-002 | FR-AUTH-06,07 |
| T-005 | Workspace Setup Wizard | 8 | P0 | Spider-Man | T-001, T-004 | FR-ADMIN-01 |

## WIP (max 3)

| Task ID | Task Name | Points | Assignee | Started | Notes |
|---------|-----------|--------|----------|---------|-------|
| _(empty)_ | | | | | |

## BLOCKED

| Task ID | Task Name | Points | Blocked By | Since | Notes |
|---------|-----------|--------|-----------|-------|-------|
| _(empty)_ | | | | | |

## REVIEW (max 2)

| Task ID | Task Name | Points | Reviewer | Gate | Notes |
|---------|-----------|--------|----------|------|-------|
| _(empty)_ | | | | | |

## DONE

| Task ID | Task Name | Points | Completed | Gate Results |
|---------|-----------|--------|-----------|-------------|
| T-010 | Wiki Page Data Model (Prisma Schema) | 5 | 2026-04-17 | Gate 1: PASS (tsc clean) |

---

## Sprint Metrics

| Metric | Value |
|--------|-------|
| Total Points | 42 |
| Completed | 5 |
| Remaining | 37 |
| Burndown | 1 task done |

---

## Task Dependency Graph (Sprint 1)

```
T-010 (Prisma Schema) -----> (no deps, start first)
T-030 (HMAC Audit) ---------> (no deps, start first)
T-001 (OAuth Login) --------> (no deps, start first)
  |
  +---> T-002 (JWT) ---------> T-004 (RBAC) --+
  |                                             |
  +---> T-003 (PDPA Consent)                   |
                                                |
                                    T-005 (Setup Wizard) <-- T-001 + T-004
```

**Recommended execution order:**
1. T-010 + T-030 + T-001 (parallel, no dependencies)
2. T-002 + T-003 (after T-001)
3. T-004 (after T-002)
4. T-005 (after T-001 + T-004)
