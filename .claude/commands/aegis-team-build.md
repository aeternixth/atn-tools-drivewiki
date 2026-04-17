---
name: aegis-team-build
description: "Spawn build team — Iron Man specs, Spider-Man implements, Black Panther reviews"
triggers:
  en: team build, build team, spawn builders, /aegis-team-build
  th: ทีมสร้าง, สร้างแบบทีม, ทีมบิวด์
---

You MUST execute ALL of the following steps NOW. Do not explain — just do it.

## Step 1: Capture Baseline

Run these commands and store the results:
- `git rev-parse HEAD` → {baseline_commit}
- `git branch --show-current` → {current_branch}
- `git status --porcelain` → {dirty_files}

If {dirty_files} is non-empty, warn the user: "⚠️ You have uncommitted changes. Consider committing or stashing before proceeding."

## Step 2: Get the Task

The user's message contains the task. If empty, use: "$ARGUMENTS"

## Step 3: Threshold Check

Evaluate the task scope:
- If the task touches 1-2 files AND is a simple fix/change → run in **SOLO mode**: use a single Agent (Spider-Man) to do the work. Skip team creation. Go to Step 7.
- If the task touches 3+ files OR involves design decisions OR has unclear scope → run in **TEAM mode**: proceed to Step 4.

Report which mode was selected and why.

## Step 4: Create Team

Call TeamCreate:
- team_name: "aegis-build"
- description: "Build team for: [TASK]"

## Step 5: Spawn 3 Teammates (all in parallel)

Call Agent tool 3 times in a SINGLE message (parallel). All agents run in-process — user sees real-time updates and can use Shift+Down to view individual agent detail.

1. Agent with subagent_type="iron-man", team_name="aegis-build", name="iron-man", mode="bypassPermissions", run_in_background=true
   Prompt: "You are 📐 Iron Man the architect on team aegis-build. Read .claude/agents/iron-man.md for your full persona. TASK: [TASK]. Write a technical spec to _aegis-output/specs/. SUCCESS CRITERIA: Spec file exists with problem statement, proposed solution, file list, and acceptance criteria. When done, send a message to spider-man via SendMessage telling them the spec is ready."

2. Agent with subagent_type="spider-man", team_name="aegis-build", name="spider-man", mode="bypassPermissions", run_in_background=true
   Prompt: "You are ⚡ Spider-Man the implementer on team aegis-build. Read .claude/agents/spider-man.md for your full persona. TASK: [TASK]. Wait for a message from iron-man with the spec. Then implement all files based on the spec. SUCCESS CRITERIA: All files listed in spec are created/modified, code compiles/runs without errors. When done, send a message to black-panther via SendMessage telling them to review."

3. Agent with subagent_type="black-panther", team_name="aegis-build", name="black-panther", mode="bypassPermissions", run_in_background=true
   Prompt: "You are 🛡️ Black Panther the reviewer on team aegis-build. Read .claude/agents/black-panther.md for your full persona. Wait for a message from spider-man that implementation is done. Then do a 4-pass review (correctness, security, performance, maintainability). Write review to _aegis-output/reviews/. SUCCESS CRITERIA: Review file exists with PASS/CONDITIONAL/FAIL verdict and specific findings with file:line references. Send the verdict to the team lead via SendMessage."

## Step 6: Report to user

```
🛡️ AEGIS Build Team Spawned!

📐 Iron Man (architect) — Writing spec...
⚡ Spider-Man (implementer) — Waiting for spec...
🛡️ Black Panther (reviewer) — Waiting for review...

Pipeline: Iron Man → Spider-Man → Black Panther
View agents: Shift+Down | Back to main: Shift+Up
Messages appear automatically when agents complete.
```

## Step 7: Integration (after all agents complete)

1. Read Black Panther's review verdict from _aegis-output/reviews/
2. If PASS → summarize what was built, run `git diff {baseline_commit}`, suggest commit
3. If CONDITIONAL → list conditions, ask user whether to proceed or fix
4. If FAIL → list critical issues, do NOT suggest commit, suggest re-running with fixes
5. Report the diff summary to the user
6. Send shutdown_request to each teammate, then TeamDelete

## Failure Handling

If any agent fails to respond within a reasonable time:
1. Check agent status via team tools
2. If stuck → send a nudge message with simplified instructions
3. If errored → report error to user, proceed with available results
4. If multiple fail → abort team, report partial results, suggest retry

Never wait indefinitely. If an agent has not responded after its predecessor completed, investigate.

---

> Use **Shift+Down** to view agent activity in-process. **Shift+Up** to return to main.
