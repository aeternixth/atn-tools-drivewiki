# SI.02 Traceability Matrix — DriveWiki

| Field | Value |
|-------|-------|
| Document ID | SI-02 |
| Project | DriveWiki |
| Version | 1.0 |
| Date | 2026-04-17 |
| Author | Coulson (AEGIS Compliance Agent) |
| Standard | ISO/IEC 29110 Basic Profile — SI.02 |

---

## Requirements -> Tasks -> Tests -> Code Modules

### AUTH Module

| Req ID | Requirement | Task ID | Test Case | Code Module | Status |
|--------|------------|---------|-----------|-------------|--------|
| FR-AUTH-01 | OAuth redirect to Google | T-001 | _pending_ | _pending_ | TODO |
| FR-AUTH-02 | Exchange OAuth code for tokens | T-001 | _pending_ | _pending_ | TODO |
| FR-AUTH-03 | Create/update user from Google profile | T-001 | _pending_ | _pending_ | TODO |
| FR-AUTH-04 | Issue JWT with user context | T-002 | _pending_ | _pending_ | TODO |
| FR-AUTH-05 | Validate JWT on every request | T-002 | _pending_ | _pending_ | TODO |
| FR-AUTH-06 | Department scoping enforcement | T-004 | _pending_ | _pending_ | TODO |
| FR-AUTH-07 | Role hierarchy enforcement | T-004 | _pending_ | _pending_ | TODO |
| FR-AUTH-08 | Token auto-refresh | T-002 | _pending_ | _pending_ | TODO |
| FR-AUTH-09 | Session revocation on logout | T-002 | _pending_ | _pending_ | TODO |
| FR-AUTH-10 | PDPA consent for first-time users | T-003 | _pending_ | _pending_ | TODO |

### INGEST Module

| Req ID | Requirement | Task ID | Test Case | Code Module | Status |
|--------|------------|---------|-----------|-------------|--------|
| FR-INGEST-01 | Register Drive webhooks | T-006 | _pending_ | _pending_ | TODO |
| FR-INGEST-02 | Queue ingestion on webhook | T-007 | _pending_ | _pending_ | TODO |
| FR-INGEST-03 | Scheduled sync every 15 min | T-008 | _pending_ | _pending_ | TODO |
| FR-INGEST-04 | Download document content | T-009 | _pending_ | _pending_ | TODO |
| FR-INGEST-05 | SHA-256 content hash dedup | T-009 | _pending_ | _pending_ | TODO |
| FR-INGEST-06 | Export Docs/Sheets/Slides to text | T-009 | _pending_ | _pending_ | TODO |
| FR-INGEST-07 | LLM entity/concept/summary extraction | T-011, T-012, T-013 | _pending_ | _pending_ | TODO |
| FR-INGEST-08 | Create/update Entity Pages | T-011 | _pending_ | _pending_ | TODO |
| FR-INGEST-09 | Create/update Concept Pages | T-012 | _pending_ | _pending_ | TODO |
| FR-INGEST-10 | Create Summary Pages | T-013 | _pending_ | _pending_ | TODO |
| FR-INGEST-11 | Update cross-references | T-014 | _pending_ | _pending_ | TODO |
| FR-INGEST-12 | Update Master Index | T-015 | _pending_ | _pending_ | TODO |
| FR-INGEST-13 | Append ingestion log | T-016 | _pending_ | _pending_ | TODO |
| FR-INGEST-14 | Enforce content policies | T-027 | _pending_ | _pending_ | TODO |
| FR-INGEST-15 | Track ingestion cost | T-016 | _pending_ | _pending_ | TODO |

### WIKI Module

| Req ID | Requirement | Task ID | Test Case | Code Module | Status |
|--------|------------|---------|-----------|-------------|--------|
| FR-WIKI-01 | Store pages as markdown in Cloud SQL | T-010 | _pending_ | _pending_ | TODO |
| FR-WIKI-02 | Version every page update | T-010 | _pending_ | _pending_ | TODO |
| FR-WIKI-03 | tsvector index for FTS | T-023 | _pending_ | _pending_ | TODO |
| FR-WIKI-04 | Support page types (Entity, Concept, Summary, Filed, Index) | T-010 | _pending_ | _pending_ | TODO |
| FR-WIKI-05 | Bidirectional cross-references | T-014 | _pending_ | _pending_ | TODO |
| FR-WIKI-06 | Auto-generate Master Index | T-015 | _pending_ | _pending_ | TODO |
| FR-WIKI-07 | Department scoping for pages | T-010 | _pending_ | _pending_ | TODO |
| FR-WIKI-08 | Shared pages across departments | T-010 | _pending_ | _pending_ | TODO |
| FR-WIKI-09 | Track source documents per page | T-010 | _pending_ | _pending_ | TODO |
| FR-WIKI-10 | Page status transitions | T-010 | _pending_ | _pending_ | TODO |

### CHAT Module

| Req ID | Requirement | Task ID | Test Case | Code Module | Status |
|--------|------------|---------|-----------|-------------|--------|
| FR-CHAT-01 | Create chat session | T-017 | _pending_ | _pending_ | TODO |
| FR-CHAT-02 | Accept Thai/English queries | T-018 | _pending_ | _pending_ | TODO |
| FR-CHAT-03 | Search Master Index for relevant pages | T-018 | _pending_ | _pending_ | TODO |
| FR-CHAT-04 | Load wiki pages into LLM context | T-018 | _pending_ | _pending_ | TODO |
| FR-CHAT-05 | Synthesize answer with citations | T-018 | _pending_ | _pending_ | TODO |
| FR-CHAT-06 | Include citations in every answer | T-018 | _pending_ | _pending_ | TODO |
| FR-CHAT-07 | Fallback to raw Drive documents | T-019 | _pending_ | _pending_ | TODO |
| FR-CHAT-08 | Auto-file high-value answers | T-020 | _pending_ | _pending_ | TODO |
| FR-CHAT-09 | Maintain conversation context | T-017 | _pending_ | _pending_ | TODO |
| FR-CHAT-10 | Streaming response via SSE | T-021 | _pending_ | _pending_ | TODO |
| FR-CHAT-11 | Answer rating | T-022 | _pending_ | _pending_ | TODO |
| FR-CHAT-12 | Track chat cost per session | T-022 | _pending_ | _pending_ | TODO |

### ADMIN Module

| Req ID | Requirement | Task ID | Test Case | Code Module | Status |
|--------|------------|---------|-----------|-------------|--------|
| FR-ADMIN-01 | Create workspace | T-005 | _pending_ | _pending_ | TODO |
| FR-ADMIN-02 | CRUD departments | T-025 | _pending_ | _pending_ | TODO |
| FR-ADMIN-03 | Assign users to departments | T-025 | _pending_ | _pending_ | TODO |
| FR-ADMIN-04 | Assign Drive folders to departments | T-006 | _pending_ | _pending_ | TODO |
| FR-ADMIN-05 | Set content policies | T-027 | _pending_ | _pending_ | TODO |
| FR-ADMIN-06 | View usage dashboard | T-028 | _pending_ | _pending_ | TODO |
| FR-ADMIN-07 | Trigger manual re-ingestion | T-029 | _pending_ | _pending_ | TODO |
| FR-ADMIN-08 | Pause/resume ingestion | T-029 | _pending_ | _pending_ | TODO |
| FR-ADMIN-09 | Manage user roles | T-026 | _pending_ | _pending_ | TODO |
| FR-ADMIN-10 | View wiki health (lint) | T-029 | _pending_ | _pending_ | TODO |

### AUDIT Module

| Req ID | Requirement | Task ID | Test Case | Code Module | Status |
|--------|------------|---------|-----------|-------------|--------|
| FR-AUDIT-01 | HMAC-signed log for every action | T-030 | _pending_ | _pending_ | TODO |
| FR-AUDIT-02 | Chain HMAC signatures | T-030 | _pending_ | _pending_ | TODO |
| FR-AUDIT-03 | Verify chain integrity | T-030 | _pending_ | _pending_ | TODO |
| FR-AUDIT-04 | Query audit logs with filters | T-031 | _pending_ | _pending_ | TODO |
| FR-AUDIT-05 | Export audit logs (CSV/JSON) | T-032 | _pending_ | _pending_ | TODO |
| FR-AUDIT-06 | Log failed auth attempts | T-030 | _pending_ | _pending_ | TODO |
| FR-AUDIT-07 | Log wiki modifications | T-030 | _pending_ | _pending_ | TODO |
| FR-AUDIT-08 | Log chat query metadata | T-030 | _pending_ | _pending_ | TODO |

### COST Module

| Req ID | Requirement | Task ID | Test Case | Code Module | Status |
|--------|------------|---------|-----------|-------------|--------|
| FR-COST-01 | Track token usage per LLM call | T-033 | _pending_ | _pending_ | TODO |
| FR-COST-02 | Aggregate cost per user | T-034 | _pending_ | _pending_ | TODO |
| FR-COST-03 | Aggregate cost per department | T-034 | _pending_ | _pending_ | TODO |
| FR-COST-04 | Cost alerts (threshold) | T-035 | _pending_ | _pending_ | TODO |
| FR-COST-05 | Department monthly quota | T-035 | _pending_ | _pending_ | TODO |

### LINT Module

| Req ID | Requirement | Task ID | Test Case | Code Module | Status |
|--------|------------|---------|-----------|-------------|--------|
| FR-LINT-01 | Scheduled lint (cron) | T-042 | _pending_ | _pending_ | TODO |
| FR-LINT-02 | Contradiction detection | T-043 | _pending_ | _pending_ | TODO |
| FR-LINT-03 | Stale page detection | T-044 | _pending_ | _pending_ | TODO |
| FR-LINT-04 | Orphan page detection | T-045 | _pending_ | _pending_ | TODO |
| FR-LINT-05 | Suggest missing cross-refs | T-045 | _pending_ | _pending_ | TODO |
| FR-LINT-06 | Generate lint report | T-046 | _pending_ | _pending_ | TODO |
| FR-LINT-07 | Auto-fix stale pages | T-044 | _pending_ | _pending_ | TODO |
| FR-LINT-08 | Manual lint trigger | T-046 | _pending_ | _pending_ | TODO |

---

## Coverage Summary

| Module | Total FRs | Traced to Tasks | Traced to Tests | Traced to Code |
|--------|-----------|-----------------|-----------------|----------------|
| AUTH | 10 | 10 (100%) | 0 (0%) | 0 (0%) |
| INGEST | 15 | 15 (100%) | 0 (0%) | 0 (0%) |
| WIKI | 10 | 10 (100%) | 0 (0%) | 0 (0%) |
| CHAT | 12 | 12 (100%) | 0 (0%) | 0 (0%) |
| ADMIN | 10 | 10 (100%) | 0 (0%) | 0 (0%) |
| AUDIT | 8 | 8 (100%) | 0 (0%) | 0 (0%) |
| COST | 5 | 5 (100%) | 0 (0%) | 0 (0%) |
| LINT | 8 | 8 (100%) | 0 (0%) | 0 (0%) |
| **Total** | **78** | **78 (100%)** | **0 (0%)** | **0 (0%)** |

*Test cases and code modules will be populated as tasks complete.*

---

*Document generated by Coulson (AEGIS Compliance Agent) on 2026-04-17*
*Standard: ISO/IEC 29110 Basic Profile — SI.02 Traceability Matrix*
