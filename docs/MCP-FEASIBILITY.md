# DriveWiki MCP Edition — Feasibility Analysis

> วิเคราะห์ความเป็นไปได้ในการสร้าง DriveWiki เป็น MCP Server
> แทนที่จะเป็น Traditional Web App

---

## Executive Summary

**สรุป: เป็นไปได้ และน่าสนใจมาก — แต่ต้องเป็น Hybrid Architecture**

DriveWiki MCP Edition ไม่ใช่ "เปลี่ยนจาก Web App เป็น MCP" แต่เป็น
**"เพิ่ม MCP layer ทับ backend เดิม"** — ได้ประโยชน์ทั้ง 2 ฝั่ง:

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  Option A: Web App Only (เดิม)                                  ║
║  ┌──────────┐    ┌──────────┐    ┌──────────┐                   ║
║  │ React    │───>│ REST API │───>│ Services │                   ║
║  │ Frontend │    │          │    │          │                   ║
║  └──────────┘    └──────────┘    └──────────┘                   ║
║                                                                  ║
║  Option B: MCP Only (ไม่แนะนำ)                                   ║
║  ┌──────────┐    ┌──────────┐    ┌──────────┐                   ║
║  │ Claude   │───>│ MCP      │───>│ Services │                   ║
║  │ Desktop  │    │ Server   │    │          │                   ║
║  └──────────┘    └──────────┘    └──────────┘                   ║
║  ⚠ ไม่มี web UI, ต้องลง Claude Desktop ทุกคน                     ║
║                                                                  ║
║  Option C: Hybrid (แนะนำ) ⭐                                     ║
║  ┌──────────┐    ┌──────────┐                                    ║
║  │ React    │───>│          │    ┌──────────┐                   ║
║  │ Frontend │    │ REST API │───>│ Services │                   ║
║  └──────────┘    │          │    │ (shared) │                   ║
║  ┌──────────┐    │          │    │          │                   ║
║  │ Claude   │───>│ MCP      │───>│          │                   ║
║  │ Desktop/ │    │ Server   │    │          │                   ║
║  │ VS Code/ │    │          │    │          │                   ║
║  │ Claude   │    └──────────┘    └──────────┘                   ║
║  │ Code     │                                                    ║
║  └──────────┘                                                    ║
║  ✓ ทุกคนใช้ web ได้ + power users ใช้ผ่าน AI agent                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## MCP คืออะไร?

```
Model Context Protocol (MCP) by Anthropic
──────────────────────────────────────────

MCP เป็น protocol มาตรฐานที่ให้ AI model เชื่อมต่อกับ
external data sources และ tools — เหมือน "USB-C สำหรับ AI"

┌─────────────────┐         ┌─────────────────┐
│   MCP Client    │ ──MCP── │   MCP Server    │
│                 │         │                 │
│ Claude Desktop  │         │ DriveWiki       │
│ Claude Code     │         │                 │
│ VS Code         │         │ ┌─────────────┐ │
│ Cursor          │         │ │ Resources   │ │ ← ข้อมูล (wiki pages, index)
│ Custom App      │         │ │ Tools       │ │ ← actions (search, ingest, ask)
│                 │         │ │ Prompts     │ │ ← workflow templates
│                 │         │ └─────────────┘ │
└─────────────────┘         └─────────────────┘

3 Core Primitives:
─────────────────
1. Resources — structured data ที่ AI อ่านได้
   เช่น wiki://pages/hr-policy → returns markdown content

2. Tools — functions ที่ AI เรียกใช้ได้
   เช่น drivewiki.search("นโยบายลา") → returns results

3. Prompts — workflow templates สำเร็จรูป
   เช่น /research "topic" → multi-step research flow
```

---

## Feasibility Matrix

```
╔═══════════════════════════════╤════════════╤════════════╤═════════════╗
║ Requirement                   │ Web App    │ MCP Only   │ Hybrid      ║
╠═══════════════════════════════╪════════════╪════════════╪═════════════╣
║ Google Drive integration      │ ✓ REST API │ ✓ MCP Tool │ ✓ Shared    ║
║ Wiki compilation (Karpathy)   │ ✓ Backend  │ ✓ MCP Tool │ ✓ Shared    ║
║ Chat with citations           │ ✓ SSE      │ ✓ Native   │ ✓ Both      ║
║ 1000+ concurrent users        │ ✓ Proven   │ ⚠ Possible │ ✓ Web+MCP   ║
║ Multi-tenant RBAC             │ ✓ Built-in │ ⚠ Custom   │ ✓ Shared    ║
║ HMAC Audit trail              │ ✓ Backend  │ ✓ Backend  │ ✓ Shared    ║
║ Cost tracking per user        │ ✓ Backend  │ ✓ Backend  │ ✓ Shared    ║
║ Web browser access            │ ✓          │ ✗ None     │ ✓ Web UI    ║
║ No client install needed      │ ✓          │ ✗ Need app │ ✓ Web works ║
║ AI-native experience          │ ⚠ Custom   │ ✓ Native   │ ✓ MCP side  ║
║ Work in VS Code               │ ✗          │ ✓          │ ✓           ║
║ Work in Claude Code           │ ✗          │ ✓          │ ✓           ║
║ Keyboard-first power users    │ ⚠          │ ✓ Natural  │ ✓           ║
║ Mobile access                 │ ✓ PWA      │ ✗ No mobile│ ✓ Web PWA   ║
║ Dashboard / charts            │ ✓ Recharts │ ✗ Text only│ ✓ Web UI    ║
║ Admin UI (user mgmt etc)      │ ✓ React    │ ⚠ CLI-like │ ✓ Web UI    ║
║ PDPA consent flow             │ ✓ Form     │ ⚠ Awkward  │ ✓ Web form  ║
║ Thai language UI              │ ✓ i18n     │ ✓ AI native│ ✓ Both      ║
║ Offline/local mode            │ ✗          │ ✓ stdio    │ ✓ MCP side  ║
║ Development speed             │ Normal     │ Faster ⚡   │ Moderate    ║
╠═══════════════════════════════╪════════════╪════════════╪═════════════╣
║ VERDICT                       │ Safe bet   │ Too narrow │ Best of both║
╚═══════════════════════════════╧════════════╧════════════╧═════════════╝
```

---

## Hybrid Architecture: DriveWiki MCP Edition

```
╔══════════════════════════════════════════════════════════════════════╗
║                   DriveWiki Hybrid Architecture                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  CLIENTS                                                             ║
║  ──────                                                              ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               ║
║  │  Web App     │  │Claude Desktop│  │  VS Code /   │               ║
║  │  (React)     │  │/ Claude Code │  │  Cursor      │               ║
║  │              │  │              │  │              │               ║
║  │  All users   │  │  Power users │  │  Developers  │               ║
║  │  100% compat │  │  AI-native   │  │  In-IDE      │               ║
║  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               ║
║         │                 │                  │                       ║
║         │ REST/SSE        │ MCP (HTTP)       │ MCP (stdio)          ║
║         │                 │                  │                       ║
║  ═══════╪═════════════════╪══════════════════╪══════════════════     ║
║         │                 │                  │                       ║
║  GATEWAY LAYER                                                       ║
║  ─────────────                                                       ║
║  ┌──────┴─────────────────┴──────────────────┴───────────────┐      ║
║  │                    API Gateway                             │      ║
║  │                                                            │      ║
║  │  ┌─────────────────┐    ┌─────────────────────────────┐   │      ║
║  │  │  REST Router    │    │  MCP Server                  │   │      ║
║  │  │  /api/*         │    │                              │   │      ║
║  │  │                 │    │  Resources:                  │   │      ║
║  │  │  Express routes │    │   wiki://index               │   │      ║
║  │  │  Auth middleware│    │   wiki://pages/{id}          │   │      ║
║  │  │  Rate limiting  │    │   wiki://search?q={query}    │   │      ║
║  │  │                 │    │   drive://folders             │   │      ║
║  │  │                 │    │   cost://dashboard            │   │      ║
║  │  │                 │    │   audit://logs                │   │      ║
║  │  │                 │    │                              │   │      ║
║  │  │                 │    │  Tools:                      │   │      ║
║  │  │                 │    │   ask(query) → stream answer │   │      ║
║  │  │                 │    │   search(q) → wiki results   │   │      ║
║  │  │                 │    │   ingest(folderId) → status  │   │      ║
║  │  │                 │    │   lint(deptId) → report      │   │      ║
║  │  │                 │    │   browse(type) → page list   │   │      ║
║  │  │                 │    │   get_page(id) → full content│   │      ║
║  │  │                 │    │   get_refs(id) → cross-refs  │   │      ║
║  │  │                 │    │   admin_overview() → stats   │   │      ║
║  │  │                 │    │                              │   │      ║
║  │  │                 │    │  Prompts:                    │   │      ║
║  │  │                 │    │   /research {topic}          │   │      ║
║  │  │                 │    │   /summarize {pageId}        │   │      ║
║  │  │                 │    │   /compare {page1} {page2}   │   │      ║
║  │  │                 │    │   /lint {department}         │   │      ║
║  │  │                 │    │   /onboard {department}      │   │      ║
║  │  └────────┬────────┘    └─────────────┬───────────────┘   │      ║
║  │           │                           │                    │      ║
║  └───────────┼───────────────────────────┼────────────────────┘      ║
║              │                           │                           ║
║  ════════════╪═══════════════════════════╪════════════════════       ║
║              │                           │                           ║
║  SERVICE LAYER (shared — ทั้ง REST และ MCP ใช้ร่วมกัน)               ║
║  ──────────────────────────────────────────────                      ║
║  ┌───────────┴───────────────────────────┴────────────────────┐     ║
║  │                                                            │     ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │     ║
║  │  │WikiStore │ │ChatEngine│ │IngestAgent│ │ DriveSync    │ │     ║
║  │  │          │ │          │ │          │ │   Engine     │ │     ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │     ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │     ║
║  │  │LintAgent │ │SearchSvc │ │AdminSvc  │ │ AuditLogger  │ │     ║
║  │  │          │ │          │ │          │ │              │ │     ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │     ║
║  │  ┌──────────┐ ┌──────────┐                                │     ║
║  │  │CostTrack │ │SchemaMgr │                                │     ║
║  │  │          │ │          │                                │     ║
║  │  └──────────┘ └──────────┘                                │     ║
║  └────────────────────────────────────────────────────────────┘     ║
║              │                                                       ║
║  ════════════╪═══════════════════════════════════════════════        ║
║              │                                                       ║
║  ┌───────────┴───────────────────────────────────────────────┐      ║
║  │  Cloud SQL (PostgreSQL)  │  GCS  │  Vertex AI  │  Drive   │      ║
║  └───────────────────────────────────────────────────────────┘      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## MCP Server Design: Resources, Tools, Prompts

### Resources (ข้อมูลที่ AI อ่านได้)

```
╔══════════════════════════════════════════════════════════════════╗
║  MCP Resources — DriveWiki                                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  wiki://index                                                    ║
║  ├── Returns: master wiki index (categories, page count)         ║
║  ├── MIME: text/markdown                                         ║
║  └── Auth: member+                                               ║
║                                                                  ║
║  wiki://pages                                                    ║
║  ├── Returns: list of all wiki pages (paginated)                 ║
║  ├── Params: ?type=entity|concept|summary&dept=HR&limit=20       ║
║  └── Auth: member+ (dept-scoped)                                 ║
║                                                                  ║
║  wiki://pages/{id}                                               ║
║  ├── Returns: full wiki page content + metadata + cross-refs     ║
║  ├── MIME: text/markdown                                         ║
║  └── Auth: member+ (dept-scoped)                                 ║
║                                                                  ║
║  wiki://pages/{id}/history                                       ║
║  ├── Returns: version history of a wiki page                     ║
║  └── Auth: depthead+                                             ║
║                                                                  ║
║  drive://folders                                                 ║
║  ├── Returns: connected Drive folders with sync status           ║
║  └── Auth: admin+                                                ║
║                                                                  ║
║  drive://folders/{id}/status                                     ║
║  ├── Returns: detailed sync status, last sync, errors            ║
║  └── Auth: admin+                                                ║
║                                                                  ║
║  cost://dashboard                                                ║
║  ├── Returns: cost summary (total, by dept, by user, trend)      ║
║  └── Auth: admin+                                                ║
║                                                                  ║
║  audit://logs                                                    ║
║  ├── Returns: recent audit entries with HMAC status              ║
║  ├── Params: ?from=2026-04-01&to=2026-04-17&user=xxx            ║
║  └── Auth: admin+ | compliance                                   ║
║                                                                  ║
║  admin://overview                                                ║
║  ├── Returns: system stats (users, depts, pages, cost, health)   ║
║  └── Auth: admin+                                                ║
║                                                                  ║
║  lint://report/{deptId}                                          ║
║  ├── Returns: latest lint report for department                  ║
║  └── Auth: depthead+                                             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Tools (actions ที่ AI เรียกใช้ได้)

```
╔══════════════════════════════════════════════════════════════════╗
║  MCP Tools — DriveWiki                                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ask                                                             ║
║  ├── Description: ถามคำถามเกี่ยวกับความรู้ในองค์กร                 ║
║  ├── Input: { query: string, department?: string }               ║
║  ├── Output: { answer, citations[], confidence, cost }           ║
║  ├── Streaming: true (token-by-token)                            ║
║  └── Auth: member+                                               ║
║                                                                  ║
║  search                                                          ║
║  ├── Description: ค้นหา wiki pages                                ║
║  ├── Input: { query: string, type?: string, limit?: number }     ║
║  ├── Output: { results: [{id, title, excerpt, score}] }          ║
║  └── Auth: member+                                               ║
║                                                                  ║
║  get_page                                                        ║
║  ├── Description: ดู wiki page พร้อม cross-references             ║
║  ├── Input: { pageId: string }                                   ║
║  ├── Output: { content, metadata, crossRefs[], sources[] }       ║
║  └── Auth: member+                                               ║
║                                                                  ║
║  ingest_folder                                                   ║
║  ├── Description: trigger ingestion สำหรับ Drive folder           ║
║  ├── Input: { folderId: string, force?: boolean }                ║
║  ├── Output: { status, docsQueued, estimatedTime }               ║
║  └── Auth: admin+                                                ║
║                                                                  ║
║  run_lint                                                        ║
║  ├── Description: เรียกใช้ lint check สำหรับ department             ║
║  ├── Input: { departmentId: string }                             ║
║  ├── Output: { findings[], health_score, suggestions[] }         ║
║  └── Auth: depthead+                                             ║
║                                                                  ║
║  connect_drive_folder                                            ║
║  ├── Description: เชื่อมต่อ Google Drive folder กับ department     ║
║  ├── Input: { googleFolderId: string, departmentId: string }     ║
║  ├── Output: { status, webhookRegistered, folderId }             ║
║  └── Auth: admin+                                                ║
║                                                                  ║
║  manage_user                                                     ║
║  ├── Description: จัดการ user (เปลี่ยน role, ย้ายแผนก)             ║
║  ├── Input: { userId, action: 'changeRole'|'moveDept'|... }     ║
║  ├── Output: { success, user }                                   ║
║  └── Auth: admin+                                                ║
║                                                                  ║
║  verify_audit                                                    ║
║  ├── Description: ตรวจสอบ HMAC chain integrity                    ║
║  ├── Input: { entryId?: string }                                 ║
║  ├── Output: { valid, checkedCount, brokenAt? }                  ║
║  └── Auth: superadmin+ | compliance                              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Prompts (workflow templates)

```
╔══════════════════════════════════════════════════════════════════╗
║  MCP Prompts — DriveWiki                                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  /research {topic}                                               ║
║  ├── Multi-step: search → read top pages → synthesize → cite    ║
║  ├── Example: /research "นโยบายลาพักร้อน"                         ║
║  └── Output: structured research with citations                  ║
║                                                                  ║
║  /summarize {pageId}                                             ║
║  ├── Load wiki page → generate executive summary                 ║
║  ├── Example: /summarize hr-policy-2026                          ║
║  └── Output: 3-paragraph summary in Thai                        ║
║                                                                  ║
║  /compare {page1} {page2}                                        ║
║  ├── Load 2 pages → diff analysis → highlight changes            ║
║  ├── Example: /compare leave-policy-2025 leave-policy-2026       ║
║  └── Output: structured comparison table                         ║
║                                                                  ║
║  /onboard {department}                                           ║
║  ├── Load dept index → curate essential reading list             ║
║  ├── Example: /onboard HR                                        ║
║  └── Output: prioritized reading plan for new hires             ║
║                                                                  ║
║  /weekly-digest {department}                                     ║
║  ├── Recent changes → new pages → lint findings → summary        ║
║  ├── Example: /weekly-digest Finance                             ║
║  └── Output: weekly knowledge update email draft                 ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Use Case Comparison: Web vs MCP

```
╔════════════════════════════════════════════════════════════════════════╗
║  Scenario                     │ Web App               │ MCP Server   ║
╠═══════════════════════════════╪═══════════════════════╪══════════════╣
║                               │                       │              ║
║  HR ถามเรื่องนโยบายลา          │ เปิด browser →        │ พิมพ์ใน Claude║
║                               │ พิมพ์ใน chat box →    │ "ถามนโยบายลา ║
║                               │ รอ streaming →        │  จาก DriveWiki║
║                               │ อ่านคำตอบ + citations │  " → ได้คำตอบ ║
║                               │                       │  ทันที        ║
║                               │ 🕐 5 clicks           │ 🕐 1 message ║
║                               │                       │              ║
║  Dev ค้นหา API spec ในองค์กร    │ สลับจาก VS Code →    │ ใน VS Code   ║
║                               │ เปิด browser →        │ เรียก MCP    ║
║                               │ search → อ่าน        │ tool ค้นหา    ║
║                               │                       │ ได้คำตอบ      ║
║                               │ 🕐 context switch     │ 🕐 0 switch  ║
║                               │                       │              ║
║  Manager ดู dashboard          │ เปิด browser →        │ ❌ text only  ║
║                               │ admin dashboard →     │ ไม่มี charts  ║
║                               │ charts + metrics      │              ║
║                               │ 🕐 visual, rich       │ 🕐 limited   ║
║                               │                       │              ║
║  Compliance audit              │ เปิด audit page →     │ เรียก tool   ║
║                               │ filter + export       │ verify_audit ║
║                               │                       │ → ได้ report  ║
║                               │ 🕐 clickable UI       │ 🕐 text output║
║                               │                       │              ║
║  Onboard พนักงานใหม่           │ ส่ง link ให้ →        │ พิมพ์         ║
║                               │ browse wiki manually  │ /onboard HR  ║
║                               │                       │ → ได้ reading ║
║                               │                       │   plan ทันที  ║
║                               │ 🕐 self-guided        │ 🕐 curated   ║
║                               │                       │              ║
╠═══════════════════════════════╪═══════════════════════╪══════════════╣
║  WINNER by scenario:          │ Dashboard, Audit,     │ Chat, Search,║
║                               │ Admin, Mobile         │ Dev workflow, ║
║                               │                       │ Research,    ║
║                               │                       │ Onboarding   ║
╚═══════════════════════════════╧═══════════════════════╧══════════════╝
```

---

## Technical Implementation Plan

### MCP Server Structure

```
drivewiki-mcp/
├── package.json                    # @modelcontextprotocol/sdk
├── src/
│   ├── index.ts                    # MCP server entry point
│   ├── server.ts                   # McpServer instance
│   ├── auth.ts                     # OAuth 2.0 token validation
│   ├── resources/
│   │   ├── wiki.ts                 # wiki:// resources
│   │   ├── drive.ts                # drive:// resources
│   │   ├── cost.ts                 # cost:// resources
│   │   ├── audit.ts                # audit:// resources
│   │   └── admin.ts                # admin:// resources
│   ├── tools/
│   │   ├── ask.ts                  # ask() tool
│   │   ├── search.ts               # search() tool
│   │   ├── ingest.ts               # ingest_folder() tool
│   │   ├── lint.ts                 # run_lint() tool
│   │   ├── manage.ts               # manage_user() tool
│   │   └── audit.ts                # verify_audit() tool
│   ├── prompts/
│   │   ├── research.ts             # /research prompt
│   │   ├── summarize.ts            # /summarize prompt
│   │   ├── compare.ts              # /compare prompt
│   │   ├── onboard.ts              # /onboard prompt
│   │   └── weekly-digest.ts        # /weekly-digest prompt
│   └── shared/
│       ├── client.ts               # HTTP client to DriveWiki API
│       └── types.ts                # Shared TypeScript types
├── transports/
│   ├── stdio.ts                    # For local dev / Claude Desktop
│   └── http.ts                     # For remote / multi-user
└── tests/
    ├── resources.test.ts
    ├── tools.test.ts
    └── prompts.test.ts
```

### Transport Strategy

```
╔══════════════════════════════════════════════════════════════════╗
║  Transport                    │ Use Case              │ Users  ║
╠═══════════════════════════════╪═══════════════════════╪════════╣
║  stdio (local process)        │ Dev/power user        │ 1      ║
║  ├── claude_desktop_config:   │ on own machine        │        ║
║  │   "drivewiki": {           │                       │        ║
║  │     "command": "npx",      │                       │        ║
║  │     "args": ["drivewiki-   │                       │        ║
║  │       mcp", "--token",     │                       │        ║
║  │       "$DRIVEWIKI_TOKEN"]  │                       │        ║
║  │   }                        │                       │        ║
║  │                            │                       │        ║
║  Streamable HTTP (remote)     │ Enterprise shared     │ 1000+  ║
║  ├── URL: https://drivewiki   │ server                │        ║
║  │   .example.com/mcp         │                       │        ║
║  ├── Auth: Bearer token       │                       │        ║
║  ├── Session: per-user via    │                       │        ║
║  │   Redis session store      │                       │        ║
║  └── Scale: Cloud Run auto    │                       │        ║
╚═══════════════════════════════╧═══════════════════════╧════════╝
```

---

## Enterprise Concerns & Solutions

```
╔══════════════════════════════════════════════════════════════════╗
║  Concern          │ MCP Spec     │ DriveWiki Solution            ║
╠═══════════════════╪══════════════╪═══════════════════════════════╣
║                   │              │                               ║
║  Multi-tenancy    │ OAuth 2.0    │ Google Workspace SSO →       ║
║                   │ token header │ extract org/dept from token  ║
║                   │              │ → scope all resources        ║
║                   │              │                               ║
║  User isolation   │ No built-in  │ Every resource/tool call     ║
║                   │ RBAC         │ checks user.role + user.dept ║
║                   │              │ via shared auth middleware   ║
║                   │              │                               ║
║  1000+ users      │ HTTP trans-  │ Cloud Run auto-scale +       ║
║                   │ port + async │ Redis session store +        ║
║                   │              │ Cloud SQL connection pool    ║
║                   │              │                               ║
║  Audit logging    │ Not built-in │ Same HMAC audit service as   ║
║                   │              │ REST API — shared backend    ║
║                   │              │                               ║
║  Cost tracking    │ Not built-in │ Wrap every tool call with    ║
║                   │              │ cost tracking middleware     ║
║                   │              │                               ║
║  Rate limiting    │ Not built-in │ Per-user rate limit on tool  ║
║                   │              │ calls (same as REST)         ║
║                   │              │                               ║
║  Data residency   │ N/A          │ All data stays in GCP        ║
║  (PDPA)           │              │ asia-southeast1 or           ║
║                   │              │ us-central1                  ║
║                   │              │                               ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Effort Estimate: Adding MCP Layer

```
╔══════════════════════════════════════════════════════════════════╗
║  Task                              │ Effort  │ Dependencies     ║
╠════════════════════════════════════╪═════════╪═════════════════╣
║  MCP Server scaffold + transports  │ 1 day   │ None            ║
║  Auth integration (OAuth 2.0)      │ 1 day   │ Backend auth    ║
║  10 Resources (wiki, drive, etc)   │ 2 days  │ Backend services║
║  8 Tools (ask, search, etc)        │ 2 days  │ Backend services║
║  5 Prompts (research, etc)         │ 1 day   │ Tools           ║
║  Streaming support (ask tool)      │ 0.5 day │ Chat engine     ║
║  Tests (resources + tools)         │ 1 day   │ All above       ║
║  Claude Desktop config + docs      │ 0.5 day │ MCP server      ║
║  HTTP transport + Cloud Run deploy │ 1 day   │ MCP server      ║
║                                    │         │                 ║
║  TOTAL                             │ 10 days │                 ║
║  (on top of existing backend)      │         │                 ║
╚══════════════════════════════════════════════════════════════════╝

เทียบกับ:
- Web App frontend (React): ~30 days
- MCP Server (backend exists): ~10 days
- Hybrid (both): ~35 days (shared backend saves ~5 days)
```

---

## Recommendation

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  ⭐ RECOMMENDATION: Hybrid — Build MCP FIRST, Web UI SECOND      ║
║                                                                  ║
║  เหตุผล:                                                         ║
║                                                                  ║
║  1. MCP ใช้ backend เดียวกัน — ไม่เสียเวลาซ้ำ                       ║
║     Backend services (Wiki, Chat, Search, Admin) สร้างครั้งเดียว   ║
║     ทั้ง REST routes และ MCP tools เรียกใช้ service เดียวกัน       ║
║                                                                  ║
║  2. MCP ให้ feedback loop เร็วกว่า                                ║
║     ไม่ต้องสร้าง UI → ทดสอบ flows ผ่าน Claude Desktop ได้ทันที     ║
║     Validate product-market fit ก่อนลงทุนสร้าง frontend            ║
║                                                                  ║
║  3. Karpathy's pattern เหมาะกับ MCP โดยธรรมชาติ                   ║
║     Wiki-as-context = MCP Resources                              ║
║     Agent-maintained = MCP Tools                                 ║
║     Schema/conventions = MCP Prompts                             ║
║                                                                  ║
║  4. Enterprise power users (devs, analysts) ชอบ                  ║
║     ใช้ใน IDE/Claude Desktop → ไม่ต้อง context switch             ║
║     ค้นหาความรู้องค์กรขณะเขียนโค้ดหรือวิเคราะห์ข้อมูล                ║
║                                                                  ║
║  5. Web UI สร้างทีหลังเมื่อ:                                       ║
║     - Product validated ผ่าน MCP users แล้ว                      ║
║     - ต้องการ dashboard/charts ที่ text UI ทำไม่ได้                ║
║     - ต้อง onboard non-technical users (ที่ไม่มี Claude Desktop)   ║
║                                                                  ║
║  Timeline:                                                       ║
║  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐           ║
║  │ Sprint 1 │  │  Sprint 2-3  │  │   Sprint 4-5     │           ║
║  │ Backend  │→ │  MCP Server  │→ │   Web UI         │           ║
║  │ Services │  │  + Deploy    │  │   (if validated)  │           ║
║  │ (10 days)│  │  (10 days)   │  │   (20 days)      │           ║
║  └──────────┘  └──────────────┘  └──────────────────┘           ║
║                                                                  ║
║  Total: Backend + MCP = 20 days → usable product                ║
║  vs. Backend + Web = 40 days → same features, more UI debt      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

*Document version: 1.0 | Generated: 2026-04-17 | Project: DriveWiki*
