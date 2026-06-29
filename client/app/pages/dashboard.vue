<script setup lang="ts">
import AdminWorkspaceDashboard from '~/components/dashboard/AdminWorkspaceDashboard.vue';
import StudentWorkspaceDashboard from '~/components/dashboard/StudentWorkspaceDashboard.vue';
import TeacherWorkspaceDashboard from '~/components/dashboard/TeacherWorkspaceDashboard.vue';

const { data, isLoading } = useDashboard();
const auth = useAuthStore();

const dashboardRole = computed(() => auth.role ?? data.value?.role ?? null);
const isStudentDashboard = computed(() => dashboardRole.value === 'STUDENT');
const isTeacherDashboard = computed(
  () => dashboardRole.value === 'TEACHER' || dashboardRole.value === 'ASSISTANT',
);
</script>

<template>
  <StudentWorkspaceDashboard
    v-if="isStudentDashboard"
    :stats="data"
    :is-loading="isLoading"
  />

  <AppSkeleton v-else-if="isLoading && !data" variant="dashboard" />

  <TeacherWorkspaceDashboard
    v-else-if="isTeacherDashboard"
    :stats="data"
    :role="dashboardRole"
  />

  <AdminWorkspaceDashboard
    v-else
    :stats="data"
    :is-loading="isLoading"
    :role="dashboardRole"
  />
</template>
