<script setup lang="ts">
type StatusTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

withDefaults(defineProps<{
  tone?: StatusTone;
  label?: string;
}>(), {
  tone: 'neutral',
  label: undefined,
});

const toneClass: Record<StatusTone, string> = {
  neutral: 'bg-slate-400',
  primary: 'bg-[var(--st-primary)]',
  info: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-orange-500',
  danger: 'bg-red-500',
};
</script>

<template>
  <span class="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--st-text)]">
    <span :class="['h-2.5 w-2.5 shrink-0 rounded-full', toneClass[tone]]" aria-hidden="true" />
    <span class="min-w-0"><slot>{{ label }}</slot></span>
  </span>
</template>
