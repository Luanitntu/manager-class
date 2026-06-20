<script setup lang="ts">
import { useAssistants, useAssistantMutations } from '~/composables/useAssistants';

const search = ref('');
const { data, isLoading } = useAssistants(search);
const { createAssistant } = useAssistantMutations();
const assistants = computed(() => data.value?.data ?? []);

const detailOpen = ref(false);
const selectedId = ref<string | null>(null);
function openDetail(id: string) {
  selectedId.value = id;
  detailOpen.value = true;
}

const createOpen = ref(false);
const error = ref<string | null>(null);
const form = reactive({ fullName: '', email: '', password: '', phone: '' });

async function create() {
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
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Assistant Teachers</h1>
        <p class="text-medium-emphasis ma-0">Assignments and salary.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-account-plus" @click="createOpen = true">
        New Assistant
      </v-btn>
    </div>

    <v-text-field
      v-model="search"
      placeholder="Search assistants…"
      prepend-inner-icon="mdi-magnify"
      class="mb-4"
      clearable
      hide-details
      style="max-width: 360px"
    />

    <v-card>
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
      <div v-else-if="!isLoading" class="pa-12 text-center text-medium-emphasis">
        No assistants yet.
      </div>
    </v-card>

    <AssistantDetailDialog v-model="detailOpen" :assistant-id="selectedId" />

    <v-dialog v-model="createOpen" max-width="460">
      <v-card>
        <v-card-title>New assistant</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-text-field v-model="form.fullName" label="Full name" />
          <v-text-field v-model="form.email" label="Email" type="email" />
          <v-text-field v-model="form.password" label="Temporary password" />
          <v-text-field v-model="form.phone" label="Phone (optional)" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createOpen = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="createAssistant.isPending.value"
            :disabled="!form.fullName || !form.email || form.password.length < 8"
            @click="create"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
