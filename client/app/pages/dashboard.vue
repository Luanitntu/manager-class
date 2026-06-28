<script setup lang="ts">
import { useDashboard, type DashboardStats, type UpcomingSession } from '~/composables/useDashboard';

const { data, isLoading } = useDashboard();
const auth = useAuthStore();
const isStudentDashboard = computed(() => auth.role === 'STUDENT' || data.value?.role === 'STUDENT');

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

const today = new Date();
const monthLabel = computed(() =>
  today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
);

const stats = computed<StatCard[]>(() => {
  const s = data.value as DashboardStats | undefined;
  return [
    {
      label: 'Tổng số lớp',
      value: formatNumber(s?.totalClasses),
      delta: '+2 tháng này',
      icon: 'mdi-book-open-page-variant-outline',
      tone: 'blue',
    },
    {
      label: 'Học viên',
      value: formatNumber(s?.totalStudents),
      delta: '+15 tháng này',
      icon: 'mdi-account-group-outline',
      tone: 'violet',
    },
    {
      label: 'Doanh thu dự kiến',
      value: formatMoneyShort(s?.tuitionCollected),
      delta: '+12% so với tháng trước',
      icon: 'mdi-wallet-outline',
      tone: 'green',
    },
    {
      label: 'Học phí tồn đọng',
      value: formatMoneyShort(s?.outstandingTuition),
      delta: outstandingText(s?.outstandingTuition),
      icon: 'mdi-trending-up',
      tone: 'orange',
    },
  ];
});

const upcoming = computed<UpcomingSession[]>(() => data.value?.upcomingSessions ?? []);
const nextSession = computed(() => upcoming.value[0]);

const displaySessions = computed(() => {
  if (upcoming.value.length) return upcoming.value.slice(0, 4);
  return [];
});

const actionItems = computed<ActionItem[]>(() => {
  const s = data.value as DashboardStats | undefined;
  const items: ActionItem[] = [];

  if ((s?.outstandingTuition ?? 0) > 0) {
    items.push({
      title: 'Nhắc nộp học phí',
      subtitle: 'Còn học phí cần theo dõi',
      urgent: true,
    });
  }

  if (nextSession.value) {
    items.push({
      title: 'Điểm danh lớp học',
      subtitle: nextSession.value.class.name,
    });
  }

  items.push({
    title: 'Cập nhật tài liệu',
    subtitle: nextSession.value?.lessonTopic || 'Tài liệu tuần này',
  });

  return items.slice(0, 3);
});

const calendarDays = computed(() => {
  const year = today.getFullYear();
  const month = today.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const leadingEmptyDays = firstDay === 0 ? 6 : firstDay - 1;
  const days = [
    ...Array.from({ length: leadingEmptyDays }, (_, index) => 0 - index).reverse(),
    ...Array.from({ length: count }, (_, index) => index + 1),
  ];
  const markers = new Set(upcoming.value.map((session) => new Date(session.startTime).getDate()));
  return days.map((day) => ({
    day,
    active: day > 0 && day === today.getDate(),
    marked: day > 0 && markers.has(day),
  }));
});

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString('en-US');
}

function formatMoneyShort(value?: number) {
  const amount = value ?? 0;
  if (amount >= 1_000_000) {
    return `${trimDecimal(amount / 1_000_000)}M`;
  }
  if (amount >= 1_000) {
    return `${trimDecimal(amount / 1_000)}K`;
  }
  return amount.toLocaleString('en-US');
}

function trimDecimal(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function outstandingText(value?: number) {
  return (value ?? 0) > 0 ? 'Cần nhắc nhở học viên' : 'Đã đối soát';
}

function sessionTime(session: UpcomingSession) {
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  return `${timeOnly(start)} - ${timeOnly(end)}`;
}

function sessionDay(session: UpcomingSession) {
  const date = new Date(session.startTime);
  const diff = startOfDay(date).getTime() - startOfDay(today).getTime();
  const dayDiff = Math.round(diff / 86_400_000);
  if (dayDiff === 0) return 'Hôm nay';
  if (dayDiff === 1) return 'Ngày mai';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function timeOnly(date: Date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dotColor(index: number) {
  return ['#0d7df2', '#635bff', '#10b981', '#ff6b00'][index % 4];
}
</script>

<template>
  <StudentDashboard
    v-if="isStudentDashboard"
    :stats="data"
    :is-loading="isLoading"
  />

  <div v-else class="teacher-dashboard">
    <section class="teacher-dashboard__hero">
      <div class="teacher-dashboard__hero-copy">
        <div class="teacher-dashboard__eyebrow">
          <v-icon size="14">mdi-clock-outline</v-icon>
          Tiết học tiếp theo
        </div>
        <h1>{{ nextSession?.class.name ?? 'Sẵn sàng cho lịch dạy hôm nay' }}</h1>
        <p v-if="nextSession">
          Thời gian: <strong>{{ sessionTime(nextSession) }} {{ sessionDay(nextSession).toLowerCase() }}</strong>
          · Lớp: <strong>{{ nextSession.class.name }}</strong>
          <span v-if="nextSession.lessonTopic"> · {{ nextSession.lessonTopic }}</span>
        </p>
        <p v-else>
          Bạn chưa có tiết học sắp tới. Tạo lịch mới để học viên thấy thông tin mới nhất.
        </p>
        <v-btn class="teacher-dashboard__hero-btn" color="white" to="/calendar" variant="flat">
          <v-icon start size="18">mdi-check-circle-outline</v-icon>
          Điểm danh lớp học
        </v-btn>
      </div>
      <div aria-hidden="true" class="teacher-dashboard__hero-art">
        <div class="teacher-dashboard__art-card teacher-dashboard__art-card--notebook" />
        <div class="teacher-dashboard__art-card teacher-dashboard__art-card--board" />
        <div class="teacher-dashboard__art-pencil" />
        <div class="teacher-dashboard__art-plane" />
        <div class="teacher-dashboard__art-sphere" />
      </div>
    </section>

    <section class="teacher-dashboard__stats" aria-label="Dashboard stats">
      <article v-for="item in stats" :key="item.label" class="teacher-dashboard__stat-card">
        <span :class="['teacher-dashboard__stat-icon', `teacher-dashboard__stat-icon--${item.tone}`]">
          <v-icon size="25">{{ item.icon }}</v-icon>
        </span>
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
        <small :class="{ 'teacher-dashboard__warning-text': item.tone === 'orange' }">
          {{ item.delta }}
        </small>
      </article>
    </section>

    <section class="teacher-dashboard__grid">
      <v-card class="teacher-dashboard__panel teacher-dashboard__schedule">
        <header class="teacher-dashboard__panel-header">
          <h2>Lịch dạy sắp tới</h2>
          <NuxtLink to="/calendar">Xem tất cả <v-icon size="16">mdi-chevron-right</v-icon></NuxtLink>
        </header>

        <div v-if="displaySessions.length" class="teacher-dashboard__timeline">
          <article
            v-for="(session, index) in displaySessions"
            :key="session.id"
            class="teacher-dashboard__session"
          >
            <div class="teacher-dashboard__session-time">
              <strong>{{ sessionTime(session) }}</strong>
              <span>{{ sessionDay(session) }}</span>
            </div>
            <div class="teacher-dashboard__session-dot" :style="{ '--dot-color': session.class.color || dotColor(index) }" />
            <div class="teacher-dashboard__session-body">
              <h3>{{ session.lessonTopic || session.class.name }}</h3>
              <NuxtLink to="/calendar">{{ session.class.name }}</NuxtLink>
              <div class="teacher-dashboard__session-tags">
                <span><v-icon size="14">mdi-account-group-outline</v-icon> Lớp học</span>
                <span><v-icon size="14">mdi-video-outline</v-icon> Google Meet</span>
              </div>
            </div>
            <v-btn icon size="small" variant="text">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </article>
        </div>

        <div v-else class="teacher-dashboard__empty">
          <v-progress-circular v-if="isLoading" color="primary" indeterminate size="28" />
          <template v-else>
            <v-icon size="34">mdi-calendar-plus-outline</v-icon>
            <strong>Chưa có lịch dạy sắp tới</strong>
            <span>Mở Calendar để tạo buổi học đầu tiên.</span>
          </template>
        </div>
      </v-card>

      <aside class="teacher-dashboard__side">
        <v-card class="teacher-dashboard__panel teacher-dashboard__calendar">
          <header class="teacher-dashboard__mini-header">
            <v-icon size="20">mdi-calendar-month-outline</v-icon>
            <h2>{{ monthLabel }}</h2>
          </header>
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
          <header class="teacher-dashboard__mini-header">
            <v-icon size="20">mdi-alert-circle-outline</v-icon>
            <h2>Cần xử lý</h2>
          </header>
          <div class="teacher-dashboard__task-list">
            <article v-for="item in actionItems" :key="item.title" class="teacher-dashboard__task">
              <v-icon size="19">mdi-check-circle-outline</v-icon>
              <span>
                <strong :class="{ 'is-urgent': item.urgent }">{{ item.title }}</strong>
                <small>{{ item.subtitle }}</small>
              </span>
            </article>
          </div>
        </v-card>
      </aside>
    </section>
  </div>
</template>

<style scoped lang="scss">
.teacher-dashboard {
  --dash-blue: #0d7df2;
  --dash-text: #17233c;
  --dash-muted: #475569;
  --dash-border: #d8eef4;
  --dash-shadow: none;

  display: grid;
  gap: 24px;

  &__hero {
    background: #0d7df2;
    border-radius: 8px;
    box-shadow: none;
    color: #fff;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    min-height: 264px;
    overflow: hidden;
    position: relative;
  }

  &__hero-copy {
    padding: 32px;
    position: relative;
    z-index: 1;

    h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.18;
      margin: 20px 0 14px;
    }

    p {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.7;
      margin: 0;
      max-width: 690px;
    }
  }

  &__eyebrow {
    align-items: center;
    background: rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    display: inline-flex;
    font-size: 13px;
    font-weight: 800;
    gap: 6px;
    padding: 6px 12px;
  }

  &__hero-btn {
    background: #fff !important;
    border-radius: 8px !important;
    box-shadow: none;
    color: var(--dash-blue);
    display: inline-flex;
    flex: 0 0 191px;
    font-size: 14px;
    font-weight: 800;
    height: 42px !important;
    letter-spacing: 0;
    margin-top: 26px;
    min-height: 42px;
    min-width: 191px !important;
    padding: 0 !important;
    width: 191px;

    :deep(.v-btn__content) {
      align-items: center;
      gap: 7px;
      justify-content: center;
      line-height: 1;
      width: 100%;
    }

    :deep(.v-icon) {
      color: var(--dash-blue);
      font-size: 18px;
      height: 18px;
      margin-inline: 0;
      opacity: 1;
      width: 18px;
    }
  }

  &__hero-art {
    background:
      radial-gradient(circle at 66% 72%, rgba(26, 94, 255, 0.45) 0 16%, transparent 17%),
      linear-gradient(90deg, rgba(27, 187, 255, 0.34), rgba(19, 155, 255, 0.05));
    min-height: 100%;
    overflow: hidden;
    position: relative;
  }

  &__hero-art::before {
    background: rgba(75, 209, 255, 0.38);
    content: '';
    inset: 0 62px 0 0;
    position: absolute;
  }

  &__art-card,
  &__art-pencil,
  &__art-plane,
  &__art-sphere {
    position: absolute;
  }

  &__art-card {
    background: rgb(236 254 255 / 82%);
    border: 5px solid rgba(96, 196, 255, 0.42);
    box-shadow: none;
    transform: rotate(9deg);

    &--notebook {
      height: 112px;
      right: 150px;
      top: 56px;
      width: 72px;
    }

    &--board {
      height: 84px;
      right: 56px;
      top: 48px;
      width: 112px;
    }
  }

  &__art-pencil {
    background: #1459ff;
    border-radius: 999px;
    height: 12px;
    right: 72px;
    top: 156px;
    transform: rotate(22deg);
    width: 132px;
  }

  &__art-plane {
    border-bottom: 32px solid transparent;
    border-left: 74px solid rgba(11, 87, 255, 0.78);
    border-top: 20px solid transparent;
    right: 48px;
    top: 162px;
    transform: rotate(-15deg);
  }

  &__art-sphere {
    background: #196cff;
    border-radius: 50%;
    bottom: 46px;
    height: 44px;
    right: 142px;
    width: 44px;
  }

  &__stats {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  &__stat-card,
  &__panel {
    background: #fff;
    border: 1px solid var(--dash-border);
    border-radius: 8px;
    box-shadow: var(--dash-shadow);
  }

  &__stat-card {
    display: grid;
    gap: 6px;
    min-height: 176px;
    padding: 21px;

    strong {
      color: var(--dash-text);
      font-size: 25px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.1;
      margin-top: 10px;
    }

    > span:not(.teacher-dashboard__stat-icon) {
      color: #718198;
      font-size: 14px;
      font-weight: 800;
    }

    small {
      color: #009f6b;
      font-size: 13px;
      font-weight: 800;
    }
  }

  &__stat-icon {
    align-items: center;
    border: 1px solid #eaf0f8;
    border-radius: 8px;
    display: inline-flex;
    height: 44px;
    justify-content: center;
    width: 44px;

    &--blue {
      color: var(--dash-blue);
    }

    &--violet {
      color: #665cff;
    }

    &--green {
      color: #10b981;
    }

    &--orange {
      color: #ff6b00;
    }
  }

  &__warning-text {
    color: #ff6100 !important;
  }

  &__grid {
    align-items: start;
    display: grid;
    gap: 24px;
    grid-template-columns: minmax(0, 1fr) 352px;
  }

  &__panel {
    overflow: hidden;
  }

  &__panel-header {
    align-items: center;
    border-bottom: 1px solid var(--dash-border);
    display: flex;
    justify-content: space-between;
    min-height: 68px;
    padding: 0 20px;

    h2 {
      color: var(--dash-text);
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0;
    }

    a {
      align-items: center;
      color: var(--dash-blue);
      display: inline-flex;
      font-size: 14px;
      font-weight: 800;
      text-decoration: none;
    }
  }

  &__timeline {
    padding: 8px 10px 10px;
  }

  &__session {
    align-items: start;
    border-bottom: 1px solid #edf1f6;
    display: grid;
    gap: 18px;
    grid-template-columns: 104px 16px minmax(0, 1fr) 34px;
    min-height: 118px;
    padding: 24px 6px 18px 10px;

    &:last-child {
      border-bottom: 0;
    }
  }

  &__session-time {
    text-align: right;

    strong {
      color: var(--dash-text);
      display: block;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.1;
    }

    span {
      color: #718198;
      display: block;
      font-size: 13px;
      font-weight: 700;
      margin-top: 6px;
    }
  }

  &__session-dot {
    background: var(--dot-color);
    border-radius: 50%;
    height: 12px;
    margin-top: 2px;
    position: relative;
    width: 12px;

    &::after {
      background: #e6ecf4;
      content: '';
      height: 94px;
      left: 5px;
      position: absolute;
      top: 18px;
      width: 1px;
    }
  }

  &__session:last-child &__session-dot::after {
    display: none;
  }

  &__session-body {
    h3 {
      color: var(--dash-text);
      font-size: 16px;
      font-weight: 800;
      line-height: 1.2;
      margin: 0 0 7px;
    }

    a {
      color: var(--dash-blue);
      display: inline-block;
      font-size: 14px;
      font-weight: 800;
      margin-bottom: 14px;
      text-decoration: none;
    }
  }

  &__session-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    span {
      align-items: center;
      background: #f0f4f9;
      border-radius: 8px;
      color: #3f506a;
      display: inline-flex;
      font-size: 13px;
      font-weight: 800;
      gap: 6px;
      min-height: 24px;
      padding: 0 10px;
    }
  }

  &__side {
    display: grid;
    gap: 24px;
  }

  &__calendar,
  &__tasks {
    padding: 24px;
  }

  &__mini-header {
    align-items: center;
    color: #61728b;
    display: flex;
    gap: 10px;
    margin-bottom: 22px;

    h2 {
      color: var(--dash-text);
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0;
    }
  }

  &__weekdays,
  &__days {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    text-align: center;
  }

  &__weekdays {
    color: #78889e;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 13px;
  }

  &__days {
    gap: 9px 6px;

    span {
      align-items: center;
      border-radius: 50%;
      color: #283955;
      display: inline-flex;
      font-size: 14px;
      font-weight: 800;
      height: 32px;
      justify-content: center;
      justify-self: center;
      position: relative;
      width: 32px;

      &.is-active {
        background: var(--dash-blue);
        box-shadow: none;
        color: #fff;
      }

      &.is-marked::after {
        background: #ff6b00;
        border-radius: 50%;
        bottom: -3px;
        content: '';
        height: 4px;
        position: absolute;
        width: 4px;
      }

      &.is-placeholder {
        pointer-events: none;
      }
    }
  }

  &__task-list {
    display: grid;
    gap: 18px;
  }

  &__task {
    align-items: start;
    display: flex;
    gap: 12px;

    > .v-icon {
      color: #c2cfdf;
      margin-top: 2px;
    }

    span {
      display: grid;
      gap: 2px;
    }

    strong {
      color: var(--dash-text);
      font-size: 15px;
      font-weight: 800;

      &.is-urgent {
        color: #f1293a;
      }
    }

    small {
      color: #75859b;
      font-size: 13px;
      font-weight: 800;
    }
  }

  &__empty {
    align-items: center;
    color: #7c8ca3;
    display: grid;
    gap: 8px;
    justify-items: center;
    min-height: 280px;
    padding: 32px;
    text-align: center;

    strong {
      color: var(--dash-text);
      font-size: 17px;
      font-weight: 800;
    }
  }
}

@media (max-width: 1180px) {
  .teacher-dashboard {
    &__hero {
      grid-template-columns: minmax(0, 1fr) 300px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__side {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 880px) {
  .teacher-dashboard {
    &__hero {
      grid-template-columns: 1fr;
    }

    &__hero-art {
      display: none;
    }

    &__stats,
    &__side {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 640px) {
  .teacher-dashboard {
    gap: 16px;

    &__hero-copy {
      padding: 24px;

      h1 {
        font-size: 26px;
      }
    }

    &__stats,
    &__side {
      grid-template-columns: 1fr;
    }

    &__session {
      gap: 12px;
      grid-template-columns: 82px 12px minmax(0, 1fr);
    }

    &__session > .v-btn {
      display: none;
    }
  }
}
</style>
