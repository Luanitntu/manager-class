<script setup lang="ts">
import { useDashboard, type DashboardStats } from '~/composables/useDashboard';

const { data, isLoading } = useDashboard();
const { t, locale } = useI18n();
const userTz = useUserTimezone();

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
    case 'ASSISTANT':
      return [
        { label: t('dashboard.assignedClasses'), value: s.assignedClasses ?? 0, icon: 'mdi-google-classroom', color: 'primary' },
        { label: t('dashboard.totalSessions'), value: s.totalSessions ?? 0, icon: 'mdi-calendar', color: 'secondary' },
      ];
    case 'STUDENT':
      return [
        { label: t('dashboard.currentClasses'), value: s.currentClasses ?? 0, icon: 'mdi-google-classroom', color: 'primary' },
        { label: t('dashboard.scoresRecorded'), value: s.totalScores ?? 0, icon: 'mdi-chart-box', color: 'info' },
        { label: t('dashboard.remainingTuition'), value: money(s.remainingTuition), icon: 'mdi-cash-clock', color: 'warning' },
      ];
    case 'SUPER_ADMIN':
      return [
        { label: t('dashboard.totalTeachers'), value: s.totalTeachers ?? 0, icon: 'mdi-account-tie', color: 'primary' },
        { label: t('dashboard.totalStudents'), value: s.totalStudents ?? 0, icon: 'mdi-account-school', color: 'secondary' },
        { label: t('dashboard.totalClasses'), value: s.totalClasses ?? 0, icon: 'mdi-google-classroom', color: 'info' },
        { label: t('dashboard.totalUsers'), value: s.totalUsers ?? 0, icon: 'mdi-account-group', color: 'success' },
      ];
    default:
      return [];
  }
});

const upcoming = computed(() => data.value?.upcomingSessions ?? []);
const isAdmin = computed(() => data.value?.role === 'SUPER_ADMIN');
const isTeacher = computed(() => data.value?.role === 'TEACHER');

const planList = computed(() => {
  const p = data.value?.plans;
  return [
    { key: 'trial', label: 'Trial', value: p?.trial ?? 0, color: 'grey' },
    { key: 'personal', label: 'Personal', value: p?.personal ?? 0, color: 'info' },
    { key: 'pro', label: 'Pro', value: p?.pro ?? 0, color: 'primary' },
    { key: 'business', label: 'Business', value: p?.business ?? 0, color: 'success' },
  ];
});
const revenueByTeacher = computed(() => data.value?.revenueByTeacher ?? []);

// Subscription revenue chart (placeholder data until billing ships).
const subRev = computed(() => data.value?.subscriptionRevenue);
const subChartSeries = computed(() => {
  const r = subRev.value;
  if (!r) return [];
  return [
    { name: 'Personal', data: r.byPlan.personal },
    { name: 'Pro', data: r.byPlan.pro },
    { name: 'Business', data: r.byPlan.business },
  ];
});
const subChartOptions = computed(() => ({
  chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
  colors: ['#49BEFF', '#5D87FF', '#13DEB9'],
  xaxis: { categories: subRev.value?.months ?? [] },
  legend: { position: 'top' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#eee' },
}));

// Signups over time (real data — new users per month, last 6 months).
const signups = computed(() => data.value?.signups);
const signupSeries = computed(() => [
  { name: 'Người dùng mới', data: signups.value?.counts ?? [] },
]);
const signupOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#5D87FF'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
  dataLabels: { enabled: false },
  xaxis: { categories: signups.value?.months ?? [] },
  grid: { borderColor: '#eee' },
}));

function fmt(iso: string) {
  return formatInZone(iso, userTz.value, locale.value);
}
</script>

<template>
  <div>
    <!-- Teacher gets a dedicated, design-led dashboard. -->
    <TeacherDashboard v-if="isTeacher" :stats="data" :loading="isLoading" />

    <template v-else>
    <h1 class="text-h5 font-weight-bold mb-1">{{ t('dashboard.title') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ t('dashboard.subtitle') }}</p>

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

    <!-- ===== Super Admin: platform overview ===== -->
    <template v-if="isAdmin">
      <v-row class="mt-1">
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4">
            <div class="text-caption text-medium-emphasis">{{ t('dashboard.tuitionCollected') }}</div>
            <div class="text-h6 font-weight-bold text-success">{{ money(data?.revenueCollected) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4">
            <div class="text-caption text-medium-emphasis">{{ t('dashboard.outstanding') }}</div>
            <div class="text-h6 font-weight-bold text-warning">{{ money(data?.revenueOutstanding) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4">
            <div class="text-caption text-medium-emphasis">Assistants</div>
            <div class="text-h6 font-weight-bold">{{ data?.totalAssistants ?? 0 }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Usage counts -->
      <v-row class="mt-1">
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="info" rounded="lg" size="44">
                <v-icon color="white">mdi-file-document-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ data?.totalDocuments ?? 0 }}</div>
                <div class="text-caption text-medium-emphasis">Tài liệu</div>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" rounded="lg" size="44">
                <v-icon color="white">mdi-calendar-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ data?.totalSessions ?? 0 }}</div>
                <div class="text-caption text-medium-emphasis">Buổi học</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Signups over time (real) -->
      <v-card class="pa-5 mt-1 mb-1">
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Người dùng mới (6 tháng)</h3>
        <client-only>
          <apexchart
            v-if="signupSeries[0]?.data.length"
            type="area"
            height="280"
            :options="signupOptions"
            :series="signupSeries"
          />
        </client-only>
      </v-card>

      <!-- Subscription revenue chart -->
      <v-card class="pa-5 mt-1 mb-1">
        <div class="d-flex align-center justify-space-between mb-2">
          <h3 class="text-subtitle-1 font-weight-bold">Doanh thu gói đăng ký (6 tháng)</h3>
          <v-chip size="x-small" variant="tonal">V2 · placeholder</v-chip>
        </div>
        <client-only>
          <apexchart
            v-if="subChartSeries.length"
            type="bar"
            height="300"
            :options="subChartOptions"
            :series="subChartSeries"
          />
        </client-only>
      </v-card>

      <v-row class="mt-1">
        <!-- Subscription plans (placeholder until billing ships) -->
        <v-col cols="12" md="5">
          <v-card class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-subtitle-1 font-weight-bold">Gói đăng ký</h3>
              <v-chip size="x-small" variant="tonal">V2</v-chip>
            </div>
            <div class="d-flex flex-column ga-2">
              <div
                v-for="p in planList"
                :key="p.key"
                class="d-flex align-center justify-space-between"
              >
                <v-chip :color="p.color" size="small" variant="tonal">{{ p.label }}</v-chip>
                <span class="font-weight-bold">{{ p.value }}</span>
              </div>
            </div>
            <p class="text-caption text-medium-emphasis mt-3 mb-0">
              Tính năng gói cước & thanh toán sẽ áp dụng ở V2. Hiện mọi giáo viên tính là Trial.
            </p>
          </v-card>
        </v-col>

        <!-- Revenue by teacher -->
        <v-col cols="12" md="7">
          <v-card class="pa-5">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Doanh thu theo giáo viên</h3>
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Giáo viên</th>
                  <th class="text-right">Đã thu</th>
                  <th class="text-right">Tổng học phí</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in revenueByTeacher" :key="r.teacherId">
                  <td>{{ r.teacherName }}</td>
                  <td class="text-right text-success">{{ money(r.collected) }}</td>
                  <td class="text-right">{{ money(r.total) }}</td>
                </tr>
                <tr v-if="!revenueByTeacher.length">
                  <td colspan="3" class="text-center text-medium-emphasis pa-4">Chưa có dữ liệu học phí.</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- ===== Other roles: upcoming sessions ===== -->
    <template v-else>
      <v-card v-if="upcoming.length" class="mt-6">
        <v-card-title class="text-subtitle-1 font-weight-bold">{{ t('dashboard.upcomingSessions') }}</v-card-title>
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
        {{ t('dashboard.noUpcoming') }}
      </v-card>
    </template>
    </template>
  </div>
</template>
