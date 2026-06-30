<script setup lang="ts">
defineOptions({ inheritAttrs: false });

type SelectValue = string | number;
type SelectItem = SelectValue | { value: SelectValue; title: string; disabled?: boolean };

const props = withDefaults(defineProps<{
  modelValue?: SelectValue | null;
  items?: SelectItem[];
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  id?: string;
  name?: string;
}>(), {
  modelValue: '',
  items: () => [],
  label: undefined,
  placeholder: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
  required: false,
  loading: false,
  id: undefined,
  name: undefined,
});

const emit = defineEmits<{ 'update:modelValue': [SelectValue | null] }>();
const attrs = useAttrs();
const generatedId = useId();
const controlId = computed(() => props.id ?? generatedId);
const describedBy = computed(() => props.error || props.hint ? `${controlId.value}-support` : undefined);
const normalizedItems = computed(() => props.items.map((item) => (
  typeof item === 'object'
    ? item
    : { value: item, title: String(item), disabled: false }
)));

function updateValue(raw: string) {
  const match = normalizedItems.value.find((item) => String(item.value) === raw);
  emit('update:modelValue', match ? match.value : raw);
}
</script>

<template>
  <label class="grid min-w-0 gap-1.5" :for="controlId">
    <span v-if="label || $slots.label" class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="text-red-600" aria-hidden="true">*</span>
    </span>
    <span class="relative block min-w-0">
      <select
        v-bind="attrs"
        :id="controlId"
        :name="name"
        :value="modelValue ?? ''"
        :disabled="disabled || loading"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="[
          'min-h-11 w-full appearance-none rounded-[var(--st-radius)] border bg-white px-3 py-2 pr-10 text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-text)] outline-none transition focus:border-[var(--st-primary)] focus:ring-2 focus:ring-blue-100 disabled:opacity-60',
          error ? 'border-red-400' : 'border-[var(--st-border)]',
        ]"
        @change="updateValue(($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option v-for="item in normalizedItems" :key="String(item.value)" :value="item.value" :disabled="item.disabled">
          {{ item.title }}
        </option>
      </select>
      <span class="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-slate-500">
        <UiSpinner v-if="loading" />
        <AppIcon v-else name="mdi-chevron-down" :size="18" />
      </span>
    </span>
    <span v-if="error || hint" :id="`${controlId}-support`" :class="['text-sm font-normal leading-[var(--st-leading-copy)]', error ? 'text-red-600' : 'text-[var(--st-muted)]']">
      {{ error || hint }}
    </span>
  </label>
</template>
