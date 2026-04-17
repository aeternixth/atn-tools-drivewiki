#!/usr/bin/env bash
# AEGIS TinMan — tinman-heartbeat.sh
# Background health monitor (runs on cron, no Claude dependency)
# Inspired by ELF/TinMan pattern: 30s heartbeat, zero dependencies
#
# Install (run once):
#   chmod +x .claude/hooks/tinman-heartbeat.sh
#   ./.claude/hooks/tinman-heartbeat.sh --install-cron
#
# Manual run:
#   ./.claude/hooks/tinman-heartbeat.sh
#
# Output: _aegis-brain/logs/heartbeat.log

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG="${PROJECT_DIR}/_aegis-brain/logs/heartbeat.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ── Cron install ──────────────────────────────────────────────────────────────
if [[ "${1:-}" == "--install-cron" ]]; then
    CRON_JOB="*/5 * * * * cd ${PROJECT_DIR} && bash .claude/hooks/tinman-heartbeat.sh >> /tmp/aegis-tinman.log 2>&1"
    (crontab -l 2>/dev/null | grep -v "tinman-heartbeat"; echo "$CRON_JOB") | crontab -
    echo "[TinMan] Cron installed: every 5 minutes"
    echo "  To verify: crontab -l | grep tinman"
    echo "  To remove: crontab -l | grep -v tinman | crontab -"
    exit 0
fi

if [[ "${1:-}" == "--uninstall-cron" ]]; then
    (crontab -l 2>/dev/null | grep -v "tinman-heartbeat") | crontab -
    echo "[TinMan] Cron removed"
    exit 0
fi

# ── Health checks ─────────────────────────────────────────────────────────────
cd "$PROJECT_DIR"

ISSUES=()

# Check 1: Git status clean?
if ! git diff --quiet 2>/dev/null; then
    DIRTY_COUNT=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
    ISSUES+=("DIRTY_WORKDIR:${DIRTY_COUNT}_files_modified")
fi

# Check 2: Brain directories intact?
for dir in "_aegis-brain/resonance" "_aegis-brain/tasks" "_aegis-brain/logs" "_aegis-brain/sprints/current"; do
    if [[ ! -d "$dir" ]]; then
        ISSUES+=("MISSING_DIR:${dir}")
    fi
done

# Check 3: Kanban exists?
if [[ ! -f "_aegis-brain/sprints/current/kanban.md" ]]; then
    ISSUES+=("NO_KANBAN:sprints/current/kanban.md_missing")
fi

# Check 4: BLOCK 0 docs?
BLOCK0_MISSING=()
[[ ! -f "_aegis-output/iso-docs/PM-01-project-plan/plan.md" ]]        && BLOCK0_MISSING+=("PM.01")
[[ ! -f "_aegis-output/iso-docs/SI-01-requirements-spec/spec.md" ]]   && BLOCK0_MISSING+=("SI.01")
[[ ! -f "_aegis-output/iso-docs/SI-02-traceability-matrix/matrix.md" ]] && BLOCK0_MISSING+=("SI.02")
[[ ${#BLOCK0_MISSING[@]} -gt 0 ]] && ISSUES+=("BLOCK0_MISSING:${BLOCK0_MISSING[*]}")

# Check 5: Activity log last write (stale > 24h?)
if [[ -f "_aegis-brain/logs/activity.log" ]]; then
    LAST_MOD=$(stat -f "%m" "_aegis-brain/logs/activity.log" 2>/dev/null || stat -c "%Y" "_aegis-brain/logs/activity.log" 2>/dev/null || echo "0")
    NOW=$(date +%s)
    AGE_H=$(( (NOW - LAST_MOD) / 3600 ))
    [[ $AGE_H -gt 24 ]] && ISSUES+=("STALE_LOG:last_activity_${AGE_H}h_ago")
fi

# ── Write heartbeat log ───────────────────────────────────────────────────────
mkdir -p "$(dirname "$LOG")"

if [[ ${#ISSUES[@]} -eq 0 ]]; then
    STATUS="HEALTHY"
    DETAIL="all checks passed"
else
    STATUS="WARN"
    DETAIL=$(IFS=','; echo "${ISSUES[*]}")
fi

echo "[${TIMESTAMP}] [TINMAN] ${STATUS} — ${DETAIL}" >> "$LOG"

# Keep log manageable (last 500 lines)
if [[ $(wc -l < "$LOG") -gt 500 ]]; then
    tail -400 "$LOG" > "${LOG}.tmp" && mv "${LOG}.tmp" "$LOG"
fi

# Exit non-zero if issues found (useful for cron alerting)
[[ ${#ISSUES[@]} -gt 0 ]] && exit 1 || exit 0
