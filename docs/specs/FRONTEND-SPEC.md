# DriveWiki Frontend Specification v1.0

> **Codename:** DriveWiki Frontend
> **Product:** Enterprise Google Drive Knowledge Management System -- Frontend Application
> **Supplements:** `drivewiki-superspec.md` (system-level spec)
> **Spec Author:** Iron Man (AEGIS System Architect)
> **Date:** 2026-04-17
> **Status:** DRAFT -- Pending Loki Review

---

## Soul

Frontend ของ DriveWiki ถูกออกแบบให้เป็น "หน้าต่างแห่งความรู้" ที่เงียบสงบ สะอาดตา และไม่กั้นทาง
ผู้ใช้ต้องรู้สึกเหมือนกำลังอ่าน wiki ที่ชาญฉลาด -- ไม่ใช่กำลังสู้กับ enterprise software ที่ซับซ้อน
ทุก interaction ออกแบบให้เร็วกว่า 300ms ทุก loading state มี skeleton ที่สื่อความหมาย
ทุก error มีคำแนะนำที่ actionable เราเลือก composability เหนือ monolith --
แต่ละ component ทำงานได้อิสระ test ได้ง่าย และประกอบกันได้อย่างลงตัว
ภาษาไทยเป็น first-class citizen ไม่ใช่ afterthought -- line height, font, breakpoints ออกแบบมาเพื่อ Thai text

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Design System Specification](#2-design-system-specification)
3. [Component Catalog](#3-component-catalog)
4. [Page Specifications](#4-page-specifications)
5. [State Management Architecture](#5-state-management-architecture)
6. [API Client Layer](#6-api-client-layer)
7. [Routing Configuration](#7-routing-configuration)
8. [i18n Strategy](#8-i18n-strategy)
9. [Testing Strategy](#9-testing-strategy)
10. [Performance Requirements](#10-performance-requirements)
11. [Security (Frontend)](#11-security-frontend)
12. [Deployment & CI/CD](#12-deployment--cicd)

---

# 1. Project Structure

## 1.1 Full File Tree

```
drivewiki-frontend/
├── public/
│   ├── favicon.ico                    # App favicon (DriveWiki logo)
│   ├── logo.svg                       # SVG logo สำหรับ header + loading
│   ├── og-image.png                   # Open Graph image สำหรับ social sharing
│   └── locales/                       # Static locale files (fallback)
│       ├── th.json
│       └── en.json
├── src/
│   ├── main.tsx                       # Entry point -- mount React app
│   ├── app/
│   │   ├── root.tsx                   # TanStack Router root component
│   │   ├── router.tsx                 # Router configuration + route tree
│   │   ├── routes/
│   │   │   ├── __root.tsx             # Root layout (providers, error boundary)
│   │   │   ├── _auth.tsx              # Auth layout wrapper (protected routes)
│   │   │   ├── _auth/
│   │   │   │   ├── index.tsx          # / -> redirect to /chat
│   │   │   │   ├── chat.tsx           # /chat -- main chat interface
│   │   │   │   ├── wiki/
│   │   │   │   │   ├── index.tsx      # /wiki -- wiki browse/index
│   │   │   │   │   ├── $pageId.tsx    # /wiki/:pageId -- wiki page detail
│   │   │   │   │   └── search.tsx     # /wiki/search -- wiki search results
│   │   │   │   ├── dashboard.tsx      # /dashboard -- department dashboard
│   │   │   │   ├── profile.tsx        # /profile -- user profile + preferences
│   │   │   │   └── admin/
│   │   │   │       ├── index.tsx      # /admin -- admin dashboard overview
│   │   │   │       ├── users.tsx      # /admin/users -- user management
│   │   │   │       ├── departments.tsx # /admin/departments -- department management
│   │   │   │       ├── drive.tsx      # /admin/drive -- drive folder manager
│   │   │   │       ├── policies.tsx   # /admin/policies -- content policy editor
│   │   │   │       ├── ingestion.tsx  # /admin/ingestion -- ingestion monitor
│   │   │   │       ├── cost.tsx       # /admin/cost -- cost dashboard
│   │   │   │       ├── audit.tsx      # /admin/audit -- audit log viewer
│   │   │   │       └── lint.tsx       # /admin/lint -- lint report viewer
│   │   │   ├── login.tsx              # /login -- Google OAuth login page
│   │   │   ├── consent.tsx            # /consent -- PDPA consent form
│   │   │   ├── setup.tsx              # /setup -- first-time setup wizard
│   │   │   └── 404.tsx                # Not found page
│   │   └── not-found.tsx              # Global 404 component
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── command.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── form.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # Main application shell (sidebar + header + content)
│   │   │   ├── Sidebar.tsx            # Left navigation sidebar (collapsible)
│   │   │   ├── Header.tsx             # Top header bar (search, user menu, notifications)
│   │   │   ├── PageContainer.tsx      # Content area wrapper (max-width, padding)
│   │   │   └── BreadcrumbNav.tsx      # Breadcrumb navigation component
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx          # Full chat interface container
│   │   │   ├── MessageBubble.tsx      # Individual message (user/assistant)
│   │   │   ├── ChatInput.tsx          # Chat input with send button + keyboard shortcuts
│   │   │   ├── StreamingText.tsx      # Token-by-token streaming text display
│   │   │   ├── SuggestedQueries.tsx   # Suggested/example query chips
│   │   │   └── CitationPanel.tsx      # Side panel showing cited wiki pages
│   │   ├── wiki/
│   │   │   ├── WikiPageView.tsx       # Full wiki page renderer (markdown + metadata)
│   │   │   ├── WikiIndex.tsx          # Wiki index/browse component (filterable list)
│   │   │   ├── CrossRefSidebar.tsx    # Sidebar showing cross-references for a page
│   │   │   ├── PageVersionDiff.tsx    # Side-by-side diff of wiki page versions
│   │   │   └── WikiSearch.tsx         # Wiki-specific search with filters
│   │   ├── admin/
│   │   │   ├── CostChart.tsx          # Cost visualization (line/bar chart)
│   │   │   ├── AuditLogTable.tsx      # Audit log data table with filters
│   │   │   ├── LintReportCard.tsx     # Lint report summary card
│   │   │   └── IngestionProgress.tsx  # Real-time ingestion progress indicator
│   │   ├── drive/
│   │   │   ├── DriveFolderPicker.tsx  # Google Drive folder tree picker
│   │   │   └── DriveConnectionStatus.tsx # Drive sync status indicator
│   │   └── common/
│   │       ├── MetricCard.tsx         # Dashboard metric card (number + trend)
│   │       ├── DataTable.tsx          # Generic data table (sortable, filterable, paginated)
│   │       ├── PageCard.tsx           # Wiki page preview card (title, type badge, summary)
│   │       ├── CitationLink.tsx       # Inline citation link [1] with tooltip
│   │       ├── ConfidenceBadge.tsx    # Confidence level indicator (high/medium/low)
│   │       ├── HealthIndicator.tsx    # System/department health dot (green/yellow/red)
│   │       ├── Timeline.tsx           # Activity timeline component
│   │       ├── Toast.tsx              # Toast notification (success/error/warning/info)
│   │       ├── EmptyState.tsx         # Empty state illustration + message + CTA
│   │       ├── ErrorBoundary.tsx      # React error boundary with fallback UI
│   │       ├── LoadingSkeleton.tsx    # Generic loading skeleton (card/table/page variants)
│   │       ├── ConfirmDialog.tsx      # Confirmation dialog (destructive action warning)
│   │       ├── SearchBar.tsx          # Global search bar (command palette style)
│   │       ├── FilterPanel.tsx        # Multi-filter panel (date range, type, department)
│   │       ├── SettingsForm.tsx       # Generic settings form layout
│   │       ├── LanguageSwitcher.tsx   # Thai/English language toggle
│   │       └── ThemeToggle.tsx        # Light/dark mode toggle
│   ├── features/
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts         # Auth state + login/logout actions
│   │   │   │   ├── usePermission.ts   # Permission check hook (role + department)
│   │   │   │   └── useConsent.ts      # PDPA consent status hook
│   │   │   ├── components/
│   │   │   │   ├── LoginButton.tsx    # Google OAuth login button
│   │   │   │   ├── ConsentForm.tsx    # PDPA consent form
│   │   │   │   └── RoleGuard.tsx      # Conditional render based on role
│   │   │   └── utils/
│   │   │       └── permissions.ts     # Role hierarchy + permission matrix
│   │   ├── chat/
│   │   │   ├── hooks/
│   │   │   │   ├── useChatSession.ts  # Chat session management
│   │   │   │   ├── useStreamResponse.ts # SSE streaming response hook
│   │   │   │   └── useChatHistory.ts  # Chat history pagination
│   │   │   ├── components/
│   │   │   │   ├── ChatSessionList.tsx # List of past chat sessions
│   │   │   │   ├── FeedbackButtons.tsx # Thumbs up/down feedback
│   │   │   │   └── SourcePreview.tsx  # Preview of cited source document
│   │   │   └── utils/
│   │   │       ├── messageParser.ts   # Parse streaming response chunks
│   │   │       └── citationExtractor.ts # Extract citation references from response
│   │   ├── wiki/
│   │   │   ├── hooks/
│   │   │   │   ├── useWikiPage.ts     # Single wiki page query
│   │   │   │   ├── useWikiIndex.ts    # Wiki index with filters
│   │   │   │   ├── useWikiSearch.ts   # Wiki search with debounce
│   │   │   │   └── usePageHistory.ts  # Wiki page version history
│   │   │   ├── components/
│   │   │   │   ├── MarkdownRenderer.tsx # Custom markdown renderer (react-markdown + rehype)
│   │   │   │   ├── PageTypeFilter.tsx  # Filter by entity/concept/summary
│   │   │   │   └── PageMetadata.tsx   # Page metadata display (sources, dates, status)
│   │   │   └── utils/
│   │   │       ├── markdownPlugins.ts # Custom rehype/remark plugins
│   │   │       └── wikiLinkResolver.ts # Resolve [[wiki links]] to routes
│   │   ├── admin/
│   │   │   ├── hooks/
│   │   │   │   ├── useAdminOverview.ts # Admin dashboard data
│   │   │   │   ├── useUserManagement.ts # CRUD users
│   │   │   │   ├── useDepartments.ts  # CRUD departments
│   │   │   │   └── useCostData.ts     # Cost analytics queries
│   │   │   └── components/
│   │   │       ├── UserTable.tsx       # User management table
│   │   │       ├── DepartmentForm.tsx  # Department create/edit form
│   │   │       ├── UserRoleEditor.tsx  # Role assignment UI
│   │   │       └── CostBreakdown.tsx   # Cost breakdown by department/user
│   │   ├── drive/
│   │   │   ├── hooks/
│   │   │   │   ├── useDriveFolders.ts # Drive folder listing
│   │   │   │   └── useDriveSync.ts    # Drive sync status + triggers
│   │   │   └── components/
│   │   │       ├── FolderTree.tsx      # Recursive folder tree display
│   │   │       └── SyncStatusBadge.tsx # Sync status per folder
│   │   ├── audit/
│   │   │   ├── hooks/
│   │   │   │   └── useAuditLogs.ts    # Audit log query with filters
│   │   │   └── components/
│   │   │       ├── AuditFilterBar.tsx  # Audit-specific filter controls
│   │   │       └── IntegrityBadge.tsx  # HMAC verification status badge
│   │   └── cost/
│   │       ├── hooks/
│   │       │   └── useCostAnalytics.ts # Cost analytics with date ranges
│   │       └── components/
│   │           ├── CostTrendChart.tsx  # Monthly cost trend line chart
│   │           └── TokenUsageChart.tsx # Token usage breakdown pie chart
│   ├── hooks/
│   │   ├── useDebounce.ts             # Generic debounce hook
│   │   ├── useLocalStorage.ts         # Typed localStorage hook
│   │   ├── useMediaQuery.ts           # Responsive breakpoint hook
│   │   ├── useOnClickOutside.ts       # Click outside detection
│   │   ├── useIntersectionObserver.ts  # Lazy loading / infinite scroll trigger
│   │   ├── useKeyboardShortcut.ts     # Global keyboard shortcut registration
│   │   ├── useCopyToClipboard.ts      # Copy text with toast feedback
│   │   └── useSSE.ts                  # Server-Sent Events connection management
│   ├── stores/
│   │   ├── authStore.ts               # Auth state (user, tokens, permissions)
│   │   ├── chatStore.ts               # Active chat session state
│   │   ├── wikiStore.ts               # Wiki browsing state (filters, selected page)
│   │   ├── uiStore.ts                 # UI state (sidebar, theme, locale, modals)
│   │   └── adminStore.ts             # Admin dashboard state (active tab, filters)
│   ├── services/
│   │   ├── httpClient.ts              # Base HTTP client (fetch wrapper + interceptors)
│   │   ├── authService.ts             # Auth API calls
│   │   ├── chatService.ts             # Chat API calls + SSE stream
│   │   ├── wikiService.ts             # Wiki CRUD API calls
│   │   ├── driveService.ts            # Drive management API calls
│   │   ├── adminService.ts            # Admin API calls
│   │   ├── ingestionService.ts        # Ingestion monitoring API calls
│   │   ├── auditService.ts            # Audit log API calls
│   │   └── costService.ts             # Cost analytics API calls
│   ├── types/
│   │   ├── auth.ts                    # User, Session, Role, Permission types
│   │   ├── chat.ts                    # ChatSession, ChatMessage, Citation types
│   │   ├── wiki.ts                    # WikiPage, CrossRef, WikiIndex types
│   │   ├── drive.ts                   # DriveFolder, DriveDocument, SyncStatus types
│   │   ├── admin.ts                   # Department, ContentPolicy, Overview types
│   │   ├── audit.ts                   # AuditLog, AuditFilter types
│   │   ├── cost.ts                    # CostEvent, CostSummary types
│   │   ├── api.ts                     # API response wrappers, pagination, error types
│   │   └── i18n.ts                    # Translation key types (type-safe i18n)
│   ├── utils/
│   │   ├── cn.ts                      # Tailwind classname merger (clsx + twMerge)
│   │   ├── date.ts                    # Date formatting (Thai Buddhist Era support)
│   │   ├── format.ts                  # Number, currency, percentage formatting
│   │   ├── sanitize.ts               # DOMPurify wrapper for markdown HTML
│   │   ├── queryKeys.ts              # TanStack Query key factory
│   │   ├── errorHandler.ts           # Centralized error handler
│   │   ├── constants.ts              # App-wide constants
│   │   └── validators.ts             # Zod validation schemas
│   ├── i18n/
│   │   ├── config.ts                  # i18n configuration + provider setup
│   │   ├── th/
│   │   │   ├── common.json            # Common UI strings (buttons, labels)
│   │   │   ├── chat.json              # Chat-specific strings
│   │   │   ├── wiki.json              # Wiki-specific strings
│   │   │   ├── admin.json             # Admin panel strings
│   │   │   └── errors.json            # Error messages
│   │   └── en/
│   │       ├── common.json
│   │       ├── chat.json
│   │       ├── wiki.json
│   │       ├── admin.json
│   │       └── errors.json
│   ├── styles/
│   │   ├── globals.css                # Tailwind directives + CSS custom properties
│   │   ├── fonts.css                  # Font-face declarations
│   │   └── prose.css                  # Wiki markdown prose styling overrides
│   ├── assets/
│   │   ├── fonts/
│   │   │   ├── IBMPlexSansThai-*.woff2  # Thai body font (Regular, Medium, SemiBold, Bold)
│   │   │   ├── Inter-*.woff2            # English body font
│   │   │   └── JetBrainsMono-*.woff2    # Code font
│   │   ├── icons/
│   │   │   └── custom/                  # Custom SVG icons not in Lucide
│   │   └── illustrations/
│   │       ├── empty-chat.svg           # Empty chat state
│   │       ├── empty-wiki.svg           # Empty wiki state
│   │       ├── empty-search.svg         # No search results
│   │       ├── error-generic.svg        # Generic error
│   │       ├── setup-complete.svg       # Setup wizard complete
│   │       └── consent.svg              # PDPA consent illustration
│   └── test/
│       ├── setup.ts                     # Vitest setup (Testing Library, MSW)
│       ├── utils.tsx                    # Custom render with providers
│       ├── fixtures/
│       │   ├── users.ts                 # Mock user data
│       │   ├── wikiPages.ts             # Mock wiki page data
│       │   ├── chatMessages.ts          # Mock chat messages
│       │   └── departments.ts           # Mock department data
│       └── mocks/
│           ├── handlers.ts              # MSW request handlers
│           └── server.ts                # MSW server setup
├── e2e/
│   ├── fixtures/
│   │   └── auth.ts                      # Playwright auth fixtures
│   ├── pages/
│   │   ├── login.spec.ts
│   │   ├── chat.spec.ts
│   │   ├── wiki.spec.ts
│   │   ├── admin.spec.ts
│   │   └── setup.spec.ts
│   └── playwright.config.ts
├── index.html                           # Vite HTML entry point
├── vite.config.ts                       # Vite configuration
├── tailwind.config.ts                   # Tailwind CSS 4 configuration
├── tsconfig.json                        # TypeScript configuration
├── tsconfig.app.json                    # App-specific TS config
├── tsconfig.node.json                   # Node-specific TS config (Vite config)
├── vitest.config.ts                     # Vitest configuration
├── components.json                      # shadcn/ui configuration
├── .env.example                         # Environment variable template
├── .eslintrc.cjs                        # ESLint configuration
├── .prettierrc                          # Prettier configuration
├── Dockerfile                           # Production Docker build
├── docker-compose.dev.yml               # Dev Docker compose (with mock API)
└── package.json
```

## 1.2 Directory Purpose Matrix

| Directory | Purpose | ไฟล์ที่คาดว่าจะมี | Owner |
|-----------|---------|-------------------|-------|
| `src/app/routes/` | TanStack Router file-based routes -- 1 file = 1 route | `.tsx` route components | Page-level |
| `src/components/ui/` | shadcn/ui primitive components -- auto-generated via CLI, ห้ามแก้ไขโดยตรง | Button, Input, Dialog ฯลฯ | Library |
| `src/components/layout/` | Application shell components ที่ปรากฏทุกหน้า (sidebar, header) | AppShell, Sidebar, Header | Layout team |
| `src/components/chat/` | Chat-specific compound components | ChatPanel, MessageBubble | Chat feature |
| `src/components/wiki/` | Wiki rendering + browsing components | WikiPageView, WikiIndex | Wiki feature |
| `src/components/admin/` | Admin dashboard components | CostChart, AuditLogTable | Admin feature |
| `src/components/drive/` | Drive connection + management UI | DriveFolderPicker | Drive feature |
| `src/components/common/` | Shared components ที่ใช้ข้ามหลาย features | MetricCard, DataTable, Toast | Shared |
| `src/features/` | Feature modules -- co-located hooks, utils, sub-components | Feature-specific code | Feature team |
| `src/hooks/` | Generic custom hooks ที่ไม่ผูกกับ feature ใดเป็นพิเศษ | useDebounce, useMediaQuery | Shared |
| `src/stores/` | Zustand client state stores | authStore, uiStore | State team |
| `src/services/` | API client layer -- HTTP calls + response mapping | authService, chatService | API team |
| `src/types/` | Global TypeScript type definitions | Shared interfaces | All |
| `src/utils/` | Pure utility functions (no React dependency) | cn, date, format, sanitize | Shared |
| `src/i18n/` | Internationalization files + configuration | JSON translation files | i18n team |
| `src/styles/` | Global CSS + theme tokens | globals.css, fonts.css | Design team |
| `src/assets/` | Static assets (fonts, icons, illustrations) | .woff2, .svg | Design team |
| `src/test/` | Test utilities, fixtures, MSW mocks | setup.ts, fixtures/*.ts | QA team |
| `e2e/` | Playwright end-to-end test files | *.spec.ts | QA team |

---

# 2. Design System Specification

## 2.1 Colors

### Primary Palette (Blue)

ใช้ blue เป็นสีหลักเพื่อสื่อถึงความน่าเชื่อถือ (trust) และความเป็นมืออาชีพ (professionalism) ซึ่งเหมาะกับ enterprise knowledge management

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-primary-50` | `#eff6ff` | `#172554` | Background tints |
| `--color-primary-100` | `#dbeafe` | `#1e3a5f` | Hover backgrounds |
| `--color-primary-200` | `#bfdbfe` | `#1e40af` | Selected states |
| `--color-primary-300` | `#93c5fd` | `#2563eb` | Borders (active) |
| `--color-primary-400` | `#60a5fa` | `#3b82f6` | Icons (secondary) |
| `--color-primary-500` | `#3b82f6` | `#60a5fa` | **Primary brand color** |
| `--color-primary-600` | `#2563eb` | `#93c5fd` | Primary buttons, links |
| `--color-primary-700` | `#1d4ed8` | `#bfdbfe` | Button hover |
| `--color-primary-800` | `#1e40af` | `#dbeafe` | Text on light bg |
| `--color-primary-900` | `#1e3a8a` | `#eff6ff` | Headings |
| `--color-primary-950` | `#172554` | `#f8fafc` | Maximum contrast |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-success-50` | `#f0fdf4` | `#052e16` | Success background |
| `--color-success-500` | `#22c55e` | `#4ade80` | Success icon/text |
| `--color-success-700` | `#15803d` | `#86efac` | Success border |
| `--color-warning-50` | `#fffbeb` | `#451a03` | Warning background |
| `--color-warning-500` | `#f59e0b` | `#fbbf24` | Warning icon/text |
| `--color-warning-700` | `#b45309` | `#fcd34d` | Warning border |
| `--color-error-50` | `#fef2f2` | `#450a0a` | Error background |
| `--color-error-500` | `#ef4444` | `#f87171` | Error icon/text |
| `--color-error-700` | `#b91c1c` | `#fca5a5` | Error border |
| `--color-info-50` | `#f0f9ff` | `#0c1e3b` | Info background |
| `--color-info-500` | `#0ea5e9` | `#38bdf8` | Info icon/text |
| `--color-info-700` | `#0369a1` | `#7dd3fc` | Info border |

### Neutral Palette (12 Shades)

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-neutral-0` | `#ffffff` | `#09090b` | Page background |
| `--color-neutral-25` | `#fcfcfd` | `#0f0f12` | Subtle background |
| `--color-neutral-50` | `#fafafa` | `#18181b` | Card background |
| `--color-neutral-100` | `#f4f4f5` | `#1f1f23` | Sidebar background |
| `--color-neutral-200` | `#e4e4e7` | `#27272a` | Borders, dividers |
| `--color-neutral-300` | `#d4d4d8` | `#3f3f46` | Input borders |
| `--color-neutral-400` | `#a1a1aa` | `#52525b` | Placeholder text |
| `--color-neutral-500` | `#71717a` | `#71717a` | Secondary text |
| `--color-neutral-600` | `#52525b` | `#a1a1aa` | Body text (secondary) |
| `--color-neutral-700` | `#3f3f46` | `#d4d4d8` | Body text (primary) |
| `--color-neutral-800` | `#27272a` | `#e4e4e7` | Headings |
| `--color-neutral-900` | `#18181b` | `#fafafa` | High contrast text |
| `--color-neutral-950` | `#09090b` | `#ffffff` | Maximum contrast |

### Special Purpose Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-wiki-entity` | `#8b5cf6` (violet-500) | Entity page type badge |
| `--color-wiki-concept` | `#06b6d4` (cyan-500) | Concept page type badge |
| `--color-wiki-summary` | `#f97316` (orange-500) | Summary page type badge |
| `--color-chat-user` | `#f0f9ff` | User message bubble background |
| `--color-chat-assistant` | `#ffffff` / dark: `#18181b` | Assistant message bubble background |
| `--color-citation` | `#2563eb` | Citation link color |
| `--color-code-bg` | `#1e1e2e` | Code block background (catppuccin-mocha inspired) |

## 2.2 Typography

### Font Families

```css
:root {
  --font-thai: 'IBM Plex Sans Thai', 'Noto Sans Thai', sans-serif;
  --font-english: 'Inter', 'system-ui', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-body: var(--font-thai);  /* Default -- Thai-first */
}
```

**rationale:** IBM Plex Sans Thai เลือกเพราะออกแบบมาสำหรับ UI โดยเฉพาะ อ่านง่ายที่ทุก size มี weight ครบ และ pair กับ Inter ได้สวย JetBrains Mono สำหรับ code blocks เพราะมี ligatures ที่เหมาะกับ technical content

### Type Scale

| Token | Size (px) | Size (rem) | Line Height | Weight | Usage |
|-------|----------|-----------|-------------|--------|-------|
| `--text-xs` | 12px | 0.75rem | 1.5 (EN) / 1.75 (TH) | 400 | Captions, badges, timestamps |
| `--text-sm` | 14px | 0.875rem | 1.5 / 1.75 | 400 | Secondary text, table cells |
| `--text-base` | 16px | 1rem | 1.5 / 1.75 | 400 | Body text, paragraphs |
| `--text-lg` | 18px | 1.125rem | 1.5 / 1.7 | 500 | Lead paragraphs, card titles |
| `--text-xl` | 20px | 1.25rem | 1.4 / 1.6 | 600 | Section headings (h3) |
| `--text-2xl` | 24px | 1.5rem | 1.35 / 1.55 | 600 | Page sub-headings (h2) |
| `--text-3xl` | 30px | 1.875rem | 1.3 / 1.5 | 700 | Page headings (h1) |
| `--text-4xl` | 36px | 2.25rem | 1.2 / 1.4 | 700 | Hero headings |

### Weight Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Emphasis, labels, nav items |
| `--font-semibold` | 600 | Headings, buttons, badges |
| `--font-bold` | 700 | Page titles, hero text |

### Thai Line Height Note

ภาษาไทยมี ascenders (สระบน, วรรณยุกต์) และ descenders (สระล่าง) ที่ยาวกว่าภาษาอังกฤษ จึงต้องใช้ line-height สูงกว่า ระบบจะ detect locale แล้วปรับ line-height อัตโนมัติผ่าน CSS class `.lang-th` / `.lang-en` ที่ติดไว้ที่ `<html>` element

## 2.3 Spacing

ใช้ 4px base grid ตาม Tailwind convention:

| Token | Value | Usage |
|-------|-------|-------|
| `0.5` | 2px | Hairline gaps |
| `1` | 4px | Tight spacing (badge padding) |
| `1.5` | 6px | Icon padding |
| `2` | 8px | Small gap (between inline elements) |
| `3` | 12px | Input padding (vertical), card content gap |
| `4` | 16px | Standard gap, section padding |
| `5` | 20px | Card padding |
| `6` | 24px | Section gap |
| `8` | 32px | Page section spacing |
| `10` | 40px | Large section spacing |
| `12` | 48px | Page padding (horizontal) |
| `16` | 64px | Major section breaks |
| `20` | 80px | Sidebar width (collapsed) |
| `24` | 96px | Maximum spacing unit |
| `64` | 256px | Sidebar width (expanded) |
| `72` | 288px | Citation panel width |

## 2.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements: badges, tags |
| `--radius-md` | 6px | Buttons, inputs, selects |
| `--radius-lg` | 8px | Cards, dropdowns |
| `--radius-xl` | 12px | Modals, panels |
| `--radius-2xl` | 16px | Large cards, sheets |
| `--radius-full` | 9999px | Avatars, pills, toggles |

## 2.5 Shadows

| Token | Value (Light) | Value (Dark) | Usage |
|-------|--------------|-------------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` | Cards at rest |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | `0 4px 6px -1px rgba(0,0,0,0.4)` | Cards on hover, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | `0 10px 15px -3px rgba(0,0,0,0.5)` | Modals, popovers |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | `0 20px 25px -5px rgba(0,0,0,0.6)` | Sheets, command palette |

## 2.6 Breakpoints

| Token | Width | Layout Changes |
|-------|-------|---------------|
| `sm` | 640px | Single column layouts, stack horizontal elements vertically, hamburger menu appears |
| `md` | 768px | Sidebar collapses to icon-only, chat citation panel hides (toggle button), data tables scroll horizontally |
| `lg` | 1024px | Sidebar shows expanded, two-column layouts appear (chat + citations), admin dashboard grid 2-up |
| `xl` | 1280px | Three-column layouts (sidebar + content + citations), admin grid 3-up, comfortable spacing |
| `2xl` | 1536px | Max content width applied, extra whitespace in margins, large data tables fully visible |

### Responsive Strategy

mobile-first approach ทุก component เขียน mobile layout ก่อน แล้ว progressive enhance ด้วย `md:`, `lg:`, `xl:` prefixes

## 2.7 Z-index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Normal flow content |
| `--z-dropdown` | 50 | Dropdown menus, popovers, command palette results |
| `--z-sticky` | 100 | Sticky header, sticky table headers |
| `--z-sidebar` | 150 | Sidebar (overlays content on mobile) |
| `--z-modal` | 200 | Modal dialogs, confirm dialogs |
| `--z-sheet` | 250 | Side sheets (citation panel on mobile) |
| `--z-toast` | 300 | Toast notifications |
| `--z-tooltip` | 400 | Tooltips (always on top) |
| `--z-command` | 500 | Command palette (highest priority) |

## 2.8 Motion Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-fast` | 150ms | `ease-out` | Button hover, icon rotation, badge appear |
| `--duration-normal` | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Modal open/close, sidebar expand, page transition |
| `--duration-slow` | 500ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Skeleton shimmer, chart animation, first load |

### Framer Motion Variants

```typescript
// src/utils/motion.ts

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
};

export const slideInRight = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { x: '100%', transition: { duration: 0.2 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};
```

## 2.9 Dark Mode Strategy

ใช้ CSS custom properties + Tailwind `dark:` prefix โดยมี strategy ดังนี้:

1. **Detection:** ตรวจ `prefers-color-scheme` media query เป็นค่า default
2. **Override:** user สามารถ toggle ได้ด้วย `ThemeToggle` component
3. **Persistence:** เก็บ preference ใน `localStorage` key `drivewiki-theme`
4. **Implementation:** ใส่ class `dark` ที่ `<html>` element
5. **Transition:** ใช้ `transition: background-color 0.3s, color 0.3s` ที่ body เพื่อให้เปลี่ยน theme ไม่กระตุก

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

---

# 3. Component Catalog

## 3.1 Layout Components

### 3.1.1 AppShell

**Filepath:** `src/components/layout/AppShell.tsx`
**Purpose:** Main application shell ที่ wrap ทุกหน้าใน authenticated area -- ประกอบด้วย Sidebar, Header, และ content area

```typescript
interface AppShellProps {
  children: React.ReactNode;
  /** ซ่อน sidebar (สำหรับ full-screen pages เช่น setup wizard) */
  hideSidebar?: boolean;
  /** ซ่อน header (สำหรับ immersive views) */
  hideHeader?: boolean;
  /** Variant ของ layout */
  variant?: 'default' | 'wide' | 'full';
}
```

**States:** idle (sidebar expanded), sidebar-collapsed, mobile-menu-open
**Variants:**
- `default` -- sidebar 256px + content max-width 1280px
- `wide` -- sidebar 256px + content max-width 1536px
- `full` -- sidebar 256px + content full-width (admin tables)
**Accessibility:** landmark regions (`<nav>`, `<main>`, `<header>`), skip-to-content link
**Responsive:**
- Mobile (<768px): sidebar hidden, hamburger menu in header, bottom nav bar
- Tablet (768-1024px): sidebar collapsed to 80px icons
- Desktop (>1024px): sidebar expanded to 256px

```tsx
// Example usage
<AppShell variant="default">
  <PageContainer>
    <h1>Chat</h1>
    <ChatPanel />
  </PageContainer>
</AppShell>
```

### 3.1.2 Sidebar

**Filepath:** `src/components/layout/Sidebar.tsx`
**Purpose:** Left navigation sidebar ที่มี nav items, department selector, user info, และ collapse toggle

```typescript
interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentPath: string;
  userRole: UserRole;
  departmentName: string;
}
```

**States:** expanded, collapsed, mobile-overlay
**Accessibility:** `role="navigation"`, `aria-label="Main navigation"`, keyboard navigable (`Tab`, `Enter`, `Space`)
**Responsive:**
- Mobile: overlay ที่เลื่อนจากซ้าย (Framer Motion slideInRight variant ในทิศกลับ), backdrop blur
- Tablet: collapsed mode (icon-only + tooltip)
- Desktop: expanded mode (icon + label)

### 3.1.3 Header

**Filepath:** `src/components/layout/Header.tsx`
**Purpose:** Top header bar ที่มี global search, language switcher, theme toggle, notifications, user menu

```typescript
interface HeaderProps {
  onMenuClick: () => void;
  showMenuButton: boolean; // true on mobile
}
```

**States:** idle, search-active (search bar expanded)
**Accessibility:** `role="banner"`, keyboard shortcut `Cmd/Ctrl+K` เปิด search
**Responsive:**
- Mobile: hamburger button + logo + user avatar
- Desktop: search bar + language + theme + user menu

### 3.1.4 PageContainer

**Filepath:** `src/components/layout/PageContainer.tsx`
**Purpose:** Content area wrapper ที่จัดการ max-width, padding, และ scroll behavior

```typescript
interface PageContainerProps {
  children: React.ReactNode;
  /** หัวข้อหน้า (สำหรับ breadcrumb + page title) */
  title?: string;
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[];
  /** Max width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** เพิ่ม padding ด้านบนสำหรับ sticky header compensation */
  withHeaderOffset?: boolean;
}
```

### 3.1.5 BreadcrumbNav

**Filepath:** `src/components/layout/BreadcrumbNav.tsx`
**Purpose:** Breadcrumb navigation ที่ auto-generate จาก route hierarchy

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}
```

**Accessibility:** `<nav aria-label="Breadcrumb">`, `aria-current="page"` สำหรับ item สุดท้าย

---

## 3.2 Navigation Components

### 3.2.1 NavItem

**Filepath:** `src/components/layout/Sidebar.tsx` (sub-component)
**Purpose:** Single navigation item ใน sidebar

```typescript
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  collapsed: boolean;
  badge?: number | string;
  /** Permission required to see this item */
  requiredRole?: UserRole;
}
```

**States:** idle, hover, active, disabled
**Accessibility:** `aria-current="page"` เมื่อ active, tooltip เมื่อ collapsed

### 3.2.2 NavGroup

**Filepath:** `src/components/layout/Sidebar.tsx` (sub-component)
**Purpose:** Group ของ nav items ที่มี label header (เช่น "Admin", "Wiki")

```typescript
interface NavGroupProps {
  label: string;
  children: React.ReactNode;
  collapsed: boolean;
  defaultOpen?: boolean;
}
```

### 3.2.3 UserMenu

**Filepath:** `src/components/layout/Header.tsx` (sub-component)
**Purpose:** Dropdown menu ที่แสดง user avatar, name, role, และ actions (profile, logout)

```typescript
interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatarUrl: string;
    role: UserRole;
    department: string;
  };
  onLogout: () => void;
  onProfile: () => void;
}
```

### 3.2.4 MobileNav

**Filepath:** `src/components/layout/MobileNav.tsx`
**Purpose:** Bottom navigation bar สำหรับ mobile -- แสดง 4-5 primary destinations

```typescript
interface MobileNavProps {
  currentPath: string;
  items: Array<{
    icon: LucideIcon;
    label: string;
    href: string;
  }>;
}
```

**Responsive:** แสดงเฉพาะ `< md` breakpoint

---

## 3.3 Data Display Components

### 3.3.1 MetricCard

**Filepath:** `src/components/common/MetricCard.tsx`
**Purpose:** Dashboard metric card ที่แสดงตัวเลขสำคัญพร้อม trend indicator

```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  /** ค่าเปรียบเทียบ period ก่อน */
  previousValue?: number;
  /** Format type */
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  /** Icon ด้านซ้ายของ title */
  icon?: LucideIcon;
  /** สี accent */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  /** Loading state */
  isLoading?: boolean;
}
```

**States:** idle, loading (skeleton), hover (slight shadow elevation)
**Variants:** 5 color variants ตาม semantic meaning

```tsx
<MetricCard
  title="Active Users"
  value={342}
  previousValue={298}
  format="number"
  icon={Users}
  variant="primary"
/>
```

### 3.3.2 DataTable

**Filepath:** `src/components/common/DataTable.tsx`
**Purpose:** Generic data table ที่ sortable, filterable, paginated พร้อม virtual scrolling สำหรับ large datasets

```typescript
interface Column<T> {
  id: string;
  header: string | (() => React.ReactNode);
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  /** Sticky column (ซ้ายสุด) */
  sticky?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Unique key extractor */
  getRowId: (row: T) => string;
  /** เปิดใช้ sorting */
  sortable?: boolean;
  /** Current sort state */
  sorting?: { id: string; desc: boolean }[];
  onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;
  /** Pagination */
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  /** Row selection */
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state */
  emptyMessage?: string;
  /** เปิดใช้ virtual scrolling (สำหรับ data > 100 rows) */
  virtual?: boolean;
  /** Row click handler */
  onRowClick?: (row: T) => void;
}
```

**States:** idle, loading (skeleton rows), empty, error
**Accessibility:** `role="table"`, `aria-sort` สำหรับ sortable columns, keyboard navigable rows
**Responsive:** horizontal scroll บน mobile พร้อม sticky first column

### 3.3.3 PageCard

**Filepath:** `src/components/common/PageCard.tsx`
**Purpose:** Preview card ของ wiki page -- แสดง title, type badge, summary, source count, last updated

```typescript
interface PageCardProps {
  page: {
    id: string;
    title: string;
    type: 'entity' | 'concept' | 'summary';
    summary: string;
    sourceCount: number;
    updatedAt: string;
    departmentName?: string;
  };
  onClick: (id: string) => void;
  /** Compact mode สำหรับ list view */
  compact?: boolean;
  /** Highlight search terms */
  highlightTerms?: string[];
}
```

**States:** idle, hover (shadow + translateY(-2px)), active (click feedback)
**Variants:** compact (single line) / full (card with summary)

### 3.3.4 WikiRenderer

**Filepath:** `src/components/wiki/WikiPageView.tsx` (sub-component via MarkdownRenderer)
**Purpose:** Render wiki page markdown content ด้วย custom styling, syntax highlighting, และ interactive elements

```typescript
interface WikiRendererProps {
  content: string;
  /** Enable cross-reference link resolution */
  resolveLinks?: boolean;
  /** Callback เมื่อ click wiki link */
  onWikiLinkClick?: (pageId: string) => void;
  /** Callback เมื่อ click citation */
  onCitationClick?: (citationId: string) => void;
  /** Maximum height ก่อน scroll (0 = no limit) */
  maxHeight?: number;
}
```

### 3.3.5 CitationLink

**Filepath:** `src/components/common/CitationLink.tsx`
**Purpose:** Inline citation reference [1] ที่ hover แล้วแสดง tooltip ของ source detail

```typescript
interface CitationLinkProps {
  index: number;
  citation: {
    pageId: string;
    pageTitle: string;
    pageType: 'entity' | 'concept' | 'summary';
    relevantExcerpt?: string;
  };
  onClick: (pageId: string) => void;
}
```

**Accessibility:** `role="link"`, `aria-label="Citation {index}: {pageTitle}"`

### 3.3.6 ConfidenceBadge

**Filepath:** `src/components/common/ConfidenceBadge.tsx`
**Purpose:** แสดงระดับ confidence ของคำตอบหรือ wiki page quality

```typescript
interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
  /** แสดง tooltip อธิบาย criteria */
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}
```

**States:** high (green), medium (yellow), low (red)

### 3.3.7 HealthIndicator

**Filepath:** `src/components/common/HealthIndicator.tsx`
**Purpose:** Status dot ที่แสดง system/department health

```typescript
interface HealthIndicatorProps {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  label?: string;
  /** Pulse animation สำหรับ real-time status */
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

### 3.3.8 Timeline

**Filepath:** `src/components/common/Timeline.tsx`
**Purpose:** Activity timeline ที่แสดงเหตุการณ์ตามลำดับเวลา (ingestion events, audit trail)

```typescript
interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

interface TimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
  /** Max events to show (แสดง "show more" button) */
  maxVisible?: number;
}
```

---

## 3.4 Chat Components

### 3.4.1 ChatPanel

**Filepath:** `src/components/chat/ChatPanel.tsx`
**Purpose:** Full chat interface container ที่รวม message list, input, citations, และ session management

```typescript
interface ChatPanelProps {
  sessionId?: string;
  /** Show citation panel ด้านขวา */
  showCitations?: boolean;
  /** Callback เมื่อสร้าง session ใหม่ */
  onNewSession?: (sessionId: string) => void;
}
```

**States:** empty (welcome + suggested queries), active (messages), loading (streaming), error (connection lost)
**Responsive:**
- Mobile: full-width, citations เป็น bottom sheet
- Desktop: content + citation panel side-by-side

### 3.4.2 MessageBubble

**Filepath:** `src/components/chat/MessageBubble.tsx`
**Purpose:** Individual message bubble สำหรับ user หรือ assistant message

```typescript
interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
    createdAt: string;
    isStreaming?: boolean;
    feedback?: 'helpful' | 'not_helpful' | null;
  };
  onCitationClick?: (citation: Citation) => void;
  onFeedback?: (messageId: string, feedback: 'helpful' | 'not_helpful') => void;
  /** แสดง copy button */
  showCopy?: boolean;
}
```

**States:** idle, streaming (typing indicator + token-by-token), sent, error
**Variants:** user (right-aligned, blue tint) / assistant (left-aligned, white/dark bg)
**Accessibility:** `role="log"`, `aria-live="polite"` สำหรับ new messages

```tsx
<MessageBubble
  message={{
    id: 'msg-1',
    role: 'assistant',
    content: 'นโยบายการลาพักร้อนปี 2026 มีการเปลี่ยนแปลง...',
    citations: [{ pageId: 'wiki-123', pageTitle: 'นโยบายการลา', pageType: 'concept' }],
    createdAt: '2026-04-17T10:30:00Z',
    isStreaming: false,
    feedback: null,
  }}
  onCitationClick={(c) => navigate(`/wiki/${c.pageId}`)}
  onFeedback={handleFeedback}
  showCopy
/>
```

### 3.4.3 ChatInput

**Filepath:** `src/components/chat/ChatInput.tsx`
**Purpose:** Chat input area พร้อม send button, keyboard shortcuts, และ character counter

```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  /** Max character limit */
  maxLength?: number;
  /** กำลัง stream อยู่ -- แสดง stop button แทน send */
  isStreaming?: boolean;
  onStopStream?: () => void;
}
```

**States:** idle, typing, disabled (while streaming), error
**Accessibility:** `role="textbox"`, `aria-label="Chat message input"`, `Enter` to send, `Shift+Enter` for newline

### 3.4.4 StreamingText

**Filepath:** `src/components/chat/StreamingText.tsx`
**Purpose:** แสดง text ที่กำลัง stream เข้ามาทีละ token พร้อม cursor animation

```typescript
interface StreamingTextProps {
  /** Current accumulated text */
  text: string;
  /** Stream ยังไม่จบ */
  isStreaming: boolean;
  /** Render as markdown */
  asMarkdown?: boolean;
}
```

**Implementation Note:** ใช้ `requestAnimationFrame` เพื่อ batch DOM updates ป้องกัน excessive re-renders

### 3.4.5 SuggestedQueries

**Filepath:** `src/components/chat/SuggestedQueries.tsx`
**Purpose:** แสดง suggested/example queries เป็น clickable chips ใน empty chat state

```typescript
interface SuggestedQueriesProps {
  queries: string[];
  onSelect: (query: string) => void;
  isLoading?: boolean;
}
```

### 3.4.6 CitationPanel

**Filepath:** `src/components/chat/CitationPanel.tsx`
**Purpose:** Side panel ที่แสดง cited wiki pages พร้อม relevant excerpts

```typescript
interface CitationPanelProps {
  citations: Citation[];
  activeCitationId?: string;
  onClose: () => void;
  onPageNavigate: (pageId: string) => void;
}
```

**States:** empty, populated, loading
**Responsive:** side panel (desktop) / bottom sheet (mobile)

---

## 3.5 Wiki Components

### 3.5.1 WikiPageView

**Filepath:** `src/components/wiki/WikiPageView.tsx`
**Purpose:** Full wiki page view ที่แสดง markdown content, metadata, source references, และ cross-reference sidebar

```typescript
interface WikiPageViewProps {
  page: WikiPage;
  /** แสดง cross-reference sidebar */
  showCrossRefs?: boolean;
  /** แสดง version history link */
  showHistory?: boolean;
  onCrossRefClick?: (pageId: string) => void;
  onSourceClick?: (docId: string) => void;
}
```

**States:** loading (skeleton), loaded, error (page not found)
**Responsive:** content 100% width mobile, content + cross-ref sidebar desktop

### 3.5.2 WikiIndex

**Filepath:** `src/components/wiki/WikiIndex.tsx`
**Purpose:** Wiki index/browse page ที่แสดง filterable, sortable list ของ wiki pages พร้อม virtual scrolling

```typescript
interface WikiIndexProps {
  pages: WikiPage[];
  totalCount: number;
  filters: WikiFilters;
  onFilterChange: (filters: WikiFilters) => void;
  onPageClick: (pageId: string) => void;
  isLoading?: boolean;
  /** View mode */
  viewMode?: 'grid' | 'list';
}

interface WikiFilters {
  type?: 'entity' | 'concept' | 'summary' | 'all';
  departmentId?: string;
  searchQuery?: string;
  sortBy?: 'title' | 'updatedAt' | 'sourceCount';
  sortOrder?: 'asc' | 'desc';
}
```

### 3.5.3 CrossRefSidebar

**Filepath:** `src/components/wiki/CrossRefSidebar.tsx`
**Purpose:** Sidebar ที่แสดง cross-references ของ wiki page ปัจจุบัน -- ทั้ง incoming และ outgoing links

```typescript
interface CrossRefSidebarProps {
  pageId: string;
  crossRefs: {
    incoming: Array<{ pageId: string; title: string; type: string; relationship: string }>;
    outgoing: Array<{ pageId: string; title: string; type: string; relationship: string }>;
  };
  onNavigate: (pageId: string) => void;
}
```

### 3.5.4 PageVersionDiff

**Filepath:** `src/components/wiki/PageVersionDiff.tsx`
**Purpose:** Side-by-side diff ของ wiki page versions -- แสดงสิ่งที่ LLM Agent เปลี่ยนแปลง

```typescript
interface PageVersionDiffProps {
  oldVersion: { version: number; content: string; updatedAt: string };
  newVersion: { version: number; content: string; updatedAt: string };
  /** Diff display mode */
  mode?: 'unified' | 'split';
}
```

### 3.5.5 WikiSearch

**Filepath:** `src/components/wiki/WikiSearch.tsx`
**Purpose:** Wiki-specific search ที่มี filters (type, department, date range) และ highlight matched terms

```typescript
interface WikiSearchProps {
  initialQuery?: string;
  onResultClick: (pageId: string) => void;
}
```

**States:** idle, searching (skeleton), results, no-results (empty state)

---

## 3.6 Form Components

### 3.6.1 SearchBar

**Filepath:** `src/components/common/SearchBar.tsx`
**Purpose:** Global search bar (command palette style) ที่ search ทั้ง wiki pages, chat sessions, และ admin items

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  /** Recent searches */
  recentSearches?: string[];
  /** Search results preview */
  results?: SearchResult[];
  isSearching?: boolean;
  /** Keyboard shortcut to activate (default: Cmd/Ctrl+K) */
  shortcut?: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'wiki' | 'chat' | 'user' | 'department';
  description?: string;
  href: string;
}
```

**Accessibility:** `role="combobox"`, `aria-expanded`, `aria-activedescendant` สำหรับ result navigation

### 3.6.2 FilterPanel

**Filepath:** `src/components/common/FilterPanel.tsx`
**Purpose:** Multi-filter panel ที่ใช้ใน wiki index, audit logs, cost dashboard

```typescript
interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multi-select' | 'date-range' | 'search' | 'toggle';
  options?: Array<{ label: string; value: string }>;
  defaultValue?: unknown;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onReset: () => void;
  /** Collapsible on mobile */
  collapsible?: boolean;
}
```

### 3.6.3 ContentPolicyEditor

**Filepath:** `src/components/admin/ContentPolicyEditor.tsx` (feature component)
**Purpose:** Form สำหรับ admin/dept head แก้ไข content ingestion policies

```typescript
interface ContentPolicyEditorProps {
  departmentId: string;
  policies: ContentPolicy;
  onSave: (policies: ContentPolicy) => void;
  isSaving?: boolean;
}

interface ContentPolicy {
  excludePatterns: string[];       // Glob patterns สำหรับ exclude files
  maxFileSize: number;             // Max file size in MB
  allowedMimeTypes: string[];      // Allowed MIME types
  sensitiveKeywords: string[];     // Keywords ที่ห้าม ingest
  retentionDays: number;           // Data retention period
  autoApprove: boolean;            // Auto-approve wiki page creation
}
```

### 3.6.4 DriveFolderPicker

**Filepath:** `src/components/drive/DriveFolderPicker.tsx`
**Purpose:** Tree picker สำหรับเลือก Google Drive folders ที่จะ monitor สำหรับ department

```typescript
interface DriveFolderPickerProps {
  /** Currently selected folder IDs */
  selectedFolders: string[];
  onSelectionChange: (folderIds: string[]) => void;
  /** Disable selection (read-only view) */
  disabled?: boolean;
  /** Max selectable folders */
  maxSelection?: number;
}
```

**States:** loading (tree skeleton), loaded, error (Drive API failure), empty (no accessible folders)

### 3.6.5 SettingsForm

**Filepath:** `src/components/common/SettingsForm.tsx`
**Purpose:** Generic settings form layout ที่ใช้สำหรับ user profile, department settings, workspace settings

```typescript
interface SettingsSection {
  title: string;
  description?: string;
  fields: React.ReactNode;
}

interface SettingsFormProps {
  sections: SettingsSection[];
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
  isSaving: boolean;
}
```

---

## 3.7 Feedback Components

### 3.7.1 Toast

**Filepath:** `src/components/common/Toast.tsx`
**Purpose:** Toast notification ที่แสดงสถานะ success/error/warning/info มุมขวาบน

```typescript
interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  /** Duration in ms (0 = persistent) */
  duration?: number;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: (id: string) => void;
}
```

**Implementation:** ใช้ Framer Motion `AnimatePresence` สำหรับ enter/exit animation (slide in from right)
**Accessibility:** `role="alert"`, `aria-live="assertive"` สำหรับ error, `aria-live="polite"` สำหรับ info/success

### 3.7.2 EmptyState

**Filepath:** `src/components/common/EmptyState.tsx`
**Purpose:** Empty state illustration + message + call-to-action

```typescript
interface EmptyStateProps {
  /** Illustration asset */
  illustration?: 'chat' | 'wiki' | 'search' | 'generic';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
}
```

### 3.7.3 ErrorBoundary

**Filepath:** `src/components/common/ErrorBoundary.tsx`
**Purpose:** React error boundary ที่ catch unhandled errors และแสดง fallback UI พร้อม retry option

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback UI */
  fallback?: React.ReactNode;
  /** Callback เมื่อเกิด error */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Granularity level */
  level?: 'page' | 'section' | 'component';
}
```

**Implementation:** class component (React requirement สำหรับ error boundaries) ที่ wrap ด้วย functional wrapper

### 3.7.4 LoadingSkeleton

**Filepath:** `src/components/common/LoadingSkeleton.tsx`
**Purpose:** Loading skeleton ที่มี shimmer animation -- มีหลาย preset layouts

```typescript
interface LoadingSkeletonProps {
  /** Preset layout */
  variant: 'card' | 'table-row' | 'page' | 'chat-message' | 'wiki-page' | 'metric-card' | 'inline';
  /** จำนวน skeleton items */
  count?: number;
  /** Custom width */
  width?: string;
  /** Custom height */
  height?: string;
}
```

### 3.7.5 ConfirmDialog

**Filepath:** `src/components/common/ConfirmDialog.tsx`
**Purpose:** Confirmation dialog สำหรับ destructive actions (delete, disconnect, reset)

```typescript
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Destructive mode (red confirm button) */
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isConfirming?: boolean;
}
```

**Accessibility:** focus trap, `Escape` to cancel, `role="alertdialog"`

---

## 3.8 Admin Components

### 3.8.1 CostChart

**Filepath:** `src/components/admin/CostChart.tsx`
**Purpose:** Cost visualization chart ที่แสดง cost trend ตามช่วงเวลาและ breakdown ตาม department/type

```typescript
interface CostChartProps {
  data: Array<{
    date: string;
    totalCost: number;
    breakdown: Record<string, number>;
  }>;
  /** Chart type */
  chartType?: 'line' | 'bar' | 'stacked-bar';
  /** Date range */
  dateRange: { start: string; end: string };
  /** Group by */
  groupBy?: 'department' | 'eventType' | 'user';
  isLoading?: boolean;
}
```

**Implementation:** ใช้ Recharts `<ResponsiveContainer>`, `<LineChart>`, `<BarChart>` พร้อม custom tooltip

### 3.8.2 AuditLogTable

**Filepath:** `src/components/admin/AuditLogTable.tsx`
**Purpose:** Audit log data table ที่แสดง action, user, resource, timestamp, HMAC integrity status

```typescript
interface AuditLogTableProps {
  logs: AuditLog[];
  totalCount: number;
  filters: AuditFilters;
  onFilterChange: (filters: AuditFilters) => void;
  pagination: { page: number; pageSize: number };
  onPaginationChange: (page: number, pageSize: number) => void;
  isLoading?: boolean;
  onExport?: () => void;
}

interface AuditFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  dateRange?: { start: string; end: string };
  integrityStatus?: 'verified' | 'failed' | 'all';
}
```

### 3.8.3 LintReportCard

**Filepath:** `src/components/admin/LintReportCard.tsx`
**Purpose:** Card สำหรับแสดง lint report summary -- contradictions, stale pages, orphans

```typescript
interface LintReportCardProps {
  report: {
    id: string;
    departmentName: string;
    runAt: string;
    contradictions: number;
    stalePages: number;
    orphanPages: number;
    missingCrossRefs: number;
    overallScore: number; // 0-100
  };
  onClick: (reportId: string) => void;
}
```

### 3.8.4 IngestionProgress

**Filepath:** `src/components/admin/IngestionProgress.tsx`
**Purpose:** Real-time ingestion progress indicator ที่ใช้ SSE เพื่อ update สถานะ

```typescript
interface IngestionProgressProps {
  departmentId: string;
  /** Progress data (from SSE) */
  progress: {
    status: 'idle' | 'scanning' | 'ingesting' | 'compiling' | 'indexing' | 'complete' | 'error';
    totalDocuments: number;
    processedDocuments: number;
    currentDocument?: string;
    errors: Array<{ document: string; error: string }>;
    startedAt?: string;
    estimatedCompletionAt?: string;
  };
  onRetry?: () => void;
  onPause?: () => void;
}
```

**States:** idle, scanning, ingesting (with progress bar), complete (success), error (with retry)

---

# 4. Page Specifications

## 4.1 Login Page

**Route:** `/login`
**Auth Guard:** public (redirect to `/chat` if already authenticated)
**Layout:** none (standalone page, no AppShell)

**Data Requirements:**
- ไม่มี -- static page

**State Management:**
- `authStore.loginWithGoogle()` -- trigger OAuth flow

**Components Used:**
- LoginButton, LanguageSwitcher, ThemeToggle

**Responsive:**
- Mobile: logo + login button centered, full-width button
- Desktop: split layout -- left side illustration/branding, right side login form

**Loading State:** button shows spinner after click (waiting for Google redirect)
**Error State:** toast notification if OAuth fails, retry button
**Empty State:** N/A
**SEO:** `<title>Login | DriveWiki</title>`

```
ASCII Wireframe:
+--------------------------------------------------+
|                                                    |
|   +--------------------+  +--------------------+  |
|   |                    |  |                    |  |
|   |   [DriveWiki Logo] |  |   [Language: TH/EN]|  |
|   |                    |  |   [Theme: Light/Dark]|  |
|   |   "สมองรวมของ       |  |                    |  |
|   |    องค์กรคุณ"        |  |   [Google Logo]    |  |
|   |                    |  |   [Login with       |  |
|   |   [Illustration]   |  |    Google Workspace]|  |
|   |                    |  |                    |  |
|   |                    |  |   "Enterprise       |  |
|   |                    |  |    accounts only"   |  |
|   +--------------------+  +--------------------+  |
|                                                    |
|   [Footer: Privacy | Terms | (c) 2026]             |
+--------------------------------------------------+
```

## 4.2 PDPA Consent Page

**Route:** `/consent`
**Auth Guard:** authenticated + consent not yet given
**Layout:** none (standalone, centered card)

**Data Requirements:**
- `useConsent()` -- check consent status

**State Management:**
- `authStore.giveConsent()` -- record consent

**Components Used:**
- ConsentForm, Button

**Responsive:**
- Centered card, max-width 640px, full-width on mobile

**Loading State:** skeleton for consent text
**Error State:** toast if consent submission fails
**Empty State:** N/A
**SEO:** `<title>Data Privacy Consent | DriveWiki</title>`

```
ASCII Wireframe:
+--------------------------------------------------+
|                                                    |
|   +------------------------------------------+    |
|   |        [DriveWiki Logo]                  |    |
|   |                                          |    |
|   |  นโยบายการคุ้มครองข้อมูลส่วนบุคคล (PDPA)     |    |
|   |  ----------------------------------------|    |
|   |                                          |    |
|   |  [Scrollable consent text area]          |    |
|   |  - ข้อมูลที่เราเก็บ                        |    |
|   |  - วัตถุประสงค์ในการใช้                     |    |
|   |  - สิทธิของคุณ                             |    |
|   |  - การติดต่อ DPO                          |    |
|   |                                          |    |
|   |  [x] ข้าพเจ้ายอมรับนโยบายฯ                  |    |
|   |  [x] ข้าพเจ้ายินยอมให้ประมวลผลข้อมูล          |    |
|   |                                          |    |
|   |  [ยอมรับและเข้าใช้งาน]  [ปฏิเสธ (logout)]    |    |
|   +------------------------------------------+    |
|                                                    |
+--------------------------------------------------+
```

## 4.3 Setup Wizard

**Route:** `/setup`
**Auth Guard:** admin (superadmin only) + first-time setup
**Layout:** none (standalone wizard)

**Data Requirements:**
- `useDriveFolders()` -- list Drive folders for connection
- `useDepartments()` -- created departments

**State Management:**
- `adminStore.setupStep` -- current wizard step (1-5)

**Components Used:**
- DriveFolderPicker, DepartmentForm, SettingsForm, Button, Progress

**Responsive:**
- Centered card max-width 768px, step indicator at top
- Mobile: vertical step indicator

**Loading State:** skeleton for Drive folder tree
**Error State:** per-step error with retry
**Empty State:** N/A
**SEO:** `<title>Setup Wizard | DriveWiki</title>`

```
ASCII Wireframe:
+--------------------------------------------------+
|  [DriveWiki Logo]            [Step 1/5: Organization]|
|                                                    |
|  [1]--[2]--[3]--[4]--[5]  (progress steps)       |
|   Org  Dept Drive Schema Review                    |
|                                                    |
|  +------------------------------------------+     |
|  |  Step 1: Organization Setup               |     |
|  |                                          |     |
|  |  Organization Name: [________________]   |     |
|  |  Google Domain:     [________________]   |     |
|  |  Primary Language:  [TH v]               |     |
|  |  Data Region:       [asia-southeast1 v]  |     |
|  |                                          |     |
|  |  [Back]                    [Next Step ->]|     |
|  +------------------------------------------+     |
+--------------------------------------------------+
```

## 4.4 Chat Page (Main)

**Route:** `/chat`
**Auth Guard:** member+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useChatSession(sessionId)` -- current chat session + messages
- `useChatHistory()` -- list of past sessions (sidebar)
- `useStreamResponse()` -- SSE streaming hook
- `useSuggestedQueries()` -- suggested queries for empty state

**State Management:**
- `chatStore` -- active session, message queue, streaming status
- URL state: `?session=<id>` for deep linking

**Components Used:**
- ChatPanel, MessageBubble, ChatInput, StreamingText, SuggestedQueries, CitationPanel, LoadingSkeleton, EmptyState

**Responsive:**
- Mobile: full-width chat, citation panel as bottom sheet (swipe up)
- Tablet: chat full-width, citation panel toggle button
- Desktop: chat (70%) + citation panel (30%)

**Loading State:** skeleton message bubbles (3 items)
**Error State:** "ไม่สามารถเชื่อมต่อได้ -- กรุณาลองใหม่" with retry button
**Empty State:** welcome message + 4 suggested queries + recent sessions
**SEO:** `<title>Chat | DriveWiki</title>`

```
ASCII Wireframe (Desktop):
+--------------------------------------------------+
| [=] DriveWiki    [Search Cmd+K]  [TH] [D] [Avatar]|
+------+-------------------------------------------+
| SIDE | CHAT                      | CITATIONS     |
| BAR  |                           |               |
|      | [Welcome to DriveWiki]    | [Citation 1]  |
| Chat | [สมองรวมขององค์กรคุณ]       | Wiki: นโยบาย  |
| Wiki |                           | การลา          |
| Dash | [Suggested:]              | [excerpt...]  |
|      | [นโยบายการลา?]             |               |
| ---  | [IT spec ล่าสุด?]          | [Citation 2]  |
| Admin| [สรุป Q1 2026?]            | Wiki: สรุป Q1 |
|      | [Onboarding guide?]       | [excerpt...]  |
|      |                           |               |
|      | User: นโยบายการลา 2026?    |               |
|      |                           |               |
|      | Bot: นโยบายการลาพักร้อน     |               |
|      | ปี 2026 มีการเปลี่ยนแปลง    |               |
|      | สำคัญ [1][2]...           |               |
|      |                           |               |
|      | [_____________________]   |               |
|      | [         Send       ->]   |               |
+------+-------------------------------------------+
```

## 4.5 Wiki Browse Page

**Route:** `/wiki`
**Auth Guard:** member+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useWikiIndex({ filters, pagination })` -- paginated wiki page list
- Query key: `['wiki', 'index', filters, page]`

**State Management:**
- `wikiStore` -- active filters, view mode, sort
- URL state: `?type=entity&sort=updatedAt&q=search`

**Components Used:**
- WikiIndex, PageCard, FilterPanel, SearchBar, LoadingSkeleton, EmptyState, DataTable (list view)

**Responsive:**
- Mobile: single column, compact PageCards
- Tablet: 2-column grid
- Desktop: 3-column grid or table view

**Loading State:** grid of 6 skeleton cards
**Error State:** error message with retry
**Empty State:** "ยังไม่มี wiki pages -- เริ่มต้นด้วยการเชื่อมต่อ Google Drive" + CTA to setup
**SEO:** `<title>Wiki | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Wiki Knowledge Base                        |
| BAR  |                                           |
|      | [Search wiki pages...     ] [Grid|List]   |
|      | [Type: All v] [Dept: All v] [Sort: Recent v]|
|      |                                           |
|      | +----------+ +----------+ +----------+   |
|      | | Entity   | | Concept  | | Summary  |   |
|      | | --------  | | --------  | | --------  |   |
|      | | Page      | | นโยบาย    | | สรุป Q1   |   |
|      | | Title     | | การลา     | | 2026     |   |
|      | | [summary] | | [summary] | | [summary] |   |
|      | | 3 sources | | 5 sources | | 8 sources |   |
|      | | 2h ago    | | 1d ago   | | 3d ago   |   |
|      | +----------+ +----------+ +----------+   |
|      |                                           |
|      | +----------+ +----------+ +----------+   |
|      | | ...       | | ...       | | ...       |   |
|      | +----------+ +----------+ +----------+   |
|      |                                           |
|      | [< 1  2  3  4  5 ... 12 >]               |
+------+-------------------------------------------+
```

## 4.6 Wiki Page Detail

**Route:** `/wiki/$pageId`
**Auth Guard:** member+ (department-scoped)
**Layout:** AppShell (variant: wide)

**Data Requirements:**
- `useWikiPage(pageId)` -- page content + metadata
- `useCrossRefs(pageId)` -- cross-references
- `usePageHistory(pageId)` -- version history (lazy load)
- Query key: `['wiki', 'page', pageId]`

**State Management:**
- URL state: pageId from route param

**Components Used:**
- WikiPageView, CrossRefSidebar, MarkdownRenderer, CitationLink, PageMetadata, BreadcrumbNav, LoadingSkeleton

**Responsive:**
- Mobile: full-width content, cross-refs collapsed (accordion)
- Desktop: content (70%) + cross-ref sidebar (30%)

**Loading State:** wiki page skeleton (title + paragraphs + sidebar)
**Error State:** "Wiki page ไม่พบ" or "คุณไม่มีสิทธิ์เข้าถึง" (403)
**Empty State:** N/A (404 instead)
**SEO:** `<title>{page.title} | Wiki | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Wiki > นโยบายการลาพักร้อน                      |
| BAR  |                                           |
|      | [Entity] นโยบายการลาพักร้อน           [v3]  |
|      | Last updated: 2 hours ago | 3 sources    |
|      | +--------------------------+ +-----------+|
|      | |                          | | Cross Refs||
|      | | ## สิทธิการลา            | |           ||
|      | |                          | | Incoming: ||
|      | | พนักงานที่ผ่านทดลองงาน     | | - นโยบาย  ||
|      | | มีสิทธิลาพักร้อน 10       | |   HR      ||
|      | | วัน/ปี [1]               | | - คู่มือ    ||
|      | |                          | |   พนักงาน  ||
|      | | ## การเปลี่ยนแปลง 2026    | |           ||
|      | |                          | | Outgoing: ||
|      | | - เพิ่มวันลาเป็น 12 วัน    | | - แบบฟอร์ม ||
|      | |   (จากเดิม 10 วัน) [2]    | |   ลา      ||
|      | | - เพิ่ม remote work day   | | - ระบบ    ||
|      | |                          | |   บัญชี    ||
|      | | ## Sources               | |           ||
|      | | [Doc: HR-Policy-2026.docx]| | [History] ||
|      | +--------------------------+ +-----------+|
+------+-------------------------------------------+
```

## 4.7 Wiki Search Page

**Route:** `/wiki/search`
**Auth Guard:** member+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useWikiSearch(query, filters)` -- search results with highlights
- Query key: `['wiki', 'search', query, filters]`

**State Management:**
- URL state: `?q=query&type=entity&dept=all`

**Components Used:**
- WikiSearch, SearchBar, FilterPanel, PageCard, LoadingSkeleton, EmptyState

**Responsive:**
- Mobile: stacked results, filters in collapsible panel
- Desktop: side filter panel + results list

**Loading State:** 5 skeleton result cards
**Error State:** "การค้นหาล้มเหลว" with retry
**Empty State:** "ไม่พบผลลัพธ์สำหรับ '{query}'" + suggestion to refine
**SEO:** `<title>Search: {query} | Wiki | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Wiki Search                                |
| BAR  |                                           |
|      | [______นโยบายการลา____________] [Search]    |
|      |                                           |
|      | Filters:                   Results (12):   |
|      | [Type: All   v]            +-------------+ |
|      | [Dept: HR    v]            | [Entity]    | |
|      | [Date: Any   v]            | นโยบาย<hl>   | |
|      |                           | การลา</hl>   | |
|      | [Reset Filters]            | ...excerpt  | |
|      |                           +-------------+ |
|      |                           +-------------+ |
|      |                           | [Concept]   | |
|      |                           | สิทธิ<hl>    | |
|      |                           | การลา</hl>   | |
|      |                           | ...excerpt  | |
|      |                           +-------------+ |
+------+-------------------------------------------+
```

## 4.8 Department Dashboard

**Route:** `/dashboard`
**Auth Guard:** member+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useAdminOverview(departmentId)` -- department overview
- `useCostData(departmentId, dateRange)` -- cost data
- Query key: `['dashboard', departmentId]`

**State Management:**
- `uiStore.dashboardDateRange` -- selected date range
- URL state: `?range=30d`

**Components Used:**
- MetricCard, CostChart, Timeline, HealthIndicator, PageCard (recent pages), LoadingSkeleton

**Responsive:**
- Mobile: single column, stacked metric cards
- Tablet: 2-column metric grid
- Desktop: 4-column metric grid + charts

**Loading State:** skeleton metric cards (4) + chart placeholder
**Error State:** per-card error with retry
**Empty State:** "ยังไม่มีข้อมูล -- กำลังรอ initial ingestion" with progress
**SEO:** `<title>Dashboard | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Department Dashboard: ฝ่ายบุคคล              |
| BAR  |                                           |
|      | +--------+ +--------+ +--------+ +------+ |
|      | | Wiki   | | Active | | Queries| | Cost | |
|      | | Pages  | | Users  | | Today  | | MTD  | |
|      | | 1,234  | | 89     | | 342    | | $234 | |
|      | | +12%   | | +5%    | | -3%    | | +8%  | |
|      | +--------+ +--------+ +--------+ +------+ |
|      |                                           |
|      | +------------------+ +-----------------+  |
|      | | Cost Trend (30d) | | Recent Activity |  |
|      | | [Line Chart]     | | - Page updated  |  |
|      | |                  | | - Doc ingested  |  |
|      | |                  | | - Query answered|  |
|      | +------------------+ +-----------------+  |
|      |                                           |
|      | Recent Wiki Pages:                         |
|      | +----------+ +----------+ +----------+   |
|      | | Page 1   | | Page 2   | | Page 3   |   |
|      | +----------+ +----------+ +----------+   |
+------+-------------------------------------------+
```

## 4.9 Admin Dashboard

**Route:** `/admin`
**Auth Guard:** admin+
**Layout:** AppShell (variant: wide)

**Data Requirements:**
- `useAdminOverview()` -- system-wide overview
- Query key: `['admin', 'overview']`

**State Management:**
- `adminStore.activeTab`

**Components Used:**
- MetricCard, HealthIndicator, CostChart, Timeline, DataTable

**Responsive:**
- Mobile: stacked metrics, scrollable tables
- Desktop: 4-column grid + charts + tables

**Loading State:** full page skeleton
**Error State:** per-section error
**Empty State:** N/A (admin always has system data)
**SEO:** `<title>Admin Dashboard | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin Dashboard                            |
| BAR  | [System Health: (green) Healthy]           |
|      |                                           |
| Admin| +--------+ +--------+ +--------+ +------+ |
| -Dash| | Total  | | Total  | | Total  | | Total| |
| -User| | Users  | | Depts  | | Wiki Pg| | Cost | |
| -Dept| | 1,234  | | 12     | | 45,678 | |$2.3k | |
| -Driv| +--------+ +--------+ +--------+ +------+ |
| -Poli|                                           |
| -Inge| +------------------+ +-----------------+  |
| -Cost| | Ingestion Status | | Cost by Dept    |  |
| -Audi| | [Stacked Bar]    | | [Pie Chart]     |  |
| -Lint| +------------------+ +-----------------+  |
|      |                                           |
|      | Departments Overview:                      |
|      | +------+--------+-------+------+--------+ |
|      | | Name | Users  | Pages | Cost | Health | |
|      | +------+--------+-------+------+--------+ |
|      | | HR   | 45     | 1234  | $345 | Green  | |
|      | | IT   | 89     | 5678  | $890 | Yellow | |
|      | +------+--------+-------+------+--------+ |
+------+-------------------------------------------+
```

## 4.10 User Management

**Route:** `/admin/users`
**Auth Guard:** admin+
**Layout:** AppShell (variant: full)

**Data Requirements:**
- `useUserManagement({ search, department, role, page })` -- paginated user list
- Query key: `['admin', 'users', filters, page]`

**State Management:**
- URL state: `?q=search&dept=all&role=all&page=1`

**Components Used:**
- DataTable, FilterPanel, SearchBar, UserRoleEditor, ConfirmDialog, Toast

**Responsive:**
- Mobile: card list view instead of table
- Desktop: full table with all columns

**Loading State:** table skeleton (10 rows)
**Error State:** table error with retry
**Empty State:** "ไม่พบผู้ใช้" (filtered) or "ยังไม่มีผู้ใช้ในระบบ"
**SEO:** `<title>User Management | Admin | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin > User Management                    |
| BAR  |                                           |
|      | [Search users...    ] [Dept: All v] [Role v]|
|      |                                           |
|      | +------+----------+--------+------+------+|
|      | | [x]  | Name     | Email  | Dept | Role ||
|      | +------+----------+--------+------+------+|
|      | | [ ]  | สมชาย    | som@.. | HR   | Admin||
|      | | [ ]  | สมหญิง    | somyi  | IT   | Memb ||
|      | | [ ]  | John     | john@  | Fin  | Dept ||
|      | +------+----------+--------+------+------+|
|      |                                           |
|      | [< 1 2 3 ... 10 >]    Selected: 0         |
|      |                       [Change Role] [Del] |
+------+-------------------------------------------+
```

## 4.11 Department Management

**Route:** `/admin/departments`
**Auth Guard:** admin+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useDepartments()` -- department list
- Query key: `['admin', 'departments']`

**State Management:**
- `adminStore.editingDepartment` -- department being edited

**Components Used:**
- DataTable, DepartmentForm, ConfirmDialog, MetricCard, HealthIndicator

**Responsive:**
- Mobile: card list
- Desktop: table + side edit panel

**Loading State:** table skeleton
**Error State:** per-operation errors
**Empty State:** "ยังไม่มี departments -- สร้างแผนกแรก" + CTA
**SEO:** `<title>Department Management | Admin | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin > Departments                        |
| BAR  |                                           |
|      | [+ Create Department]                     |
|      |                                           |
|      | +------+-------+-------+------+----------+|
|      | | Name | Users | Pages | Cost | Status   ||
|      | +------+-------+-------+------+----------+|
|      | | HR   | 45    | 1234  | $345 | (g) Sync ||
|      | | IT   | 89    | 5678  | $890 | (y) Ing. ||
|      | | Fin  | 23    | 890   | $120 | (g) Sync ||
|      | +------+-------+-------+------+----------+|
|      |                                           |
|      | [Edit Department: HR]                     |
|      | Name: [HR___________]                     |
|      | Folders: [3 folders connected]            |
|      | Policies: [Edit Policies ->]              |
|      | [Save]  [Cancel]                          |
+------+-------------------------------------------+
```

## 4.12 Drive Folder Manager

**Route:** `/admin/drive`
**Auth Guard:** admin+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useDriveFolders()` -- connected folders with sync status
- `useDriveSync()` -- real-time sync status
- Query key: `['admin', 'drive', 'folders']`

**State Management:**
- `adminStore.selectedFolders`

**Components Used:**
- DriveFolderPicker, DriveConnectionStatus, SyncStatusBadge, DataTable, ConfirmDialog, IngestionProgress

**Responsive:**
- Mobile: stacked folder cards
- Desktop: folder tree + status table

**Loading State:** folder tree skeleton
**Error State:** "ไม่สามารถเชื่อมต่อ Google Drive -- ตรวจสอบ credentials"
**Empty State:** "ยังไม่มี folders ที่เชื่อมต่อ -- เลือก folder จาก Drive"
**SEO:** `<title>Drive Folders | Admin | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin > Drive Folder Manager               |
| BAR  |                                           |
|      | Connection: (green) Connected              |
|      | Service Account: sa@project.iam.google.com |
|      |                                           |
|      | Connected Folders:                          |
|      | +--------+------+--------+-------+-------+|
|      | | Folder | Dept | Status | Docs  | Last  ||
|      | +--------+------+--------+-------+-------+|
|      | | /HR    | HR   | (g)Sync| 234   | 5m ago||
|      | | /IT    | IT   | (y)Ing.| 567   | now   ||
|      | | /Fin   | Fin  | (g)Sync| 123   | 1h ago||
|      | +--------+------+--------+-------+-------+|
|      |                                           |
|      | [+ Add Folder]  [Resync All]              |
|      |                                           |
|      | Ingestion Progress (IT):                   |
|      | [===========>       ] 67% (380/567)       |
|      | Current: IT-Architecture-2026.docx        |
+------+-------------------------------------------+
```

## 4.13 Content Policy Editor

**Route:** `/admin/policies`
**Auth Guard:** admin+ or depthead (own department)
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useDepartments()` -- department list for selector
- `useContentPolicies(departmentId)` -- current policies
- Query key: `['admin', 'policies', departmentId]`

**State Management:**
- react-hook-form + zod validation

**Components Used:**
- ContentPolicyEditor, SettingsForm, FilterPanel, Toast

**Responsive:**
- Mobile: single column form
- Desktop: department selector + form

**Loading State:** form skeleton
**Error State:** per-field validation + save error toast
**Empty State:** default policy values pre-filled
**SEO:** `<title>Content Policies | Admin | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin > Content Policies                   |
| BAR  |                                           |
|      | Department: [HR                       v]  |
|      |                                           |
|      | Exclude Patterns:                          |
|      | [**/CONFIDENTIAL/**    ] [x]              |
|      | [**/DRAFT/**           ] [x]              |
|      | [+ Add Pattern]                           |
|      |                                           |
|      | Max File Size:  [50] MB                   |
|      |                                           |
|      | Allowed Types:                             |
|      | [x] Google Docs  [x] Google Sheets        |
|      | [x] Google Slides [ ] PDF                  |
|      |                                           |
|      | Sensitive Keywords (ห้าม ingest):           |
|      | [ลับเฉพาะ          ] [x]                    |
|      | [CONFIDENTIAL     ] [x]                    |
|      | [+ Add Keyword]                            |
|      |                                           |
|      | Retention: [365] days                      |
|      | Auto-approve pages: [ON]                   |
|      |                                           |
|      | [Save Changes]  [Reset to Default]         |
+------+-------------------------------------------+
```

## 4.14 Ingestion Monitor

**Route:** `/admin/ingestion`
**Auth Guard:** admin+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useIngestionStatus()` -- all departments ingestion status (SSE)
- Query key: `['admin', 'ingestion']` (SSE stream, not polling)

**State Management:**
- SSE connection via `useSSE('/api/ingestion/stream')`

**Components Used:**
- IngestionProgress, DataTable, Timeline, MetricCard, HealthIndicator

**Responsive:**
- Mobile: stacked department cards with progress bars
- Desktop: table + detail panel

**Loading State:** skeleton cards
**Error State:** SSE connection lost -- reconnecting indicator
**Empty State:** "ไม่มี ingestion ที่กำลังทำงาน"
**SEO:** `<title>Ingestion Monitor | Admin | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin > Ingestion Monitor                  |
| BAR  |                                           |
|      | +--------+ +--------+ +--------+ +------+ |
|      | | Total  | | Active | | Failed | | Queue| |
|      | | Docs   | | Jobs   | | Today  | | Size | |
|      | | 12,345 | | 3      | | 2      | | 45   | |
|      | +--------+ +--------+ +--------+ +------+ |
|      |                                           |
|      | Active Ingestions:                          |
|      | +------+--------+---------+-------+------+|
|      | | Dept | Status | Progress| Speed | ETA  ||
|      | +------+--------+---------+-------+------+|
|      | | IT   | Ingest | 67%     | 3/min | 12m  ||
|      | | HR   | Scan   | 10%     | --    | --   ||
|      | +------+--------+---------+-------+------+|
|      |                                           |
|      | [Trigger Full Resync]  [Pause All]        |
|      |                                           |
|      | Recent Errors:                             |
|      | - IT/arch.docx: API rate limit exceeded   |
|      | - HR/old.doc: Unsupported format          |
+------+-------------------------------------------+
```

## 4.15 Cost Dashboard

**Route:** `/admin/cost`
**Auth Guard:** admin+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useCostAnalytics(dateRange, groupBy)` -- cost data
- `useCostData(departmentId)` -- per-department drill-down
- Query key: `['admin', 'cost', dateRange, groupBy]`

**State Management:**
- URL state: `?range=30d&group=department`

**Components Used:**
- CostChart, CostTrendChart, TokenUsageChart, CostBreakdown, MetricCard, DataTable, FilterPanel

**Responsive:**
- Mobile: single column, simplified charts
- Desktop: 2-column chart layout + breakdown table

**Loading State:** chart skeletons + metric card skeletons
**Error State:** per-chart error
**Empty State:** "ยังไม่มีข้อมูล cost -- ข้อมูลจะปรากฏหลัง initial ingestion"
**SEO:** `<title>Cost Dashboard | Admin | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin > Cost Dashboard                     |
| BAR  |                                           |
|      | Date Range: [Last 30 days v]  Group: [Dept v]|
|      |                                           |
|      | +--------+ +--------+ +--------+ +------+ |
|      | | Total  | | Avg/Day| | Top    | | Token| |
|      | | Cost   | |        | | Dept   | | Used | |
|      | | $2,345 | | $78    | | IT     | | 45M  | |
|      | +--------+ +--------+ +--------+ +------+ |
|      |                                           |
|      | +------------------+ +-----------------+  |
|      | | Cost Trend       | | Token Usage     |  |
|      | | [Line Chart]     | | [Pie Chart]     |  |
|      | | __ HR            | | - Ingestion 60% |  |
|      | | __ IT            | | - Chat 30%      |  |
|      | | __ Finance       | | - Lint 10%      |  |
|      | +------------------+ +-----------------+  |
|      |                                           |
|      | Cost Breakdown:                            |
|      | +------+--------+--------+-------+       |
|      | | Dept | Tokens | Cost   | Trend |       |
|      | +------+--------+--------+-------+       |
|      | | IT   | 20M    | $890   | +12%  |       |
|      | | HR   | 15M    | $645   | -3%   |       |
|      | +------+--------+--------+-------+       |
+------+-------------------------------------------+
```

## 4.16 Audit Log Viewer

**Route:** `/admin/audit`
**Auth Guard:** admin+
**Layout:** AppShell (variant: full)

**Data Requirements:**
- `useAuditLogs(filters, pagination)` -- paginated audit logs
- Query key: `['admin', 'audit', filters, page]`

**State Management:**
- URL state: `?action=all&user=all&resource=all&from=&to=&page=1`

**Components Used:**
- AuditLogTable, AuditFilterBar, IntegrityBadge, FilterPanel, DataTable

**Responsive:**
- Mobile: card list (each audit entry as a card)
- Desktop: full table with all columns

**Loading State:** table skeleton (15 rows)
**Error State:** table error with retry
**Empty State:** "ไม่พบ audit logs ตามเงื่อนไขที่เลือก"
**SEO:** `<title>Audit Logs | Admin | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin > Audit Logs                         |
| BAR  |                                           |
|      | [Search...] [User v] [Action v] [Date Range]|
|      | [Resource Type v]  [Integrity: All v]      |
|      |                           [Export Report]  |
|      |                                           |
|      | +------+------+--------+--------+---------+
|      | | Time | User | Action | Resrc  | HMAC    |
|      | +------+------+--------+--------+---------+
|      | | 10:30| สมชาย | QUERY  | Chat   | (g) OK |
|      | | 10:28| John | VIEW   | Wiki   | (g) OK |
|      | | 10:25| Admin| UPDATE | Policy | (g) OK |
|      | | 10:20| sys  | INGEST | Wiki   | (g) OK |
|      | +------+------+--------+--------+---------+
|      |                                           |
|      | [< 1 2 3 ... 100 >]  Showing 1-25 of 2500|
+------+-------------------------------------------+
```

## 4.17 Lint Report Viewer

**Route:** `/admin/lint`
**Auth Guard:** admin+ or depthead
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useLintReports(departmentId)` -- lint report list
- `useLintReportDetail(reportId)` -- single report details
- Query key: `['admin', 'lint', departmentId]`

**State Management:**
- `adminStore.selectedLintReport`

**Components Used:**
- LintReportCard, DataTable, ConfidenceBadge, Timeline, MetricCard

**Responsive:**
- Mobile: stacked report cards
- Desktop: report list + detail side panel

**Loading State:** skeleton cards (4)
**Error State:** per-card error
**Empty State:** "ยังไม่มี lint reports -- lint จะรันอัตโนมัติทุกสัปดาห์"
**SEO:** `<title>Lint Reports | Admin | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | Admin > Lint Reports                       |
| BAR  |                                           |
|      | Department: [All v]                        |
|      |                                           |
|      | +------------------------------------------+
|      | | Latest Report: HR (Apr 15, 2026)       |
|      | | Score: 85/100  (g) Good                 |
|      | |                                        |
|      | | Contradictions: 3  Stale: 12  Orphan: 5 |
|      | | Missing Cross-Refs: 8                   |
|      | +------------------------------------------+
|      |                                           |
|      | Findings:                                  |
|      | +------+----------+-----------+----------+|
|      | | Type | Page     | Detail    | Severity ||
|      | +------+----------+-----------+----------+|
|      | | Cont | นโยบายลา  | ขัดกับ..  | (r) High ||
|      | | Stale| สรุป Q4  | 90d old   | (y) Med  ||
|      | | Orph | Draft X  | No refs   | (b) Low  ||
|      | +------+----------+-----------+----------+|
+------+-------------------------------------------+
```

## 4.18 User Profile

**Route:** `/profile`
**Auth Guard:** member+
**Layout:** AppShell (variant: default)

**Data Requirements:**
- `useAuth()` -- current user data
- `useChatHistory()` -- recent chat sessions (optional)
- Query key: `['auth', 'me']`

**State Management:**
- `authStore.user`
- react-hook-form for preferences

**Components Used:**
- SettingsForm, LanguageSwitcher, ThemeToggle, Avatar

**Responsive:**
- Mobile: single column
- Desktop: centered card (max-width 640px)

**Loading State:** profile skeleton
**Error State:** save error toast
**Empty State:** N/A
**SEO:** `<title>Profile | DriveWiki</title>`

```
ASCII Wireframe:
+------+-------------------------------------------+
| SIDE | My Profile                                 |
| BAR  |                                           |
|      | +------------------------------------------+
|      | |  [Avatar]                               |
|      | |  สมชาย สมชื่อ                               |
|      | |  somchai@company.com                     |
|      | |  Role: Admin | Department: HR           |
|      | |  Last login: Apr 17, 2569 10:30          |
|      | +------------------------------------------+
|      |                                           |
|      | Preferences:                               |
|      | +------------------------------------------+
|      | | Language:    [TH v]                     |
|      | | Theme:       [System v] [Preview]       |
|      | | Notifications: [ON]                     |
|      | +------------------------------------------+
|      |                                           |
|      | Statistics:                                |
|      | +--------+ +--------+ +--------+          |
|      | | Queries| | Sessions| | Pages  |          |
|      | | 234    | | 45      | | Read   |          |
|      | | Total  | | Total   | | 890    |          |
|      | +--------+ +--------+ +--------+          |
|      |                                           |
|      | [Logout]                                   |
+------+-------------------------------------------+
```

---

# 5. State Management Architecture

## 5.1 Server State (TanStack Query)

### Query Key Factory

```typescript
// src/utils/queryKeys.ts

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    consent: () => [...queryKeys.auth.all, 'consent'] as const,
  },
  chat: {
    all: ['chat'] as const,
    sessions: () => [...queryKeys.chat.all, 'sessions'] as const,
    session: (id: string) => [...queryKeys.chat.all, 'session', id] as const,
    messages: (sessionId: string) => [...queryKeys.chat.all, 'messages', sessionId] as const,
    suggested: () => [...queryKeys.chat.all, 'suggested'] as const,
  },
  wiki: {
    all: ['wiki'] as const,
    index: (filters: WikiFilters) => [...queryKeys.wiki.all, 'index', filters] as const,
    page: (id: string) => [...queryKeys.wiki.all, 'page', id] as const,
    crossRefs: (id: string) => [...queryKeys.wiki.all, 'crossRefs', id] as const,
    history: (id: string) => [...queryKeys.wiki.all, 'history', id] as const,
    search: (query: string, filters: WikiFilters) =>
      [...queryKeys.wiki.all, 'search', query, filters] as const,
  },
  admin: {
    all: ['admin'] as const,
    overview: () => [...queryKeys.admin.all, 'overview'] as const,
    users: (filters: UserFilters) => [...queryKeys.admin.all, 'users', filters] as const,
    departments: () => [...queryKeys.admin.all, 'departments'] as const,
    drive: {
      folders: () => [...queryKeys.admin.all, 'drive', 'folders'] as const,
      syncStatus: () => [...queryKeys.admin.all, 'drive', 'sync'] as const,
    },
    policies: (deptId: string) => [...queryKeys.admin.all, 'policies', deptId] as const,
    ingestion: () => [...queryKeys.admin.all, 'ingestion'] as const,
    cost: (dateRange: DateRange, groupBy: string) =>
      [...queryKeys.admin.all, 'cost', dateRange, groupBy] as const,
    audit: (filters: AuditFilters) => [...queryKeys.admin.all, 'audit', filters] as const,
    lint: (deptId?: string) => [...queryKeys.admin.all, 'lint', deptId] as const,
    lintDetail: (reportId: string) => [...queryKeys.admin.all, 'lint', 'detail', reportId] as const,
  },
} as const;
```

### Cache Invalidation Strategy

| Event | Invalidate | Reason |
|-------|-----------|--------|
| Chat message sent | `chat.messages(sessionId)` | แสดง message ใหม่ |
| Chat feedback given | `chat.messages(sessionId)` | Update feedback status |
| Wiki page viewed | ไม่ invalidate (staleTime: 5min) | Content ไม่เปลี่ยนบ่อย |
| Wiki search | ไม่ invalidate (staleTime: 30s) | Search results may update |
| User role changed | `admin.users`, `auth.me` | Permission changed |
| Department created | `admin.departments`, `wiki.index` | New department scope |
| Drive folder connected | `admin.drive.folders`, `admin.ingestion` | New folder to sync |
| Ingestion complete | `wiki.index`, `wiki.page(*)`, `admin.overview` | New/updated wiki pages |
| Policy saved | `admin.policies(deptId)` | Policy updated |
| Lint report generated | `admin.lint` | New report available |

### Optimistic Updates

ใช้ optimistic updates สำหรับ actions ที่ user คาดหวัง instant feedback:

1. **Chat feedback (thumbs up/down)** -- update UI ทันที, revert ถ้า API fail
2. **User role change** -- update table row ทันที
3. **Department name change** -- update card ทันที
4. **Content policy toggle** -- toggle switch ทันที

### Pagination Pattern

```typescript
// Offset-based pagination สำหรับ admin tables
const { data, isLoading, isFetching } = useQuery({
  queryKey: queryKeys.admin.users({ ...filters, page, pageSize }),
  queryFn: () => adminService.getUsers({ ...filters, page, pageSize }),
  placeholderData: keepPreviousData, // ไม่ flash ตอนเปลี่ยนหน้า
});

// Infinite scroll สำหรับ wiki index (react-virtuoso)
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: queryKeys.wiki.index(filters),
  queryFn: ({ pageParam }) =>
    wikiService.getIndex({ ...filters, cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: undefined,
});
```

## 5.2 Client State (Zustand)

### authStore

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: 'superadmin' | 'admin' | 'depthead' | 'member' | 'viewer';
  departmentId: string;
  departmentName: string;
  hasConsented: boolean;
  locale: 'th' | 'en';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  loginWithGoogle: () => void;
  logout: () => void;
  giveConsent: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),

      loginWithGoogle: () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
      },

      logout: async () => {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        set({ user: null, isAuthenticated: false });
        window.location.href = '/login';
      },

      giveConsent: async () => {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/consent`, { method: 'POST', credentials: 'include' });
        const user = get().user;
        if (user) {
          set({ user: { ...user, hasConsented: true } });
        }
      },
    }),
    {
      name: 'drivewiki-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

### chatStore

```typescript
// src/stores/chatStore.ts

interface ChatState {
  activeSessionId: string | null;
  isStreaming: boolean;
  streamAbortController: AbortController | null;
  pendingMessage: string;
  citationPanelOpen: boolean;
  activeCitationId: string | null;

  // Actions
  setActiveSession: (id: string | null) => void;
  setStreaming: (streaming: boolean, controller?: AbortController) => void;
  stopStreaming: () => void;
  setPendingMessage: (message: string) => void;
  toggleCitationPanel: () => void;
  setActiveCitation: (id: string | null) => void;
}
```

### wikiStore

```typescript
// src/stores/wikiStore.ts

interface WikiState {
  viewMode: 'grid' | 'list';
  filters: WikiFilters;
  selectedPageId: string | null;

  // Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilters: (filters: Partial<WikiFilters>) => void;
  resetFilters: () => void;
  setSelectedPage: (id: string | null) => void;
}
```

### uiStore

```typescript
// src/stores/uiStore.ts

interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  locale: 'th' | 'en';
  commandPaletteOpen: boolean;
  toasts: Toast[];

  // Actions
  toggleSidebar: () => void;
  setMobileSidebar: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: 'th' | 'en') => void;
  toggleCommandPalette: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

### adminStore

```typescript
// src/stores/adminStore.ts

interface AdminState {
  activeTab: 'overview' | 'users' | 'departments' | 'drive' | 'policies' | 'ingestion' | 'cost' | 'audit' | 'lint';
  editingDepartmentId: string | null;
  selectedLintReportId: string | null;
  dashboardDateRange: '7d' | '30d' | '90d' | '365d';

  // Actions
  setActiveTab: (tab: AdminState['activeTab']) => void;
  setEditingDepartment: (id: string | null) => void;
  setSelectedLintReport: (id: string | null) => void;
  setDashboardDateRange: (range: AdminState['dashboardDateRange']) => void;
}
```

## 5.3 URL State

| Parameter | Page(s) | Type | Purpose |
|-----------|---------|------|---------|
| `session` | `/chat` | string | Active chat session ID |
| `q` | `/wiki`, `/wiki/search`, `/admin/users` | string | Search query |
| `type` | `/wiki`, `/wiki/search` | enum | Wiki page type filter |
| `dept` | `/wiki/search`, `/admin/users` | string | Department filter |
| `sort` | `/wiki` | string | Sort field |
| `order` | `/wiki` | enum | Sort direction |
| `page` | `/admin/users`, `/admin/audit` | number | Pagination page |
| `range` | `/dashboard`, `/admin/cost` | string | Date range |
| `group` | `/admin/cost` | string | Group by field |
| `action` | `/admin/audit` | string | Audit action filter |
| `tab` | `/admin` | string | Active admin tab |

ใช้ TanStack Router `searchParams` validation ด้วย zod schema:

```typescript
// Example: wiki search route
import { z } from 'zod';

const wikiSearchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['entity', 'concept', 'summary', 'all']).optional().default('all'),
  dept: z.string().optional(),
  sort: z.enum(['title', 'updatedAt', 'sourceCount']).optional().default('updatedAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});
```

## 5.4 Form State

ใช้ `react-hook-form` + `zod` สำหรับทุก form:

### Validation Schemas

```typescript
// src/utils/validators.ts
import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'ชื่อแผนกต้องมีอย่างน้อย 2 ตัวอักษร').max(100),
  description: z.string().max(500).optional(),
  folderIds: z.array(z.string()).min(1, 'ต้องเลือกอย่างน้อย 1 folder'),
});

export const contentPolicySchema = z.object({
  excludePatterns: z.array(z.string()),
  maxFileSize: z.number().min(1).max(200),
  allowedMimeTypes: z.array(z.string()).min(1),
  sensitiveKeywords: z.array(z.string()),
  retentionDays: z.number().min(30).max(3650),
  autoApprove: z.boolean(),
});

export const userRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['superadmin', 'admin', 'depthead', 'member', 'viewer']),
  departmentId: z.string(),
});
```

## 5.5 Real-time State (SSE)

### SSE Hook

```typescript
// src/hooks/useSSE.ts

interface UseSSEOptions<T> {
  url: string;
  onMessage: (data: T) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
  /** Reconnect settings */
  reconnect?: {
    maxRetries: number;        // default: 5
    baseDelay: number;         // default: 1000ms
    maxDelay: number;          // default: 30000ms
    backoffMultiplier: number; // default: 2
  };
}

function useSSE<T>(options: UseSSEOptions<T>): {
  isConnected: boolean;
  error: Event | null;
  reconnectCount: number;
  disconnect: () => void;
}
```

**Usage สำหรับ chat streaming:**

```typescript
// src/features/chat/hooks/useStreamResponse.ts

function useStreamResponse(sessionId: string) {
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = async (message: string) => {
    setIsStreaming(true);
    setStreamingText('');
    abortRef.current = new AbortController();

    const response = await fetch(`${API_URL}/chat/${sessionId}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: abortRef.current.signal,
      credentials: 'include',
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'token') {
            setStreamingText((prev) => prev + data.content);
          } else if (data.type === 'citations') {
            // Handle citation data
          } else if (data.type === 'done') {
            setIsStreaming(false);
          }
        }
      }
    }
  };

  const stopStream = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  return { streamingText, isStreaming, startStream, stopStream };
}
```

**Usage สำหรับ ingestion progress:**

```typescript
// Used in IngestionMonitor page
const { isConnected } = useSSE<IngestionEvent>({
  url: `${API_URL}/ingestion/stream`,
  onMessage: (event) => {
    queryClient.setQueryData(
      queryKeys.admin.ingestion(),
      (old: IngestionStatus) => mergeIngestionEvent(old, event)
    );
  },
  enabled: isAdminPage,
  reconnect: { maxRetries: 10, baseDelay: 2000, maxDelay: 30000, backoffMultiplier: 2 },
});
```

---

# 6. API Client Layer

## 6.1 Base HTTP Client

```typescript
// src/services/httpClient.ts

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
    nextCursor?: string;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept-Language': 'th', // default
    };
  }

  // Request interceptor: attach CSRF token, set locale header
  private async request<T>(path: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, timeout = 30000, ...fetchConfig } = config;

    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value));
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url.toString(), {
        ...fetchConfig,
        headers: { ...this.defaultHeaders, ...fetchConfig.headers },
        credentials: 'include', // httpOnly cookies สำหรับ auth
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new ApiClientError(error.code, error.message, response.status, error.details);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiClientError('TIMEOUT', 'Request timed out', 408);
      }
      throw new ApiClientError('NETWORK_ERROR', 'Network connection failed', 0);
    }
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET', params: params as any });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  setLocale(locale: 'th' | 'en') {
    this.defaultHeaders['Accept-Language'] = locale;
  }
}

export const api = new HttpClient(import.meta.env.VITE_API_URL);
```

### Error Types

```typescript
// src/services/httpClient.ts

export class ApiClientError extends Error {
  constructor(
    public code: string,
    public override message: string,
    public statusCode: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  get isUnauthorized(): boolean { return this.statusCode === 401; }
  get isForbidden(): boolean { return this.statusCode === 403; }
  get isNotFound(): boolean { return this.statusCode === 404; }
  get isRateLimited(): boolean { return this.statusCode === 429; }
  get isServerError(): boolean { return this.statusCode >= 500; }
}
```

### Response Interceptor (Global Error Handling)

```typescript
// ใน TanStack Query global config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiClientError) {
          // ไม่ retry 401/403/404
          if (error.isUnauthorized || error.isForbidden || error.isNotFound) return false;
          // Retry server errors สูงสุด 3 ครั้ง
          if (error.isServerError) return failureCount < 3;
          // Retry rate limit ด้วย exponential backoff
          if (error.isRateLimited) return failureCount < 5;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 60_000, // 1 minute default
    },
    mutations: {
      onError: (error) => {
        if (error instanceof ApiClientError && error.isUnauthorized) {
          useAuthStore.getState().clearUser();
          window.location.href = '/login';
        }
      },
    },
  },
});
```

## 6.2 API Service Modules

### authService

```typescript
// src/services/authService.ts

export interface LoginResponse {
  user: User;
  expiresAt: string;
}

export const authService = {
  getMe: () => api.get<User>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
  refreshToken: () => api.post<{ expiresAt: string }>('/auth/refresh'),
  giveConsent: () => api.post<void>('/auth/consent'),
  getConsentStatus: () => api.get<{ hasConsented: boolean; consentedAt?: string }>('/auth/consent'),
};
```

### chatService

```typescript
// src/services/chatService.ts

export interface ChatSession {
  id: string;
  userId: string;
  departmentId: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  title?: string; // auto-generated from first message
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  wikiPagesUsed: string[];
  filedAsWikiPage: boolean;
  feedback: 'helpful' | 'not_helpful' | null;
  createdAt: string;
}

export interface Citation {
  pageId: string;
  pageTitle: string;
  pageType: 'entity' | 'concept' | 'summary';
  relevantExcerpt: string;
  confidence: number; // 0-1
}

export const chatService = {
  getSessions: () => api.get<ChatSession[]>('/chat/sessions'),
  getSession: (id: string) => api.get<ChatSession>(`/chat/sessions/${id}`),
  createSession: () => api.post<ChatSession>('/chat/sessions'),
  getMessages: (sessionId: string) => api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: string, content: string) =>
    api.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, { content }),
  // SSE stream handled directly in useStreamResponse hook (not via httpClient)
  rateFeedback: (messageId: string, feedback: 'helpful' | 'not_helpful') =>
    api.post<void>(`/chat/messages/${messageId}/feedback`, { feedback }),
  getSuggestedQueries: () => api.get<string[]>('/chat/suggested'),
};
```

### wikiService

```typescript
// src/services/wikiService.ts

export interface WikiPage {
  id: string;
  departmentId: string;
  type: 'entity' | 'concept' | 'summary';
  title: string;
  markdownContent: string;
  status: 'active' | 'stale' | 'archived';
  metadata: Record<string, unknown>;
  sourceDocIds: string[];
  sourceDocTitles: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface WikiSearchResult {
  page: WikiPage;
  score: number;
  highlights: string[];
}

export const wikiService = {
  getIndex: (params: { type?: string; departmentId?: string; cursor?: string; limit?: number }) =>
    api.get<{ pages: WikiPage[]; nextCursor?: string; totalCount: number }>('/wiki/pages', params),
  getPage: (id: string) => api.get<WikiPage>(`/wiki/pages/${id}`),
  searchPages: (query: string, filters?: Partial<WikiFilters>) =>
    api.get<{ results: WikiSearchResult[]; totalCount: number }>('/wiki/search', { q: query, ...filters }),
  getHistory: (pageId: string) =>
    api.get<Array<{ version: number; updatedAt: string; changes: string }>>(`/wiki/pages/${pageId}/history`),
  getVersion: (pageId: string, version: number) =>
    api.get<WikiPage>(`/wiki/pages/${pageId}/versions/${version}`),
  getCrossRefs: (pageId: string) =>
    api.get<{
      incoming: Array<{ pageId: string; title: string; type: string; relationship: string }>;
      outgoing: Array<{ pageId: string; title: string; type: string; relationship: string }>;
    }>(`/wiki/pages/${pageId}/cross-refs`),
};
```

### driveService

```typescript
// src/services/driveService.ts

export interface DriveFolder {
  id: string;
  googleFolderId: string;
  name: string;
  path: string;
  departmentId: string;
  departmentName: string;
  syncStatus: 'synced' | 'syncing' | 'error' | 'pending';
  documentCount: number;
  lastSyncAt: string;
}

export const driveService = {
  listFolders: () => api.get<DriveFolder[]>('/drive/folders'),
  listAvailableFolders: (parentId?: string) =>
    api.get<Array<{ id: string; name: string; hasChildren: boolean }>>('/drive/available', { parentId }),
  connectFolder: (googleFolderId: string, departmentId: string) =>
    api.post<DriveFolder>('/drive/folders', { googleFolderId, departmentId }),
  disconnectFolder: (folderId: string) => api.delete<void>(`/drive/folders/${folderId}`),
  getConnectionStatus: () =>
    api.get<{ connected: boolean; serviceAccount: string; lastVerified: string }>('/drive/status'),
  triggerSync: (folderId: string) => api.post<void>(`/drive/folders/${folderId}/sync`),
  triggerSyncAll: () => api.post<void>('/drive/sync-all'),
};
```

### adminService

```typescript
// src/services/adminService.ts

export interface AdminOverview {
  totalUsers: number;
  totalDepartments: number;
  totalWikiPages: number;
  totalDocuments: number;
  totalCostMtd: number;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
  departments: Array<{
    id: string;
    name: string;
    userCount: number;
    pageCount: number;
    costMtd: number;
    health: string;
  }>;
}

export const adminService = {
  getOverview: () => api.get<AdminOverview>('/admin/overview'),
  // Users
  getUsers: (params: { search?: string; departmentId?: string; role?: string; page?: number; pageSize?: number }) =>
    api.get<{ users: User[]; totalCount: number }>('/admin/users', params),
  updateUserRole: (userId: string, role: string, departmentId: string) =>
    api.put<User>(`/admin/users/${userId}/role`, { role, departmentId }),
  deactivateUser: (userId: string) => api.put<void>(`/admin/users/${userId}/deactivate`),
  // Departments
  getDepartments: () => api.get<Department[]>('/admin/departments'),
  createDepartment: (data: { name: string; description?: string }) =>
    api.post<Department>('/admin/departments', data),
  updateDepartment: (id: string, data: Partial<Department>) =>
    api.put<Department>(`/admin/departments/${id}`, data),
  deleteDepartment: (id: string) => api.delete<void>(`/admin/departments/${id}`),
};
```

### ingestionService

```typescript
// src/services/ingestionService.ts

export interface IngestionStatus {
  departments: Array<{
    departmentId: string;
    departmentName: string;
    status: 'idle' | 'scanning' | 'ingesting' | 'compiling' | 'indexing' | 'complete' | 'error';
    totalDocuments: number;
    processedDocuments: number;
    currentDocument?: string;
    errors: Array<{ document: string; error: string }>;
    startedAt?: string;
    estimatedCompletionAt?: string;
  }>;
}

export const ingestionService = {
  getStatus: () => api.get<IngestionStatus>('/ingestion/status'),
  triggerResync: (departmentId: string) => api.post<void>(`/ingestion/resync/${departmentId}`),
  triggerResyncAll: () => api.post<void>('/ingestion/resync'),
  pause: (departmentId: string) => api.post<void>(`/ingestion/pause/${departmentId}`),
  resume: (departmentId: string) => api.post<void>(`/ingestion/resume/${departmentId}`),
  // SSE stream endpoint: GET /ingestion/stream (handled by useSSE hook)
};
```

### auditService & costService

```typescript
// src/services/auditService.ts

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  hmacStatus: 'verified' | 'failed';
  createdAt: string;
}

export const auditService = {
  getLogs: (params: {
    userId?: string;
    action?: string;
    resourceType?: string;
    dateFrom?: string;
    dateTo?: string;
    integrityStatus?: string;
    page?: number;
    pageSize?: number;
  }) => api.get<{ logs: AuditLog[]; totalCount: number }>('/audit/logs', params),
  exportReport: (params: { dateFrom: string; dateTo: string; format: 'csv' | 'json' }) =>
    api.post<{ downloadUrl: string }>('/audit/export', params),
  verifyIntegrity: (logId: string) => api.get<{ verified: boolean; details: string }>(`/audit/logs/${logId}/verify`),
};

// src/services/costService.ts

export interface CostSummary {
  totalCost: number;
  averageDailyCost: number;
  topDepartment: { name: string; cost: number };
  totalTokens: number;
  trend: Array<{ date: string; cost: number; tokens: number }>;
  breakdown: {
    byDepartment: Array<{ name: string; cost: number; percentage: number }>;
    byEventType: Array<{ type: string; cost: number; percentage: number }>;
  };
}

export const costService = {
  getSummary: (params: { dateFrom: string; dateTo: string; groupBy?: string }) =>
    api.get<CostSummary>('/cost/summary', params),
  getDepartmentCost: (departmentId: string, params: { dateFrom: string; dateTo: string }) =>
    api.get<CostSummary>(`/cost/departments/${departmentId}`, params),
};
```

---

# 7. Routing Configuration

## 7.1 Complete Route Tree

```typescript
// src/app/router.tsx
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: RootLayout, // Providers, ErrorBoundary, Toasts
});

// Public routes
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const consentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/consent', component: ConsentPage });
const setupRoute = createRoute({ getParentRoute: () => rootRoute, path: '/setup', component: SetupPage });

// Auth layout (protected)
const authLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: '_auth',
  component: AuthLayout, // AppShell + auth guard
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: '/login' });
    if (!context.auth.user.hasConsented) throw redirect({ to: '/consent' });
  },
});

// Protected routes
const indexRoute = createRoute({ getParentRoute: () => authLayout, path: '/', component: () => <Navigate to="/chat" /> });
const chatRoute = createRoute({ getParentRoute: () => authLayout, path: '/chat', component: ChatPage });
const wikiIndexRoute = createRoute({ getParentRoute: () => authLayout, path: '/wiki', component: WikiBrowsePage });
const wikiPageRoute = createRoute({ getParentRoute: () => authLayout, path: '/wiki/$pageId', component: WikiPageDetailPage });
const wikiSearchRoute = createRoute({ getParentRoute: () => authLayout, path: '/wiki/search', component: WikiSearchPage });
const dashboardRoute = createRoute({ getParentRoute: () => authLayout, path: '/dashboard', component: DashboardPage });
const profileRoute = createRoute({ getParentRoute: () => authLayout, path: '/profile', component: ProfilePage });

// Admin routes (nested under auth)
const adminLayout = createRoute({
  getParentRoute: () => authLayout,
  id: '_admin',
  path: '/admin',
  component: AdminLayout,
  beforeLoad: async ({ context }) => {
    if (!['superadmin', 'admin'].includes(context.auth.user.role)) {
      throw redirect({ to: '/chat' });
    }
  },
});

const adminDashRoute = createRoute({ getParentRoute: () => adminLayout, path: '/', component: AdminDashboardPage });
const adminUsersRoute = createRoute({ getParentRoute: () => adminLayout, path: '/users', component: UserManagementPage });
const adminDeptsRoute = createRoute({ getParentRoute: () => adminLayout, path: '/departments', component: DepartmentManagementPage });
const adminDriveRoute = createRoute({ getParentRoute: () => adminLayout, path: '/drive', component: DriveFolderManagerPage });
const adminPoliciesRoute = createRoute({ getParentRoute: () => adminLayout, path: '/policies', component: ContentPolicyPage });
const adminIngestionRoute = createRoute({ getParentRoute: () => adminLayout, path: '/ingestion', component: IngestionMonitorPage });
const adminCostRoute = createRoute({ getParentRoute: () => adminLayout, path: '/cost', component: CostDashboardPage });
const adminAuditRoute = createRoute({ getParentRoute: () => adminLayout, path: '/audit', component: AuditLogPage });
const adminLintRoute = createRoute({ getParentRoute: () => adminLayout, path: '/lint', component: LintReportPage });

// 404
const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: '*', component: NotFoundPage });

export const routeTree = rootRoute.addChildren([
  loginRoute,
  consentRoute,
  setupRoute,
  authLayout.addChildren([
    indexRoute,
    chatRoute,
    wikiIndexRoute,
    wikiPageRoute,
    wikiSearchRoute,
    dashboardRoute,
    profileRoute,
    adminLayout.addChildren([
      adminDashRoute,
      adminUsersRoute,
      adminDeptsRoute,
      adminDriveRoute,
      adminPoliciesRoute,
      adminIngestionRoute,
      adminCostRoute,
      adminAuditRoute,
      adminLintRoute,
    ]),
  ]),
  notFoundRoute,
]);
```

## 7.2 Auth Guards Matrix

| Route | Public | Viewer | Member | DeptHead | Admin | SuperAdmin |
|-------|--------|--------|--------|----------|-------|------------|
| `/login` | Y | redirect | redirect | redirect | redirect | redirect |
| `/consent` | N | Y | Y | Y | Y | Y |
| `/setup` | N | N | N | N | N | Y |
| `/chat` | N | Y (read) | Y | Y | Y | Y |
| `/wiki` | N | Y | Y | Y | Y | Y |
| `/wiki/:id` | N | Y (own dept) | Y (own dept) | Y (own dept) | Y (all) | Y (all) |
| `/wiki/search` | N | Y | Y | Y | Y | Y |
| `/dashboard` | N | Y | Y | Y | Y | Y |
| `/profile` | N | Y | Y | Y | Y | Y |
| `/admin/*` | N | N | N | N | Y | Y |
| `/admin/policies` | N | N | N | Y (own dept) | Y | Y |
| `/admin/lint` | N | N | N | Y (own dept) | Y | Y |

## 7.3 Code Splitting

ทุก route ใช้ lazy loading ผ่าน TanStack Router `lazy()`:

```typescript
const chatRoute = createRoute({
  getParentRoute: () => authLayout,
  path: '/chat',
  component: lazyRouteComponent(() => import('../pages/ChatPage')),
});
```

**Bundle split strategy:**
- Vendor chunk: React, TanStack Router, TanStack Query, Zustand
- UI chunk: shadcn/ui components, Tailwind runtime
- Chat chunk: ChatPanel, MessageBubble, streaming logic
- Wiki chunk: WikiPageView, MarkdownRenderer, rehype plugins
- Admin chunk: all admin pages + Recharts
- i18n chunk: translation files (per locale)

## 7.4 404 / Unauthorized Handling

- **404:** แสดง NotFoundPage พร้อม illustration, "กลับหน้าหลัก" button, search suggestion
- **401 (unauthorized):** redirect ไป `/login` พร้อมเก็บ `returnUrl` ใน query string
- **403 (forbidden):** แสดง inline error "คุณไม่มีสิทธิ์เข้าถึงหน้านี้" พร้อมข้อมูลว่า role อะไรที่ต้องมี
- **Deep linking:** ระบบเก็บ attempted URL ก่อน redirect ไป login, หลัง login สำเร็จจะ redirect กลับไป URL เดิม

---

# 8. i18n Strategy

## 8.1 File Structure

```
src/i18n/
├── config.ts              # i18n provider setup
├── th/
│   ├── common.json        # ปุ่ม, labels, navigation ทั่วไป
│   ├── chat.json          # Chat interface strings
│   ├── wiki.json          # Wiki interface strings
│   ├── admin.json         # Admin panel strings
│   └── errors.json        # Error messages + validation
└── en/
    ├── common.json
    ├── chat.json
    ├── wiki.json
    ├── admin.json
    └── errors.json
```

## 8.2 Namespace Organization

| Namespace | Keys | Example |
|-----------|------|---------|
| `common` | ~100 keys | `common.save`, `common.cancel`, `common.search`, `common.loading` |
| `chat` | ~50 keys | `chat.newSession`, `chat.sendMessage`, `chat.noResults`, `chat.streaming` |
| `wiki` | ~60 keys | `wiki.entityPage`, `wiki.conceptPage`, `wiki.crossRefs`, `wiki.versions` |
| `admin` | ~80 keys | `admin.users.title`, `admin.departments.create`, `admin.cost.total` |
| `errors` | ~40 keys | `errors.network`, `errors.unauthorized`, `errors.notFound`, `errors.validation.*` |

## 8.3 Sample Translation Keys

```json
// src/i18n/th/common.json
{
  "appName": "DriveWiki",
  "navigation": {
    "chat": "แชท",
    "wiki": "วิกิ",
    "dashboard": "แดชบอร์ด",
    "admin": "ผู้ดูแลระบบ",
    "profile": "โปรไฟล์",
    "logout": "ออกจากระบบ"
  },
  "actions": {
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "delete": "ลบ",
    "edit": "แก้ไข",
    "search": "ค้นหา",
    "filter": "กรอง",
    "export": "ส่งออก",
    "retry": "ลองใหม่",
    "refresh": "รีเฟรช",
    "close": "ปิด",
    "confirm": "ยืนยัน",
    "back": "กลับ",
    "next": "ถัดไป"
  },
  "status": {
    "loading": "กำลังโหลด...",
    "saving": "กำลังบันทึก...",
    "success": "สำเร็จ",
    "error": "เกิดข้อผิดพลาด",
    "noData": "ไม่มีข้อมูล"
  },
  "time": {
    "justNow": "เมื่อสักครู่",
    "minutesAgo": "{count} นาทีที่แล้ว",
    "hoursAgo": "{count} ชั่วโมงที่แล้ว",
    "daysAgo": "{count} วันที่แล้ว"
  }
}
```

## 8.4 Date/Number Formatting

### Thai Buddhist Era Calendar

```typescript
// src/utils/date.ts

export function formatDate(date: string | Date, locale: 'th' | 'en'): string {
  const d = new Date(date);

  if (locale === 'th') {
    // Thai Buddhist Era (พ.ศ.) = CE + 543
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'buddhist', // Intl supports this
    }).format(d);
    // Output: "17 เมษายน 2569"
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
  // Output: "April 17, 2026"
}

export function formatDateTime(date: string | Date, locale: 'th' | 'en'): string {
  const d = new Date(date);

  if (locale === 'th') {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'buddhist',
    }).format(d);
    // Output: "17 เม.ย. 2569 10:30"
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: string | Date, locale: 'th' | 'en'): string {
  const rtf = new Intl.RelativeTimeFormat(locale === 'th' ? 'th' : 'en', { numeric: 'auto' });
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return locale === 'th' ? 'เมื่อสักครู่' : 'just now';
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  if (hours < 24) return rtf.format(-hours, 'hour');
  return rtf.format(-days, 'day');
}
```

### Number Formatting

```typescript
// src/utils/format.ts

export function formatNumber(value: number, locale: 'th' | 'en'): string {
  return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US').format(value);
}

export function formatCurrency(value: number, currency: 'THB' | 'USD', locale: 'th' | 'en'): string {
  return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number, locale: 'th' | 'en'): string {
  return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}
```

## 8.5 Dynamic Language Switching

```typescript
// src/i18n/config.ts

// Language switching ไม่ต้อง reload -- ทำผ่าน React context re-render
// เมื่อ uiStore.locale เปลี่ยน -> i18n provider re-render ทุก translated component
// CSS class .lang-th / .lang-en ที่ <html> element จะเปลี่ยนตาม เพื่อปรับ line-height

export function switchLanguage(locale: 'th' | 'en') {
  // 1. Update Zustand store
  useUIStore.getState().setLocale(locale);
  // 2. Update HTML lang attribute
  document.documentElement.lang = locale;
  // 3. Update HTML class for font/line-height
  document.documentElement.classList.remove('lang-th', 'lang-en');
  document.documentElement.classList.add(`lang-${locale}`);
  // 4. Update HTTP client header
  api.setLocale(locale);
  // 5. Persist to localStorage
  localStorage.setItem('drivewiki-locale', locale);
}
```

## 8.6 RTL Considerations

DriveWiki ไม่รองรับ RTL languages ใน v1 (ไทย + อังกฤษ เป็น LTR ทั้งคู่) อย่างไรก็ตาม ถ้าต้องการเพิ่ม RTL ในอนาคต:
- ใช้ CSS logical properties (`margin-inline-start` แทน `margin-left`)
- Tailwind CSS 4 มี built-in RTL support ผ่าน `rtl:` prefix
- Layout components ใช้ `flex` direction ที่ปรับตาม `dir` attribute

---

# 9. Testing Strategy

## 9.1 Unit Test Patterns (Components)

```typescript
// Example: MetricCard.test.tsx
import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/common/MetricCard';

describe('MetricCard', () => {
  it('renders value and title', () => {
    render(<MetricCard title="Active Users" value={342} format="number" />);
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('342')).toBeInTheDocument();
  });

  it('shows positive trend when current > previous', () => {
    render(<MetricCard title="Users" value={342} previousValue={298} format="number" />);
    expect(screen.getByText('+14.8%')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /trend up/i })).toBeInTheDocument();
  });

  it('renders skeleton when loading', () => {
    render(<MetricCard title="Users" value={0} isLoading />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});
```

## 9.2 Hook Testing Patterns

```typescript
// Example: useStreamResponse.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamResponse } from '@/features/chat/hooks/useStreamResponse';

describe('useStreamResponse', () => {
  it('accumulates streaming text', async () => {
    // Mock SSE response
    const mockResponse = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"token","content":"Hello "}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: {"type":"token","content":"World"}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: {"type":"done"}\n\n'));
        controller.close();
      },
    });
    global.fetch = vi.fn().mockResolvedValue({ body: mockResponse, ok: true });

    const { result } = renderHook(() => useStreamResponse('session-1'));

    await act(async () => {
      await result.current.startStream('test message');
    });

    await waitFor(() => {
      expect(result.current.streamingText).toBe('Hello World');
      expect(result.current.isStreaming).toBe(false);
    });
  });
});
```

## 9.3 Store Testing Patterns

```typescript
// Example: authStore.test.ts
import { useAuthStore } from '@/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('sets user and authenticated state', () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test', role: 'member' as const };
    useAuthStore.getState().setUser(mockUser as any);

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('clears state on logout', () => {
    useAuthStore.getState().setUser({ id: '1' } as any);
    useAuthStore.getState().clearUser();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
```

## 9.4 API Mocking (MSW)

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const handlers = [
  // Auth
  http.get(`${API}/auth/me`, () => {
    return HttpResponse.json({
      data: {
        id: 'user-1',
        email: 'test@company.com',
        name: 'Test User',
        role: 'admin',
        departmentId: 'dept-1',
        departmentName: 'HR',
        hasConsented: true,
      },
    });
  }),

  // Wiki pages
  http.get(`${API}/wiki/pages`, ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    return HttpResponse.json({
      data: {
        pages: mockWikiPages.filter((p) => !type || type === 'all' || p.type === type),
        totalCount: 100,
        nextCursor: 'cursor-2',
      },
    });
  }),

  // Chat sessions
  http.post(`${API}/chat/sessions`, () => {
    return HttpResponse.json({
      data: { id: 'session-new', userId: 'user-1', startedAt: new Date().toISOString() },
    });
  }),

  // Fallback
  http.all('*', () => {
    return HttpResponse.json({ error: 'Not mocked' }, { status: 500 });
  }),
];
```

## 9.5 E2E Test Scenarios (Playwright)

| # | Scenario | Page(s) | Priority |
|---|----------|---------|----------|
| E2E-01 | Google OAuth login flow (mock OAuth) | `/login` | P0 |
| E2E-02 | PDPA consent form submit | `/consent` | P0 |
| E2E-03 | Chat: send message and receive streaming response | `/chat` | P0 |
| E2E-04 | Chat: click citation and navigate to wiki page | `/chat`, `/wiki/:id` | P0 |
| E2E-05 | Chat: give feedback (thumbs up/down) | `/chat` | P1 |
| E2E-06 | Wiki: browse pages with type filter | `/wiki` | P0 |
| E2E-07 | Wiki: search and navigate to result | `/wiki/search`, `/wiki/:id` | P0 |
| E2E-08 | Wiki: view cross-references and navigate | `/wiki/:id` | P1 |
| E2E-09 | Wiki: view version diff | `/wiki/:id` | P2 |
| E2E-10 | Dashboard: verify metric cards load | `/dashboard` | P1 |
| E2E-11 | Admin: create new department | `/admin/departments` | P0 |
| E2E-12 | Admin: change user role | `/admin/users` | P0 |
| E2E-13 | Admin: connect Drive folder | `/admin/drive` | P0 |
| E2E-14 | Admin: edit content policy | `/admin/policies` | P1 |
| E2E-15 | Admin: view ingestion progress (SSE) | `/admin/ingestion` | P1 |
| E2E-16 | Admin: cost dashboard charts render | `/admin/cost` | P1 |
| E2E-17 | Admin: export audit log | `/admin/audit` | P1 |
| E2E-18 | Admin: view lint report | `/admin/lint` | P2 |
| E2E-19 | Navigation: sidebar collapse/expand | All pages | P1 |
| E2E-20 | Navigation: mobile hamburger menu | All pages | P1 |
| E2E-21 | i18n: switch language without reload | All pages | P1 |
| E2E-22 | Theme: toggle dark mode | All pages | P2 |
| E2E-23 | Search: global search (Cmd+K) | All pages | P1 |
| E2E-24 | Auth: session timeout and re-login | All pages | P1 |
| E2E-25 | Setup: complete setup wizard (all steps) | `/setup` | P0 |

## 9.6 Visual Regression Testing

ใช้ Playwright visual comparison (`toHaveScreenshot()`) สำหรับ:
- ทุก component ใน Storybook (ถ้ามี) หรือ standalone test pages
- ทุก page ใน light + dark mode
- ทุก page ที่ 3 breakpoints (mobile 375px, tablet 768px, desktop 1280px)
- Compare ทุก PR กับ baseline screenshots

## 9.7 Accessibility Testing

```typescript
// ใช้ axe-core ใน Vitest
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<ChatPanel />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

Playwright E2E ก็ต้องรัน accessibility audit:

```typescript
// e2e/accessibility.spec.ts
import AxeBuilder from '@axe-core/playwright';

test('chat page has no a11y violations', async ({ page }) => {
  await page.goto('/chat');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## 9.8 Coverage Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Components (`src/components/`) | 80% | UI components ต้อง test render + interactions |
| Hooks (`src/hooks/`, `src/features/*/hooks/`) | 90% | Business logic ต้อง test ให้ครบ |
| Stores (`src/stores/`) | 90% | State management ต้อง predictable |
| Services (`src/services/`) | 85% | API layer ต้อง handle edge cases |
| Utils (`src/utils/`) | 95% | Pure functions ต้อง test ง่าย + ครบ |
| Pages (`src/app/routes/`) | 70% | Integration level -- E2E covers the rest |
| Overall | 80% | Minimum acceptable |

---

# 10. Performance Requirements

## 10.1 Bundle Size Budget

| Chunk | Budget | Contents |
|-------|--------|----------|
| Initial (vendor) | < 80KB gzipped | React, React-DOM, TanStack Router core |
| Initial (app) | < 40KB gzipped | Root layout, auth, minimal components |
| Chat page | < 50KB gzipped | ChatPanel, streaming, markdown |
| Wiki page | < 60KB gzipped | MarkdownRenderer, rehype plugins, syntax highlighting |
| Admin pages | < 80KB gzipped | Recharts, DataTable, forms |
| i18n (per locale) | < 10KB gzipped | Translation JSON |
| **Total initial** | **< 200KB gzipped** | First paint |

## 10.2 Code Splitting Strategy

1. **Route-level splitting:** ทุก page component ใช้ `lazyRouteComponent()`
2. **Feature-level splitting:** Recharts, DOMPurify, rehype plugins loaded เมื่อจำเป็น
3. **Locale splitting:** load เฉพาะ locale ที่ user เลือก
4. **Dynamic imports:**
   - `PageVersionDiff` -- load เมื่อ user click "View History"
   - `DriveFolderPicker` -- load เมื่อ admin opens folder picker modal
   - Syntax highlighting themes -- load เมื่อ wiki page มี code blocks

## 10.3 Image Optimization

- ทุก illustration ใช้ SVG (scalable, small file size)
- User avatars: load จาก Google profile URL ด้วย `loading="lazy"` + `srcset` สำหรับ 1x/2x
- Logo: inline SVG ใน header (ไม่ต้อง HTTP request)
- Favicon: `.ico` สำหรับ compatibility + `.svg` สำหรับ modern browsers

## 10.4 Virtual Scrolling

ใช้ `react-virtuoso` สำหรับ:

1. **Wiki index** (grid/list view) -- pages อาจมี 50,000+
2. **Chat message list** -- sessions อาจยาวมาก
3. **Audit log table** -- อาจมี 100,000+ entries
4. **Drive folder tree** -- nested folders อาจลึก

```typescript
// Example: Virtual wiki page list
import { Virtuoso } from 'react-virtuoso';

<Virtuoso
  data={pages}
  endReached={loadMore}
  itemContent={(index, page) => <PageCard key={page.id} page={page} />}
  components={{
    Footer: () => hasNextPage ? <LoadingSkeleton variant="card" /> : null,
  }}
  overscan={200} // px of pre-rendered content
/>
```

## 10.5 Prefetching Strategy

| Trigger | Prefetch | Method |
|---------|----------|--------|
| Hover on nav item (200ms) | Route data | `router.preloadRoute()` |
| Hover on wiki page card (200ms) | Wiki page content | `queryClient.prefetchQuery()` |
| Chat page load | Suggested queries | `queryClient.prefetchQuery()` |
| Admin layout load | Overview data | `queryClient.prefetchQuery()` |

## 10.6 Core Web Vitals Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | Code splitting, font preload, skeleton UI |
| FID (First Input Delay) | < 100ms | No heavy JS on main thread, Web Workers for markdown parsing |
| CLS (Cumulative Layout Shift) | < 0.1 | Skeleton dimensions match content, font display swap, fixed sidebar width |
| TTFB (Time to First Byte) | < 600ms | CDN edge caching for static assets |
| INP (Interaction to Next Paint) | < 200ms | Optimistic updates, minimal re-renders |

## 10.7 SSE Connection Management

```typescript
// Reconnection with exponential backoff
const reconnectPolicy = {
  maxRetries: 10,
  initialDelay: 1000,   // 1s
  maxDelay: 30000,       // 30s
  backoffMultiplier: 2,
  jitter: true,          // +/- 20% randomization เพื่อกัน thundering herd
};

// Connection lifecycle:
// 1. Connect on page mount (if enabled)
// 2. Listen for messages
// 3. On error: start reconnect timer
// 4. On page visibility change (hidden): disconnect after 60s
// 5. On page visibility change (visible): reconnect immediately
// 6. On unmount: clean disconnect
```

---

# 11. Security (Frontend)

## 11.1 XSS Prevention

Wiki pages render user-generated markdown content -- ต้อง sanitize ก่อน render:

```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'a', 'ul', 'ol', 'li', 'blockquote',
  'pre', 'code', 'em', 'strong', 'del',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'br', 'hr', 'span', 'div',
  'sup', 'sub',
];

const ALLOWED_ATTRS = [
  'href', 'title', 'alt', 'src', 'class',
  'id', 'target', 'rel',
  'data-citation-id', 'data-page-id', // custom data attributes for wiki links
];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

// Force external links to open in new tab with noopener
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('http')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});
```

## 11.2 CSRF Token Handling

Backend ส่ง CSRF token ผ่าน cookie (`XSRF-TOKEN`) ที่ไม่ใช่ httpOnly:

```typescript
// httpClient.ts -- request interceptor
private getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// ทุก mutation request (POST/PUT/DELETE) ใส่ header:
headers['X-XSRF-TOKEN'] = this.getCsrfToken();
```

## 11.3 Content Security Policy

แนะนำ CSP headers ที่ backend ส่งมา:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://lh3.googleusercontent.com data:;
  font-src 'self';
  connect-src 'self' https://accounts.google.com https://*.googleapis.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```

## 11.4 Secure Token Storage

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| httpOnly cookie | ปลอดภัยจาก XSS, auto-send | ต้อง CSRF protection, same-site issues | **CHOSEN** |
| localStorage | ง่ายต่อ implement, cross-tab | XSS vulnerable, manual header | REJECTED |
| sessionStorage | Auto-clear on tab close | XSS vulnerable, no cross-tab | REJECTED |

**Decision:** ใช้ httpOnly, Secure, SameSite=Lax cookie สำหรับ JWT storage โดย backend เป็นคน set cookie ผ่าน `Set-Cookie` header ใน OAuth callback response

## 11.5 Client-Side Rate Limiting

```typescript
// ป้องกัน user spam click หรือ rapid-fire requests

// Chat: 1 message per second
const chatRateLimit = {
  windowMs: 1000,
  maxRequests: 1,
};

// Search: 3 requests per second (with debounce)
const searchRateLimit = {
  windowMs: 1000,
  maxRequests: 3,
};

// Admin actions: 5 requests per second
const adminRateLimit = {
  windowMs: 1000,
  maxRequests: 5,
};

// Implementation: disable button after send, re-enable after response/timeout
// Search: useDebounce(300ms) ก่อน send request
```

## 11.6 Input Sanitization Patterns

- ทุก text input ใช้ zod validation + `trim()` + `maxLength`
- Search queries: strip HTML tags, limit to 500 characters
- Content policy patterns: validate as glob patterns (ไม่ใช่ regex เพื่อป้องกัน ReDoS)
- File names: sanitize special characters before display

---

# 12. Deployment & CI/CD

## 12.1 Build Configuration (Vite)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    TanStackRouterVite(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: mode === 'production' ? 'hidden' : true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          charts: ['recharts'],
          markdown: ['react-markdown', 'rehype-raw', 'rehype-highlight', 'remark-gfm'],
        },
      },
    },
    chunkSizeWarningLimit: 200, // KB -- warn if any chunk exceeds 200KB
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}));
```

## 12.2 Environment Variables

```bash
# .env.example

# API
VITE_API_URL=http://localhost:3000/api

# Google OAuth (for redirect URL construction)
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com

# Feature flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_WIKI_DIFF=true
VITE_ENABLE_COST_DASHBOARD=true

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=

# Environment
VITE_ENV=development
```

## 12.3 Docker Configuration

```dockerfile
# Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN pnpm build

# Stage 2: Serve
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets with long cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/html text/css application/javascript application/json image/svg+xml;
    gzip_min_length 256;
}
```

## 12.4 Cloud Run Deployment

```yaml
# cloudbuild.yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '--build-arg', 'VITE_API_URL=${_API_URL}',
      '--build-arg', 'VITE_GOOGLE_CLIENT_ID=${_GOOGLE_CLIENT_ID}',
      '-t', 'asia-southeast1-docker.pkg.dev/${PROJECT_ID}/drivewiki/frontend:${SHORT_SHA}',
      '.'
    ]

  # Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'asia-southeast1-docker.pkg.dev/${PROJECT_ID}/drivewiki/frontend:${SHORT_SHA}']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args: [
      'run', 'deploy', 'drivewiki-frontend',
      '--image', 'asia-southeast1-docker.pkg.dev/${PROJECT_ID}/drivewiki/frontend:${SHORT_SHA}',
      '--region', 'asia-southeast1',
      '--platform', 'managed',
      '--port', '8080',
      '--memory', '256Mi',
      '--cpu', '1',
      '--min-instances', '1',
      '--max-instances', '10',
      '--allow-unauthenticated'
    ]
```

## 12.5 Asset CDN Strategy

- Static assets (`/assets/`) served จาก Cloud CDN ผ่าน Cloud Run (auto-configured)
- Font files: `Cache-Control: public, max-age=31536000, immutable` (1 year)
- JS/CSS chunks: content-hashed filenames + `Cache-Control: public, max-age=31536000, immutable`
- `index.html`: `Cache-Control: no-cache` (ต้อง revalidate ทุกครั้ง เพื่อให้ได้ latest chunk references)

## 12.6 Cache Headers Strategy

| Resource | Cache-Control | Rationale |
|----------|---------------|-----------|
| `index.html` | `no-cache, must-revalidate` | ต้องได้ latest version ทุกครั้ง |
| `/assets/*.js` | `public, max-age=31536000, immutable` | Content-hashed, safe to cache forever |
| `/assets/*.css` | `public, max-age=31536000, immutable` | Content-hashed |
| `/assets/*.woff2` | `public, max-age=31536000, immutable` | Fonts rarely change |
| `/assets/*.svg` | `public, max-age=86400` | Illustrations may update |
| API responses | `private, no-store` | Dynamic data, user-specific |

---

# Do's and Don'ts

## Do's

- DO ใช้ TypeScript strict mode ทุกที่ -- `"strict": true` ใน tsconfig
- DO ใช้ named exports สำหรับ components (ไม่ใช้ default export) เพื่อ better tree-shaking
- DO ใช้ `React.memo()` สำหรับ components ที่ render บ่อยใน lists (PageCard, MessageBubble)
- DO เขียน unit test สำหรับทุก custom hook ก่อน integrate กับ component
- DO ใช้ semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`) ไม่ใช่ `<div>` ทุกที่
- DO ใช้ `aria-*` attributes สำหรับ interactive elements ที่ไม่ใช่ native HTML (custom dropdowns, tabs)
- DO ใช้ error boundary ทุก page-level component เพื่อป้องกัน white screen of death
- DO validate ทุก form input ด้วย zod schema ก่อน submit
- DO ใช้ `Suspense` boundary สำหรับ lazy-loaded routes
- DO test ทั้ง Thai และ English text rendering ใน components ที่แสดง dynamic content
- DO ใช้ CSS logical properties (`inline`, `block`) แทน `left/right` เพื่อ future RTL support
- DO เก็บ design tokens ใน CSS custom properties (single source of truth)

## Don'ts

- DO NOT import entire icon library -- ใช้ individual imports จาก lucide-react
- DO NOT ใช้ `any` type -- ใช้ `unknown` + type narrowing หรือ proper interfaces
- DO NOT เก็บ sensitive data ใน localStorage (tokens, PII)
- DO NOT render raw HTML จาก API response โดยไม่ผ่าน DOMPurify
- DO NOT ใช้ inline styles ยกเว้น dynamic values (เช่น progress bar width)
- DO NOT สร้าง component ที่มี props มากกว่า 10 ตัว -- decompose เป็น sub-components
- DO NOT ใช้ `useEffect` สำหรับ data fetching -- ใช้ TanStack Query
- DO NOT ใช้ `useState` สำหรับ server state -- ใช้ TanStack Query
- DO NOT hardcode strings -- ใช้ i18n keys ทุกที่
- DO NOT ignore TypeScript errors -- fix หรือ document ว่าทำไมต้อง suppress
- DO NOT ใช้ `index` เป็น React `key` ใน lists ที่มี reorder/filter
- DO NOT ใส่ business logic ใน components -- แยกไปใน hooks หรือ services
- DO NOT skip loading/error/empty states -- ทุก async UI ต้องมีครบ 3 states

---

# Agent Prompt Guide (Handoff Prompts)

ใช้ prompts ด้านล่างนี้เพื่อ delegate งานให้ Spider-Man (implementation) หรือ Thor (testing):

### Prompt 1: Spider-Man -- Scaffold Project

```
Scaffold the DriveWiki frontend project according to drivewiki-frontend-spec.md Section 1.
Use: pnpm create vite drivewiki-frontend --template react-ts
Install all dependencies from the tech stack.
Create the full directory structure.
Configure Vite, Tailwind CSS 4, TanStack Router (file-based), tsconfig with aliases.
Set up shadcn/ui with the design tokens from Section 2.
Create globals.css with all CSS custom properties (light + dark mode).
Commit as "chore: scaffold DriveWiki frontend project structure".
```

### Prompt 2: Spider-Man -- Implement Design System + Layout

```
Implement the design system and layout components from drivewiki-frontend-spec.md Sections 2 and 3.1-3.2.
Build: AppShell, Sidebar, Header, PageContainer, BreadcrumbNav, MobileNav.
Include: responsive behavior, dark mode, sidebar collapse animation (Framer Motion).
Wire up uiStore for sidebar/theme/locale state.
Test each component with Vitest + Testing Library.
Commit as "feat: implement layout shell + design system".
```

### Prompt 3: Spider-Man -- Implement Chat Feature

```
Implement the Chat feature from drivewiki-frontend-spec.md Sections 3.4, 4.4, 5.5.
Build: ChatPanel, MessageBubble, ChatInput, StreamingText, SuggestedQueries, CitationPanel.
Implement useStreamResponse hook with SSE streaming (Section 5.5 code example).
Wire up chatStore + chatService.
Handle: empty state, streaming state, error state, citation panel toggle.
Test streaming hook with mocked ReadableStream.
Commit as "feat: implement chat interface with SSE streaming".
```

### Prompt 4: Spider-Man -- Implement Wiki Feature

```
Implement the Wiki feature from drivewiki-frontend-spec.md Sections 3.5, 4.5-4.7.
Build: WikiPageView, WikiIndex, CrossRefSidebar, WikiSearch, MarkdownRenderer.
Set up react-markdown + rehype-raw + rehype-highlight + remark-gfm.
Implement DOMPurify sanitization (Section 11.1).
Wire up wikiStore + wikiService.
Use react-virtuoso for wiki index infinite scroll.
Commit as "feat: implement wiki browsing + markdown rendering".
```

### Prompt 5: Thor -- Write E2E Tests

```
Write Playwright E2E tests for DriveWiki frontend per drivewiki-frontend-spec.md Section 9.5.
Cover all 25 scenarios listed in the E2E test table.
Set up auth fixtures (mock Google OAuth).
Set up MSW for API mocking in Playwright context.
Include accessibility audit (axe-core) for chat and wiki pages.
Include visual regression snapshots for critical pages.
Target: all P0 scenarios must pass, P1 scenarios should pass.
Commit as "test: implement Playwright E2E test suite".
```

---

## Layer / Responsibility / Interface

| Layer | Responsibility | Interface |
|-------|----------------|-----------|
| Routes | URL mapping + auth guards + code splitting | TanStack Router file-based |
| Pages | Data orchestration + layout composition | React components + TanStack Query |
| Components | UI rendering + local interaction | Props interface (TypeScript) |
| Hooks | Reusable stateful logic | Custom React hooks |
| Stores | Client-side state (cross-component) | Zustand stores |
| Services | API communication + response mapping | HTTP client + TypeScript interfaces |
| Utils | Pure transformations (no side effects) | TypeScript functions |

## Trust Zone / Auth / Data Access

| Zone | Auth | Data Access |
|------|------|-------------|
| Public (login, consent) | None | No data |
| Viewer | JWT (httpOnly cookie) | Read own department wiki + chat |
| Member | JWT | Read/write own department |
| DeptHead | JWT + role check | Own department + policies |
| Admin | JWT + role check | All departments, user mgmt |
| SuperAdmin | JWT + role check | Full system access + setup |

## Severity / Handler / Escalation

| Severity | Handler | Escalation |
|----------|---------|------------|
| P0 (app crash) | ErrorBoundary catch + error page | Alert dev team via monitoring |
| P1 (feature broken) | Per-component error state + retry | Log to analytics + toast |
| P2 (degraded UX) | Fallback UI (skeleton/empty) | Log to analytics |
| P3 (cosmetic) | CSS fix in next sprint | Ticket only |
