---
name: aegis-verify
description: "Run verification pipeline — tests, linting, TODOs, git status, security check"
triggers:
  en: verify, check, validate, run checks
  th: ตรวจสอบ, verify
---

# /aegis-verify

## Quick Reference
Verification pipeline that runs tests (if configured), linter (if configured), scans
for TODO/FIXME markers, validates git status (clean working tree?), checks for security
issues (secrets in code), and generates a verification report with a Go/No-Go
recommendation. Non-destructive — only reads and reports, never modifies.

## Full Instructions

### Step 1: Run Tests
- Detect test runner:
  - Check for: `package.json` (npm test / jest / vitest), `pytest.ini` / `pyproject.toml` (pytest),
    `Cargo.toml` (cargo test), `go.mod` (go test), `Makefile` (make test)
  - If found, run the appropriate test command.
  - Capture: pass count, fail count, skip count, total time.
- If no test runner configured:
  ```
  ⚠️ No test runner detected
  Checked: package.json, pytest.ini, pyproject.toml, Cargo.toml, go.mod, Makefile
  Recommendation: Configure a test runner for this project
  ```
- Report:
  ```
  Tests: ✅ 42 passed, ❌ 0 failed, ⏭️ 3 skipped (2.3s)
  ```
  or
  ```
  Tests: ❌ 40 passed, 2 FAILED, 1 skipped (3.1s)
  Failed:
    • test_user_auth — AssertionError: expected 200, got 401
    • test_pagination — IndexError: list index out of range
  ```

### Step 2: Run Linter
- Detect linter:
  - Check for: `.eslintrc*` (eslint), `pyproject.toml` [tool.ruff] / `.flake8` (ruff/flake8),
    `rustfmt.toml` (rustfmt), `.golangci.yml` (golangci-lint)
  - If found, run the linter.
  - Capture: error count, warning count.
- If no linter configured:
  ```
  ⚠️ No linter detected — consider adding one
  ```
- Report:
  ```
  Linter: ✅ 0 errors, 3 warnings
  ```

### Step 3: Check TODO/FIXME Markers
- Search the codebase for markers:
  - `TODO`, `FIXME`, `HACK`, `XXX`, `BUG`, `WORKAROUND`
- Exclude: node_modules, .git, vendor, dist, build, __pycache__
- Count and categorize:
  ```
  Markers found:
  • TODO:       12 occurrences
  • FIXME:       3 occurrences
  • HACK:        1 occurrence
  • Total:      16 markers in 9 files
  ```
- List the top 5 most critical (FIXME/BUG first):
  ```
  Top markers:
  1. FIXME: Race condition in connection pool (src/db/pool.ts:42)
  2. FIXME: Hardcoded timeout value (src/api/client.ts:15)
  3. BUG: Memory leak when stream is not closed (src/stream.ts:88)
  ```

### Step 4: Validate Git Status
- Run `git status` and analyze:
  ```
  Git status:
  • Branch: feature/auth
  • Clean: ❌ (3 uncommitted changes)
  • Uncommitted:
    - modified: src/auth/login.ts
    - modified: src/auth/register.ts
    - new file: src/auth/types.ts
  • Unpushed commits: 2
  ```
- Or if clean:
  ```
  Git status: ✅ Clean working tree, up to date with remote
  ```

### Step 5: Security Check
- Scan for potential secrets in code:
  - API keys: patterns like `[A-Z0-9]{20,}`, `sk-`, `pk_`, `AKIA`
  - Passwords: `password = "..."`, `secret = "..."`
  - Private keys: `-----BEGIN (RSA |EC )?PRIVATE KEY-----`
  - Connection strings with credentials: `://user:pass@`
  - `.env` files committed to git
- Check `.gitignore` for common security patterns:
  - `.env`, `*.pem`, `*.key`, `credentials.*`
- Report:
  ```
  Security: ✅ No secrets detected
  .gitignore: ✅ Covers .env, *.pem, *.key
  ```
  or
  ```
  Security: ❌ POTENTIAL SECRETS FOUND
  1. Possible API key in src/config/api.ts:12
  2. .env file is not in .gitignore!
  3. Hardcoded password in tests/fixtures/setup.ts:5
  ```

### Step 6: Generate Verification Report
- Compile all findings:
  ```markdown
  # Verification Report — [date]
  
  | Check        | Status | Details                    |
  |-------------|--------|----------------------------|
  | Tests        | ✅/❌  | [pass/fail counts]         |
  | Linter       | ✅/❌  | [error/warning counts]     |
  | TODOs        | ⚠️/✅  | [count] markers found      |
  | Git Status   | ✅/❌  | [clean/dirty]              |
  | Security     | ✅/❌  | [findings count]           |
  ```

### Step 7: Go/No-Go Recommendation
- **GO** ✅ — All checks pass, no critical issues:
  ```
  VERDICT: ✅ GO — All checks pass. Safe to proceed.
  ```
- **CONDITIONAL GO** ⚠️ — Minor issues only:
  ```
  VERDICT: ⚠️ CONDITIONAL GO — Minor issues found. Review before proceeding.
  [list of minor issues]
  ```
- **NO-GO** ❌ — Critical issues found:
  ```
  VERDICT: ❌ NO-GO — Critical issues must be resolved first.
  Blockers:
  1. [critical issue 1]
  2. [critical issue 2]
  ```
