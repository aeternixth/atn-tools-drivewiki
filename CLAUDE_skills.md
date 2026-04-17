# AEGIS Skills Catalog v8.2

## Profiles
| Profile | Skills | Context |
|---------|:------:|:-------:|
| minimal | 7 | ~3K tokens |
| standard | 15 | ~6K tokens |
| full | 29 | ~12K tokens |

## Skills List
| # | Skill | Profile | Triggers |
|:-:|-------|---------|----------|
| 1 | personas | minimal | persona, agent, spawn, team |
| 2 | orchestrator | minimal | orchestrate, pipeline, coordinate, plan |
| 3 | code-review | minimal | review, PR review, check code |
| 4 | code-standards | minimal | standards, lint, style, format |
| 5 | git-workflow | minimal | git, branch, commit, PR, merge |
| 6 | bug-lifecycle | minimal | bug, fix, debug, error, crash |
| 7 | project-navigator | minimal | navigate, find, explore, structure |
| 8 | super-spec | standard | spec, specification, requirements |
| 9 | test-architect | standard | test, coverage, test plan, QA |
| 10 | security-audit | standard | security, audit, vulnerability, OWASP |
| 11 | tech-debt-tracker | standard | tech debt, refactor, cleanup, TODO |
| 12 | sprint-manager | standard | sprint, scrum, ceremony, standup, velocity |
| 13 | kanban-board | standard | kanban, board, task status, WIP |
| 14 | work-breakdown | standard | breakdown, user story, epic, decompose |
| 15 | api-docs | standard | API, docs, swagger, OpenAPI |
| 16 | aegis-distill | full | distill, compress, summarize context |
| 17 | aegis-observe | full | observe, monitor, health, metrics |
| 18 | adversarial-review | full | adversarial, red team, devil's advocate |
| 19 | code-coverage | full | coverage, untested, coverage report |
| 20 | retrospective | full | retro, retrospective, lessons |
| 21 | course-correction | full | drift, off track, correction, realign |
| 22 | skill-marketplace | full | marketplace, install skill, community |
| 23 | aegis-builder | full | build skill, create skill, meta |
| 24 | qa-pipeline | full | QA, quality assurance, test pipeline |
| 25 | iso-29110-docs | full | ISO, 29110, compliance, audit docs |
| 26 | sprint-tracker | full | sprint tracker legacy (superseded by #12) |
| 27 | aegis-deploy | full | deploy, release, rollback, health check |
| 28 | aegis-adr | full | ADR, architecture decision, decision record |
| 29 | aegis-dashboard | full | dashboard, status, overview, metrics |

## Profile Switching
```
/aegis-mode minimal    # 7 core skills
/aegis-mode standard   # 15 skills (default)
/aegis-mode full       # All 29 skills
/aegis-mode custom personas,code-review,security-audit
```

Full skill details: `skills/<name>.md`
