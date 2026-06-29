<script setup lang="ts">
import LandingFeatures from '../components/landing/LandingFeatures.vue';
import LandingFinalCta from '../components/landing/LandingFinalCta.vue';
import LandingFooter from '../components/landing/LandingFooter.vue';
import LandingHeader from '../components/landing/LandingHeader.vue';
import LandingHero from '../components/landing/LandingHero.vue';
import LandingShowcase from '../components/landing/LandingShowcase.vue';
import LandingStats from '../components/landing/LandingStats.vue';
import LandingTopbar from '../components/landing/LandingTopbar.vue';
import '../styles/landing.scss';

definePageMeta({ layout: false });
</script>

<template>
  <v-app>
    <main class="landing-page">
      <LandingTopbar />
      <LandingHeader />
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingShowcase />
      <LandingFinalCta />
      <LandingFooter />
    </main>
  </v-app>
</template>
