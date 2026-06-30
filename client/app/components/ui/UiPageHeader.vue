<script setup lang="ts">
defineProps<{
  title?: string;
  eyebrow?: string;
  subtitle?: string;
}>();
</script>

<template>
  <header class="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="min-w-0">
      <p v-if="eyebrow || $slots.eyebrow" class="mb-1 text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-primary)]">
        <slot name="eyebrow">{{ eyebrow }}</slot>
      </p>
      <h1 v-if="title || $slots.title" class="text-[var(--st-text-page-title)] font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="subtitle || $slots.subtitle" class="mt-2 max-w-3xl text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
      <slot />
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
