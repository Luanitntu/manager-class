# Schedule Teacher

## What This Is

Schedule Teacher is a teacher-first learning management and class operations app for language teachers. Teachers manage classes, students, schedules, learning materials, payments, reports, and assistant teachers; students use the app to follow their classes, schedules, materials, scores, feedback, and payment status.

The current product already has a broad MVP feature set. The v1 focus is to turn that implementation into a polished, reliable release by redesigning the teacher/student UI and fixing the current small bugs that prevent data from showing or workflows from feeling dependable.

## Core Value

Teachers and students can reliably see and act on the right class data through a clean, calendar-first interface.

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
- Stabilize teacher workflows: dashboard, calendar, classes, students, documents, payments, reports, and profile (Validated in Phase 3: Teacher Workflow Polish & Fixes).

### Active

- [ ] Refresh the teacher and student UI with a modern, approachable SaaS style inspired by `app.prepedu.vn`, without copying PREP branding, assets, or protected UI.
- [ ] Audit and fix current data-display bugs where pages have backend data but the frontend does not show it.
- [ ] Stabilize student workflows: dashboard, enrolled classes, schedule, assigned documents, scores/comments, payments, and profile.
- [ ] Add targeted verification so bug fixes and UI refresh do not regress core teacher/student flows.

### Out of Scope

- Center role and center-level workflows - deferred until teacher/student product is mostly complete.
- New large product modules - v1 is polish/stability, not feature expansion.
- Subscription plans and billing - future SaaS monetization work.
- Mobile app - responsive web may be improved, but native mobile is out of scope.
- Copying PREP assets, exact brand, private screens, or proprietary UI - use it only as visual/product inspiration.

## Context

- Existing codebase: Nuxt 4 + Vue 3 + Vuetify frontend, NestJS + Prisma + PostgreSQL backend.
- Frontend lives in `client/app`; backend lives in `server/src`.
- Codebase map exists under `.planning/codebase/` and should be read before planning work.
- Prior docs under `.claude/docs/` describe the original MVP: teacher-centric, calendar-first, multi-tenant LMS.
- User specifically wants teacher and student experiences first; center role will become a separate later role.
- User likes the broad feel of `app.prepedu.vn`: clean education SaaS, approachable visual rhythm, dashboard/cards, clear navigation.
- Known current bug class: some pages fail to show data even when data exists.

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
| Use PREP-like education SaaS feel as reference | User likes that interface direction | Pending |
| Center role deferred to v2 | Prevents scope creep while teacher/student flows are still being refined | Pending |

## Phase Notes

- Phase 1 audit complete: static route/API/composable baseline, teacher audit, student/auth audit, bug ledger, and handoff summary now live under `.planning/phases/01-audit-data-flow-baseline/`.
- Runtime smoke testing remains blocked until Node/npm are available on PATH.
- Highest-confidence Phase 1 findings: student `/documents` and `/payments` call teacher-only helper queries; README seed password mismatch; seed lacks student smoke-test data.

## Evolution

After each phase:
1. Move verified fixes from Active to Validated.
2. Add newly discovered bugs to Active or Requirements if they affect v1.
3. Keep center-role work out of scope unless explicitly reprioritized.
4. Re-check whether the app still feels teacher/student first.

---
*Last updated: 2026-06-21 after Phase 3 complete*
