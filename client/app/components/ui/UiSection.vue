<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <section class="min-w-0">
    <div v-if="title || description || $slots.title || $slots.description || $slots.actions" class="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h2 v-if="title || $slots.title" class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
          <slot name="title">{{ title }}</slot>
        </h2>
        <p v-if="description || $slots.description" class="mt-1 text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>
