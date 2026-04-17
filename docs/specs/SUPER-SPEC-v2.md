# DriveWiki Super Spec v2.0 -- MCP-First Edition

> **Codename:** DriveWiki
> **Product:** Enterprise Google Drive Knowledge Management System
> **Architecture:** MCP-First, Web UI Second (Hybrid)
> **Target Market:** Large organizations (1000+ employees) using Google Workspace
> **Repo:** aeternixth/atn-tools-drivewiki
> **GCP Project:** atn-tools (shared with AIKMS)
> **Spec Author:** Iron Man (AEGIS System Architect)
> **Date:** 2026-04-17
> **Version:** 2.0 -- REPLACES SUPER-SPEC.md (v1)
> **Status:** DRAFT -- Pending Loki Review

---

## Soul

ระบบจัดการความรู้ระดับองค์กรที่เงียบสงบแต่ทรงพลัง DriveWiki ไม่ใช่ search engine อีกตัว --
มันคือ "สมองรวม" ขององค์กรที่ AI Agent คอยดูแลให้ทันสมัยอยู่เสมอ
ตาม Karpathy's LLM Wiki Pattern (April 2026) ทุก document ที่เข้าสู่ระบบจะถูกแปลงเป็น wiki pages
ที่เชื่อมโยงกัน ค้นหาได้ทันที และ compound ความรู้ทุกครั้งที่มีคนถาม

ใน v2 เราเปลี่ยนแนวทาง -- MCP Server เป็น primary interface, Web UI เป็น secondary
เพราะ power users ใช้ DriveWiki จาก Claude Desktop, VS Code, Claude Code ได้โดยไม่ต้องเปิด browser
เราเลือก explainability เหนือ cleverness -- ถ้า CEO ถามว่า "ทำไมระบบตอบแบบนี้"
audit log ต้องตอบได้ในหนึ่งหน้าจอ

---

## Table of Contents

1. [Context Recap & Assumptions](#section-1-context-recap--assumptions)
2. [Research Insights & Feature Landscape](#section-2-research-insights--feature-landscape)
3. [Super System Analysis](#section-3-super-system-analysis)
4. [BRD (Business Requirements)](#section-4-brd-business-requirements)
5. [SRS (Functional Requirements)](#section-5-srs-functional-requirements)
6. [UX/UI Blueprint](#section-6-uxui-blueprint)
7. [PBIs (Product Backlog Items)](#section-7-pbis-product-backlog-items)
8. [Role Summary](#section-8-role-summary)
9. [Open Questions & Gaps](#section-9-open-questions--gaps)

---

# Section 1: Context Recap & Assumptions

## 1.1 Project Context

DriveWiki คือระบบ Enterprise Knowledge Management ที่ออกแบบมาเฉพาะสำหรับองค์กรขนาดใหญ่
ที่ใช้ Google Workspace เป็นหลัก ระบบใช้ Karpathy's LLM Wiki Pattern แทน traditional RAG
โดยมี LLM Agent เป็นผู้ดูแล wiki layer ทั้งหมด

### v2 Key Change: MCP-First Architecture

v1 ออกแบบเป็น Web App ธรรมดา (React frontend + REST API)
v2 เปลี่ยนเป็น MCP-first -- สร้าง backend services + MCP Server ก่อน
แล้ว validate product-market fit ผ่าน Claude Desktop/VS Code ก่อนลงทุน frontend

เหตุผล:
1. MCP ใช้ backend เดียวกัน -- ไม่เสียเวลาซ้ำ
2. MCP ให้ feedback loop เร็วกว่า -- ทดสอบผ่าน Claude Desktop ได้ทันที
3. Karpathy's pattern เหมาะกับ MCP -- Wiki=Resources, Agent=Tools, Schema=Prompts
4. Power users (devs, analysts) ใช้ใน IDE ได้เลย -- ไม่ต้อง context switch
5. Web UI สร้างทีหลังเมื่อ product validated แล้ว

```
v2 Architecture Choice:

  Option C: Hybrid -- MCP-First (SELECTED)

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  Claude      │  │  VS Code /   │  │  Web App     │
  │  Desktop /   │  │  Cursor      │  │  (React)     │
  │  Claude Code │  │              │  │  Sprint 4+   │
  │  Sprint 2    │  │  Sprint 2    │  │              │
  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
         │ MCP (stdio/HTTP)│ MCP (stdio)      │ REST/SSE
         │                 │                  │
  ═══════╪═════════════════╪══════════════════╪══════════
         │                 │                  │
  ┌──────┴─────────────────┴──────────────────┴───────┐
  │                  API Gateway                       │
  │  ┌──────────────────┐    ┌──────────────────────┐ │
  │  │   MCP Server     │    │   REST Router         │ │
  │  │   (primary)      │    │   /api/* (secondary)  │ │
  │  └────────┬─────────┘    └────────┬─────────────┘ │
  └───────────┼──────────────────────┼────────────────┘
              │                      │
  ┌───────────┴──────────────────────┴────────────────┐
  │              Shared Service Layer                  │
  │  WikiStore  ChatEngine  IngestAgent  DriveSync     │
  │  LintAgent  SearchSvc   AdminSvc    AuditLogger    │
  │  CostTrack  SchemaMgr   NotifSvc                   │
  └───────────────────────┬────────────────────────────┘
                          │
  ┌───────────────────────┴────────────────────────────┐
  │  Cloud SQL (PG16)  │  GCS  │  Vertex AI  │  Drive  │
  └────────────────────────────────────────────────────┘
```

### Core Innovation: Karpathy's LLM Wiki Pattern

แทนที่จะใช้ vector database + retrieval ระบบ DriveWiki ใช้ 3-layer architecture:

```
  LAYER 1: RAW SOURCES (Immutable -- LLM reads, never modifies)
  ┌───────────────────────────────────────────────────────────────┐
  │  Google Drive                                                 │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
  │  │  Docs    │ │  Sheets  │ │  Slides  │ │  PDFs / Images   │ │
  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
  └───────────────────────────────┬───────────────────────────────┘
                                  │
                     ┌────────────┴────────────┐
                     │      INGEST AGENT       │
                     └────────────┬────────────┘
                                  │
  LAYER 2: THE WIKI (LLM-owned -- Agent creates & maintains)
  ┌───────────────────────────────┴───────────────────────────────┐
  │  Wiki Store (Markdown + PostgreSQL)                           │
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
  │  │ Entity Pages │  │Concept Pages│  │   Summary Pages     │  │
  │  └──────────────┘  └─────────────┘  └─────────────────────┘  │
  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐       │
  │  │Cross-Refs   │  │Master Index │  │ Ingestion Log  │       │
  │  └─────────────┘  └─────────────┘  └────────────────┘       │
  └───────────────────────────────┬───────────────────────────────┘
                                  │
  LAYER 3: THE SCHEMA (Admin-configurable)
  ┌───────────────────────────────┴───────────────────────────────┐
  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐ │
  │  │ Wiki Structure│  │  Conventions  │  │ Content Policies  │ │
  │  └───────────────┘  └───────────────┘  └───────────────────┘ │
  └───────────────────────────────────────────────────────────────┘

  ทำไมดีกว่า RAG?
  ┌─────────────────────────┬──────────────────────┬──────────────────────┐
  │        Aspect           │   Traditional RAG    │  LLM Wiki Pattern    │
  ├─────────────────────────┼──────────────────────┼──────────────────────┤
  │ Knowledge state         │ Frozen chunks        │ Living, updated wiki │
  │ Query latency           │ Vector search delay  │ Wiki already loaded  │
  │ Cross-references        │ Lost in vector space │ Explicit links       │
  │ Knowledge compounding   │ None                 │ Every query improves │
  │ Maintenance burden      │ Re-embed on change   │ Agent auto-maintains │
  │ Explainability          │ "Score 0.87"         │ "See wiki page X"   │
  │ Thai language support   │ Tokenizer dependent  │ Native markdown      │
  └─────────────────────────┴──────────────────────┴──────────────────────┘
```

### GCP Infrastructure (shared with AIKMS)

| Resource | Detail |
|----------|--------|
| GCP Project | `atn-tools` (shared) |
| Region | `us-central1` |
| Cloud Run | `drivewiki-backend` |
| Cloud SQL | `aikms-pg` instance, `drivewiki` database (PostgreSQL 16) |
| GCS Bucket | `drivewiki-storage-prod` |
| LLM | Vertex AI Gemini 2.5 Pro / Flash |
| Secrets | Google Secret Manager |
| Cache | Cloud Memorystore (Redis) |

## 1.2 Assumptions

| # | Assumption | Impact | Status |
|---|-----------|--------|--------|
| A-01 | องค์กรเป้าหมายใช้ Google Workspace เป็น primary productivity suite | ถ้าใช้ M365 ต้อง redesign integration layer | [ASSUMED] HIGH |
| A-02 | ภาษาหลักของเอกสารคือ ไทย + อังกฤษ (bilingual) | รองรับ 2 ภาษาเท่านั้นใน v1 | [ASSUMED] MEDIUM |
| A-03 | Vertex AI (Gemini) มี throughput เพียงพอสำหรับ 1000+ users concurrent | ต้อง load test ก่อน production | [ASSUMED] HIGH |
| A-04 | Google Drive API webhooks มี reliability เพียงพอสำหรับ real-time sync | ต้องมี scheduled sync เป็น fallback | [ASSUMED] MEDIUM |
| A-05 | องค์กรมี Google Workspace Admin ที่สามารถ grant domain-wide delegation ได้ | จำเป็นสำหรับ service account access | [ASSUMED] HIGH |
| A-06 | Cloud Run สามารถ handle long-running wiki compilation tasks ได้ (max 60 min) | อาจต้องใช้ Cloud Tasks สำหรับ jobs > 15 min | [ASSUMED] MEDIUM |
| A-07 | Prisma ORM รองรับ PostgreSQL full-text search ที่เพียงพอสำหรับ wiki index | อาจต้อง raw SQL สำหรับ Thai tokenization | [ASSUMED] MEDIUM |
| A-08 | PDPA compliance เพียงพอด้วย encryption at rest + audit log | ต้อง legal review | [ASSUMED] HIGH |
| A-09 | Budget ต่อองค์กรอยู่ที่ ~$5,000-15,000/month สำหรับ GCP resources | ขึ้นกับ document volume | [ASSUMED] MEDIUM |
| A-10 | Enterprise customers ยอมรับ markdown-based wiki (ไม่ต้อง WYSIWYG editor) | อาจต้อง rich preview layer | [ASSUMED] MEDIUM |
| A-11 | ทุก department มี folder structure ใน Google Drive ที่ชัดเจน | อาจต้อง onboarding wizard | [ASSUMED] LOW |
| A-12 | MCP clients (Claude Desktop, VS Code, Cursor) มี adoption เพียงพอในองค์กรเป้าหมาย | ถ้าไม่พอ Web UI ยังเป็น fallback | [ASSUMED] MEDIUM |
| A-13 | Streamable HTTP transport ของ MCP spec stable เพียงพอสำหรับ production | ต้องใช้ @modelcontextprotocol/sdk latest | [ASSUMED] MEDIUM |
| A-14 | Redis session store เพียงพอสำหรับ MCP session management (1000+ concurrent) | อาจต้อง cluster mode | [ASSUMED] MEDIUM |
| A-15 | MCP OAuth 2.0 flow ใช้ร่วมกับ Google Workspace SSO ได้ | ต้อง prototype ก่อน Sprint 2 | [ASSUMED] HIGH |

## 1.3 Constraints

| Constraint | Detail |
|-----------|--------|
| Single Integration | Google Workspace only -- ไม่รองรับ M365, Slack, etc. ใน v1 |
| Cloud Provider | Google Cloud Platform exclusively |
| Region | `us-central1` (shared with AIKMS) |
| Language Runtime | Node.js/TypeScript -- no Python services ใน v1 |
| ORM | Prisma -- ไม่ใช้ raw query ยกเว้น full-text search |
| LLM Provider | Vertex AI (Gemini) -- ไม่ใช้ OpenAI/Anthropic สำหรับ inference |
| Auth | Google Workspace SSO only -- ไม่มี local account |
| MCP SDK | `@modelcontextprotocol/sdk` (latest stable) |
| Primary Interface | MCP Server (Sprint 2), Web UI deferred (Sprint 4+) |

## 1.4 Glossary

| Term | Definition |
|------|-----------|
| Wiki Page | Markdown document ที่ LLM Agent สร้างและดูแล (Entity / Concept / Summary / Filed) |
| Entity Page | Wiki page ที่อธิบาย entity เฉพาะเจาะจง เช่น โปรเจค, บุคคล, ผลิตภัณฑ์ |
| Concept Page | Wiki page ที่อธิบาย concept กว้างๆ เช่น "นโยบายการลา", "กระบวนการ procurement" |
| MCP | Model Context Protocol -- protocol มาตรฐานจาก Anthropic ให้ AI เชื่อมต่อ external tools |
| MCP Resource | ข้อมูลที่ AI อ่านได้ผ่าน MCP (เช่น `wiki://pages/hr-policy`) |
| MCP Tool | Action ที่ AI เรียกใช้ผ่าน MCP (เช่น `ask(query)`, `search(q)`) |
| MCP Prompt | Workflow template สำเร็จรูป (เช่น `/research`, `/onboard`) |
| Ingestion | กระบวนการนำเอกสารจาก Drive เข้าสู่ระบบและสร้าง/อัปเดต wiki pages |
| Lint | กระบวนการตรวจสอบ wiki อัตโนมัติสำหรับ contradictions, stale data, orphan pages |
| HMAC Audit | Hash-based Message Authentication Code สำหรับ tamper-evident logging |
| stdio transport | MCP transport สำหรับ local process (Claude Desktop, VS Code) |
| Streamable HTTP | MCP transport สำหรับ remote/multi-user (enterprise deployment) |

---

# Section 2: Research Insights & Feature Landscape

## 2.1 Karpathy's LLM Wiki Pattern -- Architectural Rationale

Andrej Karpathy เผยแพร่ LLM Wiki Pattern ในเดือน April 2026 โดยชี้ปัญหาหลักของ traditional RAG:

| Problem with RAG | How Wiki Pattern Solves It |
|-----------------|---------------------------|
| Retrieval latency + relevance ไม่แน่นอน | Wiki อยู่ใน context window เสมอ -- ไม่ต้อง retrieve |
| Knowledge ไม่ compound | ทุก query สามารถ improve wiki ได้ (filed pages) |
| Cross-references หายไปใน vector space | Agent maintain cross-references explicitly |
| Stale data ไม่มีใครดูแล | Lint process ตรวจสอบ contradictions อัตโนมัติ |
| Chunk boundaries ตัดบริบท | Wiki pages มี semantic boundaries ที่สมบูรณ์ |

ทำไมเลือก Wiki Pattern + MCP:
- Wiki-as-context = MCP Resources (AI อ่าน wiki ได้ตรงผ่าน protocol)
- Agent-maintained = MCP Tools (AI เรียก ingest, lint, search ได้)
- Schema/conventions = MCP Prompts (workflow templates สำเร็จรูป)
- องค์กรขนาดใหญ่ปัญหาหลักคือ "เชื่อมโยงความรู้ข้ามแผนก" ไม่ใช่ "ค้นหาเอกสาร"

## 2.2 Feature Classification

### Must-Have (Sprint 1-3 -- Backend + MCP)

| Feature | Rationale | Complexity |
|---------|-----------|------------|
| Google Workspace SSO (OAuth 2.0) | ไม่มี login อื่น -- single identity | M |
| Google Drive webhook + scheduled sync | Real-time + reliability fallback | L |
| LLM Wiki compilation (entity + concept + summary pages) | Core innovation -- Karpathy pattern | XL |
| Master Index + cross-reference maintenance | ทำให้ wiki searchable + navigable | L |
| Chat engine (wiki-first, raw-source fallback) | Primary user interaction | L |
| Department-scoped RBAC | Enterprise requirement -- data isolation | M |
| HMAC audit trail | Compliance + tamper evidence | M |
| Per-department cost tracking | Budget control | S |
| MCP Server (10 Resources, 8 Tools, 5 Prompts) | Primary interface -- MCP-first | L |
| MCP dual transport (stdio + Streamable HTTP) | Local dev + enterprise deployment | M |

### Nice-to-Have (Sprint 4-5 -- Web UI + Polish)

| Feature | Rationale | Complexity |
|---------|-----------|------------|
| React Web UI (18 screens) | Non-technical users need browser access | XL |
| Thai + English bilingual web UI | Target market -- deferred until MCP validated | M |
| Admin dashboard with charts | Visual governance -- text reports via MCP first | M |
| Wiki page versioning + diff view | Transparency -- เห็นว่า Agent เปลี่ยนอะไร | M |
| Approval workflow for wiki edits | Some orgs want human-in-the-loop | M |

### Experimental (v2.0+)

| Feature | Rationale | Complexity |
|---------|-----------|------------|
| qmd hybrid search (BM25 + vector + LLM re-ranking) | Scale beyond context window limit | L |
| Knowledge graph visualization (3D) | Executive dashboard -- wow factor | L |
| Multi-workspace federation | สำหรับ holding companies | XL |
| Voice query (Thai speech-to-text) | Mobile use case | L |
| Custom MCP client SDK for third parties | Ecosystem expansion | M |

### Not Recommended (v1.0)

| Feature | Reason |
|---------|--------|
| WYSIWYG wiki editor for humans | ขัดกับ Karpathy pattern -- Agent owns wiki layer |
| Microsoft 365 integration | Out of scope, dilutes focus |
| Custom LLM fine-tuning | Vertex AI Gemini เพียงพอ, fine-tuning เพิ่ม complexity |
| Real-time collaborative editing | ไม่ใช่ Google Docs replacement |
| Mobile native app | MCP + Web PWA เพียงพอสำหรับ v1 |
| Multi-LLM support | Focus Vertex AI Gemini only ใน v1 |

## 2.3 Competitive Landscape

| Product | Strengths | Weaknesses vs DriveWiki | Has MCP? |
|---------|-----------|------------------------|----------|
| **Glean** | Enterprise search, many integrations | RAG-based (no knowledge compounding), แพงมาก | No |
| **Notion AI** | Great UX, integrated workspace | ไม่ auto-compile wiki จาก Drive, ไม่มี department scoping | No |
| **Guru** | Knowledge base + verification | Manual curation, ไม่มี LLM agent maintenance | No |
| **Confluence AI** | Deep Atlassian integration | ต้อง manual สร้าง pages, AI เป็น assistant ไม่ใช่ owner | No |
| **Google Cloud Search** | Native Google integration | Search only -- ไม่มี wiki compilation | No |
| **DriveWiki (ours)** | LLM Wiki Pattern, MCP-native, Thai-first, auto-compilation | ใหม่ -- ยังไม่ proven at scale | YES |

Key Differentiator: DriveWiki เป็นผลิตภัณฑ์เดียวที่มี MCP Server ให้ AI Agent ใช้ knowledge base
ของทั้งองค์กรได้ตรง -- ไม่ต้องเปิด browser, ไม่ต้อง context switch, ทำงานใน IDE ได้เลย

---

# Section 3: Super System Analysis

## 3.1 Stakeholders

| Stakeholder | Role | Primary Need | Interaction Frequency | MCP/Web |
|------------|------|-------------|----------------------|---------|
| **IT Admin** | ติดตั้ง, configure, maintain ระบบ | Easy setup, monitoring, cost control | Daily | MCP + Web |
| **Department Head** | จัดการ knowledge scope ของแผนก | ดูภาพรวมความรู้แผนก, approve content policies | Weekly | Web (dashboards) |
| **Knowledge Worker** | ผู้ใช้หลัก -- ค้นหา, ถาม, อ่าน wiki | คำตอบเร็ว ถูกต้อง มี context | Daily (5-20 queries) | MCP primary |
| **Executive** | ดูภาพรวม, ROI, usage metrics | Dashboard, cost justification | Monthly | Web (charts) |
| **Compliance Officer** | ตรวจสอบ audit trail, data governance | HMAC logs, access reports | Weekly | MCP + Web |
| **Developer** | ค้นหา technical docs, API specs ขององค์กร | ใช้ใน IDE ไม่ต้อง context switch | Daily | MCP (VS Code) |

## 3.2 User Journeys

### Journey 1: Developer ค้นหา API Spec ผ่าน VS Code (MCP-native)

```
Developer กำลังเขียนโค้ดใน VS Code
│
├─> พิมพ์ใน Claude Code: "ค้นหา API spec ของระบบ Payroll"
│   │
│   ├─> Claude เรียก MCP tool: search({ query: "API spec Payroll" })
│   │   └─> DriveWiki backend ค้นหา wiki index
│   │       └─> return: { results: [{id: "payroll-api-v2", title: "...", score: 0.95}] }
│   │
│   ├─> Claude เรียก MCP tool: get_page({ pageId: "payroll-api-v2" })
│   │   └─> DriveWiki backend return: { content: "## Payroll API v2...", crossRefs: [...] }
│   │
│   └─> Claude แสดงผลใน VS Code -- developer อ่านได้เลย ไม่ต้องเปิด browser
│
└─> 0 context switches, < 5 seconds total
```

### Journey 2: HR ถามนโยบายลาผ่าน Claude Desktop (MCP-native)

```
HR Manager เปิด Claude Desktop
│
├─> พิมพ์: "นโยบายลาพักร้อนปี 2026 เปลี่ยนอะไรบ้าง?"
│   │
│   ├─> Claude เรียก MCP tool: ask({ query: "นโยบายลาพักร้อน 2026 changes", department: "HR" })
│   │   └─> DriveWiki backend:
│   │       1. Search master index -> find relevant wiki pages
│   │       2. Load pages into LLM context
│   │       3. Synthesize answer with citations
│   │       4. Return: { answer: "...", citations: [...], cost: 0.003 }
│   │
│   └─> Claude แสดงคำตอบ + citations -- HR Manager อ่านได้ทันที
│
├─> ถ้าต้องการ research ลึก:
│   └─> /research "นโยบายลาพักร้อน 2026"
│       └─> MCP Prompt triggers multi-step: search -> read pages -> synthesize -> cite
│
└─> 1 message = คำตอบ (แทนที่จะเปิด browser -> login -> search -> read)
```

### Journey 3: Organization Onboarding (IT Admin)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───>│  PDPA    │───>│  Create  │───>│   Add    │───>│ Connect  │
│  Google  │    │ Consent  │    │Workspace │    │  Depts   │    │  Drive   │
│  OAuth   │    │  Form    │    │Name+Domain│   │ Name+Head│    │ Folders  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └─────┬────┘
                                                                      │
                     ┌──────────┐    ┌──────────┐    ┌──────────┐    │
                     │Dashboard │<───│ Initial  │<───│ Content  │<───┘
                     │  Ready!  │    │ Ingest   │    │ Policies │
                     │(via MCP) │    │ (async)  │    │ Config   │
                     └──────────┘    └──────────┘    └──────────┘
```

### Journey 4: Initial Drive Ingestion (System)

```
┌─────────────┐
│Drive Webhook│
│  fires OR   │
│Scheduled job│
└──────┬──────┘
       │
       v
┌──────────────┐     ┌─────────┐     ┌──────────────┐
│ Download doc │────>│ Extract │────>│ Hash changed │
│ from Drive   │     │  text   │     │ from last?   │
└──────────────┘     └─────────┘     └──────┬───────┘
                                        YES │    NO──> SKIP
                                            v
                              ┌───────────────────────┐
                              │ LLM: Analyze document  │
                              │ - Entity extraction    │
                              │ - Concept extraction   │
                              │ - Summary generation   │
                              └───────────┬───────────┘
                                          │
                              ┌───────────┴───────────┐
                              v                       v
                  ┌────────────────┐    ┌────────────────┐
                  │ Create/Update  │    │ Create/Update  │
                  │ Entity Pages   │    │ Concept Pages  │
                  └───────┬────────┘    └───────┬────────┘
                          └──────────┬──────────┘
                                     v
                         ┌───────────────────┐
                         │ Update Cross-Refs │
                         │ + Master Index    │
                         │ + Ingestion Log   │
                         │ + Audit Entry     │
                         │ + Cost Event      │
                         └───────────────────┘
```

### Journey 5: Knowledge Worker Chat Query (MCP)

```
User พิมพ์ใน Claude Desktop
│
├─> Claude เรียก ask() tool
│   │
│   ├─> Chat Engine: search master index
│   ├─> Load top-K wiki pages into context
│   ├─> LLM synthesize answer from wiki context
│   ├─> Include citations (wiki pages + raw sources)
│   ├─> Evaluate: should this answer be auto-filed?
│   │   ├─> YES: create new "Filed" wiki page + update index
│   │   └─> NO: return answer only
│   └─> Track cost (tokens used)
│
└─> Return: { answer, citations[], confidence, cost, filed? }
```

### Journey 6: Compliance Officer -- Audit Verification (MCP)

```
Compliance Officer ใน Claude Desktop
│
├─> เรียก MCP resource: audit://logs?from=2026-04-01&to=2026-04-17
│   └─> DriveWiki return: recent audit entries with HMAC status
│
├─> เรียก MCP tool: verify_audit()
│   └─> DriveWiki: verify HMAC chain integrity
│       └─> Return: { valid: true, checkedCount: 15420, brokenAt: null }
│
└─> ถ้าพบ broken chain: escalate to IT Admin ทันที
```

### Journey 7: Department Head -- Weekly Knowledge Review (MCP Prompt)

```
Dept Head ใน Claude Desktop
│
├─> พิมพ์: /weekly-digest HR
│   │
│   ├─> MCP Prompt triggers:
│   │   1. search recent changes (last 7 days)
│   │   2. list new wiki pages created
│   │   3. get lint findings summary
│   │   4. get cost summary
│   │   5. synthesize into weekly digest
│   │
│   └─> Output: structured weekly update in Thai
│       - 5 new wiki pages created
│       - 2 stale pages detected
│       - 1 contradiction found (leave policy vs practice)
│       - Cost: $45.20 this week
│       - Top queries: นโยบายลา, OKR process, onboarding
│
└─> Dept Head forwards to team via email/Slack
```

### Journey 8: New Employee Onboarding (MCP Prompt)

```
New hire ใน Claude Desktop
│
├─> พิมพ์: /onboard Engineering
│   │
│   ├─> MCP Prompt triggers:
│   │   1. load department wiki index
│   │   2. identify essential reading (by cross-ref count + recency)
│   │   3. organize into priority tiers
│   │   4. generate personalized reading plan
│   │
│   └─> Output:
│       Tier 1 (วันแรก): Architecture Overview, Git Workflow, CI/CD Pipeline
│       Tier 2 (สัปดาห์แรก): API Standards, Code Review Process, Testing Guide
│       Tier 3 (เดือนแรก): Infrastructure Guide, Monitoring, On-call Handbook
│
└─> New hire follows reading plan -- each link is a MCP Resource URI
```

## 3.3 System Context Diagram

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                     DriveWiki -- System Context (v2 MCP-First)               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ACTORS                                                                       ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     ║
║  │  Knowledge   │  │  Developer   │  │  IT Admin    │  │  Compliance  │     ║
║  │  Worker      │  │  (VS Code)   │  │              │  │  Officer     │     ║
║  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     ║
║         │ MCP              │ MCP              │ MCP/REST        │ MCP         ║
║         │                  │                  │                  │             ║
║  ┌──────┴──────────────────┴──────────────────┴──────────────────┴──────────┐ ║
║  │                                                                          │ ║
║  │                    DRIVEWIKI SYSTEM                                       │ ║
║  │                                                                          │ ║
║  │  ┌────────────────────────────────────────────────────────────────────┐  │ ║
║  │  │  MCP Server (PRIMARY)              │  REST API (SECONDARY)        │  │ ║
║  │  │  10 Resources, 8 Tools, 5 Prompts  │  55 endpoints for Web UI    │  │ ║
║  │  └────────────────┬───────────────────┴──────────┬───────────────────┘  │ ║
║  │                   │                              │                      │ ║
║  │  ┌────────────────┴──────────────────────────────┴──────────────────┐  │ ║
║  │  │  Service Layer: WikiStore, ChatEngine, IngestAgent, DriveSync,  │  │ ║
║  │  │  LintAgent, SearchSvc, AdminSvc, AuditLogger, CostTracker,     │  │ ║
║  │  │  SchemaMgr, NotifSvc                                            │  │ ║
║  │  └─────────────────────────────┬───────────────────────────────────┘  │ ║
║  │                                │                                      │ ║
║  └────────────────────────────────┼──────────────────────────────────────┘ ║
║                                   │                                        ║
║  EXTERNAL SYSTEMS                 │                                        ║
║  ┌────────────────────────────────┴───────────────────────────────────┐    ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐ │    ║
║  │  │   Google     │  │  Vertex AI   │  │Cloud SQL │  │   GCS     │ │    ║
║  │  │  Workspace   │  │  (Gemini)    │  │ (PG16)   │  │ (Storage) │ │    ║
║  │  │  Drive/Docs  │  │  LLM/Embed   │  │ drivewiki│  │ raw docs  │ │    ║
║  │  └──────────────┘  └──────────────┘  └──────────┘  └───────────┘ │    ║
║  └────────────────────────────────────────────────────────────────────┘    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## 3.4 Major Components (14 total)

| # | Component | Responsibility | Interface | Technology |
|---|-----------|---------------|-----------|------------|
| C-01 | **Auth Gateway** | OAuth 2.0, JWT, RBAC, MCP OAuth | REST + MCP auth middleware | Passport.js, Google OAuth |
| C-02 | **Drive Sync Engine** | Webhook listener, scheduled scan, change detection | Internal service + webhook endpoint | Google Drive API v3 |
| C-03 | **Ingest Agent** | Read raw docs, extract entities/concepts, create wiki | Internal service (event-driven) | Vertex AI Gemini |
| C-04 | **Wiki Store** | CRUD wiki pages, cross-refs, master index | Internal service + Prisma | Cloud SQL (PG16) |
| C-05 | **Chat Engine** | Query processing, wiki context, answer synthesis | Internal service + SSE | Vertex AI Gemini |
| C-06 | **Lint Agent** | Contradiction, stale, orphan detection | Scheduled job | Vertex AI Gemini Flash |
| C-07 | **Search Service** | FTS on wiki pages, BM25, Thai tokenization | Internal service | PostgreSQL FTS + pg_trgm |
| C-08 | **Admin Service** | User/dept/workspace management, policies | REST API + MCP tools | Prisma + Cloud SQL |
| C-09 | **Audit Logger** | HMAC chain, tamper detection, export | Internal service | Cloud SQL + HMAC-SHA256 |
| C-10 | **Cost Tracker** | Per-user/dept token counting, quotas | Internal service | Cloud SQL |
| C-11 | **Schema Manager** | Wiki structure config, conventions, workflows | Internal service | JSON/YAML + Cloud SQL |
| C-12 | **Notification Service** | Email/in-app notifications | Internal service | Cloud Tasks + email API |
| C-13 | **MCP Server** | Resources, Tools, Prompts -- primary AI interface | MCP protocol (stdio + HTTP) | @modelcontextprotocol/sdk |
| C-14 | **Web UI** | Browser-based interface (Sprint 4+) | React SPA | React + Vite + shadcn/ui |

## 3.5 Data Entities

```
  ┌─────────────┐     1:N     ┌─────────────┐     1:N     ┌─────────────┐
  │  Workspace  │────────────>│ Department  │────────────>│    User     │
  │             │             │             │             │             │
  │ id          │             │ id          │             │ id          │
  │ name        │             │ workspaceId │             │ email       │
  │ googleDomain│             │ name        │             │ name        │
  │ schemaConfig│             │ policies    │             │ departmentId│
  │ createdAt   │             │ wikiSchema  │             │ role        │
  └─────────────┘             │ createdAt   │             │ googleUserId│
                              └──────┬──────┘             │ isActive    │
                                     │                    │ lastLogin   │
                         ┌───────────┼───────────┐        │ pdpaConsent │
                         │           │           │        └──────┬──────┘
                         v           v           v               │
                  ┌────────────┐ ┌────────┐ ┌──────────┐        │
                  │DriveFolder │ │WikiPage│ │CostEvent │        │
                  │            │ │        │ │          │        │
                  │ id         │ │ id     │ │ id       │        │
                  │ deptId     │ │ deptId │ │ deptId   │        │
                  │ googleFId  │ │ type   │ │ userId   │        │
                  │ name       │ │ title  │ │ eventType│        │
                  │ syncStatus │ │ content│ │ tokens   │        │
                  │ lastSyncAt │ │ status │ │ costUsd  │        │
                  └──────┬─────┘ │ version│ │ createdAt│        │
                         │       │ sources│ └──────────┘        │
                         v       └───┬────┘                     │
                  ┌────────────┐     │                          │
                  │DriveDcocument│   │                          │
                  │            │     │                          │
                  │ id         │     ├──────────────────────────│──┐
                  │ folderId   │     │                          │  │
                  │ googleFId  │     v                          v  │
                  │ title      │ ┌──────────┐          ┌───────────┴──┐
                  │ mimeType   │ │WikiCrossRef│         │ ChatSession  │
                  │ contentHash│ │          │          │              │
                  │ lastIngest │ │ fromPage │          │ id           │
                  └────────────┘ │ toPage   │          │ userId       │
                                 │ relType  │          │ deptId       │
                                 └──────────┘          │ startedAt    │
                                                       └──────┬───────┘
                                                              │
                  ┌────────────┐  ┌──────────┐               v
                  │ WikiIndex  │  │LintReport│        ┌──────────────┐
                  │            │  │          │        │ ChatMessage  │
                  │ id         │  │ id       │        │              │
                  │ deptId     │  │ deptId   │        │ id           │
                  │ pageId     │  │ findings │        │ sessionId    │
                  │ indexType  │  │ health   │        │ role         │
                  │ searchVec  │  │ createdAt│        │ content      │
                  └────────────┘  └──────────┘        │ citations    │
                                                       │ filedAsWiki │
                  ┌────────────┐  ┌──────────────┐    └──────────────┘
                  │ AuditLog   │  │ContentPolicy │
                  │            │  │              │
                  │ id         │  │ id           │
                  │ userId     │  │ deptId       │
                  │ action     │  │ type         │
                  │ resource   │  │ pattern      │
                  │ metadata   │  │ action       │
                  │ hmacSig    │  │ isActive     │
                  │ prevHmac   │  └──────────────┘
                  │ createdAt  │
                  └────────────┘
```

Full entity list (14 entities):
1. **Workspace** -- ระดับองค์กร, มี Google domain
2. **Department** -- แผนก, scope ของ wiki pages
3. **User** -- ผู้ใช้, link กับ Google account
4. **DriveFolder** -- Google Drive folder ที่ monitor
5. **DriveDocument** -- เอกสารใน Drive, มี content hash
6. **WikiPage** -- wiki page (entity/concept/summary/filed)
7. **WikiCrossRef** -- cross-reference ระหว่าง pages (bidirectional)
8. **WikiIndex** -- full-text search index (tsvector)
9. **ChatSession** -- chat conversation session
10. **ChatMessage** -- ข้อความใน chat, มี citations
11. **AuditLog** -- HMAC-signed audit log entry
12. **CostEvent** -- token usage tracking per LLM call
13. **LintReport** -- lint findings per department
14. **ContentPolicy** -- ingestion rules per department

## 3.6 Non-Functional Requirements (NFRs)

### Performance

| ID | Requirement | Target | Measurement |
|----|------------|--------|-------------|
| NFR-PERF-01 | Chat query response (wiki-first) | < 3s (p95) | First token time |
| NFR-PERF-02 | Chat query response (raw-source fallback) | < 8s (p95) | With Drive API fetch |
| NFR-PERF-03 | Single document ingestion | < 30s | Webhook to wiki pages updated |
| NFR-PERF-04 | Wiki page load | < 500ms | API response time |
| NFR-PERF-05 | Search result | < 1s | Query to ranked results |
| NFR-PERF-06 | MCP tool response (non-streaming) | < 2s (p95) | search, get_page, browse |
| NFR-PERF-07 | MCP resource load | < 1s (p95) | Resource URI to content |
| NFR-PERF-08 | MCP ask() first token | < 3s (p95) | Streaming SSE start |

### Availability

| ID | Requirement | Target |
|----|------------|--------|
| NFR-AVAIL-01 | System uptime | 99.5% (monthly) |
| NFR-AVAIL-02 | Planned maintenance window | < 1 hour/month, off-peak |
| NFR-AVAIL-03 | RTO (Recovery Time Objective) | < 4 hours |
| NFR-AVAIL-04 | RPO (Recovery Point Objective) | < 1 hour |

### Security

| ID | Requirement | Target |
|----|------------|--------|
| NFR-SEC-01 | Authentication | Google Workspace SSO (OAuth 2.0) |
| NFR-SEC-02 | Authorization | RBAC with department scoping |
| NFR-SEC-03 | Data encryption at rest | AES-256 (Cloud SQL + GCS default) |
| NFR-SEC-04 | Data encryption in transit | TLS 1.3 |
| NFR-SEC-05 | Audit trail integrity | HMAC-SHA256 chained signatures |
| NFR-SEC-06 | Secrets management | Google Secret Manager |
| NFR-SEC-07 | API rate limiting | 100 req/min per user, 1000/min per dept |
| NFR-SEC-08 | MCP auth | OAuth 2.0 Bearer token per session |
| NFR-SEC-09 | MCP rate limiting | Per-user per-tool (configurable) |

### Scalability

| ID | Requirement | Target |
|----|------------|--------|
| NFR-SCALE-01 | Concurrent users | 500 simultaneous |
| NFR-SCALE-02 | Total documents per workspace | 100,000+ |
| NFR-SCALE-03 | Wiki pages per department | 50,000+ |
| NFR-SCALE-04 | Departments per workspace | 100+ |
| NFR-SCALE-05 | Cloud Run auto-scaling | 1-50 instances |
| NFR-SCALE-06 | MCP concurrent sessions | 500+ (Streamable HTTP) |

### Compliance

| ID | Requirement | Target |
|----|------------|--------|
| NFR-COMP-01 | PDPA compliance | Data residency configurable |
| NFR-COMP-02 | Data retention | Configurable per workspace (default 7 years) |
| NFR-COMP-03 | Right to erasure | User data deletion within 30 days |
| NFR-COMP-04 | Consent management | Explicit consent at first login |
| NFR-COMP-05 | Cross-border data transfer | Restricted to configured GCP regions |

### MCP-Specific

| ID | Requirement | Target |
|----|------------|--------|
| NFR-MCP-01 | Transport latency (stdio) | < 50ms overhead |
| NFR-MCP-02 | Transport latency (HTTP) | < 200ms overhead |
| NFR-MCP-03 | Session persistence | Redis-backed, survives process restart |
| NFR-MCP-04 | Concurrent tool calls | 10 per session |
| NFR-MCP-05 | Resource cache TTL | Configurable, default 5 min |
| NFR-MCP-06 | Tool timeout | 30s default, 120s for ask() |

---

# Section 4: BRD (Business Requirements)

## 4.1 Problem Statement

องค์กรขนาดใหญ่ในไทย (1000+ พนักงาน) ที่ใช้ Google Workspace เผชิญกับปัญหา **Knowledge Silos**:

1. **เอกสารกระจัดกระจาย** -- ข้อมูลอยู่ใน Drive folders หลายร้อยแห่ง ไม่มี cross-reference
2. **ค้นหาไม่เจอ** -- Google Drive search ใช้ keyword matching ไม่เข้าใจ context
3. **ความรู้ไม่ compound** -- ทุกครั้งที่คนถามคำถามเดิม ต้องค้นหาใหม่
4. **ข้ามแผนกไม่ได้** -- ฝ่ายขายไม่รู้ว่าฝ่าย IT มี spec อะไร
5. **ไม่มี audit trail** -- ไม่รู้ว่าใครเข้าถึงความรู้อะไร เมื่อไร
6. **ค่าใช้จ่ายมืด** -- ไม่รู้ว่าแต่ละแผนกใช้ LLM resources เท่าไร
7. **Context switching** -- ต้องออกจาก IDE/tool ที่ใช้อยู่เพื่อไปค้นหาข้อมูล

### Business Impact

- พนักงานเสียเวลาเฉลี่ย **2.5 ชั่วโมง/วัน** ค้นหาข้อมูล (McKinsey 2024)
- **40%** ของความรู้องค์กรอยู่ใน "dark data" -- เอกสารที่มีแต่ค้นไม่เจอ
- Onboarding พนักงานใหม่ใช้เวลา **3-6 เดือน** กว่าจะรู้ว่าข้อมูลอยู่ที่ไหน
- Developers สูญเสีย **45 นาที/วัน** context switching ไปค้นหา docs

## 4.2 Business Goals & KPIs

| Goal | KPI | 6-Month Target |
|------|-----|---------------|
| ลดเวลาค้นหาข้อมูล | Average time-to-answer | < 30 seconds |
| เพิ่ม knowledge utilization | % documents ingested vs total | > 80% |
| ลดเวลา onboarding | New hire time-to-first-answer | < 5 minutes |
| Cross-department sharing | % queries ข้ามแผนก | > 25% |
| Audit compliance | % actions มี HMAC log | 100% |
| Cost transparency | Departments with cost tracking | 100% |
| User adoption | Monthly active / total users | > 60% |
| Knowledge compounding | Filed wiki pages / month | > 500 |
| MCP adoption | % power users via MCP | > 30% |
| Developer productivity | Context switches / day reduced | > 50% |

## 4.3 Scope

### In-Scope (v1.0)

**Sprint 1-2 (Backend + MCP):**
- Google Workspace integration (Drive, Docs, Sheets, Slides)
- LLM Wiki compilation ตาม Karpathy pattern
- Chat engine (wiki-first query)
- Department-scoped RBAC
- HMAC audit trail
- Per-department cost tracking
- MCP Server: 10 Resources, 8 Tools, 5 Prompts
- MCP dual transport: stdio + Streamable HTTP
- Google Cloud deployment (Cloud Run, Cloud SQL, Vertex AI, GCS)

**Sprint 3 (Admin + Lint + Polish):**
- Admin service (user/dept management)
- Lint agent (contradiction, stale, orphan detection)
- Content policies
- Cost quotas + alerts

**Sprint 4-5 (Web UI -- conditional on MCP validation):**
- React frontend (18 screens)
- Thai + English bilingual web UI
- Admin dashboard with charts
- Cost/audit viewers

### Out-of-Scope (v1.0)

- Microsoft 365 integration
- Slack/Teams integration
- Custom LLM fine-tuning
- Mobile native app
- Video/audio content analysis
- Real-time collaborative wiki editing
- Multi-LLM support
- On-premise deployment

## 4.4 Business Requirements

### BR-AUTH: Authentication & Authorization

| ID | Requirement | Priority |
|----|------------|----------|
| BR-AUTH-01 | ผู้ใช้ต้อง login ด้วย Google Workspace account เท่านั้น | P0 |
| BR-AUTH-02 | ระบบต้องรองรับ role-based access: SuperAdmin, Admin, DeptHead, Member, Viewer | P0 |
| BR-AUTH-03 | ข้อมูลต้อง isolate ตาม department -- user เห็นเฉพาะ wiki ของแผนกตัวเอง + shared | P0 |
| BR-AUTH-04 | Admin สามารถ grant cross-department access ได้ | P1 |
| BR-AUTH-05 | Session timeout ตั้งค่าได้ (default 8 hours) | P1 |
| BR-AUTH-06 | MCP clients ต้อง authenticate ด้วย OAuth 2.0 Bearer token | P0 |

### BR-DRIVE: Drive Integration

| ID | Requirement | Priority |
|----|------------|----------|
| BR-DRIVE-01 | Admin ต้องสามารถเชื่อม Google Drive folders กับ departments ได้ | P0 |
| BR-DRIVE-02 | ระบบต้อง detect file changes ผ่าน webhook + scheduled fallback | P0 |
| BR-DRIVE-03 | ระบบต้อง extract text จาก Docs, Sheets, Slides, PDFs | P0 |
| BR-DRIVE-04 | ระบบต้อง skip unchanged documents (content hash) | P0 |
| BR-DRIVE-05 | ระบบต้อง support domain-wide delegation สำหรับ service account | P0 |

### BR-WIKI: Wiki Compilation & Maintenance

| ID | Requirement | Priority |
|----|------------|----------|
| BR-WIKI-01 | ระบบต้อง auto-compile wiki pages จาก Google Drive documents | P0 |
| BR-WIKI-02 | Wiki pages ต้องมี 4 ประเภท: Entity, Concept, Summary, Filed | P0 |
| BR-WIKI-03 | ระบบต้อง maintain cross-references ระหว่าง wiki pages อัตโนมัติ | P0 |
| BR-WIKI-04 | ระบบต้อง maintain master index ที่ searchable | P0 |
| BR-WIKI-05 | ระบบต้อง run lint ตรวจสอบ contradictions, stale data อัตโนมัติ | P1 |
| BR-WIKI-06 | Chat answers ที่มีคุณค่าต้อง auto-file เป็น wiki page ใหม่ | P1 |
| BR-WIKI-07 | Wiki pages ต้อง bilingual (Thai + English) | P1 |
| BR-WIKI-08 | ระบบต้อง track source documents ของทุก wiki page | P0 |

### BR-CHAT: Chat & Query

| ID | Requirement | Priority |
|----|------------|----------|
| BR-CHAT-01 | ผู้ใช้ต้องถามคำถามเป็น natural language (ไทย + อังกฤษ) ได้ | P0 |
| BR-CHAT-02 | ระบบต้องตอบโดยอ้างอิง wiki pages เป็นหลัก (wiki-first) | P0 |
| BR-CHAT-03 | ถ้า wiki ไม่มีคำตอบ ต้อง fallback ไป raw source (Drive) | P0 |
| BR-CHAT-04 | ทุกคำตอบต้องมี citations ชี้ไปยัง source | P0 |
| BR-CHAT-05 | ระบบต้องรักษา chat history per session | P1 |
| BR-CHAT-06 | ผู้ใช้สามารถ rate คำตอบ (helpful/not helpful) | P1 |
| BR-CHAT-07 | Chat ต้องทำงานผ่านทั้ง MCP (ask tool) และ REST API (SSE) | P0 |

### BR-MCP: MCP Server

| ID | Requirement | Priority |
|----|------------|----------|
| BR-MCP-01 | ระบบต้องมี MCP Server ที่ทำงานกับ Claude Desktop, VS Code, Cursor | P0 |
| BR-MCP-02 | MCP ต้อง expose wiki pages เป็น Resources ที่ AI อ่านได้ | P0 |
| BR-MCP-03 | MCP ต้อง expose Tools สำหรับ search, ask, ingest, lint | P0 |
| BR-MCP-04 | MCP ต้องมี Prompts สำเร็จรูป (/research, /summarize, /compare, /onboard, /weekly-digest) | P1 |
| BR-MCP-05 | MCP ต้องรองรับ stdio transport (local) + Streamable HTTP (remote/multi-user) | P0 |
| BR-MCP-06 | ทุก MCP tool call ต้อง track cost + audit log | P0 |
| BR-MCP-07 | MCP ต้อง rate limit per user per tool | P1 |
| BR-MCP-08 | MCP sessions ต้อง persist ใน Redis (survive process restart) | P1 |

### BR-ADMIN: Administration & Governance

| ID | Requirement | Priority |
|----|------------|----------|
| BR-ADMIN-01 | Admin สามารถสร้าง/จัดการ departments ได้ | P0 |
| BR-ADMIN-02 | Admin สามารถ assign Drive folders ให้ departments ได้ | P0 |
| BR-ADMIN-03 | Admin สามารถ set content policies per department | P1 |
| BR-ADMIN-04 | Admin สามารถดู usage stats (queries, users, costs) | P0 |
| BR-ADMIN-05 | Admin สามารถ trigger manual re-ingestion ได้ | P1 |
| BR-ADMIN-06 | Admin สามารถ manage user roles | P0 |

### BR-AUDIT: Compliance & Audit

| ID | Requirement | Priority |
|----|------------|----------|
| BR-AUDIT-01 | ทุก action ต้องมี HMAC-signed audit log | P0 |
| BR-AUDIT-02 | Audit logs ต้อง tamper-evident (HMAC chain) | P0 |
| BR-AUDIT-03 | Admin สามารถ export audit reports ได้ | P0 |
| BR-AUDIT-04 | ระบบต้อง support data retention policies | P1 |
| BR-AUDIT-05 | ระบบต้อง support right-to-erasure (PDPA) | P1 |
| BR-AUDIT-06 | ระบบต้องแสดง consent form ก่อนการใช้งานครั้งแรก | P0 |

### BR-COST: Cost Management

| ID | Requirement | Priority |
|----|------------|----------|
| BR-COST-01 | ระบบต้อง track token usage per LLM call per user per department | P0 |
| BR-COST-02 | ระบบต้อง support cost alerts (threshold-based) | P1 |
| BR-COST-03 | ระบบต้อง support per-department monthly quota | P1 |
| BR-COST-04 | ต้อง track MCP tool call costs แยกจาก REST API costs | P0 |

### BR-LINT: Wiki Quality

| ID | Requirement | Priority |
|----|------------|----------|
| BR-LINT-01 | ระบบต้อง detect contradictions between wiki pages | P1 |
| BR-LINT-02 | ระบบต้อง detect stale pages (source newer than wiki) | P1 |
| BR-LINT-03 | ระบบต้อง detect orphan pages (no cross-references) | P1 |
| BR-LINT-04 | ระบบต้อง generate lint report per department | P1 |

## 4.5 Risks & Assumptions

| Risk ID | Risk | Probability | Impact | Mitigation |
|---------|------|-------------|--------|------------|
| R-01 | Vertex AI rate limits ไม่เพียงพอสำหรับ large orgs | Medium | High | Reserved capacity, queue system, batch processing |
| R-02 | Thai language processing quality ไม่ดีพอ | Medium | High | Evaluate Gemini Thai capabilities early |
| R-03 | Google Drive webhook reliability ต่ำ | Low | Medium | Scheduled sync fallback ทุก 15 min |
| R-04 | Wiki page explosion (too many pages) | Medium | Medium | Schema-based page consolidation rules |
| R-05 | Cost overrun จาก LLM token usage | High | High | Per-dept quotas, cost alerts, smart caching |
| R-06 | PDPA compliance gaps | Medium | High | Legal review ก่อน launch |
| R-07 | User adoption ต่ำ | Medium | High | MCP reduces friction -- ใช้ได้ใน existing tools |
| R-08 | Hallucination ใน wiki pages | Medium | High | Source citation enforcement, lint verification |
| R-09 | MCP adoption ต่ำในองค์กร | Medium | Medium | Web UI เป็น fallback, training program |
| R-10 | MCP Streamable HTTP transport ยัง unstable | Low | High | stdio ทำงานได้เสมอ, HTTP เป็น bonus |
| R-11 | Claude Desktop / VS Code MCP support เปลี่ยน API | Low | Medium | Pin SDK version, abstraction layer |
| R-12 | Redis session loss = MCP session loss | Medium | Medium | Session re-establish protocol, persistent storage fallback |

---

# Section 5: SRS (Functional Requirements)

## 5.1 Module: AUTH (Authentication & Authorization)

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-AUTH-01 | Redirect ผู้ใช้ไป Google OAuth 2.0 consent screen | Click login | Google OAuth consent | ผู้ใช้ยังไม่ authenticated | OAuth flow initiated |
| FR-AUTH-02 | Exchange OAuth code เป็น access/refresh tokens | OAuth callback code | JWT session token | Valid OAuth code | Session created |
| FR-AUTH-03 | Create/update user record จาก Google profile | Google profile data | User record in DB | Valid OAuth tokens | User exists |
| FR-AUTH-04 | Issue JWT token (userId, departmentId, role, exp:8h) | User record | JWT | User exists | Client receives JWT |
| FR-AUTH-05 | Validate JWT ทุก API + MCP request | JWT in header | Allow/Deny | JWT present | 401 if invalid |
| FR-AUTH-06 | Enforce department scoping | JWT claims + resource dept | Allow/Deny | Valid JWT | 403 if mismatch |
| FR-AUTH-07 | Support role hierarchy: SuperAdmin > Admin > DeptHead > Member > Viewer | User role + action | Allow/Deny | Valid JWT | Action permitted or denied |
| FR-AUTH-08 | Auto-refresh token ก่อนหมดอายุ | Refresh token | New access token | Valid refresh | Session extended |
| FR-AUTH-09 | Revoke session เมื่อ logout | Logout request | Session invalidated | Active session | JWT blacklisted |
| FR-AUTH-10 | แสดง PDPA consent form สำหรับ first-time users | First login | Consent form | No consent record | Consent recorded or access denied |

## 5.2 Module: DRIVE (Drive Integration)

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-DRIVE-01 | Register Google Drive webhook สำหรับ monitored folders | Folder ID + webhook URL | Webhook registration | Folder assigned | Webhook active |
| FR-DRIVE-02 | Receive webhook notification เมื่อมีไฟล์เปลี่ยน | Webhook payload | Ingestion job queued | Webhook registered | Job in queue |
| FR-DRIVE-03 | Run scheduled sync ทุก 15 นาที | Cron trigger | Changed files list | Department configured | Changes identified |
| FR-DRIVE-04 | Download document content ผ่าน Drive API | Google file ID | Document text | Valid SA credentials | Content in memory |
| FR-DRIVE-05 | Compute content hash (SHA-256) เพื่อ skip unchanged | Doc content | Hash | Content downloaded | Hash compared |
| FR-DRIVE-06 | Export Docs เป็น text, Sheets เป็น CSV, Slides เป็น text | File ID + mimeType | Extracted text | File accessible | Text ready |
| FR-DRIVE-07 | Connect Drive folder to department | folderId + deptId | DriveFolder record | Admin auth | Webhook registered + scan started |
| FR-DRIVE-08 | Disconnect folder (cleanup webhooks) | Folder ID | Webhook removed | Folder connected | Monitoring stopped |
| FR-DRIVE-09 | Auto-renew webhook channels before expiry | Channel metadata | Renewed channel | Channel active | Channel extended |
| FR-DRIVE-10 | Pause/resume sync per folder | Folder ID + action | Updated status | Folder connected | Sync paused/resumed |

## 5.3 Module: INGEST (Document Ingestion)

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-INGEST-01 | Send document content ไป LLM เพื่อ extract entities, concepts, summary | Document text | Structured analysis | Content extracted | Analysis available |
| FR-INGEST-02 | Create/update Entity Pages จากผลวิเคราะห์ | Entity list from LLM | Wiki entity pages | Analysis complete | Pages in wiki |
| FR-INGEST-03 | Create/update Concept Pages จากผลวิเคราะห์ | Concept list from LLM | Wiki concept pages | Analysis complete | Pages in wiki |
| FR-INGEST-04 | Create Summary Page สำหรับทุก document | Document + LLM analysis | Summary page | Analysis complete | Summary in wiki |
| FR-INGEST-05 | Update cross-references ระหว่าง wiki pages ที่เกี่ยวข้อง | New/updated pages | CrossRef records | Pages created | Cross-refs up to date |
| FR-INGEST-06 | Update Master Index หลังสร้าง/อัปเดต pages | Updated page IDs | Index entries | Pages created | Index current |
| FR-INGEST-07 | Append entry ใน ingestion log | Ingestion metadata | Log entry | Ingestion complete | Log updated |
| FR-INGEST-08 | Enforce content policies ก่อน ingest | Content + policies | Allow/Skip/Flag | Policies configured | Doc processed or skipped |
| FR-INGEST-09 | Track ingestion cost (tokens used) per department | Token count | CostEvent record | Ingestion complete | Cost tracked |
| FR-INGEST-10 | Batch processing (multiple docs in queue) | Doc queue | Processed results | Docs queued | All docs processed |
| FR-INGEST-11 | Progress reporting (SSE to ingestion monitor) | Job status | Progress events | Job running | Progress visible |
| FR-INGEST-12 | Error handling (partial failure per doc) | Failed doc | Error record | Processing error | Error logged, others continue |

## 5.4 Module: WIKI (Wiki Store & Management)

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-WIKI-01 | Store wiki pages เป็น markdown ใน Cloud SQL | Page content + metadata | Persisted page | Valid data | Page in DB |
| FR-WIKI-02 | Version ทุก wiki page update (keep history) | Updated content | New version record | Page exists | Version incremented |
| FR-WIKI-03 | Maintain tsvector index สำหรับ FTS (Thai + English) | Page content | Updated search vector | Page created/updated | Index updated |
| FR-WIKI-04 | Support wiki page types: Entity, Concept, Summary, Filed, Index | Page type | Type-specific handling | Valid type | Page stored |
| FR-WIKI-05 | Maintain bidirectional cross-references | Source + target page | CrossRef record | Both pages exist | Nav both directions |
| FR-WIKI-06 | Generate Master Index page (auto-updated) | All page titles + types | Index markdown | Pages exist | Index current |
| FR-WIKI-07 | Department scoping -- pages belong to one department | Page + dept ID | Scoped page | Dept exists | Page scoped |
| FR-WIKI-08 | Support "shared" pages visible across departments | Page + shared flag | Shared page | Admin approval | Page visible to all |
| FR-WIKI-09 | Track source documents for every wiki page | Page + source doc IDs | Source mapping | Page from ingestion | Provenance traceable |
| FR-WIKI-10 | Support page status: Active, Stale, Flagged, Archived | Status transition | Updated status | Valid transition | Status changed |

## 5.5 Module: CHAT (Chat & Query Engine)

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-CHAT-01 | Create chat session | User ID | Session ID | User authenticated | Session created |
| FR-CHAT-02 | Receive natural language query (Thai/English) | Query text | Parsed query | Active session | Query ready |
| FR-CHAT-03 | Search Master Index เพื่อหา relevant pages | Query text | Ranked page IDs | Index exists | Pages identified |
| FR-CHAT-04 | Load relevant wiki pages เข้า LLM context | Page IDs | Pages in context | Pages exist | Context prepared |
| FR-CHAT-05 | Synthesize answer จาก wiki context | Context + query | Answer with citations | Context loaded | Answer generated |
| FR-CHAT-06 | Include citations (wiki pages + raw sources) | LLM response | Formatted answer | Answer generated | Citations included |
| FR-CHAT-07 | Fallback ไป raw source ถ้า wiki ไม่พอ | Low-confidence result | Drive doc re-synthesis | Wiki insufficient | Answer from raw |
| FR-CHAT-08 | Auto-file high-value answers เป็น wiki page | Answer + metadata | Filed wiki page | Answer generated | Knowledge compounded |
| FR-CHAT-09 | Maintain conversation context within session | Previous messages | Contextual response | Session with history | Context-aware |
| FR-CHAT-10 | Streaming response (SSE) | Query | Streaming tokens | Active session | Real-time display |
| FR-CHAT-11 | Allow user to rate answer (thumbs + comment) | Rating | Rating stored | Answer displayed | Feedback recorded |
| FR-CHAT-12 | Track chat cost (tokens) per user per session | Token count | CostEvent | Chat complete | Cost tracked |

## 5.6 Module: MCP (MCP Server) -- NEW

### FR-MCP-01: MCP Server Initialization

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-MCP-01a | Initialize MCP Server with `@modelcontextprotocol/sdk` | Server config | Running MCP server | Node.js process started | Server accepting connections |
| FR-MCP-01b | Support stdio transport (local dev / Claude Desktop) | Process spawn | stdin/stdout channel | Client spawns process | Bidirectional communication |
| FR-MCP-01c | Support Streamable HTTP transport (enterprise) | HTTP endpoint | HTTP session | Client connects to URL | Session established |
| FR-MCP-01d | Expose server capabilities: resources, tools, prompts | Client handshake | Capability list | Connection established | Client knows available features |

### FR-MCP-02: MCP Resources (10 Resources)

| ID | Resource URI | Returns | MIME | Auth |
|----|-------------|---------|------|------|
| FR-MCP-02a | `wiki://index` | Master wiki index (categories, page count) | text/markdown | member+ |
| FR-MCP-02b | `wiki://pages` | List of wiki pages (paginated, filterable) | application/json | member+ (dept-scoped) |
| FR-MCP-02c | `wiki://pages/{id}` | Full wiki page + metadata + cross-refs | text/markdown | member+ (dept-scoped) |
| FR-MCP-02d | `wiki://pages/{id}/history` | Version history of wiki page | application/json | depthead+ |
| FR-MCP-02e | `drive://folders` | Connected Drive folders with sync status | application/json | admin+ |
| FR-MCP-02f | `drive://folders/{id}/status` | Detailed sync status, last sync, errors | application/json | admin+ |
| FR-MCP-02g | `cost://dashboard` | Cost summary (total, by dept, by user, trend) | application/json | admin+ |
| FR-MCP-02h | `audit://logs` | Recent audit entries with HMAC status | application/json | admin+ / compliance |
| FR-MCP-02i | `admin://overview` | System stats (users, depts, pages, cost, health) | application/json | admin+ |
| FR-MCP-02j | `lint://report/{deptId}` | Latest lint report for department | application/json | depthead+ |

### FR-MCP-03: MCP Tools (8 Tools)

| ID | Tool Name | Description | Input Schema | Output Schema | Auth | Streaming |
|----|-----------|------------|-------------|--------------|------|-----------|
| FR-MCP-03a | `ask` | ถามคำถามเกี่ยวกับความรู้ในองค์กร | `{ query: string, department?: string }` | `{ answer, citations[], confidence, cost }` | member+ | Yes (SSE) |
| FR-MCP-03b | `search` | ค้นหา wiki pages | `{ query: string, type?: string, limit?: number }` | `{ results: [{id, title, excerpt, score}] }` | member+ | No |
| FR-MCP-03c | `get_page` | ดู wiki page พร้อม cross-references | `{ pageId: string }` | `{ content, metadata, crossRefs[], sources[] }` | member+ | No |
| FR-MCP-03d | `ingest_folder` | Trigger ingestion สำหรับ Drive folder | `{ folderId: string, force?: boolean }` | `{ status, docsQueued, estimatedTime }` | admin+ | No |
| FR-MCP-03e | `run_lint` | เรียกใช้ lint check สำหรับ department | `{ departmentId: string }` | `{ findings[], health_score, suggestions[] }` | depthead+ | No |
| FR-MCP-03f | `connect_drive_folder` | เชื่อมต่อ Drive folder กับ department | `{ googleFolderId: string, departmentId: string }` | `{ status, webhookRegistered, folderId }` | admin+ | No |
| FR-MCP-03g | `manage_user` | จัดการ user (เปลี่ยน role, ย้ายแผนก) | `{ userId: string, action: string, value?: string }` | `{ success, user }` | admin+ | No |
| FR-MCP-03h | `verify_audit` | ตรวจสอบ HMAC chain integrity | `{ entryId?: string }` | `{ valid, checkedCount, brokenAt? }` | superadmin+ / compliance | No |

### FR-MCP-04: MCP Prompts (5 Prompts)

| ID | Prompt | Description | Arguments | Workflow |
|----|--------|------------|-----------|----------|
| FR-MCP-04a | `/research {topic}` | วิจัยหัวข้อ multi-step | `{ topic: string }` | search -> read top pages -> synthesize -> cite |
| FR-MCP-04b | `/summarize {pageId}` | สรุป wiki page | `{ pageId: string }` | load page -> generate executive summary |
| FR-MCP-04c | `/compare {page1} {page2}` | เปรียบเทียบ 2 pages | `{ page1: string, page2: string }` | load 2 pages -> diff analysis -> highlight changes |
| FR-MCP-04d | `/onboard {department}` | สร้าง reading plan สำหรับพนักงานใหม่ | `{ department: string }` | load dept index -> curate essential reading list |
| FR-MCP-04e | `/weekly-digest {department}` | สรุปรายสัปดาห์ | `{ department: string }` | recent changes -> new pages -> lint -> cost -> summary |

### FR-MCP-05 through FR-MCP-10: Cross-Cutting MCP Requirements

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-MCP-05 | OAuth 2.0 authentication สำหรับ MCP connections | Bearer token | User identity | Valid Google OAuth token | User authenticated for session |
| FR-MCP-06 | Session management (per-user state in Redis) | Session ID | Session state | User authenticated | State persisted across requests |
| FR-MCP-07 | Streaming support สำหรับ ask() tool via SSE | ask() call | Token stream | ask() invoked | Tokens stream in real-time |
| FR-MCP-08 | Rate limiting per user per tool | Tool call | Allow/Deny (429) | User identified | Rate enforced |
| FR-MCP-09 | Cost tracking per MCP tool call | Tool call metadata | CostEvent record | Tool executed | Cost attributed to user/dept |
| FR-MCP-10 | Audit logging for every MCP tool invocation | Tool call + result | AuditLog entry | Tool executed | Action logged with HMAC |

## 5.7 Module: ADMIN (Administration)

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-ADMIN-01 | Create workspace (initial setup) | Org name + domain | Workspace record | OAuth complete | Workspace ready |
| FR-ADMIN-02 | Create/edit/delete departments | Dept data | Dept record | Workspace exists | Dept configured |
| FR-ADMIN-03 | Assign users to departments | userId + deptId | Updated user | Both exist | User in dept |
| FR-ADMIN-04 | Assign/unassign Drive folders to departments | folderId + deptId | DriveFolder record | Folder accessible | Monitoring started/stopped |
| FR-ADMIN-05 | Set content policies per department | Policy JSON | Updated policies | Dept exists | Enforced on next ingestion |
| FR-ADMIN-06 | View usage dashboard | Date range | Usage stats | Data exists | Dashboard rendered |
| FR-ADMIN-07 | Trigger manual re-ingestion | Resource ID | Job queued | Resource exists | Job started |
| FR-ADMIN-08 | Pause/resume ingestion per department | deptId + action | Updated status | Dept exists | Ingestion paused/resumed |
| FR-ADMIN-09 | Manage user roles | userId + role | Updated role | User exists | Role changed |
| FR-ADMIN-10 | View/manage wiki health (lint results) | deptId | Lint report | Lint has run | Health visible |

## 5.8 Module: AUDIT (Audit Logging)

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-AUDIT-01 | Log ทุก user action ด้วย HMAC signature | Action data | AuditLog with HMAC | Action performed | Entry immutable |
| FR-AUDIT-02 | Chain HMAC signatures (each signs previous hash) | Entry + prev HMAC | Chained HMAC | Previous entry exists | Tamper-evident chain |
| FR-AUDIT-03 | Verify HMAC chain integrity on demand | Date range | Integrity report | Logs exist | Integrity verified |
| FR-AUDIT-04 | Query audit logs with filters | Filters | Filtered entries | Logs exist | Results returned |
| FR-AUDIT-05 | Export audit logs เป็น CSV/JSON | Date range + format | Downloadable file | Logs exist | File available |
| FR-AUDIT-06 | Log failed authentication attempts | Failed login | AuditLog entry | Login attempted | Failed attempt recorded |
| FR-AUDIT-07 | Log wiki page modifications | Page ID + change | AuditLog entry | Page modified | Change logged |
| FR-AUDIT-08 | Log chat queries (metadata only, privacy-safe) | Query metadata | AuditLog entry | Query made | Metadata logged |
| FR-AUDIT-09 | Log MCP tool invocations | Tool name + params | AuditLog entry | Tool called | MCP action logged |
| FR-AUDIT-10 | HMAC key rotation support | Rotation request | New key version | Admin authorized | New key active, old preserved |

## 5.9 Module: COST (Cost Tracking)

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-COST-01 | Track token usage per LLM call | LLM response metadata | CostEvent record | LLM call complete | Usage recorded |
| FR-COST-02 | Aggregate cost per user per day/week/month | Aggregation query | Cost summary | Events exist | Summary available |
| FR-COST-03 | Aggregate cost per department per day/week/month | Aggregation query | Dept cost summary | Events exist | Summary available |
| FR-COST-04 | Support cost alerts (threshold-based) | Threshold config | Alert notification | Threshold set | Alert sent |
| FR-COST-05 | Support per-department monthly quota | Quota config | Quota enforcement | Quota configured | Blocked when exceeded |
| FR-COST-06 | Separate MCP vs REST API cost tracking | Channel tag | Channel-specific costs | Both channels active | Costs attributed correctly |

## 5.10 Module: LINT (Wiki Quality) -- Sprint 3

| ID | Requirement | Input | Output | Precondition | Postcondition |
|----|------------|-------|--------|-------------|---------------|
| FR-LINT-01 | Run scheduled lint (configurable cron) | Cron trigger | Lint job started | Wiki pages exist | Lint in progress |
| FR-LINT-02 | Detect contradictions between wiki pages | Page pairs | Contradiction list | Pages analyzed | Contradictions flagged |
| FR-LINT-03 | Detect stale pages (source > wiki update) | Metadata + dates | Stale page list | Metadata available | Stale pages flagged |
| FR-LINT-04 | Detect orphan pages (no cross-references) | Cross-ref graph | Orphan list | Pages + refs exist | Orphans identified |
| FR-LINT-05 | Suggest missing cross-references | Page content analysis | Suggested refs | Pages analyzed | Suggestions available |
| FR-LINT-06 | Generate lint report for admin dashboard | Lint results | Formatted report | Lint complete | Report viewable |
| FR-LINT-07 | Auto-fix simple issues (refresh stale pages) | Stale page + source | Updated wiki page | Source accessible | Page refreshed |
| FR-LINT-08 | Admin/DeptHead trigger manual lint run | deptId | Lint started | Dept exists | Lint in progress |

## 5.11 Validation Rules

| Rule ID | Field/Context | Validation | Error (Thai) |
|---------|--------------|------------|--------------|
| VR-01 | Department name | 2-100 chars, unique per workspace | "ชื่อแผนกต้อง 2-100 ตัวอักษรและไม่ซ้ำ" |
| VR-02 | Google folder ID | Valid Google Drive folder format | "Folder ID ไม่ถูกต้อง" |
| VR-03 | Content policy | Valid JSON, max 10KB | "รูปแบบ policy ไม่ถูกต้อง" |
| VR-04 | Chat query | 1-2000 chars | "คำถามต้อง 1-2000 ตัวอักษร" |
| VR-05 | Wiki page title | 1-200 chars, unique per department | "ชื่อหน้าต้อง 1-200 ตัวอักษร" |
| VR-06 | Wiki page content | Max 100KB markdown | "เนื้อหาเกิน 100KB" |
| VR-07 | Cost threshold | Positive number, USD | "จำนวนเงินต้องเป็นบวก" |
| VR-08 | Email | Valid email, must match Workspace domain | "อีเมลต้องเป็น domain ขององค์กร" |
| VR-09 | Role | Enum: SuperAdmin, Admin, DeptHead, Member, Viewer | "Role ไม่ถูกต้อง" |
| VR-10 | Audit date range | Max 365 days, start <= end | "ช่วงวันที่ไม่ถูกต้อง (สูงสุด 365 วัน)" |
| VR-11 | MCP tool query | 1-5000 chars for ask(), 1-500 for search() | "ข้อความยาวเกินกำหนด" |
| VR-12 | MCP session token | Valid OAuth 2.0 Bearer, not expired | "Token หมดอายุ กรุณา login ใหม่" |

## 5.12 API Outline (55 Endpoints -- REST + MCP)

### Auth APIs (5 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 1 | GET | `/api/auth/google` | Initiate OAuth flow | None |
| 2 | GET | `/api/auth/google/callback` | OAuth callback | None |
| 3 | POST | `/api/auth/logout` | Logout | JWT |
| 4 | GET | `/api/auth/me` | Get current user | JWT |
| 5 | POST | `/api/auth/consent` | Record PDPA consent | JWT |

### Workspace & Department APIs (10 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 6 | POST | `/api/workspaces` | Create workspace | SuperAdmin |
| 7 | GET | `/api/workspaces/:id` | Get workspace | Admin |
| 8 | PUT | `/api/workspaces/:id/schema` | Update wiki schema | Admin |
| 9 | POST | `/api/departments` | Create department | Admin |
| 10 | GET | `/api/departments` | List departments | JWT |
| 11 | GET | `/api/departments/:id` | Get department | JWT (scoped) |
| 12 | PUT | `/api/departments/:id` | Update department | Admin/DeptHead |
| 13 | DELETE | `/api/departments/:id` | Delete department | Admin |
| 14 | PUT | `/api/departments/:id/policies` | Update policies | Admin/DeptHead |
| 15 | GET | `/api/departments/:id/overview` | Dept dashboard data | JWT (scoped) |

### User Management APIs (5 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 16 | GET | `/api/users` | List users | Admin/DeptHead |
| 17 | GET | `/api/users/:id` | Get user | JWT (self/admin) |
| 18 | PUT | `/api/users/:id/role` | Update role | Admin |
| 19 | PUT | `/api/users/:id/department` | Move user | Admin |
| 20 | DELETE | `/api/users/:id` | Deactivate user | Admin |

### Drive Integration APIs (6 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 21 | POST | `/api/drive/folders` | Assign folder | Admin |
| 22 | GET | `/api/drive/folders` | List folders | JWT (scoped) |
| 23 | DELETE | `/api/drive/folders/:id` | Remove folder | Admin |
| 24 | POST | `/api/drive/webhook` | Receive webhook | Google (verified) |
| 25 | POST | `/api/drive/sync/:deptId` | Trigger sync | Admin |
| 26 | GET | `/api/drive/sync/status/:deptId` | Sync status | JWT (scoped) |

### Wiki APIs (8 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 27 | GET | `/api/wiki/pages` | List pages | JWT (scoped) |
| 28 | GET | `/api/wiki/pages/:id` | Get page content | JWT (scoped) |
| 29 | GET | `/api/wiki/pages/:id/history` | Version history | JWT (scoped) |
| 30 | GET | `/api/wiki/pages/:id/refs` | Cross-references | JWT (scoped) |
| 31 | GET | `/api/wiki/index/:deptId` | Master index | JWT (scoped) |
| 32 | GET | `/api/wiki/search` | FTS search | JWT (scoped) |
| 33 | POST | `/api/wiki/pages/:id/flag` | Flag page | JWT |
| 34 | GET | `/api/wiki/stats/:deptId` | Wiki statistics | JWT (scoped) |

### Chat APIs (6 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 35 | POST | `/api/chat/sessions` | Create session | JWT |
| 36 | GET | `/api/chat/sessions` | List sessions | JWT |
| 37 | GET | `/api/chat/sessions/:id` | Get session | JWT (owner) |
| 38 | POST | `/api/chat/sessions/:id/messages` | Send message (SSE) | JWT (owner) |
| 39 | POST | `/api/chat/messages/:id/rate` | Rate message | JWT (owner) |
| 40 | DELETE | `/api/chat/sessions/:id` | Delete session | JWT (owner) |

### Audit APIs (3 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 41 | GET | `/api/audit/logs` | Query logs | Admin/Compliance |
| 42 | POST | `/api/audit/verify` | Verify HMAC chain | Admin/Compliance |
| 43 | POST | `/api/audit/export` | Export report | Admin/Compliance |

### Cost APIs (5 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 44 | GET | `/api/cost/summary` | Cost summary | Admin |
| 45 | GET | `/api/cost/department/:id` | Dept cost detail | Admin/DeptHead |
| 46 | PUT | `/api/cost/department/:id/quota` | Set quota | Admin |
| 47 | GET | `/api/cost/alerts` | Get alert configs | Admin |
| 48 | PUT | `/api/cost/alerts` | Update alerts | Admin |

### Lint APIs (3 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 49 | POST | `/api/lint/run/:deptId` | Trigger lint | Admin/DeptHead |
| 50 | GET | `/api/lint/reports/:deptId` | Get reports | JWT (scoped) |
| 51 | GET | `/api/lint/reports/:deptId/latest` | Latest report | JWT (scoped) |

### MCP Endpoints (4 endpoints)

| # | Method | Endpoint | Description | Auth |
|---|--------|---------|-------------|------|
| 52 | POST | `/mcp` | MCP Streamable HTTP endpoint | OAuth Bearer |
| 53 | GET | `/mcp` | MCP SSE stream (server-to-client) | OAuth Bearer |
| 54 | DELETE | `/mcp` | Close MCP session | OAuth Bearer |
| 55 | GET | `/mcp/health` | MCP server health check | None |

### MCP Interface (stdio -- not HTTP endpoint)

stdio transport ทำงานเป็น separate process:
```
npx drivewiki-mcp --token $DRIVEWIKI_TOKEN
```

## 5.13 Integration Requirements

### Google Workspace Integration

| Integration | API | Scopes Required | Data Flow |
|------------|-----|----------------|-----------|
| OAuth SSO | Google Identity | `openid`, `email`, `profile` | User -> Google -> DriveWiki |
| Drive Read | Drive API v3 | `drive.readonly` | DriveWiki -> Drive (read) |
| Drive Webhooks | Drive API v3 | `drive.readonly` | Drive -> DriveWiki (push) |
| Docs Export | Docs API v1 | `documents.readonly` | DriveWiki -> Docs (export) |
| Sheets Read | Sheets API v4 | `spreadsheets.readonly` | DriveWiki -> Sheets (read) |
| Slides Read | Slides API v1 | `presentations.readonly` | DriveWiki -> Slides (read) |
| Admin SDK | Directory API | `admin.directory.user.readonly` | DriveWiki -> Admin (users) |

### Vertex AI Integration

| Integration | Service | Model | Usage |
|------------|---------|-------|-------|
| Document Analysis | Vertex AI Generative | Gemini 2.5 Pro | Entity/concept extraction |
| Chat Synthesis | Vertex AI Generative | Gemini 2.5 Pro | Answer generation |
| Lint Analysis | Vertex AI Generative | Gemini 2.5 Flash | Contradiction detection |

### MCP SDK Integration

| Package | Version | Usage |
|---------|---------|-------|
| `@modelcontextprotocol/sdk` | latest stable | MCP server implementation |
| Transport: stdio | Built-in | Local dev (Claude Desktop, VS Code) |
| Transport: Streamable HTTP | Built-in | Enterprise (Cloud Run) |

## 5.14 Cross-Cutting Concerns

### Error Handling

| Error Category | HTTP Status | User Message (Thai) | MCP Error |
|---------------|-------------|-------------------|-----------|
| Auth failure | 401 | "กรุณาเข้าสู่ระบบใหม่" | INVALID_REQUEST |
| Auth denied | 403 | "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" | INVALID_REQUEST |
| Not found | 404 | "ไม่พบข้อมูลที่ต้องการ" | INVALID_PARAMS |
| Validation | 422 | Field-specific message | INVALID_PARAMS |
| Rate limited | 429 | "คำขอมากเกินไป กรุณารอสักครู่" | INTERNAL_ERROR |
| LLM error | 503 | "ระบบ AI ไม่พร้อมใช้งานชั่วคราว" | INTERNAL_ERROR |
| Internal | 500 | "เกิดข้อผิดพลาด กรุณาลองใหม่" | INTERNAL_ERROR |

### Caching Strategy

| Layer | Cache | TTL | Invalidation |
|-------|-------|-----|-------------|
| API responses | Redis | 5 min | On wiki page update |
| Wiki page content | App memory | 2 min | On page write |
| Master index | Redis | 10 min | On index update |
| User sessions | Redis | 8 hours | On logout |
| MCP sessions | Redis | 8 hours | On disconnect |
| Drive file metadata | Redis | 15 min | On webhook |

---

# Section 6: UX/UI Blueprint

## 6.1 Phase 1: MCP-Only UX (Sprint 1-2)

MCP เป็น primary interface -- ไม่มี Web UI ในช่วงนี้

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "drivewiki": {
      "command": "npx",
      "args": ["drivewiki-mcp"],
      "env": {
        "DRIVEWIKI_TOKEN": "eyJ...",
        "DRIVEWIKI_API_URL": "https://drivewiki-backend-xxxxx.run.app"
      }
    }
  }
}
```

### VS Code MCP Integration

```json
// .vscode/settings.json
{
  "mcp.servers": {
    "drivewiki": {
      "command": "npx",
      "args": ["drivewiki-mcp"],
      "env": {
        "DRIVEWIKI_TOKEN": "${env:DRIVEWIKI_TOKEN}"
      }
    }
  }
}
```

### Enterprise Remote Configuration (Streamable HTTP)

```json
{
  "mcpServers": {
    "drivewiki": {
      "url": "https://drivewiki-backend-xxxxx.run.app/mcp",
      "headers": {
        "Authorization": "Bearer ${DRIVEWIKI_TOKEN}"
      }
    }
  }
}
```

### Example MCP Conversations

#### Example 1: Knowledge Worker ค้นหา

```
User: ค้นหาข้อมูลเกี่ยวกับนโยบายลาพักร้อน

Claude: [เรียก search tool]
  search({ query: "นโยบายลาพักร้อน" })

  ผลลัพธ์:
  1. "นโยบายลาพักร้อนประจำปี 2026" (score: 0.95)
  2. "กระบวนการขอลา" (score: 0.82)
  3. "สิทธิการลาของพนักงาน" (score: 0.78)

Claude: [เรียก get_page tool]
  get_page({ pageId: "leave-policy-2026" })

Claude: พบข้อมูลนโยบายลาพักร้อนประจำปี 2026:

  **สรุปสำคัญ:**
  - พนักงานมีสิทธิลาพักร้อน 15 วัน/ปี (เพิ่มจาก 12 วัน)
  - สะสมได้ไม่เกิน 30 วัน
  - ต้องแจ้งล่วงหน้า 3 วันทำการ

  [อ้างอิง: wiki://pages/leave-policy-2026]
```

#### Example 2: Research Prompt

```
User: /research OKR process ในองค์กร

Claude: [MCP Prompt: /research triggers multi-step workflow]

  Step 1: search({ query: "OKR process" })
  -> Found 8 relevant pages

  Step 2: get_page for top 5 pages
  -> Loading: okr-guidelines, okr-q1-2026, okr-template,
     performance-review, goal-setting

  Step 3: Synthesize

  === รายงานวิจัย: OKR Process ในองค์กร ===

  1. ภาพรวม
     OKR (Objectives and Key Results) ถูกนำมาใช้ตั้งแต่ Q3/2025...

  2. กระบวนการปัจจุบัน
     - ตั้ง OKR รายไตรมาส
     - Review กลางไตรมาส
     - Scoring ปลายไตรมาส

  3. ปัญหาที่พบ
     [ข้อมูลจาก lint report: contradictions between dept practices]

  อ้างอิง:
  - wiki://pages/okr-guidelines
  - wiki://pages/okr-q1-2026
  - wiki://pages/performance-review
```

#### Example 3: Admin via MCP

```
User: ดูสถานะระบบ DriveWiki

Claude: [เรียก MCP resource: admin://overview]

  === DriveWiki System Overview ===
  Users:       245 active / 312 total
  Departments: 8
  Wiki Pages:  12,450 (Entity: 3,200, Concept: 5,100, Summary: 2,800, Filed: 1,350)
  Storage:     4.2 GB
  Cost MTD:    $1,245.30
  Health:      7 departments healthy, 1 needs attention (Finance - 3 stale pages)

User: ตรวจสอบ audit chain

Claude: [เรียก verify_audit tool]
  verify_audit({})

  HMAC Chain Integrity: VALID
  Entries checked: 45,230
  Date range: 2026-03-01 to 2026-04-17
  No broken entries found.
```

### MCP Error Handling Examples

```
Case 1: Unauthorized
Claude: [เรียก ingest_folder tool]
  Error: "คุณไม่มีสิทธิ์ดำเนินการนี้ (ต้องเป็น Admin)"

Case 2: Rate Limited
Claude: [เรียก ask tool -- 11th call in 1 minute]
  Error: "คำขอมากเกินไป กรุณารอ 30 วินาที"

Case 3: Department Scoping
Claude: [เรียก get_page for Finance dept -- user is HR]
  Error: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลแผนกนี้"
```

## 6.2 Phase 2: Web UI (Sprint 4-5 -- Conditional)

Web UI สร้างเมื่อ MCP validated แล้ว -- refer to `FRONTEND-SPEC.md` for full detail.

### Screen Inventory (18 screens)

| Screen ID | Screen Name | Access | Priority |
|-----------|------------|--------|----------|
| SCR-01 | Landing / Login | Public | Sprint 4 |
| SCR-02 | PDPA Consent | First-time | Sprint 4 |
| SCR-03 | Setup Wizard (5 steps) | SuperAdmin | Sprint 4 |
| SCR-04 | Chat (main) | Member+ | Sprint 4 |
| SCR-05 | Wiki Browse | Member+ | Sprint 4 |
| SCR-06 | Wiki Page Detail | Member+ | Sprint 4 |
| SCR-07 | Wiki Search | Member+ | Sprint 4 |
| SCR-08 | Department Dashboard | DeptHead+ | Sprint 5 |
| SCR-09 | Admin Dashboard | Admin+ | Sprint 5 |
| SCR-10 | User Management | Admin+ | Sprint 5 |
| SCR-11 | Department Management | Admin+ | Sprint 5 |
| SCR-12 | Drive Folder Manager | Admin+ | Sprint 5 |
| SCR-13 | Content Policy Editor | DeptHead+ | Sprint 5 |
| SCR-14 | Ingestion Monitor | Admin+ | Sprint 5 |
| SCR-15 | Cost Dashboard | Admin+ | Sprint 5 |
| SCR-16 | Audit Log Viewer | Admin/Compliance | Sprint 5 |
| SCR-17 | Lint Report | DeptHead+ | Sprint 5 |
| SCR-18 | User Profile / Settings | All | Sprint 4 |

### Key Web UI Flows

ดูรายละเอียดเพิ่มเติมที่ `FRONTEND-SPEC.md` -- ครอบคลุม:
- Project structure (file tree)
- Design system (colors, typography, Thai text optimization)
- Component catalog (15 components with all variants/states)
- Page specifications (18 pages with every state)
- State management (Zustand/TanStack Query)
- API client layer
- i18n strategy (Thai/English)
- Testing strategy
- Performance requirements
- Security (frontend)
- Deployment (Cloud Run)

---

# Section 7: PBIs (Product Backlog Items)

## Sprint 1: Backend Foundation (10 days)

### PBI-001: Google OAuth SSO Login

**Story:** ในฐานะพนักงาน ฉันต้องการ login ด้วย Google Workspace account เพื่อเข้าใช้งาน DriveWiki

**Business Value:** ลดแรงเสียดทานในการ adopt -- ใช้ identity เดิม

**Acceptance Criteria:**
- Given ผู้ใช้เปิด DriveWiki -> When กด "Login with Google" -> Then redirect ไป Google consent screen
- Given consent สำเร็จ -> When callback -> Then สร้าง session + JWT
- Given ผู้ใช้ไม่ได้อยู่ใน Workspace domain -> When login -> Then แสดง error

**QA Notes:** ทดสอบ token expiry, concurrent sessions, domain restriction
**DEV Notes:** Passport.js google-oauth2, store refresh token encrypted
**Dependencies:** None
**Sprint:** 1
**Maps to:** FR-AUTH-01, FR-AUTH-02, FR-AUTH-03

---

### PBI-002: JWT Token Management

**Story:** ในฐานะระบบ ฉันต้องออก JWT token ที่มี user context เพื่อ authenticate ทุก request

**Business Value:** Stateless auth ที่ scale ได้บน Cloud Run + MCP

**Acceptance Criteria:**
- Given login สำเร็จ -> When ออก JWT -> Then มี userId, email, deptId, role, exp(8h)
- Given JWT expired -> When request -> Then auto-refresh ด้วย refresh token
- Given logout -> When ใช้ old JWT -> Then ได้ 401

**QA Notes:** Test token tampering, expired tokens, refresh flow
**DEV Notes:** jose library, Redis for blacklist
**Dependencies:** PBI-001
**Sprint:** 1
**Maps to:** FR-AUTH-04, FR-AUTH-05, FR-AUTH-08, FR-AUTH-09

---

### PBI-003: PDPA Consent Flow

**Story:** ในฐานะผู้ใช้ครั้งแรก ฉันต้องเห็น PDPA consent form ก่อนใช้งาน

**Business Value:** PDPA compliance -- ป้องกัน legal risk

**Acceptance Criteria:**
- Given first login -> When เข้าระบบ -> Then แสดง consent form
- Given ไม่ยินยอม -> When กดปฏิเสธ -> Then logout + อธิบาย
- Given ยินยอมแล้ว -> When login ครั้งต่อไป -> Then ไม่แสดงอีก

**QA Notes:** Test consent withdrawal, consent record in audit log
**DEV Notes:** Consent timestamp + version in user record
**Dependencies:** PBI-001
**Sprint:** 1
**Maps to:** FR-AUTH-10

---

### PBI-004: RBAC Role System

**Story:** ในฐานะ Admin ฉันต้องกำหนด role ให้ users เพื่อควบคุมสิทธิ์

**Business Value:** Data governance -- ป้องกันการเข้าถึงข้อมูลที่ไม่เกี่ยวข้อง

**Acceptance Criteria:**
- Given DeptHead -> When เข้า Admin -> Then เห็นเฉพาะ department ตัวเอง
- Given Member -> When เข้า Admin section -> Then ได้ 403
- Given role hierarchy -> When check -> Then SuperAdmin > Admin > DeptHead > Member > Viewer

**QA Notes:** Test all role x action combinations (matrix test)
**DEV Notes:** Middleware-based role check, permission matrix in config
**Dependencies:** PBI-002
**Sprint:** 1
**Maps to:** FR-AUTH-06, FR-AUTH-07

---

### PBI-005: Prisma Schema & Database Setup

**Story:** ในฐานะระบบ ฉันต้องมี database schema สำหรับ entities ทั้งหมด

**Business Value:** Foundation ของทุก feature -- ไม่มี schema ก็ไม่มีระบบ

**Acceptance Criteria:**
- Given Prisma schema defined -> When migrate -> Then tables created: Workspace, Department, User, DriveFolder, DriveDocument, WikiPage, WikiCrossRef, WikiIndex, ChatSession, ChatMessage, AuditLog, CostEvent, LintReport, ContentPolicy
- Given schema -> When inspect -> Then มี indexes, constraints, relations ถูกต้อง
- Given Cloud SQL (aikms-pg, drivewiki db) -> When connect via Prisma -> Then CRUD works

**QA Notes:** Test migration rollback, unique constraints, foreign keys
**DEV Notes:** Prisma, PostgreSQL 16, tsvector for FTS, uuid-ossp, pg_trgm
**Dependencies:** None
**Sprint:** 1
**Maps to:** FR-WIKI-01, FR-WIKI-03

---

### PBI-006: Google Drive Folder Connection

**Story:** ในฐานะ Admin ฉันต้องเชื่อม Drive folders กับ departments

**Business Value:** Foundation -- ไม่มี folder ก็ไม่มี wiki

**Acceptance Criteria:**
- Given Admin -> When connect folder -> Then webhook registered + initial scan started
- Given folder connected -> When disconnect -> Then webhook removed, wiki pages preserved
- Given folder -> When check status -> Then เห็น sync status, last sync, error count

**QA Notes:** Test nested folders, shared drives, large folder trees
**DEV Notes:** Drive API v3, domain-wide delegation
**Dependencies:** PBI-005
**Sprint:** 1
**Maps to:** FR-DRIVE-01, FR-DRIVE-07, FR-DRIVE-08

---

### PBI-007: Drive Webhook Listener

**Story:** ในฐานะระบบ ฉันต้องรับ webhook จาก Drive เมื่อมีเอกสารเปลี่ยน

**Business Value:** Real-time awareness -- wiki อัปเดตทันที

**Acceptance Criteria:**
- Given folder monitored -> When ไฟล์เปลี่ยน -> Then webhook trigger ภายใน 1 นาที
- Given webhook payload -> When process -> Then queue ingestion job
- Given webhook ล้มเหลว -> When scheduled sync -> Then จับ changes ที่พลาด

**QA Notes:** Test signature verification, webhook expiry renewal
**DEV Notes:** Drive changes.watch, verify X-Goog-Resource-State
**Dependencies:** PBI-006
**Sprint:** 1
**Maps to:** FR-DRIVE-02, FR-DRIVE-09

---

### PBI-008: Scheduled Sync Fallback

**Story:** ในฐานะระบบ ฉันต้อง scan Drive ทุก 15 นาที เพื่อจับ changes ที่ webhook พลาด

**Business Value:** Reliability -- ไม่พึ่ง webhook 100%

**Acceptance Criteria:**
- Given sync ถึงเวลา -> When scan -> Then ระบุ files ที่ modified หลัง last sync
- Given hash ไม่เปลี่ยน -> When compare -> Then skip ingestion
- Given error -> When retry 3 ครั้ง -> Then log error + alert

**QA Notes:** Test 10,000+ files, hash comparison accuracy
**DEV Notes:** Cloud Scheduler + Cloud Tasks, SHA-256 hash
**Dependencies:** PBI-006
**Sprint:** 1
**Maps to:** FR-DRIVE-03, FR-DRIVE-05

---

### PBI-009: Document Content Extraction

**Story:** ในฐานะระบบ ฉันต้อง extract text จาก Docs, Sheets, Slides

**Business Value:** ครอบคลุมทุก document type ที่องค์กรใช้

**Acceptance Criteria:**
- Given Google Doc -> When extract -> Then plain text รักษา headings + structure
- Given Google Sheet -> When extract -> Then CSV format
- Given Google Slides -> When extract -> Then text จากทุก slide + speaker notes
- Given unsupported file -> When extract -> Then skip + log

**QA Notes:** Test Thai-heavy docs, large files (>10MB)
**DEV Notes:** Docs/Sheets/Slides export APIs, rate limit handling
**Dependencies:** PBI-007
**Sprint:** 1
**Maps to:** FR-DRIVE-04, FR-DRIVE-06

---

### PBI-010: HMAC Audit Logging Foundation

**Story:** ในฐานะระบบ ฉันต้อง log ทุก action ด้วย HMAC signature

**Business Value:** Compliance + trust -- tamper-evident log

**Acceptance Criteria:**
- Given any action -> When complete -> Then audit log entry with HMAC-SHA256
- Given entries -> When chain -> Then each signs (content + previous HMAC)
- Given chain -> When verify -> Then detect tampered entry

**QA Notes:** Test chain with 100,000+ entries, verification performance
**DEV Notes:** HMAC-SHA256, Secret Manager, chain hash pattern
**Dependencies:** PBI-005
**Sprint:** 1
**Maps to:** FR-AUDIT-01, FR-AUDIT-02, FR-AUDIT-03

---

### PBI-011: Cost Tracking Foundation

**Story:** ในฐานะระบบ ฉันต้อง track token usage per LLM call

**Business Value:** Cost transparency -- รู้ว่าใช้เท่าไร

**Acceptance Criteria:**
- Given LLM call -> When complete -> Then CostEvent created (user, dept, tokens, cost)
- Given events -> When aggregate -> Then cost per user/dept/day available
- Given MCP vs REST -> When track -> Then channel separated

**QA Notes:** Test cost calculation accuracy, aggregation queries
**DEV Notes:** Wrap every LLM call with cost middleware
**Dependencies:** PBI-005
**Sprint:** 1
**Maps to:** FR-COST-01, FR-COST-06

---

### PBI-012: Express API Server Scaffold

**Story:** ในฐานะระบบ ฉันต้องมี API server ที่พร้อมรับ requests

**Business Value:** Foundation -- ทุก feature ต้องมี server

**Acceptance Criteria:**
- Given server started -> When health check -> Then 200 OK
- Given auth middleware -> When request without JWT -> Then 401
- Given rate limiter -> When > 100 req/min -> Then 429
- Given CORS -> When cross-origin -> Then configured correctly

**QA Notes:** Test health, auth, rate limit, error handling
**DEV Notes:** Express.js, helmet, cors, express-rate-limit
**Dependencies:** PBI-002
**Sprint:** 1
**Maps to:** Cross-cutting

---

## Sprint 2: Wiki Engine + MCP Server (10 days)

### PBI-013: LLM Entity Extraction Pipeline

**Story:** ในฐานะระบบ ฉันต้อง extract entities จากเอกสาร เพื่อสร้าง Entity Pages

**Business Value:** สร้าง knowledge graph อัตโนมัติ

**Acceptance Criteria:**
- Given doc text -> When LLM analyze -> Then extract entities (type, name, description)
- Given existing entity -> When พบใน doc ใหม่ -> Then merge (ไม่ duplicate)
- Given Thai entity -> When extract -> Then รักษาชื่อไทย

**QA Notes:** Test deduplication accuracy, Thai entity recognition
**DEV Notes:** Vertex AI Gemini structured output, entity matching heuristic
**Dependencies:** PBI-009, PBI-005
**Sprint:** 2
**Maps to:** FR-INGEST-01, FR-INGEST-02

---

### PBI-014: LLM Concept Extraction Pipeline

**Story:** ในฐานะระบบ ฉันต้อง extract concepts จากเอกสาร เพื่อสร้าง Concept Pages

**Business Value:** รวบรวมความรู้เชิงแนวคิดจากหลายเอกสาร

**Acceptance Criteria:**
- Given doc text -> When LLM analyze -> Then extract concepts (name, definition, examples)
- Given existing concept -> When พบข้อมูลใหม่ -> Then enrich existing page
- Given contradiction -> When detect -> Then flag for lint review

**QA Notes:** Test concept boundary detection
**DEV Notes:** Prompt engineering, structured output schema
**Dependencies:** PBI-009, PBI-005
**Sprint:** 2
**Maps to:** FR-INGEST-01, FR-INGEST-03

---

### PBI-015: Summary Page Generation + Cross-Refs + Index

**Story:** ในฐานะระบบ ฉันต้องสร้าง summary pages, cross-references, และ master index

**Business Value:** Navigable knowledge graph -- หัวใจของ Karpathy pattern

**Acceptance Criteria:**
- Given doc ingested -> When complete -> Then summary page created (max 500 words)
- Given new pages -> When scan existing -> Then cross-refs created bidirectionally
- Given cross-ref cleanup -> When page deleted -> Then refs removed
- Given wiki pages exist -> When generate index -> Then searchable index with categories

**QA Notes:** Test ref integrity after bulk ops, index with 50,000+ pages
**DEV Notes:** Separate CrossRef table, tsvector + GIN index
**Dependencies:** PBI-013, PBI-014
**Sprint:** 2
**Maps to:** FR-INGEST-04, FR-INGEST-05, FR-INGEST-06, FR-WIKI-05, FR-WIKI-06

---

### PBI-016: Wiki Full-Text Search

**Story:** ในฐานะ knowledge worker ฉันต้องค้นหา wiki pages ด้วย keyword

**Business Value:** ค้นหาเร็ว ไม่ต้องพึ่ง chat ทุกครั้ง

**Acceptance Criteria:**
- Given query "นโยบายการลา" -> When search -> Then return relevant pages ranked by relevance
- Given English query -> When search -> Then return results regardless of page language
- Given no results -> When display -> Then show empty state

**QA Notes:** Test Thai word segmentation, mixed Thai-English queries
**DEV Notes:** PostgreSQL FTS with pg_trgm
**Dependencies:** PBI-015
**Sprint:** 2
**Maps to:** FR-WIKI-03

---

### PBI-017: Chat Engine (Wiki-First Query Processing)

**Story:** ในฐานะระบบ ฉันต้อง process queries โดยค้นหา wiki ก่อน

**Business Value:** Core Karpathy pattern -- wiki in context > retrieval

**Acceptance Criteria:**
- Given query -> When process -> Then search index -> load top-K pages -> synthesize
- Given wiki covers question -> When answer -> Then < 3s (p95)
- Given answer -> When display -> Then citations to wiki pages

**QA Notes:** Test various query types (factual, procedural, comparative)
**DEV Notes:** Vertex AI Gemini, context window management
**Dependencies:** PBI-015, PBI-016
**Sprint:** 2
**Maps to:** FR-CHAT-03, FR-CHAT-04, FR-CHAT-05, FR-CHAT-06

---

### PBI-018: Chat Streaming + Session Management

**Story:** ในฐานะ user ฉันต้องเห็นคำตอบแบบ streaming + จัดการ sessions

**Business Value:** UX -- เห็น progress ทันที

**Acceptance Criteria:**
- Given query sent -> When processing -> Then tokens stream (SSE)
- Given sessions -> When create/list/delete -> Then CRUD works
- Given session -> When send message -> Then context maintained

**QA Notes:** Test SSE stability, reconnect on disconnect
**DEV Notes:** SSE (Cloud Run compatible), session persistence
**Dependencies:** PBI-017
**Sprint:** 2
**Maps to:** FR-CHAT-01, FR-CHAT-09, FR-CHAT-10

---

### PBI-019: Knowledge Compounding (Auto-File)

**Story:** ในฐานะระบบ เมื่อ chat answer มีคุณค่าสูง ฉันต้อง auto-file เป็น wiki page

**Business Value:** Knowledge compounds -- Karpathy key insight

**Acceptance Criteria:**
- Given high-value answer -> When file -> Then create "Filed" wiki page
- Given filed page -> When created -> Then update cross-refs + index
- Given duplicate -> When detect -> Then don't file twice

**QA Notes:** Test filing criteria, duplicate detection
**DEV Notes:** LLM evaluator prompt for value assessment
**Dependencies:** PBI-017, PBI-015
**Sprint:** 2
**Maps to:** FR-CHAT-08

---

### PBI-020: Raw Source Fallback

**Story:** ในฐานะระบบ เมื่อ wiki ไม่มีคำตอบ ฉันต้อง fallback ไป Drive

**Business Value:** ครอบคลุม -- ไม่ทิ้งผู้ใช้แม้ wiki ยังไม่ complete

**Acceptance Criteria:**
- Given wiki confidence ต่ำ -> When fallback -> Then fetch Drive docs -> re-synthesize
- Given fallback answer -> When display -> Then ระบุว่า "จากเอกสารต้นฉบับ"
- Given fallback with high value -> When evaluate -> Then auto-file

**QA Notes:** Test fallback latency (< 8s), accuracy wiki vs fallback
**DEV Notes:** Confidence threshold configurable
**Dependencies:** PBI-017
**Sprint:** 2
**Maps to:** FR-CHAT-07

---

### PBI-021: MCP Server Scaffold + Transports

**Story:** ในฐานะระบบ ฉันต้องมี MCP Server ที่ทำงานกับ Claude Desktop, VS Code

**Business Value:** PRIMARY INTERFACE -- ทำให้ users เข้าถึง knowledge จาก AI tools

**Acceptance Criteria:**
- Given MCP server -> When start (stdio) -> Then Claude Desktop connects successfully
- Given MCP server -> When start (HTTP) -> Then remote clients connect
- Given client handshake -> When complete -> Then server advertises resources, tools, prompts
- Given auth token -> When validate -> Then user identity established for session

**QA Notes:** Test both transports, test connection lifecycle, test auth
**DEV Notes:** @modelcontextprotocol/sdk, Express middleware for HTTP transport
**Dependencies:** PBI-012, PBI-002
**Sprint:** 2
**Maps to:** FR-MCP-01a, FR-MCP-01b, FR-MCP-01c, FR-MCP-01d, FR-MCP-05

---

### PBI-022: MCP Resources Implementation (10 Resources)

**Story:** ในฐานะ AI (Claude) ฉันต้องอ่านข้อมูล DriveWiki ผ่าน MCP Resources

**Business Value:** AI อ่าน wiki, costs, audit, admin stats ได้ตรง

**Acceptance Criteria:**
- Given `wiki://index` -> When read -> Then return master index in markdown
- Given `wiki://pages/{id}` -> When read -> Then return full page + metadata
- Given `cost://dashboard` -> When read -> Then return cost summary
- Given `audit://logs` -> When read -> Then return recent entries with HMAC
- Given department scoping -> When user reads other dept -> Then 403
- Given 10 resources total -> When list -> Then all 10 advertised

**QA Notes:** Test all 10 resources, test auth scoping, test pagination
**DEV Notes:** Resource handlers call shared service layer
**Dependencies:** PBI-021, PBI-015, PBI-010, PBI-011
**Sprint:** 2
**Maps to:** FR-MCP-02a through FR-MCP-02j

---

### PBI-023: MCP Tools Implementation (8 Tools)

**Story:** ในฐานะ AI (Claude) ฉันต้องเรียก DriveWiki actions ผ่าน MCP Tools

**Business Value:** AI สามารถ search, ask, ingest, lint ได้จาก Claude Desktop/VS Code

**Acceptance Criteria:**
- Given ask() -> When invoke -> Then streaming answer with citations
- Given search() -> When invoke -> Then ranked results
- Given get_page() -> When invoke -> Then full page content
- Given ingest_folder() -> When invoke (admin) -> Then ingestion queued
- Given run_lint() -> When invoke (depthead) -> Then lint report returned
- Given connect_drive_folder() -> When invoke (admin) -> Then folder connected
- Given manage_user() -> When invoke (admin) -> Then user updated
- Given verify_audit() -> When invoke (compliance) -> Then chain verified
- Given unauthorized tool call -> When invoke -> Then error message in Thai
- Given rate limit exceeded -> When invoke -> Then 429 with wait time

**QA Notes:** Test all 8 tools, test auth per tool, test streaming, test rate limits
**DEV Notes:** Tool handlers call shared service layer, cost tracking per call
**Dependencies:** PBI-021, PBI-017, PBI-016, PBI-006, PBI-010
**Sprint:** 2
**Maps to:** FR-MCP-03a through FR-MCP-03h, FR-MCP-07, FR-MCP-08, FR-MCP-09, FR-MCP-10

---

### PBI-024: MCP Prompts Implementation (5 Prompts)

**Story:** ในฐานะ user ฉันต้องใช้ workflow templates สำเร็จรูปผ่าน MCP Prompts

**Business Value:** Complex workflows ใน 1 command -- /research, /onboard etc.

**Acceptance Criteria:**
- Given /research {topic} -> When invoke -> Then multi-step: search -> read -> synthesize -> cite
- Given /summarize {pageId} -> When invoke -> Then executive summary in Thai
- Given /compare {page1} {page2} -> When invoke -> Then structured comparison table
- Given /onboard {department} -> When invoke -> Then prioritized reading plan
- Given /weekly-digest {department} -> When invoke -> Then weekly knowledge update
- Given 5 prompts -> When list -> Then all 5 advertised with descriptions

**QA Notes:** Test each prompt end-to-end, test with real wiki data
**DEV Notes:** Prompts compose tools and resources internally
**Dependencies:** PBI-022, PBI-023
**Sprint:** 2
**Maps to:** FR-MCP-04a through FR-MCP-04e

---

### PBI-025: MCP Session Management (Redis)

**Story:** ในฐานะระบบ ฉันต้อง maintain per-user MCP sessions ใน Redis

**Business Value:** State persistence -- user ไม่ต้อง re-auth ทุกครั้ง

**Acceptance Criteria:**
- Given user connects -> When authenticate -> Then session created in Redis (8h TTL)
- Given process restart -> When reconnect -> Then session restored from Redis
- Given user disconnects -> When timeout -> Then session cleaned up
- Given 500+ concurrent sessions -> When load test -> Then Redis handles OK

**QA Notes:** Test session persistence, failover, concurrent load
**DEV Notes:** Redis session store, Cloud Memorystore
**Dependencies:** PBI-021
**Sprint:** 2
**Maps to:** FR-MCP-06

---

### PBI-026: Content Policy Enforcement

**Story:** ในฐานะ DeptHead ฉันต้องกำหนด content policies ว่าเอกสารแบบไหนจะ ingest

**Business Value:** Governance -- ป้องกัน sensitive docs เข้า wiki โดยไม่ตั้งใจ

**Acceptance Criteria:**
- Given policy "exclude title contains CONFIDENTIAL" -> When new file matches -> Then skip + log
- Given policy -> When configure -> Then applied on next ingestion
- Given multiple rules -> When evaluate -> Then all rules checked in order

**QA Notes:** Test complex rule combinations, regex injection prevention
**DEV Notes:** JSON-based policy schema
**Dependencies:** PBI-005
**Sprint:** 2
**Maps to:** FR-INGEST-08

---

### PBI-027: Ingestion Progress Reporting

**Story:** ในฐานะ Admin ฉันต้องเห็น progress ของ document ingestion

**Business Value:** Operational visibility

**Acceptance Criteria:**
- Given ingestion running -> When check (via MCP or API) -> Then progress visible
- Given batch ingestion -> When some fail -> Then partial success reported
- Given error -> When inspect -> Then specific file + error message

**QA Notes:** Test 1000+ file batch, progress accuracy
**DEV Notes:** Job status in DB, poll endpoint or MCP resource
**Dependencies:** PBI-013, PBI-014
**Sprint:** 2
**Maps to:** FR-INGEST-10, FR-INGEST-11, FR-INGEST-12

---

### PBI-028: Answer Rating

**Story:** ในฐานะ user ฉันต้อง rate คำตอบเพื่อปรับปรุงระบบ

**Business Value:** Feedback loop for continuous improvement

**Acceptance Criteria:**
- Given answer displayed -> When rate -> Then thumbs up/down recorded
- Given "not helpful" -> When submit -> Then optional comment input
- Given ratings -> When aggregate -> Then satisfaction rate visible

**QA Notes:** Test rating analytics
**DEV Notes:** Simple endpoint, aggregate in dashboard
**Dependencies:** PBI-017
**Sprint:** 2
**Maps to:** FR-CHAT-11

---

## Sprint 3: Admin + Audit + Cost + Lint (10 days)

### PBI-029: Admin Service (User Management)

**Story:** ในฐานะ Admin ฉันต้องจัดการ users -- assign departments, set roles

**Business Value:** Governance -- ควบคุมว่าใครเข้าถึงอะไร

**Acceptance Criteria:**
- Given Admin -> When list users -> Then see: name, email, dept, role, last active
- Given Admin -> When change role -> Then updated + audit logged
- Given Admin -> When deactivate user -> Then cannot login + sessions revoked

**QA Notes:** Test bulk operations, self-deactivation prevention
**DEV Notes:** Admin service with CRUD endpoints
**Dependencies:** PBI-004, PBI-005
**Sprint:** 3
**Maps to:** FR-ADMIN-03, FR-ADMIN-09

---

### PBI-030: Admin Service (Department Management)

**Story:** ในฐานะ Admin ฉันต้องสร้างและจัดการ departments

**Business Value:** Data isolation -- scope ความรู้ตามโครงสร้างองค์กร

**Acceptance Criteria:**
- Given Admin -> When create dept -> Then appears in list + ready for folders
- Given dept with data -> When delete -> Then soft delete + archived
- Given Admin -> When assign head -> Then DeptHead role granted

**QA Notes:** Test cascade effects of dept delete
**DEV Notes:** Prisma soft delete, cascade rules
**Dependencies:** PBI-005
**Sprint:** 3
**Maps to:** FR-ADMIN-01, FR-ADMIN-02

---

### PBI-031: Audit Log Viewer (API)

**Story:** ในฐานะ Compliance Officer ฉันต้องค้นหาและดู audit logs

**Business Value:** Compliance -- ตอบ auditor ได้ทันที

**Acceptance Criteria:**
- Given query -> When filter by user, action, date -> Then results returned
- Given log entry -> When view -> Then see full metadata + HMAC status
- Given export request -> When generate -> Then CSV/JSON download available

**QA Notes:** Test large date ranges, filter combinations
**DEV Notes:** Paginated query, signed URL for export
**Dependencies:** PBI-010
**Sprint:** 3
**Maps to:** FR-AUDIT-04, FR-AUDIT-05

---

### PBI-032: HMAC Chain Verification

**Story:** ในฐานะ Compliance Officer ฉันต้องตรวจสอบ HMAC chain integrity

**Business Value:** Tamper evidence -- พิสูจน์ว่า log ไม่ถูกแก้ไข

**Acceptance Criteria:**
- Given chain -> When verify -> Then report pass/fail per entry
- Given tampered entry -> When detect -> Then report exact broken entry
- Given MCP verify_audit tool -> When invoke -> Then same verification

**QA Notes:** Test with injected tampered entries
**DEV Notes:** Sequential chain verification, batch for performance
**Dependencies:** PBI-010
**Sprint:** 3
**Maps to:** FR-AUDIT-03

---

### PBI-033: HMAC Key Rotation

**Story:** ในฐานะ Admin ฉันต้องหมุนเปลี่ยน HMAC key เป็นระยะ

**Business Value:** Security best practice

**Acceptance Criteria:**
- Given rotation request -> When rotate -> Then new key active, old preserved
- Given new entries -> When sign -> Then use new key version
- Given old entries -> When verify -> Then use corresponding key version

**QA Notes:** Test rotation during active writes
**DEV Notes:** Key version tracking per entry
**Dependencies:** PBI-010
**Sprint:** 3
**Maps to:** FR-AUDIT-10

---

### PBI-034: Cost Dashboard (API)

**Story:** ในฐานะ Admin ฉันต้องเห็น cost breakdown per dept, user, type

**Business Value:** Cost transparency + budget control

**Acceptance Criteria:**
- Given cost API -> When query by dept/user/period -> Then aggregated costs returned
- Given MCP vs REST -> When breakdown -> Then separated by channel
- Given trend -> When query 30 days -> Then daily costs array

**QA Notes:** Test with high volume cost events, aggregation accuracy
**DEV Notes:** Materialized views for performance
**Dependencies:** PBI-011
**Sprint:** 3
**Maps to:** FR-COST-02, FR-COST-03

---

### PBI-035: Cost Quotas & Alerts

**Story:** ในฐานะ Admin ฉันต้อง set monthly budget per department + alerts

**Business Value:** Prevent cost overrun

**Acceptance Criteria:**
- Given quota set -> When dept exceeds -> Then block queries + notify
- Given threshold 80% -> When reached -> Then alert email + in-app
- Given cost projection -> When estimate -> Then next 30 days projected

**QA Notes:** Test quota enforcement at boundary
**DEV Notes:** Check quota before every LLM call
**Dependencies:** PBI-034
**Sprint:** 3
**Maps to:** FR-COST-04, FR-COST-05

---

### PBI-036: Lint Agent -- Contradiction Detection

**Story:** ในฐานะระบบ ฉันต้อง detect contradictions between wiki pages

**Business Value:** Knowledge quality -- ป้องกันข้อมูลขัดแย้ง

**Acceptance Criteria:**
- Given 2 pages with conflicting info -> When lint -> Then contradiction flagged
- Given contradiction -> When report -> Then show both pages + evidence
- Given LLM analysis -> When compare pages -> Then structured output

**QA Notes:** Test with known contradictions, false positive rate
**DEV Notes:** Gemini Flash for cost efficiency, pair-wise comparison
**Dependencies:** PBI-015
**Sprint:** 3
**Maps to:** FR-LINT-02

---

### PBI-037: Lint Agent -- Stale + Orphan Detection

**Story:** ในฐานะระบบ ฉันต้อง detect stale pages + orphan pages

**Business Value:** Wiki hygiene -- ป้องกันข้อมูลเก่า/โดดเดี่ยว

**Acceptance Criteria:**
- Given source modified after wiki update -> When check -> Then page flagged stale
- Given page with 0 incoming refs -> When check -> Then flagged orphan
- Given suggestions -> When generate -> Then missing refs suggested

**QA Notes:** Test date comparison accuracy
**DEV Notes:** Metadata comparison, cross-ref graph analysis
**Dependencies:** PBI-015
**Sprint:** 3
**Maps to:** FR-LINT-03, FR-LINT-04, FR-LINT-05

---

### PBI-038: Lint Report Generation

**Story:** ในฐานะ DeptHead ฉันต้องดู lint report ของแผนก

**Business Value:** Proactive quality maintenance

**Acceptance Criteria:**
- Given lint complete -> When view -> Then report with severity, finding, page, suggested fix
- Given weekly cron -> When run -> Then report auto-generated
- Given manual trigger -> When click -> Then lint runs immediately
- Given MCP -> When /weekly-digest -> Then lint findings included

**QA Notes:** Test report format, cron scheduling
**DEV Notes:** Cloud Scheduler for cron
**Dependencies:** PBI-036, PBI-037
**Sprint:** 3
**Maps to:** FR-LINT-01, FR-LINT-06, FR-LINT-07, FR-LINT-08

---

### PBI-039: Workspace Setup Wizard (API)

**Story:** ในฐานะ IT Admin ฉันต้องมี wizard API ที่พาตั้งค่า workspace

**Business Value:** ลดเวลา setup จากหลายชั่วโมงเหลือ < 30 นาที

**Acceptance Criteria:**
- Given first admin -> When no workspace -> Then setup flow available
- Given wizard steps -> When complete -> Then workspace + depts + folders created
- Given incomplete setup -> When resume -> Then continue from last step

**QA Notes:** Test wizard interruption, resume
**DEV Notes:** Multi-step API, state in DB
**Dependencies:** PBI-001, PBI-005, PBI-006
**Sprint:** 3
**Maps to:** FR-ADMIN-01

---

### PBI-040: MCP Audit Logging for Tool Calls

**Story:** ในฐานะระบบ ทุก MCP tool call ต้องมี audit log entry

**Business Value:** Compliance -- รู้ว่าใครใช้ MCP ทำอะไร

**Acceptance Criteria:**
- Given any tool call -> When complete -> Then AuditLog with tool name, params, user, result
- Given resource read -> When access -> Then AuditLog (read action)
- Given logs -> When query by channel=MCP -> Then filter works

**QA Notes:** Test log completeness, no missing entries
**DEV Notes:** MCP middleware wraps all handlers
**Dependencies:** PBI-010, PBI-023
**Sprint:** 3
**Maps to:** FR-MCP-10, FR-AUDIT-09

---

## Sprint 4: Web UI Core (10 days) -- Conditional on MCP Validation

### PBI-041: React Scaffold + Design System

**Story:** ในฐานะ developer ฉันต้องมี React project ที่พร้อมสร้าง UI

**Business Value:** Foundation สำหรับ Web UI

**Acceptance Criteria:**
- Given project -> When scaffold -> Then Vite + React + TypeScript + Tailwind + shadcn/ui
- Given design system -> When inspect -> Then Thai fonts, colors, tokens configured
- Given build -> When run -> Then production-ready bundle

**QA Notes:** Test build output, Lighthouse score
**DEV Notes:** See FRONTEND-SPEC.md for full detail
**Dependencies:** PBI-012
**Sprint:** 4
**Maps to:** Web UI cross-cutting

---

### PBI-042: Login + PDPA Consent Pages

**Story:** ในฐานะ user ฉันต้อง login + consent ผ่าน web browser

**Business Value:** Non-technical users ที่ไม่มี Claude Desktop

**Acceptance Criteria:**
- Given landing page -> When click login -> Then Google OAuth flow
- Given first time -> When authenticated -> Then consent form shown
- Given consent -> When accepted -> Then redirect to chat

**QA Notes:** Test OAuth flow in browser
**DEV Notes:** Redirect-based OAuth
**Dependencies:** PBI-041, PBI-001, PBI-003
**Sprint:** 4
**Maps to:** SCR-01, SCR-02

---

### PBI-043: Chat Page (Web)

**Story:** ในฐานะ knowledge worker ฉันต้องถามคำถามผ่าน web browser

**Business Value:** ผู้ใช้ที่ไม่มี Claude Desktop ก็ใช้ได้

**Acceptance Criteria:**
- Given chat page -> When type query -> Then streaming response (SSE)
- Given answer -> When display -> Then citations with clickable links
- Given sessions -> When manage -> Then create/list/delete
- Given suggested queries -> When show -> Then 6 cards for new users

**QA Notes:** Test SSE in browser, test mobile responsive
**DEV Notes:** SSE client, virtual scroll for messages
**Dependencies:** PBI-041, PBI-017
**Sprint:** 4
**Maps to:** SCR-04

---

### PBI-044: Wiki Browse Page

**Story:** ในฐานะ user ฉันต้อง browse wiki pages ตาม category/department

**Business Value:** Discovery -- หาความรู้ที่ไม่รู้ว่ามี

**Acceptance Criteria:**
- Given wiki page -> When browse -> Then category tabs (Entity/Concept/Summary/Filed)
- Given filter -> When apply -> Then results filtered by dept, type, sort
- Given page card -> When click -> Then navigate to page detail

**QA Notes:** Test with 10,000+ pages, virtual scroll performance
**DEV Notes:** Paginated API, virtual scroll component
**Dependencies:** PBI-041, PBI-016
**Sprint:** 4
**Maps to:** SCR-05

---

### PBI-045: Wiki Page Detail

**Story:** ในฐานะ user ฉันต้องดู wiki page content + cross-references

**Business Value:** Deep reading with context

**Acceptance Criteria:**
- Given page detail -> When render -> Then markdown content + metadata
- Given cross-refs -> When display -> Then sidebar with related pages
- Given source docs -> When show -> Then links to original Drive documents
- Given version history -> When show -> Then list of versions with dates

**QA Notes:** Test markdown rendering, Thai content, long pages
**DEV Notes:** Markdown renderer with syntax highlight
**Dependencies:** PBI-041
**Sprint:** 4
**Maps to:** SCR-06

---

### PBI-046: Wiki Search Page

**Story:** ในฐานะ user ฉันต้องค้นหา wiki pages จาก web

**Business Value:** Quick access ไม่ต้องใช้ chat ทุกครั้ง

**Acceptance Criteria:**
- Given search input -> When type -> Then results with highlighted matches
- Given filters -> When apply -> Then filter by type, dept, date
- Given no results -> When display -> Then "ไม่พบผลลัพธ์ -- ลองถามใน Chat"

**QA Notes:** Test Thai search, autocomplete
**DEV Notes:** Debounced search, highlight matching terms
**Dependencies:** PBI-041, PBI-016
**Sprint:** 4
**Maps to:** SCR-07

---

### PBI-047: User Profile & Settings Page

**Story:** ในฐานะ user ฉันต้องดูและแก้ไข profile + settings

**Business Value:** Personalization

**Acceptance Criteria:**
- Given profile page -> When view -> Then avatar, name, email, dept, role
- Given settings -> When configure -> Then theme, language, date format
- Given sessions -> When view -> Then active sessions with revoke option

**QA Notes:** Test theme switching, language switching
**DEV Notes:** Zustand for local state, i18next
**Dependencies:** PBI-041
**Sprint:** 4
**Maps to:** SCR-18

---

### PBI-048: App Shell + Navigation

**Story:** ในฐานะ user ฉันต้องมี layout ที่ navigate ได้ง่าย

**Business Value:** UX consistency

**Acceptance Criteria:**
- Given Knowledge Worker -> When nav -> Then เห็น: Chat, Wiki, Search
- Given DeptHead -> When nav -> Then เห็นเพิ่ม: Department Dashboard, Lint
- Given Admin -> When nav -> Then เห็นเพิ่ม: Full Admin section
- Given sidebar -> When toggle -> Then collapsed/expanded

**QA Notes:** Test role-based nav visibility
**DEV Notes:** TanStack Router, role-based route guards
**Dependencies:** PBI-041
**Sprint:** 4
**Maps to:** Web UI cross-cutting

---

## Sprint 5: Web UI Admin + Polish (10 days)

### PBI-049: Admin Dashboard Page

**Story:** ในฐานะ Admin ฉันต้องเห็น dashboard แสดง usage metrics

**Business Value:** ROI justification

**Acceptance Criteria:**
- Given admin dashboard -> When load -> Then metrics: users, active, queries/day, pages, storage, cost
- Given date range -> When select -> Then charts update
- Given dept filter -> When apply -> Then scoped metrics

**QA Notes:** Test with large datasets, chart performance
**DEV Notes:** Recharts, materialized views
**Dependencies:** PBI-041, PBI-029
**Sprint:** 5
**Maps to:** SCR-09

---

### PBI-050: User Management Page

**Story:** ในฐานะ Admin ฉันต้องจัดการ users จาก web UI

**Business Value:** Visual user management

**Acceptance Criteria:**
- Given user table -> When view -> Then sortable, filterable, paginated
- Given user -> When edit role/dept -> Then updated + audit logged
- Given bulk select -> When action -> Then bulk operation

**QA Notes:** Test bulk operations, pagination performance
**DEV Notes:** DataTable component
**Dependencies:** PBI-041, PBI-029
**Sprint:** 5
**Maps to:** SCR-10

---

### PBI-051: Department Management Page

**Story:** ในฐานะ Admin ฉันต้องจัดการ departments จาก web UI

**Business Value:** Visual dept management

**Acceptance Criteria:**
- Given dept list -> When view -> Then cards with users, pages, folders, health
- Given create dept -> When submit -> Then dept created + ready for folders
- Given dept detail -> When view -> Then overview, folders, members, policies, cost

**QA Notes:** Test cascade effects
**DEV Notes:** Card grid layout
**Dependencies:** PBI-041, PBI-030
**Sprint:** 5
**Maps to:** SCR-11

---

### PBI-052: Cost Dashboard Page

**Story:** ในฐานะ Admin ฉันต้องดู cost breakdown ใน web charts

**Business Value:** Visual cost analysis

**Acceptance Criteria:**
- Given cost page -> When load -> Then total cost + trend chart
- Given dept breakdown -> When view -> Then stacked bar chart
- Given daily trend -> When view -> Then line chart (30 days)
- Given budget settings -> When configure -> Then quota per dept

**QA Notes:** Test chart rendering, data accuracy
**DEV Notes:** Recharts, real-time cost data
**Dependencies:** PBI-041, PBI-034
**Sprint:** 5
**Maps to:** SCR-15

---

### PBI-053: Audit Log Viewer Page

**Story:** ในฐานะ Compliance Officer ฉันต้องดู audit logs ใน web UI

**Business Value:** Visual audit review for non-technical compliance officers

**Acceptance Criteria:**
- Given audit page -> When load -> Then log table with filters
- Given HMAC badge -> When view -> Then integrity pass/fail per entry
- Given verify chain -> When click -> Then full verification runs
- Given export -> When click -> Then CSV/JSON download

**QA Notes:** Test with large date ranges
**DEV Notes:** DataTable with pagination, signed URL for export
**Dependencies:** PBI-041, PBI-031
**Sprint:** 5
**Maps to:** SCR-16

---

### PBI-054: Lint Report Page

**Story:** ในฐานะ DeptHead ฉันต้องดู lint report ใน web UI

**Business Value:** Visual lint findings

**Acceptance Criteria:**
- Given lint page -> When load -> Then latest report with findings
- Given finding -> When view -> Then severity, type, wiki page, suggested fix
- Given trigger lint -> When click -> Then lint runs (rate limited)

**QA Notes:** Test with many findings
**DEV Notes:** Findings table component
**Dependencies:** PBI-041, PBI-038
**Sprint:** 5
**Maps to:** SCR-17

---

### PBI-055: Drive Folder Manager Page + Ingestion Monitor

**Story:** ในฐานะ Admin ฉันต้องจัดการ Drive folders + ดู ingestion status จาก web

**Business Value:** Visual operations management

**Acceptance Criteria:**
- Given drive page -> When load -> Then connected folders tree per dept
- Given connect -> When click -> Then Google Drive picker -> folder connected
- Given ingestion -> When running -> Then progress bar, files processed, errors
- Given error -> When view -> Then specific file + error + retry button

**QA Notes:** Test Drive picker integration, progress accuracy
**DEV Notes:** Drive picker API, polling for progress
**Dependencies:** PBI-041, PBI-006, PBI-027
**Sprint:** 5
**Maps to:** SCR-12, SCR-14

---

## PBI Summary Table

| PBI | Name | Sprint | Dependencies | FR Mapping |
|-----|------|--------|-------------|------------|
| PBI-001 | Google OAuth SSO | 1 | - | FR-AUTH-01,02,03 |
| PBI-002 | JWT Token Management | 1 | PBI-001 | FR-AUTH-04,05,08,09 |
| PBI-003 | PDPA Consent | 1 | PBI-001 | FR-AUTH-10 |
| PBI-004 | RBAC Role System | 1 | PBI-002 | FR-AUTH-06,07 |
| PBI-005 | Prisma Schema & DB | 1 | - | FR-WIKI-01,03 |
| PBI-006 | Drive Folder Connection | 1 | PBI-005 | FR-DRIVE-01,07,08 |
| PBI-007 | Drive Webhook Listener | 1 | PBI-006 | FR-DRIVE-02,09 |
| PBI-008 | Scheduled Sync Fallback | 1 | PBI-006 | FR-DRIVE-03,05 |
| PBI-009 | Document Content Extraction | 1 | PBI-007 | FR-DRIVE-04,06 |
| PBI-010 | HMAC Audit Logging | 1 | PBI-005 | FR-AUDIT-01,02,03 |
| PBI-011 | Cost Tracking Foundation | 1 | PBI-005 | FR-COST-01,06 |
| PBI-012 | Express API Server Scaffold | 1 | PBI-002 | Cross-cutting |
| PBI-013 | Entity Extraction Pipeline | 2 | PBI-009,005 | FR-INGEST-01,02 |
| PBI-014 | Concept Extraction Pipeline | 2 | PBI-009,005 | FR-INGEST-01,03 |
| PBI-015 | Summary + Cross-Refs + Index | 2 | PBI-013,014 | FR-INGEST-04,05,06 |
| PBI-016 | Wiki Full-Text Search | 2 | PBI-015 | FR-WIKI-03 |
| PBI-017 | Chat Engine (Wiki-First) | 2 | PBI-015,016 | FR-CHAT-03,04,05,06 |
| PBI-018 | Chat Streaming + Sessions | 2 | PBI-017 | FR-CHAT-01,09,10 |
| PBI-019 | Knowledge Compounding | 2 | PBI-017,015 | FR-CHAT-08 |
| PBI-020 | Raw Source Fallback | 2 | PBI-017 | FR-CHAT-07 |
| PBI-021 | MCP Server Scaffold | 2 | PBI-012,002 | FR-MCP-01 |
| PBI-022 | MCP Resources (10) | 2 | PBI-021,015 | FR-MCP-02 |
| PBI-023 | MCP Tools (8) | 2 | PBI-021,017 | FR-MCP-03 |
| PBI-024 | MCP Prompts (5) | 2 | PBI-022,023 | FR-MCP-04 |
| PBI-025 | MCP Session Management | 2 | PBI-021 | FR-MCP-06 |
| PBI-026 | Content Policy Enforcement | 2 | PBI-005 | FR-INGEST-08 |
| PBI-027 | Ingestion Progress Reporting | 2 | PBI-013,014 | FR-INGEST-10,11,12 |
| PBI-028 | Answer Rating | 2 | PBI-017 | FR-CHAT-11 |
| PBI-029 | Admin Service (Users) | 3 | PBI-004,005 | FR-ADMIN-03,09 |
| PBI-030 | Admin Service (Depts) | 3 | PBI-005 | FR-ADMIN-01,02 |
| PBI-031 | Audit Log Viewer (API) | 3 | PBI-010 | FR-AUDIT-04,05 |
| PBI-032 | HMAC Chain Verification | 3 | PBI-010 | FR-AUDIT-03 |
| PBI-033 | HMAC Key Rotation | 3 | PBI-010 | FR-AUDIT-10 |
| PBI-034 | Cost Dashboard (API) | 3 | PBI-011 | FR-COST-02,03 |
| PBI-035 | Cost Quotas & Alerts | 3 | PBI-034 | FR-COST-04,05 |
| PBI-036 | Lint Contradiction Detection | 3 | PBI-015 | FR-LINT-02 |
| PBI-037 | Lint Stale + Orphan | 3 | PBI-015 | FR-LINT-03,04,05 |
| PBI-038 | Lint Report Generation | 3 | PBI-036,037 | FR-LINT-01,06,07,08 |
| PBI-039 | Workspace Setup Wizard | 3 | PBI-001,005,006 | FR-ADMIN-01 |
| PBI-040 | MCP Audit Logging | 3 | PBI-010,023 | FR-MCP-10 |
| PBI-041 | React Scaffold + Design System | 4 | PBI-012 | Web UI |
| PBI-042 | Login + Consent Pages | 4 | PBI-041 | SCR-01,02 |
| PBI-043 | Chat Page (Web) | 4 | PBI-041,017 | SCR-04 |
| PBI-044 | Wiki Browse Page | 4 | PBI-041,016 | SCR-05 |
| PBI-045 | Wiki Page Detail | 4 | PBI-041 | SCR-06 |
| PBI-046 | Wiki Search Page | 4 | PBI-041,016 | SCR-07 |
| PBI-047 | User Profile & Settings | 4 | PBI-041 | SCR-18 |
| PBI-048 | App Shell + Navigation | 4 | PBI-041 | Web UI |
| PBI-049 | Admin Dashboard Page | 5 | PBI-041,029 | SCR-09 |
| PBI-050 | User Management Page | 5 | PBI-041,029 | SCR-10 |
| PBI-051 | Dept Management Page | 5 | PBI-041,030 | SCR-11 |
| PBI-052 | Cost Dashboard Page | 5 | PBI-041,034 | SCR-15 |
| PBI-053 | Audit Log Viewer Page | 5 | PBI-041,031 | SCR-16 |
| PBI-054 | Lint Report Page | 5 | PBI-041,038 | SCR-17 |
| PBI-055 | Drive Folder + Ingestion Page | 5 | PBI-041,006 | SCR-12,14 |

**Total: 55 PBIs across 5 sprints (50 days)**

---

# Section 8: Role Summary

## What Each Role Can Start Doing Immediately

### PM (Product Manager)

- Review this spec + validate business requirements (Section 4)
- Prioritize PBIs with stakeholders -- confirm Sprint 1 lineup
- Set up project tracking (GitHub Projects / Jira)
- Schedule stakeholder demos after Sprint 2 (MCP demo day)
- Define MCP adoption metrics + success criteria
- Plan beta user group for MCP testing (10-20 power users)

### UX Designer

- Design Claude Desktop onboarding flow (screenshots + config guide)
- Create MCP conversation templates (example prompts for users)
- Document MCP error messages (Thai, user-friendly)
- Prepare Web UI design (Sprint 4) -- see FRONTEND-SPEC.md
- Create Thai typography guidelines for markdown content
- Design confidence indicator system for wiki answers

### Dev (Backend)

- Sprint 1: Auth (OAuth, JWT, RBAC), Prisma schema, Drive sync, content extraction
- Set up Cloud Run + Cloud SQL + GCS infrastructure
- Implement HMAC audit + cost tracking foundation
- Build shared service layer (WikiStore, ChatEngine, etc.)
- Write integration tests for Google Drive API
- Set up CI/CD pipeline (Cloud Build + Cloud Run deploy)

### Dev (MCP)

- Sprint 2: MCP Server scaffold with @modelcontextprotocol/sdk
- Implement stdio + Streamable HTTP transports
- Build 10 Resources (wiki://, drive://, cost://, audit://, admin://, lint://)
- Build 8 Tools (ask, search, get_page, ingest, lint, connect, manage, verify)
- Build 5 Prompts (/research, /summarize, /compare, /onboard, /weekly-digest)
- Write MCP integration tests (mock client)
- Create Claude Desktop config + VS Code config templates

### Dev (Frontend) -- Sprint 4+

- Wait for MCP validation results before starting
- Review FRONTEND-SPEC.md for full detail
- Scaffold React + Vite + shadcn/ui when Sprint 4 begins
- Build Chat page, Wiki browse, Wiki detail first
- Integrate with REST API (same backend, different interface)

### QA

- Sprint 1: Test OAuth flow, JWT lifecycle, RBAC matrix, Drive webhooks
- Sprint 2: Test MCP resources/tools/prompts (use Claude Desktop as test client)
- Test MCP auth scoping (dept isolation via MCP)
- Test MCP rate limiting
- Test streaming responses (SSE via MCP ask tool)
- Test audit log completeness (every MCP call must be logged)
- Sprint 4-5: Test Web UI (browser-based)

### Compliance

- Review PDPA consent flow + data residency config
- Validate HMAC audit chain integrity mechanism
- Review MCP audit logging (every tool call logged)
- Verify right-to-erasure implementation plan
- Confirm data retention policy configuration
- Test audit export (CSV/JSON) format meets regulatory requirements

---

# Section 9: Open Questions & Gaps

| # | Question | Owner | Impact | Status |
|---|---------|-------|--------|--------|
| OQ-01 | MCP Streamable HTTP transport เป็น stable spec หรือยัง? ถ้ายัง -- stdio only ก่อน | Dev (MCP) | High -- affects enterprise deployment | OPEN |
| OQ-02 | Google Workspace OAuth token ใช้ร่วมกับ MCP OAuth 2.0 flow ได้อย่างไร? | Dev (Backend) | High -- affects auth architecture | OPEN |
| OQ-03 | Redis Cloud Memorystore มี latency เท่าไรสำหรับ MCP session lookup? | Dev (Backend) | Medium -- affects NFR-MCP-01 | OPEN |
| OQ-04 | PDPA compliance ต้อง legal review อะไรเพิ่มสำหรับ MCP access? (data ไหลผ่าน AI client) | Compliance | High -- legal risk | OPEN |
| OQ-05 | Vertex AI Gemini 2.5 Pro มี structured output API สำหรับ entity extraction หรือไม่? | Dev (Backend) | Medium -- affects prompt engineering | OPEN |
| OQ-06 | Thai word segmentation สำหรับ PostgreSQL FTS ต้องใช้ custom tokenizer หรือไม่? | Dev (Backend) | Medium -- affects search quality | OPEN |
| OQ-07 | Budget สำหรับ GCP resources (Cloud Run, Cloud SQL, Vertex AI) ต่อเดือนเท่าไร? | PM | High -- affects feature scope | OPEN |
| OQ-08 | MCP client support ในองค์กรเป้าหมาย -- กี่ % มี Claude Desktop / VS Code? | PM | Medium -- affects MCP-first strategy | OPEN |
| OQ-09 | Cloud Run max request timeout (default 5 min) เพียงพอสำหรับ large ingestion jobs? | Dev (Backend) | Medium -- อาจต้อง Cloud Tasks | OPEN |
| OQ-10 | Content hash (SHA-256) เพียงพอสำหรับ change detection? Google Drive API มี built-in hash? | Dev (Backend) | Low -- affects ingestion efficiency | OPEN |
| OQ-11 | MCP tool streaming (ask tool via SSE) -- MCP spec support streaming tool results หรือยัง? | Dev (MCP) | High -- affects UX ของ ask() tool | OPEN |
| OQ-12 | Cursor IDE รองรับ MCP Resources / Prompts หรือแค่ Tools? | Dev (MCP) | Low -- affects client compatibility | OPEN |
| OQ-13 | Data residency: us-central1 เพียงพอสำหรับ Thai enterprise PDPA? ต้อง asia-southeast1? | Compliance | High -- affects infra decision | OPEN |
| OQ-14 | Wiki page size limit (100KB markdown) เพียงพอสำหรับ large entity pages? | PM / Dev | Medium -- affects content strategy | OPEN |
| OQ-15 | MCP session timeout 8h ยาวเกินไปหรือไม่สำหรับ shared machine environments? | Dev (MCP) | Low -- configurable | OPEN |

## PDPA Compliance Notice

DriveWiki ประมวลผลข้อมูลส่วนบุคคลดังนี้:
- ชื่อ-นามสกุล, อีเมล, แผนก จาก Google Workspace (เพื่อ authentication + authorization)
- ประวัติการใช้งาน (chat queries, wiki access) เพื่อ audit trail
- เนื้อหาเอกสารจาก Google Drive เพื่อ wiki compilation

ข้อมูลทั้งหมดจัดเก็บใน Google Cloud Platform region ที่กำหนด
ผู้ใช้ต้องให้ consent ก่อนใช้งาน (FR-AUTH-10)
รองรับ right-to-erasure (BR-AUDIT-05)

**ต้อง legal review ก่อน production deployment**

---

## Do's and Don'ts

### Do's

- DO build MCP Server ก่อน Web UI -- validate product-market fit เร็วกว่า
- DO use shared service layer -- ทั้ง REST และ MCP เรียก services เดียวกัน
- DO audit log ทุก MCP tool call -- compliance ต้องครบ
- DO track cost per channel (MCP vs REST) -- รู้ว่า user แต่ละ channel ใช้เท่าไร
- DO test MCP with Claude Desktop เป็น primary test client
- DO provide Thai error messages ใน MCP responses
- DO cache wiki pages ใน Redis -- ลด DB load สำหรับ MCP Resources
- DO pin @modelcontextprotocol/sdk version -- ป้องกัน breaking changes
- DO design MCP tools to be composable -- Prompts compose tools ได้

### Don'ts

- DON'T skip MCP validation ก่อนสร้าง Web UI -- Sprint 4 conditional
- DON'T expose raw database errors ใน MCP responses
- DON'T allow MCP tools without auth -- ทุก call ต้อง validate token
- DON'T store MCP sessions in memory only -- ใช้ Redis
- DON'T ignore rate limiting สำหรับ MCP tools -- ป้องกัน abuse
- DON'T let ask() tool run > 120 seconds -- timeout + partial result
- DON'T duplicate service logic ใน MCP handlers -- call shared services
- DON'T deploy Streamable HTTP without TLS -- Bearer tokens must be encrypted in transit
- DON'T hardcode MCP server URL -- configurable per environment

---

## Agent Prompt Guide (Handoff Prompts)

### For Spider-Man (Dev Backend) -- Sprint 1

```
สร้าง Express.js + TypeScript server scaffold สำหรับ DriveWiki
ตาม SUPER-SPEC-v2.md Section 5.12 (API Outline)

ต้องมี:
1. Google OAuth 2.0 login (Passport.js) -- PBI-001
2. JWT token management (jose library) -- PBI-002
3. RBAC middleware (SuperAdmin > Admin > DeptHead > Member > Viewer) -- PBI-004
4. Prisma schema สำหรับ 14 entities (Section 3.5) -- PBI-005
5. HMAC audit logger (SHA-256 chain) -- PBI-010
6. Cost tracking middleware -- PBI-011

Deploy target: Cloud Run, Cloud SQL (aikms-pg, drivewiki db), us-central1
```

### For Spider-Man (Dev MCP) -- Sprint 2

```
สร้าง MCP Server สำหรับ DriveWiki ด้วย @modelcontextprotocol/sdk
ตาม SUPER-SPEC-v2.md Section 5.6 (Module: MCP)

ต้องมี:
1. Server scaffold with stdio + Streamable HTTP transports -- PBI-021
2. 10 MCP Resources (wiki://, drive://, cost://, audit://, admin://, lint://) -- PBI-022
3. 8 MCP Tools (ask, search, get_page, ingest_folder, run_lint, connect_drive, manage_user, verify_audit) -- PBI-023
4. 5 MCP Prompts (/research, /summarize, /compare, /onboard, /weekly-digest) -- PBI-024
5. OAuth 2.0 auth per session -- PBI-021
6. Redis session management -- PBI-025

MCP handlers must call shared service layer (not duplicate logic)
```

### For Thor (QA) -- Sprint 2

```
ทดสอบ MCP Server ของ DriveWiki

ต้อง test:
1. ทุก 10 Resources -- data correctness, auth scoping, pagination
2. ทุก 8 Tools -- input validation, auth per tool, output format
3. ทุก 5 Prompts -- end-to-end workflow, Thai output quality
4. Auth -- dept scoping (user ของ HR ไม่ควรเห็น Finance data ผ่าน MCP)
5. Rate limiting -- ต้อง block เมื่อเกิน limit
6. Cost tracking -- ทุก tool call ต้องมี CostEvent
7. Audit logging -- ทุก tool call ต้องมี AuditLog entry
8. Streaming -- ask() tool ต้อง stream tokens via SSE
9. Transports -- ทั้ง stdio และ HTTP ต้องทำงาน
10. Session persistence -- Redis session ต้อง survive process restart
```

### For Spider-Man (Dev Frontend) -- Sprint 4

```
สร้าง React frontend สำหรับ DriveWiki
ตาม FRONTEND-SPEC.md (full detail) + SUPER-SPEC-v2.md Section 6.2

Sprint 4 scope (8 screens):
1. Login page (Google OAuth) -- SCR-01
2. PDPA Consent -- SCR-02
3. Chat page (SSE streaming) -- SCR-04
4. Wiki Browse -- SCR-05
5. Wiki Page Detail -- SCR-06
6. Wiki Search -- SCR-07
7. User Profile/Settings -- SCR-18
8. App Shell + Navigation

Tech: React + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Router + Zustand
Thai fonts: IBM Plex Sans Thai, base 16px, line-height 1.6-1.8
```

### For Thor (QA) -- E2E

```
สร้าง E2E test suite สำหรับ DriveWiki

Critical paths:
1. Login -> Consent -> Chat -> Ask question -> Get answer with citations
2. Login -> Wiki Browse -> Click page -> See content + cross-refs
3. Admin Login -> Create dept -> Connect Drive folder -> Trigger ingestion -> Verify wiki pages created
4. MCP: connect Claude Desktop -> search -> get_page -> ask question
5. Compliance: open audit -> verify HMAC chain -> export report
```

---

*Document version: 2.0 | Generated: 2026-04-17 | Replaces: SUPER-SPEC.md (v1)*
*Architecture: MCP-First, Web UI Second (Hybrid)*
*Total: 55 PBIs | 80+ FRs | 55 API endpoints | 10 MCP Resources | 8 MCP Tools | 5 MCP Prompts*
