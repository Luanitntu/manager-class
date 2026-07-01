---
phase: 05-verification-cleanup
artifact: cleanup
plan: 01
status: complete
created: 2026-07-01
requirements: [VER-06]
---

# Phase 05 Cleanup Classification

Plan 01 classifies cleanup candidates only. It does not edit app source files and does not remove files.

Backend checks not run; no backend files changed.

## Proof Commands

| Purpose | Command | Exit code | Result |
| --- | --- | ---: | --- |
| Phase 5 cleanup candidate references | `rg -n "styles/calendar/board\|styles/dashboard/teacher\|styles/register/(form-pane\|page\|visual)\|AppInitialLoader\|TeacherDashboard\|LandingFeatures\|LandingFooter\|LandingHeader\|LandingHero\|LandingShowcase\|LandingTopbar\|maintenance" client/app client/nuxt.config.ts` | 0 | Matches are listed below and used for classification. |
| Legacy dashboard and stale style import proof | `rg -n 'TeacherDashboard\.vue\|<TeacherDashboard\|components/TeacherDashboard\|styles/calendar/board\|styles/dashboard/teacher\|styles/register/(form-pane\|page\|visual)' client/app client/nuxt.config.ts` | 1 | No matches; legacy `TeacherDashboard.vue` and listed stale styles are not imported/referenced. |
| Active loader proof | `rg -n "AppInitialLoader" client/app client/nuxt.config.ts` | 0 | `client/app/app.vue:36` references `AppInitialLoader`. |

Reference command stdout summary:

```text
client/app/middleware/auth.global.ts:8:  '/maintenance',
client/app/middleware/auth.global.ts:11:// Routes still reachable while maintenance is ON (so an admin can sign in).
client/app/middleware/auth.global.ts:14:  '/maintenance',
client/app/middleware/auth.global.ts:27:    const maintenance = useState<boolean | null>('maintenanceMode', () => null);
client/app/middleware/auth.global.ts:28:    if (maintenance.value === null) {
client/app/middleware/auth.global.ts:30:        const res = await $fetch<{ data: { maintenanceMode?: boolean } }>('/settings', {
client/app/middleware/auth.global.ts:33:        maintenance.value = !!res.data?.maintenanceMode;
client/app/middleware/auth.global.ts:35:        maintenance.value = false;
client/app/middleware/auth.global.ts:38:    if (maintenance.value && !MAINTENANCE_ALLOWED.includes(to.path)) {
client/app/middleware/auth.global.ts:39:      return navigateTo('/maintenance');
client/app/middleware/auth.global.ts:41:    if (!maintenance.value && to.path === '/maintenance') {
client/app/app.vue:36:  <AppInitialLoader v-if="showInitialLoader" />
client/app/composables/useAdmin.ts:123:  maintenanceMode?: boolean;
client/app/pages/dashboard.vue:11:const isTeacherDashboard = computed(
client/app/pages/dashboard.vue:26:    v-else-if="isTeacherDashboard"
client/app/pages/index.vue:2:import LandingFeatures from '../components/landing/LandingFeatures.vue';
client/app/pages/index.vue:4:import LandingFooter from '../components/landing/LandingFooter.vue';
client/app/pages/index.vue:5:import LandingHeader from '../components/landing/LandingHeader.vue';
client/app/pages/index.vue:6:import LandingHero from '../components/landing/LandingHero.vue';
client/app/pages/index.vue:7:import LandingShowcase from '../components/landing/LandingShowcase.vue';
client/app/pages/index.vue:9:import LandingTopbar from '../components/landing/LandingTopbar.vue';
client/app/pages/index.vue:18:      <LandingTopbar />
client/app/pages/index.vue:19:      <LandingHeader />
client/app/pages/index.vue:20:      <LandingHero />
client/app/pages/index.vue:22:      <LandingFeatures />
client/app/pages/index.vue:23:      <LandingShowcase />
client/app/pages/index.vue:25:      <LandingFooter />
client/app/pages/admin/settings.vue:37:  maintenanceMode: false,
client/app/pages/admin/settings.vue:74:    form.maintenanceMode = s.maintenanceMode ?? false;
client/app/pages/admin/settings.vue:191:            v-model="form.maintenanceMode"
client/app/pages/admin/settings.vue:193:            :label="`Chế độ bảo trì${form.maintenanceMode ? ' (đang BẬT)' : ''}`"
```

## Candidate Classification

| Candidate | Classification | Proof | Decision |
| --- | --- | --- | --- |
| `AppInitialLoader` | retained with reason | `client/app/app.vue:36` references the loader. | Active bootstrap behavior; do not remove in Plan 01. |
| `TeacherDashboard` | safe-to-remove | `dashboard.vue` imports `TeacherWorkspaceDashboard`; no `<TeacherDashboard`, `TeacherDashboard.vue`, or `components/TeacherDashboard` references. | Safe removal candidate for a later cleanup commit; not removed because Plan 01 does not edit app source. |
| `landing` components | retained with reason | `client/app/pages/index.vue` imports and renders `LandingFeatures`, `LandingFooter`, `LandingHeader`, `LandingHero`, `LandingShowcase`, `LandingTopbar`. | Active public landing route; outside teacher/student smoke target; no redesign in Plan 01. |
| `maintenance` route | retained with reason | `auth.global.ts` redirects to `/maintenance`; admin settings and `useAdmin.ts` manage `maintenanceMode`. | Active utility route; outside teacher/student smoke target; no redesign in Plan 01. |
| `styles/calendar/board` | safe-to-remove | No `styles/calendar/board` references in `client/app` or `client/nuxt.config.ts`. | Stale style cleanup candidate; not removed in Plan 01. |
| `styles/dashboard/teacher` | safe-to-remove | No `styles/dashboard/teacher` references in `client/app` or `client/nuxt.config.ts`. | Stale style cleanup candidate; not removed in Plan 01. |
| `styles/register` | safe-to-remove | No `styles/register/form-pane`, `styles/register/page`, or `styles/register/visual` references in `client/app` or `client/nuxt.config.ts`. | Stale style cleanup candidate; not removed in Plan 01. |
| Admin pages and admin dashboard | deferred admin/center/general old UI outside v1.1 | Broad scan lists `admin/health`, `admin/settings`, `admin/users`, and `AdminWorkspaceDashboard`. | Deferred per Phase 5 UI-SPEC; no admin/center redesign in Plan 01. |
| General teacher/student pages | deferred admin/center/general old UI outside v1.1 | Broad scan lists classes, students, documents, payments, reports, and student low-priority routes. | Deferred to future full-product UI polish unless a later smoke check finds a v1.1 blocker. |

## Touched/Removed Files

| Path | Action |
| --- | --- |
| `.planning/phases/05-verification-cleanup/05-STATIC-SCANS.md` | Created evidence artifact. |
| `.planning/phases/05-verification-cleanup/05-CLEANUP.md` | Created cleanup classification artifact. |

No app source, admin, center, general UI, or backend files were edited or removed in Plan 01.

## VER-06 Decision

No `server/` files changed. Backend verification is not required for this plan.
