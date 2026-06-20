# 7_DATABASE_GUIDELINES.md

# Database

PostgreSQL

ORM

Prisma

---

# Multi Tenant Rule

Every business entity must belong to a Teacher.

Examples:

Class

Session

Student

Document

Payment

Assistant Teacher

Report

---

# Soft Delete

Required for:

* Students
* Classes
* Documents
* Sessions

Avoid hard deletes whenever possible.

---

# Auditability

Store:

createdAt

updatedAt

createdBy

updatedBy

for all important entities.

---

# Naming Convention

Tables

snake_case

Columns

snake_case

Prisma Models

PascalCase

---

# UUID

Use UUID for all primary keys.

Do not use incremental ids.

---

# Future Compatibility

Database should support:

* Subscription Plans
* Feature Limits
* Billing
* Mobile Applications

without major schema changes.
