# Phase 3: Teacher Workflow Polish & Fixes - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes teacher daily workflows polished and reliable across dashboard, calendar, classes, students, assistants, documents, payments, reports, and profile. It closes the Phase 1 audit bugs that apply to teacher flows (BUG-001, BUG-002, BUG-007, BUG-009), applies the Phase 2 visual system to all teacher pages, and ensures data displays correctly when backend data exists. It does not add new product modules, refactor dialogs/popups into pages (teammate is handling that separately), or introduce center-role workflows.

</domain>

<decisions>
## Implementation Decisions

### Dashboard
- **D-01:** Teacher dashboard loads data live on page open via `useDashboard` composable + TanStack Query, with a manual refresh button using `refetch`. No full page reload needed.
- **D-02:** Dashboard displays all available data fields: class count, student count, today's and upcoming sessions (7-day window), outstanding tuition totals, and alerts (if backend returns them).
- **D-03:** Dashboard layout uses horizontal stat cards at the top (classes, students, tuition), with upcoming sessions list and alerts below. Standard SaaS dashboard pattern.

### Calendar
- **D-04:** Calendar events are color-coded by class — each class gets a distinct color mapped from class ID. FullCalendar `eventColor` per-event is used.
- **D-05:** SessionDialog (create/edit) receives focused polish: clear validation error display, consistent success/error notifications, but no new fields added.
- **D-06:** Calendar page adopts `AppPageHeader` + `AppState` from Phase 2 for consistent loading/empty/error states.
- **D-07:** Recurring session and conflict detection logic stays unchanged. Phase 3 only ensures the UI displays conflict errors clearly and recurring results correctly.

### CRUD Pages & Visual System
- **D-08:** All existing dialog/popup CRUD interactions stay as-is — no refactoring dialogs into pages. Teammate is handling that separately; changes will be merged later.
- **D-09:** All teacher pages (classes, students, assistants, documents, payments, reports, audit-logs, profile) adopt Phase 2 visual system: `AppPageHeader`, `AppState`, consistent loading/empty/error states.
- **D-10:** All CRUD operations (create/update/delete) use consistent Vuetify `v-snackbar` notifications: green for success, red for error, with clear icons and messages.
- **D-11:** Profile page moves from direct `useApi().request` calls to a new `useProfile` composable, matching the established composable pattern. (Fixes BUG-009.)

### Bug Fixes
- **D-12:** BUG-002 (seed/docs password mismatch) is fixed in Phase 3 — align README credentials with seed password or vice versa. Required for any smoke testing.
- **D-13:** BUG-007 (report download missing bearer token) is fixed in Phase 3 — switch from direct URL to authenticated blob fetch via `useApi` to ensure bearer token is sent.
- **D-14:** BUG-001 (teacher `/classes` runtime verification) is smoke tested once runtime is available; fixed if data does not appear.
- **D-15:** BUG-009 (profile direct API calls) is fixed by creating `useProfile` composable (see D-11).

### Verification
- **D-16:** Every bug fix includes manual smoke test verification notes. Automated tests are added when the logic is simple and testable (e.g., seed password alignment, report auth), but not required for every fix.
- **D-17:** Frontend verification minimum: `npm run lint`, `npm run typecheck`, `npm run build` from `client/`. Backend verification: `npm run lint`, `npm run build`, `npm test` from `server/` when backend files are changed.

### the agent's Discretion
- The agent may decide the exact color palette for class-based event coloring, as long as colors are visually distinct and accessible.
- The agent may decide the internal structure of `useProfile` composable as long as it follows the existing composable pattern.
- The agent may decide the exact snackbar duration, position, and icon style as long as the pattern is consistent across all teacher pages.
- The agent may choose which teacher pages to polish first, but must complete all listed pages by the end of Phase 3.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope
- `.planning/PROJECT.md` — v1 scope, teacher/student priority, PREP-inspired but original UI direction, center role deferred.
- `.planning/REQUIREMENTS.md` — Phase 3 mapped requirements: UI-04, DATA-01, DATA-02, DATA-03, BUG-03, BUG-04.
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, and phase boundaries.
- `.planning/STATE.md` — Current milestone and current phase.

### Prior Phase Findings
- `.planning/phases/01-audit-data-flow-baseline/01-CONTEXT.md` — Phase 1 decisions: audit before redesign, teacher/student focus, bug ledger as action source.
- `.planning/phases/01-audit-data-flow-baseline/01-BUG-LEDGER.md` — All audited bugs with suspected layers, severity, and next actions.
- `.planning/phases/01-audit-data-flow-baseline/01-AUDIT-SUMMARY.md` — Phase 3 fix recommendations and systemic causes.
- `.planning/phases/02-visual-system-app-shell-refresh/02-CONTEXT.md` — Phase 2 decisions: visual system, shell, navigation, state components, responsive patterns.
- `.planning/phases/02-visual-system-app-shell-refresh/02-UI-SPEC.md` — Full UI spec for the visual system.

### Codebase Map
- `.planning/codebase/STRUCTURE.md` — Frontend page/composable/component locations and backend module layout.
- `.planning/codebase/CONVENTIONS.md` — Existing Nuxt/Vuetify/composable/backend patterns.
- `.planning/codebase/CONCERNS.md` — Known concerns: missing frontend tests, tenant isolation, document storage lifecycle.

### Key Frontend Files
- `client/app/pages/dashboard.vue` — Current teacher dashboard page.
- `client/app/pages/calendar.vue` — Current teacher calendar page with FullCalendar.
- `client/app/composables/useDashboard.ts` — Dashboard API composable.
- `client/app/composables/useSessions.ts` — Sessions API composable used by calendar.
- `client/app/components/SessionDialog.vue` — Session create/edit dialog.
- `client/app/components/AppPageHeader.vue` — Phase 2 page header component.
- `client/app/components/AppState.vue` — Phase 2 state management component (loading/empty/error/forbidden).
- `client/app/pages/profile.vue` — Profile page that needs `useProfile` composable.
- `client/app/pages/reports.vue` — Reports page with direct download URLs (BUG-007).
- `client/vuetify.config.ts` — Theme and component defaults.

### Key Backend Files
- `server/prisma/seed.ts` — Seed data (BUG-002 password fix).
- `server/src/modules/report/report.controller.ts` — Report download endpoint (BUG-007 auth).
- `server/src/modules/dashboard/dashboard.service.ts` — Dashboard data aggregation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/app/composables/useDashboard.ts`: Existing dashboard composable with API access — Phase 3 ensures the page consumes all returned fields.
- `client/app/composables/useSessions.ts`: Sessions composable already supports create/update/delete mutations and query for calendar events.
- `client/app/components/AppPageHeader.vue`: Phase 2 page header — ready for adoption across all teacher pages.
- `client/app/components/AppState.vue`: Phase 2 state wrapper — handles loading/empty/error/forbidden/success states consistently.
- `client/app/components/SessionDialog.vue`: Existing session create/edit dialog — Phase 3 polishes validation display and notifications.
- `client/app/components/StudentDetailDialog.vue`, `AssistantDetailDialog.vue`: Existing detail dialogs — kept as-is per D-08.
- `client/app/utils/error.ts`: Existing error extraction utility for consistent error messages.
- `client/vuetify.config.ts`: Phase 2 theme with blue+teal+orange palette, radius, density, component defaults.

### Established Patterns
- Frontend pages call feature composables, not raw APIs. Phase 3 extends this to profile (new `useProfile`) and fixes report download.
- Backend uses Controller → Service → Repository with tenant scoping. Dashboard aggregation happens in `dashboard.service.ts`.
- API responses wrapped by `TransformInterceptor`; pages unwrap via composables and `useApi.ts`.
- TanStack Query handles data fetching, caching, and `refetch` — dashboard refresh button leverages this.
- FullCalendar is configured in calendar page; event coloring requires mapping class colors to event objects.

### Integration Points
- Dashboard page connects to `useDashboard` composable → `dashboard.service.ts` → multiple Prisma queries.
- Calendar page connects to `useSessions` composable → session endpoints with date range parameters.
- SessionDialog connects to session create/update mutations and `SessionConflictService` for conflict checks.
- Report download connects to report controller endpoints; needs auth header for guarded routes.
- Profile page connects directly to API (needs composable wrapper).

</code_context>

<specifics>
## Specific Ideas

- User wants dashboard to feel like a proper SaaS summary page — stat cards + upcoming sessions + alerts.
- Calendar event colors by class help teachers visually distinguish their schedule at a glance.
- Dialogs/popups are NOT being refactored into pages in Phase 3 — teammate is handling that separately, will be merged later.
- All teacher pages should feel consistent with the Phase 2 visual refresh.

</specifics>

<deferred>
## Deferred Ideas

- Refactoring dialogs/popups into full pages — teammate is handling separately, will merge later.
- Student-facing bug fixes (BUG-003, BUG-004, BUG-005, BUG-006, BUG-008) belong to Phase 4.
- Center role workflows remain v2 scope.
- Full responsive QA and regression test suite belong to Phase 5.
- Frontend automated test infrastructure (Vitest/Playwright) is deferred unless a specific test is trivially easy in Phase 3.

</deferred>

---

*Phase: 3-Teacher Workflow Polish & Fixes*
*Context gathered: 2026-06-21*
