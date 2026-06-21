import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration';

// Original energetic education SaaS theme for Schedule Teacher.
export default defineVuetifyConfiguration({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2563EB',
          secondary: '#14B8A6',
          success: '#22C55E',
          info: '#0EA5E9',
          warning: '#F59E0B',
          error: '#EF4444',
          background: '#F6F8FC',
          surface: '#FFFFFF',
          'surface-soft': '#EEF6FF',
          accent: '#F97316',
          border: '#D8E0EA',
          'text-primary': '#172033',
          'text-muted': '#64748B',
        },
      },
    },
  },
  defaults: {
    VCard: { rounded: 'lg', elevation: 0, border: true },
    VBtn: { rounded: 'lg', style: 'text-transform: none;', variant: 'flat' },
    VChip: { rounded: 'lg', variant: 'tonal' },
    VDialog: { scrim: '#172033' },
    VList: { density: 'comfortable' },
    VTable: { density: 'comfortable' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
  },
});
