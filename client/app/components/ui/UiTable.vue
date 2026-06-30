<script setup lang="ts">
defineProps<{
  caption?: string;
  empty?: boolean;
}>();
</script>

<template>
  <div class="min-w-0 overflow-hidden rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white">
    <div class="w-full overflow-x-auto">
      <table class="min-w-full border-collapse text-left text-sm text-[var(--st-text)]">
        <caption v-if="caption || $slots.caption" class="sr-only">
          <slot name="caption">{{ caption }}</slot>
        </caption>
        <slot />
      </table>
    </div>
    <div v-if="empty || $slots.empty" class="px-4 py-8 text-center text-sm font-normal text-[var(--st-muted)]">
      <slot name="empty" />
    </div>
  </div>
</template>
