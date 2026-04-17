# Context Editing Protocol — Mid-Session Cleanup

> How to use Claude's context editing capability to clear stale tool results and extend effective session length.

---

## What Is Context Editing

Claude 4.x supports the `clear_tool_uses_20250919` capability, which allows clearing stale tool call results from the conversation context mid-session. This frees up context budget without losing semantic memory of what was done.

## When to Apply

Apply context editing when:
- A large file was read but is no longer actively needed
- A batch of scan results (Beast) has been summarized and the raw output is no longer referenced
- A completed review (Black Panther) has been noted and the full diff is no longer needed
- Context budget exceeds 40% (caution zone per context-rules.md)

## Protocol

### Step 1 — Identify Candidates
Before each significant new task, scan for tool results that:
1. Were used more than 2 agent turns ago
2. Have been summarized in the conversation
3. Are no longer referenced by the current task

### Step 2 — Summarize Before Clearing
Write a 1-2 sentence summary of the cleared content to `_aegis-brain/logs/activity.log`:
```
[YYYY-MM-DD HH:MM] CONTEXT_CLEAR | cleared=[tool_id] | summary=[1-sentence summary]
```

### Step 3 — Request Clear
Nick Fury (or Captain America) invokes context editing to clear the identified tool results.

## Context Budget Impact

| Agent Activity | Context Impact | Clear After? |
|----------------|----------------|--------------|
| Beast full-repo scan (100 files) | ~15k tokens | Yes — after findings summarized |
| Black Panther review (large PR) | ~8k tokens | Yes — after verdict logged |
| Iron Man architecture spec read | ~5k tokens | Yes — after ADR created |
| Vision test run output | ~3k tokens | Yes — after War Machine verdict |
| Coulson document generation | ~2k tokens | No — documents are final output |
| Nick Fury scan protocol | ~2k tokens | No — needed for decision loop |

## Nick Fury Context Check Loop

Nick Fury checks context at each scan iteration:
```
If context > 40%:
  → Identify completed tool results older than 2 turns
  → Summarize to activity.log
  → Clear stale results
  → Log: "[HH:MM] CONTEXT_EDIT | freed ~Nk tokens | now at X%"

If context > 60%:
  → Emergency compact — Captain America notified
  → All non-critical tool results cleared
  → Only active task state preserved
```

## Integration with Server-Side Compaction

Server-side compaction (`compact-2026-01-12`) operates at the session level. Context editing operates at the tool-result level within a session. Use both:
- Context editing: frequent, lightweight, mid-task cleanup
- Server-side compaction: end-of-sprint, full session state reset
