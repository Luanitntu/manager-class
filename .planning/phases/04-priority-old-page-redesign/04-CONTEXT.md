# Phase 4: Priority Old Page Redesign - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 redesigns the priority old UI pages `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` using the Tailwind-only shared UI kit while preserving current behavior, composables, data ownership, loading/error/empty states, pagination, filters, create/edit/save flows, and responsive usability. This phase removes the remaining Vuetify markup from these four pages, but does not expand into backend changes, new assistant features, admin/center screens, or broad app cleanup outside the named routes.

</domain>

<decisions>
## Implementation Decisions

### Assistant List Shape
- **D-01:** `/assistants` should use a dense list-row / lightweight-card presentation, not a full card grid. Each assistant row should keep fast scanability: avatar at the left, name/email/phone in the main area, salary and class-count badges to the right on desktop, and wrapped badges on mobile.
- **D-02:** The create-assistant flow should stay in a compact `UiDialog` around the current 460px width. Preserve the existing fields, inline error display, create loading state, and disabled state for missing full name/email or password shorter than 8 characters.
- **D-03:** The assistant empty state should remain compact inside the list/card area with a clear `Create assistant` CTA. Do not introduce a large illustration or marketing-style onboarding panel.
- **D-04:** Preserve current search and pagination behavior: search and limit changes reset `page` to 1, pagination remains through `TablePager` / `UiPagination`, and no new debounce behavior is added in this phase.

### Assistant Detail Hierarchy
- **D-05:** `/assistants/[id]` should use a header plus two-column summary layout on desktop, stacking on mobile. Profile and salary summary should sit side by side; assigned classes, salary config, and schedule/breakdown/history tables should remain full-width below.
- **D-06:** Salary configuration should remain visible as its own inline card. Keep method/rate/effective date inputs and save action on the page rather than moving salary editing into a dialog.
- **D-07:** Schedule, salary breakdown, and salary history should remain table-based on mobile using horizontal overflow. Do not convert them to bespoke stacked cards in this phase.
- **D-08:** The assistant edit-profile flow should remain a compact dialog for phone, level, and hometown. Preserve loading and close behavior; do not change it into inline editing.

### Audit Log Scanability
- **D-09:** `/audit-logs` filters should remain a horizontal wrapping toolbar: action, entity type, from date, to date, and clear filters visible together on desktop and wrapping cleanly on mobile. Do not add a collapsed filter panel.
- **D-10:** Audit logs should remain a table on mobile with horizontal overflow, preserving the When, Actor, Action, and Entity columns.
- **D-11:** Preserve the current semantic action badge mapping with equivalent `UiBadge` tones: created as success, updated as info, deleted as danger/error, recorded as primary/info, and fallback as neutral.
- **D-12:** Loading should remain table skeleton style. Empty state should be compact inside the table/card area using `UiEmptyState`, not a large standalone panel.

### Profile Form Polish and QA
- **D-13:** `/profile` should replace `v-autocomplete` with a simple `UiSelect` over the existing timezone list. Do not build a new searchable select primitive in Phase 4.
- **D-14:** The profile page should remain a compact single-card form around the existing 520px width. Do not expand it into a wider two-column account page.
- **D-15:** Save feedback should stay inline in the card using `UiAlert` for success and error states. Do not add toast behavior for profile save in this phase.
- **D-16:** Phase 4 verification must include targeted desktop and mobile visual QA for all four priority routes, plus frontend `npm run lint`, `npm run typecheck`, and `npm run build` from `client/`. Browser/manual notes or screenshots should explicitly cover no overflow, overlap, clipped content, missing loading/empty/error states, or broken controls.

### the agent's Discretion
- The planner may choose the exact plan split and exact Tailwind class composition as long as the four pages stay behavior-compatible, Tailwind-only, and consistent with the shared UI kit.
- The planner may choose the exact `Ui*` component variants and whether to keep `TablePager` compatibility wrappers or use `UiPagination` directly at each touched call site.
- The planner may improve copy only where needed for clarity, but should not perform broad content rewrites or change product behavior.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Current v1.1 milestone goals, teacher/student priority, Tailwind-only direction, PREP inspiration boundary, and visual parity gate.
- `.planning/ROADMAP.md` - Phase 4 scope, target pages, success criteria, and Phase 5 boundary.
- `.planning/REQUIREMENTS.md` - PAGE-01 through PAGE-06 plus verification requirements.
- `.planning/STATE.md` - Current project state after Phase 3 completion and Phase 4 readiness.

### Prior Phase Outputs
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-CONTEXT.md` - Tailwind-only UI kit rules, visual parity requirements, and adoption boundaries.
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-HANDOFF.md` - Phase 4 adoption notes and recommended `Ui*` primitives for each target page.
- `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-UI-SPEC.md` - Shared UI visual and interaction contract.
- `.planning/phases/03-app-shell-shared-surface-migration/03-CONTEXT.md` - Phase 3 decisions that explicitly defer these priority pages to Phase 4.
- `.planning/phases/03-app-shell-shared-surface-migration/03-MIGRATION-INVENTORY.md` - Exact remaining old-marker refs for `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- `.planning/phases/03-app-shell-shared-surface-migration/03-VERIFICATION.md` - Phase 3 verification evidence and known preexisting warnings in Phase 4 targets.

### Codebase Maps
- `.planning/codebase/STACK.md` - Nuxt/Vue/Tailwind stack and frontend verification scripts.
- `.planning/codebase/STRUCTURE.md` - Frontend source layout, page/component locations, and shared UI component location.
- `.planning/codebase/CONVENTIONS.md` - Frontend component/composable naming and code style conventions.
- `.planning/codebase/TESTING.md` - Verification commands and frontend test limitations.

### Current Frontend Files
- `client/app/components/ui/README.md` - UI kit source rules, component inventory, variants, and old-to-new migration map.
- `client/app/components/ui/` - Shared Tailwind-only primitives for layout, controls, data display, feedback, and overlays.
- `client/app/components/AppIcon.vue` - MDI icon primitive retained after Vuetify removal.
- `client/app/components/AppSkeleton.vue` - Loading compatibility wrapper over `UiSkeleton`.
- `client/app/components/TablePager.vue` - Pagination compatibility wrapper over `UiPagination`.
- `client/app/components/AssistantDetailDialog.vue` - Already migrated shared dialog used by `/assistants`; preserve public props/events.
- `client/app/pages/assistants/index.vue` - Priority list/create page to redesign.
- `client/app/pages/assistants/[id].vue` - Priority detail/salary/schedule page to redesign.
- `client/app/pages/audit-logs.vue` - Priority audit filter/table page to redesign.
- `client/app/pages/profile.vue` - Priority profile form page to redesign.
- `client/app/composables/useAssistants.ts` - Existing assistant data and mutation facade; preserve page usage.
- `client/app/composables/useAudit.ts` - Existing audit log data facade; preserve page usage.
- `client/app/composables/useProfile.ts` - Existing profile data and mutation facade; preserve page usage.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UiPage`, `UiPageHeader`, `UiToolbar`, `UiSection`, and `UiCard` should frame the redesigned route pages without introducing nested page cards.
- `UiButton`, `UiInput`, `UiSelect`, and `UiAlert` should replace Vuetify form/action/feedback primitives while keeping validation and mutation logic page-owned.
- `UiList`, `UiListItem`, `UiAvatar`, and `UiBadge` should replace assistant list rows, avatar fallback, salary badges, class-count badges, assigned-class badges, and audit action badges.
- `UiMetricCard`, `UiTable`, `UiTabs`, and `UiEmptyState` should handle assistant detail metrics/tables/tabs and audit/profile empty or status surfaces.
- `UiDialog` should replace the create-assistant and assistant profile edit dialogs while preserving caller-owned state and actions.
- `AppSkeleton` and `TablePager` can remain compatibility wrappers unless the planner chooses a direct `UiSkeleton` / `UiPagination` migration.

### Established Patterns
- Frontend route pages use feature composables for data and mutations. This phase should not move API calls into UI components or shared primitives.
- UI kit components are slot-first, Tailwind-only, and data-agnostic. They must not call stores, feature composables, auth helpers, or `$fetch`.
- Visual parity is stricter than compile success: redesigned pages need desktop and mobile checks for overflow, overlap, clipped content, state coverage, and control usability.
- Existing route behavior already resets pagination when filters/search/limit change; preserve those watchers.

### Integration Points
- `/assistants` uses `useAssistants`, `useAssistantMutations`, `useAvatar`, `AssistantDetailDialog`, and `TablePager`.
- `/assistants/[id]` uses assistant detail, salary summary, sessions, salary update mutation, i18n labels, user timezone formatting, and avatar fallback.
- `/audit-logs` uses `useAuditLogs`, filter refs, action-color mapping, `AppSkeleton`, and `TablePager`.
- `/profile` uses `useAuthStore`, `useMyProfile`, `useProfileMutations`, timezone detection, inline save state, and auth store updates after successful save.
- Frontend verification should run from `client/`: `npm run lint`, `npm run typecheck`, and `npm run build`. Backend checks are not required unless backend files are touched.

</code_context>

<specifics>
## Specific Ideas

- Keep Phase 4 utilitarian and work-focused. The priority pages should feel modern and consistent with the new shell, but they are operational pages rather than marketing screens.
- Use the PREP-style education SaaS feel only as broad inspiration. Do not copy brand, layouts, or assets.
- Keep assistant list scanning fast: list-row/card-light is preferred over a decorative grid.
- Keep detail-page data dense and inspectable: use visible salary config and table fidelity rather than hiding key data behind new interactions.

</specifics>

<deferred>
## Deferred Ideas

- A full card-grid assistant directory is deferred; Phase 4 should keep dense list-row scanability.
- A custom searchable timezone select is deferred; Phase 4 should use existing `UiSelect`.
- Collapsible audit filters are deferred; Phase 4 should keep visible toolbar filters.
- Mobile stacked-card table variants are deferred; Phase 4 should keep horizontal-scroll tables for fidelity.
- Admin/center pages and broader app old-marker cleanup remain outside Phase 4 and belong to Phase 5 or later milestones.

</deferred>

---

*Phase: 4-Priority Old Page Redesign*
*Context gathered: 2026-07-01*
