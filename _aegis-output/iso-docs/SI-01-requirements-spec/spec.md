# SI.01 Requirements Specification — DriveWiki

| Field | Value |
|-------|-------|
| Document ID | SI-01 |
| Project | DriveWiki — Enterprise Google Drive Knowledge Management |
| Version | 1.0 |
| Date | 2026-04-17 |
| Author | Coulson (AEGIS Compliance Agent) |
| Status | APPROVED |
| Source | docs/specs/SUPER-SPEC.md (lines 1-2257), docs/SYSTEM-BLUEPRINT.md, docs/specs/FRONTEND-SPEC.md |
| Standard | ISO/IEC 29110 Basic Profile — SI.01 |

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for DriveWiki, an Enterprise Google Drive Knowledge Management System based on Karpathy's LLM Wiki Pattern (April 2026). It serves as the single source of truth for all development, testing, and acceptance activities.

### 1.2 Document Conventions
- **FR-XXX-NN**: Functional Requirement (module-number)
- **NFR-XXX-NN**: Non-Functional Requirement (category-number)
- **Priority**: P0 (must-have for MVP), P1 (important, can ship without), P2 (nice-to-have)
- All requirements trace back to SUPER-SPEC.md sections via `[Source: ...]` annotations

### 1.3 References
| Ref | Document | Location |
|-----|----------|----------|
| SS | Super Spec v1.0 | docs/specs/SUPER-SPEC.md |
| SB | System Blueprint | docs/SYSTEM-BLUEPRINT.md |
| FS | Frontend Spec | docs/specs/FRONTEND-SPEC.md |

---

## 2. Scope

### 2.1 In-Scope (v1.0 MVP)
1. Google Workspace integration (Drive, Docs, Sheets, Slides)
2. LLM Wiki compilation using Karpathy's Three-Layer Pattern (Raw Sources -> Wiki -> Schema)
3. Chat interface with wiki-first query processing and raw-source fallback
4. Department-scoped RBAC with role hierarchy (SuperAdmin > Admin > DeptHead > Member > Viewer)
5. HMAC-SHA256 tamper-evident audit trail with chain integrity
6. Per-department LLM cost tracking with quotas and alerts
7. Admin dashboard (users, departments, usage metrics, lint reports)
8. Thai + English bilingual UI
9. Google Cloud deployment (Cloud Run, Cloud SQL PostgreSQL 16, Vertex AI Gemini, GCS, Redis)
10. PDPA compliance (consent management, data residency, right to erasure)

[Source: SS Section 4.3, lines 666-690]

### 2.2 Out-of-Scope (v1.0)
- Microsoft 365 / Slack / Teams integration
- Custom LLM fine-tuning
- Mobile native app (PWA only)
- Video/audio content analysis
- Real-time collaborative wiki editing
- Multi-cloud / on-premise deployment
- Third-party marketplace

[Source: SS Section 4.3, lines 686-690]

---

## 3. Stakeholders

| Stakeholder | Role | Primary Need | Interaction |
|------------|------|-------------|-------------|
| IT Admin | Install, configure, maintain system | Easy setup, monitoring, cost control | Daily |
| Department Head | Manage department knowledge scope | Knowledge overview, content policies | Weekly |
| Knowledge Worker | Primary user — search, ask, read wiki | Fast, accurate, contextualized answers | Daily (5-20 queries) |
| Executive | View usage overview, ROI metrics | Dashboard, cost justification | Monthly |
| Compliance Officer | Audit trail review, data governance | HMAC logs, access reports, PDPA compliance | Weekly |
| Google Workspace Admin | Grant API permissions, domain-wide delegation | Clear setup instructions | One-time + maintenance |

[Source: SS Section 3.1, lines 234-243]

---

## 4. Functional Requirements

### 4.1 Module: AUTH — Authentication & Authorization

| ID | Requirement | Priority | Acceptance Criteria | Source |
|----|------------|----------|---------------------|--------|
| FR-AUTH-01 | System shall redirect users to Google OAuth 2.0 consent screen on login | P0 | User clicks login -> Google consent screen appears | SS 5.1 line 773 |
| FR-AUTH-02 | System shall exchange OAuth code for access/refresh tokens and create JWT session | P0 | Valid OAuth code -> JWT issued with userId, email, departmentId, role, exp (8h) | SS 5.1 line 774 |
| FR-AUTH-03 | System shall create/update user record from Google profile data | P0 | On valid OAuth -> user record created or updated with latest profile | SS 5.1 line 775 |
| FR-AUTH-04 | System shall issue JWT tokens containing userId, departmentId, role with 8h expiry | P0 | JWT payload verified to contain required claims | SS 5.1 line 776 |
| FR-AUTH-05 | System shall validate JWT on every API request | P0 | Invalid/expired JWT -> 401 response | SS 5.1 line 777 |
| FR-AUTH-06 | System shall enforce department scoping — users access only their department data | P0 | Cross-department request -> 403 response | SS 5.1 line 778 |
| FR-AUTH-07 | System shall support role hierarchy: SuperAdmin > Admin > DeptHead > Member > Viewer | P0 | Each role can only perform permitted actions | SS 5.1 line 779 |
| FR-AUTH-08 | System shall auto-refresh tokens before expiry using refresh token | P0 | Token near expiry -> new access token issued transparently | SS 5.1 line 780 |
| FR-AUTH-09 | System shall revoke session and blacklist JWT on logout | P0 | After logout -> old JWT returns 401 | SS 5.1 line 781 |
| FR-AUTH-10 | System shall display PDPA consent form for first-time users; deny access without consent | P0 | First login -> consent form shown; no consent -> logout with explanation | SS 5.1 line 782 |

### 4.2 Module: INGEST — Document Ingestion

| ID | Requirement | Priority | Acceptance Criteria | Source |
|----|------------|----------|---------------------|--------|
| FR-INGEST-01 | System shall register Google Drive webhooks for monitored folders | P0 | Folder assigned -> webhook active and receiving notifications | SS 5.2 line 788 |
| FR-INGEST-02 | System shall queue ingestion jobs on webhook notification of file changes | P0 | Webhook payload received -> ingestion job in queue | SS 5.2 line 789 |
| FR-INGEST-03 | System shall run scheduled sync every 15 minutes as webhook fallback | P0 | Cron fires -> changed files since last sync identified | SS 5.2 line 790 |
| FR-INGEST-04 | System shall download document content via Google Drive API (Docs, Sheets, Slides) | P0 | Valid file ID -> text content extracted in memory | SS 5.2 line 791 |
| FR-INGEST-05 | System shall compute SHA-256 content hash to skip re-ingestion of unchanged content | P0 | Same content -> hash matches -> skip; different -> proceed | SS 5.2 line 792 |
| FR-INGEST-06 | System shall export Google Docs as plain text, Sheets as CSV, Slides as text | P0 | Each type -> appropriate text extraction | SS 5.2 line 793 |
| FR-INGEST-07 | System shall send document content to LLM for entity, concept, and summary extraction | P0 | Document text -> structured analysis (entities, concepts, summary) | SS 5.2 line 794 |
| FR-INGEST-08 | System shall create/update Entity Pages from LLM analysis results | P0 | Entity list -> wiki entity pages created or merged | SS 5.2 line 795 |
| FR-INGEST-09 | System shall create/update Concept Pages from LLM analysis results | P0 | Concept list -> wiki concept pages created or enriched | SS 5.2 line 796 |
| FR-INGEST-10 | System shall create Summary Page for every ingested document | P0 | Document ingested -> summary page (max 500 words) created | SS 5.2 line 797 |
| FR-INGEST-11 | System shall update cross-references between related wiki pages after ingestion | P0 | Pages created/updated -> cross-refs current | SS 5.2 line 798 |
| FR-INGEST-12 | System shall update Master Index after creating/updating wiki pages | P0 | Pages changed -> index reflects latest within 30 seconds | SS 5.2 line 799 |
| FR-INGEST-13 | System shall append entry to ingestion log after each ingestion | P0 | Ingestion complete -> log entry with metadata | SS 5.2 line 800 |
| FR-INGEST-14 | System shall enforce department content policies before ingesting documents | P1 | Policy match (e.g., CONFIDENTIAL) -> document skipped | SS 5.2 line 801 |
| FR-INGEST-15 | System shall track ingestion cost (tokens used) per department | P0 | Ingestion LLM call -> CostEvent recorded | SS 5.2 line 802 |

### 4.3 Module: WIKI — Wiki Store & Management

| ID | Requirement | Priority | Acceptance Criteria | Source |
|----|------------|----------|---------------------|--------|
| FR-WIKI-01 | System shall store wiki pages as markdown in Cloud SQL with metadata | P0 | Page data valid -> persisted with type, title, content, metadata, sourceDocIds, version | SS 5.3 line 808 |
| FR-WIKI-02 | System shall version every wiki page update, preserving history | P0 | Page updated -> old version preserved, version incremented | SS 5.3 line 809 |
| FR-WIKI-03 | System shall maintain tsvector index for full-text search (Thai + English) | P0 | Page created/updated -> search vector updated | SS 5.3 line 810 |
| FR-WIKI-04 | System shall support wiki page types: Entity, Concept, Summary, Filed, Index | P0 | Each type -> type-specific rendering and behavior | SS 5.3 line 811 |
| FR-WIKI-05 | System shall maintain bidirectional cross-references between pages | P0 | Cross-ref created -> navigation works both directions | SS 5.3 line 812 |
| FR-WIKI-06 | System shall auto-generate and maintain Master Index page | P0 | Pages exist -> index reflects all pages with title, type, keywords | SS 5.3 line 813 |
| FR-WIKI-07 | System shall scope wiki pages to departments | P0 | Page belongs to one department; queries scoped accordingly | SS 5.3 line 814 |
| FR-WIKI-08 | System shall support shared pages visible across departments (admin approval) | P1 | Admin marks page shared -> visible to all departments | SS 5.3 line 815 |
| FR-WIKI-09 | System shall track source documents for every wiki page (provenance) | P0 | Page created from ingestion -> source doc IDs recorded | SS 5.3 line 816 |
| FR-WIKI-10 | System shall support page status transitions: Active, Stale, Flagged, Archived | P0 | Valid status transition -> status updated | SS 5.3 line 817 |

### 4.4 Module: CHAT — Chat & Query Engine

| ID | Requirement | Priority | Acceptance Criteria | Source |
|----|------------|----------|---------------------|--------|
| FR-CHAT-01 | System shall create chat session when user starts new conversation | P0 | Authenticated user -> session created with unique ID | SS 5.4 line 823 |
| FR-CHAT-02 | System shall accept natural language queries in Thai and English | P0 | Query in Thai or English -> parsed and ready for processing | SS 5.4 line 824 |
| FR-CHAT-03 | System shall search Master Index to find relevant wiki pages for query | P0 | Query text -> ranked page IDs (top-K) returned | SS 5.4 line 825 |
| FR-CHAT-04 | System shall load relevant wiki pages into LLM context for answer synthesis | P0 | Page IDs identified -> contents loaded into Gemini context | SS 5.4 line 826 |
| FR-CHAT-05 | System shall synthesize answers from wiki context with citations | P0 | Context + query -> answer text with wiki page citations | SS 5.4 line 827 |
| FR-CHAT-06 | System shall include citations to wiki pages and raw sources in every answer | P0 | Answer generated -> formatted citations with clickable links | SS 5.4 line 828 |
| FR-CHAT-07 | System shall fallback to raw Drive documents when wiki confidence is insufficient | P0 | Low wiki confidence -> Drive API fetch -> re-synthesize with source indicator | SS 5.4 line 829 |
| FR-CHAT-08 | System shall auto-file high-value chat answers as new wiki pages (knowledge compounding) | P1 | LLM evaluates high-value -> Filed wiki page created + index updated | SS 5.4 line 830 |
| FR-CHAT-09 | System shall maintain conversation context within a session | P1 | Previous messages -> context-aware subsequent responses | SS 5.4 line 831 |
| FR-CHAT-10 | System shall support streaming response via Server-Sent Events | P0 | Query -> tokens stream in real-time via SSE | SS 5.4 line 832 |
| FR-CHAT-11 | System shall allow users to rate answers (thumbs up/down + optional comment) | P1 | Rating submitted -> feedback stored for analysis | SS 5.4 line 833 |
| FR-CHAT-12 | System shall track chat cost (tokens used) per user per session | P0 | Chat complete -> CostEvent recorded with token counts | SS 5.4 line 834 |

### 4.5 Module: ADMIN — Administration

| ID | Requirement | Priority | Acceptance Criteria | Source |
|----|------------|----------|---------------------|--------|
| FR-ADMIN-01 | Admin shall be able to create workspace (initial setup) | P0 | OAuth complete -> workspace record created | SS 5.5 line 840 |
| FR-ADMIN-02 | Admin shall be able to create/edit/delete departments | P0 | CRUD operations -> department configured or soft-deleted | SS 5.5 line 841 |
| FR-ADMIN-03 | Admin shall be able to assign users to departments | P0 | User ID + dept ID -> user record updated | SS 5.5 line 842 |
| FR-ADMIN-04 | Admin shall be able to assign/unassign Drive folders to departments | P0 | Folder ID + dept ID -> monitoring started or stopped | SS 5.5 line 843 |
| FR-ADMIN-05 | Admin shall be able to set content policies per department | P1 | Policy JSON saved -> enforced on next ingestion | SS 5.5 line 844 |
| FR-ADMIN-06 | Admin shall be able to view usage dashboard (queries, users, pages, cost) | P0 | Date range -> usage statistics rendered | SS 5.5 line 845 |
| FR-ADMIN-07 | Admin shall be able to trigger manual re-ingestion for folder/document | P1 | Resource ID -> ingestion job queued | SS 5.5 line 846 |
| FR-ADMIN-08 | Admin shall be able to pause/resume ingestion per department | P1 | Department ID + action -> sync status updated | SS 5.5 line 847 |
| FR-ADMIN-09 | Admin shall be able to manage user roles | P0 | User ID + new role -> role changed + audit logged | SS 5.5 line 848 |
| FR-ADMIN-10 | Admin shall be able to view/manage wiki health (lint results) | P1 | Department ID -> lint report visible | SS 5.5 line 849 |

### 4.6 Module: AUDIT — Audit Logging

| ID | Requirement | Priority | Acceptance Criteria | Source |
|----|------------|----------|---------------------|--------|
| FR-AUDIT-01 | System shall log every user action with HMAC-SHA256 signature | P0 | Action performed -> AuditLog entry with HMAC created | SS 5.6 line 855 |
| FR-AUDIT-02 | System shall chain HMAC signatures (each entry signs content + previous HMAC) | P0 | New entry -> chained HMAC computed from content + previous hash | SS 5.6 line 856 |
| FR-AUDIT-03 | System shall verify HMAC chain integrity on demand | P0 | Date range -> integrity report (pass/fail per entry) | SS 5.6 line 857 |
| FR-AUDIT-04 | Admin shall be able to query audit logs with filters (user, action, date, resource) | P0 | Filters applied -> relevant entries returned with pagination | SS 5.6 line 858 |
| FR-AUDIT-05 | Admin shall be able to export audit logs as CSV/JSON via signed GCS URL | P0 | Date range + format -> downloadable file (signed URL, 24h expiry) | SS 5.6 line 859 |
| FR-AUDIT-06 | System shall log failed authentication attempts | P0 | Login fails -> audit entry recorded | SS 5.6 line 860 |
| FR-AUDIT-07 | System shall log wiki page modifications | P0 | Page modified -> change type logged in audit | SS 5.6 line 861 |
| FR-AUDIT-08 | System shall log chat query metadata (privacy-safe, no full content) | P0 | Query made -> metadata logged | SS 5.6 line 862 |

### 4.7 Module: COST — Cost Tracking

| ID | Requirement | Priority | Acceptance Criteria | Source |
|----|------------|----------|---------------------|--------|
| FR-COST-01 | System shall track token usage per LLM call | P0 | LLM call complete -> CostEvent (input/output tokens, model, user, dept) recorded | SS 5.7 line 868 |
| FR-COST-02 | System shall aggregate cost per user per day/week/month | P0 | Aggregation query -> cost summary available | SS 5.7 line 869 |
| FR-COST-03 | System shall aggregate cost per department per day/week/month | P0 | Aggregation query -> department cost summary available | SS 5.7 line 870 |
| FR-COST-04 | System shall support threshold-based cost alerts | P1 | Threshold exceeded -> alert notification sent | SS 5.7 line 871 |
| FR-COST-05 | System shall support per-department monthly cost quota with enforcement | P1 | Quota reached -> requests blocked with user message | SS 5.7 line 872 |

### 4.8 Module: LINT — Wiki Quality

| ID | Requirement | Priority | Acceptance Criteria | Source |
|----|------------|----------|---------------------|--------|
| FR-LINT-01 | System shall run scheduled wiki lint per configurable cron (default weekly) | P1 | Cron fires -> lint job starts per department | SS 5.8 line 878 |
| FR-LINT-02 | System shall detect contradictions between wiki pages | P1 | Page pairs analyzed -> contradictions listed with evidence | SS 5.8 line 879 |
| FR-LINT-03 | System shall detect stale pages (source modified after wiki update) | P1 | Source newer than wiki -> page flagged as stale | SS 5.8 line 880 |
| FR-LINT-04 | System shall detect orphan pages (no incoming cross-references) | P1 | No incoming refs -> page flagged as orphan | SS 5.8 line 881 |
| FR-LINT-05 | System shall suggest missing cross-references | P1 | Content analysis -> suggested ref list | SS 5.8 line 882 |
| FR-LINT-06 | System shall generate lint report accessible from admin dashboard | P1 | Lint complete -> formatted report viewable | SS 5.8 line 883 |
| FR-LINT-07 | System shall auto-fix stale pages by re-ingesting from source | P1 | Stale page + source accessible -> page refreshed automatically | SS 5.8 line 884 |
| FR-LINT-08 | Admin shall be able to trigger manual lint run per department | P1 | Department ID -> lint job started | SS 5.8 line 885 |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target | Measurement | Priority | Source |
|----|------------|--------|-------------|----------|--------|
| NFR-PERF-01 | Chat query response time (wiki-first) | < 3 seconds (p95) | Time from query to first streamed token | P0 | SS 3.6 line 583 |
| NFR-PERF-02 | Chat query response time (raw-source fallback) | < 8 seconds (p95) | Time with Drive API fetch included | P0 | SS 3.6 line 584 |
| NFR-PERF-03 | Single document ingestion time | < 30 seconds | From webhook trigger to wiki pages updated | P0 | SS 3.6 line 585 |
| NFR-PERF-04 | Wiki page load time | < 500ms | API response time for single page | P0 | SS 3.6 line 586 |
| NFR-PERF-05 | Search result time | < 1 second | From query to ranked results returned | P0 | SS 3.6 line 587 |
| NFR-PERF-06 | Dashboard load time | < 2 seconds | Full page render including data fetch | P1 | SS 3.6 line 588 |

### 5.2 Availability

| ID | Requirement | Target | Priority | Source |
|----|------------|--------|----------|--------|
| NFR-AVAIL-01 | System uptime | 99.5% (monthly) | P0 | SS 3.6 line 594 |
| NFR-AVAIL-02 | Planned maintenance window | < 1 hour/month, off-peak only | P1 | SS 3.6 line 595 |
| NFR-AVAIL-03 | RTO (Recovery Time Objective) | < 4 hours | P0 | SS 3.6 line 596 |
| NFR-AVAIL-04 | RPO (Recovery Point Objective) | < 1 hour | P0 | SS 3.6 line 597 |

### 5.3 Security

| ID | Requirement | Target | Priority | Source |
|----|------------|--------|----------|--------|
| NFR-SEC-01 | Authentication method | Google Workspace SSO (OAuth 2.0) only | P0 | SS 3.6 line 603 |
| NFR-SEC-02 | Authorization model | RBAC with department scoping | P0 | SS 3.6 line 604 |
| NFR-SEC-03 | Data encryption at rest | AES-256 (Cloud SQL + GCS default) | P0 | SS 3.6 line 605 |
| NFR-SEC-04 | Data encryption in transit | TLS 1.3 | P0 | SS 3.6 line 606 |
| NFR-SEC-05 | Audit trail integrity | HMAC-SHA256 signed log entries with chain | P0 | SS 3.6 line 607 |
| NFR-SEC-06 | Secrets management | Google Secret Manager | P0 | SS 3.6 line 608 |
| NFR-SEC-07 | API rate limiting | 100 req/min per user, 1000 req/min per department | P0 | SS 3.6 line 609 |

### 5.4 Scalability

| ID | Requirement | Target | Priority | Source |
|----|------------|--------|----------|--------|
| NFR-SCALE-01 | Concurrent users | 500 simultaneous | P0 | SS 3.6 line 616 |
| NFR-SCALE-02 | Total documents per workspace | 100,000+ | P0 | SS 3.6 line 617 |
| NFR-SCALE-03 | Wiki pages per department | 50,000+ | P0 | SS 3.6 line 618 |
| NFR-SCALE-04 | Departments per workspace | 100+ | P1 | SS 3.6 line 619 |
| NFR-SCALE-05 | Cloud Run auto-scaling | 1-50 instances | P0 | SS 3.6 line 620 |

### 5.5 Compliance

| ID | Requirement | Target | Priority | Source |
|----|------------|--------|----------|--------|
| NFR-COMP-01 | PDPA compliance | Data residency in SEA region | P0 | SS 3.6 line 626 |
| NFR-COMP-02 | Data retention policy | Configurable per workspace (default 7 years) | P1 | SS 3.6 line 627 |
| NFR-COMP-03 | Right to erasure | User data deletion within 30 days of request | P1 | SS 3.6 line 628 |
| NFR-COMP-04 | Consent management | Explicit consent at first login | P0 | SS 3.6 line 629 |
| NFR-COMP-05 | Cross-border data transfer | Restricted to configured GCP regions | P0 | SS 3.6 line 630 |

---

## 6. Constraints

| # | Constraint | Detail | Source |
|---|-----------|--------|--------|
| CON-01 | Single Integration | Google Workspace only — no M365, Slack, etc. in v1 | SS 1.3 line 103 |
| CON-02 | Cloud Provider | Google Cloud Platform exclusively | SS 1.3 line 104 |
| CON-03 | Language Runtime | Node.js/TypeScript — no Python services in v1 | SS 1.3 line 105 |
| CON-04 | ORM | Prisma — no raw queries except full-text search | SS 1.3 line 106 |
| CON-05 | LLM Provider | Vertex AI (Gemini) — no OpenAI or Anthropic in v1 | SS 1.3 line 107 |
| CON-06 | Auth | Google Workspace SSO only — no local accounts | SS 1.3 line 108 |
| CON-07 | Data Residency | GCP region asia-southeast1 (Singapore) or asia-southeast2 (Jakarta) | SS 1.3 line 109 |
| CON-08 | Streaming | Server-Sent Events only — no WebSocket (Cloud Run limitation) | SS Do's/Don'ts line 2176 |
| CON-09 | Wiki Ownership | LLM Agent owns wiki layer — no human WYSIWYG editing | SS Do's/Don'ts line 2179 |
| CON-10 | Raw Source Immutability | System reads but never modifies Google Drive documents | SS Do's/Don'ts line 2180 |

---

## 7. Assumptions

| # | Assumption | Impact if Wrong | Status | Source |
|---|-----------|----------------|--------|--------|
| A-01 | Target organizations use Google Workspace as primary productivity suite | Must redesign integration layer for M365 | HIGH | SS 1.2 line 86 |
| A-02 | Primary document languages are Thai + English (bilingual) | v1 supports only 2 languages | MEDIUM | SS 1.2 line 87 |
| A-03 | Vertex AI (Gemini) has sufficient throughput for 1000+ concurrent users | Must load test before production | HIGH | SS 1.2 line 88 |
| A-04 | Google Drive API webhooks have sufficient reliability for real-time sync | Scheduled sync fallback required | MEDIUM | SS 1.2 line 89 |
| A-05 | Organizations can grant domain-wide delegation for service accounts | Required for API access | HIGH | SS 1.2 line 90 |
| A-06 | Cloud Run can handle long-running wiki compilation (max 60 min) | May need Cloud Tasks for jobs > 15 min | MEDIUM | SS 1.2 line 91 |
| A-07 | Prisma ORM supports PostgreSQL full-text search adequately | May need raw SQL for Thai tokenization | MEDIUM | SS 1.2 line 92 |
| A-08 | PDPA compliance achievable with encryption at rest + audit log | Requires legal review | HIGH | SS 1.2 line 93 |
| A-09 | Per-organization GCP budget is ~$5,000-15,000/month | Depends on document volume | MEDIUM | SS 1.2 line 94 |
| A-10 | Karpathy's minbpe tokenizer supports Thai script | Must validate before commit | HIGH | SS 1.2 line 95 |
| A-11 | Departments have clear folder structure in Google Drive | May need onboarding wizard | LOW | SS 1.2 line 96 |
| A-12 | Enterprise customers accept markdown-based wiki (no WYSIWYG) | May need rich preview layer | MEDIUM | SS 1.2 line 97 |

---

## 8. Glossary

| Term | Definition | Source |
|------|-----------|--------|
| Wiki Page | Markdown document created and maintained by LLM Agent. Types: Entity, Concept, Summary, Filed, Index | SS 1.4 line 115 |
| Entity Page | Wiki page describing a specific entity (project, person, product) | SS 1.4 line 116 |
| Concept Page | Wiki page describing a broad concept or topic (policy, process) | SS 1.4 line 117 |
| Summary Page | Auto-generated summary of a source document (max 500 words) | SS 1.4 line 118 |
| Filed Page | Wiki page auto-created from a high-value chat answer (knowledge compounding) | SS 5.3 line 811 |
| Ingestion | Process of importing documents from Google Drive and creating/updating wiki pages | SS 1.4 line 118 |
| Lint | Automated wiki quality check: contradictions, stale data, orphan pages | SS 1.4 line 119 |
| Schema | Configuration defining wiki structure, conventions, and workflows (Layer 3) | SS 1.4 line 120 |
| Raw Source | Original document in Google Drive — system reads but never modifies | SS 1.4 line 121 |
| qmd | Hybrid search (BM25 + vector + LLM re-ranking) per Karpathy's toolchain | SS 1.4 line 122 |
| minbpe | Byte-pair encoding tokenizer for efficient document processing | SS 1.4 line 123 |
| HMAC Audit | Hash-based Message Authentication Code for tamper-evident logging | SS 1.4 line 124 |
| Knowledge Compounding | Process where every query can improve the wiki by filing valuable answers | SS Section 2.1 |
| Three-Layer Pattern | Karpathy's architecture: Layer 1 (Raw Sources), Layer 2 (Wiki), Layer 3 (Schema) | SS Section 1.1 |
| Department Scoping | Data isolation mechanism ensuring users see only their department's wiki + shared pages | SS 5.1 line 778 |

---

## Requirement Summary

| Module | FR Count | P0 | P1 |
|--------|----------|----|----|
| AUTH | 10 | 10 | 0 |
| INGEST | 15 | 14 | 1 |
| WIKI | 10 | 9 | 1 |
| CHAT | 12 | 8 | 4 |
| ADMIN | 10 | 6 | 4 |
| AUDIT | 8 | 8 | 0 |
| COST | 5 | 3 | 2 |
| LINT | 8 | 0 | 8 |
| **Total FR** | **78** | **58** | **20** |
| **Total NFR** | **23** | **18** | **5** |

---

*Document generated by Coulson (AEGIS Compliance Agent) on 2026-04-17*
*Standard: ISO/IEC 29110 Basic Profile — SI.01 Requirements Specification*
