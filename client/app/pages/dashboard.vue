<script setup lang="ts">
import { useDashboard, type DashboardStats } from '~/composables/useDashboard';
import { useDocuments } from '~/composables/useDocuments';
import { useTuitions, statusColor } from '~/composables/usePayments';
import { useMyComments, useMyScores } from '~/composables/useStudents';

const { data, isLoading, error, refetch } = useDashboard();
const isStudent = computed(() => data.value?.role === 'STUDENT');
const documentsQuery = useDocuments(undefined, { enabled: isStudent });
const tuitionsQuery = useTuitions({ enabled: isStudent });
const scoresQuery = useMyScores({ enabled: isStudent });
const commentsQuery = useMyComments({ enabled: isStudent });

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
const documents = computed(() => (documentsQuery.data.value?.data ?? []).slice(0, 3));
const tuitions = computed(() => (tuitionsQuery.data.value?.data ?? []).slice(0, 3));
const scores = computed(() => (scoresQuery.data.value ?? []).slice(0, 3));
const comments = computed(() => (commentsQuery.data.value ?? []).slice(0, 3));
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

function scoreValue(value: string, maxValue: string) {
  return `${Number(value).toLocaleString()}/${Number(maxValue).toLocaleString()}`;
}

function remaining(total: string, paid: string) {
  return Number(total) - Number(paid);
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

    <template v-if="!isLoading && !error && isStudent">
      <v-card class="mt-6 st-card-soft">
        <v-card-title class="text-subtitle-1 font-weight-bold">Schedule</v-card-title>
        <v-list v-if="upcoming.length">
          <v-list-item v-for="u in upcoming.slice(0, 3)" :key="u.id" to="/calendar">
            <template #prepend>
              <v-avatar :color="u.class.color || 'primary'" size="10" />
            </template>
            <v-list-item-title>{{ u.class.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ u.lessonTopic || 'Class session' }}</v-list-item-subtitle>
            <template #append>
              <span class="text-caption text-medium-emphasis">{{ fmt(u.startTime) }}</span>
            </template>
          </v-list-item>
        </v-list>
        <AppState
          v-else
          variant="empty"
          icon="mdi-calendar-heart"
          title="No upcoming sessions"
          body="Your scheduled classes will appear here."
          action-label="Open calendar"
          @action="navigateTo('/calendar')"
        />
      </v-card>

      <v-card class="mt-4 st-card-soft">
        <v-card-title class="text-subtitle-1 font-weight-bold">Documents</v-card-title>
        <AppState
          v-if="documentsQuery.isLoading.value"
          variant="loading"
          title="Loading documents"
          body="Checking assigned materials."
        />
        <AppState
          v-else-if="documentsQuery.error.value"
          variant="error"
          title="Could not load documents"
          body="Try refreshing the dashboard."
        />
        <v-list v-else-if="documents.length">
          <v-list-item v-for="d in documents" :key="d.id" to="/documents">
            <template #prepend>
              <v-icon color="info">{{ d.type === 'LINK' ? 'mdi-link-variant' : 'mdi-file-document-outline' }}</v-icon>
            </template>
            <v-list-item-title>{{ d.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ d.category || d.type }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <AppState
          v-else
          variant="empty"
          icon="mdi-folder-open-outline"
          title="No assigned documents"
          body="Your teacher's materials will appear here when assigned."
          action-label="Open documents"
          @action="navigateTo('/documents')"
        />
      </v-card>

      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card class="h-100 st-card-soft">
            <v-card-title class="text-subtitle-1 font-weight-bold">Scores</v-card-title>
            <AppState
              v-if="scoresQuery.isLoading.value"
              variant="loading"
              title="Loading scores"
              body="Checking recent results."
            />
            <AppState
              v-else-if="scoresQuery.error.value"
              variant="error"
              title="Could not load scores"
              body="Try refreshing the dashboard."
            />
            <v-list v-else-if="scores.length">
              <v-list-item v-for="score in scores" :key="score.id">
                <v-list-item-title>{{ score.label || score.type }}</v-list-item-title>
                <v-list-item-subtitle>{{ score.class?.name || 'Class score' }}</v-list-item-subtitle>
                <template #append>
                  <v-chip color="info" size="small" variant="tonal">
                    {{ scoreValue(score.value, score.maxValue) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <AppState
              v-else
              variant="empty"
              icon="mdi-chart-box-outline"
              title="No scores yet"
              body="Your teacher will share scores after class activities."
            />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="h-100 st-card-soft">
            <v-card-title class="text-subtitle-1 font-weight-bold">Teacher Feedback</v-card-title>
            <AppState
              v-if="commentsQuery.isLoading.value"
              variant="loading"
              title="Loading feedback"
              body="Checking recent comments."
            />
            <AppState
              v-else-if="commentsQuery.error.value"
              variant="error"
              title="Could not load feedback"
              body="Try refreshing the dashboard."
            />
            <v-timeline v-else-if="comments.length" density="compact" side="end">
              <v-timeline-item v-for="comment in comments" :key="comment.id" dot-color="primary" size="small">
                <div class="text-subtitle-2 font-weight-bold">{{ comment.category || 'Progress note' }}</div>
                <div class="text-body-2">{{ comment.content }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ comment.author?.fullName || 'Teacher' }} - {{ new Date(comment.createdAt).toLocaleDateString() }}
                </div>
              </v-timeline-item>
            </v-timeline>
            <AppState
              v-else
              variant="empty"
              icon="mdi-comment-text-outline"
              title="No feedback yet"
              body="Teacher comments and progress notes will appear here."
            />
          </v-card>
        </v-col>
      </v-row>

      <v-card class="mt-4 st-card-soft">
        <v-card-title class="text-subtitle-1 font-weight-bold">Payments</v-card-title>
        <AppState
          v-if="tuitionsQuery.isLoading.value"
          variant="loading"
          title="Loading payments"
          body="Checking tuition balances."
        />
        <AppState
          v-else-if="tuitionsQuery.error.value"
          variant="error"
          title="Could not load payments"
          body="Try refreshing the dashboard."
        />
        <v-list v-else-if="tuitions.length">
          <v-list-item v-for="tuition in tuitions" :key="tuition.id" to="/payments">
            <v-list-item-title>{{ tuition.class?.name || 'Tuition' }}</v-list-item-title>
            <v-list-item-subtitle>Remaining {{ money(remaining(tuition.totalAmount, tuition.paidAmount)) }}</v-list-item-subtitle>
            <template #append>
              <v-chip :color="statusColor[tuition.status]" size="small" variant="tonal">
                {{ tuition.status.replace('_', ' ') }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
        <AppState
          v-else
          variant="empty"
          icon="mdi-cash-clock"
          title="No payments yet"
          body="Tuition balances and receipts will appear here when shared."
          action-label="Open payments"
          @action="navigateTo('/payments')"
        />
      </v-card>
    </template>

    <v-card v-if="!isLoading && !error && !isStudent && upcoming.length" class="mt-6 st-card-soft">
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
      v-else-if="!isLoading && !error && !isStudent && cards.length"
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
