# Roadmap: Schedule Teacher v1 Polish Release

**Created:** 2026-06-29
**Project Mode:** mvp

## Overview

This reset roadmap turns the existing broad MVP into a polished teacher/student release. It keeps the work calendar-first, data-first, and teacher/student-first: audit current failures, refresh the shared UI foundation, fix teacher flows, fix student flows, then verify release readiness.

## Phases

### Phase 1: Audit & Bug Ledger Reset
**Goal:** Reproduce teacher/student data-display and navigation failures, classify root causes, and produce a trustworthy bug ledger before UI changes begin.
**Mode:** mvp
**Requirements:** AUDIT-01, AUDIT-02, AUDIT-03
**Status:** Planned
**Cross-cutting constraints:**
- Use seeded or existing data when available; document environment blockers separately from product bugs.
- Classify API, composable, store, role-scope, pagination, auth/session, and component-rendering failures separately.
- Keep center workflows out of v1 unless they block teacher/student stability.
**Success Criteria:**
1. Teacher and student core routes have audit entries with expected data, actual UI behavior, and evidence.
2. Confirmed bugs are grouped by severity and suspected source layer.
3. Bug ledger identifies which phase should fix each issue.
4. Phase 2+ work has enough evidence to avoid redesigning over unknown data bugs.

### Phase 2: Shared Visual System & App Shell
**Goal:** Establish the original education SaaS visual foundation and apply it to the shared shell, navigation, and reusable UI states.
**Mode:** mvp
**Requirements:** UI-01, UI-02, UI-03, UI-04
**Status:** Pending
**Cross-cutting constraints:**
- Use PREP only as broad inspiration; do not copy assets, brand, or exact layouts.
- Preserve existing route/auth behavior while refreshing layout and navigation.
- Keep teacher calendar access prominent and student navigation simple.
**Success Criteria:**
1. Shared layout, sidebar/topnav, cards, tables, forms, dialogs, empty states, loading states, error states, and success states share one visual language.
2. Teacher/student navigation is role-aware and does not foreground center workflows.
3. Teacher calendar workflow remains a first-class navigation target.
4. Refreshed shell can be adopted by existing pages without route or auth regressions.

### Phase 3: Teacher Workflow Data & UI Polish
**Goal:** Make teacher daily workflows polished and reliable across dashboard, calendar, classes, students, assistants, documents, payments, reports, audit, and profile.
**Mode:** mvp
**Requirements:** TEACH-01, TEACH-02, TEACH-03, TEACH-04, TEACH-05
**Status:** Pending
**Cross-cutting constraints:**
- Preserve tenant isolation with `teacherId`/`tenantId` filters on teacher-owned data.
- Pages should call feature composables rather than raw APIs.
- Calendar create/edit/drag/resize/recurrence behavior must remain usable during visual work.
**Success Criteria:**
1. Teacher dashboard and calendar display live data correctly.
2. Teacher list/detail pages show existing data and clear empty/loading/error states.
3. Document upload/link/share/download flows are visible and verified for teacher-owned materials.
4. Teacher payment/report/profile pages no longer show misleading empty states when API data exists.

### Phase 4: Student Portal Data & UI Polish
**Goal:** Make the student experience usable and trustworthy for classes, schedule, documents, scores/comments, payments, and profile.
**Mode:** mvp
**Requirements:** STUD-01, STUD-02, STUD-03, STUD-04, STUD-05
**Status:** Pending
**Cross-cutting constraints:**
- Student pages must use student-appropriate API paths and role-scoped data assumptions.
- Empty states must distinguish no data from loading, error, and permission states.
- Student views should not expose teacher-only controls or tenant-owned admin actions.
**Success Criteria:**
1. Student dashboard summarizes the student's own classes, schedule, documents, scores/comments, and payments.
2. Student schedule/classes pages display existing role-scoped data correctly.
3. Student document and score/comment states are understandable and not silently empty.
4. Student payment status/history and profile/session flows are verified after refresh.

### Phase 5: Responsive QA, Regression Tests & Release Readiness
**Goal:** Prove the refreshed v1 is stable enough for real teacher/student validation.
**Mode:** mvp
**Requirements:** UI-05, VER-01, VER-02, VER-03, VER-04, VER-05
**Status:** Pending
**Cross-cutting constraints:**
- Use existing scripts: frontend lint/typecheck/build; backend lint/build/tests.
- Add focused backend tests for changed bug-prone logic where practical.
- Document manual checks where no frontend test harness exists.
**Success Criteria:**
1. Frontend lint, typecheck, and build pass.
2. Backend lint, build, and Jest tests pass.
3. Fixed bugs have regression tests where practical or documented manual checks where automation is not available.
4. Teacher and student smoke flows pass on desktop and mobile-width viewports.
5. Known remaining issues are documented with severity and next action.

## Requirement Coverage

| Requirement | Phase |
|-------------|-------|
| AUDIT-01 | Phase 1 |
| AUDIT-02 | Phase 1 |
| AUDIT-03 | Phase 1 |
| UI-01 | Phase 2 |
| UI-02 | Phase 2 |
| UI-03 | Phase 2 |
| UI-04 | Phase 2 |
| UI-05 | Phase 5 |
| TEACH-01 | Phase 3 |
| TEACH-02 | Phase 3 |
| TEACH-03 | Phase 3 |
| TEACH-04 | Phase 3 |
| TEACH-05 | Phase 3 |
| STUD-01 | Phase 4 |
| STUD-02 | Phase 4 |
| STUD-03 | Phase 4 |
| STUD-04 | Phase 4 |
| STUD-05 | Phase 4 |
| VER-01 | Phase 5 |
| VER-02 | Phase 5 |
| VER-03 | Phase 5 |
| VER-04 | Phase 5 |
| VER-05 | Phase 5 |

## Notes

- Start with Phase 1. Do not redesign before the current data-display failure modes are understood.
- Keep center role out of v1 planning unless the user explicitly changes priority.
- Use `.planning/codebase/` maps as mandatory context before phase planning.
- Old phase plan artifacts from the previous v1 plan were archived under `.planning/archive/phase-reset-2026-06-29-v1/`.

---
*Roadmap created: 2026-06-29 after v1 replan/reset*
