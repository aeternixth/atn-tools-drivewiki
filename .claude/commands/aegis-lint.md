---
name: aegis-lint
description: "Brain health check — find contradictions, stale claims, orphan pages, missing cross-refs"
triggers:
  en: lint brain, health check brain, brain lint, check brain
  th: ตรวจสอบ brain, เช็ค brain, lint brain
---

# /aegis-lint

Run a full health check on the AEGIS Brain. Detects contradictions, stale claims, orphan pages, and missing cross-references. Optionally auto-fixes safe issues.

**Usage:**
- `/aegis-lint` — report only
- `/aegis-lint --fix` — report + auto-fix safe issues

---

## Step 1: Load index

1. Read `_aegis-brain/index.md`
2. If the index is missing, rebuild it first by scanning all `_aegis-brain/` directories and generating the index (same logic as the index rebuild procedure)
3. Parse all linked file paths from the index as the known-good set

---

## Step 2: Contradiction scan

1. Read all pages in `_aegis-brain/resonance/` and all instincts in `_aegis-brain/instincts/active/` and `_aegis-brain/instincts/promoted/`
2. Compare claims across pages — look for direct opposites (e.g., "always use X" vs. "avoid X", "DO: Y" vs. "DON'T: Y")
3. Report each contradiction in this format:

```
Contradiction: <pageA> says X, <pageB> says Y -> Suggest: <resolution>
```

---

## Step 3: Stale detection

Apply these rules:

- **Instincts:** check the `last_reinforced` field. Flag if more than 90 days have passed since today.
- **Learnings:** check the file's last modification date. Flag if more than 90 days old with no incoming cross-reference link from an active or promoted instinct.
- **Resonance pages:** check whether the technologies, tools, or services mentioned in the page still appear anywhere in the project codebase or config files.

Report format:

```
Stale: <file> (last touched N days ago) -> Suggest: retire/update/verify
```

---

## Step 4: Orphan detection

1. Glob all files under `_aegis-brain/` (exclude `logs/`, `index.md` itself, and `tasks/`)
2. For each file, check whether it appears as a link in `_aegis-brain/index.md`
3. Files absent from the index are orphans

Report format:

```
Orphan: <file> — not in index.md -> Suggest: add to index or delete
```

---

## Step 5: Missing cross-reference detection

1. Scan all brain pages (resonance, instincts, learnings) for:
   - Task ID mentions (pattern: `PROJ-[A-Z]+-\d+`)
   - File path mentions (pattern: paths containing `/` or starting with `_aegis-brain/`)
   - Other brain page names mentioned by filename (e.g., `anti-patterns.md`)
2. Check whether each mention is an actual markdown link `[text](url)` or a bare reference
3. Bare references = missing cross-refs

Report format:

```
Missing ref: <file> mentions "<target>" but doesn't link to it
```

---

## Step 6: Report

Print the full lint report in this format:

```
Brain Lint Report — YYYY-MM-DD
--------------------------------

Contradictions: N
  (list each)

Stale claims: N
  (list each)

Orphan pages: N
  (list each)

Missing cross-references: N
  (list each)

Health score: X/10
  10 = pristine, 7-9 = healthy, 4-6 = needs attention, 0-3 = brain rot
```

Health score calculation:
- Start at 10
- Subtract 2 per contradiction
- Subtract 1 per stale file
- Subtract 1 per orphan page
- Subtract 0.5 per missing cross-reference (round down)
- Minimum score is 0

---

## Step 7: Auto-fix (only when --fix flag is present)

When the user runs `/aegis-lint --fix`, perform these safe fixes automatically:

- **Orphans:** add each orphan file to the appropriate section in `_aegis-brain/index.md`
- **Stale instincts:** move files from `active/` or `pending/` to `_aegis-brain/instincts/retired/` and update their `status` field to `retired`
- **Missing cross-refs:** insert markdown links for bare references where the target file path is unambiguous

DO NOT auto-resolve contradictions. Contradictions require human judgment and must be flagged for review only.

After auto-fix, re-run Steps 2–6 and print an updated report showing the new health score.
