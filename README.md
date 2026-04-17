# DriveWiki

> Enterprise Google Drive Knowledge Management powered by Karpathy's LLM Wiki Pattern

## What is DriveWiki?

DriveWiki transforms your organization's Google Drive into a living, AI-maintained knowledge base. Instead of traditional RAG (vector search), it uses [Karpathy's LLM Wiki Pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — an agent continuously compiles, cross-references, and maintains a persistent wiki from your Drive documents.

```
Google Drive (Raw Sources) → LLM Agent → Wiki Layer → Chat Interface
                                ↑                         |
                                └── Knowledge compounds ──┘
```

## Architecture

**Three-layer pattern (Karpathy, April 2026):**

| Layer | What | Owner |
|-------|------|-------|
| Raw Sources | Google Drive documents (Docs, Sheets, Slides) | Organization (immutable) |
| The Wiki | Entity pages, concept pages, summaries, cross-references, index | LLM Agent (auto-maintained) |
| The Schema | Wiki structure, conventions, ingestion/query workflows | Admin (configurable) |

## Key Features

- **Google Workspace SSO** — login with existing organizational accounts
- **Automatic ingestion** — webhooks + scheduled sync from Google Drive
- **LLM Wiki compilation** — entity pages, concept pages, cross-references, master index
- **Chat interface** — queries wiki (in context window) with fallback to raw sources
- **Department-scoped knowledge** — RBAC per department
- **Bilingual** — Thai + English (UI and wiki content)
- **HMAC audit trail** — tamper-evident logging
- **Per-user cost tracking** — budget enforcement per department
- **Wiki lint** — periodic audit for contradictions, stale claims, orphan pages

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 5, Vite 6, TanStack Router/Query, Zustand, Tailwind CSS 4, shadcn/ui |
| Backend | Node.js, TypeScript, Express, Prisma ORM |
| Database | PostgreSQL 16 (Cloud SQL) |
| AI/LLM | Google Vertex AI (Gemini 2.5), LLM Wiki Agent |
| Search | Hybrid BM25 + semantic (qmd pattern) |
| Cloud | Google Cloud Run, GCS, Cloud Build |
| Auth | Google Workspace OAuth 2.0 |

## GCP Project

| Setting | Value |
|---------|-------|
| Project ID | `atn-tools` |
| Region | `us-central1` |
| Cloud Run Service | `drivewiki-backend` |
| Cloud SQL | `aikms-pg` (shared instance, `drivewiki` database) |
| GCS Bucket | `drivewiki-storage-prod` |

## Documentation

- [Super Spec (BRD + SRS + UX + PBIs)](docs/specs/SUPER-SPEC.md) — 2,257 lines
- [Frontend Spec (Design System + Components + Pages)](docs/specs/FRONTEND-SPEC.md) — 4,513 lines

## Target

Large organizations (1000+ employees) using Google Workspace.

## License

Proprietary - Aeternix Technologies
