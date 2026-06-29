# Phase 1: Styling Platform Cutover - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 1-Styling Platform Cutover
**Areas discussed:** Cutover Boundary, SCSS Removal Depth, Icon Strategy, Migration Inventory, Verification Rule

---

## Cutover Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Real cutover | Remove Vuetify module/config/settings/deps in Phase 1; replace minimum blockers so build stays alive. | yes |
| Temporary bridge | Keep Vuetify module temporarily and only detach pieces first. | |
| Agent decides | Planner chooses after deeper scan. | |

**User's choice:** Accepted recommendation: real cutover.
**Notes:** Phase 1 should avoid broad page redesign; only replace blockers needed to remove Vuetify.

---

## SCSS Removal Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Remove global and blocking direct imports | Remove `main.css` SCSS import and convert SCSS that blocks current build path. | yes |
| Remove every SCSS file now | Convert all SCSS across app in Phase 1. | |
| Inventory non-blockers | Document remaining non-blocking style work for later phases. | yes |

**User's choice:** Accepted recommendation: remove global SCSS plus blocking direct imports; inventory the rest.
**Notes:** Avoid pulling page redesign work from later phases into Phase 1.

---

## Icon Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Keep `@mdi/font` with `AppIcon` | Preserve current MDI icon names without Vuetify `v-icon`. | yes |
| Switch icon library now | Replace MDI with another icon package during Phase 1. | |
| Agent decides | Planner chooses based on scan. | |

**User's choice:** Accepted recommendation: keep `@mdi/font` and add an app-level icon primitive.
**Notes:** Future icon migration can happen behind `AppIcon`.

---

## Migration Inventory

| Option | Description | Selected |
|--------|-------------|----------|
| Simple markdown list | List affected files only. | |
| Detailed inventory | Include file, role, Vuetify tags, SCSS imports, priority, owning phase, notes. | yes |
| Agent decides | Planner chooses format. | |

**User's choice:** Accepted recommendation: detailed inventory.
**Notes:** Inventory should guide Phase 2 UI kit, Phase 3 shell/shared surfaces, and Phase 4 priority pages.

---

## Verification Rule

| Option | Description | Selected |
|--------|-------------|----------|
| Build must pass | `lint`, `typecheck`, and `build` should pass after real cutover. | yes |
| Allow known Vuetify failures | Permit documented failures if remaining Vuetify blocks build. | |
| Environment-only exceptions | Document exact reason only when commands cannot run. | yes |

**User's choice:** Accepted recommendation: frontend verification should pass unless the environment prevents running commands.
**Notes:** A Phase 1 cutover is not complete if failures are caused by unresolved Vuetify dependency.

---

## the Agent's Discretion

- Planner may choose exact minimal replacement approach for build stability.
- Planner may choose exact inventory path/name under the Phase 1 directory.

## Deferred Ideas

- Full UI kit design and component system belongs to Phase 2.
- Full app shell migration belongs to Phase 3 unless required as a Phase 1 blocker.
- Priority page redesign belongs to Phase 4.
- Icon library replacement is deferred.
