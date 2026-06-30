<script setup lang="ts">
import { useClasses } from '~/composables/useClasses';
import {
  type DocumentItem,
  useDocumentCategories,
  useDocumentDownload,
  useDocumentMutations,
  useDocuments,
} from '~/composables/useDocuments';
import { useStudents } from '~/composables/useStudents';

const selectedCategory = ref('Tất cả');
const search = ref('');
const page = ref(1);
const limit = ref(12);
watch([selectedCategory, search, limit], () => (page.value = 1));
const apiCategory = computed(() => (selectedCategory.value === 'Tất cả' ? undefined : selectedCategory.value));
const { data, isLoading } = useDocuments({ category: apiCategory, search, page }, limit);
const { data: categoriesData } = useDocumentCategories();
const { createLink, upload, assign, remove } = useDocumentMutations();
const download = useDocumentDownload();
const { data: classesData } = useClasses(undefined, undefined, 100);
const { data: studentsData } = useStudents(undefined, undefined, undefined, 100);
const auth = useAuthStore();

const documents = computed(() => data.value?.data ?? []);
const meta = computed(() => data.value?.meta);
const filteredDocuments = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return documents.value;
  return documents.value.filter((doc) =>
    [doc.title, doc.category, doc.type].some((value) => value?.toLowerCase().includes(keyword)),
  );
});
const classes = computed(() => classesData.value?.data ?? []);
const students = computed(() => studentsData.value?.data ?? []);
const fallbackCategories = ['IELTS', 'TOEIC', 'Giao tiếp', 'Ngữ pháp'];
const categories = computed(() => ['Tất cả', ...(categoriesData.value?.length ? categoriesData.value : fallbackCategories)]);
const formCategories = computed(() => categories.value.filter((category) => category !== 'Tất cả'));
const canManage = computed(() => auth.role === 'TEACHER' || auth.role === 'ASSISTANT');

// --- Create / upload dialog ---
const createOpen = ref(false);
const mode = ref<'link' | 'file'>('link');
const error = ref<string | null>(null);
const pageError = ref<string | null>(null);
const deletingId = ref<string | null>(null);
const form = reactive({ title: '', url: '', category: '', file: null as File | null });
const isSavingDocument = computed(() => createLink.isPending.value || upload.isPending.value);

function openCreate() {
  Object.assign(form, { title: '', url: '', category: '', file: null });
  mode.value = 'link';
  error.value = null;
  createOpen.value = true;
}

async function submit() {
  if (isSavingDocument.value) return;
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
    error.value = extractApiError(e) ?? 'Không thể lưu tài liệu';
  }
}

// --- Assign dialog ---
const assignOpen = ref(false);
const assignDoc = ref<DocumentItem | null>(null);
const assignError = ref<string | null>(null);
const assignForm = reactive<{
  targetType: 'CLASS' | 'STUDENT';
  classId: string;
  studentId: string;
}>({ targetType: 'CLASS', classId: '', studentId: '' });

function openAssign(doc: DocumentItem) {
  assignDoc.value = doc;
  assignError.value = null;
  Object.assign(assignForm, { targetType: 'CLASS', classId: '', studentId: '' });
  assignOpen.value = true;
}

async function submitAssign() {
  if (assign.isPending.value) return;
  if (!assignDoc.value) return;
  assignError.value = null;
  const body: { targetType: 'CLASS'; classId: string } | { targetType: 'STUDENT'; studentId: string } =
    assignForm.targetType === 'CLASS'
      ? { targetType: 'CLASS', classId: assignForm.classId }
      : { targetType: 'STUDENT', studentId: assignForm.studentId };
  try {
    await assign.mutateAsync({ id: assignDoc.value.id, body });
    assignOpen.value = false;
  } catch (e) {
    assignError.value = extractApiError(e) ?? 'Không thể chia sẻ tài liệu';
  }
}

async function deleteDocument(doc: DocumentItem) {
  if (deletingId.value) return;
  if (!confirm(`Xóa tài liệu "${doc.title}"?`)) return;
  pageError.value = null;
  deletingId.value = doc.id;
  try {
    await remove.mutateAsync(doc.id);
  } catch (e) {
    pageError.value = extractApiError(e) ?? 'Không thể xóa tài liệu';
  } finally {
    deletingId.value = null;
  }
}

async function openDocument(doc: DocumentItem) {
  pageError.value = null;
  try {
    await download(doc);
  } catch (e) {
    pageError.value = extractApiError(e) ?? 'Không thể tải tài liệu';
  }
}

function iconFor(doc: DocumentItem) {
  if (doc.type === 'PDF') return 'mdi-file-pdf-box';
  if (doc.type === 'MP3') return 'mdi-music-note';
  return 'mdi-link-variant';
}

function toneFor(doc: DocumentItem) {
  if (doc.type === 'PDF') return 'is-pdf';
  if (doc.type === 'MP3') return 'is-audio';
  return 'is-link';
}

function metaLine(doc: DocumentItem) {
  const assignments = doc._count?.assignments ?? 0;
  return `${doc.type} • ${assignments} lượt chia sẻ`;
}

function categoryLabel(doc: DocumentItem) {
  return doc.category || 'Chưa phân loại';
}
</script>

<template>
  <div class="teacher-documents">
    <header class="teacher-documents__header">
      <div>
        <h1>Tài liệu học tập</h1>
        <p>Quản lý và chia sẻ tài liệu cho học viên</p>
      </div>

      <div class="teacher-documents__actions">
        <v-btn v-if="canManage" class="teacher-documents__create" color="primary" @click="openCreate">
          <v-icon start size="18">mdi-plus</v-icon>
          Tải lên tài liệu
        </v-btn>
      </div>
    </header>

    <section class="teacher-documents__filters">
      <div class="teacher-documents__chips" aria-label="Lọc tài liệu">
        <button
          v-for="categoryItem in categories"
          :key="categoryItem"
          :class="{ 'is-active': selectedCategory === categoryItem }"
          type="button"
          @click="selectedCategory = categoryItem"
        >
          {{ categoryItem }}
        </button>
      </div>

      <label class="teacher-documents__search" for="document-search">
        <v-icon size="16">mdi-magnify</v-icon>
        <input
          id="document-search"
          v-model="search"
          autocomplete="off"
          placeholder="Tìm kiếm tài liệu..."
          type="search"
        >
      </label>
    </section>

    <v-alert v-if="pageError" class="teacher-documents__alert" color="error" density="compact" variant="tonal">
      {{ pageError }}
    </v-alert>

    <AppSkeleton v-if="isLoading && !filteredDocuments.length" variant="grid" :cards="8" />

    <section v-else class="teacher-documents__grid">
      <button v-if="canManage" class="teacher-documents__folder" type="button" @click="openCreate">
        <v-icon size="32">mdi-folder-plus-outline</v-icon>
        <span>Tạo thư mục mới</span>
      </button>

      <article
        v-for="doc in filteredDocuments"
        :key="doc.id"
        class="teacher-documents__card"
        :class="toneFor(doc)"
      >
        <div class="teacher-documents__card-head">
          <span class="teacher-documents__file-icon">
            <v-icon size="24">{{ iconFor(doc) }}</v-icon>
          </span>

          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="teacher-documents__menu"
                icon="mdi-dots-horizontal"
                size="small"
                variant="text"
              />
            </template>
            <v-list density="compact">
              <v-list-item
                v-if="doc.type === 'LINK'"
                prepend-icon="mdi-open-in-new"
                title="Mở link"
                @click="openDocument(doc)"
              />
              <v-list-item
                v-else
                prepend-icon="mdi-download"
                title="Tải xuống"
                @click="openDocument(doc)"
              />
              <v-list-item
                v-if="canManage"
                prepend-icon="mdi-account-multiple-plus"
                title="Chia sẻ"
                @click="openAssign(doc)"
              />
              <v-list-item
                v-if="canManage"
                prepend-icon="mdi-delete-outline"
                :disabled="!!deletingId"
                :title="deletingId === doc.id ? 'Đang xóa...' : 'Xóa'"
                @click="deleteDocument(doc)"
              />
            </v-list>
          </v-menu>
        </div>

        <h2 :title="doc.title">{{ doc.title }}</h2>

        <div class="teacher-documents__card-spacer" />

        <span class="teacher-documents__category">{{ categoryLabel(doc) }}</span>

        <footer>
          <span>{{ metaLine(doc) }}</span>
          <a
            v-if="doc.type === 'LINK'"
            href="#"
            rel="noopener"
            @click.prevent="openDocument(doc)"
          >
            <v-icon size="14">mdi-link-variant</v-icon>
            Mở link
          </a>
          <a v-else href="#" rel="noopener" @click.prevent="openDocument(doc)">
            <v-icon size="14">mdi-download</v-icon>
            Tải xuống
          </a>
        </footer>
      </article>
    </section>

    <div v-if="!filteredDocuments.length && !isLoading" class="teacher-documents__empty">
      <v-icon size="38">mdi-file-document-outline</v-icon>
      <strong>Chưa có tài liệu</strong>
      <span>Tải lên tài liệu hoặc thêm link học tập để chia sẻ cho lớp.</span>
    </div>

    <TablePager v-if="meta" v-model:page="page" v-model:limit="limit" :meta="meta" />

    <!-- Create / upload -->
    <v-dialog v-model="createOpen" max-width="480">
      <v-card class="teacher-documents__dialog">
        <v-card-title>Thêm tài liệu</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-btn-toggle v-model="mode" mandatory color="primary" class="mb-4" density="comfortable">
            <v-btn value="link" size="small">Link</v-btn>
            <v-btn value="file" size="small">File (PDF/MP3)</v-btn>
          </v-btn-toggle>
          <v-text-field v-model="form.title" label="Tiêu đề" />
          <v-text-field v-if="mode === 'link'" v-model="form.url" label="URL" />
          <v-file-input
            v-else
            v-model="form.file"
            label="File"
            accept=".pdf,.mp3,audio/*,application/pdf"
          />
          <v-select v-model="form.category" :items="formCategories" label="Danh mục" clearable />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createOpen = false">Hủy</v-btn>
          <v-btn
            color="primary"
            :loading="isSavingDocument"
            :disabled="!form.title || (mode === 'link' ? !form.url : !form.file)"
            @click="submit"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Assign -->
    <v-dialog v-model="assignOpen" max-width="440">
      <v-card class="teacher-documents__dialog">
        <v-card-title>Chia sẻ tài liệu</v-card-title>
        <v-card-text>
          <v-alert v-if="assignError" type="error" variant="tonal" density="compact" class="mb-4">
            {{ assignError }}
          </v-alert>
          <v-btn-toggle v-model="assignForm.targetType" mandatory color="primary" class="mb-4" density="comfortable">
            <v-btn value="CLASS" size="small">Lớp</v-btn>
            <v-btn value="STUDENT" size="small">Học viên</v-btn>
          </v-btn-toggle>
          <v-select
            v-if="assignForm.targetType === 'CLASS'"
            v-model="assignForm.classId"
            :items="classes"
            item-title="name"
            item-value="id"
            label="Lớp"
          />
          <v-select
            v-else
            v-model="assignForm.studentId"
            :items="students"
            item-title="fullName"
            item-value="id"
            label="Học viên"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="assignOpen = false">Hủy</v-btn>
          <v-btn
            color="primary"
            :loading="assign.isPending.value"
            :disabled="assignForm.targetType === 'CLASS' ? !assignForm.classId : !assignForm.studentId"
            @click="submitAssign"
          >
            Chia sẻ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.teacher-documents {
  --docs-blue: #0071f9;
  --docs-text: #1e293b;
  --docs-muted: #64748b;
  --docs-border: #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  max-width: 1152px;
  padding-bottom: 24px;
  width: 100%;
}

.teacher-documents__header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.teacher-documents__header h1 {
  color: var(--docs-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.33;
  margin: 0;
}

.teacher-documents__header p {
  color: var(--docs-muted);
  font-size: 14px;
  font-weight: 500;
  margin: 4px 0 0;
}

.teacher-documents__actions {
  align-items: center;
  display: flex;
  gap: 12px;
}

.teacher-documents__create {
  background: var(--docs-blue) !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 2px rgb(15 23 42 / 8%) !important;
  color: #fff !important;
  font-size: 14px;
  font-weight: 800;
  height: 38px !important;
  letter-spacing: 0;
  padding: 0 16px !important;
}

.teacher-documents__filters {
  align-items: center;
  background: #fff;
  border: 1px solid var(--docs-border);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px;
}

.teacher-documents__chips {
  display: flex;
  gap: 8px;
  max-width: 100%;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.teacher-documents__chips::-webkit-scrollbar {
  display: none;
}

.teacher-documents__chips button {
  background: #f8fafc;
  border: 1px solid var(--docs-border);
  border-radius: 999px;
  color: #475569;
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  min-height: 30px;
  padding: 0 16px;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
}

.teacher-documents__chips button:hover {
  background: #f1f5f9;
}

.teacher-documents__chips button.is-active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: var(--docs-blue);
}

.teacher-documents__search {
  align-items: center;
  background: #f8fafc;
  border: 1px solid var(--docs-border);
  border-radius: 8px;
  color: #94a3b8;
  display: flex;
  flex: 0 0 256px;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.teacher-documents__search:focus-within {
  border-color: var(--docs-blue);
  box-shadow: 0 0 0 3px rgb(0 113 249 / 12%);
}

.teacher-documents__search input {
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  min-width: 0;
  outline: 0;
  width: 100%;
}

.teacher-documents__search input::placeholder {
  color: #94a3b8;
}

.teacher-documents__alert {
  margin-bottom: 16px;
}

.teacher-documents__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.teacher-documents__folder,
.teacher-documents__card {
  border-radius: 12px;
  min-height: 160px;
}

.teacher-documents__folder {
  align-items: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding: 20px;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
}

.teacher-documents__folder span {
  color: #475569;
  font-size: 14px;
  font-weight: 800;
}

.teacher-documents__folder:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #64748b;
}

.teacher-documents__card {
  background: #fff;
  border: 1px solid var(--docs-border);
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 20px;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.teacher-documents__card:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 6px -1px rgb(15 23 42 / 10%), 0 2px 4px -2px rgb(15 23 42 / 10%);
}

.teacher-documents__card:hover .teacher-documents__menu,
.teacher-documents__card:hover footer a {
  opacity: 1;
}

.teacher-documents__card h2 {
  color: var(--docs-text);
  display: -webkit-box;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.3;
  margin: 0;
  min-height: 36px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.teacher-documents__card-head {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.teacher-documents__file-icon {
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.is-pdf .teacher-documents__file-icon {
  background: #fef2f2;
  color: #ef4444;
}

.is-audio .teacher-documents__file-icon {
  background: #f5f3ff;
  color: #7c3aed;
}

.is-link .teacher-documents__file-icon {
  background: #eff6ff;
  color: #3b82f6;
}

.teacher-documents__menu {
  border-radius: 6px !important;
  color: #94a3b8 !important;
  height: 28px !important;
  opacity: 0;
  transition: opacity 180ms ease, background 180ms ease, color 180ms ease;
  width: 28px !important;
}

.teacher-documents__menu:hover {
  background: #f8fafc !important;
  color: #334155 !important;
}

.teacher-documents__card-spacer {
  flex: 1 1 auto;
  min-height: 20px;
}

.teacher-documents__category {
  align-self: flex-start;
  background: #f1f5f9;
  border-radius: 4px;
  color: var(--docs-muted);
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 12px;
  max-width: 100%;
  overflow: hidden;
  padding: 5px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-documents footer {
  align-items: center;
  border-top: 1px solid #f8fafc;
  color: var(--docs-muted);
  display: flex;
  font-size: 12px;
  font-weight: 600;
  gap: 10px;
  justify-content: space-between;
  padding-top: 12px;
}

.teacher-documents footer > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-documents footer a {
  align-items: center;
  color: var(--docs-blue);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
  gap: 4px;
  opacity: 0;
  text-decoration: none;
  transition: color 180ms ease, opacity 180ms ease;
}

.teacher-documents footer a:hover {
  color: #1e40af;
}

.teacher-documents__empty,
.teacher-documents__loading {
  align-items: center;
  color: var(--docs-muted);
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 280px;
  text-align: center;
}

.teacher-documents__empty strong {
  color: var(--docs-text);
  font-size: 18px;
  font-weight: 800;
}

.teacher-documents__dialog {
  border-radius: 12px !important;
}

@media (max-width: 1120px) {
  .teacher-documents__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 840px) {
  .teacher-documents__filters {
    align-items: stretch;
    flex-direction: column;
  }

  .teacher-documents__search {
    flex-basis: auto;
    width: 100%;
  }

  .teacher-documents__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .teacher-documents__header {
    align-items: stretch;
    flex-direction: column;
  }

  .teacher-documents__create {
    width: 100%;
  }

  .teacher-documents__grid {
    grid-template-columns: 1fr;
  }
}
</style>
