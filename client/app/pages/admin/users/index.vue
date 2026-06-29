<script setup lang="ts">
import { useAdminUsers, useAdminUserMutations, type AdminUser } from '~/composables/useAdmin';

const role = ref('');
const status = ref('');
const search = ref('');
const page = ref(1);
const limit = ref(20);
watch([role, status, search, limit], () => (page.value = 1));

const { data, isLoading } = useAdminUsers({ role, status, search, page }, limit);
const { create, updateUser, deleteUser, lock, unlock, resetPassword } = useAdminUserMutations();
const config = useRuntimeConfig();

function avatarOf(u: AdminUser) {
  return u.avatarKey ? `${config.public.apiBase}/users/${u.id}/avatar` : null;
}

const users = computed(() => data.value?.data ?? []);
const meta = computed(() => data.value?.meta);

const roleOptions = [
  { value: '', title: 'All roles' },
  { value: 'SUPER_ADMIN', title: 'Super Admin' },
  { value: 'TEACHER', title: 'Teacher' },
  { value: 'ASSISTANT', title: 'Assistant' },
  { value: 'STUDENT', title: 'Student' },
];
const statusOptions = [
  { value: '', title: 'All statuses' },
  { value: 'ACTIVE', title: 'Active' },
  { value: 'LOCKED', title: 'Locked' },
  { value: 'PENDING', title: 'Pending' },
];
const roleColor: Record<string, string> = {
  SUPER_ADMIN: 'error',
  TEACHER: 'primary',
  ASSISTANT: 'info',
  STUDENT: 'secondary',
};
const statusColor: Record<string, string> = {
  ACTIVE: 'success',
  LOCKED: 'error',
  PENDING: 'warning',
};

// ---- Create ----
const createOpen = ref(false);
const createError = ref<string | null>(null);
const createForm = reactive({ fullName: '', email: '', username: '', password: '', role: 'TEACHER' });
function openCreate() {
  Object.assign(createForm, { fullName: '', email: '', username: '', password: '', role: 'TEACHER' });
  createError.value = null;
  createOpen.value = true;
}
async function submitCreate() {
  createError.value = null;
  try {
    await create.mutateAsync({
      fullName: createForm.fullName,
      email: createForm.email,
      username: createForm.username || undefined,
      password: createForm.password,
      role: createForm.role,
    });
    createOpen.value = false;
  } catch (e) {
    createError.value = extractApiError(e);
  }
}

// ---- Edit ----
const editOpen = ref(false);
const editError = ref<string | null>(null);
const editId = ref<string | null>(null);
const editForm = reactive({ fullName: '', username: '', role: '' });
function openEdit(u: AdminUser) {
  editId.value = u.id;
  Object.assign(editForm, { fullName: u.fullName, username: u.username ?? '', role: u.role });
  editError.value = null;
  editOpen.value = true;
}
async function submitEdit() {
  if (!editId.value) return;
  editError.value = null;
  try {
    await updateUser.mutateAsync({
      id: editId.value,
      body: { fullName: editForm.fullName, username: editForm.username || undefined, role: editForm.role },
    });
    editOpen.value = false;
  } catch (e) {
    editError.value = extractApiError(e);
  }
}

async function destroy(u: AdminUser) {
  if (!confirm(`Vô hiệu hóa tài khoản "${u.fullName}"?`)) return;
  await deleteUser.mutateAsync(u.id);
}

// ---- Reset password ----
const resetOpen = ref(false);
const resetUser = ref<AdminUser | null>(null);
const newPassword = ref('');
const resetMsg = ref<string | null>(null);
function openReset(u: AdminUser) {
  resetUser.value = u;
  newPassword.value = '';
  resetMsg.value = null;
  resetOpen.value = true;
}
async function doReset() {
  if (!resetUser.value || newPassword.value.length < 8) return;
  await resetPassword.mutateAsync({ id: resetUser.value.id, password: newPassword.value });
  resetMsg.value = `Đã đặt lại mật khẩu cho ${resetUser.value.fullName}.`;
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-1">
      <h1 class="text-h5 font-weight-bold">{{ $t('nav.users') }}</h1>
      <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openCreate">Tạo user</v-btn>
    </div>
    <p class="text-medium-emphasis mb-6">Quản lý tất cả tài khoản trên nền tảng.</p>

    <div class="d-flex ga-3 mb-4 flex-wrap">
      <v-text-field
        v-model="search"
        placeholder="Tìm theo tên / email…"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        density="comfortable"
        style="max-width: 300px"
      />
      <v-select v-model="role" :items="roleOptions" label="Vai trò" hide-details density="comfortable" style="max-width: 180px" />
      <v-select v-model="status" :items="statusOptions" label="Trạng thái" hide-details density="comfortable" style="max-width: 180px" />
    </div>

    <v-card>
      <v-table v-if="users.length" hover>
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Đăng nhập</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar :color="roleColor[u.role]" size="34">
                  <v-img v-if="avatarOf(u)" :src="avatarOf(u)!" />
                  <span v-else class="text-white">{{ u.fullName[0] }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ u.fullName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td class="text-medium-emphasis">{{ u.username || '—' }}</td>
            <td>
              <v-chip size="small" :color="roleColor[u.role]" variant="tonal">{{ u.role.replace('_', ' ') }}</v-chip>
            </td>
            <td>
              <v-chip size="small" :color="statusColor[u.status]" variant="tonal">{{ u.status }}</v-chip>
            </td>
            <td class="text-right text-no-wrap">
              <v-btn size="small" variant="text" prepend-icon="mdi-eye" :to="`/admin/users/${u.id}`">Chi tiết</v-btn>
              <v-btn size="small" variant="text" prepend-icon="mdi-pencil" @click="openEdit(u)">Sửa</v-btn>
              <v-btn
                v-if="u.status !== 'LOCKED'"
                size="small" variant="text" color="error" prepend-icon="mdi-lock"
                @click="lock.mutate(u.id)"
              >Khóa</v-btn>
              <v-btn
                v-else
                size="small" variant="text" color="success" prepend-icon="mdi-lock-open"
                @click="unlock.mutate(u.id)"
              >Mở</v-btn>
              <v-btn size="small" variant="text" prepend-icon="mdi-key" @click="openReset(u)">Reset MK</v-btn>
              <v-btn size="small" variant="text" color="error" icon="mdi-delete" @click="destroy(u)" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-else-if="!isLoading" class="pa-12 text-center text-medium-emphasis">Không có người dùng.</div>
    </v-card>

    <TablePager v-if="meta" v-model:page="page" v-model:limit="limit" :meta="meta" />

    <!-- Create dialog -->
    <v-dialog v-model="createOpen" max-width="460">
      <v-card>
        <v-card-title>Tạo tài khoản</v-card-title>
        <v-card-text>
          <v-alert v-if="createError" type="error" variant="tonal" density="compact" class="mb-3">{{ createError }}</v-alert>
          <v-select
            v-model="createForm.role"
            :items="[{ value: 'TEACHER', title: 'Teacher' }, { value: 'SUPER_ADMIN', title: 'Super Admin' }]"
            label="Vai trò"
          />
          <v-text-field v-model="createForm.fullName" label="Họ tên" />
          <v-text-field v-model="createForm.email" label="Email" type="email" />
          <v-text-field v-model="createForm.username" label="Username (tùy chọn)" />
          <v-text-field v-model="createForm.password" label="Mật khẩu (≥ 8)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createOpen = false">Hủy</v-btn>
          <v-btn
            color="primary" :loading="create.isPending.value"
            :disabled="!createForm.fullName || !createForm.email || createForm.password.length < 8"
            @click="submitCreate"
          >Tạo</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit dialog -->
    <v-dialog v-model="editOpen" max-width="460">
      <v-card>
        <v-card-title>Sửa tài khoản</v-card-title>
        <v-card-text>
          <v-alert v-if="editError" type="error" variant="tonal" density="compact" class="mb-3">{{ editError }}</v-alert>
          <v-text-field v-model="editForm.fullName" label="Họ tên" />
          <v-text-field v-model="editForm.username" label="Username" />
          <v-select
            v-model="editForm.role"
            :items="['SUPER_ADMIN', 'TEACHER', 'ASSISTANT', 'STUDENT']"
            label="Vai trò"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="editOpen = false">Hủy</v-btn>
          <v-btn color="primary" :loading="updateUser.isPending.value" @click="submitEdit">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reset password -->
    <v-dialog v-model="resetOpen" max-width="420">
      <v-card>
        <v-card-title>Đặt lại mật khẩu</v-card-title>
        <v-card-text>
          <p class="text-medium-emphasis mb-3">{{ resetUser?.fullName }} ({{ resetUser?.email }})</p>
          <v-alert v-if="resetMsg" type="success" variant="tonal" density="compact" class="mb-3">{{ resetMsg }}</v-alert>
          <v-text-field v-model="newPassword" label="Mật khẩu mới (≥ 8 ký tự)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="resetOpen = false">Đóng</v-btn>
          <v-btn color="primary" :loading="resetPassword.isPending.value" :disabled="newPassword.length < 8" @click="doReset">Đặt lại</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
