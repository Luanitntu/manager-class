# Schedule Teacher

## What This Is

Schedule Teacher is a teacher-first learning management and class operations app for language teachers. Teachers manage classes, students, schedules, learning materials, payments, reports, and assistant teachers; students use the app to follow their classes, schedules, materials, scores, feedback, and payment status.

The current product already has a broad MVP feature set and a partially refreshed frontend. The v1.1 focus is to finish the UI technology migration: remove Vuetify and SCSS, standardize on Tailwind CSS, create reusable shared UI components, and redesign remaining old UI pages so the whole app feels consistent.

## Core Value

Teachers and students can reliably see and act on the right class data through a clean, calendar-first interface.

## Current Milestone: v1.1 Tailwind UI Migration

**Goal:** Replace the remaining Vuetify/SCSS UI layer with a reusable Tailwind-based component system and bring old pages in line with the newer app UI.

**Target features:**
- Remove Vuetify and SCSS from the frontend build and runtime surface.
- Keep Tailwind CSS as the app styling foundation.
- Create shared reusable UI components to reduce repeated page-level markup.
- Redesign old UI pages across the app, with priority on `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- Verify the whole app still builds, typechecks, and preserves teacher/student workflows after the UI migration.

## Business Context

- **Customer**: Individual teachers first; language centers later.
- **Revenue model**: Future SaaS subscriptions; not part of this milestone.
- **Success metric**: The app uses one Tailwind-based UI system, has no Vuetify/SCSS dependency surface, and old UI pages visually match the newer codebase.
- **Strategy notes**: Center role remains deferred; this milestone is frontend polish and maintainability.

## Requirements

### Validated

- Existing MVP modules are implemented: auth, classes, sessions/calendar, students, assistants, documents, payments, reports, notifications, dashboard, audit logs.
- Architecture is multi-tenant with `teacherId` as tenant key.
- Calendar-first teacher workflow remains the product anchor.
- Tailwind CSS is already present in the client dependency/config surface.

### Active

- [ ] Remove Vuetify module usage, Vuetify component dependencies, Vuetify settings, and SCSS imports from the frontend.
- [ ] Preserve or replace needed UI primitives with Tailwind-based shared components.
- [ ] Create reusable shared UI components for common layout, controls, data display, feedback states, and modals.
- [ ] Redesign `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` to match the newer Tailwind UI direction.
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
- Current client still includes `vuetify-nuxt-module`, `client/vuetify.config.ts`, `client/app/assets/css/vuetify.settings.scss`, and SCSS imported through `client/app/assets/css/main.css`.
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
- **Reuse**: Prefer shared components for repeated cards, tables, filters, dialogs, pagination, badges, alerts, skeletons, and empty states.
- **Verification**: Run `npm run lint`, `npm run typecheck`, and `npm run build` from `client/` after frontend changes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v1.1 removes Vuetify and SCSS | The user wants Tailwind as the single styling foundation | Pending |
| Shared UI components come before page redesign | Reuse prevents repeating one-off Tailwind markup across pages | Pending |
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
*Last updated: 2026-06-30 after starting v1.1 Tailwind UI Migration*
