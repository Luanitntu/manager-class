<script setup lang="ts">
import { topbar } from '../../consts/landing/content';
</script>

<template>
  <div class="topbar">
    <div class="topbar__left">
      <span><v-icon icon="mdi-phone-outline" size="14" /> Hotline: {{ topbar.phone }}</span>
      <span class="topbar__email">
        <v-icon icon="mdi-email-outline" size="14" /> Email: {{ topbar.email }}
      </span>
    </div>
    <div class="topbar__claim">
      {{ topbar.claim }}
    </div>
  </div>
</template>
