#!/usr/bin/env bash
# AEGIS Hook — post-edit-accumulate.sh
# Records edited file paths into a session-scoped accumulator for batched
# Stop-time format/typecheck. Runs after every Edit/Write/MultiEdit.
#
# Pattern adopted from ECC's post:edit:accumulator + stop:format-typecheck.
# See @references/multi-agent-patterns.md for rationale.

set -euo pipefail

INPUT=$(cat)

TOOL=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo "")
FILE=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")

# Only accumulate for write-family tools
case "$TOOL" in
    Edit|Write|MultiEdit) ;;
    *) exit 0 ;;
esac

[[ -z "$FILE" ]] && exit 0

# Accumulator file scoped per session (falls back to "default" if no session id).
SESSION_ID="${CLAUDE_SESSION_ID:-default}"
ACC_DIR="/tmp/aegis-edits"
ACC_FILE="${ACC_DIR}/${SESSION_ID}.txt"

mkdir -p "$ACC_DIR" 2>/dev/null || true
echo "$FILE" >> "$ACC_FILE" 2>/dev/null || true

exit 0
