# Multi-Agent Patterns — Adopted from Global Research

> Proven patterns from the Claude multi-agent community, integrated into AEGIS v8.3+.

---

## Pattern 1: Claude Code Hooks (Enforcement Layer)

**Source**: Anthropic official Claude Code docs
**Status**: ✅ Wired in `.claude/settings.json` + `.claude/hooks/`

Three hooks enforce Golden Rules at the machine level:

| Hook | Script | Enforces |
|------|--------|---------|
| PreToolUse (Bash) | `guard-bash.sh` | Block `--force`, `--amend`, `rm -rf /`, direct push to main |
| PostToolUse (Bash) | `post-tool-use.sh` | Log git commits + test results (Metaswarm validation) |
| Stop | `on-stop.sh` | Remind human to run `/aegis-retro` (Golden Rule 6) |

**How it works**: Hook scripts receive JSON on stdin, exit 2 to block, exit 0 to allow.
**Logs**: All events append to `_aegis-brain/logs/activity.log`.

---

## Pattern 2: Agent `tools` Frontmatter (Blast Radius Enforcement)

**Source**: Claude Code subagent docs
**Status**: ✅ All 13 agents have `tools:` and `disallowedTools:` in frontmatter

Claude Code machine-enforces tool access per agent — not just documentation.

| Agent | Tools Allowed | Tools Blocked |
|-------|--------------|--------------|
| Spider-Man | Read, Write, Edit, Bash, Glob, Grep | Agent (can't spawn sub-agents) |
| Beast | Read, Glob, Grep, Bash, WebFetch, code_execution | Write, Edit, Agent |
| Coulson | Read, Glob, Grep, Write, Edit | Bash, Agent |
| Loki | Read, Write, Glob, Grep | Bash, Agent |
| Vision | Read, Bash, Glob, Grep | Write, Edit, Agent |

---

## Pattern 3: Plan-Approval Gate (Iron Man → Loki → Build)

**Source**: Anthropic multi-agent research + Metaswarm
**Status**: ✅ Added to Iron Man and Loki agent definitions

Prevents premature implementation — every spec gets adversarial review before code is written.

```
Iron Man writes spec
      ↓
Iron Man → Loki: PlanProposal
      ↓
Loki → Iron Man: PlanApprovalResponse (APPROVE / CONDITIONAL / REJECT)
      ↓ (only if APPROVE or CONDITIONAL)
Iron Man → Nick Fury: "spec approved"
      ↓
Nick Fury → Spider-Man: TaskAssignment
```

**Gate bypass**: Only P0/P1 hotfixes skip Loki review.

---

## Pattern 4: CLAUDE_CODE_TASK_LIST_ID (Native Task Coordination)

**Source**: Anthropic internal + claude_code_agent_farm
**Status**: ✅ Set in `.claude/settings.json` env

```json
"CLAUDE_CODE_TASK_LIST_ID": "aegis-shared-tasks"
```

Multiple sub-agents can self-claim tasks from the shared list without Nick Fury polling each one.
Reduces orchestration overhead by ~40% in parallel workloads.

**Agent behavior**: When picking a task, check shared list first, claim it atomically, then execute.

---

## Pattern 5: TinMan Heartbeat (Background Monitor)

**Source**: TinMan project + ELF framework (30s heartbeat)
**Status**: ✅ Script at `.claude/hooks/tinman-heartbeat.sh`

Zero-dependency health monitor runs on cron (every 5 minutes):

**Checks**:
- Git working directory clean?
- Brain directories intact (`resonance/`, `tasks/`, `logs/`, `sprints/current/`)
- Kanban board exists?
- BLOCK 0 docs present (PM.01, SI.01, SI.02)?
- Activity log written in last 24h?

**Install**:
```bash
bash .claude/hooks/tinman-heartbeat.sh --install-cron
```

**Log**: `_aegis-brain/logs/heartbeat.log` (last 500 lines, auto-trimmed)

---

## Anti-Patterns Avoided

Based on research failures:

| Anti-Pattern | Why Avoided |
|-------------|-------------|
| Agent self-reports task as done | Metaswarm: PostToolUse hook independently validates |
| All agents load simultaneously | Progressive disclosure: only active agent prompt loaded |
| Trusting subagent "I'm done" | Nick Fury reads output files directly to verify completion |
| No blast radius limits | Machine-enforced via `tools`/`disallowedTools` frontmatter |
| Planning skipped under pressure | Plan-Approval Gate + BLOCK 0 are non-negotiable |

---

## Patterns Adopted from ECC (everything-claude-code, v8.3.1)

After a deep-dive analysis of `affaan-m/everything-claude-code` (145k stars,
Anthropic Hackathon winner), AEGIS adopted four high-leverage patterns:

### Pattern 6: Runtime Hook Profile Switching (from ECC)
**Source**: ECC's `scripts/hooks/run-with-flags.js`
**Status**: ✅ Wired via `.claude/hooks/run-with-flags.sh` + `profiles.json`

Two env vars control hook execution at runtime:
```bash
AEGIS_HOOK_PROFILE=minimal|standard|strict   # profile membership check
AEGIS_DISABLED_HOOKS=id1,id2                 # explicit opt-out
```

Every hook in `settings.json` is wrapped: `run-with-flags.sh <hook-id> <script>`.
The wrapper checks the profile manifest, exits silently if not in profile, otherwise
pipes stdin through to the real hook. Pairs with `/aegis-mode` autonomy L1-L4.

### Pattern 7: Batched Stop-time Format/Typecheck (from ECC)
**Source**: ECC's `post:edit:accumulator` + `stop:format-typecheck` hooks
**Status**: ✅ Wired via `post-edit-accumulate.sh` + updated `on-stop.sh`

Instead of running `tsc` / `biome` after every Edit (expensive), record edited
paths in a session-scoped accumulator file (`/tmp/aegis-edits/<session>.txt`)
and run a single batched check at Stop time. Deduped, scoped per session.

Result: Spider-Man loop speed-up (10 edits = 1 tsc run, not 10).

### Pattern 8: Write-Side Config Protection (from ECC)
**Source**: ECC's `pre:config-protection` hook
**Status**: ✅ Wired via `guard-write.sh` on Edit/Write/MultiEdit

Blocks agents from editing lint/format/typecheck config files
(`.eslintrc*`, `biome.json`, `tsconfig*.json`, `pyproject.toml`, `ruff.toml`,
etc.). Prevents the "silence the linter to ship" anti-pattern where an agent
weakens rules instead of fixing code.

Also protects AEGIS's own `settings.json` from mid-session edits.

### Pattern 9: Instinct Confidence Lifecycle (from ECC)
**Source**: ECC's `continuous-learning-v2` skill
**Status**: ✅ Implemented in `_aegis-brain/instincts/` + `/aegis-instinct` + `/aegis-evolve`

Upgrades freeform `_aegis-brain/learnings/` lessons into confidence-scored
YAML instincts with 4 lifecycle stages: `pending` → `active` → `promoted` → `retired`.

- **Loki** loads `promoted/` as hard rules (auto-REJECT) and `active/` as warnings
- **`/aegis-instinct reinforce <id>`** bumps confidence +0.15, auto-promotes at thresholds
- **`/aegis-evolve`** clusters similar instincts, merges duplicates, retires stale

This is how AEGIS's lesson system becomes a self-enforcing immune system.

---

## Patterns Adopted from VoltAgent/awesome-design-md (v8.4)

After analysis of `VoltAgent/awesome-design-md` (35.7k stars in 9 days), AEGIS
adopted five format/discipline patterns for spec documents:

### Pattern 10: `DESIGN.md` Visual Design System (Google Stitch 9-section format)
**Source**: Google Stitch + VoltAgent/awesome-design-md
**Status**: ✅ New skill `skills/design-system-md.md`, owned by Wasp

AEGIS previously had no story for visual design. Iron Man wrote functional
specs, but no one defined HOW the UI should look. Result: every project shipped
generic bootstrap-style UI. `DESIGN.md` fills this gap with a locked 9-section
skeleton: Theme → Colors → Typography → Components → Layout → Depth →
Do's/Don'ts → Responsive → **Agent Prompt Guide**.

Owned by Wasp. Iron Man validates technical feasibility. Loki adversarially
reviews for internal contradictions.

### Pattern 11: Do's and Don'ts Guardrail Blocks
**Source**: Every DESIGN.md §7
**Status**: ✅ Mandatory in super-spec, iso-29110-docs, aegis-reengineer

Every Iron Man spec, ISO 29110 document, and re-engineering master spec now
ends with a `## Do's and Don'ts` section containing two bulleted lists (5–12
items each). Items must be:
- Imperative ("Do X" / "Don't Y", never "should")
- Verifiable (Loki can check violations)
- Non-obvious (skip platitudes like "write tests")

Loki enforces format at Plan-Approval Gate — missing Do's/Don'ts = CONDITIONAL.

### Pattern 12: Agent Prompt Guide Footer
**Source**: Every DESIGN.md §9
**Status**: ✅ Mandatory in aegis-reengineer master spec, Iron Man architecture specs

Every spec ends with 3–7 copy-paste-ready prompts for downstream agents
(Spider-Man, Thor, Coulson). Compresses the spec→build handoff from hours
of interpretation to minutes of execution. Example:
```
### Prompts for Spider-Man
- "Scaffold src/db/schema.ts per §1 CREATE manifest using Drizzle..."
```

### Pattern 13: Locked H2 Skeletons for ISO 29110 Docs
**Source**: VoltAgent's stable-skeleton-across-all-files discipline
**Status**: ✅ Frozen in `skills/iso-29110-docs.md`

Each ISO document type (PM.01, PM.02, PM.03, SI.01–SI.06) has a FROZEN list of
required H2 sections in a fixed order. Coulson validates skeleton compliance
before writing any doc — missing or reordered sections = document rejected.
Makes documents diff-able, teachable to new agents, and lint-able.

Config-protection style enforcement applied to documents instead of lint configs.

### Pattern 14: Matrix Table Convention (≥3 values → table)
**Source**: Every DESIGN.md §3, §6, §8 + Stitch recommendation
**Status**: ✅ Mandatory convention in Iron Man agent definition

Any architectural concept with 3+ discrete values MUST use a table, not prose.
Canonical tables:
- `Layer | Responsibility | Interface`
- `Severity | Handler | Escalation`
- `Trust Zone | Auth | Data Access`
- `Breakpoint | Name | Layout Changes`

Prose is ambiguous; tables are parseable. Saves agents ~200 words per concept.

Plus Pattern 14b: **Soul paragraph** requirement — every spec opens with 2–3
sentences naming the feel/intent BEFORE any bullets. Provides semantic anchor
for ambiguous decisions downstream.

---

## Related Files

- `.claude/hooks/guard-bash.sh` — PreToolUse Bash blocker
- `.claude/hooks/guard-write.sh` — PreToolUse Edit/Write blocker (config-protection)
- `.claude/hooks/post-tool-use.sh` — PostToolUse Bash logger
- `.claude/hooks/post-edit-accumulate.sh` — PostToolUse Edit accumulator
- `.claude/hooks/on-stop.sh` — Stop reminder + batched format/typecheck
- `.claude/hooks/run-with-flags.sh` — Profile/disable wrapper for all hooks
- `.claude/hooks/profiles.json` — Hook profile registry (minimal/standard/strict)
- `.claude/hooks/tinman-heartbeat.sh` — Background monitor
- `.claude/settings.json` — Hook wiring + env vars (AEGIS_HOOK_PROFILE)
- `_aegis-brain/instincts/` — Instinct registry (pending/active/promoted/retired)
- `.claude/commands/aegis-instinct.md` — Instinct management command
- `.claude/commands/aegis-evolve.md` — Cluster + merge + promote command
- `skills/design-system-md.md` — DESIGN.md 9-section skeleton (Wasp-owned)
- `skills/super-spec.md` — §8 Do's/Don'ts mandatory
- `skills/aegis-reengineer.md` — §6 Do's/Don'ts + §7 Agent Prompt Guide
- `skills/iso-29110-docs.md` — Locked H2 skeletons per document type
- `.claude/agents/iron-man.md` — Spec Format Conventions (soul + tables + Do/Don't + prompts)
- `.claude/agents/wasp.md` — Primary owner of DESIGN.md
- `.claude/agents/loki.md` — Spec Format Enforcement (auto-CONDITIONAL on missing sections)
- `@references/quality-protocol.md` — Gate 0 + 6-gate quality system
- `@references/adaptive-thinking-guide.md` — Effort levels per agent
