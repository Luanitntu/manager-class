# Phase 1 Bug Ledger

**Phase:** Audit & Data Flow Baseline
**Created:** 2026-06-21
**Purpose:** Track teacher/student data-display and navigation bugs discovered during Phase 1.

## How To Use

Add one row per reproduced issue. Keep entries factual and evidence-backed.

| ID | Role | Route/Page | Expected Data | Observed UI | Suspected Layer | Evidence | Severity | Status | Next Action |
|----|------|------------|---------------|-------------|-----------------|----------|----------|--------|-------------|
| BUG-001 | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Open | Reproduce during Phase 1 audit |

## Severity Guide

- **High:** Blocks teacher/student core workflow or hides important data.
- **Medium:** Misleading UI, partial data loss, or workaround required.
- **Low:** Cosmetic or minor state mismatch that does not block workflow.

## Suspected Layer Guide

- **API:** Backend returns missing/wrong/unauthorized data.
- **Composable:** Frontend API wrapper calls wrong endpoint or unwraps response incorrectly.
- **Store/Auth:** Wrong role/session/token state causes route or API mismatch.
- **Component:** Data reaches page but rendering/filtering/state hides it.
- **Pagination/Meta:** Data exists but list/pagination/meta handling drops it.
- **Seed/Data:** Expected scenario is missing from local seed/demo data.

## Notes

- Start with existing seed/demo data.
- Add small fixtures only when needed to reproduce teacher/student scenarios.
- Keep center-role issues out of this ledger unless they block teacher/student audit setup.
