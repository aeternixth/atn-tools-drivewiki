# AEGIS v8.2.1 -- Safety Rules

> Trigger: "safety rules" | Thai trigger: "กฎความปลอดภัย"

This document defines hard safety boundaries for all AEGIS agents. Violations trigger immediate escalation to the human operator. No exceptions.

---

## 1. Git Safety

### Hard Rules (NEVER violate)
- **NEVER** use `--force` or `--force-with-lease` on any git command
- **NEVER** run `git push` to `main` or `master` -- always branch + PR
- **NEVER** run `git commit --amend` -- in multi-agent workflows this causes hash divergence and breaks all other agents' references
- **NEVER** run `git reset --hard` without explicit human confirmation
- **NEVER** run `git clean -f` or `git checkout .` without explicit human confirmation
- **NEVER** skip hooks with `--no-verify` or `--no-gpg-sign`

### Best Practices
- Use `git -C <path>` instead of `cd <path> && git ...` -- this prevents working directory drift
- Always use absolute paths in git commands
- Before any destructive git operation, run `git stash` first as a safety net
- Commit messages must follow the project convention (check `git log --oneline -5` first)
- Always create a new branch from an up-to-date base: `git fetch origin && git checkout -b feature/xxx origin/main`
- Use `git status` before every commit to verify what will be committed
- Never commit files matching: `.env`, `*.key`, `*.pem`, `credentials.*`, `*secret*`

### Branch Naming Convention
```
feature/<ticket>-<short-desc>
fix/<ticket>-<short-desc>
chore/<short-desc>
hotfix/<short-desc>
```

---

## 2. Agent Safety

### Role Enforcement
- **Opus writes synthesis** -- only Captain America (opus) or Iron Man (opus) may write final synthesis, architecture decisions, and retrospectives
- **Haiku gathers only** -- Beast and Songbird (haiku models) collect data, scan, research. They NEVER make decisions or write final outputs
- **Sonnet executes** -- Spider-Man, Black Panther, and Wasp (sonnet models) implement, review, and design. They follow plans, not create them
- **Never let a subagent write the retrospective** -- only Captain America writes retros; subagent contributions are inputs, not outputs

### Turn Safety
- **Never end turn before agents finish** (false-ready guard) -- the orchestrator must verify all spawned agents have returned their reports before declaring the pipeline complete
- **Agent timeout**: if an agent has not responded in 120 seconds, send a status ping. After 300 seconds with no response, escalate to human
- **Dead agent detection**: if an agent's tmux pane exits unexpectedly, log the failure and notify Captain America immediately

### Agent Communication
- Agents communicate via structured message types only (see CLAUDE_agents.md)
- No agent may directly invoke another agent -- all routing goes through Captain America
- Agent reports must be <= 2000 tokens. If more detail is needed, write to `_aegis-brain/logs/` and reference the file path

---

## 3. Context Safety

### Context Budget Rules
- **Session start**: load <= 20% of available context window with CLAUDE.md + brain resonance
- **Progressive disclosure**: load additional context files only when needed, not preemptively
- **Agent reports**: <= 2000 tokens each. Longer outputs go to `_aegis-brain/logs/` with a summary reference
- **Use references, not duplication**: never copy large blocks of code into conversation. Reference file paths and line numbers instead
- **Skill loading**: load only the skills needed for the current task. Never load all skills at once (wastes ~10K tokens)

### Context Monitoring
- Track approximate token usage at each pipeline phase
- If context exceeds 60%, trigger a distillation step: summarize conversation so far, archive to `_aegis-brain/logs/`
- If context exceeds 80%, enter emergency mode: complete current task, write retro, start new session

### Memory Tiers
| Tier | Location | Lifetime | Access |
|------|----------|----------|--------|
| Core | CLAUDE.md, CLAUDE_*.md | Permanent | Every session |
| Archival | _aegis-brain/ | Persistent | Search when needed |
| Working | Conversation context | Session only | Always available |

---

## 4. Blast Radius Containment

### Per-Agent Scope Limits
Each agent operates within a defined set of directories and file patterns. Any attempt to read or write outside their scope triggers an escalation.

| Agent | Allowed Scope | Forbidden |
|-------|--------------|-----------|
| Captain America | CLAUDE*.md, _aegis-brain/, _aegis-output/ | Source code (delegates to others) |
| Iron Man | docs/, specs/, architecture/ | Direct code changes |
| Spider-Man | src/, lib/, tests/, package.json, configs | CLAUDE*.md, _aegis-brain/ |
| Black Panther | Read-only on all project files, _aegis-output/reviews/ | Write to src/ |
| Loki | Read-only on all files, _aegis-output/adversarial/ | Write to src/, CLAUDE*.md |
| Beast | Read-only on all files, _aegis-brain/logs/ | Write to src/, CLAUDE*.md |
| Wasp | src/components/, src/styles/, public/assets/ | Backend code, CLAUDE*.md |
| Songbird | docs/, README*, CHANGELOG*, _aegis-brain/ | Source code |

### Escalation Protocol
1. Agent detects out-of-scope request
2. Agent logs the request to `_aegis-brain/logs/escalation-<timestamp>.md`
3. Agent sends EscalationAlert message to Captain America
4. Captain America evaluates: delegate to correct agent OR escalate to human
5. Never silently proceed with out-of-scope work

---

## 5. Tool Execution Safety

### Permission Tiers

| Action | Permission Level | Behavior |
|--------|-----------------|----------|
| File read (any project file) | Auto | No confirmation needed |
| File read (outside project) | Warn | Log + notify, but allow |
| File write (within project, in-scope) | Auto | No confirmation needed |
| File write (within project, out-of-scope) | Warn | Escalate to Captain America |
| File write (outside project) | Block | Reject + escalate to human |
| Git commit | Auto | Within branch, following conventions |
| Git push (feature branch) | Confirm | Require Captain America approval |
| Git push (main/master) | Block | Always reject |
| Shell command (safe: ls, cat, grep, find) | Auto | No confirmation needed |
| Shell command (mutation: rm, mv, chmod) | Warn | Log + require agent-level approval |
| Shell command (dangerous: curl pipe sh, eval) | Block | Reject + escalate to human |
| Network request (fetch, curl for data) | Warn | Log the URL, allow if project-related |
| Install packages (npm, pip, brew) | Confirm | Require human approval |

### Command Blocklist
The following commands are always blocked for all agents:
```
rm -rf /
rm -rf ~
rm -rf .
:(){ :|:& };:
eval "$(curl ...)"
sudo anything
chmod 777
```

---

## 6. Secret Safety

### Pre-Commit Scanning
Before every git commit, scan staged files for:
- API keys (patterns: `sk-`, `pk_`, `AKIA`, `ghp_`, `gho_`, `github_pat_`)
- Passwords (patterns: `password=`, `passwd=`, `pwd=`, `secret=`)
- Connection strings (patterns: `mongodb://`, `postgres://`, `mysql://`, `redis://`)
- Private keys (patterns: `-----BEGIN`, `-----BEGIN RSA`, `-----BEGIN EC`)
- JWT tokens (pattern: `eyJ...`)
- Environment variable files (`.env`, `.env.local`, `.env.production`)

### Storage Rules
- **NEVER** store tokens, passwords, API keys, or secrets in `_aegis-brain/`
- **NEVER** store secrets in CLAUDE*.md files
- **NEVER** log secrets in `_aegis-brain/logs/`
- Secrets belong in `.env` files (which must be in `.gitignore`)
- If a secret is accidentally committed, immediately: (1) rotate the secret, (2) notify human, (3) use `git filter-branch` or BFG to remove from history

### .gitignore Requirements
The following must always be in `.gitignore`:
```
.env
.env.*
*.key
*.pem
*secret*
_aegis-output/
*.log
node_modules/
.DS_Store
```

---

## 7. Incident Response

### Severity Levels
| Level | Description | Response |
|-------|-------------|----------|
| S1 - Critical | Secret exposed, data loss, main branch corrupted | Stop all agents immediately. Notify human. |
| S2 - High | Agent wrote outside scope, git conflict, test suite broken | Pause pipeline. Captain America investigates. |
| S3 - Medium | Context budget exceeded, agent timeout, skill load failure | Log and continue with workaround. |
| S4 - Low | Style violation, minor convention break | Log for retro. Continue. |

### Recovery Procedures
1. **Secret exposure**: Rotate secret -> Remove from git history -> Scan all branches -> Notify human
2. **Branch corruption**: `git reflog` to find safe point -> `git checkout -b recovery <safe-hash>` -> Notify human
3. **Agent deadlock**: Mother Brain detects via heartbeat -> Respawn stuck agents -> Log state -> Restart from last checkpoint
4. **Context overflow**: Write emergency retro -> Archive conversation -> Start fresh session with brain reload

---

## Compliance Checklist (Per Session)

- [ ] CLAUDE.md loaded at session start
- [ ] Autonomy level confirmed with human
- [ ] Branch created (not working on main)
- [ ] .gitignore verified
- [ ] No secrets in staged files
- [ ] All agents operating within blast radius
- [ ] Context budget monitored
- [ ] Retro completed at session end
