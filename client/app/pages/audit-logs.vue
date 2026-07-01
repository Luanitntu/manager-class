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
const totalLogs = computed(() => meta.value?.total ?? logs.value.length);
const actorCount = computed(() =>
  new Set(logs.value.map((log) => log.actor?.id ?? log.actor?.fullName).filter(Boolean)).size,
);
const activeFilters = computed(() => [action.value, entityType.value, from.value, to.value].filter(Boolean).length);

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
  <UiPage class="space-y-6" padding="none" width="full">
    <UiPageHeader title="Audit Logs" subtitle="Important workspace actions, filtered by activity and object." />

    <section class="grid gap-4 sm:grid-cols-3">
      <UiMetricCard label="Visible events" :value="totalLogs">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-blue-200 bg-blue-50 text-[var(--st-primary)]">
            <AppIcon name="mdi-history" :size="24" />
          </span>
        </template>
        <template #hint>
          Matching current query
        </template>
      </UiMetricCard>
      <UiMetricCard label="Actors" :value="actorCount">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-violet-200 bg-violet-50 text-violet-600">
            <AppIcon name="mdi-account-multiple-outline" :size="24" />
          </span>
        </template>
        <template #hint>
          In the loaded page
        </template>
      </UiMetricCard>
      <UiMetricCard label="Active filters" :value="activeFilters">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-orange-200 bg-orange-50 text-orange-600">
            <AppIcon name="mdi-filter-variant" :size="24" />
          </span>
        </template>
        <template #hint>
          Action, entity, or date
        </template>
      </UiMetricCard>
    </section>

    <section class="rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white">
      <div class="flex min-w-0 flex-col gap-4 border-b border-[var(--st-border)] p-4 sm:p-6">
        <div class="flex min-w-0 items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
            <AppIcon name="mdi-shield-search" :size="22" />
          </span>
          <div class="min-w-0">
            <h2 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
              Activity trail
            </h2>
            <p class="mt-1 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
              Review tenant activity with compact filters and a scroll-contained table.
            </p>
          </div>
        </div>

        <UiToolbar align="start" class="rounded-[var(--st-radius)] border border-[var(--st-border)] bg-slate-50/70">
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
      </div>

      <div v-if="isLoading && !logs.length" class="p-4 sm:p-6">
        <AppSkeleton variant="table" :rows="6" :columns="4" />
      </div>

      <div v-else class="p-4 sm:p-6">
        <UiTable caption="Audit log entries" :empty="!logs.length">
          <thead v-if="logs.length">
            <tr class="border-b border-[var(--st-border)] bg-slate-50">
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
            <tr v-for="l in logs" :key="l.id" class="min-h-12 transition hover:bg-slate-50">
              <td class="whitespace-nowrap px-4 py-3 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                <span class="inline-flex items-center gap-2">
                  <AppIcon name="mdi-clock-outline" :size="15" class="text-[var(--st-muted)]" />
                  {{ fmt(l.createdAt) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex min-w-0 items-center gap-2 text-sm leading-[var(--st-leading-copy)]">
                  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
                    <AppIcon name="mdi-account-outline" :size="16" />
                  </span>
                  <div class="min-w-0">
                    <span class="block max-w-[220px] truncate font-normal text-[var(--st-text)]">
                      {{ l.actor?.fullName ?? '-' }}
                    </span>
                    <span v-if="l.actor?.role" class="block truncate font-normal text-[var(--st-muted)]">
                      {{ l.actor.role }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <UiBadge :tone="toneFor(l.action)">
                  {{ l.action.replace(/_/g, ' ') }}
                </UiBadge>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                <span class="inline-flex items-center gap-2">
                  <AppIcon name="mdi-database-outline" :size="15" class="text-[var(--st-muted)]" />
                  {{ l.entityType }}<span v-if="l.entityId"> - {{ l.entityId.slice(0, 8) }}</span>
                </span>
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
      </div>
    </section>

    <TablePager v-if="meta" v-model:page="page" v-model:limit="limit" :meta="meta" />
  </UiPage>
</template>
