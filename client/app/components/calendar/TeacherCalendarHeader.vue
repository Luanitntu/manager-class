<script setup lang="ts">
defineProps<{
  subtitle: string;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  create: [];
  sync: [];
}>();
</script>

<template>
  <header class="calendar-page__header">
    <div>
      <h1>Lịch dạy</h1>
      <p>{{ subtitle }}</p>
    </div>

    <div class="calendar-page__actions">
      <v-btn
        class="calendar-page__sync"
        prepend-icon="mdi-calendar-sync-outline"
        variant="flat"
        @click="emit('sync')"
      >
        Đồng bộ Google Calendar
      </v-btn>
      <v-btn
        v-if="canEdit"
        class="calendar-page__create"
        color="primary"
        prepend-icon="mdi-plus"
        @click="emit('create')"
      >
        Tạo buổi học
      </v-btn>
    </div>
  </header>
</template>

<style scoped src="~/styles/calendar/header.css"></style>
