<script setup lang="ts">
import {
  useDocuments,
  useDocumentCategories,
  useDocumentMutations,
  useDocumentDownload,
  type DocumentItem,
} from '~/composables/useDocuments';
import { useClasses } from '~/composables/useClasses';

const auth = useAuthStore();
const isTeacher = computed(() => auth.role === 'TEACHER' || auth.role === 'ASSISTANT');

const category = ref('');
const scope = ref('');
const search = ref('');
const page = ref(1);
watch([category, scope, search], () => (page.value = 1));

const { data, isLoading } = useDocuments({ category, scope, search, page });
const { data: categoriesData } = useDocumentCategories();
const { createLink, upload, assign, unassign, remove } = useDocumentMutations();
const { data: classesData } = useClasses(undefined, undefined, 100);
const download = useDocumentDownload();

const documents = computed(() => data.value?.data ?? []);
const meta = computed(() => data.value?.meta);
const classes = computed(() => classesData.value?.data ?? []);
const categories = computed(() => categoriesData.value ?? []);

// ── Presentation ────────────────────────────────────────────────────────────
const TYPE_META: Record<DocumentItem['type'], { icon: string; color: string }> = {
  PDF: { icon: 'mdi-file-document-outline', color: 'red' },
  MP3: { icon: 'mdi-headphones', color: 'deep-purple' },
  LINK: { icon: 'mdi-link-variant', color: 'blue' },
};
function fmtSize(bytes?: number | null) {
  if (!bytes) return '–';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
function fmtDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString('vi-VN') : '';
}
function classChips(doc: DocumentItem) {
  return (doc.assignments ?? []).filter((a) => a.targetType === 'CLASS' && a.class);
}

// ── Upload / create dialog ──────────────────────────────────────────────────
const uploadOpen = ref(false);
const uploadKind = ref<'FILE' | 'LINK'>('FILE');
const uploadError = ref<string | null>(null);
const uploadForm = reactive({ title: '', category: '', url: '', file: null as File | null, classId: '' });

function openUpload() {
  Object.assign(uploadForm, { title: '', category: '', url: '', file: null, classId: '' });
  uploadKind.value = 'FILE';
  uploadError.value = null;
  uploadOpen.value = true;
}
async function submitUpload() {
  uploadError.value = null;
  try {
    let created: DocumentItem;
    if (uploadKind.value === 'LINK') {
      created = (await createLink.mutateAsync({
        title: uploadForm.title,
        url: uploadForm.url,
        category: uploadForm.category || undefined,
      })) as DocumentItem;
    } else {
      if (!uploadForm.file) return;
      created = (await upload.mutateAsync({
        file: uploadForm.file,
        title: uploadForm.title,
        category: uploadForm.category || undefined,
      })) as DocumentItem;
    }
    // Optionally assign to a class right away.
    if (uploadForm.classId && created?.id) {
      await assign.mutateAsync({ id: created.id, classId: uploadForm.classId });
    }
    uploadOpen.value = false;
  } catch (e) {
    uploadError.value = extractApiError(e);
  }
}
const canSubmitUpload = computed(() =>
  uploadKind.value === 'LINK'
    ? !!uploadForm.title && !!uploadForm.url
    : !!uploadForm.title && !!uploadForm.file,
);

// ── Assign-to-class dialog ──────────────────────────────────────────────────
const assignOpen = ref(false);
const assignDoc = ref<DocumentItem | null>(null);
const assignClassId = ref('');
function openAssign(doc: DocumentItem) {
  assignDoc.value = doc;
  assignClassId.value = '';
  assignOpen.value = true;
}
async function doAssign() {
  if (!assignDoc.value || !assignClassId.value) return;
  await assign.mutateAsync({ id: assignDoc.value.id, classId: assignClassId.value });
  assignClassId.value = '';
}

// Keep the open assign dialog in sync after the list refetches.
watch(documents, (docs) => {
  if (assignDoc.value) {
    const fresh = docs.find((d) => d.id === assignDoc.value?.id);
    if (fresh) assignDoc.value = fresh;
  }
});
async function doUnassign(doc: DocumentItem, assignmentId: string) {
  await unassign.mutateAsync({ id: doc.id, assignmentId });
}
// Classes not yet assigned to the dialog's document.
const assignableClasses = computed(() => {
  const assigned = new Set((assignDoc.value?.assignments ?? []).map((a) => a.classId));
  return classes.value.filter((c) => !assigned.has(c.id));
});

async function destroy(doc: DocumentItem) {
  if (!confirm(`Xoá tài liệu "${doc.title}"?`)) return;
  await remove.mutateAsync(doc.id);
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Tài liệu học tập</h1>
        <p class="text-medium-emphasis ma-0">Quản lý và chia sẻ tài liệu cho học viên</p>
      </div>
      <v-btn v-if="isTeacher" color="primary" prepend-icon="mdi-upload" @click="openUpload">
        Tải lên tài liệu
      </v-btn>
    </div>

    <!-- Filter bar -->
    <v-card class="pa-3 mb-4">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-chip-group v-model="category" mandatory selected-class="text-primary">
            <v-chip value="" size="small" variant="tonal">Tất cả</v-chip>
            <v-chip v-for="c in categories" :key="c" :value="c" size="small" variant="tonal">{{ c }}</v-chip>
          </v-chip-group>
          <v-divider vertical class="mx-1" />
          <v-select
            v-model="scope"
            :items="[
              { value: '', title: 'Mọi phạm vi' },
              { value: 'SHARED', title: 'Dùng chung' },
              { value: 'CLASS', title: 'Theo lớp' },
            ]"
            density="compact"
            hide-details
            variant="outlined"
            style="max-width: 170px"
          />
        </div>
        <v-text-field
          v-model="search"
          placeholder="Tìm kiếm tài liệu…"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          clearable
          variant="outlined"
          style="max-width: 280px"
        />
      </div>
    </v-card>

    <v-row v-if="documents.length">
      <v-col v-for="doc in documents" :key="doc.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4 h-100 d-flex flex-column st-doc" @click="download(doc)">
          <div class="d-flex align-start justify-space-between mb-3">
            <v-avatar :color="TYPE_META[doc.type].color" variant="tonal" rounded="lg" size="44">
              <v-icon>{{ TYPE_META[doc.type].icon }}</v-icon>
            </v-avatar>
            <v-menu v-if="isTeacher" location="bottom end">
              <template #activator="{ props }">
                <v-btn icon="mdi-dots-horizontal" variant="text" size="small" v-bind="props" @click.stop />
              </template>
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-download" :title="doc.type === 'LINK' ? 'Mở liên kết' : 'Tải xuống'" @click.stop="download(doc)" />
                <v-list-item prepend-icon="mdi-school-outline" title="Gán vào lớp" @click.stop="openAssign(doc)" />
                <v-list-item prepend-icon="mdi-delete-outline" title="Xoá" class="text-error" @click.stop="destroy(doc)" />
              </v-list>
            </v-menu>
          </div>

          <div class="font-weight-bold mb-2" style="line-height: 1.3">{{ doc.title }}</div>

          <div class="d-flex ga-1 flex-wrap mb-3">
            <v-chip v-if="doc.category" size="x-small" variant="tonal">{{ doc.category }}</v-chip>
            <v-chip
              v-for="a in classChips(doc)"
              :key="a.id"
              size="x-small"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-google-classroom"
            >
              {{ a.class?.name }}
            </v-chip>
            <v-chip v-if="!classChips(doc).length" size="x-small" color="grey" variant="tonal">
              Dùng chung
            </v-chip>
          </div>

          <v-spacer />
          <v-divider class="mb-2" />
          <div class="text-caption text-medium-emphasis">
            {{ doc.type === 'LINK' ? '–' : fmtSize(doc.fileSize) }} · {{ fmtDate(doc.createdAt) }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else-if="!isLoading" class="pa-12 text-center text-medium-emphasis">
      Chưa có tài liệu nào.
    </v-card>

    <div v-if="meta && meta.totalPages > 1" class="d-flex justify-center mt-6">
      <v-pagination v-model="page" :length="meta.totalPages" :total-visible="7" />
    </div>

    <!-- Upload / link dialog -->
    <v-dialog v-model="uploadOpen" max-width="480">
      <v-card>
        <v-card-title>Tải lên tài liệu</v-card-title>
        <v-card-text>
          <v-alert v-if="uploadError" type="error" variant="tonal" density="compact" class="mb-3">
            {{ uploadError }}
          </v-alert>
          <v-btn-toggle v-model="uploadKind" mandatory density="comfortable" color="primary" class="mb-4">
            <v-btn value="FILE" size="small"><v-icon start>mdi-file-upload-outline</v-icon>Tệp (PDF/MP3)</v-btn>
            <v-btn value="LINK" size="small"><v-icon start>mdi-link-variant</v-icon>Liên kết</v-btn>
          </v-btn-toggle>

          <v-text-field v-model="uploadForm.title" label="Tiêu đề" />
          <v-file-input
            v-if="uploadKind === 'FILE'"
            v-model="uploadForm.file"
            accept="application/pdf,audio/*"
            label="Chọn tệp (PDF / MP3)"
            prepend-icon="mdi-paperclip"
          />
          <v-text-field v-else v-model="uploadForm.url" label="Đường dẫn (URL)" placeholder="https://…" />

          <v-combobox
            v-model="uploadForm.category"
            :items="categories"
            label="Danh mục (IELTS, TOEIC…)"
            hide-details
            class="mb-4"
          />
          <v-select
            v-model="uploadForm.classId"
            :items="[{ id: '', name: 'Dùng chung (không gán lớp)' }, ...classes]"
            item-title="name"
            item-value="id"
            label="Gán vào lớp (tuỳ chọn)"
            prepend-inner-icon="mdi-google-classroom"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="uploadOpen = false">Huỷ</v-btn>
          <v-btn
            color="primary"
            :loading="upload.isPending.value || createLink.isPending.value"
            :disabled="!canSubmitUpload"
            @click="submitUpload"
          >
            Tải lên
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Assign-to-class dialog -->
    <v-dialog v-model="assignOpen" max-width="460">
      <v-card v-if="assignDoc">
        <v-card-title>Gán "{{ assignDoc.title }}" vào lớp</v-card-title>
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-1">Đang chia sẻ với</div>
          <div class="d-flex ga-1 flex-wrap mb-4">
            <v-chip
              v-for="a in classChips(assignDoc)"
              :key="a.id"
              size="small"
              color="primary"
              variant="tonal"
              closable
              @click:close="doUnassign(assignDoc, a.id)"
            >
              {{ a.class?.name }}
            </v-chip>
            <span v-if="!classChips(assignDoc).length" class="text-caption text-medium-emphasis">
              Chưa gán lớp nào (dùng chung).
            </span>
          </div>
          <div class="d-flex ga-2 align-center">
            <v-select
              v-model="assignClassId"
              :items="assignableClasses"
              item-title="name"
              item-value="id"
              label="Chọn lớp để gán"
              density="comfortable"
              hide-details
            />
            <v-btn color="primary" :loading="assign.isPending.value" :disabled="!assignClassId" @click="doAssign">
              Gán
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="assignOpen = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.st-doc {
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.st-doc:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}
</style>
