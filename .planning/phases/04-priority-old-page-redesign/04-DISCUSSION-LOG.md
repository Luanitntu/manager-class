# Phase 4: Priority Old Page Redesign - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 4-Priority Old Page Redesign
**Areas discussed:** Assistant list shape, Assistant detail hierarchy, Audit log scanability, Profile form polish and QA

---

## Assistant List Shape

| Question | Options Considered | Selected |
|----------|--------------------|----------|
| Layout direction | Dense list-row / lightweight card; card grid; agent decides | Dense list-row / lightweight card |
| Create assistant flow | Compact 460px dialog; full-width form section; agent decides | Compact 460px dialog |
| Empty state | Compact in list card with CTA; larger onboarding-style empty state; agent decides | Compact in list card with CTA |
| Search and pagination | Preserve current behavior; add light debounce; agent decides | Preserve current behavior |

**User's choice:** Keep `/assistants` dense and behavior-compatible.
**Notes:** User asked what card grid would look like; recommendation was to avoid full grid because it would reduce scan speed and add visual weight. User accepted the list-row/card-light recommendation.

---

## Assistant Detail Hierarchy

| Question | Options Considered | Selected |
|----------|--------------------|----------|
| Page layout | Header + two-column summary + full-width tables; single-column everything; agent decides | Header + two-column summary + full-width tables |
| Salary config placement | Inline card; dialog; agent decides | Inline card |
| Mobile table behavior | Horizontal scroll table; stacked list cards; agent decides | Horizontal scroll table |
| Edit profile flow | Compact dialog; inline edit in profile card; agent decides | Compact dialog |

**User's choice:** Keep dense assistant detail data visible and page-owned.
**Notes:** The page should modernize markup and visual treatment without hiding salary configuration or changing table/data fidelity.

---

## Audit Log Scanability

| Question | Options Considered | Selected |
|----------|--------------------|----------|
| Filter bar layout | Horizontal wrapping toolbar; collapsed filter panel; agent decides | Horizontal wrapping toolbar |
| Mobile table behavior | Horizontal scroll table; stacked mobile rows; agent decides | Horizontal scroll table |
| Action badge color | Preserve semantic mapping; mostly neutral badges; agent decides | Preserve semantic mapping |
| Loading and empty states | Table skeleton + compact empty state; large standalone empty state; agent decides | Table skeleton + compact empty state |

**User's choice:** Keep audit logs compact, scan-friendly, and close to current behavior.
**Notes:** No new filter interactions or mobile row remapping should be introduced in Phase 4.

---

## Profile Form Polish and QA

| Question | Options Considered | Selected |
|----------|--------------------|----------|
| Timezone control | Simple `UiSelect` with full list; custom searchable select; agent decides | Simple `UiSelect` |
| Page layout | Compact single card around 520px; wider two-column account page; agent decides | Compact single card |
| Save feedback | Inline success/error alerts; toast success plus inline error; agent decides | Inline success/error alerts |
| Phase verification | Targeted desktop/mobile visual QA for all four routes plus lint/typecheck/build; automated gates only; agent decides | Targeted desktop/mobile visual QA plus gates |

**User's choice:** Preserve the small account-form feel and current inline feedback.
**Notes:** The user selected the recommended visual QA depth because this phase is a visual redesign.

---

## the agent's Discretion

- Exact plan split and Tailwind class composition.
- Exact `Ui*` component variants, as long as the result stays Tailwind-only and behavior-compatible.
- Whether to keep compatibility wrappers such as `TablePager` or use `UiPagination` directly where pages are touched.

## Deferred Ideas

- Full assistant card grid.
- Custom searchable timezone select.
- Collapsible audit filter panel.
- Mobile stacked-card versions of audit and assistant detail tables.
- Admin/center page cleanup and broad app-wide old-marker cleanup.
