<script setup lang="ts">
const drawer = ref(true);
const auth = useAuthStore();
const { logout } = useAuth();

// Teacher navigation (primary). Role-specific menus refined in later phases.
const nav = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
  { title: 'Calendar', icon: 'mdi-calendar-month-outline', to: '/calendar' },
  { title: 'Classes', icon: 'mdi-google-classroom', to: '/classes' },
  { title: 'Students', icon: 'mdi-account-school-outline', to: '/students' },
  { title: 'Assistants', icon: 'mdi-account-tie-outline', to: '/assistants' },
  { title: 'Documents', icon: 'mdi-file-document-outline', to: '/documents' },
  { title: 'Payments', icon: 'mdi-cash-multiple', to: '/payments' },
  { title: 'Reports', icon: 'mdi-chart-box-outline', to: '/reports' },
  { title: 'Audit Logs', icon: 'mdi-history', to: '/audit-logs' },
  { title: 'Profile', icon: 'mdi-account-circle-outline', to: '/profile' },
];
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
          :title="item.title"
          rounded="lg"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar flat border="b" color="surface">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-spacer />
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none">
            <v-avatar color="secondary" size="32" class="mr-2">
              <span class="text-white">{{ auth.user?.fullName?.[0] ?? 'U' }}</span>
            </v-avatar>
            {{ auth.user?.fullName ?? 'Guest' }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item to="/profile" title="Profile" prepend-icon="mdi-account" />
          <v-list-item title="Logout" prepend-icon="mdi-logout" @click="logout()" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-6 st-content">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
