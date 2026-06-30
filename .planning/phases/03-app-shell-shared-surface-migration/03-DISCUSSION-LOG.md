# Phase 3: App Shell & Shared Surface Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 3-App Shell & Shared Surface Migration
**Areas discussed:** Phase 3 depth, shared dialogs, calendar/dashboard priority, auth surface treatment, visual QA

---

## Phase 3 Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Teacher/student/auth/shared first | Recommended. Clean blockers affecting the primary workflows: shell, auth, calendar, dashboards, shared dialogs/surfaces. Defer marketing/admin clearly. | Yes |
| Clean every Phase 3 inventory item | Broader. Includes auth, calendar, dashboards, shared surfaces, landing/marketing icon-only, and admin-adjacent items if labeled Phase 3. | |
| Only clean blockers needed for Phase 4 | Narrower. Focus on shared primitives/surfaces needed by priority pages; dashboard/auth could defer if not blocking. | |

**User's choice:** Teacher/student/auth/shared first.
**Notes:** User also selected opportunistic cleanup for very small low-risk items and scan-clean expectations for the main scope.

### Follow-up: Opportunistic non-core cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Opportunistic small items | Recommended. Do very small low-risk work such as landing icon-only replacement if it does not expand scope. | Yes |
| Defer everything outside teacher/student/auth/shared | Cleanest scope, but leaves easy scan debt. | |
| Only if it blocks build/typecheck | Most conservative short-term path. | |

**User's choice:** Opportunistic small items.
**Notes:** Admin complexity should still be deferred.

### Follow-up: Scan-clean target

| Option | Description | Selected |
|--------|-------------|----------|
| Scan-clean within main scope | Recommended. Teacher/student/auth/shared surfaces should have no Vuetify/SCSS markers after Phase 3. | Yes |
| Behavior pass only | Faster, but Phase 5 has noisier debt. | |
| Scan-clean whole app | Too broad and likely absorbs Phase 4/5. | |

**User's choice:** Scan-clean within main scope.
**Notes:** Out-of-scope debt must be documented.

---

## Shared Dialogs

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate all three dialogs | Fastest shared-dialog scan cleanup, highest risk. | |
| Split by risk | Recommended. `SessionDialog` is calendar-critical; other dialogs migrate only if slice is safe. | Yes |
| Do not migrate large dialogs in Phase 3 | Safest, but leaves shared blockers. | |

**User's choice:** Split by risk.
**Notes:** `SessionDialog` should be handled separately due to calendar workflow risk.

### Follow-up: StudentDetailDialog and AssistantDetailDialog fit

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate low-risk parts | Recommended. Migrate simple headers, avatars, cards, tables, chips; defer complex forms/tabs if needed. | Yes |
| Defer entire dialog if not complete | Cleaner boundary, but leaves many markers. | |
| Migrate fully or fail phase | Decisive but risks phase bloat. | |

**User's choice:** Migrate low-risk parts.
**Notes:** Partial migration is acceptable when deferred areas are inventoried.

### Follow-up: SessionDialog preservation emphasis

| Option | Description | Selected |
|--------|-------------|----------|
| Scheduling correctness first | Recommended. Preserve class/student/assistant fields, timing, recurrence/conflict, create/edit behavior. | Yes |
| Visual parity first | Preserve appearance as much as possible, behavior not explored deeply. | |
| Simplify form UX if possible | Allow layout improvements when data contract is unchanged. | |

**User's choice:** Scheduling correctness first.
**Notes:** Correct data/workflow behavior matters more than minor visual differences.

---

## Calendar/Dashboard Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Teacher calendar first | Recommended. Calendar-first teacher workflow is the product anchor. | Yes |
| Teacher dashboard first | High traffic and many Vuetify usages, but less critical than calendar. | |
| Student dashboard/schedule first | Good for student parity, not the main anchor. | |
| Calendar and dashboard in parallel | Faster if split well, wider QA. | |

**User's choice:** Teacher calendar first.
**Notes:** Calendar is the first anchor for Phase 3.

### Follow-up: Order after calendar

| Option | Description | Selected |
|--------|-------------|----------|
| Teacher dashboard, then student dashboard/schedule | Recommended. Teacher-first product priority, then student parity. | Yes |
| Student dashboard/schedule, then teacher dashboard | Prioritizes student UX earlier. | |
| Calendar only; defer dashboards | Smaller phase, but leaves major teacher/student debt. | |

**User's choice:** Teacher dashboard, then student dashboard/schedule.
**Notes:** Order is calendar -> teacher dashboard -> student dashboard/schedule.

### Follow-up: Calendar visual stance

| Option | Description | Selected |
|--------|-------------|----------|
| Pixel-close to old UI | Less surprising, but expensive to recreate Vuetify. | |
| Preserve layout plus small UI-kit polish | Recommended. Keep hierarchy/actions/states and use UI kit for cleaner implementation. | Yes |
| Major calendar redesign | Potentially better, but too broad for Phase 3. | |

**User's choice:** Preserve layout plus small UI-kit polish.
**Notes:** No major calendar redesign.

---

## Auth Surface Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve old UI closely | Less surprising, but may spend effort recreating Vuetify. | |
| Align with new Tailwind shell | Recommended. Use `AuthShell`, `UiInput`, `UiButton`, `UiAlert`; preserve validation and auth flows. | Yes |
| Major auth redesign | Potentially nicer, but likely exceeds scope. | |

**User's choice:** Align with new Tailwind shell.
**Notes:** Preserve content, validation, and flow.

### Follow-up: Auth scope

| Option | Description | Selected |
|--------|-------------|----------|
| Whole auth surface | Recommended. `AuthShell`, login, register, forgot/reset/verify email, wrappers. | Yes |
| Login/register only | Focuses on main pages but leaves recovery/verify debt. | |
| Only high-use blockers | Minimal but noisy for Phase 5. | |

**User's choice:** Whole auth surface.
**Notes:** Auth should be scan-clean as a group.

### Follow-up: Validation/error ownership

| Option | Description | Selected |
|--------|-------------|----------|
| Logic stays in form/page | Recommended. Composables/validation/current state stay where they are; UI components display state. | Yes |
| Create shared auth form abstraction | Less duplication, but risks over-abstraction. | |
| Move validation into UI controls | Not recommended; breaks UI kit boundary. | |

**User's choice:** Logic stays in form/page.
**Notes:** `Ui*` remains display-only.

---

## Visual QA

| Option | Description | Selected |
|--------|-------------|----------|
| Teacher + student | Focuses on priorities but misses assistant shell branch. | |
| Teacher + student + assistant shell | Recommended. Covers main role-aware navigation without pulling admin pages into scope. | Yes |
| Teacher + student + assistant + admin shell | Wider; useful only if admin shell/nav changes need it. | |
| Teacher only | Too narrow for Phase 3. | |

**User's choice:** Teacher + student + assistant shell.
**Notes:** Admin pages remain deferred unless shell/nav changes require a minimal check.

### Follow-up: Viewports

| Option | Description | Selected |
|--------|-------------|----------|
| Desktop + mobile width | Recommended. At least 1440px and around 390/430px for touched surfaces. | Yes |
| Desktop only + mobile spot check | Faster, but drawer/form overflow risk remains. | |
| Desktop/tablet/mobile full coverage | Best coverage but heavier than necessary for Phase 3. | |

**User's choice:** Desktop + mobile width.
**Notes:** Applies to touched surfaces.

### Follow-up: Evidence format

| Option | Description | Selected |
|--------|-------------|----------|
| Checklist text only | Fast but weak for visual parity. | |
| Checklist + screenshots/manual notes | Recommended. Record desktop/mobile, roles, surfaces, and any issues; screenshots for risky surfaces if possible. | Yes |
| Full screenshot matrix | Strongest but better suited to Phase 5 unless risk demands it. | |

**User's choice:** Checklist + screenshots/manual notes.
**Notes:** Risky surfaces include calendar, auth, dashboard, and dialog work.

---

## the agent's Discretion

- The planner may choose exact plan split and plan count.
- The planner may decide whether non-critical dialog areas fit safe Phase 3 scope or should be deferred.
- The planner may choose exact UI kit components and variants as long as Tailwind-only and visual-parity rules are honored.

## Deferred Ideas

- Phase 4 priority page redesign remains deferred: `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- Admin-heavy pages and center role remain deferred unless a minimal shell compatibility check is needed.
- Full screenshot matrix is deferred to Phase 5 unless risk requires earlier evidence.
