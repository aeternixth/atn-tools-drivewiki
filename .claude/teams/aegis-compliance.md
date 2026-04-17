---
name: aegis-compliance
description: "Compliance team: ISO 29110 document verification and generation"
lead: coulson
members: []
mode: direct
requires: null
---

## Team Purpose
Solo compliance gate: Coulson audits existing ISO docs, identifies gaps, generates/updates
documents from agent artifacts, and issues Gate 3 verdict.

## Input Contract

```json
{
  "team": "compliance",
  "trigger": "task_status == DONE (after Gate 2 PASS) OR sprint_close OR release",
  "required_inputs": {
    "task_meta": "_aegis-brain/tasks/{TASK-ID}/meta.json",
    "spec": "_aegis-output/specs/{TASK-ID}-spec.md",
    "review": "_aegis-output/reviews/{TASK-ID}-review.md",
    "qa_report": "_aegis-output/qa/sprint-N/qa-report-{TASK-ID}.md",
    "existing_iso_docs": "_aegis-output/iso-docs/*/current.md"
  }
}
```

## Workflow

### 1. Coulson (haiku): Audit existing ISO docs
- Reads: All existing ISO docs in `_aegis-output/iso-docs/`
- Compares: Against what the current task/sprint requires
- Produces: Gap analysis (which docs missing or stale)

### 2. Coulson (haiku): Generate/update ISO docs
- For each gap, produces the ISO 29110 document from existing agent artifacts:

| ISO Document | Source Artifacts |
|-------------|-----------------|
| PM.01 Project Plan | Sprint plan.md, metrics.json |
| PM.02 Progress Status | Daily standup files |
| PM.03 Correction Register | Black Panther FAIL findings, Thor rollback reports, bug reports |
| PM.04 Meeting Record | Sprint plan, review, retro, close ceremonies |
| SI.01 Requirements Spec | Breakdown output (user stories, acceptance criteria) |
| SI.02 Design Document | Iron Man spec files |
| SI.03 Traceability Matrix | REQ -> Design -> Code -> Test mapping |
| SI.04 Test Cases | War Machine test plans |
| SI.05 Test Report | War Machine QA reports |
| SI.06 Acceptance Record | Sprint close with QA verdicts |
| SI.07 Software Configuration | Release tag, file manifest, deploy config |

### 3. Stamp and verify
- Each document: version, date, status (Draft/Review/Approved/Baselined), author
- Confirm traceability matrix is complete (every REQ has design, code, test links)

## Gate 3 Criteria
- All required ISO docs for the task/sprint scope exist
- All docs are current version (not stale relative to latest code/test changes)
- Traceability matrix has no broken links
- Document status is at least "Review" (Draft is insufficient)

## Output Contract

```json
{
  "from_team": "compliance",
  "to_team": "devops OR captain-america",
  "task_id": "PROJ-T-XXX",
  "status": "COMPLIANT OR NON_COMPLIANT",
  "artifacts": {
    "updated_docs": ["list of updated ISO doc paths"],
    "traceability": "_aegis-output/iso-docs/SI-03-traceability/current.md"
  },
  "gate_results": {
    "gate_3": "PASS or FAIL",
    "gate_3_reviewer": "coulson",
    "gate_3_timestamp": "ISO timestamp",
    "docs_checked": "count",
    "docs_updated": "count",
    "docs_missing": "count"
  }
}
```

## Handoff Rules
- **PASS** -> aegis-devops team (Thor deploys on sprint close/release)
- **INCOMPLETE** -> block sprint close; Coulson retries after source data is provided

## Output
_aegis-output/iso-docs/
