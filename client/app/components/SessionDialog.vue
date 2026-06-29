<script setup lang="ts">
import type { TeachingSession } from '~/composables/useSessions';

const props = defineProps<{
  modelValue: boolean;
  session?: TeachingSession | null;
  // Prefill when creating from an empty calendar slot.
  prefill?: { start: string; end: string } | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [boolean];
  saved: [];
}>();

const { data: classesData, isLoading: isClassesLoading } = useClasses(undefined, undefined, 100);
const { data: assistantsData } = useAssistants();
const { create, update, bulkCreate, remove } = useSessionMutations();
const userTz = useUserTimezone();
const auth = useAuthStore();
const { t } = useI18n();

const classes = computed(() => classesData.value?.data ?? []);
const isEdit = computed(() => !!props.session);
const selectedClass = computed(() => classes.value.find((c) => c.id === form.classId) ?? null);

// Who can teach: the current teacher (you) + their assistants. Pick exactly one.
const instructorOptions = computed(() => {
  const me = auth.user
    ? [{ id: auth.user.id, fullName: `${auth.user.fullName} (${t('session.you')})` }]
    : [];
  const assistants = (assistantsData.value?.data ?? []).map((a) => ({
    id: a.id,
    fullName: a.fullName,
  }));
  return [...me, ...assistants];
});

type Mode = 'single' | 'recurring';
const mode = ref<Mode>('single');
const error = ref<string | null>(null);

const form = reactive({
  classId: '',
  date: '',
  startTime: '19:30',
  endTime: '21:00',
  lessonTopic: '',
  instructorId: '',
  // recurring
  startDate: '',
  endDate: '',
  daysOfWeek: [] as number[],
});

const weekdays = [
  { label: t('session.weekdays.sun'), value: 0 },
  { label: t('session.weekdays.mon'), value: 1 },
  { label: t('session.weekdays.tue'), value: 2 },
  { label: t('session.weekdays.wed'), value: 3 },
  { label: t('session.weekdays.thu'), value: 4 },
  { label: t('session.weekdays.fri'), value: 5 },
  { label: t('session.weekdays.sat'), value: 6 },
];

// Interpret/display times in the viewer's timezone.
function toLocalParts(iso: string) {
  return utcToWallParts(iso, userTz.value);
}

function combineToISO(date: string, time: string): string {
  return wallTimeToUtcISO(date, time, userTz.value);
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    error.value = null;
    mode.value = 'single';
    if (props.session) {
      const s = toLocalParts(props.session.startTime);
      const e = toLocalParts(props.session.endTime);
      form.classId = props.session.classId;
      form.date = s.date;
      form.startTime = s.time;
      form.endTime = e.time;
      form.lessonTopic = props.session.lessonTopic ?? '';
      form.instructorId = props.session.instructorId;
    } else if (props.prefill) {
      const s = toLocalParts(props.prefill.start);
      const e = toLocalParts(props.prefill.end);
      form.date = s.date;
      form.startDate = s.date;
      form.endDate = s.date;
      form.startTime = s.time;
      form.endTime = e.time;
      form.classId = classes.value[0]?.id ?? '';
      form.lessonTopic = '';
      form.instructorId = auth.user?.id ?? '';
      form.daysOfWeek = [];
    }
  },
);

const saving = computed(
  () => create.isPending.value || update.isPending.value || bulkCreate.isPending.value,
);
const deleting = computed(() => remove.isPending.value);

function close() {
  emit('update:modelValue', false);
}

async function save() {
  if (saving.value) return;
  error.value = null;
  try {
    if (mode.value === 'recurring' && !isEdit.value) {
      await bulkCreate.mutateAsync({
        classId: form.classId,
        startDate: form.startDate,
        endDate: form.endDate,
        daysOfWeek: form.daysOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        lessonTopic: form.lessonTopic || undefined,
        instructorId: form.instructorId || undefined,
        // Send the user's IANA timezone so the backend builds slots in their wall time.
        timeZone: userTz.value,
      });
    } else {
      const payload = {
        classId: form.classId,
        startTime: combineToISO(form.date, form.startTime),
        endTime: combineToISO(form.date, form.endTime),
        lessonTopic: form.lessonTopic || undefined,
        instructorId: form.instructorId || undefined,
      };
      if (isEdit.value && props.session) {
        await update.mutateAsync({ id: props.session.id, body: payload });
      } else {
        await create.mutateAsync(payload);
      }
    }
    emit('saved');
    close();
  } catch (e: unknown) {
    error.value = extractApiError(e);
  }
}

async function deleteSession() {
  if (deleting.value) return;
  if (!props.session) return;
  error.value = null;
  try {
    await remove.mutateAsync(props.session.id);
    emit('saved');
    close();
  } catch (e: unknown) {
    error.value = extractApiError(e);
  }
}

// Mark a session done / reopen it — drives class progress (completed/total).
async function setStatus(status: 'COMPLETED' | 'SCHEDULED') {
  if (!props.session) return;
  error.value = null;
  try {
    await update.mutateAsync({ id: props.session.id, body: { status } });
    emit('saved');
    close();
  } catch (e: unknown) {
    error.value = extractApiError(e);
  }
}

const statusColor: Record<string, string> = {
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-2">
          <span>{{ isEdit ? t('session.editSession') : t('session.newSession') }}</span>
          <v-chip v-if="isEdit && session" size="x-small" :color="statusColor[session.status]" variant="tonal">
            {{ session.status }}
          </v-chip>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
          {{ error }}
        </v-alert>

        <v-btn-toggle v-if="!isEdit" v-model="mode" mandatory density="comfortable" color="primary" class="mb-4">
          <v-btn value="single" size="small">{{ t('session.single') }}</v-btn>
          <v-btn value="recurring" size="small">{{ t('session.recurring') }}</v-btn>
        </v-btn-toggle>

        <AppSkeleton v-if="isClassesLoading && !classes.length" variant="form" :rows="1" class="mb-4" />

        <v-select v-else v-model="form.classId" :items="classes" item-title="name" item-value="id"
          :label="t('session.class')" :loading="isClassesLoading" prepend-inner-icon="mdi-google-classroom" />

        <div v-if="selectedClass" class="d-flex align-center ga-2 mb-3 mt-n2">
          <span class="text-caption text-medium-emphasis">{{ t('dashboard.classLabel') }}:</span>
          <ClassLocation :value="selectedClass" />
        </div>

        <template v-if="mode === 'single' || isEdit">
          <v-text-field v-model="form.date" type="date" :label="t('session.date')" />
        </template>

        <template v-else>
          <div class="d-flex ga-3">
            <v-text-field v-model="form.startDate" type="date" :label="t('session.from')" />
            <v-text-field v-model="form.endDate" type="date" :label="t('session.to')" />
          </div>
          <div class="mb-2 text-caption text-medium-emphasis">{{ t('session.repeatOn') }}</div>
          <v-chip-group v-model="form.daysOfWeek" multiple column class="mb-2">
            <v-chip v-for="d in weekdays" :key="d.value" :value="d.value" filter variant="outlined">
              {{ d.label }}
            </v-chip>
          </v-chip-group>
        </template>

        <div class="d-flex ga-3">
          <v-text-field v-model="form.startTime" type="time" :label="t('session.start')" />
          <v-text-field v-model="form.endTime" type="time" :label="t('session.end')" />
        </div>

        <v-text-field v-model="form.lessonTopic" :label="t('session.lessonTopic')"
          prepend-inner-icon="mdi-book-open-variant" />

        <!-- Who teaches this session: you or one of your assistants. -->
        <v-select v-model="form.instructorId" :items="instructorOptions" item-title="fullName" item-value="id"
          :label="t('session.instructor')" :hint="t('session.instructorHint')" persistent-hint
          prepend-inner-icon="mdi-account-tie-outline" />
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-btn v-if="isEdit" color="error" variant="text" prepend-icon="mdi-delete" :loading="deleting"
          :disabled="deleting || saving" @click="deleteSession">
          {{ t('common.delete') }}
        </v-btn>
        <template v-if="isEdit && session">
          <v-btn v-if="session.status !== 'COMPLETED'" color="success" variant="tonal" prepend-icon="mdi-check-circle"
            :loading="update.isPending.value" @click="setStatus('COMPLETED')">
            {{ t('session.markDone') }}
          </v-btn>
          <v-btn v-else variant="text" prepend-icon="mdi-restore" :loading="update.isPending.value"
            @click="setStatus('SCHEDULED')">
            {{ t('session.reopen') }}
          </v-btn>
        </template>
        <v-spacer />
        <v-btn variant="text" :disabled="saving || deleting" @click="close">{{ t('common.cancel') }}</v-btn>
        <v-btn color="primary" :loading="saving" :disabled="!form.classId" @click="save">
          {{ t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
