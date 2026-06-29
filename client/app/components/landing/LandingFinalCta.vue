<script setup lang="ts">
import { finalCta } from '../../consts/landing/content';
</script>

<template>
  <section class="final-cta">
    <div class="texture texture--final" />
    <div class="final-cta__glow" />
    <div class="final-cta__content">
      <h2>
        {{ finalCta.titleLines[0] }}
        <br>
        {{ finalCta.titleLines[1] }}
      </h2>
      <p>{{ finalCta.description }}</p>
      <NuxtLink to="/register">
        {{ finalCta.action }}
      </NuxtLink>
      <small>{{ finalCta.note }}</small>
    </div>
  </section>
</template>
