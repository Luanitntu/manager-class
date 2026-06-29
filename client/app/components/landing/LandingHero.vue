<script setup lang="ts">
import { hero } from '../../consts/landing/content';
</script>

<template>
  <section class="hero">
    <div class="texture texture--hero" />
    <div class="hero__inner">
      <div class="hero__copy">
        <div class="hero__badge">
          <span class="badge-dot"><span /><span /></span>
          {{ hero.badge }}
        </div>

        <h1>
          {{ hero.titleLines[0] }}
          <br>
          <span>{{ hero.titleLines[1] }}</span>
          <br>
          {{ hero.titleLines[2] }}
        </h1>

        <p>{{ hero.description }}</p>

        <div class="hero__actions">
          <NuxtLink to="/register" class="primary-cta">
            {{ hero.primaryCta }}
            <v-icon icon="mdi-arrow-right" size="20" />
          </NuxtLink>
          <button class="video-cta" type="button">
            <v-icon icon="mdi-play-circle-outline" size="24" />
            {{ hero.videoCta }}
          </button>
        </div>

        <div class="hero__checks">
          <span v-for="check in hero.checks" :key="check">
            <v-icon icon="mdi-check-circle" size="18" /> {{ check }}
          </span>
        </div>
      </div>

      <div class="hero__media">
        <div class="hero__glow" />
        <div class="hero__frame">
          <img :src="hero.image" :alt="hero.imageAlt">
        </div>
        <div class="attendance-card">
          <div class="attendance-card__icon"><v-icon icon="mdi-check" size="20" /></div>
          <div>
            <small>{{ hero.floatingLabel }}</small>
            <strong>{{ hero.floatingValue }}</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
