# AEGIS v8.2.1 -- Lessons Learned

> This file is a living document. Updated via /aegis-retro at the end of each session.
> New entries are appended at the top of each section.
> Last updated: 2026-03-30 (v8.2.1 upgrade audit)

---

## Patterns (Things That Work)

### P001: Progressive Disclosure Saves 90% Context
- **Discovery**: Framework design phase
- **Pattern**: Load only CLAUDE.md at session start (~500 tokens). Load CLAUDE_safety.md only before git/file thor. Load CLAUDE_agents.md only before spawning. Load CLAUDE_skills.md only when choosing skills.
- **Impact**: Starting context drops from ~15K tokens to ~1.5K tokens. Leaves 90%+ of context window for actual work.
- **Rule**: Never preload all CLAUDE_*.md files. Use the navigation table in CLAUDE.md to decide what to load.

### P002: Haiku Gathers, Opus Synthesizes
- **Discovery**: Multi-agent pipeline testing
- **Pattern**: Use haiku-tier agents (Beast, Songbird) for parallel data collection -- they are cheap, fast, and can run 5+ instances simultaneously. Then route collected data to opus-tier agents (Captain America, Iron Man) for synthesis and decision-making.
- **Impact**: 80% cost reduction vs. using opus for everything. Faster pipeline execution due to parallel haiku scans.
- **Rule**: Never ask haiku to make decisions. Never ask opus to do bulk scanning.

### P003: Review Gates Catch 80% of Issues
- **Discovery**: Pipeline quality analysis
- **Pattern**: Insert a Black Panther review step between every major pipeline phase: after spec (Iron Man) -> review -> after implementation (Spider-Man) -> review -> after content (Songbird) -> review. Each gate has explicit acceptance criteria.
- **Impact**: Issues caught early are 10x cheaper to fix. Review gates reduce rework cycles from 3-4 to 1-2.
- **Rule**: Never skip the review gate, even under time pressure. A 2-minute review saves 20 minutes of rework.

### P004: Structured Messages Prevent Miscommunication
- **Discovery**: Agent coordination failures
- **Pattern**: All agent-to-agent communication uses typed message formats (TaskAssignment, StatusUpdate, FindingReport, etc.). No free-form "just tell them" messages.
- **Impact**: Eliminates ambiguity in task handoffs. Agents always know what is expected in response.
- **Rule**: If you find yourself writing a free-form message to another agent, stop and use a structured message type.

### P005: Brain Resonance Files Bootstrap Context
- **Discovery**: Session continuity testing
- **Pattern**: At session end, write key decisions and state to `_aegis-brain/resonance/`. At next session start, load these files to restore context without replaying the full conversation.
- **Impact**: New sessions reach productive state in <30 seconds instead of 5+ minutes of re-reading.
- **Rule**: Always run /aegis-retro before ending a session. The resonance files it produces are critical for continuity.

### P006: Blast Radius Prevents Cascade Failures
- **Discovery**: Multi-agent conflict resolution
- **Pattern**: Each agent has explicitly defined directories they can read/write. If Spider-Man accidentally modifies a docs file, Black Panther catches it in review. If Beast tries to write code, the system blocks it.
- **Impact**: Eliminates merge conflicts between agents. Prevents accidental overwrites. Makes agent behavior predictable.
- **Rule**: Trust the blast radius table in CLAUDE_agents.md. Violations are always bugs, never features.

---

## Anti-Patterns (Things to Avoid)

### A001: Loading All Skills at Once
- **Symptom**: Session starts slow, context window fills with unused skill definitions
- **Cost**: ~10K tokens wasted on skills that may never be used in the session
- **Root Cause**: Eagerness to be "fully prepared" -- but most sessions use 2-3 skills max
- **Fix**: Use progressive disclosure. Load skills only when trigger words are detected or user explicitly requests them.
- **Prevention**: /aegis-start loads only CLAUDE.md. Skills load on-demand via trigger matching.

### A002: Letting Subagents Write Final Synthesis
- **Symptom**: Final output is inconsistent in quality, voice, and reasoning depth
- **Cost**: Rework to rewrite synthesis, inconsistent project documentation
- **Root Cause**: Delegating the "hard thinking" to save opus tokens -- but synthesis IS the hard thinking
- **Fix**: Subagents (Spider-Man, Beast, Songbird) provide structured data. Captain America (opus) always writes the final synthesis.
- **Prevention**: Only Captain America writes to CLAUDE_lessons.md, retrospectives, and final reports.

### A003: Skipping /aegis-retro
- **Symptom**: Next session starts from scratch, repeats mistakes, loses context
- **Cost**: 15-30 minutes of re-discovery per session. Lessons never compound.
- **Root Cause**: "I'll remember" -- but you won't. Context dies with the session.
- **Fix**: Make /aegis-retro a non-negotiable ritual. It takes 2 minutes and saves 20+ minutes next time.
- **Prevention**: Captain America prompts for retro when session appears to be ending. Golden Rule #6.

### A004: git commit --amend in Multi-Agent Workflows
- **Symptom**: Agent B's reference to commit hash X becomes invalid because Agent A amended it
- **Cost**: Pipeline breaks, agents produce work based on stale references, merge conflicts
- **Root Cause**: Habit from single-developer workflow -- amend is fine solo, fatal in teams
- **Fix**: Always create new commits. Never amend. This is Golden Rule #3.
- **Prevention**: Block --amend in agent tool permissions. Log violation as S2 incident.

### A005: Using cd Instead of git -C
- **Symptom**: Working directory drift causes agents to operate in wrong location
- **Cost**: Files written to wrong directory, git commands against wrong repo
- **Root Cause**: Habit of `cd project && git status` instead of `git -C /abs/path status`
- **Fix**: Always use absolute paths. Use `git -C <path>` for all git operations.
- **Prevention**: Lint agent shell commands for `cd` usage, suggest `git -C` alternative.

### A006: Free-Form Agent Communication
- **Symptom**: Agents misunderstand tasks, produce wrong outputs, need multiple retries
- **Cost**: 2-3x more turns per task, wasted tokens, frustrated humans
- **Root Cause**: Treating agent communication like human conversation instead of structured protocol
- **Fix**: Use typed message formats from CLAUDE_agents.md. Every message has a type, sender, recipient, and structured content.
- **Prevention**: Message type validation in orchestrator. Reject free-form messages.

### A007: Context Budget Ignorance
- **Symptom**: Session hits context limit mid-task, loses work, produces degraded output
- **Cost**: Lost work, incomplete features, emergency recovery needed
- **Root Cause**: Not monitoring token usage, loading too much context too early
- **Fix**: Monitor context at each phase. Trigger distillation at 60%. Emergency mode at 80%.
- **Prevention**: /aegis-observe tracks context budget. Captain America monitors and triggers distill.

---

## Decision Log

> Format: [DATE] DECISION: <what was decided> | REASON: <why> | ALTERNATIVES: <what else was considered>

[2026-03-20] DECISION: Use 3-tier model routing (opus/sonnet/haiku) | REASON: Cost optimization without sacrificing quality on critical tasks | ALTERNATIVES: All-opus (too expensive), all-sonnet (insufficient for synthesis), single-tier (no cost control)

[2026-03-20] DECISION: Blast radius per agent rather than per task | REASON: Simpler to enforce, prevents entire classes of errors | ALTERNATIVES: Per-task scoping (too dynamic, hard to validate), no scoping (chaos)

[2026-03-20] DECISION: Structured message types for agent communication | REASON: Eliminates ambiguity, enables validation, supports logging | ALTERNATIVES: Free-form text (unreliable), function calls only (too rigid)

[2026-03-20] DECISION: Progressive disclosure for context management | REASON: 90% context savings at session start | ALTERNATIVES: Load everything (context explosion), manual loading (user burden)

---

## Session History

> Format: [DATE] Session #N — Summary | Lessons Added: P/A numbers

[2026-03-20] Session #0 -- Framework initialization. Created AEGIS v6 core files. | Lessons Added: P001-P006, A001-A007
[2026-03-23] Session #N -- v6.1 team command upgrade. Added threshold check, baseline commit, success metrics, failure handling, explicit integration to all team commands. | Changes: aegis-team-build/review/debate.md
[2026-03-30] Session #N -- v8.2.1 upgrade audit. Fixed version strings (v6.0→v8.2.1), removed legacy files, corrected command count (22→23), corrected skill count (29→25), standardized haiku models to claude-haiku-4-5. | Changes: CLAUDE*.md, README.md, update-protocol.md, forge/muse/scribe.md
