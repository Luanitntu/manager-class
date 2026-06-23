<script setup lang="ts">
import { useAssistants, useAssistantMutations } from '~/composables/useAssistants';

const search = ref('');
const { data, isLoading } = useAssistants(search);
const { createAssistant } = useAssistantMutations();
const avatar = useAvatar();
const assistants = computed(() => data.value?.data ?? []);

function openDetail(id: string) {
  navigateTo(`/assistants/${id}`);
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
  error.value = null;
  try {
    await createAssistant.mutateAsync({ ...form });
    createOpen.value = false;
    Object.assign(form, { fullName: '', email: '', password: '', phone: '' });
  } catch (e) {
    error.value = extractApiError(e);
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
      <v-table v-if="assistants.length" hover>
        <thead>
          <tr>
            <th>Assistant</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Salary</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in assistants"
            :key="a.id"
            style="cursor: pointer"
            @click="openDetail(a.id)"
          >
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar color="primary" size="34">
                  <v-img v-if="avatar(a)" :src="avatar(a)!" />
                  <span v-else class="text-white">{{ a.fullName[0] }}</span>
                </v-avatar>
                <span class="font-weight-medium">{{ a.fullName }}</span>
              </div>
            </td>
            <td class="text-medium-emphasis">{{ a.email }}</td>
            <td class="text-medium-emphasis">{{ a.phone || '—' }}</td>
            <td>
              <v-chip v-if="a.assistantProfile" size="small" variant="tonal">
                {{ salaryLabel[a.assistantProfile.salaryMethod] }} ·
                {{ Number(a.assistantProfile.salaryRate).toLocaleString() }}
              </v-chip>
              <span v-else class="text-medium-emphasis">—</span>
            </td>
            <td class="text-right">
              <v-icon class="text-medium-emphasis">mdi-chevron-right</v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-else-if="!isLoading" class="pa-12 text-center text-medium-emphasis">
        No assistants yet.
      </div>
    </v-card>

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
