<script setup lang="ts">
import { useAuditLogs } from '~/composables/useAudit';

const action = ref('');
const entityType = ref('');
const from = ref('');
const to = ref('');
const page = ref(1);
const limit = ref(25);
watch([action, entityType, from, to, limit], () => (page.value = 1));

const { data, isLoading } = useAuditLogs({ action, entityType, from, to, page }, limit);
const logs = computed(() => data.value?.data ?? []);
const meta = computed(() => data.value?.meta);

const actionOptions = [
  { value: '', title: 'Tất cả hành động' },
  { value: 'CREATED', title: 'Tạo mới' },
  { value: 'UPDATED', title: 'Cập nhật' },
  { value: 'DELETED', title: 'Xóa' },
  { value: 'LOCKED', title: 'Khóa' },
  { value: 'UNLOCKED', title: 'Mở khóa' },
  { value: 'RESET', title: 'Reset mật khẩu' },
  { value: 'RECORDED', title: 'Ghi nhận' },
];

const actionColor: Record<string, string> = {
  CREATED: 'success',
  UPDATED: 'info',
  DELETED: 'error',
  RECORDED: 'primary',
};

function colorFor(a: string) {
  const key = Object.keys(actionColor).find((k) => a.includes(k));
  return key ? actionColor[key] : 'grey';
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}

function clearFilters() {
  action.value = '';
  entityType.value = '';
  from.value = '';
  to.value = '';
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Audit Logs</h1>
    <p class="text-medium-emphasis mb-6">Important actions performed in your tenant.</p>

    <div class="d-flex ga-3 mb-4 flex-wrap align-center">
      <v-select
        v-model="action"
        :items="actionOptions"
        label="Hành động"
        hide-details
        density="comfortable"
        style="max-width: 200px"
      />
      <v-text-field
        v-model="entityType"
        label="Loại đối tượng"
        placeholder="User, Class…"
        hide-details
        clearable
        density="comfortable"
        style="max-width: 200px"
      />
      <v-text-field
        v-model="from"
        type="date"
        label="Từ ngày"
        hide-details
        density="comfortable"
        style="max-width: 170px"
      />
      <v-text-field
        v-model="to"
        type="date"
        label="Đến ngày"
        hide-details
        density="comfortable"
        style="max-width: 170px"
      />
      <v-btn variant="text" prepend-icon="mdi-filter-off" @click="clearFilters">Xóa lọc</v-btn>
    </div>

    <v-card>
      <v-table>
        <thead>
          <tr>
            <th>When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logs" :key="l.id">
            <td class="text-caption">{{ fmt(l.createdAt) }}</td>
            <td>
              {{ l.actor?.fullName ?? '—' }}
              <span class="text-caption text-medium-emphasis">({{ l.actor?.role }})</span>
            </td>
            <td>
              <v-chip :color="colorFor(l.action)" size="small" variant="tonal">
                {{ l.action.replace(/_/g, ' ') }}
              </v-chip>
            </td>
            <td class="text-caption">
              {{ l.entityType }}<span v-if="l.entityId"> · {{ l.entityId.slice(0, 8) }}</span>
            </td>
          </tr>
          <tr v-if="!logs.length && !isLoading">
            <td colspan="4" class="text-center text-medium-emphasis pa-6">No audit entries yet.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <TablePager v-if="meta" v-model:page="page" v-model:limit="limit" :meta="meta" />
  </div>
</template>
