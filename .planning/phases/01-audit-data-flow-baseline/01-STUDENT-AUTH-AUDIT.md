# Student and Auth Route Audit

## Environment

Runtime smoke testing was blocked because `node` and `npm` are unavailable. Static evidence shows several student/auth gaps independent of runtime. Default seed does not create a student, enrollment, scores, comments, payments, or shared documents.

## Student Route: Dashboard

- Current route: `/dashboard`
- Page: `client/app/pages/dashboard.vue`
- Composable: `useDashboard()` -> `GET /dashboard`
- Backend: `DashboardService.studentStats(actor.id)` returns currentClasses, remainingTuition, totalScores, upcomingSessions.
- Role-aware: yes; dashboard cards switch on `data.value?.role` and include a `STUDENT` branch.
- Status: Static mapped; runtime blocked.
- Evidence: backend/page contract exists, but no seeded student account to exercise it.
- Suspected Layer: Seed/Data for current blocked status.

## Student Route: Schedule

- Current route: `/calendar`
- Page: `client/app/pages/calendar.vue`
- Composable: `fetchSessionRange()` -> `GET /sessions?from&to`
- Role-aware: partially; edit controls hidden unless role is `TEACHER`.
- Status: Static mapped with navigation concern.
- Evidence: `login.vue`, `index.vue`, and `auth.global.ts` route all non-super-admin authenticated users to `/calendar`, so students land here by default.
- Suspected Layer: Store/Auth or Navigation.
- Severity: Medium because calendar may be acceptable as schedule, but dashboard is the expected student summary flow.

## Student Route: Classes

- Current route: `/classes`
- Page: `client/app/pages/classes.vue`
- Composable: `useClasses()` -> `GET /classes?limit=100`
- Backend: `ClassController.findAll()` comments say teacher all, assistant/student assigned only.
- Role-aware: backend yes; page no explicit student copy or detail behavior.
- Status: Static mapped; runtime blocked.
- Evidence: shared page should display enrolled classes if service scoping is correct.
- Suspected Layer: Component/UX if empty messaging is teacher-centric; API if service scoping fails at runtime.

## Student Route: Documents

- Current route: `/documents`
- Page: `client/app/pages/documents.vue`
- Primary composable: `useDocuments()` -> role-scoped `GET /documents?limit=100`
- Additional composables: unconditional `useClasses()` and `useStudents()`.
- Backend: `DocumentService.list()` explicitly supports `Role.STUDENT` and lists shared docs.
- Static mismatch: `useStudents()` calls `GET /students`, but `StudentController.list()` is teacher-only.
- Status: Static mismatch.
- Evidence: a student viewing `/documents` can have the primary documents query succeed while the unconditional students helper query receives 403. Depending on TanStack/Vue error handling, this can create page-level errors or broken assignment picker state despite shared documents existing.
- Suspected Layer: Component role-scope / Store/Auth.
- Severity: High for DATA-05 and BUG-01.

## Student Route: Scores and Comments

- Current route: no dedicated route found.
- Available composables: `useStudentScores(id)`, `useStudentComments(id)`.
- Backend: `GET /students/:id/scores` and `GET /students/:id/comments` are not teacher-only and are intended for teacher/assistant/student authorization through service.
- Role-aware: backend likely yes; frontend missing self-page that passes auth user's id.
- Status: Route gap.
- Evidence: Requirements expect student scores/comments; no route/page consumes these composables for the logged-in student.
- Suspected Layer: Component/route coverage.
- Severity: High for DATA-04.

## Student Route: Payments

- Current route: `/payments`
- Page: `client/app/pages/payments.vue`
- Primary composable: `useTuitions()` -> `GET /payments/tuitions?limit=100`
- Additional composables: unconditional `useClasses()` and `useStudents()`.
- Backend: `PaymentService.list()` supports `Role.STUDENT` by filtering tuition rows to `actor.id`.
- Static mismatch: page fetches `useStudents()` for create form data even when `canManage` is false for students. `GET /students` is teacher-only.
- Status: Static mismatch.
- Evidence: student payment data can exist and primary tuition query can succeed, while helper query fails with 403. This matches the bug class "data exists but page does not show it" if a shared page error suppresses rendering.
- Suspected Layer: Component role-scope.
- Severity: High for DATA-05 and BUG-05.

## Student Route: Profile

- Current route: `/profile`
- Page: `client/app/pages/profile.vue`
- API: direct `GET /users/me/profile`, `PATCH /users/me/profile` via `useApi().request`.
- Role-aware: authenticated user route; should work for student.
- Status: Static mapped; pattern exception.
- Evidence: page does not use a feature composable.
- Suspected Layer: Component/composable boundary.
- Severity: Low.

## Auth/Session Risks

| Risk | Source | Evidence | Suspected Layer | Severity | Next Action |
|------|--------|----------|-----------------|----------|-------------|
| Stale persisted token | `client/app/stores/auth.ts` | persisted `accessToken`, `refreshToken`, `user`; middleware only checks local state | Store/Auth | Medium | Add 401 handling/refresh or clear stale session in later phase. |
| Role home mismatch | `login.vue`, `index.vue`, `auth.global.ts` | only super-admin routes to dashboard; all others to `/calendar` | Store/Auth navigation | Medium | Add role-aware student home target. |
| Missing student seed | `server/prisma/seed.ts` | no student user; no enrollment | Seed/Data | High | Add fixture or scripted setup for student smoke tests. |
| Credential mismatch | README vs seed | README says `Password123!`, seed hashes `admin123!` | Seed/Data | High | Align docs/seed before QA. |
| Direct page API calls | `profile.vue`, `reports.vue` | bypass feature composables | Component | Low/Medium | Move to composables when touched. |

## Candidate Student/Auth Bug Rows

| Candidate | Role | Route/Page | Expected Data | Observed UI | Suspected Layer | Evidence | Severity | Next Action |
|-----------|------|------------|---------------|-------------|-----------------|----------|----------|-------------|
| S-001 | Student | `/documents` | Shared documents | Runtime blocked; static mismatch | Component | Page calls teacher-only `useStudents()` for all roles | High | Gate helper queries by `canManage` or split student view in Phase 4. |
| S-002 | Student | `/payments` | Own tuition/payment history | Runtime blocked; static mismatch | Component | Page calls teacher-only `useStudents()` for all roles | High | Gate helper queries/forms by teacher role in Phase 4. |
| S-003 | Student | scores/comments | Own scores and comments | No route found | Component | Composables/API exist but no student self page consumes them | High | Add/refresh student dashboard/detail display in Phase 4. |
| S-004 | Student | login/home | Student expected dashboard summary | Runtime blocked; static mismatch | Store/Auth | login/index redirect non-super-admin users to `/calendar` | Medium | Make redirect role-aware for students. |
| S-005 | Student | seed login | Student account available for smoke flow | Runtime blocked | Seed/Data | Seed lacks student | High | Add minimal fixture or manual setup notes. |

## No Secrets Recorded

No token values, generated secrets, or private credentials were recorded. Only documented local demo credential strings and seed source evidence were referenced.

