---
status: testing
phase: 03-app-shell-shared-surface-migration
source:
  - 03-VERIFICATION.md
started: 2026-07-01T02:10:44Z
updated: 2026-07-01T02:10:44Z
---

# Phase 03 UAT

## Current Test

number: 1
name: Teacher shell/calendar smoke
expected: |
  Teacher shell shows Dashboard and Calendar in daily nav; /calendar opens TeacherCalendar; create/open/drop/session saved reload work at desktop and mobile widths.
awaiting: user response

## Tests

### 1. Teacher shell/calendar smoke

expected: Teacher shell shows Dashboard and Calendar in daily nav; /calendar opens TeacherCalendar; create/open/drop/session saved reload work at desktop and mobile widths.
result: pending

### 2. Student shell/dashboard/schedule smoke

expected: Student shell shows student calendar/classes/documents/assignments/grades/tests; dashboard and schedule loading/populated/empty states are usable and responsive.
result: pending

### 3. Auth flow smoke

expected: Login/register/forgot/reset/verify keep validation, loading, errors, redirects, and disabled social buttons.
result: pending

### 4. Dialog smoke

expected: SessionDialog, StudentDetailDialog, and AssistantDetailDialog preserve mutations, confirmations, scroll, loading, empty, and error states without clipping/overlap.
result: pending

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
