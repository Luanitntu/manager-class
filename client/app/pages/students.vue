<script setup lang="ts">
import { useStudents, useStudentMutations } from '~/composables/useStudents';
import { useSnackbar } from '~/composables/useSnackbar';

const search = ref('');
const { data, isLoading, error, refetch } = useStudents(search);
const { createStudent } = useStudentMutations();
const { success: showSuccess, error: showError } = useSnackbar();

const students = computed(() => data.value?.data ?? []);

const detailOpen = ref(false);
const selectedId = ref<string | null>(null);

function openDetail(id: string) {
  selectedId.value = id;
  detailOpen.value = true;
}

const createOpen = ref(false);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const form = reactive({ fullName: '', email: '', password: '', phone: '' });

const rules = {
  required: (v: unknown) => !!v || 'Field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  password: (v: string) => !v || v.length >= 8 || 'Password must be at least 8 characters',
};

async function create() {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  try {
    await createStudent.mutateAsync({ ...form });
    showSuccess('Student created successfully.');
    createOpen.value = false;
    Object.assign(form, { fullName: '', email: '', password: '', phone: '' });
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not create student');
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Students"
      subtitle="Profiles, scores and feedback."
      icon="mdi-account-school"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="createOpen = true">
          New Student
        </v-btn>
      </template>
    </AppPageHeader>

    <div class="mb-4 d-flex align-center justify-space-between ga-4">
      <v-text-field
        v-model="search"
        placeholder="Search students…"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        style="max-width: 360px"
      />
    </div>

    <AppState
      v-if="isLoading"
      variant="loading"
      title="Loading students"
      body="Fetching student profiles..."
    />

    <AppState
      v-else-if="error"
      variant="error"
      title="Could not load students"
      body="Failed to load student profiles. Please check your network connection."
      action-label="Try again"
      @action="refetch()"
    />

    <template v-else>
      <v-card class="st-card-soft">
        <v-list v-if="students.length">
          <template v-for="(s, i) in students" :key="s.id">
            <v-list-item @click="openDetail(s.id)">
              <template #prepend>
                <v-avatar color="secondary" size="36">
                  <span class="text-white">{{ s.fullName[0] }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>{{ s.fullName }}</v-list-item-title>
              <v-list-item-subtitle>{{ s.email }}</v-list-item-subtitle>
              <template #append>
                <v-chip size="small" variant="tonal">
                  {{ s._count?.enrollments ?? 0 }} classes
                </v-chip>
              </template>
            </v-list-item>
            <v-divider v-if="i < students.length - 1" />
          </template>
        </v-list>
        <AppState
          v-else
          variant="empty"
          title="No students yet"
          body="Start by inviting or creating a new student profile."
          action-label="New Student"
          @action="createOpen = true"
        />
      </v-card>
    </template>

    <StudentDetailDialog v-model="detailOpen" :student-id="selectedId" />

    <v-dialog v-model="createOpen" max-width="460">
      <v-card>
        <v-card-title>New student</v-card-title>
        <v-form ref="formRef" @submit.prevent="create">
          <v-card-text>
            <v-text-field
              v-model="form.fullName"
              label="Full name"
              :rules="[rules.required]"
              class="mb-2"
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
              class="mb-2"
            />
            <v-text-field
              v-model="form.password"
              label="Temporary password"
              type="password"
              :rules="[rules.required, rules.password]"
              class="mb-2"
            />
            <v-text-field
              v-model="form.phone"
              label="Phone (optional)"
            />
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn variant="text" @click="createOpen = false">Cancel</v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="createStudent.isPending.value"
            >
              Create
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
