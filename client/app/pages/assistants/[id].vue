<script setup lang="ts">
import {
  useAssistantDetail,
  useAssistantSalarySummary,
  useAssistantSessions,
  useAssistantMutations,
} from '~/composables/useAssistants';

const route = useRoute();
const { t, locale } = useI18n();
const userTz = useUserTimezone();

const id = computed(() => route.params.id as string);
const { data: assistant } = useAssistantDetail(id);
const { data: summary } = useAssistantSalarySummary(id);
const { data: sessions } = useAssistantSessions(id);
const { updateSalary } = useAssistantMutations();
const avatar = useAvatar();

const tab = ref('schedule');

// A class the assistant is involved with — either formally in charge of the whole
// class (ClassAssistant) or just teaching some of its sessions (session instructor),
// or both. Unifies the two relationships so the card isn't contradictory.
interface ClassInvolvement {
  id: string;
  name: string;
  level?: string | null;
  color?: string | null;
  inCharge: boolean; // assigned to the whole class
  sessions: number; // sessions this assistant instructs in this class
}
const involvement = computed<ClassInvolvement[]>(() => {
  const map = new Map<string, ClassInvolvement>();
  for (const ca of assistant.value?.classAssignments ?? []) {
    map.set(ca.class.id, { ...ca.class, inCharge: true, sessions: 0 });
  }
  for (const s of sessions.value ?? []) {
    const e = map.get(s.class.id);
    if (e) {
      e.sessions += 1;
    } else {
      map.set(s.class.id, {
        id: s.class.id,
        name: s.class.name,
        level: s.class.level,
        color: s.class.color,
        inCharge: false,
        sessions: 1,
      });
    }
  }
  return [...map.values()];
});
const totalSessionsCount = computed(() => sessions.value?.length ?? 0);
function roleLabel(c: ClassInvolvement) {
  if (c.inCharge) {
    return c.sessions > 0 ? `${t('assistant.inCharge')} · ${c.sessions} ${t('assistant.sessionsShort')}` : t('assistant.inCharge');
  }
  return `${t('assistant.teaches')} ${c.sessions} ${t('assistant.sessionsShort')}`;
}

function money(n?: number | string) {
  return Number(n ?? 0).toLocaleString('vi-VN');
}
function dayOf(iso: string) {
  return formatInZone(iso, userTz.value, locale.value).split(' ').slice(0, 3).join(' ');
}
function timeRange(start: string, end: string) {
  return `${utcToWallParts(start, userTz.value).time} - ${utcToWallParts(end, userTz.value).time}`;
}
function fmtDate(iso?: string | null) {
  return iso ? new Date(iso).toLocaleDateString('vi-VN') : '—';
}
function fmtMonth(m: string) {
  const [y, mo] = m.split('-');
  return `${mo}/${y}`;
}

const statusColor: Record<string, string> = { SCHEDULED: 'info', COMPLETED: 'success', CANCELLED: 'error' };
const methodLabel = computed<Record<string, string>>(() => ({
  PER_SESSION: t('assistant.perSession'),
  PER_HOUR: t('assistant.perHour'),
  PER_CLASS: t('assistant.perClass'),
}));

// ── Edit dialogs ────────────────────────────────────────────────────────────
const profileOpen = ref(false);
const profileForm = reactive({ phone: '', level: '', hometown: '' });
function openProfile() {
  profileForm.phone = assistant.value?.phone ?? '';
  profileForm.level = assistant.value?.assistantProfile?.level ?? '';
  profileForm.hometown = assistant.value?.assistantProfile?.hometown ?? '';
  profileOpen.value = true;
}

const salaryForm = reactive({ salaryMethod: 'PER_SESSION', salaryRate: 0, effectiveFrom: '' });
watch(
  assistant,
  (a) => {
    if (!a?.assistantProfile) return;
    salaryForm.salaryMethod = a.assistantProfile.salaryMethod;
    salaryForm.salaryRate = Number(a.assistantProfile.salaryRate);
    salaryForm.effectiveFrom = a.assistantProfile.salaryEffectiveFrom
      ? a.assistantProfile.salaryEffectiveFrom.slice(0, 10)
      : '';
  },
  { immediate: true },
);

// Sends the full profile+salary payload (the endpoint accepts both).
function payload(extra: Record<string, unknown>) {
  return {
    salaryMethod: salaryForm.salaryMethod,
    salaryRate: Number(salaryForm.salaryRate),
    effectiveFrom: salaryForm.effectiveFrom || undefined,
    ...extra,
  };
}
async function saveSalary() {
  await updateSalary.mutateAsync({ id: id.value, body: payload({}) });
}
async function saveProfile() {
  await updateSalary.mutateAsync({
    id: id.value,
    body: payload({
      phone: profileForm.phone || undefined,
      level: profileForm.level || undefined,
      hometown: profileForm.hometown || undefined,
    }),
  });
  profileOpen.value = false;
}
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/assistants" class="mb-4">
      {{ t('assistant.backToList') }}
    </v-btn>

    <div v-if="assistant" class="d-flex align-center ga-3 mb-6">
      <v-avatar color="primary" size="56">
        <v-img v-if="avatar(assistant)" :src="avatar(assistant)!" />
        <span v-else class="text-white text-h6">{{ assistant.fullName[0] }}</span>
      </v-avatar>
      <div>
        <div class="d-flex align-center ga-2 flex-wrap">
          <h1 class="text-h5 font-weight-bold">{{ assistant.fullName }}</h1>
          <v-chip v-if="assistant.assistantProfile?.level" size="small" color="info" variant="tonal">
            {{ assistant.assistantProfile.level }}
          </v-chip>
        </div>
        <div class="text-medium-emphasis">{{ assistant.email }}</div>
      </div>
    </div>

    <v-row>
      <!-- Profile -->
      <v-col cols="12" md="6">
        <v-card class="pa-5 h-100">
          <div class="d-flex align-center justify-space-between mb-3">
            <h3 class="text-subtitle-1 font-weight-bold">{{ t('assistant.profile') }}</h3>
            <v-btn size="small" variant="text" prepend-icon="mdi-pencil" @click="openProfile">
              {{ t('assistant.editProfile') }}
            </v-btn>
          </div>
          <v-list density="compact" class="py-0">
            <v-list-item class="px-0" prepend-icon="mdi-email-outline" :title="assistant?.email" :subtitle="t('auth.email')" />
            <v-list-item class="px-0" prepend-icon="mdi-phone-outline" :title="assistant?.phone || '—'" :subtitle="t('assistant.phone')" />
            <v-list-item class="px-0" prepend-icon="mdi-school-outline" :title="assistant?.assistantProfile?.level || '—'" :subtitle="t('assistant.level')" />
            <v-list-item class="px-0" prepend-icon="mdi-map-marker-outline" :title="assistant?.assistantProfile?.hometown || '—'" :subtitle="t('assistant.hometown')" />
          </v-list>
        </v-card>
      </v-col>

      <!-- Salary summary -->
      <v-col cols="12" md="6">
        <v-card class="pa-5 h-100">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ t('assistant.salarySummary') }}</h3>
          <v-row dense>
            <v-col cols="6">
              <div class="text-h6 font-weight-bold text-success">{{ money(summary?.thisMonth.totalAmount) }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('assistant.thisMonth') }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-h6 font-weight-bold">{{ money(summary?.total.totalAmount) }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('assistant.totalSalary') }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-subtitle-1 font-weight-bold">{{ summary?.total.totalSessions ?? 0 }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('assistant.sessions') }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-subtitle-1 font-weight-bold">{{ summary?.total.totalHours ?? 0 }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('assistant.hours') }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-subtitle-1 font-weight-bold">{{ fmtDate(summary?.nextPayroll) }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('assistant.nextPayroll') }}</div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Assigned classes (whole-class + per-session, unified) -->
    <v-card class="pa-5 mt-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <h3 class="text-subtitle-1 font-weight-bold">{{ t('assistant.assignedClasses') }}</h3>
        <div class="d-flex ga-4">
          <span class="text-caption text-medium-emphasis">
            <b class="text-body-1">{{ involvement.length }}</b> {{ t('assistant.classes') }}
          </span>
          <span class="text-caption text-medium-emphasis">
            <b class="text-body-1">{{ totalSessionsCount }}</b> {{ t('assistant.sessions') }}
          </span>
        </div>
      </div>
      <v-list v-if="involvement.length" class="py-0">
        <v-list-item v-for="c in involvement" :key="c.id" :to="`/classes/${c.id}`" class="px-0">
          <template #prepend>
            <v-avatar :color="c.color || 'primary'" size="32" rounded="lg">
              <v-icon size="18" color="white">mdi-google-classroom</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ c.name }}<span v-if="c.level" class="text-caption text-medium-emphasis"> · {{ c.level }}</span>
          </v-list-item-title>
          <template #append>
            <v-chip size="small" :color="c.inCharge ? 'primary' : 'secondary'" variant="tonal">
              {{ roleLabel(c) }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
      <div v-else class="text-caption text-medium-emphasis">{{ t('assistant.noClasses') }}</div>
    </v-card>

    <!-- Salary configuration -->
    <v-card class="pa-5 mt-4">
      <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ t('assistant.salaryConfig') }}</h3>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="salaryForm.salaryMethod"
            :items="[
              { value: 'PER_SESSION', title: t('assistant.perSession') },
              { value: 'PER_HOUR', title: t('assistant.perHour') },
              { value: 'PER_CLASS', title: t('assistant.perClass') },
            ]"
            :label="t('assistant.method')"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="salaryForm.salaryRate" type="number" :label="t('assistant.rate')" hide-details />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="salaryForm.effectiveFrom" type="date" :label="t('assistant.effectiveFrom')" hide-details />
        </v-col>
      </v-row>
      <div class="d-flex justify-end mt-3">
        <v-btn color="primary" :loading="updateSalary.isPending.value" @click="saveSalary">
          {{ t('common.save') }}
        </v-btn>
      </div>

      <template v-if="(summary?.rates?.length ?? 0) > 1">
        <v-divider class="my-3" />
        <div class="text-caption text-medium-emphasis mb-2">{{ t('assistant.rateHistory') }}</div>
        <div class="d-flex flex-column ga-1">
          <div v-for="(r, i) in summary?.rates ?? []" :key="i" class="d-flex align-center justify-space-between text-body-2">
            <span>
              <v-icon size="14" class="mr-1">mdi-calendar-arrow-right</v-icon>{{ fmtDate(r.effectiveFrom) }}
              <span class="text-caption text-medium-emphasis">· {{ methodLabel[r.method] }}</span>
            </span>
            <span class="font-weight-medium">{{ money(r.rate) }}</span>
          </div>
        </div>
      </template>
    </v-card>

    <!-- Schedule + Salary history -->
    <v-card class="mt-4">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="schedule">{{ t('assistant.schedule') }}</v-tab>
        <v-tab value="breakdown">{{ t('assistant.salaryBreakdown') }}</v-tab>
        <v-tab value="history">{{ t('assistant.salaryHistory') }}</v-tab>
      </v-tabs>
      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="schedule">
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
                    <v-chip size="small" :color="s.class.color || 'primary'" variant="tonal">{{ s.class.name }}</v-chip>
                  </td>
                  <td class="text-no-wrap">{{ dayOf(s.startTime) }}</td>
                  <td class="text-no-wrap">{{ timeRange(s.startTime, s.endTime) }}</td>
                  <td>{{ s.lessonTopic || '—' }}</td>
                  <td>
                    <v-chip size="x-small" :color="statusColor[s.status]" variant="tonal">{{ s.status }}</v-chip>
                  </td>
                </tr>
                <tr v-if="!sessions?.length">
                  <td colspan="5" class="text-center text-medium-emphasis pa-6">{{ t('assistant.noSessions') }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>

          <v-window-item value="breakdown">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>{{ t('session.class') }}</th>
                  <th class="text-right">{{ t('assistant.sessions') }}</th>
                  <th class="text-right">{{ t('assistant.hours') }}</th>
                  <th class="text-right">{{ t('assistant.amount') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in summary?.byClass ?? []" :key="b.classId">
                  <td class="font-weight-medium">{{ b.className }}</td>
                  <td class="text-right">{{ b.sessionCount }}</td>
                  <td class="text-right">{{ b.hours }}</td>
                  <td class="text-right">{{ money(b.amount) }}</td>
                </tr>
                <tr v-if="!summary?.byClass?.length">
                  <td colspan="4" class="text-center text-medium-emphasis pa-6">{{ t('assistant.noSessions') }}</td>
                </tr>
              </tbody>
              <tfoot v-if="summary?.byClass?.length">
                <tr class="font-weight-bold">
                  <td>{{ t('assistant.grandTotal') }}</td>
                  <td class="text-right">{{ summary?.total.totalSessions }}</td>
                  <td class="text-right">{{ summary?.total.totalHours }}</td>
                  <td class="text-right text-success">{{ money(summary?.total.totalAmount) }}</td>
                </tr>
              </tfoot>
            </v-table>
          </v-window-item>

          <v-window-item value="history">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>{{ t('assistant.thisMonth') }}</th>
                  <th class="text-right">{{ t('assistant.sessions') }}</th>
                  <th class="text-right">{{ t('assistant.hours') }}</th>
                  <th class="text-right">{{ t('assistant.totalSalary') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in summary?.history ?? []" :key="h.month">
                  <td class="font-weight-medium">{{ fmtMonth(h.month) }}</td>
                  <td class="text-right">{{ h.sessions }}</td>
                  <td class="text-right">{{ h.hours }}</td>
                  <td class="text-right font-weight-bold text-success">{{ money(h.amount) }}</td>
                </tr>
                <tr v-if="!summary?.history?.length">
                  <td colspan="4" class="text-center text-medium-emphasis pa-6">{{ t('assistant.noSessions') }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Edit profile dialog -->
    <v-dialog v-model="profileOpen" max-width="440">
      <v-card>
        <v-card-title>{{ t('assistant.editProfile') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="profileForm.phone" :label="t('assistant.phone')" prepend-inner-icon="mdi-phone-outline" />
          <v-text-field v-model="profileForm.level" :label="t('assistant.level')" prepend-inner-icon="mdi-school-outline" placeholder="VD: N2 Japanese" />
          <v-text-field v-model="profileForm.hometown" :label="t('assistant.hometown')" prepend-inner-icon="mdi-map-marker-outline" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="profileOpen = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="updateSalary.isPending.value" @click="saveProfile">{{ t('common.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
