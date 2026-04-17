---
name: aegis-retro
description: "Session retrospective — gather work, write diary, extract lessons learned"
triggers:
  en: retrospective, retro, session end, wrap up
  th: ย้อนมอง, retrospective, จบ session
---

# /aegis-retro

## Quick Reference
End-of-session retrospective inspired by Oracle's rrr pattern. Gathers git activity,
writes a session summary, composes an honest AI diary (150+ words first-person reflection),
documents friction points (3+ minimum), extracts lessons learned to _aegis-brain/learnings/,
saves full retro to _aegis-brain/retrospectives/, and updates activity.log.
IMPORTANT: Only the main agent (Captain America/Opus) writes this — never a subagent.

## Full Instructions

### Prerequisites
- This command should ONLY be executed by the main orchestrator agent (Captain America/Opus).
- If a subagent is asked to run this, it should refuse and defer to the main agent.

### Step 1: Gather Session Activity
- Run `git log --oneline` from the session start time (check activity.log for SESSION_START).
- If no git history, note: "No git commits this session."
- Run `git diff --stat` to get a summary of changes.
- Collect: number of commits, files changed, insertions, deletions.
- Also review activity.log entries from this session.

### Step 2: Write Session Summary
- Summarize what was accomplished in this session.
- Format as a bulleted list of completed items.
- Note any items that were started but not finished.
- Be specific — include file names, feature names, bug descriptions.
- Example:
  ```
  ## Session Summary
  - Implemented user authentication module (src/auth/)
  - Fixed pagination bug in /api/users endpoint
  - Started but did not finish: rate limiting middleware
  ```

### Step 3: Write AI Diary (150+ words)
- Write a first-person reflection from the AI's perspective.
- **Must be honest, not performative.** Do not write what sounds good — write what is true.
- Topics to cover:
  - What was challenging about this session?
  - What surprised you?
  - Where did you feel uncertain or confused?
  - What would you do differently?
  - What did you learn about this codebase/project?
- Minimum 150 words. Quality matters more than length.
- This is private reflection — be candid.

### Step 4: Write Honest Feedback (3+ friction points)
- Document at least 3 friction points from this session.
- Friction = anything that was hard, broke, was slow, or caused frustration.
- Be specific and actionable. Examples:
  ```
  ## Friction Points
  1. **Context overflow**: Had to /compact twice because pipeline loaded too many files.
     → Suggestion: Lazy-load agent prompts instead of pre-loading all.
  2. **Test runner not configured**: Spent 10 minutes figuring out how to run tests.
     → Suggestion: Add test runner config to project resonance.
  3. **Ambiguous spec**: Feature requirements were unclear on edge cases.
     → Suggestion: Add acceptance criteria template to spec flow.
  ```
- Do not pad with fake friction points. If there were more than 3, list them all.

### Step 5: Extract Lessons Learned
- From the session's work, identify reusable lessons.
- Each lesson should be:
  - Specific enough to be actionable
  - General enough to apply to future sessions
- Save each lesson to `_aegis-brain/learnings/YYYY-MM-DD_slug.md` with format:
  ```markdown
  ---
  date: YYYY-MM-DD
  category: [architecture|testing|workflow|debugging|tooling|other]
  confidence: [high|medium|low]
  ---
  # [Lesson Title]
  
  ## Context
  [What happened that led to this learning]
  
  ## Lesson
  [The actual takeaway]
  
  ## Application
  [When/how to apply this in the future]
  ```

### Step 6: Save Full Retrospective
- Save the complete retro to `_aegis-brain/retrospectives/YYYY-MM/DD/HH.MM_slug.md`
- Create directories as needed.
- Full retro includes all sections: summary, diary, friction, lessons.
- Format:
  ```markdown
  ---
  date: YYYY-MM-DD HH:MM
  session_duration: [estimated]
  commits: [count]
  files_changed: [count]
  ---
  # Session Retrospective — [date]
  
  ## Summary
  [from step 2]
  
  ## AI Diary
  [from step 3]
  
  ## Friction Points
  [from step 4]
  
  ## Lessons Extracted
  [list with links to individual lesson files]
  ```

### Step 7: Update Activity Log
- Append to `_aegis-brain/logs/activity.log`:
  ```
  [YYYY-MM-DD HH:MM] SESSION_END | commits=[N] | files_changed=[N] | lessons=[N] | friction_points=[N]
  ```

### Step 8: Show Summary to User
- Display a condensed version:
  ```
  ┌─ Session Retrospective ─────────────────────┐
  │ Commits: [N]  Files changed: [N]            │
  │ Lessons extracted: [N]                       │
  │ Friction points: [N]                         │
  │                                              │
  │ Key accomplishments:                         │
  │ • [item 1]                                   │
  │ • [item 2]                                   │
  │                                              │
  │ Top friction: [biggest pain point]           │
  │ Saved to: _aegis-brain/retrospectives/...    │
  └──────────────────────────────────────────────┘
  ```
- Ask if user wants to run /aegis-handoff for next session.

### Step 9: Stop Dashboard (clean session end)
Retro = session over. If a dashboard is running on port 4321 from this session,
shut it down so the next `/aegis-start` starts clean and no orphan process leaks.

```bash
PIDS=$(lsof -ti:4321 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  kill $PIDS 2>/dev/null && sleep 1
  STILL=$(lsof -ti:4321 2>/dev/null || true)
  if [ -n "$STILL" ]; then
    kill -9 $STILL 2>/dev/null
  fi
  echo "🛑 Dashboard stopped (port 4321 freed)"
fi
```

**Note**: `/aegis-handoff` does NOT do this — handoff is a pause, retro is the end.
If you want the dashboard to stay alive across sessions, use `/aegis-handoff` instead of `/aegis-retro`.
