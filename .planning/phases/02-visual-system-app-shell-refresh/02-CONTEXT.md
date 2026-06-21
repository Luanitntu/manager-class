# Phase 2: Visual System & App Shell Refresh - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase establishes the shared visual system and app shell for the teacher and student web experience. It should refresh the layout, navigation, theme, density, cards, tables, forms, loading states, empty states, error states, and responsive shell patterns without adding new product modules or fixing the full teacher/student data bugs reserved for later phases. The shell must stay teacher/student first, preserve the teacher calendar-first workflow, and keep center-role concepts out of v1 navigation.

</domain>

<decisions>
## Implementation Decisions

### Shell & Navigation
- **D-01:** Teacher login/default landing should remain the calendar route so the teacher workflow stays calendar-first.
- **D-02:** Student login/default navigation should prioritize a student dashboard that summarizes schedule, documents, scores, and payments.
- **D-03:** Sidebar navigation must be role-aware and hide menu items the current role cannot use, rather than showing disabled teacher/admin items to students.
- **D-04:** Topbar should show user identity, role, profile/logout access, and a role-specific quick action where it can reuse existing flows without adding new scope.
- **D-05:** Teacher quick action can point to an existing session creation flow; student quick action can point to schedule/dashboard only if it stays simple.
- **D-06:** Mobile should use bottom navigation for the main role-specific routes, capped at roughly four or five primary items.
- **D-07:** Desktop sidebar should group items by work area, such as daily work, teaching, and admin, instead of keeping one long flat list.
- **D-08:** Active navigation should be clear but light: subtle background, primary icon/text, and a small left indicator rather than a heavy filled pill.

### Visual Language
- **D-09:** The refreshed UI should feel energetic and colorful while staying usable for SaaS data, dashboards, calendars, tables, and forms.
- **D-10:** Use an original palette direction based on blue plus teal/green plus orange accents. PREP is inspiration only; do not copy PREP colors, brand, layouts, or assets.
- **D-11:** Component density should be moderate and easy to scan, but visually polished rather than dry enterprise UI.
- **D-12:** Cards, tables, and forms should use light radius, thin borders, and very subtle shadows. Avoid overly large rounded cards or heavy decorative surfaces.

### State System
- **D-13:** Empty states should be friendly and visually delightful, with small illustrations/icons and helpful copy.
- **D-14:** Loading states should combine a top progress cue with lightweight skeletons that preserve layout stability.
- **D-15:** Error and forbidden states should explain the likely cause and next step in plain language.
- **D-16:** Pages must distinguish loading, empty, error, and forbidden states separately so UI polish does not hide role/API/data-display bugs.

### Responsive Layout
- **D-17:** Keep the existing desktop content max width direction around `1400px` for most pages.
- **D-18:** Phase 2 mobile goal is usable and polished basics: no broken layout, no overlapping controls, usable navigation, and readable text.
- **D-19:** Data tables should become card/list presentations on mobile instead of relying on horizontal scrolling as the main experience.
- **D-20:** Calendar should favor an agenda/list view on mobile while desktop can preserve the fuller calendar-first layout.

### the agent's Discretion
- The agent may choose exact Vuetify tokens, component names, CSS variable names, and grouping labels as long as the decisions above are preserved.
- The agent may decide which existing quick actions are safe to expose in Phase 2, but must not create new product capabilities just to populate the topbar.
- The agent may choose whether illustration assets are icon-based, simple CSS/SVG-style components, or lightweight local assets, provided they stay original and do not expand scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope
- `.planning/PROJECT.md` - v1 scope, teacher/student priority, PREP-inspired but original UI direction, center role deferred.
- `.planning/REQUIREMENTS.md` - Phase 2 mapped requirements: UI-01, UI-03, UI-05, with related mobile/responsive concerns for later phases.
- `.planning/ROADMAP.md` - Phase 2 goal, success criteria, and phase boundaries.
- `.planning/STATE.md` - Current milestone and current phase.

### Phase 1 Findings
- `.planning/phases/01-audit-data-flow-baseline/01-CONTEXT.md` - Prior decisions: audit before redesign, teacher/student focus, bug ledger as action source.
- `.planning/phases/01-audit-data-flow-baseline/01-AUDIT-SUMMARY.md` - Static audit findings and Phase 2 implications.
- `.planning/phases/01-audit-data-flow-baseline/01-BUG-LEDGER.md` - Known data-display and role-scope bugs that Phase 2 states/navigation must not hide.

### Codebase Map
- `.planning/codebase/STRUCTURE.md` - Frontend layout/page/composable locations and where shell/theme code lives.
- `.planning/codebase/CONVENTIONS.md` - Existing Nuxt/Vuetify/composable conventions.
- `.planning/codebase/STACK.md` - Nuxt 4, Vue 3, Vuetify, Pinia, TanStack Query, FullCalendar stack details.

### Existing Frontend Files
- `client/app/layouts/default.vue` - Current shared app shell and teacher-first flat navigation.
- `client/vuetify.config.ts` - Current Vuetify theme colors and defaults.
- `client/app/assets/css/main.css` - Current global content max width and font baseline.
- `client/app/stores/auth.ts` - Role and user identity shape used for role-aware shell behavior.
- `client/app/middleware/auth.global.ts` - Existing auth/default-route behavior relevant to teacher/student landing decisions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/app/layouts/default.vue`: Current shell already uses Vuetify drawer, app bar, list items, avatar, and auth store. Phase 2 should evolve this rather than replace it wholesale.
- `client/vuetify.config.ts`: Existing theme/defaults are centralized and can become the main place for refreshed colors, radius, input density, button defaults, and card defaults.
- `client/app/assets/css/main.css`: Existing `--st-content-max` and `.st-content` already support the chosen max-width direction.
- `client/app/stores/auth.ts`: Exposes `role` and `user`, enough to drive role-aware nav, topbar role labels, and quick-action selection.
- `client/app/utils/error.ts`: Existing error extraction utility can inform consistent error state copy and display.

### Established Patterns
- Frontend is Nuxt 4 + Vue 3 + Vuetify; shared shell changes should stay inside layout/theme/global CSS and reusable components.
- Pages should call feature composables rather than raw APIs. Phase 2 should avoid adding direct API calls inside visual components.
- Server data uses API envelope handling through `useApi.ts`; state components should allow pages to distinguish loading, empty, error, and forbidden outcomes.
- FullCalendar is already present for the teacher calendar workflow, so mobile agenda/list treatment should wrap or configure existing calendar behavior where practical.

### Integration Points
- `client/app/layouts/default.vue` connects role-aware sidebar, topbar, mobile bottom nav, and content container.
- `client/vuetify.config.ts` connects theme tokens and default component treatment.
- `client/app/pages/*.vue` will gradually adopt shared state/components, but Phase 2 should focus on app shell and reusable visual foundation first.
- `client/app/middleware/auth.global.ts`, `client/app/pages/login.vue`, and `client/app/pages/index.vue` are relevant if planning includes aligning default route behavior with teacher calendar and student dashboard.

</code_context>

<specifics>
## Specific Ideas

- The user wants a more colorful, energetic education SaaS feel, not a dry enterprise dashboard.
- The UI should stay polished and beautiful even with moderate density.
- Empty states should feel friendly and illustrated, but the implementation should remain lightweight and original.
- Mobile bottom navigation is preferred over a temporary drawer-only pattern.
- Mobile calendar should read like an agenda/list instead of forcing a cramped month/week grid.

</specifics>

<deferred>
## Deferred Ideas

- Full teacher workflow fixes belong to Phase 3.
- Full student portal fixes and new student scores/comments display belong to Phase 4.
- Center role and center-level navigation remain v2 scope.
- Broad responsive QA and final regression proof belong to Phase 5.

</deferred>

---

*Phase: 2-Visual System & App Shell Refresh*
*Context gathered: 2026-06-21*
