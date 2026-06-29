<script setup lang="ts">
const config = useRuntimeConfig();
const showInitialLoader = ref(true);

// Load public branding/SEO once (SSR + client) for <head>.
const { data: settings } = await usePublicSettings();

const title = computed(
  () => settings.value?.seoTitle || settings.value?.platformName || 'Schedule Teacher',
);
const description = computed(() => settings.value?.seoDescription || '');
const keywords = computed(() => settings.value?.seoKeywords || '');
const faviconHref = computed(() =>
  settings.value?.faviconKey ? `${config.public.apiBase}/settings/favicon` : '/favicon.ico',
);

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ],
  link: [{ rel: 'icon', href: faviconHref }],
});

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
