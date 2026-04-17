---
name: project-navigator
description: "Intelligent project guide: scan state, detect complexity, recommend actions"
profile: minimal
triggers:
  en: ["navigate project", "project guide", "what should I do", "recommend"]
  th: ["นำทาง project", "แนะนำ", "ทำอะไรดี", "สแกน project"]
---

## Quick Reference
Scans project state, detects tech stack, and recommends next actions.
- **Scan**: Analyze project structure, dependencies, config files
- **Detect**: Identify tech stack, frameworks, patterns in use
- **Assess**: Evaluate project maturity and complexity
- **Recommend**: Suggest next AEGIS skills to invoke based on state
- **Chain**: Automatically queue recommended skill invocations
- First skill to run on `/aegis-start` for new projects

## Full Instructions

### Invocation

```
/project-navigator [scan|recommend|chain]
```
- `scan` — Full project analysis (default)
- `recommend` — Skip scan, recommend based on cached state
- `chain` — Recommend AND auto-invoke first recommendation

### Phase 1: Project Scan

Systematically analyze the project:

#### 1.1 Structure Analysis
```
Scan for:
- Root files: package.json, pyproject.toml, go.mod, Cargo.toml, pom.xml
- Config files: tsconfig.json, .eslintrc, .prettierrc, Dockerfile, docker-compose.yml
- CI/CD: .github/workflows/, .gitlab-ci.yml, Jenkinsfile
- Documentation: README.md, docs/, CHANGELOG.md
- Test directories: __tests__/, tests/, spec/, test/
- Source layout: src/, lib/, app/, cmd/
```

#### 1.2 Tech Stack Detection

| Indicator | Stack |
|-----------|-------|
| `package.json` + `tsconfig.json` | TypeScript/Node.js |
| `package.json` + `next.config.*` | Next.js |
| `package.json` + `vite.config.*` | Vite + React/Vue |
| `pyproject.toml` or `requirements.txt` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `pom.xml` or `build.gradle` | Java/Kotlin |
| `Dockerfile` | Containerized |
| `terraform/` or `*.tf` | Infrastructure as Code |

#### 1.3 Framework Detection

| Indicator | Framework |
|-----------|-----------|
| `react`, `react-dom` in deps | React |
| `@angular/core` in deps | Angular |
| `vue` in deps | Vue.js |
| `fastapi` in deps | FastAPI |
| `django` in deps | Django |
| `express` in deps | Express.js |
| `nestjs` in deps | NestJS |

#### 1.4 Project Maturity Assessment

| Signal | Maturity Level |
|--------|----------------|
| No tests, no CI, no docs | 🔴 Early/Prototype |
| Some tests, basic CI | 🟡 Developing |
| Good coverage, CI/CD, docs | 🟢 Mature |
| Monitoring, IaC, full pipeline | 🔵 Production-grade |

### Phase 2: State Assessment

Evaluate current project state:

```markdown
## Project Assessment

### Identity
- **Name**: <from package.json/pyproject.toml>
- **Stack**: <detected stack>
- **Framework**: <detected framework>
- **Maturity**: <level>

### Health Indicators
| Area | Status | Notes |
|------|--------|-------|
| Tests | ✅/⚠️/❌ | <coverage %, framework> |
| CI/CD | ✅/⚠️/❌ | <pipeline present?> |
| Docs | ✅/⚠️/❌ | <README, API docs> |
| Linting | ✅/⚠️/❌ | <config present?> |
| Types | ✅/⚠️/❌ | <strict mode?> |
| Security | ✅/⚠️/❌ | <audit results> |
| Dependencies | ✅/⚠️/❌ | <outdated count> |

### Complexity Score
- Files: <count>
- Lines of code: <estimate>
- Dependencies: <count>
- Complexity: Low / Medium / High / Very High
```

### Phase 3: Recommendations

Based on assessment, recommend AEGIS skills:

#### Priority Matrix

| Condition | Recommended Skill | Priority |
|-----------|------------------|----------|
| No spec/docs | `super-spec` | High |
| No tests | `test-architect` | High |
| Security not audited | `security-audit` | High |
| No coding standards | `code-standards` | Medium |
| No git workflow | `git-workflow` | Medium |
| High complexity | `code-review` | Medium |
| Outdated deps | `tech-debt-tracker` | Medium |
| No API docs | `api-docs` | Low |
| Existing codebase | `code-review` | Low |

#### Recommendation Format

```markdown
## Recommended Next Steps

### 1. [HIGH] Run /security-audit
**Why**: No security scan detected. OWASP Top 10 check recommended.
**Command**: `/security-audit src/`

### 2. [HIGH] Run /test-architect
**Why**: Test coverage appears low (<30%). Need test strategy.
**Command**: `/test-architect`

### 3. [MEDIUM] Run /code-standards
**Why**: No linting config detected. Set up project standards.
**Command**: `/code-standards show --stack ts`
```

### Phase 4: Skill Chaining

When using `chain` mode, automatically invoke the highest-priority recommendation:

1. Complete scan and assessment
2. Determine highest-priority recommendation
3. Confirm with user: "Recommended: `/security-audit`. Proceed? [Y/n]"
4. If confirmed, invoke the skill directly
5. After skill completes, offer next recommendation

### Output

Save scan results to `_aegis-brain/resonance/project-identity.md`:
- Update project name, stack, conventions
- This becomes the persistent project context for all agents
