---
name: aegis-reengineer
description: "Re-engineer existing project — Beast scan + Iron Man draft + Loki gate + Iron Man master spec + AEGIS execute (100% local, no cloud)"
triggers:
  en: reengineer, re-engineer, modernize, upgrade tech stack, rewrite, refactor project
  th: ปรับปรุงโปรเจค, อัพเกรด, ปรับ tech stack, รีเอ็นจิเนียร์
---

# /aegis-reengineer

## Quick Reference
Systematically upgrade an existing project — modernize tech stack, add features, improve
performance. **100% local** — no cloud uploads, no `ultraplan`, no GitHub-app dependency.

The full pipeline runs inside Claude Code on your machine across 5 phases:
Beast scan → Iron Man draft → Loki critique → Iron Man master spec → AEGIS execute.

For the complete phase-by-phase agent dispatch contract, see [skills/aegis-reengineer.md](../../skills/aegis-reengineer.md).

## Usage

```
/aegis-reengineer — upgrade this project: modernize to [tech stack], add [features], target [performance goal]
```

Example:
```
/aegis-reengineer — modernize from Express+MongoDB to Fastify+PostgreSQL, add OAuth2 SSO, target API p95 < 150ms
```

Nick Fury parses the goal, then automatically runs Phases 1–5 in order.

## Pipeline Overview

| Phase | Agent | Output | Effort |
|-------|-------|--------|--------|
| 1. Current State Scan | Beast | `_aegis-output/research/reengineer-current-state.md` | low |
| 2. Target Architecture Draft | Iron Man | `_aegis-output/architecture/reengineer-target-state.md` | `ultrathink` |
| 3. Adversarial Review | Loki | `_aegis-output/adversarial/reengineer-loki-review.md` | `ultrathink` |
| 4. Master Spec | Iron Man | `_aegis-output/specs/reengineer-master-spec.md` | `ultrathink` |
| 5. Execution | Coulson + Pipeline | `_aegis-output/iso-docs/...` + sprints | per-agent |

## Loki Gate Behavior

- Phase 3 (Loki) returns `APPROVE` / `CONDITIONAL` / `REJECT`
- `APPROVE` or `CONDITIONAL` → proceed to Phase 4
- `REJECT` → loop back to Phase 2 (Iron Man revises, max 2 rounds)
- 2 consecutive `REJECT` → escalate to human, design has a fundamental flaw

## When to Skip Phases

| Scenario | Skip |
|----------|------|
| Project < 20 files | Skip Phase 4 — use Phase 2 draft directly as spec |
| Re-engineering scope = 1 module only | Use `/aegis-breakdown` directly, skip Phases 1–4 |
| BLOCK 0 not yet passing | Run `/aegis-start` first to initialize the project |

## Why Not `ultraplan`?

`ultraplan` is an Anthropic cloud feature that uploads your codebase to claude.ai.
**AEGIS prohibits cloud uploads** — local-first, no data egress. Iron Man with
`ultrathink` produces equivalent quality entirely locally. The trade-off is one
extra Iron Man pass for **zero data leakage**.

See [@references/adaptive-thinking-guide.md](../references/adaptive-thinking-guide.md)
for the full local-first policy.

## Related
- [skills/aegis-reengineer.md](../../skills/aegis-reengineer.md) — full agent dispatch contracts
- [/aegis-breakdown](aegis-breakdown.md) — narrower scope alternative for single-module refactors
- [/super-spec](https://) — used inside Phase 4 if no SRS/BRD exists yet
