# Coding Conventions

**Analysis Date:** 2026-06-21

## Naming Patterns

**Files:**
- Backend uses kebab-case plus Nest role suffixes: `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.module.ts`.
- Backend DTOs live in `dto/*.dto.ts`.
- Backend tests use `*.spec.ts` alongside source.
- Frontend composables use `useX.ts` naming.
- Frontend components use PascalCase `.vue` files.

**Functions:**
- camelCase for methods and helpers.
- Service methods are verb-oriented: `create`, `findOne`, `update`, `remove`, `assertNoConflicts`.
- Guard/helper methods often encode domain intent: `tenantId`, `assertClassOwned`, `assertMemberInTenant`.

**Variables:**
- camelCase for locals and parameters.
- UPPER_SNAKE_CASE for constants such as token TTLs or queue names.
- No underscore prefix for private class members; TypeScript `private` is used.

**Types:**
- PascalCase for interfaces and classes.
- Prisma enums use PascalCase names and UPPER_CASE values.
- DTO classes use PascalCase with `Dto` suffix.

## Code Style

**Formatting:**
- Backend Prettier config in `server/.prettierrc`.
- Single quotes, trailing commas, semicolons, print width 100.
- TypeScript strict mode is enabled in Nuxt and backend configs.

**Linting:**
- ESLint flat configs: `client/eslint.config.mjs`, `server/eslint.config.mjs`.
- Commands: `npm run lint` in each package.
- Backend lint script currently uses `--fix`.

## Import Organization

**Order:**
1. External packages (`@nestjs/*`, `@prisma/client`, Vue/Nuxt packages).
2. Internal config/common/infra imports.
3. Relative module imports.
4. Type imports where needed.

**Grouping:**
- Existing backend files usually group imports by source with no elaborate sorting.
- Prefer keeping Nest/controller decorators together and DTO imports together.

**Path Aliases:**
- No widespread custom source alias observed in app code.
- Use relative imports in backend modules.
- Nuxt uses `~/` for frontend app paths in config and CSS imports.

## Error Handling

**Patterns:**
- Backend services throw Nest HTTP exceptions for expected failures.
- Authentication failures use `UnauthorizedException`; tenant/scope failures use `ForbiddenException` or `NotFoundException`.
- Conflict rules use `ConflictException`, especially scheduling and uniqueness flows.
- Frontend pages call composables and display extracted API errors via `client/app/utils/error.ts`.

**Error Types:**
- Throw when a domain invariant fails.
- Return data objects for successful service operations.
- Use repository `updateMany`/`deleteMany` for scoped writes, then check affected count in service.

## Logging

**Framework:**
- Nest `Logger` in backend infrastructure and bootstrap.
- No frontend logging convention observed.

**Patterns:**
- Log infrastructure readiness/warnings, such as storage credentials or dev mail output.
- Avoid logging secrets; document only env var names.

## Comments

**When to Comment:**
- Explain business invariants and security-critical rules.
- Existing high-value examples: tenant rule in `server/prisma/schema.prisma`, guard order in `server/src/app.module.ts`, conflict rules in `session-conflict.service.ts`.

**JSDoc/TSDoc:**
- Used selectively for services, decorators, and domain invariants.
- Not required for every internal method.

**TODO Comments:**
- No formal TODO pattern observed.

## Function Design

**Size:**
- Services may be moderately long but should keep validation/orchestration readable.
- Extract pure business rules to utilities when testable, as with `payment-status.util.ts`, `recurrence.util.ts`, `salary.util.ts`.

**Parameters:**
- Prefer DTO objects for request payloads.
- Use small options/check objects for multi-field domain operations, e.g. `ConflictCheck`.

**Return Values:**
- Services return DTO-like plain objects/entities.
- API responses are wrapped globally by `TransformInterceptor`.

## Module Design

**Exports:**
- Nest modules export providers only when needed by other modules.
- Frontend composables return functions and query/mutation helpers.

**Barrel Files:**
- No barrel-file-heavy pattern observed; import directly from concrete files.

---
*Convention analysis: 2026-06-21*
*Update when patterns change*
