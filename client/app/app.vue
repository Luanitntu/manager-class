<script setup lang="ts">
const showInitialLoader = ref(true);

onMounted(() => {
  window.setTimeout(() => {
    showInitialLoader.value = false;
  }, 520);
});
</script>

<template>
  <AppInitialLoader v-if="showInitialLoader" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToast />
</template>
