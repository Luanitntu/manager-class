# Phase 1 Route/API/Composable Audit Matrix

## Shared Data Contracts

| Contract | Source | Expected Shape | Audit Notes |
|----------|--------|----------------|-------------|
| Standard API envelope | `client/app/composables/useApi.ts` | `{ success: true, data: T, meta?: PaginationMeta }` | `request<T>()` unwraps to `T`; `requestPaged<T>()` returns full envelope. |
| Pagination meta | `useApi.requestPaged`, backend `PaginatedResult` | page, limit, total, totalPages | List pages should read `data.value?.data` for rows and `data.value?.meta` for counts. Current pages mostly ignore meta. |
| Auth header | `useApi.ts` | `Authorization: Bearer <accessToken>` when token exists | Upload in `useDocuments.ts` bypasses `useApi` but manually attaches the same header. |
| Auth store | `client/app/stores/auth.ts` | user, accessToken, refreshToken persisted | Store user lacks `tenantId`; frontend only uses role, id/email/name. Stale persisted tokens can make routes appear authenticated until API calls fail. |
| Route middleware | `client/app/middleware/auth.global.ts` | unauthenticated users redirected to `/login`; authenticated login/register redirected to `/calendar` | Role-specific home routing is incomplete for students; authenticated students land on calendar. |
| Role scoping | Backend services | teacher via `teacherId`/tenant, student via own id/enrollments/shared resources | Must audit teacher-owned lists separately from student-scoped lists. |

## Teacher Routes

| Role | Route | Page File | Composable/API | Expected Data | Method | Status |
|------|-------|-----------|----------------|---------------|--------|--------|
| Teacher | `/dashboard` | `client/app/pages/dashboard.vue` | `useDashboard()` -> `GET /dashboard` via `request` | counts, tuition totals, upcoming sessions | Static + runtime when Node available | Static mapped |
| Teacher | `/calendar` | `client/app/pages/calendar.vue` | `fetchSessionRange()` -> `GET /sessions?from&to`; mutations -> `/sessions` | sessions in selected date range | Static + runtime when data exists | Static mapped |
| Teacher | `/classes` | `client/app/pages/classes.vue` | `useClasses()` -> `GET /classes?limit=100` via `requestPaged` | teacher classes with counts | Static + runtime | Static mapped |
| Teacher | `/students` | `client/app/pages/students.vue` | `useStudents()` -> `GET /students?limit=100` via `requestPaged` | tenant students | Static + runtime | Static mapped |
| Teacher | `/assistants` | `client/app/pages/assistants.vue` | `useAssistants()` -> `GET /assistants?limit=100` via `requestPaged` | tenant assistants | Static + runtime | Static mapped |
| Teacher | `/documents` | `client/app/pages/documents.vue` | `useDocuments()` -> `GET /documents?limit=100`, plus `useClasses`, `useStudents` | owned docs, assignment pickers | Static + runtime | Static mapped |
| Teacher | `/payments` | `client/app/pages/payments.vue` | `useTuitions()` -> `GET /payments/tuitions?limit=100`, plus `useClasses`, `useStudents` | tuition list, detail, payment records | Static + runtime | Static mapped |
| Teacher | `/reports` | `client/app/pages/reports.vue` | direct download URLs `/reports/tuition.xlsx`, `/reports/scores.xlsx`; `useClasses()` | report buttons and class selector | Static + runtime | Static mapped; direct URL bypasses feature composable |
| Teacher | `/audit-logs` | `client/app/pages/audit-logs.vue` | `useAuditLogs()` -> `GET /audit-logs?limit=100` via `requestPaged` | audit log rows | Static + runtime | Static mapped |
| Teacher | `/profile` | `client/app/pages/profile.vue` | Direct `useApi().request` -> `/users/me/profile` | current user profile | Static + runtime | Static mapped; page calls API directly |

## Student Routes

| Role | Expected Flow | Current Route/Page | Composable/API | Expected Data | Method | Status |
|------|---------------|--------------------|----------------|---------------|--------|--------|
| Student | Dashboard | `/dashboard`, `dashboard.vue` | `useDashboard()` -> `GET /dashboard` | currentClasses, remainingTuition, totalScores, upcomingSessions | Static + runtime | Role-aware backend and page cards exist |
| Student | Schedule | `/calendar`, `calendar.vue` | `fetchSessionRange()` -> `GET /sessions?from&to` | enrolled class sessions | Static + runtime | Shared route; edit controls hidden for non-teachers |
| Student | Classes | `/classes`, `classes.vue` | `useClasses()` -> `GET /classes?limit=100` | enrolled/assigned classes | Static + runtime | Backend claims role-scoped list; page generic teacher-style list |
| Student | Documents | `/documents`, `documents.vue` | `useDocuments()` -> role-scoped `GET /documents`; also unconditional `useStudents()` | shared docs | Static + runtime | Static mismatch: student page calls teacher-only `GET /students` for assignment picker data. |
| Student | Scores/comments | No dedicated page | `useStudentScores(id)`, `useStudentComments(id)` available but no self-route using auth user id | own scores/comments | Static | Route gap |
| Student | Payments | `/payments`, `payments.vue` | `useTuitions()` -> student-scoped `GET /payments/tuitions`; also unconditional `useStudents()` | own tuition/payment history | Static + runtime | Static mismatch: student page calls teacher-only `GET /students` for create form data. |
| Student | Profile | `/profile`, `profile.vue` | Direct `useApi().request` -> `/users/me/profile` | own profile | Static + runtime | Exists; direct API call in page |

## API Envelope Risk Checklist

- Paged composables: `useClasses`, `useStudents`, `useAssistants`, `useDocuments`, `usePayments`, `useAudit` return full envelope.
- Paged pages currently read `data.value?.data ?? []`, which matches `requestPaged`.
- Non-paged composables: `useDashboard`, `fetchSessionRange`, detail endpoints return unwrapped `data`.
- Mixed risk: pages that add unconditional helper queries (`useStudents`, `useClasses`) can fail due role-scope even if their primary role-scoped query succeeds.
- Direct API calls in pages: `profile.vue` and report downloads bypass feature composable pattern and need special audit attention.

## Audit Status Values

- Static mapped: page/composable/API relation identified.
- Static mismatch: code comparison shows likely broken display or role-scope issue.
- Blocked: runtime unavailable or seed lacks needed data.
- Reproduced: runtime evidence confirms failure.
- Not reproducible: runtime evidence confirms page shows expected data.

