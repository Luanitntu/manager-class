<script setup lang="ts">
type TabValue = string | number;
type TabItem = { value: TabValue; label: string; disabled?: boolean };

const props = defineProps<{
  modelValue: TabValue;
  items: TabItem[];
  label?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [TabValue] }>();

function select(item: TabItem) {
  if (!item.disabled) emit('update:modelValue', item.value);
}
</script>

<template>
  <div class="min-w-0">
    <div class="flex min-w-0 gap-1 overflow-x-auto border-b border-[var(--st-border)]" role="tablist" :aria-label="props.label">
      <button
        v-for="item in items"
        :key="String(item.value)"
        type="button"
        role="tab"
        :disabled="item.disabled"
        :aria-selected="modelValue === item.value"
        :class="[
          'min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:opacity-50',
          modelValue === item.value ? 'border-[var(--st-primary)] text-[var(--st-primary)]' : 'border-transparent text-[var(--st-muted)] hover:text-[var(--st-text)]',
        ]"
        @click="select(item)"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="min-w-0 py-4">
      <slot />
    </div>
  </div>
</template>
