# Phase 4: Student Portal Polish & Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 4-Student Portal Polish & Fixes
**Areas discussed:** Student dashboard content, Scores/comments placement, Documents/payments student view, Student demo/verification data

---

## Student Dashboard Content

| Option | Description | Selected |
|--------|-------------|----------|
| Overview + sections | Cards plus sections for schedule, documents, scores/comments, and payments. | yes |
| Stats only | Use only existing summary stats and upcoming sessions. | |
| Today-first | Prioritize next class, latest material, payment alert, then secondary stats. | |

**User's choice:** Overview + sections.
**Follow-up decisions:** Section order is Schedule, Documents, Scores, Payments. Dashboard uses targeted queries beyond `/dashboard`. Empty sections remain visible with action-oriented empty states.

---

## Scores/Comments Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard preview | Show scores/comments preview on dashboard without adding a large new page. | yes |
| Dedicated `/scores` page | Add a new student scores/comments route. | |
| Inside `/classes` cards/details | Group academic progress under classes. | |

**User's choice:** Dashboard preview.
**Follow-up decisions:** Show latest 3 scores and latest 3 comments. Add student self endpoints/composables such as `/students/me/scores` and `/students/me/comments`. Render comments as a teacher feedback/progress timeline.

---

## Documents/Payments Student View

| Option | Description | Selected |
|--------|-------------|----------|
| Same route, role-specific branches | Keep `/documents` and `/payments`, branch UI by role. | yes |
| Dedicated student pages | Add separate student document/payment routes. | |
| Dashboard only | Surface docs/payments only on dashboard. | |

**User's choice:** Same route, role-specific branches.
**Follow-up decisions:** Student documents use material cards. Student payments use account-style tuition cards. Teacher-only helper queries must be gated by role before execution.

---

## Student Demo/Verification Data

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal fixture | Add a full demo student smoke path. | yes |
| Manual setup notes | Avoid seed changes and document manual setup. | |
| Test-only fixture helper | Add helper data for tests only. | |

**User's choice:** Minimal fixture.
**Follow-up decisions:** Use a documented simple demo student account. Seed one full smoke path: student, enrollment, assigned document, tuition with partial payment/history, score, comment, upcoming session. Verification should include manual student smoke plus targeted backend tests where backend logic changes.

---

## The Agent's Discretion

- Exact student dashboard component structure and styling, as long as decisions in `04-CONTEXT.md` are preserved.
- Exact self-endpoint path naming, as long as student UI does not need to know its own user id.
- Exact empty-state copy and layout, as long as states are clear and role-appropriate.

## Deferred Ideas

- Dedicated `/scores` page or larger academic progress module.
- Class-grouped feedback/comments that would require model changes.
- Full frontend automated test infrastructure.
- Broad responsive QA.
- Center role workflows.
