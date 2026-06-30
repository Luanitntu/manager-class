# Phase 1 Deferred Items

## Plan 04 Dashboard Scan

- `client/app/components/dashboard/TeacherWorkspaceDashboard.vue` still uses Vuetify tags (`v-sheet`, `v-container`, `v-chip`, `v-icon`, `v-btn`, `v-row`, `v-col`, `v-card`, `v-avatar`, `v-list`, `v-list-item`, `v-card-title`, `v-card-text`). This is non-blocking for Plan 04 because the direct SCSS build path now imports plain CSS; route the component migration to Plan 07 inventory and later UI kit/shell work.
- `client/app/components/dashboard/AdminWorkspaceDashboard.vue` still uses Vuetify tags (`v-row`, `v-col`, `v-card`, `v-avatar`, `v-icon`, `v-chip`, `v-list`, `v-list-item`, `v-table`, `v-card-title`). This is non-blocking for Plan 04 because the direct SCSS build path now imports plain CSS; route the component migration to Plan 07 inventory and later UI kit/shell work.
- `client/app/styles/dashboard/teacher.css` and `client/app/styles/dashboard/admin.css` retain scoped `:deep(.v-*)` selectors to preserve visual parity while Vuetify markup remains. Remove these after the dashboard markup migrates away from Vuetify primitives.

## Plan 05 Calendar Scan

- `client/app/components/calendar/TeacherCalendarBoard.vue` still uses Vuetify tags (`v-card`, `v-card-title`, `v-btn`, `v-btn-toggle`). This is non-blocking for Plan 05 because direct calendar SCSS build entries now import plain CSS; route component migration to Plan 07 inventory and later shell/UI kit work.
- `client/app/components/calendar/TeacherCalendarHeader.vue` still uses Vuetify tags (`v-btn`). This is non-blocking for Plan 05 and should be inventoried for the planned Vuetify removal sweep.
- `client/app/components/calendar/TeacherSessionDetail.vue` still uses Vuetify tags (`v-sheet`, `v-spacer`, `v-btn`, `v-icon`). This is non-blocking for Plan 05 and should be inventoried for the planned Vuetify removal sweep.
- `client/app/components/calendar/TeacherCalendar.vue` and `client/app/components/calendar/StudentCalendar.vue` still use `v-snackbar`. This is non-blocking for Plan 05 and should be handled by Plan 06/07 shared surface migration or inventory.
- `client/app/styles/calendar/board.css` retains scoped `:deep(.v-*)` selectors to preserve current calendar visual parity while Vuetify markup remains. Remove these after calendar controls migrate away from Vuetify primitives.
