<script setup lang="ts">
withDefaults(defineProps<{
  align?: 'start' | 'center' | 'end' | 'between';
}>(), {
  align: 'between',
});

const alignClass = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};
</script>

<template>
  <div :class="['flex min-w-0 flex-wrap items-center gap-3', alignClass[align]]">
    <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3">
      <slot />
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
