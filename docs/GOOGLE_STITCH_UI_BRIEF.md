# Google Stitch UI Brief - Schedule Teacher

Tài liệu này dùng để paste vào Google Stitch khi yêu cầu thiết kế giao diện mới cho dự án Schedule Teacher. Mục tiêu là giúp Stitch hiểu đầy đủ sản phẩm, role, page, chức năng, state và ưu tiên thiết kế để không bị thiếu màn hình.

## 1. Tổng Quan Sản Phẩm

Schedule Teacher là web app SaaS quản lý lớp học dành cho giáo viên dạy ngoại ngữ. Sản phẩm giúp giáo viên quản lý lịch dạy, lớp, học viên, trợ giảng, tài liệu học tập, học phí, báo cáo và nhật ký hoạt động. Học viên dùng app để xem dashboard cá nhân, lịch học, lớp đang theo học, tài liệu được giao, điểm/nhận xét và tình trạng học phí.

Phiên bản đang thiết kế là v1 polish release: làm mới UI hoàn toàn, ưu tiên trải nghiệm giáo viên và học viên, đồng thời sửa các lỗi hiển thị dữ liệu. Center role chưa nằm trong phạm vi v1. Cảm hứng thẩm mỹ có thể lấy từ các sản phẩm education SaaS kiểu PREP, nhưng không copy brand, màu sắc, asset, layout hoặc UI protected của PREP.

Core value: giáo viên và học viên thấy đúng dữ liệu lớp học qua một giao diện sạch, chuyên nghiệp, calendar-first, dễ thao tác mỗi ngày.

## 2. Nguyên Tắc Thiết Kế Chính

- Teacher-first, student-second: giáo viên và học viên là 2 role chính phải được thiết kế đầy đủ nhất.
- Calendar-first workflow: với giáo viên, lịch dạy là trung tâm sản phẩm; không được giấu workflow buổi học trong bảng khó dùng.
- Education SaaS hiện đại: sạch, thân thiện, sáng sủa, nhiều khoảng thở vừa đủ, dashboard dễ scan, icon rõ nghĩa, card/table/form chuyên nghiệp.
- Không thiết kế landing page marketing. Màn hình chính sau đăng nhập là app thật.
- Desktop-first nhưng responsive tốt cho tablet/mobile. Mobile cần bottom navigation cho các route quan trọng.
- Tất cả page cần có loading, empty, error, success/toast state.
- Dữ liệu đa tenant: mọi dữ liệu business thuộc về một teacher/tenant. UI không được gợi ý xem lẫn dữ liệu của teacher khác.
- Center role deferred: không thiết kế workflow trung tâm/lớp học theo mô hình trung tâm trong v1.

## 3. Tech/UI Context Hiện Có

- Frontend: Nuxt 4, Vue 3, Vuetify, Pinia, TanStack Query.
- Backend: NestJS, Prisma, PostgreSQL, Redis/BullMQ.
- UI hiện tại dùng layout app shell gồm sidebar desktop, top app bar, bottom navigation mobile, Vuetify components, cards/tables/dialogs.
- Theme hiện tại: primary blue, secondary teal, success green, warning amber, error red, light background. Có thể đổi toàn bộ visual system miễn vẫn hợp education SaaS.
- App route hiện tại dùng tiếng Anh. Có thể giữ tiếng Anh cho UI labels hoặc thiết kế song ngữ nếu cần, nhưng copy phải sạch, không lỗi encoding.

## 4. Roles Và Quyền Truy Cập

### Teacher - role chính

Teacher là tenant owner. Teacher có thể:
- Xem dashboard tổng quan lớp, học viên, học phí, buổi học sắp tới.
- Quản lý calendar: tạo, sửa, xóa, kéo thả/resize buổi học, tạo lịch lặp.
- Quản lý classes: tạo/sửa/xóa lớp, xem số học viên và số sessions.
- Quản lý students: tạo học viên, xem chi tiết, sửa profile, thêm/xóa điểm, thêm comment/feedback.
- Quản lý assistant teachers: tạo trợ giảng, xem assignment/salary, cấu hình lương.
- Quản lý documents: thêm link, upload PDF/MP3, assign tài liệu cho class/student, xóa tài liệu, tải xuống/mở link.
- Quản lý payments: tạo tuition bill, xem trạng thái học phí, ghi nhận thanh toán, xem lịch sử thanh toán, gửi reminder.
- Export reports: tuition report, scores report, filter theo class.
- Xem audit logs trong tenant.
- Cập nhật profile.

### Student - role chính

Student thuộc tenant của một teacher. Student có thể:
- Xem dashboard cá nhân: lớp đang học, điểm đã có, học phí còn lại, buổi học sắp tới.
- Xem calendar/schedule của mình.
- Xem classes đang enrolled.
- Xem documents được assign trực tiếp hoặc qua class; mở link/tải file.
- Xem payments/học phí của bản thân, status và lịch sử thanh toán.
- Xem/được hiển thị scores/comments nếu page hoặc component hỗ trợ.
- Cập nhật profile cơ bản.

### Assistant - role phụ, không ưu tiên v1 nhưng không được phá

Assistant thuộc tenant của teacher. Assistant có thể:
- Xem dashboard, calendar, classes được assign.
- Quản lý hoặc hỗ trợ documents nếu được cho phép trong app hiện tại.
- Xem profile và salary liên quan.

### Super Admin - role phụ/internal

Super admin không có tenant calendar. Có thể:
- Xem dashboard tổng quan toàn hệ thống.
- Xem audit logs.
- Quản lý profile.
- Một số API admin user tồn tại, nhưng v1 UI không ưu tiên thiết kế sâu.

## 5. Information Architecture / Navigation

### Teacher desktop sidebar

Group Daily:
- Dashboard
- Calendar

Group Teaching:
- Classes
- Students
- Assistants
- Documents

Group Operations:
- Payments
- Reports
- Audit Logs
- Profile

Teacher quick action trên topbar: New session -> Calendar.

Teacher mobile bottom nav: Dashboard, Calendar, Classes, Students, Documents.

### Student navigation

Group Today:
- Dashboard
- Schedule/Calendar

Group Learning:
- Classes
- Documents

Group Account:
- Payments
- Profile

Student quick action: View schedule -> Calendar.

Student mobile bottom nav: Dashboard, Schedule, Classes, Documents, Payments.

### Assistant navigation

- Dashboard
- Calendar
- Classes
- Profile

### Super admin navigation

- Dashboard
- Audit Logs
- Profile

## 6. App Shell Cần Thiết Kế

### Auth shell

- Centered auth card, max width khoảng 420px.
- Background sáng, hiện đại, không rối.
- Logo/app mark cho Schedule Teacher.
- Các form cần có validation message, alert error/success, loading button.

### Logged-in shell

- Desktop: persistent sidebar trái, top app bar, content area.
- Sidebar cần group nav rõ, active item nổi bật, icon đi kèm, brand area có tên Schedule Teacher.
- Topbar cần: toggle sidebar, quick action theo role, user menu/avatar, role chip, logout/profile.
- Mobile: bottom navigation 4-5 tab quan trọng, topbar gọn.
- Global snackbar/toast cho success/error.
- Content width nên đủ rộng cho calendar/table, không giống landing page.

## 7. Page Inventory Chi Tiết

### `/login` - Sign in

Mục đích: người dùng đăng nhập bằng email/username và password.

Thành phần:
- App mark/icon.
- Title: Welcome back.
- Fields: Email or username, Password.
- Link Forgot password.
- Primary CTA Sign in.
- Link Create account.
- Error alert khi login thất bại.
- Loading state trên button.

### `/register` - Teacher registration

Mục đích: tạo tài khoản teacher mới.

Thành phần:
- Full name, Email, Password.
- CTA Create account.
- Link Sign in.
- Validation: tên tối thiểu, email hợp lệ, password >= 8 ký tự.
- Sau register chuyển về Calendar.

### `/forgot-password`

Mục đích: gửi reset link.

Thành phần:
- Email field.
- CTA Send reset link.
- Success alert: nếu email tồn tại, reset link đã được gửi.
- Link back to sign in.

### `/reset-password?token=...`

Mục đích: đặt password mới.

Thành phần:
- New password field.
- CTA Update password.
- Error state khi thiếu/invalid token.
- Success state Password updated + link sign in.

### `/verify-email?token=...`

Mục đích: xác minh email.

States:
- Verifying: spinner + text.
- Success: icon check, Email verified, CTA Continue to sign in.
- Error: icon alert, Verification failed, error detail, CTA back to sign in.

### `/index`

Mục đích: redirect theo role.
- Teacher/Assistant: Calendar hoặc default phù hợp.
- Student/Super admin: Dashboard.
- Loading spinner full screen.

### `/dashboard`

Mục đích: overview theo role.

Teacher dashboard cards:
- Total Classes.
- Total Students.
- Tuition Collected.
- Outstanding Tuition.
- Upcoming Sessions list: class name, lesson topic, time, class color.

Student dashboard cards:
- Current Classes.
- Scores Recorded.
- Remaining Tuition.
- Upcoming Sessions list.

Assistant dashboard cards:
- Assigned Classes.
- Total Sessions.

Super admin dashboard cards:
- Total Teachers.
- Total Students.
- Total Classes.
- Total Users.

States:
- Loading dashboard.
- Could not load dashboard + Try again.
- Empty dashboard.
- No upcoming sessions + CTA Open calendar.

Design notes:
- Cards phải dễ scan, số liệu nổi bật, icon rõ.
- Upcoming Sessions nên có cảm giác timeline/agenda giáo dục, không chỉ list khô.

### `/calendar` - Core teacher workflow

Mục đích: lịch dạy trung tâm.

Teacher capabilities:
- Xem month/week/day calendar.
- Tạo session bằng nút New Session hoặc select empty slot.
- Click event mở detail/edit dialog.
- Drag/drop session để reschedule.
- Resize session duration.
- Xem class color, lesson topic, status cancelled/completed/scheduled.
- Tạo recurring sessions.

Student capabilities:
- Xem schedule riêng; không edit.
- Calendar title nên nói rõ Follow your upcoming class schedule.

Assistant capabilities:
- Xem schedule/class liên quan; không nhất thiết edit.

Responsive:
- Desktop: FullCalendar month/week/day.
- Mobile: schedule/list month hoặc agenda view.
- Tablet: calendar + agenda list.

States:
- Loading range indicator.
- Empty: No sessions in this range.
- Error toast khi load fail.

### Session dialog

Used on Calendar.
Fields:
- Class select.
- Mode Single / Recurring khi tạo mới.
- Single: Date, Start time, End time, Lesson topic.
- Recurring: From date, To date, Repeat on weekdays, Start time, End time, Lesson topic.
- Edit mode: update fields, Delete session.

Validation/errors:
- Must create a Class before schedule sessions.
- Required class/date/time.
- End time after start time.
- End date after/equal start date.
- Recurring phải chọn ít nhất 1 repeat day.
- Conflict errors từ backend cần hiện rõ trong dialog.

### `/classes`

Mục đích: quản lý lớp/course.

Teacher:
- Search classes.
- Create class.
- Edit class.
- Delete class.
- Cards hiển thị class color, name, level, student count, session count.

Student:
- Xem classes đang enrolled. Không tạo/sửa/xóa.
- Nên có card/list class rõ: class name, level, upcoming session, teacher, progress nếu có dữ liệu.

Assistant:
- Xem assigned classes.

Class form fields:
- Name.
- Level, ví dụ N5/A1.
- Color swatch/color picker.
- Description.

States:
- Loading classes.
- Error + Try again.
- Empty: No classes yet. Teacher có CTA New Class; student thì thông báo chưa enrolled.

### `/students`

Mục đích: teacher quản lý học viên.

Teacher only / primary:
- Search students.
- Create student.
- List students with avatar initial, name, email, number of classes.
- Click student mở Student Detail dialog.

Create student form:
- Full name.
- Email.
- Temporary password.
- Phone optional.

States:
- Loading students.
- Error + Try again.
- Empty + CTA New Student.

### Student Detail dialog

Tabs:
- Profile.
- Scores.
- Comments.

Profile fields:
- Full name.
- Phone.
- Address.
- Occupation.
- Education level.
- Learning goal.
- Save profile CTA.

Scores tab:
- Add score row: Class, Type, Score, Max, optional Label.
- Score types: MIDTERM, FINAL, ASSIGNMENT, QUIZ, CUSTOM.
- List scores: class name, type/label, value/max, delete action.
- Empty state: No scores yet.

Comments tab:
- Category select: attitude, strengths, weaknesses, progress.
- Comment input + send.
- Timeline/list comments.
- Empty state: No comments yet.

Design notes:
- Dialog nên đủ rộng, tabs rõ, form không quá chật.
- Đây là page quan trọng cho teacher workflow.

### `/assistants`

Mục đích: quản lý trợ giảng.

Teacher capabilities:
- Search assistants.
- Create assistant.
- List assistants with avatar, name, email, assigned class count.
- Click mở Assistant Detail dialog.

Create assistant form:
- Full name.
- Email.
- Temporary password.
- Phone optional.

Assistant detail expected content:
- Profile info.
- Class assignments.
- Salary method/rate.
- Salary calculation/history if available.

States:
- Loading assistants.
- Error.
- Empty + CTA New Assistant.

Note: assistant is secondary for v1; design should exist but not dominate nav/visual hierarchy.

### `/documents`

Mục đích: learning materials.

Roles:
- Teacher/Assistant can manage materials.
- Student can view/open/download assigned materials only.

Filters:
- Category chips: All, A1, A2, B1, B2.

Material card fields:
- Type icon: PDF, MP3, LINK.
- Title.
- Type and category.
- Actions: Open for link, Download for file.
- Manager actions: Share/Assign, Delete.

Create/upload dialog:
- Mode: Link / File.
- Link mode: Title, URL, Category.
- File mode: Title, File input PDF/MP3, Category.
- Save CTA.

Share document dialog:
- Target type: Class / Student.
- Class select or Student select.
- Share CTA.

States:
- Loading documents.
- Error + Try again.
- Empty. Teacher/assistant CTA Add Material; student message says no assigned materials.

### `/payments`

Mục đích: tuition tracking và payment history.

Teacher capabilities:
- View all tuition records in tenant.
- Create new tuition bill.
- View detail.
- Record payment.
- Send reminder.

Student capabilities:
- View own tuition records/status/history.
- No create/record/reminder actions.

Main table/list columns:
- Student.
- Class.
- Total.
- Paid.
- Remaining.
- Status chip.
- View action.

Payment statuses:
- PENDING.
- PARTIALLY_PAID.
- PAID.
- OVERDUE.

Create tuition dialog:
- Student select.
- Class select.
- Total amount.
- Due date optional.
- Notes.
- Create CTA.

Detail dialog:
- Header: student name + class name + status chip.
- Summary: Total, Paid, Remaining.
- Record payment inline form: Amount, Method, Note, Record CTA.
- Methods: cash, transfer, card.
- Payment history table: Date, Receipt, Method, Amount.
- Empty history: No payments yet.
- Send reminder button if teacher and not paid.

Design notes:
- Payment status should be highly legible. Use color chips, but avoid only color dependence.
- Student view should feel like account/payment clarity, not admin table only.

### `/reports`

Mục đích: Excel exports cho teacher.

Report cards:
- Tuition Status: export all tuition records with balances. CTA Export Excel.
- Student Scores: export academic results, optionally filter by class. Class select + Export Excel.

States:
- Export loading/success/error toast.

Design notes:
- Simple utility page. Cards can be compact and businesslike.

### `/audit-logs`

Mục đích: xem nhật ký hành động quan trọng trong tenant.

Visible to teacher and super admin.

Table columns:
- When.
- Actor name + role.
- Action chip.
- Entity type + shortened entity id.

Action color examples:
- CREATED = success.
- UPDATED = info.
- DELETED = error.
- RECORDED = primary.

States:
- Loading logs.
- Error + Try again.
- Empty: No audit entries yet.

### `/profile`

Mục đích: cập nhật thông tin tài khoản.

Fields:
- Email disabled.
- Full name.
- Phone.
- Role chip.
- Save CTA.

States:
- Loading profile.
- Error + Try again.
- Save loading/success/error.

## 8. Domain Entities Cần Thể Hiện Trong UI

### User

Fields chính: full name, email, username optional, role, status, phone, avatar, email verified, teacher/tenant.

Roles: SUPER_ADMIN, TEACHER, ASSISTANT, STUDENT.
Statuses: PENDING, ACTIVE, LOCKED.

### Class

Fields chính: name, description, level, color, active status, student count, session count.

### Teaching Session

Fields chính: class, start time, end time, lesson topic, status, notes, recurring group, assistants.
Statuses: SCHEDULED, COMPLETED, CANCELLED.

### Student Profile

Fields chính: address, date of birth, occupation, education level, learning goal.

### Score

Fields chính: student, class, type, label, value, max value.
Types: MIDTERM, FINAL, ASSIGNMENT, QUIZ, CUSTOM.

### Student Comment

Fields chính: category, content, author, created at.
Categories currently used: attitude, strengths, weaknesses, progress.

### Document

Fields chính: title, description, type, category, file/link, owner, assignments.
Types: PDF, MP3, LINK.
Assignment target: STUDENT or CLASS.

### Tuition / Payment

Tuition fields: student, class, total amount, paid amount, status, due date, notes.
Payment record fields: amount, paid at, method, receipt number, note.

### Audit Log

Fields: when, actor, action, entity type, entity id, old/new values optional.

## 9. Component/Pattern Library Stitch Nên Thiết Kế

Thiết kế một UI system nhất quán cho:
- App shell: sidebar, topbar, bottom nav.
- Page header: title, subtitle, leading icon, actions.
- Stat cards.
- Agenda/upcoming session items.
- Calendar event style theo class color/status.
- Data cards cho classes/documents.
- Data tables cho payments/audit logs/reports.
- Search/filter bar.
- Chip filters.
- Role/status chips.
- Empty state component.
- Loading state component.
- Error state component.
- Dialogs/forms.
- Toast/snackbar.
- Avatar initials.
- File/material cards.
- Payment summary blocks.
- Timeline/comments list.

## 10. Visual Direction Mong Muốn

Tạo giao diện mới toanh, không chỉ skin lại UI cũ.

Mood:
- Professional education SaaS.
- Sáng, tin cậy, trẻ trung vừa phải.
- Teacher-friendly, dùng hằng ngày không mỏi mắt.
- Không quá playful, không quá enterprise nặng.

Layout:
- Dashboard dùng grid card + agenda rõ.
- Calendar là hero workspace thực tế của app, rộng và dễ thao tác.
- Students/classes/documents dùng card/list mix để scan nhanh.
- Payments/audit dùng table rõ, có responsive card alternative trên mobile.

Color:
- Có thể dùng blue/teal/green làm nền tảng nhưng cần palette phong phú, không một màu đơn điệu.
- Class colors phải nổi bật trên calendar nhưng vẫn hài hòa.
- Status colors rõ: success/paid, warning/partial/pending, error/overdue/deleted, neutral/cancelled.

Typography:
- Rõ ràng, hiện đại, dễ đọc số liệu và bảng.
- Không dùng hero font quá lớn trong app workspace.

Imagery:
- App này là operational SaaS, không cần hero illustration trong app.
- Nếu Stitch tạo visual assets, chỉ dùng icon/abstract education motifs rất nhẹ, không lấn át data.

## 11. Responsive Requirements

Desktop:
- Sidebar luôn hiện, content rộng.
- Calendar month/week/day đầy đủ.
- Tables hiển thị đủ cột.

Tablet:
- Sidebar có thể collapsible.
- Calendar + agenda hỗ trợ scan.
- Dialogs không tràn màn hình.

Mobile:
- Bottom navigation.
- Calendar ưu tiên list/schedule view.
- Tables chuyển thành cards hoặc horizontal scroll có kiểm soát.
- Form fields stack dọc.
- Primary actions luôn dễ chạm.

## 12. Critical UX Flows Không Được Bỏ Sót

### Teacher daily scheduling flow
1. Teacher login.
2. Land on Calendar hoặc dùng quick action New session.
3. Create class nếu chưa có.
4. Create single session hoặc recurring sessions.
5. Drag/resize event để reschedule.
6. Click event để edit/delete.
7. Xem upcoming sessions trên dashboard.

### Teacher class/student management flow
1. Create class.
2. Create student.
3. Open student detail.
4. Update student profile.
5. Add score/comment.
6. Xem counts và trạng thái empty/loading/error.

### Material assignment flow
1. Teacher/assistant vào Documents.
2. Add link hoặc upload PDF/MP3.
3. Assign material cho class hoặc student.
4. Student vào Documents và thấy tài liệu được giao.
5. Student open/download.

### Payment flow
1. Teacher tạo tuition bill cho student/class.
2. Teacher xem status pending/partial/paid/overdue.
3. Teacher record payment.
4. Payment history cập nhật.
5. Teacher send reminder nếu chưa paid.
6. Student xem payment của mình và remaining amount.

### Report flow
1. Teacher vào Reports.
2. Export tuition report.
3. Optional chọn class rồi export scores report.

## 13. Data/State Rules Cho Design

- Luôn phân biệt loading vs empty vs error vs permission/no access.
- Student không thấy CTA quản lý của teacher như New Class, New Student, New Tuition, Record Payment, Delete Document.
- Teacher/assistant có thể thấy Add Material nếu canManage.
- Calendar edit controls chỉ hiện cho teacher.
- Các destructive actions cần confirmation hoặc dialog rõ: delete class/session/document/score.
- Form validation hiển thị inline gần field.
- Sau action thành công dùng snackbar/toast.
- Các page có dữ liệu thật nhưng không hiện là bug class cần tránh: design phải có vùng hiển thị data rõ, không giấu trong state mơ hồ.

## 14. Những Gì Không Cần Thiết Kế Trong v1

- Center role/center dashboard/center management.
- Subscription billing SaaS plans.
- Native mobile app.
- Marketing landing page.
- Real email template builder.
- Deep super admin user management UI, trừ dashboard/audit/profile cơ bản.

## 15. Prompt Gợi Ý Để Paste Vào Google Stitch

Design a completely new, production-quality web app UI for "Schedule Teacher", a calendar-first education SaaS for independent language teachers and their students. Use the full product brief below as the source of truth. Prioritize teacher and student experiences. Do not design a marketing landing page. Do not copy PREP branding or assets; only use a clean modern education SaaS feeling as inspiration.

The app needs a logged-in SaaS shell with desktop sidebar, topbar, mobile bottom navigation, role-aware navigation, dashboard, calendar, classes, students, assistants, documents, payments, reports, audit logs, profile, and auth screens. Teacher workflow must center on the calendar. Student workflow must clearly show schedule, enrolled classes, assigned materials, scores/comments where relevant, and payment status. Include loading, empty, error, and success states. Include key dialogs: session create/edit with single/recurring modes, class form, student creation, student detail tabs, document add/upload/share, tuition creation, payment detail/record payment. Make the design original, responsive, clean, approachable, and data-dense enough for daily operations.

Use English UI labels unless otherwise requested. Keep role permissions clear: teacher can manage, student can view own data, assistant has limited assigned data, super admin is secondary. Avoid center-role workflows for v1.

