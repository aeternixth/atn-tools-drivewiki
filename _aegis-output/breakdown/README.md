# DriveWiki — Epic / Task / Sub-task Breakdown

| Field | Value |
|-------|-------|
| Project | DriveWiki |
| Generated | 2026-04-17 |
| Agent | Iron Man (AEGIS System Architect) |
| Source | SI-01 Requirements Spec + System Blueprint |
| Total Effort | ~215 story points (Fibonacci) |

---

## Journey Map

| Journey | Description | Epics |
|---------|-------------|-------|
| J-1 | Foundation & Auth | E-001, E-002 |
| J-2 | Core Wiki Engine | E-003, E-004, E-005 |
| J-3 | Enterprise Features | E-006, E-007, E-008 |
| J-4 | UI/UX & Polish | E-009 |

---

## Epic Summary

| Epic ID | Epic Name | Tasks | Story Points | Sprint | FR Coverage |
|---------|-----------|-------|-------------|--------|-------------|
| E-001 | Onboarding & Auth | 5 | 29 | S1 | FR-AUTH-01..10 |
| E-002 | Drive Integration | 4 | 26 | S2 | FR-INGEST-01..06, FR-ADMIN-04 |
| E-003 | Wiki Engine (Core) | 7 | 44 | S2-S3 | FR-WIKI-01..10, FR-INGEST-07..13 |
| E-004 | Chat Engine | 6 | 39 | S4 | FR-CHAT-01..12 |
| E-005 | Search & Index | 2 | 13 | S3 | FR-WIKI-03,06, FR-CHAT-03 |
| E-006 | Admin & Governance | 5 | 21 | S2-S5 | FR-ADMIN-01..10 |
| E-007 | Audit & Compliance | 3 | 16 | S2-S4 | FR-AUDIT-01..08 |
| E-008 | Cost Management | 3 | 13 | S3-S5 | FR-COST-01..05 |
| E-009 | UI/UX Polish | 6 | 14 | S3-S5 | Cross-cutting |
| | **TOTAL** | **41** | **215** | | **78 FRs** |

---

## Detailed Breakdown

### J-1: Foundation & Auth

#### E-001: Onboarding & Auth (Sprint 1, 29 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-001 | Google OAuth SSO Login | 5 | - | FR-AUTH-01, FR-AUTH-02, FR-AUTH-03 |
| T-002 | JWT Token Management | 5 | T-001 | FR-AUTH-04, FR-AUTH-05, FR-AUTH-08, FR-AUTH-09 |
| T-003 | PDPA Consent Flow | 3 | T-001 | FR-AUTH-10, NFR-COMP-04 |
| T-004 | RBAC Role System & Department Scoping | 8 | T-002 | FR-AUTH-06, FR-AUTH-07 |
| T-005 | Workspace Setup Wizard | 8 | T-001, T-004 | FR-ADMIN-01 |

#### E-002: Drive Integration (Sprint 2, 26 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-006 | Google Drive Folder Connection | 8 | T-005 | FR-ADMIN-04, FR-INGEST-01 |
| T-007 | Drive Webhook Listener | 5 | T-006 | FR-INGEST-02 |
| T-008 | Scheduled Sync Fallback | 5 | T-006 | FR-INGEST-03 |
| T-009 | Document Content Extraction | 8 | T-007 | FR-INGEST-04, FR-INGEST-05, FR-INGEST-06 |

---

### J-2: Core Wiki Engine

#### E-003: Wiki Engine Core (Sprint 2-3, 44 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-010 | Wiki Page Data Model (Prisma Schema) | 5 | - | FR-WIKI-01, FR-WIKI-02, FR-WIKI-04 |
| T-011 | LLM Entity Extraction Pipeline | 8 | T-009, T-010 | FR-INGEST-07, FR-INGEST-08 |
| T-012 | LLM Concept Extraction Pipeline | 8 | T-009, T-010 | FR-INGEST-07, FR-INGEST-09 |
| T-013 | Summary Page Generation | 5 | T-009, T-010 | FR-INGEST-10 |
| T-014 | Cross-Reference Management | 8 | T-011, T-012 | FR-WIKI-05, FR-INGEST-11 |
| T-015 | Master Index Generation | 5 | T-010 | FR-WIKI-06, FR-INGEST-12 |
| T-016 | Ingestion Log & Cost Tracking | 5 | T-011 | FR-INGEST-13, FR-INGEST-15 |

#### E-004: Chat Engine (Sprint 4, 39 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-017 | Chat Session Management | 5 | T-002 | FR-CHAT-01, FR-CHAT-09 |
| T-018 | Wiki-First Query Processing | 13 | T-015, T-017 | FR-CHAT-02..06 |
| T-019 | Raw Source Fallback | 8 | T-018 | FR-CHAT-07 |
| T-020 | Knowledge Compounding (Auto-File) | 5 | T-018, T-014 | FR-CHAT-08 |
| T-021 | Chat Streaming Response (SSE) | 5 | T-018 | FR-CHAT-10 |
| T-022 | Answer Rating | 3 | T-021 | FR-CHAT-11, FR-CHAT-12 |

#### E-005: Search & Index (Sprint 3, 13 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-023 | Full-Text Search Service | 8 | T-015 | FR-WIKI-03, FR-CHAT-03 |
| T-024 | Search UI with Autocomplete | 5 | T-023 | NFR-PERF-05 |

---

### J-3: Enterprise Features

#### E-006: Admin & Governance (Sprint 2-5, 21 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-025 | Department Management UI | 5 | T-005 | FR-ADMIN-02, FR-ADMIN-03 |
| T-026 | User Management UI | 5 | T-004, T-025 | FR-ADMIN-09 |
| T-027 | Content Policy Editor | 3 | T-025 | FR-ADMIN-05, FR-INGEST-14 |
| T-028 | Admin Usage Dashboard | 5 | T-026 | FR-ADMIN-06 |
| T-029 | Ingestion Monitor UI | 3 | T-007 | FR-ADMIN-07, FR-ADMIN-08, FR-ADMIN-10 |

#### E-007: Audit & Compliance (Sprint 2-4, 16 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-030 | HMAC Audit Logging Engine | 8 | - | FR-AUDIT-01..03, FR-AUDIT-06..08 |
| T-031 | Audit Log Viewer UI | 5 | T-030 | FR-AUDIT-04 |
| T-032 | Audit Export | 3 | T-031 | FR-AUDIT-05 |

#### E-008: Cost Management (Sprint 3-5, 13 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-033 | Token Usage Tracking | 3 | - | FR-COST-01 |
| T-034 | Cost Dashboard UI | 5 | T-033, T-028 | FR-COST-02, FR-COST-03 |
| T-035 | Department Cost Quota & Alerts | 5 | T-033 | FR-COST-04, FR-COST-05 |

---

### J-4: UI/UX & Polish

#### E-009: UI/UX Polish (Sprint 3-5, 14 pts)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-036 | Wiki Browse UI | 3 | T-010 | SCR-05, SCR-06 |
| T-037 | Bilingual UI (i18n Thai/English) | 3 | - | Cross-cutting |
| T-038 | Dark Mode Support | 2 | - | Cross-cutting |
| T-039 | Responsive Mobile Layout | 2 | - | Cross-cutting |
| T-040 | Empty States & Error Handling UI | 2 | - | Cross-cutting |
| T-041 | Keyboard Navigation & Accessibility | 2 | - | WCAG 2.1 AA |

---

## Lint Engine (Sprint 5, separate from core)

| Task ID | Task Name | Points | Dependencies | FR Links |
|---------|-----------|--------|-------------|----------|
| T-042 | Lint Scheduler & Engine | 5 | T-010 | FR-LINT-01 |
| T-043 | Contradiction Detection | 5 | T-042 | FR-LINT-02 |
| T-044 | Stale Page Detection & Auto-Fix | 3 | T-042 | FR-LINT-03, FR-LINT-07 |
| T-045 | Orphan Page Cleanup | 3 | T-042, T-014 | FR-LINT-04, FR-LINT-05 |
| T-046 | Lint Report UI | 3 | T-042 | FR-LINT-06, FR-LINT-08 |

*Note: Lint tasks are P1 and allocated to Sprint 5. Total additional: 19 points.*

**Grand Total: 41 core tasks + 5 lint tasks = 46 tasks, ~234 story points**

---

## Sprint Allocation

| Sprint | Focus | Tasks | Points |
|--------|-------|-------|--------|
| S1 (2 weeks) | Auth + Onboarding + Project Scaffolding | T-001..T-005, T-010, T-030 | 39 |
| S2 (2 weeks) | Drive Integration + Department Mgmt | T-006..T-009, T-025, T-029 | 32 |
| S3 (2 weeks) | Wiki Engine + Search + Cost | T-011..T-016, T-023..T-024, T-026..T-027, T-033, T-037 | 60 |
| S4 (2 weeks) | Chat Engine + Audit UI + Wiki Browse | T-017..T-022, T-031..T-032, T-036, T-040 | 47 |
| S5 (2 weeks) | Dashboard + Cost + Lint + Polish | T-028, T-034..T-035, T-038..T-039, T-041..T-046 | 56 |

---

*Generated by Iron Man (AEGIS System Architect) on 2026-04-17*
