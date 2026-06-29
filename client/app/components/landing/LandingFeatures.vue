<script setup lang="ts">
import { features, featuresSection } from '../../consts/landing/content';
</script>

<template>
  <section id="features" class="features-section">
    <div class="section-inner">
      <div class="section-title">
        <h2>{{ featuresSection.eyebrow }}</h2>
        <h3>{{ featuresSection.title }}</h3>
        <p>{{ featuresSection.description }}</p>
      </div>

      <div class="feature-grid">
        <article v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-card__icon">
            <v-icon :icon="feature.icon" size="28" />
          </div>
          <h4>{{ feature.title }}</h4>
          <p>{{ feature.desc }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
