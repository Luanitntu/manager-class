---
status: testing
phase: 03-teacher-workflow-polish-fixes
source: [03-01-SUMMARY.md]
started: 2026-06-21
updated: 2026-06-21
---

## Current Test

number: 1
name: Dashboard Stats Refresh
expected: |
  Verify that the dashboard stats only fetch sessions within a 7-day range, and clicking "Refresh" updates stats correctly.
awaiting: user response

## Tests

### 1. Dashboard Stats Refresh
expected: |
  Verify that the dashboard stats only fetch sessions within a 7-day range, and clicking "Refresh" updates stats correctly.
result: pending

### 2. Profile Refactor
expected: |
  Verify the profile page loads correctly from `/users/me/profile` via the new `useProfile` composable (no direct API requests in page) and updates trigger a global success/error snackbar.
result: pending

### 3. Calendar Event Colors
expected: |
  Verify calendar shows class-specific colors (and fallback hash colors) dynamically.
result: pending

### 4. SessionDialog Rules & Actions
expected: |
  Verify that SessionDialog displays validation errors inline when trying to save empty/invalid times, and CRUD operations trigger global snackbars.
result: pending

### 5. Teacher Workflows App Shell
expected: |
  Verify that all 7 refactored pages (Classes, Students, Assistants, Documents, Payments, Reports, Audit Logs) render page headers, load/empty/error states correctly, and trigger the global snackbar.
result: pending

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

## Gaps

None.
