<script setup lang="ts">
withDefaults(defineProps<{
  width?: 'default' | 'narrow' | 'wide' | 'full';
  padding?: 'none' | 'sm' | 'md';
}>(), {
  width: 'default',
  padding: 'md',
});

const widthClass = {
  default: 'max-w-[var(--st-content-max)]',
  narrow: 'max-w-4xl',
  wide: 'max-w-[1600px]',
  full: 'max-w-none',
};

const paddingClass = {
  none: '',
  sm: 'px-4 py-4 sm:px-6',
  md: 'px-4 py-6 sm:px-6 lg:px-8',
};
</script>

<template>
  <div :class="['mx-auto w-full', widthClass[width], paddingClass[padding]]">
    <slot />
  </div>
</template>
