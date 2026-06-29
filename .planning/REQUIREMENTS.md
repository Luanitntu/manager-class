# Requirements: Schedule Teacher v1 Polish Release

**Defined:** 2026-06-29
**Core Value:** Teachers and students can reliably see and act on the right class data through a clean, calendar-first interface.

## v1 Requirements

### Discovery and Audit

- [ ] **AUDIT-01**: Teacher and student core routes have an audit record that states route, role, expected data, actual UI behavior, and suspected failure layer.
- [ ] **AUDIT-02**: Data-display failures are classified by API envelope, pagination, auth/session state, role scope, composable mapping, store state, or component rendering.
- [ ] **AUDIT-03**: Each confirmed bug has a reproduction note, severity, owner area, and verification target before implementation starts.

### UI Refresh

- [ ] **UI-01**: Shared app shell provides clear role-aware navigation for teacher and student routes without introducing center workflows.
- [ ] **UI-02**: Shared cards, tables, forms, dialogs, empty states, loading states, error states, and success states use one original education SaaS visual language.
- [ ] **UI-03**: Teacher-facing pages keep calendar-first workflows prominent and usable after the visual refresh.
- [ ] **UI-04**: Student-facing pages emphasize clarity around upcoming classes, documents, scores/comments, and payments.
- [ ] **UI-05**: Main teacher/student pages remain usable on common laptop and mobile-width viewports with no overlapping text or broken controls.

### Teacher Workflow Reliability

- [ ] **TEACH-01**: Teacher dashboard displays live counts, upcoming sessions, tuition summaries, and relevant alerts when data exists.
- [ ] **TEACH-02**: Teacher calendar displays existing sessions for the selected date range and preserves create, view/edit, drag, resize, and recurring-session flows.
- [ ] **TEACH-03**: Teacher classes, students, and assistants pages display existing tenant-scoped API data and clear empty/loading/error states.
- [ ] **TEACH-04**: Teacher documents page supports visible upload/link/share/download state for teacher-owned and student-visible materials.
- [ ] **TEACH-05**: Teacher payments, reports, audit, and profile pages display existing API data without silent empty states.

### Student Portal Reliability

- [ ] **STUD-01**: Student dashboard displays the student's enrolled classes, upcoming sessions, assigned documents, scores/comments, and payment status where data exists.
- [ ] **STUD-02**: Student classes and schedule pages use student-appropriate role-scoped API data rather than teacher-only assumptions.
- [ ] **STUD-03**: Student documents and scores/comments pages distinguish no data from loading, error, and permission states.
- [ ] **STUD-04**: Student payments page shows status and history clearly when payment records exist.
- [ ] **STUD-05**: Student profile/session flows do not block navigation or show stale user data after refresh.

### Verification

- [ ] **VER-01**: Frontend lint, typecheck, and build pass after UI and data-display changes.
- [ ] **VER-02**: Backend lint, build, and existing Jest tests pass after bug fixes.
- [ ] **VER-03**: Fixed data-display bugs have focused regression tests where practical or documented manual checks where automation is absent.
- [ ] **VER-04**: Teacher smoke flow is verified: login -> dashboard -> calendar -> class/student/document/payment/report page.
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
| AUDIT-01 | Phase 1 | Pending |
| AUDIT-02 | Phase 1 | Pending |
| AUDIT-03 | Phase 1 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 2 | Pending |
| UI-04 | Phase 2 | Pending |
| UI-05 | Phase 5 | Pending |
| TEACH-01 | Phase 3 | Pending |
| TEACH-02 | Phase 3 | Pending |
| TEACH-03 | Phase 3 | Pending |
| TEACH-04 | Phase 3 | Pending |
| TEACH-05 | Phase 3 | Pending |
| STUD-01 | Phase 4 | Pending |
| STUD-02 | Phase 4 | Pending |
| STUD-03 | Phase 4 | Pending |
| STUD-04 | Phase 4 | Pending |
| STUD-05 | Phase 4 | Pending |
| VER-01 | Phase 5 | Pending |
| VER-02 | Phase 5 | Pending |
| VER-03 | Phase 5 | Pending |
| VER-04 | Phase 5 | Pending |
| VER-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

## User Stories

- As a teacher, I can open any main page and see the data I expect without needing to refresh or guess whether the app is broken.
- As a teacher, I can manage daily work from a polished calendar-first interface.
- As a student, I can log in and quickly understand my classes, schedule, documents, scores/comments, and payment status.
- As the product owner, I can validate teacher/student usage before expanding to center-level workflows.

## Acceptance Criteria

- Teacher and student pages have a coherent visual system and role-appropriate navigation.
- Existing backend data appears correctly on relevant frontend pages.
- Every fixed data-display bug has a reproduction note and verification note.
- Center role is not introduced into v1 UI beyond existing legacy/admin surfaces.

---
*Requirements defined: 2026-06-29*
*Last updated: 2026-06-29 after v1 replan/reset*
