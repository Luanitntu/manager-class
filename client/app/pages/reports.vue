<script setup lang="ts">
import { useClasses } from '~/composables/useClasses';

const config = useRuntimeConfig();
const auth = useAuthStore();
const { locale } = useI18n();
const { data: classesData } = useClasses(undefined, undefined, 100);
const classes = computed(() => classesData.value?.data ?? []);
const error = ref<string | null>(null);
const busy = ref<string | null>(null);

const statusItems = [
  { value: '', title: 'Tất cả trạng thái' },
  { value: 'STUDYING', title: 'Đang học' },
  { value: 'RESERVED', title: 'Bảo lưu' },
  { value: 'GRADUATED', title: 'Đã tốt nghiệp' },
];

// Filters
const tuitionFrom = ref('');
const tuitionTo = ref('');
const classFrom = ref('');
const classTo = ref('');
const scoreClassId = ref<string | undefined>(undefined);
const scoreFrom = ref('');
const scoreTo = ref('');
const stuClassId = ref<string | undefined>(undefined);
const stuStatus = ref('');
const stuFrom = ref('');
const stuTo = ref('');

function buildUrl(type: string, format: 'xlsx' | 'pdf', params: Record<string, string | undefined> = {}) {
  const sp = new URLSearchParams({ format, lang: locale.value });
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  return `/reports/${type}?${sp.toString()}`;
}

async function download(type: string, format: 'xlsx' | 'pdf', params: Record<string, string | undefined> = {}) {
  error.value = null;
  busy.value = `${type}-${format}`;
  try {
    const blob = await $fetch<Blob>(buildUrl(type, format, params), {
      baseURL: config.public.apiBase,
      responseType: 'blob',
      headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    error.value = extractApiError(e) ?? 'Không tạo được báo cáo';
  } finally {
    busy.value = null;
  }
}

const tuitionParams = computed(() => ({ from: tuitionFrom.value || undefined, to: tuitionTo.value || undefined }));
const classParams = computed(() => ({ from: classFrom.value || undefined, to: classTo.value || undefined }));
const scoreParams = computed(() => ({
  classId: scoreClassId.value,
  from: scoreFrom.value || undefined,
  to: scoreTo.value || undefined,
}));
const stuParams = computed(() => ({
  classId: stuClassId.value,
  status: stuStatus.value || undefined,
  from: stuFrom.value || undefined,
  to: stuTo.value || undefined,
}));
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Báo cáo</h1>
    <p class="text-medium-emphasis mb-6">Xuất dữ liệu ra Excel hoặc PDF.</p>

    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">{{ error }}</v-alert>

    <v-row>
      <!-- 1. Tuition -->
      <v-col cols="12" md="6">
        <v-card class="pa-6 h-100 d-flex flex-column">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="success" rounded="lg"><v-icon color="white">mdi-cash-multiple</v-icon></v-avatar>
            <div>
              <div class="font-weight-bold">Học phí</div>
              <div class="text-caption text-medium-emphasis">Toàn bộ học phí, đã đóng & còn nợ.</div>
            </div>
          </div>
          <div class="d-flex ga-2 mb-3">
            <v-text-field v-model="tuitionFrom" type="date" label="Từ ngày" density="comfortable" hide-details />
            <v-text-field v-model="tuitionTo" type="date" label="Đến ngày" density="comfortable" hide-details />
          </div>
          <v-spacer />
          <div class="d-flex ga-2">
            <v-btn color="primary" prepend-icon="mdi-microsoft-excel" :loading="busy === 'tuition-xlsx'" @click="download('tuition', 'xlsx', tuitionParams)">Excel</v-btn>
            <v-btn color="error" variant="tonal" prepend-icon="mdi-file-pdf-box" :loading="busy === 'tuition-pdf'" @click="download('tuition', 'pdf', tuitionParams)">PDF</v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- 4. Class Report -->
      <v-col cols="12" md="6">
        <v-card class="pa-6 h-100 d-flex flex-column">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="primary" rounded="lg"><v-icon color="white">mdi-google-classroom</v-icon></v-avatar>
            <div>
              <div class="font-weight-bold">Lớp học</div>
              <div class="text-caption text-medium-emphasis">Giáo viên, sĩ số, tổng buổi · đã học · còn lại.</div>
            </div>
          </div>
          <div class="d-flex ga-2 mb-3">
            <v-text-field v-model="classFrom" type="date" label="Từ ngày" density="comfortable" hide-details />
            <v-text-field v-model="classTo" type="date" label="Đến ngày" density="comfortable" hide-details />
          </div>
          <v-spacer />
          <div class="d-flex ga-2">
            <v-btn color="primary" prepend-icon="mdi-microsoft-excel" :loading="busy === 'classes-xlsx'" @click="download('classes', 'xlsx', classParams)">Excel</v-btn>
            <v-btn color="error" variant="tonal" prepend-icon="mdi-file-pdf-box" :loading="busy === 'classes-pdf'" @click="download('classes', 'pdf', classParams)">PDF</v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- 3. Student List -->
      <v-col cols="12" md="6">
        <v-card class="pa-6 h-100">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="secondary" rounded="lg"><v-icon color="white">mdi-account-group</v-icon></v-avatar>
            <div>
              <div class="font-weight-bold">Danh sách học viên</div>
              <div class="text-caption text-medium-emphasis">Tên, SĐT, email, ngày tham gia.</div>
            </div>
          </div>
          <v-select v-model="stuClassId" :items="classes" item-title="name" item-value="id" label="Lớp (tuỳ chọn)" clearable density="comfortable" hide-details class="mb-2" />
          <v-select v-model="stuStatus" :items="statusItems" label="Trạng thái" density="comfortable" hide-details class="mb-2" />
          <div class="d-flex ga-2 mb-3">
            <v-text-field v-model="stuFrom" type="date" label="Tham gia từ" density="comfortable" hide-details />
            <v-text-field v-model="stuTo" type="date" label="Đến" density="comfortable" hide-details />
          </div>
          <div class="d-flex ga-2">
            <v-btn color="primary" prepend-icon="mdi-microsoft-excel" :loading="busy === 'students-xlsx'" @click="download('students', 'xlsx', stuParams)">Excel</v-btn>
            <v-btn color="error" variant="tonal" prepend-icon="mdi-file-pdf-box" :loading="busy === 'students-pdf'" @click="download('students', 'pdf', stuParams)">PDF</v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- 2. Student Scores -->
      <v-col cols="12" md="6">
        <v-card class="pa-6 h-100">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="info" rounded="lg"><v-icon color="white">mdi-chart-box</v-icon></v-avatar>
            <div>
              <div class="font-weight-bold">Điểm học viên</div>
              <div class="text-caption text-medium-emphasis">Kết quả học tập, lọc theo lớp & thời gian.</div>
            </div>
          </div>
          <v-select v-model="scoreClassId" :items="classes" item-title="name" item-value="id" label="Lớp (tuỳ chọn)" clearable density="comfortable" hide-details class="mb-2" />
          <div class="d-flex ga-2 mb-3">
            <v-text-field v-model="scoreFrom" type="date" label="Từ ngày" density="comfortable" hide-details />
            <v-text-field v-model="scoreTo" type="date" label="Đến ngày" density="comfortable" hide-details />
          </div>
          <div class="d-flex ga-2">
            <v-btn color="primary" prepend-icon="mdi-microsoft-excel" :loading="busy === 'scores-xlsx'" @click="download('scores', 'xlsx', scoreParams)">Excel</v-btn>
            <v-btn color="error" variant="tonal" prepend-icon="mdi-file-pdf-box" :loading="busy === 'scores-pdf'" @click="download('scores', 'pdf', scoreParams)">PDF</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
