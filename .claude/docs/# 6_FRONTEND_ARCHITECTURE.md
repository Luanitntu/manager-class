# 6_FRONTEND_ARCHITECTURE.md

# UI Foundation

* Nuxt 4
* Vuetify
* Spike Template

---

# Primary Navigation

Teacher

Dashboard
Calendar
Classes
Students
Assistant Teachers
Documents
Payments
Reports
Audit Logs
Profile

---

# Calendar First

Calendar is the primary operational screen.

Teachers should perform:

* Create Session
* Edit Session
* Delete Session
* Move Session

directly from Calendar.

---

# Page Structure

pages/

dashboard/

calendar/

classes/

students/

assistants/

documents/

payments/

reports/

audit-logs/

profile/

---

# Shared Components

DataTable

Form Dialog

Confirm Dialog

Calendar Event Modal

Upload File Modal

PDF Viewer

---

# State Management

Pinia

---

# API Layer

Use composables.

Never call APIs directly inside Vue components.
