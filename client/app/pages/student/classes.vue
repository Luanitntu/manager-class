<script setup lang="ts">
import { type ClassItem, useStudentClasses } from '~/composables/useClasses';

const search = ref('');
const { data, isLoading, error } = useStudentClasses();

const allClasses = computed(() => data.value?.data ?? []);
const classes = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return allClasses.value;

  return allClasses.value.filter((item) =>
    [item.name, item.level, item.description]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(keyword)),
  );
});

const activeCount = computed(() => allClasses.value.filter((item) => item.isActive).length);
const totalSessions = computed(() =>
  allClasses.value.reduce((sum, item) => sum + (item._count?.sessions ?? 0), 0),
);
const averageProgress = computed(() => {
  if (!allClasses.value.length) return 0;
  const total = allClasses.value.reduce((sum, item) => sum + progressValue(item), 0);
  return Math.round(total / allClasses.value.length);
});

const fallbackColors = ['#0071F9', '#10B981', '#6366F1', '#FF6B00', '#A855F7'];

function classColor(item: ClassItem, index: number) {
  return item.color || fallbackColors[index % fallbackColors.length] || '#0071F9';
}

function progressValue(item: ClassItem) {
  const sessions = item._count?.sessions ?? 0;
  if (sessions <= 0) return 0;
  return Math.min(96, Math.max(18, sessions * 5));
}

function lessonText(item: ClassItem) {
  const sessions = item._count?.sessions ?? 0;
  return sessions > 0 ? `${sessions} buổi học` : 'Chưa có buổi học';
}

function scheduleText(item: ClassItem) {
  const sessions = item._count?.sessions ?? 0;
  return sessions > 0 ? `${sessions} buổi đã lên lịch` : 'Chưa có lịch học';
}

function descriptionText(item: ClassItem) {
  return item.description || 'Theo dõi lịch học, tài liệu và tiến độ của bạn trong lớp này.';
}
</script>

<template>
  <div class="student-classroom">
    <header class="student-classroom-header">
      <div>
        <p class="student-classroom-eyebrow">Không gian học tập</p>
        <h1>Lớp học của tôi</h1>
        <span>Bạn đang tham gia {{ activeCount }} lớp học đang hoạt động</span>
      </div>

      <label class="student-classroom-search" for="student-class-search">
        <v-icon size="18">mdi-magnify</v-icon>
        <input
          id="student-class-search"
          v-model="search"
          autocomplete="off"
          placeholder="Tìm kiếm lớp học..."
          type="search"
        >
      </label>
    </header>

    <section class="student-classroom-stats" aria-label="Tổng quan lớp học">
      <article>
        <span class="student-classroom-stat-icon is-blue">
          <v-icon size="22">mdi-book-open-variant-outline</v-icon>
        </span>
        <small>Lớp đang học</small>
        <strong>{{ activeCount }}</strong>
      </article>
      <article>
        <span class="student-classroom-stat-icon is-green">
          <v-icon size="22">mdi-calendar-check-outline</v-icon>
        </span>
        <small>Buổi đã lên lịch</small>
        <strong>{{ totalSessions }}</strong>
      </article>
      <article>
        <span class="student-classroom-stat-icon is-orange">
          <v-icon size="22">mdi-target</v-icon>
        </span>
        <small>Tiến độ trung bình</small>
        <strong>{{ averageProgress }}%</strong>
      </article>
    </section>

    <v-alert v-if="error" class="student-classroom-alert" color="error" density="compact" variant="tonal">
      Không thể tải danh sách lớp học. Vui lòng thử lại sau.
    </v-alert>

    <section v-if="classes.length" class="student-classroom-grid" aria-label="Danh sách lớp học">
      <article
        v-for="(item, index) in classes"
        :key="item.id"
        class="student-classroom-card"
        :style="{ '--course-color': classColor(item, index) }"
      >
        <div class="student-classroom-card-bar" />

        <div class="student-classroom-card-body">
          <div class="student-classroom-card-top">
            <span class="student-classroom-level">{{ item.level || 'GENERAL' }}</span>
            <span class="student-classroom-status">
              <v-icon size="14">mdi-check-circle-outline</v-icon>
              {{ item.isActive ? 'Đang học' : 'Đã kết thúc' }}
            </span>
          </div>

          <h2>{{ item.name }}</h2>
          <p>{{ descriptionText(item) }}</p>

          <div class="student-classroom-metrics">
            <div>
              <span><v-icon size="15">mdi-book-open-page-variant-outline</v-icon> Bài học</span>
              <strong>{{ lessonText(item) }}</strong>
            </div>
            <div>
              <span><v-icon size="15">mdi-calendar-month-outline</v-icon> Lịch học</span>
              <strong>{{ scheduleText(item) }}</strong>
            </div>
          </div>

          <div class="student-classroom-progress">
            <div>
              <span>Tiến độ học tập</span>
              <strong>{{ progressValue(item) }}%</strong>
            </div>
            <v-progress-linear
              class="student-classroom-progress-bar"
              :color="classColor(item, index)"
              height="8"
              :model-value="progressValue(item)"
              rounded
            />
          </div>
        </div>

        <footer class="student-classroom-card-footer">
          <span>
            <v-icon size="16">mdi-account-check-outline</v-icon>
            Bạn đã tham gia
          </span>
          <NuxtLink to="/calendar">
            Xem lịch
            <v-icon size="16">mdi-chevron-right</v-icon>
          </NuxtLink>
        </footer>
      </article>
    </section>

    <section v-else class="student-classroom-empty">
      <v-progress-circular v-if="isLoading" color="primary" indeterminate size="34" />
      <template v-else>
        <v-icon size="42">mdi-google-classroom</v-icon>
        <strong>Chưa tham gia lớp học nào</strong>
        <span>Khi giáo viên thêm bạn vào lớp, lớp học sẽ xuất hiện tại đây.</span>
      </template>
    </section>
  </div>
</template>

<style scoped>
.student-classroom {
  color: #0f172a;
  margin: 0 auto;
  max-width: 1180px;
  padding-bottom: 32px;
  width: 100%;
}

.student-classroom-header {
  align-items: flex-end;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 22px;
}

.student-classroom-eyebrow {
  color: #0071f9;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.student-classroom-header h1 {
  color: #17233c;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.18;
  margin: 0;
}

.student-classroom-header span {
  color: #64748b;
  display: block;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  margin-top: 6px;
}

.student-classroom-search {
  align-items: center;
  background: #fff;
  border: 1px solid #dce5f1;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 4%);
  color: #8fa1bd;
  display: flex;
  flex: 0 0 360px;
  gap: 10px;
  height: 48px;
  padding: 0 16px;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.student-classroom-search:focus-within {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgb(13 110 253 / 14%);
}

.student-classroom-search input {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  min-width: 0;
  outline: none;
  width: 100%;
}

.student-classroom-search input::placeholder {
  color: #94a3b8;
}

.student-classroom-stats {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 24px;
}

.student-classroom-stats article {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(15 23 42 / 5%);
  display: grid;
  gap: 9px;
  min-height: 132px;
  padding: 20px;
}

.student-classroom-stat-icon {
  align-items: center;
  border-radius: 12px;
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.student-classroom-stat-icon.is-blue {
  background: #eff6ff;
  color: #0071f9;
}

.student-classroom-stat-icon.is-green {
  background: #ecfdf5;
  color: #059669;
}

.student-classroom-stat-icon.is-orange {
  background: #fff7ed;
  color: #f97316;
}

.student-classroom-stats small {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.student-classroom-stats strong {
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.student-classroom-alert {
  margin-bottom: 18px;
}

.student-classroom-grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.student-classroom-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(15 23 42 / 5%);
  display: flex;
  flex-direction: column;
  min-height: 365px;
  overflow: hidden;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.student-classroom-card:hover {
  border-color: color-mix(in srgb, var(--course-color) 42%, #dbeafe);
  box-shadow: 0 18px 38px rgb(15 23 42 / 10%);
  transform: translateY(-2px);
}

.student-classroom-card-bar {
  background: var(--course-color);
  height: 7px;
  width: 100%;
}

.student-classroom-card-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  padding: 20px;
}

.student-classroom-card-top {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.student-classroom-level {
  background: #f1f5f9;
  border-radius: 8px;
  color: #475569;
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
  max-width: 160px;
  overflow: hidden;
  padding: 7px 10px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.student-classroom-status {
  align-items: center;
  background: #ecfdf5;
  border-radius: 999px;
  color: #047857;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
  gap: 5px;
  line-height: 1;
  padding: 7px 10px;
}

.student-classroom-card h2 {
  color: #17233c;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
  margin: 0 0 8px;
}

.student-classroom-card p {
  color: #64748b;
  display: -webkit-box;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.55;
  margin: 0 0 18px;
  min-height: 44px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.student-classroom-metrics {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 18px;
}

.student-classroom-metrics div {
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  display: grid;
  gap: 6px;
  min-height: 76px;
  padding: 12px;
}

.student-classroom-metrics span {
  align-items: center;
  color: #64748b;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  gap: 6px;
  line-height: 1.2;
}

.student-classroom-metrics strong {
  color: #17233c;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
}

.student-classroom-progress {
  margin-top: auto;
}

.student-classroom-progress > div {
  align-items: center;
  display: flex;
  font-size: 13px;
  font-weight: 800;
  justify-content: space-between;
  margin-bottom: 8px;
}

.student-classroom-progress span {
  color: #475569;
}

.student-classroom-progress strong {
  color: var(--course-color);
}

.student-classroom-progress-bar {
  background: #eef2f7;
}

.student-classroom-card-footer {
  align-items: center;
  background: #f8fafc;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: space-between;
  min-height: 58px;
  padding: 13px 20px;
}

.student-classroom-card-footer span {
  align-items: center;
  color: #64748b;
  display: inline-flex;
  font-size: 13px;
  font-weight: 800;
  gap: 6px;
}

.student-classroom-card-footer a {
  align-items: center;
  color: #0071f9;
  display: inline-flex;
  font-size: 14px;
  font-weight: 800;
  gap: 4px;
  text-decoration: none;
}

.student-classroom-empty {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  color: #64748b;
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 340px;
  padding: 42px;
  text-align: center;
}

.student-classroom-empty strong {
  color: #17233c;
  font-size: 18px;
  font-weight: 800;
}

.student-classroom-empty span {
  font-size: 14px;
  font-weight: 700;
  max-width: 380px;
}

@media (max-width: 1180px) {
  .student-classroom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .student-classroom-header {
    align-items: stretch;
    flex-direction: column;
  }

  .student-classroom-search {
    flex-basis: auto;
    width: 100%;
  }

  .student-classroom-stats,
  .student-classroom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .student-classroom-header h1 {
    font-size: 26px;
  }

  .student-classroom-metrics {
    grid-template-columns: 1fr;
  }

  .student-classroom-card-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
