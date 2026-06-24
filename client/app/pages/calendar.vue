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

const auth = useAuthStore();
const { update } = useSessionMutations();
const userTz = useUserTimezone();
const canEdit = computed(() => auth.role === 'TEACHER');

const dialog = ref(false);
const selected = ref<TeachingSession | null>(null);
const prefill = ref<{ start: string; end: string } | null>(null);
const snackbar = reactive({ show: false, text: '', color: 'error' });

const events = ref<Record<string, unknown>[]>([]);
let currentRange: { from: string; to: string } | null = null;

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
  try {
    const sessions = await fetchSessionRange(from, to);
    events.value = sessions.map(toEvent);
  } catch (e) {
    notify(extractApiError(e) ?? 'Failed to load sessions');
  }
}

function reload() {
  if (currentRange) loadRange(currentRange.from, currentRange.to);
}

function onDatesSet(arg: DatesSetArg) {
  loadRange(arg.start.toISOString(), arg.end.toISOString());
}

function onSelect(arg: DateSelectArg) {
  if (!canEdit.value) return;
  selected.value = null;
  prefill.value = { start: arg.start.toISOString(), end: arg.end.toISOString() };
  dialog.value = true;
}

function onEventClick(arg: EventClickArg) {
  selected.value = arg.event.extendedProps.session as TeachingSession;
  prefill.value = null;
  dialog.value = true;
}

async function reschedule(arg: EventDropArg | EventResizeDoneArg) {
  if (!canEdit.value || !arg.event.start || !arg.event.end) {
    arg.revert();
    return;
  }
  try {
    await update.mutateAsync({
      id: arg.event.id,
      body: {
        startTime: arg.event.start.toISOString(),
        endTime: arg.event.end.toISOString(),
      },
    });
    notify('Session rescheduled', 'success');
  } catch (e) {
    arg.revert();
    notify(extractApiError(e) ?? 'Could not reschedule');
  }
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
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Calendar</h1>
        <p class="text-medium-emphasis ma-0">
          Click a slot to create a session. Drag to reschedule.
        </p>
      </div>
      <v-btn
        v-if="canEdit"
        color="primary"
        prepend-icon="mdi-plus"
        @click="
          selected = null;
          prefill = null;
          dialog = true;
        "
      >
        New Session
      </v-btn>
    </div>

    <v-card class="pa-4">
      <client-only>
        <FullCalendar :options="calendarOptions" />
        <template #fallback>
          <div class="text-center pa-12 text-medium-emphasis">Loading calendar…</div>
        </template>
      </client-only>
    </v-card>

    <SessionDialog
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

<style scoped>
/* Overdue sessions (past + still scheduled) get a stronger red outline. */
:deep(.st-overdue-event) {
  outline: 2px solid #fa5252;
  outline-offset: -2px;
}
</style>
