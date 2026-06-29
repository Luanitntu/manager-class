# Requirements: Schedule Teacher v1.1 Tailwind UI Migration

**Defined:** 2026-06-30
**Core Value:** Teachers and students can reliably see and act on the right class data through a clean, calendar-first interface.

## v1.1 Requirements

### Styling Platform

- [ ] **STYLE-01**: The frontend no longer registers `vuetify-nuxt-module` or uses `client/vuetify.config.ts` / Vuetify settings in Nuxt configuration.
- [ ] **STYLE-02**: The frontend no longer imports SCSS application styles, including `client/app/assets/css/vuetify.settings.scss` and `client/app/styles/**/*.scss`.
- [ ] **STYLE-03**: Remaining app styling is expressed through Tailwind CSS, design tokens in CSS variables where needed, and Vue component classes.
- [ ] **STYLE-04**: Material Design Icons or icon usage continues to work without depending on Vuetify components.

### Shared UI Components

- [ ] **UIKIT-01**: Shared layout primitives exist for page headers, toolbar rows, sections, cards, and responsive content containers.
- [ ] **UIKIT-02**: Shared form/control components exist for buttons, inputs, selects, textareas, filters, and action groups.
- [ ] **UIKIT-03**: Shared data display components exist for tables/lists, pagination, badges/chips, avatars, metric cards, and status indicators.
- [ ] **UIKIT-04**: Shared feedback components exist for alerts, toasts, skeleton/loading states, empty states, and confirmation dialogs/modals.
- [ ] **UIKIT-05**: Existing duplicated UI patterns are replaced with shared components where practical without changing page behavior.

### App-Wide Migration

- [ ] **APP-01**: Shared app layouts no longer use Vuetify shell components such as `v-app`, `v-main`, `v-navigation-drawer`, `v-app-bar`, or `v-list`.
- [ ] **APP-02**: Reusable dialogs and high-traffic shared components no longer depend on Vuetify primitives.
- [ ] **APP-03**: The app has a documented inventory of remaining old UI/Vuetify usages after the migration sweep, with none left in v1.1 scope unless explicitly deferred.
- [ ] **APP-04**: Calendar-first teacher workflow remains accessible and visually consistent after shell migration.

### Priority Page Redesign

- [ ] **PAGE-01**: `/assistants` is redesigned with Tailwind shared components while preserving search, pagination, create assistant, list, and detail-open behavior.
- [ ] **PAGE-02**: `/assistants/[id]` is redesigned with Tailwind shared components while preserving profile, salary summary, assigned classes, salary config, schedule, breakdown, and history behavior.
- [ ] **PAGE-03**: `/audit-logs` is redesigned with Tailwind shared components while preserving filters, table/list display, pagination, and empty/loading states.
- [ ] **PAGE-04**: `/profile` is redesigned with Tailwind shared components while preserving profile loading, edit, timezone selection, save, error, and success behavior.
- [ ] **PAGE-05**: Redesigned pages match the newer app UI direction across spacing, typography, color, responsive behavior, and state treatment.

### Verification

- [ ] **VER-01**: Frontend `npm run lint` passes after Vuetify/SCSS removal and page redesign.
- [ ] **VER-02**: Frontend `npm run typecheck` passes after Vuetify/SCSS removal and page redesign.
- [ ] **VER-03**: Frontend `npm run build` passes without Vuetify or SCSS dependencies.
- [ ] **VER-04**: Manual smoke checks cover app shell navigation plus `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` on desktop and mobile-width viewports.
- [ ] **VER-05**: Backend verification is run only if backend files are touched; otherwise the milestone records that backend was not changed.

## Future Requirements

### Full Product UI Polish

- **FUTURE-01**: Any non-priority admin or low-traffic page not completed in v1.1 is redesigned in a later UI cleanup milestone.
- **FUTURE-02**: Frontend automated component or browser tests are added for shared UI components and smoke flows.

### Product Expansion

- **CENTER-01**: Center role can manage multiple teachers under one organization.
- **SUB-01**: Subscription plans and billing are supported.
- **MOB-01**: Native mobile app or mobile-first experience is explored.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New backend product modules | Milestone is frontend UI platform migration. |
| Center role workflows | User priority is current app UI consistency. |
| New billing/subscription features | Future SaaS monetization after UI foundation is stable. |
| Native mobile app | Current scope is responsive web. |
| Recreating every visual from PREP | This app needs original design; PREP remains inspiration only. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STYLE-01 | Phase 1 | Pending |
| STYLE-02 | Phase 1 | Pending |
| STYLE-03 | Phase 1 | Pending |
| STYLE-04 | Phase 1 | Pending |
| UIKIT-01 | Phase 2 | Pending |
| UIKIT-02 | Phase 2 | Pending |
| UIKIT-03 | Phase 2 | Pending |
| UIKIT-04 | Phase 2 | Pending |
| UIKIT-05 | Phase 2 | Pending |
| APP-01 | Phase 3 | Pending |
| APP-02 | Phase 3 | Pending |
| APP-03 | Phase 3 | Pending |
| APP-04 | Phase 3 | Pending |
| PAGE-01 | Phase 4 | Pending |
| PAGE-02 | Phase 4 | Pending |
| PAGE-03 | Phase 4 | Pending |
| PAGE-04 | Phase 4 | Pending |
| PAGE-05 | Phase 4 | Pending |
| VER-01 | Phase 5 | Pending |
| VER-02 | Phase 5 | Pending |
| VER-03 | Phase 5 | Pending |
| VER-04 | Phase 5 | Pending |
| VER-05 | Phase 5 | Pending |

**Coverage:**
- v1.1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

## User Stories

- As a developer, I can build app pages using shared Tailwind UI components instead of repeating one-off Vuetify markup.
- As a teacher, I see a consistent app experience without old and new UI styles mixed together.
- As an admin/teacher using assistant and audit pages, I can complete existing workflows in the redesigned UI.
- As a user, I can update my profile in a page that matches the rest of the app.

## Acceptance Criteria

- Vuetify and SCSS are removed from the frontend build/runtime surface.
- Shared Tailwind UI components cover common app patterns.
- `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` are redesigned and behavior-preserving.
- Frontend lint, typecheck, and build pass.

---
*Requirements defined: 2026-06-30*
*Last updated: 2026-06-30 after milestone start*
