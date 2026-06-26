<script setup lang="ts">
type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'missed';
type AssignmentFilter = 'all' | AssignmentStatus;

interface AssignmentItem {
  id: number;
  title: string;
  course: string;
  type: string;
  deadline: string;
  status: AssignmentStatus;
  score: number | null;
}

const selectedFilter = ref<AssignmentFilter>('all');

const assignments: AssignmentItem[] = [
  {
    id: 1,
    title: 'Writing Task 1: Line Graph',
    course: 'IELTS Intensive K42',
    type: 'Writing',
    deadline: 'Hôm nay, 23:59',
    status: 'pending',
    score: null,
  },
  {
    id: 2,
    title: 'Mock Test Listening #4',
    course: 'IELTS Intensive K42',
    type: 'Test',
    deadline: '27/06/2026',
    status: 'pending',
    score: null,
  },
  {
    id: 3,
    title: 'Bài tập từ vựng Unit 5',
    course: 'Giao tiếp phản xạ Level 2',
    type: 'Vocabulary',
    deadline: '15/06/2026',
    status: 'submitted',
    score: null,
  },
  {
    id: 4,
    title: 'Speaking Practice: Describe a place',
    course: 'IELTS Intensive K42',
    type: 'Speaking',
    deadline: '10/06/2026',
    status: 'graded',
    score: 7,
  },
  {
    id: 5,
    title: 'Reading: True/False/Not Given',
    course: 'IELTS Intensive K42',
    type: 'Reading',
    deadline: '05/06/2026',
    status: 'missed',
    score: 0,
  },
];

const filters = computed(() => [
  { id: 'all' as const, label: 'Tất cả' },
  { id: 'pending' as const, label: `Cần làm (${countByStatus('pending')})` },
  { id: 'submitted' as const, label: `Đã nộp chờ chấm (${countByStatus('submitted')})` },
  { id: 'graded' as const, label: `Đã có điểm (${countByStatus('graded')})` },
]);

const visibleAssignments = computed(() =>
  assignments.filter((item) => selectedFilter.value === 'all' || item.status === selectedFilter.value),
);

function countByStatus(status: AssignmentStatus) {
  return assignments.filter((item) => item.status === status).length;
}

function statusClass(status: AssignmentStatus) {
  return `is-${status}`;
}
</script>

<template>
  <div class="student-assignments">
    <header class="student-assignments__header">
      <div>
        <h1>Bài tập &amp; Test</h1>
        <p>Hoàn thành bài tập để nâng cao kỹ năng</p>
      </div>

      <div class="student-assignments__header-actions">
        <button class="student-assignments__filter-btn" type="button">
          <v-icon size="16">mdi-filter-variant</v-icon>
          Lọc
        </button>
      </div>
    </header>

    <section class="student-assignments__panel">
      <div class="student-assignments__tabs hide-scrollbar" aria-label="Lọc bài tập">
        <button
          v-for="filter in filters"
          :key="filter.id"
          :class="{ 'is-active': selectedFilter === filter.id }"
          type="button"
          @click="selectedFilter = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="student-assignments__list">
        <article
          v-for="item in visibleAssignments"
          :key="item.id"
          class="student-assignments__card"
        >
          <div class="student-assignments__card-info">
            <div :class="['student-assignments__icon-box', statusClass(item.status)]">
              <v-icon size="24">mdi-clipboard-text-outline</v-icon>
            </div>

            <div class="student-assignments__body">
              <div class="student-assignments__tags">
                <span>{{ item.course }}</span>
                <span>{{ item.type }}</span>
              </div>

              <h2>{{ item.title }}</h2>

              <div class="student-assignments__status">
                <span v-if="item.status === 'pending'" class="is-pending">
                  <v-icon size="16">mdi-clock-outline</v-icon>
                  Hạn chót: {{ item.deadline }}
                </span>
                <span v-else-if="item.status === 'submitted'" class="is-submitted">
                  <v-icon size="16">mdi-clock-outline</v-icon>
                  Đã nộp, chờ chấm
                </span>
                <span v-else-if="item.status === 'graded'" class="is-graded">
                  <v-icon size="16">mdi-check-circle-outline</v-icon>
                  Đã hoàn thành (Điểm: {{ item.score }})
                </span>
                <span v-else class="is-missed">
                  <v-icon size="16">mdi-alert-circle-outline</v-icon>
                  Quá hạn chưa nộp
                </span>
              </div>
            </div>
          </div>

          <div class="student-assignments__actions">
            <button v-if="item.status === 'pending'" class="student-assignments__primary" type="button">
              Làm bài ngay
            </button>
            <button
              v-else-if="item.status === 'graded' || item.status === 'submitted'"
              class="student-assignments__secondary"
              type="button"
            >
              Xem chi tiết
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.student-assignments {
  color: #0f172a;
  margin: 0 auto;
  max-width: 1152px;
  padding-bottom: 48px;
  width: 100%;
}

.student-assignments__header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.student-assignments__header h1 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.35;
  margin: 0;
}

.student-assignments__header p {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin: 4px 0 0;
}

.student-assignments__header-actions {
  align-items: center;
  display: flex;
  gap: 12px;
}

.student-assignments__filter-btn {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
  color: #334155;
  cursor: pointer;
  display: flex;
  font-size: 14px;
  font-weight: 700;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  transition: background 160ms ease, border-color 160ms ease;
}

.student-assignments__filter-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.student-assignments__panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
  overflow: hidden;
}

.student-assignments__tabs {
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  overflow-x: auto;
  padding: 0 8px;
}

.student-assignments__tabs button {
  border-bottom: 2px solid transparent;
  color: #64748b;
  cursor: pointer;
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 700;
  min-height: 56px;
  padding: 0 16px;
  transition: border-color 160ms ease, color 160ms ease;
  white-space: nowrap;
}

.student-assignments__tabs button:hover {
  border-color: #cbd5e1;
  color: #1e293b;
}

.student-assignments__tabs button.is-active {
  border-color: #0071f9;
  color: #0071f9;
}

.student-assignments__list {
  display: grid;
  gap: 16px;
  padding: 24px;
}

.student-assignments__card {
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 20px;
  transition: border-color 160ms ease;
}

.student-assignments__card:hover {
  border-color: #bfdbfe;
}

.student-assignments__card-info {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  min-width: 0;
}

.student-assignments__icon-box {
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  flex: 0 0 44px;
  height: 44px;
  justify-content: center;
  margin-top: 4px;
  width: 44px;
}

.student-assignments__icon-box.is-pending {
  background: #fff7ed;
  color: #f97316;
}

.student-assignments__icon-box.is-submitted {
  background: #eff6ff;
  color: #3b82f6;
}

.student-assignments__icon-box.is-graded {
  background: #ecfdf5;
  color: #10b981;
}

.student-assignments__icon-box.is-missed {
  background: #fef2f2;
  color: #ef4444;
}

.student-assignments__body {
  min-width: 0;
}

.student-assignments__tags {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.student-assignments__tags span {
  background: #f1f5f9;
  border-radius: 4px;
  color: #64748b;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  padding: 4px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-assignments__card h2 {
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.25;
  margin: 0 0 8px;
}

.student-assignments__status {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 500;
  gap: 16px;
}

.student-assignments__status span {
  align-items: center;
  display: inline-flex;
  gap: 4px;
}

.student-assignments__status .is-pending {
  color: #ea580c;
}

.student-assignments__status .is-submitted {
  color: #2563eb;
}

.student-assignments__status .is-graded {
  color: #059669;
}

.student-assignments__status .is-missed {
  color: #dc2626;
}

.student-assignments__actions {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
}

.student-assignments__primary,
.student-assignments__secondary {
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  min-height: 40px;
  padding: 0 24px;
  transition: background 160ms ease, border-color 160ms ease;
  white-space: nowrap;
}

.student-assignments__primary {
  background: #0071f9;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
  color: #fff;
}

.student-assignments__primary:hover {
  background: #1d4ed8;
}

.student-assignments__secondary {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #334155;
}

.student-assignments__secondary:hover {
  background: #f8fafc;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

@media (max-width: 768px) {
  .student-assignments__header {
    align-items: stretch;
    flex-direction: column;
  }

  .student-assignments__header-actions,
  .student-assignments__filter-btn {
    width: 100%;
  }

  .student-assignments__filter-btn {
    justify-content: center;
  }

  .student-assignments__list {
    padding: 16px;
  }

  .student-assignments__card {
    align-items: stretch;
    flex-direction: column;
  }

  .student-assignments__actions,
  .student-assignments__primary,
  .student-assignments__secondary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .student-assignments__card-info {
    gap: 12px;
  }

  .student-assignments__icon-box {
    flex-basis: 40px;
    height: 40px;
    width: 40px;
  }

  .student-assignments__card h2 {
    font-size: 16px;
  }
}
</style>
