<script setup lang="ts">
import {
  useStudentActivity,
  useStudentComments,
  useStudentDetail,
  useStudentMutations,
  useStudentPayments,
  useStudentScores,
  type ActivityItem,
  type StudentPayments,
} from '~/composables/useStudents';
import { useClasses } from '~/composables/useClasses';
import { usePaymentMutations } from '~/composables/usePayments';

type TuitionRow = StudentPayments['tuitions'][number];

const route = useRoute();
const id = computed(() => route.params.id as string);

const { data: student } = useStudentDetail(id);
const { data: scores } = useStudentScores(id);
const { data: comments } = useStudentComments(id);
const { data: payments } = useStudentPayments(id);
const { data: activity } = useStudentActivity(id);
const { data: classesData } = useClasses();
const { updateProfile, addScore, deleteScore, addComment } = useStudentMutations();
const avatar = useAvatar();

const tab = ref('profile');
const classes = computed(() => classesData.value?.data ?? []);

// ── Info card / badges ──────────────────────────────────────────────────────
const enrolledClasses = computed(() => student.value?.enrollments?.map((e) => e.class) ?? []);
// Active = currently studying; archived (isActive === false) = soft-deleted class.
const activeClasses = computed(() => enrolledClasses.value.filter((c) => c.isActive !== false));
const archivedClasses = computed(() => enrolledClasses.value.filter((c) => c.isActive === false));
const level = computed(() => activeClasses.value.map((c) => c.level).find(Boolean) ?? null);
const outstanding = computed(() => payments.value?.outstanding ?? 0);

function money(n?: number) {
  return (n ?? 0).toLocaleString('vi-VN');
}
function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN');
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

// ── Scores summary ──────────────────────────────────────────────────────────
function avgOf(list: { value: string }[]) {
  if (!list.length) return null;
  const sum = list.reduce((a, s) => a + Number(s.value), 0);
  return Math.round((sum / list.length) * 10) / 10;
}
const scoreSummary = computed(() => {
  const all = scores.value ?? [];
  const byType = (t: string) => all.filter((s) => s.type === t);
  return {
    average: avgOf(all),
    assignment: avgOf(byType('ASSIGNMENT')),
    quiz: avgOf(byType('QUIZ')),
    final: avgOf(byType('FINAL')),
  };
});

// ── Activity presentation ───────────────────────────────────────────────────
const ACTIVITY_META: Record<ActivityItem['type'], { icon: string; color: string }> = {
  JOINED_CLASS: { icon: 'mdi-account-plus', color: 'primary' },
  SCORE_ADDED: { icon: 'mdi-chart-box', color: 'info' },
  COMMENT_ADDED: { icon: 'mdi-comment-text-outline', color: 'secondary' },
  PAYMENT_RECORDED: { icon: 'mdi-cash-check', color: 'success' },
};

// ── Profile form ────────────────────────────────────────────────────────────
const profile = reactive({
  fullName: '',
  phone: '',
  address: '',
  occupation: '',
  educationLevel: '',
  learningGoal: '',
});
watch(student, (s) => {
  if (!s) return;
  profile.fullName = s.fullName;
  profile.phone = s.phone ?? '';
  profile.address = s.studentProfile?.address ?? '';
  profile.occupation = s.studentProfile?.occupation ?? '';
  profile.educationLevel = s.studentProfile?.educationLevel ?? '';
  profile.learningGoal = s.studentProfile?.learningGoal ?? '';
});

const scoreForm = reactive({ classId: '', type: 'QUIZ', value: 0, maxValue: 10, label: '' });
const commentForm = reactive({ category: 'progress', content: '' });
const commentCategories = ['attitude', 'strengths', 'weaknesses', 'progress', 'note', 'Payment Note'];

async function saveProfile() {
  await updateProfile.mutateAsync({ id: id.value, body: { ...profile } });
}

async function submitScore() {
  if (!scoreForm.classId) return;
  await addScore.mutateAsync({
    id: id.value,
    body: {
      classId: scoreForm.classId,
      type: scoreForm.type,
      value: Number(scoreForm.value),
      maxValue: Number(scoreForm.maxValue),
      label: scoreForm.label || undefined,
    },
  });
  scoreForm.value = 0;
  scoreForm.label = '';
}

async function submitComment() {
  if (!commentForm.content) return;
  await addComment.mutateAsync({
    id: id.value,
    body: { category: commentForm.category, content: commentForm.content },
  });
  commentForm.content = '';
}

// ── Payments (tuition + installments) ───────────────────────────────────────
const { createTuition, updateTuition, recordPayment } = usePaymentMutations();
const PAY_STATUS: Record<string, string> = {
  PAID: 'success',
  PARTIALLY_PAID: 'info',
  PENDING: 'warning',
  OVERDUE: 'error',
};
function payStatusLabel(s: string) {
  return (
    { PAID: 'Đã đóng đủ', PARTIALLY_PAID: 'Đóng một phần', PENDING: 'Chưa đóng', OVERDUE: 'Quá hạn' }[s] ?? s
  );
}

const tuitionOpen = ref(false);
const tuitionError = ref<string | null>(null);
const tuitionForm = reactive({ classId: '', totalAmount: 0, dueDate: '', notes: '' });
function openCreateTuition() {
  Object.assign(tuitionForm, {
    classId: activeClasses.value[0]?.id ?? '',
    totalAmount: 0,
    dueDate: '',
    notes: '',
  });
  tuitionError.value = null;
  tuitionOpen.value = true;
}
async function submitTuition() {
  tuitionError.value = null;
  try {
    await createTuition.mutateAsync({
      studentId: id.value,
      classId: tuitionForm.classId,
      totalAmount: Number(tuitionForm.totalAmount),
      dueDate: tuitionForm.dueDate || undefined,
      notes: tuitionForm.notes || undefined,
    });
    tuitionOpen.value = false;
  } catch (e) {
    tuitionError.value = extractApiError(e);
  }
}

const editOpen = ref(false);
const editError = ref<string | null>(null);
const editTuition = ref<TuitionRow | null>(null);
const editForm = reactive({ totalAmount: 0, dueDate: '' });
function openEditTuition(tu: TuitionRow) {
  editTuition.value = tu;
  editForm.totalAmount = tu.totalAmount;
  editForm.dueDate = tu.dueDate ? tu.dueDate.slice(0, 10) : '';
  editError.value = null;
  editOpen.value = true;
}
async function submitEditTuition() {
  if (!editTuition.value) return;
  editError.value = null;
  try {
    await updateTuition.mutateAsync({
      id: editTuition.value.id,
      body: { totalAmount: Number(editForm.totalAmount), dueDate: editForm.dueDate || undefined },
    });
    editOpen.value = false;
  } catch (e) {
    editError.value = extractApiError(e);
  }
}

const recordOpen = ref(false);
const recordError = ref<string | null>(null);
const recordTuition = ref<TuitionRow | null>(null);
const recordForm = reactive({ amount: 0, paidAt: '', method: '', note: '' });
function openRecordPayment(tu: TuitionRow) {
  recordTuition.value = tu;
  Object.assign(recordForm, { amount: tu.totalAmount - tu.paidAmount, paidAt: '', method: '', note: '' });
  recordError.value = null;
  recordOpen.value = true;
}
async function submitRecord() {
  if (!recordTuition.value) return;
  recordError.value = null;
  try {
    await recordPayment.mutateAsync({
      id: recordTuition.value.id,
      body: {
        amount: Number(recordForm.amount),
        paidAt: recordForm.paidAt || undefined,
        method: recordForm.method || undefined,
        note: recordForm.note || undefined,
      },
    });
    recordOpen.value = false;
  } catch (e) {
    recordError.value = extractApiError(e);
  }
}
async function payFull(tu: TuitionRow) {
  const remaining = tu.totalAmount - tu.paidAmount;
  if (remaining <= 0) return;
  await recordPayment.mutateAsync({ id: tu.id, body: { amount: remaining, method: 'Đóng đủ' } });
}
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/students" class="mb-4">
      Back to students
    </v-btn>

    <div v-if="student" class="d-flex align-center ga-3 mb-4 flex-wrap">
      <v-avatar color="secondary" size="48">
        <v-img v-if="avatar(student)" :src="avatar(student)!" />
        <span v-else class="text-white text-h6">{{ student.fullName[0] }}</span>
      </v-avatar>
      <div class="flex-grow-1">
        <div class="d-flex align-center ga-2 flex-wrap">
          <h1 class="text-h5 font-weight-bold">{{ student.fullName }}</h1>
          <v-chip v-if="level" size="small" color="info" variant="tonal">{{ level }}</v-chip>
          <v-chip
            v-for="c in activeClasses"
            :key="c.id"
            size="small"
            color="primary"
            variant="tonal"
            :to="`/classes/${c.id}`"
          >
            {{ c.name }}
          </v-chip>
          <v-chip
            v-for="c in archivedClasses"
            :key="c.id"
            size="small"
            color="grey"
            variant="tonal"
            class="st-archived"
            :title="'Đã lưu trữ'"
          >
            {{ c.name }}
          </v-chip>
          <v-chip
            size="small"
            :color="outstanding > 0 ? 'error' : 'success'"
            variant="tonal"
          >
            {{ outstanding > 0 ? `Còn nợ: ${money(outstanding)}` : 'Đã đóng đủ' }}
          </v-chip>
        </div>
        <div class="text-medium-emphasis">{{ student.email }}</div>
      </div>
    </div>

    <!-- Small info card -->
    <v-card v-if="student" class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="6" md="3">
          <div class="text-caption text-medium-emphasis">Đang học</div>
          <div class="font-weight-medium">
            {{ activeClasses.length ? activeClasses.map((c) => c.name).join(', ') : '—' }}
          </div>
          <div v-if="archivedClasses.length" class="text-caption text-medium-emphasis st-archived mt-1">
            Đã học: {{ archivedClasses.map((c) => c.name).join(', ') }}
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="text-caption text-medium-emphasis">Trình độ</div>
          <div class="font-weight-medium">{{ level ?? '—' }}</div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="text-caption text-medium-emphasis">Giáo viên</div>
          <div class="font-weight-medium">{{ student.teacher?.fullName ?? '—' }}</div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="text-caption text-medium-emphasis">Ngày tham gia</div>
          <div class="font-weight-medium">{{ fmtDate(student.createdAt) }}</div>
        </v-col>
      </v-row>
    </v-card>

    <v-card>
      <v-tabs v-model="tab" color="primary">
        <v-tab value="profile">Profile</v-tab>
        <v-tab value="scores">Scores</v-tab>
        <v-tab value="comments">Comments</v-tab>
        <v-tab value="payments">Payments</v-tab>
        <v-tab value="activity">Activity</v-tab>
      </v-tabs>

      <v-card-text style="min-height: 360px">
        <v-window v-model="tab">
          <!-- Profile -->
          <v-window-item value="profile">
            <v-row>
              <v-col cols="12" md="6"><v-text-field v-model="profile.fullName" label="Full name" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="profile.phone" label="Phone" /></v-col>
              <v-col cols="12"><v-text-field v-model="profile.address" label="Address" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="profile.occupation" label="Occupation" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="profile.educationLevel" label="Education level" /></v-col>
              <v-col cols="12"><v-textarea v-model="profile.learningGoal" label="Learning goal" rows="2" /></v-col>
            </v-row>
            <div class="d-flex justify-end">
              <v-btn color="primary" :loading="updateProfile.isPending.value" @click="saveProfile">
                Save profile
              </v-btn>
            </div>
          </v-window-item>

          <!-- Scores -->
          <v-window-item value="scores">
            <v-row class="mb-2">
              <v-col cols="6" md="3">
                <v-card variant="tonal" color="primary" class="pa-3 text-center">
                  <div class="text-h5 font-weight-bold">{{ scoreSummary.average ?? '—' }}</div>
                  <div class="text-caption">Average Score</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-h5 font-weight-bold">{{ scoreSummary.assignment ?? '—' }}</div>
                  <div class="text-caption text-medium-emphasis">Assignments</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-h5 font-weight-bold">{{ scoreSummary.quiz ?? '—' }}</div>
                  <div class="text-caption text-medium-emphasis">Quizzes</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-h5 font-weight-bold">{{ scoreSummary.final ?? '—' }}</div>
                  <div class="text-caption text-medium-emphasis">Final</div>
                </v-card>
              </v-col>
            </v-row>

            <div class="d-flex ga-2 align-center mb-4 flex-wrap">
              <v-select
                v-model="scoreForm.classId"
                :items="classes"
                item-title="name"
                item-value="id"
                label="Class"
                density="compact"
                hide-details
                style="min-width: 160px"
              />
              <v-select
                v-model="scoreForm.type"
                :items="['MIDTERM', 'FINAL', 'ASSIGNMENT', 'QUIZ', 'CUSTOM']"
                label="Type"
                density="compact"
                hide-details
                style="max-width: 140px"
              />
              <v-text-field v-model="scoreForm.value" type="number" label="Score" density="compact" hide-details style="max-width: 90px" />
              <v-text-field v-model="scoreForm.maxValue" type="number" label="Max" density="compact" hide-details style="max-width: 80px" />
              <v-btn icon="mdi-plus" color="primary" :disabled="!scoreForm.classId" @click="submitScore" />
            </div>
            <v-table density="comfortable">
              <thead>
                <tr><th>Class</th><th>Type</th><th class="text-right">Score</th><th /></tr>
              </thead>
              <tbody>
                <tr v-for="s in scores ?? []" :key="s.id">
                  <td>{{ s.class?.name }}</td>
                  <td>{{ s.type }}{{ s.label ? ` (${s.label})` : '' }}</td>
                  <td class="text-right font-weight-bold">{{ s.value }} / {{ s.maxValue }}</td>
                  <td class="text-right">
                    <v-btn icon="mdi-delete" size="x-small" variant="text" @click="deleteScore.mutate(s.id)" />
                  </td>
                </tr>
                <tr v-if="!scores?.length">
                  <td colspan="4" class="text-center text-medium-emphasis pa-4">No scores yet.</td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>

          <!-- Comments -->
          <v-window-item value="comments">
            <div class="d-flex ga-2 mb-4">
              <v-select
                v-model="commentForm.category"
                :items="commentCategories"
                label="Category"
                density="compact"
                hide-details
                style="max-width: 170px"
              />
              <v-text-field
                v-model="commentForm.content"
                label="Comment"
                density="compact"
                hide-details
                @keyup.enter="submitComment"
              />
              <v-btn icon="mdi-send" color="primary" :disabled="!commentForm.content" @click="submitComment" />
            </div>
            <v-timeline v-if="comments?.length" side="end" density="compact">
              <v-timeline-item v-for="c in comments" :key="c.id" dot-color="primary" size="x-small">
                <div class="text-caption text-medium-emphasis">
                  <span v-if="c.category">{{ c.category }} · </span>{{ fmtDateTime(c.createdAt) }}
                  <span v-if="c.author"> · {{ c.author.fullName }}</span>
                </div>
                <div>{{ c.content }}</div>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center text-medium-emphasis pa-4">No comments yet.</div>
          </v-window-item>

          <!-- Payments -->
          <v-window-item value="payments">
            <v-row class="mb-2">
              <v-col cols="12" md="4">
                <v-card variant="tonal" class="pa-4 text-center">
                  <div class="text-h6 font-weight-bold">{{ money(payments?.totalAmount) }}</div>
                  <div class="text-caption text-medium-emphasis">Tổng học phí</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="success" class="pa-4 text-center">
                  <div class="text-h6 font-weight-bold">{{ money(payments?.paidAmount) }}</div>
                  <div class="text-caption">Đã đóng</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" :color="outstanding > 0 ? 'error' : 'success'" class="pa-4 text-center">
                  <div class="text-h6 font-weight-bold">{{ money(outstanding) }}</div>
                  <div class="text-caption">Còn nợ</div>
                </v-card>
              </v-col>
            </v-row>

            <div class="d-flex align-center justify-space-between mb-2 mt-2">
              <div class="text-subtitle-2 font-weight-bold">Các khoản học phí</div>
              <v-btn size="small" color="primary" prepend-icon="mdi-plus" @click="openCreateTuition">
                Tạo học phí
              </v-btn>
            </div>

            <div v-if="payments?.tuitions?.length" class="d-flex flex-column ga-3">
              <v-card v-for="tu in payments.tuitions" :key="tu.id" variant="outlined" class="pa-4">
                <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-2">
                  <div class="d-flex align-center ga-2">
                    <span class="font-weight-bold">{{ tu.className }}</span>
                    <v-chip size="x-small" :color="PAY_STATUS[tu.status]" variant="tonal">{{ payStatusLabel(tu.status) }}</v-chip>
                    <span v-if="tu.dueDate" class="text-caption text-medium-emphasis">· Hạn {{ fmtDate(tu.dueDate) }}</span>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Đã đóng <b class="text-success">{{ money(tu.paidAmount) }}</b> /
                    {{ money(tu.totalAmount) }}
                    · Còn <b class="text-error">{{ money(tu.totalAmount - tu.paidAmount) }}</b>
                  </div>
                </div>
                <v-progress-linear
                  :model-value="tu.totalAmount ? (tu.paidAmount / tu.totalAmount) * 100 : 0"
                  color="success"
                  height="6"
                  rounded
                  class="mb-3"
                />

                <div v-if="tu.payments.length" class="mb-3">
                  <div v-for="p in tu.payments" :key="p.id" class="d-flex justify-space-between text-body-2 py-1 px-1">
                    <span class="text-medium-emphasis">
                      <v-icon size="14">mdi-cash</v-icon> {{ fmtDate(p.paidAt) }}
                      <span v-if="p.method"> · {{ p.method }}</span>
                      <span v-if="p.note"> · {{ p.note }}</span>
                    </span>
                    <span class="font-weight-medium text-success">{{ money(p.amount) }}</span>
                  </div>
                </div>

                <div class="d-flex ga-2">
                  <v-btn
                    v-if="tu.totalAmount - tu.paidAmount > 0"
                    size="small"
                    variant="tonal"
                    color="primary"
                    prepend-icon="mdi-cash-plus"
                    @click="openRecordPayment(tu)"
                  >
                    Ghi nhận đợt đóng
                  </v-btn>
                  <v-btn
                    v-if="tu.totalAmount - tu.paidAmount > 0"
                    size="small"
                    variant="text"
                    color="success"
                    prepend-icon="mdi-check-all"
                    :loading="recordPayment.isPending.value"
                    @click="payFull(tu)"
                  >
                    Đóng đủ ({{ money(tu.totalAmount - tu.paidAmount) }})
                  </v-btn>
                  <v-chip v-else size="small" color="success" variant="tonal" prepend-icon="mdi-check-circle">
                    Đã đóng đủ
                  </v-chip>
                  <v-spacer />
                  <v-btn size="small" variant="text" prepend-icon="mdi-pencil" @click="openEditTuition(tu)">
                    Sửa
                  </v-btn>
                </div>
              </v-card>
            </div>
            <div v-else class="text-center text-medium-emphasis pa-6">Chưa có khoản học phí nào.</div>
          </v-window-item>

          <!-- Activity -->
          <v-window-item value="activity">
            <v-timeline v-if="activity?.length" side="end" density="compact">
              <v-timeline-item
                v-for="(a, i) in activity"
                :key="i"
                :dot-color="ACTIVITY_META[a.type].color"
                :icon="ACTIVITY_META[a.type].icon"
                size="small"
              >
                <div class="d-flex justify-space-between flex-wrap ga-2">
                  <span class="font-weight-medium">{{ a.title }}</span>
                  <span class="text-caption text-medium-emphasis">{{ fmtDateTime(a.date) }}</span>
                </div>
                <div class="text-body-2 text-medium-emphasis">{{ a.detail }}</div>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center text-medium-emphasis pa-4">Chưa có hoạt động nào.</div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Create tuition dialog -->
    <v-dialog v-model="tuitionOpen" max-width="460">
      <v-card>
        <v-card-title>Tạo khoản học phí</v-card-title>
        <v-card-text>
          <v-alert v-if="tuitionError" type="error" variant="tonal" density="compact" class="mb-3">
            {{ tuitionError }}
          </v-alert>
          <v-select
            v-model="tuitionForm.classId"
            :items="activeClasses"
            item-title="name"
            item-value="id"
            label="Lớp"
            prepend-inner-icon="mdi-google-classroom"
          />
          <v-text-field v-model.number="tuitionForm.totalAmount" type="number" label="Tổng học phí" prepend-inner-icon="mdi-cash" />
          <v-text-field v-model="tuitionForm.dueDate" type="date" label="Hạn đóng (tuỳ chọn)" />
          <v-textarea v-model="tuitionForm.notes" label="Ghi chú (tuỳ chọn)" rows="2" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="tuitionOpen = false">Huỷ</v-btn>
          <v-btn
            color="primary"
            :loading="createTuition.isPending.value"
            :disabled="!tuitionForm.classId || tuitionForm.totalAmount <= 0"
            @click="submitTuition"
          >
            Tạo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit tuition dialog -->
    <v-dialog v-model="editOpen" max-width="420">
      <v-card v-if="editTuition">
        <v-card-title>Sửa học phí — {{ editTuition.className }}</v-card-title>
        <v-card-text>
          <v-alert v-if="editError" type="error" variant="tonal" density="compact" class="mb-3">
            {{ editError }}
          </v-alert>
          <p class="text-caption text-medium-emphasis mb-2">
            Đã đóng {{ money(editTuition.paidAmount) }} — đặt tổng thấp hơn mức đã đóng sẽ thành "đã đóng đủ".
          </p>
          <v-text-field v-model.number="editForm.totalAmount" type="number" label="Tổng học phí" prepend-inner-icon="mdi-cash" />
          <v-text-field v-model="editForm.dueDate" type="date" label="Hạn đóng (tuỳ chọn)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="editOpen = false">Huỷ</v-btn>
          <v-btn
            color="primary"
            :loading="updateTuition.isPending.value"
            :disabled="editForm.totalAmount < 0"
            @click="submitEditTuition"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Record payment dialog -->
    <v-dialog v-model="recordOpen" max-width="440">
      <v-card v-if="recordTuition">
        <v-card-title>Ghi nhận đợt đóng — {{ recordTuition.className }}</v-card-title>
        <v-card-text>
          <v-alert v-if="recordError" type="error" variant="tonal" density="compact" class="mb-3">
            {{ recordError }}
          </v-alert>
          <p class="text-caption text-medium-emphasis mb-2">
            Còn lại: {{ money(recordTuition.totalAmount - recordTuition.paidAmount) }}
          </p>
          <v-text-field v-model.number="recordForm.amount" type="number" label="Số tiền" prepend-inner-icon="mdi-cash" />
          <v-text-field v-model="recordForm.paidAt" type="date" label="Ngày đóng (mặc định hôm nay)" />
          <v-text-field v-model="recordForm.method" label="Phương thức (tiền mặt, chuyển khoản…)" />
          <v-text-field v-model="recordForm.note" label="Ghi chú (tuỳ chọn)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="recordOpen = false">Huỷ</v-btn>
          <v-btn
            color="primary"
            :loading="recordPayment.isPending.value"
            :disabled="recordForm.amount <= 0"
            @click="submitRecord"
          >
            Ghi nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
/* Archived (soft-deleted) classes: struck through + muted. */
.st-archived,
.st-archived :deep(.v-chip__content) {
  text-decoration: line-through;
  opacity: 0.7;
}
</style>
