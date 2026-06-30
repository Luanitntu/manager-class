<script setup lang="ts">
import type { TeachingSession } from '~/composables/useSessions';
import type { CalendarCell, CalendarViewMode } from '~/utils/calendar';
import {
  isToday,
  sessionEventColor,
  sessionEventLabel,
} from '~/utils/calendar';

defineProps<{
  cells: CalendarCell[];
  canEdit: boolean;
  draggingSession: TeachingSession | null;
  sessionsByDay: Record<string, TeachingSession[]>;
  toolbarTitle: string;
  viewMode: CalendarViewMode;
  weekdays: string[];
}>();

const emit = defineEmits<{
  today: [];
  previous: [];
  next: [];
  'update:viewMode': [value: CalendarViewMode];
  create: [date: Date];
  open: [session: TeachingSession];
  'drag-start': [session: TeachingSession];
  'drag-end': [];
  'cell-drop': [date: Date];
}>();

function updateViewMode(value: unknown) {
  if (value === 'month' || value === 'week') {
    emit('update:viewMode', value);
  }
}
</script>

<template>
  <v-card class="calendar-board" aria-label="Lịch dạy theo tháng" role="region">
    <v-card-title class="calendar-board__toolbar">
      <div class="calendar-board__nav">
        <v-btn class="calendar-board__today" variant="flat" @click="emit('today')">
          Hôm nay
        </v-btn>
        <v-btn
          aria-label="Tháng trước"
          class="calendar-board__icon"
          icon="mdi-chevron-left"
          variant="text"
          @click="emit('previous')"
        />
        <v-btn
          aria-label="Tháng sau"
          class="calendar-board__icon"
          icon="mdi-chevron-right"
          variant="text"
          @click="emit('next')"
        />
        <h2>{{ toolbarTitle }}</h2>
      </div>

      <v-btn-toggle
        class="calendar-board__switch"
        density="compact"
        mandatory
        :model-value="viewMode"
        selected-class="is-active"
        @update:model-value="updateViewMode"
      >
        <v-btn value="month">Tháng</v-btn>
        <v-btn value="week">Tuần</v-btn>
      </v-btn-toggle>
    </v-card-title>

    <div class="calendar-grid" :class="{ 'calendar-grid--week': viewMode === 'week' }">
      <div v-for="day in weekdays" :key="day" class="calendar-grid__weekday">
        {{ day }}
      </div>

      <div
        v-for="cell in cells"
        :key="cell.key"
        class="calendar-grid__cell"
        :class="{
          'is-muted': !cell.inMonth,
          'is-drop-target': draggingSession && cell.inMonth,
        }"
        :role="cell.inMonth ? 'button' : undefined"
        :tabindex="cell.inMonth ? 0 : undefined"
        @click="cell.inMonth && emit('create', cell.date)"
        @keydown.enter="cell.inMonth && emit('create', cell.date)"
        @keydown.space.prevent="cell.inMonth && emit('create', cell.date)"
        @dragover.prevent
        @drop.prevent="emit('cell-drop', cell.date)"
      >
        <span
          v-if="cell.inMonth || viewMode === 'week'"
          class="calendar-grid__date"
          :class="{ 'is-today': isToday(cell.date) }"
        >
          {{ cell.date.getDate() }}
        </span>

        <span class="calendar-grid__events">
          <v-btn
            v-for="session in sessionsByDay[cell.key]?.slice(0, 3)"
            :key="session.id"
            block
            class="calendar-event"
            :class="{ 'is-cancelled': session.status === 'CANCELLED' }"
            :draggable="canEdit"
            height="26"
            :ripple="false"
            :style="{ '--event-color': sessionEventColor(session) }"
            variant="flat"
            @click.stop="emit('open', session)"
            @dragstart.stop="emit('drag-start', session)"
            @dragend="emit('drag-end')"
          >
            {{ sessionEventLabel(session) }}
          </v-btn>
          <span v-if="(sessionsByDay[cell.key]?.length ?? 0) > 3" class="calendar-event-more">
            +{{ (sessionsByDay[cell.key]?.length ?? 0) - 3 }} buổi
          </span>
        </span>
      </div>
    </div>
  </v-card>
</template>

<style scoped src="~/styles/calendar/board.css"></style>
