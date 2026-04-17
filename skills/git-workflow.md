---
name: git-workflow
description: "Git strategy: branching, PR templates, commit conventions, changelog"
profile: minimal
triggers:
  en: ["git workflow", "create PR", "commit", "branch", "changelog"]
  th: ["git workflow", "สร้าง PR", "สร้าง branch", "changelog"]
---

## Quick Reference
Git workflow management: branching strategy, conventional commits, PR templates, changelog.
- **Branches**: `feature/`, `bugfix/`, `hotfix/`, `release/`, `chore/`
- **Commits**: Conventional Commits format (`type(scope): message`)
- **PR**: Auto-generate PR description from commits
- **Changelog**: Auto-generate from conventional commits
- **Protection**: Main/develop branches are protected

## Full Instructions

### Branch Naming Convention

```
<type>/<ticket-id>-<short-description>
```

| Type | Purpose | Base Branch | Merge Target |
|------|---------|-------------|-------------|
| `feature/` | New functionality | `develop` | `develop` |
| `bugfix/` | Bug fixes | `develop` | `develop` |
| `hotfix/` | Production emergency fixes | `main` | `main` + `develop` |
| `release/` | Release preparation | `develop` | `main` + `develop` |
| `chore/` | Maintenance, deps, CI | `develop` | `develop` |

**Examples:**
```
feature/PROJ-123-user-authentication
bugfix/PROJ-456-fix-login-redirect
hotfix/PROJ-789-patch-sql-injection
release/v2.1.0
chore/update-dependencies
```

### Conventional Commits

Format:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring, no behavior change |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Build, CI, deps, tooling |
| `revert` | Reverting a previous commit |

**Breaking Changes:**
```
feat(api)!: remove deprecated /users/v1 endpoint

BREAKING CHANGE: The /users/v1 endpoint has been removed.
Use /users/v2 instead.
```

**Examples:**
```
feat(auth): add OAuth2 Google sign-in
fix(api): handle null response from payment gateway
docs(readme): update installation instructions
refactor(user-service): extract validation logic
perf(query): add index for user lookup by email
test(auth): add integration tests for token refresh
chore(deps): upgrade express to v5.0
```

### PR Template Generation

When creating a PR, auto-generate from commit history:

```markdown
## Summary
<!-- Auto-generated from commits -->
<bulleted list of changes from commits>

## Type of Change
- [ ] New feature (feat)
- [ ] Bug fix (fix)
- [ ] Breaking change
- [ ] Refactoring
- [ ] Documentation
- [ ] Other: ___

## Related Issues
<!-- Auto-linked from commit footers -->
Closes #<issue>

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project coding standards
- [ ] Self-reviewed
- [ ] Documentation updated (if applicable)
- [ ] No new warnings introduced
- [ ] Dependencies updated in lock file
```

### PR Creation Steps

1. Ensure all changes are committed with conventional commits
2. Push branch to remote: `git push -u origin <branch>`
3. Generate PR description from commit log:
   ```
   git log develop..HEAD --pretty=format:"- %s"
   ```
4. Create PR using `gh pr create` with generated template
5. Add reviewers if configured
6. Link related issues

### Changelog Auto-Generation

Generate changelog from conventional commits between tags:

```markdown
# Changelog

## [v2.1.0] - YYYY-MM-DD

### Features
- **auth**: Add OAuth2 Google sign-in (#123)
- **dashboard**: Add real-time notifications (#145)

### Bug Fixes
- **api**: Handle null response from payment gateway (#167)
- **ui**: Fix mobile responsive layout (#172)

### Performance
- **query**: Add index for user lookup by email (#180)

### Breaking Changes
- **api**: Remove deprecated /users/v1 endpoint (#190)
```

**Generation Steps:**
1. Get commits since last tag: `git log <last-tag>..HEAD`
2. Parse conventional commit format
3. Group by type
4. Include PR/issue references
5. Write to `CHANGELOG.md`

### Git Hooks (Recommended)

| Hook | Purpose |
|------|---------|
| `pre-commit` | Lint staged files, run formatters |
| `commit-msg` | Validate conventional commit format |
| `pre-push` | Run tests before push |

### Merge Strategy

- **feature → develop**: Squash merge (clean history)
- **develop → main**: Merge commit (preserve history)
- **hotfix → main**: Merge commit (preserve for audit)
- **Always** delete branch after merge
