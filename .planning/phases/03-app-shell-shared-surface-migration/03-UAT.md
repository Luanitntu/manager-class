---
status: testing
phase: 03-app-shell-shared-surface-migration
source:
  - 03-VERIFICATION.md
started: 2026-07-01T02:10:44Z
updated: 2026-07-01T10:04:33+07:00
---

# Phase 03 UAT

## Current Test

number: 3
name: Auth flow smoke - login social buttons
expected: |
  Login/register/forgot/reset/verify keep validation, loading, errors, redirects, and disabled social buttons. Google and GitHub login buttons render at the restored 42px height with 20px icons.
awaiting: user recheck

## Tests

### 1. Teacher shell/calendar smoke

expected: Teacher shell shows Dashboard and Calendar in daily nav; /calendar opens TeacherCalendar; create/open/drop/session saved reload work at desktop and mobile widths.
result: pass

### 2. Student shell/dashboard/schedule smoke

expected: Student shell shows student calendar/classes/documents/assignments/grades/tests; dashboard and schedule loading/populated/empty states are usable and responsive.
result: pass

### 3. Auth flow smoke

expected: Login/register/forgot/reset/verify keep validation, loading, errors, redirects, and disabled social buttons.
result: fixed_pending_recheck
reported: "2 nút login with google và github hơi bị thay đổi kích thước, icon trong 2 button này cug bị thay đổi kích thước"
severity: cosmetic
fixed_in: 03-08-PLAN.md
commit: b702dd7

### 4. Dialog smoke

expected: SessionDialog, StudentDetailDialog, and AssistantDetailDialog preserve mutations, confirmations, scroll, loading, empty, and error states without clipping/overlap.
result: pass

## Summary

total: 4
passed: 3
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps

- truth: "Login/register/forgot/reset/verify keep validation, loading, errors, redirects, and disabled social buttons."
  status: resolved_pending_recheck
  reason: "User reported: 2 nút login with google và github hơi bị thay đổi kích thước, icon trong 2 button này cug bị thay đổi kích thước"
  severity: cosmetic
  test: 3
  root_cause: "LoginFormPane migrated social buttons to UiButton without carrying over the old fixed social dimensions. The old .login-social-icon 20px rule lives in login.css but that CSS is no longer imported by login.vue, so the custom Google SVG has no explicit rendered size. The GitHub button uses UiButton leadingIcon, which renders AppIcon at the default 18px. UiButton size md also renders min-h-11, making the social buttons 44px instead of the previous 42px social-button height."
  artifacts:
    - path: "client/app/components/login/LoginFormPane.vue"
      issue: "Google SVG relies on an orphaned login-social-icon CSS class and the social UiButton instances do not set the old 42px control height."
    - path: "client/app/components/ui/UiButton.vue"
      issue: "leadingIcon uses AppIcon size 18 by default for GitHub, which differs from the previous social icon target."
    - path: "client/app/styles/login.css"
      issue: "Contains the former .login-social-button.v-btn and .login-social-icon sizing rules, but the migrated login page no longer imports this CSS."
  missing:
    - "Set login social button height to 42px with Tailwind utility classes on the two UiButton instances."
    - "Set both social icons to 20px in the active LoginFormPane template: explicit h-5 w-5 shrink-0 for Google SVG and an AppIcon slot with size 20 for GitHub."
  debug_session: ".planning/phases/03-app-shell-shared-surface-migration/03-UAT.md"
  resolution:
    fixed_in: 03-08-PLAN.md
    commit: b702dd7
    summary: "LoginFormPane now applies local 42px social button sizing and 20px Google/GitHub icon sizing in active Tailwind/template markup."
