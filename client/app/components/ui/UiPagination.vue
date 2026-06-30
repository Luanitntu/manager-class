<script setup lang="ts">
import type { PaginationMeta } from '~/composables/useApi';

const props = defineProps<{
  meta: PaginationMeta;
  rangeLabel?: string;
  perPageLabel?: string;
  ariaLabel?: string;
}>();

const page = defineModel<number>('page', { required: true });
const limit = defineModel<number>('limit', { required: true });
const { t } = useI18n();

const from = computed(() => (props.meta.total === 0 ? 0 : (props.meta.page - 1) * props.meta.limit + 1));
const to = computed(() => Math.min(props.meta.page * props.meta.limit, props.meta.total));
const totalPages = computed(() => Math.max(props.meta.totalPages, 1));
const canGoPrevious = computed(() => page.value > 1);
const canGoNext = computed(() => page.value < totalPages.value);
const sizeItems = computed(() =>
  Array.from(new Set([limit.value, 10, 20, 30, 40, 50])).sort((a, b) => a - b),
);
const rangeText = computed(() =>
  props.rangeLabel ?? t('pager.showing', { from: from.value, to: to.value, total: props.meta.total }),
);
const perPageText = computed(() => props.perPageLabel ?? t('pager.perPage'));

function goToPage(nextPage: number) {
  page.value = Math.min(Math.max(nextPage, 1), totalPages.value);
}
</script>

<template>
  <div class="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
    <div class="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-[var(--st-muted)]">
      <span>{{ rangeText }}</span>
      <UiSelect
        v-model="limit"
        class="w-24"
        :items="sizeItems"
        aria-label="Rows per page"
      />
      <span>{{ perPageText }}</span>
    </div>

    <nav
      v-if="meta.totalPages > 1"
      class="flex items-center gap-2"
      :aria-label="ariaLabel ?? 'Pagination'"
    >
      <UiButton
        variant="secondary"
        size="sm"
        :disabled="!canGoPrevious"
        aria-label="Previous page"
        @click="goToPage(page - 1)"
      >
        <template #leading>
          <AppIcon name="mdi-chevron-left" :size="18" />
        </template>
      </UiButton>
      <span class="min-w-24 text-center text-sm font-semibold text-slate-600">
        {{ page }} / {{ meta.totalPages }}
      </span>
      <UiButton
        variant="secondary"
        size="sm"
        :disabled="!canGoNext"
        aria-label="Next page"
        @click="goToPage(page + 1)"
      >
        <template #leading>
          <AppIcon name="mdi-chevron-right" :size="18" />
        </template>
      </UiButton>
    </nav>
  </div>
</template>
