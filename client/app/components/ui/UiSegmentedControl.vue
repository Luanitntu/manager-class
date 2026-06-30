<script setup lang="ts">
type SegmentedValue = string | number;
type SegmentedItem = { value: SegmentedValue; label: string; disabled?: boolean };

withDefaults(defineProps<{
  modelValue?: SegmentedValue;
  items: SegmentedItem[];
  label?: string;
}>(), {
  modelValue: undefined,
  label: undefined,
});

const emit = defineEmits<{ 'update:modelValue': [SegmentedValue] }>();
</script>

<template>
  <div class="min-w-0" role="group" :aria-label="label">
    <div class="inline-flex min-h-11 max-w-full flex-wrap rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-1">
      <button
        v-for="item in items"
        :key="String(item.value)"
        type="button"
        :disabled="item.disabled"
        :aria-pressed="modelValue === item.value"
        :class="[
          'min-h-9 min-w-0 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:opacity-50',
          modelValue === item.value ? 'bg-[var(--st-primary)] text-white shadow-sm' : 'text-[var(--st-muted)] hover:bg-slate-50',
        ]"
        @click="emit('update:modelValue', item.value)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
