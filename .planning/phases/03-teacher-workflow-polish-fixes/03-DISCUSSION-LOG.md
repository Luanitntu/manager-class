# Phase 3: Teacher Workflow Polish & Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 3-Teacher Workflow Polish & Fixes
**Areas discussed:** Dashboard data strategy, Calendar polish scope, CRUD pages consistency, Bug fix verification

---

## Dashboard Data Strategy

### Q1: Dashboard data loading approach

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Kết hợp | Dữ liệu load live khi mở trang + nút refresh thủ công. Tận dụng `useDashboard` + TanStack Query `refetch`. | ✓ |
| Live tự động | Trang load là API gọi ngay, không cần nút refresh riêng. | |
| Agent quyết định | Tùy ý tối ưu theo các pattern có sẵn. | |

**User's choice:** Kết hợp — live load + manual refresh button
**Notes:** None

### Q2: Dashboard content fields

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Hiển thị đầy đủ | Số lớp, số học viên, buổi học hôm nay/sắp tới, tổng học phí còn thiếu, và cảnh báo. | ✓ |
| Chỉ số liệu chính | Số lớp, buổi học sắp tới, tổng học phí. Không cảnh báo. | |
| Agent quyết định | Dựa trên dữ liệu API thực tế trả về. | |

**User's choice:** Hiển thị đầy đủ tất cả data mà backend trả về
**Notes:** None

### Q3: Dashboard layout

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Card ngang SaaS | Hàng stat cards trên cùng, bên dưới là upcoming sessions + alerts. | ✓ |
| 2 cột | Bên trái stat cards, bên phải upcoming/alerts. | |
| Agent quyết định | Layout phù hợp nhất. | |

**User's choice:** Card ngang SaaS-style
**Notes:** None

### Q4: Upcoming sessions range

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Hôm nay + 7 ngày tới | Đủ để nắm bắt nhanh lịch tuần. | ✓ |
| Chỉ hôm nay | Ngắn gọn, tập trung. | |
| Agent quyết định | | |

**User's choice:** Hôm nay + 7 ngày tới
**Notes:** None

---

## Calendar Polish Scope

### Q1: Event coloring

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Tô màu theo lớp | Mỗi lớp có màu riêng trên lịch. FullCalendar `eventColor` per-event. | ✓ |
| Tô màu theo trạng thái | Màu khác nhau cho pending/confirmed/completed/cancelled. | |
| Giữ đơn sắc | Không phân biệt màu. | |
| Agent quyết định | | |

**User's choice:** Tô màu theo lớp
**Notes:** None

### Q2: SessionDialog polish scope

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Polish có trọng tâm | Cải thiện validation errors, success/error notifications. Không thêm field mới. | ✓ |
| Polish tối thiểu | Chỉ sửa bug, không đổi UI/UX. | |
| Agent quyết định | | |

**User's choice:** Polish có trọng tâm
**Notes:** None

### Q3: Calendar state components

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Dùng AppPageHeader + AppState | Calendar page áp dụng state components Phase 2. | ✓ |
| Giữ nguyên | Calendar đã hoạt động, không cần đổi. | |
| Agent quyết định | | |

**User's choice:** Dùng AppPageHeader + AppState từ Phase 2
**Notes:** None

### Q4: Recurring session scope

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Giữ nguyên | Backend logic stays unchanged. Phase 3 chỉ đảm bảo UI hiển thị đúng. | ✓ |
| Cải thiện flow | Thêm preview, undo, chọn chu kỳ. | |
| Agent quyết định | | |

**User's choice:** Giữ nguyên recurring, chỉ polish UI
**Notes:** None

---

## CRUD Pages Consistency

### Q1: CRUD interaction pattern

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Dialog cho tất cả | Thống nhất dialog pattern. | |
| Giữ hybrid | Students/assistants dialog, documents/payments inline. | |
| Inline cho tất cả | Bỏ dialog, dùng expandable row. | |
| Agent quyết định | | |

**User's choice:** Giữ nguyên tất cả dialogs/forms hiện tại — không refactor
**Notes:** Đồng đội đang làm lại các popup bằng pages. Sẽ merge vào sau. Phase 3 chỉ đảm bảo CRUD flows hiện tại hoạt động đúng.

### Q2: Visual system adoption

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Có | Áp dụng AppPageHeader + AppState + visual system Phase 2 vào tất cả teacher pages. | ✓ |
| Chỉ sửa bug | Không đổi visual. | |
| Agent quyết định | | |

**User's choice:** Áp dụng visual system vào tất cả teacher pages
**Notes:** None

### Q3: Notification pattern

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Snackbar nhất quán | Vuetify v-snackbar cho tất cả CRUD: green success, red error. | ✓ |
| Giữ nguyên | Mỗi trang xử lý riêng. | |
| Agent quyết định | | |

**User's choice:** Snackbar nhất quán
**Notes:** None

### Q4: Profile composable (BUG-009)

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Tạo useProfile | Profile page chuyển sang composable pattern. | ✓ |
| Bỏ qua | Profile đang hoạt động, không cần refactor. | |
| Agent quyết định | | |

**User's choice:** Tạo `useProfile` composable
**Notes:** None

---

## Bug Fix Verification

### Q1: Verification depth

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Smoke test + automated khi dễ | Manual verification notes cho mỗi fix. Automated test khi logic đơn giản. | ✓ |
| Chỉ smoke test | Không automated test. | |
| Bắt buộc automated test | Mọi fix phải có test. | |
| Agent quyết định | | |

**User's choice:** Smoke test chính + automated test khi dễ
**Notes:** None

### Q2: BUG-002 timing

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Sửa ngay Phase 3 | Đồng bộ README với seed password. | ✓ |
| Để Phase 5 | Không cấp bách. | |
| Agent quyết định | | |

**User's choice:** Sửa ngay Phase 3
**Notes:** Giáo viên cần login được để test bất kỳ flow nào.

### Q3: BUG-007 fix approach

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Sửa trong Phase 3 | Authenticated blob fetch qua useApi. | ✓ |
| Chỉ smoke test trước | Nếu hoạt động thì không sửa. | |
| Agent quyết định | | |

**User's choice:** Sửa report download — authenticated blob fetch
**Notes:** None

### Q4: Minimum verification standard

| Option | Description | Selected |
|--------|-------------|----------|
| ⭐ Lint/typecheck/build | Frontend: npm run lint, typecheck, build. Backend: lint/build/test khi đổi backend. | ✓ |
| Chỉ build | Không lint/typecheck. | |
| Agent quyết định | | |

**User's choice:** Lint/typecheck/build cho frontend, lint/build/test cho backend khi đổi
**Notes:** None

---

## the agent's Discretion

- Exact color palette for class-based event coloring
- Internal structure of `useProfile` composable
- Snackbar duration, position, and icon style (consistent across pages)
- Order of teacher page adoption (all must be completed)

## Deferred Ideas

- Refactoring dialogs/popups into pages — teammate handling separately
- Student-facing bugs (BUG-003/004/005/006/008) — Phase 4
- Center role workflows — v2
- Full responsive QA — Phase 5
- Frontend test infrastructure — Phase 5 unless trivially easy
