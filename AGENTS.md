# Agent Guide

This project uses GSD planning artifacts in `.planning/`.

## Current Goal

Schedule Teacher v1 is a polish release: refresh teacher/student UI and fix data-display/stability bugs in the existing codebase.

Before planning or editing, read:

1. `.planning/PROJECT.md`
2. `.planning/ROADMAP.md`
3. Relevant `.planning/codebase/*.md` files

## Product Priorities

- Teacher and student experiences first.
- Center role is deferred.
- Calendar-first teacher workflow must remain central.
- Fix bugs where data exists but pages do not show it.
- Use PREP-style education SaaS feel only as inspiration; do not copy brand/assets.

## Codebase Patterns

- Frontend: Nuxt 4, Vue 3, Vuetify, Pinia, TanStack Query.
- Backend: NestJS, Prisma, PostgreSQL, Redis/BullMQ.
- Backend pattern: Controller -> Service -> Repository.
- Frontend pages should use feature composables; do not call APIs directly inside components.
- Tenant isolation is critical: all teacher-owned data must be scoped by `teacherId`/`tenantId`.

## Verification

Use the repo's existing scripts when touching relevant areas:

- Frontend: `npm run lint`, `npm run typecheck`, `npm run build` from `client/`.
- Backend: `npm run lint`, `npm run build`, `npm test` from `server/`.

If a command cannot be run in the current environment, document why and include the closest verification performed.
