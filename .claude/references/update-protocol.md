# AEGIS Update Protocol — For AI Agents

> When upgrading AEGIS to a new version, follow this protocol EXACTLY.
> This file is read by Nick Fury and /aegis-start to handle updates.

## CURRENT VERSION: 8.2.1

## WHEN TO RUN THIS PROTOCOL

This protocol runs when:
1. `install.sh --upgrade` is executed
2. Nick Fury detects version mismatch between source and installed files
3. User says "update AEGIS", "upgrade", "อัพเดท"

## UPDATE FLOW

```
Step 1: BACKUP    → Save user data
Step 2: REMOVE    → Delete old framework files (NOT user data)
Step 3: INSTALL   → Copy new framework files from source
Step 4: VERIFY    → Check all files present + correct version
Step 5: MIGRATE   → Handle breaking changes between versions
```

## Step 1: BACKUP (never skip)

BACKUP these directories/files BEFORE any changes:
```
MUST BACKUP (user data — NEVER delete):
  _aegis-brain/tasks/          → per-task history, comments
  _aegis-brain/sprints/        → sprint plans, metrics
  _aegis-brain/resonance/      → evolved patterns, project identity
  _aegis-brain/learnings/      → auto-learned patterns
  _aegis-brain/skill-cache/    → shared intelligence
  _aegis-brain/metrics/        → token usage, benchmarks
  _aegis-brain/counters.json   → sequential ID state
  _aegis-brain/logs/           → activity history
  _aegis-brain/handoffs/       → session handoffs
  _aegis-brain/backlog/        → backlog items
  _aegis-output/iso-docs/      → ISO 29110 versioned documents
  _aegis-output/breakdown/     → work breakdown artifacts
  CLAUDE_lessons.md            → user patterns + anti-patterns
```

Create backup:
```bash
BACKUP_DIR="_aegis-backup/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r _aegis-brain/ "$BACKUP_DIR/" 2>/dev/null
cp -r _aegis-output/iso-docs/ "$BACKUP_DIR/" 2>/dev/null
cp CLAUDE_lessons.md "$BACKUP_DIR/" 2>/dev/null
```

## Step 2: REMOVE (old framework files only)

DELETE these directories/files — they will be replaced with new versions:
```
REMOVE (framework files — will be replaced):
  .claude/agents/*.md          → old agent personas
  .claude/commands/*.md        → old slash commands
  .claude/references/*.md      → old reference protocols
  .claude/teams/*.md           → old team configs
  .claude/settings.json        → old permissions (will be regenerated)
  skills/*.md                  → old skill definitions
  CLAUDE.md                    → old hub file
  CLAUDE_agents.md             → old agent catalog
  CLAUDE_safety.md             → old safety rules
  CLAUDE_skills.md             → old skill catalog
  install.sh                   → old installer
  aegis-team.sh                → old tmux script (legacy)
  GETTING_STARTED.md           → old getting started guide
  README.md                    → old readme (if in framework repo)
```

NEVER DELETE:
```
  _aegis-brain/                → ALL user data
  _aegis-output/iso-docs/      → versioned ISO documents
  _aegis-output/breakdown/     → work breakdowns
  _aegis-output/qa/            → QA reports
  _aegis-output/deployments/   → deploy history
  CLAUDE_lessons.md            → user patterns
  .gitignore                   → user may have customized
  Any src/, lib/, tests/ etc   → project source code
```

Remove command:
```bash
rm -rf .claude/agents/ .claude/commands/ .claude/references/ .claude/teams/
rm -f .claude/settings.json
rm -rf skills/
rm -f CLAUDE.md CLAUDE_agents.md CLAUDE_safety.md CLAUDE_skills.md
rm -f install.sh aegis-team.sh GETTING_STARTED.md
```

## Step 3: INSTALL (copy new files from source)

Copy ALL framework files from AEGIS-Team source:
```bash
SOURCE="$HOME/AEGIS-Team"  # or wherever the source repo is

# Core docs
cp "$SOURCE/CLAUDE.md" .
cp "$SOURCE/CLAUDE_agents.md" .
cp "$SOURCE/CLAUDE_safety.md" .
cp "$SOURCE/CLAUDE_skills.md" .

# Agent personas (13 files)
mkdir -p .claude/agents/
cp "$SOURCE/.claude/agents/"*.md .claude/agents/

# Commands (22 files)
mkdir -p .claude/commands/
cp "$SOURCE/.claude/commands/"*.md .claude/commands/

# References (11 files including this one)
mkdir -p .claude/references/
cp "$SOURCE/.claude/references/"*.md .claude/references/

# Teams (7 files)
mkdir -p .claude/teams/
cp "$SOURCE/.claude/teams/"*.md .claude/teams/

# Settings
cp "$SOURCE/.claude/settings.json" .claude/ 2>/dev/null

# Skills (29 files)
mkdir -p skills/
cp "$SOURCE/skills/"*.md skills/

# Scripts
cp "$SOURCE/install.sh" . 2>/dev/null
cp "$SOURCE/aegis-team.sh" . 2>/dev/null
chmod +x install.sh aegis-team.sh 2>/dev/null
```

Create directories that may not exist:
```bash
mkdir -p _aegis-brain/tasks _aegis-brain/sprints/current
mkdir -p _aegis-brain/resonance _aegis-brain/learnings/raw
mkdir -p _aegis-brain/skill-cache _aegis-brain/metrics
mkdir -p _aegis-brain/logs _aegis-brain/handoffs _aegis-brain/backlog
mkdir -p _aegis-output/specs _aegis-output/breakdown
mkdir -p _aegis-output/qa/results _aegis-output/iso-docs
mkdir -p _aegis-output/sessions _aegis-output/deployments
mkdir -p _aegis-output/reviews _aegis-output/architecture/archive
```

## Step 4: VERIFY

Check all critical files exist:
```
MUST EXIST after install:
  CLAUDE.md                           → hub file
  CLAUDE_agents.md                    → agent roster (lean)
  CLAUDE_safety.md                    → safety rules
  CLAUDE_skills.md                    → skill catalog (lean)
  .claude/agents/nick-fury.md      → autonomous controller
  .claude/agents/captain-america.md              → navigator
  .claude/agents/iron-man.md              → architect
  .claude/agents/spider-man.md              → implementer
  .claude/agents/black-panther.md             → reviewer
  .claude/agents/loki.md             → devil's advocate
  .claude/agents/beast.md             → scanner
  .claude/agents/wasp.md             → UX designer
  .claude/agents/songbird.md              → content creator
  .claude/agents/war-machine.md          → QA lead
  .claude/agents/vision.md             → QA executor
  .claude/agents/coulson.md            → compliance docs
  .claude/agents/thor.md               → DevOps
  .claude/commands/aegis-start.md     → session start
  .claude/references/sdlc-pipeline.md → master workflow
  .claude/references/update-protocol.md → this file
  _aegis-brain/counters.json          → ID counter (preserved)
```

If `_aegis-brain/counters.json` doesn't exist (first install), create:
```json
{
  "project_key": "PROJ",
  "counters": {"US":0,"J":0,"E":0,"T":0,"ST":0,"DOC":0,"ADR":0,"TD":0,"REL":0,"HO":0},
  "last_updated": "ISO-8601-NOW"
}
```

## Step 5: MIGRATE (version-specific)

### From v6.x → v8.2:
- DELETE: `.claude/references/review-checklist.md` (merged into quality-protocol.md)
- DELETE: `.claude/references/output-format.md` (merged into quality-protocol.md)
- DELETE: `.claude/references/progress-protocol.md` (merged into quality-protocol.md)
- DELETE: `.claude/references/handoff-protocol.md` (merged into pm-state-protocol.md)
- DELETE: `.claude/references/auto-learn-protocol.md` (merged into pm-state-protocol.md)
- DELETE: `.claude/references/shared-intelligence.md` (merged into pm-state-protocol.md)
- DELETE: `.claude/references/skill-evolution.md` (merged into pm-state-protocol.md)
- DELETE: `.claude/references/knowledge-pipeline.md` (merged into pm-state-protocol.md)
- DELETE: `.claude/references/performance-benchmark.md` (merged into quality-protocol.md)
- DELETE: `.claude/references/token-tracking.md` (merged into quality-protocol.md)
- CREATE: `.claude/agents/war-machine.md` (new in v7.0)
- CREATE: `.claude/agents/vision.md` (new in v7.0)
- CREATE: `.claude/agents/coulson.md` (new in v7.0)
- CREATE: `.claude/agents/thor.md` (new in v8.0)

### From v7.x → v8.2:
- DELETE: old reference files listed above (if still present)
- VERIFY: thor.md exists (new in v8.0)

### From v8.0/v8.1 → v8.2:
- DELETE: merged reference files (if still present)
- VERIFY: quality-protocol.md exists (new merge target)
- VERIFY: architecture specs moved to archive/

## POST-UPDATE CHECKLIST

After update, Nick Fury should:
1. ✅ Verify all 13 agent files exist
2. ✅ Verify all 23 command files exist
3. ✅ Verify counters.json preserved (not reset to 0)
4. ✅ Verify _aegis-brain/tasks/ preserved (user data intact)
5. ✅ Verify _aegis-output/iso-docs/ preserved (versioned docs intact)
6. ✅ Verify CLAUDE_lessons.md preserved (user patterns intact)
7. ✅ Log update to _aegis-brain/logs/activity.log
8. ✅ Display: "AEGIS updated to v8.2.1 — all user data preserved"

## VERSION HISTORY (for migration reference)

| Version | Agents | Skills | Commands | References | Key Change |
|---------|:------:|:------:|:--------:|:----------:|------------|
| v6.0.0  | 9      | 21     | 15       | 6          | Initial release |
| v7.0.0  | 12     | 27     | 20       | 6          | +Sprint/QA/ISO |
| v7.1.0  | 12     | 27     | 21       | 8          | +PM State (JIRA-like) |
| v8.0.0  | 13     | 28     | 22       | 15         | +Thor/SDLC/Handoff |
| v8.1.0  | 13     | 29     | 22       | 19         | +Self-evolving |
| v8.2.0  | 13     | 25     | 23       | 10         | Optimized (-50% context) |
| v8.2.1  | 13     | 25     | 23       | 11         | +Update protocol |
