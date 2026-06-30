<script setup lang="ts">
import StudentSchedule from '~/components/StudentSchedule.vue';
import { fetchSessionRange, type TeachingSession } from '~/composables/useSessions';
import { addDays, endOfDay, startOfDay, startOfWeek } from '~/utils/calendar';

const sessions = ref<TeachingSession[]>([]);
const isLoading = ref(false);
const weekStart = ref(startOfWeek(new Date()));
const toast = useToast();

let currentRange: { from: string; to: string } | null = null;

const rangeStart = computed(() => startOfDay(weekStart.value));
const rangeEnd = computed(() => endOfDay(addDays(weekStart.value, 6)));

watch(
  () => [rangeStart.value, rangeEnd.value] as const,
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
    notify(extractApiError(e) ?? 'Không tải được lịch học');
  } finally {
    if (currentRange?.from === range.from && currentRange.to === range.to) {
      isLoading.value = false;
    }
  }
}

function goToday() {
  weekStart.value = startOfWeek(new Date());
}

function goPrevious() {
  weekStart.value = addDays(weekStart.value, -7);
}

function goNext() {
  weekStart.value = addDays(weekStart.value, 7);
}
</script>

<template>
  <div class="grid w-full gap-6 text-[var(--st-text)] sm:gap-[18px]">
    <StudentSchedule
      :is-loading="isLoading"
      :sessions="sessions"
      :week-start="weekStart"
      @next="goNext"
      @previous="goPrevious"
      @today="goToday"
    />

  </div>
</template>
