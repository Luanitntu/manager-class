<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  id?: string;
  name?: string;
  autocomplete?: string;
}>(), {
  modelValue: '',
  label: undefined,
  placeholder: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
  required: false,
  type: 'text',
  id: undefined,
  name: undefined,
  autocomplete: undefined,
});

const emit = defineEmits<{ 'update:modelValue': [string | number] }>();
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
    <span class="flex min-h-11 items-center gap-2 rounded-[var(--st-radius)] border bg-white px-3 transition focus-within:border-[var(--st-primary)] focus-within:ring-2 focus-within:ring-blue-100" :class="error ? 'border-red-400' : 'border-[var(--st-border)]'">
      <slot name="leading" />
      <input
        v-bind="attrs"
        :id="controlId"
        :name="name"
        :autocomplete="autocomplete"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        class="min-w-0 flex-1 bg-transparent text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)] outline-none placeholder:text-slate-400 disabled:opacity-60"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <slot name="trailing" />
    </span>
    <span v-if="error || hint" :id="`${controlId}-support`" :class="['text-sm font-normal leading-[var(--st-leading-copy)]', error ? 'text-red-600' : 'text-[var(--st-muted)]']">
      {{ error || hint }}
    </span>
  </label>
</template>
