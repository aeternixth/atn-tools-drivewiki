---
name: skill-marketplace
description: "Discover, share, install community-built AEGIS skills"
profile: full
triggers:
  en: ["skill marketplace", "find skill", "install skill", "share skill", "browse skills"]
  th: ["ตลาด skill", "หา skill", "ติดตั้ง skill", "แชร์ skill"]
---

## Quick Reference
Community marketplace for discovering, sharing, and installing AEGIS skills.
- **Browse**: Search available skills by category, rating, popularity
- **Install**: Download and configure community skills into local `skills/`
- **Share**: Package and publish custom skills to the registry
- **Rate**: Review and rate installed skills
- **Output**: Installed skills in `skills/`, registry in `_aegis-brain/`
- **Agent**: Captain America (opus) — curation; Echo (sonnet) — documentation

## Full Instructions

### Invocation

```
/skill-marketplace [browse|search|install|share|rate]
```
- `browse` — Browse skill categories (default)
- `search "<query>"` — Search skills by keyword
- `install <skill-name>` — Install a community skill
- `share <skill-file>` — Package and share a custom skill
- `rate <skill-name> <1-5>` — Rate an installed skill

### Skill Categories

| Category | Description | Examples |
|----------|-------------|---------|
| `development` | Coding, building, tooling | code-gen, scaffolding, migration |
| `quality` | Testing, review, standards | custom linters, mutation testing |
| `security` | Security tools and checks | pen-test, compliance check |
| `devops` | CI/CD, infrastructure | deploy, monitor, scale |
| `documentation` | Docs generation and management | diagram-gen, changelog |
| `analytics` | Data analysis, reporting | metrics, KPI tracking |
| `integration` | External service connectors | Slack, Jira, GitHub, Linear |
| `workflow` | Process and workflow tools | approval flows, notifications |

### Browse Skills

```markdown
## Available Skills

### Development
| Name | Description | Rating | Installs | Author |
|------|-------------|--------|----------|--------|
| <name> | <description> | ⭐ <n>/5 | <count> | <author> |

### Quality
| Name | Description | Rating | Installs | Author |
|------|-------------|--------|----------|--------|
| <name> | <description> | ⭐ <n>/5 | <count> | <author> |

...
```

### Install Protocol

1. **Validate** — Check skill format matches AEGIS skill schema:
   - Has frontmatter (name, description, profile, triggers)
   - Has Quick Reference section
   - Has Full Instructions section
   - No malicious commands or file operations outside project
2. **Download** — Fetch skill file from registry
3. **Configure** — Set up any required configuration:
   ```markdown
   ## Configuration Required
   | Setting | Description | Default |
   |---------|-------------|---------|
   | <setting> | <what it does> | <default value> |
   ```
4. **Install** — Copy to `skills/` directory
5. **Verify** — Test that skill loads correctly
6. **Register** — Add to local skill inventory

### Skill Package Format

Community skills must follow this structure:

```markdown
---
name: <unique-name>
description: "<≤50 token description>"
profile: minimal|standard|full
triggers:
  en: [<english triggers>]
  th: [<thai triggers>]
author: "<author name>"
version: "1.0.0"
requires: [<dependency skills>]
tags: [<category tags>]
---

## Quick Reference
<max 20 lines>

## Full Instructions
<detailed instructions>

## Configuration
<optional: settings needed>

## Changelog
### 1.0.0
- Initial release
```

### Share Protocol

1. **Validate** — Ensure skill meets quality criteria:
   - [ ] Follows AEGIS skill format
   - [ ] Has complete documentation
   - [ ] No hardcoded paths or credentials
   - [ ] Tested locally
   - [ ] Clear trigger phrases
2. **Package** — Generate skill metadata:
   ```json
   {
     "name": "<skill-name>",
     "version": "1.0.0",
     "description": "<description>",
     "author": "<author>",
     "tags": ["<category>"],
     "file": "<skill-file.md>"
   }
   ```
3. **Review** — Automated quality check
4. **Publish** — Submit to community registry

### Rating System

| Stars | Meaning |
|-------|---------|
| ⭐⭐⭐⭐⭐ | Excellent — works perfectly, well documented |
| ⭐⭐⭐⭐ | Good — works well, minor improvements possible |
| ⭐⭐⭐ | Average — works but has limitations |
| ⭐⭐ | Below average — needs significant improvement |
| ⭐ | Poor — doesn't work as described |

### Review Template

```markdown
## Review: <skill-name>
**Rating**: ⭐⭐⭐⭐ (4/5)
**Reviewer**: <name>
**Date**: YYYY-MM-DD

### What works well
- <positive point>

### What could improve
- <improvement suggestion>

### Use case
<how you used this skill>
```

### Local Skill Inventory

Maintained in `_aegis-brain/resonance/skill-inventory.md`:

```markdown
# Installed Skills

## Built-in (21)
<list of default AEGIS skills>

## Community Installed
| Name | Version | Installed | Rating | Status |
|------|---------|-----------|--------|--------|
| <name> | <ver> | <date> | ⭐<n> | Active/Disabled |
```

### Output

- Installed skills: `skills/<skill-name>.md`
- Inventory: `_aegis-brain/resonance/skill-inventory.md`
