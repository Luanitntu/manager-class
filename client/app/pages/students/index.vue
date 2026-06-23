<script setup lang="ts">
import { useStudents, useStudentMutations, type Student, type StudyStatus } from '~/composables/useStudents';

const search = ref('');
const status = ref('');
const page = ref(1);
watch([search, status], () => (page.value = 1));

const { data, isLoading } = useStudents(search, status, page, 10);
const { createStudent, setStatus, deleteStudent } = useStudentMutations();
const avatar = useAvatar();

const students = computed(() => data.value?.data ?? []);
const meta = computed(() => data.value?.meta);
const total = computed(() => meta.value?.total ?? students.value.length);
const fromRow = computed(() => (meta.value ? (meta.value.page - 1) * meta.value.limit + 1 : 0));
const toRow = computed(() => (meta.value ? Math.min(meta.value.page * meta.value.limit, total.value) : 0));

// Study-status presentation.
const STATUS_META: Record<StudyStatus, { label: string; color: string }> = {
  STUDYING: { label: 'Đang học', color: 'success' },
  RESERVED: { label: 'Bảo lưu', color: 'warning' },
  GRADUATED: { label: 'Đã tốt nghiệp', color: 'info' },
};
function statusOf(s: Student): StudyStatus {
  return s.studentProfile?.studyStatus ?? 'STUDYING';
}
const statusFilterItems = [
  { value: '', title: 'Tất cả trạng thái' },
  { value: 'STUDYING', title: 'Đang học' },
  { value: 'RESERVED', title: 'Bảo lưu' },
  { value: 'GRADUATED', title: 'Đã tốt nghiệp' },
];

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function openDetail(id: string) {
  navigateTo(`/students/${id}`);
}

async function changeStatus(s: Student, next: StudyStatus) {
  await setStatus.mutateAsync({ id: s.id, status: next });
}

async function destroy(s: Student) {
  if (!confirm(`Xoá học viên "${s.fullName}"? Hồ sơ sẽ được lưu trữ (ẩn đi).`)) return;
  await deleteStudent.mutateAsync(s.id);
}

// ── Create ──────────────────────────────────────────────────────────────────
const createOpen = ref(false);
const error = ref<string | null>(null);
const form = reactive({ fullName: '', email: '', password: '', phone: '' });

function openCreate() {
  Object.assign(form, { fullName: '', email: '', password: '', phone: '' });
  error.value = null;
  createOpen.value = true;
}
async function create() {
  error.value = null;
  try {
    await createStudent.mutateAsync({ ...form });
    createOpen.value = false;
  } catch (e) {
    error.value = extractApiError(e);
  }
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Học viên</h1>
        <p class="text-medium-emphasis ma-0">Quản lý danh sách {{ total }} học viên</p>
      </div>
      <div class="d-flex align-center ga-3">
        <v-menu :close-on-content-click="false" location="bottom end">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="outlined" prepend-icon="mdi-filter-variant">
              Lọc &amp; Phân loại
            </v-btn>
          </template>
          <v-card min-width="240" class="pa-3">
            <div class="text-caption text-medium-emphasis mb-1">Trạng thái</div>
            <v-select
              v-model="status"
              :items="statusFilterItems"
              density="comfortable"
              hide-details
              variant="outlined"
            />
          </v-card>
        </v-menu>
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openCreate">
          Thêm học viên
        </v-btn>
      </div>
    </div>

    <v-card>
      <div class="pa-4 pb-2">
        <v-text-field
          v-model="search"
          placeholder="Tìm kiếm theo tên, email, sđt…"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          density="comfortable"
          style="max-width: 420px"
        />
      </div>

      <v-table v-if="students.length" hover>
        <thead>
          <tr>
            <th>HỌC VIÊN</th>
            <th>LIÊN HỆ</th>
            <th>LỚP HỌC</th>
            <th>TRẠNG THÁI</th>
            <th class="text-right">THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in students" :key="s.id" style="cursor: pointer" @click="openDetail(s.id)">
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar color="primary" variant="tonal" size="38">
                  <v-img v-if="avatar(s)" :src="avatar(s)!" :alt="s.fullName" />
                  <span v-else class="font-weight-medium">{{ initials(s.fullName) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ s.fullName }}</div>
                  <div class="text-caption text-medium-emphasis">ID: {{ s.studentProfile?.code || '—' }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="text-body-2 d-flex align-center ga-1">
                <v-icon size="14" class="text-medium-emphasis">mdi-email-outline</v-icon>{{ s.email }}
              </div>
              <div class="text-body-2 d-flex align-center ga-1">
                <v-icon size="14" class="text-medium-emphasis">mdi-phone-outline</v-icon>{{ s.phone || '—' }}
              </div>
            </td>
            <td>
              <div v-if="s.enrollments?.length" class="d-flex flex-column ga-1 py-1" style="max-width: 220px">
                <v-chip
                  v-for="e in s.enrollments"
                  :key="e.class.id"
                  size="small"
                  variant="tonal"
                  prepend-icon="mdi-book-open-variant"
                  class="justify-start"
                >
                  {{ e.class.name }}
                </v-chip>
              </div>
              <span v-else class="text-caption text-medium-emphasis">—</span>
            </td>
            <td>
              <v-chip size="small" :color="STATUS_META[statusOf(s)].color" variant="tonal">
                {{ STATUS_META[statusOf(s)].label }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-horizontal" variant="text" size="small" v-bind="props" @click.stop />
                </template>
                <v-list density="compact">
                  <v-list-item prepend-icon="mdi-eye-outline" title="Xem chi tiết" @click.stop="openDetail(s.id)" />
                  <v-divider />
                  <v-list-subheader>Đổi trạng thái</v-list-subheader>
                  <v-list-item
                    v-for="opt in (['STUDYING', 'RESERVED', 'GRADUATED'] as StudyStatus[])"
                    :key="opt"
                    :title="STATUS_META[opt].label"
                    :active="statusOf(s) === opt"
                    @click.stop="changeStatus(s, opt)"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-delete-outline"
                    title="Xoá"
                    class="text-error"
                    @click.stop="destroy(s)"
                  />
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-else-if="!isLoading" class="pa-12 text-center text-medium-emphasis">
        Chưa có học viên nào.
      </div>

      <div class="d-flex align-center justify-space-between px-4 py-3 flex-wrap ga-2">
        <span class="text-caption text-medium-emphasis">
          Hiển thị {{ fromRow }} - {{ toRow }} của {{ total }} học viên
        </span>
        <div class="d-flex ga-2">
          <v-btn
            variant="outlined"
            size="small"
            :disabled="(meta?.page ?? 1) <= 1"
            @click="page = Math.max(1, (meta?.page ?? 1) - 1)"
          >
            Trước
          </v-btn>
          <v-btn
            variant="outlined"
            size="small"
            :disabled="(meta?.page ?? 1) >= (meta?.totalPages ?? 1)"
            @click="page = (meta?.page ?? 1) + 1"
          >
            Tiếp
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Create dialog -->
    <v-dialog v-model="createOpen" max-width="460">
      <v-card>
        <v-card-title>Thêm học viên</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-text-field v-model="form.fullName" label="Họ tên" />
          <v-text-field v-model="form.email" label="Email" type="email" />
          <v-text-field v-model="form.password" label="Mật khẩu tạm (≥ 8)" />
          <v-text-field v-model="form.phone" label="Số điện thoại (tuỳ chọn)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createOpen = false">Huỷ</v-btn>
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
