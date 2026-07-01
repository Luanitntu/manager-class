<script setup lang="ts">
import {
  useAssistantDetail,
  useAssistantSalarySummary,
  useAssistantSessions,
  useAssistantMutations,
} from '~/composables/useAssistants';

type BadgeTone = 'info' | 'success' | 'danger';

const route = useRoute();
const { t, locale } = useI18n();
const userTz = useUserTimezone();

const id = computed(() => route.params.id as string);
const { data: assistant } = useAssistantDetail(id);
const { data: summary } = useAssistantSalarySummary(id);
const { data: sessions } = useAssistantSessions(id);
const { updateSalary } = useAssistantMutations();
const avatar = useAvatar();

const tab = ref('schedule');

interface ClassInvolvement {
  id: string;
  name: string;
  level?: string | null;
  color?: string | null;
  inCharge: boolean;
  sessions: number;
}

const involvement = computed<ClassInvolvement[]>(() => {
  const map = new Map<string, ClassInvolvement>();
  for (const ca of assistant.value?.classAssignments ?? []) {
    map.set(ca.class.id, { ...ca.class, inCharge: true, sessions: 0 });
  }
  for (const s of sessions.value ?? []) {
    const existing = map.get(s.class.id);
    if (existing) {
      existing.sessions += 1;
    } else {
      map.set(s.class.id, {
        id: s.class.id,
        name: s.class.name,
        level: s.class.level,
        color: s.class.color,
        inCharge: false,
        sessions: 1,
      });
    }
  }
  return [...map.values()];
});

const totalSessionsCount = computed(() => sessions.value?.length ?? 0);
const statusColor: Record<string, BadgeTone> = { SCHEDULED: 'info', COMPLETED: 'success', CANCELLED: 'danger' };
const methodLabel = computed<Record<string, string>>(() => ({
  PER_SESSION: t('assistant.perSession'),
  PER_HOUR: t('assistant.perHour'),
  PER_CLASS: t('assistant.perClass'),
}));
const salaryMethodItems = computed(() => [
  { value: 'PER_SESSION', title: t('assistant.perSession') },
  { value: 'PER_HOUR', title: t('assistant.perHour') },
  { value: 'PER_CLASS', title: t('assistant.perClass') },
]);
const tabItems = computed(() => [
  { value: 'schedule', label: t('assistant.schedule') },
  { value: 'breakdown', label: t('assistant.salaryBreakdown') },
  { value: 'history', label: t('assistant.salaryHistory') },
]);

function roleLabel(c: ClassInvolvement) {
  if (c.inCharge) {
    return c.sessions > 0 ? `${t('assistant.inCharge')} - ${c.sessions} ${t('assistant.sessionsShort')}` : t('assistant.inCharge');
  }
  return `${t('assistant.teaches')} ${c.sessions} ${t('assistant.sessionsShort')}`;
}

function money(n?: number | string) {
  return Number(n ?? 0).toLocaleString('vi-VN');
}
function dayOf(iso: string) {
  return formatInZone(iso, userTz.value, locale.value).split(' ').slice(0, 3).join(' ');
}
function timeRange(start: string, end: string) {
  return `${utcToWallParts(start, userTz.value).time} - ${utcToWallParts(end, userTz.value).time}`;
}
function fmtDate(iso?: string | null) {
  return iso ? new Date(iso).toLocaleDateString('vi-VN') : '-';
}
function fmtMonth(m: string) {
  const [y, mo] = m.split('-');
  return `${mo}/${y}`;
}

const profileOpen = ref(false);
const profileForm = reactive({ phone: '', level: '', hometown: '' });
function openProfile() {
  profileForm.phone = assistant.value?.phone ?? '';
  profileForm.level = assistant.value?.assistantProfile?.level ?? '';
  profileForm.hometown = assistant.value?.assistantProfile?.hometown ?? '';
  profileOpen.value = true;
}

const salaryForm = reactive({ salaryMethod: 'PER_SESSION', salaryRate: 0 as string | number, effectiveFrom: '' });
watch(
  assistant,
  (a) => {
    if (!a?.assistantProfile) return;
    salaryForm.salaryMethod = a.assistantProfile.salaryMethod;
    salaryForm.salaryRate = Number(a.assistantProfile.salaryRate);
    salaryForm.effectiveFrom = a.assistantProfile.salaryEffectiveFrom
      ? a.assistantProfile.salaryEffectiveFrom.slice(0, 10)
      : '';
  },
  { immediate: true },
);

function payload(extra: Record<string, unknown>) {
  return {
    salaryMethod: salaryForm.salaryMethod,
    salaryRate: Number(salaryForm.salaryRate),
    effectiveFrom: salaryForm.effectiveFrom || undefined,
    ...extra,
  };
}
async function saveSalary() {
  await updateSalary.mutateAsync({ id: id.value, body: payload({}) });
}
async function saveProfile() {
  await updateSalary.mutateAsync({
    id: id.value,
    body: payload({
      phone: profileForm.phone || undefined,
      level: profileForm.level || undefined,
      hometown: profileForm.hometown || undefined,
    }),
  });
  profileOpen.value = false;
}
</script>

<template>
  <UiPage>
    <UiButton variant="ghost" leading-icon="mdi-arrow-left" to="/assistants" class="mb-4">
      {{ t('assistant.backToList') }}
    </UiButton>

    <AppSkeleton v-if="!assistant" variant="detail" />

    <template v-else>
      <div class="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <UiAvatar :src="avatar(assistant)" :name="assistant.fullName" :alt="assistant.fullName" size="lg" />
          <div class="min-w-0">
            <div class="flex min-w-0 flex-wrap items-center gap-2">
              <h1 class="truncate text-2xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
                {{ assistant.fullName }}
              </h1>
              <UiBadge v-if="assistant.assistantProfile?.level" tone="info">
                {{ assistant.assistantProfile.level }}
              </UiBadge>
            </div>
            <p class="mt-1 min-w-0 truncate text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
              {{ assistant.email }}
            </p>
          </div>
        </div>
        <UiButton variant="secondary" leading-icon="mdi-pencil" @click="openProfile">
          {{ t('assistant.editProfile') }}
        </UiButton>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <UiCard padding="lg">
          <h2 class="mb-4 text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
            {{ t('assistant.profile') }}
          </h2>
          <div class="grid gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <AppIcon name="mdi-email-outline" :size="20" class="mt-1 shrink-0 text-[var(--st-muted)]" />
              <div class="min-w-0">
                <p class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">{{ t('auth.email') }}</p>
                <p class="break-words text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)]">{{ assistant.email }}</p>
              </div>
            </div>
            <div class="flex min-w-0 items-start gap-3">
              <AppIcon name="mdi-phone-outline" :size="20" class="mt-1 shrink-0 text-[var(--st-muted)]" />
              <div class="min-w-0">
                <p class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">{{ t('assistant.phone') }}</p>
                <p class="break-words text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)]">{{ assistant.phone || '-' }}</p>
              </div>
            </div>
            <div class="flex min-w-0 items-start gap-3">
              <AppIcon name="mdi-school-outline" :size="20" class="mt-1 shrink-0 text-[var(--st-muted)]" />
              <div class="min-w-0">
                <p class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">{{ t('assistant.level') }}</p>
                <p class="break-words text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)]">{{ assistant.assistantProfile?.level || '-' }}</p>
              </div>
            </div>
            <div class="flex min-w-0 items-start gap-3">
              <AppIcon name="mdi-map-marker-outline" :size="20" class="mt-1 shrink-0 text-[var(--st-muted)]" />
              <div class="min-w-0">
                <p class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">{{ t('assistant.hometown') }}</p>
                <p class="break-words text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)]">{{ assistant.assistantProfile?.hometown || '-' }}</p>
              </div>
            </div>
          </div>
        </UiCard>

        <UiCard padding="lg">
          <h2 class="mb-4 text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
            {{ t('assistant.salarySummary') }}
          </h2>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <UiMetricCard :label="t('assistant.thisMonth')" :value="money(summary?.thisMonth.totalAmount)">
              <template #icon><AppIcon name="mdi-cash-clock" :size="20" /></template>
            </UiMetricCard>
            <UiMetricCard :label="t('assistant.totalSalary')" :value="money(summary?.total.totalAmount)">
              <template #icon><AppIcon name="mdi-cash-multiple" :size="20" /></template>
            </UiMetricCard>
            <UiMetricCard :label="t('assistant.sessions')" :value="summary?.total.totalSessions ?? 0">
              <template #icon><AppIcon name="mdi-calendar-check-outline" :size="20" /></template>
            </UiMetricCard>
            <UiMetricCard :label="t('assistant.hours')" :value="summary?.total.totalHours ?? 0">
              <template #icon><AppIcon name="mdi-clock-outline" :size="20" /></template>
            </UiMetricCard>
            <UiMetricCard class="sm:col-span-2 xl:col-span-2" :label="t('assistant.nextPayroll')" :value="fmtDate(summary?.nextPayroll)">
              <template #icon><AppIcon name="mdi-calendar-arrow-right" :size="20" /></template>
            </UiMetricCard>
          </div>
        </UiCard>
      </div>

      <UiCard class="mt-4" padding="lg">
        <div class="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
            {{ t('assistant.assignedClasses') }}
          </h2>
          <div class="flex flex-wrap gap-2">
            <UiBadge tone="neutral">{{ involvement.length }} {{ t('assistant.classes') }}</UiBadge>
            <UiBadge tone="neutral">{{ totalSessionsCount }} {{ t('assistant.sessions') }}</UiBadge>
          </div>
        </div>

        <div v-if="involvement.length" class="divide-y divide-[var(--st-border)]">
          <NuxtLink
            v-for="c in involvement"
            :key="c.id"
            :to="`/classes/${c.id}`"
            class="flex min-w-0 flex-col gap-3 py-3 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--st-radius)] bg-[var(--st-primary)] text-white"
                :style="{ backgroundColor: c.color || 'var(--st-primary)' }"
              >
                <AppIcon name="mdi-google-classroom" :size="18" />
              </span>
              <div class="min-w-0">
                <p class="truncate text-base font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
                  {{ c.name }}
                </p>
                <p v-if="c.level" class="text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                  {{ c.level }}
                </p>
              </div>
            </div>
            <UiBadge :tone="c.inCharge ? 'primary' : 'info'">
              {{ roleLabel(c) }}
            </UiBadge>
          </NuxtLink>
        </div>

        <UiEmptyState
          v-else
          icon="mdi-google-classroom"
          heading="No class assignments yet"
          body="Assign this assistant from a class."
        />
      </UiCard>

      <UiCard class="mt-4" padding="lg">
        <h2 class="mb-4 text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
          {{ t('assistant.salaryConfig') }}
        </h2>
        <div class="grid gap-4 md:grid-cols-3">
          <UiSelect
            v-model="salaryForm.salaryMethod"
            :items="salaryMethodItems"
            :label="t('assistant.method')"
            :disabled="updateSalary.isPending.value"
          />
          <UiInput
            v-model="salaryForm.salaryRate"
            type="number"
            :label="t('assistant.rate')"
            :disabled="updateSalary.isPending.value"
          />
          <UiInput
            v-model="salaryForm.effectiveFrom"
            type="date"
            :label="t('assistant.effectiveFrom')"
            :disabled="updateSalary.isPending.value"
          />
        </div>
        <div class="mt-4 flex justify-end">
          <UiButton :loading="updateSalary.isPending.value" @click="saveSalary">
            Save salary settings
          </UiButton>
        </div>

        <div v-if="(summary?.rates?.length ?? 0) > 1" class="mt-4 border-t border-[var(--st-border)] pt-4">
          <p class="mb-2 text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
            {{ t('assistant.rateHistory') }}
          </p>
          <div class="grid gap-2">
            <div
              v-for="(r, i) in summary?.rates ?? []"
              :key="i"
              class="flex min-w-0 items-center justify-between gap-3 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)]"
            >
              <span class="min-w-0">
                <AppIcon name="mdi-calendar-arrow-right" :size="14" class="mr-1 inline text-[var(--st-muted)]" />
                {{ fmtDate(r.effectiveFrom) }}
                <span class="text-[var(--st-muted)]">- {{ methodLabel[r.method] }}</span>
              </span>
              <span class="shrink-0 font-semibold">{{ money(r.rate) }}</span>
            </div>
          </div>
        </div>
      </UiCard>

      <UiCard class="mt-4" padding="none">
        <UiTabs v-model="tab" :items="tabItems" :label="t('assistant.salarySummary')">
          <div v-if="tab === 'schedule'" class="px-4 pb-4">
            <UiTable caption="Assistant schedule">
              <thead class="bg-slate-50 text-sm font-semibold text-[var(--st-muted)]">
                <tr>
                  <th class="px-4 py-3">{{ t('session.class') }}</th>
                  <th class="px-4 py-3">{{ t('session.date') }}</th>
                  <th class="px-4 py-3">{{ t('assistant.time') }}</th>
                  <th class="px-4 py-3">{{ t('session.lessonTopic') }}</th>
                  <th class="px-4 py-3">{{ t('assistant.status') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--st-border)]">
                <tr v-for="s in sessions ?? []" :key="s.id" class="min-h-12">
                  <td class="px-4 py-3">
                    <UiBadge tone="primary">{{ s.class.name }}</UiBadge>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">{{ dayOf(s.startTime) }}</td>
                  <td class="whitespace-nowrap px-4 py-3">{{ timeRange(s.startTime, s.endTime) }}</td>
                  <td class="px-4 py-3">{{ s.lessonTopic || '-' }}</td>
                  <td class="px-4 py-3">
                    <UiBadge :tone="statusColor[s.status]">{{ s.status }}</UiBadge>
                  </td>
                </tr>
                <tr v-if="!sessions?.length">
                  <td colspan="5" class="px-4 py-8 text-center text-sm font-normal text-[var(--st-muted)]">
                    No sessions scheduled
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </div>

          <div v-else-if="tab === 'breakdown'" class="px-4 pb-4">
            <UiTable caption="Assistant salary breakdown">
              <thead class="bg-slate-50 text-sm font-semibold text-[var(--st-muted)]">
                <tr>
                  <th class="px-4 py-3">{{ t('session.class') }}</th>
                  <th class="px-4 py-3 text-right">{{ t('assistant.sessions') }}</th>
                  <th class="px-4 py-3 text-right">{{ t('assistant.hours') }}</th>
                  <th class="px-4 py-3 text-right">{{ t('assistant.amount') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--st-border)]">
                <tr v-for="b in summary?.byClass ?? []" :key="b.classId" class="min-h-12">
                  <td class="px-4 py-3 font-semibold">{{ b.className }}</td>
                  <td class="px-4 py-3 text-right">{{ b.sessionCount }}</td>
                  <td class="px-4 py-3 text-right">{{ b.hours }}</td>
                  <td class="px-4 py-3 text-right">{{ money(b.amount) }}</td>
                </tr>
                <tr v-if="!summary?.byClass?.length">
                  <td colspan="4" class="px-4 py-8 text-center text-sm font-normal text-[var(--st-muted)]">
                    No salary records yet
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="summary?.byClass?.length" class="border-t border-[var(--st-border)] bg-slate-50 font-semibold">
                <tr>
                  <td class="px-4 py-3">{{ t('assistant.grandTotal') }}</td>
                  <td class="px-4 py-3 text-right">{{ summary?.total.totalSessions }}</td>
                  <td class="px-4 py-3 text-right">{{ summary?.total.totalHours }}</td>
                  <td class="px-4 py-3 text-right text-emerald-700">{{ money(summary?.total.totalAmount) }}</td>
                </tr>
              </tfoot>
            </UiTable>
          </div>

          <div v-else class="px-4 pb-4">
            <UiTable caption="Assistant salary history">
              <thead class="bg-slate-50 text-sm font-semibold text-[var(--st-muted)]">
                <tr>
                  <th class="px-4 py-3">{{ t('assistant.thisMonth') }}</th>
                  <th class="px-4 py-3 text-right">{{ t('assistant.sessions') }}</th>
                  <th class="px-4 py-3 text-right">{{ t('assistant.hours') }}</th>
                  <th class="px-4 py-3 text-right">{{ t('assistant.totalSalary') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--st-border)]">
                <tr v-for="h in summary?.history ?? []" :key="h.month" class="min-h-12">
                  <td class="px-4 py-3 font-semibold">{{ fmtMonth(h.month) }}</td>
                  <td class="px-4 py-3 text-right">{{ h.sessions }}</td>
                  <td class="px-4 py-3 text-right">{{ h.hours }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-emerald-700">{{ money(h.amount) }}</td>
                </tr>
                <tr v-if="!summary?.history?.length">
                  <td colspan="4" class="px-4 py-8 text-center text-sm font-normal text-[var(--st-muted)]">
                    No salary history yet
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </div>
        </UiTabs>
      </UiCard>

      <UiDialog v-model="profileOpen" :title="t('assistant.editProfile')" size="sm">
        <form class="grid gap-4" @submit.prevent="saveProfile">
          <UiInput
            v-model="profileForm.phone"
            :label="t('assistant.phone')"
            :disabled="updateSalary.isPending.value"
            autocomplete="tel"
          >
            <template #leading>
              <AppIcon name="mdi-phone-outline" :size="18" class="text-[var(--st-muted)]" />
            </template>
          </UiInput>
          <UiInput
            v-model="profileForm.level"
            :label="t('assistant.level')"
            placeholder="VD: N2 Japanese"
            :disabled="updateSalary.isPending.value"
          >
            <template #leading>
              <AppIcon name="mdi-school-outline" :size="18" class="text-[var(--st-muted)]" />
            </template>
          </UiInput>
          <UiInput
            v-model="profileForm.hometown"
            :label="t('assistant.hometown')"
            :disabled="updateSalary.isPending.value"
          >
            <template #leading>
              <AppIcon name="mdi-map-marker-outline" :size="18" class="text-[var(--st-muted)]" />
            </template>
          </UiInput>
        </form>

        <template #footer>
          <UiActionGroup>
            <UiButton variant="secondary" :disabled="updateSalary.isPending.value" @click="profileOpen = false">
              {{ t('common.cancel') }}
            </UiButton>
            <UiButton :loading="updateSalary.isPending.value" @click="saveProfile">
              Save profile
            </UiButton>
          </UiActionGroup>
        </template>
      </UiDialog>
    </template>
  </UiPage>
</template>
