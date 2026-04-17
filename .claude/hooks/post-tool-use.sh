#!/usr/bin/env bash
# AEGIS Hook — post-tool-use.sh
# Fires after every tool call (PostToolUse)
# Implements Metaswarm pattern: independently validate task completions
# Tracks test failures and git commits for activity log
#
# Input:  JSON on stdin { "tool_name": "...", "tool_input": {...}, "tool_response": {...} }
# Output: exit 0 always (PostToolUse hooks cannot block)

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_name',''))" 2>/dev/null || echo "")
CMD=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command','')[:200])" 2>/dev/null || echo "")
RESPONSE=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('tool_response',{}); print(str(r)[:300])" 2>/dev/null || echo "")

LOG="_aegis-brain/logs/activity.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "unknown")

if [[ ! -f "$LOG" ]]; then
    exit 0
fi

# Track git commits (Metaswarm: verify commits are real)
if [[ "$TOOL" == "Bash" ]] && echo "$CMD" | grep -qE 'git commit'; then
    COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    echo "[${TIMESTAMP}] [HOOK:post-tool] GIT_COMMIT — ${COMMIT_HASH} | cmd: ${CMD:0:80}" >> "$LOG" 2>/dev/null || true
fi

# Track test runs (Metaswarm: detect failures independently)
if [[ "$TOOL" == "Bash" ]] && echo "$CMD" | grep -qEi '(pytest|jest|npm test|go test|cargo test|rspec)'; then
    if echo "$RESPONSE" | grep -qiE '(FAIL|ERROR|failed|error)'; then
        echo "[${TIMESTAMP}] [HOOK:post-tool] TEST_FAIL — ${CMD:0:80}" >> "$LOG" 2>/dev/null || true
    elif echo "$RESPONSE" | grep -qiE '(PASS|passed|ok|success)'; then
        echo "[${TIMESTAMP}] [HOOK:post-tool] TEST_PASS — ${CMD:0:80}" >> "$LOG" 2>/dev/null || true
    fi
fi

exit 0
