<script setup lang="ts">
import StudentSchedule from '~/components/StudentSchedule.vue';
import { fetchSessionRange, type TeachingSession } from '~/composables/useSessions';
import { addDays, endOfDay, startOfDay, startOfWeek } from '~/utils/calendar';

const sessions = ref<TeachingSession[]>([]);
const isLoading = ref(false);
const weekStart = ref(startOfWeek(new Date()));
const snackbar = reactive({ show: false, text: '', color: 'error' });

let currentRange: { from: string; to: string } | null = null;

const rangeStart = computed(() => startOfDay(weekStart.value));
const rangeEnd = computed(() => endOfDay(addDays(weekStart.value, 6)));

watch(
  () => [rangeStart.value, rangeEnd.value] as const,
  ([start, end]) => loadRange(start, end),
  { immediate: true },
);

function notify(text: string, color = 'error') {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
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
  <div class="calendar-page">
    <StudentSchedule
      :is-loading="isLoading"
      :sessions="sessions"
      :week-start="weekStart"
      @next="goNext"
      @previous="goPrevious"
      @today="goToday"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<style scoped src="~/styles/calendar/page.css"></style>
