---
name: design-system-md
trigger: /design-system, /design-md, DESIGN.md, design system
description: >
  Generate a DESIGN.md visual design system document following the Google Stitch
  9-section format (adopted from VoltAgent/awesome-design-md). Defines how a project
  should LOOK and FEEL so downstream builder agents generate pixel-consistent UI.
  Owned by Wasp with Iron Man review.
agents: [wasp, iron-man, loki]
owner: wasp
---

# /design-system-md

## Purpose
Fill AEGIS's UI gap. Iron Man's super-spec defines **what** the system does;
`DESIGN.md` defines **how it looks**. Both are required before Spider-Man or
Thor build the UI layer.

Without `DESIGN.md`, builder agents default to generic bootstrap-style UI and
every feature ships visually inconsistent.

## When to Run

| Trigger | Action |
|---------|--------|
| New project with a UI | Run once at BLOCK 0, alongside PM.01/SI.01 |
| Re-engineering UI | Run in Phase 2 of `/aegis-reengineer` alongside target-state |
| Brand refresh | Run whenever the design language changes |
| Never | Backend-only / CLI-only projects — skip |

## Output Location
```
_aegis-output/design/
├── DESIGN.md              # the visual design system (primary artifact)
├── preview.html           # optional visual catalog (light mode)
├── preview-dark.html      # optional visual catalog (dark mode)
└── tokens.json            # optional — colors/fonts/spacing as design tokens
```

## Canonical 9-Section Skeleton

Every DESIGN.md MUST use these exact H2 headings in this exact order:

```markdown
# Design System: <Project Name>

> One-paragraph "soul" statement. Name the FEEL first, not the spec.
> Example: "A literary salon reimagined as a product page — warm, unhurried,
> and quietly intellectual. Nothing shouts. Everything earns the eye."

## 1. Visual Theme & Atmosphere
- Core mood (3–5 adjectives)
- Design philosophy (1 paragraph)
- Key characteristics (bullet list)
- Reference aesthetic (if any): "feels like Linear × Stripe"

## 2. Color Palette & Roles

### Primary
- **<Name>** (`#hex`) — role, usage, when to apply
- **<Name>** (`#hex`) — ...

### Secondary & Accent
- same format

### Surface & Background
- **<Name>** (`#hex`) — base surface, elevated surface, overlay

### Neutrals & Text
- **<Name>** (`#hex`) — primary text, secondary text, muted, disabled

### Semantic
- **Success** (`#hex`)
- **Warning** (`#hex`)
- **Error** (`#hex`)
- **Info** (`#hex`)

### Gradient System (if used)
- **<Name>**: `linear-gradient(...)` — where to use

## 3. Typography Rules

### Font Family
- **Display**: <font name> — fallback stack
- **Body**: <font name> — fallback stack
- **Mono**: <font name> — fallback stack

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| H1 (display) | ... | 64px | 500 | 1.1 | -0.02em | page hero only |
| H2 | ... | 40px | 500 | 1.2 | -0.01em | section title |
| H3 | ... | 24px | 600 | 1.3 | 0 | subsection |
| Body | ... | 16px | 400 | 1.6 | 0 | paragraph |
| Caption | ... | 13px | 400 | 1.5 | 0.01em | metadata |
| Code | ... | 14px | 500 | 1.5 | 0 | inline code |

### Principles
- bullet list of typography rules (never mix X with Y, always use Z for W, etc.)

## 4. Component Stylings

### Buttons
- **Primary**
  - Background: `#hex`
  - Text: `#hex`
  - Padding: 12px 20px
  - Radius: 8px
  - Shadow: `0 1px 2px rgba(0,0,0,0.05)`
  - Hover: brightness 1.05
  - Active: scale 0.98
- **Secondary**
  - ...
- **Ghost / Tertiary**
  - ...
- **Destructive**
  - ...

### Cards & Containers
- same bullet format

### Inputs & Forms
- border, focus ring, placeholder color, error state

### Navigation
- top bar, side bar, mobile drawer — treatment per variant

### Image Treatment
- aspect ratios, border radius, overlay gradients

### Distinctive Components
- the signature pieces of this design system (e.g. Linear's command bar)

## 5. Layout Principles

### Spacing System
- base unit: 4px (or 8px)
- scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

### Grid & Container
- max content width
- gutter size
- column count at each breakpoint

### Whitespace Philosophy
- 1 paragraph explaining the density choice

### Border Radius Scale
| Token | Value | Use |
|-------|-------|-----|
| sm | 4px | chips, tags |
| md | 8px | buttons, inputs |
| lg | 16px | cards |
| xl | 24px | modals |
| full | 9999px | avatars, pills |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 | flat, no shadow | base surface |
| 1 | `0 1px 2px rgba(0,0,0,0.05)` | cards at rest |
| 2 | `0 4px 12px rgba(0,0,0,0.08)` | hover, popover |
| 3 | `0 12px 32px rgba(0,0,0,0.12)` | modal, dropdown |
| 4 | `0 24px 64px rgba(0,0,0,0.18)` | command palette |

## 7. Do's and Don'ts

### ✅ Do
- Use the `Primary` color for the single most important action per view.
- Keep body text at 16px minimum for WCAG AA.
- Respect the 8px spacing grid — never half-steps.
- ...

### ❌ Don't
- Don't mix display font with body font in the same paragraph.
- Don't use shadow level 3+ on scrolling content (perf).
- Don't invent new radius values outside the scale.
- ...

## 8. Responsive Behavior

| Breakpoint | Name | Layout Changes |
|------------|------|----------------|
| < 640px | mobile | single column, hamburger nav |
| 640–1024px | tablet | 2-col, condensed nav |
| 1024–1440px | desktop | 3-col, full nav |
| > 1440px | wide | max-width 1280px, center |

## 9. Agent Prompt Guide

### Quick Color Reference
```
Primary:   #hex (name)
Secondary: #hex (name)
Surface:   #hex (name)
Text:      #hex (name)
```

### Example Component Prompts

Copy-paste these prompts into your Claude Code session when asking for UI:

- **Hero section**: "Create a hero on {Surface} (`#hex`) with a headline at 64px {Display Font} weight 500, line-height 1.1, letter-spacing -0.02em, primary text color {Text} (`#hex`). Single CTA button using the Primary button style from §4."

- **Card grid**: "Grid of 3 cards on {Surface}. Each card uses border-radius lg (16px), shadow level 1, 24px padding. Card title H3, body 16px secondary text."

- **Form**: "Login form. Inputs use the style from §4 Inputs (1px border, 8px radius, focus ring in {Primary}). Submit button = Primary. Error state uses Semantic Error color."

- **Dark mode variant**: "Invert the Surface and Neutrals per §2. Primary and Semantic stay the same. Shadows become `rgba(0,0,0,0.4)` instead of `rgba(0,0,0,0.08)`."

### Iteration Guide

When the result doesn't match the design:
1. Screenshot the output
2. Name the specific section that's wrong ("buttons too loud, don't match §4")
3. Ask Wasp to regenerate just that section
4. Re-run the builder with the updated DESIGN.md
```

## Workflow

### Step 1: Wasp drafts DESIGN.md
Wasp reads:
- `_aegis-output/specs/` — what the system does
- `_aegis-output/architecture/` — platforms/constraints
- Any brand assets the user provides (logos, screenshots, references)

Wasp generates `_aegis-output/design/DESIGN.md` using the 9-section skeleton above.

### Step 2: Iron Man validates technical feasibility
Iron Man reviews:
- Are the color contrasts WCAG AA compliant?
- Do the typography choices fit the target platforms?
- Is the spacing scale compatible with the component library?
- Any decisions that lock us into a specific framework?

Verdict: APPROVE / CONDITIONAL / REJECT (standard Plan-Approval Gate format)

### Step 3: Loki adversarial check
Loki reads DESIGN.md and asks:
- Does the "soul statement" actually match the Do's/Don'ts list?
- Are there internal contradictions (Section 4 says ghost buttons, Section 7 says "no subtle CTAs")?
- Will the distinctive components survive mobile responsive?
- Are shadow levels overused (perf risk)?

Verdict: APPROVE / CONDITIONAL / REJECT

### Step 4: Publish
Once all three agents APPROVE, DESIGN.md becomes the source of truth for every
UI task in the project. Spider-Man / Thor MUST reference it before writing
component code.

## Integration with Other AEGIS Artifacts

| Artifact | Relationship to DESIGN.md |
|----------|---------------------------|
| `SI.01 Requirements Spec` | Functional — WHAT the UI does |
| `DESIGN.md` | Visual — HOW the UI looks |
| `ADRs` | May reference DESIGN.md for "why this typography stack" |
| `Master re-engineer spec` | Phase 2 target-state MUST include DESIGN.md if UI scope |

## Related
- `@references/multi-agent-patterns.md` — Pattern 10 (this one)
- `.claude/agents/wasp.md` — Wasp is the primary author
- `.claude/agents/iron-man.md` — Iron Man validates feasibility
- `skills/super-spec.md` — complementary; functional spec
- VoltAgent/awesome-design-md — source of the 9-section format
- Google Stitch docs — `https://stitch.withgoogle.com/docs/design-md/overview/`
