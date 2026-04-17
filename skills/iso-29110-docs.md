# Skill: iso-29110-docs
> Profile: full
> Triggers EN: ISO, 29110, compliance, audit docs, work products
> Triggers TH: ไอเอสโอ, เอกสารมาตรฐาน, ตรวจสอบ

## Purpose
Generate and maintain ISO/IEC 29110 Basic profile compliant work products from AEGIS agent outputs. Covers both Project Management (PM) and Software Implementation (SI) processes.

## When to Use
- After sprint planning to generate/update Project Plan (PM.1) and Meeting Record
- After daily standups to update Progress Status Record (PM.2)
- When scope changes to log Change Requests (PM.2)
- When issues or defects found to update Correction Register (PM.3)
- After /aegis-breakdown to generate Requirements Specification + Traceability Matrix initial (SI.2)
- After Iron Man architecture spec to generate Design Document + Traceability Matrix design links (SI.3)
- After Spider-Man implementation to generate Test Cases document + Traceability Matrix code+test links (SI.4)
- After /aegis-qa to generate Test Report + Traceability Matrix final verification (SI.5)
- After QA gate pass and customer sign-off to generate Acceptance Record (PM.4)
- At release time to generate Software Configuration (SI.6)
- When auditing compliance gaps via /aegis-compliance check

---

## Quick Reference

```
/aegis-compliance generate    -- Generate all missing ISO docs from current state
/aegis-compliance check       -- Audit which docs are missing or outdated
/aegis-compliance matrix      -- Show/update traceability matrix
```

---

## ISO 29110 Basic Profile — Work Products

### PM Process (runs throughout project)

| Activity | Work Product | When Created | When Updated |
|----------|-------------|-------------|-------------|
| PM.1 Project Planning | Project Plan | Project start | Each sprint/iteration start |
| PM.1 Project Planning | Project Repository | Project start | Continuously |
| PM.2 Execution | Progress Status Record | Each standup/status | Throughout sprint |
| PM.2 Execution | Change Requests | When scope changes | As needed |
| PM.2 Execution | Meeting Records | Every formal review | Every ceremony |
| PM.3 Assessment | Correction Register | When issues found | Throughout project |
| PM.4 Closure | Acceptance Record | Sprint/project end | Customer sign-off |

### SI Process (technical lifecycle — maps to sprint activities)

| Activity | Work Product | When Created | Sprint Phase |
|----------|-------------|-------------|-------------|
| SI.1 Initiation | (uses Project Plan) | Sprint start | Planning |
| SI.2 Requirements | Requirements Specification | When reqs defined | /aegis-breakdown, /super-spec |
| SI.2 Requirements | Traceability Matrix (start) | With reqs | /aegis-breakdown |
| SI.3 Design | Software Design Document | Before coding | /aegis-team-build (Iron Man phase) |
| SI.3 Design | Traceability Matrix (update) | With design | /aegis-team-build (Iron Man phase) |
| SI.4 Construction | Software Components | During coding | /aegis-team-build (Spider-Man phase) |
| SI.4 Construction | Test Cases & Procedures | During coding | /aegis-team-build (Spider-Man phase) |
| SI.4 Construction | Traceability Matrix (update) | With code+tests | /aegis-team-build (Spider-Man phase) |
| SI.5 Integration & Test | Test Report | After testing | /aegis-qa |
| SI.5 Integration & Test | Traceability Matrix (final) | After testing | /aegis-qa |
| SI.6 Delivery | Software Configuration | Release | /aegis-launch |
| SI.6 Delivery | User Manual (if required) | Release | /aegis-launch |

### KEY PRINCIPLE: Documents at activity time, NOT retroactively

```
## Auto-Generation Triggers (REAL-TIME, not batch)

When /aegis-breakdown runs (SI.2):
  → Coulson auto-generates: Requirements Specification + Traceability Matrix (initial)

When /aegis-team-build runs — Iron Man phase (SI.3):
  → Coulson auto-generates: Software Design Document + Traceability Matrix (design links)

When /aegis-team-build runs — Spider-Man phase (SI.4):
  → Coulson auto-generates: Test Cases document + Traceability Matrix (code+test links)

When /aegis-qa runs (SI.5):
  → Coulson auto-generates: Test Report + Traceability Matrix (final verification)

When /aegis-sprint plan runs (PM.1):
  → Coulson auto-generates: Project Plan update + Meeting Record (planning)

When /aegis-sprint standup runs (PM.2):
  → Coulson auto-generates: Progress Status Record entry

When /aegis-kanban move ... --force or bug found (PM.3):
  → Coulson auto-generates: Correction Register entry

When /aegis-sprint close runs (PM.4):
  → Coulson auto-generates: Acceptance Record + Meeting Record (review+retro)

When /aegis-launch runs (SI.6):
  → Coulson auto-generates: Software Configuration + User Manual (if needed)
```

---

## ISO 29110 Basic Profile — Full Document Catalog

### Project Management (PM) Process

#### PM.1 — Project Plan
- **Content**: Task descriptions, effort estimates, schedule, milestones, resource assignments, risk identification, version control strategy, lifecycle selection
- **Source data**: Sprint plan (_aegis-brain/sprints/), backlog (_aegis-brain/backlog.md), kanban assignments, Loki risk analysis
- **Auto-trigger**: Generated at project start (PM.1), updated each sprint planning (PM.2)
- **Location**: _aegis-output/iso-docs/PM-01-project-plan/

#### PM.2 — Progress Status Record
- **Content**: Actual vs planned progress, identified problems, deviations from plan
- **Source data**: Kanban board state, burndown data, agent StatusUpdate messages, blocker tracking
- **Auto-trigger**: Updated at daily standups (PM.2 ongoing throughout project)
- **Location**: _aegis-output/iso-docs/PM-02-progress-status/
- **NOTE**: PM.2 is ONGOING — runs concurrently with all SI activities

#### PM.2 — Change Requests
- **Content**: Requested changes, impact analysis, approval status, implementation status
- **Source data**: Scope changes tracked by Captain America, EscalationAlert messages
- **Auto-trigger**: When any scope or requirement change is detected or requested
- **Location**: _aegis-output/iso-docs/PM-03-change-requests/
- **NOTE**: Every change, no matter how small, requires a documented Change Request with impact evaluation

#### PM.2 — Meeting Records
- **Content**: Date, attendees (agents), agenda, decisions, action items
- **Source data**: Sprint ceremony outputs (planning, standup, review, retro), design reviews, code reviews
- **Auto-trigger**: After each sprint ceremony and formal review
- **Location**: _aegis-output/iso-docs/PM-04-meeting-records/YYYY-MM-DD-<type>.md
- **NOTE**: Every formal meeting/review must generate a Meeting Record. Informal reviews are not sufficient.

#### PM.3 — Correction Register
- **Content**: Issue ID, description, severity, root cause, corrective action, resolution status
- **Source data**: QA failures, Black Panther findings, audit gaps, retrospective action items
- **Auto-trigger**: When any defect, issue, or deviation is identified (PM.3 ongoing)
- **Location**: _aegis-output/iso-docs/PM-05-correction-register/
- **NOTE**: PM.3 runs periodically throughout the project, not just at closure. Auditors check this.

#### PM.4 — Acceptance Record
- **Content**: Acceptance criteria checklist, sign-off record, delivery confirmation
- **Source data**: QA gate pass + formal customer/stakeholder sign-off
- **Auto-trigger**: At sprint/project closure after delivery is accepted
- **Location**: _aegis-output/iso-docs/PM-06-acceptance-record/
- **NOTE**: Must have formal written sign-off. Verbal approval is an audit failure.

### Software Implementation (SI) Process

#### SI.2 — Requirements Specification
- **Content**: Functional requirements, non-functional requirements, constraints, acceptance criteria
- **Source data**: Work breakdown outputs from Iron Man (/aegis-breakdown)
- **Auto-trigger**: When /aegis-breakdown completes (SI.2 activity)
- **Location**: _aegis-output/iso-docs/SI-01-requirements-spec/
- **NOTE**: Must be customer-approved and baselined before SI.3 (design) begins

#### SI.2 / SI.3 / SI.4 / SI.5 — Requirements Traceability Matrix
- **Content**: Matrix linking Requirement -> Design section -> Code file -> Test case -> Test result
- **Source data**: Cross-reference of all above documents + Spider-Man commit refs + Vision test results
- **Auto-trigger**: Created at SI.2, updated at SI.3, SI.4, SI.5 — ONE living document
- **Location**: _aegis-output/iso-docs/SI-02-traceability-matrix/
- **NOTE**: This is a SINGLE document updated across all SI activities. Not four separate docs.
- **Computation**: Coulson auto-generates by scanning requirement IDs, design section anchors, code references from commits, test case IDs, and test results

#### SI.3 — Software Design Document
- **Content**: Architecture overview, component design, interfaces, data model, design decisions
- **Source data**: Iron Man architecture specs, ADRs (docs/decisions/)
- **Auto-trigger**: When Iron Man completes architecture spec (SI.3 activity)
- **Location**: _aegis-output/iso-docs/SI-03-design-doc/
- **NOTE**: Must cover both architectural design AND detailed design per the standard

#### SI.4 — Software Components
- **Content**: Source code files, unit test results, code review records
- **Source data**: Spider-Man implementation commits, Black Panther code review results
- **Auto-trigger**: When Spider-Man completes implementation (SI.4 activity)
- **Location**: src/ (tracked via git), referenced in traceability matrix
- **NOTE**: Software Components = the actual code. Referenced in registry but stored in src/.

#### SI.4 — Test Cases and Test Procedures
- **Content**: Test strategy, test cases, test data, pass/fail criteria, environment requirements
- **Source data**: War Machine test plan (_aegis-output/qa/)
- **Auto-trigger**: When /aegis-team-build Spider-Man phase completes (SI.4 activity)
- **Location**: _aegis-output/iso-docs/SI-04-test-cases/
- **NOTE**: Test Cases are created IN SI.4 (during construction), NOT just before testing. They validate the design.

#### SI.5 — Test Report
- **Content**: Test execution summary, pass/fail counts, defects found, QA verdict, verification results, validation results
- **Source data**: Vision execution results + War Machine verdict (_aegis-output/qa/)
- **Auto-trigger**: When /aegis-qa run completes (SI.5 activity)
- **Location**: _aegis-output/iso-docs/SI-05-test-report/
- **NOTE**: Test Report includes verification results (does it match design?) and validation results (does it meet customer needs?).

#### SI.6 — Software Configuration
- **Content**: Release version, included components, build instructions, deployment notes, known issues
- **Source data**: Release artifacts from Spider-Man, git tags, CHANGELOG
- **Auto-trigger**: At release preparation (/aegis-launch)
- **Location**: _aegis-output/iso-docs/SI-06-delivery/release-<version>.md
- **NOTE**: This is the deliverable set — what was packaged and delivered to the customer.

#### SI.6 — User Manual (if required)
- **Content**: Installation guide, user guide, operational procedures
- **Source data**: Product specs, Songbird documentation outputs
- **Auto-trigger**: At release if contractually required
- **Location**: _aegis-output/iso-docs/SI-06-delivery/user-manual.md
- **NOTE**: Required "if contractually required" by the standard. Check Statement of Work.

---

## Locked H2 Skeletons (MANDATORY — do not drift)

Each ISO 29110 document type has a FROZEN H2 skeleton. Coulson MUST emit these
exact sections in this exact order. Missing or reordered sections = document
rejected. Adopted from VoltAgent/awesome-design-md's stable-skeleton discipline.

### PM.01 — Project Plan (frozen skeleton)
```
# PM.01 — Project Plan

## 1. Project Scope
## 2. Tasks & Activities
## 3. Effort Estimates
## 4. Schedule & Milestones
## 5. Resources (Agents, Humans, Tools)
## 6. Risk Identification
## 7. Version Control Strategy
## 8. Lifecycle Model
## 9. Acceptance Criteria
## 10. Do's and Don'ts (guardrails)
## 11. Sign-off
```

### PM.02 — Progress Status (frozen skeleton)
```
# PM.02 — Progress Status Record — Sprint <N>

## 1. Period Covered
## 2. Planned vs Actual
## 3. Completed Work
## 4. In-Progress Work
## 5. Blockers & Impediments
## 6. Deviations from Plan
## 7. Adjustments for Next Period
## 8. Sign-off
```

### PM.03 — Change Request (frozen skeleton, one per request)
```
# PM.03 — CR-<id>: <title>

## 1. Requested Change
## 2. Justification
## 3. Impact Analysis (scope, schedule, cost, risk)
## 4. Alternatives Considered
## 5. Approval Status
## 6. Implementation Plan (if approved)
## 7. Sign-off
```

### SI.01 — Requirements Specification (frozen skeleton)
```
# SI.01 — Requirements Specification

## 1. System Overview
## 2. Stakeholders & Roles
## 3. Functional Requirements (FR-###)
## 4. Non-Functional Requirements (NFR-###)
## 5. Constraints
## 6. Assumptions
## 7. Acceptance Criteria
## 8. Do's and Don'ts (guardrails)
## 9. Sign-off & Baseline
```

### SI.02 — Traceability Matrix (frozen skeleton)
```
# SI.02 — Traceability Matrix

## 1. Matrix Legend
## 2. Requirement → Design → Code → Test → Result Table
## 3. Coverage Summary
## 4. Orphaned Requirements (no code/test)
## 5. Orphaned Code (no requirement)
## 6. Last Updated
```

### SI.03 — Software Design (frozen skeleton)
```
# SI.03 — Software Design Document

## 1. Architectural Overview
## 2. Component Diagram
## 3. Interface Definitions
## 4. Data Model
## 5. Layer Responsibilities (matrix table: Layer | Responsibility | Interface)
## 6. Design Decisions (link to ADRs)
## 7. Error Handling Strategy
## 8. Security Considerations
## 9. Do's and Don'ts
## 10. Sign-off
```

### SI.04 — Test Cases (frozen skeleton)
```
# SI.04 — Test Cases & Procedures

## 1. Test Strategy
## 2. Test Environment
## 3. Test Data
## 4. Unit Tests (per component)
## 5. Integration Tests
## 6. System Tests
## 7. Acceptance Tests
## 8. Pass/Fail Criteria
## 9. Sign-off
```

### SI.05 — Test Report (frozen skeleton)
```
# SI.05 — Test Report

## 1. Test Execution Summary
## 2. Pass/Fail Counts
## 3. Defects Found
## 4. Verification Results
## 5. Validation Results
## 6. QA Verdict
## 7. Retest Plan (if failures)
## 8. Sign-off
```

### SI.06 — Software Configuration / Release (frozen skeleton)
```
# SI.06 — Release <version>

## 1. Release Identifier
## 2. Included Components
## 3. Build Instructions
## 4. Deployment Notes
## 5. Rollback Procedure
## 6. Known Issues
## 7. Changelog (link)
## 8. Sign-off
```

### Enforcement

Coulson MUST validate H2 skeleton compliance before writing any ISO doc:
```python
REQUIRED = {
    "PM.01": ["Project Scope", "Tasks & Activities", "Effort Estimates",
              "Schedule & Milestones", "Resources (Agents, Humans, Tools)",
              "Risk Identification", "Version Control Strategy",
              "Lifecycle Model", "Acceptance Criteria",
              "Do's and Don'ts (guardrails)", "Sign-off"],
    "SI.01": ["System Overview", "Stakeholders & Roles",
              "Functional Requirements (FR-###)",
              "Non-Functional Requirements (NFR-###)", "Constraints",
              "Assumptions", "Acceptance Criteria",
              "Do's and Don'ts (guardrails)", "Sign-off & Baseline"],
    # ...
}
# Before write: check every required H2 exists, in order.
# If missing: DO NOT WRITE. Return error to Nick Fury.
```

---

## Document Lifecycle

Every ISO 29110 document follows this lifecycle:

| Stage | Action | Responsible |
|-------|--------|-------------|
| **Draft** | Generated by Coulson from source data | Coulson |
| **Review** | Checked for completeness and consistency | Black Panther |
| **Approved** | Formal approval (or escalation to human) | Captain America |
| **Baselined** | Version-tagged in git via commit | Captain America + git |

Status is tracked in a header block at the top of each document:
```markdown
---
document_id: SI.2
title: Requirements Specification
version: 1.2
status: Approved
last_updated: 2026-03-24
author: coulson
reviewer: black-panther
approver: captain-america
---
```

---

## Traceability Matrix Format

```markdown
# Traceability Matrix

| Req ID | Requirement | Design Ref | Code Ref | Test Case | Test Result | Status |
|--------|------------|------------|----------|-----------|-------------|--------|
| REQ-001 | <text> | design-doc#section-2 | src/auth.ts | TC-001 | PASS | Verified |
| REQ-002 | <text> | design-doc#section-3 | src/api.ts | TC-002 | FAIL | Open |
```

**Computation method**: Coulson scans and cross-references:
1. Requirement IDs from _aegis-output/breakdown/ and iso-docs/SI-01-requirements-spec/current.md
2. Design section anchors from iso-docs/SI-03-design-doc/current.md
3. Code file references from Spider-Man implementation commits
4. Test case IDs from _aegis-output/qa/ test plans
5. Test results from _aegis-output/qa/results/

**Lifecycle**: Matrix starts at SI.2 (requirements only), gains design links at SI.3, gains code+test links at SI.4, gains test results at SI.5. The SAME matrix file is updated — not recreated.

---

## Workflow

1. Coulson receives TaskAssignment (from Captain America or triggered by pipeline event)
2. Coulson reads source data from _aegis-output/ and _aegis-brain/
3. Coulson generates or updates the target ISO document
4. Coulson stamps document with version, date, and status=Draft
5. If traceability matrix is affected, Coulson updates it (not regenerates — updates)
6. Coulson sends StatusUpdate to Captain America confirming document generation
7. Black Panther reviews document for completeness (Gate 3: Compliance)
8. Captain America approves or escalates to human

## Inputs
- Agent outputs in _aegis-output/ (specs, reviews, QA results, breakdowns)
- Sprint data in _aegis-brain/sprints/
- Backlog in _aegis-brain/backlog.md

## Outputs
- ISO 29110 documents in _aegis-output/iso-docs/
- Traceability matrix in _aegis-output/iso-docs/SI-02-traceability-matrix/current.md

## Agent Routing
- **Primary**: Coulson (document generation)
- **Assist**: Songbird (for prose-heavy sections like executive summaries)
- **Review**: Black Panther (document completeness check)
- **Approval**: Captain America (formal sign-off)

## Examples
```
# Generate all missing ISO docs
/aegis-compliance generate

# Check compliance gaps
/aegis-compliance check
> Missing: PM.2 Progress Status, PM.3 Correction Register
> Outdated: PM.1 Project Plan (last updated 3 sprints ago)

# Update traceability matrix
/aegis-compliance matrix
> Traceability matrix updated: 12 requirements, 10 traced, 2 gaps found
> Gap: REQ-007 has no test case
> Gap: REQ-011 has no design reference
```
