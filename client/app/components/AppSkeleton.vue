<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'dashboard' | 'stats' | 'grid' | 'table' | 'list' | 'calendar' | 'form' | 'detail';
  rows?: number;
  columns?: number;
  cards?: number;
}>(), {
  variant: 'list',
  rows: 5,
  columns: 4,
  cards: 6,
});
</script>

<template>
  <UiSkeleton :variant="variant" :rows="rows" :columns="columns" :cards="cards" />
</template>
