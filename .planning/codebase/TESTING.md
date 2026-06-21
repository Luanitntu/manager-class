# Testing Patterns

**Analysis Date:** 2026-06-21

## Test Framework

**Runner:**
- Jest 29 for backend tests.
- Config: `server/jest.config.js`.
- Transform: `ts-jest` with `server/tsconfig.json`.

**Assertion Library:**
- Jest built-in `expect`.
- Common matchers: `toBe`, `toEqual`, `toHaveBeenCalled`, `rejects.toThrow`.

**Run Commands:**
```bash
cd server
npm test                 # Run all backend tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
npm run test:e2e         # E2E command exists, but referenced config path is not present in rg scan

cd client
npm run lint             # Frontend lint
npm run typecheck        # Nuxt typecheck
```

## Test File Organization

**Location:**
- Backend tests are colocated with implementation files under `server/src`.
- Jest regex: `.*\.spec\.ts$`.
- No frontend test files or frontend test runner observed.

**Naming:**
- Unit tests use `*.spec.ts`.
- Existing examples: `salary.util.spec.ts`, `payment-status.util.spec.ts`, `recurrence.util.spec.ts`, `session-conflict.service.spec.ts`.

**Structure:**
```text
server/src/modules/
  assistant/
    salary.util.ts
    salary.util.spec.ts
  payment/
    payment-status.util.ts
    payment-status.util.spec.ts
  session/
    recurrence.util.ts
    recurrence.util.spec.ts
    session-conflict.service.ts
    session-conflict.service.spec.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('ModuleName', () => {
  it('handles expected case', () => {
    const result = functionUnderTest(input);
    expect(result).toBe(expected);
  });

  it('rejects invalid case', async () => {
    await expect(service.method(input)).rejects.toThrow('message');
  });
});
```

**Patterns:**
- Pure utility tests are preferred where business logic can be isolated.
- Service tests use lightweight mock objects for repositories.
- Async service behavior is tested with `await expect(...).rejects.toThrow(...)`.

## Mocking

**Framework:**
- Jest built-in mocks: `jest.fn()`.

**Patterns:**
```typescript
const repo = {
  findTeacherOverlaps: jest.fn(),
  findAssistantOverlaps: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});
```

**What to Mock:**
- Repositories and external dependencies for service tests.
- Database access should be mocked for unit tests.
- Time/date inputs should be explicit where possible.

**What NOT to Mock:**
- Pure functions such as recurrence, salary, and payment status utilities.

## Fixtures and Factories

**Test Data:**
- Existing tests use inline test data rather than shared factories.
- Use simple helper functions only when repeated setup grows.

**Location:**
- No shared `test/fixtures` directory observed.
- Keep small fixtures inside the spec file.

## Coverage

**Requirements:**
- No enforced coverage threshold observed in `server/jest.config.js`.
- Coverage can be generated with `npm run test:cov`.

**Configuration:**
- `collectCoverageFrom: ['**/*.(t|j)s']`.
- Coverage output: `server/coverage`.

**View Coverage:**
```bash
cd server
npm run test:cov
```

## Test Types

**Unit Tests:**
- Current primary test type.
- Covers pure utilities and domain services.
- Good candidates: scheduling conflicts, recurrence generation, payment status, salary calculations.

**Integration Tests:**
- No active integration test pattern observed.
- Prisma/database integration tests would need dedicated test DB setup.

**E2E Tests:**
- Script exists in `server/package.json`, but `test/jest-e2e.json` was not found in the current file scan.
- No Playwright or frontend E2E setup observed.

## Common Patterns

**Async Testing:**
```typescript
it('throws on conflict', async () => {
  await expect(service.assertNoConflicts(input)).rejects.toThrow('Teacher already has a session');
});
```

**Error Testing:**
```typescript
expect(() => calculateStatus(input)).toThrow();
await expect(service.method(input)).rejects.toThrow(ConflictException);
```

**Snapshot Testing:**
- Not used.

---
*Testing analysis: 2026-06-21*
*Update when test patterns change*
