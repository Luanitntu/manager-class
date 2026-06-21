# Phase 1 Audit Summary

## Environment

Runtime smoke testing was not completed because `node` and `npm` are not available on PATH in this session. The audit used static route/API/composable inspection. This is a real blocker, not a passing runtime check.

## Audited Routes

Teacher routes audited:

- `/dashboard`
- `/calendar`
- `/classes`
- `/students`
- `/assistants`
- `/documents`
- `/payments`
- `/reports`
- `/audit-logs`
- `/profile`

Student flows audited:

- Dashboard via `/dashboard`
- Schedule via `/calendar`
- Classes via `/classes`
- Documents via `/documents`
- Scores/comments route coverage
- Payments via `/payments`
- Profile via `/profile`
- Login/default redirect behavior

## Confirmed Bugs and Static Mismatches

High severity:

- `BUG-001`: Teacher `/classes` must be runtime-smoked first because seed guarantees one class exists.
- `BUG-002`: README credential docs conflict with the seed password.
- `BUG-003`: Student `/documents` calls teacher-only `useStudents()` unconditionally.
- `BUG-004`: Student `/payments` calls teacher-only `useStudents()` unconditionally.
- `BUG-005`: Student scores/comments APIs/composables exist, but no student self route was found.
- `BUG-008`: Default seed lacks student data needed for student smoke tests.

Medium severity:

- `BUG-006`: student login/default routing lands on `/calendar`, not student dashboard.
- `BUG-007`: reports use direct download URLs that may miss bearer auth headers.

Low severity:

- `BUG-009`: profile page calls the API directly rather than through a feature composable.

## Systemic Causes

- Shared teacher/student pages are not always role-aware at the query level. A primary student-scoped query can be correct while helper queries still call teacher-only APIs.
- Demo seed does not match the smoke-test surface. It creates enough data for teacher classes only, not for student dashboards, documents, payments, scores, or comments.
- Auth routing is too coarse: super-admin gets dashboard, every other authenticated role gets calendar.
- A few pages bypass feature composables, making auth/envelope handling harder to audit consistently.

## Phase 2 UI Refresh Influence

- Do not redesign shared pages until role-specific data queries are separated or gated.
- Empty states must distinguish no data from blocked/forbidden helper queries.
- Student navigation should not inherit teacher-first calendar routing without an intentional student summary path.
- Profile/report API access should be normalized behind composables before or during visual cleanup.

## Phase 3 Fix Recommendations

- Start by smoke testing `BUG-001` after runtime is available: teacher login -> `/classes` -> verify `Japanese N5` appears.
- Fix or confirm report download auth behavior (`BUG-007`) with an authenticated teacher account.
- Consider a `useProfile` composable if profile is touched during teacher workflow polish (`BUG-009`).
- Add fixture data or seed update only if needed for teacher document/payment verification, preserving tenant isolation.

## Phase 4 Fix Recommendations

- Gate `useStudents()` and teacher-only form data in `/documents` and `/payments` behind teacher/assistant manage permissions.
- Ensure student payment and document pages render primary data even if management controls are hidden.
- Add student scores/comments display on dashboard or a dedicated student view.
- Make post-login and index redirects student-aware.
- Add a minimal student fixture with enrollment, shared document, tuition, score, and comment for reproducible smoke tests.

## Blockers

- Node/npm missing from PATH prevented live verification and repo script execution.
- Default seed does not include student/assistant or most data-display entities.
- README demo password conflicts with seed password.

## Handoff

Use `01-BUG-LEDGER.md` as the action source for later phases. The highest-confidence fixes are role-gating student shared-page helper queries (`BUG-003`, `BUG-004`) and aligning seed/docs (`BUG-002`, `BUG-008`). Runtime should begin with teacher `/classes` because current seed already has a class row.

