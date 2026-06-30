<script setup lang="ts">
import type { TeachingSession } from '~/composables/useSessions';
import {
  addDays,
  endOfDay,
  formatShortDatePadded,
  formatTime,
  isSessionOnline,
  isToday,
  normalizeHexColor,
  sessionEventColor,
  sessionLocationLabel,
  softHexColor,
  startOfDay,
  toDateKey,
} from '~/utils/calendar';

interface StudentScheduleItem {
  id: string;
  className: string;
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
  color: string;
  location: string;
  isOnline: boolean;
  isToday: boolean;
}

interface DayGroup {
  key: string;
  date: Date;
  items: StudentScheduleItem[];
}

const props = defineProps<{
  sessions: TeachingSession[];
  weekStart: Date;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  today: [];
  previous: [];
  next: [];
}>();

const scheduleItems = computed<StudentScheduleItem[]>(() => {
  const weekEnd = addDays(props.weekStart, 6);
  return props.sessions
    .filter((session) => {
      const date = new Date(session.startTime);
      return date >= startOfDay(props.weekStart) && date <= endOfDay(weekEnd);
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((session) => {
      const online = isSessionOnline(session);
      return {
        id: session.id,
        className: session.class.name,
        title: session.lessonTopic || session.class.name,
        startTime: formatTime(session.startTime),
        endTime: formatTime(session.endTime),
        date: new Date(session.startTime),
        color: sessionEventColor(session),
        location: sessionLocationLabel(session),
        isOnline: online,
        isToday: isToday(new Date(session.startTime)),
      };
    });
});

const dayGroups = computed<DayGroup[]>(() => {
  const itemsByDay = scheduleItems.value.reduce<Record<string, StudentScheduleItem[]>>((days, item) => {
    const key = toDateKey(item.date);
    days[key] ??= [];
    days[key].push(item);
    return days;
  }, {});

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(props.weekStart, index);
    const key = toDateKey(date);
    return {
      key,
      date,
      items: itemsByDay[key] ?? [],
    };
  });
});

const visibleDayGroups = computed(() => dayGroups.value.filter((group) => group.items.length > 0));

const weekTitle = computed(() => {
  const start = props.weekStart;
  const end = addDays(start, 6);
  return `Tuần ${formatShortDatePadded(start)} - ${formatShortDatePadded(end)}`;
});

function weekdayLabel(date: Date) {
  const day = date.getDay();
  if (day === 0) return ['CHỦ', 'NHẬT'];
  return ['THỨ', String(day + 1)];
}

function actionLabel(item: StudentScheduleItem) {
  return item.isOnline ? 'Vào phòng học' : 'Xem địa điểm';
}

function actionIcon(item: StudentScheduleItem) {
  return item.isOnline ? 'mdi-video-outline' : 'mdi-map-marker-outline';
}

function toneStyle(color: string, soft = true) {
  return {
    '--schedule-accent': normalizeHexColor(color),
    '--schedule-accent-soft': softHexColor(color, soft ? 0.1 : 0.16),
  };
}
</script>

<template>
  <section class="student-schedule">
    <header class="student-schedule__header">
      <div>
        <h1>Lịch học</h1>
        <p>Lịch học chi tiết trong tuần của bạn</p>
      </div>

      <nav class="student-schedule__week-nav" aria-label="Điều hướng tuần">
        <v-btn
          aria-label="Tuần trước"
          class="student-schedule__nav-btn"
          icon="mdi-chevron-left"
          variant="text"
          @click="emit('previous')"
        />
        <strong>{{ weekTitle }}</strong>
        <v-btn
          aria-label="Tuần sau"
          class="student-schedule__nav-btn"
          icon="mdi-chevron-right"
          variant="text"
          @click="emit('next')"
        />
      </nav>
    </header>

    <section class="student-schedule__timeline" aria-label="Lịch học trong tuần">
      <AppSkeleton v-if="isLoading && !scheduleItems.length" variant="list" :rows="4" />

      <div v-else-if="!scheduleItems.length" class="student-schedule__empty">
        <v-icon icon="mdi-calendar-blank-outline" size="30" />
        <span>Tuần này chưa có lịch học</span>
      </div>

      <template v-else>
        <article
          v-for="group in visibleDayGroups"
          :key="group.key"
          class="student-schedule__day-row"
        >
          <div class="student-schedule__date-cell">
            <span v-for="part in weekdayLabel(group.date)" :key="part">{{ part }}</span>
            <strong :class="{ 'is-today': isToday(group.date) }">{{ group.date.getDate() }}</strong>
          </div>

          <span class="student-schedule__dot" />

          <div class="student-schedule__cards">
            <article
              v-for="item in group.items"
              :key="item.id"
              class="student-schedule__card"
              :style="toneStyle(item.color)"
            >
              <div class="student-schedule__card-top">
                <span class="student-schedule__class-pill">{{ item.className }}</span>
                <span v-if="item.isToday" class="student-schedule__today-pill">Hôm nay</span>
              </div>

              <h2>{{ item.title }}</h2>

              <div class="student-schedule__meta">
                <span>
                  <v-icon size="17">mdi-clock-time-four-outline</v-icon>
                  {{ item.startTime }} - {{ item.endTime }}
                </span>
                <span :class="{ 'is-location': !item.isOnline }">
                  <v-icon size="17">{{ item.isOnline ? 'mdi-video-outline' : 'mdi-map-marker-outline' }}</v-icon>
                  {{ item.location }}
                </span>
              </div>

              <v-btn
                :class="['student-schedule__action', { 'is-primary': item.isOnline }]"
                flat
              >
                <v-icon start size="16">{{ actionIcon(item) }}</v-icon>
                {{ actionLabel(item) }}
              </v-btn>
            </article>
          </div>
        </article>
      </template>
    </section>
  </section>
</template>

<style scoped>
.student-schedule {
  --schedule-blue: #0071f9;
  --schedule-text: #0f172a;
  --schedule-muted: #64748b;
  --schedule-border: #e2e8f0;
  color: var(--schedule-text);
  display: grid;
  gap: 24px;
  max-width: min(100%, 1152px);
  width: 100%;
}

.student-schedule__header {
  align-items: end;
  display: flex;
  justify-content: space-between;
  padding-top: 4px;
}

.student-schedule__header h1 {
  color: #0f172a;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.15;
  margin: 0 0 6px;
}

.student-schedule__header p {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.student-schedule__week-nav {
  align-items: center;
  display: flex;
  gap: 10px;
}

.student-schedule__week-nav strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
  min-width: 144px;
  text-align: center;
}

.student-schedule__nav-btn {
  background: #fff !important;
  border: 1px solid #dbe4ef;
  border-radius: 8px !important;
  box-shadow: none !important;
  color: #45617f !important;
  height: 38px !important;
  width: 38px !important;
}

.student-schedule__timeline {
  background: #fff;
  border: 1px solid #dbe4ef;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 4%);
  overflow: hidden;
}

.student-schedule__empty {
  align-items: center;
  color: #64748b;
  display: flex;
  font-size: 14px;
  font-weight: 800;
  gap: 12px;
  justify-content: center;
  min-height: 320px;
  padding: 24px;
}

.student-schedule__day-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  min-height: 238px;
  position: relative;
}

.student-schedule__day-row + .student-schedule__day-row {
  border-top: 1px solid #edf2f7;
}

.student-schedule__date-cell {
  align-items: center;
  border-right: 1px solid #e7edf5;
  display: flex;
  flex-direction: column;
  grid-column: 1;
  padding-top: 26px;
}

.student-schedule__date-cell span {
  color: #536783;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.25;
}

.student-schedule__date-cell strong {
  align-items: center;
  color: #0f172a;
  display: inline-flex;
  font-size: 20px;
  font-weight: 800;
  height: 34px;
  justify-content: center;
  line-height: 1;
  margin-top: 8px;
  width: 34px;
}

.student-schedule__date-cell strong.is-today {
  background: var(--schedule-blue);
  border-radius: 999px;
  color: #fff;
}

.student-schedule__dot {
  background: #cbd5e1;
  border-radius: 999px;
  height: 8px;
  left: 84px;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
}

.student-schedule__cards {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 16px;
  grid-column: 2;
  grid-row: 1;
  justify-content: center;
  min-width: 0;
  padding: 24px;
  width: 100%;
}

.student-schedule__card {
  background: #fff;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  box-sizing: border-box;
  box-shadow: 0 4px 10px rgb(15 23 42 / 8%);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  max-width: none;
  min-height: 172px;
  min-width: 0;
  padding: 20px 24px 22px;
  width: 100%;
}

.student-schedule__card-top {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.student-schedule__class-pill {
  background: var(--schedule-accent-soft);
  border-radius: 10px;
  color: var(--schedule-accent);
  display: inline-flex;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  padding: 7px 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-schedule__today-pill {
  background: #fff1f2;
  border-radius: 999px;
  color: #ff5d73;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  padding: 8px 12px;
  white-space: nowrap;
}

.student-schedule h2 {
  color: #0f172a;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
  margin: 0 0 18px;
}

.student-schedule__meta {
  align-items: center;
  display: grid;
  gap: 12px 40px;
  grid-template-columns: minmax(150px, 0.8fr) minmax(220px, 1.2fr);
  margin-bottom: 18px;
}

.student-schedule__meta span {
  align-items: center;
  color: #53627a;
  display: inline-flex;
  font-size: 15px;
  font-weight: 800;
  gap: 9px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.student-schedule__meta span .v-icon {
  color: #8aa4c5;
  font-size: 19px !important;
  height: 19px;
  width: 19px;
}

.student-schedule__meta span:not(:first-child) .v-icon {
  color: var(--schedule-accent);
}

.student-schedule__meta span.is-location .v-icon {
  color: #10b981;
}

.student-schedule__action {
  background: #f1f5f9 !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  color: #1e3352 !important;
  font-size: 15px;
  font-weight: 800;
  height: 40px !important;
  letter-spacing: 0;
  min-width: 170px !important;
  padding: 0 22px !important;
  width: auto !important;
}

.student-schedule__action.is-primary {
  background: var(--schedule-blue) !important;
  box-shadow: 0 8px 14px rgb(0 113 249 / 22%) !important;
  color: #fff !important;
}

.student-schedule__action :deep(.v-icon) {
  font-size: 17px !important;
  height: 17px;
  width: 17px;
}

@media (max-width: 820px) {
  .student-schedule__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .student-schedule__week-nav {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) 38px;
    width: 100%;
  }

  .student-schedule__week-nav strong {
    min-width: 0;
  }

  .student-schedule__day-row {
    grid-template-columns: 72px minmax(0, 1fr);
    min-height: 0;
  }

  .student-schedule__dot {
    left: 68px;
  }

  .student-schedule__cards {
    padding: 16px;
  }

  .student-schedule__card {
    min-height: 0;
  }

  .student-schedule__meta {
    align-items: start;
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .student-schedule__day-row {
    grid-template-columns: 62px minmax(0, 1fr);
  }

  .student-schedule__date-cell {
    padding-top: 20px;
  }

  .student-schedule__date-cell span {
    font-size: 11px;
  }

  .student-schedule__date-cell strong {
    font-size: 17px;
    height: 30px;
    width: 30px;
  }

  .student-schedule__dot {
    left: 58px;
  }

  .student-schedule__cards {
    padding: 12px;
  }

  .student-schedule__card {
    padding: 16px;
  }
}
</style>
