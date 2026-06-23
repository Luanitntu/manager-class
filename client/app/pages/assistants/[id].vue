<script setup lang="ts">
import {
  useAssistantDetail,
  useAssistantSalary,
  useAssistantSessions,
  useAssistantMutations,
} from '~/composables/useAssistants';

const route = useRoute();
const { t, locale } = useI18n();
const userTz = useUserTimezone();

const id = computed(() => route.params.id as string);
const { data: assistant } = useAssistantDetail(id);
const { data: salary } = useAssistantSalary(id);
const { data: sessions } = useAssistantSessions(id);
const { updateSalary } = useAssistantMutations();
const avatar = useAvatar();

const form = reactive({ salaryMethod: 'PER_SESSION', salaryRate: 0, bio: '' });
watch(assistant, (a) => {
  if (!a?.assistantProfile) return;
  form.salaryMethod = a.assistantProfile.salaryMethod;
  form.salaryRate = Number(a.assistantProfile.salaryRate);
  form.bio = a.assistantProfile.bio ?? '';
});

async function saveSalary() {
  await updateSalary.mutateAsync({
    id: id.value,
    body: {
      salaryMethod: form.salaryMethod,
      salaryRate: Number(form.salaryRate),
      bio: form.bio || undefined,
    },
  });
}

function money(n: number | string) {
  return Number(n).toLocaleString();
}
function dayOf(iso: string) {
  return formatInZone(iso, userTz.value, locale.value).split(' ').slice(0, 3).join(' ');
}
function timeRange(start: string, end: string) {
  return `${utcToWallParts(start, userTz.value).time} - ${utcToWallParts(end, userTz.value).time}`;
}

const statusColor: Record<string, string> = {
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};
const methodLabel: Record<string, string> = {
  PER_SESSION: t('assistant.perSession'),
  PER_HOUR: t('assistant.perHour'),
  PER_CLASS: t('assistant.perClass'),
};
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/assistants" class="mb-4">
      {{ t('assistant.backToList') }}
    </v-btn>

    <div v-if="assistant" class="d-flex align-center ga-3 mb-6">
      <v-avatar color="primary" size="48">
        <v-img v-if="avatar(assistant)" :src="avatar(assistant)!" />
        <span v-else class="text-white text-h6">{{ assistant.fullName[0] }}</span>
      </v-avatar>
      <div>
        <h1 class="text-h5 font-weight-bold">{{ assistant.fullName }}</h1>
        <div class="text-medium-emphasis">{{ assistant.email }}</div>
      </div>
    </div>

    <v-row>
      <!-- Salary config + summary -->
      <v-col cols="12" md="5">
        <v-card class="pa-5 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ t('assistant.salaryConfig') }}</h3>
          <v-select
            v-model="form.salaryMethod"
            :items="[
              { value: 'PER_SESSION', title: t('assistant.perSession') },
              { value: 'PER_HOUR', title: t('assistant.perHour') },
              { value: 'PER_CLASS', title: t('assistant.perClass') },
            ]"
            :label="t('assistant.method')"
          />
          <v-text-field v-model="form.salaryRate" type="number" :label="t('assistant.rate')" />
          <div class="d-flex justify-end">
            <v-btn color="primary" :loading="updateSalary.isPending.value" @click="saveSalary">
              {{ t('common.save') }}
            </v-btn>
          </div>
        </v-card>

        <v-card v-if="salary" class="pa-5">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ t('assistant.salarySummary') }}</h3>
          <div class="d-flex ga-6 mb-3">
            <div>
              <div class="text-h6 font-weight-bold">{{ money(salary.totalAmount) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ t('assistant.total') }} ({{ methodLabel[salary.method] }})
              </div>
            </div>
            <div>
              <div class="text-h6 font-weight-bold">{{ salary.totalSessions }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('assistant.sessions') }}</div>
            </div>
            <div>
              <div class="text-h6 font-weight-bold">{{ salary.totalHours }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('assistant.hours') }}</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Teaching schedule -->
      <v-col cols="12" md="7">
        <v-card class="pa-5">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ t('assistant.schedule') }}</h3>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>{{ t('session.class') }}</th>
                <th>{{ t('session.date') }}</th>
                <th>{{ t('assistant.time') }}</th>
                <th>{{ t('session.lessonTopic') }}</th>
                <th>{{ t('assistant.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sessions ?? []" :key="s.id">
                <td>
                  <v-chip size="small" :color="s.class.color || 'primary'" variant="tonal">
                    {{ s.class.name }}
                  </v-chip>
                </td>
                <td class="text-no-wrap">{{ dayOf(s.startTime) }}</td>
                <td class="text-no-wrap">{{ timeRange(s.startTime, s.endTime) }}</td>
                <td>{{ s.lessonTopic || '—' }}</td>
                <td>
                  <v-chip size="x-small" :color="statusColor[s.status]" variant="tonal">
                    {{ s.status }}
                  </v-chip>
                </td>
              </tr>
              <tr v-if="!sessions?.length">
                <td colspan="5" class="text-center text-medium-emphasis pa-6">
                  {{ t('assistant.noSessions') }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
