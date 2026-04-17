---
name: course-correction
description: "Mid-sprint scope change: assess impact, re-plan, adjust"
profile: full
triggers:
  en: ["course correction", "scope change", "re-plan", "change plan", "pivot"]
  th: ["เปลี่ยนแผน", "course correction", "ปรับแผน", "เปลี่ยนสโคป"]
---

## Quick Reference
Manages mid-sprint or mid-project scope changes with impact analysis.
- **Assess**: Quantify impact of proposed change on timeline and resources
- **Re-plan**: Adjust sprint/project plan to accommodate change
- **Communicate**: Generate stakeholder communication
- **Risk**: Update risk register with new risks from change
- **Output**: `_aegis-output/course-corrections/`
- **Agent**: Captain America (opus) — assessment; Iron Man (opus) — re-planning

## Full Instructions

### Invocation

```
/course-correction "<description of change>"
```

### Phase 1: Change Request Capture

```markdown
# Course Correction Request
**Date**: YYYY-MM-DD
**Requested By**: <who>
**Sprint/Phase**: <current sprint or phase>

## Change Description
<detailed description of what is changing>

## Reason for Change
- [ ] New requirement from stakeholder
- [ ] Technical discovery (unforeseen complexity)
- [ ] External dependency change
- [ ] Priority shift
- [ ] Bug/incident response
- [ ] Market/competitive pressure
- [ ] Other: ___

## Urgency
- [ ] 🔴 Immediate — blocks current work
- [ ] 🟡 This sprint — must accommodate before sprint end
- [ ] 🔵 Next sprint — can plan for upcoming sprint
```

### Phase 2: Impact Assessment

Analyze the ripple effects of the change:

```markdown
## Impact Assessment

### Scope Impact
| Area | Current Plan | After Change | Delta |
|------|-------------|-------------|-------|
| Stories in sprint | <n> | <n> | <+/-> |
| Story points | <n> | <n> | <+/-> |
| Features affected | <list> | <list> | <added/removed> |

### Timeline Impact
| Milestone | Original Date | New Date | Delay |
|-----------|--------------|----------|-------|
| <milestone> | <date> | <date> | <days> |

### Resource Impact
| Resource | Current Allocation | New Allocation | Delta |
|----------|-------------------|---------------|-------|
| <agent/person> | <task> | <new task> | <change> |

### Technical Impact
- Dependencies affected: <list>
- Architecture changes needed: <yes/no — describe>
- Testing impact: <additional tests needed>
- Technical debt introduced: <description>

### Risk Impact
| New Risk | Probability | Impact | Mitigation |
|----------|------------|--------|------------|
| <risk> | High/Med/Low | High/Med/Low | <strategy> |
```

### Phase 3: Options Analysis

Present options for accommodating the change:

```markdown
## Options

### Option A: Absorb (No Timeline Change)
- **Approach**: Drop lowest-priority stories to make room
- **What drops**: <stories to defer>
- **Points freed**: <n>
- **Risk**: <what we lose>
- **Recommendation**: ✅/❌

### Option B: Extend (Timeline Change)
- **Approach**: Extend sprint/phase by <N> days
- **New end date**: <date>
- **Impact on next sprint**: <description>
- **Risk**: <cascade effects>
- **Recommendation**: ✅/❌

### Option C: Add Capacity
- **Approach**: Bring in additional agents/resources
- **Cost**: <additional cost>
- **Coordination overhead**: <description>
- **Risk**: <ramp-up time, quality risk>
- **Recommendation**: ✅/❌

### Option D: Defer Change
- **Approach**: Push change to next sprint/phase
- **Risk**: <consequences of delay>
- **When revisit**: <date>
- **Recommendation**: ✅/❌

### Recommended Option: <A/B/C/D>
**Rationale**: <why this option is best>
```

### Phase 4: Re-Plan

After option is selected, generate updated plan:

```markdown
## Updated Sprint Plan

### Removed/Deferred Stories
| Story | Points | Reason | New Target |
|-------|--------|--------|------------|
| <story> | <pts> | Deferred for scope change | Sprint <N+1> |

### Added Stories
| Story | Points | Priority | Assignee |
|-------|--------|----------|----------|
| <new story> | <pts> | <priority> | <agent> |

### Updated Timeline
<gantt-style text representation of new timeline>

### Updated Burndown
- Previous trajectory: <points/day>
- New trajectory: <points/day>
- Sprint goal still achievable: ✅/⚠️/❌
```

### Phase 5: Stakeholder Communication

Generate communication for affected parties:

```markdown
## Stakeholder Update

### Subject: Sprint <N> Course Correction — <brief description>

**Summary**: <1-2 sentences describing the change and chosen approach>

**What changed**: <bullet points>

**Impact**:
- Timeline: <impact>
- Scope: <what was added/removed>
- Cost: <if applicable>

**Decision**: <chosen option with brief rationale>

**Action needed from you**: <if any>

**Next update**: <date>
```

### Phase 6: Risk Register Update

Append new risks to project risk tracking:

```markdown
## Risk Register Update

### New Risks
| Risk | Source | Probability | Impact | Mitigation | Owner |
|------|--------|------------|--------|------------|-------|
| <risk> | Course correction | <level> | <level> | <plan> | <owner> |

### Risks Mitigated
| Risk | Status | Notes |
|------|--------|-------|
| <risk> | Mitigated by scope change | <details> |
```

### Output

```
_aegis-output/course-corrections/
  YYYY-MM-DD_correction.md

_aegis-brain/learnings/
  course-correction-YYYY-MM-DD.md  (for retrospective)
```
