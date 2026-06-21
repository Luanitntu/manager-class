# Codebase Concerns

**Analysis Date:** 2026-06-21

## Tech Debt

**Email delivery is stubbed:**
- Issue: `server/src/modules/mail/mail.service.ts` does not call Resend yet; it logs messages when configured key is absent and logs a fake sent message when present.
- Why: Comment indicates real Resend dispatch is planned for a later email automation phase.
- Impact: Verification and password reset flows may appear complete but do not send real email in production.
- Fix approach: Add Resend SDK/client, send real messages, test dev fallback explicitly.

**Frontend tests are absent:**
- Issue: `client/package.json` has lint/typecheck scripts but no unit/component/e2e test runner.
- Why: Frontend appears MVP-oriented and API-driven.
- Impact: Calendar/forms/auth UI regressions can slip through typecheck.
- Fix approach: Add Vitest/component tests or Playwright for core flows before major UI work.

**Report/E2E test script may be stale:**
- Issue: `server/package.json` has `test:e2e` pointing at `./test/jest-e2e.json`, but no matching file appeared in `rg --files`.
- Why: Nest scaffold script likely retained without e2e setup.
- Impact: `npm run test:e2e` will fail until config exists.
- Fix approach: Add e2e config or remove/replace the script.

## Known Bugs

**No confirmed runtime bugs from static scan:**
- Symptoms: Not observed.
- Trigger: Not observed.
- Workaround: N/A.
- Root cause: N/A.

## Security Considerations

**JWT fallback secrets in compose:**
- Risk: `docker-compose.yml` includes fallback values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- Current mitigation: Backend env validation requires values, but compose supplies defaults.
- Recommendations: Ensure production overrides these values and avoid deploying compose defaults.

**Persisted access/refresh tokens in frontend store:**
- Risk: `client/app/stores/auth.ts` persists tokens client-side, increasing exposure if browser storage is compromised.
- Current mitigation: Bearer token auth; refresh tokens are rotated and stored hashed server-side.
- Recommendations: Consider httpOnly cookie session storage for stronger XSS resilience, or harden CSP and token lifetime.

**Tenant isolation is critical and manual:**
- Risk: A missing `teacherId`/`tenantId` filter can expose cross-tenant data.
- Current mitigation: Many services use tenant helpers and repository methods such as `findOneForTenant`.
- Recommendations: Add regression tests for every new repository/service path that reads or writes tenant data.

**R2 upload validation is limited in storage service:**
- Risk: `server/src/infra/storage/storage.service.ts` accepts a buffer and original filename extension, but no content-type/size validation is visible there.
- Current mitigation: Higher-level document DTO/controller may constrain document type, but storage adapter itself does not.
- Recommendations: Validate file type, size, and extension before calling storage.

## Performance Bottlenecks

**Dashboard/report aggregate queries:**
- Problem: `dashboard.service.ts` and `report.service.ts` perform multiple database queries and report generation in request path.
- Measurement: No runtime measurements available.
- Cause: Direct Prisma reads and Excel generation without observed caching/background job.
- Improvement path: Add pagination/caching for heavy views and consider queued exports for large tenants.

**Session conflict batch checks:**
- Problem: `SessionConflictService.assertNoConflictsBatch()` checks generated slots one by one against existing sessions.
- Measurement: No runtime measurements available.
- Cause: Simple loop keeps logic clear but may scale poorly for large recurring batches.
- Improvement path: Query all overlaps for the full time range, then validate in memory.

## Fragile Areas

**Scheduling invariants:**
- Why fragile: Teacher and assistant overlap checks must stay consistent across create/update/bulk recurrence flows.
- Common failures: Missing exclude id on update, partial conflict checks for assistants, timezone mistakes.
- Safe modification: Add/maintain tests in `server/src/modules/session/session-conflict.service.spec.ts` and `recurrence.util.spec.ts`.
- Test coverage: Some unit coverage exists.

**Global guard order:**
- Why fragile: `server/src/app.module.ts` notes order matters: JWT auth, roles, then throttler.
- Common failures: Reordering can make roles run without user context or throttle public/auth routes unexpectedly.
- Safe modification: Treat provider order as intentional; add integration tests before changing.
- Test coverage: No guard-chain integration tests observed.

**Document storage lifecycle:**
- Why fragile: Document metadata in PostgreSQL and objects in R2 must stay consistent.
- Common failures: DB write succeeds after upload but cleanup fails, or delete removes metadata without object cleanup.
- Safe modification: Use transactions where possible and compensate object operations on failure.
- Test coverage: No storage integration tests observed.

## Scaling Limits

**Single modular backend:**
- Current capacity: Unknown; one Nest service instance plus PostgreSQL/Redis.
- Limit: Heavy report generation, large calendars, and file operations can compete with request handling.
- Symptoms at limit: Slow API responses or timeouts.
- Scaling path: Horizontal containers, DB indexes, pagination, caching, queued exports.

## Dependencies at Risk

**Nuxt 4 / NestJS 11 / Prisma 6:**
- Risk: Modern major versions may have breaking changes during upgrades.
- Impact: Build/type errors, module/plugin compatibility issues.
- Migration plan: Pin versions, upgrade one stack slice at a time, run typecheck/tests.

## Missing Critical Features

**Production email dispatch:**
- Problem: Real Resend sending is not implemented.
- Current workaround: Log mail content.
- Blocks: Real user verification/password reset in production.
- Implementation complexity: Low to medium.

**Frontend automated verification:**
- Problem: No automated browser/component tests for critical UX.
- Current workaround: Manual testing plus typecheck/lint.
- Blocks: Safer UI refactors.
- Implementation complexity: Medium.

## Test Coverage Gaps

**Tenant isolation coverage:**
- What's not tested: Cross-tenant denial for every module endpoint/repository.
- Risk: Data leak across teachers.
- Priority: High.
- Difficulty to test: Requires either service-level mocks or integration DB setup.

**Auth token lifecycle:**
- What's not tested: Refresh rotation, logout revocation, reset invalidating sessions.
- Risk: Session security regressions.
- Priority: High.
- Difficulty to test: Moderate with Prisma test DB or mocked Prisma.

**Storage/document flows:**
- What's not tested: Upload/download/delete behavior and failure compensation.
- Risk: Orphaned files or broken downloads.
- Priority: Medium.
- Difficulty to test: Requires mocked S3 client or local emulator.

---
*Concerns audit: 2026-06-21*
*Update as issues are fixed or new ones discovered*
