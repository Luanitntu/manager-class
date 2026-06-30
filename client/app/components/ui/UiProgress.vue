<script setup lang="ts">
const props = withDefaults(defineProps<{
  value?: number;
  max?: number;
  label?: string;
}>(), {
  value: 0,
  max: 100,
  label: undefined,
});

const percent = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(Math.max((props.value / props.max) * 100, 0), 100);
});
</script>

<template>
  <div class="min-w-0">
    <div v-if="label || $slots.label" class="mb-1 text-sm font-semibold text-[var(--st-muted)]">
      <slot name="label">{{ label }}</slot>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" :aria-valuenow="value" aria-valuemin="0" :aria-valuemax="max">
      <div class="h-full rounded-full bg-[var(--st-primary)] transition-[width]" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>
