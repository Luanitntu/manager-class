# Phase 2: Tailwind Design System & Shared UI Kit - Research

**Researched:** 2026-06-30
**Domain:** Nuxt 4 / Vue 3 / Tailwind 4 shared UI kit migration
**Confidence:** HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions

## Implementation Decisions

### Tailwind-Only Styling Rule
- **D-01:** Existing `--st-*` tokens in `client/app/assets/css/main.css` are the source of truth for Phase 2. Add missing semantic tokens only when needed for the shared kit.
- **D-02:** UI implementation must be Tailwind-only. Do not add SCSS, scoped CSS, CSS modules, page-specific CSS, component-specific CSS, or global helper classes.
- **D-03:** Minimal global CSS is allowed only for Tailwind entry, font import, `:root` tokens, and very small base reset rules. Do not use global CSS to recreate page/component styling.
- **D-04:** No new CSS debt. If Tailwind is hard to express for a repeated or complex pattern, create a shared `Ui*` component or variant, split the plan smaller, or defer the surface. Do not write a CSS fallback.

### Visual Parity
- **D-05:** Visual parity is mandatory for every migration slice. Replacements must preserve current layout, spacing, typography, states, responsive behavior, overflow behavior, and user workflow unless a later phase explicitly calls for redesign.
- **D-06:** `lint`, `typecheck`, and `build` are necessary but not sufficient proof of parity. Large or risky pages/shared surfaces need desktop and mobile visual QA when the planner identifies UI risk.
- **D-07:** If a low-risk shared migration cannot preserve the existing UI inside the planned scope, reduce scope, split the work, or defer that surface to Phase 3/4. Do not accept accidental visual changes as polish.

### Component Coverage
- **D-08:** Phase 2 should build enough kit for Phase 3 app shell/shared surfaces and Phase 4 priority pages: `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- **D-09:** Required core groups are layout, controls/forms, data display, feedback, and overlay/dialog. Each group only needs variants required for Phase 3/4; do not attempt full admin/low-traffic/future-page coverage.
- **D-10:** Preferred implementation order is foundation/layout, then controls/forms, then data display, then feedback/dialog. The planner may move dialog foundation earlier if shared dialogs become a blocker.

### Component API and Naming
- **D-11:** Design-system components use the `Ui*` prefix, such as `UiButton`, `UiCard`, `UiInput`, `UiSelect`, `UiDialog`, `UiBadge`, `UiTable`, `UiPagination`, `UiEmptyState`, and `UiSkeleton`.
- **D-12:** Keep `App*` for app-level singleton/infrastructure components such as `AppIcon`, `AppToast`, and `AppInitialLoader`.
- **D-13:** Component APIs should be slot-first with only necessary props for repeated variants/states, such as `variant`, `size`, `tone`, `loading`, `disabled`, and icon slots. Do not clone Vuetify's full prop surface.
- **D-14:** Form controls are UI-only. Validation and business logic stay in pages, composables, or form-layer code. `UiInput`/`UiSelect` style components should accept external state such as `modelValue`, `error`, `hint`, `required`, `disabled`, and `loading`.
- **D-15:** Data display should use composable, slot-first primitives rather than a highly abstract `UiDataTable`. Prefer `UiTable`, `UiTableHeader`, `UiTableRow`, `UiList`, `UiPagination`, `UiEmptyState`, and `UiSkeleton`, with pages rendering their own data.

### Adoption Boundary
- **D-16:** Phase 2 should create docs, new shared components, and migrate a few small/clear existing shared surfaces to prove integration.
- **D-17:** Good proof candidates include `AppSkeleton`, `TablePager`, `AppToast`/toast surface, `ClassLocation`, or equivalent small shared surfaces. Touched surfaces must become Tailwind-only.
- **D-18:** Do not rewrite large pages or migrate full high-risk dialog workflows in Phase 2. Only create dialog foundation if it does not change existing workflow behavior.
- **D-19:** Phase 2 does not need to remove every existing CSS/SCSS marker across the app. CSS/SCSS outside touched Phase 2 surfaces remains inventory debt for Phase 3/4/5.

### Required Outputs
- **D-20:** Phase 2 must leave design-system documentation for downstream phases: token rules, Tailwind-only rules, component naming/API rules, usage examples, and migration notes.
- **D-21:** Documentation must include an inventory-to-component usage map showing which `Ui*` primitives should replace key Vuetify/old UI patterns in Phase 3/4.

### the agent's Discretion
- The planner may choose exact component file structure under `client/app/components`, but should keep the new UI kit easy to discover and separate from feature-specific components.
- The planner may choose exact variants for each component group, as long as they cover Phase 3/4 needs and avoid overbuilding.
- The planner may decide which small shared surfaces are safest to migrate as proof, provided the touched code becomes Tailwind-only and visual parity is preserved.

### Deferred Ideas (OUT OF SCOPE)
- Full app-wide CSS/SCSS removal belongs across Phase 3/4/5, not entirely inside Phase 2.
- Large page rewrites for `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` belong to Phase 4.
- App shell/shared surface migration beyond small proof candidates belongs to Phase 3.
- Admin/low-traffic/future page coverage remains deferred unless a component is required by Phase 3/4.

## Project Constraints (from AGENTS.md)

- Teacher and student experiences are first priority; center role is deferred. [VERIFIED: AGENTS.md]
- Calendar-first teacher workflow must remain central. [VERIFIED: AGENTS.md]
- Fix data-display bugs where data exists but pages do not show it. [VERIFIED: AGENTS.md]
- PREP-style education SaaS feel is inspiration only; do not copy brand/assets. [VERIFIED: AGENTS.md]
- Frontend stack is Nuxt 4, Vue 3, Vuetify-era source being migrated, Pinia, and TanStack Query. [VERIFIED: AGENTS.md][VERIFIED: client/package.json]
- Frontend pages should use feature composables; do not call APIs directly inside components. [VERIFIED: AGENTS.md]
- Tenant isolation is critical; teacher-owned data must stay scoped by `teacherId`/`tenantId`. [VERIFIED: AGENTS.md]
- Frontend verification commands are `npm run lint`, `npm run typecheck`, and `npm run build` from `client/`. [VERIFIED: AGENTS.md][VERIFIED: client/package.json]
- Backend checks are only required if backend code is touched. [VERIFIED: AGENTS.md]

## Summary

Phase 1 removed the Vuetify/Sass package and Nuxt platform surface; current Phase 2 work should not reinstall UI packages or reintroduce CSS debt. [VERIFIED: `.planning/phases/01-styling-platform-cutover/01-VERIFICATION.md`][VERIFIED: package scan] The active design foundation is `client/app/assets/css/main.css`, which imports Tailwind 4, MDI CSS through Nuxt, `../../styles/index.css`, and defines `--st-*` tokens for content width, font, color, radius, spacing, typography, and focus. [VERIFIED: `client/app/assets/css/main.css`][VERIFIED: `client/nuxt.config.ts`]

Current shared surfaces are uneven. `TablePager` is already Tailwind/plain Vue and is the safest behavior reference for `UiPagination`. [VERIFIED: `client/app/components/TablePager.vue`] `AppSkeleton` and `AppToast` are app-level shared surfaces but still contain `<style scoped>`, so they are good Tailwind-only proof migrations. [VERIFIED: `client/app/components/AppSkeleton.vue`][VERIFIED: `client/app/components/AppToast.vue`] `ClassLocation` is small but still uses `v-icon` and `v-chip`, so it is the best proof for replacing Vuetify chip/icon semantics with `UiBadge` plus `AppIcon`. [VERIFIED: `client/app/components/ClassLocation.vue`]

Priority pages and shared dialogs should inform the kit but not be rewritten in Phase 2. `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` still contain Vuetify cards, lists, forms, dialogs, tables, chips, tabs, and autocomplete controls. [VERIFIED: source scan] `SessionDialog`, `StudentDetailDialog`, and `AssistantDetailDialog` call feature composables and mutations directly and combine API state, forms, destructive actions, tabs, lists, timelines, and tables; full migration belongs to Phase 3/4 unless split into foundation-only dialog primitives with no workflow change. [VERIFIED: component scan]

**Primary recommendation:** Build a local `client/app/components/ui/Ui*.vue` kit, document it in `client/app/components/ui/README.md`, migrate only `AppSkeleton`, `TablePager`, `AppToast`, and `ClassLocation` as proof slices, then defer high-risk page/dialog rewrites. [VERIFIED: 02-CONTEXT.md][VERIFIED: source scan]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Tailwind tokens and base reset | Browser / Client | CDN / Static | Tokens and Tailwind CSS compile into the client bundle; no backend ownership. [VERIFIED: `client/app/assets/css/main.css`] |
| `Ui*` shared components | Browser / Client | Frontend Server (SSR) | Vue SFCs render in Nuxt SSR/hydration but own client UI semantics. [VERIFIED: codebase structure] |
| App infrastructure components | Browser / Client | Frontend Server (SSR) | `AppIcon`, `AppToast`, and similar components are global UI infrastructure, not business data owners. [VERIFIED: `client/app/app.vue`][VERIFIED: component scan] |
| Feature data in pages/dialogs | Browser / Client | API / Backend | Pages and high-risk dialogs currently use composables; UI kit must not call APIs. [VERIFIED: AGENTS.md][VERIFIED: component scan] |
| Tenant-isolated data | API / Backend | Database / Storage | Tenant scoping is enforced in backend service/repository layers, not UI components. [VERIFIED: AGENTS.md][VERIFIED: `.planning/codebase/ARCHITECTURE.md`] |

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UIKIT-00 | Tailwind design tokens, naming, variants, and usage rules documented. | Use `--st-*` tokens and write `client/app/components/ui/README.md`. [VERIFIED: `02-UI-SPEC.md`][VERIFIED: `main.css`] |
| UIKIT-01 | Shared layout primitives exist for page headers, toolbars, sections, cards, and containers. | Add `UiPage`, `UiPageHeader`, `UiToolbar`, `UiSection`, `UiCard`. [VERIFIED: `02-UI-SPEC.md`] |
| UIKIT-02 | Shared form/control components exist for buttons, inputs, selects, textareas, filters, and action groups. | Add native-control-first `UiButton`, `UiIconButton`, `UiInput`, `UiTextarea`, `UiSelect`, `UiCheckbox`, `UiSegmentedControl`, `UiActionGroup`. [VERIFIED: `02-UI-SPEC.md`][VERIFIED: priority page scan] |
| UIKIT-03 | Shared data display components exist for tables/lists, pagination, badges/chips, avatars, metric cards, and status indicators. | Add slot-first `UiTable`, `UiList`, `UiListItem`, `UiPagination`, `UiBadge`, `UiAvatar`, `UiMetricCard`, `UiStatusDot`. [VERIFIED: `02-UI-SPEC.md`][VERIFIED: priority page scan] |
| UIKIT-04 | Shared feedback components exist for alerts, toasts, skeletons, empty states, and dialogs. | Add `UiAlert`, `UiToast`, `UiSkeleton`, `UiEmptyState`, `UiDialog`, `UiConfirmDialog`; migrate small proof surfaces only. [VERIFIED: `02-UI-SPEC.md`][VERIFIED: proof component scan] |
| UIKIT-05 | Duplicated UI patterns are replaced with shared components where practical without behavior change. | Practical Phase 2 replacements are `AppSkeleton`, `TablePager`, `AppToast`, and `ClassLocation`; page/dialog rewrites are deferred. [VERIFIED: `02-CONTEXT.md`][VERIFIED: source scan] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt | `^4.0.0` | Frontend app framework | Existing app runtime and scripts use Nuxt. [VERIFIED: `client/package.json`] |
| Vue | `^3.5.13` | SFC/component model | Existing components use `<script setup lang="ts">`. [VERIFIED: `client/package.json`][VERIFIED: source scan] |
| Tailwind CSS | `^4.3.1` | Utility styling foundation | Phase 2 is explicitly Tailwind-only and `main.css` imports `tailwindcss`. [VERIFIED: `client/package.json`][VERIFIED: `main.css`] |
| `@tailwindcss/vite` | `^4.3.1` | Tailwind Vite plugin | Nuxt config registers the Tailwind Vite plugin. [VERIFIED: `client/package.json`][VERIFIED: `client/nuxt.config.ts`] |
| `@mdi/font` | `^7.4.47` | Material Design Icons font | Phase 1 retained MDI and `AppIcon` renders MDI classes. [VERIFIED: `client/package.json`][VERIFIED: `AppIcon.vue`] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Pinia | `^3.0.0` | Auth/session stores | UI kit must not depend on stores; app shell/pages may continue using existing stores. [VERIFIED: `client/package.json`][VERIFIED: `default.vue`] |
| TanStack Vue Query | `^5.62.7` | Server data caching | Feature composables/pages own data loading; `Ui*` components stay UI-only. [VERIFIED: `client/package.json`][VERIFIED: AGENTS.md] |
| VeeValidate/Zod | `^4.15.0` / `^3.24.1` | Existing form validation stack | `UiInput` and related controls accept external error/hint state; validation remains outside UI primitives. [VERIFIED: `client/package.json`][VERIFIED: 02-CONTEXT.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local Vue SFC kit | shadcn/Radix/Headless UI/Flowbite/DaisyUI | Rejected for Phase 2 by UI-SPEC registry contract; would add third-party registry/API surface. [VERIFIED: `02-UI-SPEC.md`] |
| `UiTable` slot primitives | Highly abstract `UiDataTable` | Rejected by D-15; pages should render their own data and preserve behavior. [VERIFIED: `02-CONTEXT.md`] |
| `AppIcon` with MDI | New icon library | Rejected by Phase 1/2 decisions; broad `mdi-*` usage remains. [VERIFIED: `01-CONTEXT.md`][VERIFIED: `02-UI-SPEC.md`] |

**Installation:**

```bash
# No install for Phase 2. Use existing client dependencies.
```

**Version verification:** Existing versions were read from `client/package.json`; no new external packages are recommended. [VERIFIED: `client/package.json`]

## Package Legitimacy Audit

No external packages should be installed in Phase 2. [VERIFIED: `02-UI-SPEC.md`] Package legitimacy gate is not applicable because the recommended implementation uses existing dependencies only. [VERIFIED: `client/package.json`]

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| none | npm | n/a | n/a | n/a | n/a | No install approved. [VERIFIED: `02-UI-SPEC.md`] |

**Packages removed due to [SLOP] verdict:** none. [VERIFIED: no new packages]
**Packages flagged as suspicious [SUS]:** none. [VERIFIED: no new packages]

## Current Tailwind Token and Design State

- `main.css` imports the Nunito font, Tailwind CSS, and `../../styles/index.css`. [VERIFIED: `client/app/assets/css/main.css`]
- `main.css` defines `--st-content-max`, `--st-font-family`, primary/secondary/accent colors, surface/background/text/muted/border colors, focus shadow, radius, spacing, typography sizes, line heights, and weights. [VERIFIED: `client/app/assets/css/main.css`]
- `main.css` still contains `.v-application`, `.v-overlay-container`, `.v-btn`, `.v-card`, `.v-field`, `.v-list`, and `.v-table` font-family selectors, so residual Vuetify selector coupling exists in global CSS even though the package/module surface is gone. [VERIFIED: `client/app/assets/css/main.css`][VERIFIED: package scan]
- `client/app/styles/` still contains CSS files with `.v-*` or `:deep(.v-*)` selectors and legacy `.scss` source files, but Phase 2 D-19 says untouchable/non-proof CSS debt can remain inventory debt for later phases. [VERIFIED: style scan][VERIFIED: `02-CONTEXT.md`]
- No `client/app/components/ui/Ui*.vue` components exist yet. [VERIFIED: `rg --files client/app/components | rg "Ui.*\\.vue$"`]

## Current Shared Surface Analysis

| Surface | Current State | Phase 2 Recommendation | Risk |
|---------|---------------|------------------------|------|
| `AppSkeleton` | Shared loading primitive with variants `dashboard`, `stats`, `grid`, `table`, `list`, `calendar`, `form`, `detail`; uses `<style scoped>`. [VERIFIED: `AppSkeleton.vue`] | Add `UiSkeleton` with matching variants and migrate `AppSkeleton` to a compatibility wrapper or direct `UiSkeleton` export. [VERIFIED: `02-UI-SPEC.md`] | Medium: used broadly across dashboard, calendar, documents, payments, profile, assistant/dialog pages. [VERIFIED: usage scan] |
| `TablePager` | Already Tailwind-only, uses `PaginationMeta`, `defineModel` for `page`/`limit`, i18n range text, standard sizes plus current limit. [VERIFIED: `TablePager.vue`] | Extract/rename behavior into `UiPagination`; keep `TablePager` wrapper temporarily if many pages import it. [VERIFIED: usage scan] | Low: simple behavior, no CSS, no Vuetify. [VERIFIED: source scan] |
| `AppToast` | Global app infrastructure mounted in `app.vue`; uses `useToast`, role `alert` for errors and `status` for others; uses `<style scoped>`. [VERIFIED: `AppToast.vue`][VERIFIED: `app.vue`] | Add `UiToast` item surface and migrate `AppToast` stack/positioning to Tailwind utilities while preserving roles, dismiss, TransitionGroup, desktop/mobile placement. [VERIFIED: `02-UI-SPEC.md`] | Medium: global feedback surface; visual QA required for desktop/mobile placement. [VERIFIED: `02-UI-SPEC.md`] |
| `ClassLocation` | Small display component; computes online/offline label/link; inline mode uses `v-icon`, default mode uses `v-chip`. [VERIFIED: `ClassLocation.vue`] | Replace with Tailwind markup using `AppIcon`, `UiBadge`, and native anchor/span; preserve `@click.stop`, `_blank`, `rel="noopener"`, size, inline/chip modes. [VERIFIED: `ClassLocation.vue`][VERIFIED: `02-UI-SPEC.md`] | Low to medium: used in teacher dashboard, session dialog, classes pages. [VERIFIED: usage scan] |

## High-Risk Dialog and Page Inputs

- `SessionDialog` is high risk because it creates, updates, bulk creates, deletes, and changes status for sessions; it depends on classes, assistants, auth, user timezone conversion, recurrence mode, instructor selection, `ClassLocation`, and loading/error states. [VERIFIED: `SessionDialog.vue`] Phase 2 should use it only to shape `UiDialog`, `UiButton`, `UiInput`, `UiSelect`, `UiSegmentedControl`, `UiBadge`, `UiAlert`, and `UiConfirmDialog` contracts. [VERIFIED: `02-CONTEXT.md`]
- `StudentDetailDialog` is high risk because it loads student detail, scores, comments, classes, and mutations; it uses tabs/windows, score form, delete score loading state, comments timeline, and profile save workflow. [VERIFIED: `StudentDetailDialog.vue`] Phase 2 should not migrate the whole dialog. [VERIFIED: `02-CONTEXT.md`]
- `AssistantDetailDialog` is medium-high risk because it loads assistant detail and salary, edits salary configuration, renders summary table, and lists assigned classes. [VERIFIED: `AssistantDetailDialog.vue`] It can inform `UiDialog`, `UiTable`, `UiBadge`, `UiAvatar`, and `UiMetricCard`, but full migration should be deferred. [VERIFIED: source scan]
- `/assistants` uses search, pagination, create assistant dialog, assistant list, avatar/image fallback, salary chips, classes chip, and detail-open behavior. [VERIFIED: `pages/assistants/index.vue`] Do not rewrite in Phase 2. [VERIFIED: `02-CONTEXT.md`]
- `/assistants/[id]` is the densest priority page in this research sample; it has profile, salary summary, assigned classes, salary config, rate history, tabs, schedule table, breakdown table, history table, and edit profile dialog. [VERIFIED: `pages/assistants/[id].vue`] Do not rewrite in Phase 2. [VERIFIED: `02-CONTEXT.md`]
- `/audit-logs` has filter controls, audit table, action badge coloring, empty row, loading skeleton, and `TablePager`. [VERIFIED: `pages/audit-logs.vue`] It is a good Phase 4 consumer of `UiToolbar`, `UiSelect`, `UiInput`, `UiTable`, `UiBadge`, `UiEmptyState`, and `UiPagination`. [VERIFIED: source scan]
- `/profile` has profile loading skeleton, error/success alerts, disabled email, full name/phone/timezone controls, role chip, and save loading state. [VERIFIED: `pages/profile.vue`] It is a good later proof of form components but should stay Phase 4. [VERIFIED: `02-CONTEXT.md`]

## Recommended Ui* Component Inventory and File Structure

Use this file structure. [VERIFIED: codebase convention: PascalCase Vue components][VERIFIED: 02-CONTEXT.md]

```text
client/app/components/ui/
├── README.md
├── UiActionGroup.vue
├── UiAlert.vue
├── UiAvatar.vue
├── UiBadge.vue
├── UiButton.vue
├── UiCard.vue
├── UiCheckbox.vue
├── UiConfirmDialog.vue
├── UiDialog.vue
├── UiEmptyState.vue
├── UiIconButton.vue
├── UiInput.vue
├── UiList.vue
├── UiListItem.vue
├── UiMetricCard.vue
├── UiPage.vue
├── UiPageHeader.vue
├── UiPagination.vue
├── UiProgress.vue
├── UiSection.vue
├── UiSegmentedControl.vue
├── UiSelect.vue
├── UiSkeleton.vue
├── UiSpinner.vue
├── UiStatusDot.vue
├── UiTable.vue
├── UiTabs.vue
├── UiTextarea.vue
├── UiToast.vue
└── UiToolbar.vue
```

Implementation rules:

- Every new `Ui*` component uses `<script setup lang="ts">`, explicit `defineProps`/`defineEmits`, Tailwind classes only, and no `<style>` block. [VERIFIED: local component convention][VERIFIED: `02-UI-SPEC.md`]
- Components are UI-only and must not call feature composables, stores, `useApi`, or mutation composables. [VERIFIED: AGENTS.md][VERIFIED: `02-CONTEXT.md`]
- Components use slots for content and props only for repeated visual states such as `variant`, `tone`, `size`, `loading`, `disabled`, `error`, `hint`, and `required`. [VERIFIED: `02-CONTEXT.md`]
- Icon rendering uses `AppIcon`; do not add another icon library. [VERIFIED: `AppIcon.vue`][VERIFIED: `02-UI-SPEC.md`]

## Recommended Proof Migrations

| Order | Proof | Why Low Risk | Required Checks |
|-------|-------|--------------|-----------------|
| 1 | `UiButton`, `UiIconButton`, `UiBadge`, `UiSpinner`, `UiCard` foundation | These unblock other proof components and do not require feature data. [VERIFIED: `02-UI-SPEC.md`] | Static scan: no `<style>`, no `v-*`, no composables. [VERIFIED: verification contract] |
| 2 | `TablePager` -> `UiPagination` with `TablePager` wrapper | Existing implementation is already Tailwind-only and behavior is small. [VERIFIED: `TablePager.vue`] | Preserve range math, page clamp, page-size list, i18n strings, disabled prev/next. [VERIFIED: `TablePager.vue`] |
| 3 | `AppSkeleton` -> `UiSkeleton` | Existing prop surface is simple and variants are known. [VERIFIED: `AppSkeleton.vue`] | Preserve approximate dimensions for all variants; check pages that use dashboard/calendar/table/detail/list/form. [VERIFIED: usage scan] |
| 4 | `AppToast` -> `UiToast` | Global, but state API is isolated in `useToast`; item surface can be extracted. [VERIFIED: `AppToast.vue`] | Preserve roles, dismiss, stack, reduced motion, desktop bottom-right and mobile bottom-inset layout. [VERIFIED: `AppToast.vue`] |
| 5 | `ClassLocation` -> `UiBadge` + `AppIcon` | Small Vuetify dependency and clear online/offline behavior. [VERIFIED: `ClassLocation.vue`] | Preserve inline/default modes, links, labels, icon names, `@click.stop`, `_blank`, and `rel`. [VERIFIED: `ClassLocation.vue`] |

Avoid migrating `SessionDialog`, `StudentDetailDialog`, `AssistantDetailDialog`, `/assistants`, `/assistants/[id]`, `/audit-logs`, or `/profile` in Phase 2 except as read-only requirements input. [VERIFIED: `02-CONTEXT.md`][VERIFIED: source scan]

## Risks and Constraints Tied to D-01 through D-21

| Decisions | Risk | Planning Control |
|-----------|------|------------------|
| D-01-D-04 | New `Ui*` components may accidentally use scoped CSS or global helper classes. [VERIFIED: source currently contains scoped CSS in shared components] | Add a static scan task after every wave: `rg -n "<style|lang=\"scss\"|\\.scss|<v-|</v-" client/app/components/ui client/app/components/AppSkeleton.vue client/app/components/AppToast.vue client/app/components/ClassLocation.vue client/app/components/TablePager.vue`. [VERIFIED: verification contract] |
| D-05-D-07 | Visual parity cannot be proven by build output alone. [VERIFIED: `02-CONTEXT.md`] | Add desktop/mobile visual QA for proof surfaces, especially toast, skeleton, and ClassLocation placements. [VERIFIED: `02-UI-SPEC.md`] |
| D-08-D-10 | Overbuilding a complete design system may consume Phase 2 without helping Phase 3/4. [VERIFIED: `02-CONTEXT.md`] | Limit variants to priority pages and shared surfaces identified in scans. [VERIFIED: priority page scan] |
| D-11-D-15 | Copying Vuetify prop APIs would create a second framework instead of a small kit. [VERIFIED: `02-CONTEXT.md`] | Keep slot-first APIs and pages rendering their own data. [VERIFIED: `02-CONTEXT.md`] |
| D-16-D-19 | Full page/dialog migration in Phase 2 could break workflows. [VERIFIED: component/page scan] | Plan proof migrations only; defer high-risk surfaces to Phase 3/4. [VERIFIED: `02-CONTEXT.md`] |
| D-20-D-21 | Later phases may misuse components without docs or migration map. [VERIFIED: `02-CONTEXT.md`] | Make `client/app/components/ui/README.md` a required implementation artifact. [VERIFIED: `02-CONTEXT.md`] |

## Architecture Patterns

### System Architecture Diagram

```text
Nuxt page/layout/dialog
  -> feature composable/store owns data and workflow state
  -> Ui* component receives props/slots/events only
  -> Tailwind utilities + --st-* tokens render visual state
  -> AppIcon renders mdi-* icon class when icon needed
  -> event emits back to page/dialog
  -> page/dialog calls composable mutation/API when needed
```

This preserves data ownership outside the UI kit. [VERIFIED: AGENTS.md][VERIFIED: component scan]

### Recommended Project Structure

```text
client/app/
├── assets/css/main.css          # Tailwind entry, font import, :root tokens only
├── components/
│   ├── ui/                      # Local Tailwind-only Ui* primitives
│   ├── AppIcon.vue              # App infrastructure icon seam
│   ├── AppToast.vue             # App singleton using UiToast
│   ├── AppSkeleton.vue          # Compatibility wrapper over UiSkeleton
│   ├── TablePager.vue           # Compatibility wrapper over UiPagination
│   └── ClassLocation.vue        # Shared display using UiBadge/AppIcon
└── pages/                       # Feature pages use composables + Ui* primitives
```

### Pattern 1: Slot-First Components

**What:** Expose layout/state props and let callers provide content through slots. [VERIFIED: `02-CONTEXT.md`]
**When to use:** Use for `UiCard`, `UiTable`, `UiList`, `UiEmptyState`, `UiDialog`, `UiPageHeader`. [VERIFIED: `02-UI-SPEC.md`]

```vue
<UiCard variant="outlined">
  <template #header>Salary summary</template>
  <UiMetricCard label="Sessions" :value="summary.totalSessions" />
</UiCard>
```

### Pattern 2: Compatibility Wrappers for Existing Shared Names

**What:** Keep existing imports/usages stable while delegating visuals to new primitives. [VERIFIED: usage scan]
**When to use:** Use for `AppSkeleton`, `TablePager`, and `AppToast` because they are already referenced across routes/components. [VERIFIED: usage scan]

```vue
<!-- AppSkeleton.vue -->
<template>
  <UiSkeleton :variant="variant" :rows="rows" :columns="columns" :cards="cards" />
</template>
```

### Pattern 3: Native Control First

**What:** Use native `button`, `input`, `select`, `textarea`, `table`, and `dialog`-style semantics where practical. [VERIFIED: `02-UI-SPEC.md`]
**When to use:** Use for `UiInput`, `UiSelect`, `UiTextarea`, `UiTable`, `UiPagination`. [VERIFIED: priority page scan]

### Anti-Patterns to Avoid

- **Scoped CSS in new kit:** Violates D-02 and hides design drift. [VERIFIED: `02-CONTEXT.md`]
- **New global helper classes for components:** Violates D-03 and recreates framework CSS. [VERIFIED: `02-CONTEXT.md`]
- **Full Vuetify prop clone:** Violates D-13 and increases migration complexity. [VERIFIED: `02-CONTEXT.md`]
- **Direct composable/API calls inside `Ui*`:** Violates AGENTS and breaks tier ownership. [VERIFIED: AGENTS.md]
- **Card-in-card layouts:** Violates UI-SPEC spacing/layout guidance. [VERIFIED: `02-UI-SPEC.md`]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Feature data fetching in UI controls | API-aware `UiSelect` or `UiTable` | Feature composables in pages/dialogs | Existing architecture keeps API calls in composables and pages. [VERIFIED: AGENTS.md] |
| Icon rendering | Custom icon SVG/parser | `AppIcon` with MDI name | Phase 1 retained MDI and built the seam. [VERIFIED: `AppIcon.vue`][VERIFIED: `01-CONTEXT.md`] |
| Data table engine | Generic sorting/filtering/server data table | Slot-first `UiTable` plus page-owned logic | D-15 rejects highly abstract `UiDataTable`. [VERIFIED: `02-CONTEXT.md`] |
| Validation engine | Validation inside `UiInput` | External form/page validation with `error` and `hint` props | D-14 says form controls are UI-only. [VERIFIED: `02-CONTEXT.md`] |
| Modal workflow orchestration | A dialog component that owns saves/deletes | `UiDialog`/`UiConfirmDialog` emits events | Existing dialogs have feature workflows that must stay outside primitives. [VERIFIED: component scan] |

**Key insight:** Phase 2 is a UI foundation migration, not a product workflow migration. [VERIFIED: `02-CONTEXT.md`]

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None - Phase 2 changes component structure and styles only; no database/datastore keys are renamed. [VERIFIED: phase scope] | None. |
| Live service config | None - no external service configuration is changed by the UI kit. [VERIFIED: phase scope] | None. |
| OS-registered state | None - no OS services/tasks/process names are changed. [VERIFIED: phase scope] | None. |
| Secrets/env vars | None - no secret or env var names are changed. [VERIFIED: phase scope] | None. |
| Build artifacts | Nuxt generated artifacts may reflect component changes after build. [ASSUMED] | Run `npm run build` from `client/`; do not edit generated output. [VERIFIED: AGENTS.md] |

## Common Pitfalls

### Pitfall 1: Treating Phase 2 as Full Redesign

**What goes wrong:** Planner rewrites priority pages or high-risk dialogs before primitives are stable. [VERIFIED: `02-CONTEXT.md`]
**Why it happens:** The proof candidates sit near priority page dependencies. [VERIFIED: usage scan]
**How to avoid:** Limit implementation tasks to kit docs/components and small proof surfaces. [VERIFIED: `02-CONTEXT.md`]
**Warning signs:** Plans include full `/assistants/[id]`, `SessionDialog`, or `StudentDetailDialog` migration. [VERIFIED: source scan]

### Pitfall 2: Hidden CSS Debt in New Components

**What goes wrong:** New `Ui*` components use `<style scoped>` or helper classes because Tailwind utility strings feel long. [VERIFIED: existing shared components use scoped CSS]
**Why it happens:** Existing local pattern still contains scoped CSS in many files. [VERIFIED: style scan]
**How to avoid:** Static scan `client/app/components/ui` and touched proof files. [VERIFIED: verification contract]
**Warning signs:** `<style>`, `.scss`, `@use`, `@forward`, `.v-*`, or `:deep(.v-*)` in touched files. [VERIFIED: scan patterns]

### Pitfall 3: Breaking Existing Global Users of Proof Components

**What goes wrong:** Changing `AppSkeleton`, `TablePager`, `AppToast`, or `ClassLocation` changes prop/slot behavior expected by pages. [VERIFIED: usage scan]
**Why it happens:** These components are used across multiple pages/routes. [VERIFIED: usage scan]
**How to avoid:** Keep wrappers and old prop names until downstream phases migrate call sites. [VERIFIED: usage scan]
**Warning signs:** Typecheck errors in pages not otherwise touched. [VERIFIED: `client/package.json` scripts]

### Pitfall 4: Inaccessible Icon-Only and Dialog Controls

**What goes wrong:** Tailwind replacements lose labels, focus rings, Escape handling, or focus restoration. [VERIFIED: `02-UI-SPEC.md`]
**Why it happens:** Vuetify previously supplied some semantics implicitly. [ASSUMED]
**How to avoid:** Require `aria-label` on `UiIconButton`; implement visible focus; document dialog focus trap expectations. [VERIFIED: `02-UI-SPEC.md`]
**Warning signs:** Icon-only buttons without label or focus-visible classes. [VERIFIED: `02-UI-SPEC.md`]

## Code Examples

Verified patterns for Phase 2:

### `UiPagination` Behavior Contract

```ts
// Source: client/app/components/TablePager.vue
const from = computed(() => (props.meta.total === 0 ? 0 : (props.meta.page - 1) * props.meta.limit + 1));
const to = computed(() => Math.min(props.meta.page * props.meta.limit, props.meta.total));
const sizeItems = computed(() =>
  Array.from(new Set([limit.value, 10, 20, 30, 40, 50])).sort((a, b) => a - b),
);
```

Preserve this math when extracting `UiPagination`. [VERIFIED: `TablePager.vue`]

### `AppIcon` Seam

```vue
<!-- Source: client/app/components/AppIcon.vue -->
<AppIcon name="mdi-chevron-right" :size="18" />
```

Use `AppIcon` inside `UiButton`, `UiIconButton`, `UiBadge`, `UiAlert`, `UiToast`, and `UiEmptyState` when icon rendering is needed. [VERIFIED: `AppIcon.vue`][VERIFIED: `02-UI-SPEC.md`]

### Tailwind Token Usage

```vue
<button
  class="inline-flex min-h-11 items-center justify-center rounded-[var(--st-radius)] bg-[var(--st-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--st-primary-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:opacity-50"
>
  <slot />
</button>
```

Use arbitrary values for existing `--st-*` tokens instead of adding component CSS. [VERIFIED: `main.css`][VERIFIED: `02-CONTEXT.md`]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vuetify/Sass platform registration | Tailwind 4 via Vite plugin plus local Vue components | Phase 1, 2026-06-30 | Phase 2 must not add Vuetify/Sass back. [VERIFIED: `01-VERIFICATION.md`][VERIFIED: package scan] |
| Page/component scoped CSS for shared UI | Tailwind-only `Ui*` primitives | Phase 2 target | New/touched proof files must avoid `<style>`. [VERIFIED: `02-CONTEXT.md`] |
| Vuetify chips/buttons/tables/dialogs | Local `UiBadge`, `UiButton`, `UiTable`, `UiDialog` | Phase 2/3/4 target | Phase 2 creates primitives; Phase 3/4 apply broadly. [VERIFIED: `ROADMAP.md`] |

**Deprecated/outdated:**

- Vuetify package/module/config surface: removed in Phase 1 and should not return. [VERIFIED: `01-VERIFICATION.md`][VERIFIED: package scan]
- New SCSS/scoped CSS for UI components: disallowed by D-02. [VERIFIED: `02-CONTEXT.md`]
- Third-party UI registries: not approved for Phase 2. [VERIFIED: `02-UI-SPEC.md`]

## Suggested Plan Split / Waves

| Wave | Plans | Output |
|------|-------|--------|
| Wave 0 | Static baseline and docs scaffold | Confirm no existing `Ui*`; create `client/app/components/ui/README.md` with token/API/migration-map rules. [VERIFIED: scans][VERIFIED: `02-CONTEXT.md`] |
| Wave 1 | Foundation/layout | `UiPage`, `UiPageHeader`, `UiToolbar`, `UiSection`, `UiCard`, `UiButton`, `UiIconButton`, `UiSpinner`, `UiBadge`, `UiAvatar`. [VERIFIED: `02-UI-SPEC.md`] |
| Wave 2 | Forms/data primitives | `UiInput`, `UiTextarea`, `UiSelect`, `UiCheckbox`, `UiSegmentedControl`, `UiActionGroup`, `UiTable`, `UiList`, `UiListItem`, `UiMetricCard`, `UiStatusDot`, `UiPagination`. [VERIFIED: `02-UI-SPEC.md`][VERIFIED: page scan] |
| Wave 3 | Feedback/overlay primitives | `UiAlert`, `UiToast`, `UiSkeleton`, `UiEmptyState`, `UiProgress`, `UiDialog`, `UiConfirmDialog`, optional `UiTabs`. [VERIFIED: `02-UI-SPEC.md`] |
| Wave 4 | Proof migrations | Migrate `TablePager`, `AppSkeleton`, `AppToast`, and `ClassLocation` while preserving public props and behavior. [VERIFIED: proof component scan] |
| Wave 5 | Verification and Phase 3/4 handoff | Run lint/typecheck/build; run static scans; document remaining high-risk surfaces and consumer map. [VERIFIED: AGENTS.md][VERIFIED: `02-CONTEXT.md`] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Nuxt build artifacts may reflect component changes after build. | Runtime State Inventory | Low; build output is generated and should not be edited. |
| A2 | Vuetify previously supplied some accessibility semantics implicitly. | Common Pitfalls | Medium; mitigated by explicit UI-SPEC a11y rules. |

## Open Questions - RESOLVED 2026-06-30

1. **RESOLVED: `TablePager` remains as a compatibility wrapper over `UiPagination` in Phase 2.** [VERIFIED: usage scan][VERIFIED: Phase boundary]
   - Decision: Phase 2 extracts the shared pagination behavior into `UiPagination` and keeps `TablePager` as the stable compatibility wrapper for existing call sites.
   - Rationale: Multiple pages currently import/use `TablePager`; preserving the wrapper avoids broad consumer churn inside the UI foundation phase.
   - Boundary: Direct call-site migration from `TablePager` to `UiPagination` is deferred to Phase 4 or other consumer phases when those pages are already being touched.

2. **RESOLVED: `UiDialog` implements and documents minimal focus management sufficient for the Phase 2 foundation.** [VERIFIED: `02-UI-SPEC.md`][VERIFIED: `02-CONTEXT.md`]
   - Decision: Phase 2 `UiDialog` must support foundation-level focus behavior: move focus into the dialog on open, provide visible focus styles, close eligible dialogs with Escape, support documented backdrop behavior, and attempt focus restoration to the opener on close.
   - Rationale: Dialog foundation needs enough accessibility behavior for downstream migration planning, but Phase 2 is not the phase for high-risk workflow rewrites.
   - Boundary: Full migration and hardening of high-risk dialog workflows such as `SessionDialog`, `StudentDetailDialog`, and `AssistantDetailDialog` remains deferred to Phase 3/4 consumer phases.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Nuxt/npm scripts | Yes via `C:\Users\Tan Tran\AppData\Local\nvm\v24.11.1` | `v24.11.1` | Add nvm path before commands. [VERIFIED: command probe] |
| npm | Client verification | Yes via nvm path | `11.6.2` | Use `npm.cmd --prefix client ...` from repo root. [VERIFIED: command probe] |
| ripgrep | Static scans | Yes | path found in VS Code extension bin | PowerShell `Select-String` if missing. [VERIFIED: command probe] |
| Git | Optional docs commit | Yes | path found | Manual status if needed. [VERIFIED: command probe] |
| Browser/Playwright | Visual QA | Not detected in this research | n/a | Manual desktop/mobile browser QA. [VERIFIED: no frontend test runner in TESTING.md] |

**Missing dependencies with no fallback:**
- None for research/planning. [VERIFIED: command probes]

**Missing dependencies with fallback:**
- Automated browser visual tooling is not configured; use manual visual QA unless a later plan adds tooling. [VERIFIED: `.planning/codebase/TESTING.md`]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No frontend unit/component/e2e runner configured; use ESLint/Nuxt typecheck/Nuxt build. [VERIFIED: `.planning/codebase/TESTING.md`][VERIFIED: `client/package.json`] |
| Config file | `client/eslint.config.mjs`; Nuxt typecheck uses Nuxt config. [VERIFIED: `.planning/codebase/STACK.md`] |
| Quick run command | `npm.cmd --prefix client run lint` [VERIFIED: `client/package.json`] |
| Full suite command | `npm.cmd --prefix client run lint && npm.cmd --prefix client run typecheck && npm.cmd --prefix client run build` [VERIFIED: AGENTS.md] |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| UIKIT-00 | Docs include token/API/naming/migration map. | static/manual | `Test-Path client/app/components/ui/README.md` | No - Wave 0. [VERIFIED: file probe] |
| UIKIT-01 | Layout primitives exist and contain no CSS/Vuetify. | static | `rg -n "<style|<v-|</v-" client/app/components/ui` | No - Wave 1. [VERIFIED: file probe] |
| UIKIT-02 | Form/control primitives exist and are UI-only. | static/typecheck | `rg -n "use[A-Z].*\\(" client/app/components/ui` plus typecheck | No - Wave 2. [VERIFIED: file probe] |
| UIKIT-03 | Data display primitives and `UiPagination` exist. | static/typecheck | `npm.cmd --prefix client run typecheck` | No - Wave 2. [VERIFIED: file probe] |
| UIKIT-04 | Feedback/dialog primitives exist; proof surfaces migrate. | static/visual | `rg -n "<style|<v-|</v-" client/app/components/AppSkeleton.vue client/app/components/AppToast.vue client/app/components/ClassLocation.vue` | Partial existing surfaces. [VERIFIED: source scan] |
| UIKIT-05 | Practical duplicated surfaces use shared primitives without behavior change. | lint/typecheck/build/manual | Full suite plus desktop/mobile QA | No - Wave 4. [VERIFIED: source scan] |

### Sampling Rate

- **Per task commit:** Run `npm.cmd --prefix client run lint` for small component-only changes. [VERIFIED: AGENTS.md]
- **Per wave merge:** Run `npm.cmd --prefix client run typecheck` after component API changes. [VERIFIED: AGENTS.md]
- **Phase gate:** Run `npm.cmd --prefix client run lint`, `npm.cmd --prefix client run typecheck`, and `npm.cmd --prefix client run build`. [VERIFIED: AGENTS.md]

### Wave 0 Gaps

- [ ] `client/app/components/ui/README.md` - covers UIKIT-00. [VERIFIED: no file currently]
- [ ] `client/app/components/ui/Ui*.vue` components - covers UIKIT-01 through UIKIT-04. [VERIFIED: no files currently]
- [ ] Static scan commands in plan verification notes - covers D-02/D-04. [VERIFIED: `02-CONTEXT.md`]
- [ ] Manual desktop/mobile QA notes for toast/skeleton/location proof surfaces - covers D-06. [VERIFIED: `02-CONTEXT.md`]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | No direct auth implementation in Phase 2. [VERIFIED: phase scope] | Do not change auth store/session flows. [VERIFIED: AGENTS.md] |
| V3 Session Management | No direct session-token implementation in Phase 2. [VERIFIED: phase scope] | Do not move token/session logic into UI kit. [VERIFIED: AGENTS.md] |
| V4 Access Control | Indirectly applies because pages using kit render tenant-owned data. [VERIFIED: AGENTS.md] | UI kit must stay data-agnostic; backend/composables enforce tenant scope. [VERIFIED: ARCHITECTURE.md] |
| V5 Input Validation | Yes for form control display states. [VERIFIED: UIKIT-02] | `UiInput`/`UiSelect` accept external error/hint/required; validation remains in form/page/composable code. [VERIFIED: `02-CONTEXT.md`] |
| V6 Cryptography | No. [VERIFIED: phase scope] | Do not add crypto or token handling. [VERIFIED: phase scope] |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-tenant data exposure after UI refactor | Information Disclosure | Keep feature composables/API paths unchanged; do not move data fetching into `Ui*`. [VERIFIED: AGENTS.md][VERIFIED: ARCHITECTURE.md] |
| XSS through untrusted slot/content assumptions | Tampering | Vue template escaping by default; avoid `v-html` in `Ui*`. [ASSUMED] |
| Accessibility regression hiding error/status state | Denial of Service | Visible labels, focus states, semantic alert/toast roles. [VERIFIED: `02-UI-SPEC.md`] |
| Reverse tabnabbing for meeting links | Spoofing | Preserve `target="_blank"` with `rel="noopener"` in `ClassLocation`. [VERIFIED: `ClassLocation.vue`] |

## Sources

### Primary (HIGH confidence)

- `AGENTS.md` - project constraints, patterns, verification commands. [VERIFIED: local file]
- `.planning/PROJECT.md` - milestone goal and constraints. [VERIFIED: local file]
- `.planning/ROADMAP.md` - Phase 2 boundary and success criteria. [VERIFIED: local file]
- `.planning/REQUIREMENTS.md` - UIKIT-00 through UIKIT-05. [VERIFIED: local file]
- `.planning/STATE.md` - Phase 1 completion state. [VERIFIED: local file]
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-CONTEXT.md` - D-01 through D-21. [VERIFIED: local file]
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-UI-SPEC.md` - design contract. [VERIFIED: local file]
- `.planning/phases/01-styling-platform-cutover/01-MIGRATION-INVENTORY.md` - remaining Vuetify/CSS inventory. [VERIFIED: local file]
- `.planning/phases/01-styling-platform-cutover/01-VERIFICATION.md` - Phase 1 verification. [VERIFIED: local file]
- `client/app/assets/css/main.css` and requested Vue files - implementation state. [VERIFIED: codebase scan]

### Secondary (MEDIUM confidence)

- `.planning/codebase/*.md` - generated codebase maps for stack, structure, conventions, testing, architecture, concerns. [VERIFIED: local generated docs]

### Tertiary (LOW confidence)

- None from web search. [VERIFIED: no web research used]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - package/config files were read directly. [VERIFIED: `client/package.json`][VERIFIED: `client/nuxt.config.ts`]
- Architecture: HIGH - project docs and source confirm UI/data boundaries. [VERIFIED: AGENTS.md][VERIFIED: ARCHITECTURE.md][VERIFIED: component scan]
- Pitfalls: HIGH for local migration risks; LOW only where explicitly marked `[ASSUMED]`. [VERIFIED: source scan]

**Research date:** 2026-06-30
**Valid until:** 2026-07-30 for local code state, or earlier if Phase 2 implementation starts changing shared UI files. [ASSUMED]
