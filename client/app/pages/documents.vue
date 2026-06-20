<script setup lang="ts">
import { useDocuments, useDocumentMutations, type DocumentItem } from '~/composables/useDocuments';
import { useClasses } from '~/composables/useClasses';
import { useStudents } from '~/composables/useStudents';

const category = ref<string | undefined>(undefined);
const { data, isLoading } = useDocuments(category);
const { createLink, upload, assign, remove } = useDocumentMutations();
const { data: classesData } = useClasses();
const { data: studentsData } = useStudents();
const auth = useAuthStore();
const config = useRuntimeConfig();

const documents = computed(() => data.value?.data ?? []);
const classes = computed(() => classesData.value?.data ?? []);
const students = computed(() => studentsData.value?.data ?? []);
const categories = ['A1', 'A2', 'B1', 'B2'];
const canManage = computed(() => auth.role === 'TEACHER' || auth.role === 'ASSISTANT');

const typeIcon: Record<string, string> = {
  PDF: 'mdi-file-pdf-box',
  MP3: 'mdi-music-note',
  LINK: 'mdi-link-variant',
};

// --- Create / upload dialog ---
const createOpen = ref(false);
const mode = ref<'link' | 'file'>('link');
const error = ref<string | null>(null);
const form = reactive({ title: '', url: '', category: '', file: null as File | null });

function openCreate() {
  Object.assign(form, { title: '', url: '', category: '', file: null });
  mode.value = 'link';
  error.value = null;
  createOpen.value = true;
}

async function submit() {
  error.value = null;
  try {
    if (mode.value === 'link') {
      await createLink.mutateAsync({
        title: form.title,
        url: form.url,
        category: form.category || undefined,
      });
    } else {
      if (!form.file) return;
      await upload.mutateAsync({
        file: form.file,
        title: form.title,
        category: form.category || undefined,
      });
    }
    createOpen.value = false;
  } catch (e) {
    error.value = extractApiError(e) ?? 'Could not save document';
  }
}

// --- Assign dialog ---
const assignOpen = ref(false);
const assignDoc = ref<DocumentItem | null>(null);
const assignForm = reactive({ targetType: 'CLASS', classId: '', studentId: '' });

function openAssign(doc: DocumentItem) {
  assignDoc.value = doc;
  Object.assign(assignForm, { targetType: 'CLASS', classId: '', studentId: '' });
  assignOpen.value = true;
}

async function submitAssign() {
  if (!assignDoc.value) return;
  const body =
    assignForm.targetType === 'CLASS'
      ? { targetType: 'CLASS', classId: assignForm.classId }
      : { targetType: 'STUDENT', studentId: assignForm.studentId };
  await assign.mutateAsync({ id: assignDoc.value.id, body });
  assignOpen.value = false;
}

function downloadUrl(doc: DocumentItem) {
  return `${config.public.apiBase}/documents/${doc.id}/download`;
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Documents</h1>
        <p class="text-medium-emphasis ma-0">Learning materials (PDF, MP3, links).</p>
      </div>
      <v-btn v-if="canManage" color="primary" prepend-icon="mdi-plus" @click="openCreate">
        Add Material
      </v-btn>
    </div>

    <v-chip-group v-model="category" class="mb-4">
      <v-chip :value="undefined" filter variant="outlined">All</v-chip>
      <v-chip v-for="c in categories" :key="c" :value="c" filter variant="outlined">{{ c }}</v-chip>
    </v-chip-group>

    <v-row v-if="documents.length">
      <v-col v-for="d in documents" :key="d.id" cols="12" sm="6" md="4">
        <v-card class="pa-4">
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
              <v-btn size="small" variant="text" icon="mdi-delete" @click="remove.mutate(d.id)" />
            </template>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else-if="!isLoading" class="pa-12 text-center text-medium-emphasis">
      No documents yet.
    </v-card>

    <!-- Create / upload -->
    <v-dialog v-model="createOpen" max-width="480">
      <v-card>
        <v-card-title>Add material</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-btn-toggle v-model="mode" mandatory color="primary" class="mb-4" density="comfortable">
            <v-btn value="link" size="small">Link</v-btn>
            <v-btn value="file" size="small">File (PDF/MP3)</v-btn>
          </v-btn-toggle>
          <v-text-field v-model="form.title" label="Title" />
          <v-text-field v-if="mode === 'link'" v-model="form.url" label="URL" />
          <v-file-input
            v-else
            v-model="form.file"
            label="File"
            accept=".pdf,.mp3,audio/*,application/pdf"
          />
          <v-select v-model="form.category" :items="categories" label="Category" clearable />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createOpen = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="createLink.isPending.value || upload.isPending.value"
            :disabled="!form.title || (mode === 'link' ? !form.url : !form.file)"
            @click="submit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Assign -->
    <v-dialog v-model="assignOpen" max-width="440">
      <v-card>
        <v-card-title>Share document</v-card-title>
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
          />
          <v-select
            v-else
            v-model="assignForm.studentId"
            :items="students"
            item-title="fullName"
            item-value="id"
            label="Student"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="assignOpen = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="assign.isPending.value"
            :disabled="assignForm.targetType === 'CLASS' ? !assignForm.classId : !assignForm.studentId"
            @click="submitAssign"
          >
            Share
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
