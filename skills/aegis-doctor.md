---
name: aegis-doctor
description: "Post-install health check — validates all 13 AEGIS agents, teams, references, and brain structure. Reports pass/warn/fail per component."
triggers:
  - doctor
  - health check
  - verify install
  - check agents
  - validate aegis
  - ตรวจสุขภาพ
  - เช็คติดตั้ง
---

# /aegis-doctor — AEGIS Health Check

Validates every component of an AEGIS installation and produces a structured
pass/warn/fail report. Read-only. Safe to run at any time.

## Checks Performed

| Check | Critical | Warning |
|-------|----------|---------|
| Agent model IDs (must be claude-opus-4-6 / sonnet-4-6 / haiku-4-5-20251001) | ✓ | |
| Agent name matches filename | ✓ | |
| No tool/disallowedTools conflict | ✓ | |
| Constraints section present | ✓ | |
| Team subagent_type matches real agent | ✓ | |
| Brain paths exist | ✓ | |
| Output location section present | | ✓ |
| Reference files complete | | ✓ |
| ISO doc directories present | | ✓ |

## Usage

```
/aegis-doctor
```

No arguments required. Run after install, upgrade, or whenever agent behavior
seems unexpected.

## Output

- Console: summary with ✅/🟡/🔴 per component
- File: `_aegis-output/research/YYYY-MM-DD_aegis-doctor.md`

## Related Commands

- `/aegis-start` — runs after doctor in a healthy install
- `/aegis-compliance` — deeper ISO 29110 audit (requires doctor PASS first)
