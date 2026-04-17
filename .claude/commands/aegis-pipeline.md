---
name: aegis-pipeline
description: "Full analysis pipeline with phased subagent execution and quality gates"
triggers:
  en: analyze, full pipeline, deep analysis, run pipeline
  th: วิเคราะห์, pipeline เต็ม
---

# /aegis-pipeline

## Quick Reference
Three-phase analysis pipeline using subagents. Phase 1 (Research): Beast scans codebase
and dependencies, Songbird scans docs — Gate 1 validates completeness. Phase 2 (Analysis):
Iron Man does architecture, Black Panther does quality, Loki does adversarial — Gate 2 checks
contradictions. Phase 3 (Synthesis): Captain America synthesizes and formats final report. Context
budget checks between every phase. Requires sufficient context budget to complete.

## Full Instructions

### Pre-Flight Check
- Run context budget estimation.
- Full pipeline requires approximately 25-35% of context budget.
- If insufficient budget:
  ```
  ⚠️ Insufficient context budget for full pipeline.
  Current: [X]% used | Pipeline needs: ~30%
  Options:
  1. Run /compact first to free space
  2. Run individual phases manually
  3. Start a fresh session
  ```
  - Do not proceed if >70% context already used.

### Phase 1 — Research (Parallel Subagents)

**Beast — Codebase Scan:**
- Scan project directory structure and report hierarchy.
- Identify: languages used, frameworks, key directories.
- Map: entry points, configuration files, build systems.
- Output: structured codebase map.

**Beast — Dependency Gathering:**
- Read package.json, requirements.txt, go.mod, Cargo.toml, or equivalent.
- List all direct dependencies with versions.
- Note any outdated or deprecated packages (if detectable).
- Output: dependency inventory.

**Songbird — Documentation Scan:**
- Find and read: README, CONTRIBUTING, docs/, wiki/, *.md files.
- Assess: documentation completeness, accuracy, freshness.
- Note: gaps, outdated sections, missing docs.
- Output: documentation assessment.

**All research tasks run in parallel where possible.**

#### GATE 1: Research Validation (Captain America)
- Verify all three research outputs are complete.
- Check for missing data or scan failures.
- If any research is incomplete, retry that specific task.
- If research is complete: "Gate 1 PASSED — Research complete. Proceeding to analysis."
- **Context check**: Estimate remaining budget before proceeding.

### Phase 2 — Deep Analysis (Parallel/Team)

**Iron Man — Architecture Analysis:**
- Analyze: system architecture, design patterns, module boundaries.
- Evaluate: coupling, cohesion, separation of concerns.
- Identify: architectural strengths and weaknesses.
- Map: data flow, dependency graph, critical paths.
- Output: architecture assessment with diagrams (text-based).

**Black Panther — Code Quality Review:**
- Review: code style consistency, error handling, edge cases.
- Check: test coverage, test quality, testing patterns.
- Identify: code smells, anti-patterns, tech debt.
- Evaluate: security practices, input validation, auth patterns.
- Output: quality scorecard with specific findings.

**Loki — Adversarial Analysis:**
- Challenge: architectural decisions — what could go wrong?
- Vision: failure modes, scalability limits, single points of failure.
- Test: security assumptions — what is assumed but not verified?
- Question: "What happens when [X] fails?" for each critical component.
- Output: risk assessment with severity ratings.

**Analysis tasks run in parallel where possible.**

#### GATE 2: Analysis Validation (Black Panther)
- Review all three analysis outputs for completeness.
- Check for contradictions between analyses.
  - If Iron Man says architecture is solid but Loki found critical flaws → flag.
  - If Black Panther's quality review contradicts Iron Man's patterns → investigate.
- Resolve contradictions by noting both perspectives.
- If analyses are complete: "Gate 2 PASSED — Analysis complete. Proceeding to synthesis."
- **Context check**: Estimate remaining budget before proceeding.

### Phase 3 — Synthesis (Sequential)

**Captain America — Synthesis:**
- Combine all research and analysis outputs.
- Organize by theme, not by agent.
- Resolve any remaining contradictions with balanced perspective.
- Prioritize findings by impact and actionability.
- Structure:
  ```markdown
  # AEGIS Analysis Report — [Project Name]
  
  ## Executive Summary
  [3-5 sentences: overall assessment]
  
  ## Architecture
  [Iron Man's analysis, enriched with Loki's challenges]
  
  ## Code Quality
  [Black Panther's findings, organized by severity]
  
  ## Risk Assessment
  [Loki's findings, with mitigation suggestions]
  
  ## Documentation
  [Songbird's assessment]
  
  ## Dependencies
  [Beast's inventory with risk notes]
  
  ## Recommendations
  [Prioritized list: what to fix/improve, ordered by impact]
  
  ## Appendix
  [Raw findings, metrics, detailed breakdowns]
  ```

**Format Final Report:**
- Clean up formatting for readability.
- Add table of contents if long.
- Save to `_aegis-output/analysis-YYYY-MM-DD.md`.
- Present executive summary to user.
- Offer to dive deeper into any section.
