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
const assistantCount = computed(() => meta.value?.total ?? assistants.value.length);
const assignedClassCount = computed(() =>
  assistants.value.reduce((sum, assistant) => sum + (assistant._count?.classAssignments ?? 0), 0),
);
const configuredSalaryCount = computed(() =>
  assistants.value.filter((assistant) => Boolean(assistant.assistantProfile)).length,
);

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
  <UiPage class="space-y-6" padding="none" width="full">
    <UiPageHeader title="Assistant Teachers" subtitle="Assignments, pay setup, and teaching support in one workspace.">
      <template #actions>
        <UiButton class="w-full sm:w-auto" leading-icon="mdi-account-plus" @click="createOpen = true">
          Create assistant
        </UiButton>
      </template>
    </UiPageHeader>

    <section class="grid gap-4 sm:grid-cols-3">
      <UiMetricCard label="Assistants" :value="assistantCount">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-blue-200 bg-blue-50 text-[var(--st-primary)]">
            <AppIcon name="mdi-account-tie-outline" :size="24" />
          </span>
        </template>
        <template #hint>
          Active teaching support
        </template>
      </UiMetricCard>
      <UiMetricCard label="Assigned classes" :value="assignedClassCount">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-emerald-200 bg-emerald-50 text-emerald-600">
            <AppIcon name="mdi-google-classroom" :size="24" />
          </span>
        </template>
        <template #hint>
          Current page scope
        </template>
      </UiMetricCard>
      <UiMetricCard label="Salary configured" :value="configuredSalaryCount">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-orange-200 bg-orange-50 text-orange-600">
            <AppIcon name="mdi-cash-clock" :size="24" />
          </span>
        </template>
        <template #hint>
          Ready for payroll
        </template>
      </UiMetricCard>
    </section>

    <section class="rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white">
      <div class="flex min-w-0 flex-col gap-4 border-b border-[var(--st-border)] p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex min-w-0 items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
            <AppIcon name="mdi-account-search-outline" :size="22" />
          </span>
          <div class="min-w-0">
            <h2 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
              Assistant roster
            </h2>
            <p class="mt-1 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
              Search, open details, or add a teacher assistant without leaving the roster.
            </p>
          </div>
        </div>

        <div class="w-full lg:max-w-[380px]">
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
      </div>

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
              <div class="relative">
                <UiAvatar :src="avatar(a)" :name="a.fullName" :alt="a.fullName" size="lg" />
                <span class="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[var(--st-primary)] text-white">
                  <AppIcon name="mdi-school-outline" :size="14" />
                </span>
              </div>
            </template>

            <div class="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div class="min-w-0 space-y-1">
                <p class="truncate text-lg font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
                  {{ a.fullName }}
                </p>
                <div class="flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                  <span class="inline-flex min-w-0 items-center gap-1">
                    <AppIcon name="mdi-email-outline" :size="15" class="shrink-0" />
                    <span class="min-w-0 truncate">{{ a.email }}</span>
                  </span>
                  <span v-if="a.phone" class="inline-flex min-w-0 items-center gap-1">
                    <AppIcon name="mdi-phone-outline" :size="15" class="shrink-0" />
                    <span class="min-w-0 truncate">{{ a.phone }}</span>
                  </span>
                </div>
              </div>

              <div class="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                <UiBadge v-if="a.assistantProfile" tone="primary">
                  <AppIcon name="mdi-cash-multiple" :size="14" />
                  {{ salaryLabel[a.assistantProfile.salaryMethod] }}
                  {{ Number(a.assistantProfile.salaryRate).toLocaleString() }}
                </UiBadge>
                <UiBadge v-else tone="neutral">
                  <AppIcon name="mdi-alert-circle-outline" :size="14" />
                  Salary pending
                </UiBadge>
                <UiBadge tone="info">
                  <AppIcon name="mdi-google-classroom" :size="14" />
                  {{ a._count?.classAssignments ?? 0 }} classes
                </UiBadge>
              </div>
            </div>

            <template #actions>
              <span class="hidden h-9 w-9 place-items-center rounded-[var(--st-radius)] text-[var(--st-muted)] sm:grid">
                <AppIcon name="mdi-chevron-right" :size="20" />
              </span>
            </template>
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
    </section>

    <TablePager v-if="meta" v-model:page="page" v-model:limit="limit" :meta="meta" />

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
