<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const props = withDefaults(defineProps<{
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  to?: string | Record<string, unknown>;
  leadingIcon?: string;
  trailingIcon?: string;
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  to: undefined,
  leadingIcon: undefined,
  trailingIcon: undefined,
});

const emit = defineEmits<{ click: [MouseEvent] }>();

const variantClass: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-[var(--st-primary)] text-white hover:bg-[var(--st-primary-dark)]',
  secondary: 'border-[var(--st-border)] bg-white text-[var(--st-text)] hover:bg-slate-50',
  ghost: 'border-transparent bg-transparent text-[var(--st-primary)] hover:bg-blue-50',
  danger: 'border-transparent bg-red-600 text-white hover:bg-red-700',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
  icon: 'h-11 w-11 p-0 text-sm',
};

const isInactive = computed(() => props.disabled || props.loading);

function onClick(event: MouseEvent) {
  if (isInactive.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :aria-disabled="isInactive ? 'true' : undefined"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-[var(--st-radius)] border font-semibold leading-[var(--st-leading-copy)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:opacity-50',
      'min-w-0',
      variantClass[variant],
      sizeClass[size],
      isInactive ? 'pointer-events-none opacity-50' : '',
    ]"
    @click="onClick"
  >
    <UiSpinner v-if="loading" />
    <slot v-else name="leading">
      <AppIcon v-if="leadingIcon" :name="leadingIcon" :size="18" />
    </slot>
    <span v-if="$slots.default" class="min-w-0">
      <slot />
    </span>
    <slot name="trailing">
      <AppIcon v-if="trailingIcon" :name="trailingIcon" :size="18" />
    </slot>
  </NuxtLink>

  <button
    v-else
    :type="type"
    :disabled="isInactive"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-[var(--st-radius)] border font-semibold leading-[var(--st-leading-copy)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:opacity-50',
      'min-w-0',
      variantClass[variant],
      sizeClass[size],
    ]"
    @click="onClick"
  >
    <UiSpinner v-if="loading" />
    <slot v-else name="leading">
      <AppIcon v-if="leadingIcon" :name="leadingIcon" :size="18" />
    </slot>
    <span v-if="$slots.default" class="min-w-0">
      <slot />
    </span>
    <slot name="trailing">
      <AppIcon v-if="trailingIcon" :name="trailingIcon" :size="18" />
    </slot>
  </button>
</template>
