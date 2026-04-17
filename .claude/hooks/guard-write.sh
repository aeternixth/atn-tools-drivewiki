#!/usr/bin/env bash
# AEGIS Hook — guard-write.sh
# Blocks Edit/Write/MultiEdit on protected lint/format/typecheck config files (PreToolUse).
# Prevents agents from "fixing" quality errors by weakening the rules instead of the code.
#
# Input:  JSON on stdin  { "tool_name": "Edit|Write|MultiEdit", "tool_input": { "file_path": "..." } }
# Output: JSON on stdout { "decision": "block", "reason": "..." }  (exit 2 to block)

set -euo pipefail

INPUT=$(cat)

TOOL=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo "")
FILE=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")

# Only act on write-family tools
case "$TOOL" in
    Edit|Write|MultiEdit) ;;
    *) exit 0 ;;
esac

[[ -z "$FILE" ]] && exit 0

BASENAME=$(basename "$FILE")

block() {
    echo "{\"decision\":\"block\",\"reason\":\"$1\"}"
    exit 2
}

# ── Protected config patterns ─────────────────────────────────────────────
# Category 1: JavaScript/TypeScript lint + format configs
JS_PATTERNS=(
    ".eslintrc" "eslint.config."
    ".prettierrc" "prettier.config."
    "biome.json" "biome.jsonc"
    "tsconfig" "jsconfig.json"
)

# Category 2: Python lint + format configs
PY_PATTERNS=(
    "pyproject.toml"        # [tool.ruff] / [tool.black] / [tool.mypy]
    "ruff.toml" ".ruff.toml"
    ".flake8" "setup.cfg"
    "mypy.ini" ".mypy.ini"
    "tox.ini"
)

# Category 3: Go / Rust / other language configs
OTHER_PATTERNS=(
    "rustfmt.toml" ".rustfmt.toml"
    "clippy.toml" ".clippy.toml"
    ".golangci.yml" ".golangci.yaml"
    ".editorconfig"
)

# Category 4: Test runner strict configs
TEST_PATTERNS=(
    "jest.config." "vitest.config."
    "pytest.ini"
    "playwright.config."
)

ALL_PATTERNS=( "${JS_PATTERNS[@]}" "${PY_PATTERNS[@]}" "${OTHER_PATTERNS[@]}" "${TEST_PATTERNS[@]}" )

for pattern in "${ALL_PATTERNS[@]}"; do
    if [[ "$BASENAME" == *"$pattern"* ]]; then
        block "AEGIS Config Protection: '${BASENAME}' is a quality config file. Fix the code, not the rules. If this change is intentional (e.g. tightening rules, adding a new rule), ask the human to edit it directly — agents should not weaken quality gates to bypass failing builds."
    fi
done

# Category 5: AEGIS framework self-protection (never let agents edit hooks/settings mid-session)
AEGIS_PATTERNS=(
    ".claude/settings.json"
    ".claude/settings.local.json"
)
for pattern in "${AEGIS_PATTERNS[@]}"; do
    if [[ "$FILE" == *"$pattern"* ]]; then
        block "AEGIS Self-Protection: '${FILE}' is part of the AEGIS framework. Mid-session edits to hooks/settings would destabilize the running session. Ask the human to make this change between sessions."
    fi
done

# Allow — log to activity.log (best-effort, don't fail if log missing)
LOG="_aegis-brain/logs/activity.log"
if [[ -f "$LOG" ]]; then
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "unknown")
    SHORT_FILE=$(echo "$FILE" | head -c 120)
    echo "[${TIMESTAMP}] [HOOK:guard-write] ALLOW — ${TOOL} ${SHORT_FILE}" >> "$LOG" 2>/dev/null || true
fi

exit 0
