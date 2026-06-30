# Phase 1 Migration Inventory

**Scan timestamp:** 2026-06-30T11:15:10+07:00

## Scan Method

- Scanned `client/app` recursively for `*.vue`, `*.ts`, and `*.css`.
- Excluded generated/runtime folders: `node_modules`, `.nuxt`, `.output`, and `dist`.
- Patterns:
  - Vuetify component tags: `<v-*` and `</v-*`
  - Removed framework imports/composables: `from 'vuetify'`, `from "vuetify"`, `useDisplay`
  - SCSS build-path syntax: `lang="scss"`, `lang='scss'`, `.scss`, `@use`, `@forward`
  - Framework selector coupling: `.v-*` and `:deep(.v-*)`
- Known starting scale from Phase 1 context: about 59 Vue files and about 1135 tag usages.
- Actual post-cutover scale: 54 files with opening `<v-*>` tags, 1085 opening tag usages, 1869 opening/closing tag occurrences, 10 files with SCSS syntax/import markers, 0 `from 'vuetify'` files, 0 `useDisplay` files, and 14 files with `.v-*`/`:deep(.v-*)` CSS coupling.

## Summary Counts

| Bucket | Count | Notes |
|---|---:|---|
| Files with opening `<v-*>` tags | 54 | Includes routes and shared components still requiring component replacement. |
| Opening `<v-*>` tag usages | 1085 | Best proxy for implementation work size. |
| Opening/closing `<v-*>` occurrences | 1869 | Useful for grep parity with earlier raw scans. |
| Files with SCSS syntax/import markers | 10 | These block full Sass removal unless converted or deferred explicitly. |
| Files importing from `vuetify` | 0 | Direct imports are gone. |
| Files using `useDisplay` | 0 | Layout breakpoint blocker is gone. |
| Files with `.v-*` CSS coupling | 14 | Mostly plain CSS converted from previous SCSS slices. |

## Detailed Inventory

| File Path | Route/Component Role | Tags/Patterns | SCSS/Import Status | Priority Bucket | Likely Owning Phase | Risky Replacement Notes |
|---|---|---|---|---|---|---|
| client/app/assets/css/main.css | Global CSS entry | `.v-*` font overrides only | v-class CSS, no SCSS import | P1 cleanup | Phase 3 | Remove after pages no longer rely on Vuetify-generated classes; currently harmless but platform-coupled. |
| client/app/components/AppInitialLoader.vue | Initial loading primitive | no Vuetify tags | `lang=scss` | P0 build blocker | Phase 3 | Convert small loader styles to plain CSS before Sass removal. |
| client/app/components/AppSkeleton.vue | Skeleton primitive | no Vuetify tags | `lang=scss` | P0 build blocker | Phase 2 | Convert to Tailwind/shared skeleton component. |
| client/app/components/AssistantDetailDialog.vue | Shared assistant detail dialog | 24 tags: dialog/card/select/table/chips | none | P1 shared surface | Phase 2 | Needs shared modal, form select, table, chip, and action button primitives. |
| client/app/components/AuthShell.vue | Auth shell brand wrapper | 4 tags: avatar/icon | none | P1 shell/shared | Phase 3 | Replace with AppIcon and Tailwind brand mark; check login/register pages at same time. |
| client/app/components/ClassLocation.vue | Class location display | 4 tags: chip/icon | none | P2 shared display | Phase 2 | Map chip/icon variants to shared badge + AppIcon. |
| client/app/components/SessionDialog.vue | Shared session create/edit dialog | 44 tags: dialog/card/forms/chips/selects | none | P1 shared surface | Phase 2 | Needs robust dialog/forms/date controls; risky due scheduling workflow. |
| client/app/components/StudentDetailDialog.vue | Shared student detail dialog | 55 tags: dialog/tabs/list/select/card | none | P1 shared surface | Phase 2 | Needs tabs, dialog, list, profile and student state controls. |
| client/app/components/StudentSchedule.vue | Student schedule widget | 11 tags: buttons/icons | `lang=scss`, v-class CSS | P1 student shared | Phase 3 | Convert styles and icons/buttons; preserve student schedule actions. |
| client/app/components/TeacherDashboard.vue | Legacy teacher dashboard | 60 tags: cards/grid/list/chips/icons | none | P3 deferred/legacy | Future cleanup | Appears superseded by workspace dashboard; verify usage before migrating. |
| client/app/components/calendar/StudentCalendar.vue | Student calendar surface | 2 tags: snackbar | none | P1 calendar blocker | Phase 3 | Replace snackbar with AppToast/shared feedback. |
| client/app/components/calendar/TeacherCalendar.vue | Teacher calendar orchestrator | 2 tags: snackbar | none | P1 calendar blocker | Phase 3 | Preserve existing dirty explicit imports; replace feedback only. |
| client/app/components/calendar/TeacherCalendarBoard.vue | Teacher calendar board | 16 tags: card/buttons/toggle | none | P1 calendar blocker | Phase 3 | Calendar-first workflow; button/toggle semantics must be preserved. |
| client/app/components/calendar/TeacherCalendarHeader.vue | Teacher calendar header | 4 tags: buttons | none | P1 calendar blocker | Phase 3 | Simple button replacement; preserve create/session actions. |
| client/app/components/calendar/TeacherSessionDetail.vue | Teacher session detail | 7 tags: sheet/button/icon/spacer | none | P1 calendar blocker | Phase 3 | Replace sheet/details with Tailwind panel. |
| client/app/components/dashboard/AdminWorkspaceDashboard.vue | Admin dashboard | 83 tags: cards/grid/list/table/chips | none | P3 deferred/admin | Future cleanup | Center/admin lower priority; keep after teacher/student flows. |
| client/app/components/dashboard/StudentWorkspaceDashboard.vue | Student dashboard | 29 tags: buttons/icons/progress | `lang=scss`, v-class CSS | P1 student blocker | Phase 3 | Convert SCSS and progress/buttons without breaking student overview. |
| client/app/components/dashboard/TeacherWorkspaceDashboard.vue | Teacher dashboard | 80 tags: cards/grid/list/chips/icons | none | P1 teacher blocker | Phase 3 | High traffic; replace with shared cards/list/actions after UI kit. |
| client/app/components/landing/LandingFeatures.vue | Landing feature section | 1 tag: icon | none | P3 deferred/marketing | Future cleanup | Swap to AppIcon; low runtime risk. |
| client/app/components/landing/LandingFooter.vue | Landing footer | 3 tags: icon | none | P3 deferred/marketing | Future cleanup | Swap to AppIcon. |
| client/app/components/landing/LandingHeader.vue | Landing header | 1 tag: icon | none | P3 deferred/marketing | Future cleanup | Swap to AppIcon. |
| client/app/components/landing/LandingHero.vue | Landing hero | 4 tags: icon | none | P3 deferred/marketing | Future cleanup | Swap to AppIcon; preserve CTA layout. |
| client/app/components/landing/LandingShowcase.vue | Landing showcase | 2 tags: icon | none | P3 deferred/marketing | Future cleanup | Swap to AppIcon. |
| client/app/components/landing/LandingTopbar.vue | Landing topbar | 2 tags: icon | none | P3 deferred/marketing | Future cleanup | Swap to AppIcon. |
| client/app/components/login/LoginFormPane.vue | Login form pane | 14 tags: form/text fields/buttons/icons/checkbox | none | P1 auth blocker | Phase 3 | Replace Vuetify validation display and checkbox carefully. |
| client/app/components/login/LoginVisual.vue | Login visual pane | 3 tags: avatar/img | none | P1 auth blocker | Phase 3 | Replace avatar/image wrapper. |
| client/app/components/register/RegisterFormPane.vue | Register form pane | 18 tags: form/text fields/buttons/divider | v-class CSS in imported file | P1 auth blocker | Phase 3 | Replace form fields and social buttons after shared form controls exist. |
| client/app/components/register/RegisterVisual.vue | Register visual pane | 4 tags: avatar/img | v-class CSS in imported file | P1 auth blocker | Phase 3 | Replace avatar/image wrapper. |
| client/app/pages/admin/health.vue | Admin health page | 39 tags: cards/progress/table/alerts | none | P3 deferred/admin | Future cleanup | Admin diagnostics lower priority. |
| client/app/pages/admin/settings.vue | Admin settings page | 61 tags: forms/file inputs/cards | none | P3 deferred/admin | Future cleanup | Requires file input and settings form primitives. |
| client/app/pages/admin/users/index.vue | Admin users index | 87 tags: table/dialog/forms/chips | none | P3 deferred/admin | Future cleanup | Admin CRUD lower priority; needs table/dialog kit. |
| client/app/pages/admin/users/[id].vue | Admin user detail | 76 tags: cards/timeline/dialog/table | none | P3 deferred/admin | Future cleanup | Timeline replacement needed. |
| client/app/pages/assistants/index.vue | Priority assistants list | 42 tags: dialogs/cards/list/table/forms | none | P0 priority page | Phase 4 | Must preserve search, pagination, create, list and detail-open behavior. |
| client/app/pages/assistants/[id].vue | Priority assistant detail | 117 tags: forms/cards/dialogs/table/grid | none | P0 priority page | Phase 4 | Highest priority page; salary, schedule, breakdown, history states are risky. |
| client/app/pages/audit-logs.vue | Priority audit logs | 12 tags: select/button/card/table/chip | none | P0 priority page | Phase 4 | Replace filter/table/pagination while preserving query params and empty states. |
| client/app/pages/profile.vue | Priority profile page | 14 tags: alert/autocomplete/button/card/chip/field | none | P0 priority page | Phase 4 | Preserve profile load/edit/save/timezone/success/error workflow. |
| client/app/pages/classes/index.vue | Class index route | 81 tags: forms/dialog/table/cards/color picker | none | P2 teacher route | Future cleanup | Needs color picker replacement or explicit supported primitive. |
| client/app/pages/classes/[id].vue | Class detail route | 199 tags: many forms/dialogs/tabs/tables | none | P2 teacher route | Future cleanup | Largest teacher route; also known typecheck risk from previous plans. |
| client/app/pages/classes.vue | Legacy class page | 48 tags: dialogs/cards/list/menu/forms | `lang=scss` | P2 teacher route | Future cleanup | Confirm route usage versus `classes/index.vue` before investing. |
| client/app/pages/documents.vue | Teacher documents route | 79 tags: dialogs/file input/menu/list | `lang=scss` | P1 verification blocker | Planning gap | Current typecheck fails here; needs narrow type fix and SCSS conversion before final gates. |
| client/app/pages/forgot-password.vue | Forgot password route | 13 tags: form/field/button/alert/avatar | none | P2 auth route | Phase 3 | Replace with shared auth form primitives. |
| client/app/pages/index.vue | Landing route wrapper | 2 tags: `v-app` | none | P1 app wrapper | Phase 3 | Replace wrapper; landing components also use icons. |
| client/app/pages/login.vue | Login route wrapper | 2 tags: `v-app` | none | P1 auth wrapper | Phase 3 | Replace wrapper; login form still has Vuetify fields. |
| client/app/pages/maintenance.vue | Maintenance page | 6 tags: avatar/card/icon | none | P3 deferred/low traffic | Future cleanup | Simple replacement. |
| client/app/pages/payments.vue | Payments route | 65 tags: dialogs/forms/cards/alerts | `lang=scss` | P2 teacher route | Future cleanup | Payment form states and money formatting need careful parity. |
| client/app/pages/register.vue | Register route wrapper | 2 tags: `v-app` | none | P1 auth wrapper | Phase 3 | Replace wrapper with plain shell. |
| client/app/pages/reports.vue | Reports route | 22 tags: select/buttons/icons/alerts | `lang=scss`, v-class CSS | P2 teacher route | Future cleanup | Chart/export controls; convert SCSS first. |
| client/app/pages/reset-password.vue | Reset password route | 13 tags: form/field/button/alert/avatar | none | P2 auth route | Phase 3 | Shared auth form primitives. |
| client/app/pages/students.vue | Legacy students page | 43 tags: dialogs/cards/forms/icons | `lang=scss`, v-class CSS | P2 teacher route | Future cleanup | Confirm route usage versus `students/index.vue`; known overlap. |
| client/app/pages/students/index.vue | Students index route | 58 tags: table/dialog/menu/forms/chips | none | P2 teacher route | Future cleanup | Needs table/dialog kit and student status controls. |
| client/app/pages/students/[id].vue | Student detail route | 215 tags: tabs/forms/tables/dialogs/cards | v-class CSS | P2 teacher route | Future cleanup | Largest remaining route; previous typecheck issue noted in summaries. |
| client/app/pages/student/assignments.vue | Student assignments route | 12 tags: icons | none | P2 student route | Future cleanup | Likely easy AppIcon swap after shared student cards. |
| client/app/pages/student/classes.vue | Student classes route | 23 tags: alert/icons/progress | none | P2 student route | Future cleanup | Needs progress/empty state primitive. |
| client/app/pages/student/documents.vue | Student documents route | 19 tags: alert/menu/list/buttons/icons | `lang=scss` | P2 student route | Future cleanup | Convert SCSS and menu/list actions. |
| client/app/pages/student/grades.vue | Student grades route | 10 tags: alert/icons | none | P2 student route | Future cleanup | Mostly icons/alerts. |
| client/app/pages/student/tests.vue | Student tests route | 19 tags: alert/progress/icons | none | P2 student route | Future cleanup | Needs progress and status display. |
| client/app/pages/verify-email.vue | Verify email route | 13 tags: avatar/button/icon/progress | none | P2 auth route | Phase 3 | Replace feedback and progress states. |
| client/app/styles/calendar/board.css | Calendar style file | `.v-*` selectors only | v-class CSS | P1 CSS coupling | Phase 3 | Remove after calendar board markup migration. |
| client/app/styles/dashboard/admin.css | Admin dashboard styles | `.v-*` selector only | v-class CSS | P3 deferred/admin | Future cleanup | Remove with admin dashboard migration. |
| client/app/styles/dashboard/teacher.css | Teacher dashboard styles | `.v-*` selectors only | v-class CSS | P1 teacher blocker | Phase 3 | Remove with dashboard markup migration. |
| client/app/styles/landing.css | Landing style file | `.v-*` selector only | v-class CSS | P3 deferred/marketing | Future cleanup | Remove after landing icon swap. |
| client/app/styles/login.css | Login style file | `.v-*` selectors only | v-class CSS | P1 auth blocker | Phase 3 | Replace with shared form styles. |
| client/app/styles/register/form-pane.css | Register form styles | `.v-*` selectors only | v-class CSS | P1 auth blocker | Phase 3 | Replace with shared form styles. |
| client/app/styles/register/page.css | Register page styles | `.v-*` selector only | v-class CSS | P1 auth blocker | Phase 3 | Remove after wrapper/icon migration. |
| client/app/styles/register/visual.css | Register visual styles | `.v-*` selector only | v-class CSS | P1 auth blocker | Phase 3 | Remove after image/avatar migration. |

## Phase 2 Shared UI Kit Needs

- Buttons, icon buttons, and AppIcon integration must cover `prepend-icon`, `append`, `icon`, loading, disabled, tonal/text/flat variants, block width, and route navigation.
- Form controls must cover text fields, textareas, selects, autocomplete, file input, checkbox, color picker, validation messages, density, labels, and clearable state.
- Data display primitives must cover cards, tables, lists/list-items, chips/badges, avatars/images, tabs/windows, timeline, progress bars/spinners, dividers, and empty states.
- Feedback primitives must cover alert, snackbar/toast, dialog/modal, confirmation actions, and loading skeletons.

## Phase 3 App Shell and Shared Blockers

- Auth wrappers and shared auth components still use `v-app`, forms, fields, avatar/image, and v-class CSS coupling.
- Calendar-first teacher flow still has Vuetify snippets in calendar board/header/detail/snackbar and teacher dashboard components.
- Shared dialogs (`SessionDialog`, `StudentDetailDialog`, `AssistantDetailDialog`) are high-risk because route pages depend on them.
- SCSS markers remain in loader/skeleton/student schedule/student dashboard/documents/classes/payments/reports/students/student documents. These are outside Plan 07 file scope and should be planned explicitly.

## Phase 4 Priority Pages

- `client/app/pages/assistants/index.vue`: priority list redesign; preserve search, pagination, create assistant, and detail-open behavior.
- `client/app/pages/assistants/[id].vue`: priority detail redesign; preserve salary config, assigned class, schedule, breakdown, and history behavior.
- `client/app/pages/audit-logs.vue`: priority audit log redesign; preserve filters, table/list, loading, empty, and pagination states.
- `client/app/pages/profile.vue`: priority profile redesign; preserve loading, edit/save, timezone, error, and success states.

## Deferred Lower-Traffic Pages

- Admin and center-adjacent pages should stay deferred until teacher/student flows are stable: `admin/health`, `admin/settings`, `admin/users/*`, and admin dashboard widgets.
- Marketing/landing icon-only usage can be handled opportunistically after shared AppIcon conventions are finalized.
- Large teacher/student routes such as classes, students, documents, payments, reports, and student pages need separate scoped migration plans because they combine forms, dialogs, tables, and existing type/style debt.

## Planning Gaps Found During Plan 07

- `client/app/pages/documents.vue` currently blocks `npm run typecheck` with a widened `targetType` union outside Plan 07 files.
- Full SCSS removal cannot be honestly claimed while the 10 SCSS-marker files listed above remain. This is a scope/planning gap for later phases because Plan 07 was instructed not to repair app source outside its explicit file list.
