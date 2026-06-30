---
phase: 03-app-shell-shared-surface-migration
plan: 06
subsystem: ui
tags: [nuxt, vue, tailwind, ui-kit, dialogs, assistant-detail, student-detail]

requires:
  - phase: 03-05
    provides: student dashboard and schedule Tailwind/shared UI migration
provides:
  - Tailwind/UI-kit AssistantDetailDialog salary, summary, table, classes, skeleton, and empty states
  - Tailwind/UI-kit StudentDetailDialog profile, scores, comments, tabs, empty states, and score delete confirmation
  - Marker-clean D-06 shared detail dialog targets
affects: [phase-03, shared-dialogs, assistant-surfaces, student-surfaces, phase-05-verification]

tech-stack:
  added: []
  patterns:
    - Detail dialogs keep feature composables, mutations, request bodies, and loading guards in the owning SFC.
    - Destructive student score deletion uses UiConfirmDialog before calling the existing deleteScore mutation.

key-files:
  created:
    - .planning/phases/03-app-shell-shared-surface-migration/03-06-SUMMARY.md
  modified:
    - client/app/components/AssistantDetailDialog.vue
    - client/app/components/StudentDetailDialog.vue

key-decisions:
  - "Migrated both D-06 dialog targets fully instead of inventorying a partial remainder because the bounded areas stayed behavior-compatible."
  - "Kept all assistant/student data fetching and mutation calls unchanged while replacing only the UI layer."
  - "Added explicit destructive confirmation before student score deletion."

patterns-established:
  - "Shared detail dialogs use UiDialog with UiAvatar headers, internal scroll from the dialog primitive, and Tailwind section separators."
  - "Dialog tables/lists use UiTable, UiList, UiListItem, UiBadge, UiMetricCard, UiEmptyState, and UiSkeleton without scoped CSS."

requirements-completed: [APP-02, APP-03, APP-05]

duration: 14 min
completed: 2026-06-30
status: complete
---

# Phase 03 Plan 06: Shared Detail Dialog Migration Summary

**Assistant and student detail dialogs migrated to Tailwind/UI-kit primitives while preserving salary, profile, score, and comment mutation behavior.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-06-30T22:58:30+07:00
- **Completed:** 2026-06-30T23:12:30+07:00
- **Tasks:** 2/2
- **Files modified:** 2 source files plus this summary

## Accomplishments

- Migrated `AssistantDetailDialog` from Vuetify dialog/card/form/table/chip primitives to `UiDialog`, `UiAvatar`, `UiSelect`, `UiInput`, `UiButton`, `UiMetricCard`, `UiTable`, `UiBadge`, `UiSkeleton`, and `UiEmptyState`.
- Preserved assistant detail loading, salary loading, assigned classes, salary method/rate/bio state, and the existing `updateSalary.mutateAsync()` request shape.
- Renamed the assistant salary CTA to the required `Save salary settings`.
- Migrated `StudentDetailDialog` header, tabs, profile form, score form/list/delete, comments entry/list, skeleton, and empty states to Tailwind/UI-kit primitives.
- Preserved student detail loading, profile save, score add, score delete, comment add, tab state, ordered comment rendering, and all existing mutation request bodies.
- Added `UiConfirmDialog` for destructive score delete confirmation.
- Both D-06 target files are marker-clean for old Vuetify/SCSS/style markers.

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate AssistantDetailDialog low-risk areas** - `43ce825` (feat)
2. **Task 2: Migrate bounded StudentDetailDialog areas** - `b21e0cf` (feat)

**Plan metadata:** pending final metadata commit.

## Files Created/Modified

- `client/app/components/AssistantDetailDialog.vue` - Tailwind/UI-kit migration for assistant header, salary config, salary summary metrics/table, assigned class badges, skeleton, and empty state.
- `client/app/components/StudentDetailDialog.vue` - Tailwind/UI-kit migration for student header, tabs, profile fields, score controls/list/delete confirmation, comments entry/list, skeleton, and empty states.
- `.planning/phases/03-app-shell-shared-surface-migration/03-06-SUMMARY.md` - Execution summary, verification evidence, D-06 marker inventory result, QA notes, and self-check.

## Decisions Made

- Migrated both D-06 targets fully because the target templates were bounded enough to preserve data flow and mutations without a broad rewrite.
- Kept all feature composables and mutation ownership in the existing dialog components; no API calls moved into UI primitives and no backend/API contracts changed.
- Used native `UiSelect` item mapping for class options in the student score form.
- Added score delete confirmation with `UiConfirmDialog` because the score delete UI was migrated.

## Deviations from Plan

None - plan executed exactly as written.

## Remaining Old Marker Inventory

None for D-06. The targeted scan found no `<v-*`, `</v-*`, `<style>`, `lang="scss"`, `.scss`, or `:deep(.v-)` markers in:

- `client/app/components/AssistantDetailDialog.vue`
- `client/app/components/StudentDetailDialog.vue`

## Issues Encountered

- The local `.codex` GSD shim failed with `Cannot find module '../../../package.json'`; the alternate `.agents` GSD shim was available and used for state/context commands.
- An initial PowerShell target scan had a quoting error; reran the scan with a single-quoted regex and both target files passed.
- `npm run lint` exits 0 with four pre-existing warnings in `client/app/pages/audit-logs.vue`; that page is Phase 4 scope and was not touched.
- `npm run typecheck` exits 0 but prints the existing `vue-router/volar/sfc-route-blocks` plugin warning.
- `npm run build` exits 0 with existing Nuxt/i18n sourcemap, chunk-size, and Node deprecation warnings.

## Verification

| Check | Result | Notes |
|-------|--------|-------|
| Assistant target marker scan | PASS | No old UI markers found. |
| Student target marker scan | PASS | No old UI markers found. |
| Combined D-06 marker scan | PASS | `rg` returned no matches for old Vuetify/SCSS/style markers. |
| `npm.cmd --prefix client run lint` | PASS | Exit 0; existing `audit-logs.vue` warnings only. |
| `npm.cmd --prefix client run typecheck` | PASS | Exit 0; existing Volar plugin warning printed. |
| `npm.cmd --prefix client run build` | PASS | Exit 0; existing warning-only build output. |
| Backend checks | Not run | No backend files changed. |

## Desktop/Mobile QA Notes

- **Assistant desktop:** Dialog uses the shared 3xl/lg dialog width with an avatar header, salary method/rate controls aligned in one row, full-width save CTA text, three metric cards, horizontally safe salary table, and assigned class badges that wrap.
- **Assistant mobile:** Salary controls stack, table remains inside `UiTable` horizontal overflow, class badges wrap, empty class state uses `UiEmptyState`, and `UiDialog` supplies `max-h-[calc(100vh-32px)]` plus internal body scroll.
- **Student desktop:** Header/avatar and tabs stay fixed at the top of the dialog body; profile fields use two-column rows where space allows; score controls align in a dense row; score value/delete actions stay right-aligned without overlapping long class names.
- **Student mobile:** Profile, score, and comment controls stack to one column; tab row scrolls horizontally if needed; long names/comments use truncation or wrapping; add/delete icon buttons keep accessible labels; internal dialog scroll prevents viewport overflow.
- **Score deletion:** Delete now opens a destructive confirmation with `Delete score` before calling the existing delete mutation. Cancel closes only the confirmation.
- **Comments:** Comments render in the same order returned by `useStudentComments`, with category and date metadata preserved.

Runtime screenshot QA was not performed because this execution context did not include authenticated app data or browser automation setup. Visual evidence is implementation-level review plus marker scans, lint, typecheck, and build gates.

## Known Stubs

None found in touched files.

## Threat Flags

None - no new endpoints, auth paths, file access, schema changes, direct API calls, or backend trust-boundary changes were introduced.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for `03-07-PLAN.md` final migration inventory, validation evidence, and frontend gates. The D-06 shared detail dialog targets are marker-clean.

## Self-Check: PASSED

- Found summary file: `.planning/phases/03-app-shell-shared-surface-migration/03-06-SUMMARY.md`
- Found modified file: `client/app/components/AssistantDetailDialog.vue`
- Found modified file: `client/app/components/StudentDetailDialog.vue`
- Found task commit: `43ce825`
- Found task commit: `b21e0cf`
- Target marker scans pass for both D-06 files.

---
*Phase: 03-app-shell-shared-surface-migration*
*Completed: 2026-06-30*
