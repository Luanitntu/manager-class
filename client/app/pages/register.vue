<script setup lang="ts">
import RegisterFormPane from '../components/register/RegisterFormPane.vue';
import RegisterVisual from '../components/register/RegisterVisual.vue';

definePageMeta({ layout: false });
</script>

<template>
  <v-app>
    <main class="register-shell">
      <RegisterFormPane />
      <RegisterVisual />
    </main>
  </v-app>
</template>

<style scoped src="../styles/register/page.css"></style>
