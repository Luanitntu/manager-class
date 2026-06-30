---
phase: 01-styling-platform-cutover
plan: 02
subsystem: ui
tags: [tailwind, css, scss-cutover, auth, landing]

requires:
  - phase: 01-styling-platform-cutover
    provides: Phase 1 Plan 01 Tailwind blocker primitives and icon continuity
provides:
  - Global CSS entry no longer imports SCSS
  - Landing page imports plain CSS instead of SCSS
  - Login/auth visual styles have plain CSS build-path replacements
affects: [styling-platform-cutover, tailwind-migration, auth-ui, landing-page]

tech-stack:
  added: []
  patterns:
    - Compile direct build-path SCSS to selector-equivalent plain CSS before Sass removal
    - Keep legacy SCSS sources untouched when later scoped plans still own them

key-files:
  created:
    - client/app/styles/index.css
    - client/app/styles/login.css
    - client/app/styles/landing.css
    - client/app/styles/_auth-shared.css
  modified:
    - client/app/assets/css/main.css
    - client/app/pages/index.vue
    - client/app/styles/index.scss

key-decisions:
  - "Preserved visual intent by compiling existing auth and landing selectors to plain CSS instead of redesigning pages."
  - "Kept legacy SCSS source files in place because later Phase 1 plans still own register/dashboard/calendar/shell slices."

patterns-established:
  - "Build-path style imports point at .css files; SCSS sources are not imported by global/auth/landing runtime entrypoints."

requirements-completed:
  - STYLE-02
  - STYLE-03

duration: 24min
completed: 2026-06-30
status: complete
---

# Phase 01 Plan 02: Global/Auth/Landing SCSS Cutover Summary

**Global, auth, and landing build-path SCSS imports were replaced with Tailwind-compatible plain CSS while preserving existing selectors and visual intent.**

## Performance

- **Duration:** 24 min
- **Started:** 2026-06-30T02:50:00Z
- **Completed:** 2026-06-30T03:13:50Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Removed the global SCSS import from `client/app/assets/css/main.css` and pointed it at `client/app/styles/index.css`.
- Added plain CSS replacements for global login/auth and landing build-path styles.
- Updated the landing route to import `landing.css` instead of `landing.scss`.
- Ran targeted scans proving touched global/auth/landing build-path files no longer import `.scss` or contain Sass-only syntax.

## Task Commits

The tightly coupled style import graph was committed atomically:

1. **Tasks 1-3: Remove global SCSS import, convert auth/landing entrypoints, scan blockers** - `e317372` (`fix`)

**Plan metadata:** pending metadata commit

## Files Created/Modified

- `client/app/assets/css/main.css` - Replaced `../../styles/index.scss` import with `../../styles/index.css`.
- `client/app/styles/index.css` - Plain CSS global style entry importing `login.css`.
- `client/app/styles/login.css` - Selector-equivalent plain CSS compiled from the existing login SCSS.
- `client/app/styles/landing.css` - Selector-equivalent plain CSS compiled from the existing landing SCSS.
- `client/app/styles/_auth-shared.css` - Empty runtime CSS marker for auth shared tokens; original SCSS only provided compile-time variables/mixins.
- `client/app/styles/index.scss` - Legacy compatibility wrapper updated away from SCSS import.
- `client/app/pages/index.vue` - Landing page now imports `../styles/landing.css`.

## Decisions Made

- Used the locally installed `sass-embedded` binary only to produce CSS output from existing SCSS, with no package changes.
- Did not delete legacy SCSS files because Plan 03 and later plans still own register/dashboard/calendar/shell migration slices.
- Did not touch `.planning/config.json` or `client/app/components/calendar/TeacherCalendar.vue`; both were pre-existing unrelated dirty files.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope expansion.

## Issues Encountered

- `npm.cmd --prefix client run typecheck` failed with unrelated pre-existing TypeScript errors outside this plan's touched files:
  - `app/components/register/RegisterFormPane.vue(117,14)` array includes `undefined` where Vuetify expects string/string array.
  - `app/pages/classes/[id].vue(778,21)` payment method string is wider than `"cash" | "transfer" | "card"`.
  - `app/pages/documents.vue(108,56)` `targetType` is inferred as `string` instead of `"CLASS" | "STUDENT"`.
  - `app/pages/students/[id].vue(693,21)` payment method string is wider than `"cash" | "transfer" | "card"`.

## Verification

- **PASS:** `rg "\.scss|@use|@mixin|\$[A-Za-z_-]+|&[A-Za-z_:.-]" client/app/assets/css/main.css client/app/styles/index.css client/app/styles/login.css client/app/styles/landing.css client/app/styles/_auth-shared.css client/app/pages/index.vue -n`
  - Only the Google Fonts URL import in `main.css` matched; no `.scss` import or Sass-only syntax in touched build-path files.
- **PASS:** `rg "index\.scss|login\.scss|landing\.scss|_auth-shared\.scss|styles/(index|login|landing|_auth-shared)\.scss" client/app -n`
  - No global/auth/landing runtime imports remain.
- **FAIL unrelated:** `$env:Path = "$env:LOCALAPPDATA\nvm\v24.11.1;$env:Path"; npm.cmd --prefix client run typecheck`
  - Fails only in register/classes/documents/students files listed above.

## Known Stubs

None.

## Threat Flags

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 03 register SCSS conversion. Remaining register/dashboard/calendar/shell SCSS and Vuetify work stays in its planned Phase 1 slices.

## Self-Check: PASSED

- Found expected files: `index.css`, `login.css`, `landing.css`, `_auth-shared.css`.
- Found code commit: `e317372`.
- Post-commit deletion check found no deleted tracked files.
- Working tree still has only unrelated pre-existing dirty files outside this plan: `.planning/config.json` and `client/app/components/calendar/TeacherCalendar.vue`.

---
*Phase: 01-styling-platform-cutover*
*Completed: 2026-06-30*
