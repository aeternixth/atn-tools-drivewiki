---
name: aegis-distill
description: "Distill accumulated learnings into patterns and promote to resonance"
triggers:
  en: distill, summarize learnings, knowledge distillation
  th: กลั่นกรอง, สรุปบทเรียน
---

# /aegis-distill

## Quick Reference
Knowledge distillation process. Counts learnings files, requires minimum 10 to proceed,
groups learnings by topic/category, summarizes key patterns per group, promotes patterns
appearing 3+ times to _aegis-brain/resonance/, creates a distillation report in
_aegis-output/, and preserves originals via git. "Nothing is truly deleted."

## Full Instructions

### Step 1: Count Learnings
- List all files in `_aegis-brain/learnings/`.
- Count total number of learning files.
- Display: "Found [N] learning files."

### Step 2: Minimum Threshold Check
- If fewer than 10 files:
  ```
  📚 Not enough learnings yet, keep going!
  You have [N] learnings. Distillation works best with 10+ learnings
  so patterns can emerge naturally. Keep learning and come back later!
  ```
  - Stop execution here.
- If 10+, proceed: "Sufficient learnings for distillation. Analyzing..."

### Step 3: Group Learnings by Topic
- Read all learning files.
- Extract the `category` field from each file's frontmatter.
- Also analyze content for thematic grouping beyond just the category tag.
- Create groups such as:
  - Architecture patterns
  - Testing strategies
  - Debugging techniques
  - Workflow improvements
  - Tooling insights
  - Code quality patterns
  - Performance lessons
  - Other
- Display group counts:
  ```
  Grouping results:
  • Architecture: 4 learnings
  • Testing: 3 learnings
  • Workflow: 2 learnings
  • Debugging: 1 learning
  ```

### Step 4: Summarize Key Patterns per Group
- For each group with 2+ learnings:
  - Identify recurring themes within the group.
  - Summarize each theme in 1-2 sentences.
  - Note how many learnings support each theme.
- Format:
  ```
  ## Architecture Patterns
  1. **Prefer composition over inheritance** (seen in 3 learnings)
     → Services should be composed of small, focused modules.
  2. **Config belongs at the boundary** (seen in 2 learnings)
     → Configuration should be loaded at app startup, not deep in modules.
  ```

### Step 5: Promote Patterns to Resonance
- Any pattern appearing in 3+ learnings is considered "proven" and gets promoted.
- For each promoted pattern:
  - Create or update a file in `_aegis-brain/resonance/`.
  - Format:
    ```markdown
    ---
    promoted: YYYY-MM-DD
    source_count: [N]
    confidence: high
    ---
    # [Pattern Name]
    
    ## Pattern
    [Clear statement of the pattern]
    
    ## Evidence
    - [Learning 1 reference]
    - [Learning 2 reference]
    - [Learning 3+ reference]
    
    ## Application
    [When and how to apply this pattern]
    ```
  - If a resonance file for this pattern already exists, update it with new evidence.
- Report: "Promoted [N] patterns to resonance."

### Step 6: Create Distillation Report
- Save a comprehensive report to `_aegis-output/distillation-YYYY-MM-DD.md`.
- Create the directory if needed.
- Report includes:
  ```markdown
  # Knowledge Distillation Report — [date]
  
  ## Overview
  - Total learnings analyzed: [N]
  - Groups identified: [N]
  - Patterns found: [N]
  - Patterns promoted to resonance: [N]
  
  ## Groups & Patterns
  [from step 4]
  
  ## Promoted to Resonance
  [list of promoted patterns with file paths]
  
  ## Learnings Not Yet Grouped
  [any orphan learnings that didn't fit a pattern]
  
  ## Recommendations
  - [Areas where more learnings would help]
  - [Patterns close to promotion threshold (2 occurrences)]
  ```

### Step 7: Preserve Originals
- Do NOT delete any original learning files.
- Git preserves history — "Nothing is truly deleted."
- The original files remain in `_aegis-brain/learnings/` as the source of truth.
- Display: "Original learnings preserved. Git history is your archive."
- Optionally suggest: `git add _aegis-brain/ && git commit -m "distill: promote [N] patterns to resonance"`
