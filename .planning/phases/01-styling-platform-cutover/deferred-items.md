# Phase 1 Deferred Items

## Plan 04 Dashboard Scan

- `client/app/components/dashboard/TeacherWorkspaceDashboard.vue` still uses Vuetify tags (`v-sheet`, `v-container`, `v-chip`, `v-icon`, `v-btn`, `v-row`, `v-col`, `v-card`, `v-avatar`, `v-list`, `v-list-item`, `v-card-title`, `v-card-text`). This is non-blocking for Plan 04 because the direct SCSS build path now imports plain CSS; route the component migration to Plan 07 inventory and later UI kit/shell work.
- `client/app/components/dashboard/AdminWorkspaceDashboard.vue` still uses Vuetify tags (`v-row`, `v-col`, `v-card`, `v-avatar`, `v-icon`, `v-chip`, `v-list`, `v-list-item`, `v-table`, `v-card-title`). This is non-blocking for Plan 04 because the direct SCSS build path now imports plain CSS; route the component migration to Plan 07 inventory and later UI kit/shell work.
- `client/app/styles/dashboard/teacher.css` and `client/app/styles/dashboard/admin.css` retain scoped `:deep(.v-*)` selectors to preserve visual parity while Vuetify markup remains. Remove these after the dashboard markup migrates away from Vuetify primitives.
