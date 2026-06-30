<script setup lang="ts">
import { useClasses } from '~/composables/useClasses';
import { useReports } from '~/composables/useReports';

const { data: classesData, isLoading: isClassesLoading } = useClasses(undefined, undefined, 100);
const { downloadReport } = useReports();
const { locale } = useI18n();

const scoreClassId = ref('all');
const tuitionMonth = ref('Tháng 6, 2026');
const error = ref<string | null>(null);
const downloading = ref<'tuition' | 'scores' | 'classes' | null>(null);

const classes = computed(() => classesData.value?.data ?? []);
const classOptions = computed(() => [
  { id: 'all', name: 'Tất cả lớp học' },
  ...classes.value,
]);

const monthOptions = [
  'Tháng 6, 2026',
  'Tháng 5, 2026',
  'Tháng 4, 2026',
];

const monthRanges: Record<string, { from: string; to: string }> = {
  'Tháng 6, 2026': { from: '2026-06-01', to: '2026-06-30' },
  'Tháng 5, 2026': { from: '2026-05-01', to: '2026-05-31' },
  'Tháng 4, 2026': { from: '2026-04-01', to: '2026-04-30' },
};

async function exportTuition() {
  if (downloading.value) return;
  await runDownload('tuition', 'xlsx', 'tuition-report.xlsx', monthRanges[tuitionMonth.value]);
}

async function exportScores() {
  if (downloading.value) return;
  await runDownload('scores', 'xlsx', 'scores-report.xlsx', {
    classId: scoreClassId.value !== 'all' ? scoreClassId.value : undefined,
  });
}

async function exportClasses() {
  if (downloading.value) return;
  await runDownload('classes', 'pdf', 'classes-report.pdf');
}

async function runDownload(
  type: 'tuition' | 'scores' | 'classes',
  format: 'xlsx' | 'pdf',
  filename: string,
  params: Record<string, string | undefined> = {},
) {
  error.value = null;
  downloading.value = type;
  const search = new URLSearchParams({ format, lang: locale.value });
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  try {
    await downloadReport(type, search, filename);
  } catch (e) {
    error.value = extractApiError(e) ?? 'Không thể tạo báo cáo. Vui lòng thử lại.';
  } finally {
    downloading.value = null;
  }
}
</script>

<template>
  <div class="teacher-reports">
    <header class="teacher-reports__header">
      <h1>Báo cáo & Thống kê</h1>
      <p>Xuất dữ liệu chi tiết phục vụ quản lý và vận hành</p>
    </header>

    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="teacher-reports__alert">
      {{ error }}
    </v-alert>

    <section class="teacher-reports__grid" aria-label="Danh sách báo cáo">
      <article class="teacher-reports__card">
        <div class="teacher-reports__icon is-revenue">
          <v-icon size="25">mdi-trending-up</v-icon>
        </div>

        <h2>Báo cáo doanh thu & học phí</h2>
        <p>
          Bao gồm danh sách chi tiết các khoản thu, hoá đơn đã thanh toán, nợ đọng và quá hạn
          của tất cả học viên trong tháng.
        </p>

        <div class="teacher-reports__field">
          <label for="tuition-month">Chọn tháng</label>
          <v-select
            id="tuition-month"
            v-model="tuitionMonth"
            :items="monthOptions"
            density="compact"
            hide-details
            variant="outlined"
          />
        </div>

        <v-btn
          class="teacher-reports__export"
          variant="flat"
          block
          :disabled="!!downloading"
          :loading="downloading === 'tuition'"
          @click="exportTuition"
        >
          <v-icon start size="18" class="is-excel">mdi-file-excel-outline</v-icon>
          Xuất Excel (Tuition_Report.xlsx)
        </v-btn>
      </article>

      <article class="teacher-reports__card">
        <div class="teacher-reports__icon is-scores">
          <v-icon size="25">mdi-book-open-page-variant-outline</v-icon>
        </div>

        <h2>Báo cáo điểm số & kết quả học tập</h2>
        <p>
          Bảng điểm chi tiết (Giữa kỳ, Cuối kỳ, Bài tập) và nhận xét của giáo viên đối với
          từng học viên theo từng lớp học.
        </p>

        <div class="teacher-reports__field">
          <label for="score-class">Chọn lớp học</label>
          <v-select
            id="score-class"
            v-model="scoreClassId"
            :items="classOptions"
            item-title="name"
            item-value="id"
            density="compact"
            hide-details
            :loading="isClassesLoading"
            variant="outlined"
          />
        </div>

        <v-btn
          class="teacher-reports__export"
          variant="flat"
          block
          :disabled="!!downloading"
          :loading="downloading === 'scores'"
          @click="exportScores"
        >
          <v-icon start size="18" class="is-blue">mdi-file-excel-outline</v-icon>
          Xuất Excel (Scores_Report.xlsx)
        </v-btn>
      </article>

      <article class="teacher-reports__card teacher-reports__card--attendance">
        <div class="teacher-reports__icon is-attendance">
          <v-icon size="25">mdi-google-classroom</v-icon>
        </div>

        <h2>Báo cáo lớp học</h2>
        <p>
          Tổng hợp giáo viên, sĩ số, tổng số buổi, số buổi đã học và tiến độ còn lại của từng lớp.
        </p>

        <v-btn
          class="teacher-reports__export teacher-reports__export--attendance"
          variant="flat"
          block
          :disabled="!!downloading"
          :loading="downloading === 'classes'"
          @click="exportClasses"
        >
          <v-icon start size="18" class="is-orange">mdi-download-outline</v-icon>
          Tải xuống PDF (classes-report.pdf)
        </v-btn>
      </article>
    </section>
  </div>
</template>

<style scoped>
.teacher-reports {
  --reports-blue: #0071f9;
  --reports-text: #0f2544;
  --reports-muted: #516483;
  --reports-border: #dce5ef;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 1120px;
  padding-bottom: 24px;
  width: 100%;
}

.teacher-reports__header {
  margin-bottom: 24px;
}

.teacher-reports__header h1 {
  color: var(--reports-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.34;
  margin: 0;
}

.teacher-reports__header p {
  color: var(--reports-muted);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  margin: 4px 0 0;
}

.teacher-reports__alert {
  margin-bottom: 18px;
}

.teacher-reports__grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.teacher-reports__card {
  background: #fff;
  border: 1px solid var(--reports-border);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(15 23 42 / 10%);
  display: flex;
  flex-direction: column;
  min-height: 344px;
  padding: 24px;
}

.teacher-reports__card h2 {
  color: var(--reports-text);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.34;
  margin: 18px 0 8px;
}

.teacher-reports__card p {
  color: var(--reports-muted);
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.55;
  margin: 0 0 26px;
}

.teacher-reports__card--attendance {
  min-height: 260px;
  width: 100%;
}

.teacher-reports__card--attendance p {
  margin-bottom: 24px;
}

.teacher-reports__icon {
  align-items: center;
  border-radius: 9px;
  display: inline-flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.teacher-reports__icon.is-revenue {
  background: #e9fbf2;
  color: #00a878;
}

.teacher-reports__icon.is-scores {
  background: #eff6ff;
  color: #0d6efd;
}

.teacher-reports__icon.is-attendance {
  background: #fff7ed;
  color: #ff6100;
}

.teacher-reports__field {
  margin-bottom: 25px;
}

.teacher-reports__field label {
  color: #1f2a3a;
  display: block;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 7px;
}

.teacher-reports__field :deep(.v-field) {
  background: #f8fbff;
  border-radius: 9px;
  color: #0f2544;
  min-height: 39px;
}

.teacher-reports__field :deep(.v-field__outline) {
  --v-field-border-opacity: 1;
  color: var(--reports-border);
}

.teacher-reports__field :deep(.v-field__input) {
  font-size: 14px;
  font-weight: 500;
  min-height: 38px;
  padding-bottom: 0;
  padding-top: 0;
}

.teacher-reports__field :deep(.v-select__selection-text) {
  color: #0f2544;
  font-size: 14px;
  font-weight: 500;
}

.teacher-reports__export {
  background: #fff !important;
  border: 1px solid var(--reports-border);
  border-radius: 8px !important;
  box-shadow: none !important;
  color: #12243e !important;
  font-size: 15px;
  font-weight: 800;
  height: 46px !important;
  letter-spacing: 0;
  margin-top: auto;
}

.teacher-reports__export :deep(.v-btn__content) {
  align-items: center;
  gap: 4px;
  min-width: 0;
  white-space: normal;
}

.teacher-reports__export :deep(.v-icon) {
  margin-inline: 0 4px;
  opacity: 1;
}

.teacher-reports__export:hover {
  border-color: #bfdbfe;
  color: var(--reports-blue) !important;
}

.teacher-reports__export .is-excel {
  color: #00b894;
}

.teacher-reports__export .is-blue {
  color: #0d6efd;
}

.teacher-reports__export .is-orange {
  color: #ff6100;
}

@media (max-width: 900px) {
  .teacher-reports__grid {
    grid-template-columns: 1fr;
  }

  .teacher-reports__card {
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .teacher-reports__header h1 {
    font-size: 22px;
  }

  .teacher-reports__card {
    padding: 20px;
  }

  .teacher-reports__card h2 {
    font-size: 17px;
  }

  .teacher-reports__export {
    font-size: 14px;
    min-height: 48px;
  }
}
</style>
