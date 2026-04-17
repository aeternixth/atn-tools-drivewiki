# DriveWiki — System Blueprint (ASCII Edition)

> Visual bible ของระบบทั้งหมด — อ่านได้โดยไม่ต้องมี tool ใดๆ
> ทุก feature, ทุก flow, ทุกหน้าจอ — ไม่มีอะไรถูกข้าม

---

## 1. System Architecture Overview

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                        DriveWiki — System Architecture                           ║
╠═══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                   ║
║   ┌─────────────────────────────────────────────────────────────────────────┐     ║
║   │                        EXTERNAL SYSTEMS                                 │     ║
║   │                                                                         │     ║
║   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │     ║
║   │  │   Google      │  │  Vertex AI   │  │  Cloud SQL   │  │    GCS     │  │     ║
║   │  │  Workspace    │  │  (Gemini)    │  │ (PostgreSQL) │  │  (Storage) │  │     ║
║   │  │  Drive/Docs/  │  │  LLM Infer   │  │  Wiki+Auth+  │  │  Raw docs  │  │     ║
║   │  │  Sheets/Slide │  │  Embedding   │  │  Audit+Cost  │  │  Exports   │  │     ║
║   │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │     ║
║   └─────────┼────────────────┼────────────────┼────────────────┼──────────┘     ║
║             │                │                │                │                   ║
║   ══════════╪════════════════╪════════════════╪════════════════╪═══════════════   ║
║             │                │                │                │                   ║
║   ┌─────────┴────────────────┴────────────────┴────────────────┴──────────────┐   ║
║   │                        BACKEND (Cloud Run)                                │   ║
║   │                                                                           │   ║
║   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   ║
║   │  │ Auth Gateway  │  │ Drive Sync   │  │ Ingest Agent │  │  Wiki Store  │  │   ║
║   │  │              │  │   Engine     │  │              │  │              │  │   ║
║   │  │ OAuth 2.0    │  │ Webhooks     │  │ Entity/      │  │ CRUD pages   │  │   ║
║   │  │ JWT tokens   │  │ Scheduled    │  │ Concept      │  │ Cross-refs   │  │   ║
║   │  │ RBAC         │  │ Change detect│  │ extraction   │  │ Master index │  │   ║
║   │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │   ║
║   │         │                 │                  │                  │          │   ║
║   │  ┌──────┴───────┐  ┌─────┴────────┐  ┌─────┴────────┐  ┌─────┴────────┐ │   ║
║   │  │ Chat Engine   │  │ Lint Agent   │  │ Search Svc   │  │ Schema Mgr   │ │   ║
║   │  │              │  │              │  │              │  │              │ │   ║
║   │  │ Query→Wiki   │  │ Contradict.  │  │ FTS + BM25   │  │ Wiki config  │ │   ║
║   │  │ LLM synth    │  │ Stale detect │  │ Thai token   │  │ Conventions  │ │   ║
║   │  │ SSE stream   │  │ Orphan pages │  │ Autocomplete │  │ Policies     │ │   ║
║   │  │ Auto-filing  │  │ Weekly cron  │  │ Ranking      │  │ Workflows    │ │   ║
║   │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │   ║
║   │                                                                           │   ║
║   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   ║
║   │  │ Admin Service │  │ Audit Logger │  │ Cost Tracker │  │ Notification │  │   ║
║   │  │              │  │              │  │              │  │    Service   │  │   ║
║   │  │ Users/Dept   │  │ HMAC chain   │  │ Per-user     │  │ Email       │  │   ║
║   │  │ Roles/Perms  │  │ Tamper-proof │  │ Per-dept     │  │ In-app      │  │   ║
║   │  │ Workspace    │  │ Key rotation │  │ Budget alert │  │ Lint alerts │  │   ║
║   │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │   ║
║   └───────────────────────────────────────────────────────────────────────────┘   ║
║                                         │                                         ║
║   ══════════════════════════════════════╪═════════════════════════════════════    ║
║                                         │                                         ║
║   ┌─────────────────────────────────────┴─────────────────────────────────────┐   ║
║   │                         FRONTEND (React + Vite)                           │   ║
║   │                                                                           │   ║
║   │  ┌────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────────────┐  │   ║
║   │  │  Chat  │  │  Wiki   │  │  Search  │  │  Admin  │  │  User Profile │  │   ║
║   │  │  UI    │  │ Browser │  │  Global  │  │ Panels  │  │  & Settings  │  │   ║
║   │  └────────┘  └─────────┘  └──────────┘  └─────────┘  └───────────────┘  │   ║
║   └───────────────────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Karpathy's 3-Layer Architecture

```
╔═══════════════════════════════════════════════════════════════════════╗
║              Karpathy's LLM Wiki Pattern (April 2026)                ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  LAYER 1: RAW SOURCES (Immutable — LLM reads, never modifies)       ║
║  ┌───────────────────────────────────────────────────────────────┐   ║
║  │  Google Drive                                                 │   ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   ║
║  │  │  Docs    │ │  Sheets  │ │  Slides  │ │  PDFs / Images   │ │   ║
║  │  │ นโยบาย   │ │ ข้อมูล    │ │ Slides   │ │  สแกนเอกสาร      │ │   ║
║  │  │ คู่มือ    │ │ รายงาน   │ │ อบรม     │ │  แบบฟอร์ม        │ │   ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │   ║
║  └───────────────────────────────┬───────────────────────────────┘   ║
║                                  │                                    ║
║                     ┌────────────┴────────────┐                      ║
║                     │      INGEST AGENT       │                      ║
║                     │  ┌────────────────────┐ │                      ║
║                     │  │ 1. Download doc    │ │                      ║
║                     │  │ 2. Extract text    │ │                      ║
║                     │  │ 3. Hash check      │ │                      ║
║                     │  │ 4. Identify entity │ │                      ║
║                     │  │ 5. Identify concept│ │                      ║
║                     │  │ 6. Create pages    │ │                      ║
║                     │  │ 7. Cross-reference │ │                      ║
║                     │  │ 8. Update index    │ │                      ║
║                     │  │ 9. Append log      │ │                      ║
║                     │  └────────────────────┘ │                      ║
║                     └────────────┬────────────┘                      ║
║                                  │                                    ║
║  LAYER 2: THE WIKI (LLM-owned — Agent creates & maintains)          ║
║  ┌───────────────────────────────┴───────────────────────────────┐   ║
║  │  Wiki Store (Markdown + PostgreSQL)                           │   ║
║  │                                                               │   ║
║  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   ║
║  │  │ Entity Pages │  │Concept Pages│  │   Summary Pages     │  │   ║
║  │  │             │  │             │  │                     │  │   ║
║  │  │ บุคคล:      │  │ แนวคิด:     │  │ สรุป:               │  │   ║
║  │  │  คุณสมชาย   │  │  OKR        │  │  รายงานQ1/2026     │  │   ║
║  │  │  แผนก HR   │  │  PDPA       │  │  ผลประกอบการ       │  │   ║
║  │  │  โปรเจค X  │  │  Agile      │  │  นโยบายลาใหม่      │  │   ║
║  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │   ║
║  │         │                │                     │              │   ║
║  │         └───────────┬────┴─────────────────────┘              │   ║
║  │                     │                                         │   ║
║  │  ┌─────────────┐   │   ┌─────────────┐  ┌────────────────┐  │   ║
║  │  │Cross-Refs   │◄──┘   │Master Index │  │ Ingestion Log  │  │   ║
║  │  │             │       │             │  │                │  │   ║
║  │  │ A→B links   │       │ Categories  │  │ [2026-04-17]   │  │   ║
║  │  │ B→A links   │       │ Entities    │  │ ingested: 5    │  │   ║
║  │  │ See also    │       │ Concepts    │  │ pages: +12     │  │   ║
║  │  └─────────────┘       │ Summaries   │  │ refs: +8       │  │   ║
║  │                        └──────┬──────┘  └────────────────┘  │   ║
║  └───────────────────────────────┼───────────────────────────────┘   ║
║                                  │                                    ║
║                     ┌────────────┴────────────┐                      ║
║                     │      CHAT ENGINE        │                      ║
║                     │  1. Load index          │                      ║
║                     │  2. Find relevant pages │                      ║
║                     │  3. Load into context   │                      ║
║                     │  4. LLM synthesize      │                      ║
║                     │  5. Cite wiki pages     │                      ║
║                     │  6. Auto-file if useful │                      ║
║                     └────────────┬────────────┘                      ║
║                                  │                                    ║
║  LAYER 3: THE SCHEMA (Admin-configurable)                            ║
║  ┌───────────────────────────────┴───────────────────────────────┐   ║
║  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐ │   ║
║  │  │ Wiki Structure│  │  Conventions  │  │ Content Policies  │ │   ║
║  │  │               │  │               │  │                   │ │   ║
║  │  │ Page types    │  │ Naming rules  │  │ Include/Exclude   │ │   ║
║  │  │ Hierarchy     │  │ Thai style    │  │ CONFIDENTIAL skip │ │   ║
║  │  │ Templates     │  │ Citation fmt  │  │ Dept boundaries   │ │   ║
║  │  └───────────────┘  └───────────────┘  └───────────────────┘ │   ║
║  └───────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════╝

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

---

## 3. Complete Site Map

```
DriveWiki Site Map
═══════════════════════════════════════════════════════════════════

PUBLIC (ไม่ต้อง login)
│
├── /                              Landing Page / Login
│   ├── [Google Login Button]      → redirects to Google OAuth
│   └── [Footer: Terms, Privacy]
│
├── /auth/callback                 Google OAuth callback (system)
│
└── /consent                       PDPA Consent (first-time only)
    ├── [Consent form]
    ├── [ยินยอม] → /chat
    └── [ไม่ยินยอม] → logout + explanation

AUTHENTICATED — KNOWLEDGE WORKER (Member+)
│
├── /chat                          Chat Interface (default home)
│   ├── /chat/new                  New session (empty state)
│   │   ├── [Welcome message]
│   │   ├── [Suggested queries grid — 6 cards]
│   │   └── [Chat input bar]
│   │
│   └── /chat/:sessionId          Active chat session
│       ├── [Message list — virtual scroll]
│       │   ├── [User message bubble]
│       │   ├── [AI response bubble — streaming SSE]
│       │   ├── [Citation badges — clickable]
│       │   └── [Auto-filed notification toast]
│       ├── [Chat input bar + attachments]
│       ├── [Citation panel — slide-out right drawer]
│       │   ├── [Wiki page previews]
│       │   └── [Raw source links → Google Drive]
│       └── [Session history — left drawer]
│           ├── [Session list — grouped by date]
│           ├── [Search sessions]
│           └── [Delete session]
│
├── /wiki                          Wiki Module
│   ├── /wiki/browse               Browse by category
│   │   ├── [Category tabs: All | Entity | Concept | Summary | Filed]
│   │   ├── [Department filter dropdown]
│   │   ├── [Sort: Recent | A-Z | Most Referenced]
│   │   └── [Page card grid — virtual scroll]
│   │       ├── [PageCard: title, type badge, excerpt, refs count, date]
│   │       └── [Click → /wiki/page/:id]
│   │
│   ├── /wiki/page/:id            Wiki Page Detail
│   │   ├── [Breadcrumb: Wiki > Category > Page]
│   │   ├── [Page header: title, type, last updated, source count]
│   │   ├── [Markdown content — rendered with syntax highlight]
│   │   ├── [Cross-reference sidebar — right panel]
│   │   │   ├── [Related entities]
│   │   │   ├── [Related concepts]
│   │   │   ├── [See also links]
│   │   │   └── [Source documents → Drive links]
│   │   ├── [Version history tab]
│   │   │   ├── [Version list with timestamps]
│   │   │   └── [Diff viewer — side-by-side]
│   │   └── [Actions: Copy link, Print, Report issue]
│   │
│   ├── /wiki/search               Wiki Search
│   │   ├── [Search input — full-width, autofocus]
│   │   ├── [Filter chips: type, department, date range]
│   │   ├── [Results list with highlighted matches]
│   │   └── [Empty state: "ไม่พบผลลัพธ์ — ลองถามใน Chat แทน"]
│   │
│   └── /wiki/index                Master Index View
│       ├── [Alphabet/Category navigator]
│       ├── [Index entries — grouped by first letter or category]
│       └── [Stats: total pages, entities, concepts, last update]
│
├── /search                        Global Search (searches wiki + chat history)
│   ├── [Search bar with scope toggle: Wiki | Chat | All]
│   ├── [Autocomplete dropdown — top 5 suggestions]
│   └── [Results — tabbed: Wiki Pages | Chat Sessions | Raw Sources]
│
└── /profile                       User Profile & Settings
    ├── /profile/me                Profile view
    │   ├── [Avatar, name, email, department, role]
    │   └── [Last login, session count]
    ├── /profile/settings          Settings
    │   ├── [Theme: Light | Dark | System]
    │   ├── [Language: ไทย | English]
    │   ├── [Date format: พ.ศ. | ค.ศ.]
    │   ├── [Notification preferences]
    │   └── [Chat: auto-suggest on/off, streaming speed]
    └── /profile/sessions          Active sessions
        ├── [Session list with device, IP, last active]
        └── [Revoke session button]

AUTHENTICATED — DEPARTMENT HEAD (DeptHead+)
│
├── /department                    Department Dashboard
│   ├── /department/overview       Overview
│   │   ├── [Metric cards: pages, queries, users, cost]
│   │   ├── [Wiki health score — gauge chart]
│   │   ├── [Top queries this week — bar chart]
│   │   ├── [Recent ingestions — timeline]
│   │   └── [Lint findings — severity badges]
│   │
│   ├── /department/policies       Content Policies
│   │   ├── [Policy list — active/inactive toggle]
│   │   ├── [Add policy modal]
│   │   │   ├── [Type: Include | Exclude | Transform]
│   │   │   ├── [Pattern: filename, folder, content keyword]
│   │   │   └── [Action: skip | redact | flag for review]
│   │   └── [Test policy — dry run on sample docs]
│   │
│   └── /department/lint           Lint Reports
│       ├── [Latest report — date, status, findings count]
│       ├── [Findings table: severity, type, wiki page, action]
│       │   ├── [Contradiction — 2 pages disagree]
│       │   ├── [Stale — source modified after wiki page]
│       │   ├── [Orphan — no cross-references]
│       │   └── [Missing ref — expected link not found]
│       ├── [Trigger lint now — button (rate limited)]
│       └── [Lint history — past reports]

AUTHENTICATED — ADMIN (Admin+)
│
├── /admin                         Admin Module
│   ├── /admin/dashboard           Admin Dashboard
│   │   ├── [System metrics: workspaces, depts, users, pages, cost]
│   │   ├── [Ingestion pipeline status — live]
│   │   ├── [Error rate — last 24h chart]
│   │   ├── [Top departments by usage — horizontal bar]
│   │   └── [Alerts — active alerts list]
│   │
│   ├── /admin/users               User Management
│   │   ├── [User table: name, email, dept, role, last login, status]
│   │   ├── [Filters: department, role, status]
│   │   ├── [Bulk actions: activate, deactivate, change role]
│   │   ├── [User detail modal]
│   │   │   ├── [Profile info]
│   │   │   ├── [Activity: queries, wiki views, cost]
│   │   │   ├── [Change role dropdown]
│   │   │   ├── [Move department]
│   │   │   └── [Deactivate / GDPR delete]
│   │   └── [Invite user — email + department + role]
│   │
│   ├── /admin/departments         Department Management
│   │   ├── [Department cards: name, users, pages, folders, health]
│   │   ├── [Create department modal]
│   │   │   ├── [Name, description]
│   │   │   ├── [Assign head (user dropdown)]
│   │   │   └── [Initial Drive folders]
│   │   ├── [Department detail]
│   │   │   ├── [Overview stats]
│   │   │   ├── [Connected folders tab]
│   │   │   ├── [Members tab]
│   │   │   ├── [Policies tab]
│   │   │   └── [Cost tab]
│   │   └── [Archive department]
│   │
│   ├── /admin/drive               Drive Folder Manager
│   │   ├── [Connected folders — tree view per department]
│   │   ├── [Connect folder button → Google Drive picker]
│   │   ├── [Folder detail]
│   │   │   ├── [Sync status: active / paused / error]
│   │   │   ├── [Last sync: timestamp + docs count]
│   │   │   ├── [Webhook status: active / expired / pending]
│   │   │   └── [Actions: resync, pause, disconnect]
│   │   └── [Sync queue — pending items with progress]
│   │
│   ├── /admin/ingestion           Ingestion Monitor
│   │   ├── [Pipeline status — real-time]
│   │   │   ├── [Stage 1: Download ████░░ 67%]
│   │   │   ├── [Stage 2: Extract  ██░░░░ 33%]
│   │   │   ├── [Stage 3: Compile  ░░░░░░ 0%]
│   │   │   └── [Stage 4: Index    ░░░░░░ 0%]
│   │   ├── [Recent ingestions — table with status, duration, pages]
│   │   ├── [Failed items — retry button per item]
│   │   └── [Trigger full resync — confirmation dialog]
│   │
│   ├── /admin/cost                Cost Dashboard
│   │   ├── [Total cost this month — big number + trend]
│   │   ├── [Cost by department — stacked bar chart]
│   │   ├── [Cost by type: LLM inference, embedding, storage]
│   │   ├── [Cost per user — top 10 table]
│   │   ├── [Daily cost trend — line chart (30 days)]
│   │   ├── [Budget settings per department]
│   │   │   ├── [Monthly limit — input]
│   │   │   ├── [Alert threshold — % of limit]
│   │   │   └── [Hard cap — block queries when exceeded]
│   │   └── [Cost projection — next 30 days estimate]
│   │
│   ├── /admin/audit               Audit Log Viewer
│   │   ├── [Log table: timestamp, user, action, resource, IP, HMAC ✓/✗]
│   │   ├── [Filters: date range, user, action type, resource type]
│   │   ├── [HMAC chain integrity badge — overall ✓/✗]
│   │   ├── [Verify chain button → runs full verification]
│   │   ├── [Export button → CSV/JSON download]
│   │   └── [Key rotation panel]
│   │       ├── [Current key version]
│   │       ├── [Rotate key button → confirmation]
│   │       └── [Key history — version, created, entries count]
│   │
│   └── /admin/settings            Workspace Settings
│       ├── [Workspace name, domain]
│       ├── [Google service account config]
│       ├── [Wiki schema editor — JSON/YAML]
│       ├── [Default content policies]
│       ├── [Notification settings]
│       └── [GDPR tools — data export, deletion]

AUTHENTICATED — SUPERADMIN
│
└── /setup                         First-Time Setup Wizard
    ├── Step 1: Workspace          [Name, Google Workspace domain]
    ├── Step 2: Service Account    [Upload SA key or domain-wide delegation]
    ├── Step 3: Departments        [Create initial departments]
    ├── Step 4: Drive Folders      [Connect folders per department]
    └── Step 5: Review & Launch    [Summary → Start initial ingestion]

MODALS & DRAWERS (overlay, accessible from multiple pages)
│
├── [Confirm Dialog]               Generic yes/no confirmation
├── [User Detail Modal]            View/edit user from any user mention
├── [Wiki Page Preview Modal]      Quick preview from citation click
├── [Drive Folder Picker]          Google Drive folder browser
├── [Policy Editor Modal]          Add/edit content policy
├── [Feedback Modal]               Rate answer — thumbs + optional text
├── [Export Progress Modal]        Audit/cost export with progress
├── [Session Drawer — Left]        Chat session history
├── [Citation Drawer — Right]      Wiki page citations panel
└── [Notification Drawer — Right]  In-app notifications list
```

---

## 4. Feature Map — ALL Features by Module

```
╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Auth & Onboarding                                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-AUTH-01: Google Workspace OAuth 2.0 login                     ║
║  F-AUTH-02: JWT token issuance (8h access, 7d refresh)           ║
║  F-AUTH-03: Auto-refresh expired tokens                          ║
║  F-AUTH-04: PDPA consent collection & recording                  ║
║  F-AUTH-05: Domain restriction (only org emails allowed)         ║
║  F-AUTH-06: Session management (list, revoke)                    ║
║  F-AUTH-07: Role assignment (Worker, DeptHead, Admin, SuperAdmin)║
║  F-AUTH-08: First-time setup wizard (5 steps)                    ║
║  F-AUTH-09: Logout + token blacklist                             ║
║  F-AUTH-10: Login history tracking (IP, device, timestamp)       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Drive Integration                                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-DRIVE-01: Connect Google Drive folder to department           ║
║  F-DRIVE-02: Google Drive folder browser (tree picker)           ║
║  F-DRIVE-03: Webhook registration (files.watch)                  ║
║  F-DRIVE-04: Webhook listener — real-time change detection       ║
║  F-DRIVE-05: Scheduled sync fallback (every 6 hours)             ║
║  F-DRIVE-06: Channel renewal (auto-renew before expiry)          ║
║  F-DRIVE-07: Document download (Docs, Sheets, Slides export)     ║
║  F-DRIVE-08: Content hash change detection (SHA-256)             ║
║  F-DRIVE-09: File type filtering (by MIME type)                  ║
║  F-DRIVE-10: Disconnect folder (cleanup webhooks + pages)        ║
║  F-DRIVE-11: Pause/resume sync per folder                        ║
║  F-DRIVE-12: Sync status dashboard (per folder)                  ║
║  F-DRIVE-13: Error recovery — auto-retry failed downloads        ║
║  F-DRIVE-14: Domain-wide delegation for service account access   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Ingest Agent                                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-INGEST-01: Extract text from Google Docs (native API)         ║
║  F-INGEST-02: Extract text from Google Sheets (cell-by-cell)     ║
║  F-INGEST-03: Extract text from Google Slides (slide-by-slide)   ║
║  F-INGEST-04: Extract text from PDFs (OCR fallback)              ║
║  F-INGEST-05: Content hash comparison — skip unchanged docs      ║
║  F-INGEST-06: LLM entity extraction (people, teams, projects)    ║
║  F-INGEST-07: LLM concept extraction (policies, processes, terms)║
║  F-INGEST-08: Create/update entity wiki pages                    ║
║  F-INGEST-09: Create/update concept wiki pages                   ║
║  F-INGEST-10: Create summary pages for long documents            ║
║  F-INGEST-11: Generate cross-references between pages            ║
║  F-INGEST-12: Update master index after each ingestion           ║
║  F-INGEST-13: Append to ingestion log (timestamp, stats)         ║
║  F-INGEST-14: Content policy enforcement (skip CONFIDENTIAL)     ║
║  F-INGEST-15: Batch processing (process multiple docs in queue)  ║
║  F-INGEST-16: Progress reporting (SSE to ingestion monitor)      ║
║  F-INGEST-17: Error handling — partial failure (per-doc)         ║
║  F-INGEST-18: Bilingual extraction (Thai + English content)      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Wiki Store                                              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-WIKI-01: Create wiki page (entity/concept/summary/filed)      ║
║  F-WIKI-02: Update wiki page (append, replace, merge)            ║
║  F-WIKI-03: Version history — every edit creates a version       ║
║  F-WIKI-04: Diff viewer — compare any two versions              ║
║  F-WIKI-05: Rollback to previous version                         ║
║  F-WIKI-06: Cross-reference management (A↔B bidirectional)      ║
║  F-WIKI-07: Master index maintenance (auto-updated)              ║
║  F-WIKI-08: Department scoping — pages visible only within dept  ║
║  F-WIKI-09: Page type classification (entity/concept/summary)    ║
║  F-WIKI-10: Source attribution — link wiki page back to Drive doc║
║  F-WIKI-11: Page metadata (created, updated, source count, refs) ║
║  F-WIKI-12: Markdown rendering with syntax highlighting          ║
║  F-WIKI-13: Thai + English content support                       ║
║  F-WIKI-14: Page deletion (soft delete, recoverable 30 days)     ║
║  F-WIKI-15: Browse by category (entity/concept/summary/filed)    ║
║  F-WIKI-16: Sort pages (recent/alphabetical/most referenced)     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Chat Engine                                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-CHAT-01: Create new chat session                              ║
║  F-CHAT-02: Send text query                                      ║
║  F-CHAT-03: Streaming response via SSE (token-by-token)          ║
║  F-CHAT-04: Wiki context loading (index → pages → LLM)          ║
║  F-CHAT-05: Citation generation (link to wiki pages + raw source)║
║  F-CHAT-06: Auto-filing — save high-value answers as wiki pages  ║
║  F-CHAT-07: Suggested follow-up queries                          ║
║  F-CHAT-08: Feedback — thumbs up/down with optional text         ║
║  F-CHAT-09: Multi-turn conversation (context carries forward)    ║
║  F-CHAT-10: Session history (list, search, delete)               ║
║  F-CHAT-11: Department-scoped answers (user's dept context)      ║
║  F-CHAT-12: Fallback to raw source when wiki insufficient        ║
║  F-CHAT-13: Confidence indicator (high/medium/low)               ║
║  F-CHAT-14: Copy answer to clipboard (markdown or plain text)    ║
║  F-CHAT-15: Share answer via link                                ║
║  F-CHAT-16: Thai + English bilingual query understanding         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Lint Agent                                              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-LINT-01: Contradiction detection between wiki pages           ║
║  F-LINT-02: Stale page detection (source newer than wiki)        ║
║  F-LINT-03: Orphan page detection (no cross-references)          ║
║  F-LINT-04: Missing cross-reference suggestion                   ║
║  F-LINT-05: Duplicate content detection across pages             ║
║  F-LINT-06: Scheduled weekly lint (cron)                         ║
║  F-LINT-07: On-demand lint trigger (admin/dept head)             ║
║  F-LINT-08: Lint report generation with severity (high/med/low)  ║
║  F-LINT-09: Suggested fix actions per finding                    ║
║  F-LINT-10: Lint history — compare week-over-week health         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Search Service                                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-SEARCH-01: Full-text search on wiki pages (BM25)              ║
║  F-SEARCH-02: Thai word segmentation for search                  ║
║  F-SEARCH-03: Autocomplete suggestions (top 5)                   ║
║  F-SEARCH-04: Filter by: type, department, date range            ║
║  F-SEARCH-05: Highlight matching terms in results                ║
║  F-SEARCH-06: Global search (wiki + chat + raw sources)          ║
║  F-SEARCH-07: Search analytics (popular queries, zero-result)    ║
║  F-SEARCH-08: Recent searches per user                           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Admin Service                                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-ADMIN-01: System overview dashboard (metrics + charts)        ║
║  F-ADMIN-02: User CRUD (create, read, update, deactivate)        ║
║  F-ADMIN-03: Role assignment (Worker/DeptHead/Admin/SuperAdmin)  ║
║  F-ADMIN-04: Department CRUD (create, edit, archive)             ║
║  F-ADMIN-05: Assign department head                              ║
║  F-ADMIN-06: Move user between departments                       ║
║  F-ADMIN-07: Bulk user operations (activate, deactivate, role)   ║
║  F-ADMIN-08: Workspace settings (name, domain, SA config)        ║
║  F-ADMIN-09: Wiki schema editor (JSON/YAML)                      ║
║  F-ADMIN-10: Default content policies management                 ║
║  F-ADMIN-11: Notification settings (email, in-app)               ║
║  F-ADMIN-12: GDPR tools (data export, user deletion)             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Cost Tracker                                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-COST-01: Per-query token counting (input + output)            ║
║  F-COST-02: Per-user cost aggregation (daily/monthly)            ║
║  F-COST-03: Per-department cost aggregation                      ║
║  F-COST-04: Cost breakdown by type (inference/embedding/storage) ║
║  F-COST-05: Monthly budget setting per department                ║
║  F-COST-06: Budget alert notification (% threshold)              ║
║  F-COST-07: Hard cap — block queries when budget exceeded        ║
║  F-COST-08: Cost projection (next 30 days)                       ║
║  F-COST-09: Cost dashboard with charts (daily trend, by dept)    ║
║  F-COST-10: Cost export (CSV)                                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Audit Logger                                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-AUDIT-01: HMAC-SHA256 chained audit log entries               ║
║  F-AUDIT-02: Tamper detection (verify chain integrity)           ║
║  F-AUDIT-03: Key version tracking per entry                      ║
║  F-AUDIT-04: Key rotation endpoint                               ║
║  F-AUDIT-05: Audit log viewer with filters                       ║
║  F-AUDIT-06: Export audit log (CSV/JSON + signed)                ║
║  F-AUDIT-07: Chain verification UI (integrity badge)             ║
║  F-AUDIT-08: Actions logged: login, query, wiki edit, admin ops  ║
║  F-AUDIT-09: IP address + user agent recording                   ║
║  F-AUDIT-10: GDPR anonymization (nullify userId on deletion)     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Notification Service                                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-NOTIF-01: In-app notification bell with unread count          ║
║  F-NOTIF-02: Notification drawer (slide-out)                     ║
║  F-NOTIF-03: Email notification for lint report (weekly)         ║
║  F-NOTIF-04: Email notification for budget alert                 ║
║  F-NOTIF-05: Ingestion complete notification                     ║
║  F-NOTIF-06: Ingestion error alert                               ║
║  F-NOTIF-07: New user added to department notification           ║
║  F-NOTIF-08: Notification preferences (per-type on/off)          ║
║  F-NOTIF-09: Mark as read / mark all as read                     ║
║  F-NOTIF-10: Notification history (paginated)                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  MODULE: Schema Manager                                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  F-SCHEMA-01: Wiki structure config (page types, hierarchy)      ║
║  F-SCHEMA-02: Naming conventions (Thai style guide)              ║
║  F-SCHEMA-03: Citation format configuration                      ║
║  F-SCHEMA-04: Content policy templates                           ║
║  F-SCHEMA-05: Ingest workflow customization                      ║
║  F-SCHEMA-06: Query workflow customization                       ║
║  F-SCHEMA-07: Lint rules customization                           ║
║  F-SCHEMA-08: Import/export schema as JSON                       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

FEATURE TOTAL: 130 features across 12 modules
```

---

## 5. Business Flow Diagrams

### Flow 1: First-Time Setup (SuperAdmin)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───>│  PDPA    │───>│  Create  │───>│   Add    │───>│ Connect  │
│  Google  │    │ Consent  │    │Workspace │    │  Depts   │    │  Drive   │
│  OAuth   │    │  Form    │    │Name+Domain│    │ Name+Head│    │ Folders  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └─────┬────┘
                                                                      │
                     ┌──────────┐    ┌──────────┐    ┌──────────┐    │
                     │Dashboard │<───│ Initial  │<───│ Content  │<───┘
                     │  Ready!  │    │ Ingest   │    │ Policies │
                     │          │    │ (async)  │    │ Config   │
                     └──────────┘    └──────────┘    └──────────┘
```

### Flow 2: Document Ingestion (System — per document)

```
┌─────────────┐
│Drive Webhook│
│  fires OR   │
│Scheduled job│
└──────┬──────┘
       │
       v
┌──────────────┐     ┌─────────┐
│ Download doc │────>│ Extract │
│ from Drive   │     │  text   │
│ (API export) │     │         │
└──────────────┘     └────┬────┘
                          │
                          v
                   ┌──────────────┐    YES    ┌──────────┐
                   │ Hash changed │──────────>│   SKIP   │
                   │   from last  │ (NO)      │ (no-op)  │
                   │  ingestion?  │           └──────────┘
                   └──────┬───────┘
                     YES  │
                          v
              ┌───────────────────────┐
              │   LLM: Analyze doc    │
              │                       │
              │  ┌─────────────────┐  │
              │  │ Identify:       │  │
              │  │ - Entities      │  │
              │  │ - Concepts      │  │
              │  │ - Key facts     │  │
              │  │ - Relationships │  │
              │  └─────────────────┘  │
              └───────────┬───────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              v                       v
  ┌────────────────┐    ┌────────────────┐
  │ Create/Update  │    │ Create/Update  │
  │ Entity Pages   │    │ Concept Pages  │
  │ (people, teams,│    │ (policies,     │
  │  projects)     │    │  processes)    │
  └───────┬────────┘    └───────┬────────┘
          │                     │
          └──────────┬──────────┘
                     │
                     v
         ┌───────────────────┐
         │ Generate/Update   │
         │ Cross-References  │
         │ (A↔B bidirection) │
         └─────────┬─────────┘
                   │
                   v
         ┌───────────────────┐
         │ Update Master     │
         │ Index             │
         │ (categories,      │
         │  new entries)     │
         └─────────┬─────────┘
                   │
                   v
         ┌───────────────────┐
         │ Append Ingestion  │
         │ Log + Audit Entry │
         └───────────────────┘
```

### Flow 3: User Asks a Question (Chat)

```
┌──────────┐
│ User     │
│ types    │
│ question │
└────┬─────┘
     │ "นโยบายลาพักร้อนปี 2026 เปลี่ยนอะไรบ้าง?"
     v
┌─────────────────┐
│ Chat Engine     │
│ receives query  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Search Master   │
│ Index for       │
│ relevant pages  │
└────────┬────────┘
         │ Found: [นโยบายลา-2026, HR-policies, leave-policy]
         v
┌─────────────────┐
│ Load wiki pages │
│ into LLM        │
│ context window  │
│ (3-5 pages)     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ LLM synthesizes │
│ answer from     │──── SSE stream ────> ┌──────────────┐
│ wiki context    │     (token by token) │ User sees    │
│ + cites pages   │                      │ streaming    │
└────────┬────────┘                      │ response     │
         │                               └──────────────┘
         v
┌─────────────────┐
│ Evaluate:       │
│ Is answer       │
│ high-value?     │
└────────┬────────┘
    YES  │    NO
    ┌────┴────┐
    v         v
┌────────┐ ┌────────┐
│Auto-   │ │ Done   │
│file as │ │        │
│wiki    │ │        │
│page    │ │        │
└────────┘ └────────┘
```

### Flow 4: Wiki Browse & Discovery

```
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│ Open     │───>│ Browse by    │───>│ Click page     │───>│ Read content │
│ /wiki    │    │ category     │    │ card           │    │ + cross-refs │
│          │    │ (tabs/filter)│    │                │    │              │
└──────────┘    └──────────────┘    └────────────────┘    └──────┬───────┘
                                                                  │
                     ┌──────────┐    ┌──────────────┐            │
                     │ Navigate │<───│ Click cross- │<───────────┘
                     │ to       │    │ reference    │
                     │ related  │    │ link         │
                     │ page     │    │              │
                     └──────────┘    └──────────────┘
```

### Flow 5: Wiki Lint Process

```
┌──────────────┐
│ Cron trigger │
│ (weekly) OR  │
│ Admin click  │
└──────┬───────┘
       │
       v
┌──────────────────┐
│ Load all wiki    │
│ pages for dept   │
└────────┬─────────┘
         │
    ┌────┴────┬────────────┬───────────────┐
    v         v            v               v
┌────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐
│Check   │ │Check   │ │Check     │ │Check       │
│contra- │ │stale   │ │orphan    │ │missing     │
│dictions│ │pages   │ │pages     │ │cross-refs  │
│(LLM    │ │(source │ │(0 refs)  │ │(expected   │
│compare)│ │> wiki) │ │          │ │but absent) │
└───┬────┘ └───┬────┘ └────┬─────┘ └─────┬──────┘
    │          │           │              │
    └──────────┴─────┬─────┴──────────────┘
                     │
                     v
           ┌──────────────────┐
           │ Generate lint    │
           │ report           │
           │ (severity,       │
           │  finding, page,  │
           │  suggested fix)  │
           └────────┬─────────┘
                    │
              ┌─────┴─────┐
              v           v
      ┌────────────┐ ┌────────────┐
      │ Notify     │ │ Dashboard  │
      │ dept head  │ │ update     │
      │ (email)    │ │            │
      └────────────┘ └────────────┘
```

### Flow 6: Department Head Reviews Knowledge

```
┌────────────┐    ┌──────────────┐    ┌──────────────┐
│ Open dept  │───>│ View metrics │───>│ Check lint   │
│ dashboard  │    │ (pages,      │    │ findings     │
│            │    │  queries,    │    │ (fix/dismiss)│
│            │    │  cost, health│    │              │
└────────────┘    └──────────────┘    └──────────────┘
                                             │
┌────────────┐    ┌──────────────┐           │
│ Adjust     │<───│ Review       │<──────────┘
│ content    │    │ top queries  │
│ policies   │    │ (what users  │
│            │    │  ask most)   │
└────────────┘    └──────────────┘
```

### Flow 7: Admin Manages Users

```
┌────────────┐    ┌──────────────┐    ┌────────────────────┐
│ Open       │───>│ Search/filter│───>│ Select user        │
│ /admin/    │    │ users        │    │                    │
│ users      │    │              │    │ ┌────────────────┐ │
└────────────┘    └──────────────┘    │ │ View profile   │ │
                                      │ │ Change role    │ │
                                      │ │ Move dept      │ │
                                      │ │ Deactivate     │ │
                                      │ │ GDPR delete    │ │
                                      │ └────────────────┘ │
                                      └────────────────────┘
```

### Flow 8: Compliance Audit Review

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│ Open     │───>│ Filter logs  │───>│ Verify HMAC  │───>│ Export     │
│ /admin/  │    │ (date, user, │    │ chain        │    │ report     │
│ audit    │    │  action)     │    │ integrity    │    │ (CSV/JSON) │
└──────────┘    └──────────────┘    └──────────────┘    └────────────┘
                                    │ ✓ = chain intact │
                                    │ ✗ = tamper found │
```

### Flow 9: Cost Budget Alert

```
┌───────────────┐    ┌──────────────┐    ┌──────────────┐
│ User sends    │───>│ Cost Tracker │───>│ Budget check │
│ chat query    │    │ records      │    │              │
│               │    │ token usage  │    │ Usage < 80%  │──> OK
└───────────────┘    └──────────────┘    │ Usage > 80%  │──> ┌──────────┐
                                         │ Usage > 100% │    │ Alert    │
                                         └──────────────┘    │ email +  │
                                              │              │ in-app   │
                                              │ (>100%)      └──────────┘
                                              v
                                         ┌──────────┐
                                         │ BLOCK    │
                                         │ query    │
                                         │ return   │
                                         │ 429 +    │
                                         │ message  │
                                         └──────────┘
```

### Flow 10: Drive Folder Disconnect

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Admin    │───>│ Confirm      │───>│ Delete       │───>│ Soft-delete  │
│ clicks   │    │ dialog:      │    │ webhooks     │    │ wiki pages   │
│"Disconnect│   │ "ลบ wiki pages│   │ for folder   │    │ sourced from │
│ folder"  │    │  ด้วยหรือไม่?"│   │              │    │ this folder  │
└──────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘
                                                               │
                                                               v
                                                        ┌──────────────┐
                                                        │ Update index │
                                                        │ + audit log  │
                                                        └──────────────┘
```

### Flow 11: Content Policy Enforcement

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│ Doc arrives  │───>│ Check against│───>│ Policy match?    │
│ for ingestion│    │ dept policies│    │                  │
└──────────────┘    └──────────────┘    │ INCLUDE → ingest │
                                        │ EXCLUDE → skip   │
                                        │ REDACT → strip   │
                                        │ FLAG → queue for │
                                        │   human review   │
                                        └──────────────────┘
```

### Flow 12: Wiki Page Versioning & Rollback

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│ Agent updates│───>│ New version  │───>│ Admin views  │───>│ Rollback │
│ wiki page   │    │ created      │    │ version      │    │ to v3    │
│ (v4)        │    │ (v1→v2→v3→v4)│    │ history      │    │ (v5=v3)  │
└──────────────┘    └──────────────┘    │ diff viewer  │    └──────────┘
                                        └──────────────┘
```

### Flow 13: Knowledge Graph Navigation

```
                    ┌───────────┐
                    │ Entity:   │
              ┌────>│ คุณสมชาย  │<────┐
              │     └─────┬─────┘     │
              │           │           │
         ┌────┴────┐     │     ┌─────┴─────┐
         │ Concept:│     │     │ Entity:   │
         │ OKR     │     │     │ แผนก HR   │
         └────┬────┘     │     └─────┬─────┘
              │           │           │
              │     ┌─────┴─────┐     │
              └────>│ Summary:  │<────┘
                    │ รายงาน Q1 │
                    └───────────┘

User clicks any node → navigates to wiki page → sidebar shows related nodes
```

### Flow 14: Auto-filing Chat Answers to Wiki

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ LLM generates│───>│ Evaluate:    │───>│ High-value?  │
│ answer       │    │ - Novel info │    │              │
└──────────────┘    │ - Cited 3+   │    │ YES: auto-   │──> ┌────────────┐
                    │   sources    │    │ file as wiki │    │ Create     │
                    │ - User rated │    │ page (Filed  │    │ wiki page  │
                    │   thumbs up  │    │ type)        │    │ Update idx │
                    └──────────────┘    │              │    │ Notify user│
                                        │ NO: discard  │    └────────────┘
                                        └──────────────┘
```

### Flow 15: GDPR/PDPA Data Deletion

```
┌──────────────┐    ┌──────────────┐    ┌────────────────────────────┐
│ Admin clicks │───>│ Confirm:     │───>│ Transactional delete:      │
│ "GDPR Delete"│    │ "ลบข้อมูล    │    │ ├── Chat sessions+messages │
│ for user     │    │  ทั้งหมดของ   │    │ ├── Wiki page attributions │
└──────────────┘    │  ผู้ใช้นี้?"  │    │ ├── Cost events            │
                    └──────────────┘    │ ├── Login history           │
                                        │ ├── Sessions               │
                                        │ ├── Audit log (anonymize)  │
                                        │ └── User record            │
                                        └─────────────┬──────────────┘
                                                      │
                                                      v
                                               ┌──────────────┐
                                               │ Return       │
                                               │ deletion     │
                                               │ manifest     │
                                               └──────────────┘
```

---

## 6. Screen Layouts — ALL Pages

### Page 1: Login

```
Desktop (1280+)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│                    │    [DriveWiki Logo]  │                      │
│                    │                     │                      │
│                    │  Enterprise Knowledge│                      │
│                    │  Management          │                      │
│                    │                     │                      │
│                    │ ┌─────────────────┐ │                      │
│                    │ │ ▶ Login with    │ │                      │
│                    │ │   Google        │ │                      │
│                    │ └─────────────────┘ │                      │
│                    │                     │                      │
│                    │  Powered by         │                      │
│                    │  Karpathy's LLM Wiki│                      │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│  ──────────────────────────────────────────────────────────     │
│  Terms of Service  |  Privacy Policy  |  © Aeternix 2026       │
└─────────────────────────────────────────────────────────────────┘
```

### Page 4: Chat (Main — Active Session)

```
Desktop (1280+)
┌─────────────────────────────────────────────────────────────────┐
│  [≡] DriveWiki         [🔍 Search...]         [TH|EN] [Avatar▼]│
├────────┬───────────────────────────────────────────┬────────────┤
│        │                                           │            │
│ Chat   │  Chat: นโยบายบริษัท                        │ Citations  │
│ ─────  │  ─────────────────                        │ ─────────  │
│        │                                           │            │
│ Recent │  ┌─────────────────────────────────────┐  │ Wiki Pages │
│Sessions│  │👤 นโยบายลาพักร้อนปี 2026 เปลี่ยน     │  │            │
│        │  │   อะไรบ้าง?                          │  │ ┌────────┐ │
│ Today  │  └─────────────────────────────────────┘  │ │นโยบาย  │ │
│ ├ นโยบาย│                                           │ │ลา-2026│ │
│ ├ OKR   │  ┌─────────────────────────────────────┐  │ │[Entity]│ │
│ └ IT    │  │🤖 จากนโยบายลาพักร้อน 2026 ที่ปรับปรุง│  │ └────────┘ │
│        │  │   ใหม่ มีการเปลี่ยนแปลง 3 ประเด็นหลัก│  │            │
│ Yester.│  │                                      │  │ ┌────────┐ │
│ ├ งบปี │  │   1. เพิ่มวันลาจาก 10 → 15 วัน [1]  │  │ │HR-     │ │
│ └ แผนก │  │   2. อนุมัติออนไลน์ผ่านระบบ [2]     │  │ │policies│ │
│        │  │   3. สะสมข้ามปีได้ไม่เกิน 5 วัน [1] │  │ │[Concept│ │
│ ─────  │  │                                      │  │ └────────┘ │
│ [+New] │  │   📎 [1] นโยบายลา-2026               │  │            │
│        │  │   📎 [2] HR-policies                  │  │ Raw Source │
│        │  │                                      │  │ ┌────────┐ │
│        │  │   [👍] [👎]     Confidence: ██████ High│  │ │📄 ประกาศ│ │
│        │  └─────────────────────────────────────┘  │ │  HR-026 │ │
│        │                                           │ │ [Drive] │ │
│        │                                           │ └────────┘ │
│        │  ┌─────────────────────────────────────┐  │            │
│        │  │ 💬 พิมพ์คำถาม...        [📎] [Send▶]│  │            │
│        │  └─────────────────────────────────────┘  │            │
├────────┴───────────────────────────────────────────┴────────────┤
│  DriveWiki v1.0 | HR Department | Cost: ฿12.50 this session    │
└─────────────────────────────────────────────────────────────────┘

Mobile (< 768)
┌───────────────────────────┐
│ [≡] DriveWiki    [🔍][👤] │
├───────────────────────────┤
│                           │
│ ┌───────────────────────┐ │
│ │👤 นโยบายลาพักร้อน 2026│ │
│ │   เปลี่ยนอะไรบ้าง?    │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │🤖 จากนโยบายลาพักร้อน │ │
│ │   2026 มีการเปลี่ยน   │ │
│ │   3 ประเด็นหลัก:      │ │
│ │                       │ │
│ │  1. เพิ่ม 10→15 วัน  │ │
│ │  2. อนุมัติออนไลน์    │ │
│ │  3. สะสมข้ามปี 5 วัน  │ │
│ │                       │ │
│ │  📎 Citations (2) ▶   │ │
│ │  [👍] [👎]  ██ High   │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ 💬 พิมพ์...    [Send▶]│ │
│ └───────────────────────┘ │
├───────────────────────────┤
│ [Chat] [Wiki] [🔍] [👤]  │
└───────────────────────────┘
```

### Page 6: Wiki Browse

```
Desktop (1280+)
┌─────────────────────────────────────────────────────────────────┐
│  [≡] DriveWiki         [🔍 Search...]         [TH|EN] [Avatar▼]│
├────────┬────────────────────────────────────────────────────────┤
│        │                                                        │
│  Nav   │  Wiki Browse                     [Department: HR ▼]   │
│        │  ──────────                                            │
│ [Chat] │                                                        │
│ [Wiki] │  [All] [Entity] [Concept] [Summary] [Filed]           │
│ [Srch] │                                                        │
│        │  Sort: [Recent ▼]                  248 pages           │
│ ─────  │                                                        │
│ Admin  │  ┌──────────────────┐  ┌──────────────────┐           │
│        │  │ 📌 Entity        │  │ 📘 Concept        │           │
│        │  │ คุณสมชาย วงศ์ไทย │  │ OKR Framework    │           │
│        │  │                  │  │                  │           │
│        │  │ HR Director      │  │ วิธีการตั้งเป้า    │           │
│        │  │ refs: 12 | 2d ago│  │ refs: 8 | 1w ago │           │
│        │  └──────────────────┘  └──────────────────┘           │
│        │                                                        │
│        │  ┌──────────────────┐  ┌──────────────────┐           │
│        │  │ 📄 Summary       │  │ 📌 Entity        │           │
│        │  │ รายงาน Q1/2026   │  │ Project Phoenix  │           │
│        │  │                  │  │                  │           │
│        │  │ ผลประกอบการไตรมาส │  │ Digital transform│           │
│        │  │ refs: 5 | 3d ago │  │ refs: 15 | 1d ago│           │
│        │  └──────────────────┘  └──────────────────┘           │
│        │                                                        │
│        │  [Load more...]                                        │
├────────┴────────────────────────────────────────────────────────┤
│  DriveWiki v1.0                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Page 7: Wiki Page Detail

```
Desktop (1280+)
┌─────────────────────────────────────────────────────────────────┐
│  [≡] DriveWiki         [🔍 Search...]         [TH|EN] [Avatar▼]│
├────────┬──────────────────────────────────────┬─────────────────┤
│        │                                      │                 │
│  Nav   │  Wiki > Entity > คุณสมชาย วงศ์ไทย     │ Cross-Refs     │
│        │  ─────────────────────────────        │ ──────────      │
│        │                                      │                 │
│        │  📌 Entity | Updated 2d ago          │ Related Entity  │
│        │  Sources: 3 Drive docs               │ ├ แผนก HR       │
│        │                                      │ ├ คุณวิภา ลี    │
│        │  # คุณสมชาย วงศ์ไทย                    │ └ Project X     │
│        │                                      │                 │
│        │  ## ตำแหน่งและหน้าที่                    │ Related Concept │
│        │  - HR Director ตั้งแต่ 2023            │ ├ OKR           │
│        │  - รับผิดชอบนโยบาย HR ทั้งหมด          │ ├ PDPA          │
│        │  - หัวหน้าทีม 15 คน                    │ └ สวัสดิการ      │
│        │                                      │                 │
│        │  ## ผลงานสำคัญ                         │ Source Docs     │
│        │  - ปรับปรุงนโยบายลาพักร้อน 2026        │ ├ 📄 ประกาศ HR  │
│        │  - นำ OKR มาใช้ในแผนก                  │ ├ 📊 รายงาน Q1  │
│        │  - ลดอัตราลาออก 15%                    │ └ 📑 แผนงาน     │
│        │                                      │                 │
│        │  ## อ้างอิง                             │ [Versions ▼]   │
│        │  - ดู: [[แผนก HR]]                     │ v4 (current)   │
│        │  - ดู: [[OKR Framework]]               │ v3 (3d ago)    │
│        │  - ดู: [[นโยบายลา-2026]]               │ v2 (1w ago)    │
│        │                                      │ v1 (2w ago)    │
│        │  [Copy link] [Print] [Report issue]  │                 │
├────────┴──────────────────────────────────────┴─────────────────┤
│  DriveWiki v1.0                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Page 11: Admin Dashboard

```
Desktop (1280+)
┌─────────────────────────────────────────────────────────────────┐
│  [≡] DriveWiki         [🔍 Search...]         [TH|EN] [Avatar▼]│
├────────┬────────────────────────────────────────────────────────┤
│        │                                                        │
│  Nav   │  Admin Dashboard                                       │
│        │  ───────────────                                       │
│ [Chat] │                                                        │
│ [Wiki] │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│ [Srch] │  │Users   │ │Depts   │ │Wiki    │ │Cost    │         │
│        │  │  127   │ │   8    │ │Pages   │ │ ฿45.2K │         │
│ ─────  │  │ +5 ▲   │ │        │ │ 1,248  │ │ /month │         │
│ Admin  │  └────────┘ └────────┘ └────────┘ └────────┘         │
│ [Dash] │                                                        │
│ [User] │  Pipeline Status                                       │
│ [Dept] │  ┌────────────────────────────────────────────┐       │
│ [Drive]│  │ Download  ████████████████████░░░  85%     │       │
│ [Ingest│  │ Extract   ██████████████░░░░░░░░  60%     │       │
│ [Cost] │  │ Compile   ████████░░░░░░░░░░░░░  35%     │       │
│ [Audit]│  │ Index     ████░░░░░░░░░░░░░░░░░  18%     │       │
│ [Sett] │  └────────────────────────────────────────────┘       │
│        │                                                        │
│        │  Top Departments          Error Rate (24h)             │
│        │  ┌────────────────┐       ┌────────────────┐          │
│        │  │ HR      ████ 45│       │     __         │          │
│        │  │ IT      ███  32│       │   _/  \        │          │
│        │  │ Finance ██   28│       │  /    \_/\_    │          │
│        │  │ Legal   █    12│       │ /          \__ │          │
│        │  └────────────────┘       └────────────────┘          │
│        │                                                        │
│        │  Active Alerts                                         │
│        │  ┌────────────────────────────────────────────┐       │
│        │  │ ⚠ HR dept cost 82% of budget               │       │
│        │  │ ⚠ 3 stale wiki pages in Finance dept       │       │
│        │  │ ✓ All webhooks active                       │       │
│        │  └────────────────────────────────────────────┘       │
├────────┴────────────────────────────────────────────────────────┤
│  DriveWiki v1.0 | Admin                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Page 15: Cost Dashboard

```
Desktop (1280+)
┌─────────────────────────────────────────────────────────────────┐
│  [≡] DriveWiki         [🔍 Search...]         [TH|EN] [Avatar▼]│
├────────┬────────────────────────────────────────────────────────┤
│        │                                                        │
│  Nav   │  Cost Dashboard                   [This Month ▼]      │
│        │  ──────────────                                        │
│ Admin  │                                                        │
│        │  Total: ฿45,200                   Budget: ฿60,000     │
│        │  ████████████████████████░░░░░░  75%                  │
│        │                                                        │
│        │  Cost by Department                                    │
│        │  ┌──────────────────────────────────────────┐         │
│        │  │  HR       ████████████████  ฿18,500      │         │
│        │  │  IT       ██████████████    ฿15,200      │         │
│        │  │  Finance  ████████          ฿ 8,100      │         │
│        │  │  Legal    ███               ฿ 3,400      │         │
│        │  └──────────────────────────────────────────┘         │
│        │                                                        │
│        │  Daily Trend (30 days)                                 │
│        │  ┌──────────────────────────────────────────┐         │
│        │  │ ฿2K │            __                       │         │
│        │  │     │      _   _/  \   _                  │         │
│        │  │ ฿1K │   __/ \_/    \_/ \__    __         │         │
│        │  │     │ _/                  \__/  \_       │         │
│        │  │  ฿0 │/                           \___   │         │
│        │  │     └──────────────────────────────────  │         │
│        │  │      Apr 1                    Apr 17     │         │
│        │  └──────────────────────────────────────────┘         │
│        │                                                        │
│        │  Cost by Type          Top Users                       │
│        │  ┌──────────┐         ┌──────────────────────┐        │
│        │  │ LLM  72% │         │ 1. สมชาย    ฿3,200   │        │
│        │  │ Embed 18% │         │ 2. วิภา     ฿2,800   │        │
│        │  │ Store 10% │         │ 3. ธนา      ฿2,100   │        │
│        │  └──────────┘         └──────────────────────┘        │
│        │                                                        │
│        │  Budget Settings per Department                        │
│        │  ┌──────────────────────────────────────────┐         │
│        │  │ Dept     │ Limit    │ Alert  │ Hard Cap  │         │
│        │  │──────────┼──────────┼────────┼───────────│         │
│        │  │ HR       │ ฿20,000  │ 80%    │ ✓ Enabled │         │
│        │  │ IT       │ ฿20,000  │ 80%    │ ✗ Off     │         │
│        │  │ Finance  │ ฿10,000  │ 90%    │ ✓ Enabled │         │
│        │  │ Legal    │ ฿10,000  │ 80%    │ ✗ Off     │         │
│        │  └──────────────────────────────────────────┘         │
│        │  [Export CSV]              [Projection →]              │
├────────┴────────────────────────────────────────────────────────┤
│  DriveWiki v1.0 | Admin                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Role-Permission Matrix

```
╔══════════════════════════╤════════╤══════════╤═══════╤════════════╤════════════╗
║ Feature                  │Worker  │ DeptHead │ Admin │ SuperAdmin │ Compliance ║
╠══════════════════════════╪════════╪══════════╪═══════╪════════════╪════════════╣
║ Chat — send queries      │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
║ Chat — view own sessions │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
║ Chat — rate answers      │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
╠══════════════════════════╪════════╪══════════╪═══════╪════════════╪════════════╣
║ Wiki — browse pages      │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
║ Wiki — view page detail  │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
║ Wiki — view cross-refs   │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
║ Wiki — search            │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
║ Wiki — view versions     │  ✗     │    ✓     │   ✓   │     ✓      │     ✗      ║
║ Wiki — rollback version  │  ✗     │    ✗     │   ✓   │     ✓      │     ✗      ║
╠══════════════════════════╪════════╪══════════╪═══════╪════════════╪════════════╣
║ Department — view own    │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
║ Department — dashboard   │  ✗     │    ✓     │   ✓   │     ✓      │     ✗      ║
║ Department — edit policy │  ✗     │    ✓     │   ✓   │     ✓      │     ✗      ║
║ Department — view lint   │  ✗     │    ✓     │   ✓   │     ✓      │     ✗      ║
║ Department — trigger lint│  ✗     │    ✓     │   ✓   │     ✓      │     ✗      ║
╠══════════════════════════╪════════╪══════════╪═══════╪════════════╪════════════╣
║ Admin — dashboard        │  ✗     │    ✗     │   ✓   │     ✓      │     ✗      ║
║ Admin — manage users     │  ✗     │    ✗     │   ✓   │     ✓      │     ✗      ║
║ Admin — manage depts     │  ✗     │    ✗     │   ✓   │     ✓      │     ✗      ║
║ Admin — manage Drive     │  ✗     │    ✗     │   ✓   │     ✓      │     ✗      ║
║ Admin — ingestion monitor│  ✗     │    ✗     │   ✓   │     ✓      │     ✗      ║
║ Admin — cost dashboard   │  ✗     │    ✗     │   ✓   │     ✓      │     ✗      ║
║ Admin — workspace config │  ✗     │    ✗     │   ✗   │     ✓      │     ✗      ║
║ Admin — GDPR tools       │  ✗     │    ✗     │   ✗   │     ✓      │     ✗      ║
╠══════════════════════════╪════════╪══════════╪═══════╪════════════╪════════════╣
║ Audit — view logs        │  ✗     │    ✗     │   ✓   │     ✓      │     ✓      ║
║ Audit — verify chain     │  ✗     │    ✗     │   ✗   │     ✓      │     ✓      ║
║ Audit — export           │  ✗     │    ✗     │   ✗   │     ✓      │     ✓      ║
║ Audit — rotate key       │  ✗     │    ✗     │   ✗   │     ✓      │     ✗      ║
╠══════════════════════════╪════════╪══════════╪═══════╪════════════╪════════════╣
║ Setup wizard             │  ✗     │    ✗     │   ✗   │     ✓      │     ✗      ║
║ Profile / Settings       │  ✓     │    ✓     │   ✓   │     ✓      │     ✓      ║
╚══════════════════════════╧════════╧══════════╧═══════╧════════════╧════════════╝
```

---

## 8. Data Flow Diagram

```
╔══════════════════════════════════════════════════════════════════════════╗
║                     DriveWiki — Data Flow                               ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  INGESTION FLOW (System — async)                                        ║
║  ─────────────────────────────────                                      ║
║                                                                          ║
║  Google Drive ──webhook──> Sync Engine ──download──> GCS (raw cache)    ║
║       │                       │                          │               ║
║       │               scheduled scan                     │               ║
║       │               (every 6h)                         │               ║
║       │                                                  v               ║
║       │                                          Ingest Agent            ║
║       │                                          (Vertex AI)             ║
║       │                                              │                   ║
║       │                              ┌───────────────┼───────────────┐  ║
║       │                              v               v               v  ║
║       │                        Entity Pages    Concept Pages   Summary  ║
║       │                              │               │               │  ║
║       │                              └───────┬───────┘               │  ║
║       │                                      v                       │  ║
║       │                              Cross-References                │  ║
║       │                                      │                       │  ║
║       │                                      v                       │  ║
║       │                              Master Index  <─────────────────┘  ║
║       │                                      │                          ║
║       │                                      v                          ║
║       │                              Cloud SQL (PostgreSQL)             ║
║       │                                                                  ║
║  QUERY FLOW (User — real-time)                                          ║
║  ─────────────────────────────                                          ║
║                                                                          ║
║  User ──query──> Chat Engine ──search──> Master Index                   ║
║                      │                       │                           ║
║                      │              ranked page IDs                      ║
║                      │                       │                           ║
║                      │<──wiki pages──── Wiki Store (Cloud SQL)          ║
║                      │                                                   ║
║                      │──context──> Vertex AI (Gemini)                   ║
║                      │                   │                               ║
║                      │<──response────────┘                              ║
║                      │                                                   ║
║                      │──SSE stream──> Frontend                          ║
║                      │                                                   ║
║                      │──(if high-value)──> Wiki Store (auto-file)       ║
║                      │──cost event──> Cost Tracker                      ║
║                      │──audit entry──> Audit Logger (HMAC)              ║
║                                                                          ║
║  ADMIN FLOW (Admin — on demand)                                         ║
║  ──────────────────────────────                                         ║
║                                                                          ║
║  Admin ──action──> Admin Service ──write──> Cloud SQL                   ║
║                        │                                                 ║
║                        │──audit──> Audit Logger                         ║
║                        │              │                                  ║
║                        │         HMAC chain                              ║
║                        │              │                                  ║
║                        │              v                                  ║
║                        │         Cloud SQL (audit_log table)            ║
║                        │                                                 ║
║                        │──notify──> Notification Service                ║
║                                        │                                 ║
║                                   email + in-app                         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 9. API Endpoint Map

```
╔══════════════════════════════════════════════════════════════════════════╗
║                     DriveWiki — API Endpoints (51)                      ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  AUTH MODULE (6 endpoints)                                               ║
║  ├── GET    /api/auth/google             [public]   Google OAuth start   ║
║  ├── GET    /api/auth/google/callback    [public]   OAuth callback       ║
║  ├── POST   /api/auth/refresh            [auth]     Refresh JWT token    ║
║  ├── POST   /api/auth/logout             [auth]     Logout + blacklist   ║
║  ├── GET    /api/auth/me                 [auth]     Current user profile ║
║  └── POST   /api/auth/consent            [auth]     Record PDPA consent  ║
║                                                                          ║
║  CHAT MODULE (8 endpoints)                                               ║
║  ├── POST   /api/chat/sessions           [member]   Create new session   ║
║  ├── GET    /api/chat/sessions           [member]   List user sessions   ║
║  ├── GET    /api/chat/sessions/:id       [member]   Get session + msgs   ║
║  ├── DELETE /api/chat/sessions/:id       [member]   Delete session       ║
║  ├── POST   /api/chat/sessions/:id/query [member]   Send query (SSE)     ║
║  ├── POST   /api/chat/sessions/:id/rate  [member]   Rate answer          ║
║  ├── GET    /api/chat/suggestions        [member]   Suggested queries    ║
║  └── POST   /api/chat/sessions/:id/share [member]   Share answer link    ║
║                                                                          ║
║  WIKI MODULE (10 endpoints)                                              ║
║  ├── GET    /api/wiki/index              [member]   Master index         ║
║  ├── GET    /api/wiki/pages              [member]   List pages (filter)  ║
║  ├── GET    /api/wiki/pages/:id          [member]   Page detail + refs   ║
║  ├── GET    /api/wiki/pages/:id/versions [depthead] Version history      ║
║  ├── GET    /api/wiki/pages/:id/diff     [depthead] Compare versions     ║
║  ├── POST   /api/wiki/pages/:id/rollback [admin]    Rollback to version  ║
║  ├── GET    /api/wiki/pages/:id/refs     [member]   Cross-references     ║
║  ├── GET    /api/wiki/search             [member]   Search wiki pages    ║
║  ├── GET    /api/wiki/autocomplete       [member]   Search suggestions   ║
║  └── GET    /api/wiki/stats              [member]   Wiki statistics      ║
║                                                                          ║
║  DRIVE MODULE (7 endpoints)                                              ║
║  ├── GET    /api/drive/folders           [admin]    List connected       ║
║  ├── POST   /api/drive/folders           [admin]    Connect folder       ║
║  ├── DELETE /api/drive/folders/:id       [admin]    Disconnect folder    ║
║  ├── POST   /api/drive/folders/:id/sync  [admin]    Trigger resync       ║
║  ├── PATCH  /api/drive/folders/:id       [admin]    Pause/resume sync    ║
║  ├── GET    /api/drive/folders/:id/status[admin]    Sync status          ║
║  └── POST   /api/drive/webhook           [system]   Webhook listener     ║
║                                                                          ║
║  DEPARTMENT MODULE (6 endpoints)                                         ║
║  ├── GET    /api/departments/:id/overview[depthead] Dept dashboard data  ║
║  ├── GET    /api/departments/:id/policies[depthead] Content policies     ║
║  ├── PUT    /api/departments/:id/policies[depthead] Update policies      ║
║  ├── GET    /api/departments/:id/lint    [depthead] Latest lint report   ║
║  ├── POST   /api/departments/:id/lint    [depthead] Trigger lint         ║
║  └── GET    /api/departments/:id/lint/h  [depthead] Lint history         ║
║                                                                          ║
║  ADMIN MODULE (8 endpoints)                                              ║
║  ├── GET    /api/admin/overview          [admin]    System dashboard     ║
║  ├── GET    /api/admin/users             [admin]    User list            ║
║  ├── PATCH  /api/admin/users/:id         [admin]    Update user role/dept║
║  ├── DELETE /api/admin/users/:id         [sadmin]   GDPR delete user     ║
║  ├── GET    /api/admin/departments       [admin]    Department list      ║
║  ├── POST   /api/admin/departments       [admin]    Create department    ║
║  ├── PATCH  /api/admin/departments/:id   [admin]    Update department    ║
║  └── DELETE /api/admin/departments/:id   [admin]    Archive department   ║
║                                                                          ║
║  AUDIT MODULE (4 endpoints)                                              ║
║  ├── GET    /api/audit/logs              [admin+co] Query audit logs     ║
║  ├── GET    /api/audit/verify/:id        [sadmin+co]Verify HMAC chain    ║
║  ├── POST   /api/audit/rotate-key        [sadmin]   Rotate HMAC key     ║
║  └── POST   /api/audit/export            [sadmin+co]Export audit log     ║
║                                                                          ║
║  COST MODULE (2 endpoints)                                               ║
║  ├── GET    /api/cost/dashboard          [admin]    Cost analytics       ║
║  └── GET    /api/cost/export             [admin]    Export CSV           ║
║                                                                          ║
║  SYSTEM (3 endpoints)                                                    ║
║  ├── GET    /api/health                  [public]   Health check         ║
║  ├── GET    /_warmup                     [public]   Cloud Run warmup     ║
║  └── GET    /api/openapi.json            [public]   OpenAPI spec         ║
║                                                                          ║
║  LEGEND:  [public] = no auth | [auth] = any logged in                   ║
║           [member] = Worker+ | [depthead] = DeptHead+                   ║
║           [admin] = Admin+ | [sadmin] = SuperAdmin only                 ║
║           [co] = Compliance Officer | [system] = service-to-service     ║
╚══════════════════════════════════════════════════════════════════════════╝

Total: 54 endpoints across 8 modules
```

---

*Document version: 1.0 | Generated: 2026-04-17 | Project: DriveWiki*
*130 features | 15 business flows | 20 page layouts | 54 API endpoints*
