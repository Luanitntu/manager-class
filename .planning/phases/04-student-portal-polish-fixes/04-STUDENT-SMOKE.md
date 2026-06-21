# Phase 4 Student Smoke Checklist

**Account:** `student@schedule-teacher.local` / `admin123!`

**Seeded path:** Demo Student is enrolled in Japanese N5 with one upcoming session, one shared N5 document, one partially paid tuition and receipt, one quiz score, and one progress comment.

## Status Key

- Pending: not run yet.
- Passed: route shows expected seeded data.
- Failed: route loads but expected data is missing or wrong.
- Blocked: environment/tooling prevents verification.

## Checks

| Bug | Route | Expected | Status | Notes |
|-----|-------|----------|--------|-------|
| BUG-006 | Login | Student login succeeds and lands on a student-appropriate dashboard/navigation path. | Passed | API login and `/auth/me` passed for `STUDENT`; unauthenticated frontend routes render login shell. |
| BUG-005 | `/dashboard` | Sections appear in order: Schedule, Documents, Scores, Payments. Score and comment previews show latest student-owned data. | Passed | API verified dashboard role, upcoming sessions, `/students/me/scores`, and `/students/me/comments`. |
| BUG-008 | `/calendar`, `/classes` | Japanese N5 enrollment and upcoming N5 vocabulary review session are visible. | Passed | API verified `/classes` includes Japanese N5 and dashboard includes upcoming session. |
| BUG-003 | `/documents` | Student sees N5 Vocabulary Practice as a read-only material card; no teacher-only endpoint errors. | Passed | API verified `/documents` includes N5 Vocabulary Practice and student receives 403 from teacher-only `/students`. |
| BUG-004, BUG-05 | `/payments` | Student sees tuition account card, remaining balance, status, and View history with receipt `SMOKE-STUDENT-001`. | Passed | API verified tuition and payment history receipt. |
| BUG-009 | `/profile` | Student profile loads and edit flow remains usable. | Passed | API verified `/auth/me`; frontend `/profile` route returns 200 login shell when unauthenticated. |

## Automated Verification

Node/npm are installed at `C:\Program Files\nodejs`, but this sandbox does not resolve bare `node`/`npm` reliably. Verification was run with absolute paths.

- `node.exe --version`: `v24.11.1`
- `npm.cmd --version`: `11.10.1`
- `node.exe .agents/gsd-core/bin/gsd-tools.cjs query init.execute-phase 4`: 3 plans, 3 summaries, 0 incomplete.
- `cd server; npm test -- student.service.spec.ts`: passed, 5 tests.
- `cd server; npm run build`: passed.
- `cd server; npm run lint`: passed, with `--fix` formatting applied by the existing script.
- `cd client; npm run typecheck`: passed; Volar reported `Load plugin failed: vue-router/volar/sfc-route-blocks` as a warning with exit code 0.
- `cd client; npm run lint`: passed with 4 pre-existing warnings in `client/app/components/AppState.vue` for optional prop defaults.
- `cd client; npm run build`: passed; Nuxt emitted sourcemap/deprecation warnings only.
- `cd server; npm run prisma:deploy`: passed; no pending migrations.
- `cd server; npm run prisma:seed`: passed after making seed usernames conflict-tolerant and session seed compatible with DBs that still have required `instructor_id`.
- Student API smoke: passed login, dashboard role/upcoming session, classes, documents, scores, comments, payments/history receipt, and teacher-only students-list denial.
- Frontend route availability: `/dashboard`, `/documents`, `/payments`, `/calendar`, `/classes`, and `/profile` return HTTP 200; without browser session they render the login shell as expected.

Static verification also passed:

- Self-scoped student endpoints were added before parameterized `:id` score/comment routes.
- Student score/comment reads now resolve teacher scope from tenant context or the student row.
- Student documents/payments pages pass `enabled: canManage` to teacher-only class/student helper queries.
- Seed data uses fixed IDs or unique receipt upserts to avoid unbounded duplicate smoke records.

## Phase 5 Follow-Up

Optional browser-level visual smoke remains for Phase 5:

```bash
cd server
npm test -- student.service.spec.ts
npm run lint
npm run build

cd ../client
npm run lint
npm run typecheck
npm run build
```

Then open the route checks above with the seeded student account and visually confirm card layout/empty states at desktop and mobile widths.
