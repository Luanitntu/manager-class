# Teacher Route Audit

## Environment

Runtime smoke testing was blocked because `node` and `npm` are unavailable in this session. Evidence below is static code/API comparison plus seed review. Default seed only creates a teacher and one class, so even with runtime, sessions/students/documents/payments need additional fixtures.

## Teacher Route: Dashboard

- Page: `client/app/pages/dashboard.vue`
- Composable: `useDashboard()`
- Query key: `['dashboard']`
- API: `GET /dashboard`
- Envelope use: `request<DashboardStats>()` returns unwrapped object; page reads `data.value` fields directly.
- Backend: `DashboardService.teacherStats(actor.id)` counts classes/students, aggregates tuition, returns upcoming sessions.
- Status: Static mapped; runtime blocked.
- Evidence: API/page envelope usage matches. Default seed should produce `totalClasses = 1`, `totalStudents = 0`, no tuition/upcoming sessions.
- Suspected Layer: Seed/Data for empty non-class cards; not a composable mismatch.
- Severity: Low unless live data exists and cards stay empty.

## Teacher Route: Calendar

- Page: `client/app/pages/calendar.vue`
- Composable: `fetchSessionRange()` and `useSessionMutations()`
- API: `GET /sessions?from&to`, `POST /sessions`, `PATCH /sessions/:id`, `DELETE /sessions/:id`
- Envelope use: range fetch uses `request<TeachingSession[]>()`, expected unwrapped array.
- Role behavior: edit controls depend on `auth.role === 'TEACHER'`.
- Status: Static mapped; runtime blocked.
- Evidence: API/page contract appears coherent; default seed has no sessions, so blank calendar is expected unless fixture sessions are added.
- Suspected Layer: Seed/Data if empty under default seed.
- Severity: Medium because DATA-02 depends on live sessions once fixture exists.

## Teacher Route: Classes

- Page: `client/app/pages/classes.vue`
- Composable: `useClasses(search)`
- Query key: `['classes', search]`
- API: `GET /classes?limit=100`, search variant.
- Envelope use: `requestPaged<ClassItem[]>()`; page reads `data.value?.data ?? []`.
- Backend: `ClassController.findAll()` available to teacher/assistant/student with service scoping.
- Status: Static mapped; runtime blocked.
- Evidence: default seed creates `Japanese N5`, so this is the best first runtime reproduction route. If UI is empty after teacher login, likely API/auth/tenant or runtime issue, not frontend unwrap.
- Suspected Layer: Unknown until smoke test; static contract passes.
- Severity: High to verify because seed guarantees data exists.

## Teacher Route: Students

- Page: `client/app/pages/students.vue`
- Composable: `useStudents(search)`
- API: `GET /students?limit=100`
- Envelope use: paged envelope read as `data.value?.data`.
- Backend: `StudentController.list()` is `@Roles(Role.TEACHER)` only.
- Status: Static mapped; runtime blocked.
- Evidence: default seed has no students, so empty table is expected until teacher creates a student or fixture adds one.
- Suspected Layer: Seed/Data for default empty state.
- Severity: Medium.

## Teacher Route: Assistants

- Page: `client/app/pages/assistants.vue`
- Composable: `useAssistants(search)`
- API: `GET /assistants?limit=100`
- Envelope use: paged envelope read as `data.value?.data`.
- Backend: list is teacher-only.
- Status: Static mapped; runtime blocked.
- Evidence: default seed has no assistants; empty table expected.
- Suspected Layer: Seed/Data.
- Severity: Low for teacher/student v1 except when assistant assignment blocks document/session setup.

## Teacher Route: Documents

- Page: `client/app/pages/documents.vue`
- Composables: `useDocuments(category)`, `useClasses()`, `useStudents()`
- API: `GET /documents?limit=100`, `GET /classes?limit=100`, `GET /students?limit=100`
- Envelope use: all paged results read as `.data`.
- Backend: teacher sees tenant documents; assignment mutations teacher/assistant.
- Status: Static mapped; runtime blocked.
- Evidence: default seed has no documents/students, but has classes for class assignment picker.
- Suspected Layer: Seed/Data for empty docs; possible UI-state issue if assignment dialog assumes student rows exist.
- Severity: Medium.

## Teacher Route: Payments

- Page: `client/app/pages/payments.vue`
- Composables: `useTuitions()`, `useTuitionDetail()`, `useClasses()`, `useStudents()`
- API: `GET /payments/tuitions?limit=100`, `GET /payments/tuitions/:id`, plus class/student lists.
- Envelope use: tuitions/classes/students read as paged `.data`; detail unwrapped object.
- Backend: teacher sees tenant tuition rows; detail is tenant scoped.
- Status: Static mapped; runtime blocked.
- Evidence: default seed has no students or tuitions, so list is expected empty. Create dialog cannot be usefully tested until a student exists.
- Suspected Layer: Seed/Data.
- Severity: Medium.

## Teacher Route: Reports

- Page: `client/app/pages/reports.vue`
- Composable/API: `useClasses()` for selector; direct download URLs built from runtime config for `/reports/tuition.xlsx` and `/reports/scores.xlsx`.
- Backend: `ReportController` is teacher-only.
- Status: Static mismatch against frontend pattern; runtime blocked.
- Evidence: Page builds `window.open(url)` style direct downloads from public API base. Because this does not use `useApi`, bearer token attachment depends on browser behavior or backend download auth expectations. If guarded endpoint requires JWT header, direct URL download may fail.
- Suspected Layer: Component/Auth integration.
- Severity: Medium.

## Teacher Route: Audit Logs

- Page: `client/app/pages/audit-logs.vue`
- Composable: `useAuditLogs()`
- API: `GET /audit-logs?limit=100`
- Envelope use: paged `.data`.
- Backend: `@Roles(Role.TEACHER, Role.SUPER_ADMIN)`.
- Status: Static mapped; runtime blocked.
- Evidence: Contract passes. Seed likely has no audit rows unless prior mutations generated logs.
- Suspected Layer: Seed/Data.
- Severity: Low.

## Teacher Route: Profile

- Page: `client/app/pages/profile.vue`
- Composable/API: direct `useApi().request` to `GET /users/me/profile` and `PATCH /users/me/profile`
- Envelope use: unwrapped object.
- Backend: user profile route exists for authenticated user.
- Status: Static mismatch against project convention; runtime blocked.
- Evidence: Page calls API directly instead of a feature composable. This is not necessarily a display bug, but it is a pattern exception to account for before UI refresh.
- Suspected Layer: Component/composable boundary.
- Severity: Low.

## Candidate Teacher Bug Rows

| Candidate | Role | Route/Page | Expected Data | Observed UI | Suspected Layer | Evidence | Severity | Next Action |
|-----------|------|------------|---------------|-------------|-----------------|----------|----------|-------------|
| T-001 | Teacher | `/classes` | Seed class `Japanese N5` | Runtime blocked | Unknown | Seed creates class; page/composable unwrap matches | High | First live smoke test after Node/npm available. |
| T-002 | Teacher | `/reports` | Download authenticated reports | Runtime blocked | Store/Auth or Component | Direct URL download bypasses `useApi` Authorization header | Medium | Verify report download under teacher login; consider authenticated blob fetch in Phase 3. |
| T-003 | Teacher | `/profile` | Current user profile | Runtime blocked | Component | Direct API call in page, not feature composable | Low | Move behind composable during UI polish if touched. |
| T-004 | Teacher | Seed login | Demo teacher can login with documented credentials | Runtime blocked | Seed/Data | README says `Password123!`; seed hashes `admin123!` | High | Fix docs or seed before manual smoke tests. |

## Blocked Runtime Checks

- Teacher login with seed credentials.
- Classes page confirms seed class displays.
- Calendar confirms sessions display after creating fixture session.
- Dashboard confirms counts and upcoming sessions after fixture data.
- Documents/payments confirm data after fixture students/documents/tuitions.

