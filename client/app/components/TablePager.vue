<script setup lang="ts">
import type { PaginationMeta } from '~/composables/useApi';

const props = defineProps<{ meta: PaginationMeta }>();
const page = defineModel<number>('page', { required: true });
const limit = defineModel<number>('limit', { required: true });
const { t } = useI18n();

const from = computed(() => (props.meta.total === 0 ? 0 : (props.meta.page - 1) * props.meta.limit + 1));
const to = computed(() => Math.min(props.meta.page * props.meta.limit, props.meta.total));

// Standard sizes, plus the component's current size so its default always shows.
const sizeItems = computed(() =>
  Array.from(new Set([limit.value, 10, 20, 30, 40, 50])).sort((a, b) => a - b),
);
</script>

<template>
  <div class="d-flex align-center justify-space-between flex-wrap ga-3 mt-4">
    <div class="d-flex align-center ga-2 text-caption text-medium-emphasis">
      <span>{{ t('pager.showing', { from, to, total: meta.total }) }}</span>
      <v-select
        :model-value="limit"
        :items="sizeItems"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 88px"
        @update:model-value="limit = $event"
      />
      <span>{{ t('pager.perPage') }}</span>
    </div>
    <v-pagination
      v-if="meta.totalPages > 1"
      :model-value="page"
      :length="meta.totalPages"
      :total-visible="7"
      density="comfortable"
      @update:model-value="page = $event"
    />
  </div>
</template>
