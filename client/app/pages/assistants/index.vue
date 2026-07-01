<script setup lang="ts">
import { useAssistants, useAssistantMutations } from '~/composables/useAssistants';

const search = ref('');
const page = ref(1);
const limit = ref(10);
watch([search, limit], () => (page.value = 1));
const { data, isLoading } = useAssistants(search, page, limit);
const { createAssistant } = useAssistantMutations();
const avatar = useAvatar();
const assistants = computed(() => data.value?.data ?? []);
const meta = computed(() => data.value?.meta);

const detailOpen = ref(false);
const selectedId = ref<string | null>(null);
function openDetail(id: string) {
  selectedId.value = id;
  detailOpen.value = true;
}

const createOpen = ref(false);
const error = ref<string | null>(null);
const form = reactive({ fullName: '', email: '', password: '', phone: '' });

const salaryLabel: Record<string, string> = {
  PER_SESSION: 'Per session',
  PER_HOUR: 'Per hour',
  PER_CLASS: 'Per class',
};

async function create() {
  if (createAssistant.isPending.value) return;
  error.value = null;
  try {
    await createAssistant.mutateAsync({ ...form });
    createOpen.value = false;
    Object.assign(form, { fullName: '', email: '', password: '', phone: '' });
  } catch (e) {
    error.value = extractApiError(e) ?? 'Could not create assistant';
  }
}
</script>

<template>
  <UiPage>
    <UiPageHeader title="Assistant Teachers" subtitle="Assignments and salary.">
      <template #actions>
        <UiButton leading-icon="mdi-account-plus" @click="createOpen = true">
          Create assistant
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid gap-4">
      <UiToolbar align="start">
        <div class="w-full max-w-[360px]">
          <UiInput v-model="search" placeholder="Search assistants..." aria-label="Search assistants">
            <template #leading>
              <AppIcon name="mdi-magnify" :size="18" class="text-[var(--st-muted)]" />
            </template>
            <template v-if="search" #trailing>
              <UiIconButton
                label="Clear assistant search"
                icon="mdi-close"
                size="compact"
                @click="search = ''"
              />
            </template>
          </UiInput>
        </div>
      </UiToolbar>

      <UiList>
        <li v-if="isLoading && !assistants.length" class="p-4">
          <AppSkeleton variant="list" :rows="5" />
        </li>

        <template v-else-if="assistants.length">
          <UiListItem
            v-for="a in assistants"
            :key="a.id"
            as="button"
            type="button"
            class="w-full cursor-pointer text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
            @click="openDetail(a.id)"
          >
            <template #leading>
              <UiAvatar :src="avatar(a)" :name="a.fullName" :alt="a.fullName" size="md" />
            </template>

            <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="min-w-0">
                <p class="truncate text-base font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
                  {{ a.fullName }}
                </p>
                <p class="mt-0.5 flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                  <span class="min-w-0 truncate">{{ a.email }}</span>
                  <span v-if="a.phone" class="min-w-0 truncate">{{ a.phone }}</span>
                </p>
              </div>

              <div class="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                <UiBadge v-if="a.assistantProfile" tone="primary">
                  {{ salaryLabel[a.assistantProfile.salaryMethod] }}
                  {{ Number(a.assistantProfile.salaryRate).toLocaleString() }}
                </UiBadge>
                <UiBadge tone="neutral">
                  {{ a._count?.classAssignments ?? 0 }} classes
                </UiBadge>
              </div>
            </div>
          </UiListItem>
        </template>

        <li v-else-if="!isLoading" class="p-4">
          <UiEmptyState
            icon="mdi-account-multiple-outline"
            heading="No assistants found"
            body="Create an assistant or change your search."
          >
            <template #actions>
              <UiButton leading-icon="mdi-account-plus" @click="createOpen = true">
                Create assistant
              </UiButton>
            </template>
          </UiEmptyState>
        </li>
      </UiList>

      <TablePager v-if="meta" v-model:page="page" v-model:limit="limit" :meta="meta" />
    </div>

    <AssistantDetailDialog v-model="detailOpen" :assistant-id="selectedId" />

    <UiDialog v-model="createOpen" title="Create assistant" size="sm">
      <form class="grid gap-4" @submit.prevent="create">
        <UiAlert v-if="error" tone="error">
          {{ error }}
        </UiAlert>

        <UiInput v-model="form.fullName" label="Full name" required autocomplete="name" />
        <UiInput v-model="form.email" label="Email" type="email" required autocomplete="email" />
        <UiInput v-model="form.password" label="Temporary password" required autocomplete="new-password" />
        <UiInput v-model="form.phone" label="Phone (optional)" autocomplete="tel" />
      </form>

      <template #footer>
        <UiActionGroup>
          <UiButton variant="secondary" @click="createOpen = false">
            Cancel
          </UiButton>
          <UiButton
            :loading="createAssistant.isPending.value"
            :disabled="!form.fullName || !form.email || form.password.length < 8"
            @click="create"
          >
            Create assistant
          </UiButton>
        </UiActionGroup>
      </template>
    </UiDialog>
  </UiPage>
</template>
