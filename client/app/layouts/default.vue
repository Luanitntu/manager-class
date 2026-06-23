<script setup lang="ts">
const drawer = ref(true);
const auth = useAuthStore();
const { logout } = useAuth();
const { t } = useI18n();
const config = useRuntimeConfig();
const { data: publicSettings } = usePublicSettings();

const avatarSrc = computed(() =>
  auth.user?.avatarKey ? `${config.public.apiBase}/users/${auth.user.id}/avatar` : null,
);

const announcement = computed(() =>
  publicSettings.value?.announcementActive && publicSettings.value?.announcement
    ? publicSettings.value.announcement
    : null,
);

// Navigation is role-aware. Each item is an i18n key resolved in the template.
const NAV = {
  dashboard: { key: 'nav.dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
  calendar: { key: 'nav.calendar', icon: 'mdi-calendar-month-outline', to: '/calendar' },
  classes: { key: 'nav.classes', icon: 'mdi-google-classroom', to: '/classes' },
  students: { key: 'nav.students', icon: 'mdi-account-school-outline', to: '/students' },
  assistants: { key: 'nav.assistants', icon: 'mdi-account-tie-outline', to: '/assistants' },
  documents: { key: 'nav.documents', icon: 'mdi-file-document-outline', to: '/documents' },
  payments: { key: 'nav.payments', icon: 'mdi-cash-multiple', to: '/payments' },
  reports: { key: 'nav.reports', icon: 'mdi-chart-box-outline', to: '/reports' },
  auditLogs: { key: 'nav.auditLogs', icon: 'mdi-history', to: '/audit-logs' },
  users: { key: 'nav.users', icon: 'mdi-account-group-outline', to: '/admin/users' },
  health: { key: 'nav.health', icon: 'mdi-heart-pulse', to: '/admin/health' },
  settings: { key: 'nav.settings', icon: 'mdi-cog-outline', to: '/admin/settings' },
  profile: { key: 'nav.profile', icon: 'mdi-account-circle-outline', to: '/profile' },
} as const;

const nav = computed(() => {
  switch (auth.role) {
    case 'SUPER_ADMIN':
      return [NAV.dashboard, NAV.users, NAV.auditLogs, NAV.health, NAV.settings, NAV.profile];
    case 'ASSISTANT':
      return [NAV.dashboard, NAV.calendar, NAV.documents, NAV.profile];
    case 'STUDENT':
      return [NAV.dashboard, NAV.calendar, NAV.documents, NAV.payments, NAV.profile];
    default: // TEACHER
      return [
        NAV.dashboard,
        NAV.calendar,
        NAV.classes,
        NAV.students,
        NAV.assistants,
        NAV.documents,
        NAV.payments,
        NAV.reports,
        NAV.auditLogs,
        NAV.profile,
      ];
  }
});
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" width="260" color="surface">
      <div class="pa-4 d-flex align-center ga-2">
        <v-avatar color="primary" size="36" rounded="lg">
          <v-icon color="white">mdi-school</v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-bold">Schedule Teacher</span>
      </div>
      <v-divider />
      <v-list nav density="comfortable">
        <v-list-item
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="t(item.key)"
          rounded="lg"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar flat border="b" color="surface">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-spacer />
      <LanguageSwitcher class="mr-2" />
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none">
            <v-avatar color="secondary" size="32" class="mr-2">
              <v-img v-if="avatarSrc" :src="avatarSrc" />
              <span v-else class="text-white">{{ auth.user?.fullName?.[0] ?? 'U' }}</span>
            </v-avatar>
            {{ auth.user?.fullName ?? 'Guest' }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="'/profile'" :title="t('nav.profile')" prepend-icon="mdi-account" />
          <v-list-item :title="t('nav.logout')" prepend-icon="mdi-logout" @click="logout()" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-background">
      <v-alert
        v-if="announcement"
        type="info"
        variant="tonal"
        density="comfortable"
        icon="mdi-bullhorn"
        class="ma-4 mb-0"
        border="start"
      >
        {{ announcement }}
      </v-alert>
      <v-container fluid class="pa-6 st-content">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
