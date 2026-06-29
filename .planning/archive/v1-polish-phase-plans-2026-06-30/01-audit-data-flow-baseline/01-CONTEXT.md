# Phase 1: Audit & Data Flow Baseline - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase audits the existing teacher and student UI/data flows before any redesign work. It should reproduce pages where backend data exists but the frontend does not show it, identify the likely failure layer, and produce a short bug ledger for later fix phases. It should not redesign UI, add new feature modules, or introduce center-role workflows.

</domain>

<decisions>
## Implementation Decisions

### Audit Scope
- **D-01:** Audit all teacher and student core pages in Phase 1, not only the currently suspected pages.
- **D-02:** Prioritize likely data-missing pages first: dashboard, calendar, classes, students, documents, payments, then continue through remaining teacher/student routes.
- **D-03:** Assistant and super-admin flows should be noted if obviously broken, but they are not Phase 1's priority unless they block teacher/student audit setup.

### Test Data Source
- **D-04:** Start with the existing seed/demo data and current local data model.
- **D-05:** If existing data does not cover a teacher/student bug scenario, create the smallest necessary fixture or seed addition during planning/execution.
- **D-06:** Any added fixture must preserve tenant isolation and must be documented so later phases can reproduce the same bug.

### Bug Ledger
- **D-07:** Create and maintain a dedicated ledger at `.planning/phases/01-audit-data-flow-baseline/01-BUG-LEDGER.md`.
- **D-08:** `01-CONTEXT.md` captures decisions only; the ledger captures each bug's route, role, expected data, observed UI state, suspected layer, evidence, severity, and next action.

### Verification Depth
- **D-09:** Phase 1 verification should use manual smoke checks plus browser/API evidence first.
- **D-10:** Add automated checks only when a bug is easy to test quickly or when a lightweight regression test would prevent repeated failures.
- **D-11:** Planning should include concrete verification commands and note when environment limits prevent full verification.

### the agent's Discretion
- The agent may decide the exact route order inside teacher/student audit as long as high-risk data-display pages are checked first.
- The agent may choose whether a bug is best evidenced via screenshot, API response, console/network log, or code trace.
- The agent may add small targeted tests when the code path is isolated and testable without slowing the audit.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope
- `.planning/PROJECT.md` - v1 scope, teacher/student priority, PREP-inspired but original UI direction, center role deferred.
- `.planning/REQUIREMENTS.md` - Phase 1 mapped requirements: DATA-06, BUG-01, BUG-02.
- `.planning/ROADMAP.md` - Phase 1 goal, success criteria, and boundaries.
- `.planning/STATE.md` - Current milestone and current phase.

### Codebase Map
- `.planning/codebase/STRUCTURE.md` - Where frontend pages/composables and backend modules live.
- `.planning/codebase/CONVENTIONS.md` - Existing frontend/backend patterns to preserve during audit/fixes.
- `.planning/codebase/TESTING.md` - Current verification commands and test patterns.
- `.planning/codebase/CONCERNS.md` - Known concerns, especially missing frontend tests and tenant-isolation risk.

### Prior Product Docs
- `.claude/docs/# 1_PROJECT_CONTEXT.md` - Original product vision, roles, and calendar-first teacher workflow.
- `.claude/docs/# 4_PERMISSION_MATRIX.md` - Existing role permissions for teacher/student/assistant/super-admin.
- `.claude/docs/# 6_FRONTEND_ARCHITECTURE.md` - Existing frontend architecture intent: pages, shared components, composables.
- `.claude/docs/# STATUS.md` - Original MVP completion notes and known post-MVP tasks.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/app/composables/useApi.ts`: central API client that unwraps `{ success, data, meta? }`; likely first place to inspect for envelope/pagination mismatch.
- `client/app/composables/use*.ts`: feature API wrappers for classes, sessions, students, assistants, documents, payments, dashboard, audit.
- `client/app/stores/auth.ts`: persisted auth/session store; relevant to role-specific routes and missing data caused by wrong auth context.
- `client/app/middleware/auth.global.ts`: route access behavior; relevant to navigation blockers.
- `server/src/modules/*/*.controller.ts`, `*.service.ts`, `*.repository.ts`: backend API/data layers for cross-checking expected data.

### Established Patterns
- Frontend pages should use feature composables, not raw API calls.
- Backend uses Controller -> Service -> Repository, with tenant scoping in services/repositories.
- API responses are wrapped by `TransformInterceptor`; binary/report responses can opt out with `SkipTransform`.
- Backend tests currently use Jest colocated `*.spec.ts`; frontend has lint/typecheck/build but no frontend test runner.

### Integration Points
- Teacher routes to audit include `dashboard`, `calendar`, `classes`, `students`, `assistants`, `documents`, `payments`, `reports`, `audit-logs`, `profile`.
- Student routes may reuse pages or role-scoped backend endpoints; audit must confirm student data is not accidentally using teacher-only assumptions.
- Seed/demo data lives under `server/prisma/seed.ts`; database schema lives in `server/prisma/schema.prisma`.

</code_context>

<specifics>
## Specific Ideas

- User reported a current bug class: some pages have data, but when opened in the UI, the pages do not show that data.
- User wants the bug audit done before UI refresh so redesign does not hide existing data-flow problems.
- Teacher/student are the target roles for this audit; center role is explicitly later.

</specifics>

<deferred>
## Deferred Ideas

- Center role and center-level workflows belong to v2 after teacher/student flows are stable.
- Full UI redesign belongs to Phase 2 and later; Phase 1 only gathers evidence and root causes.
- Broad frontend automated test infrastructure may be considered later; Phase 1 only adds targeted tests when they are low-cost and clearly useful.

</deferred>

---

*Phase: 1-Audit & Data Flow Baseline*
*Context gathered: 2026-06-21*
