<script setup lang="ts">
import { type DocumentItem, useDocuments } from '~/composables/useDocuments';

type CategoryFilter = 'Tất cả' | 'IELTS' | 'TOEIC' | 'Giao tiếp' | 'Ngữ pháp';

const selectedCategory = ref<CategoryFilter>('Tất cả');
const search = ref('');
const apiCategory = computed(() => (selectedCategory.value === 'Tất cả' ? undefined : selectedCategory.value));
const { data, isLoading, error: queryError } = useDocuments(apiCategory);
const config = useRuntimeConfig();

const documents = computed(() => data.value?.data ?? []);
const filteredDocuments = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return documents.value;
  return documents.value.filter((doc) =>
    [doc.title, doc.category, doc.type, doc.description]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(keyword)),
  );
});

const categories: CategoryFilter[] = ['Tất cả', 'IELTS', 'TOEIC', 'Giao tiếp', 'Ngữ pháp'];

function downloadUrl(doc: DocumentItem) {
  return `${config.public.apiBase}/documents/${doc.id}/download`;
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
  if (doc.type === 'LINK') return 'LINK • Tài liệu trực tuyến';
  if (doc.type === 'MP3') return 'MP3 • Audio luyện nghe';
  return 'PDF • Tài liệu học tập';
}

function categoryLabel(doc: DocumentItem) {
  return doc.category || 'Chưa phân loại';
}

function actionLabel(doc: DocumentItem) {
  return doc.type === 'LINK' ? 'Mở link' : 'Tải xuống';
}
</script>

<template>
  <div class="student-documents">
    <header class="student-documents__header">
      <div>
        <h1>Tài liệu học tập</h1>
        <p>Xem tài liệu, link học tập và audio giáo viên đã chia sẻ cho bạn</p>
      </div>
    </header>

    <section class="student-documents__filters">
      <div class="student-documents__chips" aria-label="Lọc tài liệu">
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

      <label class="student-documents__search" for="student-document-search">
        <v-icon size="16">mdi-magnify</v-icon>
        <input
          id="student-document-search"
          v-model="search"
          autocomplete="off"
          placeholder="Tìm kiếm tài liệu..."
          type="search"
        >
      </label>
    </section>

    <v-alert v-if="queryError" class="student-documents__alert" color="error" density="compact" variant="tonal">
      Không thể tải tài liệu. Vui lòng thử lại sau.
    </v-alert>

    <AppSkeleton v-if="isLoading && !filteredDocuments.length" variant="grid" :cards="8" />

    <section v-else-if="filteredDocuments.length" class="student-documents__grid">
      <article
        v-for="doc in filteredDocuments"
        :key="doc.id"
        class="student-documents__card"
        :class="toneFor(doc)"
      >
        <div class="student-documents__card-head">
          <span class="student-documents__file-icon">
            <v-icon size="24">{{ iconFor(doc) }}</v-icon>
          </span>

          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="student-documents__menu"
                icon="mdi-dots-horizontal"
                size="small"
                variant="text"
              />
            </template>
            <v-list density="compact">
              <v-list-item
                v-if="doc.type === 'LINK'"
                :href="doc.url ?? undefined"
                prepend-icon="mdi-open-in-new"
                target="_blank"
                title="Mở link"
              />
              <v-list-item
                v-else
                :href="downloadUrl(doc)"
                prepend-icon="mdi-download"
                target="_blank"
                title="Tải xuống"
              />
            </v-list>
          </v-menu>
        </div>

        <h2 :title="doc.title">{{ doc.title }}</h2>

        <div class="student-documents__card-spacer" />

        <span class="student-documents__category">{{ categoryLabel(doc) }}</span>

        <footer>
          <span>{{ metaLine(doc) }}</span>
          <a
            v-if="doc.type === 'LINK'"
            :href="doc.url ?? undefined"
            rel="noopener"
            target="_blank"
          >
            <v-icon size="14">mdi-link-variant</v-icon>
            {{ actionLabel(doc) }}
          </a>
          <a v-else :href="downloadUrl(doc)" rel="noopener" target="_blank">
            <v-icon size="14">mdi-download</v-icon>
            {{ actionLabel(doc) }}
          </a>
        </footer>
      </article>
    </section>

    <div v-if="!filteredDocuments.length && !isLoading" class="student-documents__empty">
      <v-icon size="38">mdi-file-document-outline</v-icon>
      <strong>Chưa có tài liệu</strong>
      <span>Khi giáo viên chia sẻ tài liệu cho bạn hoặc lớp học của bạn, tài liệu sẽ xuất hiện tại đây.</span>
    </div>

  </div>
</template>

<style scoped>
.student-documents {
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

.student-documents__header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.student-documents__header h1 {
  color: var(--docs-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.33;
  margin: 0;
}

.student-documents__header p {
  color: var(--docs-muted);
  font-size: 14px;
  font-weight: 500;
  margin: 4px 0 0;
}

.student-documents__filters {
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

.student-documents__chips {
  display: flex;
  gap: 8px;
  max-width: 100%;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.student-documents__chips::-webkit-scrollbar {
  display: none;
}

.student-documents__chips button {
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

.student-documents__chips button:hover {
  background: #f1f5f9;
}

.student-documents__chips button.is-active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: var(--docs-blue);
}

.student-documents__search {
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

.student-documents__search:focus-within {
  border-color: var(--docs-blue);
  box-shadow: 0 0 0 3px rgb(0 113 249 / 12%);
}

.student-documents__search input {
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  min-width: 0;
  outline: 0;
  width: 100%;
}

.student-documents__search input::placeholder {
  color: #94a3b8;
}

.student-documents__alert {
  margin-bottom: 16px;
}

.student-documents__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.student-documents__card {
  background: #fff;
  border: 1px solid var(--docs-border);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 160px;
  padding: 20px;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.student-documents__card:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 6px -1px rgb(15 23 42 / 10%), 0 2px 4px -2px rgb(15 23 42 / 10%);
  transform: translateY(-1px);
}

.student-documents__card:hover .student-documents__menu {
  opacity: 1;
}

.student-documents__card h2 {
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

.student-documents__card-head {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.student-documents__file-icon {
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.is-pdf .student-documents__file-icon {
  background: #fef2f2;
  color: #ef4444;
}

.is-audio .student-documents__file-icon {
  background: #f5f3ff;
  color: #7c3aed;
}

.is-link .student-documents__file-icon {
  background: #eff6ff;
  color: #3b82f6;
}

.student-documents__menu {
  border-radius: 6px !important;
  color: #94a3b8 !important;
  height: 28px !important;
  opacity: 0;
  transition: opacity 180ms ease, background 180ms ease, color 180ms ease;
  width: 28px !important;
}

.student-documents__menu:hover {
  background: #f8fafc !important;
  color: #334155 !important;
}

.student-documents__card-spacer {
  flex: 1 1 auto;
  min-height: 20px;
}

.student-documents__category {
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

.student-documents footer {
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

.student-documents footer > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-documents footer a {
  align-items: center;
  color: var(--docs-blue);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
  gap: 4px;
  text-decoration: none;
  transition: color 180ms ease;
}

.student-documents footer a:hover {
  color: #1e40af;
}

.student-documents__empty,
.student-documents__loading {
  align-items: center;
  color: var(--docs-muted);
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 280px;
  text-align: center;
}

.student-documents__empty strong {
  color: var(--docs-text);
  font-size: 18px;
  font-weight: 800;
}

.student-documents__empty span {
  font-size: 14px;
  font-weight: 500;
  max-width: 380px;
}

@media (max-width: 1120px) {
  .student-documents__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 840px) {
  .student-documents__filters {
    align-items: stretch;
    flex-direction: column;
  }

  .student-documents__search {
    flex-basis: auto;
    width: 100%;
  }

  .student-documents__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .student-documents__header {
    align-items: stretch;
    flex-direction: column;
  }

  .student-documents__grid {
    grid-template-columns: 1fr;
  }
}
</style>
