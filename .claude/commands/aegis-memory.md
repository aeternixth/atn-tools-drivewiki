---
name: aegis-memory
description: "Memory management — status, recall, save, forget across memory tiers"
triggers:
  en: memory, recall, remember, what do you remember, save memory
  th: ความจำ, จำอะไรได้บ้าง, บันทึกความจำ
---

# /aegis-memory

## Quick Reference
Memory management inspired by Letta/MemGPT patterns. Subcommands: `status` (show loaded
vs available memory), `recall <topic>` (search _aegis-brain/ for relevant context),
`save` (extract and persist current session learnings), `forget <id>` (archive a memory).
Three tiers: core (always loaded from resonance/), archival (searchable in learnings/),
working (current session state). Manages what the AI "remembers" across sessions.

## Full Instructions

### Subcommand: `/aegis-memory status`

Show the current state of all memory tiers:
```
╔══════════════════════════════════════════════════════════╗
║  AEGIS Memory Status                                    ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  CORE MEMORY (always loaded)                             ║
║  ├─ Project identity      [loaded ✅]                    ║
║  ├─ Architecture decisions [N entries]                   ║
║  ├─ Team principles        [loaded ✅]                   ║
║  └─ Total: ~[N] tokens                                  ║
║                                                          ║
║  ARCHIVAL MEMORY (searchable)                            ║
║  ├─ Learnings:       [N] files                           ║
║  ├─ Retrospectives:  [N] files                           ║
║  ├─ Handoffs:        [N] files                           ║
║  └─ Total: ~[N] tokens (not loaded, search to access)   ║
║                                                          ║
║  WORKING MEMORY (current session)                        ║
║  ├─ Conversation turns:  [N]                             ║
║  ├─ Files in context:    [N]                             ║
║  ├─ Active agents:       [N]                             ║
║  └─ Total: ~[N]% of context budget                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

- **Core memory** = `_aegis-brain/resonance/` — loaded at session start, always available.
- **Archival memory** = `_aegis-brain/learnings/`, `_aegis-brain/retrospectives/`, `_aegis-brain/handoffs/` — not loaded by default, but searchable.
- **Working memory** = current conversation context, loaded files, active state.

### Subcommand: `/aegis-memory recall <topic>`

Search across all memory tiers for relevant information:

1. **Search core memory first** (resonance/):
   - Grep for the topic keyword in all resonance files.
   - Return matching sections.

2. **Search archival memory** (learnings/, retrospectives/, handoffs/):
   - Search file names for topic-related slugs.
   - Grep file contents for the topic keyword.
   - Rank results by relevance (filename match > content match).

3. **Display results**:
   ```
   Memory recall: "[topic]"
   
   CORE (always loaded):
   • architecture-decisions.md: "Prefer composition over inheritance..."
   
   ARCHIVAL (loaded on demand):
   • learnings/2026-03-15_auth-patterns.md: "JWT refresh token rotation..."
   • retrospectives/2026-03/14/session.md: "Auth module was challenging..."
   
   Found [N] relevant memories. Load details? [y/n]
   ```

4. If user confirms, load the most relevant files into working memory.
5. Warn if loading would push context budget over 70%.

### Subcommand: `/aegis-memory save`

Extract learnings from the current session and persist them:

1. **Analyze current conversation** for learnable moments:
   - Bugs that were debugged (root cause + fix)
   - Architecture decisions made
   - Patterns discovered in the codebase
   - Workflow improvements identified
   - Tools/techniques that worked well

2. **For each learning, create a file** in `_aegis-brain/learnings/`:
   ```markdown
   ---
   date: YYYY-MM-DD
   category: [category]
   confidence: [high|medium|low]
   source: session-memory-save
   ---
   # [Learning Title]
   
   ## Context
   [What happened]
   
   ## Lesson
   [The takeaway]
   
   ## Application
   [When to apply this]
   ```

3. **Report what was saved**:
   ```
   Saved [N] memories:
   1. learnings/2026-03-20_auth-token-rotation.md
   2. learnings/2026-03-20_vitest-config-pattern.md
   
   These will be available via /aegis-memory recall in future sessions.
   ```

### Subcommand: `/aegis-memory forget <id>`

Archive a specific memory (move from active to deep archive):

1. **Identify the memory** by filename or partial match:
   - Search `_aegis-brain/learnings/` for the ID.
   - If multiple matches, show options and ask user to clarify.

2. **Archive, don't delete**:
   - Move the file to `_aegis-brain/archive/learnings/`.
   - Add a note to the file: `archived: YYYY-MM-DD, reason: user request`.
   - Git preserves the history — nothing is truly lost.

3. **Report**:
   ```
   Archived: learnings/2026-03-10_old-pattern.md
   → Moved to: archive/learnings/2026-03-10_old-pattern.md
   
   This memory won't appear in recall results but is preserved in git history.
   ```

### Memory Maintenance Tips
- Display when running `/aegis-memory status`:
  ```
  Tips:
  • Run /aegis-distill when you have 10+ learnings to promote patterns
  • Core memory should stay small — only proven patterns belong here
  • Use /aegis-memory recall before starting related work
  • Archival memory is unlimited — save generously, distill periodically
  ```
