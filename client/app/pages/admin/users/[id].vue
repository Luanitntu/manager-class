<script setup lang="ts">
import { useAdminUserDetail, useAdminUserMutations } from '~/composables/useAdmin';

const route = useRoute();
const id = computed(() => route.params.id as string);
const { data: user } = useAdminUserDetail(id);
const { lock, unlock, resetPassword } = useAdminUserMutations();
const config = useRuntimeConfig();
const avatarSrc = computed(() =>
  user.value?.avatarKey ? `${config.public.apiBase}/users/${user.value.id}/avatar` : null,
);

const roleColor: Record<string, string> = {
  SUPER_ADMIN: 'error',
  TEACHER: 'primary',
  ASSISTANT: 'info',
  STUDENT: 'secondary',
};
const statusColor: Record<string, string> = { ACTIVE: 'success', LOCKED: 'error', PENDING: 'warning' };
const planColor: Record<string, string> = { trial: 'grey', personal: 'info', pro: 'primary', business: 'success' };

function money(n?: number) {
  return (n ?? 0).toLocaleString();
}

const resetOpen = ref(false);
const newPassword = ref('');
const resetMsg = ref<string | null>(null);
async function doReset() {
  if (newPassword.value.length < 8) return;
  await resetPassword.mutateAsync({ id: id.value, password: newPassword.value });
  resetMsg.value = 'Đã đặt lại mật khẩu.';
}
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/admin/users" class="mb-4">
      {{ $t('nav.users') }}
    </v-btn>

    <div v-if="user">
      <div class="d-flex align-center ga-3 mb-6 flex-wrap">
        <v-avatar :color="roleColor[user.role]" size="48">
          <v-img v-if="avatarSrc" :src="avatarSrc" />
          <span v-else class="text-white text-h6">{{ user.fullName[0] }}</span>
        </v-avatar>
        <div class="flex-grow-1">
          <h1 class="text-h5 font-weight-bold">{{ user.fullName }}</h1>
          <div class="text-medium-emphasis">{{ user.email }}</div>
        </div>
        <v-chip :color="roleColor[user.role]" variant="tonal">{{ user.role.replace('_', ' ') }}</v-chip>
        <v-chip :color="statusColor[user.status]" variant="tonal">{{ user.status }}</v-chip>
      </div>

      <v-row>
        <!-- Account + subscription -->
        <v-col cols="12" md="5">
          <v-card class="pa-5 mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Tài khoản</h3>
            <v-table density="compact">
              <tbody>
                <tr><td class="text-medium-emphasis">Username</td><td>{{ user.username || '—' }}</td></tr>
                <tr><td class="text-medium-emphasis">Email verified</td><td>{{ user.emailVerified ? 'Có' : '—' }}</td></tr>
                <tr><td class="text-medium-emphasis">Tạo lúc</td><td>{{ new Date(user.createdAt).toLocaleString() }}</td></tr>
              </tbody>
            </v-table>

            <v-divider class="my-3" />
            <h4 class="text-subtitle-2 font-weight-bold mb-2">Đăng nhập cuối</h4>
            <v-table density="compact">
              <tbody>
                <tr>
                  <td class="text-medium-emphasis">Lần cuối</td>
                  <td>{{ user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Chưa đăng nhập' }}</td>
                </tr>
                <tr><td class="text-medium-emphasis">IP</td><td>{{ user.lastLoginIp || '—' }}</td></tr>
                <tr><td class="text-medium-emphasis">Tổng số lần đăng nhập</td><td>{{ user.loginCount ?? 0 }}</td></tr>
              </tbody>
            </v-table>
            <div class="d-flex ga-2 mt-3">
              <v-btn
                v-if="user.status !== 'LOCKED'"
                size="small" color="error" variant="tonal" prepend-icon="mdi-lock"
                :loading="lock.isPending.value" @click="lock.mutate(user.id)"
              >Khóa</v-btn>
              <v-btn
                v-else
                size="small" color="success" variant="tonal" prepend-icon="mdi-lock-open"
                :loading="unlock.isPending.value" @click="unlock.mutate(user.id)"
              >Mở khóa</v-btn>
              <v-btn size="small" variant="tonal" prepend-icon="mdi-key" @click="resetOpen = true; resetMsg = null">
                Reset mật khẩu
              </v-btn>
            </div>
          </v-card>

          <v-card class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-subtitle-1 font-weight-bold">Gói đăng ký</h3>
              <v-chip size="x-small" variant="tonal">V2</v-chip>
            </div>
            <div class="d-flex align-center ga-2 mb-2">
              <v-chip :color="planColor[user.subscription.plan]" variant="tonal" class="text-capitalize">
                {{ user.subscription.plan }}
              </v-chip>
            </div>
            <v-table density="compact">
              <tbody>
                <tr><td class="text-medium-emphasis">Bắt đầu</td><td>{{ new Date(user.subscription.startedAt).toLocaleDateString() }}</td></tr>
                <tr><td class="text-medium-emphasis">Hết hạn</td><td>{{ user.subscription.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : '—' }}</td></tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>

        <!-- Teacher tenant stats -->
        <v-col cols="12" md="7">
          <v-card v-if="user.stats" class="pa-5">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Hoạt động (tenant của giáo viên)</h3>
            <v-row>
              <v-col cols="6" sm="4">
                <div class="text-h6 font-weight-bold">{{ user.stats.classes }}</div>
                <div class="text-caption text-medium-emphasis">Lớp học</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-h6 font-weight-bold">{{ user.stats.students }}</div>
                <div class="text-caption text-medium-emphasis">Học sinh</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-h6 font-weight-bold">{{ user.stats.assistants }}</div>
                <div class="text-caption text-medium-emphasis">Trợ giảng</div>
              </v-col>
              <v-col cols="6" sm="6">
                <div class="text-h6 font-weight-bold text-success">{{ money(user.stats.revenueCollected) }}</div>
                <div class="text-caption text-medium-emphasis">Học phí đã thu</div>
              </v-col>
              <v-col cols="6" sm="6">
                <div class="text-h6 font-weight-bold text-warning">{{ money(user.stats.revenueOutstanding) }}</div>
                <div class="text-caption text-medium-emphasis">Còn nợ</div>
              </v-col>
            </v-row>
          </v-card>
          <v-card v-else class="pa-8 text-center text-medium-emphasis">
            Không có thống kê tenant cho vai trò này.
          </v-card>

          <!-- Account status history -->
          <v-card class="pa-5 mt-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Lịch sử trạng thái tài khoản</h3>
            <v-timeline v-if="user.statusHistory.length" side="end" density="compact" truncate-line="both">
              <v-timeline-item
                v-for="h in user.statusHistory"
                :key="h.id"
                size="x-small"
                :dot-color="h.action.includes('LOCK') ? 'error' : 'primary'"
              >
                <div class="d-flex justify-space-between ga-3">
                  <div>
                    <div class="font-weight-medium">{{ h.action.replace(/_/g, ' ') }}</div>
                    <div class="text-caption text-medium-emphasis">
                      bởi {{ h.actor?.fullName || 'hệ thống' }}
                      <span v-if="h.ipAddress"> · {{ h.ipAddress }}</span>
                    </div>
                  </div>
                  <div class="text-caption text-medium-emphasis text-no-wrap">
                    {{ new Date(h.createdAt).toLocaleString() }}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-medium-emphasis text-caption">Chưa có thay đổi nào.</div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-dialog v-model="resetOpen" max-width="420">
      <v-card>
        <v-card-title>Đặt lại mật khẩu</v-card-title>
        <v-card-text>
          <v-alert v-if="resetMsg" type="success" variant="tonal" density="compact" class="mb-3">{{ resetMsg }}</v-alert>
          <v-text-field v-model="newPassword" label="Mật khẩu mới (≥ 8 ký tự)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="resetOpen = false">Đóng</v-btn>
          <v-btn color="primary" :loading="resetPassword.isPending.value" :disabled="newPassword.length < 8" @click="doReset">
            Đặt lại
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
