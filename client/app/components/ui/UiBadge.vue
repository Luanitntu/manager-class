<script setup lang="ts">
type BadgeTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md';

withDefaults(defineProps<{
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: string;
}>(), {
  tone: 'neutral',
  size: 'sm',
  icon: undefined,
});

const toneClass: Record<BadgeTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  primary: 'border-blue-200 bg-blue-50 text-blue-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-orange-200 bg-orange-50 text-orange-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

const sizeClass: Record<BadgeSize, string> = {
  sm: 'min-h-7 px-2 text-xs',
  md: 'min-h-8 px-2.5 text-sm',
};
</script>

<template>
  <span :class="['inline-flex max-w-full items-center gap-1 rounded-[var(--st-radius)] border font-semibold leading-[var(--st-leading-copy)]', toneClass[tone], sizeClass[size]]">
    <slot name="icon">
      <AppIcon v-if="icon" :name="icon" :size="size === 'sm' ? 14 : 16" />
    </slot>
    <span class="min-w-0 truncate"><slot /></span>
  </span>
</template>
