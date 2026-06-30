<script setup lang="ts">
const { locale, setLocale } = useI18n();
const isOpen = ref(false);
const switcherRef = ref<HTMLElement | null>(null);

const options = [
  { code: 'vi', label: 'Tieng Viet', flag: 'VI' },
  { code: 'en', label: 'English', flag: 'EN' },
] as const;

const current = computed(() => options.find((option) => option.code === locale.value) ?? options[0]);

function choose(code: 'vi' | 'en') {
  setLocale(code);
  isOpen.value = false;
}

function closeOnOutsideClick(event: MouseEvent) {
  if (!switcherRef.value?.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closeOnOutsideClick);
});
</script>

<template>
  <div ref="switcherRef" class="relative inline-flex">
    <button
      type="button"
      class="inline-flex h-9 items-center gap-2 rounded-md border border-transparent px-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click.stop="isOpen = !isOpen"
      @keydown.escape.stop="isOpen = false"
    >
      <span class="text-xs font-bold text-slate-500">{{ current.flag }}</span>
      <span>{{ current.code.toUpperCase() }}</span>
      <AppIcon name="mdi-chevron-down" :size="16" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg"
      role="menu"
      @keydown.escape.stop="isOpen = false"
    >
      <button
        v-for="option in options"
        :key="option.code"
        type="button"
        class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
        :class="{ 'bg-blue-50 text-blue-700': option.code === locale }"
        role="menuitemradio"
        :aria-checked="option.code === locale"
        @click="choose(option.code)"
      >
        <span class="w-6 text-xs font-bold text-slate-500">{{ option.flag }}</span>
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
