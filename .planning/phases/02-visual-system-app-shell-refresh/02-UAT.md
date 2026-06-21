---
status: testing
phase: 02-visual-system-app-shell-refresh
source: [02-VERIFICATION.md]
started: 2026-06-21
updated: 2026-06-21
---

## Current Test

number: 1
name: Teacher default route
expected: |
  After teacher login, the app lands on `/calendar` and the calendar shell is visible.
awaiting: user response

## Tests

### 1. Teacher default route
expected: After teacher login, the app lands on `/calendar` and the calendar shell is visible.
result: [pending]

### 2. Student default route
expected: After student login, the app lands on `/dashboard` and sees student-appropriate navigation.
result: [pending]

### 3. Desktop teacher navigation
expected: Desktop teacher sidebar shows grouped Daily, Teaching, and Operations sections.
result: [pending]

### 4. Student role navigation
expected: Student navigation hides teacher-only Students, Assistants, Reports, and Audit Logs.
result: [pending]

### 5. Mobile bottom navigation
expected: Mobile viewport shows bottom navigation with primary role routes, and content is not hidden behind it.
result: [pending]

### 6. Desktop calendar interactions
expected: Teacher can still create, view/edit, drag, and resize sessions from the desktop calendar.
result: [pending]

### 7. Mobile calendar agenda
expected: Mobile calendar is readable and agenda items open the existing session detail flow.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps

