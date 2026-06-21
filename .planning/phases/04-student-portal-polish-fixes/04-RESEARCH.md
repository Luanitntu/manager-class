# Phase 4 Research: Student Portal Polish & Fixes

**Created:** 2026-06-21
**Runtime note:** GSD subagents and `gsd-tools.cjs` could not run in this Codex session because `node` is not available on PATH and no Agent tool is exposed. This research was performed from local planning/codebase artifacts and source inspection.

## Scope

Phase 4 should close the remaining student-facing data display gaps without adding a large new module. The student portal work should stay inside existing shared routes and targeted self-scoped APIs/composables:

- Dashboard: overview plus Schedule, Documents, Scores, Payments sections.
- Documents: shared `/documents` route, role-branched student material cards, no teacher-only helper queries for students.
- Payments: shared `/payments` route, role-branched account/balance cards for students, teacher management table preserved.
- Scores/comments: dashboard previews only, backed by self-scoped student endpoints/composables.
- Seed/readme: one complete student smoke path for Phase 4 and Phase 5.

## Existing Patterns

- Frontend uses Nuxt/Vue pages plus feature composables. Pages should not call raw APIs directly.
- Server data uses Nest Controller -> Service -> Repository. Tenant scope uses `teacherId`/`tenantId`.
- `AppPageHeader`, `AppState`, and `useSnackbar` are already available after Phase 2/3.
- `useDocuments()` and `useTuitions()` already call role-scoped backend list endpoints.
- `useStudentScores(id)` and `useStudentComments(id)` exist but require a student id; Phase 4 needs self-scoped wrappers so the student UI does not infer identity.

## Current Bug Sources

- `client/app/pages/documents.vue` calls `useClasses()` and `useStudents()` unconditionally. `GET /students` is teacher-only, so student document views can fail or render misleading states.
- `client/app/pages/payments.vue` calls `useClasses()` and `useStudents()` unconditionally even when `canManage` is false. This repeats the teacher-only helper bug.
- `client/app/pages/dashboard.vue` currently shows student stats and upcoming sessions, but not the required section order or score/comment previews.
- `server/src/modules/student/student.controller.ts` has `GET /students/:id/scores` and `GET /students/:id/comments`; self endpoints such as `/students/me/scores` and `/students/me/comments` are missing.
- `server/src/modules/student/student.service.ts` currently calls `teacherScope(actor)` after `assertCanAccessStudent()` in score/comment list methods. For student actors this may fail if `tenantId` is absent from auth context, so self endpoints should resolve the teacher scope safely through the student row or existing actor tenant where available.
- `server/prisma/seed.ts` has a demo student and enrollment, but not the full Phase 4 smoke path: assigned document, tuition/payment history, score, comment, and upcoming session.

## Recommended Plan Shape

Use three waves:

1. Backend/composable foundation: self endpoints for scores/comments, safe student scoping, composables, and tests.
2. Student UI: dashboard sections, student documents cards, student payments account view, query gating.
3. Demo data/documentation and verification notes: complete seed smoke path and README updates.

This order keeps API contracts stable before UI wiring and lets the UI tasks consume typed composables rather than ad hoc requests.

## Verification Focus

- Backend unit tests for self score/comment access: student can read own records, cannot read another student, teacher scope remains tenant-filtered.
- Static/frontend verification that student documents/payments pages do not invoke `useStudents()`/`useClasses()` unless role allows management.
- Manual smoke path: login as `student@schedule-teacher.local` using the documented seed password, then check dashboard, schedule/classes, documents, scores/comments preview, and payments/history.
