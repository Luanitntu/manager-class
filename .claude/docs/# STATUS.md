# STATUS.md

# Project Status

Last Updated: 2026-06-22

---

# Current Phase

MVP complete (12 phases) + post-MVP enhancements live (i18n, per-user timezone,
per-session instructor, detail pages, Super Admin platform management).

---

# Post-MVP — Super Admin Platform Management (2026-06-21)

Philosophy: Super Admin operates the PLATFORM, never a teacher's educational
data (tenant isolation preserved).

* Role-based sidebar — each role sees its own menu:
  - SUPER_ADMIN: Dashboard · Users · Audit Logs · Settings · Profile
  - TEACHER: full teaching menu
  - ASSISTANT: Dashboard · Calendar · Documents · Profile
  - STUDENT: Dashboard · Calendar · Documents · Payments · Profile
* Users admin page (/admin/users): list all users, filter by role, search,
  lock/unlock, reset password (backend endpoints already existed).
* System Settings: SystemSetting singleton model + migration 0005;
  GET /settings (public — for login/register), PATCH /settings (super admin);
  page /admin/settings (platform name, support email, allow-registration,
  default timezone).
* Platform statistics (Dashboard) + system-wide Audit Logs were already done.
* Tenant lifecycle = managed via Users page (lock/unlock/reset teachers).

V2 (deferred): subscription plans, billing, per-plan feature limits, dedicated
tenant onboarding/approval flow.

## Super Admin — Round 2 (2026-06-21)
* Fix: Users list requested limit=200 (> max 100) → 400/empty. Also role filter
  used a `undefined` v-select value (couldn't reselect "All") → now `''`.
* Sidebar adds Health for Super Admin. PrismaService retries connection (5×3s)
  so Neon serverless cold-starts don't crash boot.
* Dashboard (super admin): + assistants count, platform revenue (collected /
  outstanding), revenue-by-teacher (top 5), subscription-plan counts, and a
  6-month subscription-revenue bar chart (ApexCharts). Plan/revenue numbers are
  placeholders until billing (V2); data shape is final.
* Users: admin user detail page (/admin/users/[id]) — account, subscription
  (placeholder), and teacher tenant stats (classes/students/assistants/revenue);
  lock/unlock/reset from the page. Backend: GET /users/admin/:id.
* Health: GET /health/system (super admin) now reports DB(provider+latency),
  Redis, Node/NestJS/Prisma versions, OS platform/arch/host, CPU cores+model+
  load, RAM total/used/%, process RSS/heap, uptime — all via `os`, so it's
  accurate on any host (local/VPS/cloud). Page /admin/health auto-refreshes on a
  Settings-driven interval (default 300s).
* Settings: SystemSetting + migrations 0006 (Mail Resend + R2 creds) and 0007
  (maintenanceMode, storageDriver, healthRefreshSeconds). Public GET is
  secret-free; GET /settings/admin returns full; PATCH ignores blank fields.
  Page sections: General, Operational (maintenance toggle, storage driver,
  health refresh), Email, Storage.
* StorageService is now RUNTIME-configurable: driver (local|r2) + R2 creds read
  from DB settings (fallback env) per request; getObjectStream prefers a local
  copy then R2 — so you can flip to local if R2 fails without redeploying.
* Maintenance mode: global middleware sends non-admins to /maintenance when on
  (Super Admin bypasses); flag from public /settings, cached per session.

NOTE (kept intentionally for later): app services (MailService) still read keys
from env; the DB-stored Mail/R2 keys + plan/revenue data are wired into the UI
now and will be consumed when those features ship.

## Super Admin — Round 3 (2026-06-21)
* Fix (maintenance redirect loop): auth + maintenance were two global middlewares
  fighting (one → /login, one → /maintenance). Merged into auth.global; added
  /maintenance to public routes and a maintenance-allow list (so admins can still
  sign in). Incognito + maintenance now shows the maintenance page, no loop.
* Fix (Redis/BullMQ noise): connection now sets maxRetriesPerRequest:null,
  enableReadyCheck:false, connectTimeout, capped retryStrategy, optional TLS
  (REDIS_TLS=true). Queue is now optional: QUEUE_ENABLED=false runs with NO Redis
  (NotificationService.queue is @Optional → enqueue becomes a no-op). NOTE for
  managed Redis: set maxmemory-policy = noeviction (BullMQ requirement; the
  "volatile-lru" warning comes from there).
* Settings → branding/SEO (migration 0008): favicon upload (stored via
  StorageService → uploads/R2), SEO title/description/keywords. Public GET exposes
  them; app.vue applies title/meta/og + favicon to <head> (SSR). Favicon served
  at public GET /settings/favicon.
* NotificationModule is now @Global + dynamic (register()); Session/Payment no
  longer import it.

## Super Admin — Round 4 (2026-06-21)
* User login tracking (migration 0009): User.lastLoginAt/lastLoginIp/loginCount,
  set on each successful login (IP via @Ip()).
* Admin user detail now shows: last-login info, login statistics (count),
  account status history (audit timeline), and subscription (plan/started/
  expired — placeholder). Status changes + password resets by Super Admin are
  written to AuditLog (entityType 'User'), surfaced as the history.

## Profiles & Security (2026-06-21)
* Avatar (all roles): upload at POST /users/me/avatar (StorageService → uploads/
  R2), served publicly at GET /users/:id/avatar; shown on Profile + topbar.
  User.avatarKey added (migration 0010).
* Change password (self): POST /users/me/change-password (verify current → update
  → revoke all refresh tokens). Profile UI section shown for non-super-admin.
* Active sessions: RefreshToken now stores ipAddress + userAgent (captured on
  login/refresh via @Ip()/user-agent header). GET /users/me/sessions lists active
  sessions (device/ip/time, flags the current one via x-refresh-token header);
  DELETE /users/me/sessions/:id revokes one. Profile UI section (non-super-admin).

## Super Admin — Round 5 (2026-06-22)
Theme: full platform operations console — user CRUD, audit filtering, email/queue
ops, richer dashboard, and a global announcement banner.

* Super Admin security: change-password + active-sessions are now ALSO available
  to Super Admin (Profile gate `canManageSecurity` removed). Super Admin can
  rotate its own password and view/revoke its sessions like any user.
* Full user management (/admin/users):
  - Create user — POST /users/admin (AdminCreateUserDto). Roles creatable from the
    console limited to SUPER_ADMIN | TEACHER (AdminCreatableRole). Email + optional
    username + password(≥8) + full name.
  - Edit — PATCH /users/admin/:id (AdminUpdateUserDto: fullName/username/role).
  - Delete/deactivate — DELETE /users/admin/:id (soft delete; blocks self-delete).
  - List adds a STATUS filter (ACTIVE/LOCKED/PENDING) alongside role+search, plus
    server pagination (limit 20, v-pagination driven by meta.totalPages).
  - Row actions: detail, edit, lock/unlock, reset password, delete.
* Audit logs advanced (/audit-logs): AuditQueryDto adds action (contains) +
  entityType + from/to date range, with pagination (limit 25). Page gains filter
  selects/date pickers + v-pagination.
* Email & queue ops:
  - Test email — POST /settings/test-email (super admin). Sends a probe via Resend
    to a given address or the support email; verifies mail config. Settings page
    has a "Gửi thử" button + recipient field with success/error feedback.
  - Queue status — GET /health/queue (super admin) returns BullMQ job counts
    (waiting/active/delayed/completed/failed) + enabled flag. Health page shows a
    BullMQ card; degrades gracefully when QUEUE_ENABLED=false / Redis down.
* Dashboard (super admin) advanced: real usage counts (totalDocuments,
  totalSessions) as cards + a 6-month "new users" area chart (signups: real per-
  month counts from a $transaction). Existing revenue/plan placeholders retained.
* System-wide announcement banner: SystemSetting + migration 0011 (announcement
  TEXT, announcement_active BOOL). Public GET /settings exposes
  announcement/announcementActive; Settings page has an editor (text + active
  switch); default layout renders a dismissible info banner to ALL logged-in users
  when active. New shared composable usePublicSettings() (shares the
  `public-settings` useAsyncData cache with app.vue — endpoint hit once).
* Verified: server lint + build + 16 tests green; client lint + nuxt build green.

## Teacher Dashboard — design-led UI (2026-06-22)
New component `client/app/components/TeacherDashboard.vue` rendered for the TEACHER
role in dashboard.vue (other roles unchanged). Layout: hero "next lesson" banner,
4 stat cards, upcoming-schedule list, mini month-calendar, and a "to do" panel.

REAL data wired (no backend change):
* Stat cards: totalClasses, totalStudents, outstandingTuition (dashboard endpoint);
  expectedRevenue computed client-side = collected + outstanding.
* Upcoming list + hero next-lesson: from upcomingSessions (time/day/topic/class/color).
* Mini calendar: fetches the visible month via GET /sessions?from&to, dots days with
  sessions, today highlighted, prev/next nav, timezone-correct.

## Backlog — Teacher Dashboard placeholders (build later)
These are currently PLACEHOLDER values in TeacherDashboard.vue (centralized in the
flagged `PLACEHOLDER` const). Decide if needed, then build. Grouped by cost:

* Backend-only (no schema change — add aggregates to dashboard.service.ts teacherStats):
  - Stat-card trends: "+N classes/students this month", "+N% revenue vs last month"
    (month-over-month counts/deltas).
  - Outstanding card hint: count of students with balance > 0 ("Cần nhắc nhở N học viên").
  - Per-session student count (hero + upcoming chips): enrollment count of the
    session's class (join ClassEnrollment).
* DB migration (new columns on TeachingSession) + surface in session create/edit dialog:
  - `room` / location (hero "Phòng: …").
  - `meetingUrl` / `isOnline` (the "Google Meet" chip; currently always shown).
* New feature modules (net-new, not just dashboard wiring):
  - Attendance: hero "Điểm danh lớp học" button currently links to /calendar; no
    attendance model/route exists yet.
  - "Cần xử lý" feed: grading queue (no Homework/Assignment model — Score has no
    graded/ungraded state) + tuition-reminder + document-update reminders.
* Minor: hero body copy ("Đừng quên mang theo giáo trình…") is hardcoded Vietnamese
  placeholder (shows for EN users too) — move to i18n when final copy is decided.

## Teacher Classes — card-grid UI (2026-06-22)
classes/index.vue redesigned to a card grid matching the new design, paginated at
9 classes/page (useClasses now takes (search, page, limit=9) and returns meta).
Each card: colored top border, level chip, ⋮ menu (Chi tiết / Chỉnh sửa / Xoá —
edit dialog added, reuses the create form), students + sessions counts, next-session
row, progress bar, student avatar stack, "Chi tiết" link. Header shows total count
+ search + "Tạo lớp mới".

REAL data: name, level, color, _count.enrollments (học viên), _count.sessions
(số buổi), pagination meta.total. CRUD wired (create/update/delete).

## Teacher Classes — real progress + avatars + mark-done (2026-06-23)
Turned two of the three class-card placeholders into real data + added course-progress
tracking end-to-end.

* DB: migration 0012 adds `classes.total_sessions` (Int, nullable) = planned course
  length. Applied to Neon.
* Backend (class module):
  - CreateClassDto/UpdateClassDto accept `totalSessions` (@IsInt @Min(1) @Max(1000)).
    Service.create persists it; update passes through.
  - class.repository.findManyByTeacher now also returns, per class: `completedSessions`
    (one grouped count of status=COMPLETED sessions) and `students` (first 3 ACTIVE
    enrollments → {id, fullName, avatarKey}) for the avatar stack.
* Frontend:
  - classes/index.vue: avatar stack uses REAL students (avatar image, else first-letter
    fallback) + real "+N" overflow; progress bar is REAL = completedSessions /
    (totalSessions || created sessions), shown as "x/y buổi · z%". Create/edit dialog
    gains a "Tổng số buổi" field.
  - classes/[id].vue: edit dialog gains "Tổng số buổi"; info card shows a real progress
    bar (completed COMPLETED sessions / total).
  - Calendar SessionDialog: status chip + "Đánh dấu hoàn thành" / "Mở lại" buttons that
    set session status COMPLETED/SCHEDULED. useSessionMutations now also invalidates
    `classes`/`class-sessions`/`class` so progress refreshes after marking done.
* Still PLACEHOLDER (only remaining card item): "Buổi tiếp theo" (next session per card)
  — rotating sample label in classes/index.vue. Needs the class's next SCHEDULED session
  in the list payload.
* Verified: migration applied; server lint + build + 16 tests green; client lint + build green.

## Session completion rules + overdue handling (2026-06-23)
Defined how a session counts as "done" and surfaced overdue sessions. Rule: a session
is done ONLY when explicitly marked COMPLETED (no auto-complete by time). Rescheduling =
edit the session's start/end time (drag-drop on calendar already does this), status stays
SCHEDULED; it counts only once actually taught & marked done. Cancel = CANCELLED (excluded
from progress).

* Progress denominator now excludes CANCELLED/soft-deleted: class.repository `_count.sessions`
  (both list + detail) filters `status != CANCELLED, deletedAt: null`. Detail page progress
  fallback uses active (non-cancelled) session count.
* Overdue = SCHEDULED && endTime < now. Surfaced:
  - Calendar: overdue events get a red outline + "⚠" title prefix; completed get "✓".
  - Class detail sessions table: "Quá hạn" red chip + a warning banner ("N buổi quá giờ chưa
    đánh dấu") + per-row "Hoàn thành"/"Mở lại" button (sets status, refreshes progress).
  NOTE: no auto-flip — completion stays an explicit teacher action (future: tie to attendance).
* Class detail: edit dialog shows "Tổng số buổi"; detail info card now shows totalSessions as
  a third stat alongside students + sessions counts.
* Verified: server lint + build + 16 tests green; client lint + build green (no migration).

## Fix: deleted class still showed in calendar (2026-06-23)
Bug: deleting a class soft-deleted only the class row; its TeachingSessions kept
deletedAt=null, so they still appeared on the calendar.
* class.repository.softDelete now cascades in a transaction — soft-deletes the class
  AND its sessions (status→CANCELLED). Tuition/score history is preserved (the reason
  for soft delete in the first place: financial + academic records + audit + recovery).
* session.repository.findInRange also filters `class: { deletedAt: null }` as a safety
  net — this immediately hides any already-orphaned sessions from classes deleted
  before the fix.
* Verified: server lint + build + 16 tests green.

## Class delete: hard when empty, soft when it has data (2026-06-23)
DELETE /classes/:id now decides automatically:
* If the class has ZERO related rows (enrollments, sessions, tuitions, scores,
  assistants, documentAssignments) → HARD delete (row removed permanently).
* Otherwise → SOFT delete (archived, cascades to its sessions) to preserve
  financial/academic history.
* Backend: class.repository.findActivityCounts (sum of _count over all 6 relations)
  + hardDelete; class.service.remove branches on the count and audits with
  newValue.hard = true/false. Response: { deleted, hard }.
* Frontend: delete confirm copy (index inline + classDetail.confirmDelete i18n)
  explains the rule (permanent if empty, archived if it has data).
* Verified: server lint + build + 16 tests green; client lint green.

## Teacher Students — list redesign + study status + codes (2026-06-23)
Rebuilt the teacher Students page to the new table design with all-real data.

* DB: migration 0013 — `StudyStatus` enum (STUDYING / RESERVED / GRADUATED) +
  `student_profiles.study_status` (default STUDYING) + `student_profiles.code`
  (per-teacher display code STU0001, not globally unique). Backfilled existing
  students' codes per teacher (ROW_NUMBER over created_at). Applied to Neon.
* Backend (student/user modules):
  - createMember generates the next per-teacher code (STU{n+1}) for new students.
  - STUDENT_SELECT now returns each student's enrolled classes ({id, name}, active/
    non-deleted) for the "Lớp học" column.
  - List supports `status` filter (studyStatus) + search now includes phone.
    New ListStudentsQueryDto.
  - UpdateStudentProfileDto accepts `studyStatus`; PATCH /students/:id/profile sets it
    (used by the row "Đổi trạng thái" action).
  - Seed assigns STU0001–0003 to the seed students (idempotent upsert).
* Frontend (students/index.vue): header with live total + "Lọc & Phân loại" (status
  filter menu) + "Thêm học viên"; search by tên/email/sđt; table columns HỌC VIÊN
  (avatar+initial fallback, ID code), LIÊN HỆ (email+phone), LỚP HỌC (class chips),
  TRẠNG THÁI (study-status chip), THAO TÁC (⋮ menu: chi tiết / đổi trạng thái / xoá);
  footer "Hiển thị x–y của N" + Trước/Tiếp pagination (10/page). useStudents now takes
  (search, status, page, limit) + meta; added setStatus + deleteStudent mutations.
* Verified: migration applied; server lint + build + 16 tests green; client lint + build green.

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
