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
  <v-sheet class="calendar-detail" :class="{ 'calendar-detail--active': activeSession }">
    <template v-if="activeSession">
      <div class="calendar-detail__mark" :style="{ '--event-color': sessionEventColor(activeSession) }" />
      <div>
        <p>{{ sessionDetailRange(activeSession) }}</p>
        <h3>{{ activeSession.lessonTopic || activeSession.class.name }}</h3>
        <span>{{ activeSession.class.name }}</span>
      </div>
      <v-spacer />
      <v-btn v-if="canEdit" color="primary" variant="flat" @click="emit('open', activeSession)">
        Chỉnh sửa
      </v-btn>
    </template>

    <template v-else>
      <v-icon size="34">mdi-calendar-blank-outline</v-icon>
      <p>Bấm vào một buổi học trên lịch để xem chi tiết</p>
    </template>
  </v-sheet>
</template>

<style scoped lang="scss">
@use '~/styles/calendar/detail.scss';
</style>
