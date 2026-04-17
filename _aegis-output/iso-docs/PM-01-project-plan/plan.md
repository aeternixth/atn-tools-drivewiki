# PM.01 Project Plan — DriveWiki

| Field | Value |
|-------|-------|
| Document ID | PM-01 |
| Project | DriveWiki — Enterprise Google Drive Knowledge Management |
| Version | 1.0 |
| Date | 2026-04-17 |
| Author | Coulson (AEGIS Compliance Agent) |
| Standard | ISO/IEC 29110 Basic Profile — PM.01 |

---

## 1. Project Overview

### 1.1 Purpose
DriveWiki is an enterprise knowledge management system that uses Karpathy's LLM Wiki Pattern to automatically compile, maintain, and serve organizational knowledge from Google Drive documents. The system targets large Thai/SEA organizations (1000+ employees) using Google Workspace.

### 1.2 Objectives
1. Reduce time-to-answer from ~15 minutes to < 30 seconds
2. Increase document utilization from ~60% to > 80%
3. Enable cross-department knowledge sharing (> 25% cross-dept queries)
4. Provide 100% HMAC-verified audit trail for compliance
5. Deliver full cost transparency per department

### 1.3 Success Criteria
- MVP delivered within 10 weeks (5 sprints x 2 weeks)
- All 58 P0 functional requirements implemented and tested
- 99.5% uptime target met within first month of production
- PDPA compliance verified by legal review

---

## 2. Scope (WBS)

### 2.1 Work Breakdown Structure

```
DriveWiki
|-- J-1: Foundation & Auth
|   |-- E-001: Onboarding & Auth (29 pts, S1)
|   |   |-- T-001: Google OAuth SSO Login (5)
|   |   |-- T-002: JWT Token Management (5)
|   |   |-- T-003: PDPA Consent Flow (3)
|   |   |-- T-004: RBAC Role System (8)
|   |   |-- T-005: Workspace Setup Wizard (8)
|   |-- E-002: Drive Integration (26 pts, S2)
|       |-- T-006: Drive Folder Connection (8)
|       |-- T-007: Drive Webhook Listener (5)
|       |-- T-008: Scheduled Sync Fallback (5)
|       |-- T-009: Document Content Extraction (8)
|
|-- J-2: Core Wiki Engine
|   |-- E-003: Wiki Engine Core (44 pts, S2-S3)
|   |   |-- T-010: Wiki Page Data Model (5)
|   |   |-- T-011: Entity Extraction Pipeline (8)
|   |   |-- T-012: Concept Extraction Pipeline (8)
|   |   |-- T-013: Summary Page Generation (5)
|   |   |-- T-014: Cross-Reference Management (8)
|   |   |-- T-015: Master Index Generation (5)
|   |   |-- T-016: Ingestion Log & Cost (5)
|   |-- E-004: Chat Engine (39 pts, S4)
|   |   |-- T-017..T-022
|   |-- E-005: Search & Index (13 pts, S3)
|       |-- T-023..T-024
|
|-- J-3: Enterprise Features
|   |-- E-006: Admin & Governance (21 pts, S2-S5)
|   |-- E-007: Audit & Compliance (16 pts, S2-S4)
|   |-- E-008: Cost Management (13 pts, S3-S5)
|
|-- J-4: UI/UX Polish
    |-- E-009: UI/UX Polish (14 pts, S3-S5)
    |-- Lint Engine (19 pts, S5)
```

### 2.2 Total Effort
- 46 tasks, ~234 story points
- 5 sprints x 2 weeks = 10 weeks

---

## 3. Milestones

| Milestone | Date | Deliverable | Gate |
|-----------|------|-------------|------|
| M0: Project Kickoff | 2026-04-17 | BLOCK 0 artifacts, project plan | Gate 0 |
| M1: Auth & Foundation | 2026-05-01 | OAuth login, JWT, RBAC, Prisma schema, HMAC engine | Gate 1+2 |
| M2: Drive + Wiki Foundation | 2026-05-15 | Drive integration, wiki data model, department mgmt | Gate 1+2 |
| M3: Core Wiki Engine | 2026-05-29 | Entity/concept/summary extraction, search, cross-refs | Gate 1+2+3 |
| M4: Chat Engine | 2026-06-12 | Wiki-first chat, streaming, auto-file, audit UI | Gate 1+2+3 |
| M5: Enterprise Polish | 2026-06-26 | Dashboards, cost, lint, dark mode, mobile, a11y | Gate 1+2+3+4+5 |
| M6: Production Deploy | 2026-07-03 | Production deployment on GCP asia-southeast1 | Gate 4+5 |

---

## 4. Resource Plan

### 4.1 AEGIS Agent Team (13 agents)

| Agent | Role | Sprint Assignment |
|-------|------|-------------------|
| Nick Fury | Project Controller, Decision Engine | All sprints |
| Iron Man | System Architect, Spec Writer | All sprints (specs before build) |
| Spider-Man | Primary Implementer | All sprints |
| Black Panther | Code Reviewer (Gate 1) | All sprints |
| Captain America | Orchestrator (multi-agent coordination) | S3-S5 (complex tasks) |
| Loki | Adversarial Reviewer (Plan-Approval Gate) | Before each sprint |
| War Machine | QA Planning (Gate 2) | All sprints |
| Vision | Test Execution (Gate 2) | All sprints |
| Coulson | ISO Compliance (Gate 3) | All sprints |
| Thor | DevOps, Deployment (Gate 4+5) | S1 (infra), S5 (deploy) |
| Beast | Research, Scanning | As needed |
| Wasp | Fast execution agent | As needed |
| Songbird | Documentation | As needed |

### 4.2 External Dependencies

| Dependency | Owner | Required By |
|-----------|-------|-------------|
| Google Workspace test domain | Human (IT Admin) | Sprint 1 |
| GCP project with billing | Human (IT Admin) | Sprint 1 |
| Vertex AI API access (Gemini) | Human (GCP Admin) | Sprint 2 |
| PDPA legal review | Human (Legal) | Sprint 1 |
| Domain-wide delegation setup | Human (Google Admin) | Sprint 2 |

---

## 5. Risk Management

| Risk ID | Risk | Prob. | Impact | Mitigation |
|---------|------|-------|--------|------------|
| R-01 | Vertex AI rate limits insufficient | Medium | High | Reserved capacity, queue system |
| R-02 | Thai language processing quality | Medium | High | Validate Gemini Thai, test with native speakers |
| R-03 | Drive webhook reliability | Low | Medium | 15-min scheduled sync fallback |
| R-04 | Wiki page explosion | Medium | Medium | Schema-based consolidation rules |
| R-05 | LLM cost overrun | High | High | Per-dept quotas, alerts, smart caching |
| R-06 | PDPA compliance gaps | Medium | High | Legal review before launch |
| R-07 | Low user adoption | Medium | High | Seamless Google integration, training |
| R-08 | LLM hallucination in wiki | Medium | High | Source citation enforcement, lint agent |
| R-09 | Context window limits | Medium | Medium | Hierarchical index, selective loading |
| R-10 | Cloud Run cold start latency | Low | Medium | Min instances = 1, warm-up endpoints |

---

## 6. Communication Plan

| Event | Frequency | Participants | Medium |
|-------|-----------|-------------|--------|
| Sprint Planning | Bi-weekly | Nick Fury + all agents | /aegis-sprint plan |
| Daily Standup | Per AEGIS cycle | Nick Fury scan | Activity log |
| Sprint Review | Bi-weekly | Nick Fury + human | /aegis-retro |
| Gate Reviews | Per task | Assigned gate agents | Automated |
| Risk Escalation | As needed | Nick Fury -> Human | L1 escalation |
| ISO Doc Review | Per sprint close | Coulson + Nick Fury | Gate 3 |

---

## 7. Quality Plan

### 7.1 Gate System (5 gates)

| Gate | Owner | Criteria | Blocking |
|------|-------|----------|----------|
| Gate 0 | Coulson + Nick Fury | PM.01, SI.01, SI.02 exist; Epic/Task/Sub-task structure; Kanban initialized | Yes (BLOCK 0) |
| Gate 1 | Black Panther | Code correctness, security, style, coverage > 80% | Yes |
| Gate 2 | War Machine + Vision | Functional tests pass, acceptance criteria met | Yes (tasks >= 3pts) |
| Gate 3 | Coulson | ISO docs current, traceability matrix updated | Blocks sprint close |
| Gate 4 | Thor | Clean build, deployment success, health check pass | Yes |
| Gate 5 | Thor | Error rate < 2x baseline for 5 min post-deploy | Yes |

### 7.2 Definition of Done (per task)
1. All acceptance criteria met
2. Gate 1 (code review) PASS
3. Gate 2 (QA) PASS (if >= 3 story points)
4. No critical/high severity bugs open
5. SI.02 traceability matrix updated

### 7.3 Definition of Done (per sprint)
1. All sprint tasks in DONE column
2. Gate 3 (ISO compliance) PASS
3. Sprint retrospective completed
4. Next sprint backlog prioritized

---

## 8. Tools & Infrastructure

| Tool | Purpose |
|------|---------|
| AEGIS v8.4 | Agent framework, project management |
| Git | Version control |
| Claude Code | AI-powered development |
| Next.js 15 | Frontend framework |
| Prisma | ORM |
| PostgreSQL 16 | Database (Cloud SQL) |
| Redis | Caching (Cloud Memorystore) |
| Vertex AI Gemini | LLM inference |
| Cloud Run | Compute |
| Cloud Tasks | Job queue |
| GCS | Object storage |
| Terraform | Infrastructure as Code |

---

*Document generated by Coulson (AEGIS Compliance Agent) on 2026-04-17*
*Standard: ISO/IEC 29110 Basic Profile — PM.01 Project Plan*
