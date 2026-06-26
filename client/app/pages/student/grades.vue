<script setup lang="ts">
import { type Score, useStudentTestScores } from '~/composables/useStudents';

interface CourseSummary {
  course: string;
  value: string;
  maxValue: string;
  note: string;
  variant: 'primary' | 'plain';
}

const { data, isLoading, error } = useStudentTestScores();

const grades = computed(() =>
  [...(data.value ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
);

const summaries = computed<CourseSummary[]>(() => {
  const byClass = new Map<string, Score[]>();

  for (const item of grades.value) {
    const course = item.class?.name ?? 'Lớp học';
    byClass.set(course, [...(byClass.get(course) ?? []), item]);
  }

  return Array.from(byClass.entries()).slice(0, 2).map(([course, items], index) => {
    const maxValue = mostCommon(items.map((item) => item.maxValue));
    const sameScaleItems = items.filter((item) => item.maxValue === maxValue);
    const value = average(sameScaleItems.map((item) => Number(item.value)));
    const percent = percentValue({ value, maxValue });

    return {
      course,
      value: formatScore(value),
      maxValue: formatScore(maxValue),
      note: index === 0
        ? improvementText(percent)
        : achievementText(percent),
      variant: index === 0 ? 'primary' : 'plain',
    };
  });
});

function mostCommon(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return values.slice().sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))[0] ?? '10';
}

function average(values: number[]) {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (!validValues.length) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function percentValue(item: { value: string | number; maxValue: string | number }) {
  const value = Number(item.value);
  const max = Number(item.maxValue);
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.round((value / max) * 100);
}

function formatScore(value: string | number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function titleText(item: Score) {
  return item.label || typeLabel(item.type);
}

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

function scoreColor(item: Score) {
  return percentValue(item) >= 80 ? 'is-emerald' : 'is-blue';
}

function improvementText(percent: number) {
  if (percent >= 78) return '+0.5 so với mục tiêu đầu vào';
  if (percent >= 60) return 'Đang tiến bộ ổn định';
  return 'Cần luyện tập thêm';
}

function achievementText(percent: number) {
  if (percent >= 85) return 'Đạt loại Giỏi';
  if (percent >= 65) return 'Đạt yêu cầu';
  return 'Cần củng cố kiến thức';
}
</script>

<template>
  <div class="student-grades">
    <header class="student-grades__header">
      <h1>Điểm số &amp; Đánh giá</h1>
      <p>Theo dõi sự tiến bộ của bạn qua các bài kiểm tra</p>
    </header>

    <v-alert v-if="error" class="student-grades__alert" color="error" density="compact" variant="tonal">
      Không thể tải điểm số. Vui lòng thử lại sau.
    </v-alert>

    <section v-if="summaries.length" class="student-grades__summary" aria-label="Tổng quan điểm số">
      <article
        v-for="summary in summaries"
        :key="summary.course"
        :class="['student-grades__summary-card', `is-${summary.variant}`]"
      >
        <v-icon class="student-grades__watermark" size="120">mdi-chart-line</v-icon>
        <div class="student-grades__summary-content">
          <div class="student-grades__course">{{ summary.course }}</div>
          <div class="student-grades__score">
            {{ summary.value }}
            <span>/ {{ summary.maxValue }}</span>
          </div>
          <div class="student-grades__note">
            <v-icon size="16">mdi-chart-line</v-icon>
            {{ summary.note }}
          </div>
        </div>
      </article>
    </section>

    <section class="student-grades__panel" aria-label="Lịch sử điểm số">
      <div class="student-grades__panel-head">
        <h2>Lịch sử điểm số</h2>
      </div>

      <div v-if="grades.length" class="student-grades__list">
        <article
          v-for="item in grades"
          :key="item.id"
          class="student-grades__row"
        >
          <div class="student-grades__info">
            <span class="student-grades__tag">{{ item.class?.name ?? 'Lớp học' }}</span>
            <h3>{{ titleText(item) }}</h3>
            <p>Ngày thi: {{ formatDate(item.createdAt) }}</p>
          </div>

          <div class="student-grades__result">
            <div class="student-grades__result-number">
              <strong :class="scoreColor(item)">{{ formatScore(item.value) }}</strong>
              <span>/{{ formatScore(item.maxValue) }}</span>
            </div>
            <button class="student-grades__detail" type="button" aria-label="Xem chi tiết điểm">
              <v-icon size="20">mdi-chevron-right</v-icon>
            </button>
          </div>
        </article>
      </div>

      <div v-else class="student-grades__empty">
        <v-progress-circular v-if="isLoading" color="primary" indeterminate size="34" />
        <template v-else>
          <v-icon size="42">mdi-chart-line-variant</v-icon>
          <strong>Chưa có điểm số</strong>
          <span>Khi giáo viên nhập điểm, kết quả học tập sẽ xuất hiện tại đây.</span>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.student-grades {
  color: #0f172a;
  display: grid;
  gap: 24px;
  margin: 0 auto;
  max-width: 1152px;
  padding-bottom: 48px;
  width: 100%;
}

.student-grades__header h1 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.35;
  margin: 0;
}

.student-grades__header p {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin: 4px 0 0;
}

.student-grades__alert {
  margin-bottom: -6px;
}

.student-grades__summary {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.student-grades__summary-card {
  border-radius: 12px;
  min-height: 164px;
  overflow: hidden;
  padding: 24px;
  position: relative;
}

.student-grades__summary-card.is-primary {
  background: linear-gradient(135deg, #2563eb 0%, #0071f9 100%);
  box-shadow: 0 4px 6px rgb(15 23 42 / 10%);
  color: #fff;
}

.student-grades__summary-card.is-plain {
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
  color: #0f172a;
}

.student-grades__watermark {
  opacity: 0.1;
  position: absolute;
  right: -16px;
  top: -16px;
}

.student-grades__summary-card.is-plain .student-grades__watermark {
  color: #10b981;
  opacity: 0.06;
}

.student-grades__summary-content {
  position: relative;
  z-index: 1;
}

.student-grades__course {
  color: rgb(219 234 254);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
}

.student-grades__summary-card.is-plain .student-grades__course {
  color: #64748b;
}

.student-grades__score {
  color: inherit;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 16px;
}

.student-grades__score span {
  color: rgb(191 219 254);
  font-size: 18px;
  font-weight: 500;
}

.student-grades__summary-card.is-plain .student-grades__score {
  color: #1e293b;
}

.student-grades__summary-card.is-plain .student-grades__score span {
  color: #94a3b8;
}

.student-grades__note {
  align-items: center;
  color: #86efac;
  display: flex;
  font-size: 14px;
  font-weight: 500;
  gap: 4px;
  line-height: 1.4;
}

.student-grades__summary-card.is-plain .student-grades__note {
  color: #10b981;
}

.student-grades__panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
  overflow: hidden;
}

.student-grades__panel-head {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px;
}

.student-grades__panel-head h2 {
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.35;
  margin: 0;
}

.student-grades__list {
  display: grid;
}

.student-grades__row {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 20px;
  transition: background 160ms ease;
}

.student-grades__row + .student-grades__row {
  border-top: 1px solid #f1f5f9;
}

.student-grades__row:hover {
  background: #f8fafc;
}

.student-grades__row:hover h3,
.student-grades__row:hover .student-grades__detail {
  color: #0071f9;
}

.student-grades__info {
  min-width: 0;
}

.student-grades__tag {
  background: #f1f5f9;
  border-radius: 4px;
  color: #64748b;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
  max-width: 100%;
  overflow: hidden;
  padding: 4px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-grades__info h3 {
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.35;
  margin: 0;
  transition: color 160ms ease;
}

.student-grades__info p {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  margin: 4px 0 0;
}

.student-grades__result {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 16px;
}

.student-grades__result-number {
  min-width: 56px;
  text-align: right;
}

.student-grades__result-number strong {
  display: block;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.student-grades__result-number strong.is-blue {
  color: #0071f9;
}

.student-grades__result-number strong.is-emerald {
  color: #10b981;
}

.student-grades__result-number span {
  color: #94a3b8;
  display: block;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 3px;
}

.student-grades__detail {
  color: #94a3b8;
  display: inline-flex;
  transition: color 160ms ease;
}

.student-grades__empty {
  align-items: center;
  color: #64748b;
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 320px;
  padding: 42px;
  text-align: center;
}

.student-grades__empty strong {
  color: #1e293b;
  font-size: 18px;
  font-weight: 800;
}

.student-grades__empty span {
  font-size: 14px;
  font-weight: 600;
  max-width: 380px;
}

@media (max-width: 820px) {
  .student-grades__summary {
    grid-template-columns: 1fr;
  }

  .student-grades__row {
    align-items: flex-start;
  }
}

@media (max-width: 560px) {
  .student-grades {
    gap: 18px;
  }

  .student-grades__summary-card {
    padding: 20px;
  }

  .student-grades__row {
    align-items: stretch;
    flex-direction: column;
  }

  .student-grades__result {
    justify-content: space-between;
    width: 100%;
  }

  .student-grades__result-number {
    text-align: left;
  }
}
</style>
