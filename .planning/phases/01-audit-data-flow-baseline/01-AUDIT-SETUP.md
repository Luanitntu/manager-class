# Phase 1 Audit Setup

## Environment Status

- Workspace: `C:\code\manager-class`
- Frontend app: `client/`, Nuxt 4, expected local URL `http://localhost:3000`
- Backend API: `server/`, NestJS, expected local URL `http://localhost:3001/api/v1`
- API docs: `http://localhost:3001/api/v1/docs` in non-production mode
- Infra: PostgreSQL on `localhost:5432`, Redis on `localhost:6379` via `docker-compose.dev.yml`
- Runtime blocker in this session: `node` and `npm` are not on PATH (`where.exe node` and `where.exe npm` returned no matches), so live server smoke tests, lint, typecheck, build, migrations, and seed execution could not be run here.

## Local Startup Commands

From repo root:

```powershell
docker compose -f docker-compose.dev.yml up -d
```

Backend:

```powershell
cd server
Copy-Item .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

Frontend:

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

## Environment Variables

- Backend example: `server/.env.example`
- Frontend example: `client/.env.example`
- Frontend API base: `NUXT_PUBLIC_API_BASE=http://localhost:3001/api/v1`
- Backend required: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Optional infra: Redis, Resend, Cloudflare R2 variables

## Seed Data and Credentials

Seed file: `server/prisma/seed.ts`

Seed creates:

| Role | Email | Username | Password Evidence | Notes |
|------|-------|----------|-------------------|-------|
| Super Admin | `admin@schedule-teacher.local` | `admin` | `admin123!` in seed hash input | README lists `Password123!`, which conflicts with seed. |
| Teacher | `teacher@schedule-teacher.local` | `teacher01` | `admin123!` in seed hash input | README lists `Password123!`, which conflicts with seed. |
| Student | Missing | Missing | Missing | No seeded student account. |
| Assistant | Missing | Missing | Missing | No seeded assistant account. |

Seed also creates one teacher-owned class: `Japanese N5` with id `00000000-0000-0000-0000-000000000001`.

## Data Coverage Notes

- Seed has teacher and class data only; no seeded sessions, enrolled students, documents, tuitions, scores, comments, or student user.
- Runtime reproduction of student pages requires creating at least one student and enrollment through teacher flows or a fixture.
- Runtime reproduction of dashboard/calendar/payment/document display requires adding data beyond the default seed.

## Verification Commands

Frontend, from `client/`:

```powershell
npm run lint
npm run typecheck
npm run build
```

Backend, from `server/`:

```powershell
npm run lint
npm run build
npm test
```

Closest verification completed in this session:

- Static file reads of app pages, composables, controllers, services, seed, env examples, and compose config.
- `rg` checks over route/API/composable usage.
- No secrets or token values were generated or recorded.

## Audit Method

Because runtime is blocked by missing Node/npm, Phase 1 evidence uses static cross-checks:

1. Page route reads under `client/app/pages`.
2. Feature composable reads under `client/app/composables`.
3. Backend controller/service reads under `server/src/modules`.
4. API envelope comparison against `client/app/composables/useApi.ts` and backend `PaginatedResult` usage.
5. Role-scope comparison against controller `@Roles(...)`, service branches, auth store, and route middleware.

