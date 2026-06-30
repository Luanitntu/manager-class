<script setup lang="ts">
import type { TeachingSession } from '~/composables/useSessions';
import { sessionDetailRange, sessionEventColor } from '~/utils/calendar';

defineProps<{
  activeSession: TeachingSession | null;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  open: [session: TeachingSession];
}>();
</script>

<template>
  <UiCard
    v-if="activeSession"
    class="flex min-h-[132px] flex-col items-center gap-4 text-center sm:flex-row sm:text-left"
    padding="lg"
  >
    <div
      class="h-[58px] w-1.5 shrink-0 rounded-[var(--st-radius)]"
      :style="{ backgroundColor: sessionEventColor(activeSession) }"
    />
    <div class="min-w-0 flex-1">
      <p class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
        {{ sessionDetailRange(activeSession) }}
      </p>
      <h3 class="mt-1 truncate text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
        {{ activeSession.lessonTopic || activeSession.class.name }}
      </h3>
      <UiBadge class="mt-2" tone="primary">
        {{ activeSession.class.name }}
      </UiBadge>
    </div>
    <UiButton
      v-if="canEdit"
      class="w-full shrink-0 sm:w-auto"
      leading-icon="mdi-pencil-outline"
      @click="emit('open', activeSession)"
    >
        Chỉnh sửa
    </UiButton>
  </UiCard>

  <UiEmptyState
    v-else
    class="min-h-[132px]"
    icon="mdi-calendar-blank-outline"
    heading="Chưa chọn buổi học"
    body="Bấm vào một buổi học trên lịch để xem chi tiết"
  />
</template>
