#!/usr/bin/env bash
# AEGIS Hook — on-stop.sh
# Fires when Claude is about to stop the session (Stop event)
# Enforces Golden Rule 6: Run /aegis-retro at session end
# Logs session end + reminds human to run retro
#
# Input:  JSON on stdin { "session_id": "...", "stop_hook_active": false, ... }
# Output: stdout message displayed to user (exit 0 = allow stop)

set -euo pipefail

INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stop_hook_active', False))" 2>/dev/null || echo "False")

# Log session end
LOG="_aegis-brain/logs/activity.log"
if [[ -f "$LOG" ]]; then
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "unknown")
    echo "[${TIMESTAMP}] [HOOK:on-stop] SESSION_END — Claude stopping" >> "$LOG" 2>/dev/null || true
fi

# ── Batched format/typecheck ──────────────────────────────────────────────
# Pattern adopted from ECC. Runs a single format + typecheck pass over all
# files edited during this response, instead of per-edit (expensive).
# Skipped if stop_hook_active (prevents loops) or if no accumulator file.
if [[ "$STOP_HOOK_ACTIVE" != "True" ]]; then
    SESSION_ID="${CLAUDE_SESSION_ID:-default}"
    ACC_FILE="/tmp/aegis-edits/${SESSION_ID}.txt"
    if [[ -f "$ACC_FILE" ]]; then
        # Dedupe and extract file types we can check
        ALL_FILES=$(sort -u "$ACC_FILE" 2>/dev/null || true)
        TS_FILES=$(echo "$ALL_FILES" | grep -E '\.(ts|tsx|js|jsx|mjs|cjs)$' || true)
        PY_FILES=$(echo "$ALL_FILES" | grep -E '\.py$' || true)

        BATCH_COUNT=$(echo "$ALL_FILES" | grep -c . 2>/dev/null || echo 0)

        if [[ "$BATCH_COUNT" -gt 0 ]]; then
            echo ""
            echo "🔍 AEGIS batched quality check (${BATCH_COUNT} file(s) edited this turn)..."

            # TS/JS: try biome, fall back to prettier + tsc
            if [[ -n "$TS_FILES" ]]; then
                if [[ -f "biome.json" || -f "biome.jsonc" ]] && command -v npx &>/dev/null; then
                    echo "  ├─ biome check..."
                    echo "$TS_FILES" | xargs npx --no-install biome check --write 2>&1 | tail -3 || true
                fi
                if [[ -f "tsconfig.json" ]] && command -v npx &>/dev/null; then
                    echo "  ├─ tsc --noEmit..."
                    npx --no-install tsc --noEmit 2>&1 | tail -5 || true
                fi
            fi

            # Python: try ruff, fall back silently
            if [[ -n "$PY_FILES" ]]; then
                if command -v ruff &>/dev/null; then
                    echo "  ├─ ruff check..."
                    echo "$PY_FILES" | xargs ruff check 2>&1 | tail -5 || true
                fi
            fi

            echo "  └─ done"
        fi

        # Clean up accumulator for this session
        rm -f "$ACC_FILE" 2>/dev/null || true
    fi
fi

# Don't loop (stop_hook_active prevents infinite recursion)
if [[ "$STOP_HOOK_ACTIVE" == "True" ]]; then
    exit 0
fi

# Remind human
echo ""
echo "┌─────────────────────────────────────────────────────┐"
echo "│  🛡️  AEGIS — Session Ending                          │"
echo "│                                                     │"
echo "│  Golden Rule 6: Run /aegis-retro before you leave   │"
echo "│  This saves lessons, updates resonance, and logs    │"
echo "│  a handoff for the next session.                    │"
echo "│                                                     │"
echo "│  > /aegis-retro                                     │"
echo "└─────────────────────────────────────────────────────┘"

exit 0
