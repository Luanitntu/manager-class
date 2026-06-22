# Phase 5 Browser Smoke

**Date:** 2026-06-21
**Backend:** `http://localhost:3001/api/v1` reachable.
**Frontend:** `http://localhost:3000` reachable.
**Accounts:** `teacher@schedule-teacher.local` / `admin123!`; `student@schedule-teacher.local` / `admin123!`.
**Viewport targets:** desktop `1440x900`; mobile `390x844`.

## Environment Note

This Codex runtime has shell access but no browser-control or screenshot tool available. The automated portion of this smoke therefore verifies reachable frontend routes plus authenticated API data for teacher/student flows. Visual desktop/mobile inspection is recorded as `BLOCKED - needs human browser pass` rather than silently passed.

## Runtime Checks

| Check | Result | Evidence |
|-------|--------|----------|
| Backend health | PASS | `GET /api/v1/health` returned 200. |
| Frontend login route | PASS | `GET http://localhost:3000/login` returned 200. |
| Frontend core route availability | PASS | `/dashboard`, `/calendar`, `/classes`, `/students`, `/documents`, `/payments`, `/profile` returned 200. |
| Student authenticated data smoke | PASS | `npm run smoke:student` passed; see `05-REGRESSION.md`. |
| Teacher authenticated data smoke | PASS | `npm run smoke:teacher` passed; see `05-REGRESSION.md`. |

## Teacher Desktop

| Route | Expected | Result | Notes |
|-------|----------|--------|-------|
| Login | Teacher can authenticate and reach app shell. | API PASS / Visual BLOCKED | Login API passed; browser session visual check needs human pass. |
| Dashboard | Class/student/tuition cards and upcoming session visible without overlap. | API PASS / Visual BLOCKED | `/dashboard` data smoke confirms seeded teacher dashboard. |
| Calendar | Calendar-first workflow and session controls usable. | API PASS / Visual BLOCKED | `/sessions` range smoke confirms seeded session. |
| Classes | Japanese N5 class visible; actions readable. | API PASS / Visual BLOCKED | `/classes` smoke confirms class is visible after seed restore. |
| Students | Demo Student visible; teacher-only page not exposed to student role. | API PASS / Visual BLOCKED | Teacher `/students` pass; student `/students` 403 pass. |
| Documents | N5 material visible and controls fit. | API PASS / Visual BLOCKED | `/documents` smoke confirms material. |
| Payments | Tuition row/detail/history receipt visible. | API PASS / Visual BLOCKED | `/payments/tuitions/:id` includes `SMOKE-STUDENT-001`. |
| Profile | Profile menu/page reachable. | ROUTE PASS / Visual BLOCKED | `/profile` route returned 200; `/auth/me` is profile-equivalent API smoke. |

## Teacher Mobile

| Route | Expected | Result | Notes |
|-------|----------|--------|-------|
| Login | Login form fits mobile width. | Visual BLOCKED | Requires browser viewport inspection. |
| Dashboard | Cards stack; refresh/action controls do not overlap. | Static REVIEW / Visual BLOCKED | Vuetify grid uses `cols="12" sm/md`; needs browser confirmation. |
| Calendar | Calendar controls remain usable at mobile width. | Visual BLOCKED | Requires browser viewport inspection. |
| Classes | List/cards and primary actions fit mobile. | Static REVIEW / Visual BLOCKED | Route reachable; visual check pending. |
| Students | Student list and detail controls fit mobile. | Visual BLOCKED | Requires browser viewport inspection. |
| Documents | Document cards/actions fit mobile. | Static REVIEW / Visual BLOCKED | Route reachable; visual check pending. |
| Payments | Table/card layout does not overflow badly. | Static REVIEW / Visual BLOCKED | Student path uses cards; teacher table needs browser confirmation. |
| Profile | Form/actions fit mobile. | Visual BLOCKED | Requires browser viewport inspection. |

## Student Desktop

| Route | Expected | Result | Notes |
|-------|----------|--------|-------|
| Login | Student can authenticate and reach student shell. | API PASS / Visual BLOCKED | Login API passed. |
| Dashboard | Sections appear: Schedule, Documents, Scores, Feedback, Payments. | API PASS / Visual BLOCKED | Student dashboard API/composable smoke passed. |
| Schedule/Calendar | Japanese N5 upcoming session visible. | API PASS / Visual BLOCKED | Dashboard/classes/session data smoke passed. |
| Classes | Japanese N5 enrollment visible. | API PASS / Visual BLOCKED | `/classes` smoke confirms class. |
| Documents | N5 Vocabulary Practice visible read-only. | API PASS / Visual BLOCKED | `/documents` smoke confirms material. |
| Scores/comments previews | Latest quiz/comment visible. | API PASS / Visual BLOCKED | `/students/me/scores` and `/students/me/comments` pass. |
| Payments/history | Tuition status and receipt history visible. | API PASS / Visual BLOCKED | Tuition detail includes receipt. |
| Profile | Profile route reachable. | ROUTE PASS / Visual BLOCKED | `/profile` route returned 200; `/auth/me` pass. |

## Student Mobile

| Route | Expected | Result | Notes |
|-------|----------|--------|-------|
| Login | Login form fits mobile width. | Visual BLOCKED | Requires browser viewport inspection. |
| Dashboard | Cards/lists stack; text does not overlap; bottom nav usable. | Static REVIEW / Visual BLOCKED | Layout uses Vuetify grid/list/card patterns; needs browser confirmation. |
| Schedule/Calendar | Student schedule usable from mobile nav. | Visual BLOCKED | Requires browser viewport inspection. |
| Classes | Enrollment cards/list fit mobile. | Static REVIEW / Visual BLOCKED | Route reachable; visual check pending. |
| Documents | Material cards fit mobile; no teacher-only actions. | Static REVIEW / Visual BLOCKED | Student document API is role-safe. |
| Scores/comments previews | Chips/timeline content fits mobile. | Static REVIEW / Visual BLOCKED | Needs visual confirmation for long comment text. |
| Payments/history | Tuition cards and history dialog fit mobile. | Static REVIEW / Visual BLOCKED | Student cards use stacked `v-col`; dialog needs browser check. |
| Profile | Form/actions fit mobile. | Visual BLOCKED | Requires browser viewport inspection. |

## Frontend Checks After Browser Smoke Prep

| Command | Result | Notes |
|---------|--------|-------|
| `cd client; npm run lint` | PASS | No `AppState.vue` default-prop warnings. |
| `cd client; npm run typecheck` | PASS | Exit 0; Volar route-block plugin warning remains. |
| `cd client; npm run build` | PASS | Nuxt build completed; sourcemap/deprecation warnings remain low severity. |

## Known Issues / Next Actions

| Severity | Issue | Next action |
|----------|-------|-------------|
| Medium | True desktop/mobile visual smoke could not be completed from this runtime because no browser automation/screenshot tool is available. | Human tester should open the listed routes at `1440x900` and `390x844`, then update each `Visual BLOCKED` row to PASS/FAIL. |
| Low | Teacher payments table may need mobile confirmation because teacher view uses a table while student view uses cards. | Include in human mobile pass; fix only if overflow blocks primary action. |
| Low | Student feedback timeline with long comments needs mobile confirmation. | Include in human mobile pass; add wrapping constraints if overlap appears. |

## Release Interpretation

API/data and route availability smoke passed for teacher and student. UI-06 is not fully closed until a human or browser-automation pass verifies the desktop/mobile visual rows above.
