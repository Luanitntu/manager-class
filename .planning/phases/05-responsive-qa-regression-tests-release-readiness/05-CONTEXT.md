# Phase 5: Responsive QA, Regression Tests & Release Readiness - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 proves the refreshed teacher/student v1 is stable enough for real validation. It should not add new product modules. The work is QA, regression automation where practical, browser-level responsive smoke, release readiness documentation, and final requirements/status cleanup.

The phase must preserve teacher/student priority and keep center role out of scope. Teacher calendar-first workflow remains the core teacher path. Student dashboard/documents/payments fixes from Phase 4 must be visually checked at desktop and mobile widths.
</domain>

<decisions>
## Implementation Decisions

### Verification Scope
- **D-01:** Use existing repo commands as the primary release gate: backend lint/build/Jest and frontend lint/typecheck/build.
- **D-02:** Because the frontend has no test runner, add lightweight repeatable smoke scripts only where they reduce manual risk without introducing a full new test stack.
- **D-03:** Browser-level responsive smoke is required for teacher and student core routes; API smoke alone is not enough for Phase 5.
- **D-04:** Existing lint warnings should be fixed when low-risk, especially warnings from shared Phase 2 components.

### Smoke Coverage
- **D-05:** Teacher smoke route order: login, dashboard, calendar, classes, students, documents, payments, profile.
- **D-06:** Student smoke route order: login, dashboard, schedule/calendar, classes, documents, scores/comments previews, payments/history, profile.
- **D-07:** Desktop and mobile-width checks should explicitly record overlapping text, broken controls, hidden primary actions, and role-inappropriate controls.
- **D-08:** API smoke should confirm seeded teacher/student data still exists before browser QA so visual failures are not confused with missing data.

### Release Readiness
- **D-09:** Produce one release readiness artifact with passed checks, known issues, severity, and next action.
- **D-10:** Update requirements/project tracking only after verification evidence exists; do not mark Phase 5 complete on static review alone.
- **D-11:** Residual warnings that are not fixed must be recorded with owner/next action rather than hidden.

</decisions>

<canonical_refs>
## Canonical References

### Project Scope
- `.planning/PROJECT.md` - v1 polish scope and teacher/student priorities.
- `.planning/ROADMAP.md` - Phase 5 goal and success criteria.
- `.planning/REQUIREMENTS.md` - UI-06, VER-01, VER-02, VER-03, VER-04, VER-05.
- `.planning/STATE.md` - Current progress and Phase 4 API-smoke status.

### Prior Phase Evidence
- `.planning/phases/04-student-portal-polish-fixes/04-STUDENT-SMOKE.md` - Student API smoke and remaining visual QA.
- `.planning/phases/04-student-portal-polish-fixes/04-01-SUMMARY.md`
- `.planning/phases/04-student-portal-polish-fixes/04-02-SUMMARY.md`
- `.planning/phases/04-student-portal-polish-fixes/04-03-SUMMARY.md`
- `.planning/phases/01-audit-data-flow-baseline/01-BUG-LEDGER.md` - Original bugs to close or document.

### Codebase Map
- `.planning/codebase/TESTING.md` - Existing backend Jest and no frontend test runner.
- `.planning/codebase/CONCERNS.md` - Frontend test gap, tenant isolation risk, stale e2e script risk.
- `.planning/codebase/STRUCTURE.md` - File locations for pages/composables.
- `.planning/codebase/CONVENTIONS.md` - Existing patterns.

### Key Source Files
- `client/app/components/AppState.vue` - Current lint warnings and shared state UI.
- `client/app/pages/dashboard.vue`
- `client/app/pages/calendar.vue`
- `client/app/pages/classes.vue`
- `client/app/pages/documents.vue`
- `client/app/pages/payments.vue`
- `client/app/pages/profile.vue`
- `client/app/utils/navigation.ts`
- `server/prisma/seed.ts` - Demo teacher/student smoke data.
- `server/package.json`
- `client/package.json`
</canonical_refs>

<code_context>
## Existing Code Insights

- Backend targeted Jest, lint, build, frontend typecheck/lint/build, seed, and student API smoke passed after Phase 4 using absolute Node/npm paths.
- Frontend lint currently passes with 4 warnings from optional props in `AppState.vue`; these are low-risk to remove with `withDefaults` values.
- `server/package.json` has a stale `test:e2e` script pointing at a missing config; do not use it as a release gate unless fixed or documented.
- There is no frontend automated browser test runner; Phase 5 should use documented browser smoke rather than silently claiming e2e automation.
- Existing local stack may already be running at `localhost:3000` and `localhost:3001`; if not, start it before browser QA.
- `C:\Program Files\nodejs\node.exe` and `npm.cmd` work even when bare `node`/`npm` do not resolve inside the sandbox.
</code_context>

<success_definition>
## Done Means

- All required backend/frontend command gates have current pass/fail evidence.
- Teacher and student desktop/mobile browser smoke is recorded.
- Fixed data-display bugs have regression coverage via tests, smoke scripts, or manual notes.
- Known remaining issues have severity and next action.
- Release readiness artifact exists and requirements/project docs are updated consistently.
</success_definition>

---

*Phase: 5-Responsive QA, Regression Tests & Release Readiness*
*Context gathered: 2026-06-21*
