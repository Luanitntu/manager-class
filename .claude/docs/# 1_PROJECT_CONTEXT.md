# 1_PROJECT_CONTEXT.md

# Project Overview

This project is a SaaS Learning Management System (LMS) designed for language teachers.

The system allows multiple teachers to use the same platform while managing their own students, classes, schedules, assistant teachers, documents, payments, reports and evaluations.

The first release (MVP) will initially onboard a single teacher for validation and feedback.

However, the architecture must be designed as a multi-tenant SaaS platform from day one and should support multiple teachers without requiring significant refactoring.

Future subscription plans (Free, Basic, Pro, etc.) will be added later.

---

# Core Philosophy

The system is teacher-centric.

Each Teacher owns their own:

* Classes
* Students
* Assistant Teachers
* Documents
* Payments
* Reports

Teachers must NEVER see data belonging to other teachers.

The platform owner (Super Admin) manages the system itself, not educational operations.

---

# Roles

## Super Admin

Platform owner.

Responsibilities:

* Manage user accounts
* Lock/unlock accounts
* Reset passwords
* Manage system settings
* View system statistics
* View audit logs

Super Admin does NOT manage:

* Classes
* Students
* Teacher schedules
* Payments
* Documents

Those belong to Teachers.

---

## Teacher

Primary user of the platform.

Teacher owns all educational data.

Teacher can manage:

* Classes
* Students
* Assistant Teachers
* Learning Documents
* Tuition Payments
* Reports
* Evaluations

Teacher only sees their own data.

---

## Assistant Teacher

Created and managed by a Teacher.

Can:

* View assigned classes
* View assigned students
* Access shared learning materials
* Create reports
* View salary information
* Manage own profile

Cannot:

* Create classes
* Delete classes
* Access classes outside assignments

---

## Student

Can:

* View class information
* View schedules
* View learning materials
* View scores
* View comments and feedback
* View tuition payments
* Submit evaluations
* Manage own profile

---

# Multi-Tenant Architecture

IMPORTANT:

The platform is designed for multiple Teachers.

Every business entity must belong to a Teacher.

Examples:

Teacher
├── Classes
├── Students
├── Assistant Teachers
├── Documents
├── Payments
└── Reports

Teacher A must never access Teacher B data.

All future database and API designs must enforce tenant isolation.

---

# Authentication

Authentication is email-based.

Features:

* Register via email
* Login via email
* Forgot password
* Reset password
* Email verification

Email is a critical part of the platform.

---

# Calendar-First Design

IMPORTANT:

The platform is NOT CRUD-first.

The platform is Calendar-first.

The Calendar is the primary screen used daily by Teachers.

Classes exist as containers.

Teaching Sessions are the actual operational entities.

Teachers should spend most of their time inside Calendar views.

---
# UI Philosophy

The project may use a commercial Nuxt Admin Template as the visual foundation.

Recommended inspirations:

* Spike Nuxt
* Linear
* Notion
* Vercel

The goal is to achieve a clean and professional SaaS experience rather than building a custom design system from scratch.

Business requirements always take priority over template structure.

---

# Design Principles

The UI should be:

* Clean
* Spacious
* Modern
* Professional
* Easy to use for non-technical teachers

Avoid:

* Crowded layouts
* Excessive charts
* Heavy animations
* Complex navigation
* Unnecessary visual effects

---

# Calendar-First User Experience

This platform is Calendar-First.

Teachers primarily interact with Sessions through Calendar views.

Dashboard is only a summary page.

Calendar is the main operational screen.

Most teaching-related actions should happen directly from Calendar.

Examples:

* Create Session
* Edit Session
* Delete Session
* Move Session
* Reschedule Session

Avoid forcing users to manage Sessions through tables whenever possible.

---

# Dashboard Philosophy

Dashboard is not the primary workspace.

Dashboard should only provide quick insights:

Teacher Dashboard:

* Upcoming Sessions
* Total Classes
* Total Students
* Tuition Collected
* Outstanding Tuition

Assistant Teacher Dashboard:

* Assigned Classes
* Upcoming Sessions
* Salary Summary

Student Dashboard:

* Current Classes
* Upcoming Sessions
* Remaining Tuition

---

# Layout Guidelines

Use a modern SaaS layout:

Sidebar
Top Navigation
Content Area

Recommended sidebar structure:

Teacher

* Dashboard
* Calendar
* Classes
* Students
* Assistant Teachers
* Documents
* Payments
* Reports
* Audit Logs
* Profile

Student

* Dashboard
* My Classes
* Schedule
* Documents
* Scores
* Payments
* Profile

Super Admin

* Dashboard
* Users
* System Settings
* Audit Logs
* Profile

---

# Calendar UX Requirements

Calendar should support:

* Month View
* Week View
* Day View

Preferred behavior:

* Click empty slot -> Create Session
* Click event -> View/Edit Session
* Drag Event -> Reschedule Session
* Resize Event -> Change Duration

User experience should feel similar to Google Calendar.

---

# Future UI Strategy

The system should remain compatible with future SaaS features:

* Subscription Plans
* Billing
* Notifications
* Mobile App

Frontend architecture should allow feature growth without major redesign.


# Class vs Session

A Class represents a course.

Examples:

* Japanese N5
* Japanese N4
* English Beginner

A Class contains multiple Sessions.

Example:

Class:
Japanese N5

Sessions:

* July 1
* July 3
* July 8
* July 10

Session is the actual teaching event.

Many business rules operate on Sessions rather than Classes.

---

# Calendar Module

Calendar is one of the most important modules.

Required Views:

* Month View
* Week View
* Day View

Teachers should be able to:

* Create Session directly from Calendar
* Edit Session directly from Calendar
* Delete Session directly from Calendar
* Drag and Drop Session
* Resize Session duration

The experience should feel similar to Google Calendar.

---

# Session Information

Each Session contains:

* Class
* Date
* Start Time
* End Time
* Lesson Topic
* Assigned Assistant Teachers

Example:

Japanese N5
2026-07-15
19:30 - 21:00

Lesson:
Minna no Nihongo Lesson 1

---

# Bulk Session Creation

Teachers must be able to generate recurring sessions.

Example:

Every Monday and Thursday
19:30 - 21:00
For 3 months

The system automatically creates all Sessions.

This feature is mandatory.

---

# Schedule Conflict Detection

System must prevent schedule conflicts.

Teacher Conflict:

Teacher cannot teach two Sessions at the same time.

Assistant Teacher Conflict:

Assistant Teacher cannot be assigned to overlapping Sessions.

Conflict validation should happen before saving.

---

# Email Automation

Email is a core feature.

---

## Schedule Change Notification

Whenever a Session is modified:

* Date changed
* Time changed
* Session cancelled
* Session moved

System sends email notifications to:

* Students
* Assistant Teachers

---

## Upcoming Session Reminder

30 minutes before Session starts:

System automatically sends reminder emails.

Recipients:

* Students
* Assistant Teachers

Email should include:

* Class Name
* Session Time
* Lesson Topic

---

## Payment Reminder

Teacher can send payment reminders.

Recipients:

* Students

---

# Student Management

Teacher manages:

* Personal Information
* Educational Information
* Scores
* Comments
* Tuition Status

Student profile may contain:

* Full Name
* Email
* Phone
* Address
* Date of Birth
* Occupation
* Education Level
* Learning Goal

---

# Academic Records

Teacher can manage:

* Midterm Scores
* Final Scores
* Assignment Scores
* Quiz Scores
* Custom Scores

Teacher can add comments:

* Learning attitude
* Strengths
* Weaknesses
* Progress

Students can view but not modify.

---

# Tuition Management

Teacher manages tuition.

Supported:

* Full payment
* Multiple payments

Payment Status:

* Pending
* Partially Paid
* Paid
* Overdue

Track:

* Total Tuition
* Paid Amount
* Remaining Amount

---

# Receipt System

Each payment generates a receipt.

Receipt supports:

* View
* Export PDF

---

# Learning Materials

Supported Types:

* PDF
* MP3
* External Links

Materials can be assigned to:

* Individual Students
* Entire Classes

Categories should be supported.

Examples:

A1
A2
B1
B2

---

# Assistant Teacher Salary

Teacher manages salary configuration.

Supported Methods:

* Per Session
* Per Hour
* Per Class

System calculates:

* Salary by Class
* Total Salary

---

# Reports

Teachers can generate reports for:

* Student Progress
* Tuition Status
* Academic Results
* Assistant Teacher Performance

Export Formats:

* Excel
* PDF

---

# Evaluations

Students can submit feedback regarding:

* Teachers
* Classes
* Course Quality

Teachers can review feedback.

---

# Audit Logs

Every important action must be logged.

Examples:

* Class Created
* Session Updated
* Session Deleted
* Student Deleted
* Payment Updated
* Document Removed

Audit Log should store:

* User
* Timestamp
* IP Address
* Action
* Old Value
* New Value

---

# Dashboard

## Super Admin

View platform statistics:

* Total Teachers
* Total Students
* Total Classes
* Total Users

---

## Teacher

View:

* Total Classes
* Total Students
* Tuition Collected
* Outstanding Tuition
* Upcoming Sessions

---

## Assistant Teacher

View:

* Assigned Classes
* Total Sessions
* Salary
* Upcoming Sessions

---

## Student

View:

* Current Classes
* Upcoming Sessions
* Scores
* Remaining Tuition

---

# Future Roadmap (V2)

Not included in MVP.

Potential future features:

* Subscription Plans
* Billing System
* Feature Limits by Plan
* Attendance Tracking
* Classroom Management
* In-App Notifications
* Mobile App
* Zoom Integration
* Google Meet Integration

Current architecture should be designed so these features can be added without major refactoring.
