<script setup lang="ts">
const isBooting = ref(true);
const isNavigating = ref(false);
const nuxtApp = useNuxtApp();
const router = useRouter();

nuxtApp.hook('page:start', () => {
  isNavigating.value = true;
});

nuxtApp.hook('page:finish', () => {
  isNavigating.value = false;
});

onMounted(async () => {
  await router.isReady();
  await nextTick();

  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      isBooting.value = false;
    }, 160);
  });
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <Transition name="st-app-loader">
    <div v-if="isBooting || isNavigating" class="st-app-loader-screen">
      <div class="st-app-loader-brand">
        <div class="st-app-loader-mark">
          <span class="st-app-loader-mark-roof" />
          <span class="st-app-loader-mark-book" />
        </div>
        <div>
          <div class="st-app-loader-title">Schedule Teacher</div>
          <div class="st-app-loader-subtitle">Preparing your workspace</div>
        </div>
      </div>
      <div class="st-app-loader-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.st-app-loader-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: #f6f8fc;
  color: #172033;
}

.st-app-loader-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.st-app-loader-mark {
  position: relative;
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 8px;
  background: #2563eb;
  box-shadow: 0 14px 36px rgba(37, 99, 235, 0.22);
}

.st-app-loader-mark-roof {
  position: absolute;
  top: 16px;
  width: 28px;
  height: 10px;
  border: 3px solid #ffffff;
  border-bottom: 0;
  transform: skewX(-18deg);
}

.st-app-loader-mark-book {
  position: absolute;
  bottom: 16px;
  width: 30px;
  height: 16px;
  border: 3px solid #ffffff;
  border-top: 0;
  border-radius: 0 0 5px 5px;
}

.st-app-loader-mark-book::before {
  position: absolute;
  top: -1px;
  left: 50%;
  width: 3px;
  height: 15px;
  background: #ffffff;
  content: '';
  transform: translateX(-50%);
}

.st-app-loader-title {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
}

.st-app-loader-subtitle {
  margin-top: 3px;
  color: #64748b;
  font-size: 0.875rem;
}

.st-app-loader-progress {
  position: relative;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: #dbe7f6;
  width: min(320px, calc(100vw - 48px));
}

.st-app-loader-progress span {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -45%;
  width: 45%;
  border-radius: inherit;
  background: #2563eb;
  animation: st-app-loader-slide 900ms ease-in-out infinite;
}

@keyframes st-app-loader-slide {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(320%);
  }
}

.st-app-loader-enter-active,
.st-app-loader-leave-active {
  transition: opacity 180ms ease;
}

.st-app-loader-enter-from,
.st-app-loader-leave-to {
  opacity: 0;
}
</style>
