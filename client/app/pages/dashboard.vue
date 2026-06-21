<script setup lang="ts">
import { useDashboard, type DashboardStats } from '~/composables/useDashboard';

const { data, isLoading, error, refetch } = useDashboard();

function money(n?: number) {
  return (n ?? 0).toLocaleString();
}

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

const cards = computed<Stat[]>(() => {
  const s = data.value as DashboardStats | undefined;
  if (!s) return [];
  switch (s.role) {
    case 'TEACHER':
      return [
        { label: 'Total Classes', value: s.totalClasses ?? 0, icon: 'mdi-google-classroom', color: 'primary' },
        { label: 'Total Students', value: s.totalStudents ?? 0, icon: 'mdi-account-school', color: 'secondary' },
        { label: 'Tuition Collected', value: money(s.tuitionCollected), icon: 'mdi-cash-check', color: 'success' },
        { label: 'Outstanding', value: money(s.outstandingTuition), icon: 'mdi-cash-clock', color: 'warning' },
      ];
    case 'ASSISTANT':
      return [
        { label: 'Assigned Classes', value: s.assignedClasses ?? 0, icon: 'mdi-google-classroom', color: 'primary' },
        { label: 'Total Sessions', value: s.totalSessions ?? 0, icon: 'mdi-calendar', color: 'secondary' },
      ];
    case 'STUDENT':
      return [
        { label: 'Current Classes', value: s.currentClasses ?? 0, icon: 'mdi-google-classroom', color: 'primary' },
        { label: 'Scores Recorded', value: s.totalScores ?? 0, icon: 'mdi-chart-box', color: 'info' },
        { label: 'Remaining Tuition', value: money(s.remainingTuition), icon: 'mdi-cash-clock', color: 'warning' },
      ];
    case 'SUPER_ADMIN':
      return [
        { label: 'Total Teachers', value: s.totalTeachers ?? 0, icon: 'mdi-account-tie', color: 'primary' },
        { label: 'Total Students', value: s.totalStudents ?? 0, icon: 'mdi-account-school', color: 'secondary' },
        { label: 'Total Classes', value: s.totalClasses ?? 0, icon: 'mdi-google-classroom', color: 'info' },
        { label: 'Total Users', value: s.totalUsers ?? 0, icon: 'mdi-account-group', color: 'success' },
      ];
    default:
      return [];
  }
});

const upcoming = computed(() => data.value?.upcomingSessions ?? []);
const dashboardSubtitle = computed(() => {
  if (data.value?.role === 'STUDENT') return 'Your classes, scores, tuition, and upcoming schedule at a glance.';
  if (data.value?.role === 'TEACHER') return 'Your teaching activity, classes, students, and tuition snapshot.';
  return 'Quick overview of your learning operations.';
});

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Dashboard"
      :subtitle="dashboardSubtitle"
      icon="mdi-view-dashboard-outline"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="isLoading"
          @click="refetch"
        >
          Refresh
        </v-btn>
      </template>
    </AppPageHeader>

    <AppState
      v-if="isLoading"
      variant="loading"
      title="Loading dashboard"
      body="Preparing your latest class activity."
    />

    <AppState
      v-else-if="error"
      variant="error"
      title="Could not load dashboard"
      body="Try again, or check your connection if the problem continues."
      action-label="Try again"
      @action="refetch()"
    />

    <v-row v-else-if="cards.length">
      <v-col v-for="s in cards" :key="s.label" cols="12" sm="6" md="3">
        <v-card class="pa-4 st-card-soft">
          <div class="d-flex align-center ga-3">
            <v-avatar :color="s.color" rounded="lg" size="44">
              <v-icon color="white">{{ s.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ s.value }}</div>
              <div class="text-caption text-medium-emphasis">{{ s.label }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <AppState
      v-else
      variant="empty"
      title="Nothing here yet"
      body="When your class activity is ready, dashboard cards will appear here."
    />

    <v-card v-if="!isLoading && !error && upcoming.length" class="mt-6 st-card-soft">
      <v-card-title class="text-subtitle-1 font-weight-bold">Upcoming Sessions</v-card-title>
      <v-list>
        <v-list-item v-for="u in upcoming" :key="u.id" :to="'/calendar'">
          <template #prepend>
            <v-avatar :color="u.class.color || 'primary'" size="10" />
          </template>
          <v-list-item-title>{{ u.class.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ u.lessonTopic || 'No topic' }}</v-list-item-subtitle>
          <template #append>
            <span class="text-caption text-medium-emphasis">{{ fmt(u.startTime) }}</span>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <AppState
      v-else-if="!isLoading && !error && cards.length"
      class="mt-6"
      variant="empty"
      icon="mdi-calendar-heart"
      title="No upcoming sessions"
      body="Scheduled classes will appear here as soon as they are available."
      action-label="Open calendar"
      @action="navigateTo('/calendar')"
    />
  </div>
</template>
