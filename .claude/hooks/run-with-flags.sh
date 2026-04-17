#!/usr/bin/env bash
# AEGIS Hook Wrapper — run-with-flags.sh
# Gates execution of downstream hooks based on:
#   - AEGIS_HOOK_PROFILE  (minimal|standard|strict, default: standard)
#   - AEGIS_DISABLED_HOOKS (comma-separated hook IDs)
#
# Usage: bash .claude/hooks/run-with-flags.sh <hook_id> <path-to-hook-script> [args...]
# Pattern adopted from ECC's scripts/hooks/run-with-flags.js.
#
# The wrapper is INPUT-transparent: stdin is passed through to the downstream
# hook unchanged. If the hook is gated off, stdin is silently consumed and
# exit 0 is returned (no block, no side effects).

set -euo pipefail

HOOK_ID="${1:-}"
HOOK_CMD="${2:-}"
shift 2 || true

if [[ -z "$HOOK_ID" || -z "$HOOK_CMD" ]]; then
    echo "run-with-flags: missing HOOK_ID or HOOK_CMD" >&2
    exit 1
fi

PROFILE="${AEGIS_HOOK_PROFILE:-standard}"
DISABLED="${AEGIS_DISABLED_HOOKS:-}"
MANIFEST=".claude/hooks/profiles.json"

# Consume stdin first so we can pass it through OR discard it consistently.
# Use a fd trick to keep the pipe intact for the downstream call.
STDIN_CACHE=$(cat || true)

# ── Explicit disable wins ─────────────────────────────────────────────────
# Match whole words in the comma-separated list (avoid partial matches).
if [[ -n "$DISABLED" ]]; then
    IFS=',' read -r -a DISABLED_ARR <<< "$DISABLED"
    for d in "${DISABLED_ARR[@]}"; do
        # Trim whitespace
        d=$(echo "$d" | tr -d '[:space:]')
        if [[ "$d" == "$HOOK_ID" ]]; then
            # Hook is explicitly disabled — exit silently
            exit 0
        fi
    done
fi

# ── Profile membership check ──────────────────────────────────────────────
# If manifest exists, check if HOOK_ID is a member of the active profile.
# If manifest is missing or unparseable, fail open (run everything).
if [[ -f "$MANIFEST" ]] && command -v python3 &>/dev/null; then
    IN_PROFILE=$(python3 -c "
import json, sys
try:
    with open('$MANIFEST') as f:
        data = json.load(f)
    profiles = data.get('profiles', {})
    members = profiles.get('$PROFILE', [])
    print('yes' if '$HOOK_ID' in members else 'no')
except Exception:
    print('yes')  # fail open
" 2>/dev/null || echo "yes")

    if [[ "$IN_PROFILE" == "no" ]]; then
        exit 0
    fi
fi

# ── Run the downstream hook with original stdin ────────────────────────────
echo "$STDIN_CACHE" | bash "$HOOK_CMD" "$@"
