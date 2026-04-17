# Tech Debt Protocol -- Continuous Tracking

## How Tech Debt Enters the System
1. Black Panther finds "suggestion" during review -> auto-logged as debt
2. Loki finds "nice-to-have" during challenge -> auto-logged
3. War Machine finds "non-critical" during QA -> auto-logged
4. Spider-Man adds TODO/FIXME in code -> auto-detected and logged
5. Sprint retro identifies improvement -> auto-logged

## Debt Registry
File: `_aegis-brain/tech-debt/registry.md`

| ID | Source | Severity | Category | Description | Effort | Sprint Found | Sprint Fixed |
|----|--------|----------|----------|-------------|--------|-------------|-------------|
| TD-001 | Black Panther/T-028 | Low | Performance | Add pagination for 1000+ items | 3pts | sprint-2 | - |

Categories: Performance, Security, Maintainability, Testing, Documentation, Architecture

## Auto-Detection
After every Black Panther review (Gate 1):
- Severity=suggestion -> create TD entry
- Severity=warning (non-blocking) -> create TD entry
- Severity=critical -> this is NOT debt, this is a bug (blocks gate)

After every Loki review:
- "nice-to-have" findings -> create TD entry

After every code change:
- Scan for new TODO/FIXME comments -> create TD entry

## Debt Budget
Each sprint allocates 10-20% capacity to tech debt:
- Sprint capacity: 28 pts
- Debt budget: 3-6 pts
- Select highest-severity debt items

## Sprint Integration
During `/aegis-sprint plan`:
1. Read `registry.md`
2. Show top 5 debt items by severity
3. Suggest 1-2 for this sprint (within budget)
4. Auto-create tasks for selected debt items

## Debt Dashboard (in /aegis-dashboard)
- Total debt items: N
- By severity: H/M/L
- Debt age: avg days since found
- Debt resolved this sprint: N
- Trend: growing / stable / shrinking
