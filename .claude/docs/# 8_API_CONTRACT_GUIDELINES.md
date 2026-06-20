# 8_API_CONTRACT_GUIDELINES.md

# API Style

REST API

Base URL

/api/v1

---

# Response Format

Success

{
"success": true,
"data": {}
}

Error

{
"success": false,
"message": "",
"errors": []
}

---

# Pagination

{
"data": [],
"meta": {
"page": 1,
"limit": 20,
"total": 100
}
}

---

# Validation

All requests must use DTO validation.

---

# Authorization

JWT Required

Role Validation Required

Tenant Validation Required

---

# File Upload

Separate upload endpoints.

Do not send files through business endpoints.

---

# Versioning

All APIs must be versioned.

Example:

/api/v1/classes

/api/v1/students

/api/v1/payments
