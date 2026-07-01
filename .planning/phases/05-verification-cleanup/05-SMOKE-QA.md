---
phase: 05-verification-cleanup
artifact: smoke-qa
plan: 02
status: in-progress
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
