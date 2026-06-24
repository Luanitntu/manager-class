<script setup lang="ts">
import { useClasses, useClassMutations, type ClassItem, type ClassStudentRef } from '~/composables/useClasses';

const search = ref('');
const page = ref(1);
watch(search, () => (page.value = 1));

const { data, isLoading } = useClasses(search, page, 9);
const { create, update, remove } = useClassMutations();
const avatar = useAvatar();

const classes = computed(() => data.value?.data ?? []);
const meta = computed(() => data.value?.meta);
const totalClasses = computed(() => meta.value?.total ?? classes.value.length);

// ── Card metrics (REAL data) ───────────────────────────────────────────────
// Progress = completed sessions / total. "Total" prefers the planned
// totalSessions field; falls back to the count of created sessions.
function progressDenom(c: ClassItem) {
  return c.totalSessions || c._count?.sessions || 0;
}
function progressPct(c: ClassItem) {
  const denom = progressDenom(c);
  if (!denom) return 0;
  return Math.min(100, Math.round(((c.completedSessions ?? 0) / denom) * 100));
}
function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}
function avatarFor(s: ClassStudentRef) {
  return avatar(s);
}
const STACK_COLORS = ['#5D87FF', '#13DEB9', '#FFAE1F', '#FA896B'];
function extraStudents(c: ClassItem) {
  return (c._count?.enrollments ?? 0) - (c.students?.length ?? 0);
}

// Quick-pick palette for class colors (rows for v-color-picker swatches).
const colorSwatches = [
  ['#5D87FF', '#49BEFF', '#13DEB9'],
  ['#FFAE1F', '#FA896B', '#FF5C8E'],
  ['#7C4DFF', '#00C292', '#0BB2FB'],
  ['#E91E63', '#9C27B0', '#3F51B5'],
];

// PLACEHOLDER — "Buổi tiếp theo" still needs the class's next SCHEDULED session
// in the list payload (see STATUS backlog). Rotating sample for now.
const NEXT_SAMPLES = ['Hôm nay, 09:00', 'Hôm nay, 14:00', 'Ngày mai, 18:30', 'T5, 08:00', 'T6, 17:30'];
function nextSessionLabel(index: number) {
  return NEXT_SAMPLES[index % NEXT_SAMPLES.length];
}

// ── Create / edit dialog ───────────────────────────────────────────────────
const dialog = ref(false);
const editingId = ref<string | null>(null);
const error = ref<string | null>(null);
const blankForm = () => ({
  name: '',
  level: '',
  color: '#5D87FF',
  description: '',
  totalSessions: null as number | null,
  locationType: 'OFFLINE' as 'OFFLINE' | 'ONLINE',
  room: '',
  meetingProvider: 'GOOGLE_MEET' as 'GOOGLE_MEET' | 'ZOOM' | 'OTHER',
  meetingUrl: '',
});
const form = reactive(blankForm());
const providerItems = [
  { value: 'GOOGLE_MEET', title: 'Google Meet' },
  { value: 'ZOOM', title: 'Zoom' },
  { value: 'OTHER', title: 'Khác' },
];

function openCreate() {
  editingId.value = null;
  Object.assign(form, blankForm());
  error.value = null;
  dialog.value = true;
}
function openEdit(c: ClassItem) {
  editingId.value = c.id;
  Object.assign(form, {
    ...blankForm(),
    name: c.name,
    level: c.level ?? '',
    color: c.color ?? '#5D87FF',
    description: c.description ?? '',
    totalSessions: c.totalSessions ?? null,
    locationType: c.locationType ?? 'OFFLINE',
    room: c.room ?? '',
    meetingProvider: c.meetingProvider ?? 'GOOGLE_MEET',
    meetingUrl: c.meetingUrl ?? '',
  });
  error.value = null;
  dialog.value = true;
}

async function save() {
  error.value = null;
  const body = {
    name: form.name,
    level: form.level || undefined,
    color: form.color || undefined,
    description: form.description || undefined,
    totalSessions: form.totalSessions || undefined,
    locationType: form.locationType,
    room: form.locationType === 'OFFLINE' ? form.room || undefined : undefined,
    meetingProvider: form.locationType === 'ONLINE' ? form.meetingProvider : undefined,
    meetingUrl: form.locationType === 'ONLINE' ? form.meetingUrl || undefined : undefined,
  };
  try {
    if (editingId.value) await update.mutateAsync({ id: editingId.value, body });
    else await create.mutateAsync(body);
    dialog.value = false;
  } catch (e) {
    error.value = extractApiError(e);
  }
}

async function destroy(c: ClassItem) {
  if (
    !confirm(
      `Xoá lớp "${c.name}"?\n\nNếu lớp chưa phát sinh dữ liệu (học viên, buổi học, học phí…) sẽ bị XOÁ VĨNH VIỄN. Nếu đã có, lớp sẽ được lưu trữ (ẩn đi) để giữ lịch sử.`,
    )
  )
    return;
  await remove.mutateAsync(c.id);
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Lớp học của tôi</h1>
        <p class="text-medium-emphasis ma-0">
          Bạn đang quản lý {{ totalClasses }} lớp học đang hoạt động
        </p>
      </div>
      <div class="d-flex align-center ga-3">
        <v-text-field
          v-model="search"
          placeholder="Tìm kiếm lớp học…"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          density="comfortable"
          style="min-width: 260px"
        />
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Tạo lớp mới</v-btn>
      </div>
    </div>

    <v-row v-if="classes.length">
      <v-col v-for="(c, i) in classes" :key="c.id" cols="12" sm="6" md="4">
        <v-card class="st-class-card h-100 d-flex flex-column" :to="`/classes/${c.id}`" link>
          <!-- colored top border -->
          <div class="st-class-bar" :style="{ background: c.color || '#5D87FF' }" />

          <div class="pa-4 flex-grow-1 d-flex flex-column">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-chip size="small" variant="tonal" class="text-uppercase font-weight-medium">
                {{ c.level || 'Chung' }}
              </v-chip>
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-horizontal"
                    variant="text"
                    size="small"
                    v-bind="props"
                    @click.prevent.stop
                  />
                </template>
                <v-list density="compact">
                  <v-list-item prepend-icon="mdi-eye-outline" title="Chi tiết" :to="`/classes/${c.id}`" />
                  <v-list-item prepend-icon="mdi-pencil-outline" title="Chỉnh sửa" @click.prevent.stop="openEdit(c)" />
                  <v-list-item
                    prepend-icon="mdi-delete-outline"
                    title="Xoá"
                    class="text-error"
                    @click.prevent.stop="destroy(c)"
                  />
                </v-list>
              </v-menu>
            </div>

            <h3 class="text-h6 font-weight-bold mb-2">{{ c.name }}</h3>
            <div class="mb-3">
              <ClassLocation :value="c" />
            </div>

            <v-row no-gutters class="mb-4">
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis d-flex align-center ga-1">
                  <v-icon size="14">mdi-account-multiple-outline</v-icon> Học viên
                </div>
                <div class="font-weight-bold">{{ c._count?.enrollments ?? 0 }} học viên</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis d-flex align-center ga-1">
                  <v-icon size="14">mdi-calendar-outline</v-icon> Số buổi
                </div>
                <div class="font-weight-bold">{{ c.totalSessions ?? c._count?.sessions ?? 0 }} buổi</div>
              </v-col>
            </v-row>

            <!-- Next session (placeholder) -->
            <div class="st-next d-flex align-center justify-space-between px-3 py-2 mb-4">
              <span class="text-caption text-medium-emphasis">Buổi tiếp theo</span>
              <span class="text-caption font-weight-medium">{{ nextSessionLabel(i) }}</span>
            </div>

            <!-- Course progress (REAL: completed / total sessions) -->
            <div class="mb-1 d-flex align-center justify-space-between">
              <span class="text-caption text-medium-emphasis">Tiến độ khoá học</span>
              <span class="text-caption font-weight-medium">
                {{ c.completedSessions ?? 0 }}/{{ progressDenom(c) }} buổi · {{ progressPct(c) }}%
              </span>
            </div>
            <v-progress-linear
              :model-value="progressPct(c)"
              :color="c.color || 'primary'"
              height="6"
              rounded
              class="mb-1"
            />
          </div>

          <v-divider />
          <div class="d-flex align-center justify-space-between px-4 py-3">
            <!-- Avatar stack (REAL students; initial fallback when no avatar) -->
            <div class="d-flex align-center">
              <v-avatar
                v-for="s in c.students ?? []"
                :key="s.id"
                size="26"
                class="st-stack-avatar"
                :color="STACK_COLORS[(c.students ?? []).indexOf(s) % STACK_COLORS.length]"
              >
                <v-img v-if="avatarFor(s)" :src="avatarFor(s)!" :alt="s.fullName" />
                <span v-else class="text-white" style="font-size: 11px">{{ initials(s.fullName) }}</span>
              </v-avatar>
              <span v-if="!(c.students ?? []).length" class="text-caption text-medium-emphasis">
                Chưa có học viên
              </span>
              <span v-else-if="extraStudents(c) > 0" class="text-caption text-medium-emphasis ml-2">
                +{{ extraStudents(c) }}
              </span>
            </div>
            <span class="text-primary text-body-2 font-weight-medium d-flex align-center">
              Chi tiết <v-icon size="16">mdi-chevron-right</v-icon>
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else-if="!isLoading" class="pa-12 text-center text-medium-emphasis">
      Chưa có lớp học nào. Tạo lớp đầu tiên để bắt đầu xếp lịch.
    </v-card>

    <div v-if="meta && meta.totalPages > 1" class="d-flex justify-center mt-6">
      <v-pagination v-model="page" :length="meta.totalPages" :total-visible="7" />
    </div>

    <!-- Create / edit dialog -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>{{ editingId ? 'Chỉnh sửa lớp' : 'Tạo lớp mới' }}</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-text-field v-model="form.name" label="Tên lớp" />
          <v-text-field v-model="form.level" label="Trình độ (vd: IELTS 6.5+)" />
          <v-text-field
            v-model.number="form.totalSessions"
            type="number"
            label="Tổng số buổi (toàn khoá)"
            hint="Dùng để tính tiến độ: số buổi đã học / tổng số buổi."
            persistent-hint
            min="1"
          />

          <div class="text-caption text-medium-emphasis mt-4 mb-1">Hình thức học</div>
          <v-btn-toggle v-model="form.locationType" mandatory density="comfortable" color="primary" class="mb-3">
            <v-btn value="OFFLINE" size="small"><v-icon start>mdi-map-marker-outline</v-icon>Offline</v-btn>
            <v-btn value="ONLINE" size="small"><v-icon start>mdi-video-outline</v-icon>Online</v-btn>
          </v-btn-toggle>
          <v-text-field
            v-if="form.locationType === 'OFFLINE'"
            v-model="form.room"
            label="Số phòng học"
            placeholder="VD: P.201"
            prepend-inner-icon="mdi-door"
          />
          <template v-else>
            <v-select
              v-model="form.meetingProvider"
              :items="providerItems"
              label="Nền tảng"
              prepend-inner-icon="mdi-video"
            />
            <v-text-field
              v-model="form.meetingUrl"
              label="Link tham gia"
              placeholder="https://…"
              prepend-inner-icon="mdi-link-variant"
            />
          </template>

          <div class="text-caption text-medium-emphasis mb-1">Màu lớp</div>
          <v-menu :close-on-content-click="false" location="bottom start">
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="outlined" class="text-none mb-4" size="large">
                <v-avatar :color="form.color" size="22" class="mr-2" />
                {{ form.color }}
                <v-icon end size="18">mdi-palette</v-icon>
              </v-btn>
            </template>
            <v-color-picker
              v-model="form.color"
              mode="hex"
              :swatches="colorSwatches"
              show-swatches
              hide-inputs
            />
          </v-menu>

          <v-textarea v-model="form.description" label="Mô tả" rows="2" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Huỷ</v-btn>
          <v-btn
            color="primary"
            :loading="create.isPending.value || update.isPending.value"
            :disabled="!form.name"
            @click="save"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.st-class-card {
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.st-class-card:hover {
  transform: translateY(-2px);
}
.st-class-bar {
  height: 5px;
}
.st-next {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 8px;
}
.st-stack-avatar {
  border: 2px solid rgb(var(--v-theme-surface));
  margin-left: -8px;
}
.st-stack-avatar:first-child {
  margin-left: 0;
}
</style>
