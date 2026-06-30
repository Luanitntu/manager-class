<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md';
}>(), {
  size: 'sm',
});

const sizeClass = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};
</script>

<template>
  <span
    :class="['inline-block animate-spin rounded-full border-2 border-current border-r-transparent', sizeClass[size]]"
    aria-hidden="true"
  />
</template>
