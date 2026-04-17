---
name: code-standards
description: "Enforce coding standards for TypeScript, Python, React, and Node.js"
profile: minimal
triggers:
  en: ["coding standards", "code style", "lint", "naming conventions"]
  th: ["มาตรฐานโค้ด", "coding standards", "รูปแบบโค้ด"]
---

## Quick Reference
Enforces project-specific coding standards across supported stacks.
- **Stacks**: TypeScript, Python, React, Node.js
- **Covers**: Linting rules, naming conventions, file structure, import ordering
- **Auto-detect**: Reads project config (tsconfig, .eslintrc, pyproject.toml)
- **Output**: Standards violations report or auto-fix suggestions
- Applied during code review (Pass 4) and code generation

## Full Instructions

### Invocation

```
/code-standards [check|fix|show] [--stack <ts|py|react|node>] [target]
```
- `check` — Analyze code for violations (default)
- `fix` — Suggest auto-fixes for violations
- `show` — Display current standards for the project

### TypeScript Standards

#### Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Variables | camelCase | `userData`, `isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Functions | camelCase | `getUserById`, `validateInput` |
| Classes | PascalCase | `UserService`, `HttpClient` |
| Interfaces | PascalCase (no I prefix) | `UserProfile`, `ApiResponse` |
| Types | PascalCase | `RequestParams`, `AuthState` |
| Enums | PascalCase (members UPPER_SNAKE) | `enum Status { ACTIVE, INACTIVE }` |
| Files | kebab-case | `user-service.ts`, `auth-middleware.ts` |
| Test files | kebab-case.test | `user-service.test.ts` |

#### Linting Rules
- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` type (use `unknown` + type guards)
- Explicit return types on exported functions
- No unused variables or imports
- Prefer `const` over `let`; never `var`
- Use optional chaining (`?.`) over nested conditionals
- Prefer nullish coalescing (`??`) over logical OR for defaults

#### File Structure
```
src/
  modules/
    <module-name>/
      <module-name>.controller.ts
      <module-name>.service.ts
      <module-name>.repository.ts
      <module-name>.types.ts
      <module-name>.test.ts
      index.ts  (barrel export)
  shared/
    utils/
    types/
    constants/
  config/
  main.ts
```

#### Import Ordering
```typescript
// 1. Node built-ins
import path from 'path';

// 2. External packages
import express from 'express';
import { z } from 'zod';

// 3. Internal modules (absolute paths)
import { UserService } from '@/modules/user/user.service';

// 4. Relative imports
import { validateInput } from './helpers';

// 5. Type imports
import type { UserProfile } from './types';
```

### Python Standards

#### Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Variables | snake_case | `user_data`, `is_active` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Functions | snake_case | `get_user_by_id`, `validate_input` |
| Classes | PascalCase | `UserService`, `HttpClient` |
| Modules | snake_case | `user_service.py`, `auth_middleware.py` |
| Private | _leading_underscore | `_internal_method`, `_cache` |

#### Linting Rules
- PEP 8 compliance (via ruff or flake8)
- Type hints on all function signatures
- Docstrings on all public functions (Google style)
- Max line length: 88 (Black default)
- No mutable default arguments
- Use `pathlib.Path` over `os.path`
- f-strings over `.format()` or `%`

#### File Structure
```
src/
  <package>/
    __init__.py
    models.py
    services.py
    repositories.py
    schemas.py
    routes.py
  core/
    config.py
    dependencies.py
    exceptions.py
  main.py
tests/
  <package>/
    test_services.py
    test_routes.py
  conftest.py
```

#### Import Ordering
```python
# 1. Standard library
import os
from pathlib import Path

# 2. Third-party packages
from fastapi import FastAPI
from pydantic import BaseModel

# 3. Local imports
from src.core.config import settings
from src.users.services import UserService
```

### React Standards

#### Component Conventions
- Functional components only (no class components)
- PascalCase for component names and files: `UserProfile.tsx`
- Custom hooks: `use` prefix: `useAuth.ts`
- Props interface: `<ComponentName>Props`
- One component per file (small helpers excepted)
- Prefer composition over prop drilling

#### File Structure
```
src/
  components/
    ui/           # Reusable UI primitives
    layout/       # Layout components
    features/     # Feature-specific components
  hooks/          # Custom hooks
  pages/          # Route pages
  services/       # API services
  stores/         # State management
  types/          # Shared types
  utils/          # Utility functions
```

#### Patterns
- State: prefer React Query for server state, Zustand/Context for client state
- Forms: controlled components with validation library (Zod + React Hook Form)
- Error boundaries around major sections
- Lazy loading for route-level code splitting
- Memoize expensive computations (`useMemo`, `React.memo`)

### Node.js Standards

#### Project Structure
```
src/
  routes/         # Express/Fastify route handlers
  middleware/     # Request middleware
  services/       # Business logic
  repositories/   # Data access
  models/         # Data models/schemas
  utils/          # Shared utilities
  config/         # Configuration
  types/          # TypeScript types
  index.ts        # Entry point
```

#### Conventions
- Use environment variables for all configuration
- Structured JSON logging (pino/winston)
- Centralized error handling middleware
- Input validation at route level (Zod/Joi)
- Health check endpoint: `GET /health`
- Graceful shutdown handling
- Request ID tracking via middleware

### Applying Standards

When generating code (Spider-Man persona):
1. Detect project stack from config files
2. Load applicable standards from this skill
3. Apply naming conventions and file structure
4. Order imports per convention
5. Add type annotations and documentation

When reviewing code (Black Panther persona):
1. Check each standard category
2. Flag violations with severity:
   - 🔴 Critical: Type safety, security patterns
   - 🟡 Warning: Naming, structure, missing types
   - 🔵 Suggestion: Style preferences, minor improvements
