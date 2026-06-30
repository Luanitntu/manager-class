# Phase 3: App Shell & Shared Surface Migration - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 migrates the app shell and shared/high-traffic surfaces away from remaining Vuetify and old CSS/SCSS patterns while preserving role-aware navigation, teacher calendar access, authentication flows, and teacher/student daily workflows. The phase uses the Phase 2 Tailwind UI kit for teacher/student/auth/shared blockers first, may opportunistically clean very small low-risk non-core items, and must explicitly defer admin/center-heavy pages and Phase 4 priority page redesigns.

This phase is not a redesign of `/assistants`, `/assistants/[id]`, `/audit-logs`, or `/profile`; those remain Phase 4. This phase should leave the teacher/student/auth/shared scope scan-clean for Vuetify/SCSS markers where practical, with remaining out-of-scope debt documented.

</domain>

<decisions>
## Implementation Decisions

### Phase 3 Scope Depth
- **D-01:** Prioritize teacher, student, auth, and shared-surface blockers. Admin-heavy and center-adjacent pages remain deferred unless a change is required to preserve the shared shell.
- **D-02:** Very small, low-risk non-core items may be cleaned opportunistically, especially icon-only landing/marketing replacements such as `v-icon` to `AppIcon`, as long as they do not expand the phase.
- **D-03:** The main scope should be scan-clean for `<v-*>`, SCSS, and old style-coupling markers after Phase 3. Anything intentionally left outside scope must be listed clearly for Phase 5 and future cleanup.

### Shared Dialog Strategy
- **D-04:** Treat `SessionDialog` as the highest-risk shared dialog because it is calendar-critical. Migrate or plan it separately with stronger QA than other dialogs.
- **D-05:** For `SessionDialog`, scheduling correctness is the priority over visual polish. Preserve class/student/assistant selection, start/end time, recurrence/conflict behavior, create/edit behavior, and existing data contracts.
- **D-06:** `StudentDetailDialog` and `AssistantDetailDialog` may be partially migrated when the slice is low-risk, such as header/avatar/cards/tables/chips. Complex form/tab areas may be deferred with inventory notes rather than forcing a large rewrite.

### Calendar and Dashboard Order
- **D-07:** Anchor Phase 3 with the teacher calendar workflow. Migrate `TeacherCalendar`, teacher calendar board/header/detail snippets, and snackbar/toast feedback before lower-priority surfaces.
- **D-08:** After teacher calendar, prioritize teacher dashboard, then student dashboard and schedule surfaces.
- **D-09:** Calendar migration should preserve the existing layout, hierarchy, actions, states, and workflow while allowing small UI-kit polish. Do not perform a major calendar redesign in Phase 3.

### Auth Surface Direction
- **D-10:** Migrate the whole auth surface in Phase 3: `AuthShell`, login, register, forgot password, reset password, verify email, and auth wrappers.
- **D-11:** Auth UI should align with the new Tailwind shell direction while preserving content, validation behavior, submit/loading/error states, and auth flows.
- **D-12:** Keep auth and validation logic in page/form/composable code. `UiInput`, `UiButton`, `UiAlert`, and related primitives should only receive and display external state such as `error`, `disabled`, and `loading`.

### Visual QA and Evidence
- **D-13:** Phase 3 visual QA should cover teacher, student, and assistant shell branches. Admin shell can be checked only if shared shell changes require it; admin pages stay deferred.
- **D-14:** QA must cover desktop and mobile-width viewports for touched surfaces, especially shell/drawer, auth pages, calendar, dashboards, and migrated dialogs.
- **D-15:** Verification evidence should include checklist notes plus screenshots or manual visual notes for risky surfaces. Full screenshot matrix for every role/page is not required until Phase 5 unless the planner finds risk.

### the agent's Discretion
- The planner may choose exact plan splits and whether to migrate a non-critical dialog area now or defer it, provided the decision follows the risk rules above.
- The planner may choose exact UI kit components and variants, but must stay Tailwind-only and preserve feature composable/data-flow ownership.
- The planner may include opportunistic tiny cleanup only when it remains low-risk and does not delay teacher/student/auth/shared migration.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Current milestone, product priorities, teacher/student focus, Tailwind-only direction, and visual parity constraints.
- `.planning/ROADMAP.md` - Phase 3 scope, success criteria, and Phase 4/5 boundaries.
- `.planning/REQUIREMENTS.md` - APP-01 through APP-05 plus milestone verification requirements.
- `.planning/STATE.md` - Current project state and transition notes from Phase 2 to Phase 3.

### Prior Phase Outputs
- `.planning/phases/01-styling-platform-cutover/01-CONTEXT.md` - Real Vuetify/SCSS platform cutover decisions and `AppIcon` strategy.
- `.planning/phases/01-styling-platform-cutover/01-MIGRATION-INVENTORY.md` - Detailed inventory of remaining Vuetify, SCSS, and CSS-coupled surfaces.
- `.planning/phases/01-styling-platform-cutover/01-VERIFICATION.md` - Phase 1 verification and platform cutover status.
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-CONTEXT.md` - Tailwind-only UI kit rules, visual parity requirements, and adoption boundaries.
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-HANDOFF.md` - Phase 3/4 adoption notes and available `Ui*` primitives.
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-UI-SPEC.md` - UI design contract for shared components and visual rules.

### Codebase Maps
- `.planning/codebase/STACK.md` - Nuxt/Vue/Tailwind stack context and frontend verification scripts.
- `.planning/codebase/STRUCTURE.md` - Frontend source layout, page/component locations, and where shared UI code lives.
- `.planning/codebase/CONVENTIONS.md` - Frontend naming, component, composable, and code style conventions.
- `.planning/codebase/TESTING.md` - Verification commands and frontend test limitations.

### Current Frontend Files
- `client/app/components/ui/README.md` - UI kit source rules, migration map, component inventory, and Phase 3 adoption notes.
- `client/app/components/ui/` - Tailwind-only primitives available for migration.
- `client/app/components/AppIcon.vue` - MDI icon primitive retained after Vuetify removal.
- `client/app/components/AppToast.vue` - Toast surface migrated in Phase 2 and replacement for snackbar-style feedback.
- `client/app/components/TablePager.vue` - Pagination wrapper over `UiPagination`.
- `client/app/layouts/default.vue` - Role-aware shell, drawer, topbar, teacher calendar entry point, student shell branch, assistant/admin nav branches.
- `client/app/layouts/auth.vue` - Auth layout wrapper.
- `client/app/components/AuthShell.vue` - Auth brand wrapper still listed as a Phase 3 auth/shared target.
- `client/app/components/login/LoginFormPane.vue` - Login form target.
- `client/app/components/login/LoginVisual.vue` - Login visual target.
- `client/app/components/register/RegisterFormPane.vue` - Register form target.
- `client/app/components/register/RegisterVisual.vue` - Register visual target.
- `client/app/pages/forgot-password.vue` - Auth recovery target.
- `client/app/pages/reset-password.vue` - Auth reset target.
- `client/app/pages/verify-email.vue` - Auth verification target.
- `client/app/components/calendar/TeacherCalendar.vue` - Teacher calendar orchestrator and critical workflow surface.
- `client/app/components/calendar/TeacherCalendarBoard.vue` - Teacher calendar board target.
- `client/app/components/calendar/TeacherCalendarHeader.vue` - Teacher calendar header target.
- `client/app/components/calendar/TeacherSessionDetail.vue` - Teacher session detail target.
- `client/app/components/calendar/StudentCalendar.vue` - Student calendar feedback target.
- `client/app/components/dashboard/TeacherWorkspaceDashboard.vue` - Teacher dashboard target after calendar.
- `client/app/components/dashboard/StudentWorkspaceDashboard.vue` - Student dashboard target after teacher dashboard.
- `client/app/components/StudentSchedule.vue` - Student schedule target.
- `client/app/components/SessionDialog.vue` - Calendar-critical shared dialog.
- `client/app/components/StudentDetailDialog.vue` - Shared student detail dialog; migrate low-risk areas or defer complex areas.
- `client/app/components/AssistantDetailDialog.vue` - Shared assistant detail dialog; migrate low-risk areas or defer complex areas.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/app/components/ui/UiPage.vue`, `UiPageHeader.vue`, `UiToolbar.vue`, `UiSection.vue`, and `UiCard.vue` can replace shell/dashboard/card surfaces.
- `UiButton`, `UiIconButton`, `UiInput`, `UiTextarea`, `UiSelect`, `UiCheckbox`, `UiSegmentedControl`, and `UiActionGroup` can replace auth, calendar, dialog, and dashboard controls.
- `UiTable`, `UiList`, `UiListItem`, `UiBadge`, `UiAvatar`, `UiMetricCard`, `UiStatusDot`, and `UiPagination` can replace data and summary surfaces in dashboards and dialogs.
- `UiAlert`, `UiToast`, `UiSkeleton`, `UiEmptyState`, and `UiProgress` can replace alerts, snackbars, loading, empty, and progress states.
- `UiDialog`, `UiConfirmDialog`, and `UiTabs` provide the foundation for shared dialog and tab migrations.
- `AppIcon` keeps existing MDI icon names available without Vuetify.
- `AppToast` should replace `v-snackbar` style feedback in calendar surfaces.

### Established Patterns
- Frontend is Nuxt 4/Vue 3 with Tailwind 4 via `@tailwindcss/vite`.
- UI kit components are data-agnostic and must not call APIs, stores, feature composables, or auth helpers.
- Feature pages/components should keep data fetching, validation, mutations, filtering, formatting, and tenant-aware behavior in existing composables or page-owned logic.
- `default.vue` already contains a Tailwind/plain Vue role-aware shell; Phase 3 should preserve auth state, logout behavior, public announcement display, language switcher, avatar handling, mobile drawer behavior, and teacher calendar prominence.
- Phase 1 retained `@mdi/font`; Phase 3 should not switch icon libraries.

### Integration Points
- Teacher calendar migration connects to `TeacherCalendar`, `TeacherCalendarBoard`, `TeacherCalendarHeader`, `TeacherSessionDetail`, `StudentCalendar`, and `SessionDialog`.
- Auth migration connects to `auth.vue`, `AuthShell`, login/register component panes, and forgot/reset/verify pages.
- Dashboard migration connects to teacher and student workspace dashboard components and student schedule components.
- Dialog migration connects to route pages that open `SessionDialog`, `StudentDetailDialog`, and `AssistantDetailDialog`; preserve props/events and public behavior.
- Frontend verification should use `npm run lint`, `npm run typecheck`, and `npm run build` from `client/`. Backend checks are only needed if backend files change.

</code_context>

<specifics>
## Specific Ideas

- User wants recommendations included during planning discussions, but final planning artifacts should be clear enough for downstream agents without re-asking.
- Education SaaS feel inspired by PREP remains only inspiration; do not copy brand/assets.
- Phase 3 should feel like a migration and polish pass, not a new product feature pass.
- Calendar-first teacher workflow remains the strongest product anchor.

</specifics>

<deferred>
## Deferred Ideas

- Phase 4 priority page redesign remains deferred: `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- Admin-heavy pages remain deferred unless shell/nav changes require a minimal compatibility check: `admin/health`, `admin/settings`, `admin/users/*`, and admin dashboard widgets.
- Center role remains deferred.
- Full screenshot matrix across every role/page is deferred to Phase 5 unless implementation risk demands it earlier.
- Complex portions of `StudentDetailDialog` and `AssistantDetailDialog` may be deferred if they do not fit safe Phase 3 scope.

</deferred>

---

*Phase: 3-App Shell & Shared Surface Migration*
*Context gathered: 2026-06-30*
