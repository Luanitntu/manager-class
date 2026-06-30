<script setup lang="ts">
import type { DashboardStats, UpcomingSession } from '~/composables/useDashboard';

const props = defineProps<{
  stats?: DashboardStats;
  isLoading?: boolean;
}>();

interface CourseCard {
  id: number;
  name: string;
  target: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  color: string;
  image: string;
}

interface StudentSession {
  id: string | number;
  title: string;
  course: string;
  time: string;
  date: string;
  isOnline: boolean;
  isUrgent: boolean;
}

const courses: CourseCard[] = [
  {
    id: 1,
    name: 'IELTS Intensive K42',
    target: '6.5+',
    progress: 65,
    totalLessons: 24,
    completedLessons: 15,
    color: '#0071f9',
    image: 'https://images.unsplash.com/photo-1601392561050-340745ba9c25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwY2xhc3MlMjBzdHVkZW50fGVufDF8fHx8MTc4MjEwMzQyNXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    name: 'Giao tiếp phản xạ Level 2',
    target: 'B1',
    progress: 30,
    totalLessons: 20,
    completedLessons: 6,
    color: '#10b981',
    image: 'https://images.unsplash.com/photo-1499914485622-a88fac536970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxzdHVkeSUyMGxhcHRvcCUyMGZvY3VzfGVufDF8fHx8MTc4MjEwMzQyNHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const tasks = [
  { id: 1, title: 'Writing Task 1: Line Graph', course: 'IELTS Intensive K42', deadline: '23:59 - 25/06', status: 'pending' },
  { id: 2, title: 'Mock Test Listening #4', course: 'IELTS Intensive K42', deadline: '23:59 - 27/06', status: 'pending' },
  { id: 3, title: 'Bài tập từ vựng Unit 5', course: 'Giao tiếp phản xạ Level 2', deadline: 'Hoàn thành', status: 'done' },
];

const upcomingSessions = computed<StudentSession[]>(() => {
  const sessions = props.stats?.upcomingSessions ?? [];
  if (!sessions.length) {
    return [
      {
        id: 1,
        title: 'IELTS Speaking Part 2',
        course: 'IELTS Intensive K42',
        time: '19:00 - 20:30',
        date: 'Hôm nay',
        isOnline: true,
        isUrgent: true,
      },
      {
        id: 2,
        title: 'Luyện tập phản xạ tự nhiên',
        course: 'Giao tiếp phản xạ Level 2',
        time: '18:30 - 20:00',
        date: 'Ngày mai',
        isOnline: false,
        isUrgent: false,
      },
    ];
  }

  return sessions.slice(0, 2).map((session, index) => ({
    id: session.id,
    title: session.lessonTopic || session.class.name,
    course: session.class.name,
    time: sessionTime(session),
    date: sessionDay(session),
    isOnline: index === 0,
    isUrgent: index === 0,
  }));
});

const nextSession = computed(() => upcomingSessions.value[0]);

const statCards = computed(() => [
  {
    label: 'Khóa đang học',
    value: formatNumber(props.stats?.currentClasses ?? courses.length),
    trend: 'Đang theo tiến độ',
    up: true,
    icon: 'mdi-book-open-variant-outline',
    tone: 'primary',
  },
  {
    label: 'Mục tiêu hoàn thành',
    value: '65%',
    trend: '+5% so với tuần trước',
    up: true,
    icon: 'mdi-target',
    tone: 'info',
  },
  {
    label: 'Chuỗi học tập',
    value: '14 ngày',
    trend: 'Giữ vững phong độ',
    up: true,
    icon: 'mdi-fire',
    tone: 'warning',
  },
  {
    label: 'Bài tập cần làm',
    value: formatNumber(props.stats?.totalScores ? Math.max(0, 3 - props.stats.totalScores) : 2),
    trend: 'Sắp hết hạn',
    up: false,
    icon: 'mdi-shield-edit-outline',
    tone: 'danger',
  },
] as const);

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString('vi-VN');
}

function sessionTime(session: UpcomingSession) {
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  return `${timeOnly(start)} - ${timeOnly(end)}`;
}

function sessionDay(session: UpcomingSession) {
  const date = new Date(session.startTime);
  const today = new Date();
  const diff = startOfDay(date).getTime() - startOfDay(today).getTime();
  const dayDiff = Math.round(diff / 86_400_000);
  if (dayDiff === 0) return 'Hôm nay';
  if (dayDiff === 1) return 'Ngày mai';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function timeOnly(date: Date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
</script>

<template>
  <AppSkeleton v-if="isLoading && !stats" variant="dashboard" />

  <UiPage v-else width="default" padding="none">
    <div class="grid gap-6 pb-12">
      <section class="relative isolate grid min-h-[272px] overflow-hidden rounded-[var(--st-radius)] bg-[var(--st-primary)] text-white shadow-sm md:grid-cols-[minmax(0,1fr)_34%]">
        <div class="relative z-10 min-w-0 p-6 sm:p-8">
          <UiBadge tone="info" icon="mdi-clock-outline" class="border-white/20 bg-white/20 text-white">
            Tiết học sắp tới
          </UiBadge>

          <h1 class="mt-6 break-words text-2xl font-semibold leading-[var(--st-leading-tight)]">
            {{ nextSession?.title ?? 'IELTS Speaking Part 2' }}
          </h1>

          <p class="mt-4 max-w-3xl text-base font-normal leading-[var(--st-leading-copy)] text-blue-50">
            Thời gian:
            <strong class="font-semibold text-white">{{ nextSession?.time ?? '19:00 - 20:30' }} {{ nextSession?.date?.toLowerCase() ?? 'hôm nay' }}</strong>
            <span> • Phòng: <strong class="font-semibold text-white">P.201</strong></span>
            <span> • Lớp: {{ nextSession?.course ?? 'IELTS Intensive K42' }}.</span>
            Đừng quên mang theo tài liệu học tập và nộp bài tập về nhà đúng hạn nhé!
          </p>

          <UiButton class="mt-6" variant="secondary" to="/documents" leading-icon="mdi-book-open-variant-outline">
            Xem tài liệu buổi học
          </UiButton>
        </div>

        <img
          alt="Student studying in class"
          class="hidden h-full min-h-[272px] w-full object-cover opacity-60 mix-blend-overlay md:block"
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50fGVufDF8fHx8MTc4MjEwMzQyNXww&ixlib=rb-4.1.0&q=80&w=1080"
        >
      </section>

      <section aria-label="Student stats" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UiMetricCard
          v-for="item in statCards"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          class="min-h-36"
        >
          <template #icon>
            <span
              :class="[
                'inline-flex h-10 w-10 items-center justify-center rounded-[var(--st-radius)]',
                item.tone === 'primary' ? 'bg-blue-50 text-blue-700' : '',
                item.tone === 'info' ? 'bg-sky-50 text-sky-700' : '',
                item.tone === 'warning' ? 'bg-orange-50 text-orange-700' : '',
                item.tone === 'danger' ? 'bg-red-50 text-red-700' : '',
              ]"
            >
              <AppIcon :name="item.icon" :size="22" />
            </span>
          </template>
          <template #trend>
            <UiBadge :tone="item.up ? 'success' : 'danger'" size="sm">
              {{ item.trend }}
            </UiBadge>
          </template>
        </UiMetricCard>
      </section>

      <section class="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(294px,1fr)]">
        <div class="grid min-w-0 gap-8">
          <section class="min-w-0">
            <header class="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
              <h2 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
                Lịch học sắp tới
              </h2>
              <NuxtLink class="text-sm font-semibold text-[var(--st-primary)] hover:underline" to="/calendar">
                Xem tất cả lịch
              </NuxtLink>
            </header>

            <div class="grid gap-4 lg:grid-cols-2">
              <UiCard
                v-for="session in upcomingSessions"
                :key="session.id"
                :class="session.isUrgent ? 'border-blue-300 ring-1 ring-blue-100' : ''"
                padding="lg"
              >
                <div class="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <UiBadge tone="neutral">{{ session.course }}</UiBadge>
                  <UiBadge v-if="session.isUrgent" tone="danger" icon="mdi-clock-outline">
                    Sắp bắt đầu
                  </UiBadge>
                </div>

                <h3 class="mt-4 break-words text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
                  {{ session.title }}
                </h3>

                <div class="mt-4 grid gap-2 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                  <p class="flex min-w-0 items-start gap-2">
                    <AppIcon class="mt-0.5 shrink-0" name="mdi-calendar-month-outline" :size="16" />
                    <span class="min-w-0 break-words">{{ session.date }} • {{ session.time }}</span>
                  </p>
                  <p class="flex min-w-0 items-start gap-2">
                    <AppIcon class="mt-0.5 shrink-0" :name="session.isOnline ? 'mdi-video-outline' : 'mdi-book-open-variant-outline'" :size="16" />
                    <span class="min-w-0 break-words">
                      {{ session.isOnline ? 'Học trực tuyến (Google Meet)' : 'Học tại trung tâm' }}
                    </span>
                  </p>
                </div>

                <UiButton
                  class="mt-4 w-full"
                  :variant="session.isUrgent ? 'primary' : 'secondary'"
                  :leading-icon="session.isOnline ? 'mdi-play-circle-outline' : 'mdi-calendar-check-outline'"
                >
                  {{ session.isOnline ? 'Vào lớp học' : 'Xem chi tiết' }}
                </UiButton>
              </UiCard>
            </div>
          </section>

          <section class="min-w-0">
            <header class="mb-4">
              <h2 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
                Khoá học của tôi
              </h2>
            </header>

            <div class="grid gap-4">
              <UiCard
                v-for="course in courses"
                :key="course.id"
                padding="md"
                class="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)_44px] sm:items-center"
              >
                <div class="h-32 overflow-hidden rounded-[var(--st-radius)] sm:h-20">
                  <img class="h-full w-full object-cover" :src="course.image" :alt="course.name">
                </div>

                <div class="min-w-0">
                  <div class="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <h3 class="min-w-0 break-words text-base font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
                      {{ course.name }}
                    </h3>
                    <UiBadge tone="neutral">Mục tiêu: {{ course.target }}</UiBadge>
                  </div>

                  <div class="mt-3 flex min-w-0 items-center justify-between gap-3 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                    <span class="min-w-0 break-words">Đã hoàn thành {{ course.completedLessons }}/{{ course.totalLessons }} buổi</span>
                    <strong class="shrink-0 font-semibold text-[var(--st-text)]">{{ course.progress }}%</strong>
                  </div>
                  <UiProgress class="mt-2" :value="course.progress" />
                </div>

                <UiIconButton class="hidden sm:inline-flex" label="Xem chi tiết khoá học" icon="mdi-chevron-right" variant="secondary" />
              </UiCard>
            </div>
          </section>
        </div>

        <aside class="grid min-w-0 content-start gap-6">
          <UiCard padding="none" class="overflow-hidden">
            <header class="flex min-h-16 min-w-0 items-center gap-2 border-b border-[var(--st-border)] bg-slate-50 px-4">
              <AppIcon class="shrink-0 text-[var(--st-muted)]" name="mdi-clipboard-text-outline" :size="18" />
              <h2 class="min-w-0 break-words text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
                Nhiệm vụ & Bài tập
              </h2>
            </header>

            <UiList class="rounded-none border-0" divided>
              <UiListItem v-for="task in tasks" :key="task.id" class="items-start">
                <template #leading>
                  <AppIcon v-if="task.status === 'done'" name="mdi-check-circle-outline" class="mt-0.5 text-emerald-500" :size="18" />
                  <span v-else class="mt-1 block h-4 w-4 rounded-full border-2 border-slate-300" />
                </template>

                <h3 :class="['break-words text-sm font-semibold leading-[var(--st-leading-copy)]', task.status === 'done' ? 'text-slate-400 line-through' : 'text-[var(--st-text)]']">
                  {{ task.title }}
                </h3>
                <template #subtitle>
                  <span class="break-words">{{ task.course }}</span>
                  <div v-if="task.status === 'pending'" class="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                    <UiBadge tone="warning" size="sm" icon="mdi-clock-outline">
                      Hạn: {{ task.deadline }}
                    </UiBadge>
                    <button type="button" class="text-sm font-semibold text-[var(--st-primary)] hover:underline">
                      Làm bài
                    </button>
                  </div>
                </template>
              </UiListItem>
            </UiList>

            <NuxtLink class="block px-4 py-3 text-center text-sm font-semibold text-[var(--st-muted)] hover:bg-slate-50 hover:text-[var(--st-text)]" to="/documents">
              Xem tất cả bài tập
            </NuxtLink>
          </UiCard>

          <section class="min-w-0 rounded-[var(--st-radius)] bg-slate-800 p-5 text-white">
            <h2 class="text-base font-semibold leading-[var(--st-leading-copy)]">
              Thống kê học tập
            </h2>

            <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div class="min-w-0 rounded-[var(--st-radius)] bg-white/10 p-3">
                <span class="block text-sm font-normal leading-[var(--st-leading-copy)] text-slate-300">Giờ học tuần này</span>
                <strong class="mt-1 block break-words text-xl font-semibold leading-[var(--st-leading-tight)]">12.5h</strong>
              </div>
              <div class="min-w-0 rounded-[var(--st-radius)] bg-white/10 p-3">
                <span class="block text-sm font-normal leading-[var(--st-leading-copy)] text-slate-300">Điểm TB Tests</span>
                <strong class="mt-1 block break-words text-xl font-semibold leading-[var(--st-leading-tight)]">7.5 <small class="text-sm font-normal">/9.0</small></strong>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  </UiPage>
</template>
