# Phase 5 Release Readiness

**Date:** 2026-06-21
**Scope:** Schedule Teacher v1 polish release for teacher/student workflows.
**Recommendation:** Conditional go for internal teacher/student validation after human visual viewport smoke. Automated, API, route, build, and regression gates pass; true browser desktop/mobile visual inspection remains the only medium-severity release gate.

## Automated Checks

| Gate | Status | Evidence |
|------|--------|----------|
| Backend tests | PASS | `server npm test`: 5 suites, 22 tests passed. |
| Backend lint | PASS | `server npm run lint` completed. |
| Backend build | PASS | `server npm run build` completed. |
| Prisma deploy | PASS | `server npm run prisma:deploy`: no pending migrations. |
| Prisma seed | PASS | `server npm run prisma:seed`: seeded admin, teacher, student, Japanese N5 fixtures. |
| Frontend lint | PASS | `client npm run lint` completed; prior `AppState.vue` warnings removed. |
| Frontend typecheck | PASS | `client npm run typecheck` exits 0 with Volar route-block warning. |
| Frontend build | PASS | `client npm run build` completed with low-severity sourcemap/dependency warnings. |
| Frontend route availability | PASS | `/login`, `/dashboard`, `/calendar`, `/classes`, `/students`, `/documents`, `/payments`, `/profile` returned 200. |

## Teacher Smoke

| Flow | Status | Evidence |
|------|--------|----------|
| Login and identity | PASS | `smoke:teacher` confirms login and `/auth/me` role `TEACHER`. |
| Dashboard | PASS | `smoke:teacher` confirms dashboard is teacher-scoped and seeded class count is present. |
| Calendar/sessions | PASS | `smoke:teacher` confirms `/sessions?from=...&to=...` includes `N5 vocabulary review`. |
| Classes/students | PASS | `smoke:teacher` confirms Japanese N5 and Demo Student. |
| Documents | PASS | `smoke:teacher` confirms `N5 Vocabulary Practice`. |
| Payments/history | PASS | `smoke:teacher` confirms tuition detail receipt `SMOKE-STUDENT-001`. |
| Desktop/mobile visual fit | BLOCKED | Browser-control/screenshot tool unavailable; see `05-BROWSER-SMOKE.md`. |

## Student Smoke

| Flow | Status | Evidence |
|------|--------|----------|
| Login and identity | PASS | `smoke:student` confirms login and `/auth/me` role `STUDENT`. |
| Dashboard/schedule | PASS | `smoke:student` confirms dashboard is student-scoped with upcoming sessions. |
| Classes | PASS | `smoke:student` confirms Japanese N5 enrollment. |
| Documents | PASS | `smoke:student` confirms assigned N5 material. |
| Scores/comments | PASS | `smoke:student` confirms quiz score and progress comment. |
| Payments/history | PASS | `smoke:student` confirms tuition detail receipt `SMOKE-STUDENT-001`. |
| Role isolation | PASS | `smoke:student` confirms `/students` returns 403. |
| Desktop/mobile visual fit | BLOCKED | Browser-control/screenshot tool unavailable; see `05-BROWSER-SMOKE.md`. |

## Fixed Bug Coverage

| Bug/Requirement | Status | Evidence |
|-----------------|--------|----------|
| DATA-04 | PASS | Student dashboard/API smoke covers classes, sessions, documents, scores/comments, and payment status. |
| DATA-05 | PASS | Student documents/payments/classes use role-safe data paths; smoke confirms no silent empty state for seeded data. |
| BUG-05 | PASS | Teacher and student tuition detail history includes `SMOKE-STUDENT-001`. |
| VER-03 | PASS | `04-STUDENT-SMOKE.md`, `05-REGRESSION.md`, and smoke scripts cover fixed data-display bugs. |
| UI-06 | PARTIAL | Route/static evidence exists; human desktop/mobile viewport inspection is still required. |

## Known Issues

| Severity | Issue | Owner | Next action |
|----------|-------|-------|-------------|
| Medium | True desktop/mobile browser visual QA is not complete because this runtime has no browser automation/screenshot tool. | Human QA / next agent with browser tool | Open `05-BROWSER-SMOKE.md`, test `1440x900` and `390x844`, mark visual rows PASS/FAIL. |
| Low | `nuxt typecheck` warns `Load plugin failed: vue-router/volar/sfc-route-blocks` but exits 0. | Frontend tooling | Track; no release block unless typecheck starts failing. |
| Low | Nuxt build sourcemap warning from `nuxt:module-preload-polyfill`. | Frontend tooling | Track during Nuxt/Vite maintenance. |
| Low | Node deprecation warning from `@vue/shared` export mapping. | Frontend dependencies | Revisit on dependency upgrade. |
| Low | Prisma `package.json#prisma` config deprecation warning. | Backend tooling | Move to Prisma config before Prisma 7. |

## Final Verification

| Command | Status |
|---------|--------|
| `cd server; npm test` | PASS |
| `cd server; npm run lint` | PASS |
| `cd server; npm run build` | PASS |
| `cd server; npm run prisma:deploy` | PASS |
| `cd server; npm run prisma:seed` | PASS |
| `cd server; npm run smoke:student` | PASS |
| `cd server; npm run smoke:teacher` | PASS |
| `cd client; npm run lint` | PASS |
| `cd client; npm run typecheck` | PASS with low-severity warning |
| `cd client; npm run build` | PASS with low-severity warnings |

## Evidence Links

- `05-REGRESSION.md` - automated checks and API smoke output.
- `05-BROWSER-SMOKE.md` - route availability, browser smoke checklist, and visual QA blocker.
- `04-STUDENT-SMOKE.md` - Phase 4 student smoke evidence.

## Release Recommendation

Do not call v1 fully release-ready until the human visual viewport pass in `05-BROWSER-SMOKE.md` is complete. The codebase is ready for internal validation and manual QA because all automated checks, seeded data smoke scripts, and route availability checks pass.
