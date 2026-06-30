---
phase: 01-styling-platform-cutover
plan: 07
subsystem: ui-platform
tags: [nuxt, dependencies, vuetify-removal, inventory, verification]
requires:
  - phase: 01-styling-platform-cutover
    provides: Plans 01-06 blocker conversions and shell/shared primitives
provides:
  - Vuetify/Sass package and Nuxt config removal
  - Detailed migration inventory for remaining old UI and SCSS work
  - Verification evidence and explicit blockers for the final cutover gate
affects: [phase-1-verification, phase-2-planning, phase-3-planning, phase-4-planning]
tech-stack:
  removed:
    - vuetify-nuxt-module
    - sass-embedded
  retained:
    - "@mdi/font"
key-files:
  created:
    - .planning/phases/01-styling-platform-cutover/01-MIGRATION-INVENTORY.md
  modified:
    - client/nuxt.config.ts
    - client/package.json
    - client/package-lock.json
  deleted:
    - client/vuetify.config.ts
    - client/app/assets/css/vuetify.settings.scss
requirements-completed:
  - STYLE-01
  - STYLE-04
requirements-blocked:
  - STYLE-02
  - STYLE-03
duration: 45min
completed: 2026-06-30
status: blocked
---

# Phase 01 Plan 07: Platform Cutover and Inventory Summary

**Vuetify platform config/dependencies were removed and the migration inventory was created, but final Phase 1 verification is blocked by out-of-scope SCSS and typecheck debt.**

## Accomplishments

- Removed Nuxt Vuetify module registration and Vuetify config references.
- Removed `vuetify-nuxt-module` and `sass-embedded` from `client/package.json` and `client/package-lock.json`.
- Deleted obsolete platform files:
  - `client/vuetify.config.ts`
  - `client/app/assets/css/vuetify.settings.scss`
- Retained `@mdi/font` and kept Material Design Icons CSS loaded from `client/nuxt.config.ts`.
- Created `.planning/phases/01-styling-platform-cutover/01-MIGRATION-INVENTORY.md` with post-cutover counts, required columns, Phase 2/3/4 guidance, and planning gaps.

## Commits

1. `01ff1a9` - `feat(01-07): remove Vuetify platform dependencies`
2. `62efb4a` - `docs(01-07): add migration inventory`

## Verification

- PASS: `client/vuetify.config.ts` is absent.
- PASS: `client/app/assets/css/vuetify.settings.scss` is absent.
- PASS: `client/package.json` and `client/package-lock.json` no longer include `vuetify-nuxt-module`, `vuetify`, or `sass-embedded`.
- PASS: `@mdi/font` remains installed and `@mdi/font/css/materialdesignicons.min.css` remains loaded.
- PASS: blocker files `default.vue`, `auth.vue`, `AppToast.vue`, `TablePager.vue`, and `LanguageSwitcher.vue` contain no `<v-*>` tags.
- PASS: no remaining `useDisplay` or direct `from 'vuetify'` imports were found in `client/app`.
- PASS: `npm.cmd --prefix client run lint` exited 0 with 10 warnings in pre-existing files.
- FAIL: app SCSS scan still finds 10 out-of-scope `lang="scss"` files:
  - `client/app/components/dashboard/StudentWorkspaceDashboard.vue`
  - `client/app/components/AppInitialLoader.vue`
  - `client/app/components/AppSkeleton.vue`
  - `client/app/components/StudentSchedule.vue`
  - `client/app/pages/student/documents.vue`
  - `client/app/pages/classes.vue`
  - `client/app/pages/documents.vue`
  - `client/app/pages/payments.vue`
  - `client/app/pages/reports.vue`
  - `client/app/pages/students.vue`
- FAIL: `npm.cmd --prefix client run typecheck` fails in `client/app/pages/documents.vue(108,56)` because `targetType` is widened to `string` instead of the `"CLASS" | "STUDENT"` union.
- FAIL: `npm.cmd --prefix client run build` fails because `sass-embedded` is removed while `client/app/pages/student/documents.vue` still has `lang.scss`.

## Deviations

- Plan 07 task 3 required no broad app-wide repair outside the explicit final-plan file list. The failing files are outside that list, so I recorded the blockers instead of converting or fixing them here.
- The Plan 07 subagent stopped responding after committing config/dependency removal and inventory. The orchestrator completed verification and wrote this closeout summary from repo evidence.

## Blockers

Phase 1 cannot be marked complete yet because the app still has SCSS build-path files after `sass-embedded` removal and one remaining frontend typecheck error.

Recommended gap closure scope:

- Convert the 10 remaining `lang="scss"` files to plain CSS or Tailwind-compatible scoped CSS.
- Fix the `documents.vue` target assignment so `targetType` is narrowed to literal `"CLASS"` or `"STUDENT"`.
- Rerun:
  - `npm.cmd --prefix client run lint`
  - `npm.cmd --prefix client run typecheck`
  - `npm.cmd --prefix client run build`

## User Setup Required

None.

## Self-Check: FAILED

Plan 07 made the intended package/config/inventory changes, but final verification failed. Phase 1 should remain blocked until the listed gap closure work is completed.

---
*Phase: 01-styling-platform-cutover*
*Completed: 2026-06-30*
