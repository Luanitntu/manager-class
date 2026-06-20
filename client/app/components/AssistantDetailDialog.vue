<script setup lang="ts">
import {
  useAssistantDetail,
  useAssistantMutations,
  useAssistantSalary,
} from '~/composables/useAssistants';

const props = defineProps<{ modelValue: boolean; assistantId: string | null }>();
const emit = defineEmits<{ 'update:modelValue': [boolean] }>();

const idRef = computed(() => props.assistantId);
const { data: assistant } = useAssistantDetail(idRef);
const { data: salary } = useAssistantSalary(idRef);
const { updateSalary } = useAssistantMutations();

const form = reactive({ salaryMethod: 'PER_SESSION', salaryRate: 0, bio: '' });

watch(assistant, (a) => {
  if (!a?.assistantProfile) return;
  form.salaryMethod = a.assistantProfile.salaryMethod;
  form.salaryRate = Number(a.assistantProfile.salaryRate);
  form.bio = a.assistantProfile.bio ?? '';
});

async function saveSalary() {
  if (!props.assistantId) return;
  await updateSalary.mutateAsync({
    id: props.assistantId,
    body: {
      salaryMethod: form.salaryMethod,
      salaryRate: Number(form.salaryRate),
      bio: form.bio || undefined,
    },
  });
}

const methodLabel: Record<string, string> = {
  PER_SESSION: 'per session',
  PER_HOUR: 'per hour',
  PER_CLASS: 'per class',
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="assistant">
      <v-card-title class="d-flex align-center ga-3">
        <v-avatar color="primary"><span class="text-white">{{ assistant.fullName[0] }}</span></v-avatar>
        <div>
          <div>{{ assistant.fullName }}</div>
          <div class="text-caption text-medium-emphasis">{{ assistant.email }}</div>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Salary configuration</h3>
        <div class="d-flex ga-3 align-center">
          <v-select
            v-model="form.salaryMethod"
            :items="['PER_SESSION', 'PER_HOUR', 'PER_CLASS']"
            label="Method"
            density="comfortable"
          />
          <v-text-field v-model="form.salaryRate" type="number" label="Rate" density="comfortable" />
          <v-btn color="primary" :loading="updateSalary.isPending.value" @click="saveSalary">
            Save
          </v-btn>
        </div>

        <v-divider class="my-4" />

        <h3 class="text-subtitle-1 font-weight-bold mb-2">Salary summary</h3>
        <div v-if="salary">
          <div class="d-flex ga-6 mb-3">
            <div>
              <div class="text-h6 font-weight-bold">{{ salary.totalAmount.toLocaleString() }}</div>
              <div class="text-caption text-medium-emphasis">
                Total ({{ methodLabel[salary.method] }})
              </div>
            </div>
            <div>
              <div class="text-h6 font-weight-bold">{{ salary.totalSessions }}</div>
              <div class="text-caption text-medium-emphasis">Sessions</div>
            </div>
            <div>
              <div class="text-h6 font-weight-bold">{{ salary.totalHours }}</div>
              <div class="text-caption text-medium-emphasis">Hours</div>
            </div>
          </div>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Class</th>
                <th class="text-right">Sessions</th>
                <th class="text-right">Hours</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in salary.byClass" :key="c.classId">
                <td>{{ c.className }}</td>
                <td class="text-right">{{ c.sessionCount }}</td>
                <td class="text-right">{{ c.hours }}</td>
                <td class="text-right">{{ c.amount.toLocaleString() }}</td>
              </tr>
              <tr v-if="!salary.byClass.length">
                <td colspan="4" class="text-center text-medium-emphasis">No assigned sessions.</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <v-divider class="my-4" />

        <h3 class="text-subtitle-1 font-weight-bold mb-2">Assigned classes</h3>
        <v-chip-group>
          <v-chip v-for="a in assistant.classAssignments ?? []" :key="a.class.id" variant="tonal">
            {{ a.class.name }}
          </v-chip>
        </v-chip-group>
        <div v-if="!assistant.classAssignments?.length" class="text-medium-emphasis text-caption">
          No class assignments yet (assign from a class).
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
