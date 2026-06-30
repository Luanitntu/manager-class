# Phase 2 Validation Architecture

**Phase:** Tailwind Design System & Shared UI Kit  
**Created:** 2026-06-30  
**Source:** `02-RESEARCH.md` Validation Architecture, `02-UI-SPEC.md`, `02-CONTEXT.md`, `.planning/REQUIREMENTS.md`

## Purpose

This artifact defines the executable verification contract for Phase 2 implementation and verification agents. Phase 2 is a frontend UI foundation phase: validation proves that the Tailwind-only shared UI kit exists, remains data-agnostic, preserves small proof-surface behavior, and leaves downstream phases with usable documentation and handoff evidence.

## Requirement-to-Test Map

| Requirement | Required proof | Test type | Commands / checks | Pass threshold |
|-------------|----------------|-----------|-------------------|----------------|
| UIKIT-00 | `client/app/components/ui/README.md` documents token rules, Tailwind-only rules, `Ui*` naming, slot-first APIs, variants, and old-to-new migration map. | Static docs scan | `Test-Path client/app/components/ui/README.md`; `rg -n "UIKIT-00|--st-|UiButton|UiDialog|TablePager|ClassLocation|D-21" client/app/components/ui/README.md` | README exists and all required terms are present. |
| UIKIT-01 | Layout primitives exist for page containers, page headers, toolbars, sections, and cards. | Static scan + typecheck | `Test-Path client/app/components/ui/UiPage.vue`; `Test-Path client/app/components/ui/UiPageHeader.vue`; `Test-Path client/app/components/ui/UiToolbar.vue`; `Test-Path client/app/components/ui/UiSection.vue`; `Test-Path client/app/components/ui/UiCard.vue`; `npm.cmd --prefix client run typecheck` | All files exist, typecheck passes, no forbidden markers in created files. |
| UIKIT-02 | Control/form primitives exist for buttons, icon buttons, spinner, inputs, textarea, select, checkbox, segmented control, and action group. | Static scan + lint/typecheck | `Test-Path` each expected `Ui*.vue`; `npm.cmd --prefix client run lint`; `npm.cmd --prefix client run typecheck` | Files exist, lint/typecheck pass, controls expose external state without feature data fetching. |
| UIKIT-03 | Data display primitives exist for table/list, pagination, badges/chips, avatar, metric card, and status dot. | Static scan + typecheck | `Test-Path client/app/components/ui/UiTable.vue`; `Test-Path client/app/components/ui/UiPagination.vue`; `Test-Path client/app/components/ui/UiBadge.vue`; `Test-Path client/app/components/ui/UiAvatar.vue`; `Test-Path client/app/components/ui/UiMetricCard.vue`; `Test-Path client/app/components/ui/UiStatusDot.vue`; `npm.cmd --prefix client run typecheck` | Files exist, typecheck passes, `UiPagination` preserves TablePager page/range semantics. |
| UIKIT-04 | Feedback and overlay primitives exist for alert, toast, skeleton, empty state, progress/spinner, dialog, and confirm dialog. | Static scan + visual/manual proof checks | `Test-Path client/app/components/ui/UiAlert.vue`; `Test-Path client/app/components/ui/UiToast.vue`; `Test-Path client/app/components/ui/UiSkeleton.vue`; `Test-Path client/app/components/ui/UiEmptyState.vue`; `Test-Path client/app/components/ui/UiDialog.vue`; `Test-Path client/app/components/ui/UiConfirmDialog.vue` | Files exist, typecheck passes, dialog foundation has documented minimal focus management. |
| UIKIT-05 | Practical duplicated surfaces use shared primitives without behavior change. | Static scan + lint/typecheck + visual QA | Scan `AppSkeleton.vue`, `TablePager.vue`, `AppToast.vue`, and `ClassLocation.vue`; run frontend gates; record desktop/mobile QA in summaries. | Proof surfaces are Tailwind-only, preserve public props/roles/link behavior, and pass visual QA. |

## Static Scan Strategy

Run static scans from the repository root after each relevant plan and at the phase gate.

### Forbidden Styling and Vuetify Markers

Scope:

- `client/app/components/ui`
- `client/app/components/AppSkeleton.vue`
- `client/app/components/AppToast.vue`
- `client/app/components/ClassLocation.vue`
- `client/app/components/TablePager.vue`

Command:

```powershell
$lt=[char]60
$bad = rg -n "(($lt)style|($lt)v-|($lt)/v-|lang=[`"']scss[`"']|\.scss|@use|@forward)" client/app/components/ui client/app/components/AppSkeleton.vue client/app/components/AppToast.vue client/app/components/ClassLocation.vue client/app/components/TablePager.vue
if ($bad) { $bad; exit 1 }
```

Pass threshold: zero matches in new UI kit and touched proof surfaces.

Allowed exception: existing global CSS debt outside touched Phase 2 surfaces remains inventory debt for later phases per D-19.

### UI Ownership Drift

Scope:

- `client/app/components/ui`

Command:

```powershell
$bad = rg -n '(useApi|useAuthStore|useSessions|useStudents|useAssistants|useAuditLogs|useClasses|fetch\(|\$fetch)' client/app/components/ui
if ($bad) { $bad; exit 1 }
```

Pass threshold: zero direct API, store, feature composable, `fetch`, or `$fetch` calls in `Ui*` primitives. Vue helpers such as `computed`, `ref`, `watch`, and Nuxt component primitives are allowed when they do not fetch feature data.

### Package and Registry Surface

Scope:

- `client/package.json`
- `client/package-lock.json`
- `client/app/components/ui`

Checks:

```powershell
rg -n "vuetify|sass|sass-embedded|scss|shadcn|radix|headlessui|daisyui|flowbite" client/package.json client/package-lock.json client/app/components/ui
```

Pass threshold: no new dependency or UI registry surface introduced by Phase 2. Existing non-Phase-2 package-lock text must be investigated before acceptance.

## Frontend Gate Commands

Run from the repository root unless an executor intentionally changes into `client/`.

Quick per-task gate:

```powershell
npm.cmd --prefix client run lint
```

API or component-contract gate after shared component changes:

```powershell
npm.cmd --prefix client run typecheck
```

Full phase gate:

```powershell
npm.cmd --prefix client run lint
npm.cmd --prefix client run typecheck
npm.cmd --prefix client run build
```

Pass threshold: all three full phase gate commands exit with code 0.

Backend commands are not required unless backend files are modified. If backend files are touched, run from `server/` or with `--prefix server`: `npm run lint`, `npm run build`, and `npm test`.

## Proof Surface Visual QA

Visual QA is required for visible shared-surface migrations because lint/typecheck/build are necessary but not sufficient for D-05 through D-07.

### Required Surfaces

| Surface | Required checks | Pass threshold |
|---------|-----------------|----------------|
| `AppSkeleton` via `UiSkeleton` | Dashboard/list/table/form/detail/calendar variants preserve approximate dimensions and do not create layout jumps. | Desktop and mobile-width views show no overlap, clipped placeholders, unreadable text, or broken spacing. |
| `TablePager` via `UiPagination` | Page range math, page-size choices, previous/next disabled state, and current limit behavior remain compatible. | Existing pages compile and pagination controls remain reachable and stable at desktop and mobile widths. |
| `AppToast` via `UiToast` | Error role remains `alert`; non-error role remains `status`; dismiss works; stack placement remains bottom-right desktop and bottom inset/full-width mobile. | Toast can be triggered and dismissed; no overlap with viewport edges or unreadable text. |
| `ClassLocation` via `UiBadge` and `AppIcon` | Online/offline icon, provider label, link behavior, `@click.stop`, `target="_blank"`, `rel="noopener"`, inline mode, and chip/badge mode remain intact. | Link and non-link states match current behavior with no Vuetify tags left. |

### Evidence Required

Each proof-migration summary must record:

- viewport(s) checked: desktop and mobile width;
- route or component surface inspected;
- pass/fail result for overlap, clipping, unreadable text, broken wrapping, missing states, and workflow behavior;
- any deviation and whether it blocks the phase.

If automated browser tooling is unavailable, manual browser QA is acceptable and must be recorded in the relevant `02-*-SUMMARY.md`.

## Dialog Focus Validation

`UiDialog` in Phase 2 must implement and document minimal focus management sufficient for the foundation:

- opening a dialog moves focus into the dialog or a close/title container with focusability;
- Escape closes non-disabled dialogs;
- backdrop click behavior follows the component prop contract;
- closing attempts to restore focus to the opener when available;
- focus-visible styling is present on close and action controls;
- full migration of high-risk dialog workflows remains deferred to Phase 3/4 consumer phases.

Pass threshold: source-visible implementation or documentation in `UiDialog`/README plus typecheck. Full trap coverage for all future workflow dialogs is not required in Phase 2.

## Pass / Fail Thresholds

Phase 2 passes only when all are true:

1. UIKIT-00 through UIKIT-05 have implementation artifacts and verification evidence.
2. New `Ui*` components and touched proof surfaces have zero forbidden styling/Vuetify markers.
3. New `Ui*` components contain zero direct API, store, or feature composable calls.
4. `npm.cmd --prefix client run lint` passes.
5. `npm.cmd --prefix client run typecheck` passes.
6. `npm.cmd --prefix client run build` passes.
7. Required visual QA is recorded for proof surfaces.
8. No backend verification is skipped if backend files were modified.

Any one failed item is a phase blocker unless the failure is explicitly outside Phase 2 scope per D-19 and is documented as existing inventory debt.

## Nyquist Sampling Notes

Phase 2 sampling frequency must be high enough to catch UI kit regressions before downstream pages adopt the primitives:

- Per task: run the local static scan for files touched by that task.
- Per shared component API wave: run `npm.cmd --prefix client run typecheck`.
- Per visible proof migration: run static scan, lint/typecheck, and desktop/mobile visual QA.
- Phase gate: run full static scans plus lint, typecheck, and build.

Do not rely on final build only. The Nyquist risk for Phase 2 is shared-component API drift: a broken primitive can fan out into Phase 3/4. Validate at every component group boundary.

## Implementation-Ready Checklist

- [ ] `client/app/components/ui/README.md` exists and satisfies UIKIT-00.
- [ ] Layout primitive files exist and satisfy UIKIT-01.
- [ ] Control/form primitive files exist and satisfy UIKIT-02.
- [ ] Data-display primitive files exist and satisfy UIKIT-03.
- [ ] Feedback/dialog primitive files exist and satisfy UIKIT-04.
- [ ] `AppSkeleton`, `TablePager`, `AppToast`, and `ClassLocation` proof status is recorded for UIKIT-05.
- [ ] Forbidden marker scan passes.
- [ ] Ownership drift scan passes.
- [ ] Frontend lint/typecheck/build pass.
- [ ] Visual QA evidence exists for proof surfaces.
- [ ] Backend checks are either not required or have been run because backend files changed.
