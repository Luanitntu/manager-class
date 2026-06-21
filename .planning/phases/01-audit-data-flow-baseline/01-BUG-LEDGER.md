# Phase 1 Bug Ledger

**Phase:** Audit & Data Flow Baseline
**Created:** 2026-06-21
**Purpose:** Track teacher/student data-display and navigation bugs discovered during Phase 1.

Runtime smoke testing is blocked in this session because Node/npm are unavailable. Status values distinguish static mismatches from runtime reproduction.

| ID | Role | Route/Page | Expected Data | Observed UI / Audit Result | Suspected Layer | Evidence | Severity | Status | Next Action |
|----|------|------------|---------------|----------------------------|-----------------|----------|----------|--------|-------------|
| BUG-001 | Teacher | `/classes` | Seed class `Japanese N5` should display for teacher. | Runtime blocked; static page/composable contract appears correct. | Unknown | `server/prisma/seed.ts` creates one class; `classes.vue` reads `data.value?.data` from `useClasses()`/`requestPaged`. | High | Blocked | First live smoke test after Node/npm are available. If empty, inspect auth/tenant/API response. |
| BUG-002 | Teacher/Auth | Seed login | README demo teacher/admin credentials should work. | Static mismatch between docs and seed. | Seed/Data | `README.md` lists `Password123!`; `server/prisma/seed.ts` hashes `admin123!`. | High | Needs fix-phase | Align README and seed before QA smoke tests. |
| BUG-003 | Student | `/documents` | Student shared documents should display when assigned directly or via class. | Static mismatch: page always calls teacher-only students list. | Component | `documents.vue` calls `useStudents()` unconditionally; `StudentController.list()` has `@Roles(Role.TEACHER)`. | High | Needs fix-phase | Gate teacher-only helper queries/forms by role or create student-focused view. |
| BUG-004 | Student | `/payments` | Student tuition/payment history should display. | Static mismatch: page always calls teacher-only students list. | Component | `payments.vue` calls `useStudents()` unconditionally even when `canManage` is false; `GET /students` is teacher-only. | High | Needs fix-phase | Gate create-form helper queries by teacher role; keep student list focused on own tuitions. |
| BUG-005 | Student | Scores/comments | Student can see own scores and comments. | Route gap: no page found using score/comment composables for logged-in student. | Component | `useStudentScores()` and `useStudentComments()` exist; no student self route found. | High | Needs fix-phase | Surface scores/comments on student dashboard or dedicated student detail route. |
| BUG-006 | Student/Auth | Login/index redirect | Student should land on student-appropriate dashboard/summary. | Static mismatch: non-super-admin users route to `/calendar`. | Store/Auth | `login.vue`, `index.vue`, and `auth.global.ts` route authenticated non-super-admin users to `/calendar`. | Medium | Needs fix-phase | Make post-login/default route role-aware for student. |
| BUG-007 | Teacher | `/reports` | Authenticated report downloads should work. | Static risk: direct download URL bypasses `useApi` bearer header. | Store/Auth | `reports.vue` builds direct `/reports/*.xlsx` URLs; backend report controller is guarded. | Medium | Blocked | Smoke test downloads; if 401/403, switch to authenticated blob fetch. |
| BUG-008 | Student/Auth | Seed data | Student smoke flow has a demo account and enrollment. | Static gap: no seeded student, enrollment, documents, tuition, scores, comments. | Seed/Data | `server/prisma/seed.ts` creates only admin, teacher, and one class. | High | Needs fix-phase | Add minimal reproducible fixture or document manual setup before Phase 4/5 QA. |
| BUG-009 | Teacher/Student | `/profile` | Profile reads/updates through feature composable pattern. | Pattern exception: page calls API directly. | Component | `profile.vue` uses `useApi().request` directly. | Low | Needs fix-phase | Move behind `useProfile` composable during UI refresh if page is touched. |

## Severity Guide

- High: blocks core teacher/student data visibility, login, or v1 smoke tests.
- Medium: likely breaks an important workflow but needs runtime confirmation or has workaround.
- Low: pattern drift or polish issue unlikely to block data display by itself.

## Suspected Layer Guide

- API: backend returns missing, wrong, or unauthorized data.
- Composable: frontend API wrapper calls wrong endpoint or unwraps response incorrectly.
- Store/Auth: wrong role, session, or token state causes route/API mismatch.
- Component: data reaches page but rendering, filtering, or state hides it.
- Pagination/Meta: data exists but list pagination/meta handling drops it.
- Seed/Data: expected scenario is missing from local seed/demo data.
- Unknown: runtime is required to classify confidently.

## Notes

- Keep center-role issues out of this ledger unless they block teacher/student audit setup.
- Blocked rows need runtime smoke tests once Node/npm are available.
- Static mismatch rows can feed Phase 3/4 fix planning directly.
