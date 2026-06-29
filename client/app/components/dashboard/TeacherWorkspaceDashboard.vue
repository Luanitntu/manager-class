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
  <div class="teacher-dashboard">
    <v-sheet class="teacher-dashboard__hero" rounded="lg">
      <v-container class="teacher-dashboard__hero-copy pa-8" fluid>
        <v-chip class="teacher-dashboard__eyebrow" color="white" size="small" variant="tonal">
          <v-icon start size="14">mdi-clock-outline</v-icon>
          Tiết học tiếp theo
        </v-chip>
        <h1>{{ nextSession?.class.name ?? 'Sẵn sàng cho lịch dạy hôm nay' }}</h1>
        <p v-if="nextSession">
          Thời gian: <strong>{{ sessionTime(nextSession) }} {{ sessionDay(nextSession).toLowerCase() }}</strong>
          - Lớp: <strong>{{ nextSession.class.name }}</strong>
          <span v-if="nextSession.lessonTopic"> - {{ nextSession.lessonTopic }}</span>
        </p>
        <p v-else>
          Bạn chưa có tiết học sắp tới. Tạo lịch mới để học viên thấy thông tin mới nhất.
        </p>
        <v-btn class="teacher-dashboard__hero-btn" color="white" to="/calendar" variant="flat">
          <v-icon start size="18">mdi-check-circle-outline</v-icon>
          Điểm danh lớp học
        </v-btn>
      </v-container>
      <div aria-hidden="true" class="teacher-dashboard__hero-art">
        <div class="teacher-dashboard__art-card teacher-dashboard__art-card--notebook" />
        <div class="teacher-dashboard__art-card teacher-dashboard__art-card--board" />
        <div class="teacher-dashboard__art-pencil" />
        <div class="teacher-dashboard__art-plane" />
        <div class="teacher-dashboard__art-sphere" />
      </div>
    </v-sheet>

    <v-row aria-label="Dashboard stats" class="teacher-dashboard__stats">
      <v-col v-for="item in cards" :key="item.label" cols="12" md="3" sm="6">
        <v-card class="teacher-dashboard__stat-card h-100">
          <v-avatar :class="`teacher-dashboard__stat-icon--${item.tone}`" rounded="lg" size="44" variant="outlined">
            <v-icon size="25">{{ item.icon }}</v-icon>
          </v-avatar>
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
          <small :class="{ 'teacher-dashboard__warning-text': item.tone === 'orange' }">
            {{ item.delta }}
          </small>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="teacher-dashboard__grid">
      <v-col cols="12" lg="8">
        <v-card class="teacher-dashboard__panel teacher-dashboard__schedule">
          <v-card-title class="teacher-dashboard__panel-header">
            <h2>Lịch dạy sắp tới</h2>
            <NuxtLink to="/calendar">Xem tất cả <v-icon size="16">mdi-chevron-right</v-icon></NuxtLink>
          </v-card-title>

          <v-list v-if="displaySessions.length" class="teacher-dashboard__timeline" lines="two">
            <v-list-item
              v-for="(session, index) in displaySessions"
              :key="session.id"
              class="teacher-dashboard__session"
            >
              <template #prepend>
                <div class="teacher-dashboard__session-time">
                  <strong>{{ sessionTime(session) }}</strong>
                  <span>{{ sessionDay(session) }}</span>
                </div>
                <div
                  class="teacher-dashboard__session-dot"
                  :style="{ '--dot-color': session.class.color || dashboardDotColor(index) }"
                />
              </template>
              <v-list-item-title class="teacher-dashboard__session-title">
                {{ session.lessonTopic || session.class.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <NuxtLink to="/calendar">{{ session.class.name }}</NuxtLink>
                <div class="teacher-dashboard__session-tags">
                  <v-chip size="x-small" variant="tonal">
                    <v-icon start size="14">mdi-account-group-outline</v-icon>
                    Lớp học
                  </v-chip>
                  <v-chip size="x-small" variant="tonal">
                    <v-icon start size="14">mdi-video-outline</v-icon>
                    Google Meet
                  </v-chip>
                </div>
              </v-list-item-subtitle>
              <template #append>
                <v-btn icon size="small" variant="text">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-card-text v-else class="teacher-dashboard__empty text-center">
            <v-icon size="34">mdi-calendar-plus-outline</v-icon>
            <strong>Chưa có lịch dạy sắp tới</strong>
            <span>Mở Calendar để tạo buổi học đầu tiên.</span>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <div class="teacher-dashboard__side">
          <v-card class="teacher-dashboard__panel teacher-dashboard__calendar">
            <v-card-title class="teacher-dashboard__mini-header">
              <v-icon size="20">mdi-calendar-month-outline</v-icon>
              <h2>{{ monthLabel }}</h2>
            </v-card-title>
            <div class="teacher-dashboard__weekdays">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>
            <div class="teacher-dashboard__days">
              <span
                v-for="item in calendarDays"
                :key="item.day"
                :class="{ 'is-placeholder': item.day <= 0, 'is-active': item.active, 'is-marked': item.marked }"
              >
                {{ item.day > 0 ? item.day : '' }}
              </span>
            </div>
          </v-card>

          <v-card class="teacher-dashboard__panel teacher-dashboard__tasks">
            <v-card-title class="teacher-dashboard__mini-header">
              <v-icon size="20">mdi-alert-circle-outline</v-icon>
              <h2>Cần xử lý</h2>
            </v-card-title>
            <v-list class="teacher-dashboard__task-list">
              <v-list-item v-for="item in actionItems" :key="item.title" class="teacher-dashboard__task">
                <template #prepend>
                  <v-icon size="19">mdi-check-circle-outline</v-icon>
                </template>
                <v-list-item-title :class="{ 'is-urgent': item.urgent }">{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped lang="scss">
@use '~/styles/dashboard/teacher.scss';
</style>
