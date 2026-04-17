#!/usr/bin/env bash
# AEGIS Hook — guard-bash.sh
# Blocks dangerous Bash commands before execution (PreToolUse)
# Enforces Golden Rules 1-3 at the machine level
#
# Input:  JSON on stdin  { "tool_name": "Bash", "tool_input": { "command": "..." } }
# Output: JSON on stdout { "decision": "block", "reason": "..." }  (exit 2 to block)

set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

block() {
    echo "{\"decision\":\"block\",\"reason\":\"$1\"}"
    exit 2
}

# Strip heredoc bodies and -m "..." commit messages before checking patterns.
# This prevents false positives when dangerous strings appear in commit message text.
SAFE_CMD=$(python3 -c "
import sys, re
cmd = sys.stdin.read()
# Truncate at heredoc start (<<'WORD' or <<WORD) — body is documentation, not executable
cmd = re.sub(r'<<[^\s<>]+.*', '', cmd, flags=re.DOTALL)
# Remove -m '...' and -m \"...\" inline commit messages
cmd = re.sub(r'-m\s+([\'\"]).+?\1', '-m <msg>', cmd, flags=re.DOTALL)
print(cmd)
" <<< "$CMD" 2>/dev/null || echo "$CMD")

# ── Golden Rule 1: NEVER force-push ──────────────────────────────────────────
if echo "$SAFE_CMD" | grep -qE 'git push\s+(-f|--force)'; then
    block "AEGIS Golden Rule 1 violated: git push --force is banned. Use a branch + PR instead."
fi

# ── Golden Rule 2: warn on push to main (soft check — not all repos require PRs) ──
if echo "$SAFE_CMD" | grep -qE 'git push\s+(origin\s+)?main(\s|$)'; then
    echo "⚠️  AEGIS Golden Rule 2: pushing directly to main. Confirm this is intentional." >&2
    # Warn only — exit 0 allows it. Hard block is reserved for --force.
fi

# ── Golden Rule 3: NEVER amend commits ───────────────────────────────────────
if echo "$SAFE_CMD" | grep -qE 'git commit\s+.*--amend'; then
    block "AEGIS Golden Rule 3 violated: git commit --amend breaks all agents. Create a new commit."
fi

# ── Safety: no rm -rf on root/home ───────────────────────────────────────────
# Only match when rm appears at a command boundary (start, after &&/||/;/newline)
# This avoids false positives when rm -rf appears inside echo/cat arguments
if echo "$SAFE_CMD" | grep -qE '(^|&&|\|\||;|\n)\s*rm\s+-rf?\s+((/|/\*|~|~/)(\s|$)|/(bin|boot|etc|home|lib|proc|root|sbin|sys|usr|var)(/|\s|$))'; then
    block "AEGIS Safety: rm -rf on /, ~, or system dirs is catastrophically dangerous. Operation blocked. Safe targets like /tmp/foo, ./build are allowed."
fi

# ── Safety: no git reset --hard ──────────────────────────────────────────────
if echo "$SAFE_CMD" | grep -qE 'git reset\s+--hard'; then
    block "AEGIS Safety: git reset --hard destroys uncommitted work. Use git stash or create a backup commit first."
fi

# ── Safety: no git clean -f ──────────────────────────────────────────────────
if echo "$SAFE_CMD" | grep -qE 'git clean\s+-f'; then
    block "AEGIS Safety: git clean -f permanently deletes untracked files. Operation blocked."
fi

# Allow — log to activity.log (best-effort, don't fail if log missing)
LOG="_aegis-brain/logs/activity.log"
if [[ -f "$LOG" ]]; then
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "unknown")
    SHORT_CMD=$(echo "$CMD" | head -c 120 | tr '\n' ' ')
    echo "[${TIMESTAMP}] [HOOK:guard-bash] ALLOW — ${SHORT_CMD}" >> "$LOG" 2>/dev/null || true
fi

exit 0
