---
name: aegis-instinct
description: "Manage instincts — confidence-scored learned patterns with pending → active → promoted lifecycle"
triggers:
  en: instinct, instincts, learned pattern, list instincts, reinforce
  th: สัญชาตญาณ, รูปแบบที่เรียนรู้, instinct
---

# /aegis-instinct

## Quick Reference
Manage the AEGIS instinct system — confidence-scored learned patterns that upgrade
the freeform `_aegis-brain/learnings/` lessons into a self-enforcing immune system.

Instincts live in `_aegis-brain/instincts/<stage>/<id>.yaml` with 4 stages:
`pending` → `active` → `promoted` → `retired`.

## Subcommands

### `/aegis-instinct status`
List all instincts grouped by stage with confidence bars.

Implementation:
```bash
for stage in promoted active pending retired; do
  DIR="_aegis-brain/instincts/$stage"
  [[ ! -d "$DIR" ]] && continue
  COUNT=$(ls "$DIR"/*.yaml 2>/dev/null | wc -l | tr -d ' ')
  echo "━━ $stage ($COUNT) ━━━━━━━━━━━━━━━━━━━"
  for f in "$DIR"/*.yaml; do
    [[ ! -f "$f" ]] && continue
    ID=$(grep '^id:' "$f" | awk '{print $2}')
    CONF=$(grep '^confidence:' "$f" | awk '{print $2}')
    OBS=$(grep '^observations:' "$f" | awk '{print $2}')
    CLUSTER=$(grep '^cluster:' "$f" | awk '{print $2}')
    # Build confidence bar (10-char)
    BAR_LEN=$(python3 -c "print(int(float('$CONF') * 10))")
    BAR=$(printf '█%.0s' $(seq 1 $BAR_LEN))
    PAD=$(printf '░%.0s' $(seq 1 $((10 - BAR_LEN))))
    printf "  %-35s %s%s  %s  obs=%s  [%s]\n" "$ID" "$BAR" "$PAD" "$CONF" "$OBS" "$CLUSTER"
  done
  echo ""
done
```

### `/aegis-instinct reinforce <id>`
Increase confidence by +0.15, update `last_reinforced`, auto-promote if it crosses a stage threshold.

Rules:
- `pending` → `active` when confidence ≥ 0.5 AND observations ≥ 2
- `active` → `promoted` when confidence ≥ 0.8
- Moves the file between stage directories when promoted
- Updates the YAML fields in place
- Logs the reinforcement to `_aegis-brain/logs/activity.log`

### `/aegis-instinct retire <id>`
Move instinct to `retired/` stage. Use when a pattern becomes obsolete
(framework migration, architecture change, etc.). Retired instincts are
not loaded by Loki or Iron Man.

### `/aegis-instinct export [--output instincts.tar.gz]`
Tar all `active/` + `promoted/` instincts for sharing to another AEGIS project.
Default output: `_aegis-output/exports/instincts-YYYY-MM-DD.tar.gz`

### `/aegis-instinct import <tarball>`
Extract instincts from a tarball. New instincts are placed in `pending/` regardless
of their original stage (let this project re-validate them).

## Loki Integration

Before every adversarial review, Loki loads:
1. All files in `_aegis-brain/instincts/active/` → warnings
2. All files in `_aegis-brain/instincts/promoted/` → hard rules (auto-REJECT on violation)

## Related
- [aegis-evolve](aegis-evolve.md) — cluster similar instincts + merge duplicates
- [aegis-retro](aegis-retro.md) — lesson extraction that can promote to instincts
- [_aegis-brain/instincts/README.md](../../_aegis-brain/instincts/README.md) — schema reference
