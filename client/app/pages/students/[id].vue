<script setup lang="ts">
import {
  useStudentComments,
  useStudentDetail,
  useStudentMutations,
  useStudentScores,
} from '~/composables/useStudents';
import { useClasses } from '~/composables/useClasses';

const route = useRoute();
const id = computed(() => route.params.id as string);

const { data: student } = useStudentDetail(id);
const { data: scores } = useStudentScores(id);
const { data: comments } = useStudentComments(id);
const { data: classesData } = useClasses();
const { updateProfile, addScore, deleteScore, addComment } = useStudentMutations();
const avatar = useAvatar();

const tab = ref('profile');
const classes = computed(() => classesData.value?.data ?? []);

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

    <div v-if="student" class="d-flex align-center ga-3 mb-6">
      <v-avatar color="secondary" size="48">
        <v-img v-if="avatar(student)" :src="avatar(student)!" />
        <span v-else class="text-white text-h6">{{ student.fullName[0] }}</span>
      </v-avatar>
      <div>
        <h1 class="text-h5 font-weight-bold">{{ student.fullName }}</h1>
        <div class="text-medium-emphasis">{{ student.email }}</div>
      </div>
    </div>

    <v-card>
      <v-tabs v-model="tab" color="primary">
        <v-tab value="profile">Profile</v-tab>
        <v-tab value="scores">Scores</v-tab>
        <v-tab value="comments">Comments</v-tab>
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
                :items="['attitude', 'strengths', 'weaknesses', 'progress', 'note']"
                label="Category"
                density="compact"
                hide-details
                style="max-width: 160px"
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
                  {{ c.category }}<span v-if="c.author"> · {{ c.author.fullName }}</span>
                </div>
                <div>{{ c.content }}</div>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center text-medium-emphasis pa-4">No comments yet.</div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
