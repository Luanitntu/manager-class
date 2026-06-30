<script setup lang="ts">
withDefaults(defineProps<{
  as?: string;
}>(), {
  as: 'li',
});
</script>

<template>
  <component :is="as" class="flex min-h-14 min-w-0 items-center gap-3 px-4 py-3">
    <div v-if="$slots.leading" class="shrink-0">
      <slot name="leading" />
    </div>
    <div class="min-w-0 flex-1">
      <div v-if="$slots.default" class="min-w-0 text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)]">
        <slot />
      </div>
      <div v-if="$slots.subtitle || $slots.meta" class="mt-0.5 min-w-0 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
        <slot name="subtitle" />
        <slot name="meta" />
      </div>
    </div>
    <div v-if="$slots.trailing || $slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="trailing" />
      <slot name="actions" />
    </div>
  </component>
</template>
