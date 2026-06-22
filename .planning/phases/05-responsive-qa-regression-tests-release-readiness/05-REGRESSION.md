# Phase 5 Automated Regression Gate

**Date:** 2026-06-21
**Runtime:** Local backend at `http://localhost:3001/api/v1`; commands run with `C:\Program Files\nodejs\npm.cmd` because sandboxed PATH does not expose Node/npm consistently.
**Seeded accounts:** `teacher@schedule-teacher.local` / `admin123!`; `student@schedule-teacher.local` / `admin123!`.

## Results

| Area | Command | Status | Notes |
|------|---------|--------|-------|
| Node/npm | `npm --version` | PASS | `11.10.1` with escalated access to `C:\Program Files\nodejs`. |
| Backend migrations | `cd server; npm run prisma:deploy` | PASS | No pending migrations. Prisma printed deprecation/update notices only. |
| Backend seed | `cd server; npm run prisma:seed` | PASS | Seed restored active Japanese N5 smoke class and student fixtures. |
| Backend lint | `cd server; npm run lint` | PASS | Existing script runs ESLint with `--fix`; no remaining errors. |
| Backend build | `cd server; npm run build` | PASS | Nest build completed. |
| Backend tests | `cd server; npm test` | PASS | 5 suites, 22 tests passed. |
| Student smoke | `cd server; npm run smoke:student` | PASS | Login, `/auth/me`, dashboard, classes, documents, scores, comments, tuition detail receipt, and `/students` 403 passed. |
| Teacher smoke | `cd server; npm run smoke:teacher` | PASS | Login, `/auth/me`, dashboard, classes, sessions range, students, documents, and tuition detail receipt passed. |
| Frontend lint | `cd client; npm run lint` | PASS | `AppState.vue` optional prop warnings removed. |
| Frontend typecheck | `cd client; npm run typecheck` | PASS | Exit 0 with warning: `Load plugin failed: vue-router/volar/sfc-route-blocks`. |
| Frontend build | `cd client; npm run build` | PASS | Nuxt build completed. Warnings: sourcemap likely incorrect for `nuxt:module-preload-polyfill`; Node deprecation warning from `@vue/shared` export mapping. |

## Smoke Script Coverage

### Student

- PASS student login succeeds.
- PASS `/auth/me` returns `STUDENT`.
- PASS `/dashboard` is student-scoped and includes upcoming sessions.
- PASS `/classes` includes `Japanese N5`.
- PASS `/documents` includes `N5 Vocabulary Practice`.
- PASS `/students/me/scores` includes `Vocabulary quiz`.
- PASS `/students/me/comments` includes seeded progress comment.
- PASS `/payments/tuitions` includes a tuition row.
- PASS `/payments/tuitions/:id` includes receipt `SMOKE-STUDENT-001`.
- PASS `/students` returns 403 for student role.

### Teacher

- PASS teacher login succeeds.
- PASS `/auth/me` returns `TEACHER` and is the profile-equivalent smoke endpoint.
- PASS `/dashboard` is teacher-scoped and reports seeded class count.
- PASS `/classes` includes `Japanese N5`.
- PASS `/sessions?from=...&to=...` includes `N5 vocabulary review`.
- PASS `/students` includes seeded student.
- PASS `/documents` includes `N5 Vocabulary Practice`.
- PASS `/payments/tuitions/:id` includes receipt `SMOKE-STUDENT-001`.

## Fixed During Regression

- `client/app/components/AppState.vue`: added explicit `undefined` defaults for optional props to clear `vue/require-default-prop` warnings without changing fallback UI behavior.
- `server/scripts/smoke-student.cjs`: added repeatable authenticated student API smoke.
- `server/scripts/smoke-teacher.cjs`: added repeatable authenticated teacher API smoke.
- `server/package.json`: added `smoke:student` and `smoke:teacher` scripts.
- `server/prisma/seed.ts`: seed now restores the Japanese N5 class to active/non-deleted state so smoke reruns are idempotent after soft-delete tests or manual QA.

## Residual Warnings

| Severity | Warning | Next action |
|----------|---------|-------------|
| Low | `nuxt typecheck` warns `Load plugin failed: vue-router/volar/sfc-route-blocks` while exiting 0. | Track as tooling warning; no release blocker. |
| Low | Nuxt build sourcemap warning from `nuxt:module-preload-polyfill`. | Track as build-tool warning; no runtime failure observed. |
| Low | Node deprecation warning from `@vue/shared` trailing slash export mapping during build. | Dependency warning; revisit during dependency upgrade. |
| Low | Prisma CLI warns `package.json#prisma` config is deprecated for Prisma 7. | Migrate to `prisma.config.ts` before Prisma 7 upgrade. |

## Requirement Evidence

- VER-01: Backend lint/build/tests and frontend lint/typecheck/build passed.
- VER-02: Repeatable student/teacher smoke scripts pass against seeded data.
- VER-03: Fixed AppState lint warning regression and restored seed idempotence; smoke scripts cover Phase 4 data-display fixes.
- VER-04: Teacher API smoke evidence exists; browser responsive evidence continues in `05-BROWSER-SMOKE.md`.
- VER-05: Student API smoke evidence exists; browser responsive evidence continues in `05-BROWSER-SMOKE.md`.
