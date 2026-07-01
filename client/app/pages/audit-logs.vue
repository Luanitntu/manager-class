<script setup lang="ts">
import { useAuditLogs } from '~/composables/useAudit';

type BadgeTone = 'neutral' | 'primary' | 'info' | 'success' | 'danger';

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

const actionTone: Record<string, BadgeTone> = {
  CREATED: 'success',
  UPDATED: 'info',
  DELETED: 'danger',
  RECORDED: 'primary',
};

function toneFor(a: string): BadgeTone {
  const key = Object.keys(actionTone).find((k) => a.includes(k));
  return key ? (actionTone[key] ?? 'neutral') : 'neutral';
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
  <UiPage>
    <UiPageHeader title="Audit Logs" subtitle="Important actions performed in your tenant." />

    <div class="grid gap-4">
      <UiToolbar align="start">
        <div class="w-full min-w-[180px] sm:w-[200px]">
          <UiSelect v-model="action" :items="actionOptions" label="Hành động" />
        </div>

        <div class="w-full min-w-[180px] sm:w-[200px]">
          <UiInput v-model="entityType" label="Loại đối tượng" placeholder="User, Class..." />
        </div>

        <div class="w-full min-w-[160px] sm:w-[170px]">
          <UiInput v-model="from" type="date" label="Từ ngày" />
        </div>

        <div class="w-full min-w-[160px] sm:w-[170px]">
          <UiInput v-model="to" type="date" label="Đến ngày" />
        </div>

        <UiButton variant="ghost" leading-icon="mdi-filter-off" class="self-end" @click="clearFilters">
          Xóa lọc
        </UiButton>
      </UiToolbar>

      <UiCard padding="none">
        <div v-if="isLoading && !logs.length" class="p-4">
          <AppSkeleton variant="table" :rows="6" :columns="4" />
        </div>

        <UiTable v-else caption="Audit log entries" :empty="!logs.length">
          <thead v-if="logs.length">
            <tr class="border-b border-[var(--st-border)]">
              <th class="min-w-[180px] px-4 py-3 text-left text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                When
              </th>
              <th class="min-w-[220px] px-4 py-3 text-left text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                Actor
              </th>
              <th class="min-w-[160px] px-4 py-3 text-left text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                Action
              </th>
              <th class="min-w-[180px] px-4 py-3 text-left text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                Entity
              </th>
            </tr>
          </thead>

          <tbody v-if="logs.length" class="divide-y divide-[var(--st-border)]">
            <tr v-for="l in logs" :key="l.id" class="min-h-12">
              <td class="whitespace-nowrap px-4 py-3 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                {{ fmt(l.createdAt) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex min-w-0 flex-wrap gap-x-1 text-sm leading-[var(--st-leading-copy)]">
                  <span class="max-w-[220px] truncate font-normal text-[var(--st-text)]">
                    {{ l.actor?.fullName ?? '-' }}
                  </span>
                  <span v-if="l.actor?.role" class="font-normal text-[var(--st-muted)]">
                    ({{ l.actor.role }})
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <UiBadge :tone="toneFor(l.action)">
                  {{ l.action.replace(/_/g, ' ') }}
                </UiBadge>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                {{ l.entityType }}<span v-if="l.entityId"> - {{ l.entityId.slice(0, 8) }}</span>
              </td>
            </tr>
          </tbody>

          <template #empty>
            <UiEmptyState
              icon="mdi-clipboard-text-clock-outline"
              heading="No audit logs found"
              body="Adjust filters to view matching activity."
            />
          </template>
        </UiTable>
      </UiCard>

      <TablePager v-if="meta" v-model:page="page" v-model:limit="limit" :meta="meta" />
    </div>
  </UiPage>
</template>
