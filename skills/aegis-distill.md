---
name: aegis-distill
description: "Knowledge distillation: compress learnings, promote patterns to resonance"
profile: full
triggers:
  en: ["distill", "compress learnings", "knowledge distillation", "promote patterns"]
  th: ["กลั่นกรองความรู้", "distill", "สรุปความรู้"]
---

## Quick Reference
Compresses accumulated learnings into reusable knowledge patterns.
- **Read**: Scan all files in `_aegis-brain/learnings/`
- **Group**: Cluster learnings by topic/domain
- **Compress**: Summarize each group into concise patterns
- **Promote**: Patterns with 3+ occurrences → `_aegis-brain/resonance/`
- **Output**: Updated resonance files, compressed learnings archive
- **Agent**: Iron Man (opus) — analysis and synthesis

## Full Instructions

### Invocation

```
/aegis-distill [scan|compress|promote|full]
```
- `scan` — Read and categorize learnings
- `compress` — Summarize grouped learnings
- `promote` — Move recurring patterns to resonance
- `full` — Complete pipeline (default)

### Phase 1: Scan Learnings

Read all files in `_aegis-brain/learnings/`:

```markdown
## Learnings Inventory
| File | Date | Topic | Key Insight | Occurrences |
|------|------|-------|-------------|-------------|
| <file> | <date> | <topic> | <summary> | <count> |
```

**Topic categories:**
- `architecture` — Design decisions, patterns, trade-offs
- `code-quality` — Standards, review findings, best practices
- `performance` — Optimization techniques, bottleneck patterns
- `security` — Vulnerability patterns, remediation approaches
- `process` — Workflow improvements, team coordination
- `tooling` — Tool configurations, integration patterns
- `debugging` — Common bug patterns, investigation techniques

### Phase 2: Group & Cluster

Group learnings by topic and identify recurring themes:

```markdown
## Grouped Learnings

### Architecture (N learnings)
- Theme: <recurring pattern>
  - Learning 1: <source file> — <summary>
  - Learning 2: <source file> — <summary>
  - Occurrences: <count>

### Code Quality (N learnings)
- Theme: <recurring pattern>
  ...
```

### Phase 3: Compress

For each group, generate a compressed summary:

```markdown
## Compressed Knowledge: <Topic>

### Pattern: <name>
**Frequency**: <N> occurrences across <N> sessions
**Context**: <when this pattern applies>
**Insight**: <the key learning in 2-3 sentences>
**Action**: <what to do when this pattern is encountered>
**Sources**: <list of original learning files>
```

**Compression rules:**
- Remove duplicates — keep the most complete version
- Merge similar insights — combine into single pattern
- Preserve actionable details — keep the "what to do"
- Drop session-specific context — generalize
- Target: reduce each group to ≤5 patterns

### Phase 4: Promote to Resonance

**Promotion criteria:**
- Pattern observed 3+ times across different sessions
- Pattern is actionable (not just observation)
- Pattern is generalizable (not project-specific, unless it IS a project convention)

**Promotion process:**
1. Identify patterns meeting promotion criteria
2. Format as resonance entry:
   ```markdown
   ### <Pattern Name>
   **Promoted**: YYYY-MM-DD
   **Frequency**: <N> occurrences
   **Rule**: <concise, actionable statement>
   **Rationale**: <why this matters>
   ```
3. Append to appropriate resonance file:
   - Architecture patterns → `_aegis-brain/resonance/architecture-decisions.md`
   - Code conventions → `_aegis-brain/resonance/team-conventions.md`
   - Project-specific → `_aegis-brain/resonance/project-identity.md`
4. Mark original learnings as "promoted" (do not delete)

### Phase 5: Archive

After compression and promotion:
1. Create archive: `_aegis-brain/learnings/archive/YYYY-MM-DD_distill.md`
2. Move compressed summaries to archive
3. Keep original learning files (append `# DISTILLED: YYYY-MM-DD` header)
4. Log the distillation event to `_aegis-brain/logs/activity.log`

### Distillation Report

```markdown
# Distillation Report
**Date**: YYYY-MM-DD
**Learnings Processed**: <N>
**Groups Identified**: <N>
**Patterns Compressed**: <N>
**Patterns Promoted**: <N>

## Promoted Patterns
| Pattern | Topic | Target File | Frequency |
|---------|-------|-------------|-----------|
| <name> | <topic> | <resonance file> | <count> |

## Compressed Archive
| Group | Before | After | Reduction |
|-------|--------|-------|-----------|
| <topic> | <N> learnings | <N> patterns | <pct>% |

## Recommendations
- <suggestion for future learning capture>
```

### Scheduling

Recommended: Run `/aegis-distill` after every 3-5 sessions or when learnings exceed 20 files.
