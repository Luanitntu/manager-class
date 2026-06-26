import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration';

// Schedule Teacher clean education SaaS theme.
export default defineVuetifyConfiguration({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#0D6EFD',
          secondary: '#49BEFF',
          success: '#13DEB9',
          info: '#539BFF',
          warning: '#FFAE1F',
          error: '#FA896B',
          background: '#F4F6FB',
          surface: '#FFFFFF',
        },
      },
    },
  },
  defaults: {
    VCard: { rounded: 'lg', elevation: 0, border: true },
    VBtn: { rounded: 'lg', style: 'text-transform: none;' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
  },
});
