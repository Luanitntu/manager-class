<script setup lang="ts">
import { DateTime } from 'luxon';
import type { DashboardStats, UpcomingSession } from '~/composables/useDashboard';
import type { TeachingSession } from '~/composables/useSessions';
import type { UserRole } from '~/stores/auth';
import {
  calendarMonthCells,
  dashboardDotColor,
  formatDashboardMoneyShort,
  formatDashboardNumber,
  monthDashboardLabel,
  sessionDayLabel,
  sessionTimeRange,
} from '~/utils/dashboard';

const props = defineProps<{
  stats?: DashboardStats;
  role?: UserRole | null;
}>();

interface StatCard {
  label: string;
  value: string;
  delta: string;
  icon: string;
  tone: 'blue' | 'violet' | 'green' | 'orange';
}

interface ActionItem {
  title: string;
  subtitle: string;
  urgent?: boolean;
}

const { t, locale } = useI18n();
const userTz = useUserTimezone();
const { request } = useApi();

const expectedRevenue = computed(
  () => (props.stats?.tuitionCollected ?? 0) + (props.stats?.outstandingTuition ?? 0),
);

const upcoming = computed<UpcomingSession[]>(() => props.stats?.upcomingSessions ?? []);
const nextSession = computed(() => upcoming.value[0]);
const displaySessions = computed(() => upcoming.value.slice(0, 4));

const cards = computed<StatCard[]>(() => [
  ...(props.role === 'ASSISTANT'
    ? [
        {
          label: t('dashboard.assignedClasses'),
          value: formatDashboardNumber(props.stats?.assignedClasses, locale.value),
          delta: 'Lớp được phân công',
          icon: 'mdi-google-classroom',
          tone: 'blue' as const,
        },
        {
          label: t('dashboard.totalSessions'),
          value: formatDashboardNumber(props.stats?.totalSessions, locale.value),
          delta: 'Buổi dạy được giao',
          icon: 'mdi-calendar-check-outline',
          tone: 'violet' as const,
        },
        {
          label: t('dashboard.upcomingSessions'),
          value: formatDashboardNumber(upcoming.value.length, locale.value),
          delta: 'Lịch sắp tới',
          icon: 'mdi-calendar-clock-outline',
          tone: 'green' as const,
        },
      ]
    : [
        {
          label: t('dashboard.totalClasses'),
          value: formatDashboardNumber(props.stats?.totalClasses, locale.value),
          delta: '+2 tháng này',
          icon: 'mdi-book-open-page-variant-outline',
          tone: 'blue' as const,
        },
        {
          label: t('dashboard.totalStudents'),
          value: formatDashboardNumber(props.stats?.totalStudents, locale.value),
          delta: '+15 tháng này',
          icon: 'mdi-account-group-outline',
          tone: 'violet' as const,
        },
        {
          label: t('dashboard.expectedRevenue'),
          value: formatDashboardMoneyShort(expectedRevenue.value, locale.value),
          delta: '+12% so với tháng trước',
          icon: 'mdi-wallet-outline',
          tone: 'green' as const,
        },
        {
          label: t('dashboard.outstandingTuition'),
          value: formatDashboardMoneyShort(props.stats?.outstandingTuition, locale.value),
          delta: outstandingText(props.stats?.outstandingTuition),
          icon: 'mdi-trending-up',
          tone: 'orange' as const,
        },
      ]),
]);

const actionItems = computed<ActionItem[]>(() => {
  const items: ActionItem[] = [];

  if (props.role !== 'ASSISTANT' && (props.stats?.outstandingTuition ?? 0) > 0) {
    items.push({ title: 'Nhắc nộp học phí', subtitle: 'Còn học phí cần theo dõi', urgent: true });
  }

  if (nextSession.value) {
    items.push({ title: 'Điểm danh lớp học', subtitle: nextSession.value.class.name });
  }

  items.push({
    title: 'Cập nhật tài liệu',
    subtitle: nextSession.value?.lessonTopic || 'Tài liệu tuần này',
  });

  return items.slice(0, 3);
});

const cursor = ref(DateTime.now().setZone(userTz.value).startOf('month'));
const today = computed(() => DateTime.now().setZone(userTz.value));
const monthLabel = computed(() => monthDashboardLabel(cursor.value, locale.value));
const sessionDays = ref<Set<number>>(new Set());

async function loadMonth() {
  const start = cursor.value.startOf('month');
  const end = cursor.value.endOf('month');

  try {
    const sessions = await request<TeachingSession[]>(
      `/sessions?from=${encodeURIComponent(start.toUTC().toISO()!)}&to=${encodeURIComponent(end.toUTC().toISO()!)}`,
    );
    sessionDays.value = sessionDaySet(sessions);
  } catch {
    sessionDays.value = sessionDaySet(upcoming.value);
  }
}

function sessionDaySet(sessions: Array<Pick<UpcomingSession, 'startTime'>>) {
  return new Set(
    sessions
      .map((session) => DateTime.fromISO(session.startTime, { zone: 'utc' }).setZone(userTz.value))
      .filter((date) => date.month === cursor.value.month && date.year === cursor.value.year)
      .map((date) => date.day),
  );
}

watch([cursor, userTz], loadMonth, { immediate: true });

const calendarDays = computed(() => calendarMonthCells(cursor.value, sessionDays.value, today.value));

function outstandingText(value?: number) {
  return (value ?? 0) > 0 ? 'Cần nhắc nhở học viên' : 'Đã đối soát';
}

function sessionTime(session: UpcomingSession) {
  return sessionTimeRange(session, userTz.value);
}

function sessionDay(session: UpcomingSession) {
  return sessionDayLabel(session, userTz.value, locale.value, today.value);
}
</script>

<template>
  <UiPage class="space-y-6" padding="none" width="full">
    <section class="relative min-w-0 overflow-hidden rounded-[var(--st-radius)] bg-[var(--st-primary)] text-white">
      <div class="relative z-10 grid min-h-[248px] gap-6 px-6 py-6 md:grid-cols-[minmax(0,1fr)_280px] md:px-8 md:py-8">
        <div class="flex min-w-0 flex-col items-start justify-center gap-4">
          <UiBadge class="border-white/30 bg-white/15 text-white" tone="neutral" size="sm">
            <AppIcon name="mdi-clock-outline" :size="14" />
            Tiết học tiếp theo
          </UiBadge>

          <div class="min-w-0 space-y-3">
            <h1 class="max-w-3xl break-words text-2xl font-semibold leading-[var(--st-leading-tight)]">
              {{ nextSession?.class.name ?? 'Sẵn sàng cho lịch dạy hôm nay' }}
            </h1>
            <p v-if="nextSession" class="max-w-3xl text-base font-normal leading-[var(--st-leading-copy)] text-white/90">
              Thời gian:
              <strong class="font-semibold">{{ sessionTime(nextSession) }} {{ sessionDay(nextSession).toLowerCase() }}</strong>
              - Lớp: <strong class="font-semibold">{{ nextSession.class.name }}</strong>
              <span v-if="nextSession.lessonTopic"> - {{ nextSession.lessonTopic }}</span>
            </p>
            <p v-else class="max-w-3xl text-base font-normal leading-[var(--st-leading-copy)] text-white/90">
              Bạn chưa có tiết học sắp tới. Tạo lịch mới để học viên thấy thông tin mới nhất.
            </p>
          </div>

          <UiButton to="/calendar" variant="secondary" leading-icon="mdi-check-circle-outline">
            Điểm danh lớp học
          </UiButton>
        </div>

        <div aria-hidden="true" class="hidden min-h-44 items-center justify-center md:flex">
          <div class="relative h-44 w-64">
            <div class="absolute left-0 top-8 h-28 w-44 rotate-[-5deg] rounded-[var(--st-radius)] border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm" />
            <div class="absolute right-0 top-0 h-32 w-44 rotate-6 rounded-[var(--st-radius)] border border-white/30 bg-white/20 shadow-lg backdrop-blur-sm">
              <div class="m-4 h-3 w-24 rounded-full bg-white/70" />
              <div class="mx-4 mt-3 h-2 w-32 rounded-full bg-white/35" />
              <div class="mx-4 mt-2 h-2 w-20 rounded-full bg-white/35" />
            </div>
            <div class="absolute bottom-2 left-12 h-3 w-36 rotate-[-18deg] rounded-full bg-[var(--st-accent)]" />
            <div class="absolute bottom-9 right-5 grid h-14 w-14 place-items-center rounded-full bg-white/20 text-white">
              <AppIcon name="mdi-calendar-check-outline" :size="28" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section aria-label="Dashboard stats" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UiMetricCard v-for="item in cards" :key="item.label" :label="item.label" :value="item.value">
        <template #icon>
          <span
            :class="[
              'grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border',
              item.tone === 'orange'
                ? 'border-orange-200 bg-orange-50 text-orange-600'
                : item.tone === 'green'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : item.tone === 'violet'
                    ? 'border-violet-200 bg-violet-50 text-violet-600'
                    : 'border-blue-200 bg-blue-50 text-[var(--st-primary)]',
            ]"
          >
            <AppIcon :name="item.icon" :size="25" />
          </span>
        </template>
        <template #hint>
          <span :class="item.tone === 'orange' ? 'text-orange-600' : ''">{{ item.delta }}</span>
        </template>
      </UiMetricCard>
    </section>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <section class="min-w-0 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-4 sm:p-6">
        <div class="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
          <h2 class="min-w-0 text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
            Lịch dạy sắp tới
          </h2>
          <NuxtLink
            to="/calendar"
            class="inline-flex min-h-9 items-center gap-1 rounded-[var(--st-radius)] px-2 text-sm font-semibold text-[var(--st-primary)] transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            Xem tất cả
            <AppIcon name="mdi-chevron-right" :size="16" />
          </NuxtLink>
        </div>

        <UiList v-if="displaySessions.length">
          <UiListItem v-for="(session, index) in displaySessions" :key="session.id">
            <template #leading>
              <div class="flex min-w-[112px] items-center gap-3">
                <div class="min-w-0">
                  <strong class="block text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
                    {{ sessionTime(session) }}
                  </strong>
                  <span class="block text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                    {{ sessionDay(session) }}
                  </span>
                </div>
                <span
                  class="h-3 w-3 shrink-0 rounded-full border border-white shadow-sm"
                  :style="{ backgroundColor: session.class.color || dashboardDotColor(index) }"
                />
              </div>
            </template>

            <div class="min-w-0 truncate font-semibold">
              {{ session.lessonTopic || session.class.name }}
            </div>

            <template #subtitle>
              <div class="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                <NuxtLink
                  to="/calendar"
                  class="min-w-0 truncate text-sm font-semibold text-[var(--st-primary)] hover:underline"
                >
                  {{ session.class.name }}
                </NuxtLink>
                <UiBadge tone="neutral" size="sm">
                  <AppIcon name="mdi-account-group-outline" :size="14" />
                  Lớp học
                </UiBadge>
                <UiBadge tone="info" size="sm">
                  <AppIcon name="mdi-video-outline" :size="14" />
                  Google Meet
                </UiBadge>
              </div>
            </template>

            <template #actions>
              <NuxtLink
                to="/calendar"
                aria-label="Mở lịch"
                class="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--st-radius)] text-[var(--st-muted)] transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
              >
                <AppIcon name="mdi-dots-vertical" :size="20" />
              </NuxtLink>
            </template>
          </UiListItem>
        </UiList>

        <UiEmptyState
          v-else
          icon="mdi-calendar-plus-outline"
          heading="Chưa có lịch dạy sắp tới"
          body="Mở Calendar để tạo buổi học đầu tiên."
        >
          <template #actions>
            <UiButton to="/calendar" variant="primary" leading-icon="mdi-calendar-month-outline">
              Mở Calendar
            </UiButton>
          </template>
        </UiEmptyState>
      </section>

      <aside class="grid min-w-0 gap-6">
        <UiCard padding="md">
          <div class="mb-4 flex min-w-0 items-center gap-2">
            <AppIcon name="mdi-calendar-month-outline" :size="20" class="shrink-0 text-[var(--st-primary)]" />
            <h2 class="min-w-0 truncate text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
              {{ monthLabel }}
            </h2>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>
          <div class="mt-2 grid grid-cols-7 gap-1">
            <span
              v-for="item in calendarDays"
              :key="item.day"
              :class="[
                'grid aspect-square min-h-9 place-items-center rounded-[var(--st-radius)] text-sm font-semibold leading-none',
                item.day <= 0 ? 'text-transparent' : 'text-[var(--st-text)]',
                item.active ? 'bg-[var(--st-primary)] text-white' : '',
                item.marked && !item.active ? 'border border-[var(--st-primary)] bg-blue-50 text-[var(--st-primary)]' : '',
              ]"
            >
              {{ item.day > 0 ? item.day : '' }}
            </span>
          </div>
        </UiCard>

        <UiCard padding="md">
          <div class="mb-4 flex min-w-0 items-center gap-2">
            <AppIcon name="mdi-alert-circle-outline" :size="20" class="shrink-0 text-orange-600" />
            <h2 class="min-w-0 truncate text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
              Cần xử lý
            </h2>
          </div>
          <ul class="space-y-3">
            <li v-for="item in actionItems" :key="item.title" class="flex min-w-0 gap-3">
              <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
                <AppIcon name="mdi-check-circle-outline" :size="19" />
              </span>
              <div class="min-w-0">
                <div
                  :class="[
                    'truncate text-base font-semibold leading-[var(--st-leading-copy)]',
                    item.urgent ? 'text-orange-600' : 'text-[var(--st-text)]',
                  ]"
                >
                  {{ item.title }}
                </div>
                <p class="truncate text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                  {{ item.subtitle }}
                </p>
              </div>
            </li>
          </ul>
        </UiCard>
      </aside>
    </div>
  </UiPage>
</template>
