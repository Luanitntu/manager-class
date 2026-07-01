# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 - Tailwind UI Migration

**Shipped:** 2026-07-01
**Phases:** 5 | **Plans:** 34 | **Sessions:** 1 closeout session

### What Was Built

- Tailwind platform cutover with Vuetify/Sass package/config surface removed from the priority migration scope.
- Shared Tailwind UI kit for layout, controls, tables, feedback, dialogs, pagination, badges, alerts, skeletons, and empty states.
- Tailwind app shell, auth shell, calendar-critical surfaces, dashboards, SessionDialog, student schedule, and shared detail dialogs.
- Redesigned `/assistants`, `/assistants/[id]`, `/audit-logs`, shell profile modal, and `/profile`.
- Phase 5 verification evidence: static scans, cleanup classification, smoke screenshots/blockers, human UAT, final frontend gates, and phase verification.

### What Worked

- Staging the migration by platform, UI kit, shell, priority pages, then verification kept risk bounded.
- Human UAT caught visual parity gaps that automated scans could not see.
- Final Phase 5 scan classification made deferred old UI debt explicit instead of vague.

### What Was Inefficient

- Some stale GSD/tool path assumptions caused extra command retries.
- Automated screenshots for protected routes were auth-blocked, so human authenticated UAT had to close the visual evidence gap.
- Broad old UI debt remains substantial and needs its own milestone instead of being absorbed into verification.

### Patterns Established

- Use shared UI primitives for repeated cards, filters, dialogs, tables, empty states, and feedback.
- Keep frontend pages on composables; do not move API calls into UI components.
- Treat visual parity as a release gate with both static scans and human desktop/mobile review.

### Key Lessons

1. Build shared UI primitives before redesigning pages; it reduces one-off Tailwind markup.
2. Authenticated visual QA needs either a browser session or a seeded smoke user; otherwise screenshots only prove redirect behavior.
3. Classify broad old UI markers during verification so future polish has a concrete backlog.

### Cost Observations

- Model mix: inherited Codex agents plus local verification.
- Sessions: 1 closeout session for Phase 5 completion and milestone archive.
- Notable: parallel GSD executor/verifier agents sped up artifact-heavy verification, but human UAT remained necessary.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.1 | 1 closeout session | 5 | UI migration was verified through phased scans, final gates, and human UAT. |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.1 | lint/typecheck/build + UAT | Priority UI migration scope | Shared Tailwind UI primitives reused existing stack. |

### Top Lessons (Verified Across Milestones)

1. Calendar-first teacher workflow should stay central during UI migration.
2. Deferred surfaces need explicit classification, not quiet omission.

