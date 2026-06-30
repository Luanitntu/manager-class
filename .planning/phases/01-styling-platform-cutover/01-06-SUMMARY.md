---
phase: 01-styling-platform-cutover
plan: 06
subsystem: ui
tags: [nuxt, vue, tailwind, layouts, app-shell]
requires:
  - phase: 01-styling-platform-cutover
    provides: AppIcon and useViewport primitives from Plan 01
provides:
  - Tailwind default app shell without Vuetify layout primitives
  - Tailwind auth layout wrapper without Vuetify app/main wrappers
  - Calendar-first teacher navigation and quick action preserved in the shell
affects: [phase-01-plan-07, app-shell, auth-layout, teacher-navigation, student-navigation]
tech-stack:
  added: []
  patterns:
    - Tailwind/plain Vue shell markup
    - AppIcon for Material Design Icons without Vuetify
    - useViewport for responsive drawer state
key-files:
  created:
    - .planning/phases/01-styling-platform-cutover/01-06-SUMMARY.md
  modified:
    - client/app/layouts/default.vue
    - client/app/layouts/auth.vue
key-decisions:
  - "Preserved existing role-aware navigation data and auth/public-settings flows while replacing only shell markup."
  - "Kept teacher calendar prominent through the daily navigation item and the top-bar quick action to /calendar."
patterns-established:
  - "Layout shell links use NuxtLink custom slots with Tailwind active states instead of Vuetify list items."
  - "Shell menus use local Vue state and click-outside handling instead of v-menu."
requirements-completed: [STYLE-03, STYLE-04]
duration: 25min
completed: 2026-06-30
status: complete
---

# Phase 01 Plan 06: Shell Layout Cutover Summary

**Default and auth layouts now render with Tailwind/plain Vue shell primitives while preserving role-aware navigation, auth actions, announcements, language switching, and teacher calendar access.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-06-30T03:35:00Z
- **Completed:** 2026-06-30T04:00:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Migrated `client/app/layouts/default.vue` off `useDisplay`, `<v-app>`, drawer, app-bar, list, menu, avatar, image, alert, chip, badge, button, and icon primitives.
- Preserved teacher/student role branches, role-specific nav groups, public announcement rendering, profile menu, logout, avatar image/fallback behavior, `LanguageSwitcher`, and teacher calendar quick action.
- Migrated `client/app/layouts/auth.vue` to a Tailwind wrapper while preserving top-right `LanguageSwitcher` and default slot rendering.
- Verified the two layouts have no remaining Vuetify shell blocker tags/imports or scoped SCSS.

## Task Commits

1. **Task 1: Migrate default layout shell** - `3ee966d` (feat)
2. **Task 2: Migrate auth layout wrapper** - `8beefd7` (feat)
3. **Task 3: Check shell responsiveness and blocker tags** - verification-only; no source delta beyond Tasks 1-2

**Plan metadata:** pending docs commit

## Files Created/Modified

- `client/app/layouts/default.vue` - Tailwind app shell with useViewport drawer state, AppIcon icons, role-aware nav, announcement, profile menu, logout, avatar, language switcher, and teacher calendar quick action.
- `client/app/layouts/auth.vue` - Tailwind auth wrapper preserving the language switcher overlay and slot content.
- `.planning/phases/01-styling-platform-cutover/01-06-SUMMARY.md` - Execution summary.

## Decisions Made

- Used `lgAndUp` from `useViewport` for permanent desktop shell behavior to preserve the old Vuetify desktop breakpoint intent more closely than Tailwind `md`.
- Used local Vue state and document click-outside handling for the profile dropdown instead of introducing a new dependency or shared menu abstraction.
- Kept shell changes inside the two layout files and did not redesign route pages.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run typecheck` still fails on unrelated pre-existing page type errors:
  - `app/pages/classes/[id].vue(778,21)` payment method string not narrowed to `"cash" | "transfer" | "card" | null | undefined`.
  - `app/pages/documents.vue(108,56)` upload target object widens `targetType` to `string`.
  - `app/pages/students/[id].vue(693,21)` payment method string not narrowed to `"cash" | "transfer" | "card" | null | undefined`.
- Nuxt still registers `vuetify-nuxt-module`; this is expected until Plan 07 removes package/config surface.

## Verification

- `rg -n '<\/?v-[a-z]|useDisplay|from ''vuetify''|lang="scss"' client/app/layouts/default.vue client/app/layouts/auth.vue` - PASS, no matches.
- `rg -n 'useViewport|AppIcon|/calendar|LanguageSwitcher|logout|announcement|profileMenuOpen|drawer' client/app/layouts/default.vue client/app/layouts/auth.vue` - PASS, expected shell behavior anchors present.
- `$env:Path = "$env:LOCALAPPDATA\nvm\v24.11.1;$env:Path"; npm.cmd --prefix client run typecheck` - FAIL only on unrelated existing page errors listed above; no layout errors after the href nullability fix.

## Known Stubs

None.

## Threat Flags

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 07 to remove Vuetify/Sass config and dependency surface, create the migration inventory, and run the final frontend verification gate.

## Self-Check: PASSED

- Found `client/app/layouts/default.vue`.
- Found `client/app/layouts/auth.vue`.
- Found commits `3ee966d` and `8beefd7`.
- Verified scoped blocker scan returns no Vuetify layout tags/imports or SCSS in the two migrated layouts.

---
*Phase: 01-styling-platform-cutover*
*Completed: 2026-06-30*
