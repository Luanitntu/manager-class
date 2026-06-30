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
  <section class="grid w-full max-w-[1152px] gap-6">
    <header class="flex min-w-0 flex-col gap-4 pt-1 lg:flex-row lg:items-end lg:justify-between">
      <div class="min-w-0">
        <h1 class="break-words text-2xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
          Lịch học
        </h1>
        <p class="mt-1 break-words text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
          Lịch học chi tiết trong tuần của bạn
        </p>
      </div>

      <nav class="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 sm:flex sm:flex-wrap sm:justify-end" aria-label="Điều hướng tuần">
        <UiIconButton
          label="Tuần trước"
          icon="mdi-chevron-left"
          variant="secondary"
          @click="emit('previous')"
        />
        <strong class="min-w-0 break-words text-center text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)] sm:min-w-36">
          {{ weekTitle }}
        </strong>
        <UiIconButton
          label="Tuần sau"
          icon="mdi-chevron-right"
          variant="secondary"
          @click="emit('next')"
        />
        <UiButton class="col-span-3 sm:col-span-1" variant="secondary" size="sm" leading-icon="mdi-calendar-today-outline" @click="emit('today')">
          Hôm nay
        </UiButton>
      </nav>
    </header>

    <section class="min-w-0 overflow-hidden rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white shadow-sm" aria-label="Lịch học trong tuần">
      <div v-if="isLoading && !scheduleItems.length" class="p-4">
        <AppSkeleton variant="list" :rows="4" />
      </div>

      <UiEmptyState
        v-else-if="!scheduleItems.length"
        class="min-h-80 rounded-none border-0"
        icon="mdi-calendar-blank-outline"
        heading="Tuần này chưa có lịch học"
        body="No classes this week"
      />

      <template v-else>
        <article
          v-for="group in visibleDayGroups"
          :key="group.key"
          class="grid min-w-0 gap-0 border-b border-slate-100 last:border-b-0 sm:grid-cols-[88px_minmax(0,1fr)]"
        >
          <div class="flex min-w-0 items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4 sm:flex-col sm:justify-start sm:border-b-0 sm:border-r sm:border-slate-100 sm:bg-white sm:pt-6">
            <div class="flex shrink-0 flex-col text-center">
              <span v-for="part in weekdayLabel(group.date)" :key="part" class="text-xs font-semibold leading-tight text-[var(--st-muted)]">
                {{ part }}
              </span>
            </div>
            <strong
              :class="[
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl font-semibold leading-none',
                isToday(group.date) ? 'bg-[var(--st-primary)] text-white' : 'text-[var(--st-text)]',
              ]"
            >
              {{ group.date.getDate() }}
            </strong>
          </div>

          <div class="grid min-w-0 gap-4 p-4 sm:p-6">
            <article
              v-for="item in group.items"
              :key="item.id"
              class="grid min-w-0 gap-4 rounded-[var(--st-radius)] border border-blue-200 bg-white p-4 shadow-sm sm:p-5"
              :style="toneStyle(item.color)"
            >
              <div class="flex min-w-0 flex-wrap items-start justify-between gap-2">
                <span class="inline-flex max-w-full items-center rounded-[var(--st-radius)] px-3 py-1.5 text-sm font-semibold leading-none text-[var(--schedule-accent)]" :style="{ background: 'var(--schedule-accent-soft)' }">
                  <span class="min-w-0 truncate">{{ item.className }}</span>
                </span>
                <UiBadge v-if="item.isToday" tone="danger">
                  Hôm nay
                </UiBadge>
              </div>

              <h2 class="min-w-0 break-words text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
                {{ item.title }}
              </h2>

              <div class="grid min-w-0 gap-3 text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)] md:grid-cols-[minmax(150px,0.8fr)_minmax(220px,1.2fr)]">
                <span class="flex min-w-0 items-start gap-2">
                  <AppIcon class="mt-0.5 shrink-0 text-slate-400" name="mdi-clock-time-four-outline" :size="17" />
                  <span class="min-w-0 break-words">{{ item.startTime }} - {{ item.endTime }}</span>
                </span>
                <span class="flex min-w-0 items-start gap-2">
                  <AppIcon
                    class="mt-0.5 shrink-0"
                    :class="item.isOnline ? 'text-[var(--schedule-accent)]' : 'text-emerald-500'"
                    :name="item.isOnline ? 'mdi-video-outline' : 'mdi-map-marker-outline'"
                    :size="17"
                  />
                  <span class="min-w-0 break-words">{{ item.location }}</span>
                </span>
              </div>

              <UiButton
                class="w-full sm:w-fit"
                :variant="item.isOnline ? 'primary' : 'secondary'"
                :leading-icon="actionIcon(item)"
              >
                {{ actionLabel(item) }}
              </UiButton>
            </article>
          </div>
        </article>
      </template>
    </section>
  </section>
</template>
