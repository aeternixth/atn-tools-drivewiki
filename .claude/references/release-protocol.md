# Release Protocol -- Version Management

## Versioning Strategy
MAJOR.MINOR.PATCH (semver)
- MAJOR: breaking changes
- MINOR: new features (backward compatible)
- PATCH: bug fixes

## Release Checklist (pre /aegis-deploy)
1. All sprint tasks DONE
2. All 3 gates passed
3. CHANGELOG.md updated
4. Version bumped in package.json / pyproject.toml
5. ADRs reviewed (no PROPOSED left)
6. Tech debt items logged (not blocking)
7. ISO docs current
8. Rollback plan documented

## Release Types
| Type | Branch | Gates | Approval |
|------|--------|-------|----------|
| Hotfix | hotfix/xxx | G1 only (speed) | Thor auto |
| Patch | main | G1+G2 | War Machine auto |
| Minor | main | G1+G2+G3 | Full pipeline |
| Major | main | G1+G2+G3+manual | Human required |

## CHANGELOG Format (Keep a Changelog)
```markdown
## [X.Y.Z] - YYYY-MM-DD
### Added (new features)
### Changed (changes in existing features)
### Fixed (bug fixes)
### Security (vulnerability fixes)
### Deprecated (soon-to-be-removed)
### Removed (removed features)
```

Auto-generated from:
- Task meta.json (title, type)
- Gate results (what was fixed during review)
- Sprint goal

## Rollback Protocol
If Gate 4 or Gate 5 fails:
1. Thor auto-rollback to previous version
2. PM.03 Correction Register created
3. Hotfix task auto-created in backlog (CRITICAL priority)
4. Spider-Man assigned immediately
5. Hotfix follows abbreviated pipeline (G1 only)
