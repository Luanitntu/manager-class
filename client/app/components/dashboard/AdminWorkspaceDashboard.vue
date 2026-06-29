<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';
import type { DashboardStats, UpcomingSession } from '~/composables/useDashboard';
import { formatInZone } from '~/utils/datetime';
import { formatDashboardMoney } from '~/utils/dashboard';

const props = defineProps<{
  stats?: DashboardStats;
  isLoading?: boolean;
  role?: string | null;
}>();

interface SummaryCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

const { t, locale } = useI18n();
const userTz = useUserTimezone();

const isAdmin = computed(() => props.role === 'SUPER_ADMIN');
const upcoming = computed<UpcomingSession[]>(() => props.stats?.upcomingSessions ?? []);

const roleCards = computed<SummaryCard[]>(() => {
  const s = props.stats;
  if (!s) return [];

  switch (props.role) {
    case 'ASSISTANT':
      return [
        { label: t('dashboard.assignedClasses'), value: s.assignedClasses ?? 0, icon: 'mdi-google-classroom', color: 'primary' },
        { label: t('dashboard.totalSessions'), value: s.totalSessions ?? 0, icon: 'mdi-calendar', color: 'secondary' },
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

const planList = computed(() => {
  const p = props.stats?.plans;
  return [
    { key: 'trial', label: 'Trial', value: p?.trial ?? 0, color: 'grey' },
    { key: 'personal', label: 'Personal', value: p?.personal ?? 0, color: 'info' },
    { key: 'pro', label: 'Pro', value: p?.pro ?? 0, color: 'primary' },
    { key: 'business', label: 'Business', value: p?.business ?? 0, color: 'success' },
  ];
});

const revenueByTeacher = computed(() => props.stats?.revenueByTeacher ?? []);

const subRev = computed(() => props.stats?.subscriptionRevenue);
const subChartSeries = computed(() => {
  const r = subRev.value;
  if (!r) return [];
  return [
    { name: 'Personal', data: r.byPlan.personal },
    { name: 'Pro', data: r.byPlan.pro },
    { name: 'Business', data: r.byPlan.business },
  ];
});
const subChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
  colors: ['#49BEFF', '#5D87FF', '#13DEB9'],
  xaxis: { categories: subRev.value?.months ?? [] },
  legend: { position: 'top' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#eee' },
}));

const signups = computed(() => props.stats?.signups);
const signupSeries = computed(() => [
  { name: 'Người dùng mới', data: signups.value?.counts ?? [] },
]);
const signupOptions = computed<ApexOptions>(() => ({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#5D87FF'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
  dataLabels: { enabled: false },
  xaxis: { categories: signups.value?.months ?? [] },
  grid: { borderColor: '#eee' },
}));

function money(value?: number) {
  return formatDashboardMoney(value, locale.value);
}

function fmt(iso: string) {
  return formatInZone(iso, userTz.value, locale.value);
}
</script>

<template>
  <div class="admin-dashboard">
    <h1 class="text-h5 font-weight-bold mb-1">{{ t('dashboard.title') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ t('dashboard.subtitle') }}</p>

    <v-row>
      <v-col v-for="card in roleCards" :key="card.label" cols="12" md="3" sm="6">
        <v-card class="pa-4">
          <div class="d-flex align-center ga-3">
            <v-avatar :color="card.color" rounded="lg" size="44">
              <v-icon color="white">{{ card.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ card.value }}</div>
              <div class="text-caption text-medium-emphasis">{{ card.label }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <template v-if="isAdmin">
      <v-row class="mt-1">
        <v-col cols="12" md="3" sm="6">
          <v-card class="pa-4">
            <div class="text-caption text-medium-emphasis">{{ t('dashboard.tuitionCollected') }}</div>
            <div class="text-h6 font-weight-bold text-success">{{ money(stats?.revenueCollected) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="pa-4">
            <div class="text-caption text-medium-emphasis">{{ t('dashboard.outstanding') }}</div>
            <div class="text-h6 font-weight-bold text-warning">{{ money(stats?.revenueOutstanding) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="pa-4">
            <div class="text-caption text-medium-emphasis">Assistants</div>
            <div class="text-h6 font-weight-bold">{{ stats?.totalAssistants ?? 0 }}</div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-1">
        <v-col cols="12" md="3" sm="6">
          <v-card class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="info" rounded="lg" size="44">
                <v-icon color="white">mdi-file-document-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ stats?.totalDocuments ?? 0 }}</div>
                <div class="text-caption text-medium-emphasis">{{ t('nav.documents') }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" rounded="lg" size="44">
                <v-icon color="white">mdi-calendar-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ stats?.totalSessions ?? 0 }}</div>
                <div class="text-caption text-medium-emphasis">{{ t('dashboard.totalSessions') }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

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

      <v-card class="pa-5 mt-1 mb-1">
        <div class="d-flex align-center justify-space-between mb-2">
          <h3 class="text-subtitle-1 font-weight-bold">Doanh thu gói đăng ký (6 tháng)</h3>
          <v-chip size="x-small" variant="tonal">V2 - placeholder</v-chip>
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
        <v-col cols="12" md="5">
          <v-card class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-subtitle-1 font-weight-bold">Gói đăng ký</h3>
              <v-chip size="x-small" variant="tonal">V2</v-chip>
            </div>
            <v-list density="compact">
              <v-list-item v-for="plan in planList" :key="plan.key" class="px-0">
                <template #prepend>
                  <v-chip :color="plan.color" size="small" variant="tonal">{{ plan.label }}</v-chip>
                </template>
                <template #append>
                  <span class="font-weight-bold">{{ plan.value }}</span>
                </template>
              </v-list-item>
            </v-list>
            <p class="text-caption text-medium-emphasis mt-3 mb-0">
              Tính năng gói cước và thanh toán sẽ áp dụng ở V2. Hiện mọi giáo viên tính là Trial.
            </p>
          </v-card>
        </v-col>

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
                <tr v-for="row in revenueByTeacher" :key="row.teacherId">
                  <td>{{ row.teacherName }}</td>
                  <td class="text-right text-success">{{ money(row.collected) }}</td>
                  <td class="text-right">{{ money(row.total) }}</td>
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

    <template v-else>
      <v-card v-if="upcoming.length" class="mt-6">
        <v-card-title class="text-subtitle-1 font-weight-bold">{{ t('dashboard.upcomingSessions') }}</v-card-title>
        <v-list>
          <v-list-item v-for="session in upcoming" :key="session.id" to="/calendar">
            <template #prepend>
              <v-avatar :color="session.class.color || 'primary'" size="10" />
            </template>
            <v-list-item-title>{{ session.class.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ session.lessonTopic || 'No topic' }}</v-list-item-subtitle>
            <template #append>
              <span class="text-caption text-medium-emphasis">{{ fmt(session.startTime) }}</span>
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card v-else-if="!isLoading" class="mt-6 pa-8 text-center text-medium-emphasis">
        {{ t('dashboard.noUpcoming') }}
      </v-card>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '~/styles/dashboard/admin.scss';
</style>
