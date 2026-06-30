<script setup lang="ts">
type SkeletonVariant = 'dashboard' | 'stats' | 'grid' | 'table' | 'list' | 'calendar' | 'form' | 'detail';

withDefaults(defineProps<{
  variant?: SkeletonVariant;
  rows?: number;
  columns?: number;
  cards?: number;
}>(), {
  variant: 'list',
  rows: 5,
  columns: 4,
  cards: 6,
});

const block = 'block animate-pulse rounded-[var(--st-radius)] bg-slate-200';
</script>

<template>
  <div class="grid w-full gap-4" aria-hidden="true">
    <template v-if="variant === 'dashboard'">
      <div class="grid min-h-64 gap-3 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-8">
        <span :class="[block, 'h-7 w-36']" />
        <strong :class="[block, 'h-10 w-[min(520px,70%)]']" />
        <span :class="[block, 'h-4 w-[min(680px,90%)]']" />
        <span :class="[block, 'h-4 w-[min(420px,72%)]']" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="item in 4" :key="item" class="grid min-h-36 gap-3 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-5">
          <i :class="[block, 'h-11 w-11']" />
          <strong :class="[block, 'h-6 w-2/3']" />
          <span :class="[block, 'h-3 w-1/2']" />
        </article>
      </div>
    </template>

    <template v-else-if="variant === 'stats' || variant === 'grid'">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="item in cards" :key="item" class="grid min-h-36 gap-3 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-5">
          <i :class="[block, 'h-11 w-11']" />
          <strong :class="[block, 'h-6 w-2/3']" />
          <span :class="[block, 'h-3 w-1/2']" />
          <span v-if="variant === 'grid'" :class="[block, 'h-3 w-3/4']" />
        </article>
      </div>
    </template>

    <template v-else-if="variant === 'table'">
      <div class="rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-4">
        <div :class="[block, 'mb-4 h-14 w-full']" />
        <div class="grid gap-0">
          <div v-for="row in rows" :key="row" class="grid min-h-12 gap-3 border-t border-slate-100 py-3" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
            <span v-for="col in columns" :key="col" :class="[block, 'h-4 w-full']" />
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'calendar'">
      <div class="rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-4">
        <div :class="[block, 'mb-4 h-14 w-full']" />
        <div class="grid grid-cols-7 gap-px">
          <span v-for="item in 35" :key="item" :class="[block, 'h-24 rounded-none']" />
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'form'">
      <div class="grid gap-4 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-5">
        <span v-for="item in rows" :key="item" :class="[block, 'h-11 w-full']" />
      </div>
    </template>

    <template v-else-if="variant === 'detail'">
      <div class="grid gap-4 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-5">
        <div class="flex items-center gap-3">
          <i :class="[block, 'h-12 w-12']" />
          <div class="grid flex-1 gap-2">
            <strong :class="[block, 'h-5 w-1/2']" />
            <span :class="[block, 'h-3 w-1/3']" />
          </div>
        </div>
        <span v-for="item in rows" :key="item" :class="[block, 'h-10 w-full']" />
      </div>
    </template>

    <template v-else>
      <article v-for="item in rows" :key="item" class="flex min-h-20 items-center gap-3 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-4">
        <i :class="[block, 'h-11 w-11 shrink-0']" />
        <div class="grid flex-1 gap-2">
          <strong :class="[block, 'h-5 w-1/2']" />
          <span :class="[block, 'h-3 w-2/3']" />
        </div>
      </article>
    </template>
  </div>
</template>
