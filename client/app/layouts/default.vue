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

// Navigation is role-aware, grouped into labelled sections. Each item is an
// i18n key resolved in the template.
const NAV = {
  dashboard: { key: 'nav.dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
  calendar: { key: 'nav.calendar', icon: 'mdi-calendar-month-outline', to: '/calendar' },
  classes: { key: 'nav.classes', icon: 'mdi-book-open-outline', to: '/classes' },
  students: { key: 'nav.students', icon: 'mdi-account-group-outline', to: '/students' },
  assistants: { key: 'nav.assistants', icon: 'mdi-account-tie-outline', to: '/assistants' },
  documents: { key: 'nav.documents', icon: 'mdi-file-multiple-outline', to: '/documents' },
  payments: { key: 'nav.payments', icon: 'mdi-credit-card-outline', to: '/payments' },
  reports: { key: 'nav.reports', icon: 'mdi-chart-bar', to: '/reports' },
  auditLogs: { key: 'nav.auditLogs', icon: 'mdi-history', to: '/audit-logs' },
  users: { key: 'nav.users', icon: 'mdi-account-group-outline', to: '/admin/users' },
  health: { key: 'nav.health', icon: 'mdi-heart-pulse', to: '/admin/health' },
  settings: { key: 'nav.settings', icon: 'mdi-cog-outline', to: '/admin/settings' },
} as const;

type NavItem = { key: string; icon: string; to: string };
type NavGroup = { title: string; items: NavItem[] };

// Grouped sections per role.
const navGroups = computed<NavGroup[]>(() => {
  switch (auth.role) {
    case 'SUPER_ADMIN':
      return [
        { title: 'nav.sectionDaily', items: [NAV.dashboard] },
        { title: 'nav.sectionManage', items: [NAV.users, NAV.auditLogs, NAV.health] },
        { title: 'nav.sectionSystem', items: [NAV.settings] },
      ];
    case 'ASSISTANT':
      return [
        { title: 'nav.sectionDaily', items: [NAV.dashboard, NAV.calendar] },
        { title: 'nav.sectionTeaching', items: [NAV.documents] },
      ];
    case 'STUDENT':
      return [
        { title: 'nav.sectionDaily', items: [NAV.dashboard, NAV.calendar] },
        { title: 'nav.sectionTeaching', items: [NAV.documents] },
        { title: 'nav.sectionManage', items: [NAV.payments] },
      ];
    default: // TEACHER
      return [
        { title: 'nav.sectionDaily', items: [NAV.dashboard, NAV.calendar] },
        { title: 'nav.sectionTeaching', items: [NAV.classes, NAV.students, NAV.assistants, NAV.documents] },
        { title: 'nav.sectionManage', items: [NAV.payments, NAV.reports, NAV.auditLogs] },
      ];
  }
});

// Pinned at the very bottom of the sidebar — personal settings (profile).
// Super Admin keeps "Hồ sơ" wording (it already has a platform Settings item).
const bottomItem = computed(() =>
  auth.role === 'SUPER_ADMIN'
    ? { key: 'nav.profile', icon: 'mdi-account-circle-outline', to: '/profile' }
    : { key: 'nav.settings', icon: 'mdi-cog-outline', to: '/profile' },
);
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

      <v-list nav density="comfortable" class="st-nav">
        <template v-for="group in navGroups" :key="group.title">
          <v-list-subheader class="st-section">{{ t(group.title) }}</v-list-subheader>
          <v-list-item
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="t(item.key)"
            rounded="lg"
            color="primary"
          />
        </template>
      </v-list>

      <!-- Pinned bottom: personal settings -->
      <template #append>
        <v-divider />
        <v-list nav density="comfortable" class="st-nav pa-2">
          <v-list-item
            :to="bottomItem.to"
            :prepend-icon="bottomItem.icon"
            :title="t(bottomItem.key)"
            rounded="lg"
            color="primary"
          />
        </v-list>
      </template>
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

<style scoped>
.st-section {
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  opacity: 0.6;
  margin-top: 4px;
}
/* Active item: blue tint + a left accent bar (matches the design). */
.st-nav :deep(.v-list-item--active) {
  position: relative;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
.st-nav :deep(.v-list-item--active)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: rgb(var(--v-theme-primary));
}
</style>

