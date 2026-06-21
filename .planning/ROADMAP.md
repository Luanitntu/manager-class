# Roadmap: Schedule Teacher v1 Polish Release

**Created:** 2026-06-21
**Project Mode:** mvp

## Overview

This roadmap turns the existing broad MVP into a polished teacher/student release. It prioritizes bug discovery, UI consistency, data-display reliability, and final verification over new feature expansion.

## Phases

### Phase 1: Audit & Data Flow Baseline
**Goal:** Reproduce current data-display bugs and identify the exact API/composable/page causes before redesign work hides them.
**Mode:** mvp
**Requirements:** DATA-06, BUG-01, BUG-02
**Status:** Complete - 2026-06-21
**Plans:**
- **Wave 1:** `01-01-PLAN.md` - Establish audit setup and route/API/composable matrix. **Complete**
- **Wave 2** *(blocked on Wave 1 completion)*: `01-02-PLAN.md` - Audit teacher-facing data display and navigation flows. **Complete**
- **Wave 2** *(blocked on Wave 1 completion)*: `01-03-PLAN.md` - Audit student-facing and auth/session data flows. **Complete**
- **Wave 3** *(blocked on Wave 2 completion)*: `01-04-PLAN.md` - Consolidate findings into bug ledger and audit summary. **Complete**
**Cross-cutting constraints:**
- Audit findings must stay focused on teacher/student flows; center role remains deferred.
- Evidence must distinguish runtime reproduction, static mismatch, not reproducible, and environment blockers.
- API envelope, pagination, auth/session, role scope, and component rendering must be classified separately.
**Success Criteria:**
1. Teacher and student core routes are audited with seeded or existing data.
2. Each page with missing UI data has a reproduction note and suspected source layer: API, composable, store, role scope, pagination, or component rendering.
3. Auth/session navigation blockers are identified and prioritized.
4. A short bug ledger exists for execution phases to close.

### Phase 2: Visual System & App Shell Refresh
**Goal:** Establish an original PREP-inspired education SaaS UI foundation and apply it to the shared app shell.
**Mode:** mvp
**Requirements:** UI-01, UI-03, UI-05
**Success Criteria:**
1. Shared layout, sidebar/topnav, cards, tables, forms, dialogs, empty states, loading states, and error states share one visual language.
2. Teacher/student navigation is clear and does not introduce center-role scope.
3. The UI direction feels clean, modern, education-friendly, and distinct from PREP branding.
4. Existing pages can adopt the refreshed shell without route or auth regressions.

### Phase 3: Teacher Workflow Polish & Fixes
**Goal:** Make teacher daily workflows polished and reliable across dashboard, calendar, classes, students, documents, payments, reports, and profile.
**Mode:** mvp
**Requirements:** UI-04, DATA-01, DATA-02, DATA-03, BUG-03, BUG-04
**Success Criteria:**
1. Teacher dashboard and calendar display live data correctly.
2. Teacher CRUD/list/detail pages show existing data and clear form states.
3. Document upload/link/share/download flows are verified for teacher-owned materials.
4. Calendar create/edit/drag/resize/recurring flows remain usable after visual refresh.

### Phase 4: Student Portal Polish & Fixes
**Goal:** Make the student experience usable and trustworthy for classes, schedules, documents, scores/comments, payments, and profile.
**Mode:** mvp
**Requirements:** UI-02, DATA-04, DATA-05, BUG-05
**Success Criteria:**
1. Student dashboard summarizes the student's own classes, schedule, materials, scores/comments, and payments.
2. Student-accessible pages use correct role-scoped API data rather than teacher-only assumptions.
3. Empty states distinguish between no data and loading/error/permission states.
4. Payment status and history are understandable from the student view.

### Phase 5: Responsive QA, Regression Tests & Release Readiness
**Goal:** Prove the refreshed v1 is stable enough for real teacher/student validation.
**Mode:** mvp
**Requirements:** UI-06, VER-01, VER-02, VER-03, VER-04, VER-05
**Success Criteria:**
1. Frontend lint, typecheck, and build pass.
2. Backend lint, build, and Jest tests pass.
3. Fixed bugs have regression tests where practical or documented manual checks where automation is not yet available.
4. Teacher and student smoke flows pass on desktop and mobile-width viewports.
5. Known remaining issues are documented with severity and next action.

## Requirement Coverage

| Requirement | Phase |
|-------------|-------|
| UI-01 | Phase 2 |
| UI-02 | Phase 4 |
| UI-03 | Phase 2 |
| UI-04 | Phase 3 |
| UI-05 | Phase 2 |
| UI-06 | Phase 5 |
| DATA-01 | Phase 3 |
| DATA-02 | Phase 3 |
| DATA-03 | Phase 3 |
| DATA-04 | Phase 4 |
| DATA-05 | Phase 4 |
| DATA-06 | Phase 1 |
| BUG-01 | Phase 1 |
| BUG-02 | Phase 1 |
| BUG-03 | Phase 3 |
| BUG-04 | Phase 3 |
| BUG-05 | Phase 4 |
| VER-01 | Phase 5 |
| VER-02 | Phase 5 |
| VER-03 | Phase 5 |
| VER-04 | Phase 5 |
| VER-05 | Phase 5 |

## Notes

- Start with Phase 1. Do not redesign before the current data-display failure modes are understood.
- Keep center role out of v1 planning unless the user explicitly changes priority.
- Use `.planning/codebase/` maps as mandatory context before phase planning.

---
*Roadmap created: 2026-06-21*
