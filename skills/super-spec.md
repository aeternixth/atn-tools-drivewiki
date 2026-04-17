---
name: super-spec
description: "Research-driven spec engine: BRD + SRS + UX Blueprint from minimal input"
profile: standard
triggers:
  en: ["write spec", "create spec", "BRD", "SRS", "requirements", "specification"]
  th: ["เขียน spec", "ข้อกำหนด", "เขียนข้อกำหนด", "สร้าง spec"]
---

## Quick Reference
Generates complete project specifications from minimal input.
- **BRD**: Business Requirements Document — stakeholder goals, scope, success criteria
- **SRS**: Software Requirements Specification — functional/non-functional requirements
- **UX Blueprint**: User flows, wireframe descriptions, interaction patterns
- **Pipeline**: Brief → **Human Q&A** → Research → BRD → SRS → UX Blueprint
- **Output**: `_aegis-output/specs/` (BRD.md, SRS.md, UX-Blueprint.md)
- **Agent**: Iron Man (opus) — primary author

## CRITICAL: Human-in-the-Loop Rule

**Super-spec is the ONE phase where human input is MANDATORY.**

```
┌─────────────────────────────────────────────────────────────┐
│  AUTONOMY EXCEPTION: Even at L3/L4, super-spec MUST ask    │
│  the human for input. The spec is the foundation — garbage  │
│  in = garbage out for the entire pipeline.                  │
│                                                             │
│  Mother Brain: PAUSE autonomy during spec creation.         │
│  After spec is approved: resume full autonomy.              │
│  Mother Brain becomes "Spec Proxy" — answers all team       │
│  questions using the approved spec + her own research.      │
└─────────────────────────────────────────────────────────────┘
```

**Why:** The spec defines WHAT to build. Only the human knows business context,
user needs, and success criteria. AI can research and draft, but the human
must validate and fill gaps. Every minute spent here saves hours of rework later.

## Full Instructions

### Invocation

```
/super-spec [brd|srs|ux|all] "<project brief>"
```
- `brd` — Generate BRD only
- `srs` — Generate SRS (requires BRD)
- `ux` — Generate UX Blueprint (requires BRD)
- `all` — Full pipeline: BRD → SRS → UX Blueprint (default)

### Phase 1: Human Interview (MANDATORY — never skip)

**This phase is interactive. ASK the human. WAIT for answers. Do NOT guess.**

#### Step 1a: Parse & Research First
1. **Parse brief** — Extract key nouns, verbs, constraints
2. **Research** — Analyze similar systems, common patterns, competitors
3. **Identify gaps** — What information is the brief missing?

#### Step 1b: Ask the Human (MUST wait for real answers)

Present questions in a structured, easy-to-answer format. Group by category.
The human's answers become the foundation of the spec — do NOT fabricate them.

```
I've analyzed your brief and researched similar systems.
Before I write the spec, I need your input on these areas:

📌 BUSINESS CONTEXT
1. Who are the primary users? (roles, demographics, tech level)
2. What specific problem does this solve for them?
3. How do they solve this problem today? (current alternatives)

📌 SCOPE & PRIORITIES
4. What are the MUST-HAVE features for v1? (top 3-5)
5. What is explicitly OUT of scope?
6. Is there an existing system this replaces or integrates with?

📌 CONSTRAINTS
7. Tech stack preference? (language, framework, hosting)
8. Timeline pressure? (deadline, phases)
9. Budget/team size constraints?

📌 SUCCESS
10. How will you measure if this project succeeded?

Feel free to answer briefly — even one-liners help.
Skip any that don't apply with "N/A".
```

**Rules for this step:**
- WAIT for the human to respond. Do NOT proceed without answers.
- If the human says "you decide" or "whatever you think", still ask:
  "I'll make my best recommendation, but I need at least answers to #1, #2, and #4
  to avoid building the wrong thing."
- Minimum required answers: **#1 (users), #2 (problem), #4 (must-haves)**
- If human provides partial answers, acknowledge what you got and ask
  follow-ups only for critical gaps.
- Save all human answers to `_aegis-output/specs/human-input.md` for traceability.

#### Step 1c: Confirm Understanding

After receiving answers, summarize back to the human:

```
Here's my understanding before I write the spec:

- **Building**: [summary]
- **For**: [users]
- **Core problem**: [problem]
- **Must-haves**: [list]
- **Tech**: [stack]
- **Success = **: [metrics]

Does this look right? Any corrections before I proceed?
```

**Only proceed to Phase 2 after human confirms.** This is a gate.

### Phase 2: BRD (Business Requirements Document)

```markdown
# Business Requirements Document
**Project**: <name>
**Version**: 1.0
**Date**: YYYY-MM-DD
**Author**: Iron Man (AEGIS)

## 1. Executive Summary
<2-3 paragraphs: what, why, for whom>

## 2. Business Objectives
- <objective 1 — measurable>
- <objective 2 — measurable>
- <objective 3 — measurable>

## 3. Stakeholders
| Role | Needs | Priority |
|------|-------|----------|
| <role> | <needs> | High/Medium/Low |

## 4. Scope
### In Scope
- <feature/capability>

### Out of Scope
- <explicitly excluded>

## 5. Success Criteria
| Metric | Target | Measurement |
|--------|--------|-------------|
| <metric> | <target value> | <how measured> |

## 6. Assumptions & Constraints
### Assumptions
- <assumption>

### Constraints
- <constraint>

## 7. Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| <risk> | High/Med/Low | High/Med/Low | <strategy> |

## 8. Timeline
| Phase | Duration | Deliverables |
|-------|----------|-------------|
| <phase> | <weeks> | <deliverables> |
```

### Phase 3: SRS (Software Requirements Specification)

```markdown
# Software Requirements Specification
**Project**: <name>
**Version**: 1.0
**Date**: YYYY-MM-DD
**Based on**: BRD v1.0

## 1. System Overview
<Architecture overview, tech stack recommendations>

## 2. Functional Requirements

### FR-001: <Feature Name>
- **Description**: <what the system shall do>
- **Input**: <expected input>
- **Processing**: <business logic>
- **Output**: <expected output>
- **Priority**: Must Have / Should Have / Nice to Have
- **Acceptance Criteria**:
  - GIVEN <context> WHEN <action> THEN <result>

### FR-002: ...

## 3. Non-Functional Requirements

### Performance
- NFR-P01: Response time < <X>ms for 95th percentile
- NFR-P02: Support <N> concurrent users

### Security
- NFR-S01: Authentication via <method>
- NFR-S02: Data encryption at rest and in transit

### Scalability
- NFR-SC01: Horizontal scaling to <N> instances

### Reliability
- NFR-R01: 99.9% uptime SLA
- NFR-R02: Recovery time < <X> minutes

### Maintainability
- NFR-M01: Test coverage > 80%
- NFR-M02: Documentation for all public APIs

## 4. Data Models
### Entity: <Name>
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| <field> | <type> | <constraints> | <description> |

## 5. API Specifications
### <METHOD> <endpoint>
- **Purpose**: <description>
- **Auth**: Required/Public
- **Request**: <schema>
- **Response**: <schema>
- **Errors**: <error codes>

## 6. Integration Points
| System | Protocol | Purpose |
|--------|----------|---------|
| <system> | REST/gRPC/MQ | <purpose> |

## 7. Dependency Matrix
| Requirement | Depends On | Blocked By |
|-------------|-----------|------------|
| <FR-XXX> | <FR-YYY> | <none/FR-ZZZ> |
```

### Phase 4: UX Blueprint

```markdown
# UX Blueprint
**Project**: <name>
**Version**: 1.0
**Date**: YYYY-MM-DD
**Based on**: BRD v1.0, SRS v1.0

## 1. User Personas
### Persona: <Name>
- **Role**: <role>
- **Goals**: <what they want to achieve>
- **Pain Points**: <current frustrations>
- **Tech Proficiency**: Low/Medium/High

## 2. User Flows

### Flow: <Name>
```
[Start] → [Step 1] → [Decision?]
                        ├─ Yes → [Step 2a] → [End]
                        └─ No  → [Step 2b] → [Step 3] → [End]
```

## 3. Screen Inventory
| Screen | Purpose | Key Components | Navigation |
|--------|---------|---------------|------------|
| <screen> | <purpose> | <components> | <from/to> |

## 4. Wireframe Descriptions
### Screen: <Name>
- **Layout**: <grid/flex description>
- **Header**: <contents>
- **Main content**: <components and arrangement>
- **Actions**: <buttons, forms>
- **States**: <loading, empty, error, success>

## 5. Interaction Patterns
| Pattern | Usage | Behavior |
|---------|-------|----------|
| <pattern> | <where used> | <how it works> |

## 6. Responsive Strategy
- **Mobile** (< 768px): <approach>
- **Tablet** (768-1024px): <approach>
- **Desktop** (> 1024px): <approach>

## 7. Accessibility
- WCAG 2.1 AA compliance targets
- Keyboard navigation for all interactive elements
- Screen reader support with ARIA labels
- Color contrast ratios ≥ 4.5:1

## 8. Do's and Don'ts (MANDATORY — machine-readable guardrails)

Every BRD/SRS/UX-Blueprint MUST end with this section. Loki enforces it
during Plan-Approval Gate review. Two bulleted lists, 5–12 items each,
concrete and verifiable.

### ✅ Do
- Use JWT refresh token rotation with 15-minute access tokens
- Validate all API inputs via Zod schemas at the route boundary
- Log auth events (success + failure) to the audit trail
- ...

### ❌ Don't
- Don't store passwords reversibly — argon2id only
- Don't trust client-supplied user IDs for authorization decisions
- Don't expose internal IDs in URLs (use UUIDs or opaque tokens)
- Don't rely on email for uniqueness — use a canonical user ID
- ...

Format rules (Loki checks these):
- Every bullet is imperative and verifiable
- No "should" or "try to" — use "do" or "don't"
- Bullets address non-obvious choices (not platitudes like "write tests")
- If a Do/Don't is framework-specific, name the framework
```

### Output Location

All specs are saved to:
```
_aegis-output/specs/
  BRD.md
  SRS.md
  UX-Blueprint.md
  DESIGN.md             # optional — only if project has a UI (see design-system-md skill)
```

### Phase 5: Human Approval Gate (MANDATORY)

After all specs are generated, present a summary to the human:

```
Spec complete! Here's what I've written:

📄 BRD: [X] objectives, [Y] risks, [Z] stakeholders
📄 SRS: [N] functional requirements, [M] non-functional
📄 UX Blueprint: [P] user flows, [Q] screens

Key decisions I made:
- [decision 1 — and why]
- [decision 2 — and why]
- [decision 3 — and why]

Please review the specs in _aegis-output/specs/.
Say "approved" to proceed, or tell me what to change.
```

**Rules:**
- Human MUST say "approved" (or equivalent: "ok", "go", "lgtm", "ดี", "ได้เลย")
- If human requests changes → revise and re-present
- Once approved → save approval record to `_aegis-output/specs/approval.md`:
  ```
  Approved by: Human
  Date: YYYY-MM-DD
  Version: 1.0
  Notes: [any conditions]
  ```

### Post-Spec: Mother Brain Takes Over (Spec Proxy Mode)

**After human approves the spec, Mother Brain resumes full autonomy (L3/L4).**

From this point forward:
- When any agent (Sage, Bolt, Vigil, etc.) has a question about requirements,
  **Mother Brain answers using the approved spec + her own research**.
- Mother Brain does NOT ask the human for clarification on spec-covered topics.
- Mother Brain CAN research (WebSearch, WebFetch) to fill technical gaps.
- Mother Brain logs all "proxy answers" to `_aegis-brain/logs/spec-proxy.log`:
  ```
  [YYYY-MM-DD HH:MM] PROXY_ANSWER | from=bolt | question="should auth use JWT or session?" | answer="JWT per SRS NFR-S01" | source=SRS.md#section-3
  ```

**When Mother Brain MUST escalate to human (even in proxy mode):**
1. Question is about BUSINESS DECISIONS not covered in spec (pricing, legal, partnerships)
2. Question contradicts the approved spec (scope change)
3. Question requires budget/timeline commitment
4. Agent finds a critical flaw in the spec itself

### Quality Gate

Before marking specs complete:
- [ ] All sections filled (no TODOs or placeholders)
- [ ] Requirements are testable (clear acceptance criteria)
- [ ] No contradictions between BRD, SRS, and UX Blueprint
- [ ] Scope is realistic for stated constraints
- [ ] Review by Black Panther for completeness (if team mode)
