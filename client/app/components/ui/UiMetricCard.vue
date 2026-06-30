<script setup lang="ts">
withDefaults(defineProps<{
  label?: string;
  value?: string | number;
  hint?: string;
  framed?: boolean;
}>(), {
  label: undefined,
  value: undefined,
  hint: undefined,
  framed: true,
});
</script>

<template>
  <div :class="['min-w-0', framed ? 'rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-4' : '']">
    <div class="flex min-w-0 items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
          <slot name="label">{{ label }}</slot>
        </div>
        <div class="mt-1 break-words text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
          <slot name="value">{{ value }}</slot>
        </div>
      </div>
      <div v-if="$slots.icon" class="shrink-0 text-[var(--st-primary)]">
        <slot name="icon" />
      </div>
    </div>
    <div v-if="hint || $slots.hint || $slots.trend" class="mt-2 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
      <slot name="hint">{{ hint }}</slot>
      <slot name="trend" />
    </div>
  </div>
</template>
