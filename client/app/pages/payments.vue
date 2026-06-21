<script setup lang="ts">
import {
  useTuitions,
  useTuitionDetail,
  usePaymentMutations,
  statusColor,
  type Tuition,
} from '~/composables/usePayments';
import { useClasses } from '~/composables/useClasses';
import { useStudents } from '~/composables/useStudents';
import { useSnackbar } from '~/composables/useSnackbar';

const auth = useAuthStore();
const canManage = computed(() => auth.role === 'TEACHER');
const { success: showSuccess, error: showError } = useSnackbar();

const { data, isLoading, error, refetch } = useTuitions();
const { createTuition, recordPayment, sendReminder } = usePaymentMutations();
const reminderSent = ref(false);

async function remind() {
  if (!selectedId.value) return;
  try {
    await sendReminder.mutateAsync(selectedId.value);
    showSuccess('Reminder sent successfully.');
    reminderSent.value = true;
    setTimeout(() => (reminderSent.value = false), 3000);
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not send reminder');
  }
}
const { data: classesData } = useClasses();
const { data: studentsData } = useStudents();

const tuitions = computed(() => data.value?.data ?? []);
const classes = computed(() => classesData.value?.data ?? []);
const students = computed(() => studentsData.value?.data ?? []);

const rules = {
  required: (v: unknown) => !!v || 'Field is required',
  positiveNumber: (v: unknown) => Number(v) > 0 || 'Amount must be greater than 0',
};

function money(n: string | number) {
  return Number(n).toLocaleString();
}

// --- Create tuition ---
const createOpen = ref(false);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const form = reactive({ studentId: '', classId: '', totalAmount: 0, dueDate: '', notes: '' });

async function create() {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  try {
    await createTuition.mutateAsync({
      studentId: form.studentId,
      classId: form.classId,
      totalAmount: Number(form.totalAmount),
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
    });
    showSuccess('Tuition created successfully.');
    createOpen.value = false;
    Object.assign(form, { studentId: '', classId: '', totalAmount: 0, dueDate: '', notes: '' });
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not create tuition');
  }
}

// --- Detail / record payment ---
const detailOpen = ref(false);
const selectedId = ref<string | null>(null);
const { data: detail } = useTuitionDetail(selectedId);
const payFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const payForm = reactive({ amount: 0, method: 'cash', note: '' });

function openDetail(t: Tuition) {
  selectedId.value = t.id;
  Object.assign(payForm, { amount: 0, method: 'cash', note: '' });
  detailOpen.value = true;
}

async function pay() {
  if (!selectedId.value) return;
  if (!payFormRef.value) return;
  const { valid } = await payFormRef.value.validate();
  if (!valid) return;
  try {
    await recordPayment.mutateAsync({
      id: selectedId.value,
      body: { amount: Number(payForm.amount), method: payForm.method, note: payForm.note || undefined },
    });
    showSuccess('Payment recorded successfully.');
    payForm.amount = 0;
    payForm.note = '';
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not record payment');
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Payments"
      subtitle="Tuition tracking and receipts."
      icon="mdi-cash-register"
    >
      <template #actions>
        <v-btn v-if="canManage" color="primary" prepend-icon="mdi-plus" @click="createOpen = true">
          New Tuition
        </v-btn>
      </template>
    </AppPageHeader>

    <AppState
      v-if="isLoading"
      variant="loading"
      title="Loading payments"
      body="Fetching tuition tracking records..."
    />

    <AppState
      v-else-if="error"
      variant="error"
      title="Could not load payments"
      body="Failed to retrieve tuition records. Please check your network connection."
      action-label="Try again"
      @action="refetch()"
    />

    <template v-else>
      <v-card v-if="tuitions.length" class="st-card-soft">
        <v-table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th class="text-right">Total</th>
              <th class="text-right">Paid</th>
              <th class="text-right">Remaining</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tuitions" :key="t.id">
              <td>{{ t.student?.fullName }}</td>
              <td>{{ t.class?.name }}</td>
              <td class="text-right">{{ money(t.totalAmount) }}</td>
              <td class="text-right">{{ money(t.paidAmount) }}</td>
              <td class="text-right">{{ money(Number(t.totalAmount) - Number(t.paidAmount)) }}</td>
              <td>
                <v-chip :color="statusColor[t.status]" size="small" variant="tonal">
                  {{ t.status.replace('_', ' ') }}
                </v-chip>
              </td>
              <td class="text-right">
                <v-btn size="small" variant="text" @click="openDetail(t)">View</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
      <AppState
        v-else
        variant="empty"
        title="No payments yet"
        body="Create your first tuition bill to track student payments."
        :action-label="canManage ? 'New Tuition' : undefined"
        @action="createOpen = true"
      />
    </template>

    <!-- Create tuition -->
    <v-dialog v-model="createOpen" max-width="480">
      <v-card>
        <v-card-title>New tuition</v-card-title>
        <v-form ref="formRef" @submit.prevent="create">
          <v-card-text>
            <v-select
              v-model="form.studentId"
              :items="students"
              item-title="fullName"
              item-value="id"
              label="Student"
              :rules="[rules.required]"
              class="mb-2"
            />
            <v-select
              v-model="form.classId"
              :items="classes"
              item-title="name"
              item-value="id"
              label="Class"
              :rules="[rules.required]"
              class="mb-2"
            />
            <v-text-field
              v-model="form.totalAmount"
              type="number"
              label="Total amount"
              :rules="[rules.required, rules.positiveNumber]"
              class="mb-2"
            />
            <v-text-field v-model="form.dueDate" type="date" label="Due date (optional)" class="mb-2" />
            <v-textarea v-model="form.notes" label="Notes" rows="2" />
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn variant="text" @click="createOpen = false">Cancel</v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="createTuition.isPending.value"
            >
              Create
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Detail + record payment -->
    <v-dialog v-model="detailOpen" max-width="600" scrollable>
      <v-card v-if="detail">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ detail.student?.fullName }} — {{ detail.class?.name }}</span>
          <v-chip :color="statusColor[detail.status]" size="small" variant="tonal">
            {{ detail.status.replace('_', ' ') }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <div class="d-flex ga-6 mb-4">
            <div><div class="text-h6 font-weight-bold">{{ money(detail.totalAmount) }}</div><div class="text-caption text-medium-emphasis">Total</div></div>
            <div><div class="text-h6 font-weight-bold">{{ money(detail.paidAmount) }}</div><div class="text-caption text-medium-emphasis">Paid</div></div>
            <div><div class="text-h6 font-weight-bold">{{ money(Number(detail.totalAmount) - Number(detail.paidAmount)) }}</div><div class="text-caption text-medium-emphasis">Remaining</div></div>
          </div>

          <template v-if="canManage && detail.status !== 'PAID'">
            <v-form ref="payFormRef" @submit.prevent="pay">
              <div class="d-flex ga-2 align-center mb-4">
                <v-text-field
                  v-model="payForm.amount"
                  type="number"
                  label="Amount"
                  density="compact"
                  style="max-width: 140px"
                  :rules="[rules.required, rules.positiveNumber]"
                />
                <v-select
                  v-model="payForm.method"
                  :items="['cash', 'transfer', 'card']"
                  label="Method"
                  density="compact"
                  style="max-width: 130px"
                />
                <v-text-field v-model="payForm.note" label="Note" density="compact" />
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="recordPayment.isPending.value"
                >
                  Record
                </v-btn>
              </div>
            </v-form>
          </template>

          <h3 class="text-subtitle-2 font-weight-bold mb-2">Payment history</h3>
          <v-table density="compact">
            <thead>
              <tr><th>Date</th><th>Receipt</th><th>Method</th><th class="text-right">Amount</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in detail.payments" :key="p.id">
                <td>{{ new Date(p.paidAt).toLocaleDateString() }}</td>
                <td>{{ p.receiptNumber }}</td>
                <td>{{ p.method }}</td>
                <td class="text-right">{{ money(p.amount) }}</td>
              </tr>
              <tr v-if="!detail.payments.length">
                <td colspan="4" class="text-center text-medium-emphasis">No payments yet.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn
            v-if="canManage && detail.status !== 'PAID'"
            variant="text"
            color="warning"
            prepend-icon="mdi-email-fast"
            :loading="sendReminder.isPending.value"
            @click="remind"
          >
            {{ reminderSent ? 'Reminder sent' : 'Send reminder' }}
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="detailOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
