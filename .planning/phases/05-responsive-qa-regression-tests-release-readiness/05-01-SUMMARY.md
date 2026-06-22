---
phase: 05-responsive-qa-regression-tests-release-readiness
plan: 01
subsystem: testing
tags: [smoke, regression, npm, prisma, nuxt, nest]
requires:
  - phase: 04-student-portal-polish-fixes
    provides: Student self endpoints, seeded student smoke data, and Phase 4 API smoke evidence
provides:
  - Repeatable teacher and student API smoke scripts
  - Current automated regression evidence
  - Active/idempotent seed fixture for Japanese N5 smoke class
affects: [phase-5, release-readiness, browser-qa]
tech-stack:
  added: []
  patterns: [Node fetch-based smoke scripts under server/scripts]
key-files:
  created:
    - server/scripts/smoke-student.cjs
    - server/scripts/smoke-teacher.cjs
    - .planning/phases/05-responsive-qa-regression-tests-release-readiness/05-REGRESSION.md
  modified:
    - client/app/components/AppState.vue
    - server/package.json
    - server/prisma/seed.ts
key-decisions:
  - "Smoke scripts assert tuition receipt through tuition detail because tuition list rows do not include nested payments."
  - "Seed restores the Japanese N5 class to active/non-deleted state so repeated QA after soft-delete tests remains stable."
patterns-established:
  - "Smoke scripts use API_BASE_URL plus seeded account env overrides and print PASS/FAIL lines."
requirements-completed: [VER-01, VER-02, VER-03, VER-04, VER-05]
duration: 35 min
completed: 2026-06-21
status: complete
---

# Phase 5 Plan 01: Automated Regression Smoke Summary

**Repeatable teacher/student API smoke scripts plus a clean automated regression baseline for release QA**

## Performance

- **Duration:** 35 min
- **Started:** 2026-06-21T15:35:00Z
- **Completed:** 2026-06-21T16:10:00Z
- **Tasks:** 4
- **Files modified:** 6

## Accomplishments

- Added `smoke:student` and `smoke:teacher` npm scripts backed by CJS smoke runners.
- Removed shared `AppState.vue` lint warnings by adding explicit optional prop defaults.
- Restored idempotent smoke seed behavior for the Japanese N5 class.
- Ran and recorded backend tests/lint/build/migrations/seed, frontend lint/typecheck/build, and both smoke scripts in `05-REGRESSION.md`.

## Task Commits

Pending final phase commit.

## Files Created/Modified

- `server/scripts/smoke-student.cjs` - Authenticated student role/data smoke.
- `server/scripts/smoke-teacher.cjs` - Authenticated teacher role/data smoke.
- `server/package.json` - Added smoke npm scripts.
- `server/prisma/seed.ts` - Restores seeded smoke class active state.
- `client/app/components/AppState.vue` - Clears optional prop default lint warnings.
- `.planning/phases/05-responsive-qa-regression-tests-release-readiness/05-REGRESSION.md` - Regression evidence and warnings.

## Decisions Made

- Tuition receipt smoke checks use `/payments/tuitions/:id` because list rows intentionally omit nested payment records.
- Profile smoke uses `/auth/me` because there is no separate teacher/student profile read endpoint beyond authenticated user/profile data for the current smoke scope.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Seeded class could remain soft-deleted**
- **Found during:** Task 3 (teacher smoke)
- **Issue:** `/dashboard` and `/classes` did not report the seeded class because `upsert.update` did not clear `deletedAt` after prior QA/test soft-deletes.
- **Fix:** `server/prisma/seed.ts` now restores teacher, name, level, color, `deletedAt: null`, and `isActive: true` on rerun.
- **Files modified:** `server/prisma/seed.ts`
- **Verification:** `npm run prisma:seed`, `npm run smoke:teacher`, and `npm run smoke:student` passed.
- **Committed in:** Pending final phase commit.

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Stabilizes repeatable smoke evidence without adding product scope.

## Issues Encountered

- Sandbox cannot read `C:\Program Files\nodejs` without escalation; verification used escalated absolute npm path.
- `nuxt typecheck` exits 0 but warns `Load plugin failed: vue-router/volar/sfc-route-blocks`.
- Nuxt build emits sourcemap/deprecation warnings; all build steps still pass.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Automated/API regression baseline is ready for browser responsive QA in Plan 05-02.

---
*Phase: 05-responsive-qa-regression-tests-release-readiness*
*Completed: 2026-06-21*
