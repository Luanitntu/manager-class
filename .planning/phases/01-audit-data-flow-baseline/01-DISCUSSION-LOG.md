# Phase 1: Audit & Data Flow Baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 1-Audit & Data Flow Baseline
**Areas discussed:** Audit scope, Test data source, Bug ledger format, Verification depth

---

## Audit Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Audit all teacher/student core pages | Broad audit across all core teacher and student pages in Phase 1. | yes |
| Start only from visibly broken pages | Narrow first pass around user-reported broken pages. | |

**User's choice:** Accepted recommendation to audit all teacher/student core pages.
**Notes:** Priority order should still start with likely data-missing routes: dashboard, calendar, classes, students, documents, payments.

---

## Test Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Use existing seed/demo data first | Avoid creating data before knowing what is missing. | yes |
| Create dedicated fixtures immediately | More controlled, but could slow initial audit. | |

**User's choice:** Accepted recommendation to use existing seed/demo data first.
**Notes:** Small fixtures are allowed if a teacher/student scenario cannot be reproduced with existing data.

---

## Bug Ledger Format

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated `01-BUG-LEDGER.md` | Keeps bug evidence separate from implementation decisions. | yes |
| Keep bug list inside `01-CONTEXT.md` | Simpler file count but context becomes noisy. | |

**User's choice:** Accepted recommendation to create a dedicated bug ledger.
**Notes:** Ledger should capture route, role, expected data, observed UI, suspected layer, evidence, severity, and next action.

---

## Verification Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Manual smoke plus API/browser evidence | Fastest path to map current bug surface. | yes |
| Automated checks immediately | Useful where cheap, but may distract from discovery. | partial |

**User's choice:** Accepted recommendation: manual/API/browser evidence first; automated checks only when low-cost and clearly useful.
**Notes:** Phase 1 should not become a test-infrastructure project.

---

## the agent's Discretion

- The agent may decide route order inside the teacher/student audit.
- The agent may choose the best evidence type per bug.
- The agent may add small targeted tests when the code path is isolated and quick to cover.

## Deferred Ideas

- Center role audit and center workflows are deferred.
- Full UI redesign starts in Phase 2, after this audit baseline.
