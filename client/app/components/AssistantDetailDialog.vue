<script setup lang="ts">
import {
  useAssistantDetail,
  useAssistantMutations,
  useAssistantSalary,
} from '~/composables/useAssistants';

const props = defineProps<{ modelValue: boolean; assistantId: string | null }>();
const emit = defineEmits<{ 'update:modelValue': [boolean] }>();

const idRef = computed(() => props.assistantId);
const { data: assistant, isLoading: isAssistantLoading } = useAssistantDetail(idRef);
const { data: salary, isLoading: isSalaryLoading } = useAssistantSalary(idRef);
const { updateSalary } = useAssistantMutations();

const form = reactive({ salaryMethod: 'PER_SESSION', salaryRate: 0, bio: '' });
const salaryMethodItems = [
  { value: 'PER_SESSION', title: 'Per session' },
  { value: 'PER_HOUR', title: 'Per hour' },
  { value: 'PER_CLASS', title: 'Per class' },
];

watch(assistant, (a) => {
  if (!a?.assistantProfile) return;
  form.salaryMethod = a.assistantProfile.salaryMethod;
  form.salaryRate = Number(a.assistantProfile.salaryRate);
  form.bio = a.assistantProfile.bio ?? '';
});

async function saveSalary() {
  if (updateSalary.isPending.value) return;
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

function formatNumber(value: number) {
  return value.toLocaleString();
}
</script>

<template>
  <UiDialog
    :model-value="modelValue"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="assistant" #title>
      <span class="flex min-w-0 items-center gap-3">
        <UiAvatar :name="assistant.fullName" size="md" />
        <span class="min-w-0">
          <span class="block truncate">{{ assistant.fullName }}</span>
          <span class="block truncate text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
            {{ assistant.email }}
          </span>
        </span>
      </span>
    </template>

    <div v-if="assistant" class="grid min-h-[360px] gap-6">
      <section class="grid gap-4">
        <h3 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
          Salary configuration
        </h3>
        <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,160px)_auto] sm:items-end">
          <UiSelect
            v-model="form.salaryMethod"
            :items="salaryMethodItems"
            label="Method"
          />
          <UiInput v-model="form.salaryRate" type="number" label="Rate" />
          <UiButton
            :loading="updateSalary.isPending.value"
            :disabled="updateSalary.isPending.value"
            @click="saveSalary"
          >
            Save salary settings
          </UiButton>
        </div>
      </section>

      <section class="grid gap-4 border-t border-[var(--st-border)] pt-6">
        <h3 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
          Salary summary
        </h3>
        <div v-if="salary" class="grid gap-4">
          <div class="grid gap-3 sm:grid-cols-3">
            <UiMetricCard
              label="Total"
              :value="formatNumber(salary.totalAmount)"
              :hint="methodLabel[salary.method]"
            />
            <UiMetricCard label="Sessions" :value="salary.totalSessions" />
            <UiMetricCard label="Hours" :value="salary.totalHours" />
          </div>
          <UiTable :empty="!salary.byClass.length" caption="Assistant salary by class">
            <thead>
              <tr class="border-b border-[var(--st-border)] text-sm font-semibold text-[var(--st-muted)]">
                <th class="px-4 py-3 text-left">Class</th>
                <th class="px-4 py-3 text-right">Sessions</th>
                <th class="px-4 py-3 text-right">Hours</th>
                <th class="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in salary.byClass" :key="c.classId" class="border-b border-slate-100 last:border-b-0">
                <td class="min-w-48 px-4 py-3 font-normal text-[var(--st-text)]">{{ c.className }}</td>
                <td class="px-4 py-3 text-right">{{ c.sessionCount }}</td>
                <td class="px-4 py-3 text-right">{{ c.hours }}</td>
                <td class="px-4 py-3 text-right font-semibold">{{ formatNumber(c.amount) }}</td>
              </tr>
            </tbody>
            <template #empty>No assigned sessions.</template>
          </UiTable>
        </div>
        <UiSkeleton v-else-if="isSalaryLoading" variant="table" :rows="3" :columns="4" />
      </section>

      <section class="grid gap-3 border-t border-[var(--st-border)] pt-6">
        <h3 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
          Assigned classes
        </h3>
        <div v-if="assistant.classAssignments?.length" class="flex flex-wrap gap-2">
          <UiBadge v-for="a in assistant.classAssignments" :key="a.class.id" tone="primary" size="md">
            {{ a.class.name }}
          </UiBadge>
        </div>
        <UiEmptyState
          v-else
          icon="mdi-account-group-outline"
          heading="No class assignments yet"
          body="Assign this assistant from a class."
        />
      </section>
    </div>
    <UiSkeleton v-else-if="modelValue && assistantId && isAssistantLoading" variant="detail" :rows="5" />
  </UiDialog>
</template>
