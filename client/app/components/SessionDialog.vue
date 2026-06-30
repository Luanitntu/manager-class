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
const classItems = computed(() => classes.value.map((item) => ({
  value: item.id,
  title: item.name,
})));

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
const instructorItems = computed(() => instructorOptions.value.map((item) => ({
  value: item.id,
  title: item.fullName,
})));

type Mode = 'single' | 'recurring';
const mode = ref<Mode>('single');
const error = ref<string | null>(null);
const confirmDeleteOpen = ref(false);
const modeItems = computed(() => [
  { value: 'single', label: t('session.single') },
  { value: 'recurring', label: t('session.recurring') },
]);

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
const canSave = computed(() => {
  if (!form.classId || !form.startTime || !form.endTime) return false;
  if (mode.value === 'recurring' && !isEdit.value) {
    return !!form.startDate && !!form.endDate && form.daysOfWeek.length > 0;
  }
  return !!form.date;
});

function close() {
  emit('update:modelValue', false);
}

function toggleWeekday(day: number) {
  if (form.daysOfWeek.includes(day)) {
    form.daysOfWeek = form.daysOfWeek.filter((value) => value !== day);
  } else {
    form.daysOfWeek = [...form.daysOfWeek, day].sort((a, b) => a - b);
  }
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
    confirmDeleteOpen.value = false;
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

type BadgeTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

const statusColor: Record<string, BadgeTone> = {
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};
</script>

<template>
  <UiDialog
    :model-value="modelValue"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <span class="min-w-0 truncate">{{ isEdit ? t('session.editSession') : t('session.newSession') }}</span>
        <UiBadge
          v-if="isEdit && session"
          :tone="statusColor[session.status] ?? 'neutral'"
          size="sm"
        >
            {{ session.status }}
        </UiBadge>
      </div>
    </template>

    <div class="grid gap-4">
      <UiAlert v-if="error" tone="error">
        {{ error }}
      </UiAlert>

      <UiSegmentedControl
        v-if="!isEdit"
        v-model="mode"
        :items="modeItems"
        :label="`${t('session.newSession')} ${t('common.actions')}`"
      />

      <AppSkeleton v-if="isClassesLoading && !classes.length" variant="form" :rows="1" />

      <UiSelect
        v-else
        v-model="form.classId"
        :items="classItems"
        :label="t('session.class')"
        :loading="isClassesLoading"
        required
      />

      <div v-if="selectedClass" class="flex min-w-0 flex-wrap items-center gap-2">
        <UiBadge tone="neutral" size="sm" icon="mdi-google-classroom">
          {{ t('dashboard.classLabel') }}
        </UiBadge>
        <ClassLocation :value="selectedClass" />
      </div>

      <template v-if="mode === 'single' || isEdit">
        <UiInput v-model="form.date" type="date" :label="t('session.date')" required />
      </template>

      <template v-else>
        <div class="grid gap-3 sm:grid-cols-2">
          <UiInput v-model="form.startDate" type="date" :label="t('session.from')" required />
          <UiInput v-model="form.endDate" type="date" :label="t('session.to')" required />
        </div>
        <fieldset class="grid gap-2">
          <legend class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
            {{ t('session.repeatOn') }}
            <span class="text-red-600" aria-hidden="true">*</span>
          </legend>
          <div class="flex min-w-0 flex-wrap gap-2">
            <button
              v-for="d in weekdays"
              :key="d.value"
              type="button"
              :aria-pressed="form.daysOfWeek.includes(d.value)"
              :class="[
                'inline-flex min-h-9 items-center gap-1 rounded-[var(--st-radius)] border px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100',
                form.daysOfWeek.includes(d.value)
                  ? 'border-[var(--st-primary)] bg-blue-50 text-[var(--st-primary)]'
                  : 'border-[var(--st-border)] bg-white text-[var(--st-muted)] hover:bg-slate-50',
              ]"
              @click="toggleWeekday(d.value)"
            >
              <AppIcon
                v-if="form.daysOfWeek.includes(d.value)"
                name="mdi-check"
                :size="16"
              />
              {{ d.label }}
            </button>
          </div>
        </fieldset>
      </template>

      <div class="grid gap-3 sm:grid-cols-2">
        <UiInput v-model="form.startTime" type="time" :label="t('session.start')" required />
        <UiInput v-model="form.endTime" type="time" :label="t('session.end')" required />
      </div>

      <UiInput v-model="form.lessonTopic" :label="t('session.lessonTopic')">
        <template #leading>
          <AppIcon name="mdi-book-open-variant" :size="18" class="text-slate-500" />
        </template>
      </UiInput>

      <UiSelect
        v-model="form.instructorId"
        :items="instructorItems"
        :label="t('session.instructor')"
        :hint="t('session.instructorHint')"
      />
    </div>

    <template #footer>
      <UiActionGroup align="between" class="w-full">
        <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
          <UiButton
            v-if="isEdit"
            variant="danger"
            leading-icon="mdi-delete"
            :loading="deleting"
            :disabled="deleting || saving"
            @click="confirmDeleteOpen = true"
          >
            {{ t('common.delete') }}
          </UiButton>
          <template v-if="isEdit && session">
            <UiButton
              v-if="session.status !== 'COMPLETED'"
              variant="secondary"
              leading-icon="mdi-check-circle"
              :loading="update.isPending.value"
              :disabled="deleting || saving"
              @click="setStatus('COMPLETED')"
            >
              {{ t('session.markDone') }}
            </UiButton>
            <UiButton
              v-else
              variant="ghost"
              leading-icon="mdi-restore"
              :loading="update.isPending.value"
              :disabled="deleting || saving"
              @click="setStatus('SCHEDULED')"
            >
              {{ t('session.reopen') }}
            </UiButton>
          </template>
        </div>
        <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:justify-end">
          <UiButton variant="secondary" :disabled="saving || deleting" @click="close">
            {{ t('common.cancel') }}
          </UiButton>
          <UiButton :loading="saving" :disabled="!canSave || deleting" @click="save">
            {{ t('common.save') }}
          </UiButton>
        </div>
      </UiActionGroup>
    </template>
  </UiDialog>

  <UiConfirmDialog
    v-model="confirmDeleteOpen"
    title="Delete session"
    message="This action cannot be undone. Delete this session?"
    confirm-label="Delete session"
    :cancel-label="t('common.cancel')"
    destructive
    :loading="deleting"
    @confirm="deleteSession"
  />
</template>
