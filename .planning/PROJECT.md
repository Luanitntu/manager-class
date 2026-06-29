# Schedule Teacher

## What This Is

Schedule Teacher is a teacher-first learning management and class operations app for language teachers. Teachers manage classes, students, schedules, learning materials, payments, reports, and assistant teachers; students use the app to follow their classes, schedules, materials, scores, feedback, and payment status.

The current product already has a broad MVP feature set. The v1 focus is to turn that implementation into a polished, reliable release by refreshing the teacher/student UI and fixing bugs where data exists but pages do not show it.

## Core Value

Teachers and students can reliably see and act on the right class data through a clean, calendar-first interface.

## Current Milestone: v1 Polish Release

**Goal:** Make the existing teacher and student product feel coherent, reliable, and ready for real validation without expanding into center workflows.

**Target features:**
- Audit teacher/student data flow and navigation failures before redesign work.
- Refresh the shared app shell and core UI patterns with an original education SaaS feel inspired by PREP, not copied from it.
- Fix teacher workflow data-display issues across dashboard, calendar, classes, students, documents, payments, reports, and profile.
- Fix student portal data-display issues across dashboard, classes, schedule, documents, scores/comments, payments, and profile.
- Add practical verification so UI refresh and bug fixes do not regress core teacher/student flows.

## Business Context

- **Customer**: Individual teachers first; language centers later.
- **Revenue model**: Future SaaS subscriptions; not part of v1.
- **Success metric**: Teacher/student core flows work without data-display bugs and feel professional enough for real user testing.
- **Strategy notes**: Center role is intentionally deferred until teacher and student experiences are solid.

## Requirements

### Validated

- Existing MVP modules are implemented: auth, classes, sessions/calendar, students, assistants, documents, payments, reports, notifications, dashboard, audit logs.
- Architecture is already multi-tenant with `teacherId` as tenant key.
- Calendar-first teacher workflow remains the product anchor.

### Active

- [ ] Refresh teacher/student UI with a modern, approachable SaaS style inspired by `app.prepedu.vn`, without copying PREP branding, assets, or protected UI.
- [ ] Audit and fix pages where backend data exists but the frontend shows empty, stale, or misleading states.
- [ ] Stabilize teacher workflows: dashboard, calendar, classes, students, documents, payments, reports, and profile.
- [ ] Stabilize student workflows: dashboard, enrolled classes, schedule, assigned documents, scores/comments, payments, and profile.
- [ ] Add targeted automated or documented manual verification for core teacher/student flows.

### Out of Scope

- Center role and center-level workflows - deferred until teacher/student product is mostly complete.
- New large product modules - v1 is polish/stability, not feature expansion.
- Subscription plans and billing - future SaaS monetization work.
- Native mobile app - responsive web may be improved, but native mobile is out of scope.
- Copying PREP assets, exact brand, private screens, or proprietary UI - use it only as visual/product inspiration.

## Context

- Existing codebase: Nuxt 4 + Vue 3 + Vuetify frontend, NestJS + Prisma + PostgreSQL backend.
- Frontend lives in `client/app`; backend lives in `server/src`.
- Codebase map exists under `.planning/codebase/` and should be read before planning work.
- Prior docs under `.claude/docs/` describe the original MVP: teacher-centric, calendar-first, multi-tenant LMS.
- User specifically wants teacher and student experiences first; center role will become a separate later role.
- User likes the broad feel of `app.prepedu.vn`: clean education SaaS, approachable visual rhythm, dashboard/cards, clear navigation.
- Known current bug class: some pages fail to show data even when backend/API data exists.
- Previous Phase 1 plan artifacts were archived on 2026-06-29 for a clean v1 replan.

## Constraints

- **Scope**: v1 is UI refresh plus bug/stability sweep - avoid adding new major features.
- **Users**: Optimize for teachers and students first; keep assistant/super-admin from breaking but do not prioritize center workflows.
- **UX**: Keep calendar-first behavior for teachers; do not bury session workflows in tables.
- **Architecture**: Preserve tenant isolation and existing Controller -> Service -> Repository backend pattern.
- **Frontend**: Use existing Nuxt/Vuetify/composable patterns; components should call feature composables, not raw APIs.
- **Verification**: At minimum, run lint/typecheck/build where available and add focused tests for bug-prone logic when changed.
- **Brand/reference**: PREP is an inspiration only; design must be original for this product.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v1 focuses on teacher and student roles | These are the core learning loop; center workflows can wait | Pending |
| v1 is polish/stability, not feature expansion | Existing MVP is broad but needs reliability and UI quality | Pending |
| Start with audit before UI redesign | Data-display bugs should be understood before visual work hides failure modes | Pending |
| Use PREP-like education SaaS feel as reference | User likes that interface direction | Pending |
| Center role deferred to v2 | Prevents scope creep while teacher/student flows are still being refined | Pending |

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
*Last updated: 2026-06-29 after v1 replan/reset*
