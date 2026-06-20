<script setup lang="ts">
import {
  useStudentComments,
  useStudentDetail,
  useStudentMutations,
  useStudentScores,
} from '~/composables/useStudents';
import { useClasses } from '~/composables/useClasses';

const props = defineProps<{ modelValue: boolean; studentId: string | null }>();
const emit = defineEmits<{ 'update:modelValue': [boolean] }>();

const idRef = computed(() => props.studentId);
const { data: student } = useStudentDetail(idRef);
const { data: scores } = useStudentScores(idRef);
const { data: comments } = useStudentComments(idRef);
const { data: classesData } = useClasses();
const { updateProfile, addScore, deleteScore, addComment } = useStudentMutations();

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
  if (!props.studentId) return;
  await updateProfile.mutateAsync({ id: props.studentId, body: { ...profile } });
}

async function submitScore() {
  if (!props.studentId || !scoreForm.classId) return;
  await addScore.mutateAsync({
    id: props.studentId,
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
  if (!props.studentId || !commentForm.content) return;
  await addComment.mutateAsync({
    id: props.studentId,
    body: { category: commentForm.category, content: commentForm.content },
  });
  commentForm.content = '';
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="student">
      <v-card-title class="d-flex align-center ga-3">
        <v-avatar color="secondary"><span class="text-white">{{ student.fullName[0] }}</span></v-avatar>
        <div>
          <div>{{ student.fullName }}</div>
          <div class="text-caption text-medium-emphasis">{{ student.email }}</div>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-tabs v-model="tab" color="primary">
        <v-tab value="profile">Profile</v-tab>
        <v-tab value="scores">Scores</v-tab>
        <v-tab value="comments">Comments</v-tab>
      </v-tabs>

      <v-card-text style="min-height: 360px">
        <v-window v-model="tab">
          <!-- Profile -->
          <v-window-item value="profile">
            <v-text-field v-model="profile.fullName" label="Full name" />
            <v-text-field v-model="profile.phone" label="Phone" />
            <v-text-field v-model="profile.address" label="Address" />
            <div class="d-flex ga-3">
              <v-text-field v-model="profile.occupation" label="Occupation" />
              <v-text-field v-model="profile.educationLevel" label="Education level" />
            </div>
            <v-textarea v-model="profile.learningGoal" label="Learning goal" rows="2" />
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
                style="min-width: 140px"
              />
              <v-select
                v-model="scoreForm.type"
                :items="['MIDTERM', 'FINAL', 'ASSIGNMENT', 'QUIZ', 'CUSTOM']"
                label="Type"
                density="compact"
                hide-details
                style="max-width: 130px"
              />
              <v-text-field
                v-model="scoreForm.value"
                type="number"
                label="Score"
                density="compact"
                hide-details
                style="max-width: 90px"
              />
              <v-text-field
                v-model="scoreForm.maxValue"
                type="number"
                label="Max"
                density="compact"
                hide-details
                style="max-width: 80px"
              />
              <v-btn icon="mdi-plus" color="primary" :disabled="!scoreForm.classId" @click="submitScore" />
            </div>
            <v-list>
              <v-list-item v-for="s in scores ?? []" :key="s.id">
                <v-list-item-title>
                  {{ s.class?.name }} — {{ s.type }}{{ s.label ? ` (${s.label})` : '' }}
                </v-list-item-title>
                <template #append>
                  <span class="font-weight-bold mr-3">{{ s.value }} / {{ s.maxValue }}</span>
                  <v-btn icon="mdi-delete" size="x-small" variant="text" @click="deleteScore.mutate(s.id)" />
                </template>
              </v-list-item>
              <div v-if="!scores?.length" class="text-center text-medium-emphasis pa-4">
                No scores yet.
              </div>
            </v-list>
          </v-window-item>

          <!-- Comments -->
          <v-window-item value="comments">
            <div class="d-flex ga-2 mb-4">
              <v-select
                v-model="commentForm.category"
                :items="['attitude', 'strengths', 'weaknesses', 'progress']"
                label="Category"
                density="compact"
                hide-details
                style="max-width: 150px"
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
                <div class="text-caption text-medium-emphasis">{{ c.category }}</div>
                <div>{{ c.content }}</div>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center text-medium-emphasis pa-4">No comments yet.</div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
