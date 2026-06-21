<script setup lang="ts">
import { useAssistants, useAssistantMutations } from '~/composables/useAssistants';
import { useSnackbar } from '~/composables/useSnackbar';

const search = ref('');
const { data, isLoading, error, refetch } = useAssistants(search);
const { createAssistant } = useAssistantMutations();
const { success: showSuccess, error: showError } = useSnackbar();

const assistants = computed(() => data.value?.data ?? []);

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
    await createAssistant.mutateAsync({ ...form });
    showSuccess('Assistant created successfully.');
    createOpen.value = false;
    Object.assign(form, { fullName: '', email: '', password: '', phone: '' });
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not create assistant');
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Assistant Teachers"
      subtitle="Assignments and salary."
      icon="mdi-account-tie-voice"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="createOpen = true">
          New Assistant
        </v-btn>
      </template>
    </AppPageHeader>

    <div class="mb-4 d-flex align-center justify-space-between ga-4">
      <v-text-field
        v-model="search"
        placeholder="Search assistants…"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        style="max-width: 360px"
      />
    </div>

    <AppState
      v-if="isLoading"
      variant="loading"
      title="Loading assistants"
      body="Fetching assistant profiles..."
    />

    <AppState
      v-else-if="error"
      variant="error"
      title="Could not load assistants"
      body="Failed to load assistant profiles. Please check your network connection."
      action-label="Try again"
      @action="refetch()"
    />

    <template v-else>
      <v-card class="st-card-soft">
        <v-list v-if="assistants.length">
          <template v-for="(a, i) in assistants" :key="a.id">
            <v-list-item @click="openDetail(a.id)">
              <template #prepend>
                <v-avatar color="primary" size="36">
                  <span class="text-white">{{ a.fullName[0] }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>{{ a.fullName }}</v-list-item-title>
              <v-list-item-subtitle>{{ a.email }}</v-list-item-subtitle>
              <template #append>
                <v-chip size="small" variant="tonal">
                  {{ a._count?.classAssignments ?? 0 }} classes
                </v-chip>
              </template>
            </v-list-item>
            <v-divider v-if="i < assistants.length - 1" />
          </template>
        </v-list>
        <AppState
          v-else
          variant="empty"
          title="No assistants yet"
          body="Start by inviting or creating a new assistant teacher profile."
          action-label="New Assistant"
          @action="createOpen = true"
        />
      </v-card>
    </template>

    <AssistantDetailDialog v-model="detailOpen" :assistant-id="selectedId" />

    <v-dialog v-model="createOpen" max-width="460">
      <v-card>
        <v-card-title>New assistant</v-card-title>
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
              :loading="createAssistant.isPending.value"
            >
              Create
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
