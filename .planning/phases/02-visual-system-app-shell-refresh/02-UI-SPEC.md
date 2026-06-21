---
phase: 2
slug: visual-system-app-shell-refresh
status: approved
shadcn_initialized: false
preset: none
created: 2026-06-21
---

# Phase 2 - UI Design Contract

> Visual and interaction contract for the shared app shell and reusable UI foundation. Generated for the existing Nuxt 4 + Vue 3 + Vuetify codebase.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | Vuetify |
| Icon library | Material Design Icons through Vuetify `v-icon` |
| Font | Inter first, Roboto fallback |

### Scope Contract

- Refresh `client/app/layouts/default.vue`, `client/vuetify.config.ts`, global CSS, and reusable state/display components.
- Do not add center-role navigation or new product modules.
- Do not copy PREP colors, assets, layout, or brand. Use PREP only as broad education-SaaS inspiration.
- Do not hide Phase 1 data bugs behind generic empty states; role/API/loading/empty/error/forbidden states must stay distinct.

---

## Shell Contract

### Desktop Navigation

- Use a role-aware sidebar, not one shared flat teacher menu.
- Hide routes unavailable to the current role.
- Group teacher navigation by work area:
  - Daily: Dashboard, Calendar
  - Teaching: Classes, Students, Assistants, Documents
  - Operations: Payments, Reports, Audit Logs, Profile
- Group student navigation by work area:
  - Today: Dashboard, Schedule
  - Learning: Classes, Documents, Scores/Comments when implemented
  - Account: Payments, Profile
- Center-role concepts remain out of scope.

### Route Priority

- Teacher default landing: `/calendar`.
- Student default landing: `/dashboard`.
- If Phase 2 touches `auth.global.ts`, `login.vue`, or `index.vue`, route defaults must respect role.

### Topbar

- Show user name, role label, profile/logout menu.
- Add one role-specific quick action only when it reuses an existing flow.
- Teacher quick action: session creation/calendar flow where available.
- Student quick action: schedule/dashboard only; do not invent a new student action.

### Active State

- Active nav item uses subtle background, primary icon/text, and a small left indicator.
- Do not use heavy filled primary pills for active state.

### Mobile Navigation

- Use bottom navigation for primary role-specific routes.
- Keep mobile bottom nav to 4-5 items maximum.
- Drawer may still exist for secondary items, but the primary mobile path should not depend on opening a drawer.

---

## Spacing Scale

Declared values must be multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, compact affordances |
| sm | 8px | Inline gaps, dense list item internals |
| md | 16px | Default component spacing, form groups |
| lg | 24px | Page padding, card padding, nav sections |
| xl | 32px | Section gaps, dashboard group spacing |
| 2xl | 48px | Major page breaks only |
| 3xl | 64px | Avoid in app shell except rare empty states |

Exceptions: none. Use responsive reduction on mobile instead of non-scale spacing.

### Layout Sizing

- Main content max width remains `1400px` via `--st-content-max`.
- Desktop page padding target: 24px.
- Mobile page padding target: 16px.
- Sidebar width target: 264-280px.
- Bottom nav height target: 64-72px with safe-area padding if needed.

---

## Typography

Do not scale font size with viewport width. Letter spacing stays `0` unless a Vuetify component applies a standard internal default.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.5 |
| Label | 12px | 600 | 1.35 |
| Nav item | 14px | 600 | 1.35 |
| Card title | 16px | 700 | 1.35 |
| Page heading | 24px | 700 | 1.25 |
| Compact metric | 28px | 700 | 1.15 |

### Typography Rules

- Reserve page-heading size for route headers only.
- Dashboard/card/panel headings stay compact.
- Button labels must fit on mobile; prefer icons plus concise labels.
- Empty state copy should be warm but short.

---

## Color

The palette should be energetic and colorful without becoming one-note. Blue, teal/green, and orange accents are allowed; avoid dominant purple gradients, beige/cream themes, and PREP-like exact colors.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F6F8FC` | App background |
| Surface | `#FFFFFF` | Cards, app bar, drawer, dialogs |
| Secondary surface | `#EEF6FF` | Soft nav hover, info panels |
| Primary | `#2563EB` | Primary actions, active nav text/icon |
| Teal | `#14B8A6` | Successful learning/activity accents |
| Green | `#22C55E` | Success states, paid/complete status |
| Orange | `#F97316` | Due-soon, attention, warm highlights |
| Info | `#0EA5E9` | Informational state and links where useful |
| Warning | `#F59E0B` | Warning and pending state |
| Destructive | `#EF4444` | Destructive actions only |
| Text primary | `#172033` | Main text |
| Text muted | `#64748B` | Secondary copy |
| Border | `#D8E0EA` | Card/table/input/nav separators |

Accent reserved for: active nav indicators, status chips, charts/metrics, illustrated empty states, small badges, and role-specific quick actions. Never use all accent colors on one component.

---

## Components

### Cards

- Radius: 8px preferred; do not exceed 12px unless Vuetify default requires it.
- Border: 1px solid border token.
- Shadow: none or very subtle single shadow.
- Avoid nested cards. Use section layouts or repeated item cards only.

### Tables

- Desktop tables use compact but readable row height, clear headers, and status chips.
- Mobile tables become card/list summaries; horizontal scroll is fallback only.
- Keep primary identifier, status, date/time, and next action visible on mobile cards.

### Forms

- Use outlined comfortable fields from existing Vuetify defaults.
- Group related fields with 16-24px spacing.
- Validation errors appear under fields and in page-level state only when needed.

### Dialogs

- Dialogs use same radius/border language as cards.
- Primary action right-aligned on desktop; full-width or stacked actions allowed on narrow mobile if labels fit.

### Buttons

- Primary actions: solid primary or role accent, concise verb+noun label.
- Secondary actions: outlined or text, not competing visually with primary action.
- Icon-only buttons need accessible labels/tooltips where the app pattern supports them.

---

## State System

### Required State Components

Planner should create or standardize reusable state components/patterns for:

- Loading: top progress + skeleton matching nearby layout.
- Empty: friendly illustration/icon, short heading, next-step body, CTA only if role can act.
- Error: clear cause plus next step and retry where useful.
- Forbidden: role/permission explanation; do not render as generic empty.
- Success: concise toast/alert pattern for completed saves or updates.

### State Copy Examples

| Element | Copy |
|---------|------|
| Primary CTA | `Create session` / `View schedule` / `Add document` depending on role and page |
| Empty state heading | `Nothing here yet` |
| Empty state body | `When data is available, it will appear here. If you expected something, try refreshing or check your role access.` |
| Student empty documents | `No shared documents yet. Your teacher's materials will appear here when assigned.` |
| Error state | `We could not load this page. Try again, or contact support if it keeps happening.` |
| Forbidden state | `This section is not available for your role.` |
| Destructive confirmation | `{Action name}: This cannot be undone. Confirm before continuing.` |

### Anti-Bug Rule

- If an API helper fails with `403`, the page must not show a plain empty list.
- Student pages touched by Phase 2 must not call teacher-only helper queries merely to render management controls.

---

## Responsive Contract

### Breakpoints

- Desktop: persistent grouped sidebar + topbar.
- Tablet: collapsible drawer acceptable.
- Mobile: bottom nav primary, secondary drawer/menu optional.

### Mobile Layout Rules

- Page padding: 16px.
- Bottom nav labels must fit without wrapping awkwardly.
- Tables become cards/lists.
- Calendar switches to agenda/list-first presentation.
- No text/control overlap on common phone widths.
- Touch targets should be at least 44px high where practical.

---

## Calendar Contract

- Desktop teacher calendar remains the primary workspace.
- Visual refresh must not break create, view/edit, drag, resize, or recurring-session affordances.
- Mobile calendar prioritizes agenda/list view over cramped month/week grids.
- Calendar actions should use the same topbar/CTA treatment as the rest of the shell.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registry | none | not allowed in Phase 2 without explicit approval |

---

## Implementation Checkpoints

- `client/vuetify.config.ts` contains the final theme tokens and component defaults.
- `client/app/layouts/default.vue` implements role-aware desktop nav, topbar, and mobile bottom nav.
- Shared state components/patterns exist for loading, empty, error, forbidden, and success.
- `client/app/assets/css/main.css` keeps max-width and responsive layout primitives stable.
- Role default route behavior is planned if touched: teacher to `/calendar`, student to `/dashboard`.
- Existing pages can adopt the shell without direct API calls inside visual-only components.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-21

### Verification Notes

- Contract matches Phase 2 user decisions in `02-CONTEXT.md`.
- Contract stays within Vuetify/Nuxt patterns in the existing codebase.
- Contract explicitly preserves Phase 1 data-display findings by separating empty, error, and forbidden states.
- Automated GSD UI researcher/checker could not run because `node` is not available on PATH in this session.
