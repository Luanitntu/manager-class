<script setup lang="ts">
import {
  useClassDetail,
  useClassSessions,
  useClassStudents,
  useClassMutations,
} from '~/composables/useClasses';
import { useStudents } from '~/composables/useStudents';

const route = useRoute();
const { t, locale } = useI18n();
const userTz = useUserTimezone();

const id = computed(() => route.params.id as string);
const { data: klass } = useClassDetail(id);
const { data: sessions } = useClassSessions(id);
const { data: students } = useClassStudents(id);
const { data: allStudentsData } = useStudents();
const { update, remove, enrollStudent, unenrollStudent } = useClassMutations();
const { update: updateSession } = useSessionMutations();
const avatar = useAvatar();

const colorSwatches = [
  ['#5D87FF', '#49BEFF', '#13DEB9'],
  ['#FFAE1F', '#FA896B', '#FF5C8E'],
  ['#7C4DFF', '#00C292', '#0BB2FB'],
  ['#E91E63', '#9C27B0', '#3F51B5'],
];

// ----- Edit -----
const editOpen = ref(false);
const editError = ref<string | null>(null);
const form = reactive({ name: '', level: '', color: '#5D87FF', description: '', totalSessions: null as number | null });

function openEdit() {
  if (!klass.value) return;
  Object.assign(form, {
    name: klass.value.name,
    level: klass.value.level ?? '',
    color: klass.value.color ?? '#5D87FF',
    description: klass.value.description ?? '',
    totalSessions: klass.value.totalSessions ?? null,
  });
  editError.value = null;
  editOpen.value = true;
}

async function saveEdit() {
  editError.value = null;
  try {
    await update.mutateAsync({
      id: id.value,
      body: {
        name: form.name,
        level: form.level || undefined,
        color: form.color || undefined,
        description: form.description || undefined,
        totalSessions: form.totalSessions || undefined,
      },
    });
    editOpen.value = false;
  } catch (e) {
    editError.value = extractApiError(e);
  }
}

async function destroy() {
  if (!klass.value) return;
  if (!confirm(t('classDetail.confirmDelete', { name: klass.value.name }))) return;
  await remove.mutateAsync(id.value);
  await navigateTo('/classes');
}

// ----- Add student -----
const enrolledIds = computed(() => new Set((students.value ?? []).map((s) => s.student.id)));
const availableStudents = computed(() =>
  (allStudentsData.value?.data ?? []).filter((s) => !enrolledIds.value.has(s.id)),
);

const addOpen = ref(false);
const addError = ref<string | null>(null);
const addForm = reactive({ studentId: '', note: '' });

function openAdd() {
  Object.assign(addForm, { studentId: '', note: '' });
  addError.value = null;
  addOpen.value = true;
}

async function addStudent() {
  addError.value = null;
  try {
    await enrollStudent.mutateAsync({
      classId: id.value,
      studentId: addForm.studentId,
      note: addForm.note || undefined,
    });
    addOpen.value = false;
  } catch (e) {
    addError.value = extractApiError(e);
  }
}

async function removeStudent(studentId: string) {
  if (!confirm(t('classDetail.confirmRemoveStudent'))) return;
  await unenrollStudent.mutateAsync({ classId: id.value, studentId });
}

// ----- Progress (REAL: completed / total, excluding cancelled) -----
const completedCount = computed(() => (sessions.value ?? []).filter((s) => s.status === 'COMPLETED').length);
const activeSessionCount = computed(
  () => (sessions.value ?? []).filter((s) => s.status !== 'CANCELLED').length,
);
const totalForProgress = computed(() => klass.value?.totalSessions || activeSessionCount.value);
const progressPct = computed(() =>
  totalForProgress.value ? Math.min(100, Math.round((completedCount.value / totalForProgress.value) * 100)) : 0,
);

// A scheduled session whose end time has passed but wasn't marked done/cancelled.
function isOverdue(s: { status: string; endTime: string }) {
  return s.status === 'SCHEDULED' && new Date(s.endTime).getTime() < Date.now();
}
async function markSessionDone(sessionId: string, status: 'COMPLETED' | 'SCHEDULED') {
  await updateSession.mutateAsync({ id: sessionId, body: { status } });
}
const overdueCount = computed(() => (sessions.value ?? []).filter(isOverdue).length);

// ----- Formatting -----
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
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/classes" class="mb-4">
      {{ t('classDetail.back') }}
    </v-btn>

    <div v-if="klass" class="d-flex align-center ga-3 mb-6">
      <v-avatar :color="klass.color || 'primary'" size="48" rounded="lg">
        <v-icon color="white">mdi-google-classroom</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <h1 class="text-h5 font-weight-bold">{{ klass.name }}</h1>
        <div class="text-medium-emphasis">{{ klass.level || '—' }}</div>
      </div>
      <v-btn variant="tonal" prepend-icon="mdi-pencil" @click="openEdit">{{ t('common.edit') }}</v-btn>
      <v-btn variant="text" color="error" prepend-icon="mdi-delete" @click="destroy">
        {{ t('common.delete') }}
      </v-btn>
    </div>

    <v-row>
      <!-- Left: info + students -->
      <v-col cols="12" md="5">
        <v-card class="pa-5 mb-4">
          <div class="text-caption text-medium-emphasis">{{ t('classDetail.description') }}</div>
          <div class="mb-3">{{ klass?.description || '—' }}</div>
          <div class="d-flex ga-6">
            <div>
              <div class="text-h6 font-weight-bold">{{ klass?._count?.enrollments ?? 0 }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('classDetail.students') }}</div>
            </div>
            <div>
              <div class="text-h6 font-weight-bold">{{ klass?._count?.sessions ?? 0 }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('classDetail.sessions') }}</div>
            </div>
            <div>
              <div class="text-h6 font-weight-bold">{{ klass?.totalSessions ?? '—' }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('classDetail.totalSessions') }}</div>
            </div>
          </div>

          <v-divider class="my-4" />
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-caption text-medium-emphasis">{{ t('classDetail.progress') }}</span>
            <span class="text-caption font-weight-medium">
              {{ completedCount }}/{{ totalForProgress }} {{ t('classDetail.sessions').toLowerCase() }} · {{ progressPct }}%
            </span>
          </div>
          <v-progress-linear
            :model-value="progressPct"
            :color="klass?.color || 'primary'"
            height="6"
            rounded
          />
        </v-card>

        <v-card class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <h3 class="text-subtitle-1 font-weight-bold">{{ t('classDetail.studentList') }}</h3>
            <v-btn size="small" color="primary" prepend-icon="mdi-account-plus" @click="openAdd">
              {{ t('classDetail.addStudent') }}
            </v-btn>
          </div>
          <v-list v-if="students?.length">
            <v-list-item
              v-for="e in students"
              :key="e.id"
              :to="`/students`"
              :title="e.student.fullName"
              :subtitle="e.student.email"
            >
              <template #prepend>
                <v-avatar color="secondary" size="32">
                  <v-img v-if="avatar(e.student)" :src="avatar(e.student)!" />
                  <span v-else class="text-white">{{ e.student.fullName[0] }}</span>
                </v-avatar>
              </template>
              <template #append>
                <v-btn
                  icon="mdi-account-remove"
                  size="x-small"
                  variant="text"
                  @click.prevent="removeStudent(e.student.id)"
                />
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-medium-emphasis text-caption">{{ t('classDetail.noStudents') }}</div>
        </v-card>
      </v-col>

      <!-- Right: sessions -->
      <v-col cols="12" md="7">
        <v-card class="pa-5">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ t('classDetail.sessionList') }}</h3>

          <v-alert
            v-if="overdueCount > 0"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-3"
            icon="mdi-clock-alert-outline"
          >
            {{ t('classDetail.overdueNotice', { n: overdueCount }) }}
          </v-alert>

          <v-table density="comfortable">
            <thead>
              <tr>
                <th>{{ t('session.date') }}</th>
                <th>{{ t('assistant.time') }}</th>
                <th>{{ t('session.lessonTopic') }}</th>
                <th>{{ t('session.instructor') }}</th>
                <th>{{ t('assistant.status') }}</th>
                <th class="text-right" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sessions ?? []" :key="s.id">
                <td class="text-no-wrap">{{ dayOf(s.startTime) }}</td>
                <td class="text-no-wrap">{{ timeRange(s.startTime, s.endTime) }}</td>
                <td>{{ s.lessonTopic || '—' }}</td>
                <td>{{ s.instructor?.fullName || '—' }}</td>
                <td>
                  <v-chip v-if="isOverdue(s)" size="x-small" color="error" variant="tonal">
                    {{ t('session.overdue') }}
                  </v-chip>
                  <v-chip v-else size="x-small" :color="statusColor[s.status]" variant="tonal">
                    {{ s.status }}
                  </v-chip>
                </td>
                <td class="text-right text-no-wrap">
                  <v-btn
                    v-if="s.status !== 'COMPLETED'"
                    size="x-small"
                    variant="tonal"
                    color="success"
                    prepend-icon="mdi-check"
                    :loading="updateSession.isPending.value"
                    @click="markSessionDone(s.id, 'COMPLETED')"
                  >
                    {{ t('session.markDone') }}
                  </v-btn>
                  <v-btn
                    v-else
                    size="x-small"
                    variant="text"
                    prepend-icon="mdi-restore"
                    :loading="updateSession.isPending.value"
                    @click="markSessionDone(s.id, 'SCHEDULED')"
                  >
                    {{ t('session.reopen') }}
                  </v-btn>
                </td>
              </tr>
              <tr v-if="!sessions?.length">
                <td colspan="6" class="text-center text-medium-emphasis pa-6">
                  {{ t('classDetail.noSessions') }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit dialog -->
    <v-dialog v-model="editOpen" max-width="480">
      <v-card>
        <v-card-title>{{ t('classDetail.editClass') }}</v-card-title>
        <v-card-text>
          <v-alert v-if="editError" type="error" variant="tonal" density="compact" class="mb-4">
            {{ editError }}
          </v-alert>
          <v-text-field v-model="form.name" :label="t('classDetail.name')" />
          <v-text-field v-model="form.level" :label="t('classDetail.level')" />
          <v-text-field
            v-model.number="form.totalSessions"
            type="number"
            :label="t('classDetail.totalSessions')"
            min="1"
          />
          <div class="text-caption text-medium-emphasis mb-1">{{ t('classDetail.color') }}</div>
          <v-menu :close-on-content-click="false" location="bottom start">
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="outlined" class="text-none mb-4" size="large">
                <v-avatar :color="form.color" size="22" class="mr-2" />
                {{ form.color }}
                <v-icon end size="18">mdi-palette</v-icon>
              </v-btn>
            </template>
            <v-color-picker v-model="form.color" mode="hex" :swatches="colorSwatches" show-swatches hide-inputs />
          </v-menu>
          <v-textarea v-model="form.description" :label="t('classDetail.description')" rows="2" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="editOpen = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="update.isPending.value" :disabled="!form.name" @click="saveEdit">
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add student dialog -->
    <v-dialog v-model="addOpen" max-width="460">
      <v-card>
        <v-card-title>{{ t('classDetail.addStudent') }}</v-card-title>
        <v-card-text>
          <v-alert v-if="addError" type="error" variant="tonal" density="compact" class="mb-4">
            {{ addError }}
          </v-alert>
          <v-select
            v-model="addForm.studentId"
            :items="availableStudents"
            item-title="fullName"
            item-value="id"
            :label="t('classDetail.student')"
          />
          <v-textarea
            v-model="addForm.note"
            :label="t('classDetail.note')"
            :hint="t('classDetail.noteHint')"
            persistent-hint
            rows="2"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="addOpen = false">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            :loading="enrollStudent.isPending.value"
            :disabled="!addForm.studentId"
            @click="addStudent"
          >
            {{ t('classDetail.addStudent') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
