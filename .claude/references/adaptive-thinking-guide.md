# Adaptive Thinking Guide — Claude 4.x Extended Reasoning

> How AEGIS agents use Claude's adaptive thinking to match reasoning depth to task complexity.

---

## What Is Adaptive Thinking

Claude 4.x supports extended reasoning with `thinking: {type: "adaptive"}` — Claude reasons step-by-step before responding, using a scratchpad that is not shown to the user. The depth of reasoning is controlled by `effort` level.

Adaptive thinking replaces the deprecated `budget_tokens` parameter.

## Effort Levels

| Level | Tokens Used | Use When |
|-------|-------------|----------|
| `max` | ~32k tokens | Architecture design, security audit, complex debugging |
| `high` | ~16k tokens | Code review (multi-file), spec writing, test strategy |
| `medium` | ~8k tokens | Implementation, single-file review, QA planning |
| `low` | ~2k tokens | Document generation, scanning, simple formatting |

## Agent → Effort Mapping

| Agent | Default Effort | Rationale |
|-------|----------------|-----------|
| Nick Fury | `max` | Multi-signal decision making across entire project state |
| Iron Man | `max` | Architecture requires deep trade-off reasoning |
| Loki | `high` | Adversarial analysis needs thorough challenge generation |
| Captain America | `high` | Coordination decisions affect all downstream agents |
| Black Panther | `high` | 5-pass review must catch all correctness/security issues |
| Spider-Man | `medium` | Implementation is concrete — less ambiguity |
| War Machine | `medium` | Test strategy is structured, not open-ended |
| Wasp | `medium` | UX decisions benefit from reasoning, not excessive depth |
| Thor | `medium` | DevOps decisions are procedural with known patterns |
| Coulson | `low` | Document generation is formatting, not reasoning |
| Beast | `low` | Data gathering is pattern-matching, not analysis |
| Songbird | `low` | Documentation writing is structured output |
| Vision | `low` | Test execution is deterministic — no reasoning needed |

## How to Use in API Calls

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=16000,
    thinking={
        "type": "adaptive",
        "effort": "max"   # or "high", "medium", "low"
    },
    messages=[{"role": "user", "content": task}]
)
```

## Interleaved Thinking

With adaptive thinking enabled, Claude automatically reasons between every tool call (interleaved thinking). This means:
- Beast reasons about each scan result before the next search
- Black Panther reasons between each review pass
- Nick Fury reasons between each state check during scan

No special configuration needed — it's automatic with adaptive mode.

## Cost vs Quality Trade-off

Higher effort = better decisions + higher cost. Apply `max`/`high` only when the decision is consequential:
- Wrong architecture costs 10x to fix → use `max`
- Wrong test case → easy to add later → use `medium`
- Wrong document format → trivial to edit → use `low`

## When NOT to Use Extended Thinking

- Simple CRUD operations (Spider-Man implementing a well-specified endpoint): `low`/`medium`
- Document skeleton generation (Coulson, BLOCK 0): `low`
- Test execution (Vision): none needed, Vision runs deterministic commands

---

## Power Keyword — ultrathink (Local Only)

> Source-confirmed in Claude Code CLI v2.1.92 source code. Official Anthropic feature.

### `ultrathink` — Per-Turn Max Effort

Type the word `ultrathink` anywhere in your prompt. Claude Code detects it client-side, removes the word, and injects:
> *"The user has requested reasoning effort level: high. Apply this to the current turn."*

```
ultrathink — design the database schema for the auth system
```

| Aspect | Detail |
|--------|--------|
| Maps to | `effort: "high"` (NOT "max" — use `/effort max` for max) |
| Scope | Current turn only |
| Persistent alternative | `/effort high` (lasts the full session) |
| Regex | `\bultrathink\b` case-insensitive, whole-word |
| Feature flag | `tengu_turtle_carbon` (enabled by default) |
| Cloud upload? | **No** — runs entirely local in Claude Code CLI |

**When to use in AEGIS**: Iron Man writing architecture, Loki adversarial review, Nick Fury complex scan-and-decide.

**Keyword hierarchy** (from deprecated Claude 3.x era, for context only):
- `think` → 4,000 budget_tokens
- `megathink` → 10,000 budget_tokens
- `ultrathink` → 31,999 budget_tokens

In Claude 4.x these fixed budgets are replaced by adaptive thinking. Only `ultrathink` has a dedicated code path now.

---

## Cloud Features Are Banned in AEGIS

**`ultraplan` and `ultrareview` are NOT used in AEGIS** — they upload code to claude.ai
cloud, which violates the local-first / no-data-egress principle of this framework.

| Banned Cloud Feature | AEGIS Local Replacement |
|---------------------|-------------------------|
| `ultraplan` | `/super-spec` → Iron Man (`ultrathink`) → Loki review → `/aegis-breakdown` → `/aegis-sprint` |
| `ultrareview` | Black Panther Gate 1 + Beast scan + Loki adversarial review |

**Rule**: Never type `ultraplan` or `ultrareview` in any prompt. If a workflow doc
mentions them, treat that doc as out-of-date and use the local replacement.

---

## Summary: Which Keyword for Which Situation

| Situation | Use |
|-----------|-----|
| Need deeper reasoning THIS turn | `ultrathink` in prompt (local only) |
| Need deep reasoning ALL session | `/effort max` |
| Greenfield feature, no spec yet | `/super-spec` → Iron Man drafts → Loki gates |
| Complex sprint with no breakdown | `/aegis-breakdown` → Iron Man + Loki ultrathink |
| Pre-merge security check | Black Panther Gate 1 + Loki adversarial review |
| Standard AEGIS pipeline already running | AEGIS native (BLOCK 0 → Iron Man → Loki → build) |
