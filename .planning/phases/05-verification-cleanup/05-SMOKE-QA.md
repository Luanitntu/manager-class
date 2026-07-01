---
phase: 05-verification-cleanup
artifact: smoke-qa
plan: 02
status: complete
created: 2026-07-01
requirements: [VER-04, VER-05]
---

# Phase 05 Smoke QA

Plan 05-02 attempted runtime screenshots for the app shell, calendar-first teacher workflow, and Phase 4 priority routes at desktop and mobile widths. The local client was reachable, but protected route access was blocked by the auth middleware because no authenticated browser session or backend seed credentials were available in this execution environment.

## Runtime

| Item | Evidence |
| --- | --- |
| Client command | From `client/`: `$env:Path = "$env:LOCALAPPDATA\nvm\v24.11.1;$env:Path"; $env:PORT='3002'; npm.cmd run dev -- --host 127.0.0.1 --port 3002` |
| Session id | Codex exec session `60621` |
| Local URL | `http://127.0.0.1:3002/` |
| Readiness polling | PASS - `Invoke-WebRequest http://127.0.0.1:3002/` returned HTTP 200 on attempt 3 |
| Screenshot tool | Existing Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe --headless=new --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=5000` |
| Screenshot approval | Required elevated GUI/headless execution; approved and completed |
| Shutdown | PASS - sent Ctrl+C to session `60621`, confirmed `Terminate batch job (Y/N)?` with `Y`; port 3002 left only `TIME_WAIT` entries |
| Runtime warnings | Existing Nuxt/i18n console-time warnings during repeated headless requests; route screenshots still wrote successfully |

## Auth Blocker

Protected smoke routes redirect to login when `useAuthStore().isAuthenticated` is false. Source blocker: `client/app/middleware/auth.global.ts` checks `PUBLIC_ROUTES`, then calls `navigateTo({ path: '/login', query: { redirect: to.fullPath } })` for non-public routes. The execution environment had no authenticated browser session and no backend login fixture. No backend data was mocked and no app code was changed for screenshots.

Each screenshot file below was captured from the requested protected route, but the visible state is the login redirect. This is retained as route-level blocker evidence rather than passed authenticated visual QA.

## Screenshot Attempts

| Target | Route attempted | Viewport | Result | Evidence |
| --- | --- | --- | --- | --- |
| Shell | `/calendar` | desktop 1440x1000 | BLOCKER - redirected to login before authenticated shell/profile menu could render | `screenshots/shell-desktop.png` |
| Shell | `/calendar` | mobile 390x900 | BLOCKER - redirected to login before mobile drawer/profile menu could render | `screenshots/shell-mobile.png` |
| `/calendar` | `/calendar` | desktop 1440x1000 | BLOCKER - redirected to login before teacher calendar could render | `screenshots/calendar-desktop.png` |
| `/calendar` | `/calendar` | mobile 390x900 | BLOCKER - redirected to login before teacher calendar could render | `screenshots/calendar-mobile.png` |
| `/assistants` | `/assistants` | desktop 1440x1000 | BLOCKER - redirected to login before roster could render | `screenshots/assistants-desktop.png` |
| `/assistants` | `/assistants` | mobile 390x900 | BLOCKER - redirected to login before roster could render | `screenshots/assistants-mobile.png` |
| `/assistants/[id]` | `/assistants/smoke-assistant-id` | desktop 1440x1000 | BLOCKER - redirected to login before assistant detail could render | `screenshots/assistant-detail-desktop.png` |
| `/assistants/[id]` | `/assistants/smoke-assistant-id` | mobile 390x900 | BLOCKER - redirected to login before assistant detail could render | `screenshots/assistant-detail-mobile.png` |
| `/audit-logs` | `/audit-logs` | desktop 1440x1000 | BLOCKER - redirected to login before audit log table could render | `screenshots/audit-logs-desktop.png` |
| `/audit-logs` | `/audit-logs` | mobile 390x900 | BLOCKER - redirected to login before audit log table could render | `screenshots/audit-logs-mobile.png` |
| `/profile` | `/profile` | desktop 1440x1000 | BLOCKER - redirected to login before fallback profile page could render | `screenshots/profile-desktop.png` |
| `/profile` | `/profile` | mobile 390x900 | BLOCKER - redirected to login before fallback profile page could render | `screenshots/profile-mobile.png` |

## Screenshot Files

| File | Bytes | Notes |
| --- | ---: | --- |
| `screenshots/shell-desktop.png` | 1010624 | Login redirect blocker evidence |
| `screenshots/shell-mobile.png` | 31273 | Login redirect blocker evidence |
| `screenshots/calendar-desktop.png` | 1010624 | Login redirect blocker evidence |
| `screenshots/calendar-mobile.png` | 31273 | Login redirect blocker evidence |
| `screenshots/assistants-desktop.png` | 1010624 | Login redirect blocker evidence |
| `screenshots/assistants-mobile.png` | 31273 | Login redirect blocker evidence |
| `screenshots/assistant-detail-desktop.png` | 1010624 | Login redirect blocker evidence |
| `screenshots/assistant-detail-mobile.png` | 31273 | Login redirect blocker evidence |
| `screenshots/audit-logs-desktop.png` | 1010624 | Login redirect blocker evidence |
| `screenshots/audit-logs-mobile.png` | 31273 | Login redirect blocker evidence |
| `screenshots/profile-desktop.png` | 1010624 | Login redirect blocker evidence |
| `screenshots/profile-mobile.png` | 31273 | Login redirect blocker evidence |

## Task 1 Conclusion

Runtime and screenshot automation worked. Authenticated route contents were blocked by missing auth/backend session, so Task 2 completes the required source-level responsive review for the shell, `/calendar`, `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.

## Source-Level Responsive and State Review

Review basis: `05-UI-SPEC.md` Smoke Target Contracts and Visual QA Contract, plus source inspection of `client/app/layouts/default.vue`, `client/app/pages/calendar.vue`, `client/app/components/calendar/*`, `client/app/components/SessionDialog.vue`, `client/app/pages/assistants/index.vue`, `client/app/pages/assistants/[id].vue`, `client/app/pages/audit-logs.vue`, `client/app/pages/profile.vue`, and the relevant `Ui*` primitives.

Legend: `PASS` means source satisfies the contract. `BLOCKER` means runtime visual proof was blocked by auth/backend availability. `FIXED-IN-PLAN-02` would mark a tiny polish change; none were needed. `DEFERRED-OUTSIDE-V1.1` remains reserved for non-smoke broad UI debt already classified in Plan 05-01.

| Target | loading | populated | empty | error | success | pagination | filters | search | dialogs | tabs | table overflow | mobile stacking | focus-visible | contained overflow | Disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Shell | PASS - route shell source uses stable drawer/topbar classes and public settings query | PASS - role-aware teacher/student/admin nav groups and profile identity render from auth store | Not applicable | PASS - public settings maintenance fetch falls back safely in middleware | PASS - profile dialog keeps same editor path as page | Not applicable | Not applicable | PASS - topbar search label/input are wrapped and hidden on narrow widths | PASS - `UiDialog` profile editor uses max viewport height, Escape/backdrop close, focus restore | Not applicable | Not applicable | PASS - drawer overlays on mobile, topbar controls shrink/hide, menu is anchored | PASS - drawer toggle, nav, profile menu, and dialog controls use focus rings | PASS - main content uses `min-w-0`; dialog body scrolls internally | BLOCKER for runtime screenshot: no authenticated session, screenshot is login redirect |
| `/calendar` | PASS - `AppSkeleton variant="calendar"` covers initial range load | PASS - `TeacherCalendarBoard` month/week grid, toolbar, event rows, today marker, session detail, and dialog path are wired | PASS - `TeacherSessionDetail` empty state covers no selected session | PASS - load/update/create/delete failures call toast with API error fallback | PASS - reschedule/save/delete/complete paths reload and show success toast where implemented | Not applicable | Not applicable | Not applicable | PASS - `SessionDialog` supports create/edit/delete/complete/reopen; controls disable/loading through mutations | PASS - month/week segmented control | PASS - calendar board intentionally uses contained horizontal scroll via `overflow-x-auto` and `min-w-[760px]` | PASS - header buttons stack on mobile; board scroll is contained; detail card stacks | PASS - cells, events, toolbar buttons, segmented control, dialog controls expose focus-visible rings/keyboard handlers | PASS - only calendar grid can scroll horizontally inside board | BLOCKER for runtime screenshot: no authenticated session, screenshot is login redirect |
| `/assistants` | PASS - roster skeleton appears while loading without data | PASS - metrics, roster rows, badges, detail open, and create action are source-wired | PASS - `UiEmptyState` covers no assistants and includes create CTA | PASS - create dialog shows `UiAlert` from `extractApiError` | PASS - successful create closes dialog, resets form, and mutation refetch owns data | PASS - `TablePager` renders when meta exists | Not applicable | PASS - `UiInput` search resets page and supports clear button | PASS - create assistant dialog and `AssistantDetailDialog` are wired | Not applicable | Not applicable | PASS - metrics grid, toolbar, rows, badges, and create action wrap/stack | PASS - row buttons and controls use focus-visible rings | PASS - `min-w-0`, truncation, and wrapped badges prevent page-level overflow | BLOCKER for runtime screenshot: no authenticated session, screenshot is login redirect |
| `/assistants/[id]` | PASS - detail skeleton appears before assistant data | PASS - profile, salary summary, assigned classes, salary config, schedule/breakdown/history render from composables | PASS - assigned classes, schedule, breakdown, and history have empty rows/states | PASS - salary/profile mutation errors bubble through mutation state; source does not add broad custom error panel | PASS - salary/profile mutations use loading states and close profile dialog after save | Not applicable | Not applicable | Not applicable | PASS - edit profile dialog uses `UiDialog`; salary/profile controls disable while pending | PASS - `UiTabs` covers schedule, breakdown, history | PASS - schedule, breakdown, and history use `UiTable`, whose wrapper contains horizontal scroll | PASS - header/actions, summary grid, assigned class rows, forms, and action groups stack on smaller widths | PASS - back/action buttons, class links, tabs, forms, and dialog controls expose focus-visible rings | PASS - `UiTable` overflow wrapper and `min-w-0` sections contain wide data | BLOCKER for runtime screenshot: no authenticated session, screenshot is login redirect |
| `/audit-logs` | PASS - table skeleton appears while loading without logs | PASS - metrics, filter toolbar, audit table, badges, actor/entity metadata, and pager are wired | PASS - `UiEmptyState` covers no audit logs | PASS - composable-owned query error path remains outside visible custom state; no new missing-state defect in source review | Not applicable | PASS - `TablePager` renders when meta exists | PASS - action/entity/date filters reset page | PASS - entity type input supports search/filter text | Not applicable | Not applicable | PASS - `UiTable` wrapper confines horizontal scroll to table area | PASS - metric grid and filter toolbar wrap; table scroll remains internal | PASS - inputs, select, clear button, pager, and table-adjacent controls use focus-visible/focus-within styles | PASS - table-only horizontal scroll via `UiTable`; no page-level overflow source found | BLOCKER for runtime screenshot: no authenticated session, screenshot is login redirect |
| `/profile` | PASS - active sessions metric and current session card show skeletons while loading | PASS - hero, metrics, `ProfileEditorPanel`, current session, and account notes are wired | PASS - current session fields use `-` fallback when absent | PASS - `ProfileEditorPanel` owns inline error state from API errors | PASS - `ProfileEditorPanel` owns inline success copy (`Profile updated.`) and auth-store update | Not applicable | Not applicable | Not applicable | PASS - shell profile dialog reuses `ProfileEditorPanel`; route itself remains fallback page | Not applicable | Not applicable | PASS - hero, metrics, editor/sidebar grid, and cards stack/wrap with `min-w-0` | PASS - form controls/buttons from UI primitives expose focus-visible/focus-within states | PASS - long name/email/session fields use break/truncate/min-width containment | BLOCKER for runtime screenshot: no authenticated session, screenshot is login redirect |

## Tiny Polish Review

No `FIXED-IN-PLAN-02` code polish was applied. Source review found no concrete smoke-target overflow, overlap, clipping, unreadable text, or missing-state defect that could be responsibly fixed without authenticated runtime confirmation. Broad non-priority old UI debt remains the Plan 05-01 `DEFERRED-OUTSIDE-V1.1` classification and was not redesigned here.

## Final Smoke QA Result

VER-04 is partially evidenced by automated route attempts and exact authenticated-route blockers for Shell, `/calendar`, `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile` on desktop and mobile. VER-05 is supported by target source review plus blocker screenshots, but authenticated human/browser verification remains required in Plan 05-03 to confirm real populated visuals.
