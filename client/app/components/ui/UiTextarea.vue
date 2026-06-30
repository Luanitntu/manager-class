<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  modelValue?: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  rows?: number;
}>(), {
  modelValue: '',
  label: undefined,
  placeholder: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
  required: false,
  id: undefined,
  name: undefined,
  rows: 3,
});

const emit = defineEmits<{ 'update:modelValue': [string] }>();
const attrs = useAttrs();
const generatedId = useId();
const controlId = computed(() => props.id ?? generatedId);
const describedBy = computed(() => props.error || props.hint ? `${controlId.value}-support` : undefined);
</script>

<template>
  <label class="grid min-w-0 gap-1.5" :for="controlId">
    <span v-if="label || $slots.label" class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="text-red-600" aria-hidden="true">*</span>
    </span>
    <textarea
      v-bind="attrs"
      :id="controlId"
      :name="name"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      :class="[
        'min-h-24 w-full rounded-[var(--st-radius)] border bg-white px-3 py-2 text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--st-primary)] focus:ring-2 focus:ring-blue-100 disabled:opacity-60',
        error ? 'border-red-400' : 'border-[var(--st-border)]',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <span v-if="error || hint" :id="`${controlId}-support`" :class="['text-sm font-normal leading-[var(--st-leading-copy)]', error ? 'text-red-600' : 'text-[var(--st-muted)]']">
      {{ error || hint }}
    </span>
  </label>
</template>
