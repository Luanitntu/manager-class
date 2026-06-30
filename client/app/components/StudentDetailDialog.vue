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
const { data: student, isLoading: isStudentLoading } = useStudentDetail(idRef);
const { data: scores } = useStudentScores(idRef);
const { data: comments } = useStudentComments(idRef);
const { data: classesData } = useClasses();
const { updateProfile, addScore, deleteScore, addComment } = useStudentMutations();

const tab = ref('profile');
const classes = computed(() => classesData.value?.data ?? []);
const classItems = computed(() => classes.value.map((item) => ({
  value: item.id,
  title: item.name,
})));
const tabItems = [
  { value: 'profile', label: 'Profile' },
  { value: 'scores', label: 'Scores' },
  { value: 'comments', label: 'Comments' },
];
const scoreTypeItems = ['MIDTERM', 'FINAL', 'ASSIGNMENT', 'QUIZ', 'CUSTOM'];
const commentCategoryItems = ['attitude', 'strengths', 'weaknesses', 'progress'];
const orderedComments = computed(() => comments.value ?? []);

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
const deletingScoreId = ref<string | null>(null);
const scoreDeleteTarget = ref<string | null>(null);

async function saveProfile() {
  if (updateProfile.isPending.value) return;
  if (!props.studentId) return;
  await updateProfile.mutateAsync({ id: props.studentId, body: { ...profile } });
}

async function submitScore() {
  if (addScore.isPending.value) return;
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
  if (addComment.isPending.value) return;
  if (!props.studentId || !commentForm.content) return;
  await addComment.mutateAsync({
    id: props.studentId,
    body: { category: commentForm.category, content: commentForm.content },
  });
  commentForm.content = '';
}

async function removeScore(scoreId: string) {
  if (deletingScoreId.value) return;
  deletingScoreId.value = scoreId;
  try {
    await deleteScore.mutateAsync(scoreId);
  } finally {
    deletingScoreId.value = null;
  }
}

function requestScoreDelete(scoreId: string) {
  if (deletingScoreId.value) return;
  scoreDeleteTarget.value = scoreId;
}

async function confirmScoreDelete() {
  if (!scoreDeleteTarget.value) return;
  const scoreId = scoreDeleteTarget.value;
  await removeScore(scoreId);
  scoreDeleteTarget.value = null;
}
</script>

<template>
  <UiDialog
    :model-value="modelValue"
    size="xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="student" #title>
      <span class="flex min-w-0 items-center gap-3">
        <UiAvatar :name="student.fullName" size="md" />
        <span class="min-w-0">
          <span class="block truncate">{{ student.fullName }}</span>
          <span class="block truncate text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
            {{ student.email }}
          </span>
        </span>
      </span>
    </template>

    <div v-if="student" class="min-h-[360px]">
      <UiTabs v-model="tab" :items="tabItems" label="Student detail tabs">
        <section v-if="tab === 'profile'" class="grid gap-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <UiInput v-model="profile.fullName" label="Full name" />
            <UiInput v-model="profile.phone" label="Phone" />
          </div>
          <UiInput v-model="profile.address" label="Address" />
          <div class="grid gap-4 sm:grid-cols-2">
            <UiInput v-model="profile.occupation" label="Occupation" />
            <UiInput v-model="profile.educationLevel" label="Education level" />
          </div>
          <UiTextarea v-model="profile.learningGoal" label="Learning goal" :rows="2" />
          <div class="flex justify-end">
            <UiButton :loading="updateProfile.isPending.value" @click="saveProfile">
              Save profile
            </UiButton>
          </div>
        </section>

        <section v-else-if="tab === 'scores'" class="grid gap-4">
          <div class="grid gap-3 lg:grid-cols-[minmax(160px,1fr)_minmax(120px,150px)_minmax(88px,110px)_minmax(88px,110px)_auto] lg:items-end">
            <UiSelect
              v-model="scoreForm.classId"
              :items="classItems"
              label="Class"
              placeholder="Select class"
            />
            <UiSelect v-model="scoreForm.type" :items="scoreTypeItems" label="Type" />
            <UiInput v-model="scoreForm.value" type="number" label="Score" />
            <UiInput v-model="scoreForm.maxValue" type="number" label="Max" />
            <UiIconButton
              label="Add score"
              icon="mdi-plus"
              variant="secondary"
              :disabled="!scoreForm.classId || addScore.isPending.value"
              :loading="addScore.isPending.value"
              @click="submitScore"
            />
          </div>
          <UiInput v-model="scoreForm.label" label="Label" placeholder="Optional label" />

          <UiList v-if="scores?.length">
            <UiListItem v-for="s in scores" :key="s.id">
              <div class="min-w-0">
                <div class="truncate font-semibold text-[var(--st-text)]">
                  {{ s.class?.name }} - {{ s.type }}{{ s.label ? ` (${s.label})` : '' }}
                </div>
                <div class="text-sm font-normal text-[var(--st-muted)]">
                  {{ s.scoredAt ? new Date(s.scoredAt).toLocaleDateString() : '' }}
                </div>
              </div>
              <template #actions>
                <span class="whitespace-nowrap text-base font-semibold text-[var(--st-text)]">
                  {{ s.value }} / {{ s.maxValue }}
                </span>
                <UiIconButton
                  label="Delete score"
                  icon="mdi-delete"
                  size="compact"
                  variant="danger"
                  :disabled="!!deletingScoreId"
                  :loading="deletingScoreId === s.id"
                  @click="requestScoreDelete(s.id)"
                />
              </template>
            </UiListItem>
          </UiList>
          <UiEmptyState
            v-else
            icon="mdi-chart-box-outline"
            heading="No scores yet"
            body="Add a score after selecting a class."
          />
        </section>

        <section v-else class="grid gap-4">
          <div class="grid gap-3 lg:grid-cols-[minmax(140px,180px)_minmax(0,1fr)_auto] lg:items-end">
            <UiSelect
              v-model="commentForm.category"
              :items="commentCategoryItems"
              label="Category"
            />
            <UiInput
              v-model="commentForm.content"
              label="Comment"
              @keyup.enter="submitComment"
            />
            <UiIconButton
              label="Add comment"
              icon="mdi-send"
              variant="secondary"
              :disabled="!commentForm.content || addComment.isPending.value"
              :loading="addComment.isPending.value"
              @click="submitComment"
            />
          </div>

          <UiList v-if="orderedComments.length">
            <UiListItem v-for="c in orderedComments" :key="c.id">
              <div class="min-w-0">
                <div class="text-sm font-semibold text-[var(--st-primary)]">
                  {{ c.category || 'progress' }}
                </div>
                <div class="mt-1 break-words text-base font-normal text-[var(--st-text)]">
                  {{ c.content }}
                </div>
              </div>
              <template #meta>
                {{ c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '' }}
              </template>
            </UiListItem>
          </UiList>
          <UiEmptyState
            v-else
            icon="mdi-comment-text-outline"
            heading="No comments yet"
            body="Add a comment to record student progress."
          />
        </section>
      </UiTabs>
    </div>
    <UiSkeleton v-else-if="modelValue && studentId && isStudentLoading" variant="detail" :rows="6" />
  </UiDialog>

  <UiConfirmDialog
    :model-value="!!scoreDeleteTarget"
    title="Delete score"
    message="This action cannot be undone. Delete this score?"
    confirm-label="Delete score"
    cancel-label="Cancel"
    destructive
    :loading="!!deletingScoreId"
    @update:model-value="(open) => { if (!open && !deletingScoreId) scoreDeleteTarget = null; }"
    @confirm="confirmScoreDelete"
  />
</template>
