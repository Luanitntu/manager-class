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
  <UiPageHeader title="Lịch dạy" :subtitle="subtitle">
    <template #actions>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <UiButton
          class="w-full sm:w-auto"
          leading-icon="mdi-calendar-sync-outline"
          variant="secondary"
          @click="emit('sync')"
        >
          Đồng bộ Google Calendar
        </UiButton>
        <UiButton
          v-if="canEdit"
          class="w-full sm:w-auto"
          leading-icon="mdi-plus"
          @click="emit('create')"
        >
          Tạo buổi học
        </UiButton>
      </div>
    </template>
  </UiPageHeader>
</template>
