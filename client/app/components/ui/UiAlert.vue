<script setup lang="ts">
type AlertTone = 'info' | 'success' | 'warning' | 'error';

withDefaults(defineProps<{
  tone?: AlertTone;
  title?: string;
  icon?: string;
}>(), {
  tone: 'info',
  title: undefined,
  icon: undefined,
});

const toneClass: Record<AlertTone, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-orange-200 bg-orange-50 text-orange-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

const iconName: Record<AlertTone, string> = {
  info: 'mdi-information-outline',
  success: 'mdi-check-circle-outline',
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
};
</script>

<template>
  <div :class="['flex min-w-0 gap-3 rounded-[var(--st-radius)] border px-4 py-3', toneClass[tone]]" :role="tone === 'error' ? 'alert' : 'status'">
    <slot name="icon">
      <AppIcon :name="icon ?? iconName[tone]" :size="20" class="mt-0.5 shrink-0" />
    </slot>
    <div class="min-w-0">
      <div v-if="title || $slots.title" class="text-sm font-semibold leading-[var(--st-leading-copy)]">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="text-sm font-normal leading-[var(--st-leading-copy)]">
        <slot />
      </div>
    </div>
  </div>
</template>
