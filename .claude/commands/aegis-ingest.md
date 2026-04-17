---
name: aegis-ingest
description: "Ingest a research source into the brain — extract takeaways, create/update wiki pages, update index"
triggers:
  en: ingest, absorb, learn from, compile knowledge
  th: ดูดซับ, เรียนรู้จาก, compile ความรู้
---

# /aegis-ingest

Ingest a research source into the AEGIS Brain. Extracts takeaways, creates or updates wiki pages, cross-references related content, and keeps the index current.

**Usage:** `/aegis-ingest <path-to-file>`

---

## Step 1: Read the source file

- Accept a single argument: the path to the file to ingest
- Supported formats: markdown, text, YAML, JSON
- Read the entire file before proceeding
- If the file does not exist or is unreadable, stop and report the error

---

## Step 2: Extract takeaways

Use Beast to extract 3–5 key takeaways from the source.

For each takeaway, classify it as one of:

- **Resonance update** — project-level knowledge that should persist as a standing truth
  - Action: update or create a page in `_aegis-brain/resonance/`
- **New instinct** — a pattern to learn and potentially enforce
  - Action: create a new YAML file in `_aegis-brain/instincts/pending/` using the instinct schema from `_aegis-brain/instincts/README.md`
- **Learning** — a one-time lesson, not yet a repeating pattern
  - Action: create a file in `_aegis-brain/learnings/`

---

## Step 3: Cross-reference

For each new or updated page:

1. Scan all existing brain pages for related topics, overlapping claims, or shared terminology
2. Add markdown links between related pages (both directions where appropriate)
3. If a new page contradicts an existing page (e.g., new page says "use X", existing says "avoid X"), flag it in the output — do NOT silently overwrite

---

## Step 4: Update index

1. Read `_aegis-brain/index.md`
2. Add new entries under the correct section (Resonance, Instincts/Pending, Learnings, etc.)
3. Update the `Last updated` timestamp to today's ISO date (YYYY-MM-DD)
4. Write the updated index back

---

## Step 5: Log

Append one line to `_aegis-brain/logs/activity.log`:

```
[ISO-8601] [INGEST] SOURCE=<filename> | PAGES_CREATED=N | PAGES_UPDATED=N | INSTINCTS=N
```

---

## Step 6: Report

Print a summary in this format:

```
Ingested: <source filename>
   Takeaways: N
   Pages created: [list]
   Pages updated: [list]
   Cross-references added: [list]
   Contradictions found: [list or "none"]
```
