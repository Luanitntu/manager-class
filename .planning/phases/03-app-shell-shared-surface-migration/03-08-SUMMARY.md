---
phase: 03-app-shell-shared-surface-migration
plan: 08
subsystem: ui
tags: [nuxt, vue, tailwind, auth, login]

requires:
  - phase: 03-app-shell-shared-surface-migration
    provides: Phase 3 auth surface migration and UAT gap diagnosis
provides:
  - Login social auth buttons restored to stable 42px height
  - Google and GitHub social icons restored to 20px sizing in active template markup
affects: [auth, login, phase-03-uat]

tech-stack:
  added: []
  patterns:
    - Local Tailwind sizing on migrated controls instead of orphaned Vuetify-era CSS selectors

key-files:
  created:
    - .planning/phases/03-app-shell-shared-surface-migration/03-08-SUMMARY.md
  modified:
    - client/app/components/login/LoginFormPane.vue

key-decisions:
  - "Kept the login social button fix local to LoginFormPane.vue so UiButton sizing does not change globally."
  - "Replaced the GitHub leadingIcon prop with an explicit leading slot to render AppIcon at size 20."

patterns-established:
  - "Cosmetic migration gaps should be fixed in active Tailwind/template markup, not by restoring legacy selector dependencies."

requirements-completed: [APP-05]

duration: 15min
completed: 2026-07-01
status: complete
---

# Phase 03 Plan 08: Restore Login Social Button Dimensions Summary

**Login social auth buttons now use active Tailwind sizing for 42px controls and 20px Google/GitHub icons.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-07-01T09:50:11+07:00
- **Completed:** 2026-07-01T10:04:33+07:00
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Restored both disabled social auth buttons to stable 42px height/min-height.
- Replaced the orphaned Google `login-social-icon` class with active `h-5 w-5 shrink-0` Tailwind sizing.
- Replaced GitHub `leading-icon` default sizing with an explicit `AppIcon` leading slot at size 20.
- Preserved disabled state, titles, labels, grid behavior, and auth flow behavior.

## Task Commits

1. **Task 1: Restore login social button and icon sizing** - `b702dd7` (fix)

**Plan metadata:** docs close-out commit

## Files Created/Modified

- `client/app/components/login/LoginFormPane.vue` - Local social button/icon dimensions restored without changing shared `UiButton`.
- `.planning/phases/03-app-shell-shared-surface-migration/03-08-SUMMARY.md` - Gap closure summary.

## Decisions Made

- Kept the fix local to `LoginFormPane.vue` to avoid changing button dimensions across unrelated pages.
- Used explicit icon rendering for GitHub because `UiButton` leading icons default to size 18.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope creep; the cosmetic UAT gap was closed in the planned file.

## Issues Encountered

- Initial patch matched the submit button's `class="w-full"` before the social buttons. This was caught in diff review and restored before verification or commit.

## Verification

- `rg -n '(<)/?v-[a-z]|(<)style|lang="scss"|\.scss|:deep\(\.v-' client/app/components/login/LoginFormPane.vue` - pass, no old markers.
- `npm.cmd --prefix client run lint` - pass, existing `audit-logs.vue` warnings only.
- `npm.cmd --prefix client run typecheck` - pass, existing Volar plugin warning only.
- `npm.cmd --prefix client run build` - pass, warning-only Nuxt/i18n/sourcemap/chunk/deprecation output.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 3 gap closure code is complete. Human recheck of the `/login` social buttons remains the next UAT step before Phase 3 can be marked complete.

---
*Phase: 03-app-shell-shared-surface-migration*
*Completed: 2026-07-01*
