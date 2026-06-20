# 2_TECH_STACK.md

# Frontend

Framework:

* Nuxt 4
* Vue 3
* TypeScript

UI:

* Vuetify
* Spike Nuxt Admin Template

State Management:

* Pinia

Data Fetching:

* TanStack Query

Forms:

* VeeValidate
* Zod

Calendar:

* FullCalendar

Charts:

* ApexCharts

---

# Backend

Framework:

* NestJS
* TypeScript

Authentication:

* JWT Access Token
* JWT Refresh Token

Validation:

* class-validator
* class-transformer

API Style:

* REST API

---

# Database

Database:

* PostgreSQL

ORM:

* Prisma

Migration Strategy:

* Prisma Migrations

---

# Queue & Background Jobs

Queue:

* BullMQ

Broker:

* Redis

Use Cases:

* Email reminders
* Payment reminders
* Schedule notifications
* PDF generation

---

# File Storage

Storage Provider:

* Cloudflare R2

Stored Files:

* PDFs
* MP3s
* Avatars
* Generated Reports

Do not store files in PostgreSQL.

---

# Email

Provider:

* Resend

Use Cases:

* Registration verification
* Password reset
* Session reminders
* Schedule changes
* Payment reminders

---

# Reports

PDF:

* Puppeteer

Excel:

* ExcelJS

---

# Architecture Rules

Always prefer:

* Service Layer
* Repository Pattern
* Dependency Injection

Avoid:

* Business logic inside controllers
* Direct database access inside controllers
* Monolithic files

---

# Future Roadmap Compatibility

Architecture must support future features:

* Subscription Plans
* Billing
* Feature Limits
* Mobile App
* Notification Center

without major refactoring.
