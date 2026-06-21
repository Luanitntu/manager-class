# Schedule Teacher

A multi-tenant SaaS Learning Management System (LMS) for language teachers.
Calendar-first UX: teachers manage **Sessions** (teaching events) directly from a
Google-Calendar-style interface, with classes, students, assistants, documents,
payments, reports and email automation built on top.

## Architecture

| Layer    | Stack                                                            |
| -------- | --------------------------------------------------------------- |
| Frontend | Nuxt 4, Vue 3, Vuetify, Pinia, TanStack Query, FullCalendar     |
| Backend  | NestJS, Prisma, PostgreSQL, Redis + BullMQ                       |
| Storage  | Cloudflare R2 (files), Resend (email)                           |

The backend is a **modular monolith** with a strict Controller → Service →
Repository layering. Every business entity belongs to a Teacher (the tenant key),
and tenant isolation is enforced on every query.

```
/server   NestJS API (REST, /api/v1)
/client   Nuxt 4 app
/docs      (see .claude/docs) — product & architecture specs
```

## Quick start (local development)

Prerequisites: Node 22+, Docker (for Postgres + Redis).

```bash
# 1. Start infrastructure
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d

# 2. Backend
cd server
cp .env.example .env
npm install
npx prisma migrate deploy   # apply schema
npm run prisma:seed         # demo admin + teacher + student
npm run start:dev           # http://localhost:3001/api/v1

# 3. Frontend
cd ../client
cp .env.example .env
npm install
npm run dev                 # http://localhost:3000
```

API docs (dev only): http://localhost:3001/api/v1/docs

### Demo credentials (after seed)

| Role        | Email                              | Password       |
| ----------- | ---------------------------------- | -------------- |
| Super Admin | admin@schedule-teacher.local       | admin123!      |
| Teacher     | teacher@schedule-teacher.local     | admin123!      |
| Student     | student@schedule-teacher.local     | admin123!      |

## Full stack via Docker

```bash
cp .env.example .env
docker compose up --build
```

## Project status

See [.claude/docs/# STATUS.md](.claude/docs/%23%20STATUS.md) for the live phase tracker.
