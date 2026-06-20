# 4_PERMISSION_MATRIX.md

# Roles

* Super Admin
* Teacher
* Assistant Teacher
* Student

---

# Classes

| Action | Super Admin | Teacher | Assistant     | Student       |
| ------ | ----------- | ------- | ------------- | ------------- |
| View   | ❌           | ✅       | Assigned Only | Assigned Only |
| Create | ❌           | ✅       | ❌             | ❌             |
| Update | ❌           | ✅       | ❌             | ❌             |
| Delete | ❌           | ✅       | ❌             | ❌             |

---

# Sessions

| Action | Super Admin | Teacher | Assistant     | Student       |
| ------ | ----------- | ------- | ------------- | ------------- |
| View   | ❌           | ✅       | Assigned Only | Assigned Only |
| Create | ❌           | ✅       | ❌             | ❌             |
| Update | ❌           | ✅       | ❌             | ❌             |
| Delete | ❌           | ✅       | ❌             | ❌             |

---

# Students

| Action | Super Admin | Teacher | Assistant        | Student      |
| ------ | ----------- | ------- | ---------------- | ------------ |
| View   | ❌           | ✅       | Assigned Classes | Self         |
| Create | ❌           | ✅       | ❌                | ❌            |
| Update | ❌           | ✅       | Limited          | Self Profile |
| Delete | ❌           | ✅       | ❌                | ❌            |

---

# Documents

| Action | Super Admin | Teacher    | Assistant   | Student     |
| ------ | ----------- | ---------- | ----------- | ----------- |
| View   | ❌           | ✅          | Shared Only | Shared Only |
| Create | ❌           | ✅          | Allowed     | ❌           |
| Update | ❌           | Owner Only | Owner Only  | ❌           |
| Delete | ❌           | Owner Only | Owner Only  | ❌           |

---

# Payments

| Action | Super Admin | Teacher | Assistant | Student |
| ------ | ----------- | ------- | --------- | ------- |
| View   | ❌           | ✅       | View Only | Self    |
| Create | ❌           | ✅       | ❌         | ❌       |
| Update | ❌           | ✅       | ❌         | ❌       |
| Delete | ❌           | ✅       | ❌         | ❌       |

---

# Audit Logs

| Action | Super Admin | Teacher    | Assistant | Student |
| ------ | ----------- | ---------- | --------- | ------- |
| View   | ✅           | Own Tenant | ❌         | ❌       |

---

# User Management

| Action         | Super Admin | Teacher             | Assistant | Student |
| -------------- | ----------- | ------------------- | --------- | ------- |
| Create Users   | ✅           | Assistant + Student | ❌         | ❌       |
| Lock Users     | ✅           | ❌                   | ❌         | ❌       |
| Reset Password | ✅           | ❌                   | ❌         | ❌       |
