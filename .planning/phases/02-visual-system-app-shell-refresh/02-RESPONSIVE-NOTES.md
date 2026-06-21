# Phase 2 Responsive Notes

**Created:** 2026-06-21
**Status:** Static checks complete; runtime/browser verification blocked until Node/npm are available on PATH.

## Checked Surfaces

### Desktop Shell

- `client/app/layouts/default.vue` now uses a grouped desktop sidebar.
- Navigation is role-aware through `client/app/utils/navigation.ts`.
- Teacher/student center-role pollution is avoided; center navigation is not introduced.

### Mobile Bottom Nav

- `default.vue` includes a Vuetify `v-bottom-navigation` for mobile primary routes.
- `main.css` includes `--st-bottom-nav-height` and safe-area-aware bottom padding.
- Each role's mobile list is capped by `getMobileNavigation(...).slice(0, 5)`.

### Dashboard

- `dashboard.vue` uses `AppPageHeader` and `AppState`.
- Loading, error, no-card empty, and no-upcoming-session empty states are distinct.
- Cards remain responsive via existing Vuetify grid columns.

### Calendar

- `calendar.vue` uses `AppPageHeader` and `AppState`.
- Desktop keeps FullCalendar as the primary workspace.
- Mobile uses `timeGridDay` instead of cramped month view and adds a readable agenda card below the calendar when sessions exist.
- Existing `SessionDialog`, select, event click, drag, and resize code paths remain present.

### Deferred/Placeholder Pages

- `PlaceholderPage.vue` now uses the shared header/state treatment.

## Runtime Checks Still Needed

Run from `client/` once Node/npm are available:

```bash
npm run lint
npm run typecheck
npm run build
```

Manual browser checks once the app can run:

- Teacher login redirects to `/calendar`.
- Student login redirects to `/dashboard`.
- Desktop teacher sidebar shows grouped Daily, Teaching, and Operations sections.
- Student sidebar hides Students, Assistants, Reports, and Audit Logs.
- Mobile viewport shows bottom nav and content is not hidden behind it.
- Calendar desktop create/view/edit/drag/resize still works.
- Calendar mobile view is readable and agenda items open existing session details.

## Follow-Up Risks

- Phase 3 should verify teacher document/payment/report pages after visual adoption.
- Phase 4 should fix student documents/payments helper queries before deeper student page polish.
- Phase 5 should perform full desktop and mobile smoke testing with seeded teacher/student data.
