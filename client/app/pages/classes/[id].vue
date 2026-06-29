<script setup lang="ts">
import {
  useClassDetail,
  useClassSessions,
  useClassStudents,
  useClassMutations,
} from '~/composables/useClasses';
import { useStudents } from '~/composables/useStudents';
import type { ClassEnrollment } from '~/composables/useClasses';
import { usePaymentMutations, statusColor as paymentStatusColor, PAYMENT_METHODS } from '~/composables/usePayments';
import {
  useDocuments,
  useDocumentMutations,
  useDocumentDownload,
  type DocumentItem,
} from '~/composables/useDocuments';

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

// ----- Class documents (assigned to this class) -----
const { data: classDocsData } = useDocuments({ classId: id }, 100);
const { data: libraryDocsData } = useDocuments({}, 100);
const { assign: assignDoc, unassign: unassignDoc } = useDocumentMutations();
const downloadDoc = useDocumentDownload();

const classDocs = computed(() => classDocsData.value?.data ?? []);
const DOC_ICON: Record<DocumentItem['type'], { icon: string; color: string }> = {
  PDF: { icon: 'mdi-file-document-outline', color: 'red' },
  MP3: { icon: 'mdi-headphones', color: 'deep-purple' },
  LINK: { icon: 'mdi-link-variant', color: 'blue' },
};
// Library docs not yet assigned to this class.
const assignableDocs = computed(() => {
  const assignedIds = new Set(classDocs.value.map((d) => d.id));
  return (libraryDocsData.value?.data ?? []).filter((d) => !assignedIds.has(d.id));
});
const docToAssign = ref('');
async function attachDoc() {
  if (!docToAssign.value) return;
  await assignDoc.mutateAsync({ id: docToAssign.value, classId: id.value });
  docToAssign.value = '';
}
async function detachDoc(doc: DocumentItem) {
  const a = (doc.assignments ?? []).find((x) => x.classId === id.value);
  if (!a) return;
  await unassignDoc.mutateAsync({ id: doc.id, assignmentId: a.id });
}

const colorSwatches = [
  ['#5D87FF', '#49BEFF', '#13DEB9'],
  ['#FFAE1F', '#FA896B', '#FF5C8E'],
  ['#7C4DFF', '#00C292', '#0BB2FB'],
  ['#E91E63', '#9C27B0', '#3F51B5'],
];

// ----- Edit -----
const editOpen = ref(false);
const editError = ref<string | null>(null);
const form = reactive({
  name: '',
  level: '',
  color: '#5D87FF',
  description: '',
  totalSessions: null as number | null,
  tuitionFee: null as number | null,
  locationType: 'OFFLINE' as 'OFFLINE' | 'ONLINE',
  room: '',
  meetingProvider: 'GOOGLE_MEET' as 'GOOGLE_MEET' | 'ZOOM' | 'OTHER',
  meetingUrl: '',
});
const providerItems = [
  { value: 'GOOGLE_MEET', title: 'Google Meet' },
  { value: 'ZOOM', title: 'Zoom' },
  { value: 'OTHER', title: 'Khác' },
];

function openEdit() {
  if (!klass.value) return;
  Object.assign(form, {
    name: klass.value.name,
    level: klass.value.level ?? '',
    color: klass.value.color ?? '#5D87FF',
    description: klass.value.description ?? '',
    totalSessions: klass.value.totalSessions ?? null,
    tuitionFee: klass.value.tuitionFee ?? null,
    locationType: klass.value.locationType ?? 'OFFLINE',
    room: klass.value.room ?? '',
    meetingProvider: klass.value.meetingProvider ?? 'GOOGLE_MEET',
    meetingUrl: klass.value.meetingUrl ?? '',
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
        tuitionFee: form.tuitionFee ? Number(form.tuitionFee) : undefined,
        locationType: form.locationType,
        room: form.locationType === 'OFFLINE' ? form.room || undefined : undefined,
        meetingProvider: form.locationType === 'ONLINE' ? form.meetingProvider : undefined,
        meetingUrl: form.locationType === 'ONLINE' ? form.meetingUrl || undefined : undefined,
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

// ----- Tuition / payments (per student in this class) -----
const { createTuition, updateTuition, recordPayment, deleteTuition } = usePaymentMutations();
async function removeTuition(e: ClassEnrollment) {
  if (!e.tuition) return;
  if (!confirm(`Xoá khoản học phí của ${e.student.fullName}? (chỉ được khi chưa có đợt đóng)`)) return;
  try {
    await deleteTuition.mutateAsync(e.tuition.id);
  } catch (err) {
    alert(extractApiError(err));
  }
}
function money(n?: number | string) {
  return Number(n ?? 0).toLocaleString('vi-VN');
}
function remainingOf(e: ClassEnrollment) {
  return e.tuition ? e.tuition.totalAmount - e.tuition.paidAmount : 0;
}

// Create tuition for a student who has none yet.
const feeOpen = ref(false);
const feeError = ref<string | null>(null);
const feeStudent = ref<ClassEnrollment | null>(null);
const feeForm = reactive({ totalAmount: 0, dueDate: '' });
function openFee(e: ClassEnrollment) {
  feeStudent.value = e;
  feeForm.totalAmount = Number(klass.value?.tuitionFee ?? 0);
  feeForm.dueDate = '';
  feeError.value = null;
  feeOpen.value = true;
}
async function submitFee() {
  if (!feeStudent.value) return;
  feeError.value = null;
  try {
    await createTuition.mutateAsync({
      studentId: feeStudent.value.student.id,
      classId: id.value,
      totalAmount: Number(feeForm.totalAmount),
      dueDate: feeForm.dueDate || undefined,
    });
    feeOpen.value = false;
  } catch (e) {
    feeError.value = extractApiError(e);
  }
}

// Edit an existing tuition (fix the total / due date).
const editFeeOpen = ref(false);
const editFeeError = ref<string | null>(null);
const editFeeStudent = ref<ClassEnrollment | null>(null);
const editFeeForm = reactive({ totalAmount: 0, dueDate: '' });
function openEditFee(e: ClassEnrollment) {
  if (!e.tuition) return;
  editFeeStudent.value = e;
  editFeeForm.totalAmount = e.tuition.totalAmount;
  editFeeForm.dueDate = e.tuition.dueDate ? e.tuition.dueDate.slice(0, 10) : '';
  editFeeError.value = null;
  editFeeOpen.value = true;
}
async function submitEditFee() {
  if (!editFeeStudent.value?.tuition) return;
  editFeeError.value = null;
  try {
    await updateTuition.mutateAsync({
      id: editFeeStudent.value.tuition.id,
      body: {
        totalAmount: Number(editFeeForm.totalAmount),
        dueDate: editFeeForm.dueDate || undefined,
      },
    });
    editFeeOpen.value = false;
  } catch (e) {
    editFeeError.value = extractApiError(e);
  }
}

// Record a payment installment against a student's tuition.
const payOpen = ref(false);
const payError = ref<string | null>(null);
const payStudent = ref<ClassEnrollment | null>(null);
const payForm = reactive({ amount: 0, paidAt: '', method: 'cash', note: '' });
function openPay(e: ClassEnrollment) {
  payStudent.value = e;
  payForm.amount = remainingOf(e);
  payForm.paidAt = '';
  payForm.method = 'cash';
  payForm.note = '';
  payError.value = null;
  payOpen.value = true;
}
async function submitPay() {
  if (!payStudent.value?.tuition) return;
  payError.value = null;
  try {
    await recordPayment.mutateAsync({
      id: payStudent.value.tuition.id,
      body: {
        amount: Number(payForm.amount),
        paidAt: payForm.paidAt || undefined,
        method: payForm.method || undefined,
        note: payForm.note || undefined,
      },
    });
    payOpen.value = false;
  } catch (e) {
    payError.value = extractApiError(e);
  }
}
async function payFull(e: ClassEnrollment) {
  if (!e.tuition) return;
  const remaining = remainingOf(e);
  if (remaining <= 0) return;
  await recordPayment.mutateAsync({ id: e.tuition.id, body: { amount: remaining } });
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
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="text-caption text-medium-emphasis">Hình thức học</div>
            <ClassLocation :value="klass" />
          </div>
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
          <v-list v-if="students?.length" class="py-0">
            <v-list-item v-for="e in students" :key="e.id" class="px-0">
              <template #prepend>
                <v-avatar color="secondary" size="34" class="mr-2">
                  <v-img v-if="avatar(e.student)" :src="avatar(e.student)!" />
                  <span v-else class="text-white">{{ e.student.fullName[0] }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                <NuxtLink :to="`/students/${e.student.id}`" class="text-decoration-none">
                  {{ e.student.fullName }}
                </NuxtLink>
              </v-list-item-title>
              <v-list-item-subtitle>
                <template v-if="e.tuition">
                  Đã đóng <b class="text-success">{{ money(e.tuition.paidAmount) }}</b> /
                  {{ money(e.tuition.totalAmount) }}
                  <v-chip size="x-small" :color="paymentStatusColor[e.tuition.status]" variant="tonal" class="ml-1">
                    {{ remainingOf(e) > 0 ? `Còn ${money(remainingOf(e))}` : 'Đã đóng đủ' }}
                  </v-chip>
                </template>
                <span v-else class="text-medium-emphasis">Chưa có học phí</span>
              </v-list-item-subtitle>
              <template #append>
                <div class="d-flex align-center ga-1">
                  <template v-if="e.tuition">
                    <v-btn
                      v-if="remainingOf(e) > 0"
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      prepend-icon="mdi-cash-plus"
                      @click="openPay(e)"
                    >
                      Thu tiền
                    </v-btn>
                    <v-btn
                      v-if="remainingOf(e) > 0"
                      size="x-small"
                      variant="text"
                      color="success"
                      :loading="recordPayment.isPending.value"
                      @click="payFull(e)"
                    >
                      Đóng đủ
                    </v-btn>
                    <v-btn
                      icon="mdi-pencil"
                      size="x-small"
                      variant="text"
                      title="Sửa học phí"
                      @click="openEditFee(e)"
                    />
                    <v-btn
                      icon="mdi-cash-remove"
                      size="x-small"
                      variant="text"
                      color="error"
                      title="Xoá khoản học phí"
                      @click="removeTuition(e)"
                    />
                  </template>
                  <v-btn
                    v-else
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    prepend-icon="mdi-cash"
                    @click="openFee(e)"
                  >
                    Tạo học phí
                  </v-btn>
                  <v-btn
                    icon="mdi-account-remove"
                    size="x-small"
                    variant="text"
                    @click="removeStudent(e.student.id)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-medium-emphasis text-caption">{{ t('classDetail.noStudents') }}</div>
        </v-card>

        <!-- Class documents -->
        <v-card class="pa-5 mt-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Tài liệu lớp học</h3>

          <v-list v-if="classDocs.length" class="py-0">
            <v-list-item
              v-for="doc in classDocs"
              :key="doc.id"
              class="px-0"
              @click="downloadDoc(doc)"
            >
              <template #prepend>
                <v-avatar :color="DOC_ICON[doc.type].color" variant="tonal" size="34" rounded="lg">
                  <v-icon size="18">{{ DOC_ICON[doc.type].icon }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">{{ doc.title }}</v-list-item-title>
              <v-list-item-subtitle v-if="doc.category">{{ doc.category }}</v-list-item-subtitle>
              <template #append>
                <v-btn
                  icon="mdi-link-off"
                  size="x-small"
                  variant="text"
                  title="Gỡ khỏi lớp"
                  @click.stop="detachDoc(doc)"
                />
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-medium-emphasis text-caption mb-3">Lớp chưa có tài liệu nào.</div>

          <div class="d-flex ga-2 align-center mt-3">
            <v-select
              v-model="docToAssign"
              :items="assignableDocs"
              item-title="title"
              item-value="id"
              label="Gán tài liệu có sẵn"
              density="comfortable"
              hide-details
              :no-data-text="'Không còn tài liệu để gán'"
            />
            <v-btn color="primary" :loading="assignDoc.isPending.value" :disabled="!docToAssign" @click="attachDoc">
              Gán
            </v-btn>
          </div>
          <NuxtLink to="/documents" class="text-caption text-primary text-decoration-none d-inline-block mt-2">
            + Tải lên tài liệu mới
          </NuxtLink>
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
                <th>{{ t('assistant.actions') }}</th>
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
          <v-text-field
            v-model.number="form.tuitionFee"
            type="number"
            label="Học phí khoá (mặc định)"
            prepend-inner-icon="mdi-cash"
            min="0"
          />

          <div class="text-caption text-medium-emphasis mt-2 mb-1">Hình thức học</div>
          <v-btn-toggle v-model="form.locationType" mandatory density="comfortable" color="primary" class="mb-3">
            <v-btn value="OFFLINE" size="small"><v-icon start>mdi-map-marker-outline</v-icon>Offline</v-btn>
            <v-btn value="ONLINE" size="small"><v-icon start>mdi-video-outline</v-icon>Online</v-btn>
          </v-btn-toggle>
          <v-text-field
            v-if="form.locationType === 'OFFLINE'"
            v-model="form.room"
            label="Số phòng học"
            placeholder="VD: P.201"
            prepend-inner-icon="mdi-door"
          />
          <template v-else>
            <v-select
              v-model="form.meetingProvider"
              :items="providerItems"
              label="Nền tảng"
              prepend-inner-icon="mdi-video"
            />
            <v-text-field
              v-model="form.meetingUrl"
              label="Link tham gia"
              placeholder="https://…"
              prepend-inner-icon="mdi-link-variant"
            />
          </template>

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

    <!-- Create tuition dialog -->
    <v-dialog v-model="feeOpen" max-width="420">
      <v-card v-if="feeStudent">
        <v-card-title>Tạo học phí — {{ feeStudent.student.fullName }}</v-card-title>
        <v-card-text>
          <v-alert v-if="feeError" type="error" variant="tonal" density="compact" class="mb-3">
            {{ feeError }}
          </v-alert>
          <v-text-field v-model.number="feeForm.totalAmount" type="number" label="Tổng học phí" prepend-inner-icon="mdi-cash" />
          <v-text-field v-model="feeForm.dueDate" type="date" label="Hạn đóng (tuỳ chọn)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="feeOpen = false">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            :loading="createTuition.isPending.value"
            :disabled="feeForm.totalAmount <= 0"
            @click="submitFee"
          >
            Tạo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit tuition dialog -->
    <v-dialog v-model="editFeeOpen" max-width="420">
      <v-card v-if="editFeeStudent">
        <v-card-title>Sửa học phí — {{ editFeeStudent.student.fullName }}</v-card-title>
        <v-card-text>
          <v-alert v-if="editFeeError" type="error" variant="tonal" density="compact" class="mb-3">
            {{ editFeeError }}
          </v-alert>
          <p v-if="editFeeStudent.tuition" class="text-caption text-medium-emphasis mb-2">
            Đã đóng {{ money(editFeeStudent.tuition.paidAmount) }} — đặt tổng thấp hơn mức đã đóng sẽ thành "đã đóng đủ".
          </p>
          <v-text-field v-model.number="editFeeForm.totalAmount" type="number" label="Tổng học phí" prepend-inner-icon="mdi-cash" />
          <v-text-field v-model="editFeeForm.dueDate" type="date" label="Hạn đóng (tuỳ chọn)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="editFeeOpen = false">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            :loading="updateTuition.isPending.value"
            :disabled="editFeeForm.totalAmount < 0"
            @click="submitEditFee"
          >
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Record payment dialog -->
    <v-dialog v-model="payOpen" max-width="420">
      <v-card v-if="payStudent && payStudent.tuition">
        <v-card-title>Thu tiền — {{ payStudent.student.fullName }}</v-card-title>
        <v-card-text>
          <v-alert v-if="payError" type="error" variant="tonal" density="compact" class="mb-3">
            {{ payError }}
          </v-alert>
          <p class="text-caption text-medium-emphasis mb-2">Còn lại: {{ money(remainingOf(payStudent)) }}</p>
          <v-text-field v-model.number="payForm.amount" type="number" label="Số tiền" prepend-inner-icon="mdi-cash" />
          <v-text-field v-model="payForm.paidAt" type="date" label="Ngày đóng (mặc định hôm nay)" />
          <v-select v-model="payForm.method" :items="PAYMENT_METHODS" label="Phương thức" />
          <v-text-field v-model="payForm.note" label="Ghi chú (tuỳ chọn)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="payOpen = false">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            :loading="recordPayment.isPending.value"
            :disabled="payForm.amount <= 0"
            @click="submitPay"
          >
            Ghi nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
