<script setup lang="ts">
const { toasts, dismiss } = useToast();
</script>

<template>
  <div
    class="pointer-events-none fixed bottom-4 left-4 right-4 z-[3000] sm:bottom-6 sm:left-auto sm:right-6"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup class="grid justify-items-stretch gap-3 sm:justify-items-end" name="app-toast" tag="div">
      <UiToast
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full sm:w-[360px]"
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        dismiss-label="Đóng thông báo"
        @dismiss="dismiss(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>
