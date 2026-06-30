<script setup lang="ts">
import RegisterFormPane from '../components/register/RegisterFormPane.vue';
import RegisterVisual from '../components/register/RegisterVisual.vue';

definePageMeta({ layout: false });
</script>

<template>
  <main class="flex min-h-screen flex-row-reverse overflow-x-hidden bg-white font-[var(--st-font-family)] text-slate-900 max-lg:block">
    <RegisterFormPane />
    <RegisterVisual />
  </main>
</template>
