---
name: aegis-launch
description: "Launch readiness check — full verification plus release checklist and PR template"
triggers:
  en: launch, launch check, ready to release, ship it
  th: พร้อมปล่อย, launch check
---

# /aegis-launch

## Quick Reference
Launch readiness assessment. First runs /aegis-verify for baseline checks, then validates:
all tests pass, no critical findings, documentation up to date, CHANGELOG updated, version
bumped. Produces a final go/no-go checklist. If GO, prepares a PR template with summary
of changes. This is the last gate before merging/deploying.

## Full Instructions

### Step 1: Run Verification Pipeline
- Execute /aegis-verify (the full verification command).
- Capture all results: tests, linter, TODOs, git status, security.
- If /aegis-verify returns NO-GO:
  ```
  ❌ Launch blocked — verification failed
  Fix the following before re-running /aegis-launch:
  [list of blockers from verify]
  ```
  - Stop here. Do not proceed with launch checks.

### Step 2: All Tests Pass?
- From verify results, confirm:
  - Zero test failures.
  - No skipped tests that should be running.
  - Test coverage meets project threshold (if configured).
- Status: ✅ PASS or ❌ FAIL with details.

### Step 3: No Critical Findings?
- From verify results, confirm:
  - No security issues flagged.
  - No FIXME/BUG markers in critical paths.
  - Linter has zero errors (warnings acceptable).
- Status: ✅ PASS or ❌ FAIL with details.

### Step 4: Documentation Up to Date?
- Check:
  - README.md exists and was modified recently (relative to code changes).
  - API documentation (if applicable) covers all endpoints.
  - Code comments are present for complex logic.
  - If docs/ directory exists, check for staleness.
- How to check staleness:
  - Compare last modification dates of docs vs source code.
  - If source was modified much more recently than docs, flag it.
- Status: ✅ PASS or ⚠️ STALE with suggestions.

### Step 5: CHANGELOG Updated?
- Look for CHANGELOG.md, CHANGELOG, CHANGES.md, or HISTORY.md.
- If found:
  - Check if the latest entry's date is today or recent.
  - Verify it mentions the features/fixes being launched.
- If not found:
  ```
  ⚠️ No CHANGELOG found — consider creating one
  Would you like me to generate a CHANGELOG entry from git history?
  ```
- Status: ✅ PASS, ⚠️ MISSING, or ❌ OUTDATED.

### Step 6: Version Bumped?
- Check for version in:
  - `package.json` (version field)
  - `pyproject.toml` (version field)
  - `Cargo.toml` (version field)
  - `VERSION` file
  - `setup.py` / `setup.cfg`
- Compare with the latest git tag:
  - If version > latest tag: ✅ Version bumped.
  - If version == latest tag: ❌ Version not bumped.
  - If no tags: ⚠️ No version tags found.
- Status: ✅ BUMPED, ❌ NOT BUMPED, or ⚠️ NO TAGS.

### Step 7: Final Go/No-Go Checklist
- Display comprehensive checklist:
  ```
  ╔══════════════════════════════════════════════════════╗
  ║  AEGIS Launch Readiness — [project name]            ║
  ╠══════════════════════════════════════════════════════╣
  ║                                                      ║
  ║  [✅/❌] Tests passing              [details]        ║
  ║  [✅/❌] No critical findings       [details]        ║
  ║  [✅/❌] Documentation current      [details]        ║
  ║  [✅/❌] CHANGELOG updated          [details]        ║
  ║  [✅/❌] Version bumped             [details]        ║
  ║  [✅/❌] Git status clean           [details]        ║
  ║  [✅/❌] Security check passed      [details]        ║
  ║                                                      ║
  ║  ──────────────────────────────────────────────      ║
  ║  VERDICT: [GO ✅ / NO-GO ❌ / CONDITIONAL ⚠️]       ║
  ╚══════════════════════════════════════════════════════╝
  ```
- GO requires: all checks pass.
- CONDITIONAL: only warnings, no failures.
- NO-GO: any failure.

### Step 8: Prepare PR Template (if GO)
- Only if verdict is GO or CONDITIONAL:
  ```markdown
  ## Pull Request: [feature/fix name]
  
  ### Summary
  [Auto-generated from git log and changes]
  
  ### Changes
  - [file 1]: [what changed]
  - [file 2]: [what changed]
  
  ### Testing
  - [X] All tests passing ([N] tests)
  - [X] No linter errors
  - [X] Security check clean
  
  ### Checklist
  - [X] Code reviewed (by Black Panther)
  - [X] Documentation updated
  - [X] CHANGELOG entry added
  - [X] Version bumped to [version]
  
  ### Launch Notes
  [Any deployment notes, migration steps, etc.]
  ```
- Display the PR template for the user to copy.
- If using GitHub: offer to create the PR via `gh pr create`.
