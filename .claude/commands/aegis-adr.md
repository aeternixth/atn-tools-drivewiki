---
name: aegis-adr
description: "Architecture Decision Records -- create, list, review, accept, deprecate, search ADRs as first-class citizens."
triggers:
  en: ADR, architecture decision, "why did we", decision record
  th: การตัดสินใจ, สถาปัตยกรรม, ทำไมเลือก
---

# /aegis-adr

## Quick Reference

Manage Architecture Decision Records. Every significant technical decision gets recorded,
debated, and made searchable so the team never asks "why did we choose X?" again.

| Subcommand | Purpose |
|-----------|---------|
| `/aegis-adr new "title"` | Create new ADR (Iron Man analyzes options, Loki challenges) |
| `/aegis-adr list` | Show all ADRs with status |
| `/aegis-adr review ADR-NNN` | Review an ADR (Loki challenges, Iron Man defends) |
| `/aegis-adr accept ADR-NNN` | Mark as ACCEPTED |
| `/aegis-adr deprecate ADR-NNN "reason"` | Mark as DEPRECATED with reason |
| `/aegis-adr search "keyword"` | Search ADRs by keyword |

- **ADR storage**: `_aegis-brain/adrs/ADR-NNN-{slug}.md`
- **Counter**: `ADR` in `_aegis-brain/counters.json`
- **Protocol reference**: `.claude/references/adr-protocol.md`

---

## Full Instructions

### Routing

Parse the subcommand from user input. If no subcommand, show the quick reference table
and ask which action to run.

```
/aegis-adr new "title"           -> go to "New ADR"
/aegis-adr list                  -> go to "List ADRs"
/aegis-adr review ADR-NNN        -> go to "Review ADR"
/aegis-adr accept ADR-NNN        -> go to "Accept ADR"
/aegis-adr deprecate ADR-NNN     -> go to "Deprecate ADR"
/aegis-adr search "keyword"      -> go to "Search ADRs"
```

---

### Subcommand: New ADR

**When**: `/aegis-adr new "Use PostgreSQL for primary datastore"`

#### Step 1: Increment Counter
- Read `_aegis-brain/counters.json`.
- Increment the `ADR` counter.
- Write updated `counters.json` with current timestamp.
- Derive ID: `ADR-NNN` (zero-padded to 3 digits).

#### Step 2: Generate Slug
- Convert title to lowercase kebab-case slug.
- Example: "Use PostgreSQL for primary datastore" -> `use-postgresql-for-primary-datastore`

#### Step 3: Iron Man Analyzes Options
Spawn Iron Man (sub-agent) to:
1. Read all existing ADRs in `_aegis-brain/adrs/` to check for contradictions.
2. Identify at least 3 options for the decision.
3. For each option, list pros, cons, and risk level (LOW/MEDIUM/HIGH).
4. Recommend one option with rationale.

#### Step 4: Loki Challenges (optional, for HIGH-risk decisions)
If any option has risk=HIGH, spawn Loki to:
1. Challenge assumptions in Iron Man's analysis.
2. Identify hidden risks or overlooked options.
3. Add findings to the ADR's "Options Considered" table.

#### Step 5: Write ADR File
- Create directory `_aegis-brain/adrs/` if it does not exist.
- Write `_aegis-brain/adrs/ADR-NNN-{slug}.md` using the format from `adr-protocol.md`.
- Set status to `PROPOSED`.
- Set date to today.
- Set deciders to agents who participated (iron-man, loki if involved).

#### Step 6: Log
Append to `_aegis-brain/logs/activity.log`:
```
[YYYY-MM-DD HH:MM] ADR_CREATED | id=ADR-NNN | title={title} | status=PROPOSED
```

#### Step 7: Display Summary
```
ADR-NNN Created: {title}

  Status:     PROPOSED
  Options:    {count} considered
  Recommend:  {recommended option}
  Risk:       {overall risk level}

  File: _aegis-brain/adrs/ADR-NNN-{slug}.md
  Next: /aegis-adr review ADR-NNN (to debate)
        /aegis-adr accept ADR-NNN (to finalize)
```

---

### Subcommand: List ADRs

**When**: `/aegis-adr list`

1. Read all files in `_aegis-brain/adrs/` matching `ADR-*.md`.
2. Parse frontmatter (id, title, status, date) from each file.
3. Display table sorted by ID:

```
Architecture Decision Records

| ID      | Status     | Date       | Title                                    |
|---------|------------|------------|------------------------------------------|
| ADR-001 | ACCEPTED   | 2026-03-20 | Use PostgreSQL for primary datastore     |
| ADR-002 | PROPOSED   | 2026-03-25 | REST vs GraphQL for public API           |
| ADR-003 | DEPRECATED | 2026-03-27 | Monolith architecture (superseded by 004)|

Total: 3 ADRs | ACCEPTED: 1 | PROPOSED: 1 | DEPRECATED: 1
```

No files are written -- this is read-only.

---

### Subcommand: Review ADR

**When**: `/aegis-adr review ADR-001`

1. Read `_aegis-brain/adrs/ADR-NNN-*.md` (find file by ID prefix).
2. If not found, error: `ADR-NNN not found in _aegis-brain/adrs/`.
3. Display the full ADR content.
4. Spawn Loki to challenge the decision:
   - Question each "Pro" -- is it really a benefit?
   - Stress-test each "Con" -- is it worse than stated?
   - Propose scenarios where the decision fails.
5. Spawn Iron Man to defend the decision against Loki's challenges.
6. Append debate outcome to the ADR file under a new `## Review` section:
   ```markdown
   ## Review (YYYY-MM-DD)
   ### Challenges (Loki)
   - {challenge 1}
   - {challenge 2}

   ### Defense (Iron Man)
   - {response 1}
   - {response 2}

   ### Verdict
   {STRENGTHEN / RECONSIDER / SUPERSEDE}
   ```
7. Log to activity.log:
   ```
   [YYYY-MM-DD HH:MM] ADR_REVIEWED | id=ADR-NNN | verdict={verdict}
   ```

---

### Subcommand: Accept ADR

**When**: `/aegis-adr accept ADR-001`

1. Read the ADR file by ID prefix.
2. If status is already ACCEPTED, report: `ADR-NNN is already ACCEPTED.`
3. Update the frontmatter: `status: ACCEPTED`.
4. Log to activity.log:
   ```
   [YYYY-MM-DD HH:MM] ADR_ACCEPTED | id=ADR-NNN | title={title}
   ```
5. Display: `ADR-NNN accepted: {title}`

---

### Subcommand: Deprecate ADR

**When**: `/aegis-adr deprecate ADR-001 "Superseded by microservice architecture"`

1. Read the ADR file by ID prefix.
2. Update frontmatter: `status: DEPRECATED`.
3. If a reason is provided, append to the ADR:
   ```markdown
   ## Deprecation (YYYY-MM-DD)
   Reason: {reason}
   Superseded by: ADR-NNN (if applicable)
   ```
4. If superseded_by is specified, update the new ADR's frontmatter to add `supersedes: ADR-NNN`.
5. Log to activity.log:
   ```
   [YYYY-MM-DD HH:MM] ADR_DEPRECATED | id=ADR-NNN | reason={reason}
   ```
6. Display: `ADR-NNN deprecated: {reason}`

---

### Subcommand: Search ADRs

**When**: `/aegis-adr search "database"`

1. Read all files in `_aegis-brain/adrs/`.
2. Search file contents (title, context, decision, options) for the keyword.
3. Display matching ADRs with the matching context snippet:

```
Search: "database" -- 2 results

ADR-001 [ACCEPTED] Use PostgreSQL for primary datastore
  "...chose PostgreSQL as the primary database for its..."

ADR-005 [PROPOSED] Database migration strategy
  "...evaluate database migration tools for the..."
```

No files are written -- this is read-only.

---

### Error Handling

- **No ADRs directory**: Create `_aegis-brain/adrs/` automatically on first `new`.
- **ADR not found**: Report `ADR-NNN not found. Run /aegis-adr list to see all ADRs.`
- **Duplicate title**: Warn but allow (different decisions can have similar titles).
- **Missing counters.json**: Create with `ADR: 0` and then increment.
