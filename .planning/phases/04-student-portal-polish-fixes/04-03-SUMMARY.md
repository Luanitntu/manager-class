---
phase: 04-student-portal-polish-fixes
plan: 03
subsystem: data
tags: [prisma, seed, qa, smoke-test, documentation]
requires:
  - phase: 04-student-portal-polish-fixes
    provides: student portal UI and self endpoints
provides:
  - Complete seeded student smoke path
  - README student demo data notes
  - Phase 4 manual student smoke checklist
affects: [phase-5-qa, seed-data, documentation]
tech-stack:
  added: []
  patterns: [deterministic smoke fixture IDs, explicit verification blocker notes]
key-files:
  created:
    - .planning/phases/04-student-portal-polish-fixes/04-STUDENT-SMOKE.md
  modified:
    - server/prisma/seed.ts
    - README.md
key-decisions:
  - "Use deterministic IDs and unique receipt upsert for idempotent smoke data."
    - "Record absolute-path Node/npm verification and remaining manual smoke checks in the checklist."
patterns-established:
  - "Student smoke data should cover dashboard, calendar/classes, documents, scores/comments, and payments together."
requirements-completed: [DATA-04, DATA-05, BUG-05]
duration: 30min
completed: 2026-06-21
status: complete
---

# Phase 4 Plan 03: Student Smoke Data Summary

**Deterministic student demo data and smoke checklist covering the full student portal path**

## Performance

- **Duration:** 30 min
- **Started:** 2026-06-21T16:20:00Z
- **Completed:** 2026-06-21T16:50:00Z
- **Tasks:** 4/4
- **Files modified:** 3

## Accomplishments

- Extended seed data with an upcoming session, shared document assignment, partial tuition, payment receipt, score, and teacher comment.
- Updated README with the student demo account and expected seeded data.
- Added a Phase 4 student smoke checklist mapped to BUG-003, BUG-004, BUG-005, BUG-006, BUG-008, and BUG-05.
- Documented absolute-path Node/npm verification results and remaining manual smoke checks.

## Task Commits

Not committed per task because `gsd-tools.cjs` and Node are unavailable in this runtime. Changes are available in the working tree.

## Files Created/Modified

- `server/prisma/seed.ts` - Adds complete idempotent student smoke path.
- `README.md` - Documents student account and smoke-test data.
- `.planning/phases/04-student-portal-polish-fixes/04-STUDENT-SMOKE.md` - Manual smoke checklist and verification blockers.

## Decisions Made

- Used a class-level document assignment so the same material appears through the student's enrollment.
- Used receipt number `SMOKE-STUDENT-001` as the stable payment history unique key.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Bare `node`/`npm` do not resolve reliably inside this sandbox, but absolute paths under `C:\Program Files\nodejs` work.
- Runtime route smoke tests still need a running local stack and seeded database.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 5 has a documented seeded student path, automated verification results, and remaining manual route checks.

---
*Phase: 04-student-portal-polish-fixes*
*Completed: 2026-06-21*
