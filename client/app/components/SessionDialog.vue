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

const { data: classesData, isLoading: isClassesLoading } = useClasses();
const { create, update, bulkCreate, remove } = useSessionMutations();

const classes = computed(() => classesData.value?.data ?? []);
const isEdit = computed(() => !!props.session);

type Mode = 'single' | 'recurring';
const mode = ref<Mode>('single');
const error = ref<string | null>(null);

const form = reactive({
  classId: '',
  date: '',
  startTime: '19:30',
  endTime: '21:00',
  lessonTopic: '',
  // recurring
  startDate: '',
  endDate: '',
  daysOfWeek: [] as number[],
});

const weekdays = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

function toLocalParts(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function combineToISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
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
      });
    } else {
      const payload = {
        classId: form.classId,
        startTime: combineToISO(form.date, form.startTime),
        endTime: combineToISO(form.date, form.endTime),
        lessonTopic: form.lessonTopic || undefined,
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
    error.value = extractApiError(e) ?? 'Could not save session';
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
    error.value = extractApiError(e) ?? 'Could not delete session';
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>{{ isEdit ? 'Edit session' : 'New session' }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
          {{ error }}
        </v-alert>

        <v-btn-toggle
          v-if="!isEdit"
          v-model="mode"
          mandatory
          density="comfortable"
          color="primary"
          class="mb-4"
        >
          <v-btn value="single" size="small">Single</v-btn>
          <v-btn value="recurring" size="small">Recurring</v-btn>
        </v-btn-toggle>

        <AppSkeleton v-if="isClassesLoading && !classes.length" variant="form" :rows="1" class="mb-4" />

        <v-select
          v-else
          v-model="form.classId"
          :items="classes"
          item-title="name"
          item-value="id"
          label="Class"
          :loading="isClassesLoading"
          prepend-inner-icon="mdi-google-classroom"
        />

        <template v-if="mode === 'single' || isEdit">
          <v-text-field v-model="form.date" type="date" label="Date" />
        </template>

        <template v-else>
          <div class="d-flex ga-3">
            <v-text-field v-model="form.startDate" type="date" label="From" />
            <v-text-field v-model="form.endDate" type="date" label="To" />
          </div>
          <div class="mb-2 text-caption text-medium-emphasis">Repeat on</div>
          <v-chip-group v-model="form.daysOfWeek" multiple column class="mb-2">
            <v-chip
              v-for="d in weekdays"
              :key="d.value"
              :value="d.value"
              filter
              variant="outlined"
            >
              {{ d.label }}
            </v-chip>
          </v-chip-group>
        </template>

        <div class="d-flex ga-3">
          <v-text-field v-model="form.startTime" type="time" label="Start" />
          <v-text-field v-model="form.endTime" type="time" label="End" />
        </div>

        <v-text-field
          v-model="form.lessonTopic"
          label="Lesson topic"
          prepend-inner-icon="mdi-book-open-variant"
        />
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-btn
          v-if="isEdit"
          color="error"
          variant="text"
          prepend-icon="mdi-delete"
          :loading="deleting"
          :disabled="deleting || saving"
          @click="deleteSession"
        >
          Delete
        </v-btn>
        <v-spacer />
        <v-btn variant="text" :disabled="saving || deleting" @click="close">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" :disabled="!form.classId" @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
