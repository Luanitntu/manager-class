<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  src: null,
  alt: '',
  name: '',
  size: 'md',
});

const sizeClass = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-xl',
};

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0]?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}` : parts[0]?.slice(0, 2) ?? 'U').toUpperCase();
});
</script>

<template>
  <span :class="['inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--st-primary)] font-semibold text-white', sizeClass[size]]">
    <img v-if="src" :src="src" :alt="alt || name" class="h-full w-full object-cover">
    <span v-else>{{ initials }}</span>
  </span>
</template>
