---
name: aegis-reengineer
trigger: /aegis-reengineer
description: >
  Re-engineer an existing project — upgrade tech stack, add features, improve performance.
  100% local. Beast scans current state → Iron Man drafts target architecture → Loki critiques →
  Iron Man writes the full re-engineering spec → AEGIS pipeline executes.
agents: [nick-fury, beast, iron-man, loki, coulson]
---

# /aegis-reengineer

## Purpose
Systematically upgrade an existing project. **100% local** — no cloud uploads, no
ultraplan, no GitHub-app dependency. The full pipeline runs inside Claude Code on
your machine.

1. Scanning current state comprehensively (Beast)
2. Drafting target architecture (Iron Man, `ultrathink`)
3. Adversarial stress-test of the plan (Loki, `ultrathink`)
4. Writing the full re-engineering spec (Iron Man, `ultrathink`)
5. Executing via AEGIS pipeline

---

## Phase 1 — Beast: Current State Scan

Nick Fury dispatches Beast with:

```
Task for Beast:
Scan this entire codebase and generate a comprehensive re-engineering report.
Save to: _aegis-output/research/reengineer-current-state.md

Report must include ALL of these sections:

### 1. Tech Stack Inventory
- Language + version
- Framework + version
- All dependencies (package.json / requirements.txt / go.mod / etc.)
- Database + ORM
- Infrastructure (Docker, CI/CD, cloud)
- Dev tools (linter, formatter, test runner)

### 2. Features & Functions Map
For each module/file: list every public function, API endpoint, component.
Format:
  module: src/auth/
    - POST /auth/login — validates credentials, returns JWT
    - POST /auth/refresh — rotates refresh token
    - middleware/auth.js — verifies Bearer token on protected routes

### 3. Performance Profile
- Identify N+1 queries (scan ORM calls in loops)
- Large dependencies (bundle size issues)
- Missing indexes (scan raw SQL / migration files)
- Synchronous blocking operations
- Missing caching (repeated expensive queries)

### 4. Tech Debt
- TODO/FIXME count and locations
- Outdated dependencies (flag anything >1 major version behind)
- Duplicate code patterns
- Untested modules (no test files)

### 5. Architecture Weaknesses
- Tight coupling between modules
- Missing error boundaries
- No rate limiting / auth on public endpoints
- Hardcoded config (env vars not used)

Save the report. Signal Nick Fury when done: "PHASE 1 COMPLETE — report at _aegis-output/research/reengineer-current-state.md"
```

---

## Phase 2 — Iron Man: Target Architecture Draft

After Beast signals PHASE 1 COMPLETE, Nick Fury dispatches Iron Man:

```
Task for Iron Man (ultrathink):
Read: _aegis-output/research/reengineer-current-state.md

Based on the current state analysis, draft a target architecture for re-engineering.
Save to: _aegis-output/architecture/reengineer-target-state.md

Draft must cover:

### 1. Proposed Tech Stack
- What to keep (and why)
- What to upgrade (old → new, with rationale)
- What to replace entirely (with migration path)

### 2. New Features to Add
- List each feature
- Why it's needed (gap in current system)
- Estimated complexity (S/M/L)

### 3. Performance Targets
- Current baseline (from Beast report)
- Target metric (e.g., "API p95 < 200ms", "bundle < 200KB")
- How to achieve (specific techniques)

### 4. Re-Engineering Strategy
- Big bang rewrite vs incremental migration
- Module execution order (what to tackle first)
- Backwards compatibility requirements
- Data migration plan (if schema changes)

### 5. Risk Assessment
- What could break during migration
- Rollback strategy per phase
- Estimated total story points

Use ultrathink for this task.
Signal Nick Fury when done: "PHASE 2 COMPLETE — draft at _aegis-output/architecture/reengineer-target-state.md"
```

---

## Phase 3 — Loki: Adversarial Review

After Iron Man signals PHASE 2 COMPLETE, Nick Fury dispatches Loki:

```
Task for Loki (ultrathink):
Read both files:
  - _aegis-output/research/reengineer-current-state.md
  - _aegis-output/architecture/reengineer-target-state.md

Stress-test the re-engineering plan. Find everything that could go wrong.
Save findings to: _aegis-output/adversarial/reengineer-loki-review.md

Challenge:
- Is the migration strategy realistic for this codebase size?
- Will the new tech stack introduce new problems?
- Are the performance targets achievable with the proposed changes?
- What's the worst-case data migration failure scenario?
- What features might regress during re-engineering?
- Is the execution order correct? (dependencies between modules)

Respond with PLAN_APPROVAL_RESPONSE:
  Verdict: APPROVE | CONDITIONAL | REJECT
  Conditions: [if CONDITIONAL]
  Blockers: [if REJECT]

Signal Nick Fury when done.
```

If REJECT → loop back to Phase 2 (Iron Man revises target state, max 2 rounds).

---

## Phase 4 — Iron Man: Full Re-Engineering Spec (LOCAL)

After Loki gives APPROVE or CONDITIONAL, Nick Fury dispatches Iron Man one more
time to write the **full executable re-engineering spec** locally — no cloud
upload, no ultraplan.

```
Task for Iron Man (ultrathink, second pass):
Read all three artifacts:
  - _aegis-output/research/reengineer-current-state.md   (Beast scan)
  - _aegis-output/architecture/reengineer-target-state.md (your Phase 2 draft)
  - _aegis-output/adversarial/reengineer-loki-review.md  (Loki's verdict + conditions)

Write a complete, executable re-engineering specification.
Save to: _aegis-output/specs/reengineer-master-spec.md

The spec must contain (machine-actionable, no hand-waving):

### 1. File-Level Change Manifest
For every file affected, one of:
  - CREATE  path/to/file.ts  — purpose, exports, key functions
  - MODIFY  path/to/file.ts  — what changes, what stays
  - DELETE  path/to/file.ts  — replacement (or 'no replacement')
  - RENAME  old/path → new/path

### 2. Migration Steps in Order
Numbered, dependency-respecting steps. Each step:
  - Step N: <action>
    - Files touched
    - Validation: how to verify this step worked
    - Rollback: how to undo if it fails

### 3. Test Strategy Per Phase
For each migration phase:
  - Unit tests required
  - Integration tests required
  - Smoke tests (post-deploy)
  - Performance regression tests

### 4. Rollback Checkpoints
Mark explicit checkpoints where the system is in a known-good state.
Rollback = revert to previous checkpoint, not random commits.

### 5. Definition of Done Per Phase
Concrete checklist — when this phase is "done":
  - [ ] All tests pass
  - [ ] Performance baseline met
  - [ ] Loki concerns addressed
  - [ ] Coulson docs updated

### 6. Do's and Don'ts (MANDATORY guardrails)
Two bulleted lists, 5–12 items each. Concrete and verifiable.
Example:
  ✅ Do:
    - Use strangler-fig migration — new routes on /api/v2/, legacy on /api/v1/
    - Run data migration scripts idempotently (checkpoint file + resume flag)
    - Validate every migration step against contract tests vs v1 responses
  ❌ Don't:
    - Don't delete legacy code until target state is stable for 2 sprints
    - Don't migrate auth in the same sprint as the primary data model
    - Don't skip the dry-run phase of mongo-to-pg.ts

### 7. Agent Prompt Guide (for Thor, Spider-Man, Coulson)
Final section. List 3–7 ready-to-execute prompts that downstream agents can
copy-paste verbatim. This compresses the spec→build handoff from hours to
minutes. Example:

```
### Prompts for Spider-Man (implementation)
- "Scaffold the src/db/schema.ts per Section 1 CREATE manifest. Use Drizzle
   with the types defined in §4.1. Include row-level lock helper from §3.2."
- "Implement the mongo-to-pg.ts migration per Section 2 Step 23. Batch size 500,
   checkpoint file at _aegis-brain/migrations/mongo-pg-checkpoint.json, idempotent."
- "Create contract tests for /api/v2/orders vs /api/v1/orders per §3 Test Strategy.
   Byte-equal response bodies for the same input."

### Prompts for Thor (deployment)
- "Deploy Checkpoint A (PG + Mongo dual-write) to staging. Validation: run
   smoke test suite §3.1 twice with 1h gap. Monitor error rate < 0.01%."
- "Prepare rollback for Checkpoint B: script to re-route all /api/v2 traffic
   back to /api/v1, verify Mongo writes still flowing."

### Prompts for Coulson (ISO docs)
- "Update SI.02 traceability matrix: link new FR-011, FR-012 (from §1 CREATE)
   to test cases in §3. Mark Iron Man as author, 2026-04-08."
```

Apply Loki's CONDITIONAL conditions (if any) directly into the spec.

Use ultrathink. Take your time — this spec drives the entire re-engineering.

Signal Nick Fury when done: "PHASE 4 COMPLETE — master spec at _aegis-output/specs/reengineer-master-spec.md"
```

---

## Phase 5 — AEGIS Pipeline: Execute

After the master spec is approved (Loki re-validates the spec, not just the draft):

```
1. Coulson: Convert master spec → PM.01 + SI.01 + SI.02
2. /aegis-breakdown: Break spec into Epics → Tasks → Sub-tasks
3. /aegis-sprint plan: Prioritize by dependency order from spec Section 2
4. Execute sprint by sprint:
   - Iron Man validates each task spec against master spec
   - Loki gates each spec (Plan-Approval Gate)
   - Spider-Man implements
   - Black Panther reviews (Gate 1)
   - War Machine + Vision QA (Gate 2)
   - Coulson updates ISO docs (Gate 3)
5. After each sprint: Thor deploys to staging, validates health
6. Only after staging stable: promote to production
```

---

## Quick Start Command

To trigger this workflow, just tell Nick Fury:

```
/aegis-reengineer — upgrade this project: modernize to [tech stack], add [features], target [performance goal]
```

Nick Fury will automatically run Phase 1–5 in order.

---

## Why Not ultraplan?

`ultraplan` is an Anthropic cloud feature that uploads your codebase to claude.ai.
**AEGIS prohibits cloud uploads** — local-first, no data egress. Iron Man with
`ultrathink` can produce the same quality of spec entirely locally. The trade-off
is time (one extra Iron Man pass) for **zero data leakage**.

---

## When the Pipeline Can Be Shortened

| Scenario | Skip |
|----------|------|
| Project < 20 files | Skip Phase 4 — use Phase 2 draft directly as spec |
| Re-engineering scope = 1 module only | Use `/aegis-breakdown` directly, skip Phases 1–4 |
| Loki REJECTs twice in a row | Stop, escalate to human — design has a fundamental flaw |

---

## Output Files

| Phase | Agent | Output |
|-------|-------|--------|
| 1 | Beast | `_aegis-output/research/reengineer-current-state.md` |
| 2 | Iron Man | `_aegis-output/architecture/reengineer-target-state.md` |
| 3 | Loki | `_aegis-output/adversarial/reengineer-loki-review.md` |
| 4 | Iron Man | `_aegis-output/specs/reengineer-master-spec.md` |
| 5 | Coulson | `_aegis-output/iso-docs/PM-01.../SI-01.../SI-02...` |
