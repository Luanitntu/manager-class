# STATUS.md

# Project Status

Last Updated: 2026-06-20

---

# Current Phase

MVP complete — all 12 phases implemented. Ready for integration testing
against a live PostgreSQL + Redis (see Blockers re: local Docker).

---

# Completed

## Planning
* Business Requirements Defined
* Roles Defined
* Tech Stack Defined
* Multi Tenant Strategy Defined
* Calendar First Strategy Defined

## Phase 1 — Project Setup
* Monorepo structure (/server, /client)
* NestJS server scaffold (config validation, typed config, global ValidationPipe)
* Standardized API envelope (TransformInterceptor + AllExceptionsFilter)
* Pagination primitives (PaginationQueryDto, PaginatedResult)
* PrismaModule/PrismaService (global), health endpoint, Swagger (dev)
* Nuxt 4 client scaffold (Vuetify Spike-theme, Pinia + persist, TanStack Query)
* Sidebar + topnav layout, dashboard/calendar placeholder pages
* API composable layer (useApi) — components never call APIs directly
* Docker: docker-compose.yml (full), docker-compose.dev.yml (infra), Dockerfiles
* Environment: .env.example for root + server + client
* CI/CD skeleton: GitHub Actions (server + client lint/build), .gitignore, README
* Git repository initialized
* Verified: both server and client build successfully

## Phase 2 — Database Design
* Complete multi-tenant Prisma schema (24 models)
  - Identity/Auth: User, AssistantProfile, StudentProfile, RefreshToken, AuthToken
  - Core: Class, ClassEnrollment, ClassAssistant, TeachingSession, SessionAssistant
  - Academic: Score, StudentComment
  - Documents: Document, DocumentAssignment
  - Payments: Tuition, PaymentRecord
  - Feedback: Evaluation
  - Audit: AuditLog
* Tenancy: `teacherId` on every business entity (tenant key)
* Conventions applied: UUID PKs, snake_case columns, soft-delete (deletedAt),
  auditability (createdAt/updatedAt/createdBy/updatedBy)
* Initial migration generated (prisma/migrations/0001_init)
* Seed script (super admin + demo teacher + sample class)

## Phase 3 — Auth, Authorization & Multi-Tenant Foundation
* Common security primitives:
  - AuthenticatedUser/JwtPayload types (with resolved `tenantId`)
  - @Public, @Roles, @CurrentUser decorators
  - JwtAuthGuard (global) + RolesGuard (global) + ThrottlerGuard (global)
  - PasswordService (argon2), crypto util (opaque token + sha256 hashing)
* Auth module: register (TEACHER self-signup), login, refresh (with rotation),
  logout, forgot/reset password, email verification, /me
  - Refresh tokens stored hashed + rotated; password change revokes all sessions
  - Email enumeration protection on forgot-password
* JWT strategy validates user still exists & not LOCKED on every request
* Mail module (global): dev-logging stub; real Resend wiring deferred to Phase 10
* User module (tenant-aware):
  - Own profile get/update (all roles)
  - Teacher: create/list/soft-delete members (ASSISTANT/STUDENT) in own tenant
  - Super Admin: list all, lock/unlock, reset password (per permission matrix)
* Frontend auth: useAuth composable, login & register pages (VeeValidate + Zod),
  global auth middleware, persisted Pinia session, layout logout wiring
* Verified: server + client build and lint clean

## Phase 4 — Class, Session & Calendar
* Class module (Controller → Service → Repository):
  - Tenant-scoped CRUD with soft delete
  - Role-scoped reads (Teacher: all; Assistant: assigned; Student: enrolled)
  - Enrollment (student) + assistant assignment, with tenant-ownership checks
* Session module (calendar-first):
  - Range query feed (role-scoped) for month/week/day views
  - Create / update (reschedule + resize) / soft-delete
  - Bulk recurring generation (days-of-week × date range × time) w/ group id
  - SessionConflictService: teacher overlap + assistant overlap + intra-batch
    overlap, validated before every write
* Calendar frontend: FullCalendar (month/week/day), click-slot create,
  click-event edit, drag/resize reschedule, recurring mode in SessionDialog
* Classes management page; profile page; placeholder pages for later modules
* Unit tests: recurrence generator + conflict detection (8 tests passing)
* Verified: server build+lint+test, client build+lint all green

## Phase 5 — Student Module
* Student module (Controller → Service → Repository):
  - Teacher: list/search students, view detail (profile + enrollments),
    update personal + educational profile (upsert StudentProfile)
  - Academic records: scores (MIDTERM/FINAL/ASSIGNMENT/QUIZ/CUSTOM) CRUD,
    comments (attitude/strengths/weaknesses/progress) create/list/delete
  - Access control: teacher (tenant), assistant (shared assigned class),
    student (self read + own-profile edit)
* Frontend: students list + create (via User module), detail dialog with
  Profile / Scores / Comments tabs
* Verified: server build+lint, client build+lint green

## Phase 6 — Assistant Teacher Module
* Assistant module (Controller → Service → Repository):
  - Teacher: list assistants, view detail (profile + class assignments),
    set salary config (method + rate + bio via AssistantProfile upsert)
  - Salary calculation (pure util): PER_SESSION / PER_HOUR / PER_CLASS,
    broken down per class + totals, optional date range
  - Assistant self-view (`/assistants/me/salary`, own detail)
* salary.util unit tests (4) — 12 server tests total passing
* Frontend: assistants list + create, detail dialog (salary config + summary
  table + assignments)

## Phase 7 — Documents Module
* StorageService abstraction (global): working local-disk dev impl with a
  clean seam for Cloudflare R2 (S3) — see TODO in putObject
* Document module (Controller → Service → Repository):
  - Create LINK / metadata; upload PDF/MP3 via separate multipart endpoint
    (FileInterceptor, 50 MB cap); streamed download (StreamableFile)
  - Categories (A1..B2), role-scoped list (teacher all; assistant/student shared)
  - Owner-only update/delete; assign to class or individual student
  - Both Teacher and Assistant can create/own documents (per permission matrix)
* Frontend: documents grid, add link / upload file, category filter, share dialog
* Verified: server build+test(12)+lint, client build+lint green

## Phase 8 — Payments Module
* payment-status util (pure): status derivation (PAID/PARTIALLY_PAID/OVERDUE/
  PENDING) + receipt number generator; 5 unit tests (17 total passing)
* Payment module (Controller → Service → Repository):
  - Tuition CRUD (total/paid/status/dueDate) per student+class
  - Record payment (installments): atomic transaction bumps paidAmount,
    recomputes status, generates unique receipt number
  - Role-scoped reads (teacher tenant; student own); receipt lookup
* Frontend: payments table w/ status chips, new tuition, detail + record
  payment + payment history
* Verified: server build+test(17)+lint, client build+lint green

## Phase 9 — Reports
* ReportService (ExcelJS): tuition status + student scores workbooks
* SkipTransform decorator + Reflector-aware TransformInterceptor (registered as
  APP_INTERCEPTOR) so binary/file responses bypass the JSON envelope
* Report endpoints return .xlsx (teacher only); frontend auth'd blob download
* PDF (Puppeteer) deferred — data layer reusable by a future renderer

## Phase 10 — Email Automation
* BullMQ wired (BullModule.forRootAsync from Redis config)
* Notification queue + processor (WorkerHost): session-changed, session-reminder
  (delayed 30 min before start), payment-reminder
* NotificationService enqueues; failures (e.g. Redis down) are logged, never
  break the originating request
* Hooks: session create/bulk schedule reminders; update notifies + reschedules;
  delete notifies cancellation; payment reminder endpoint + frontend button
* MailService still dev-logs until RESEND_API_KEY set (Resend dispatch is the
  remaining seam)

## Phase 11 — Dashboard
* DashboardService: role-based stats (super-admin / teacher / assistant / student)
  incl. upcoming sessions, tuition aggregates, counts
* Frontend dashboard wired to live stats + upcoming-sessions list

## Phase 12 — Audit Logs
* AuditModule (global): AuditService.log (best-effort, never breaks requests) +
  list (teacher own-tenant / super-admin all)
* Logging wired into class create/update/delete, session create/update/delete,
  payment recorded
* Frontend audit-logs viewer (action chips, actor, entity, timestamp)

---

# In Progress

Nothing — MVP feature set complete.

---

# Next Tasks (post-MVP / integration)

1. Run `prisma migrate deploy` + seed against a live PostgreSQL; smoke-test
   auth → calendar → payments end-to-end
2. Wire real Resend dispatch in MailService (currently dev-logs)
3. Wire Cloudflare R2 adapter in StorageService (currently local disk)
4. Add Puppeteer PDF rendering for reports (Excel done)
5. Periodic OVERDUE recompute + reminder cron (@nestjs/schedule)
6. Broaden automated test coverage (e2e against a test DB); `npm audit fix`

---

# Blockers

None.

Note: Docker is not installed on the current dev machine, so migrations could
not be applied against a live DB locally. Migration SQL was generated via
`prisma migrate diff` and is valid; `prisma migrate deploy` will run in CI/Docker.

---

# Decisions

2026-06-20

* Use NestJS, Nuxt 4, PostgreSQL, Prisma, Redis + BullMQ
* Use Cloudflare R2, Resend, Calendar-First UX, Spike Template foundation
* Followed workflow Development Order (Phase 1 setup before Phase 2 DB),
  which differs from the original STATUS "Next Tasks" list — setup is a
  hard prerequisite for the schema to compile.
* NestJS 11 / Prisma 6 / Nuxt 4 / Pinia 3 (dependency-resolution driven upgrades:
  pinia 3 + @pinia/nuxt 0.11 for persistedstate v4; apexcharts 5 for vue3-apexcharts)
* Argon2 for password hashing
* User model unifies all roles (role enum); role-specific data in profile tables
* Tenant key = `teacherId`; teacher/super-admin have null teacherId
* API envelope: { success, data, meta? } / { success, message, errors }

---

# Technical Debt

* npm audit reports vulnerabilities in transitive deps (server 24, client 5) —
  revisit with `npm audit fix` before production.
* Migration not yet validated against a live PostgreSQL instance (no local Docker).
* Swagger DTO annotations to be added as modules are built.

---

# Notes For AI

Always read before generating code:
1. PROJECT_CONTEXT.md
2. TECH_STACK.md
3. STATUS.md

Update STATUS.md after completing any major task.
Do not regenerate completed work.
