---
phase: 03-app-shell-shared-surface-migration
plan: 01
subsystem: ui
tags: [nuxt, vue, tailwind, auth, app-shell]
requires:
  - phase: 02-tailwind-design-system-shared-ui-kit
    provides: Tailwind-only Ui primitives and AuthShell adoption rules
provides:
  - Tailwind-only auth shell wrapper
  - Tailwind-only login and register surfaces
  - Tailwind-only password recovery, password reset, and email verification states
  - Auth/shell static scan and frontend verification evidence
affects: [phase-03, auth-ui, app-shell, phase-04]
tech-stack:
  added: []
  patterns:
    - Auth forms keep VeeValidate/Zod and auth composable ownership while Ui primitives display external state
    - Auth visual panels use native images plus Tailwind overlays
key-files:
  created:
    - .planning/phases/03-app-shell-shared-surface-migration/03-01-SUMMARY.md
  modified:
    - client/app/components/AuthShell.vue
    - client/app/components/login/LoginFormPane.vue
    - client/app/components/login/LoginVisual.vue
    - client/app/components/register/RegisterFormPane.vue
    - client/app/components/register/RegisterVisual.vue
    - client/app/pages/login.vue
    - client/app/pages/register.vue
    - client/app/pages/forgot-password.vue
    - client/app/pages/reset-password.vue
    - client/app/pages/verify-email.vue
    - .planning/STATE.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
key-decisions:
  - "Kept auth validation, submit, redirect, token/query, and toast behavior in existing form/page code."
  - "Included login/register entry pages because full auth-surface migration requires removing their v-app wrappers."
patterns-established:
  - "Auth pages use AuthShell plus UiInput, UiButton, UiAlert, UiCheckbox, UiSpinner, and AppIcon."
  - "Auth visual panels use native img elements and Tailwind overlay layers instead of Vuetify image/avatar primitives."
requirements-completed: [APP-01, APP-05]
duration: 14min
completed: 2026-06-30
status: complete
---

# Phase 03 Plan 01: Shell/Auth Surface Migration Summary

**Tailwind-only auth shell and auth flow surfaces with preserved validation, redirects, role-shell branches, and recovery/verification states.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-06-30T14:53:26Z
- **Completed:** 2026-06-30T15:07:33Z
- **Tasks:** 3/3
- **Files modified:** 13 including summary/state docs

## Accomplishments

- Migrated `AuthShell` from scoped CSS and Vuetify avatar/icon primitives to Tailwind plus `AppIcon`.
- Migrated login/register forms and visuals to Tailwind plus `UiInput`, `UiCheckbox`, `UiButton`, native images, and `AppIcon`.
- Migrated forgot/reset/verify pages to `AuthShell`, `UiAlert`, `UiInput`, `UiButton`, `UiSpinner`, and semantic status icons/text.
- Preserved role-aware default shell behavior and verified teacher calendar remains in the daily nav group for teacher/assistant branches.

## Task Commits

1. **Task 1: Preserve role-aware shell and migrate auth wrapper** - `fecbb50` (`feat`)
2. **Task 2: Migrate login and register surfaces** - `a71e3d6` (`feat`)
3. **Task 3: Migrate password recovery and email verification pages** - `e8e1a65` (`feat`)

**Plan metadata:** this docs commit

## Files Created/Modified

- `client/app/components/AuthShell.vue` - Tailwind split auth wrapper with AppIcon brand mark and slot-preserving aside/form panels.
- `client/app/components/login/LoginFormPane.vue` - Login form migrated to Ui primitives while preserving VeeValidate, remember-me, redirect, loading, and toast behavior.
- `client/app/components/login/LoginVisual.vue` - Login visual migrated to native image and Tailwind overlay/person block.
- `client/app/components/register/RegisterFormPane.vue` - Register form migrated to Ui primitives while preserving field schema, loading, and disabled social actions.
- `client/app/components/register/RegisterVisual.vue` - Register visual migrated to native image, Tailwind overlay, and avatar image row.
- `client/app/pages/login.vue` - Entry wrapper converted from `v-app` to Tailwind layout.
- `client/app/pages/register.vue` - Entry wrapper converted from `v-app` and old CSS import to Tailwind layout.
- `client/app/pages/forgot-password.vue` - Recovery form migrated to AuthShell and Ui primitives.
- `client/app/pages/reset-password.vue` - Reset form migrated to AuthShell and Ui primitives.
- `client/app/pages/verify-email.vue` - Verification state UI migrated to spinner, semantic icons, and UiButton.

## Decisions Made

- Kept all auth API/composable calls in the existing page/form code; no direct API calls were added to UI primitives.
- Preserved disabled Google/GitHub social buttons rather than wiring new auth providers.
- Added `login.vue` and `register.vue` to the implementation slice because they were still true auth-surface blockers despite not being listed in the plan file list.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Migrated auth entry pages omitted from file list**
- **Found during:** Task 2
- **Issue:** `client/app/pages/login.vue` and `client/app/pages/register.vue` still used `v-app` and old register CSS, which would leave the auth surface non-Tailwind-only.
- **Fix:** Converted both entry wrappers to Tailwind-only layout and removed the register page CSS import.
- **Files modified:** `client/app/pages/login.vue`, `client/app/pages/register.vue`
- **Verification:** Full auth marker scan passed with no `<v-*>`, `<style>`, `lang="scss"`, `.scss`, or `.v-*` matches.
- **Committed in:** `a71e3d6`

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Required for the stated full auth-surface outcome; no backend or product behavior changed.

## Issues Encountered

- GSD SDK query commands could not run because `node .codex/gsd-core/bin/gsd-tools.cjs` failed with `Cannot find module '../../../package.json'`; summary/state/roadmap/requirements updates were written manually.
- `node` was not on default PATH; verification used `$env:LOCALAPPDATA\nvm\v24.11.1`.
- `npm run lint` exited 0 with preexisting warnings in `SessionDialog.vue` and `audit-logs.vue`.
- `npm run typecheck` exited 0 but printed an existing Volar plugin warning for `vue-router/volar/sfc-route-blocks`.
- `npm run build` exited 0 with existing sourcemap/chunk-size/deprecation warnings.

## Verification

- PASS: Shell/AuthShell marker scan for old shell primitives.
- PASS: Login/register/auth entry marker scan.
- PASS: Recovery/reset/verify marker scan.
- PASS: Full touched auth/shell marker scan.
- PASS: UI kit boundary scan for API/composable imports.
- PASS: `npm.cmd --prefix client run lint` (exit 0; warnings only in out-of-scope files).
- PASS: `npm.cmd --prefix client run typecheck` (exit 0; Volar plugin warning printed).
- PASS: `npm.cmd --prefix client run build` (exit 0; warning-only build output).

## Visual QA Notes

- Desktop auth split: login/register visual panels remain left/right paired with centered max-width form panes; forgot/reset/verify use `AuthShell` with left brand panel and right form panel.
- Mobile auth: visual panels hide below `lg`; form panes use single-column centered layout with stable padding and no dependency on old CSS.
- Shell role branches: `default.vue` was not behavior-edited; teacher/default and assistant daily nav still include calendar, student nav still includes calendar/classes/documents/assignments/grades/tests, and profile menu close/route-close logic remains intact.
- Verification states: verify-email exposes text plus spinner/check/alert icons, so status is not color-only.

## Known Stubs

None found in touched files.

## Threat Flags

None. No new endpoints, auth storage changes, file access paths, or backend trust-boundary changes were introduced.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 03-02 teacher calendar migration. Note: `client/app/components/calendar/TeacherCalendar.vue` was dirty before this plan and remains untouched by this execution.

## Self-Check: PASSED

- SUMMARY exists at `.planning/phases/03-app-shell-shared-surface-migration/03-01-SUMMARY.md`.
- Task commits found: `fecbb50`, `a71e3d6`, `e8e1a65`.
- Required source files exist and full auth/shell marker scan passes.
- No generated files left untracked; only preexisting `client/app/components/calendar/TeacherCalendar.vue` remains dirty.

---
*Phase: 03-app-shell-shared-surface-migration*
*Completed: 2026-06-30*
