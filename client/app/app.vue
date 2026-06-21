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
          <v-icon color="white" size="32">mdi-school</v-icon>
        </div>
        <div>
          <div class="st-app-loader-title">Schedule Teacher</div>
          <div class="st-app-loader-subtitle">Preparing your workspace</div>
        </div>
      </div>
      <v-progress-linear color="primary" indeterminate rounded class="st-app-loader-progress" />
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
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 8px;
  background: #2563eb;
  box-shadow: 0 14px 36px rgba(37, 99, 235, 0.22);
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
  width: min(320px, calc(100vw - 48px));
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
