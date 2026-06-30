<script setup lang="ts">
withDefaults(defineProps<{ image?: string | null }>(), { image: null });
</script>

<template>
  <div class="flex min-h-screen bg-[var(--st-bg-soft)] text-[var(--st-text)]">
    <aside
      class="relative hidden min-h-screen flex-1 overflow-hidden bg-[var(--st-primary)] bg-cover bg-center lg:block"
      :style="image ? { backgroundImage: `url(${image})` } : undefined"
    >
      <div
        class="absolute inset-0"
        :class="image ? 'bg-gradient-to-br from-slate-950/55 to-slate-950/75' : 'bg-gradient-to-br from-blue-700 via-[var(--st-primary)] to-[var(--st-secondary)]'"
      />
      <div class="absolute inset-0 z-10 flex flex-col justify-end p-12 text-white">
        <slot name="aside" />
      </div>
    </aside>

    <section class="flex min-h-screen flex-1 items-center justify-center px-6 py-24 sm:px-8 lg:px-12">
      <div class="w-full max-w-[400px]">
        <div class="mb-8 flex min-w-0 items-center gap-2">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--st-radius)] bg-[var(--st-primary)] text-white">
            <AppIcon name="mdi-school" :size="22" />
          </span>
          <span class="min-w-0 truncate text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
            Schedule Teacher
          </span>
        </div>
        <slot />
      </div>
    </section>
  </div>
</template>
