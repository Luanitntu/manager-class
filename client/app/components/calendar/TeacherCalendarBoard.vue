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

const viewModeItems = [
  { value: 'month', label: 'Tháng' },
  { value: 'week', label: 'Tuần' },
];

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
  <UiCard
    class="overflow-hidden"
    padding="none"
    aria-label="Lịch dạy theo tháng"
    role="region"
  >
    <div class="flex min-h-[72px] flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex min-w-0 flex-wrap items-center gap-3">
        <UiButton variant="secondary" size="sm" @click="emit('today')">
          Hôm nay
        </UiButton>
        <UiIconButton
          label="Tháng trước"
          icon="mdi-chevron-left"
          size="compact"
          @click="emit('previous')"
        />
        <UiIconButton
          label="Tháng sau"
          icon="mdi-chevron-right"
          size="compact"
          @click="emit('next')"
        />
        <h2 class="min-w-0 flex-[1_0_100%] text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)] sm:flex-initial">
          {{ toolbarTitle }}
        </h2>
      </div>

      <UiSegmentedControl
        class="w-full sm:w-auto"
        :model-value="viewMode"
        :items="viewModeItems"
        label="Chọn kiểu xem lịch"
        @update:model-value="updateViewMode"
      />
    </div>

    <div class="overflow-x-auto">
      <div class="grid min-w-[760px] grid-cols-7">
        <div
          v-for="day in weekdays"
          :key="day"
          class="flex h-[33px] items-center justify-center border-r border-t border-[var(--st-border)] bg-[#f8fbff] text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)] last:border-r-0"
        >
          {{ day }}
        </div>

        <div
          v-for="(cell, cellIndex) in cells"
          :key="cell.key"
          :class="[
            'min-w-0 overflow-hidden border-r border-t border-[var(--st-border)] bg-white p-2 pt-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100',
            viewMode === 'week' ? 'min-h-[584px]' : 'min-h-[120px]',
            cell.inMonth ? 'cursor-pointer hover:bg-[#fbfdff]' : 'cursor-default',
            draggingSession && cell.inMonth ? 'hover:bg-blue-50' : '',
            (cellIndex + 1) % 7 === 0 ? 'border-r-0' : '',
          ]"
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
            :class="[
              'float-right inline-flex h-7 w-7 items-center justify-center text-sm font-semibold leading-none text-[var(--st-text)]',
              isToday(cell.date) ? 'rounded-full bg-[var(--st-primary)] text-white' : '',
            ]"
          >
            {{ cell.date.getDate() }}
          </span>

          <span class="clear-both grid gap-1 pt-2.5">
            <button
              v-for="session in sessionsByDay[cell.key]?.slice(0, 3)"
              :key="session.id"
              type="button"
              :class="[
                'block h-[26px] min-w-0 max-w-full truncate rounded px-2 text-left text-xs font-semibold leading-[26px] text-white transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100',
                session.status === 'CANCELLED' ? 'line-through opacity-80' : '',
              ]"
              :draggable="canEdit"
              :style="{ backgroundColor: sessionEventColor(session) }"
              @click.stop="emit('open', session)"
              @dragstart.stop="emit('drag-start', session)"
              @dragend="emit('drag-end')"
            >
              {{ sessionEventLabel(session) }}
            </button>
            <span
              v-if="(sessionsByDay[cell.key]?.length ?? 0) > 3"
              class="pl-1 text-xs font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]"
            >
              +{{ (sessionsByDay[cell.key]?.length ?? 0) - 3 }} buổi
            </span>
          </span>
        </div>
      </div>
    </div>
  </UiCard>
</template>
