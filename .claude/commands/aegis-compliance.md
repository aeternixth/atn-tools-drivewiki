# /aegis-compliance -- ISO 29110 Compliance Management

> Triggers EN: compliance, ISO, audit, work products, traceability
> Triggers TH: ตรวจสอบ, เอกสาร, ไอเอสโอ, ร่องรอย

## Purpose
Generate, audit, and maintain ISO/IEC 29110 Basic profile work products using the Coulson sub-agent. Ensures all required compliance documents exist, are current, and maintain full traceability from requirements through to test results.

## Subcommands

### /aegis-compliance generate
Generate all missing or outdated ISO 29110 documents from current project state.

**Flow**:
1. Scan _aegis-output/iso-docs/ for existing documents
2. Scan _aegis-output/ and _aegis-brain/ for source data
3. Identify which documents can be generated (source data exists)
4. Read `_aegis-output/iso-docs/doc-registry.json` (create with empty array if missing)
5. Read `_aegis-brain/counters.json` (create with counters at 0 if missing)
6. For each document to generate, follow the **Versioning Protocol**:
   - **New document** (not in doc-registry):
     a. Generate `PROJ-DOC-NNN` ID via counter protocol (increment DOC counter)
     b. Create directory: `_aegis-output/iso-docs/{doc-type-slug}/`
     c. Write content to `v1.md`
     d. Copy `v1.md` content to `current.md`
     e. Create `changelog.md` with initial entry:
        ```
        # Changelog: {document title}

        ## v1 (YYYY-MM-DD)
        - Initial version created
        - Author: coulson
        ```
     f. Add document entry to `doc-registry.json`:
        ```json
        {
          "id": "PROJ-DOC-NNN",
          "type": "XX.N",
          "title": "Document Title",
          "current_version": 1,
          "status": "Draft",
          "author": "coulson",
          "reviewer": null,
          "created": "YYYY-MM-DD",
          "last_updated": "YYYY-MM-DD",
          "path": "_aegis-output/iso-docs/{doc-type-slug}/"
        }
        ```
   - **Existing document** (found in doc-registry):
     a. Read current_version from registry entry
     b. Increment version: `N+1 = current_version + 1`
     c. Write new content to `v{N+1}.md`
     d. Overwrite `current.md` with new content
     e. Append to `changelog.md`:
        ```
        ## v{N+1} (YYYY-MM-DD)
        - {summary of changes from diff with previous version}
        - Author: coulson
        ```
     f. Update registry entry: set `current_version`, `last_updated`, `status`
7. Update traceability matrix after all documents generated
8. Report summary: generated (new), updated (versioned), skipped (no source data), already current

### /aegis-compliance check
Audit which ISO 29110 documents are missing, outdated, or incomplete.

**Flow**:
1. Read the full ISO 29110 Basic profile document catalog (14 work products across PM.1-PM.4 and SI.2-SI.6)
2. Read `_aegis-output/iso-docs/doc-registry.json` for version and status info
3. Check _aegis-output/iso-docs/ for each required document
4. For existing documents, check if source data has changed since last generation
5. Cross-reference registry entries for version info (current_version, last_updated, status)
6. Report:
   - Missing documents (required but not generated)
   - Outdated documents (source data newer than document)
   - Current documents (up to date)
   - Compliance score: X/14 documents current (or fewer if early in lifecycle)

**Required document checklist** (14 work products):
```
PM Process:
  PM.1  Project Plan
  PM.2  Progress Status Record
  PM.2  Change Requests
  PM.2  Meeting Records
  PM.3  Correction Register          <- required; tracks defects and corrective actions
  PM.4  Acceptance Record

SI Process:
  SI.2  Requirements Specification
  SI.2  Traceability Matrix (initial)
  SI.3  Software Design Document
  SI.3  Traceability Matrix (design update)
  SI.4  Test Cases and Procedures
  SI.4  Traceability Matrix (code+test update)
  SI.5  Test Report
  SI.6  Software Configuration
```

Note: Traceability Matrix is ONE living document updated across SI.2->SI.5. Count it once for compliance scoring. User Manual is conditionally required (if contractually required).

**Output format**:
```
ISO 29110 Compliance Audit
==========================
Current:  9/14 documents up to date
Missing:  3 documents (PM.3 Correction Register, SI.4 Test Cases, SI.5 Test Report)
Outdated: 2 documents (PM.1 Project Plan, SI.2 Traceability Matrix)

Details:
  [OK]      PM.1  Project Plan (v1.2, 2026-03-20)
  [OK]      PM.2  Progress Status Record (v1.3, 2026-03-22)
  [OK]      PM.2  Change Requests (v1.0, 2026-03-18)
  [OK]      PM.2  Meeting Records (3 records)
  [MISSING] PM.3  Correction Register
  [OK]      PM.4  Acceptance Record (v1.0, 2026-03-23)
  [OK]      SI.2  Requirements Specification (v2.1, 2026-03-22)
  [STALE]   SI.2  Traceability Matrix (last update: 2026-03-19, source changed: 2026-03-22)
  [OK]      SI.3  Software Design Document (v1.3, 2026-03-21)
  [MISSING] SI.4  Test Cases and Procedures
  [MISSING] SI.5  Test Report
  [OK]      SI.6  Software Configuration (v1.0, 2026-03-23)

Registry: doc-registry.json has N entries, last updated YYYY-MM-DD
Action: Run /aegis-compliance generate to fix gaps.
```

### /aegis-compliance matrix
Show or update the traceability matrix that links requirements to design, code, and tests.

**Flow**:
1. Read requirements from _aegis-output/breakdown/ and iso-docs/SI-01-requirements-spec/current.md
2. Read design references from iso-docs/SI-03-design-doc/current.md
3. Read code references from Spider-Man implementation records
4. Read test cases from _aegis-output/qa/
5. Read test results from _aegis-output/qa/results/
6. Compute the cross-reference matrix
7. Write to _aegis-output/iso-docs/SI-02-traceability-matrix/current.md
8. Report gaps (requirements without tests, code without design refs, etc.)

### /aegis-compliance history DOC-TYPE
Show the changelog for a specific document type.

**Flow**:
1. Map DOC-TYPE to the document slug (e.g., `PM.1` -> `PM-01-project-plan`)
2. If DOC-TYPE not recognized, show available document types from doc-registry.json
3. Read `_aegis-output/iso-docs/{doc-type-slug}/changelog.md`
4. If changelog does not exist, report "No changelog found for {DOC-TYPE}. Document may not have been generated yet."
5. Display the full changelog contents

**Output format**:
```
Document History: PM.1 -- Project Plan
=======================================
Path: _aegis-output/iso-docs/PM-01-project-plan/

# Changelog: Project Plan

## v3 (2026-03-24)
- Updated timeline after sprint-2 planning
- Added risk mitigation section
- Author: coulson

## v2 (2026-03-22)
- Revised scope after breakdown
- Reviewed by: black-panther
- Author: coulson

## v1 (2026-03-20)
- Initial version created from sprint plan
- Author: coulson

Total versions: 3 | Current: v3
```

### /aegis-compliance diff DOC-TYPE [v1] [v2]
Show diff between two versions of a document.

**Flow**:
1. Map DOC-TYPE to the document slug
2. If DOC-TYPE not recognized, show available document types from doc-registry.json
3. Determine version numbers:
   - If both v1 and v2 provided: compare those specific versions
   - If only v1 provided: compare v1 with current (latest) version
   - If neither provided: compare previous version (N-1) with current version (N)
4. Read `_aegis-output/iso-docs/{doc-type-slug}/v{A}.md` and `v{B}.md`
5. If either version file does not exist, report error with available versions
6. Compute line-by-line diff between the two versions
7. Display diff with additions (+) and removals (-)

**Output format**:
```
Document Diff: PM.1 -- Project Plan
=====================================
Comparing: v2 -> v3

--- v2 (2026-03-22)
+++ v3 (2026-03-24)

@@ Section 3: Timeline @@
- Sprint 2: 2026-03-25 to 2026-03-31
+ Sprint 2: 2026-03-26 to 2026-04-02

@@ Section 5: Risks @@
+ ### 5.1 Risk Mitigation
+ - R1: Database migration delay -- Mitigation: parallel dev environment
+ - R2: API rate limiting -- Mitigation: implement caching layer

Summary: 2 sections changed, 4 lines added, 1 line removed
```

## Agent Routing
- **Primary**: Coulson (generates all documents)
- **Assist**: Songbird (prose-heavy sections if needed)
- **Data source**: All other agents' outputs (Iron Man, Spider-Man, Black Panther, War Machine, Vision)

## Output Location
_aegis-output/iso-docs/

## Quality Gate
This command feeds into Gate 3 (Compliance) of the 3-gate quality system:
- Gate 1: Code Quality (Black Panther) -- code review, lint, standards
- Gate 2: Product Quality (War Machine) -- functional tests, acceptance criteria
- Gate 3: Compliance (Coulson) -- all required ISO docs exist and are current

Sprint close is blocked until Gate 3 passes (/aegis-compliance check shows all required docs current for the current lifecycle stage).

**Important**: Documents are generated AT ACTIVITY TIME by Coulson, not batch-generated at sprint close. Sprint close only VERIFIES all required docs exist -- it does not generate them. If docs are missing at sprint close, the sprint is blocked and the team must identify which activity was not properly documented.
