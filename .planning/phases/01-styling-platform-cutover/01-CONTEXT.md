# Phase 1: Styling Platform Cutover - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 removes the frontend Vuetify/SCSS platform surface and establishes Tailwind as the only styling foundation for the app bootstrap. The phase should eliminate Nuxt Vuetify registration, Vuetify configuration/settings, SCSS imports that affect the current build path, and package dependency surface where safe. It must also preserve icon rendering and produce a migration inventory for remaining `<v-*>` usage to guide later phases.

</domain>

<decisions>
## Implementation Decisions

### Cutover Boundary
- **D-01:** Use a real cutover in Phase 1. Remove `vuetify-nuxt-module`, `client/vuetify.config.ts`, Vuetify settings, and Vuetify package dependency surface rather than keeping a temporary Vuetify bridge.
- **D-02:** Replace only the minimum Vuetify-dependent primitives required to keep the app compiling and usable after module removal. Expected minimum includes app/auth shell primitives, `useDisplay` usage, icon rendering, overlay/menu/dialog primitives that block build, and any globally mounted Vuetify-only shared surfaces.
- **D-03:** Avoid redesigning product pages in Phase 1 unless required to remove platform blockers. Page redesign belongs to later phases.

### SCSS Removal Depth
- **D-04:** Remove global SCSS imports from `client/app/assets/css/main.css`, especially `../../styles/index.scss`.
- **D-05:** Convert SCSS that is imported directly by current build-path components to plain CSS/Tailwind-compatible styles during Phase 1 when it blocks the cutover.
- **D-06:** Do not chase every old visual page redesign in Phase 1. Any remaining non-blocking style migration work must be documented in the inventory and assigned to later phases.

### Icon Strategy
- **D-07:** Keep `@mdi/font` for now because the app has broad `mdi-*` usage.
- **D-08:** Add a lightweight Tailwind/Vue icon primitive such as `AppIcon` that renders Material Design Icons without depending on Vuetify's `v-icon`.
- **D-09:** Do not switch to a new icon library in Phase 1. If a future icon-library migration is desired, `AppIcon` becomes the replacement seam.

### Migration Inventory
- **D-10:** Produce a detailed markdown inventory, not a simple list.
- **D-11:** Inventory should include file path, route/component role, Vuetify tags used, SCSS imports or scoped SCSS usage, priority bucket, likely owning phase, and notes for risky replacements.
- **D-12:** Inventory should explicitly guide Phase 2/3/4 planning: shared UI kit needs, app shell blockers, priority old pages, and deferred lower-traffic pages.

### Verification Rule
- **D-13:** Phase 1 should pass frontend `npm run lint`, `npm run typecheck`, and `npm run build` from `client/` after the real cutover.
- **D-14:** Expected failures caused by remaining Vuetify dependency are not acceptable if Phase 1 claims Vuetify module removal is complete.
- **D-15:** If verification cannot run because of environment/tooling limitations, record the exact reason and the closest verification performed.

### the Agent's Discretion
- The planner may choose the safest minimal replacements that preserve build stability and current behavior.
- The planner may choose exact inventory file location/name inside the Phase 1 directory, as long as downstream phases can find it easily.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Current milestone, product priorities, v1.1 constraints, and UI migration goals.
- `.planning/ROADMAP.md` - Phase 1 scope, success criteria, and cross-phase boundaries.
- `.planning/REQUIREMENTS.md` - STYLE-01 through STYLE-04 requirements and milestone acceptance criteria.
- `.planning/STATE.md` - Current milestone state and reset notes.

### Codebase Maps
- `.planning/codebase/STACK.md` - Nuxt/Vue/Tailwind/Vuetify dependency context and scripts.
- `.planning/codebase/STRUCTURE.md` - Frontend source layout and where UI code lives.
- `.planning/codebase/CONVENTIONS.md` - Frontend composable/component conventions.
- `.planning/codebase/TESTING.md` - Verification commands and current frontend test limitations.

### Current Frontend Platform Files
- `client/nuxt.config.ts` - Registers `vuetify-nuxt-module`, `@mdi/font`, global CSS, Vuetify settings, and Tailwind Vite plugin.
- `client/package.json` - Contains `vuetify-nuxt-module`, `sass-embedded`, `@mdi/font`, and frontend verification scripts.
- `client/package-lock.json` - Must be updated if dependencies are removed.
- `client/vuetify.config.ts` - Current Vuetify theme/defaults to remove or translate into Tailwind tokens.
- `client/app/assets/css/main.css` - Tailwind entry plus global SCSS import and Vuetify font overrides.
- `client/app/assets/css/vuetify.settings.scss` - Vuetify SCSS settings to remove.
- `client/app/styles/` - Existing SCSS source tree imported by global and component styles.
- `client/app/layouts/default.vue` - Main teacher/student shell; uses `useDisplay`, `v-app`, `v-navigation-drawer`, `v-app-bar`, `v-main`, `v-list`, `v-menu`, `v-avatar`, `v-img`, `v-alert`, and other Vuetify primitives.
- `client/app/layouts/auth.vue` - Auth layout uses `v-app` and `v-main`.
- `client/app/components/AppToast.vue` - Shared toast surface uses `v-icon`.
- `client/app/components/TablePager.vue` - Shared pagination surface uses Vuetify controls.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/app/assets/css/main.css`: Already defines Tailwind 4 entry, theme variables, font, color tokens, spacing tokens, and keyframes that can anchor the platform cutover.
- `client/app/components/AppInitialLoader.vue` and `client/app/components/AppSkeleton.vue`: Existing non-Vuetify loading primitives can remain useful during migration.
- `client/app/composables/*`: Frontend data flows are already separated from pages; Phase 1 should avoid touching API/composable behavior.

### Established Patterns
- Frontend is Nuxt 4/Vue 3 with Tailwind 4 via `@tailwindcss/vite`.
- Frontend pages and layouts currently mix Tailwind/plain CSS, scoped SCSS, and many Vuetify components.
- Role-aware navigation lives in `client/app/layouts/default.vue`; teacher calendar access must remain prominent.
- Existing icon names are Material Design Icons strings such as `mdi-calendar-month-outline`.

### Integration Points
- Nuxt bootstrap is controlled by `client/nuxt.config.ts`; removing Vuetify here affects the whole app.
- Package changes must update `client/package.json` and `client/package-lock.json`.
- The shell replacement must preserve auth store, logout behavior, i18n labels, public settings announcement, avatar URL handling, and role-aware nav groups.
- Current scan found about 59 Vue files containing `<v-*>` tags and about 1135 matching tag usages. The inventory should be treated as a core Phase 1 output.

</code_context>

<specifics>
## Specific Ideas

- Product direction: education SaaS feel inspired by PREP, but no brand/assets copy.
- User accepted the recommended Phase 1 approach: real cutover, minimal replacements, detailed inventory, `@mdi/font` retained through an app icon primitive, and frontend verification expected to pass.

</specifics>

<deferred>
## Deferred Ideas

- Full shared Tailwind UI kit belongs to Phase 2.
- Full app shell/shared surface migration beyond minimum platform blockers belongs to Phase 3.
- Priority page redesigns for `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` belong to Phase 4.
- Switching away from Material Design Icons is deferred; Phase 1 keeps `@mdi/font`.

</deferred>

---

*Phase: 1-Styling Platform Cutover*
*Context gathered: 2026-06-30*
