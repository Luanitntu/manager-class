<script setup lang="ts">
import { useClasses } from '~/composables/useClasses';
import { useReports } from '~/composables/useReports';

const { data: classesData } = useClasses();
const { downloadReport } = useReports();

const scoreClassId = ref('all');
const tuitionMonth = ref('Tháng 6, 2026');
const error = ref<string | null>(null);

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

async function exportTuition() {
  await runDownload('/reports/tuition.xlsx', 'Tuition_Report.xlsx');
}

async function exportScores() {
  const query = scoreClassId.value !== 'all' ? `?classId=${scoreClassId.value}` : '';
  await runDownload(`/reports/scores.xlsx${query}`, 'Scores_Report.xlsx');
}

async function exportAttendance() {
  await runDownload('/reports/attendance.pdf', 'Attendance.pdf');
}

async function runDownload(path: string, filename: string) {
  error.value = null;
  try {
    await downloadReport(path, filename);
  } catch (e) {
    error.value = extractApiError(e) ?? 'Không thể tạo báo cáo. Vui lòng thử lại.';
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

        <v-btn class="teacher-reports__export" variant="flat" block @click="exportTuition">
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
            variant="outlined"
          />
        </div>

        <v-btn class="teacher-reports__export" variant="flat" block @click="exportScores">
          <v-icon start size="18" class="is-blue">mdi-file-excel-outline</v-icon>
          Xuất Excel (Scores_Report.xlsx)
        </v-btn>
      </article>

      <article class="teacher-reports__card teacher-reports__card--attendance">
        <div class="teacher-reports__icon is-attendance">
          <v-icon size="25">mdi-account-group-outline</v-icon>
        </div>

        <h2>Báo cáo điểm danh</h2>
        <p>
          Tổng hợp tỉ lệ chuyên cần, số buổi vắng mặt và đi trễ của học viên trong khoá học.
        </p>

        <v-btn class="teacher-reports__export teacher-reports__export--attendance" variant="flat" block @click="exportAttendance">
          <v-icon start size="18" class="is-orange">mdi-download-outline</v-icon>
          Tải xuống PDF (Attendance.pdf)
        </v-btn>
      </article>
    </section>
  </div>
</template>

<style scoped lang="scss">
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

  &__header {
    margin-bottom: 24px;

    h1 {
      color: var(--reports-text);
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.34;
      margin: 0;
    }

    p {
      color: var(--reports-muted);
      font-size: 14px;
      font-weight: 500;
      line-height: 1.45;
      margin: 4px 0 0;
    }
  }

  &__alert {
    margin-bottom: 18px;
  }

  &__grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &__card {
    background: #fff;
    border: 1px solid var(--reports-border);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgb(15 23 42 / 10%);
    display: flex;
    flex-direction: column;
    min-height: 344px;
    padding: 24px;

    h2 {
      color: var(--reports-text);
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.34;
      margin: 18px 0 8px;
    }

    p {
      color: var(--reports-muted);
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.55;
      margin: 0 0 26px;
    }

    &--attendance {
      min-height: 260px;
      width: 100%;

      p {
        margin-bottom: 24px;
      }
    }
  }

  &__icon {
    align-items: center;
    border-radius: 9px;
    display: inline-flex;
    height: 48px;
    justify-content: center;
    width: 48px;

    &.is-revenue {
      background: #e9fbf2;
      color: #00a878;
    }

    &.is-scores {
      background: #eff6ff;
      color: #0d6efd;
    }

    &.is-attendance {
      background: #fff7ed;
      color: #ff6100;
    }
  }

  &__field {
    margin-bottom: 25px;

    label {
      color: #1f2a3a;
      display: block;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 7px;
    }

    :deep(.v-field) {
      background: #f8fbff;
      border-radius: 9px;
      color: #0f2544;
      min-height: 39px;
    }

    :deep(.v-field__outline) {
      --v-field-border-opacity: 1;
      color: var(--reports-border);
    }

    :deep(.v-field__input) {
      font-size: 14px;
      font-weight: 500;
      min-height: 38px;
      padding-bottom: 0;
      padding-top: 0;
    }

    :deep(.v-select__selection-text) {
      color: #0f2544;
      font-size: 14px;
      font-weight: 500;
    }
  }

  &__export {
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

    :deep(.v-btn__content) {
      align-items: center;
      gap: 4px;
      min-width: 0;
      white-space: normal;
    }

    :deep(.v-icon) {
      margin-inline: 0 4px;
      opacity: 1;
    }

    &:hover {
      border-color: #bfdbfe;
      color: var(--reports-blue) !important;
    }

    .is-excel {
      color: #00b894;
    }

    .is-blue {
      color: #0d6efd;
    }

    .is-orange {
      color: #ff6100;
    }
  }
}

@media (max-width: 900px) {
  .teacher-reports {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__card {
      min-height: 0;
    }
  }
}

@media (max-width: 560px) {
  .teacher-reports {
    &__header h1 {
      font-size: 22px;
    }

    &__card {
      padding: 20px;

      h2 {
        font-size: 17px;
      }
    }

    &__export {
      font-size: 14px;
      min-height: 48px;
    }
  }
}
</style>
