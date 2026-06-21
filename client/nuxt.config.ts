// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'vuetify-nuxt-module',
    '@nuxt/eslint',
  ],

  css: ['@mdi/font/css/materialdesignicons.min.css', '~/assets/css/main.css'],

  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/css/vuetify.settings.scss' },
    },
    vuetifyOptions: './vuetify.config.ts',
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api/v1',
    },
  },

  app: {
    head: {
      title: 'Schedule Teacher',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap&subset=vietnamese',
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  // Pre-bundle FullCalendar so the Calendar page doesn't trigger a dev reload.
  vite: {
    optimizeDeps: {
      include: [
        '@fullcalendar/core',
        '@fullcalendar/daygrid',
        '@fullcalendar/timegrid',
        '@fullcalendar/interaction',
        '@fullcalendar/vue3',
      ],
    },
  },
});
