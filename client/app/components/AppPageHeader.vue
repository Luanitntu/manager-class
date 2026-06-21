<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  icon?: string;
}>();
</script>

<template>
  <div class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between ga-4 mb-6">
    <div class="d-flex align-start ga-3">
      <v-avatar v-if="icon" color="surface-soft" rounded="lg" size="44">
        <v-icon color="primary">{{ icon }}</v-icon>
      </v-avatar>
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">{{ title }}</h1>
        <p v-if="subtitle" class="text-medium-emphasis ma-0">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="d-flex align-center ga-2 flex-wrap">
      <slot name="actions" />
    </div>
  </div>
</template>
