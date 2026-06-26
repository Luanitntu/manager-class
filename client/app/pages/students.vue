<script setup lang="ts">
import { type Student, useStudents, useStudentMutations } from '~/composables/useStudents';

const search = ref('');
const { data, isLoading } = useStudents(search);
const { createStudent } = useStudentMutations();

const students = computed(() => data.value?.data ?? []);
const totalStudents = computed(() => data.value?.meta?.total ?? students.value.length);

const detailOpen = ref(false);
const selectedId = ref<string | null>(null);

function openDetail(id: string) {
  selectedId.value = id;
  detailOpen.value = true;
}

const createOpen = ref(false);
const error = ref<string | null>(null);
const form = reactive({ fullName: '', email: '', password: '', phone: '' });

async function create() {
  error.value = null;
  try {
    await createStudent.mutateAsync({ ...form });
    createOpen.value = false;
    Object.assign(form, { fullName: '', email: '', password: '', phone: '' });
  } catch (e) {
    error.value = extractApiError(e) ?? 'Không thể tạo học viên';
  }
}

function initialOf(student: Student) {
  return student.fullName.trim().split(/\s+/).pop()?.[0]?.toUpperCase() ?? 'S';
}

function studentCode(index: number) {
  return `STU${String(index + 1).padStart(4, '0')}`;
}

function enrollmentCount(student: Student) {
  return student._count?.enrollments ?? 0;
}

function statusText(student: Student) {
  return enrollmentCount(student) > 0 ? 'Đang học' : 'Chưa xếp lớp';
}

function statusClass(student: Student) {
  return enrollmentCount(student) > 0 ? 'is-active' : 'is-pending';
}
</script>

<template>
  <div class="teacher-students">
    <header class="teacher-students__header">
      <div>
        <h1>Học viên</h1>
        <p>Quản lý danh sách {{ totalStudents }} học viên</p>
      </div>

      <div class="teacher-students__actions">
        <v-btn class="teacher-students__filter" variant="flat">
          <v-icon start size="16">mdi-filter-variant</v-icon>
          Lọc & Phân loại
        </v-btn>
        <v-btn class="teacher-students__create" color="primary" @click="createOpen = true">
          <v-icon start size="18">mdi-plus</v-icon>
          Thêm học viên
        </v-btn>
      </div>
    </header>

    <section class="teacher-students__panel">
      <div class="teacher-students__toolbar">
        <label class="teacher-students__search" for="student-search">
          <v-icon size="16">mdi-magnify</v-icon>
          <input
            id="student-search"
            v-model="search"
            autocomplete="off"
            placeholder="Tìm kiếm theo tên, email, sđt..."
            type="search"
          >
        </label>
      </div>

      <div class="teacher-students__table-wrap">
        <table v-if="students.length" class="teacher-students__table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Liên hệ</th>
              <th>Lớp học</th>
              <th>Trạng thái</th>
              <th class="is-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in students" :key="student.id" @click="openDetail(student.id)">
              <td>
                <div class="teacher-students__student-cell">
                  <v-avatar class="teacher-students__avatar" size="40">
                    <v-img v-if="student.avatarUrl" :src="student.avatarUrl" :alt="student.fullName" />
                    <span v-else>{{ initialOf(student) }}</span>
                  </v-avatar>
                  <div>
                    <strong>{{ student.fullName }}</strong>
                    <small>ID: {{ studentCode(index) }}</small>
                  </div>
                </div>
              </td>

              <td>
                <div class="teacher-students__contact">
                  <span><v-icon size="14">mdi-email-outline</v-icon>{{ student.email }}</span>
                  <span>
                    <v-icon size="14">mdi-phone-outline</v-icon>{{ student.phone || 'Chưa có SĐT' }}
                  </span>
                </div>
              </td>

              <td>
                <div class="teacher-students__classes">
                  <span>
                    <v-icon size="12">mdi-book-open-page-variant-outline</v-icon>
                    {{ enrollmentCount(student) ? `${enrollmentCount(student)} lớp học` : 'Chưa gán lớp' }}
                  </span>
                </div>
              </td>

              <td>
                <span :class="['teacher-students__status', statusClass(student)]">
                  {{ statusText(student) }}
                </span>
              </td>

              <td class="is-right">
                <v-btn
                  class="teacher-students__menu"
                  icon="mdi-dots-horizontal"
                  size="small"
                  variant="text"
                  @click.stop="openDetail(student.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="teacher-students__empty">
          <v-progress-circular v-if="isLoading" color="primary" indeterminate size="32" />
          <template v-else>
            <v-icon size="38">mdi-account-school-outline</v-icon>
            <strong>Chưa có học viên</strong>
            <span>Thêm học viên đầu tiên để bắt đầu quản lý lớp học.</span>
          </template>
        </div>
      </div>

      <footer class="teacher-students__footer">
        <span>
          Hiển thị {{ students.length ? 1 : 0 }} - {{ students.length }} của {{ totalStudents }} học viên
        </span>
        <div>
          <button disabled type="button">Trước</button>
          <button type="button">Tiếp</button>
        </div>
      </footer>
    </section>

    <StudentDetailDialog v-model="detailOpen" :student-id="selectedId" />

    <v-dialog v-model="createOpen" max-width="460">
      <v-card class="teacher-students__dialog">
        <v-card-title>Thêm học viên</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-text-field v-model="form.fullName" label="Họ tên" />
          <v-text-field v-model="form.email" label="Email" type="email" />
          <v-text-field v-model="form.password" label="Mật khẩu tạm thời" />
          <v-text-field v-model="form.phone" label="Số điện thoại (tuỳ chọn)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createOpen = false">Hủy</v-btn>
          <v-btn
            color="primary"
            :loading="createStudent.isPending.value"
            :disabled="!form.fullName || !form.email || form.password.length < 8"
            @click="create"
          >
            Tạo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.teacher-students {
  --students-blue: #0071f9;
  --students-text: #1e293b;
  --students-muted: #64748b;
  --students-border: #e2e8f0;

  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  max-width: 1152px;
  padding-bottom: 24px;
  width: 100%;

  &__header {
    align-items: center;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 24px;

    h1 {
      color: var(--students-text);
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.33;
      margin: 0;
    }

    p {
      color: var(--students-muted);
      font-size: 14px;
      font-weight: 500;
      margin: 4px 0 0;
    }
  }

  &__actions {
    align-items: center;
    display: flex;
    gap: 12px;
  }

  &__filter,
  &__create {
    border-radius: 8px !important;
    box-shadow: 0 1px 2px rgb(15 23 42 / 8%) !important;
    font-size: 14px;
    font-weight: 800;
    height: 38px !important;
    letter-spacing: 0;
    padding: 0 16px !important;
  }

  &__filter {
    background: #fff !important;
    border: 1px solid var(--students-border);
    color: #334155 !important;
  }

  &__create {
    background: var(--students-blue) !important;
    color: #fff !important;
  }

  &__panel {
    background: #fff;
    border: 1px solid var(--students-border);
    border-radius: 12px;
    box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  &__toolbar {
    background: #f8fafc;
    border-bottom: 1px solid var(--students-border);
    display: flex;
    gap: 16px;
    padding: 16px;
  }

  &__search {
    align-items: center;
    background: #fff;
    border: 1px solid var(--students-border);
    border-radius: 8px;
    color: #94a3b8;
    display: flex;
    gap: 8px;
    height: 38px;
    max-width: 448px;
    padding: 0 12px;
    transition: border-color 180ms ease, box-shadow 180ms ease;
    width: 100%;

    &:focus-within {
      border-color: var(--students-blue);
      box-shadow: 0 0 0 3px rgb(0 113 249 / 12%);
    }

    input {
      color: #334155;
      font-size: 14px;
      font-weight: 500;
      min-width: 0;
      outline: none;
      width: 100%;

      &::placeholder {
        color: #94a3b8;
      }
    }
  }

  &__table-wrap {
    overflow-x: auto;
  }

  &__table {
    border-collapse: collapse;
    font-size: 14px;
    min-width: 900px;
    text-align: left;
    width: 100%;

    thead {
      background: #fff;
      border-bottom: 1px solid var(--students-border);
      color: var(--students-muted);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    th,
    td {
      padding: 16px 24px;
      vertical-align: middle;
      white-space: nowrap;
    }

    tbody tr {
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background 180ms ease;

      &:hover {
        background: #f8fafc;
      }

      &:last-child {
        border-bottom: 0;
      }
    }

    .is-right {
      text-align: right;
    }
  }

  &__student-cell {
    align-items: center;
    display: flex;
    gap: 12px;

    strong {
      color: var(--students-text);
      display: block;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.2;
    }

    small {
      color: var(--students-muted);
      display: block;
      font-size: 12px;
      font-weight: 500;
      margin-top: 2px;
    }
  }

  &__avatar {
    background: #dbeafe !important;
    color: #2563eb !important;
    font-size: 14px;
    font-weight: 800;
  }

  &__contact {
    color: #475569;
    display: flex;
    flex-direction: column;
    font-weight: 500;
    gap: 4px;

    span {
      align-items: center;
      display: inline-flex;
      gap: 6px;
    }

    :deep(.v-icon) {
      color: #94a3b8;
    }
  }

  &__classes {
    display: flex;
    flex-direction: column;
    gap: 6px;

    span {
      align-items: center;
      background: #f1f5f9;
      border-radius: 4px;
      color: #334155;
      display: inline-flex;
      font-size: 12px;
      font-weight: 800;
      gap: 4px;
      padding: 6px 10px;
      width: fit-content;
    }

    :deep(.v-icon) {
      color: var(--students-blue);
    }
  }

  &__status {
    border-radius: 999px;
    display: inline-flex;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;
    padding: 7px 10px;

    &.is-active {
      background: #d1fae5;
      color: #047857;
    }

    &.is-pending {
      background: #ffedd5;
      color: #c2410c;
    }
  }

  &__menu {
    border-radius: 8px !important;
    color: #94a3b8 !important;

    &:hover {
      background: #eff6ff !important;
      color: var(--students-blue) !important;
    }
  }

  &__empty {
    align-items: center;
    color: var(--students-muted);
    display: grid;
    gap: 10px;
    justify-items: center;
    min-height: 320px;
    padding: 40px;
    text-align: center;

    strong {
      color: var(--students-text);
      font-size: 18px;
      font-weight: 800;
    }
  }

  &__footer {
    align-items: center;
    background: #fff;
    border-top: 1px solid var(--students-border);
    color: var(--students-muted);
    display: flex;
    font-size: 14px;
    justify-content: space-between;
    padding: 16px;

    button {
      border: 1px solid var(--students-border);
      border-radius: 4px;
      color: #334155;
      font-size: 14px;
      font-weight: 600;
      line-height: 1;
      margin-left: 4px;
      min-height: 28px;
      padding: 0 12px;
      transition: background 180ms ease;

      &:hover:not(:disabled) {
        background: #f8fafc;
      }

      &:disabled {
        color: #94a3b8;
      }
    }
  }

  &__dialog {
    border-radius: 12px !important;
  }
}

@media (max-width: 760px) {
  .teacher-students {
    &__header {
      align-items: stretch;
      flex-direction: column;
    }

    &__actions {
      align-items: stretch;
      flex-direction: column;
    }

    &__filter,
    &__create {
      width: 100%;
    }

    &__footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
