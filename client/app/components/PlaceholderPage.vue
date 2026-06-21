<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  icon: string;
  phase: string;
}>();
</script>

<template>
  <div>
    <AppPageHeader :title="title" :subtitle="subtitle" :icon="icon" />
    <AppState
      variant="empty"
      :icon="icon"
      title="Coming into focus"
      :body="`This module is implemented in ${phase}.`"
    />
  </div>
</template>
