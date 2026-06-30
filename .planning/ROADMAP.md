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
**Status:** Planned
**Plans:** 7 plans
Plans:
- [ ] 01-01-PLAN.md — Add minimal Tailwind icon, viewport, toast, pager, and language switcher blockers.
- [ ] 01-02-PLAN.md — Convert global/auth/landing SCSS build blockers to Tailwind-compatible CSS.
- [ ] 01-03-PLAN.md — Convert register SCSS build blockers to Tailwind-compatible CSS.
- [ ] 01-04-PLAN.md — Convert dashboard SCSS build blockers to Tailwind-compatible CSS.
- [ ] 01-05-PLAN.md — Convert calendar SCSS build blockers to Tailwind-compatible CSS.
- [ ] 01-06-PLAN.md — Replace default/auth shell Vuetify surface while preserving calendar-first navigation.
- [ ] 01-07-PLAN.md — Remove Vuetify/Sass config and dependency surface, create migration inventory, and run frontend verification.
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
**Status:** Pending
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
**Status:** Pending
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
**Goal:** Redesign `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` with the shared Tailwind UI kit while preserving behavior.
**Mode:** mvp
**Requirements:** PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06
**Status:** Pending
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
*Roadmap created: 2026-06-30*
