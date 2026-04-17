# AEGIS v8.4 -- Agent Team Framework

> "Context is King, Memory is Soul"

## Navigation
| File | When to Read | Priority |
|------|-------------|----------|
| CLAUDE.md | Every session | Required |
| CLAUDE_safety.md | Before git/file thor | Required |
| CLAUDE_agents.md | Before spawning agents | As needed |
| CLAUDE_skills.md | When choosing skills | As needed |
| CLAUDE_lessons.md | When stuck or deciding | Reference |

## Golden Rules
1. NEVER use --force flags on git
2. NEVER push to main -- branch + PR always
3. NEVER git commit --amend -- breaks all agents
4. NEVER end turn before agents finish (false-ready guard)
5. Run /aegis-start at session begin
6. Run /aegis-retro at session end
7. **Agents ask Nick Fury, not the human** -- Master Brain Protocol (v8.4)
   See `.claude/references/context-rules.md` for QUESTION_TO_BRAIN format
   and the four allowed escalation categories. Only Nick Fury escalates to human.

## Nick Fury (🧬)
After /aegis-start, Nick Fury takes full control:
- Scans project state (git, tests, specs, deps, tech debt)
- Decides what to do next (Decision Matrix P0-P10)
- Spawns the right team automatically (in-process agents)
- Does NOT ask human -- analyzes, decides, executes
- Human watches via Shift+Down to view agent detail
- Human can interrupt anytime (Ctrl+C) or downgrade: /aegis-mode --autonomy L1

Default autonomy: L3 (Autonomous) with Nick Fury active

## Quick Commands
| Command | Purpose |
|---------|---------|
| /aegis-start | Begin session -- Nick Fury activates |
| /aegis-retro | End session -- retrospective + lessons |
| /aegis-pipeline | Full analysis pipeline |
| /aegis-team-build | Spawn build team (in-process) |
| /aegis-team-review | Spawn review team (in-process) |
| /aegis-team-debate | Spawn debate team (in-process) |
| /aegis-status | Check all agent progress |
| /aegis-mode | Switch autonomy level or profile |
