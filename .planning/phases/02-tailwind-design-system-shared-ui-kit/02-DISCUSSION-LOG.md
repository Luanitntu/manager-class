# Phase 2: Tailwind Design System & Shared UI Kit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 2-Tailwind Design System & Shared UI Kit
**Areas discussed:** Token + Visual Rules, Component Coverage, Component API Style, Adoption Boundary

---

## Token + Visual Rules

| Decision Point | Options Considered | Selected |
|---|---|---|
| Token strategy | Keep `--st-*`; lightly tune; strong redesign; agent decides | Keep `--st-*` |
| Global CSS boundary | No CSS at all; minimal global CSS; global helper utilities; agent decides | Minimal global CSS |
| Complex old styles | Shared Tailwind component/variant; inline Tailwind; temporary CSS; agent decides | Shared Tailwind component/variant |
| Parity control | Per-slice parity; visual QA for large pages; automated checks only; agent decides | Per-slice parity with risk-based desktop/mobile visual QA |

**User's choice:** Keep existing tokens, allow only minimal global Tailwind/token/base CSS, replace repeated/complex styles with shared Tailwind components or variants, and require visual parity.

**Notes:** The user clarified the overall migration goal: all UI should become Tailwind-only with no SCSS and no hand-written page/component CSS, while preserving the existing UI and avoiding broken layouts. The final context adds a "no new CSS debt" rule.

---

## Component Coverage

| Decision Point | Options Considered | Selected |
|---|---|---|
| Kit breadth | Minimal for Phase 3; Phase 3 + Phase 4 priority pages; full app; agent decides | Phase 3 + Phase 4 priority pages |
| Required groups | Five core groups; controls + data only; inventory-priority only; agent decides | Five core groups |
| Implementation order | Foundation -> controls -> data -> feedback/dialog; by page need; dialog/forms first; agent decides | Foundation -> controls -> data -> feedback/dialog |
| Proof migration | Small shared surfaces; new components + docs only; high-risk dialogs; agent decides | Small shared surfaces |

**User's choice:** Build the five core groups needed for Phase 3 shell/shared surfaces and Phase 4 priority pages, then prove the kit on a few small shared surfaces.

**Notes:** The user accepted that Phase 2 should not cover every future/admin/low-traffic page and should avoid high-risk dialog workflow rewrites.

---

## Component API Style

| Decision Point | Options Considered | Selected |
|---|---|---|
| API style | Vuetify-like props; slot-first with enough props; strict wrappers; agent decides | Slot-first with enough props |
| Naming | `Ui*`; `App*`; no prefix; agent decides | `Ui*` |
| Form validation | Component-managed; UI-only external state; vee-validate-bound; agent decides | UI-only external state |
| Data display abstraction | Smart `UiDataTable`; primitive/slot-first table/list; no components; agent decides | Primitive/slot-first |

**User's choice:** Use `Ui*` design-system components, keep APIs slot-first with enough repeated state props, keep form validation outside the UI kit, and avoid a highly abstract data table.

**Notes:** `App*` remains reserved for app-level infrastructure such as `AppIcon`, `AppToast`, and `AppInitialLoader`.

---

## Adoption Boundary

| Decision Point | Options Considered | Selected |
|---|---|---|
| Existing code touched | Docs + new components; docs + components + small shared migrations; high-risk dialogs; agent decides | Docs + components + small shared migrations |
| CSS/SCSS removal depth | Full app removal in Phase 2; Phase 2 rules plus touched shared surfaces; docs only; agent decides | Rules plus touched shared surfaces |
| Handling visual drift | Parity wins, reduce scope; accept prettier drift; document drift; agent decides | Parity wins, reduce scope |
| Downstream artifact | Docs + usage map + migration notes; code + README only; visual catalog/storybook; agent decides | Docs + usage map + migration notes |

**User's choice:** Phase 2 should create docs and components, migrate small shared surfaces, and leave enough documentation/mapping for downstream phases. It should not remove all app CSS/SCSS immediately, but all touched/new UI must be Tailwind-only.

**Notes:** The user asked whether the decisions were strict enough for the phase goal. The final answer confirmed the scope and added the explicit no-new-CSS-debt rule, which the user approved.

---

## the agent's Discretion

- Choose exact UI kit file structure.
- Choose exact component variant sets needed for Phase 3/4.
- Choose the safest small shared surfaces to migrate as proof of integration.
- Pull dialog foundation earlier if it is a blocker, without rewriting large dialog workflows.

## Deferred Ideas

- Full app-wide CSS/SCSS removal remains a milestone goal but is not entirely inside Phase 2.
- Priority page redesign belongs to Phase 4.
- App shell/shared surface migration belongs to Phase 3.
- Full high-risk dialog workflow migration is deferred unless replanned as a later slice.
