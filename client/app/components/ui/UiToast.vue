<script setup lang="ts">
type ToastTone = 'success' | 'error' | 'warning' | 'info';

const props = withDefaults(defineProps<{
  type?: ToastTone;
  title?: string;
  message: string;
  dismissLabel?: string;
}>(), {
  type: 'info',
  title: undefined,
  dismissLabel: 'Dismiss notification',
});

const emit = defineEmits<{ dismiss: [] }>();

const toneClass: Record<ToastTone, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  warning: 'border-l-orange-500',
  info: 'border-l-[var(--st-primary)]',
};

const iconClass: Record<ToastTone, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  error: 'bg-red-50 text-red-600',
  warning: 'bg-orange-50 text-orange-600',
  info: 'bg-blue-50 text-[var(--st-primary)]',
};

const iconName: Record<ToastTone, string> = {
  success: 'mdi-check-circle-outline',
  error: 'mdi-alert-circle-outline',
  warning: 'mdi-alert-outline',
  info: 'mdi-information-outline',
};
</script>

<template>
  <article
    :class="['grid min-h-[72px] w-[min(360px,calc(100vw-32px))] grid-cols-[36px_minmax(0,1fr)_28px] items-start gap-3 rounded-[var(--st-radius)] border border-l-4 border-[var(--st-border)] bg-white px-3 py-3.5 text-[var(--st-text)] shadow-lg', toneClass[type]]"
    :role="props.type === 'error' ? 'alert' : 'status'"
  >
    <span :class="['inline-flex h-9 w-9 items-center justify-center rounded-[var(--st-radius)]', iconClass[type]]" aria-hidden="true">
      <AppIcon :name="iconName[type]" :size="20" />
    </span>
    <span class="grid min-w-0 gap-0.5">
      <strong v-if="title" class="text-sm font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">{{ title }}</strong>
      <span class="text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">{{ message }}</span>
    </span>
    <button
      type="button"
      :aria-label="dismissLabel"
      class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-[var(--st-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
      @click="emit('dismiss')"
    >
      <AppIcon name="mdi-close" :size="18" />
    </button>
  </article>
</template>
