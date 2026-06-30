# Phase 2: Tailwind Design System & Shared UI Kit - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 defines the Tailwind-only design system and builds the shared Vue UI kit needed by Phase 3 app shell/shared surface migration and Phase 4 priority page redesign. This phase should establish enforceable UI rules, token usage, component naming/API conventions, core `Ui*` primitives, usage documentation, and a small set of low-risk shared component migrations that prove the kit works in the existing Nuxt app.

Phase 2 is not a full-app CSS/SCSS deletion phase and should not rewrite large pages or high-risk dialog workflows. The milestone goal remains a fully Tailwind-only UI with no page/component SCSS or hand-written CSS, but Phase 2's scope is to create the foundation and migrate only touched shared surfaces.

</domain>

<decisions>
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Current milestone, product priorities, Tailwind-only direction, and visual parity constraints.
- `.planning/ROADMAP.md` - Phase 2 scope, success criteria, and boundaries for Phase 3/4/5.
- `.planning/REQUIREMENTS.md` - UIKIT-00 through UIKIT-05 and milestone acceptance criteria.
- `.planning/STATE.md` - Current project state and Phase 1 completion notes.

### Prior Phase Outputs
- `.planning/phases/01-styling-platform-cutover/01-CONTEXT.md` - Locked Phase 1 decisions, including real Vuetify/SCSS platform cutover and `AppIcon` strategy.
- `.planning/phases/01-styling-platform-cutover/01-MIGRATION-INVENTORY.md` - Required inventory for remaining Vuetify tags, CSS coupling, and shared UI kit needs.
- `.planning/phases/01-styling-platform-cutover/01-VERIFICATION.md` - Phase 1 verification status and scans proving platform cutover passed.

### Codebase Maps
- `.planning/codebase/STACK.md` - Nuxt/Vue/Tailwind stack context and frontend scripts.
- `.planning/codebase/STRUCTURE.md` - Frontend source layout and where shared UI code lives.
- `.planning/codebase/CONVENTIONS.md` - Frontend naming, component, composable, and code style conventions.
- `.planning/codebase/TESTING.md` - Verification commands and frontend testing limitations.

### Current Frontend Files
- `client/app/assets/css/main.css` - Current Tailwind entry, `--st-*` tokens, font import, and existing global CSS to keep minimal.
- `client/app/components/AppIcon.vue` - Existing Material Design Icons primitive that should remain the icon foundation.
- `client/app/components/AppSkeleton.vue` - Existing loading primitive and likely Phase 2 proof migration candidate.
- `client/app/components/TablePager.vue` - Existing pagination primitive and likely Phase 2 proof migration candidate.
- `client/app/components/AppToast.vue` - Existing toast surface and likely feedback primitive reference/proof candidate.
- `client/app/components/ClassLocation.vue` - Small shared display component and possible proof migration candidate.
- `client/app/components/SessionDialog.vue` - High-risk shared dialog; use as requirements input for dialog foundation, not a default full migration target.
- `client/app/components/StudentDetailDialog.vue` - High-risk shared dialog; use as requirements input for tabs/list/dialog needs, not a default full migration target.
- `client/app/components/AssistantDetailDialog.vue` - High-risk shared dialog; use as requirements input for dialog/table/form needs, not a default full migration target.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/app/assets/css/main.css`: Already contains Tailwind 4 setup, font, and `--st-*` tokens. Phase 2 should preserve it as the minimal global foundation while removing any page/component styling expectations from new work.
- `client/app/components/AppIcon.vue`: Already decouples MDI icon rendering from Vuetify and should be reused by `UiButton`, `UiBadge`, empty states, alerts, and dialogs.
- `client/app/components/AppToast.vue`, `TablePager.vue`, `AppSkeleton.vue`, and `ClassLocation.vue`: Small shared surfaces suitable for proving the new kit if the planner can preserve parity.

### Established Patterns
- Frontend is Nuxt 4/Vue 3 with Tailwind 4 via `@tailwindcss/vite`.
- Feature data flows belong in composables; UI components should not call APIs directly.
- Existing pages/components still include many `<v-*>` tags, so Phase 2 should create reusable replacement primitives before broad migration.
- Phase 1 retained `@mdi/font`; do not switch icon libraries in Phase 2 unless explicitly replanned later.

### Integration Points
- Shared UI components should live under `client/app/components` in a discoverable `Ui*` pattern or subfolder chosen by the planner.
- Phase 3 will use the kit for app shell, auth/shared surfaces, calendar/dashboard blockers, and shared dialogs.
- Phase 4 will use the kit for `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- Verification for frontend changes should use `npm run lint`, `npm run typecheck`, and `npm run build` from `client/`; add desktop/mobile visual QA where UI risk exists.

</code_context>

<specifics>
## Specific Ideas

- The user wants the entire UI direction to be Tailwind-only: no SCSS and no hand-written page/component CSS after the migration is complete.
- The user wants UI parity preserved while the implementation changes. This phase should not be used as hidden redesign.
- PREP-style education SaaS feel is inspiration only; do not copy brand/assets.
- Shared UI kit docs should make later planning easier by mapping old Vuetify/SCSS patterns to `Ui*` replacements.

</specifics>

<deferred>
## Deferred Ideas

- Full app-wide CSS/SCSS removal belongs across Phase 3/4/5, not entirely inside Phase 2.
- Large page rewrites for `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` belong to Phase 4.
- App shell/shared surface migration beyond small proof candidates belongs to Phase 3.
- Admin/low-traffic/future page coverage remains deferred unless a component is required by Phase 3/4.

</deferred>

---

*Phase: 2-Tailwind Design System & Shared UI Kit*
*Context gathered: 2026-06-30*
