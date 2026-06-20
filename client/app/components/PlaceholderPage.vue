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
    <h1 class="text-h5 font-weight-bold mb-1">{{ title }}</h1>
    <p class="text-medium-emphasis mb-6">{{ subtitle }}</p>
    <v-card class="pa-12 text-center text-medium-emphasis">
      <v-icon size="48" class="mb-3">{{ icon }}</v-icon>
      <div>This module is implemented in {{ phase }}.</div>
    </v-card>
  </div>
</template>
