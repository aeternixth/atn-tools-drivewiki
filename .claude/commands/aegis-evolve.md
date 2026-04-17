---
name: aegis-evolve
description: "Cluster similar instincts, merge duplicates, auto-promote high-confidence patterns"
triggers:
  en: evolve, cluster instincts, merge lessons, promote patterns
  th: วิวัฒนาการ, รวม instinct, ปรับระดับความรู้
---

# /aegis-evolve

## Quick Reference
Meta-command that processes the instinct registry:
1. Cluster similar instincts by `cluster` field
2. Merge duplicates (combine observations, average confidence)
3. Auto-promote instincts crossing stage thresholds
4. Retire stale instincts (>90 days no reinforcement)

Run periodically (end of sprint or monthly) to keep the instinct system healthy.

## Full Instructions

### Step 1: Load all instincts
Read every `*.yaml` in `_aegis-brain/instincts/{pending,active,promoted}/`.

### Step 2: Cluster by `cluster` field
Group instincts sharing the same `cluster` value. For each cluster with 2+ instincts:

- **Different patterns**: leave separate (they're related but distinct)
- **Similar patterns** (>80% text overlap by simple similarity): merge

### Step 3: Merge duplicates
When merging two instincts A and B into A:
- `observations` = A.observations + B.observations
- `confidence` = max(A.confidence, B.confidence) + 0.1 (merging is reinforcement)
- `first_seen` = earlier of the two
- `last_reinforced` = today
- `pattern` = A.pattern (longer/more detailed wins, or concatenate if both unique)
- `rationale` = concatenated
- Delete B's file

### Step 4: Apply stage thresholds
For every instinct:
```
if confidence >= 0.8 and observations >= 3: move to promoted/
elif confidence >= 0.5 and observations >= 2: move to active/
elif confidence <  0.5: stay in pending/
```

### Step 5: Retire stale
For every instinct with `last_reinforced` > 90 days ago:
- Move to `retired/`
- Log reason to activity.log

### Step 6: Report
Display summary:
```
┌─ /aegis-evolve ──────────────────────────────────────┐
│ Before:  pending=12  active=8   promoted=3  retired=1│
│ After:   pending=7   active=11  promoted=5  retired=3│
│                                                      │
│ Clusters processed: 4                                │
│ Instincts merged:   3                                │
│ Auto-promoted:      2 (session-storage, auth-tokens) │
│ Retired stale:      2                                │
└──────────────────────────────────────────────────────┘
```

## Implementation Notes

- Use Python for YAML parsing (pyyaml) — bash alone is too fragile
- Always back up `_aegis-brain/instincts/` before running (cp to `_aegis-output/backups/`)
- Dry-run mode: `/aegis-evolve --dry-run` prints changes without applying

## When to Run

| Trigger | Reason |
|---------|--------|
| End of sprint | Process lessons from the sprint into evolved instincts |
| Monthly | Retire stale, promote mature patterns |
| After `/aegis-instinct import` | Integrate imported patterns with existing ones |
| Before `/aegis-retro` | So the retro can reference the latest instinct state |

## Related
- [aegis-instinct](aegis-instinct.md) — manual instinct management
- [aegis-retro](aegis-retro.md) — lesson extraction pipeline that feeds instincts
- [_aegis-brain/instincts/README.md](../../_aegis-brain/instincts/README.md) — schema reference
