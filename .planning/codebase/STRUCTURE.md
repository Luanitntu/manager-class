# Codebase Structure

**Analysis Date:** 2026-06-21

## Directory Layout

```text
manager-class/
|-- client/                  # Nuxt 4 frontend
|   |-- app/                 # Vue app source
|   |   |-- pages/           # Route pages
|   |   |-- components/      # Shared dialogs/placeholders
|   |   |-- composables/     # Feature API clients
|   |   |-- stores/          # Pinia stores
|   |   |-- middleware/      # Nuxt route middleware
|   |   |-- layouts/         # auth/default layouts
|   |   `-- plugins/         # Vue Query and FullCalendar plugins
|   |-- nuxt.config.ts       # Nuxt config
|   `-- package.json         # Frontend scripts/deps
|-- server/                  # NestJS backend
|   |-- prisma/              # Prisma schema, seed, migrations
|   |-- src/                 # Backend source
|   |   |-- common/          # Guards, decorators, DTOs, filters, interceptors
|   |   |-- config/          # Env/config validation
|   |   |-- infra/           # Prisma and storage adapters
|   |   `-- modules/         # Domain modules
|   |-- jest.config.js       # Backend test config
|   `-- package.json         # Backend scripts/deps
|-- docker-compose.yml       # Full stack compose
|-- docker-compose.dev.yml   # Local infra compose
`-- README.md                # Project overview and quick start
```

## Directory Purposes

**client/app/pages:**
- Purpose: Nuxt route screens for dashboard, calendar, auth, classes, students, assistants, documents, payments, reports, audit logs.
- Contains: Vue single-file components named by route.
- Key files: `client/app/pages/calendar.vue`, `client/app/pages/login.vue`, `client/app/pages/classes.vue`.

**client/app/composables:**
- Purpose: API wrappers and feature data operations.
- Contains: `useApi.ts` plus feature composables.
- Key files: `client/app/composables/useApi.ts`, `useSessions.ts`, `useClasses.ts`.

**client/app/components:**
- Purpose: Reusable dialogs and shared UI components.
- Contains: PascalCase Vue SFCs.
- Key files: `SessionDialog.vue`, `StudentDetailDialog.vue`, `AssistantDetailDialog.vue`.

**server/src/modules:**
- Purpose: Backend domain modules.
- Contains: Nest `module`, `controller`, `service`, optional `repository`, DTOs, utilities/tests.
- Key modules: `auth`, `class`, `session`, `student`, `assistant`, `document`, `payment`, `report`, `notification`, `dashboard`, `audit`, `health`.

**server/src/common:**
- Purpose: Shared framework helpers and API infrastructure.
- Contains: Guards, decorators, DTOs, filters, interceptors, types, security helpers.
- Key files: `jwt-auth.guard.ts`, `roles.guard.ts`, `transform.interceptor.ts`, `password.service.ts`.

**server/prisma:**
- Purpose: Database schema, migrations, seed data.
- Contains: `schema.prisma`, `seed.ts`, migration folders.
- Key file: `server/prisma/schema.prisma` documents tenant rule and all models.

## Key File Locations

**Entry Points:**
- `server/src/main.ts`: Backend bootstrap.
- `server/src/app.module.ts`: Backend module graph and global providers.
- `client/app/app.vue`: Frontend app shell.
- `client/app/pages/index.vue`: Initial route redirect logic.

**Configuration:**
- `client/nuxt.config.ts`: Nuxt modules, runtime config, Vite optimization.
- `client/vuetify.config.ts`: Vuetify theme/component defaults.
- `server/src/config/configuration.ts`: Typed config projection.
- `server/src/config/env.validation.ts`: Required/optional env validation.
- `server/jest.config.js`: Backend test runner config.

**Core Logic:**
- `server/src/modules/*/*.service.ts`: Business rules.
- `server/src/modules/*/*.repository.ts`: Prisma data access.
- `server/prisma/schema.prisma`: Domain model.
- `client/app/composables/use*.ts`: Frontend feature API access.

**Testing:**
- `server/src/modules/**/*.spec.ts`: Backend unit tests colocated with source.
- No frontend test directory or runner observed.

**Documentation:**
- `README.md`: Project overview and local setup.
- `.planning/codebase/*.md`: Generated codebase map.

## Naming Conventions

**Files:**
- Backend files use kebab-case with role suffixes: `session-conflict.service.ts`, `payment-status.util.ts`.
- Backend tests use `*.spec.ts` next to source.
- Frontend route pages use kebab-case route names or simple nouns: `forgot-password.vue`, `students.vue`.
- Frontend components use PascalCase: `SessionDialog.vue`.

**Directories:**
- Domain directories are singular nouns under `server/src/modules`: `class`, `session`, `student`.
- Frontend folders follow Nuxt conventions: `pages`, `layouts`, `middleware`, `plugins`, `composables`.

**Special Patterns:**
- DTOs live under `dto/` folders in domain modules.
- Prisma migrations use numbered folders under `server/prisma/migrations`.

## Where to Add New Code

**New Backend Feature:**
- Module/controller/service/repository: `server/src/modules/<domain>/`.
- DTOs: `server/src/modules/<domain>/dto/`.
- Shared guards/decorators/types: `server/src/common/`.
- Database changes: `server/prisma/schema.prisma` plus migration.

**New Frontend Feature:**
- Page route: `client/app/pages/<route>.vue`.
- Feature API wrapper: `client/app/composables/use<Feature>.ts`.
- Reusable dialog/component: `client/app/components/<Name>.vue`.
- Cross-route auth behavior: `client/app/middleware/`.

**New Tests:**
- Backend unit tests: colocate `*.spec.ts` next to service/util.
- Prefer pure domain utilities for lightweight tests when possible.

**Utilities:**
- Backend pure helpers: relevant module or `server/src/common/utils`.
- Frontend shared helpers: `client/app/utils`.

## Special Directories

**server/dist:**
- Purpose: Build output.
- Source: Generated by Nest build.
- Committed: Should not be source of truth.

**client/.nuxt:**
- Purpose: Nuxt generated build/dev metadata.
- Source: Generated by Nuxt.
- Committed: Should not be source of truth.

**node_modules:**
- Purpose: Installed dependencies.
- Source: npm install.
- Committed: No.

---
*Structure analysis: 2026-06-21*
*Update when directory structure changes*
