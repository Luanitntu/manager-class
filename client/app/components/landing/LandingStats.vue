<script setup lang="ts">
import { stats } from '../../consts/landing/content';
</script>

<template>
  <section class="stats-band">
    <div class="stats-band__blob stats-band__blob--one" />
    <div class="stats-band__blob stats-band__blob--two" />
    <div class="stats-grid">
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        :class="['stat-item', { 'stat-item--first': index === 0 }]"
      >
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </div>
    </div>
  </section>
</template>
