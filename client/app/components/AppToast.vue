<script setup lang="ts">
import type { ToastType } from '~/composables/useToast';

const { toasts, dismiss } = useToast();

const toastIcons: Record<ToastType, string> = {
  success: 'mdi-check-circle-outline',
  error: 'mdi-alert-circle-outline',
  warning: 'mdi-alert-outline',
  info: 'mdi-information-outline',
};
</script>

<template>
  <div class="app-toast-region" aria-live="polite" aria-atomic="false">
    <TransitionGroup class="app-toast-stack" name="app-toast" tag="div">
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="app-toast"
        :class="`app-toast--${toast.type}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <span class="app-toast__icon" aria-hidden="true">
          <v-icon :icon="toastIcons[toast.type]" size="20" />
        </span>

        <span class="app-toast__content">
          <strong v-if="toast.title">{{ toast.title }}</strong>
          <span>{{ toast.message }}</span>
        </span>

        <button
          class="app-toast__close"
          type="button"
          aria-label="Đóng thông báo"
          @click="dismiss(toast.id)"
        >
          <v-icon icon="mdi-close" size="18" />
        </button>
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.app-toast-region {
  bottom: 24px;
  pointer-events: none;
  position: fixed;
  right: 24px;
  z-index: 3000;
}

.app-toast-stack {
  display: grid;
  gap: 12px;
  justify-items: end;
}

.app-toast {
  --toast-accent: var(--st-primary);
  --toast-soft: var(--st-bg-soft);

  align-items: flex-start;
  background: #fff;
  border: 1px solid var(--st-border);
  border-left: 4px solid var(--toast-accent);
  border-radius: var(--st-radius);
  box-shadow: 0 14px 34px rgb(15 23 42 / 12%);
  color: var(--st-text);
  display: grid;
  gap: 12px;
  grid-template-columns: 36px minmax(0, 1fr) 28px;
  min-height: 72px;
  padding: 14px 12px 14px 14px;
  pointer-events: auto;
  width: min(360px, calc(100vw - 32px));
}

.app-toast--success {
  --toast-accent: #10b981;
  --toast-soft: #ecfdf5;
}

.app-toast--error {
  --toast-accent: #ef4444;
  --toast-soft: #fef2f2;
}

.app-toast--warning {
  --toast-accent: #f97316;
  --toast-soft: #fff7ed;
}

.app-toast--info {
  --toast-accent: var(--st-primary);
  --toast-soft: var(--st-bg-soft);
}

.app-toast__icon {
  align-items: center;
  background: var(--toast-soft);
  border-radius: 8px;
  color: var(--toast-accent);
  display: inline-flex;
  height: 36px;
  justify-content: center;
  width: 36px;
}

.app-toast__content {
  display: grid;
  gap: 3px;
  min-width: 0;
  padding-top: 1px;

  strong {
    color: var(--st-text);
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.25;
  }

  span {
    color: var(--st-muted);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.45;
  }
}

.app-toast__close {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  height: 28px;
  justify-content: center;
  padding: 0;
  transition: background 160ms ease, color 160ms ease;
  width: 28px;

  &:hover {
    background: #f8fafc;
    color: var(--st-text);
  }
}

.app-toast-enter-active,
.app-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateX(14px);
}

.app-toast-move {
  transition: transform 180ms ease;
}

@media (max-width: 640px) {
  .app-toast-region {
    bottom: 16px;
    left: 16px;
    right: 16px;
  }

  .app-toast-stack {
    justify-items: stretch;
  }

  .app-toast {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-toast-enter-active,
  .app-toast-leave-active,
  .app-toast-move {
    transition: none;
  }
}
</style>
