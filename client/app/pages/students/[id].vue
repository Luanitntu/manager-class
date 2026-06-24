<script setup lang="ts">
import {
  useStudentActivity,
  useStudentComments,
  useStudentDetail,
  useStudentMutations,
  useStudentPayments,
  useStudentScores,
  type ActivityItem,
} from '~/composables/useStudents';
import { useClasses } from '~/composables/useClasses';

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
const primaryClass = computed(() => student.value?.enrollments?.[0]?.class ?? null);
const level = computed(() => student.value?.enrollments?.map((e) => e.class.level).find(Boolean) ?? null);
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
          <v-chip v-if="primaryClass" size="small" color="primary" variant="tonal">{{ primaryClass.name }}</v-chip>
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
          <div class="font-weight-medium">{{ primaryClass?.name ?? '—' }}</div>
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

            <div class="text-subtitle-2 font-weight-bold mb-2 mt-2">Lịch sử thanh toán</div>
            <v-table density="comfortable">
              <thead>
                <tr><th>Ngày</th><th>Lớp</th><th>Ghi chú</th><th class="text-right">Số tiền</th></tr>
              </thead>
              <tbody>
                <tr v-for="r in payments?.records ?? []" :key="r.id">
                  <td class="text-no-wrap">{{ fmtDate(r.paidAt) }}</td>
                  <td>{{ r.className }}</td>
                  <td class="text-medium-emphasis">{{ r.method || r.note || '—' }}</td>
                  <td class="text-right font-weight-bold text-success">{{ money(r.amount) }}</td>
                </tr>
                <tr v-if="!payments?.records?.length">
                  <td colspan="4" class="text-center text-medium-emphasis pa-4">Chưa có thanh toán nào.</td>
                </tr>
              </tbody>
            </v-table>
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
  </div>
</template>
