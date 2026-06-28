<script setup lang="ts">
import { type Score, useStudentTestScores } from '~/composables/useStudents';

type TestFilter = 'ALL' | 'QUIZ' | 'ASSIGNMENT' | 'MIDTERM' | 'FINAL' | 'CUSTOM';

const search = ref('');
const selectedType = ref<TestFilter>('ALL');
const { data, isLoading, error } = useStudentTestScores();

const tests = computed(() => data.value ?? []);
const filteredTests = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return tests.value.filter((item) => {
    const matchesType = selectedType.value === 'ALL' || item.type === selectedType.value;
    const matchesSearch = !keyword || [
      item.label,
      typeLabel(item.type),
      item.class?.name,
    ]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(keyword));

    return matchesType && matchesSearch;
  });
});

const typeFilters: Array<{ label: string; value: TestFilter }> = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Quiz', value: 'QUIZ' },
  { label: 'Bài tập', value: 'ASSIGNMENT' },
  { label: 'Giữa kỳ', value: 'MIDTERM' },
  { label: 'Cuối kỳ', value: 'FINAL' },
  { label: 'Khác', value: 'CUSTOM' },
];

const averageScore = computed(() => {
  if (!tests.value.length) return 0;
  const total = tests.value.reduce((sum, item) => sum + percentValue(item), 0);
  return Math.round(total / tests.value.length);
});

const highestScore = computed(() => {
  if (!tests.value.length) return 0;
  return Math.max(...tests.value.map(percentValue));
});

const latestTest = computed(() => tests.value[0]);
const completedCount = computed(() => tests.value.length);

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    QUIZ: 'Quiz',
    ASSIGNMENT: 'Bài tập',
    MIDTERM: 'Giữa kỳ',
    FINAL: 'Cuối kỳ',
    CUSTOM: 'Bài kiểm tra',
  };
  return labels[type] ?? type;
}

function testTitle(item: Score) {
  return item.label || typeLabel(item.type);
}

function scoreText(item: Score) {
  return `${formatScore(item.value)} / ${formatScore(item.maxValue)}`;
}

function percentValue(item: Score) {
  const value = Number(item.value);
  const max = Number(item.maxValue);
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.round((value / max) * 100);
}

function formatScore(value: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  return Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function scoreTone(item: Score) {
  const percent = percentValue(item);
  if (percent >= 85) return 'is-strong';
  if (percent >= 65) return 'is-good';
  return 'is-watch';
}
</script>

<template>
  <div class="student-tests">
    <header class="student-tests__header">
      <div>
        <p class="student-tests__eyebrow">Không gian học tập</p>
        <h1>Bài kiểm tra</h1>
        <span>{{ completedCount }} bài đã có điểm</span>
      </div>

      <label class="student-tests__search" for="student-test-search">
        <v-icon size="18">mdi-magnify</v-icon>
        <input
          id="student-test-search"
          v-model="search"
          autocomplete="off"
          placeholder="Tìm bài kiểm tra..."
          type="search"
        >
      </label>
    </header>

    <section class="student-tests__summary" aria-label="Tổng quan bài kiểm tra">
      <article>
        <span class="student-tests__summary-icon is-blue">
          <v-icon size="22">mdi-clipboard-check-outline</v-icon>
        </span>
        <small>Đã chấm điểm</small>
        <strong>{{ completedCount }}</strong>
      </article>
      <article>
        <span class="student-tests__summary-icon is-green">
          <v-icon size="22">mdi-chart-line</v-icon>
        </span>
        <small>Điểm trung bình</small>
        <strong>{{ averageScore }}%</strong>
      </article>
      <article>
        <span class="student-tests__summary-icon is-orange">
          <v-icon size="22">mdi-trophy-outline</v-icon>
        </span>
        <small>Kết quả cao nhất</small>
        <strong>{{ highestScore }}%</strong>
      </article>
      <article>
        <span class="student-tests__summary-icon is-violet">
          <v-icon size="22">mdi-calendar-clock-outline</v-icon>
        </span>
        <small>Mới nhất</small>
        <strong>{{ latestTest ? formatDate(latestTest.createdAt) : '--' }}</strong>
      </article>
    </section>

    <section class="student-tests__toolbar">
      <div class="student-tests__tabs" aria-label="Lọc bài kiểm tra">
        <button
          v-for="item in typeFilters"
          :key="item.value"
          :class="{ 'is-active': selectedType === item.value }"
          type="button"
          @click="selectedType = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <v-alert v-if="error" class="student-tests__alert" color="error" density="compact" variant="tonal">
      Không thể tải danh sách bài kiểm tra. Vui lòng thử lại sau.
    </v-alert>

    <section v-if="filteredTests.length" class="student-tests__list" aria-label="Danh sách bài kiểm tra">
      <article
        v-for="item in filteredTests"
        :key="item.id"
        :class="['student-tests__card', scoreTone(item)]"
      >
        <div class="student-tests__card-main">
          <span class="student-tests__type">{{ typeLabel(item.type) }}</span>
          <h2>{{ testTitle(item) }}</h2>
          <p>{{ item.class?.name ?? 'Lớp học' }}</p>
          <div class="student-tests__meta">
            <span>
              <v-icon size="16">mdi-calendar-month-outline</v-icon>
              {{ formatDate(item.createdAt) }}
            </span>
            <span>
              <v-icon size="16">mdi-book-open-variant-outline</v-icon>
              {{ item.class?.name ?? 'Chưa gắn lớp' }}
            </span>
          </div>
        </div>

        <div class="student-tests__score">
          <strong>{{ scoreText(item) }}</strong>
          <span>{{ percentValue(item) }}%</span>
          <v-progress-linear
            class="student-tests__progress"
            height="8"
            :model-value="percentValue(item)"
            rounded
          />
        </div>
      </article>
    </section>

    <section v-else class="student-tests__empty">
      <v-progress-circular v-if="isLoading" color="primary" indeterminate size="34" />
      <template v-else>
        <v-icon size="42">mdi-clipboard-text-off-outline</v-icon>
        <strong>Chưa có bài kiểm tra</strong>
        <span>Khi giáo viên nhập điểm, kết quả sẽ xuất hiện tại đây.</span>
      </template>
    </section>
  </div>
</template>

<style scoped>
.student-tests {
  color: #0f172a;
  margin: 0 auto;
  max-width: 1180px;
  padding-bottom: 32px;
  width: 100%;
}

.student-tests__header {
  align-items: flex-end;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 22px;
}

.student-tests__eyebrow {
  color: #0071f9;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.student-tests__header h1 {
  color: #17233c;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.18;
  margin: 0;
}

.student-tests__header span {
  color: #64748b;
  display: block;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  margin-top: 6px;
}

.student-tests__search {
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

.student-tests__search:focus-within {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgb(13 110 253 / 14%);
}

.student-tests__search input {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  min-width: 0;
  outline: none;
  width: 100%;
}

.student-tests__search input::placeholder {
  color: #94a3b8;
}

.student-tests__summary {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 22px;
}

.student-tests__summary article {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgb(15 23 42 / 5%);
  display: grid;
  gap: 9px;
  min-height: 132px;
  padding: 20px;
}

.student-tests__summary-icon {
  align-items: center;
  border-radius: 10px;
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.student-tests__summary-icon.is-blue {
  background: #eff6ff;
  color: #0071f9;
}

.student-tests__summary-icon.is-green {
  background: #ecfdf5;
  color: #059669;
}

.student-tests__summary-icon.is-orange {
  background: #fff7ed;
  color: #f97316;
}

.student-tests__summary-icon.is-violet {
  background: #f5f3ff;
  color: #7c3aed;
}

.student-tests__summary small {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.student-tests__summary strong {
  color: #0f172a;
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}

.student-tests__toolbar {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 4%);
  margin-bottom: 20px;
  padding: 14px;
}

.student-tests__tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.student-tests__tabs::-webkit-scrollbar {
  display: none;
}

.student-tests__tabs button {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 800;
  min-height: 34px;
  padding: 0 16px;
}

.student-tests__tabs button.is-active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #0071f9;
}

.student-tests__alert {
  margin-bottom: 18px;
}

.student-tests__list {
  display: grid;
  gap: 14px;
}

.student-tests__card {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-left: 6px solid #0071f9;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 5%);
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 220px;
  padding: 20px;
}

.student-tests__card.is-strong {
  border-left-color: #059669;
}

.student-tests__card.is-good {
  border-left-color: #0071f9;
}

.student-tests__card.is-watch {
  border-left-color: #f97316;
}

.student-tests__card-main {
  min-width: 0;
}

.student-tests__type {
  background: #f1f5f9;
  border-radius: 7px;
  color: #475569;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 10px;
  padding: 7px 10px;
}

.student-tests__card h2 {
  color: #17233c;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
  margin: 0 0 6px;
}

.student-tests__card p {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 14px;
}

.student-tests__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.student-tests__meta span {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  color: #536783;
  display: inline-flex;
  font-size: 13px;
  font-weight: 800;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
}

.student-tests__score {
  display: grid;
  gap: 9px;
  justify-items: end;
  min-width: 0;
}

.student-tests__score strong {
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.student-tests__score span {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.student-tests__progress {
  width: 100%;
}

.student-tests__card.is-strong .student-tests__progress {
  color: #059669;
}

.student-tests__card.is-good .student-tests__progress {
  color: #0071f9;
}

.student-tests__card.is-watch .student-tests__progress {
  color: #f97316;
}

.student-tests__empty {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 340px;
  padding: 42px;
  text-align: center;
}

.student-tests__empty strong {
  color: #17233c;
  font-size: 18px;
  font-weight: 800;
}

.student-tests__empty span {
  font-size: 14px;
  font-weight: 700;
  max-width: 380px;
}

@media (max-width: 1040px) {
  .student-tests__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .student-tests__header {
    align-items: stretch;
    flex-direction: column;
  }

  .student-tests__search {
    flex-basis: auto;
    width: 100%;
  }

  .student-tests__card {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .student-tests__score {
    justify-items: stretch;
  }
}

@media (max-width: 560px) {
  .student-tests__header h1 {
    font-size: 26px;
  }

  .student-tests__summary {
    grid-template-columns: 1fr;
  }
}
</style>
