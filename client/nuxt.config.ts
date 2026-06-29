import tailwindcss from '@tailwindcss/vite';
import type { NuxtConfig } from 'nuxt/schema';

const env = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'vuetify-nuxt-module',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
  ],

  i18n: {
    locales: [
      { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'vi',
    strategy: 'no_prefix', // keep URLs unchanged; switch via cookie
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'st_lang',
      redirectOn: 'root',
      fallbackLocale: 'vi',
    },
  },

  css: ['@mdi/font/css/materialdesignicons.min.css', '~/assets/css/main.css'],

  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/css/vuetify.settings.scss' },
    },
    vuetifyOptions: './vuetify.config.ts',
  },

  runtimeConfig: {
    public: {
      apiBase: env?.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api/v1',
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
          href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  // Pre-bundle FullCalendar so the Calendar page doesn't trigger a dev reload.
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@fullcalendar/core',
        '@fullcalendar/daygrid',
        '@fullcalendar/timegrid',
        '@fullcalendar/interaction',
        '@fullcalendar/vue3',
        '@tanstack/vue-query',
      ],
    },
  },
} satisfies NuxtConfig;
