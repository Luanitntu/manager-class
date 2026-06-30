<script setup lang="ts">
import LoginFormPane from '../components/login/LoginFormPane.vue';
import LoginVisual from '../components/login/LoginVisual.vue';

definePageMeta({ layout: false });
</script>

<template>
  <main class="flex min-h-screen overflow-x-hidden bg-[var(--st-surface)] font-[var(--st-font-family)] text-slate-900">
    <LoginFormPane />
    <LoginVisual />
  </main>
</template>
