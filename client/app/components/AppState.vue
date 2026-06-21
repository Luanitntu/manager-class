<script setup lang="ts">
type AppStateVariant = 'loading' | 'empty' | 'error' | 'forbidden' | 'success';

const props = withDefaults(defineProps<{
  variant: AppStateVariant;
  title?: string;
  body?: string;
  icon?: string;
  actionLabel?: string;
  skeletonLines?: number;
}>(), {
  skeletonLines: 3,
});

const emit = defineEmits<{ action: [] }>();

const defaults = computed(() => {
  switch (props.variant) {
    case 'loading':
      return { icon: 'mdi-progress-clock', title: 'Loading', body: 'Preparing your data...' };
    case 'error':
      return { icon: 'mdi-alert-circle-outline', title: 'Could not load this', body: 'Try again, or contact support if it keeps happening.' };
    case 'forbidden':
      return { icon: 'mdi-lock-outline', title: 'Not available for your role', body: 'This section is not available with your current access.' };
    case 'success':
      return { icon: 'mdi-check-circle-outline', title: 'All set', body: 'Your changes were saved.' };
    default:
      return { icon: 'mdi-school-outline', title: 'Nothing here yet', body: 'When data is available, it will appear here.' };
  }
});

const color = computed(() => {
  if (props.variant === 'error') return 'error';
  if (props.variant === 'forbidden') return 'warning';
  if (props.variant === 'success') return 'success';
  return 'primary';
});
</script>

<template>
  <v-card class="pa-6 pa-sm-8 text-center st-card-soft">
    <template v-if="variant === 'loading'">
      <v-progress-linear color="primary" indeterminate rounded class="mb-6" />
      <v-skeleton-loader type="heading" class="mx-auto mb-2" max-width="320" />
      <v-skeleton-loader
        v-for="line in skeletonLines"
        :key="line"
        type="text"
        class="mx-auto"
        max-width="520"
      />
    </template>

    <template v-else>
      <v-avatar :color="color" rounded="lg" size="56" class="mb-4">
        <v-icon color="white" size="30">{{ icon ?? defaults.icon }}</v-icon>
      </v-avatar>
      <h2 class="text-subtitle-1 font-weight-bold mb-2">{{ title ?? defaults.title }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-4 mx-auto" style="max-width: 520px">
        {{ body ?? defaults.body }}
      </p>
      <v-btn v-if="actionLabel" color="primary" variant="flat" @click="emit('action')">
        {{ actionLabel }}
      </v-btn>
    </template>
  </v-card>
</template>
