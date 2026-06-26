<script setup lang="ts">
import { type ClassItem, useClasses, useClassMutations } from '~/composables/useClasses';

const search = ref('');
const { data, isLoading } = useClasses(search);
const { create, update, remove } = useClassMutations();

const classes = computed(() => data.value?.data ?? []);
const totalActiveClasses = computed(() => classes.value.filter((item) => item.isActive).length);

const dialog = ref(false);
const editing = ref<ClassItem | null>(null);
const error = ref<string | null>(null);
const pageError = ref<string | null>(null);
const form = reactive({ name: '', level: '', color: '#0071F9', description: '' });

const isSaving = computed(() => create.isPending.value || update.isPending.value);

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', level: '', color: '#0071F9', description: '' });
  error.value = null;
  dialog.value = true;
}

function openEdit(item: ClassItem) {
  editing.value = item;
  Object.assign(form, {
    name: item.name,
    level: item.level ?? '',
    color: item.color ?? '#0071F9',
    description: item.description ?? '',
  });
  error.value = null;
  dialog.value = true;
}

async function save() {
  error.value = null;
  try {
    const body = {
      name: form.name,
      level: form.level || undefined,
      color: form.color || undefined,
      description: form.description || undefined,
    };
    if (editing.value) {
      await update.mutateAsync({ id: editing.value.id, body });
    } else {
      await create.mutateAsync(body);
    }
    dialog.value = false;
  } catch (e) {
    error.value = extractApiError(e) ?? 'Không thể lưu lớp học';
  }
}

async function destroy(item: ClassItem) {
  if (!confirm(`Xóa lớp "${item.name}"?`)) return;
  pageError.value = null;
  try {
    await remove.mutateAsync(item.id);
  } catch (e) {
    pageError.value = extractApiError(e) ?? 'Không thể xóa lớp học';
  }
}

function classColor(item: ClassItem, index: number) {
  const fallback = ['#0071F9', '#6366F1', '#10B981', '#FF6B00', '#A855F7'];
  return item.color || fallback[index % fallback.length];
}

function activityProgress(item: ClassItem) {
  const sessions = item._count?.sessions ?? 0;
  if (sessions <= 0) return 0;
  return Math.min(95, Math.max(15, sessions * 4));
}

function nextSessionText(item: ClassItem) {
  const sessions = item._count?.sessions ?? 0;
  if (sessions > 0) return `${sessions} buổi đã lên lịch`;
  return 'Chưa có lịch';
}

function avatarItems(item: ClassItem) {
  return Array.from({ length: Math.min(3, item._count?.enrollments ?? 0) }, (_, index) => index + 1);
}

function extraStudentCount(item: ClassItem) {
  return Math.max(0, (item._count?.enrollments ?? 0) - 3);
}
</script>

<template>
  <div class="teacher-classes">
    <header class="teacher-classes__header">
      <div>
        <h1>Lớp học của tôi</h1>
        <p>Bạn đang quản lý {{ totalActiveClasses }} lớp học đang hoạt động</p>
      </div>

      <div class="teacher-classes__actions">
        <label class="teacher-classes__search" for="class-search">
          <v-icon size="16">mdi-magnify</v-icon>
          <input
            id="class-search"
            v-model="search"
            autocomplete="off"
            placeholder="Tìm kiếm lớp học..."
            type="search"
          >
        </label>
        <v-btn class="teacher-classes__create" color="primary" @click="openCreate">
          <v-icon start size="18">mdi-plus</v-icon>
          Tạo lớp mới
        </v-btn>
      </div>
    </header>

    <v-alert v-if="pageError" class="teacher-classes__alert" color="error" density="compact" variant="tonal">
      {{ pageError }}
    </v-alert>

    <div v-if="classes.length" class="teacher-classes__grid">
      <article
        v-for="(item, index) in classes"
        :key="item.id"
        class="teacher-classes__card"
        :style="{ '--class-color': classColor(item, index) }"
      >
        <div class="teacher-classes__strip" />

        <div class="teacher-classes__body">
          <div class="teacher-classes__card-head">
            <div class="teacher-classes__title-block">
              <span class="teacher-classes__level">{{ item.level || 'GENERAL' }}</span>
              <h2>{{ item.name }}</h2>
            </div>

            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="teacher-classes__menu"
                  icon="mdi-dots-horizontal"
                  size="small"
                  variant="text"
                />
              </template>
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-pencil" title="Chỉnh sửa" @click="openEdit(item)" />
                <v-list-item prepend-icon="mdi-delete-outline" title="Xóa lớp" @click="destroy(item)" />
              </v-list>
            </v-menu>
          </div>

          <div class="teacher-classes__stats">
            <div>
              <span><v-icon size="14">mdi-account-group-outline</v-icon> Học viên</span>
              <strong>{{ item._count?.enrollments ?? 0 }} học viên</strong>
            </div>
            <div>
              <span><v-icon size="14">mdi-calendar-month-outline</v-icon> Số buổi</span>
              <strong>{{ item._count?.sessions ?? 0 }} buổi</strong>
            </div>
          </div>

          <div class="teacher-classes__next">
            <span>Buổi tiếp theo</span>
            <strong>{{ nextSessionText(item) }}</strong>
          </div>

          <div class="teacher-classes__progress">
            <div>
              <span>Tiến độ khoá học</span>
              <strong>{{ activityProgress(item) }}%</strong>
            </div>
            <div class="teacher-classes__track">
              <span :style="{ width: `${activityProgress(item)}%` }" />
            </div>
          </div>
        </div>

        <footer class="teacher-classes__footer">
          <div class="teacher-classes__avatars" aria-label="Hoc vien trong lop">
            <span v-for="avatar in avatarItems(item)" :key="avatar">A{{ avatar }}</span>
            <span v-if="extraStudentCount(item) > 0">+{{ extraStudentCount(item) }}</span>
            <span v-else-if="!avatarItems(item).length">0</span>
          </div>

          <button class="teacher-classes__detail" type="button" @click="openEdit(item)">
            Chi tiết
            <v-icon size="16">mdi-chevron-right</v-icon>
          </button>
        </footer>
      </article>
    </div>

    <div v-else class="teacher-classes__empty">
      <v-progress-circular v-if="isLoading" color="primary" indeterminate size="32" />
      <template v-else>
        <v-icon size="38">mdi-google-classroom</v-icon>
        <strong>Chưa có lớp học</strong>
        <span>Tạo lớp đầu tiên để bắt đầu sắp lịch và quản lý học viên.</span>
        <v-btn color="primary" @click="openCreate">
          <v-icon start size="18">mdi-plus</v-icon>
          Tạo lớp mới
        </v-btn>
      </template>
    </div>

    <v-dialog v-model="dialog" max-width="500">
      <v-card class="teacher-classes__dialog">
        <v-card-title>{{ editing ? 'Chỉnh sửa lớp học' : 'Tạo lớp mới' }}</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-text-field v-model="form.name" label="Tên lớp" />
          <v-text-field v-model="form.level" label="Trình độ (ví dụ: IELTS 6.5+)" />
          <v-text-field v-model="form.color" label="Màu lớp" type="color" />
          <v-textarea v-model="form.description" label="Mô tả" rows="2" />
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Hủy</v-btn>
          <v-btn color="primary" :disabled="!form.name" :loading="isSaving" @click="save">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.teacher-classes {
  --classes-blue: #0071f9;
  --classes-text: #1e293b;
  --classes-muted: #64748b;
  --classes-border: #e2e8f0;

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
      color: var(--classes-text);
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.33;
      margin: 0;
    }

    p {
      color: var(--classes-muted);
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      margin: 4px 0 0;
    }
  }

  &__actions {
    align-items: center;
    display: flex;
    gap: 12px;
  }

  &__search {
    align-items: center;
    background: #fff;
    border: 1px solid var(--classes-border);
    border-radius: 8px;
    color: #94a3b8;
    display: flex;
    gap: 8px;
    height: 38px;
    padding: 0 12px;
    transition: border-color 180ms ease, box-shadow 180ms ease;
    width: 256px;

    &:focus-within {
      border-color: var(--classes-blue);
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

  &__create {
    background: var(--classes-blue) !important;
    border-radius: 8px !important;
    box-shadow: 0 1px 2px rgb(15 23 42 / 8%) !important;
    color: #fff !important;
    font-size: 14px;
    font-weight: 800;
    height: 38px !important;
    letter-spacing: 0;
    padding: 0 16px !important;
  }

  &__alert {
    margin-bottom: 16px;
  }

  &__grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &__card {
    background: #fff;
    border: 1px solid var(--classes-border);
    border-radius: 12px;
    box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
    overflow: hidden;
    position: relative;
    transition: border-color 180ms ease, box-shadow 180ms ease;

    &:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 6px -1px rgb(15 23 42 / 10%), 0 2px 4px -2px rgb(15 23 42 / 10%);

      h2 {
        color: var(--classes-blue);
      }
    }
  }

  &__strip {
    background: var(--class-color);
    height: 8px;
    width: 100%;
  }

  &__body {
    padding: 20px;
  }

  &__card-head {
    align-items: flex-start;
    display: flex;
    gap: 14px;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title-block {
    min-width: 0;
  }

  &__level {
    background: #f1f5f9;
    border-radius: 6px;
    color: #475569;
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    line-height: 1;
    margin-bottom: 8px;
    max-width: 100%;
    overflow: hidden;
    padding: 6px 10px;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  h2 {
    color: var(--classes-text);
    cursor: pointer;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.25;
    margin: 0;
    transition: color 180ms ease;
  }

  &__menu {
    border-radius: 6px !important;
    color: #94a3b8 !important;
    height: 30px !important;
    width: 30px !important;

    &:hover {
      background: #f8fafc !important;
      color: #475569 !important;
    }
  }

  &__stats {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 20px;

    div {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    span {
      align-items: center;
      color: var(--classes-muted);
      display: flex;
      font-size: 14px;
      font-weight: 500;
      gap: 6px;
      line-height: 1.3;
    }

    strong {
      color: var(--classes-text);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.3;
    }
  }

  &__next {
    align-items: center;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    min-height: 44px;
    padding: 12px;

    span,
    strong {
      font-size: 12px;
      line-height: 1.25;
    }

    span {
      color: var(--classes-muted);
      font-weight: 500;
    }

    strong {
      color: var(--classes-blue);
      font-weight: 800;
      text-align: right;
    }
  }

  &__progress {
    > div:first-child {
      align-items: center;
      color: #475569;
      display: flex;
      font-size: 12px;
      font-weight: 800;
      justify-content: space-between;
      line-height: 1.25;
      margin-bottom: 6px;
    }
  }

  &__track {
    background: #f1f5f9;
    border-radius: 999px;
    height: 8px;
    overflow: hidden;
    width: 100%;

    span {
      background: var(--class-color);
      border-radius: inherit;
      display: block;
      height: 100%;
      transition: width 240ms ease;
    }
  }

  &__footer {
    align-items: center;
    background: #f8fafc;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    min-height: 54px;
    padding: 12px 20px;
  }

  &__avatars {
    display: flex;
    margin-left: 0;

    span {
      align-items: center;
      background: #e2e8f0;
      border: 2px solid #fff;
      border-radius: 50%;
      color: #475569;
      display: inline-flex;
      font-size: 10px;
      font-weight: 800;
      height: 24px;
      justify-content: center;
      line-height: 1;
      margin-left: -8px;
      min-width: 24px;
      padding: 0 3px;

      &:first-child {
        margin-left: 0;
      }
    }
  }

  &__detail {
    align-items: center;
    color: var(--classes-blue);
    display: inline-flex;
    font-size: 14px;
    font-weight: 800;
    gap: 4px;
    line-height: 1;
    transition: color 180ms ease;

    &:hover {
      color: #1e40af;
    }
  }

  &__empty {
    align-items: center;
    background: #fff;
    border: 1px solid var(--classes-border);
    border-radius: 12px;
    color: var(--classes-muted);
    display: grid;
    gap: 10px;
    justify-items: center;
    min-height: 320px;
    padding: 40px;
    text-align: center;

    strong {
      color: var(--classes-text);
      font-size: 18px;
      font-weight: 800;
    }

    span {
      font-size: 14px;
      font-weight: 500;
      max-width: 360px;
    }
  }

  &__dialog {
    border-radius: 12px !important;
  }
}

@media (max-width: 1120px) {
  .teacher-classes {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 760px) {
  .teacher-classes {
    &__header {
      align-items: stretch;
      flex-direction: column;
    }

    &__actions {
      align-items: stretch;
      flex-direction: column;
    }

    &__search {
      width: 100%;
    }

    &__create {
      width: 100%;
    }

    &__grid {
      gap: 16px;
      grid-template-columns: 1fr;
    }
  }
}
</style>
