# Phase 3 Validation Strategy

**Phase:** App Shell & Shared Surface Migration  
**Created:** 2026-06-30  
**Purpose:** Nyquist validation artifact for APP-01 through APP-05 before Phase 3 execution.

## Validation Architecture

Phase 3 has no frontend unit, component, or browser test runner in the current repo. Validation therefore uses reproducible static scans, existing frontend gates, and required visual/manual QA evidence. This is intentional for Phase 3; adding a frontend test runner is FUTURE-02 and outside this migration phase unless the user expands scope.

| Layer | Required Evidence | Why |
|-------|-------------------|-----|
| Static marker scans | `rg` scans over touched Phase 3 targets and broader `client/app` scope | Proves Vuetify/SCSS/style-coupling removal or exact deferral inventory. |
| Frontend gates | `npm.cmd --prefix client run lint`, `typecheck`, `build` | Proves migrated Vue/Nuxt code compiles and follows repo checks. |
| UI-kit boundary scan | `rg` over `client/app/components/ui` for API/auth/composable/fetch imports | Proves Ui* primitives remain data-agnostic. |
| Visual QA matrix | Desktop and mobile-width notes or screenshots for touched surfaces | Proves APP-05 parity criteria that static checks cannot verify. |
| Source coverage audit | GOAL, APP-01..APP-05, research recommendations, D-01..D-15 | Proves no source requirement or locked decision was silently missed. |

## Requirement Validation Map

| Requirement | Must Prove | Automated Evidence | Human/Visual Evidence |
|-------------|------------|--------------------|-----------------------|
| APP-01 | Shared app layouts/auth shell no longer use Vuetify shell primitives and role-aware navigation remains present. | Target scan for `v-app`, `v-main`, `v-navigation-drawer`, `v-app-bar`, `v-list`, `<style>`, `lang="scss"`, `.scss`, `:deep(.v-)`; lint/typecheck. | Teacher, student, assistant shell branches at desktop/mobile; admin only if shared shell change affects it. |
| APP-02 | Reusable dialogs and high-traffic shared surfaces use Tailwind/Ui* rather than Vuetify primitives in migrated scope. | Target scans over calendar, dashboards, student schedule, SessionDialog, AssistantDetailDialog, StudentDetailDialog; UI-kit boundary scan. | Calendar, SessionDialog, dashboards, schedule, migrated shared dialog areas. |
| APP-03 | Remaining old UI usages are documented with exact scope classification. | Final inventory verification must fail unless target-scope scan results exist, exact file/line refs or explicit `none` exist, and Phase 4/admin/center/bounded-dialog classifications exist. | Executor summary confirms no implementation expanded into deferred Phase 4/admin/center areas. |
| APP-04 | Teacher calendar remains accessible and visually consistent after shell/shared migration. | Lint/typecheck/build plus marker scans for teacher calendar files and SessionDialog. | Teacher calendar loading, populated month/week, create from cell, edit/open, drag/drop feedback, success/error toast. |
| APP-05 | Migrated surfaces preserve visual parity: no overflow, overlap, clipped controls, unreadable text, missing states, or responsive regressions. | Build plus verification-doc audit requiring all QA matrix section labels. | Desktop and mobile-width evidence for shell, auth, calendar, SessionDialog, dashboards, schedule, and migrated dialogs. |

## Static Scan Commands

Run from repo root. Use `$lt=[char]60` so the shell does not parse literal tag text.

```powershell
$lt=[char]60
rg -n "(($lt)/?v-[a-z]|($lt)style|lang=`"scss`"|\.scss|:deep\(\.v-)" client/app/layouts/default.vue client/app/layouts/auth.vue client/app/components/AuthShell.vue client/app/components/login/LoginFormPane.vue client/app/components/login/LoginVisual.vue client/app/components/register/RegisterFormPane.vue client/app/components/register/RegisterVisual.vue client/app/pages/forgot-password.vue client/app/pages/reset-password.vue client/app/pages/verify-email.vue client/app/components/calendar/TeacherCalendar.vue client/app/components/calendar/TeacherCalendarBoard.vue client/app/components/calendar/TeacherCalendarHeader.vue client/app/components/calendar/TeacherSessionDetail.vue client/app/components/calendar/StudentCalendar.vue client/app/components/dashboard/TeacherWorkspaceDashboard.vue client/app/components/dashboard/StudentWorkspaceDashboard.vue client/app/components/StudentSchedule.vue client/app/components/SessionDialog.vue client/app/components/StudentDetailDialog.vue client/app/components/AssistantDetailDialog.vue
rg -n "(($lt)/?v-[a-z]|($lt)style|lang=`"scss`"|\.scss|:deep\(\.v-)" client/app
rg -n "(useApi|useAuthStore|useSessions|useStudents|useAssistants|useAuditLogs|useClasses|fetch\(|\$fetch)" client/app/components/ui
```

Target-scope scan results must be recorded in `03-MIGRATION-INVENTORY.md` under `Target-Scope Scan Results`. Remaining markers must be either:

- `none`, explicitly written for the target scope, or
- exact `client/app/...:<line>` references classified as `Phase 4 page scope`, `admin/center out of scope`, `bounded dialog remainder`, or another D-01/D-03/D-06-backed classification.

## Frontend Gates

Use the nvm npm path if npm is missing from default PATH:

```powershell
$env:Path = "$env:LOCALAPPDATA\nvm\v24.11.1;$env:Path"
npm.cmd --prefix client run lint
npm.cmd --prefix client run typecheck
npm.cmd --prefix client run build
```

Backend gates are not required unless backend files are touched. If any backend file changes, run `npm run lint`, `npm run build`, and `npm test` from `server/`, then explain why backend scope was necessary.

## Visual QA Matrix

`03-VERIFICATION.md` must include a QA matrix with these exact section labels:

- Shell
- Auth
- Calendar
- SessionDialog
- Dashboards
- Schedule
- Dialogs

Each section must include desktop and mobile-width evidence. Evidence can be screenshot paths or manual visual notes. Required coverage:

- Shell: teacher, student, assistant branches; admin only if shared shell changes affect it.
- Auth: login, register, forgot password, reset password, verify email.
- Calendar: loading, populated month/week, create from cell, edit/open, drag/drop feedback, success/error toast.
- SessionDialog: create single, create recurring, edit, delete confirmation, mark completed/reopen.
- Dashboards: teacher present/empty; student loading/populated.
- Schedule: student schedule loading/populated/empty.
- Dialogs: migrated AssistantDetailDialog and StudentDetailDialog areas or exact deferred remainder.

## Source Hygiene Record

`client/app/components/calendar/TeacherCalendar.vue` was already modified before planner revision docs were written. The observed dirty state was three added imports for `TeacherCalendarBoard`, `TeacherCalendarHeader`, and `TeacherSessionDetail`.

Execution agents must treat that diff as user-owned pre-existing work: inspect it before editing, preserve it if compatible, work with it when implementing Plan 03-02, and do not revert it unless the user explicitly requests a revert.

## Nyquist Gate

Phase 3 is validation-ready only when:

- `03-VALIDATION.md` exists.
- Every plan has automated verification.
- `03-07-PLAN.md` contains failing checks for inventory completeness and verification coverage.
- `03-MIGRATION-INVENTORY.md` cannot pass with empty target-scope results.
- `03-VERIFICATION.md` cannot pass without every APP-01..APP-05 and D-01..D-15 ID plus required QA matrix labels.
