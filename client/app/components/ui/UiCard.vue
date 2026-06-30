<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'soft' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}>(), {
  variant: 'default',
  padding: 'md',
});

const variantClass = {
  default: 'border border-[var(--st-border)] bg-[var(--st-surface)] shadow-sm',
  soft: 'border border-blue-100 bg-[var(--st-bg-soft)]',
  outlined: 'border border-[var(--st-border)] bg-transparent',
};

const paddingClass = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};
</script>

<template>
  <article :class="['min-w-0 rounded-[var(--st-radius)]', variantClass[variant], paddingClass[padding]]">
    <slot />
  </article>
</template>
