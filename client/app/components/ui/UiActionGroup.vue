<script setup lang="ts">
withDefaults(defineProps<{
  align?: 'start' | 'end' | 'between';
  stack?: 'mobile' | 'never';
}>(), {
  align: 'end',
  stack: 'mobile',
});

const alignClass = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
};
</script>

<template>
  <div :class="['flex min-w-0 gap-2', stack === 'mobile' ? 'flex-col sm:flex-row sm:items-center' : 'flex-row items-center', alignClass[align]]">
    <slot />
  </div>
</template>
