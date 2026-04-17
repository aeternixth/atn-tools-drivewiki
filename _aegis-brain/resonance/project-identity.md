# Project Identity

- Name: DriveWiki
- Created: 2026-04-17
- Framework: AEGIS v8.4
- Agents: 13 Marvel characters
- Profile: full

## Domain
Enterprise Knowledge Management for Google Workspace organizations.
Target market: large enterprises (1000+ employees) in Thailand / SEA.
Core problem: connecting knowledge across departments, not just searching documents.

## Core Architecture — Karpathy's Three-Layer LLM Wiki Pattern
Instead of traditional RAG (vector DB + retrieval), DriveWiki uses:
- Layer 1: Raw Sources (Google Drive Docs, Sheets, Slides) — immutable, read-only
- Layer 2: The Wiki (LLM-Owned) — Entity Pages, Concept Pages, Summary Pages, Cross-References, Master Index, Ingestion Log
- Layer 3: The Schema — Wiki Structure Config, Workflow Definitions, Conventions & Rules

Key advantage: wiki is always in context window, no retrieval latency. Knowledge compounds with every query.

## Tech Stack
- Frontend: Next.js 15 + TypeScript
- Backend: Node.js/TypeScript (no Python in v1)
- ORM: Prisma
- Database: Cloud SQL (PostgreSQL 16)
- LLM: Vertex AI (Gemini)
- Auth: Google Workspace SSO (OAuth 2.0)
- Cloud: GCP exclusively (Cloud Run, Cloud Tasks, GCS)
- Data Residency: asia-southeast1 (Singapore) or asia-southeast2 (Jakarta)

## Key Components (12 services)
C-01 Auth Gateway, C-02 Drive Sync Engine, C-03 Ingest Agent, C-04 Wiki Store,
C-05 Chat Engine, C-06 Lint Agent, C-07 Admin Service, C-08 Audit Logger,
C-09 Cost Tracker, C-10 Schema Manager, C-11 Notification Service, C-12 Search Service

## Success Definition
A working enterprise knowledge management system where:
1. Documents from Google Drive are automatically ingested into a wiki layer
2. Cross-department knowledge is linked and searchable
3. An AI chat interface answers questions using wiki context (with audit trail)
4. Department-scoped RBAC ensures data isolation
5. HMAC audit logs provide compliance and explainability
6. Thai + English bilingual support

## Compliance
- PDPA (Thailand's Personal Data Protection Act)
- ISO 29110 Basic Profile (AEGIS framework)

## Design Principles
- Explainability over cleverness — CEO must understand why system answered a certain way
- Agent owns wiki layer — no human WYSIWYG editing of wiki
- Immutable raw sources — system reads but never modifies Google Drive
- Compound knowledge — every question can improve the wiki
