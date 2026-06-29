<script setup lang="ts">
import { footer } from '../../consts/landing/content';
</script>

<template>
  <footer class="site-footer">
    <div class="footer-grid">
      <div class="footer-about">
        <NuxtLink to="/" class="footer-brand">
          <span><v-icon icon="mdi-calendar-check" size="24" /></span>
          ScheduleTeacher
        </NuxtLink>
        <p>{{ footer.description }}</p>
        <div class="footer-contact">
          <p><v-icon icon="mdi-phone-outline" size="18" /> {{ footer.phone }}</p>
          <p><v-icon icon="mdi-email-outline" size="18" /> {{ footer.email }}</p>
        </div>
      </div>

      <div v-for="group in footer.groups" :key="group.title" class="footer-group">
        <h4>{{ group.title }}</h4>
        <ul>
          <li v-for="link in group.links" :key="link">
            <a href="#">{{ link }}</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>{{ footer.copyright }}</p>
      <div>
        <span v-for="social in footer.socials" :key="social">{{ social }}</span>
      </div>
    </div>
  </footer>
</template>
