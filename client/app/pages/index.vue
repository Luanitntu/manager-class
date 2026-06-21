<script setup lang="ts">
import { getDefaultRoute } from '~/utils/navigation';

// Land users on the right home screen for their role.
// Super Admin has no tenant (no calendar) -> dashboard; everyone else -> calendar.
definePageMeta({ layout: false });

onMounted(() => {
  const auth = useAuthStore();
  navigateTo(getDefaultRoute(auth.role));
});
</script>

<template>
  <div class="d-flex align-center justify-center" style="height: 100vh">
    <v-progress-circular indeterminate color="primary" />
  </div>
</template>
