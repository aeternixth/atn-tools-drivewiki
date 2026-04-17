---
name: aegis-doctor
description: "Post-install health check — validates all 13 agents, teams, references, and brain structure"
triggers:
  en: doctor, health check, verify install, check agents, validate aegis
  th: ตรวจสุขภาพ, เช็คติดตั้ง, ตรวจ agent
---

# /aegis-doctor

## Quick Reference
Validates AEGIS installation: checks all agent model IDs, required fields, tool lists,
cross-references, team files, and brain directory structure. Read-only — never modifies files.

## Full Instructions

### Step 1: Print Header
```
🩺 AEGIS DOCTOR — Health Check
Timestamp: [current UTC]
AEGIS Version: 8.3
```

### Step 2: Validate Agent Files

For each file in `.claude/agents/`:

1. Read frontmatter (`name`, `model`, `tools`, `disallowedTools`, `description`)
2. Check `name` matches filename (without `.md`) → 🔴 if mismatch
3. Check `model` is one of:
   - `claude-opus-4-6`
   - `claude-sonnet-4-6`
   - `claude-haiku-4-5-20251001`
   → 🔴 Critical if invalid
4. Check `tools` is non-empty array → 🟡 Warning if missing
5. Check no tool appears in both `tools` AND `disallowedTools` → 🔴 if conflict
6. Check `## Constraints` section exists → 🔴 if missing
7. Check `## Output Location` section exists → 🟡 if missing
8. Collect result: `✅ PASS` / `🟡 WARN` / `🔴 FAIL`

### Step 3: Validate Team Files

For each file in `.claude/teams/`:

1. Extract all `subagent_type:` values
2. For each value: check matching file exists in `.claude/agents/`
3. 🔴 Critical if any subagent_type has no matching agent file

### Step 4: Validate Reference Files

Check these files exist in `.claude/references/`:
- quality-protocol.md
- context-rules.md
- adaptive-thinking-guide.md
- context-editing-protocol.md
- autonomy-levels.md
- message-types.md

→ 🟡 Warning for each missing file

### Step 5: Validate Brain Structure

Check these paths exist:
- `_aegis-brain/tasks/` (contains at least 1 file)
- `_aegis-brain/sprints/current/kanban.md`
- `_aegis-brain/logs/activity.log`
- `_aegis-brain/resonance/`
- `_aegis-output/iso-docs/PM-01-project-plan/`
- `_aegis-output/iso-docs/SI-01-requirements-spec/`
- `_aegis-output/iso-docs/SI-02-traceability-matrix/` (or SI-03-traceability)

→ 🔴 Critical for any missing brain path
→ 🟡 Warning for any missing iso-docs path

### Step 6: Print Summary

```
AGENTS (N/13 checked)
  ✅/🟡/🔴 [name]  [model]  tools=N  constraints=N

TEAMS ([N] files checked)
  ✅/🔴 [team-name]

REFERENCES ([N]/6 present)
  ✅/🟡 [filename]

BRAIN STRUCTURE
  ✅/🔴 [path]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERALL: [✅ PASS | 🟡 WARN | 🔴 FAIL]
  Critical: N  |  Warnings: N  |  Checks: N
```

### Step 7: Write Report

Write full report to: `_aegis-output/research/YYYY-MM-DD_aegis-doctor.md`

### Step 8: If Any Critical Failures

Print:
```
🔴 ACTION REQUIRED:
  Run: bash <(curl -sL .../install-remote.sh) --upgrade
  Or fix manually — see report at _aegis-output/research/YYYY-MM-DD_aegis-doctor.md
```

### Gate Logic

| Verdict | Condition |
|---------|-----------|
| ✅ PASS | 0 critical, 0 warnings |
| 🟡 WARN | 0 critical, 1+ warnings |
| 🔴 FAIL | 1+ critical findings |
