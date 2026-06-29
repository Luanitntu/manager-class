<script setup lang="ts">
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import luxonPlugin from '@fullcalendar/luxon3';
import type {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  DatesSetArg,
} from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { fetchSessionRange, type TeachingSession } from '~/composables/useSessions';

type CalendarViewMode = 'month' | 'week';

interface CalendarCell {
  key: string;
  date: Date;
  inMonth: boolean;
}

const auth = useAuthStore();
const { update } = useSessionMutations();
const userTz = useUserTimezone();
const canEdit = computed(() => auth.role === 'TEACHER');
const isStudentSchedule = computed(() => auth.role === 'STUDENT');

const dialog = ref(false);
const selected = ref<TeachingSession | null>(null);
const activeSession = ref<TeachingSession | null>(null);
const prefill = ref<{ start: string; end: string } | null>(null);
const snackbar = reactive({ show: false, text: '', color: 'error' });
const sessions = ref<TeachingSession[]>([]);
const isLoading = ref(false);
const viewDate = ref(isStudentSchedule.value ? startOfWeek(new Date()) : startOfMonth(new Date()));
const viewMode = ref<CalendarViewMode>(isStudentSchedule.value ? 'week' : 'month');
const draggingSession = ref<TeachingSession | null>(null);

let currentRange: { from: string; to: string } | null = null;

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const calendarCells = computed<CalendarCell[]>(() => {
  if (viewMode.value === 'week') {
    const weekStart = startOfWeek(viewDate.value);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      return {
        key: toDateKey(date),
        date,
        inMonth: date.getMonth() === viewDate.value.getMonth(),
      };
    });
  }

  const monthStart = startOfMonth(viewDate.value);
  const monthEnd = endOfMonth(viewDate.value);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const totalDays = differenceInDays(gridStart, gridEnd) + 1;

  return Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      key: toDateKey(date),
      date,
      inMonth: date.getMonth() === viewDate.value.getMonth(),
    };
  });
});

const rangeStart = computed(() => calendarCells.value[0]?.date ?? startOfMonth(viewDate.value));
const rangeEnd = computed(() => calendarCells.value.at(-1)?.date ?? endOfMonth(viewDate.value));
const studentWeekStart = computed(() => startOfWeek(viewDate.value));

const pageSubtitle = computed(() => formatMonthSubtitle(viewDate.value));
const toolbarTitle = computed(() => {
  if (viewMode.value === 'week') {
    const start = startOfWeek(viewDate.value);
    const end = addDays(start, 6);
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  }

  return `Tháng ${viewDate.value.getMonth() + 1} năm ${viewDate.value.getFullYear()}`;
});

const sessionsByDay = computed(() => {
  return sessions.value.reduce<Record<string, TeachingSession[]>>((days, session) => {
    const key = toDateKey(new Date(session.startTime));
    days[key] ??= [];
    days[key].push(session);
    days[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return days;
  }, {});
});

watch(
  () => [rangeStart.value, rangeEnd.value, viewMode.value] as const,
  ([start, end]) => loadRange(start, end),
  { immediate: true },
);

watch(isStudentSchedule, (isStudent) => {
  if (isStudent) {
    viewMode.value = 'week';
    viewDate.value = startOfWeek(new Date());
  }
});

function notify(text: string, color = 'error') {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
}

function locationSuffix(s: TeachingSession) {
  if (s.class.locationType === 'ONLINE') {
    const map: Record<string, string> = { GOOGLE_MEET: 'Meet', ZOOM: 'Zoom', OTHER: 'Online' };
    return ` · 💻 ${map[s.class.meetingProvider ?? 'OTHER'] ?? 'Online'}`;
  }
  return s.class.room ? ` · 📍 ${s.class.room}` : '';
}

function toEvent(s: TeachingSession) {
  const color = s.class.color || '#5D87FF';
  // Past + still SCHEDULED = needs confirmation (mark done / reschedule / cancel).
  const overdue = s.status === 'SCHEDULED' && new Date(s.endTime).getTime() < Date.now();
  const completed = s.status === 'COMPLETED';
  return {
    id: s.id,
    title: `${overdue ? '⚠ ' : ''}${completed ? '✓ ' : ''}${s.class.name}${s.lessonTopic ? ' — ' + s.lessonTopic : ''}${locationSuffix(s)}`,
    start: s.startTime,
    end: s.endTime,
    backgroundColor: s.status === 'CANCELLED' ? '#bdbdbd' : color,
    borderColor: s.status === 'CANCELLED' ? '#bdbdbd' : overdue ? '#FA5252' : color,
    classNames: overdue ? ['st-overdue-event'] : [],
    extendedProps: { session: s },
  };
}

async function loadRange(from: string, to: string) {
  currentRange = { from, to };
  isLoading.value = true;

  try {
    const nextSessions = await fetchSessionRange(from, to);
    if (currentRange?.from === from && currentRange.to === to) {
      sessions.value = nextSessions;
    }
  } catch (e) {
    notify(extractApiError(e) ?? 'Không tải được lịch dạy');
  } finally {
    if (currentRange?.from === from && currentRange.to === to) {
      isLoading.value = false;
    }
  }
}

function reload() {
  if (currentRange) {
    loadRange(new Date(currentRange.from), new Date(currentRange.to));
  }
}

function openCreate(date?: Date) {
  if (!canEdit.value) return;

  selected.value = null;
  activeSession.value = null;

  if (date) {
    const start = withTime(date, 9, 0);
    const end = withTime(date, 10, 30);
    prefill.value = { start: start.toISOString(), end: end.toISOString() };
  } else {
    prefill.value = null;
  }

  dialog.value = true;
}

function openSession(session: TeachingSession) {
  activeSession.value = session;
  selected.value = session;
  prefill.value = null;
  dialog.value = true;
}

function goToday() {
  viewDate.value = isStudentSchedule.value ? startOfWeek(new Date()) : startOfMonth(new Date());
}

function goPrevious() {
  viewDate.value =
    isStudentSchedule.value || viewMode.value === 'week'
      ? addDays(viewDate.value, -7)
      : new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
}

function goNext() {
  viewDate.value =
    isStudentSchedule.value || viewMode.value === 'week'
      ? addDays(viewDate.value, 7)
      : new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1);
}

function onDragStart(session: TeachingSession) {
  if (!canEdit.value) return;
  draggingSession.value = session;
}

function onDragEnd() {
  draggingSession.value = null;
}

async function onCellDrop(date: Date) {
  if (!canEdit.value || !draggingSession.value) return;
  if (update.isPending.value) return;

  const session = draggingSession.value;
  const originalStart = new Date(session.startTime);
  const originalEnd = new Date(session.endTime);
  const nextStart = withTime(date, originalStart.getHours(), originalStart.getMinutes());
  const duration = originalEnd.getTime() - originalStart.getTime();
  const nextEnd = new Date(nextStart.getTime() + duration);

  try {
    await update.mutateAsync({
      id: session.id,
      body: {
        startTime: nextStart.toISOString(),
        endTime: nextEnd.toISOString(),
      },
    });
    notify('Đã cập nhật lịch học', 'success');
    reload();
  } catch (e) {
    notify(extractApiError(e) ?? 'Không thể đổi lịch học');
  } finally {
    draggingSession.value = null;
  }
}

function eventColor(session: TeachingSession) {
  if (session.status === 'CANCELLED') return '#94A3B8';
  return session.class.color || colorForId(session.classId);
}

function eventLabel(session: TeachingSession) {
  return `${formatTime(session.startTime)} ${session.lessonTopic || session.class.name}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function formatDetailRange(session: TeachingSession) {
  return `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`;
}

function formatMonthSubtitle(date: Date) {
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function formatShortDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function isToday(date: Date) {
  return toDateKey(date) === toDateKey(new Date());
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function differenceInDays(start: Date, end: Date) {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000);
}

function withTime(date: Date, hour: number, minute: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
}

function colorForId(id: string) {
  const colors = ['#0D6EFD', '#7367F0', '#00B894', '#FF6B00'];
  const total = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[total % colors.length];
}
const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, luxonPlugin],
  initialView: 'dayGridMonth',
  timeZone: userTz.value, // render every viewer's calendar in their own timezone
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  height: 'auto',
  nowIndicator: true,
  selectable: canEdit.value,
  selectMirror: true,
  editable: canEdit.value,
  eventStartEditable: canEdit.value,
  eventDurationEditable: canEdit.value,
  slotMinTime: '06:00:00',
  slotMaxTime: '23:00:00',
  events: events.value,
  datesSet: onDatesSet,
  select: onSelect,
  eventClick: onEventClick,
  eventDrop: reschedule,
  eventResize: reschedule,
}));
</script>

<template>
  <div class="calendar-page">
    <StudentSchedule
      v-if="isStudentSchedule"
      :is-loading="isLoading"
      :sessions="sessions"
      :week-start="studentWeekStart"
      @next="goNext"
      @previous="goPrevious"
      @today="goToday"
    />

    <header v-if="!isStudentSchedule" class="calendar-page__header">
      <div>
        <h1>Lịch dạy</h1>
        <p>{{ pageSubtitle }}</p>
      </div>

      <div class="calendar-page__actions">
        <v-btn
          class="calendar-page__sync"
          prepend-icon="mdi-calendar-sync-outline"
          variant="flat"
          @click="notify('Tính năng đồng bộ Google Calendar đang được chuẩn bị', 'info')"
        >
          Đồng bộ Google Calendar
        </v-btn>
        <v-btn
          v-if="canEdit"
          class="calendar-page__create"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreate()"
        >
          Tạo buổi học
        </v-btn>
      </div>
    </header>

    <AppSkeleton
      v-if="!isStudentSchedule && isLoading && !sessions.length"
      variant="calendar"
    />

    <section v-else-if="!isStudentSchedule" class="calendar-board" aria-label="Lịch dạy theo tháng">
      <div class="calendar-board__toolbar">
        <div class="calendar-board__nav">
          <v-btn class="calendar-board__today" variant="flat" @click="goToday">
            Hôm nay
          </v-btn>
          <v-btn
            aria-label="Tháng trước"
            class="calendar-board__icon"
            icon="mdi-chevron-left"
            variant="text"
            @click="goPrevious"
          />
          <v-btn
            aria-label="Tháng sau"
            class="calendar-board__icon"
            icon="mdi-chevron-right"
            variant="text"
            @click="goNext"
          />
          <h2>{{ toolbarTitle }}</h2>
        </div>

        <div class="calendar-board__switch" role="tablist" aria-label="Chế độ xem lịch">
          <button
            :class="{ 'is-active': viewMode === 'month' }"
            type="button"
            @click="viewMode = 'month'"
          >
            Tháng
          </button>
          <button
            :class="{ 'is-active': viewMode === 'week' }"
            type="button"
            @click="viewMode = 'week'"
          >
            Tuần
          </button>
        </div>
      </div>

      <div class="calendar-grid" :class="{ 'calendar-grid--week': viewMode === 'week' }">
        <div v-for="day in weekdays" :key="day" class="calendar-grid__weekday">
          {{ day }}
        </div>

        <div
          v-for="cell in calendarCells"
          :key="cell.key"
          class="calendar-grid__cell"
          :class="{
            'is-muted': !cell.inMonth,
            'is-drop-target': draggingSession && cell.inMonth,
          }"
          :role="cell.inMonth ? 'button' : undefined"
          :tabindex="cell.inMonth ? 0 : undefined"
          @click="cell.inMonth && openCreate(cell.date)"
          @keydown.enter="cell.inMonth && openCreate(cell.date)"
          @keydown.space.prevent="cell.inMonth && openCreate(cell.date)"
          @dragover.prevent
          @drop.prevent="onCellDrop(cell.date)"
        >
          <span
            v-if="cell.inMonth || viewMode === 'week'"
            class="calendar-grid__date"
            :class="{ 'is-today': isToday(cell.date) }"
          >
            {{ cell.date.getDate() }}
          </span>

          <span class="calendar-grid__events">
            <button
              v-for="session in sessionsByDay[cell.key]?.slice(0, 3)"
              :key="session.id"
              class="calendar-event"
              :class="{ 'is-cancelled': session.status === 'CANCELLED' }"
              :draggable="canEdit"
              :style="{ '--event-color': eventColor(session) }"
              type="button"
              @click.stop="openSession(session)"
              @dragstart.stop="onDragStart(session)"
              @dragend="onDragEnd"
            >
              {{ eventLabel(session) }}
            </button>
            <span v-if="(sessionsByDay[cell.key]?.length ?? 0) > 3" class="calendar-event-more">
              +{{ (sessionsByDay[cell.key]?.length ?? 0) - 3 }} buổi
            </span>
          </span>
        </div>
      </div>
    </section>

    <section v-if="!isStudentSchedule" class="calendar-detail" :class="{ 'calendar-detail--active': activeSession }">
      <template v-if="activeSession">
        <div class="calendar-detail__mark" :style="{ '--event-color': eventColor(activeSession) }" />
        <div>
          <p>{{ formatDetailRange(activeSession) }}</p>
          <h3>{{ activeSession.lessonTopic || activeSession.class.name }}</h3>
          <span>{{ activeSession.class.name }}</span>
        </div>
        <v-spacer />
        <v-btn v-if="canEdit" color="primary" variant="flat" @click="openSession(activeSession)">
          Chỉnh sửa
        </v-btn>
      </template>

      <template v-else>
        <v-icon size="34">mdi-calendar-blank-outline</v-icon>
        <p>Bấm vào một buổi học trên lịch để xem chi tiết</p>
      </template>
    </section>

    <SessionDialog
      v-if="!isStudentSchedule"
      v-model="dialog"
      :session="selected"
      :prefill="prefill"
      @saved="reload"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<style scoped lang="scss">
.calendar-page {
  --calendar-primary: #0d6efd;
  --calendar-primary-dark: #0b1b3f;
  --calendar-border: #dce5f1;
  --calendar-muted: #5f7190;
  --calendar-soft: #f5f8fc;

  color: var(--calendar-primary-dark);
  display: grid;
  gap: 24px;
  width: 100%;

  &__header {
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    gap: 16px;

    h1 {
      color: #071735;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.15;
      margin: 2px 0 6px;
    }

    p {
      color: #486188;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }
  }

  &__actions {
    align-items: center;
    display: flex;
    gap: 12px;
    margin-bottom: 2px;
  }

  &__sync,
  &__create {
    border-radius: 10px !important;
    font-size: 14px;
    font-weight: 800;
    height: 38px !important;
    letter-spacing: 0;
    padding-inline: 17px !important;
  }

  &__sync {
    background: #fff !important;
    border: 1px solid var(--calendar-border);
    box-shadow: 0 2px 6px rgba(25, 43, 77, 0.1) !important;
    color: #17233c !important;
  }

  &__create {
    background: var(--calendar-primary) !important;
    box-shadow: 0 4px 10px rgba(13, 110, 253, 0.22) !important;
    color: #fff !important;
  }
}

.calendar-board {
  background: #fff;
  border: 1px solid var(--calendar-border);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(31, 49, 82, 0.08);
  overflow: hidden;

  &__toolbar {
    align-items: center;
    display: flex;
    height: 72px;
    justify-content: space-between;
    padding: 16px;
  }

  &__nav {
    align-items: center;
    display: flex;
    gap: 12px;

    h2 {
      color: #071735;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1;
      margin: 0 0 0 10px;
    }
  }

  &__today {
    background: #fff !important;
    border: 1px solid var(--calendar-border);
    border-radius: 9px !important;
    box-shadow: none !important;
    color: #17233c !important;
    font-size: 14px;
    font-weight: 800;
    height: 34px !important;
    letter-spacing: 0;
    min-width: 86px !important;
    padding-inline: 14px !important;
  }

  &__icon {
    color: #547096 !important;
    height: 34px !important;
    width: 26px !important;
  }

  &__switch {
    align-items: center;
    background: #eef3fa;
    border-radius: 10px;
    display: flex;
    gap: 2px;
    height: 40px;
    padding: 4px;

    button {
      border-radius: 8px;
      color: #61718d;
      cursor: pointer;
      font-size: 14px;
      font-weight: 800;
      height: 32px;
      min-width: 72px;
      padding: 0 18px;
      transition: background-color 180ms ease, box-shadow 180ms ease, color 180ms ease;

      &.is-active {
        background: #fff;
        box-shadow: 0 1px 4px rgba(31, 49, 82, 0.18);
        color: #071735;
      }
    }
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));

  &--week {
    .calendar-grid__cell {
      min-height: 584px;
    }
  }

  &__weekday {
    align-items: center;
    background: #f8fbff;
    border-top: 1px solid var(--calendar-border);
    border-right: 1px solid var(--calendar-border);
    color: #52698b;
    display: flex;
    font-size: 13px;
    font-weight: 800;
    height: 33px;
    justify-content: center;

    &:nth-child(7) {
      border-right: 0;
    }
  }

  &__cell {
    background: #fff;
    border-right: 1px solid var(--calendar-border);
    border-top: 1px solid var(--calendar-border);
    color: inherit;
    cursor: pointer;
    min-height: 120px;
    overflow: hidden;
    padding: 12px 8px 8px;
    position: relative;
    text-align: left;
    transition: background-color 160ms ease;

    &:nth-child(7n) {
      border-right: 0;
    }

    &:hover {
      background: #fbfdff;
    }

    &.is-muted {
      background: #fff;
      cursor: default;
    }

    &.is-drop-target:hover {
      background: #eef6ff;
    }
  }

  &__date {
    align-items: center;
    color: #071735;
    display: inline-flex;
    float: right;
    font-size: 14px;
    font-weight: 800;
    height: 28px;
    justify-content: center;
    line-height: 1;
    width: 28px;

    &.is-today {
      background: var(--calendar-primary);
      border-radius: 50%;
      color: #fff;
    }
  }

  &__events {
    clear: both;
    display: grid;
    gap: 4px;
    padding-top: 10px;
  }
}

.calendar-event {
  background: var(--event-color);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  display: block;
  font-size: 12px;
  font-weight: 800;
  height: 26px;
  letter-spacing: 0;
  line-height: 26px;
  max-width: 100%;
  overflow: hidden;
  padding: 0 8px;
  text-align: left;
  text-overflow: ellipsis;
  transition: filter 160ms ease, opacity 160ms ease;
  white-space: nowrap;

  &:hover {
    filter: brightness(0.96);
  }

  &.is-cancelled {
    text-decoration: line-through;
  }
}

.calendar-event-more {
  color: #547096;
  font-size: 12px;
  font-weight: 800;
  padding-left: 4px;
}

.calendar-detail {
  align-items: center;
  background: rgba(248, 251, 255, 0.72);
  border: 1px dashed #d7e2ef;
  border-radius: 12px;
  color: #9aacca;
  display: flex;
  gap: 14px;
  height: 132px;
  justify-content: center;
  padding: 24px;

  p {
    color: #91a2c1;
    font-size: 15px;
    font-weight: 800;
    margin: 0;
  }

  &--active {
    background: #fff;
    border-style: solid;
    color: #17233c;
    justify-content: flex-start;

    p {
      color: #486188;
      font-size: 13px;
      margin-bottom: 4px;
    }

    h3 {
      color: #071735;
      font-size: 18px;
      font-weight: 800;
      line-height: 1.2;
      margin: 0 0 4px;
    }

    span {
      color: #5f7190;
      font-size: 14px;
      font-weight: 700;
    }
  }

  &__mark {
    background: var(--event-color);
    border-radius: 10px;
    height: 58px;
    width: 6px;
  }
}

@media (max-width: 960px) {
  .calendar-page {
    &__header {
      align-items: flex-start;
      flex-direction: column;
    }

    &__actions {
      width: 100%;
    }

    &__sync,
    &__create {
      flex: 1 1 auto;
    }
  }

  .calendar-board {
    &__toolbar {
      align-items: flex-start;
      flex-direction: column;
      gap: 14px;
      height: auto;
    }
  }

  .calendar-grid {
    min-width: 760px;

    &__cell {
      min-height: 116px;
    }
  }

  .calendar-board {
    overflow-x: auto;
  }
}

@media (max-width: 640px) {
  .calendar-page {
    gap: 18px;

    &__actions {
      flex-direction: column;
    }

    &__sync,
    &__create {
      width: 100%;
    }
  }

  .calendar-board {
    border-radius: 10px;

    &__nav {
      flex-wrap: wrap;

      h2 {
        flex: 1 0 100%;
        margin: 4px 0 0;
      }
    }

    &__switch {
      width: 100%;

      button {
        flex: 1 1 0;
      }
    }
  }

  .calendar-detail {
    align-items: center;
    height: auto;
    min-height: 118px;
    text-align: center;
  }
}
</style>
