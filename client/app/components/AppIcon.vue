<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string;
  size?: number | string;
  decorative?: boolean;
  label?: string;
}>(), {
  size: 20,
  decorative: true,
  label: undefined,
});

const safeName = computed(() => {
  const raw = props.name.trim().split(/\s+/)[0] ?? '';
  const normalized = raw.startsWith('mdi-') ? raw : `mdi-${raw.replace(/^mdi/, '')}`;
  return normalized.toLowerCase().replace(/[^a-z0-9-]/g, '');
});

const iconClasses = computed(() => ['mdi', safeName.value]);
const iconLabel = computed(() => props.label || safeName.value.replace(/^mdi-/, '').replace(/-/g, ' '));
const iconSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size));
</script>

<template>
  <i
    :class="iconClasses"
    :style="{ fontSize: iconSize, width: iconSize, height: iconSize, lineHeight: iconSize }"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="decorative ? undefined : iconLabel"
    :role="decorative ? undefined : 'img'"
  />
</template>
