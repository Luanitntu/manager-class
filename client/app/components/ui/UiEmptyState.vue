<script setup lang="ts">
defineProps<{
  heading?: string;
  body?: string;
  icon?: string;
}>();
</script>

<template>
  <div class="grid min-w-0 place-items-center rounded-[var(--st-radius)] border border-dashed border-[var(--st-border)] bg-white px-6 py-10 text-center">
    <div v-if="icon || $slots.icon" class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
      <slot name="icon">
        <AppIcon v-if="icon" :name="icon" :size="24" />
      </slot>
    </div>
    <h3 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
      <slot name="heading">{{ heading }}</slot>
    </h3>
    <p class="mt-2 max-w-md text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
      <slot name="body">{{ body }}</slot>
    </p>
    <div v-if="$slots.actions" class="mt-5 flex flex-wrap justify-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
