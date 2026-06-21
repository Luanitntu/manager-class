<script setup lang="ts">
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  DatesSetArg,
} from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { useDisplay } from 'vuetify';
import { fetchSessionRange, type TeachingSession } from '~/composables/useSessions';

const auth = useAuthStore();
const { smAndDown } = useDisplay();
const { update } = useSessionMutations();
const canEdit = computed(() => auth.role === 'TEACHER');

const dialog = ref(false);
const selected = ref<TeachingSession | null>(null);
const prefill = ref<{ start: string; end: string } | null>(null);
const snackbar = reactive({ show: false, text: '', color: 'error' });

const events = ref<Record<string, unknown>[]>([]);
const loading = ref(false);
let currentRange: { from: string; to: string } | null = null;

function notify(text: string, color = 'error') {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
}

function toEvent(s: TeachingSession) {
  const color = s.class.color || '#2563EB';
  return {
    id: s.id,
    title: `${s.class.name}${s.lessonTopic ? ' - ' + s.lessonTopic : ''}`,
    start: s.startTime,
    end: s.endTime,
    backgroundColor: s.status === 'CANCELLED' ? '#94a3b8' : color,
    borderColor: s.status === 'CANCELLED' ? '#94a3b8' : color,
    extendedProps: { session: s },
  };
}

async function loadRange(from: string, to: string) {
  currentRange = { from, to };
  loading.value = true;
  try {
    const sessions = await fetchSessionRange(from, to);
    events.value = sessions.map(toEvent);
  } catch (e) {
    notify(extractApiError(e) ?? 'Failed to load sessions');
  } finally {
    loading.value = false;
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
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: smAndDown.value ? 'timeGridDay' : 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: smAndDown.value ? 'timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay',
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

const agendaSessions = computed(() =>
  events.value
    .map((event) => (event.extendedProps as { session?: TeachingSession } | undefined)?.session)
    .filter((session): session is TeachingSession => !!session)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
);

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Calendar"
      icon="mdi-calendar-month-outline"
      :subtitle="
        canEdit
          ? 'Create sessions, open details, and drag to reschedule.'
          : 'Follow your upcoming class schedule.'
      "
    >
      <template #actions>
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
      </template>
    </AppPageHeader>

    <AppState
      v-if="loading && !events.length"
      variant="loading"
      title="Loading calendar"
      body="Fetching sessions for this date range."
    />

    <v-card v-else class="pa-3 pa-sm-4 st-card-soft st-calendar-card">
      <client-only>
        <FullCalendar :options="calendarOptions" />
        <template #fallback>
          <AppState variant="loading" title="Loading calendar" />
        </template>
      </client-only>
    </v-card>

    <v-card v-if="smAndDown && agendaSessions.length" class="mt-4 st-card-soft">
      <v-card-title class="text-subtitle-1 font-weight-bold">Agenda</v-card-title>
      <v-list>
        <v-list-item
          v-for="session in agendaSessions"
          :key="session.id"
          @click="
            selected = session;
            prefill = null;
            dialog = true;
          "
        >
          <template #prepend>
            <v-avatar :color="session.class.color || 'primary'" size="10" />
          </template>
          <v-list-item-title>{{ session.class.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ session.lessonTopic || 'No topic' }}</v-list-item-subtitle>
          <template #append>
            <span class="text-caption text-medium-emphasis">
              {{ fmt(session.startTime) }}
            </span>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <AppState
      v-else-if="!loading && !events.length"
      class="mt-4"
      variant="empty"
      icon="mdi-calendar-heart"
      title="No sessions in this range"
      body="Sessions will appear here when they are scheduled for the selected dates."
    />

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
