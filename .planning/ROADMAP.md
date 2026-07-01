# Roadmap: Schedule Teacher v1.1 Tailwind UI Migration

**Created:** 2026-06-30
**Project Mode:** mvp

## Overview

This roadmap resets planning for a frontend UI platform milestone. The work removes Vuetify and SCSS, standardizes on a Tailwind-first design system, creates shared reusable UI components, migrates the app shell/shared surfaces, then redesigns the old priority pages `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`. Visual parity is a release gate: the migration must not introduce broken layouts, clipped content, overlapping text, missing states, or unintended UI changes.

## Phases

### Phase 1: Styling Platform Cutover

**Goal:** Remove the Vuetify/SCSS platform surface and establish Tailwind as the only styling foundation.
**Mode:** mvp
**Requirements:** STYLE-01, STYLE-02, STYLE-03, STYLE-04
**Status:** Complete (2026-06-30)
**Plans:** 8/8 plans complete
Plans:

- [x] 01-01-PLAN.md — Add minimal Tailwind icon, viewport, toast, pager, and language switcher blockers.
- [x] 01-02-PLAN.md — Convert global/auth/landing SCSS build blockers to Tailwind-compatible CSS.
- [x] 01-03-PLAN.md — Convert register SCSS build blockers to Tailwind-compatible CSS.
- [x] 01-04-PLAN.md — Convert dashboard SCSS build blockers to Tailwind-compatible CSS.
- [x] 01-05-PLAN.md — Convert calendar SCSS build blockers to Tailwind-compatible CSS.
- [x] 01-06-PLAN.md — Replace default/auth shell Vuetify surface while preserving calendar-first navigation.
- [x] 01-07-PLAN.md — Remove Vuetify/Sass config and dependency surface, create migration inventory, and run frontend verification. Blocked: config/inventory done; final gates fail on remaining SCSS files and `documents.vue` type narrowing.
- [x] 01-08-PLAN.md — Close Plan 07 verification gaps by converting remaining SCSS blockers, fixing `documents.vue` target typing, and rerunning frontend gates.

**Cross-cutting constraints:**

- Do not break Nuxt app bootstrap or existing Tailwind configuration.
- Preserve icon availability without depending on Vuetify components.
- Treat package/config/lockfile changes as part of the platform cutover.
- Keep any visual changes limited to what is required for safe Tailwind parity.

**Success Criteria:**

1. Nuxt config no longer registers Vuetify or Vuetify settings.
2. App CSS no longer imports SCSS.
3. Vuetify package/dependency surface is removed where safe for the phase.
4. A migration inventory identifies remaining `<v-*>` usage to eliminate in later phases.

### Phase 2: Tailwind Design System & Shared UI Kit

**Goal:** Define the Tailwind design system and build reusable components for common app layout, controls, data display, feedback, and modal patterns.
**Mode:** mvp
**Requirements:** UIKIT-00, UIKIT-01, UIKIT-02, UIKIT-03, UIKIT-04, UIKIT-05
**Status:** Complete (2026-06-30)
**Plans:** 7/7 plans complete
Plans:

- [x] 02-01-PLAN.md — Create UI kit docs and layout primitives.
- [x] 02-02-PLAN.md — Create Tailwind-only controls and form primitives.
- [x] 02-03-PLAN.md — Create slot-first data display primitives.
- [x] 02-04-PLAN.md — Extract pagination into UiPagination and preserve TablePager.
- [x] 02-05-PLAN.md — Create feedback, skeleton, tabs, and dialog primitives.
- [x] 02-06-PLAN.md — Migrate proof surfaces AppSkeleton, AppToast, and ClassLocation.
- [x] 02-07-PLAN.md — Finalize docs, handoff, static scans, and frontend gates.

**Cross-cutting constraints:**

- Components should be small, composable, and easy for pages to adopt.
- Avoid card-in-card layouts and old Vuetify density/spacing assumptions.
- Keep controls accessible with labels, focus styles, disabled states, and keyboard-safe modals.
- Component variants should reproduce the intended existing UI states before adding new visual ideas.

**Success Criteria:**

1. Tailwind design tokens, component naming conventions, variants, and usage rules are documented.
2. Shared components cover page headers, sections, cards, forms, filters, buttons, tables/lists, pagination, badges, avatars, alerts, skeletons, empty states, and dialogs.
3. Repeated UI patterns are migrated to shared components where practical.
4. Components use Tailwind classes and project design tokens, not SCSS or Vuetify.
5. Component APIs are simple enough for priority pages to reuse.

### Phase 3: App Shell & Shared Surface Migration

**Goal:** Replace Vuetify-dependent shell/shared surfaces with Tailwind implementations while preserving navigation, teacher calendar access, and visual parity.
**Mode:** mvp
**Requirements:** APP-01, APP-02, APP-03, APP-04, APP-05
**Status:** Complete (2026-07-01)
**Plans:** 9/9 plans complete
Plans:

- [x] 03-01-PLAN.md — Migrate shell preservation checks and the full auth surface.
- [x] 03-02-PLAN.md — Migrate teacher calendar header, board, detail, and toast feedback.
- [x] 03-03-PLAN.md — Fully migrate the calendar-critical SessionDialog.
- [x] 03-04-PLAN.md — Migrate the teacher workspace dashboard.
- [x] 03-05-PLAN.md — Migrate the student dashboard and StudentSchedule.
- [x] 03-06-PLAN.md — Migrate bounded low-risk shared detail dialog areas.
- [x] 03-07-PLAN.md — Produce final migration inventory, validation evidence, and frontend gates.
- [x] 03-08-PLAN.md — Close the login social button UAT gap by restoring 42px button and 20px icon sizing.
- [x] 03-09-PLAN.md — Close the residual Google social button wrapping gap by moving the icon to the leading slot and preventing label wrap.

**Cross-cutting constraints:**

- Preserve auth/session and role-aware navigation behavior.
- Keep teacher calendar visible as a primary workflow.
- Do not touch backend APIs unless a frontend migration reveals an actual contract bug.
- Match existing shell layout, spacing, responsive behavior, and state handling unless explicitly improved.

**Success Criteria:**

1. Default/auth layouts no longer depend on Vuetify shell primitives.
2. Shared dialogs/high-traffic components no longer block Vuetify removal.
3. Remaining old UI usage is either migrated or listed with explicit deferral.
4. App navigation works for teacher/student/admin/assistant routes after shell migration.
5. Desktop and mobile-width shell checks show no broken layout, overlapping text, clipped controls, or missing states.

### Phase 4: Priority Old Page Redesign

**Goal:** As a teacher, I want to use the redesigned assistants, assistant detail, audit logs, and profile pages with the shared Tailwind UI kit while preserving existing behavior, so that I can manage my workspace through a consistent, stable, and readable interface.
**Mode:** mvp
**Requirements:** PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06
**Status:** In Progress (2026-07-01)
**Plans:** 5/6 plans complete; Plan 06 planned to close human UAT visual parity gaps
Plans:

- [x] 04-01-PLAN.md — Redesign `/assistants` list, search, pagination, create dialog, and detail-open behavior.
- [x] 04-02-PLAN.md — Redesign `/assistants/[id]` profile, salary summary/config, assigned classes, tabs, and tables.
- [x] 04-03-PLAN.md — Redesign `/audit-logs` filters, table, badges, loading, empty state, and pagination.
- [x] 04-04-PLAN.md — Redesign `/profile` compact form, timezone select, role badge, and inline save feedback.
- [x] 04-05-PLAN.md — Run Phase 4 static scans, frontend gates, and desktop/mobile visual QA. Automated gates passed; human UAT found visual parity gaps.
- [ ] 04-06-PLAN.md — Close visual parity UAT gaps by aligning Phase 4 pages with Calendar/Dashboard and making profile modal-first or richer.

**Cross-cutting constraints:**

- Preserve current composables and data flows.
- Keep create/edit/save/filter/pagination states behavior-compatible.
- Match the newer app UI direction across desktop and mobile-width layouts.
- Preserve intended current layout density and hierarchy; avoid accidental visual changes while replacing implementation.

**Success Criteria:**

1. `/assistants` preserves search, pagination, create assistant, list, and detail-open behavior in redesigned UI.
2. `/assistants/[id]` preserves profile, salary, assigned class, schedule, breakdown, and history behavior in redesigned UI.
3. `/audit-logs` preserves filters, table/list, pagination, loading, and empty states in redesigned UI.
4. `/profile` preserves load/edit/save/timezone/error/success behavior in redesigned UI.
5. Redesigned pages are visually consistent with the shared app shell and component kit.
6. Priority pages pass desktop and mobile-width visual QA with no overflow, overlap, clipped content, broken controls, or missing loading/empty/error states.

### Phase 5: Verification & Cleanup

**Goal:** Prove the Tailwind migration is complete, stable, and free of accidental Vuetify/SCSS regressions.
**Mode:** mvp
**Requirements:** VER-01, VER-02, VER-03, VER-04, VER-05, VER-06
**Status:** Pending
**Cross-cutting constraints:**

- Use existing client scripts from `client/`.
- Run backend checks only if backend code changed.
- Document any intentionally deferred non-priority UI surface.
- Include visual parity evidence for desktop and mobile-width pages touched by the migration.

**Success Criteria:**

1. `npm run lint` passes from `client/`.
2. `npm run typecheck` passes from `client/`.
3. `npm run build` passes from `client/`.
4. Smoke checks cover app shell plus priority pages on desktop and mobile-width viewports.
5. Screenshot or manual visual QA confirms no broken UI, overflow, overlap, clipped content, unreadable text, missing states, or unintended visual regressions.
6. Repo scan confirms no unintended Vuetify/SCSS dependency surface remains in v1.1 scope.

## Requirement Coverage

| Requirement | Phase |
|-------------|-------|
| STYLE-01 | Phase 1 |
| STYLE-02 | Phase 1 |
| STYLE-03 | Phase 1 |
| STYLE-04 | Phase 1 |
| UIKIT-00 | Phase 2 |
| UIKIT-01 | Phase 2 |
| UIKIT-02 | Phase 2 |
| UIKIT-03 | Phase 2 |
| UIKIT-04 | Phase 2 |
| UIKIT-05 | Phase 2 |
| APP-01 | Phase 3 |
| APP-02 | Phase 3 |
| APP-03 | Phase 3 |
| APP-04 | Phase 3 |
| APP-05 | Phase 3 |
| PAGE-01 | Phase 4 |
| PAGE-02 | Phase 4 |
| PAGE-03 | Phase 4 |
| PAGE-04 | Phase 4 |
| PAGE-05 | Phase 4 |
| PAGE-06 | Phase 4 |
| VER-01 | Phase 5 |
| VER-02 | Phase 5 |
| VER-03 | Phase 5 |
| VER-04 | Phase 5 |
| VER-05 | Phase 5 |
| VER-06 | Phase 5 |

## Notes

- Start with Phase 1. Removing Vuetify/SCSS before page redesign makes migration blockers explicit.
- Phase 2 should create the Tailwind design system and shared component vocabulary before priority pages are rewritten.
- Every phase must preserve visual parity unless the roadmap explicitly calls for redesign of that page/surface.
- Priority old UI pages are `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- Old v1 phase plan artifacts were archived under `.planning/archive/v1-polish-phase-plans-2026-06-30/`.

---
*Roadmap updated: 2026-07-01 after Phase 3 completion; Phase 4 ready*
