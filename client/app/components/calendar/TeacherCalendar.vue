<script setup lang="ts">
import type { TeachingSession } from '~/composables/useSessions';
import { fetchSessionRange } from '~/composables/useSessions';
import TeacherCalendarBoard from '~/components/calendar/TeacherCalendarBoard.vue';
import TeacherCalendarHeader from '~/components/calendar/TeacherCalendarHeader.vue';
import TeacherSessionDetail from '~/components/calendar/TeacherSessionDetail.vue';
import {
  addDays,
  buildCalendarCells,
  calendarWeekdays,
  endOfMonth,
  formatCalendarToolbarTitle,
  formatMonthSubtitle,
  groupSessionsByDay,
  startOfMonth,
  withTime,
  type CalendarViewMode,
} from '~/utils/calendar';

const props = defineProps<{
  canEdit: boolean;
}>();

const { update } = useSessionMutations();

const dialog = ref(false);
const selected = ref<TeachingSession | null>(null);
const activeSession = ref<TeachingSession | null>(null);
const prefill = ref<{ start: string; end: string } | null>(null);
const sessions = ref<TeachingSession[]>([]);
const isLoading = ref(false);
const viewDate = ref(startOfMonth(new Date()));
const viewMode = ref<CalendarViewMode>('month');
const draggingSession = ref<TeachingSession | null>(null);
const toast = useToast();

let currentRange: { from: string; to: string } | null = null;

const calendarCells = computed(() => buildCalendarCells(viewDate.value, viewMode.value));
const rangeStart = computed(() => calendarCells.value[0]?.date ?? startOfMonth(viewDate.value));
const rangeEnd = computed(() => calendarCells.value.at(-1)?.date ?? endOfMonth(viewDate.value));
const pageSubtitle = computed(() => formatMonthSubtitle(viewDate.value));
const toolbarTitle = computed(() => formatCalendarToolbarTitle(viewDate.value, viewMode.value));
const sessionsByDay = computed(() => groupSessionsByDay(sessions.value));

watch(
  () => [rangeStart.value, rangeEnd.value, viewMode.value] as const,
  ([start, end]) => loadRange(start, end),
  { immediate: true },
);

function notify(text: string, type: 'success' | 'error' | 'info' = 'error') {
  toast.show({ message: text, type, duration: 3000 });
}

async function loadRange(from: Date, to: Date) {
  const range = { from: from.toISOString(), to: to.toISOString() };
  currentRange = range;
  isLoading.value = true;

  try {
    const nextSessions = await fetchSessionRange(range.from, range.to);
    if (currentRange?.from === range.from && currentRange.to === range.to) {
      sessions.value = nextSessions;
    }
  } catch (e) {
    notify(extractApiError(e) ?? 'Không tải được lịch dạy');
  } finally {
    if (currentRange?.from === range.from && currentRange.to === range.to) {
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
  if (!props.canEdit) return;

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
  viewDate.value = startOfMonth(new Date());
}

function goPrevious() {
  viewDate.value =
    viewMode.value === 'week'
      ? addDays(viewDate.value, -7)
      : new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
}

function goNext() {
  viewDate.value =
    viewMode.value === 'week'
      ? addDays(viewDate.value, 7)
      : new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1);
}

function onDragStart(session: TeachingSession) {
  if (!props.canEdit) return;
  draggingSession.value = session;
}

function onDragEnd() {
  draggingSession.value = null;
}

async function onCellDrop(date: Date) {
  if (!props.canEdit || !draggingSession.value || update.isPending.value) return;

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
</script>

<template>
  <div class="grid w-full gap-6 text-[var(--st-text)] sm:gap-[18px]">
    <TeacherCalendarHeader
      :can-edit="canEdit"
      :subtitle="pageSubtitle"
      @create="openCreate()"
      @sync="notify('Tính năng đồng bộ Google Calendar đang được chuẩn bị', 'info')"
    />

    <AppSkeleton v-if="isLoading && !sessions.length" variant="calendar" />

    <TeacherCalendarBoard
      v-else
      v-model:view-mode="viewMode"
      :can-edit="canEdit"
      :cells="calendarCells"
      :dragging-session="draggingSession"
      :sessions-by-day="sessionsByDay"
      :toolbar-title="toolbarTitle"
      :weekdays="calendarWeekdays"
      @cell-drop="onCellDrop"
      @create="openCreate"
      @drag-end="onDragEnd"
      @drag-start="onDragStart"
      @next="goNext"
      @open="openSession"
      @previous="goPrevious"
      @today="goToday"
    />

    <TeacherSessionDetail
      :active-session="activeSession"
      :can-edit="canEdit"
      @open="openSession"
    />

    <SessionDialog
      v-model="dialog"
      :session="selected"
      :prefill="prefill"
      @saved="reload"
    />

  </div>
</template>
