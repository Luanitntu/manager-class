# Phase 2 Research: Visual System & App Shell Refresh

**Phase:** 02-visual-system-app-shell-refresh
**Created:** 2026-06-21
**Status:** Complete - inline research because `node` is unavailable on PATH, so GSD researcher agents could not run.

## Scope

Phase 2 should establish a shared frontend visual system and role-aware shell for teacher/student workflows. It should not fix all data-display bugs or add new product modules. Later phases own teacher workflow fixes, student portal fixes, and final QA.

## Existing Frontend Baseline

- `client/app/layouts/default.vue` owns the shared app shell. It currently has one flat teacher-oriented navigation array and a simple account menu.
- `client/vuetify.config.ts` centralizes Vuetify theme colors and component defaults. This is the correct integration point for palette, radius, card, button, and input defaults.
- `client/app/assets/css/main.css` already defines `--st-content-max: 1400px` and `.st-content`, matching the UI-SPEC desktop width direction.
- `client/app/stores/auth.ts` exposes `role` and `user`, enough for role-aware nav, topbar role label, and quick actions.
- `client/app/middleware/auth.global.ts` currently sends authenticated users from login/register to `/calendar`, which matches teachers but not students.
- `client/app/pages/dashboard.vue` already branches dashboard stats by role and can validate new visual/state primitives without adding new backend scope.
- `client/app/pages/calendar.vue` uses FullCalendar and already gates editing to teachers. It needs styling/responsive handling without breaking create/edit/drag/resize.

## Recommended Architecture

### Visual Foundation

- Keep Vuetify as the design system foundation. Do not introduce shadcn, Radix, Tailwind, or third-party UI registries.
- Put durable tokens in `client/vuetify.config.ts` and CSS custom properties in `client/app/assets/css/main.css`.
- Add small reusable display/state components under `client/app/components/`, keeping them visual-only and API-free.

### Shell

- Convert navigation from a flat array in `default.vue` to role-aware grouped config. This can live inside the layout or a small helper file if it keeps the layout readable.
- Hide unavailable items by role. Do not render disabled student-inapplicable teacher/admin items.
- Add mobile bottom navigation for the role's primary routes and keep secondary items in drawer/menu.
- Add topbar role identity and a safe quick action. Quick actions should navigate/open existing flows, not introduce new backend behavior.

### Routing

- Teacher default route remains `/calendar`.
- Student default route should become `/dashboard`.
- If `login.vue`, `index.vue`, or `auth.global.ts` are touched, use the auth store role to resolve default route in one place if practical.

### States

- Create reusable loading/empty/error/forbidden/success patterns.
- Empty state must not mask `403` or failed helper API calls as no-data.
- Student shared pages must not call teacher-only helper queries merely for hidden management controls. If a touched page cannot be fixed safely in Phase 2, document it and defer to Phase 4.

### Responsive

- Preserve the `1400px` content max width.
- Use bottom nav for mobile primary navigation.
- Convert tables to mobile card/list summaries where touched.
- Calendar mobile should prefer agenda/list readability while desktop keeps calendar-first layout.

## Risks

- Role-aware navigation may expose current route gaps, especially missing student scores/comments route. Do not invent a full new route in Phase 2.
- Changing auth redirect behavior affects login and index flows. Keep the helper simple and verify teacher/student expected defaults.
- Calendar CSS can be brittle because FullCalendar injects its own classes. Keep overrides scoped and test create/edit/drag/resize manually when runtime is available.
- Node/npm are unavailable in this session, so lint/typecheck/build cannot currently be run here.

## Verification Strategy

- Static verification: inspect changed files for role-aware route config, no teacher-only student queries introduced, and UI-SPEC token compliance.
- Runtime verification when Node/npm are available: from `client/`, run `npm run lint`, `npm run typecheck`, and `npm run build`.
- Manual smoke when app can run: teacher login lands on calendar; student login lands on dashboard; desktop sidebar is grouped and role-aware; mobile bottom nav is visible and usable; loading/empty/error/forbidden states are visually distinct.

## Research Result

Proceed with three execution plans:

1. Theme and reusable state/display foundation.
2. Role-aware app shell, navigation, topbar, mobile bottom nav, and default route helper.
3. Page adoption and responsive polish on dashboard/calendar/shared placeholder surfaces.
