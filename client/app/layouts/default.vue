<script setup lang="ts">
import {
  getMobileNavigation,
  getNavigation,
  getQuickAction,
  getRoleLabel,
} from '~/utils/navigation';

const drawer = ref(true);
const auth = useAuthStore();
const { logout } = useAuth();
const route = useRoute();

const navGroups = computed(() => getNavigation(auth.role));
const mobileNav = computed(() => getMobileNavigation(auth.role));
const roleLabel = computed(() => getRoleLabel(auth.role));
const quickAction = computed(() => getQuickAction(auth.role));

function isActive(to: string) {
  return route.path === to;
}
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :width="272" color="surface" class="d-none d-md-flex">
      <div class="pa-4 d-flex align-center ga-2">
        <v-avatar color="primary" size="40" rounded="lg">
          <v-icon color="white">mdi-school</v-icon>
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold">Schedule Teacher</div>
          <div class="text-caption text-medium-emphasis">Class operations</div>
        </div>
      </div>
      <v-divider />
      <div class="pa-3">
        <div v-for="group in navGroups" :key="group.title" class="mb-4">
          <div class="text-caption font-weight-bold text-medium-emphasis px-3 mb-1">
            {{ group.title }}
          </div>
          <v-list nav density="comfortable" class="pa-0">
            <v-list-item
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              rounded="lg"
              :class="{ 'st-nav-active': isActive(item.to) }"
            />
          </v-list>
        </div>
      </div>
    </v-navigation-drawer>

    <v-app-bar flat border="b" color="surface">
      <v-app-bar-nav-icon class="d-none d-md-inline-flex" @click="drawer = !drawer" />
      <v-toolbar-title class="d-md-none text-subtitle-1 font-weight-bold">
        Schedule Teacher
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="quickAction"
        :to="quickAction.to"
        color="primary"
        :prepend-icon="quickAction.icon"
        class="mr-2 d-none d-sm-inline-flex"
      >
        {{ quickAction.label }}
      </v-btn>
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none">
            <v-avatar color="secondary" size="32" class="mr-2">
              <span class="text-white">{{ auth.user?.fullName?.[0] ?? 'U' }}</span>
            </v-avatar>
            <span class="d-none d-sm-inline">{{ auth.user?.fullName ?? 'Guest' }}</span>
            <v-chip class="ml-2 d-none d-md-inline-flex" size="small" color="primary">
              {{ roleLabel }}
            </v-chip>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :title="auth.user?.fullName ?? 'Guest'" :subtitle="roleLabel" />
          <v-divider />
          <v-list-item to="/profile" title="Profile" prepend-icon="mdi-account" />
          <v-list-item title="Logout" prepend-icon="mdi-logout" @click="logout()" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-6 st-content st-content-shell">
        <slot />
      </v-container>
    </v-main>

    <v-bottom-navigation
      class="d-md-none"
      color="primary"
      grow
      mandatory
      :model-value="route.path"
    >
      <v-btn v-for="item in mobileNav" :key="item.to" :value="item.to" :to="item.to">
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>
