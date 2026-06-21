<script setup lang="ts">
import { useClasses } from '~/composables/useClasses';
import { useSnackbar } from '~/composables/useSnackbar';

const config = useRuntimeConfig();
const auth = useAuthStore();
const { data: classesData } = useClasses();
const { success: showSuccess, error: showError } = useSnackbar();

const classes = computed(() => classesData.value?.data ?? []);
const scoreClassId = ref<string | undefined>(undefined);

async function download(path: string, filename: string) {
  try {
    const blob = await $fetch<Blob>(path, {
      baseURL: config.public.apiBase,
      responseType: 'blob',
      headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess(`${filename} exported successfully.`);
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not generate report');
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Reports"
      subtitle="Export your data to Excel."
      icon="mdi-chart-line"
    />

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-card class="pa-6 st-card-soft">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="success" rounded="lg"><v-icon color="white">mdi-cash-multiple</v-icon></v-avatar>
            <div>
              <div class="font-weight-bold">Tuition Status</div>
              <div class="text-caption text-medium-emphasis">All tuition records with balances.</div>
            </div>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-microsoft-excel"
            @click="download('/reports/tuition.xlsx', 'tuition-report.xlsx')"
          >
            Export Excel
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-6 st-card-soft">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="info" rounded="lg"><v-icon color="white">mdi-chart-box</v-icon></v-avatar>
            <div>
              <div class="font-weight-bold">Student Scores</div>
              <div class="text-caption text-medium-emphasis">Academic results, optionally by class.</div>
            </div>
          </div>
          <v-select
            v-model="scoreClassId"
            :items="classes"
            item-title="name"
            item-value="id"
            label="Class (optional)"
            clearable
            density="comfortable"
            class="mb-2"
          />
          <v-btn
            color="primary"
            prepend-icon="mdi-microsoft-excel"
            @click="download(
              scoreClassId ? `/reports/scores.xlsx?classId=${scoreClassId}` : '/reports/scores.xlsx',
              'scores-report.xlsx',
            )"
          >
            Export Excel
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
