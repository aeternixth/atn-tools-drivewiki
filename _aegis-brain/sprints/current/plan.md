# Sprint 1 Plan — DriveWiki

| Field | Value |
|-------|-------|
| Sprint | S1 |
| Duration | 2 weeks (2026-04-17 to 2026-05-01) |
| Goal | Establish authentication foundation, data model, and audit engine |
| Velocity Target | 39-42 story points |

## Sprint Goal
Deliver a working authentication system (OAuth + JWT + RBAC), complete database schema (Prisma + Cloud SQL), and HMAC audit logging engine. These are foundational components that every subsequent sprint depends on.

## Tasks

| Task | Points | Priority | Dependencies |
|------|--------|----------|-------------|
| T-010: Wiki Page Data Model | 5 | P0 | None |
| T-030: HMAC Audit Logging Engine | 8 | P0 | None |
| T-001: Google OAuth SSO Login | 5 | P0 | None |
| T-002: JWT Token Management | 5 | P0 | T-001 |
| T-003: PDPA Consent Flow | 3 | P0 | T-001 |
| T-004: RBAC Role System | 8 | P0 | T-002 |
| T-005: Workspace Setup Wizard | 8 | P0 | T-001, T-004 |
| **Total** | **42** | | |

## Definition of Done (Sprint)
- All 7 tasks in DONE
- Gate 1 (code review) passed for all tasks
- Gate 2 (QA) passed for tasks >= 3 pts (all of them)
- ISO docs updated (Gate 3)
- No critical bugs open

## Risks
- Google Workspace test domain needed for OAuth testing
- GCP project with Cloud SQL required for Prisma migration
- PDPA consent form content requires legal review (can stub for now)
