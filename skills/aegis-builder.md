---
name: aegis-builder
description: "Create, customize, extend AEGIS: build skills, personas, modules"
profile: full
triggers:
  en: ["build skill", "create skill", "new persona", "extend AEGIS", "customize AEGIS"]
  th: ["สร้าง skill ใหม่", "ขยาย AEGIS", "สร้าง persona", "ปรับแต่ง AEGIS"]
---

## Quick Reference
Meta-tool for extending and customizing the AEGIS framework.
- **Skills**: Create new skills following the standard format
- **Personas**: Define new AI agent personas
- **Teams**: Create new team configurations
- **Modules**: Build reusable framework components
- **Output**: New files in `skills/`, `.claude/teams/`, or framework dirs
- **Agent**: Iron Man (opus) — design; Spider-Man (sonnet) — implementation

## Full Instructions

### Invocation

```
/aegis-builder [skill|persona|team|module] "<description>"
```
- `skill` — Create a new skill file
- `persona` — Create a new agent persona
- `team` — Create a new team configuration
- `module` — Create a reusable framework module

### Build New Skill

#### Step 1: Gather Requirements
- What does this skill do?
- When should it be triggered?
- Which persona(s) should execute it?
- What profile level? (minimal/standard/full)
- What output does it produce?

#### Step 2: Generate Skill File

Follow the standard skill format:

```markdown
---
name: <kebab-case-name>
description: "<≤50 token description>"
profile: minimal|standard|full
triggers:
  en: [<english trigger phrases>]
  th: [<thai trigger phrases>]
---

## Quick Reference
<max 20 lines — what it does, key steps, output location>

## Full Instructions
<detailed step-by-step instructions>
```

#### Step 3: Validate

Checklist for new skills:
- [ ] Name is unique (no conflict with existing skills)
- [ ] Description is ≤50 tokens
- [ ] Profile level is appropriate for complexity
- [ ] Triggers include both EN and TH
- [ ] Quick Reference is ≤20 lines
- [ ] Full Instructions are complete and actionable
- [ ] Output location is specified
- [ ] Assigned persona is appropriate
- [ ] No overlap with existing skill functionality

#### Step 4: Install

1. Write to `skills/<name>.md`
2. Test trigger recognition
3. Log creation to activity log

### Build New Persona

#### Persona Template

```markdown
# Persona: <Name>

## Identity
- **Name**: <name>
- **Emoji**: <emoji>
- **Role**: <one-line role description>
- **Model**: opus|sonnet|haiku

## Capabilities
- **Tools**: <list of allowed tools>
- **Scope**: <what this persona does>
- **Boundaries**: <what this persona does NOT do>

## Communication Style
- **Tone**: <description of communication style>
- **Output format**: <preferred output format>
- **Verbosity**: minimal|standard|detailed

## Activation Rules
| Task Pattern | Confidence |
|-------------|------------|
| <pattern that should route to this persona> | High/Medium |

## Handoff Protocol
- **Receives from**: <which personas hand off to this one>
- **Hands off to**: <which personas this one delegates to>
- **Context passed**: <what information to include in handoff>
```

#### Persona Validation
- [ ] Name is unique
- [ ] Emoji is unique (no conflict with existing personas)
- [ ] Model selection is justified
- [ ] Scope boundaries are clear
- [ ] Does not overlap significantly with existing personas
- [ ] Activation rules are distinct from other personas

### Build New Team

#### Team Template

```markdown
---
name: <team-name>
description: "<team purpose>"
lead: <persona name>
members: [<persona>, <persona>]
mode: in-process
requires: agent-teams
---

## Team Purpose
<description of what this team does together>

## Task Breakdown
1. <Persona> (<model>): <responsibility>
2. <Persona> (<model>): <responsibility>
3. <Persona> (<model>): <responsibility>

## Communication Flow
<Persona> → <MessageType> → <Persona>
<Persona> → <MessageType> → <Persona>

## Pipeline
<Phase 1> → GATE → <Phase 2> → GATE → <Phase 3>

## Output
<output location and format>
```

#### Team Validation
- [ ] Team name is unique
- [ ] All members are valid personas
- [ ] Lead persona is appropriate for coordination
- [ ] Communication flow covers all necessary paths
- [ ] Pipeline has gates at appropriate points
- [ ] Fallback mode is defined

### Build New Module

Modules are reusable components that extend AEGIS capabilities:

#### Module Types
| Type | Location | Purpose |
|------|----------|---------|
| Protocol | `.claude/references/` | Communication standards |
| Template | `_aegis-output/templates/` | Output templates |
| Hook | `skills/hooks/` | Pre/post skill execution hooks |
| Integration | `skills/integrations/` | External service connectors |

#### Module Template

```markdown
# Module: <Name>
**Type**: <protocol|template|hook|integration>
**Version**: 1.0.0
**Author**: <author>

## Purpose
<what this module does>

## Usage
<how to use this module>

## Configuration
| Setting | Default | Description |
|---------|---------|-------------|
| <key> | <value> | <what it does> |

## Implementation
<the actual module content>
```

### Extension Best Practices

1. **Check existing** — Before building, verify no existing skill/persona covers the need
2. **Start minimal** — Begin with minimal profile, upgrade if needed
3. **Test locally** — Verify the new component works before committing
4. **Document** — Include clear examples and edge cases
5. **Follow conventions** — Match the style and format of existing components
6. **Update inventory** — Register new components in the appropriate index

### Output

- Skills: `skills/<name>.md`
- Personas: Update `skills/ai-personas.md` (add to registry)
- Teams: `.claude/teams/<team-name>.md`
- Modules: Varies by type (see Module Types table)
