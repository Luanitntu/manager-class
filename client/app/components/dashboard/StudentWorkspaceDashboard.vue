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
    image: 'https://images.unsplash.com/photo-1499914485622-a88fac536970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGxhcHRvcCUyMGZvY3VzfGVufDF8fHx8MTc4MjEwMzQyNHww&ixlib=rb-4.1.0&q=80&w=1080',
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
    tone: 'blue',
  },
  {
    label: 'Mục tiêu hoàn thành',
    value: '65%',
    trend: '+5% so với tuần trước',
    up: true,
    icon: 'mdi-target',
    tone: 'indigo',
  },
  {
    label: 'Chuỗi học tập',
    value: '14 ngày',
    trend: 'Giữ vững phong độ',
    up: true,
    icon: 'mdi-fire',
    tone: 'orange',
  },
  {
    label: 'Bài tập cần làm',
    value: formatNumber(props.stats?.totalScores ? Math.max(0, 3 - props.stats.totalScores) : 2),
    trend: 'Sắp hết hạn',
    up: false,
    icon: 'mdi-shield-edit-outline',
    tone: 'red',
  },
]);

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

  <div v-else class="student-dashboard">
    <section class="student-dashboard__hero">
      <div class="student-dashboard__hero-copy">
        <span class="student-dashboard__pill student-dashboard__pill--light">
          <v-icon size="14">mdi-clock-outline</v-icon>
          Tiết học sắp tới
        </span>
        <h1>{{ nextSession?.title ?? 'IELTS Speaking Part 2' }}</h1>
        <p>
          Thời gian:
          <strong>{{ nextSession?.time ?? '19:00 - 20:30' }} {{ nextSession?.date?.toLowerCase() ?? 'hôm nay' }}</strong>
          <span> • Phòng: <strong>P.201</strong></span>
          <span> • Lớp: {{ nextSession?.course ?? 'IELTS Intensive K42' }}.</span>
          Đừng quên mang theo tài liệu học tập và nộp bài tập về nhà đúng hạn nhé!
        </p>
        <v-btn class="student-dashboard__hero-btn" variant="flat" to="/documents">
          <v-icon start size="18">mdi-book-open-variant-outline</v-icon>
          Xem tài liệu buổi học
        </v-btn>
      </div>
      <img
        alt="Student studying in class"
        class="student-dashboard__hero-img"
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50fGVufDF8fHx8MTc4MjEwMzQyNXww&ixlib=rb-4.1.0&q=80&w=1080"
      >
      <div class="student-dashboard__hero-glow" />
    </section>

    <section class="student-dashboard__stats" aria-label="Student stats">
      <article v-for="item in statCards" :key="item.label" class="student-dashboard__stat-card">
        <div class="student-dashboard__stat-top">
          <span :class="['student-dashboard__stat-icon', `is-${item.tone}`]">
            <v-icon size="22">{{ item.icon }}</v-icon>
          </span>
          <span :class="['student-dashboard__trend', { 'is-down': !item.up }]">{{ item.trend }}</span>
        </div>
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <section class="student-dashboard__content">
      <div class="student-dashboard__main-column">
        <section>
          <header class="student-dashboard__section-header">
            <h2>Lịch học sắp tới</h2>
            <NuxtLink to="/calendar">Xem tất cả lịch</NuxtLink>
          </header>
          <div class="student-dashboard__lesson-grid">
            <article
              v-for="session in upcomingSessions"
              :key="session.id"
              :class="['student-dashboard__lesson-card', { 'is-urgent': session.isUrgent }]"
            >
              <div class="student-dashboard__lesson-head">
                <span>{{ session.course }}</span>
                <small v-if="session.isUrgent">
                  <v-icon size="12">mdi-clock-outline</v-icon>
                  Sắp bắt đầu
                </small>
              </div>
              <h3>{{ session.title }}</h3>
              <p><v-icon size="16">mdi-calendar-month-outline</v-icon>{{ session.date }} • {{ session.time }}</p>
              <p>
                <v-icon size="16">{{ session.isOnline ? 'mdi-video-outline' : 'mdi-book-open-variant-outline' }}</v-icon>
                {{ session.isOnline ? 'Học trực tuyến (Google Meet)' : 'Học tại trung tâm' }}
              </p>
              <v-btn :class="{ 'is-primary': session.isUrgent }" block flat>
                <v-icon start size="18">{{ session.isOnline ? 'mdi-play-circle-outline' : 'mdi-calendar-check-outline' }}</v-icon>
                {{ session.isOnline ? 'Vào lớp học' : 'Xem chi tiết' }}
              </v-btn>
            </article>
          </div>
        </section>

        <section>
          <header class="student-dashboard__section-header">
            <h2>Khoá học của tôi</h2>
          </header>
          <div class="student-dashboard__courses">
            <article v-for="course in courses" :key="course.id" class="student-dashboard__course-card">
              <div class="student-dashboard__course-image">
                <img :src="course.image" :alt="course.name">
              </div>
              <div class="student-dashboard__course-body">
                <div class="student-dashboard__course-title">
                  <h3>{{ course.name }}</h3>
                  <span>Mục tiêu: {{ course.target }}</span>
                </div>
                <div class="student-dashboard__progress-meta">
                  <span>Đã hoàn thành {{ course.completedLessons }}/{{ course.totalLessons }} buổi</span>
                  <strong>{{ course.progress }}%</strong>
                </div>
                <v-progress-linear :color="course.color" height="8" :model-value="course.progress" rounded />
              </div>
              <v-btn class="student-dashboard__course-arrow" icon variant="outlined">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </article>
          </div>
        </section>
      </div>

      <aside class="student-dashboard__side-column">
        <section class="student-dashboard__panel">
          <header>
            <v-icon size="18">mdi-clipboard-text-outline</v-icon>
            <h2>Nhiệm vụ & Bài tập</h2>
          </header>
          <div class="student-dashboard__task-list">
            <article v-for="task in tasks" :key="task.id" class="student-dashboard__task">
              <v-icon v-if="task.status === 'done'" size="18" color="#10b981">mdi-check-circle-outline</v-icon>
              <span v-else class="student-dashboard__task-radio" />
              <div>
                <h3 :class="{ 'is-done': task.status === 'done' }">{{ task.title }}</h3>
                <p>{{ task.course }}</p>
                <div v-if="task.status === 'pending'" class="student-dashboard__deadline">
                  <span><v-icon size="10">mdi-clock-outline</v-icon> Hạn: {{ task.deadline }}</span>
                  <button type="button">Làm bài</button>
                </div>
              </div>
            </article>
          </div>
          <NuxtLink class="student-dashboard__panel-link" to="/documents">Xem tất cả bài tập</NuxtLink>
        </section>

        <section class="student-dashboard__study-panel">
          <div class="student-dashboard__study-orb" />
          <h2>Thống kê học tập</h2>
          <div class="student-dashboard__study-grid">
            <div>
              <span>Giờ học tuần này</span>
              <strong>12.5h</strong>
            </div>
            <div>
              <span>Điểm TB Tests</span>
              <strong>7.5 <small>/9.0</small></strong>
            </div>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.student-dashboard {
  --student-blue: #0071f9;
  --student-blue-2: #338fff;
  --student-text: #0f172a;
  --student-muted: #64748b;
  --student-border: #e2e8f0;
  color: var(--student-text);
  margin: 0 auto;
  max-width: 1152px;
  padding-bottom: 48px;
}

.student-dashboard__hero {
  align-items: center;
  background: linear-gradient(90deg, var(--student-blue), var(--student-blue-2));
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 10%);
  color: #fff;
  display: flex;
  justify-content: space-between;
  min-height: 272px;
  overflow: hidden;
  position: relative;
}

.student-dashboard__hero-copy {
  max-width: 640px;
  padding: 32px;
  position: relative;
  z-index: 2;
}

.student-dashboard__hero-copy h1 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.2;
  margin: 24px 0 14px;
}

.student-dashboard__hero-copy p {
  color: #dbeafe;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.65;
  margin: 0;
}

.student-dashboard__hero-copy p strong {
  color: #fff;
  font-weight: 800;
}

.student-dashboard__pill {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  gap: 6px;
  padding: 5px 12px;
}

.student-dashboard__pill--light {
  background: rgb(255 255 255 / 20%);
  backdrop-filter: blur(6px);
}

.student-dashboard__hero-btn {
  background: #fff !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 2px rgb(15 23 42 / 12%) !important;
  color: var(--student-blue) !important;
  font-size: 14px;
  font-weight: 800;
  height: 41px !important;
  letter-spacing: 0;
  margin-top: 26px;
  padding: 0 20px !important;
}

.student-dashboard__hero-img {
  bottom: 0;
  height: 100%;
  mix-blend-mode: overlay;
  object-fit: cover;
  opacity: 0.6;
  position: absolute;
  right: 0;
  top: 0;
  width: 34%;
}

.student-dashboard__hero-glow {
  background: rgb(255 255 255 / 18%);
  border-radius: 999px;
  filter: blur(64px);
  height: 192px;
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  width: 192px;
}

.student-dashboard__stats {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 24px;
}

.student-dashboard__stat-card,
.student-dashboard__lesson-card,
.student-dashboard__course-card,
.student-dashboard__panel {
  background: #fff;
  border: 1px solid var(--student-border);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
}

.student-dashboard__stat-card {
  display: grid;
  gap: 8px;
  min-height: 144px;
  padding: 20px;
}

.student-dashboard__stat-card > span {
  color: #536783;
  font-size: 14px;
  font-weight: 600;
}

.student-dashboard__stat-card > strong {
  color: #0f172a;
  font-size: 25px;
  font-weight: 800;
  line-height: 1;
}

.student-dashboard__stat-top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.student-dashboard__stat-icon {
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.student-dashboard__stat-icon.is-blue {
  color: var(--student-blue);
}

.student-dashboard__stat-icon.is-indigo {
  color: #6366f1;
}

.student-dashboard__stat-icon.is-orange {
  color: #ff6b00;
}

.student-dashboard__stat-icon.is-red {
  color: #f97316;
}

.student-dashboard__trend {
  background: #ecfdf5;
  border-radius: 999px;
  color: #059669;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 9px;
}

.student-dashboard__trend.is-down {
  background: #fef2f2;
  color: #ef4444;
}

.student-dashboard__content {
  display: grid;
  gap: 32px;
  grid-template-columns: minmax(0, 2fr) minmax(294px, 1fr);
  margin-top: 28px;
}

.student-dashboard__main-column,
.student-dashboard__side-column {
  display: grid;
  gap: 32px;
}

.student-dashboard__section-header {
  align-items: end;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.student-dashboard__section-header h2 {
  color: #0f172a;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
}

.student-dashboard__section-header a {
  color: var(--student-blue);
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

.student-dashboard__lesson-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.student-dashboard__lesson-card {
  padding: 20px;
  transition: box-shadow 180ms ease, border-color 180ms ease;
}

.student-dashboard__lesson-card.is-urgent {
  border-color: #60a5fa;
  box-shadow: 0 4px 12px rgb(0 113 249 / 18%);
  outline: 1px solid #dbeafe;
}

.student-dashboard__lesson-card h3 {
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0;
  margin: 14px 0 16px;
}

.student-dashboard__lesson-card p {
  align-items: center;
  color: #475569;
  display: flex;
  font-size: 14px;
  font-weight: 600;
  gap: 8px;
  margin: 0 0 9px;
}

.student-dashboard__lesson-card .v-btn {
  background: #f1f5f9 !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  color: #334155 !important;
  font-size: 14px;
  font-weight: 800;
  height: 40px !important;
  letter-spacing: 0;
  margin-top: 16px;
  min-width: 0 !important;
  width: 100% !important;
}

.student-dashboard__lesson-card .v-btn.is-primary {
  background: var(--student-blue) !important;
  color: #fff !important;
}

.student-dashboard__lesson-head {
  align-items: start;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.student-dashboard__lesson-head span {
  background: #f1f5f9;
  border-radius: 7px;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 10px;
}

.student-dashboard__lesson-head small {
  align-items: center;
  background: #fef2f2;
  border-radius: 999px;
  color: #ef4444;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  gap: 4px;
  padding: 4px 8px;
  white-space: nowrap;
}

.student-dashboard__courses {
  display: grid;
  gap: 16px;
}

.student-dashboard__course-card {
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: 16px;
  grid-template-columns: 96px minmax(0, 1fr) 40px;
  padding: 16px 20px;
  transition: border-color 180ms ease;
}

.student-dashboard__course-card:hover {
  border-color: #bfdbfe;
}

.student-dashboard__course-image {
  border-radius: 8px;
  height: 80px;
  overflow: hidden;
}

.student-dashboard__course-image img {
  height: 100%;
  object-fit: cover;
  transition: transform 500ms ease;
  width: 100%;
}

.student-dashboard__course-card:hover .student-dashboard__course-image img {
  transform: scale(1.05);
}

.student-dashboard__course-body {
  min-width: 0;
}

.student-dashboard__course-title,
.student-dashboard__progress-meta {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.student-dashboard__course-title {
  gap: 12px;
  margin-bottom: 10px;
}

.student-dashboard__course-title h3 {
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0;
  min-width: 0;
}

.student-dashboard__course-title span {
  background: #f1f5f9;
  border-radius: 6px;
  color: #64748b;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
  padding: 2px 8px;
}

.student-dashboard__progress-meta {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.student-dashboard__progress-meta strong {
  color: #334155;
  font-weight: 800;
}

.student-dashboard__course-arrow {
  border-color: #e2e8f0 !important;
  color: #94a3b8 !important;
  height: 40px !important;
  width: 40px !important;
}

.student-dashboard__panel {
  overflow: hidden;
}

.student-dashboard__panel header {
  align-items: center;
  background: #f8fafc;
  border-bottom: 1px solid var(--student-border);
  color: #475569;
  display: flex;
  gap: 8px;
  min-height: 64px;
  padding: 0 16px;
}

.student-dashboard__panel header h2 {
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0;
}

.student-dashboard__task-list {
  display: grid;
}

.student-dashboard__task {
  align-items: start;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 12px;
  padding: 17px 16px;
}

.student-dashboard__task h3 {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
  margin-bottom: 4px;
}

.student-dashboard__task h3.is-done {
  color: #94a3b8;
  text-decoration: line-through;
}

.student-dashboard__task p {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  margin: 0 0 8px;
}

.student-dashboard__task-radio {
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  height: 16px;
  margin-top: 2px;
  width: 16px;
}

.student-dashboard__deadline {
  align-items: center;
  display: flex;
  gap: 12px;
}

.student-dashboard__deadline span {
  align-items: center;
  background: #fff7ed;
  border-radius: 5px;
  color: #ea580c;
  display: inline-flex;
  font-size: 10px;
  font-weight: 800;
  gap: 4px;
  padding: 3px 8px;
}

.student-dashboard__deadline button {
  color: var(--student-blue);
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.student-dashboard__panel-link {
  color: #475569;
  display: block;
  font-size: 14px;
  font-weight: 800;
  padding: 14px;
  text-align: center;
  text-decoration: none;
}

.student-dashboard__panel-link:hover {
  background: #f8fafc;
  color: #0f172a;
}

.student-dashboard__study-panel {
  background: #1e293b;
  border-radius: 12px;
  color: #fff;
  overflow: hidden;
  padding: 20px;
  position: relative;
}

.student-dashboard__study-panel h2 {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
  margin-bottom: 16px;
  position: relative;
}

.student-dashboard__study-orb {
  background: rgb(255 255 255 / 5%);
  border-radius: 50%;
  filter: blur(40px);
  height: 128px;
  position: absolute;
  right: -64px;
  top: -64px;
  width: 128px;
}

.student-dashboard__study-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.student-dashboard__study-grid div {
  background: rgb(255 255 255 / 10%);
  border-radius: 8px;
  padding: 12px;
}

.student-dashboard__study-grid span {
  color: #cbd5e1;
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}

.student-dashboard__study-grid strong {
  font-size: 20px;
  font-weight: 800;
}

.student-dashboard__study-grid strong small {
  font-size: 14px;
  font-weight: 400;
}

@media (max-width: 1180px) {
  .student-dashboard__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .student-dashboard__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .student-dashboard__hero {
    align-items: stretch;
  }

  .student-dashboard__hero-img,
  .student-dashboard__hero-glow {
    display: none;
  }

  .student-dashboard__hero-copy {
    padding: 24px;
  }

  .student-dashboard__hero-copy h1 {
    font-size: 26px;
  }

  .student-dashboard__stats,
  .student-dashboard__lesson-grid {
    grid-template-columns: 1fr;
  }

  .student-dashboard__course-card {
    align-items: start;
    grid-template-columns: 1fr;
  }

  .student-dashboard__course-image {
    height: 128px;
  }

  .student-dashboard__course-arrow {
    display: none;
  }
}
</style>
