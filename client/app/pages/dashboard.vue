<script setup lang="ts">
import { useDashboard, type DashboardStats } from '~/composables/useDashboard';

const { data, isLoading } = useDashboard();

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
    <h1 class="text-h5 font-weight-bold mb-1">Dashboard</h1>
    <p class="text-medium-emphasis mb-6">Quick overview of your teaching activity.</p>

    <v-row>
      <v-col v-for="s in cards" :key="s.label" cols="12" sm="6" md="3">
        <v-card class="pa-4">
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

    <v-card v-if="upcoming.length" class="mt-6">
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

    <v-card v-else-if="!isLoading" class="mt-6 pa-8 text-center text-medium-emphasis">
      No upcoming sessions. Head to the Calendar to schedule one.
    </v-card>
  </div>
</template>
