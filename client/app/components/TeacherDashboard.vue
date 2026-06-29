<script setup lang="ts">
import { DateTime } from 'luxon';
import type { DashboardStats, UpcomingSession } from '~/composables/useDashboard';
import type { TeachingSession } from '~/composables/useSessions';

const props = defineProps<{ stats?: DashboardStats; loading?: boolean }>();

const { t, locale } = useI18n();
const userTz = useUserTimezone();
const { request } = useApi();

function moneyCompact(n?: number) {
  const v = n ?? 0;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return v.toLocaleString();
}

// REAL data — both fields are returned by the teacher dashboard endpoint, so
// "expected (billed) revenue" = collected + outstanding.
const expectedRevenue = computed(
  () => (props.stats?.tuitionCollected ?? 0) + (props.stats?.outstandingTuition ?? 0),
);

// ───────────────────────────────────────────────────────────────────────────
// PLACEHOLDER DATA — NOT yet backed by DB/backend. Wired to sample values so
// the layout matches the design. Each entry is flagged with what it needs so
// it is trivial to replace once the backing field ships. (See dev notes.)
//   · classes/students/revenue trends  → need month-over-month aggregates
//   · outstanding "remind N students"  → need count of students with balance>0
//   · per-session student count        → need enrollment count on the session
//   · room / Google Meet link          → need new columns on TeachingSession
//   · "to do" feed (grading/reminders) → need a homework/grading + reminders model
// ───────────────────────────────────────────────────────────────────────────
const PLACEHOLDER = {
  classesTrend: '+2 tháng này',
  studentsTrend: '+15 tháng này',
  revenueTrend: '+12% so với tháng trước',
  outstandingHint: 'Cần nhắc nhở 4 học viên',
  sessionStudents: 12,
  todos: [
    { icon: 'mdi-pencil-outline', color: 'error', title: 'Chấm bài Writing K42', sub: '12 bài chưa chấm' },
    { icon: 'mdi-cash-clock', color: 'warning', title: 'Nhắc nộp học phí', sub: 'Nguyễn Văn A · Giao tiếp CB' },
    { icon: 'mdi-file-document-edit-outline', color: 'info', title: 'Cập nhật tài liệu', sub: 'TOEIC Reading Week 4' },
  ],
};

const stats = computed(() => [
  {
    icon: 'mdi-book-open-variant',
    color: 'primary',
    value: props.stats?.totalClasses ?? 0,
    label: t('dashboard.totalClasses'),
    trend: PLACEHOLDER.classesTrend,
    trendColor: 'success',
  },
  {
    icon: 'mdi-account-group-outline',
    color: 'secondary',
    value: props.stats?.totalStudents ?? 0,
    label: t('dashboard.totalStudents'),
    trend: PLACEHOLDER.studentsTrend,
    trendColor: 'success',
  },
  {
    icon: 'mdi-wallet-outline',
    color: 'info',
    value: moneyCompact(expectedRevenue.value),
    label: t('dashboard.expectedRevenue'),
    trend: PLACEHOLDER.revenueTrend,
    trendColor: 'success',
  },
  {
    icon: 'mdi-trending-up',
    color: 'warning',
    value: moneyCompact(props.stats?.outstandingTuition),
    label: t('dashboard.outstandingTuition'),
    trend: PLACEHOLDER.outstandingHint,
    trendColor: 'warning',
  },
]);

// ── Sessions (REAL — from the dashboard endpoint) ──────────────────────────
const upcoming = computed<UpcomingSession[]>(() => props.stats?.upcomingSessions ?? []);
const nextLesson = computed(() => upcoming.value[0] ?? null);

function dayLabel(iso: string) {
  const d = DateTime.fromISO(iso, { zone: 'utc' }).setZone(userTz.value).startOf('day');
  const today = DateTime.now().setZone(userTz.value).startOf('day');
  const diff = Math.round(d.diff(today, 'days').days);
  if (diff === 0) return t('dashboard.today');
  if (diff === 1) return t('dashboard.tomorrow');
  return d.setLocale(locale.value).toFormat('ccc dd/LL');
}

function timeRange(s: { startTime: string; endTime: string }) {
  const z = userTz.value;
  const a = DateTime.fromISO(s.startTime, { zone: 'utc' }).setZone(z).toFormat('HH:mm');
  const b = DateTime.fromISO(s.endTime, { zone: 'utc' }).setZone(z).toFormat('HH:mm');
  return `${a} - ${b}`;
}

// ── Mini calendar (REAL — month session feed) ──────────────────────────────
const cursor = ref(DateTime.now().setZone(userTz.value).startOf('month'));
const sessionDays = ref<Set<number>>(new Set());

async function loadMonth() {
  const z = userTz.value;
  const start = cursor.value.startOf('month');
  const end = cursor.value.endOf('month');
  try {
    const sessions = await request<TeachingSession[]>(
      `/sessions?from=${encodeURIComponent(start.toUTC().toISO()!)}&to=${encodeURIComponent(end.toUTC().toISO()!)}`,
    );
    const days = new Set<number>();
    for (const s of sessions) {
      const d = DateTime.fromISO(s.startTime, { zone: 'utc' }).setZone(z);
      if (d.month === cursor.value.month && d.year === cursor.value.year) days.add(d.day);
    }
    sessionDays.value = days;
  } catch {
    sessionDays.value = new Set();
  }
}
watch(cursor, loadMonth, { immediate: true });

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const monthTitle = computed(() =>
  locale.value === 'vi'
    ? `Tháng ${cursor.value.month}, ${cursor.value.year}`
    : cursor.value.setLocale('en').toFormat('LLLL yyyy'),
);
const cells = computed(() => {
  const lead = cursor.value.startOf('month').weekday - 1; // luxon: Mon=1 … Sun=7
  const total = cursor.value.daysInMonth ?? 30;
  const arr: (number | null)[] = [];
  for (let i = 0; i < lead; i++) arr.push(null);
  for (let d = 1; d <= total; d++) arr.push(d);
  return arr;
});
const today = computed(() => DateTime.now().setZone(userTz.value));
function isToday(day: number) {
  return (
    today.value.day === day &&
    today.value.month === cursor.value.month &&
    today.value.year === cursor.value.year
  );
}
</script>

<template>
  <div>
    <!-- ===== Hero: next lesson ===== -->
    <v-card
      class="st-hero pa-6 mb-5 position-relative overflow-hidden"
      :color="nextLesson ? undefined : 'surface'"
    >
      <template v-if="nextLesson">
        <v-chip size="small" color="white" variant="flat" class="mb-3 text-primary font-weight-medium">
          <v-icon start size="16">mdi-clock-fast</v-icon>{{ t('dashboard.nextLesson') }}
        </v-chip>
        <h2 class="text-h5 font-weight-bold text-white mb-2">
          {{ nextLesson.lessonTopic || nextLesson.class.name }}
        </h2>
        <p class="text-white text-body-2 mb-2" style="opacity: 0.92; max-width: 640px">
          <strong>{{ timeRange(nextLesson) }}</strong>
          {{ dayLabel(nextLesson.startTime).toLowerCase() }}
          · {{ t('dashboard.classLabel') }}: {{ nextLesson.class.name }}
          ({{ t('dashboard.studentsCount', { n: PLACEHOLDER.sessionStudents }) }}).
          Đừng quên mang theo giáo trình và điểm danh học viên đầu giờ nhé!
        </p>
        <div class="text-white mb-4">
          <ClassLocation :value="nextLesson.class" inline />
        </div>
        <v-btn color="white" variant="flat" class="text-primary" to="/calendar">
          <v-icon start>mdi-check-circle-outline</v-icon>{{ t('dashboard.takeAttendance') }}
        </v-btn>
        <v-icon class="st-hero-art d-none d-md-block" size="220">mdi-book-education-outline</v-icon>
      </template>
      <template v-else>
        <div class="d-flex align-center ga-4 py-2">
          <v-avatar color="primary" variant="tonal" size="48" rounded="lg">
            <v-icon>mdi-calendar-blank-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">{{ t('dashboard.noNextLesson') }}</div>
            <NuxtLink to="/calendar" class="text-primary text-decoration-none text-body-2">
              {{ t('dashboard.noUpcoming') }}
            </NuxtLink>
          </div>
        </div>
      </template>
    </v-card>

    <!-- ===== Stat cards ===== -->
    <v-row class="mb-1">
      <v-col v-for="s in stats" :key="s.label" cols="12" sm="6" md="3">
        <v-card class="pa-4 h-100">
          <v-avatar :color="s.color" variant="tonal" rounded="lg" size="40" class="mb-3">
            <v-icon>{{ s.icon }}</v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold">{{ s.value }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ s.label }}</div>
          <div class="text-caption mt-1" :class="`text-${s.trendColor}`">{{ s.trend }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- ===== Upcoming schedule ===== -->
      <v-col cols="12" md="8">
        <v-card class="pa-2">
          <div class="d-flex align-center justify-space-between px-3 pt-3 pb-1">
            <h3 class="text-subtitle-1 font-weight-bold">{{ t('dashboard.upcomingSchedule') }}</h3>
            <NuxtLink to="/calendar" class="text-primary text-decoration-none text-body-2 font-weight-medium">
              {{ t('dashboard.viewAll') }} →
            </NuxtLink>
          </div>

          <v-list v-if="upcoming.length" lines="two">
            <v-list-item v-for="s in upcoming" :key="s.id" class="px-3">
              <template #prepend>
                <div class="text-center mr-3" style="width: 72px">
                  <div class="font-weight-bold text-body-2">{{ timeRange(s) }}</div>
                  <div class="text-caption text-medium-emphasis">{{ dayLabel(s.startTime) }}</div>
                </div>
                <v-avatar :color="s.class.color || 'primary'" size="10" class="mr-3" />
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ s.lessonTopic || s.class.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <span class="text-primary font-weight-medium">{{ s.class.name }}</span>
                <div class="d-flex ga-2 mt-1 align-center">
                  <v-chip size="x-small" variant="tonal" prepend-icon="mdi-account-multiple">
                    {{ t('dashboard.studentsCount', { n: PLACEHOLDER.sessionStudents }) }}
                  </v-chip>
                  <ClassLocation :value="s.class" size="x-small" />
                </div>
              </v-list-item-subtitle>

              <template #append>
                <v-btn icon="mdi-dots-vertical" variant="text" size="small" to="/calendar" />
              </template>
            </v-list-item>
          </v-list>

          <div v-else-if="!loading" class="pa-8 text-center text-medium-emphasis">
            {{ t('dashboard.noUpcoming') }}
          </div>
        </v-card>
      </v-col>

      <!-- ===== Mini calendar + to-do ===== -->
      <v-col cols="12" md="4">
        <v-card class="pa-4 mb-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center ga-2">
              <v-icon size="18" class="text-medium-emphasis">mdi-calendar-month-outline</v-icon>
              <span class="text-subtitle-2 font-weight-bold">{{ monthTitle }}</span>
            </div>
            <div>
              <v-btn icon="mdi-chevron-left" variant="text" size="x-small" @click="cursor = cursor.minus({ months: 1 })" />
              <v-btn icon="mdi-chevron-right" variant="text" size="x-small" @click="cursor = cursor.plus({ months: 1 })" />
            </div>
          </div>

          <div class="st-cal-grid text-center">
            <div v-for="w in weekdays" :key="w" class="text-caption text-medium-emphasis font-weight-medium py-1">
              {{ w }}
            </div>
            <div v-for="(cell, i) in cells" :key="i" class="st-cal-cell">
              <div
                v-if="cell"
                class="st-cal-day"
                :class="{ 'st-cal-today': isToday(cell) }"
              >
                {{ cell }}
                <span v-if="sessionDays.has(cell) && !isToday(cell)" class="st-cal-dot" />
              </div>
            </div>
          </div>
        </v-card>

        <v-card class="pa-4">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="18" class="text-medium-emphasis">mdi-checkbox-marked-circle-outline</v-icon>
            <span class="text-subtitle-2 font-weight-bold">{{ t('dashboard.todo') }}</span>
          </div>
          <div v-for="(item, i) in PLACEHOLDER.todos" :key="i" class="d-flex align-start ga-3 py-2">
            <v-avatar :color="item.color" variant="tonal" size="30" rounded="lg">
              <v-icon size="16">{{ item.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-body-2 font-weight-medium" :class="`text-${item.color}`">{{ item.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.sub }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.st-hero {
  background: linear-gradient(120deg, #4570ea 0%, #5d87ff 55%, #6f9bff 100%);
}
.st-hero-art {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.18);
}
.st-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 2px;
}
.st-cal-cell {
  display: flex;
  justify-content: center;
}
.st-cal-day {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  border-radius: 50%;
}
.st-cal-today {
  background: rgb(var(--v-theme-primary));
  color: #fff;
  font-weight: 700;
}
.st-cal-dot {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgb(var(--v-theme-warning));
}
</style>
