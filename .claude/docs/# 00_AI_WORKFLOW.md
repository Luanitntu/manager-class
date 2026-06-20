# 00_AI_WORKFLOW.md

# Purpose

This file defines how AI agents must work inside this project.

All AI agents must read this file first.

---

# Working Rules

Before doing any task:

1. Read STATUS.md
2. Read PROJECT_CONTEXT.md
3. Read TECH_STACK.md
4. Read CODING_STANDARDS.md

Never start implementation without checking project status.

---

# Project Structure

Root

/docs
/server
/client

---

# Backend Location

All backend code must be placed inside:

/server

Backend stack:

* NestJS
* Prisma
* PostgreSQL
* Redis
* BullMQ

---

# Frontend Location

All frontend code must be placed inside:

/client

Frontend stack:

* Nuxt 4
* Vue 3
* Pinia
* Vuetify
* TanStack Query

---

# Development Order

Always follow this order.

Phase 1

* Project Setup
* Docker
* Environment
* CI/CD Skeleton

Phase 2

* Database Design
* Prisma Schema
* Migrations

Phase 3

* Authentication
* Authorization
* Multi Tenant Foundation

Phase 4

* Class Module
* Session Module
* Calendar Module

Phase 5

* Student Module

Phase 6

* Assistant Teacher Module

Phase 7

* Documents Module

Phase 8

* Payments Module

Phase 9

* Reports

Phase 10

* Email Automation

Phase 11

* Dashboard

Phase 12

* Audit Logs

---

# Implementation Rules

Before implementing:

* Create implementation plan.
* Explain affected modules.
* Wait for approval if architecture changes.

After implementing:

* Update STATUS.md.
* Update architecture docs if required.
* Update API docs if required.

---

# Status Updates

Every completed task must update:

STATUS.md

Required fields:

* Completed
* In Progress
* Next Tasks
* Decisions
* Technical Debt

---

# Frontend Rules

Calendar is the primary screen.

Do not implement session management as table-first CRUD.

Prefer:

Calendar -> Session

instead of:

Table -> Session

---

# Backend Rules

Controllers:

* Request only

Services:

* Business logic

Repositories:

* Database access

Never bypass service layer.

---

# Database Rules

Every business entity must belong to a Teacher.

Tenant isolation is mandatory.

Never expose another teacher's data.

---

# AI Completion Rules

After every task:

1. Update STATUS.md
2. Provide summary
3. Provide next recommended task

Never stop without updating project status.
