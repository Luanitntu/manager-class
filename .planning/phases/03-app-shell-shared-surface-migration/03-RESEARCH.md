# Phase 3: App Shell & Shared Surface Migration - Research

**Researched:** 2026-06-30
**Domain:** Nuxt 4 / Vue 3 Tailwind UI migration for app shell, auth, calendar, dashboards, schedule, shared dialogs
**Confidence:** HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Phase 3 Scope Depth
- **D-01:** Prioritize teacher, student, auth, and shared-surface blockers. Admin-heavy and center-adjacent pages remain deferred unless a change is required to preserve the shared shell.
- **D-02:** Very small, low-risk non-core items may be cleaned opportunistically, especially icon-only landing/marketing replacements such as `v-icon` to `AppIcon`, as long as they do not expand the phase.
- **D-03:** The main scope should be scan-clean for `<v-*>`, SCSS, and old style-coupling markers after Phase 3. Anything intentionally left outside scope must be listed clearly for Phase 5 and future cleanup.

#### Shared Dialog Strategy
- **D-04:** Treat `SessionDialog` as the highest-risk shared dialog because it is calendar-critical. Migrate or plan it separately with stronger QA than other dialogs.
- **D-05:** For `SessionDialog`, scheduling correctness is the priority over visual polish. Preserve class/student/assistant selection, start/end time, recurrence/conflict behavior, create/edit behavior, and existing data contracts.
- **D-06:** `StudentDetailDialog` and `AssistantDetailDialog` may be partially migrated when the slice is low-risk, such as header/avatar/cards/tables/chips. Complex form/tab areas may be deferred with inventory notes rather than forcing a large rewrite.

#### Calendar and Dashboard Order
- **D-07:** Anchor Phase 3 with the teacher calendar workflow. Migrate `TeacherCalendar`, teacher calendar board/header/detail snippets, and snackbar/toast feedback before lower-priority surfaces.
- **D-08:** After teacher calendar, prioritize teacher dashboard, then student dashboard and schedule surfaces.
- **D-09:** Calendar migration should preserve the existing layout, hierarchy, actions, states, and workflow while allowing small UI-kit polish. Do not perform a major calendar redesign in Phase 3.

#### Auth Surface Direction
- **D-10:** Migrate the whole auth surface in Phase 3: `AuthShell`, login, register, forgot password, reset password, verify email, and auth wrappers.
- **D-11:** Auth UI should align with the new Tailwind shell direction while preserving content, validation behavior, submit/loading/error states, and auth flows.
- **D-12:** Keep auth and validation logic in page/form/composable code. `UiInput`, `UiButton`, `UiAlert`, and related primitives should only receive and display external state such as `error`, `disabled`, and `loading`.

#### Visual QA and Evidence
- **D-13:** Phase 3 visual QA should cover teacher, student, and assistant shell branches. Admin shell can be checked only if shared shell changes require it; admin pages stay deferred.
- **D-14:** QA must cover desktop and mobile-width viewports for touched surfaces, especially shell/drawer, auth pages, calendar, dashboards, and migrated dialogs.
- **D-15:** Verification evidence should include checklist notes plus screenshots or manual visual notes for risky surfaces. Full screenshot matrix for every role/page is not required until Phase 5 unless the planner finds risk.

### the agent's Discretion

- The planner may choose exact plan splits and whether to migrate a non-critical dialog area now or defer it, provided the decision follows the risk rules above.
- The planner may choose exact UI kit components and variants, but must stay Tailwind-only and preserve feature composable/data-flow ownership.
- The planner may include opportunistic tiny cleanup only when it remains low-risk and does not delay teacher/student/auth/shared migration.

### Deferred Ideas (OUT OF SCOPE)

- Phase 4 priority page redesign remains deferred: `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- Admin-heavy pages remain deferred unless shell/nav changes require a minimal compatibility check: `admin/health`, `admin/settings`, `admin/users/*`, and admin dashboard widgets.
- Center role remains deferred.
- Full screenshot matrix across every role/page is deferred to Phase 5 unless implementation risk demands it earlier.
- Complex portions of `StudentDetailDialog` and `AssistantDetailDialog` may be deferred if they do not fit safe Phase 3 scope.

## Summary

Phase 3 should be planned as a staged replacement of old Vuetify/shared CSS surfaces with the Phase 2 local `Ui*` Tailwind primitives, not as a feature rewrite. The main implementation seam is template/styling replacement while preserving existing props, emits, route behavior, form validation, composables, calendar interactions, timezone handling, and mutation flows. [VERIFIED: 03-CONTEXT.md, 03-UI-SPEC.md, codebase scan]

The highest-risk path is teacher calendar plus `SessionDialog`. It touches scheduling mutations, recurrence, conflict-facing feedback, timezone conversion, drag/drop reschedule, create/edit saved reload, and destructive/status actions. Plan this before dashboards and keep stronger QA around create single, create recurring, edit, delete confirm, complete/reopen, drag/drop, and error toast paths. [VERIFIED: 03-CONTEXT.md, 03-UI-SPEC.md, codebase scan]

**Primary recommendation:** Split Phase 3 into shell/auth, teacher calendar + `SessionDialog`, dashboards/student schedule, low-risk shared dialogs, and final inventory/verification waves. [VERIFIED: 03-CONTEXT.md, 02-HANDOFF.md, codebase scan]

## Project Constraints (from AGENTS.md)

- Read `.planning/PROJECT.md`, `.planning/ROADMAP.md`, and relevant `.planning/codebase/*.md` before planning or editing. [VERIFIED: AGENTS.md]
- Teacher and student experiences come first; center role is deferred. [VERIFIED: AGENTS.md]
- Calendar-first teacher workflow must remain central. [VERIFIED: AGENTS.md]
- Use PREP-style education SaaS only as inspiration; do not copy brand/assets. [VERIFIED: AGENTS.md]
- Frontend stack is Nuxt 4, Vue 3, Vuetify legacy surface, Pinia, TanStack Query. [VERIFIED: AGENTS.md, client/package.json]
- Backend stack is NestJS, Prisma, PostgreSQL, Redis/BullMQ, with Controller -> Service -> Repository. [VERIFIED: AGENTS.md, .planning/codebase/ARCHITECTURE.md]
- Frontend pages should use feature composables; do not call APIs directly inside components. [VERIFIED: AGENTS.md, .planning/codebase/ARCHITECTURE.md]
- Tenant isolation is critical; teacher-owned data must be scoped by `teacherId`/`tenantId`. [VERIFIED: AGENTS.md, .planning/codebase/CONCERNS.md]
- Frontend verification is `npm run lint`, `npm run typecheck`, `npm run build` from `client/`. [VERIFIED: AGENTS.md, client/package.json]
- Backend verification is needed only if backend code is touched: `npm run lint`, `npm run build`, `npm test` from `server/`. [VERIFIED: AGENTS.md]

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| APP-01 | Shared app layouts no longer use Vuetify shell primitives. | `default.vue` is already Tailwind/plain Vue; preserve role-aware shell while checking `auth.vue`/`AuthShell` and scan-clean shell markers. [VERIFIED: REQUIREMENTS.md, codebase scan] |
| APP-02 | Reusable dialogs and high-traffic shared components no longer depend on Vuetify primitives. | `SessionDialog`, `StudentDetailDialog`, and `AssistantDetailDialog` still contain true `<v-*>` markers; migrate `SessionDialog` fully, low-risk portions of others. [VERIFIED: REQUIREMENTS.md, codebase scan] |
| APP-03 | Remaining old UI/Vuetify usage inventory documented after migration sweep. | Current target scan identifies concrete old markers and style blocks; final plan must repeat scan and record deferrals. [VERIFIED: REQUIREMENTS.md, codebase scan] |
| APP-04 | Calendar-first teacher workflow remains accessible and visually consistent. | Teacher calendar target files contain old markers and shared CSS imports; migrate first and keep teacher calendar nav/CTA visible. [VERIFIED: REQUIREMENTS.md, 03-CONTEXT.md, codebase scan] |
| APP-05 | Migrated shell/shared surfaces preserve visual parity. | UI-SPEC defines desktop/mobile QA and no overflow/overlap/clipping criteria. [VERIFIED: REQUIREMENTS.md, 03-UI-SPEC.md] |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| App shell navigation | Browser / Client | Frontend app state | Nuxt layout renders role-aware nav from auth store and routes; no backend contract change needed. [VERIFIED: default.vue scan, ARCHITECTURE.md] |
| Auth UI migration | Browser / Client | API / Backend unchanged | Pages/forms keep VeeValidate/Zod and auth composable behavior; UI primitives display external state only. [VERIFIED: 03-UI-SPEC.md, package.json] |
| Teacher calendar UI | Browser / Client | API / Backend unchanged | `TeacherCalendar` calls session composables and renders board/detail/dialog; migration replaces markup/styling only. [VERIFIED: TeacherCalendar.vue scan, ARCHITECTURE.md] |
| Session dialog scheduling | Browser / Client | API / Backend session module | Dialog owns form state/timezone/mutation calls; backend scheduling invariants stay untouched unless a contract bug appears. [VERIFIED: SessionDialog.vue scan, CONCERNS.md] |
| Dashboards and student schedule | Browser / Client | Feature composables | Components receive props or call existing frontend helpers; migration keeps data contracts and loading/empty/populated states. [VERIFIED: dashboard/schedule scans, 03-UI-SPEC.md] |
| Remaining inventory | Tooling / Static analysis | Planner docs | APP-03 needs repository scans plus explicit deferral notes, not runtime changes. [VERIFIED: REQUIREMENTS.md, rg scans] |

## Standard Stack

### Core

| Library / Surface | Version | Purpose | Why Standard |
|-------------------|---------|---------|--------------|
| Nuxt | `^4.0.0` | Frontend app/router/layout runtime | Existing client framework; do not change framework during UI migration. [VERIFIED: client/package.json] |
| Vue | `^3.5.13` | SFC/component implementation | Existing component model for local `Ui*` kit. [VERIFIED: client/package.json] |
| Tailwind CSS | `^4.3.1` | Styling foundation | Milestone standard after Phase 1/2; no SCSS/Vuetify reintroduction. [VERIFIED: client/package.json, PROJECT.md, 02-HANDOFF.md] |
| `@tailwindcss/vite` | `^4.3.1` | Tailwind Vite integration | Existing Nuxt build integration. [VERIFIED: client/package.json] |
| Pinia | `^3.0.0` | Auth/session state | Existing auth store drives role-aware shell. [VERIFIED: client/package.json, ARCHITECTURE.md] |
| TanStack Vue Query | `^5.62.7` | Server state fetching/caching | Existing plugin/composable ecosystem; keep data ownership outside UI primitives. [VERIFIED: client/package.json, ARCHITECTURE.md] |
| VeeValidate + Zod | `^4.15.0` / `^3.24.1` | Auth/form validation | Existing login/register/reset flows use validation; keep logic in forms/pages. [VERIFIED: client/package.json, 03-UI-SPEC.md] |
| `@mdi/font` + `AppIcon` | `^7.4.47` | Icon rendering without Vuetify | Phase 1 retained MDI font; Phase 3 should not switch icon libraries. [VERIFIED: client/package.json, 02-HANDOFF.md] |

### Local UI Primitives

| Component group | Components | Use in Phase 3 |
|-----------------|------------|----------------|
| Layout | `UiPage`, `UiPageHeader`, `UiToolbar`, `UiSection`, `UiCard` | Shell content wrappers, calendar/dashboard cards, dialog sections. [VERIFIED: client/app/components/ui/README.md] |
| Controls | `UiButton`, `UiIconButton`, `UiInput`, `UiTextarea`, `UiSelect`, `UiCheckbox`, `UiSegmentedControl`, `UiActionGroup` | Auth forms, calendar toolbar, `SessionDialog`, dialog form/footer actions. [VERIFIED: ui README and component reads] |
| Data display | `UiTable`, `UiList`, `UiListItem`, `UiBadge`, `UiAvatar`, `UiMetricCard`, `UiStatusDot`, `UiPagination` | Dashboard metrics/lists, assistant salary table, badges, avatars. [VERIFIED: ui README] |
| Feedback | `UiAlert`, `UiToast`, `UiSkeleton`, `UiEmptyState`, `UiProgress`, `UiSpinner` | Auth alerts, loading states, empty states, student progress, toast surfaces. [VERIFIED: ui README and component reads] |
| Overlay | `UiDialog`, `UiConfirmDialog`, `UiTabs` | `SessionDialog`, low-risk student/assistant dialog migration. [VERIFIED: ui README and component reads] |

**Installation:** none. Do not add packages in Phase 3. [VERIFIED: 02-HANDOFF.md, 03-UI-SPEC.md]

## Package Legitimacy Audit

No external packages are recommended or required for Phase 3. Package legitimacy gate is not applicable. [VERIFIED: 02-HANDOFF.md, 03-UI-SPEC.md]

## Current Old UI Marker Inventory

Static scan command used:

```powershell
rg -c '<\/?v-[a-z]' <phase-3-target-files>
rg -c '<style|\.scss|:deep\(\.v-' <phase-3-target-files>
```

| Area | Target files | Current markers | Planning implication |
|------|--------------|-----------------|----------------------|
| Shell/auth wrapper | `client/app/layouts/default.vue`, `client/app/layouts/auth.vue`, `client/app/components/AuthShell.vue` | `default.vue` has no true `<v-*>`; `AuthShell.vue` has 3 Vuetify tags and 1 style block. [VERIFIED: rg scan] | Shell work is mostly preservation/QA; auth wrapper still needs migration. |
| Auth forms/pages | `LoginFormPane.vue`, `LoginVisual.vue`, `RegisterFormPane.vue`, `RegisterVisual.vue`, `forgot-password.vue`, `reset-password.vue`, `verify-email.vue` | Login form 14, login visual 3, register form 18, register visual 4, forgot 12, reset 12, verify 9 true Vuetify tags; register form/visual import scoped CSS. [VERIFIED: rg scan] | Plan auth as one coherent surface after shell, replacing forms/alerts/buttons/images/icons. |
| Teacher calendar | `TeacherCalendar.vue`, `TeacherCalendarBoard.vue`, `TeacherCalendarHeader.vue`, `TeacherSessionDetail.vue`, `StudentCalendar.vue` | Board 14, header 4, detail 6, teacher calendar 2, student calendar 2 true Vuetify tags; each imports/shared style markers. [VERIFIED: rg scan] | Calendar slice must remove shared calendar CSS dependencies and replace snackbar with `AppToast`. |
| `SessionDialog` | `client/app/components/SessionDialog.vue` | 41 true Vuetify tags. [VERIFIED: rg scan] | Highest-risk full dialog migration; separate plan recommended. |
| Dashboards | `TeacherWorkspaceDashboard.vue`, `StudentWorkspaceDashboard.vue` | Teacher dashboard 67 true Vuetify tags plus CSS import; student dashboard 18 true Vuetify tags plus scoped CSS. [VERIFIED: rg scan] | Teacher dashboard before student dashboard per context; avoid Phase 4 page redesign scope. |
| Student schedule | `client/app/components/StudentSchedule.vue` | 8 true Vuetify tags plus 2 style markers including `.v-icon` coupling. [VERIFIED: rg scan] | Pair with student dashboard or immediately after it. |
| Shared detail dialogs | `StudentDetailDialog.vue`, `AssistantDetailDialog.vue` | Student detail 51 true Vuetify tags; assistant detail 23 true Vuetify tags. [VERIFIED: rg scan] | Migrate low-risk header/avatar/tabs/tables/forms if bounded; defer complex portions with exact inventory if needed. |

## Migration Patterns

### Shell/Auth

- Preserve `default.vue` role-aware branches and route behavior; do not rewrite shell data/auth logic because the current shell is already Tailwind/plain Vue and contains no true `<v-*>` tags. [VERIFIED: rg scan, 03-CONTEXT.md]
- Convert `AuthShell` brand avatar/icon to a Tailwind square plus `AppIcon`, then remove its scoped CSS block. [VERIFIED: AuthShell.vue scan, 03-UI-SPEC.md]
- Replace `v-form` with native `<form @submit.prevent>`, `v-text-field` with `UiInput`, `v-checkbox` with `UiCheckbox`, `v-alert` with `UiAlert`, `v-btn` with `UiButton`, `v-progress-circular` with `UiSpinner`, and `v-avatar`/`v-icon` with Tailwind + `AppIcon`. [VERIFIED: ui README, auth rg scan]
- Keep VeeValidate/Zod bindings and submit handlers exactly in the form panes/pages; pass `error`, `disabled`, and `loading` into `Ui*` components only. [VERIFIED: 03-UI-SPEC.md, package.json]
- For `LoginVisual` and `RegisterVisual`, replace `v-img` with native `<img>` and Tailwind object-cover sizing; preserve existing real imagery. [VERIFIED: rg scan, 03-UI-SPEC.md]

### Teacher Calendar + Toasts

- Convert `TeacherCalendarHeader` first: use `UiPageHeader`/`UiToolbar`, `UiButton`, and `UiIconButton`; preserve emitted `open` and `refresh` actions. [VERIFIED: TeacherCalendarHeader.vue scan]
- Convert `TeacherCalendarBoard`: use a `UiCard`/Tailwind region, `UiSegmentedControl` for month/week, `UiButton`/`UiIconButton` for today/prev/next/events, and keep cell click/keyboard/drag/drop emits. [VERIFIED: TeacherCalendarBoard.vue scan, 03-UI-SPEC.md]
- Convert `TeacherSessionDetail`: use `UiCard`, `UiEmptyState`, `UiBadge`, `UiButton`, and `AppIcon`; preserve `open` emit and active/empty state. [VERIFIED: TeacherSessionDetail.vue scan, 03-UI-SPEC.md]
- Replace `v-snackbar` in `TeacherCalendar` and `StudentCalendar` with existing `useToast`/`AppToast` pattern or a local `AppToast` trigger, not a new snackbar component. [VERIFIED: TeacherCalendar.vue scan, 02-HANDOFF.md]
- Remove `~/styles/calendar/*.css` dependencies only when equivalent Tailwind classes are present in templates. [VERIFIED: rg scan, 03-UI-SPEC.md]

### `SessionDialog`

- Keep public contract: `modelValue`, `session`, `prefill`, `saved`, and `update:modelValue`; do not rename emitted events. [VERIFIED: SessionDialog.vue scan, 03-UI-SPEC.md]
- Use `UiDialog` size `md`, `UiSegmentedControl` for single/recurring, `UiSelect` for class/instructor native selects, `UiInput` for date/time/topic, `UiBadge` for status/location/day pills, `UiAlert` for extracted API errors, `UiActionGroup` for footer layout, and `UiConfirmDialog` for delete confirmation. [VERIFIED: ui component reads, 03-UI-SPEC.md]
- `UiSelect` accepts `items` shaped as primitives or `{ value, title, disabled }`; map `classes` and `instructorOptions` before binding because Vuetify `item-title`/`item-value` props do not exist on `UiSelect`. [VERIFIED: UiSelect.vue, SessionDialog.vue scan]
- Weekday multi-select currently uses `v-chip-group`; implement as a small caller-owned button/checkbox group, not a new generic complex component unless reused. [VERIFIED: SessionDialog.vue scan, ui README]
- Preserve `useUserTimezone`, `useAuthStore`, `extractApiError`, create/update/bulk/delete/status mutations, and disabled/loading guards in the dialog script. [VERIFIED: SessionDialog.vue scan]

### Dashboards + Student Schedule

- Teacher dashboard should migrate before student dashboard, using `UiMetricCard`, `UiList`, `UiListItem`, `UiBadge`, `UiEmptyState`, `UiButton`, and tokenized Tailwind grids. [VERIFIED: 03-CONTEXT.md, TeacherWorkspaceDashboard.vue scan]
- Student dashboard should replace `v-progress-linear` with `UiProgress`, icon buttons with `UiIconButton`, CTA buttons with `UiButton`, and all scoped CSS layouts with Tailwind grids that stack by mobile width. [VERIFIED: StudentWorkspaceDashboard.vue scan, 03-UI-SPEC.md]
- Student schedule should replace week nav `v-btn` controls with `UiButton`/`UiIconButton`, empty icon with `AppIcon` or `UiEmptyState`, action button with `UiButton`, and `.v-icon` deep coupling with direct Tailwind layout. [VERIFIED: StudentSchedule.vue scan]

### Shared Detail Dialogs

- `AssistantDetailDialog` is lower risk than `StudentDetailDialog`: salary config form, salary summary/table, assigned-class badges, skeleton, and empty state map directly to `UiInput`, `UiSelect`, `UiMetricCard`, `UiTable`, `UiBadge`, `UiSkeleton`, and `UiEmptyState`. [VERIFIED: AssistantDetailDialog.vue scan, ui README]
- `StudentDetailDialog` has profile, scores, comments, tabs, score deletion, and timeline behavior; migrate only if plan can preserve all mutations and empty states. Otherwise defer exact old markers after migrating header/avatar/basic shell. [VERIFIED: StudentDetailDialog.vue scan, 03-CONTEXT.md]
- If score delete is touched, add `UiConfirmDialog`; if it remains old behavior, document explicit deferral. [VERIFIED: 03-UI-SPEC.md]

## Risk Split / Suggested Plan Breakdown

| Plan | Scope | Risk | Why this order |
|------|-------|------|----------------|
| 03-01 | Shell preservation + auth shell/forms/pages | Medium | Auth is broad but mostly form/control replacement; shell route branches must be validated early. [VERIFIED: 03-CONTEXT.md, rg scan] |
| 03-02 | Teacher calendar header/board/detail + calendar toast replacement | High | Calendar-first workflow is the product anchor; board has keyboard/drag/drop/cell/event paths. [VERIFIED: 03-CONTEXT.md, 03-UI-SPEC.md] |
| 03-03 | `SessionDialog` full migration | Highest | Calendar-critical dialog owns scheduling create/edit/recurrence/delete/status/timezone paths. [VERIFIED: 03-CONTEXT.md, SessionDialog.vue scan] |
| 03-04 | Teacher dashboard migration | Medium | Large old marker count but mostly presentational cards/lists/hero/mini calendar. [VERIFIED: rg scan, 03-CONTEXT.md] |
| 03-05 | Student dashboard + `StudentSchedule` | Medium | Student surfaces need responsive stacking and progress/action parity. [VERIFIED: rg scan, 03-UI-SPEC.md] |
| 03-06 | Low-risk shared dialog portions | Medium/High | `AssistantDetailDialog` direct mapping first; `StudentDetailDialog` only bounded areas or defer. [VERIFIED: 03-CONTEXT.md, dialog scans] |
| 03-07 | Inventory, static scans, visual QA evidence, frontend gates | Medium | APP-03 and APP-05 require final scan-clean/deferred inventory plus lint/typecheck/build. [VERIFIED: REQUIREMENTS.md, 03-UI-SPEC.md] |

## Deferrals

- Do not redesign `/assistants`, `/assistants/[id]`, `/audit-logs`, or `/profile`; they are Phase 4. [VERIFIED: ROADMAP.md, 03-CONTEXT.md]
- Do not expand into admin-heavy pages (`admin/health`, `admin/settings`, `admin/users/*`, admin dashboard widgets) except minimal shell/nav compatibility checks. [VERIFIED: 03-CONTEXT.md]
- Do not implement center role workflows. [VERIFIED: PROJECT.md, 03-CONTEXT.md]
- Do not add shadcn/Radix/Headless UI/DaisyUI/Flowbite or any new UI dependency. [VERIFIED: 03-UI-SPEC.md]
- Defer complex `StudentDetailDialog` / `AssistantDetailDialog` portions only with exact remaining marker inventory and reason. [VERIFIED: 03-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Generic buttons/links/icons | One-off button class recipes | `UiButton`, `UiIconButton`, `AppIcon` | Existing primitives already encode tokenized focus/loading/size variants. [VERIFIED: UiButton.vue, ui README] |
| Dialog shell/focus restoration | Custom modal portal/focus behavior | `UiDialog`, `UiConfirmDialog` | Existing dialog handles Teleport, Escape close, backdrop close, focus entry/restoration, footer slots. [VERIFIED: UiDialog.vue, UiConfirmDialog.vue] |
| Form validation logic inside primitives | New smart form components | Existing VeeValidate/Zod in pages/forms plus `UiInput`/`UiSelect` display props | UI kit must stay data-agnostic. [VERIFIED: 03-UI-SPEC.md, ui README] |
| Toast/snackbar replacement | New snackbar singleton | Existing `AppToast`/`UiToast` and `useToast` pattern | Phase 2 migrated toast stack already preserves roles/dismiss/responsive placement. [VERIFIED: 02-HANDOFF.md] |
| Calendar recurrence/conflict logic | Frontend scheduling rewrite | Existing session composables and backend session invariants | Scheduling is fragile; UI migration should not alter contracts. [VERIFIED: CONCERNS.md, 03-CONTEXT.md] |

## Common Pitfalls

### Native Select Shape Mismatch
**What goes wrong:** `UiSelect` does not support Vuetify `item-title` / `item-value`; binding raw objects silently renders wrong values. [VERIFIED: UiSelect.vue, SessionDialog.vue scan]  
**Avoid:** Map objects to `{ value, title, disabled }` before passing to `UiSelect`. [VERIFIED: UiSelect.vue]

### Losing Calendar Keyboard And Drag/Drop Paths
**What goes wrong:** Calendar cells/events become visual `<div>`s without Enter/Space or drag/drop emit parity. [VERIFIED: TeacherCalendarBoard.vue scan, 03-UI-SPEC.md]  
**Avoid:** Preserve existing event handlers and use semantic buttons where cells/events are interactive. [VERIFIED: 03-UI-SPEC.md]

### Deleting Without Confirmation
**What goes wrong:** `SessionDialog` or score delete preserves direct destructive mutation under a new UI. [VERIFIED: SessionDialog.vue scan, 03-UI-SPEC.md]  
**Avoid:** Use `UiConfirmDialog` for `Delete session`; use it for score delete if that portion is migrated. [VERIFIED: UiConfirmDialog.vue, 03-UI-SPEC.md]

### Scoped CSS Removal Without Tailwind Parity
**What goes wrong:** Removing `style src` / scoped blocks before translating layout classes breaks spacing, responsive behavior, and calendar/dashboard density. [VERIFIED: rg scan, 03-UI-SPEC.md]  
**Avoid:** Replace each old class role with explicit Tailwind grid/flex/spacing/min-width classes in the same plan. [VERIFIED: 03-UI-SPEC.md]

### UI Kit Boundary Creep
**What goes wrong:** `Ui*` components import stores/composables or business helpers to make migration easier. [VERIFIED: ui README]  
**Avoid:** Keep feature logic in pages/dialogs/composables; run the UI-kit API/composable scan. [VERIFIED: 02-HANDOFF.md]

## Code Examples

### Vuetify Select Replacement

```vue
<script setup lang="ts">
const classItems = computed(() => classes.value.map((item) => ({
  value: item.id,
  title: item.name,
})));
</script>

<template>
  <UiSelect
    v-model="form.classId"
    :items="classItems"
    :label="t('session.class')"
    required
  />
</template>
```

Source: `UiSelect.vue` API and `SessionDialog.vue` current `v-select` usage. [VERIFIED: codebase scan]

### Dialog Footer Shape

```vue
<template #footer>
  <UiActionGroup align="between">
    <div class="flex flex-col gap-2 sm:flex-row">
      <UiButton v-if="isEdit" variant="danger" :loading="deleting" @click="confirmDelete = true">
        Delete session
      </UiButton>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row">
      <UiButton variant="secondary" :disabled="saving || deleting" @click="close">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="saving" :disabled="!canSave" @click="save">
        {{ isEdit ? 'Save session' : 'Create session' }}
      </UiButton>
    </div>
  </UiActionGroup>
</template>
```

Source: `UiDialog.vue`, `UiActionGroup.vue`, `UiButton.vue`, Phase 3 footer contract. [VERIFIED: codebase scan, 03-UI-SPEC.md]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Frontend automated tests | No frontend unit/component/e2e runner observed. [VERIFIED: TESTING.md, client/package.json] |
| Frontend config | ESLint flat config and Nuxt typecheck/build scripts. [VERIFIED: client/package.json] |
| Quick run command | `npm run lint` from `client/`. [VERIFIED: client/package.json] |
| Full suite command | `npm run lint && npm run typecheck && npm run build` from `client/`. [VERIFIED: client/package.json] |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| APP-01 | Shell/layout has no Vuetify shell primitives and role nav remains usable. | static + manual smoke | `rg -n '<\/?v-(app|main|navigation-drawer|app-bar|list)' client/app/layouts client/app/components/AuthShell.vue` | N/A static |
| APP-02 | Shared dialogs/high-traffic components no longer depend on Vuetify primitives in migrated scope. | static + manual smoke | `rg -n '<\/?v-[a-z]' <touched-dialog-and-shared-files>` | N/A static |
| APP-03 | Remaining old UI usages are inventoried or deferred. | static + doc audit | `rg -n '<\/?v-[a-z]|<style|\.scss|:deep\(\.v-' client/app` | N/A static |
| APP-04 | Teacher calendar workflow remains accessible. | manual smoke | Calendar: open, month/week, today/prev/next, create from cell, edit, drag/drop, saved reload. | Manual required |
| APP-05 | Migrated surfaces preserve visual parity. | manual visual QA | Desktop and mobile-width checks for shell/auth/calendar/dashboards/dialogs. | Manual required |

### Sampling Rate

- Per task commit: targeted `rg` scan for touched files plus `npm run lint` where practical. [VERIFIED: 03-UI-SPEC.md]
- Per wave merge: `npm run lint` and `npm run typecheck` from `client/`. [VERIFIED: 03-UI-SPEC.md]
- Phase gate: `npm run lint`, `npm run typecheck`, `npm run build`, final scan inventory, and manual/screenshot QA notes. [VERIFIED: 03-UI-SPEC.md]

### Wave 0 Gaps

- No frontend test runner exists; Phase 3 should not invent one unless user expands scope. Use static scans plus manual visual/smoke QA. [VERIFIED: TESTING.md, client/package.json]
- Node/npm are not on default PATH in this shell; use `%LOCALAPPDATA%\nvm\v24.11.1` or update PATH before verification. [VERIFIED: command probe]

## Verification Commands / Static Scans

Use from repo root unless noted:

```powershell
# Old UI markers in Phase 3 target files
rg -n '<\/?v-[a-z]|<style|lang="scss"|\.scss|:deep\(\.v-' `
  client/app/layouts/default.vue `
  client/app/layouts/auth.vue `
  client/app/components/AuthShell.vue `
  client/app/components/login/LoginFormPane.vue `
  client/app/components/login/LoginVisual.vue `
  client/app/components/register/RegisterFormPane.vue `
  client/app/components/register/RegisterVisual.vue `
  client/app/pages/forgot-password.vue `
  client/app/pages/reset-password.vue `
  client/app/pages/verify-email.vue `
  client/app/components/calendar/TeacherCalendar.vue `
  client/app/components/calendar/TeacherCalendarBoard.vue `
  client/app/components/calendar/TeacherCalendarHeader.vue `
  client/app/components/calendar/TeacherSessionDetail.vue `
  client/app/components/calendar/StudentCalendar.vue `
  client/app/components/dashboard/TeacherWorkspaceDashboard.vue `
  client/app/components/dashboard/StudentWorkspaceDashboard.vue `
  client/app/components/StudentSchedule.vue `
  client/app/components/SessionDialog.vue `
  client/app/components/StudentDetailDialog.vue `
  client/app/components/AssistantDetailDialog.vue

# UI kit boundary check
rg -n '(useApi|useAuthStore|useSessions|useStudents|useAssistants|useAuditLogs|useClasses|fetch\(|\$fetch)' client/app/components/ui

# Frontend gates from client/
npm run lint
npm run typecheck
npm run build
```

If default PATH still lacks Node/npm, use:

```powershell
$env:Path = "$env:LOCALAPPDATA\nvm\v24.11.1;$env:Path"
npm.cmd --prefix client run lint
npm.cmd --prefix client run typecheck
npm.cmd --prefix client run build
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js on default PATH | Frontend gates | No | - | Use `%LOCALAPPDATA%\nvm\v24.11.1\node.exe`. [VERIFIED: command probe] |
| npm on default PATH | Frontend gates | No | - | Use `%LOCALAPPDATA%\nvm\v24.11.1\npm.cmd`. [VERIFIED: command probe] |
| Node.js via nvm path | Frontend gates | Yes | `v24.11.1` | Add nvm path to PATH in command. [VERIFIED: command probe] |
| npm via nvm path | Frontend gates | Yes | `11.6.2` | Add nvm path to PATH in command. [VERIFIED: command probe] |
| Backend runtime/services | Not required unless backend touched | Not probed | - | Backend should remain untouched. [VERIFIED: 03-CONTEXT.md] |

**Missing dependencies with no fallback:** none found for research/planning. [VERIFIED: command probe]

**Missing dependencies with fallback:** default PATH lacks Node/npm; nvm path works. [VERIFIED: command probe]

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | Yes | Preserve existing auth store/composable flows; do not change token lifecycle in UI migration. [VERIFIED: ARCHITECTURE.md, CONCERNS.md] |
| V3 Session Management | Yes | Preserve logout, profile menu close behavior, persisted session behavior; no backend auth changes. [VERIFIED: 03-UI-SPEC.md, ARCHITECTURE.md] |
| V4 Access Control | Yes | Preserve role-aware shell branches for teacher/student/assistant/admin; do not remove route links/guards. [VERIFIED: 03-UI-SPEC.md] |
| V5 Input Validation | Yes | Keep VeeValidate/Zod and page/dialog-owned validation; UI components only render state. [VERIFIED: package.json, 03-UI-SPEC.md] |
| V6 Cryptography | No direct Phase 3 change | Do not touch JWT/password/backend crypto code. [VERIFIED: 03-CONTEXT.md, ARCHITECTURE.md] |

Known threat patterns:

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-role navigation regression | Elevation of privilege / Information disclosure | Preserve existing route middleware/auth store behavior; shell UI changes must not create new client-only access assumptions. [VERIFIED: ARCHITECTURE.md, 03-UI-SPEC.md] |
| Token exposure from broad auth rewrites | Information disclosure | Do not alter persisted auth store/token handling in Phase 3; only replace visual components. [VERIFIED: CONCERNS.md, 03-CONTEXT.md] |
| Tenant leakage from accidental API changes | Information disclosure | No backend/API changes unless real contract bug; if touched, run backend checks and inspect `teacherId`/`tenantId` scoping. [VERIFIED: AGENTS.md, CONCERNS.md] |

## Sources

### Primary (HIGH confidence)

- `.planning/PROJECT.md` - milestone goals, teacher/student priority, Tailwind-only direction.
- `.planning/ROADMAP.md` - Phase 3 scope, Phase 4/5 boundaries.
- `.planning/REQUIREMENTS.md` - APP-01 through APP-05 and verification requirements.
- `.planning/STATE.md` - current phase state and Phase 2 transition.
- `.planning/phases/03-app-shell-shared-surface-migration/03-CONTEXT.md` - locked decisions, canonical refs, deferrals.
- `.planning/phases/03-app-shell-shared-surface-migration/03-UI-SPEC.md` - exact visual/interaction contracts.
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-HANDOFF.md` - available primitives and adoption notes.
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-UI-SPEC.md` - design system contract.
- `client/app/components/ui/README.md` and selected `Ui*` component reads - primitive APIs.
- `rg` scans over Phase 3 target files - current old marker inventory.

### Secondary (MEDIUM confidence)

- `.planning/codebase/STACK.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `ARCHITECTURE.md`, `CONCERNS.md` - project patterns and known gaps.
- `client/package.json` - dependency versions and frontend scripts.
- Environment probes for Node/npm availability.

### Tertiary (LOW confidence)

- None. No web-only or training-only claims are needed for this phase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified from `client/package.json`, project docs, and Phase 2 artifacts.
- Architecture: HIGH - verified from codebase maps and current target file scans.
- Pitfalls: HIGH - derived from exact local component APIs and current Vuetify marker locations.
- Verification: HIGH - verified from package scripts, UI spec, testing map, and environment probes.

**Research date:** 2026-06-30
**Valid until:** 2026-07-30, or earlier if Phase 3 target files change substantially.

## RESEARCH COMPLETE
