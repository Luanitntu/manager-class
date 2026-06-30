<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: boolean;
  label?: string;
  description?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}>(), {
  modelValue: false,
  label: undefined,
  description: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
  id: undefined,
  name: undefined,
});

const emit = defineEmits<{ 'update:modelValue': [boolean] }>();
const generatedId = useId();
const controlId = computed(() => props.id ?? generatedId);
</script>

<template>
  <label class="flex min-w-0 items-start gap-3" :for="controlId">
    <input
      :id="controlId"
      :name="name"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="mt-1 h-4 w-4 rounded border-[var(--st-border)] text-[var(--st-primary)] focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span class="min-w-0">
      <span class="block text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
        <slot name="label">{{ label }}</slot>
      </span>
      <span v-if="description || hint || error || $slots.description" :class="['block text-sm leading-[var(--st-leading-copy)]', error ? 'text-red-600' : 'text-[var(--st-muted)]']">
        <slot name="description">{{ error || description || hint }}</slot>
      </span>
    </span>
  </label>
</template>
