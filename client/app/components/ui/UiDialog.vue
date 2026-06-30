<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  labelledBy?: string;
}>(), {
  title: undefined,
  size: 'md',
  closeOnEscape: true,
  closeOnBackdrop: true,
  labelledBy: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [boolean];
  close: [];
}>();

const panelRef = ref<HTMLElement | null>(null);
const openerRef = ref<HTMLElement | null>(null);
const titleId = useId();

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEscape) {
    event.preventDefault();
    close();
  }
}

function onBackdrop() {
  if (props.closeOnBackdrop) close();
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    openerRef.value = document.activeElement as HTMLElement | null;
    await nextTick();
    panelRef.value?.focus();
    window.addEventListener('keydown', onKeydown);
  } else {
    window.removeEventListener('keydown', onKeydown);
    openerRef.value?.focus?.();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[3000] grid place-items-center p-4" role="presentation">
      <div class="absolute inset-0 bg-slate-950/45" aria-hidden="true" @click="onBackdrop" />
      <section
        ref="panelRef"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="labelledBy ?? titleId"
        :class="['relative grid max-h-[calc(100vh-32px)] w-full overflow-hidden rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white shadow-2xl outline-none', sizeClass[size]]"
      >
        <header class="flex min-w-0 items-start justify-between gap-4 border-b border-[var(--st-border)] px-5 py-4">
          <div class="min-w-0">
            <h2 :id="titleId" class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
              <slot name="title">{{ title }}</slot>
            </h2>
            <div v-if="$slots.description" class="mt-1 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
              <slot name="description" />
            </div>
          </div>
          <slot name="close">
            <UiIconButton label="Close dialog" icon="mdi-close" size="compact" @click="close" />
          </slot>
        </header>
        <div class="min-h-0 overflow-y-auto px-5 py-4">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="border-t border-[var(--st-border)] px-5 py-4">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>
