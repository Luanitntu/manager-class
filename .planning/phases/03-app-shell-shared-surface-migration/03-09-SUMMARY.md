---
phase: 03-app-shell-shared-surface-migration
plan: 09
subsystem: ui
tags: [nuxt, vue, tailwind, auth, login]

requires:
  - phase: 03-app-shell-shared-surface-migration
    provides: Phase 3 Plan 08 restored login social button dimensions
provides:
  - Google social login icon and text kept on one row
  - Social login labels protected from wrapping
affects: [auth, login, phase-03-uat]

tech-stack:
  added: []
  patterns:
    - Custom icons inside UiButton should use the leading slot when paired with text

key-files:
  created:
    - .planning/phases/03-app-shell-shared-surface-migration/03-09-PLAN.md
    - .planning/phases/03-app-shell-shared-surface-migration/03-09-SUMMARY.md
  modified:
    - client/app/components/login/LoginFormPane.vue

key-decisions:
  - "Moved the Google SVG into UiButton's leading slot instead of leaving it in the default label slot."
  - "Added whitespace-nowrap locally to social login buttons to prevent icon/label row breaks."

patterns-established:
  - "UiButton default slot should contain label content only when an icon needs button-level flex alignment."

requirements-completed: [APP-05]

duration: 20min
completed: 2026-07-01
status: complete
---

# Phase 03 Plan 09: Keep Google Social Login Content Inline Summary

**Google social login now renders icon and label as separate button flex items, preventing the two-row wrap.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-07-01T10:20:00+07:00
- **Completed:** 2026-07-01T10:40:00+07:00
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Moved the Google SVG into `UiButton`'s `#leading` slot so it aligns like the GitHub icon.
- Added `whitespace-nowrap` to both social login buttons.
- Preserved 42px social button height and 20px icon sizing.
- Kept the change local to `LoginFormPane.vue`.

## Task Commits

1. **Task 1: Prevent Google social button wrapping** - `fd39dd4` (fix)

**Plan metadata:** docs close-out commit

## Files Created/Modified

- `client/app/components/login/LoginFormPane.vue` - Google icon moved to leading slot; social button labels made no-wrap.
- `.planning/phases/03-app-shell-shared-surface-migration/03-09-PLAN.md` - Residual gap closure plan.
- `.planning/phases/03-app-shell-shared-surface-migration/03-09-SUMMARY.md` - Residual gap closure summary.

## Decisions Made

- Kept Google and GitHub social button behavior local rather than changing shared `UiButton`.
- Treated custom inline SVG like a leading icon so `UiButton` flex alignment owns icon/text layout.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope creep; the residual cosmetic UAT gap was closed in the planned file.

## Issues Encountered

None.

## Verification

- `rg -n '(<)/?v-[a-z]|(<)style|lang="scss"|\.scss|:deep\(\.v-' client/app/components/login/LoginFormPane.vue` - pass, no old markers.
- `npm.cmd --prefix client run lint` - pass, existing `audit-logs.vue` warnings only.
- `npm.cmd --prefix client run typecheck` - pass, existing Volar plugin warning only.
- `npm.cmd --prefix client run build` - pass, warning-only Nuxt/i18n/sourcemap/chunk/deprecation output.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 3 gap closure code is complete. Human recheck of the `/login` Google/GitHub social buttons remains the next UAT step before Phase 3 can be marked complete.

---
*Phase: 03-app-shell-shared-surface-migration*
*Completed: 2026-07-01*
