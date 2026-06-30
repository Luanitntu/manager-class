<script setup lang="ts">
withDefaults(defineProps<{
  divided?: boolean;
}>(), {
  divided: true,
});
</script>

<template>
  <ul :class="['min-w-0 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white', divided ? 'divide-y divide-[var(--st-border)]' : '']">
    <slot />
  </ul>
</template>
