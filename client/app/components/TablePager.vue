<script setup lang="ts">
import type { PaginationMeta } from '~/composables/useApi';

const props = defineProps<{ meta: PaginationMeta }>();
const page = defineModel<number>('page', { required: true });
const limit = defineModel<number>('limit', { required: true });
const { t } = useI18n();

const from = computed(() => (props.meta.total === 0 ? 0 : (props.meta.page - 1) * props.meta.limit + 1));
const to = computed(() => Math.min(props.meta.page * props.meta.limit, props.meta.total));
const canGoPrevious = computed(() => page.value > 1);
const canGoNext = computed(() => page.value < props.meta.totalPages);

// Standard sizes, plus the component's current size so its default always shows.
const sizeItems = computed(() =>
  Array.from(new Set([limit.value, 10, 20, 30, 40, 50])).sort((a, b) => a - b),
);

function goToPage(nextPage: number) {
  page.value = Math.min(Math.max(nextPage, 1), Math.max(props.meta.totalPages, 1));
}
</script>

<template>
  <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
      <span>{{ t('pager.showing', { from, to, total: meta.total }) }}</span>
      <select
        v-model.number="limit"
        class="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        aria-label="Rows per page"
      >
        <option v-for="size in sizeItems" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
      <span>{{ t('pager.perPage') }}</span>
    </div>

    <nav
      v-if="meta.totalPages > 1"
      class="flex items-center gap-2"
      aria-label="Pagination"
    >
      <button
        type="button"
        class="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-45"
        :disabled="!canGoPrevious"
        aria-label="Previous page"
        @click="goToPage(page - 1)"
      >
        <AppIcon name="mdi-chevron-left" :size="18" />
      </button>
      <span class="min-w-24 text-center text-sm font-semibold text-slate-600">
        {{ page }} / {{ meta.totalPages }}
      </span>
      <button
        type="button"
        class="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-45"
        :disabled="!canGoNext"
        aria-label="Next page"
        @click="goToPage(page + 1)"
      >
        <AppIcon name="mdi-chevron-right" :size="18" />
      </button>
    </nav>
  </div>
</template>
