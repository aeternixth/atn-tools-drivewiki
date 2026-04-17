---
name: aegis-deploy
description: "Deploy pipeline — build, deploy, health check, monitor, rollback"
triggers:
  en: deploy, ship, release
  th: เดพลอย, ปล่อย
---

# /aegis-deploy

## Quick Reference
Full deployment pipeline. Runs build verification, deploys to target environment, runs health
checks, monitors for stability. Auto-rollbacks on failure. Creates Correction Register if
anything goes wrong. Requires all 3 quality gates to have passed.

## Subcommands

| Subcommand | Purpose |
|------------|---------|
| `/aegis-deploy` | Full pipeline: build -> deploy -> health -> monitor |
| `/aegis-deploy build` | Run build verification only |
| `/aegis-deploy health` | Run health check on current deployment |
| `/aegis-deploy rollback` | Rollback to previous version |
| `/aegis-deploy status` | Show deployment status + uptime |

## Full Instructions

### Pre-flight: Gate Verification
Before ANY deploy operation (except `status` and `health`), verify all three gates:

1. **Gate 1 (Code Quality)**: Check `_aegis-output/reviews/` for latest review — must be PASS.
2. **Gate 2 (QA)**: Check `_aegis-output/qa/` for latest QA report — must be PASS.
3. **Gate 3 (Compliance)**: Check `_aegis-output/compliance/` for latest ISO check — must be PASS.

If ANY gate is not PASS:
```
❌ Deploy blocked — gate check failed
  Gate 1 (Code Quality): [PASS/FAIL/MISSING]
  Gate 2 (QA):           [PASS/FAIL/MISSING]
  Gate 3 (Compliance):   [PASS/FAIL/MISSING]

Fix the failing gates before deploying.
Run /aegis-verify to check current gate status.
```
Stop here. Do not proceed.

---

### Subcommand: /aegis-deploy (Full Pipeline)

**Agent**: Thor (sub-agent, solo mode)
**Escalation**: If health check fails and hotfix needed, spawn TeamCreate with Spider-Man.

#### Step 1: Build Verification
- Detect project type from root files (package.json, go.mod, Cargo.toml, etc.)
- Run clean build from branch HEAD:
  - `npm`: `rm -rf node_modules dist && npm ci && npm run build`
  - `go`: `go clean && go build ./...`
  - `cargo`: `cargo clean && cargo build --release`
  - `python`: `pip install -e . && python -m build`
- Verify build artifacts exist.
- Log output to `_aegis-output/deployments/build-YYYY-MM-DD.log`.
- If build fails:
  ```
  ❌ Build failed — deploy aborted
  See: _aegis-output/deployments/build-YYYY-MM-DD.log
  ```
  Create PM.03 Correction Register entry. Stop.

#### Step 2: Deploy
- Read deploy config from `deploy/config.yaml` (environment, target, strategy).
- If no deploy config found, prompt for environment details.
- Execute deployment using configured strategy (rolling/blue-green/canary).
- Log output to `_aegis-output/deployments/deploy-YYYY-MM-DD.log`.

#### Step 3: Health Check (60-second timeout)
- Run health checks as defined in `deploy/health-checks.yaml`:
  - HTTP endpoint: expected status code within timeout
  - Process: expected services running
  - Log scan: no FATAL/PANIC in last 60 seconds
  - Custom checks if configured
- All checks must pass within 60-second window.
- If HEALTHY: proceed to Step 4.
- If UNHEALTHY:
  ```
  ❌ Health check failed — triggering rollback
  Failed checks:
  - [check name]: [failure detail]
  ```
  Execute automatic rollback (see rollback subcommand below).
  Create PM.03 Correction Register entry.

#### Step 4: Post-Deploy Monitor (5 minutes)
- Monitor error rate against baseline from previous deploy report.
- Check every 30 seconds for 5 minutes.
- If error_rate > 2x baseline: auto-rollback + create hotfix task (CRITICAL priority).
- If error_rate > 1.5x baseline: WARNING alert, continue monitoring.
- If stable for 5 minutes:
  ```
  ✅ Deploy successful — stable for 5 minutes
  ```
- Log output to `_aegis-output/deployments/monitor-YYYY-MM-DD.log`.

#### Step 5: Generate Deployment Report
- Write report to `_aegis-output/deployments/deploy-YYYY-MM-DD.md`:
  ```markdown
  # Deployment Report — YYYY-MM-DD

  ## Summary
  | Field | Value |
  |-------|-------|
  | Date | YYYY-MM-DD HH:MM |
  | Version | [version] |
  | Environment | [env] |
  | Strategy | [rolling/blue-green/canary] |
  | Result | [SUCCESS/ROLLBACK/FAILED] |

  ## Gate Results
  - Gate 1 (Code): PASS
  - Gate 2 (QA): PASS
  - Gate 3 (Compliance): PASS

  ## Build
  - Project type: [type]
  - Build time: [duration]
  - Artifacts: [list]

  ## Health Check
  - HTTP: [status]
  - Process: [status]
  - Log scan: [status]

  ## Monitor (5 min)
  - Baseline error rate: [rate]
  - Peak error rate: [rate]
  - Result: [STABLE/WARNING/ROLLBACK]

  ## Actions Taken
  - [list of any rollbacks, hotfixes, corrections]
  ```

---

### Subcommand: /aegis-deploy build

**Agent**: Thor (sub-agent, solo mode)

- Run only Step 1 (Build Verification) from the full pipeline.
- Output build log and report result.
- Does NOT deploy.

---

### Subcommand: /aegis-deploy health

**Agent**: Thor (sub-agent, solo mode)

- Run health checks on the current deployment.
- Does NOT require gate verification (diagnostic tool).
- Report results:
  ```
  Health Check Results — YYYY-MM-DD HH:MM
  - HTTP endpoint: [PASS/FAIL] [details]
  - Process check: [PASS/FAIL] [details]
  - Log scan: [PASS/FAIL] [details]
  - Custom checks: [PASS/FAIL] [details]
  Overall: [HEALTHY/UNHEALTHY]
  ```

---

### Subcommand: /aegis-deploy rollback

**Agent**: Thor (sub-agent, solo mode). If hotfix needed, TeamCreate with Spider-Man.

1. Identify previous known-good deployment from `_aegis-output/deployments/`.
2. Revert to that deployment.
3. Re-run health checks to confirm rollback success.
4. If rollback succeeds:
   - Create PM.03 Correction Register entry.
   - Report success.
5. If rollback fails:
   - CRITICAL alert to Captain America + human.
   - Create PM.03 Correction Register with CRITICAL severity.

---

### Subcommand: /aegis-deploy status

**Agent**: Thor (sub-agent, solo mode)

- Read latest deployment report from `_aegis-output/deployments/`.
- Display:
  ```
  ╔══════════════════════════════════════════╗
  ║  Deployment Status                       ║
  ╠══════════════════════════════════════════╣
  ║  Version:     [version]                  ║
  ║  Environment: [env]                      ║
  ║  Deployed:    [date/time]                ║
  ║  Uptime:      [duration]                 ║
  ║  Status:      [RUNNING/DEGRADED/DOWN]    ║
  ║  Last Health: [HEALTHY/UNHEALTHY]        ║
  ╚══════════════════════════════════════════╝
  ```

---

## Hotfix Workflow (Thor + Spider-Man coordination)
When health check or monitoring detects a failure requiring code changes:
1. Thor creates a hotfix task with CRITICAL priority.
2. Thor spawns Spider-Man via TeamCreate to write the fix.
3. Spider-Man implements the fix in src/ (Thor NEVER touches src/).
4. Thor runs build verification on the fix.
5. Thor redeploys with the hotfix.
6. Thor monitors for stability.

## PM.03 Correction Register (auto-created on failure)
On any deploy failure, health check failure, or rollback, automatically generate:
- File: `_aegis-output/iso-docs/PM.03-correction-register.md` (append entry)
- Fields: date, ID, source, description, severity, status, corrective action, follow-up

## Output Location
`_aegis-output/deployments/deploy-YYYY-MM-DD.md`
