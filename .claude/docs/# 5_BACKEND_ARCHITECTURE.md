# 5_BACKEND_ARCHITECTURE.md

# Architecture Style

* Modular Monolith
* Domain Driven Structure
* Service Layer
* Repository Pattern
* Dependency Injection

---

# Modules

Auth Module

* Register
* Login
* Refresh Token
* Reset Password

User Module

* User Management
* Profile Management

Class Module

* Classes
* Sessions

Student Module

* Student Management
* Academic Records

Assistant Module

* Assistant Teacher Management
* Salary Management

Payment Module

* Tuition
* Receipts

Document Module

* Learning Materials

Report Module

* Excel Export
* PDF Export

Notification Module

* Email
* Future Notification Center

Audit Module

* Audit Logs

Dashboard Module

* Dashboard Statistics

---

# Rules

Controllers

* Handle HTTP Requests Only

Services

* Business Logic

Repositories

* Database Access

Never place business logic inside controllers.

Never access Prisma directly from controllers.
