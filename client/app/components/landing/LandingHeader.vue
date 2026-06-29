<script setup lang="ts">
import { navLinks } from '../../consts/landing/content';
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink to="/" class="brand">
        <span class="brand__icon"><v-icon icon="mdi-calendar-check" size="24" /></span>
        <span>Schedule<span class="brand__dark">Teacher</span></span>
      </NuxtLink>

      <nav class="main-nav" aria-label="Landing navigation">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          :class="['main-nav__link', { 'main-nav__link--active': link.active }]"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="site-header__actions">
        <NuxtLink to="/login" class="login-link">Đăng nhập</NuxtLink>
        <NuxtLink to="/register" class="trial-link">Dùng thử miễn phí</NuxtLink>
      </div>
    </div>
  </header>
</template>
