# Technology Stack

**Analysis Date:** 2026-06-21

## Languages

**Primary:**
- TypeScript 5.7 - Frontend and backend application code.

**Secondary:**
- JavaScript / ESM config - ESLint, Jest, Nuxt, and package tooling.
- Prisma schema - Database model and migrations in `server/prisma/schema.prisma`.
- SCSS/CSS - Vuetify settings and global frontend styles.

## Runtime

**Environment:**
- Node.js 22+ - Required by `README.md` for local development.
- Browser runtime - Nuxt 4 app under `client/app`.
- Docker - Local and production-like services via `docker-compose.yml` and `docker-compose.dev.yml`.

**Package Manager:**
- npm - Separate lockfiles: `client/package-lock.json`, `server/package-lock.json`.
- No root `package.json`; run commands from `client/` or `server/`.

## Frameworks

**Core:**
- Nuxt 4 / Vue 3 - Frontend application in `client/app`.
- Vuetify - UI framework configured in `client/vuetify.config.ts`.
- Pinia - Auth/session state in `client/app/stores/auth.ts`.
- TanStack Query - Client data fetching plugin in `client/app/plugins/vue-query.ts`.
- FullCalendar - Calendar-first scheduling UI via `client/app/plugins/fullcalendar.client.ts`.
- NestJS 11 - Backend REST API in `server/src`.
- Prisma 6 - PostgreSQL ORM and migrations in `server/prisma`.
- BullMQ / Redis - Background job infrastructure, wired in `server/src/app.module.ts`.

**Testing:**
- Jest 29 with ts-jest - Backend unit tests, configured by `server/jest.config.js`.
- Vue/Nuxt frontend currently has typecheck and lint scripts, no test runner configured.

**Build/Dev:**
- Nuxt CLI - `npm run dev`, `npm run build`, `npm run typecheck` in `client/package.json`.
- Nest CLI - `npm run start:dev`, `npm run build` in `server/package.json`.
- ESLint 9 - Flat config in `client/eslint.config.mjs` and `server/eslint.config.mjs`.
- Prettier 3 - Backend formatting via `server/.prettierrc` and `npm run format`.

## Key Dependencies

**Critical:**
- `@nestjs/*` - HTTP API, DI, guards, config, Swagger, throttling, BullMQ integration.
- `@prisma/client` / `prisma` - Data access and schema migrations.
- `passport-jwt`, `@nestjs/jwt`, `argon2` - Custom JWT auth and password hashing.
- `class-validator`, `class-transformer` - DTO/env validation and request validation.
- `@aws-sdk/client-s3` - Cloudflare R2-compatible object storage.
- `exceljs` - Report export generation.
- `@fullcalendar/*` - Calendar views and interactions.
- `vee-validate`, `zod` - Frontend form validation.

**Infrastructure:**
- PostgreSQL 16 - Primary database in Docker.
- Redis 7 - BullMQ queue backend in Docker.
- Cloudflare R2 - File storage abstraction in `server/src/infra/storage/storage.service.ts`.
- Resend planned/configured by env name; current mail service logs when no key is set.

## Configuration

**Environment:**
- Backend env validation lives in `server/src/config/env.validation.ts`.
- Required backend env vars: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
- Optional backend env vars include `REDIS_HOST`, `REDIS_PORT`, `RESEND_API_KEY`, `EMAIL_FROM`.
- Storage service also reads `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- Frontend public API base is `NUXT_PUBLIC_API_BASE`, defaulting to `http://localhost:3001/api/v1`.

**Build:**
- `client/nuxt.config.ts` - Nuxt modules, runtime config, FullCalendar Vite prebundle.
- `server/tsconfig.json`, `server/tsconfig.build.json` - Backend TypeScript config.
- `server/nest-cli.json` - Nest build config.
- `docker-compose.yml` / `docker-compose.dev.yml` - Runtime services.

## Platform Requirements

**Development:**
- Node.js 22+ and npm.
- Docker for PostgreSQL and Redis.
- Start backend and frontend separately from `server/` and `client/`.

**Production:**
- Dockerized frontend and backend containers.
- PostgreSQL and Redis services required.
- API default port: 3001. Client default port: 3000.

---
*Stack analysis: 2026-06-21*
*Update after major dependency, runtime, or deployment changes*
