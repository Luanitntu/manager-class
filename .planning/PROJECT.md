# Schedule Teacher

## What This Is

Schedule Teacher is a teacher-first learning management and class operations app for language teachers. Teachers manage classes, students, schedules, learning materials, payments, reports, and assistant teachers; students use the app to follow their classes, schedules, materials, scores, feedback, and payment status.

The current product already has a broad MVP feature set and a partially refreshed frontend. The v1.1 focus is to finish the UI technology migration: remove Vuetify and SCSS, standardize on a Tailwind-first design system, create reusable shared UI components, and redesign remaining old UI pages so the whole app feels consistent.

## Core Value

Teachers and students can reliably see and act on the right class data through a clean, calendar-first interface.

## Current Milestone: v1.1 Tailwind UI Migration

**Goal:** Replace the remaining Vuetify/SCSS UI layer with a reusable Tailwind-based component system while preserving the existing visual intent, layouts, and user workflows.

**Target features:**
- Remove Vuetify and SCSS from the frontend build and runtime surface.
- Keep Tailwind CSS as the app styling foundation.
- Define a lightweight Tailwind design system with tokens, component conventions, and reusable UI components.
- Redesign old UI pages across the app, with priority on `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- Preserve visual parity during migration: no broken layouts, overlapping text, missing states, or unintended UI regressions.
- Verify the whole app still builds, typechecks, and preserves teacher/student workflows after the UI migration.

## Business Context

- **Customer**: Individual teachers first; language centers later.
- **Revenue model**: Future SaaS subscriptions; not part of this milestone.
- **Success metric**: The app uses one Tailwind-based UI system, has no Vuetify/SCSS dependency surface, and migrated pages look/function like the intended current UI without broken or regressed layouts.
- **Strategy notes**: Center role remains deferred; this milestone is frontend polish and maintainability.

## Requirements

### Validated

- Existing MVP modules are implemented: auth, classes, sessions/calendar, students, assistants, documents, payments, reports, notifications, dashboard, audit logs.
- Architecture is multi-tenant with `teacherId` as tenant key.
- Calendar-first teacher workflow remains the product anchor.
- Tailwind CSS is already present in the client dependency/config surface.
- Phase 1 platform cutover is complete: Vuetify/Sass config and dependencies were removed, active frontend source no longer requires SCSS parsing, `@mdi/font` remains available, and frontend lint/typecheck/build pass.
- Phase 2 Tailwind design system and shared UI kit is complete: docs, layout/control/data/feedback/overlay primitives, proof migrations, handoff, and frontend lint/typecheck/build pass.
- Phase 3 app shell and shared surface migration is complete: auth shell, teacher/student calendar surfaces, SessionDialog, dashboards, StudentSchedule, and detail dialogs were migrated to Tailwind/shared UI components, UAT passed, and frontend lint/typecheck/build pass.

### Active

- [ ] Replace remaining Vuetify component markup with Tailwind/shared UI components across the frontend.
- [ ] Preserve or replace needed UI primitives with Tailwind-based shared components.
- [ ] Redesign `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` to match the newer Tailwind UI direction.
- [ ] Maintain visual and interaction parity while migrating: no accidental page redesign beyond the agreed UI direction, no broken responsive layouts, and no missing loading/empty/error states.
- [ ] Sweep the full app for remaining old UI patterns and migrate or explicitly document deferred areas.
- [ ] Run frontend lint, typecheck, and build after migration; run backend checks only if backend code is touched.

### Out of Scope

- Center role and center-level workflows - deferred until teacher/student product is mostly complete.
- New large product modules - this milestone is UI platform migration and redesign, not feature expansion.
- Subscription plans and billing - future SaaS monetization work.
- Native mobile app - responsive web should remain usable, but native mobile is out of scope.
- Backend redesign - backend work should happen only when required to preserve existing frontend flows.

## Context

- Existing codebase: Nuxt 4 + Vue 3 frontend, NestJS + Prisma + PostgreSQL backend.
- Frontend lives in `client/app`; backend lives in `server/src`.
- Phase 1 removed `vuetify-nuxt-module`, `sass-embedded`, `client/vuetify.config.ts`, `client/app/assets/css/vuetify.settings.scss`, and active frontend SCSS imports.
- Phase 2 added `client/app/components/ui` with shared Tailwind primitives, migrated `AppSkeleton`, `TablePager`, `AppToast`, and `ClassLocation`, and documented Phase 3/4 adoption in `.planning/phases/02-tailwind-design-system-shared-ui-kit/02-HANDOFF.md`.
- Phase 3 migrated the high-traffic app shell/shared surfaces and closed UAT gaps around login social button dimensions/wrapping.
- Tailwind 4 is already installed through `tailwindcss` and `@tailwindcss/vite`.
- Current old UI target pages include `client/app/pages/assistants/index.vue`, `client/app/pages/assistants/[id].vue`, `client/app/pages/audit-logs.vue`, and `client/app/pages/profile.vue`.
- Many pages/components still use `<v-*>` components, so migration must be staged to avoid breaking the whole app at once.
- Codebase map exists under `.planning/codebase/` and should be read before planning work.

## Constraints

- **Scope**: v1.1 is frontend UI migration and page redesign; avoid adding major product features.
- **Users**: Optimize teacher/student experience first; keep assistant/admin flows from regressing where touched.
- **UX**: Keep calendar-first behavior for teachers.
- **Architecture**: Frontend pages should keep using feature composables; do not move API calls directly into components.
- **Styling**: Use Tailwind CSS and local shared components; do not reintroduce SCSS or Vuetify wrappers.
- **Visual parity**: Tailwind migration must preserve existing visual intent and workflows unless a page is explicitly being redesigned.
- **Reuse**: Prefer shared components for repeated cards, tables, filters, dialogs, pagination, badges, alerts, skeletons, and empty states.
- **Verification**: Run `npm run lint`, `npm run typecheck`, and `npm run build` from `client/` after frontend changes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v1.1 removes Vuetify and SCSS | The user wants Tailwind as the single styling foundation | Phase 1 platform surface complete; remaining Vuetify component markup is planned for later phases |
| Tailwind design system comes before page redesign | Tokens and component conventions prevent one-off Tailwind markup across pages | Phase 2 complete; downstream phases should consume `client/app/components/ui` |
| Visual parity is a release gate | Tailwind migration should not make the UI look broken, shifted, or unexpectedly different | Phase 3 UAT caught and closed login social button regressions before completion |
| `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` are priority pages | User identified these as old UI pages needing redesign | Pending |
| Center role remains deferred | Prevents scope creep during UI platform migration | Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? Move to Out of Scope with reason.
2. Requirements validated? Move to Validated with phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. "What This Is" still accurate? Update if drifted.

**After each milestone**:
1. Full review of all sections.
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state.

---
*Last updated: 2026-07-01 after Phase 3 completion*
