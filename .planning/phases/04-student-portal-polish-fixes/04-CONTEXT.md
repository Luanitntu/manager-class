# Phase 4: Student Portal Polish & Fixes - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the student experience usable and trustworthy across dashboard, schedule/classes, documents, scores/comments, payments, and profile. It closes the Phase 1 student-facing data-display bugs (BUG-003, BUG-004, BUG-005, BUG-008) and the remaining Phase 4 requirements (UI-02, DATA-04, DATA-05, BUG-05). The work should keep the Phase 2 visual system, preserve role-aware navigation, avoid center-role scope, and avoid large new modules beyond the minimal endpoints/composables needed for student self-service data.

</domain>

<decisions>
## Implementation Decisions

### Student Dashboard
- **D-01:** Student dashboard should use an overview plus sections layout, not stats-only and not a single today-only panel.
- **D-02:** Dashboard section order is Schedule, Documents, Scores, Payments.
- **D-03:** Dashboard should use targeted queries for documents, payments, and scores/comments instead of enriching `/dashboard` with every student portal datum.
- **D-04:** Each dashboard section should show action-oriented empty states, such as no assigned documents, no scores yet, and no payments yet. Do not hide empty sections or collapse the page into one global empty state.

### Scores And Comments
- **D-05:** Phase 4 should show scores/comments as student dashboard previews rather than adding a dedicated scores page.
- **D-06:** Dashboard previews should show the latest 3 scores and latest 3 comments.
- **D-07:** Add student self endpoints/composables for scores and comments, such as `/students/me/scores` and `/students/me/comments`, so the student UI does not need to know its own user id.
- **D-08:** Student comments should render as a teacher feedback/progress timeline with category, author, date, and content.

### Documents And Payments
- **D-09:** Keep `/documents` and `/payments` as shared routes, but branch the UI by role so students get read-only focused views and teachers keep management views.
- **D-10:** Student documents should use material cards with type icon, title, category, assignment context when available, and Open/Download actions.
- **D-11:** Student payments should use account-style tuition cards with class, total/paid/remaining, due date, status chip, and View history.
- **D-12:** Teacher-only helper queries such as `useStudents()` and `useClasses()` must be gated by role before query execution so student pages do not call teacher-only endpoints.

### Demo Data And Verification
- **D-13:** Add minimal student seed/demo fixture data for Phase 4 and Phase 5 smoke testing.
- **D-14:** Use a documented simple demo student account, such as `student@example.com` with the same demo password pattern as the teacher seed, and document it in `README.md`.
- **D-15:** Seed one full student smoke path: one student, one enrollment, one assigned document, one tuition with partial payment/history, one score, one comment, and one upcoming session.
- **D-16:** Phase 4 verification should include manual student smoke checks plus targeted backend tests where backend logic changes, especially self endpoints, role-scope behavior, and payment/status logic.

### The Agent's Discretion
- The agent may choose the exact student dashboard card and section component structure, provided the section order and data visibility decisions above are preserved.
- The agent may choose whether the student self endpoints are implemented as `/students/me/*` or an equivalent self-scoped path, provided the frontend does not need to know the student id.
- The agent may choose exact empty-state copy and card styling, provided states stay distinct from loading/error/permission failures.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope
- `.planning/PROJECT.md` - v1 scope, teacher/student priority, calendar-first teacher workflow, PREP-inspired but original UI direction, center role deferred.
- `.planning/REQUIREMENTS.md` - Phase 4 mapped requirements: UI-02, DATA-04, DATA-05, BUG-05, plus Phase 5 verification expectations.
- `.planning/ROADMAP.md` - Phase 4 goal, success criteria, and boundaries.
- `.planning/STATE.md` - Current milestone and current phase state.
- `docs/GOOGLE_STITCH_UI_BRIEF.md` - Product/page/role inventory for the requested new UI design direction.

### Prior Phase Findings
- `.planning/phases/01-audit-data-flow-baseline/01-BUG-LEDGER.md` - Student bugs BUG-003, BUG-004, BUG-005, BUG-006, BUG-008 and suspected layers.
- `.planning/phases/01-audit-data-flow-baseline/01-AUDIT-SUMMARY.md` - Phase 1 student/auth audit summary and data-display risks.
- `.planning/phases/02-visual-system-app-shell-refresh/02-CONTEXT.md` - Role-aware nav, student dashboard priority, mobile bottom nav, state handling, responsive decisions.
- `.planning/phases/02-visual-system-app-shell-refresh/02-UI-SPEC.md` - Shared visual system contract for student-facing pages.
- `.planning/phases/03-teacher-workflow-polish-fixes/03-CONTEXT.md` - Teacher workflow decisions and deferred student-facing fixes now in scope.

### Codebase Map
- `.planning/codebase/STRUCTURE.md` - Frontend page/composable/component locations and backend module layout.
- `.planning/codebase/CONVENTIONS.md` - Existing Nuxt/Vuetify/composable and Nest service/repository patterns.
- `.planning/codebase/STACK.md` - Nuxt 4, Vue 3, Vuetify, Pinia, TanStack Query, FullCalendar, NestJS, Prisma stack details.
- `.planning/codebase/CONCERNS.md` - Tenant isolation, missing frontend tests, and other reliability concerns.

### Key Frontend Files
- `client/app/pages/dashboard.vue` - Existing role-aware dashboard page; student sections should expand from here.
- `client/app/pages/calendar.vue` - Existing schedule/calendar view for students and teachers.
- `client/app/pages/classes.vue` - Existing classes route used by student navigation.
- `client/app/pages/documents.vue` - Existing shared documents route; must branch by role and gate teacher-only queries.
- `client/app/pages/payments.vue` - Existing shared payments route; must branch by role and gate teacher-only queries.
- `client/app/pages/profile.vue` - Student profile route should keep Phase 3 profile composable pattern.
- `client/app/composables/useDashboard.ts` - Existing dashboard stats/upcoming sessions composable.
- `client/app/composables/useDocuments.ts` - Existing documents list/mutations composable; student list already backend-scoped but page helper queries are not.
- `client/app/composables/usePayments.ts` - Existing tuition/detail composables; backend already scopes student list/detail.
- `client/app/composables/useStudents.ts` - Existing teacher/student detail composables; needs self-scoped student score/comment support or equivalent.
- `client/app/utils/navigation.ts` - Role-aware nav and student default route decisions.
- `client/app/components/AppPageHeader.vue` - Shared Phase 2 page header.
- `client/app/components/AppState.vue` - Shared loading/empty/error state component.

### Key Backend Files
- `server/src/modules/dashboard/dashboard.service.ts` - Existing student dashboard stats: currentClasses, remainingTuition, totalScores, upcomingSessions.
- `server/src/modules/student/student.controller.ts` - Existing score/comment endpoints; add self-scoped endpoints here or equivalent.
- `server/src/modules/student/student.service.ts` - Existing student profile/score/comment business logic.
- `server/src/modules/document/document.service.ts` - Existing role-scoped document list/view/download behavior for students.
- `server/src/modules/payment/payment.service.ts` - Existing student-scoped tuition list/detail behavior.
- `server/prisma/seed.ts` - Add minimal student smoke fixture data.
- `README.md` - Document demo student credentials and smoke-test data.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/app/pages/dashboard.vue`: Already branches dashboard cards by role and displays upcoming sessions; extend student view with sections fed by targeted queries.
- `client/app/composables/useDashboard.ts`: Existing `/dashboard` query provides currentClasses, remainingTuition, totalScores, and upcomingSessions for students.
- `client/app/composables/useDocuments.ts`: Existing `useDocuments(category)` calls `/documents`; backend already returns student-shared documents for student actors.
- `client/app/composables/usePayments.ts`: Existing `useTuitions()` and `useTuitionDetail()` call student-scoped backend paths for student actors.
- `client/app/composables/useStudents.ts`: Existing score/comment composables require a student id; Phase 4 should add self-scoped equivalents for logged-in student usage.
- `client/app/components/AppPageHeader.vue` and `client/app/components/AppState.vue`: Shared visual/state components to keep student pages consistent with Phase 2/3.
- `client/app/utils/navigation.ts`: Student navigation already includes Dashboard, Schedule, Classes, Documents, Payments, Profile.

### Established Patterns
- Frontend pages should use feature composables rather than direct API calls.
- Backend follows Controller -> Service -> Repository with tenant isolation enforced by `teacherId`/`tenantId` and actor role checks.
- TanStack Query is the existing fetch/cache layer for page data and targeted section queries.
- Role-aware UI should hide or omit actions the actor cannot use, not show disabled teacher controls to students.
- Empty/loading/error/forbidden states must stay separate so data-display bugs are not hidden by visual polish.

### Integration Points
- Student dashboard connects to `/dashboard` plus targeted document/payment/score/comment queries.
- Student documents page connects to `/documents` but must not call teacher-only `useStudents()` or teacher-only assignment helpers for student actors.
- Student payments page connects to `/payments/tuitions` and `/payments/tuitions/:id`; create/record/reminder UI must remain teacher-only.
- Student score/comment preview connects to new self-scoped student endpoints/composables.
- Seed fixture connects `server/prisma/seed.ts`, README credentials, and Phase 4/5 manual smoke checks.

</code_context>

<specifics>
## Specific Ideas

- Student dashboard should feel like a portal: schedule first, then documents, scores, and payments.
- Scores/comments should be useful immediately but not become a large new academic-records module in Phase 4.
- Student payments should feel like an account/balance view rather than a teacher admin table.
- Demo data should cover a complete student smoke path so data-display fixes can be verified without manual database setup.

</specifics>

<deferred>
## Deferred Ideas

- Dedicated `/scores` page or larger academic progress module is deferred beyond Phase 4.
- Class-grouped comments are deferred because the current comment model does not include `classId`.
- Full frontend automated test infrastructure remains deferred to Phase 5 unless a narrow test is simple and local.
- Broad responsive QA remains Phase 5 scope.
- Center role workflows remain v2 scope.

</deferred>

---

*Phase: 4-Student Portal Polish & Fixes*
*Context gathered: 2026-06-21*
