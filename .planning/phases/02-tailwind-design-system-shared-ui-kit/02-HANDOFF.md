# Phase 02 Handoff: Tailwind Design System & Shared UI Kit

## Status

Phase 2 created a local Tailwind-only Vue UI kit under `client/app/components/ui`, migrated four low-risk proof surfaces, and kept broad page/dialog rewrites deferred to Phase 3/4.

## Component Inventory

| Group | Components | Plans |
| --- | --- | --- |
| Layout | `UiPage`, `UiPageHeader`, `UiToolbar`, `UiSection`, `UiCard` | 02-01 |
| Controls | `UiButton`, `UiIconButton`, `UiSpinner`, `UiInput`, `UiTextarea`, `UiSelect`, `UiCheckbox`, `UiSegmentedControl`, `UiActionGroup` | 02-02 |
| Data display | `UiTable`, `UiList`, `UiListItem`, `UiBadge`, `UiAvatar`, `UiMetricCard`, `UiStatusDot`, `UiPagination` | 02-03, 02-04 |
| Feedback | `UiAlert`, `UiToast`, `UiSkeleton`, `UiEmptyState`, `UiProgress` | 02-05 |
| Overlay | `UiDialog`, `UiConfirmDialog`, `UiTabs` | 02-05 |
| Proof wrappers | `AppSkeleton`, `TablePager`, `AppToast`, `ClassLocation` | 02-04, 02-06 |

## Proof Surface Status

| Surface | Status | Public behavior preserved |
| --- | --- | --- |
| `AppSkeleton` | Migrated to `UiSkeleton` | `variant`, `rows`, `columns`, `cards`; all legacy variants |
| `TablePager` | Wrapper over `UiPagination` | `meta`, `v-model:page`, `v-model:limit`, range math, size options |
| `AppToast` | Stack using `UiToast` | `useToast`, dismiss, roles, `aria-live`, `TransitionGroup`, desktop/mobile placement |
| `ClassLocation` | `UiBadge` + `AppIcon` | inline/default modes, provider labels, offline labels, meeting links, `noopener`, click stop |

## Phase 3 Adoption Notes

- Use `UiPage`, `UiPageHeader`, `UiToolbar`, `UiCard`, `UiList`, `UiButton`, `UiIconButton`, `UiAlert`, `UiToast`, and `UiDialog` for app shell/shared-surface replacement.
- Keep calendar-first teacher navigation visible in shell work.
- High-risk consumers remain page/workflow-owned: `SessionDialog`, `StudentDetailDialog`, `AssistantDetailDialog`.
- UI kit components must stay data-agnostic; feature composables remain in pages/dialogs.

## Phase 4 Adoption Notes

- `/assistants`: use `UiPage`, `UiPageHeader`, `UiToolbar`, `UiInput`, `UiList`, `UiListItem`, `UiAvatar`, `UiBadge`, `UiPagination`, `UiDialog`.
- `/assistants/[id]`: use `UiCard`, `UiMetricCard`, `UiTable`, `UiBadge`, `UiTabs`, `UiDialog`, `UiInput`, `UiSelect`.
- `/audit-logs`: use `UiToolbar`, `UiSelect`, `UiInput`, `UiButton`, `UiTable`, `UiBadge`, `UiPagination`, `UiEmptyState`.
- `/profile`: use `UiCard`, `UiAlert`, `UiInput`, `UiSelect`, `UiBadge`, `UiButton`, `UiSkeleton`.

## Boundaries

- No backend changes.
- No dependency installs.
- No third-party UI registries.
- No broad page rewrites in Phase 2.
- `SessionDialog`, `StudentDetailDialog`, `AssistantDetailDialog`, `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` are consumers of the kit, not Phase 2 rewrites.

## Static Scan Commands

```powershell
$lt=[char]60; $bad = rg -n "(($lt)style|($lt)v-|($lt)/v-|lang=[`"']scss[`"']|\.scss|@use|@forward)" client/app/components/ui client/app/components/AppSkeleton.vue client/app/components/AppToast.vue client/app/components/ClassLocation.vue client/app/components/TablePager.vue; if ($bad) { $bad; exit 1 }
$bad = rg -n '(useApi|useAuthStore|useSessions|useStudents|useAssistants|useAuditLogs|useClasses|fetch\(|\$fetch)' client/app/components/ui; if ($bad) { $bad; exit 1 }
npm.cmd --prefix client run lint
npm.cmd --prefix client run typecheck
npm.cmd --prefix client run build
```

## Coverage Audit

| Source item | Status | Evidence |
| --- | --- | --- |
| GOAL | COVERED | Plans 02-01 through 02-07 create shared Tailwind UI components for consistent pages. |
| UIKIT-00 | COVERED | `README.md` documents tokens, names, variants, migration map. |
| UIKIT-01 | COVERED | `UiPage`, `UiPageHeader`, `UiToolbar`, `UiSection`, `UiCard`. |
| UIKIT-02 | COVERED | Controls and native form primitives in Plan 02. |
| UIKIT-03 | COVERED | Data display primitives and `UiPagination` in Plans 03/04. |
| UIKIT-04 | COVERED | Feedback, skeleton, empty, progress, dialog, confirm, tabs in Plan 05. |
| UIKIT-05 | COVERED | `AppSkeleton`, `TablePager`, `AppToast`, `ClassLocation` proof migrations. |
| RESEARCH proof migration guidance | COVERED | Proof candidates migrated; high-risk dialogs deferred. |
| D-01 | COVERED | Components use `--st-*` token classes. |
| D-02 | COVERED | No SCSS/scoped/component CSS in new kit or proof files. |
| D-03 | COVERED | No new global helper CSS. |
| D-04 | COVERED | Repeated patterns became `Ui*` components. |
| D-05 | COVERED | Proof wrappers preserve public props/behavior. |
| D-06 | COVERED | Automated gates run; browser visual QA remains Phase 5 responsibility. |
| D-07 | COVERED | High-risk surfaces deferred instead of widened. |
| D-08 | COVERED | Kit covers Phase 3/4 priority needs. |
| D-09 | COVERED | Layout, controls, data display, feedback, overlay groups exist. |
| D-10 | COVERED | Implementation followed foundation -> controls/data -> feedback/proof order. |
| D-11 | COVERED | Design-system components use `Ui*`. |
| D-12 | COVERED | `App*` remains app infrastructure. |
| D-13 | COVERED | Slot-first, small prop surfaces. |
| D-14 | COVERED | Form controls are UI-only. |
| D-15 | COVERED | Data display remains slot-first, no data-table engine. |
| D-16 | COVERED | Docs, components, and small proof migrations delivered. |
| D-17 | COVERED | Good proof candidates migrated. |
| D-18 | COVERED | High-risk dialog workflows not migrated. |
| D-19 | COVERED | Remaining old UI debt deferred to later phases. |
| D-20 | COVERED | Downstream docs in `README.md` and this handoff. |
| D-21 | COVERED | Old-pattern to new-primitive map in `README.md`. |

## Verification Notes

- Frontend `lint`, `typecheck`, and `build` are the Phase 2 gates.
- Backend checks are not required because no backend files changed.
- Existing lint warnings in untouched `SessionDialog.vue` and `audit-logs.vue` remain non-blocking because ESLint exits 0.
