# Requirements: Schedule Teacher v1 Polish Release

**Defined:** 2026-06-21
**Core Value:** Teachers and students can reliably see and act on the right class data through a clean, calendar-first interface.

## v1 Requirements

### UI Refresh

- [x] **UI-01**: Teacher-facing pages use a consistent modern education SaaS visual style inspired by PREP, with original colors, spacing, typography, and component treatment.
- [ ] **UI-02**: Student-facing pages use the same visual system while emphasizing clarity around upcoming classes, documents, scores, and payments.
- [x] **UI-03**: The app shell provides clear role-aware navigation for teacher and student routes without crowding or confusing center/admin concepts.
- [x] **UI-04**: Calendar remains the primary teacher workspace and supports create, view/edit, drag, resize, and recurring-session flows without visual breakage.
- [x] **UI-05**: Empty, loading, error, and success states are polished and consistent across teacher/student pages.
- [ ] **UI-06**: Main pages remain usable on common laptop and mobile-width viewports, with no overlapping text or broken controls.

### Data Display Reliability

- [x] **DATA-01**: Teacher dashboard displays live counts, upcoming sessions, tuition summaries, and relevant alerts when data exists.
- [x] **DATA-02**: Teacher calendar displays existing sessions from the API for the selected date range.
- [x] **DATA-03**: Teacher class, student, assistant, document, payment, report, and audit pages display existing API data correctly.
- [ ] **DATA-04**: Student dashboard displays enrolled classes, upcoming sessions, assigned documents, scores/comments, and payment status where data exists.
- [ ] **DATA-05**: Student-accessible lists do not silently appear empty when API data exists or when role scoping requires a different API path.
- [ ] **DATA-06**: API envelope and pagination handling are consistent in frontend composables so pages do not lose data due to unwrap/meta mismatches.

### Bug Fixing

- [ ] **BUG-01**: Known page-level bugs where data exists but the UI does not show it are audited, reproduced, fixed, and recorded.
- [ ] **BUG-02**: Auth/session edge cases that block teacher or student navigation are fixed.
- [x] **BUG-03**: Form submit/update flows for teacher/student core pages show validation errors and successful updates clearly.
- [x] **BUG-04**: Upload/download/share flows for documents are verified for teacher-created and student-visible materials.
- [ ] **BUG-05**: Payment status and payment history display correctly for teachers and students.

### Verification

- [ ] **VER-01**: Frontend lint, typecheck, and build pass after UI refresh and data-display fixes.
- [ ] **VER-02**: Backend lint, build, and existing Jest tests pass after bug fixes.
- [ ] **VER-03**: Focused regression tests or manual verification notes cover every fixed data-display bug.
- [ ] **VER-04**: Teacher smoke flow is verified: login -> dashboard -> calendar -> class/student/document/payment page.
- [ ] **VER-05**: Student smoke flow is verified: login -> dashboard -> schedule/classes -> documents -> scores/payments.

## v2 Requirements

### Center Role

- **CENTER-01**: Center role can manage multiple teachers under one organization.
- **CENTER-02**: Center role can view center-level classes, students, schedules, payments, and reports.
- **CENTER-03**: Center role permissions are distinct from teacher and super-admin permissions.

### Product Expansion

- **SUB-01**: Subscription plans and billing are supported.
- **ATT-01**: Attendance tracking is available for classes/sessions.
- **LIVE-01**: Zoom or Google Meet integration can be attached to sessions.
- **MOB-01**: Native mobile app or mobile-first experience is explored.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Center role in v1 | User wants teacher/student completed first. |
| New large modules | v1 is UI refresh and bug/stability pass. |
| Subscription billing | Future SaaS monetization after core product quality. |
| Native mobile app | Current scope is web app polish. |
| Exact PREP clone | PREP is reference/inspiration only; this product needs original UI. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 2 | Complete |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 2 | Complete |
| UI-04 | Phase 3 | Complete |
| UI-05 | Phase 2 | Complete |
| UI-06 | Phase 5 | Pending |
| DATA-01 | Phase 3 | Complete |
| DATA-02 | Phase 3 | Complete |
| DATA-03 | Phase 3 | Complete |
| DATA-04 | Phase 4 | Pending |
| DATA-05 | Phase 4 | Pending |
| DATA-06 | Phase 1 | Complete - audit baseline |
| BUG-01 | Phase 1 | Complete - audit baseline |
| BUG-02 | Phase 1 | Complete - audit baseline |
| BUG-03 | Phase 3 | Complete |
| BUG-04 | Phase 3 | Complete |
| BUG-05 | Phase 4 | Pending |
| VER-01 | Phase 5 | Pending |
| VER-02 | Phase 5 | Pending |
| VER-03 | Phase 5 | Pending |
| VER-04 | Phase 5 | Pending |
| VER-05 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

## User Stories

- As a teacher, I can open any main page and see the data I expect without needing to refresh or guess whether the app is broken.
- As a teacher, I can manage my daily work from a polished calendar-first interface.
- As a student, I can log in and quickly understand my classes, schedule, documents, scores, and payment status.
- As the product owner, I can validate teacher/student usage before expanding to center-level workflows.

## Acceptance Criteria

- Teacher and student pages have a coherent visual system and role-appropriate navigation.
- Existing backend data appears correctly on the relevant frontend pages.
- Every fixed data-display bug has a reproduction note and verification note.
- Center role is not introduced into v1 UI beyond existing super-admin/teacher/student/assistant concepts.

---
*Requirements defined: 2026-06-21*
*Last updated: 2026-06-21 after Phase 1 audit execution*
