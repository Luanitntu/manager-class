<script setup lang="ts">
import LoginFormPane from '../components/login/LoginFormPane.vue';
import LoginVisual from '../components/login/LoginVisual.vue';

definePageMeta({ layout: false });
</script>

<template>
  <v-app>
    <main class="login-shell">
      <LoginFormPane />
      <LoginVisual />
    </main>
  </v-app>
</template>
