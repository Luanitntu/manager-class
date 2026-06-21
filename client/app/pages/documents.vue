<script setup lang="ts">
import { useDocuments, useDocumentMutations, type DocumentItem } from '~/composables/useDocuments';
import { useClasses } from '~/composables/useClasses';
import { useStudents } from '~/composables/useStudents';
import { useSnackbar } from '~/composables/useSnackbar';

const category = ref<string | undefined>(undefined);
const { data, isLoading, error, refetch } = useDocuments(category);
const { createLink, upload, assign, remove } = useDocumentMutations();
const auth = useAuthStore();
const config = useRuntimeConfig();
const { success: showSuccess, error: showError } = useSnackbar();

const categories = ['A1', 'A2', 'B1', 'B2'];
const canManage = computed(() => auth.role === 'TEACHER' || auth.role === 'ASSISTANT');
const { data: classesData } = useClasses(undefined, { enabled: canManage });
const { data: studentsData } = useStudents(undefined, { enabled: canManage });
const documents = computed(() => data.value?.data ?? []);
const classes = computed(() => classesData.value?.data ?? []);
const students = computed(() => studentsData.value?.data ?? []);

const typeIcon: Record<string, string> = {
  PDF: 'mdi-file-pdf-box',
  MP3: 'mdi-music-note',
  LINK: 'mdi-link-variant',
};

// --- Create / upload dialog ---
const createOpen = ref(false);
const mode = ref<'link' | 'file'>('link');
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const form = reactive({ title: '', url: '', category: '', file: null as File | null });

const rules = {
  required: (v: unknown) => !!v || 'Field is required',
  url: (v: string) => !v || v.startsWith('http://') || v.startsWith('https://') || 'URL must start with http:// or https://',
};

function openCreate() {
  Object.assign(form, { title: '', url: '', category: '', file: null });
  mode.value = 'link';
  createOpen.value = true;
}

async function submit() {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  try {
    if (mode.value === 'link') {
      await createLink.mutateAsync({
        title: form.title,
        url: form.url,
        category: form.category || undefined,
      });
      showSuccess('Link added successfully.');
    } else {
      if (!form.file) return;
      await upload.mutateAsync({
        file: form.file,
        title: form.title,
        category: form.category || undefined,
      });
      showSuccess('File uploaded successfully.');
    }
    createOpen.value = false;
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not save document');
  }
}

// --- Assign dialog ---
const assignOpen = ref(false);
const assignDoc = ref<DocumentItem | null>(null);
const assignFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const assignForm = reactive({ targetType: 'CLASS', classId: '', studentId: '' });

function openAssign(doc: DocumentItem) {
  assignDoc.value = doc;
  Object.assign(assignForm, { targetType: 'CLASS', classId: '', studentId: '' });
  assignOpen.value = true;
}

async function submitAssign() {
  if (!assignDoc.value) return;
  if (!assignFormRef.value) return;
  const { valid } = await assignFormRef.value.validate();
  if (!valid) return;
  try {
    const body =
      assignForm.targetType === 'CLASS'
        ? { targetType: 'CLASS', classId: assignForm.classId }
        : { targetType: 'STUDENT', studentId: assignForm.studentId };
    await assign.mutateAsync({ id: assignDoc.value.id, body });
    showSuccess('Document shared successfully.');
    assignOpen.value = false;
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not share document');
  }
}

async function destroy(doc: DocumentItem) {
  if (!confirm(`Delete document "${doc.title}"?`)) return;
  try {
    await remove.mutateAsync(doc.id);
    showSuccess('Document deleted successfully.');
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not delete document');
  }
}

function downloadUrl(doc: DocumentItem) {
  return `${config.public.apiBase}/documents/${doc.id}/download`;
}

function assignmentContext(doc: DocumentItem) {
  if (doc._count?.assignments) return `${doc._count.assignments} assignment${doc._count.assignments === 1 ? '' : 's'}`;
  return 'Shared material';
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Documents"
      subtitle="Learning materials (PDF, MP3, links)."
      icon="mdi-folder-open"
    >
      <template #actions>
        <v-btn v-if="canManage" color="primary" prepend-icon="mdi-plus" @click="openCreate">
          Add Material
        </v-btn>
      </template>
    </AppPageHeader>

    <div class="mb-4 d-flex align-center justify-space-between ga-4">
      <v-chip-group v-model="category">
        <v-chip :value="undefined" filter variant="outlined">All</v-chip>
        <v-chip v-for="c in categories" :key="c" :value="c" filter variant="outlined">{{ c }}</v-chip>
      </v-chip-group>
    </div>

    <AppState
      v-if="isLoading"
      variant="loading"
      title="Loading documents"
      body="Fetching document listings..."
    />

    <AppState
      v-else-if="error"
      variant="error"
      title="Could not load documents"
      body="Failed to retrieve materials. Please check your network connection."
      action-label="Try again"
      @action="refetch()"
    />

    <template v-else>
      <v-row v-if="documents.length">
        <v-col v-for="d in documents" :key="d.id" cols="12" sm="6" md="4">
          <v-card class="pa-4 st-card-soft">
            <div class="d-flex align-center ga-3 mb-2">
              <v-avatar color="info" size="36" rounded="lg">
                <v-icon color="white">{{ typeIcon[d.type] }}</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="font-weight-bold">{{ d.title }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ d.type }}<span v-if="d.category"> · {{ d.category }}</span>
                </div>
              </div>
            </div>
            <div v-if="!canManage" class="text-caption text-medium-emphasis mb-3">
              {{ assignmentContext(d) }}
            </div>
            <div class="d-flex ga-2">
              <v-btn
                v-if="d.type === 'LINK'"
                :href="d.url ?? undefined"
                target="_blank"
                size="small"
                variant="tonal"
                prepend-icon="mdi-open-in-new"
              >
                Open
              </v-btn>
              <v-btn
                v-else
                :href="downloadUrl(d)"
                target="_blank"
                size="small"
                variant="tonal"
                prepend-icon="mdi-download"
              >
                Download
              </v-btn>
              <v-spacer />
              <template v-if="canManage">
                <v-btn size="small" variant="text" icon="mdi-account-multiple-plus" @click="openAssign(d)" />
                <v-btn size="small" variant="text" icon="mdi-delete" @click="destroy(d)" />
              </template>
            </div>
          </v-card>
        </v-col>
      </v-row>
      <AppState
        v-else
        variant="empty"
        :title="canManage ? 'No documents yet' : 'No shared documents yet'"
        :body="canManage ? 'Upload files or add links to educational resources.' : 'Your teacher\'s materials will appear here when assigned.'"
        :action-label="canManage ? 'Add Material' : undefined"
        @action="openCreate"
      />
    </template>

    <!-- Create / upload -->
    <v-dialog v-model="createOpen" max-width="480">
      <v-card>
        <v-card-title>Add material</v-card-title>
        <v-form ref="formRef" @submit.prevent="submit">
          <v-card-text>
            <v-btn-toggle v-model="mode" mandatory color="primary" class="mb-4" density="comfortable">
              <v-btn value="link" size="small">Link</v-btn>
              <v-btn value="file" size="small">File (PDF/MP3)</v-btn>
            </v-btn-toggle>
            <v-text-field v-model="form.title" label="Title" :rules="[rules.required]" class="mb-2" />
            <v-text-field
              v-if="mode === 'link'"
              v-model="form.url"
              label="URL"
              :rules="[rules.required, rules.url]"
              class="mb-2"
            />
            <v-file-input
              v-else
              v-model="form.file"
              label="File"
              accept=".pdf,.mp3,audio/*,application/pdf"
              :rules="[rules.required]"
              class="mb-2"
            />
            <v-select v-model="form.category" :items="categories" label="Category" clearable />
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn variant="text" @click="createOpen = false">Cancel</v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="createLink.isPending.value || upload.isPending.value"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Assign -->
    <v-dialog v-model="assignOpen" max-width="440">
      <v-card>
        <v-card-title>Share document</v-card-title>
        <v-form ref="assignFormRef" @submit.prevent="submitAssign">
          <v-card-text>
            <v-btn-toggle v-model="assignForm.targetType" mandatory color="primary" class="mb-4" density="comfortable">
              <v-btn value="CLASS" size="small">Class</v-btn>
              <v-btn value="STUDENT" size="small">Student</v-btn>
            </v-btn-toggle>
            <v-select
              v-if="assignForm.targetType === 'CLASS'"
              v-model="assignForm.classId"
              :items="classes"
              item-title="name"
              item-value="id"
              label="Class"
              :rules="[rules.required]"
            />
            <v-select
              v-else
              v-model="assignForm.studentId"
              :items="students"
              item-title="fullName"
              item-value="id"
              label="Student"
              :rules="[rules.required]"
            />
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn variant="text" @click="assignOpen = false">Cancel</v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="assign.isPending.value"
            >
              Share
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
