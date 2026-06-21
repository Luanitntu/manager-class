# Architecture

**Analysis Date:** 2026-06-21

## Pattern Overview

**Overall:** Full-stack modular monolith with separate Nuxt frontend and NestJS REST backend.

**Key Characteristics:**
- Calendar-first SaaS LMS for language teachers.
- Multi-tenant data model; `teacherId` is the tenant key for business entities.
- Backend follows Controller -> Service -> Repository layering for core domains.
- Frontend uses pages, composables, Pinia state, and shared API client.
- PostgreSQL is the source of truth; Redis/BullMQ supports async processing.

## Layers

**Frontend Page Layer:**
- Purpose: Route-level UI and workflow screens.
- Contains: Vue SFC pages under `client/app/pages`.
- Depends on: Composables, Pinia stores, Vuetify components.
- Used by: Nuxt router.

**Frontend Data Layer:**
- Purpose: Typed API access per feature.
- Contains: `client/app/composables/useApi.ts`, `useClasses.ts`, `useSessions.ts`, `useStudents.ts`, and related composables.
- Depends on: `$fetch`, runtime config, auth store.
- Used by: Pages and dialogs.

**Backend API Layer:**
- Purpose: Expose REST endpoints and apply route decorators.
- Contains: `*.controller.ts` files under `server/src/modules/*`.
- Depends on: Services, DTOs, guards/decorators.
- Used by: HTTP clients through `/api/v1`.

**Backend Service Layer:**
- Purpose: Business rules, tenant scoping, validation, transactions, orchestration.
- Contains: `*.service.ts` files such as `session.service.ts`, `payment.service.ts`, `auth.service.ts`.
- Depends on: Repositories, PrismaService, infra services, domain utilities.
- Used by: Controllers.

**Backend Repository Layer:**
- Purpose: Prisma query encapsulation for domain aggregates.
- Contains: `*.repository.ts` files for class, session, student, assistant, document, payment.
- Depends on: `server/src/infra/prisma/prisma.service.ts`.
- Used by: Services.

**Infrastructure Layer:**
- Purpose: Cross-cutting adapters for persistence, storage, queues, config.
- Contains: `server/src/infra/prisma`, `server/src/infra/storage`, `server/src/config`.
- Depends on: External clients and environment variables.
- Used by: Domain modules.

## Data Flow

**Authenticated REST Request:**
1. Client page calls a feature composable such as `useClasses()`.
2. Feature composable calls `useApi().request()` with an API path.
3. `useApi.ts` attaches the bearer token from `useAuthStore`.
4. Nest global `JwtAuthGuard` validates JWT unless route has `@Public()`.
5. `RolesGuard` checks role metadata when present.
6. Controller receives DTOs validated by the global `ValidationPipe`.
7. Service resolves tenant scope from `AuthenticatedUser.tenantId`.
8. Repository executes tenant-filtered Prisma queries.
9. `TransformInterceptor` wraps response data in the standard API envelope.

**Authentication Flow:**
1. Public routes in `AuthController` accept login/register/refresh/reset requests.
2. `AuthService` validates credentials with `PasswordService`.
3. Access and refresh JWTs are signed with env-configured secrets.
4. Refresh token hash is persisted in the database and rotated on refresh.
5. Frontend stores session in persisted Pinia state.

**State Management:**
- Backend is request-scoped/stateless except database, Redis queues, and persisted refresh/auth tokens.
- Frontend auth session is persisted via `pinia-plugin-persistedstate`.
- Server data is fetched through composables, with TanStack Query available for caching patterns.

## Key Abstractions

**Tenant Scope:**
- Purpose: Enforce data isolation per teacher.
- Examples: `tenantId(actor)` helpers in services, `findOneForTenant()` repository methods.
- Pattern: Service resolves tenant; repository filters by `teacherId`.

**Domain Module:**
- Purpose: Group controller/service/repository/DTO for each business area.
- Examples: `server/src/modules/session`, `server/src/modules/payment`, `server/src/modules/document`.
- Pattern: Nest module per domain.

**DTO:**
- Purpose: Validate inbound request shape and generate Swagger metadata.
- Examples: `server/src/modules/auth/dto/auth.dto.ts`, `session/dto/session.dto.ts`.
- Pattern: class-validator decorators.

**Feature Composable:**
- Purpose: Frontend API facade per business area.
- Examples: `client/app/composables/useSessions.ts`, `usePayments.ts`.
- Pattern: Composition API functions using `useApi()`.

## Entry Points

**Backend HTTP Server:**
- Location: `server/src/main.ts`.
- Triggers: `npm run start:dev`, `npm run start:prod`, Docker container.
- Responsibilities: Create Nest app, set global prefix, CORS, validation, filters, Swagger, listen on port.

**Backend Root Module:**
- Location: `server/src/app.module.ts`.
- Triggers: Nest bootstrap.
- Responsibilities: Register config, guards, interceptors, infra modules, domain modules.

**Frontend App:**
- Location: `client/app/app.vue` and `client/nuxt.config.ts`.
- Triggers: Nuxt dev/build runtime.
- Responsibilities: Render layouts/pages, load plugins, configure modules and runtime API base.

## Error Handling

**Strategy:** Backend throws Nest exceptions or lets errors bubble to `AllExceptionsFilter`; frontend extracts API errors with `client/app/utils/error.ts`.

**Patterns:**
- Services throw `ForbiddenException`, `NotFoundException`, `ConflictException`, `UnauthorizedException` for domain failures.
- Repositories often use `updateMany`/`deleteMany` with scoped filters, then services check counts.
- Global validation rejects unknown DTO fields with `forbidNonWhitelisted: true`.

## Cross-Cutting Concerns

**Logging:**
- Nest `Logger` in bootstrap, storage, and mail service.

**Validation:**
- Backend env validation in `server/src/config/env.validation.ts`.
- Backend request validation by global `ValidationPipe`.
- Frontend forms use Zod/VeeValidate.

**Authentication:**
- Global JWT guard in `server/src/app.module.ts`.
- Public routes marked with `server/src/common/decorators/public.decorator.ts`.

**Authorization:**
- Role metadata via `server/src/common/decorators/roles.decorator.ts`.
- Tenant isolation enforced in services/repositories with `teacherId` filters.

---
*Architecture analysis: 2026-06-21*
*Update when major patterns change*
