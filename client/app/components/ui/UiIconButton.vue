<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string;
  icon?: string;
  size?: 'md' | 'compact';
  variant?: 'ghost' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  icon: undefined,
  size: 'md',
  variant: 'ghost',
  loading: false,
  disabled: false,
  type: 'button',
});

const emit = defineEmits<{ click: [MouseEvent] }>();

const sizeClass = {
  md: 'h-11 w-11',
  compact: 'h-9 w-9',
};

const variantClass = {
  ghost: 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100',
  secondary: 'border-[var(--st-border)] bg-white text-[var(--st-text)] hover:bg-slate-50',
  danger: 'border-transparent bg-red-50 text-red-700 hover:bg-red-100',
};

const isInactive = computed(() => props.disabled || props.loading);
</script>

<template>
  <button
    :type="type"
    :aria-label="label"
    :disabled="isInactive"
    :class="[
      'inline-flex shrink-0 items-center justify-center rounded-[var(--st-radius)] border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:opacity-50',
      sizeClass[size],
      variantClass[variant],
    ]"
    @click="(event) => !isInactive && emit('click', event)"
  >
    <UiSpinner v-if="loading" />
    <slot v-else>
      <AppIcon v-if="icon" :name="icon" :size="size === 'compact' ? 18 : 20" />
    </slot>
  </button>
</template>
