# Phase 3 Research: Teacher Workflow Polish & Fixes

**Phase:** 03-teacher-workflow-polish-fixes
**Created:** 2026-06-21
**Status:** Complete

## Scope & Objective

Phase 3 is focused on polishing the teacher daily workflows across all teacher-facing pages and resolving several critical data-display and stability bugs. Specifically:
1. Ensure all teacher-facing pages adopt the Phase 2 visual refresh: standardizing layout using `AppPageHeader`, wrapping content with `AppState` where loading, empty, error, or forbidden states are needed.
2. Implement class-based color coding in the teacher calendar, where events are colored by class, with robust fallback colors when no color is selected.
3. Improve validation error display and save/delete notifications inside `SessionDialog.vue` without altering the existing API contracts.
4. Establish a unified, consistent snackbar notification pattern (green for success, red for error) across all teacher CRUD actions.
5. Create a `useProfile` composable to refactor `/profile.vue` away from direct API requests, resolving pattern drift (BUG-009).
6. Fix BUG-007 by switching `/reports` Excel downloads from direct URLs to authenticated blob fetches via `$fetch`/`useApi`.
7. Align any password/credentials discrepancies between docs and seed if necessary (smoke tests verify that `admin123!` works for teacher, student, and admin).

---

## Detailed Findings

### 1. Unified Snackbar System
Currently, pages like `calendar.vue` have their own local reactive `snackbar` state. Creating a central `useSnackbar` composable will avoid code duplication and ensure standard duration, colors, and design across the entire application. The actual `<v-snackbar>` can be hosted once in the `default.vue` layout.

### 2. Dashboard 7-Day Window & Live Refetch
* **Current state:** The dashboard fetches stats from the backend. The teacher's upcoming sessions list is limited to `take: 5` scheduled sessions starting from `now`.
* **Polish action:**
  * Add a manual refresh button inside the `AppPageHeader` slot on `/dashboard` that triggers `refetch` from TanStack Query.
  * In the backend `DashboardService.teacherStats()`, change the upcoming sessions range to query specifically from `now` to `7 days from now` (7-day window) and remove/expand the `take: 5` limit to show all sessions for the week.

### 3. Calendar & Session Dialog Polish
* **Class event coloring:** Use `s.class.color` with a hash fallback based on `s.class.id` to map a distinct color for each class.
* **Inline validation:** Wrap fields in a `v-form` ref inside `SessionDialog.vue`. Provide inline validation rules for required fields, time range validity (end time > start time), and date range validity (end date >= start date in recurring mode).
* **Snackbars:** Replace dialog local alert blocks or alerts with consistent success notifications on save/delete using the global snackbar.

### 4. Visual System & AppState Integration
Every teacher page needs to use:
* `<AppPageHeader title="..." subtitle="..." icon="..." />`
* `<AppState v-if="isLoading" variant="loading" />`
* `<AppState v-else-if="error" variant="error" @action="refetch()" />`
* `<AppState v-else-if="isEmpty" variant="empty" />`

Below is the status of page compliance:
* `/dashboard.vue`: Uses header/state. Needs refresh button.
* `/calendar.vue`: Uses header/state. Needs class coloring.
* `/classes.vue`: Has direct headers, needs header/state.
* `/students.vue`: Has direct headers, needs header/state.
* `/assistants.vue`: Has direct headers, needs header/state.
* `/documents.vue`: Has direct headers, needs header/state.
* `/payments.vue`: Has direct headers, needs header/state.
* `/reports.vue`: Has direct headers, needs header/state.
* `/profile.vue`: Has direct headers, needs header/state and `useProfile`.
* `/audit-logs.vue`: Has direct headers, needs header/state.

### 5. Profile page & `useProfile` composable
A new `useProfile` composable in `client/app/composables/useProfile.ts` will wrap TanStack Query for `GET /users/me/profile` and TanStack Mutation for `PATCH /users/me/profile`.

### 6. Report Downloads (BUG-007)
The report download in `reports.vue` has already been updated to use authenticated `$fetch` with authorization header and responseType `blob`. No further action is required unless runtime validation reveals an authentication/bearer issue.

---

## Verification Strategy

* **Build Validation:** Run `npm run typecheck`, `npm run lint`, and `npm run build` inside `client/` to verify all components compile successfully.
* **Backend Validation:** Run `npm run lint`, `npm run build`, and `npm test` inside `server/` to verify the dashboard query changes compile and pass tests.
* **Manual Smoke Test:** Log in as teacher, verify each polished page's layout, create/edit classes and sessions, view color-coded events, and trigger error/success snackbars.
