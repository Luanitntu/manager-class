<script setup lang="ts">
import { useClasses } from '~/composables/useClasses';
import {
  PAYMENT_METHODS,
  type Tuition,
  usePaymentMutations,
  useTuitionDetail,
  useTuitions,
} from '~/composables/usePayments';
import { useStudents } from '~/composables/useStudents';

const auth = useAuthStore();
const canManage = computed(() => auth.role === 'TEACHER');

const search = ref('');
const page = ref(1);
const limit = ref(10);
watch([search, limit], () => (page.value = 1));
const { data, isLoading } = useTuitions({ page }, limit);
const meta = computed(() => data.value?.meta);
const { createTuition, recordPayment, sendReminder } = usePaymentMutations();
const reminderSent = ref(false);
const remindingTuitionId = ref<string | null>(null);
const { data: classesData } = useClasses(undefined, undefined, 100);
const { data: studentsData } = useStudents(undefined, undefined, undefined, 100);

const tuitions = computed(() => data.value?.data ?? []);
const filteredTuitions = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return tuitions.value;
  return tuitions.value.filter((tuition) =>
    [
      tuition.student?.fullName,
      tuition.student?.email,
      tuition.class?.name,
      statusLabel(tuition.status),
    ].some((value) => value?.toLowerCase().includes(keyword)),
  );
});
const classes = computed(() => classesData.value?.data ?? []);
const students = computed(() => studentsData.value?.data ?? []);

const totalExpected = computed(() =>
  tuitions.value.reduce((sum, tuition) => sum + numericAmount(tuition.totalAmount), 0),
);
const totalPaid = computed(() =>
  tuitions.value.reduce((sum, tuition) => sum + numericAmount(tuition.paidAmount), 0),
);
const totalRemaining = computed(() => Math.max(0, totalExpected.value - totalPaid.value));

async function remind(id = selectedId.value) {
  if (sendReminder.isPending.value || remindingTuitionId.value) return;
  if (!id) return;
  remindingTuitionId.value = id;
  try {
    await sendReminder.mutateAsync(id);
    reminderSent.value = true;
    setTimeout(() => (reminderSent.value = false), 3000);
  } finally {
    remindingTuitionId.value = null;
  }
}

function numericAmount(value: string | number) {
  return Number(value) || 0;
}

function money(value: string | number) {
  return numericAmount(value).toLocaleString('vi-VN');
}

function moneyDong(value: string | number) {
  return `${money(value)}đ`;
}

function remainingAmount(tuition: Tuition) {
  return Math.max(0, numericAmount(tuition.totalAmount) - numericAmount(tuition.paidAmount));
}

function statusLabel(status: Tuition['status']) {
  return {
    PAID: 'Đã thu',
    PARTIALLY_PAID: 'Thu một phần',
    PENDING: 'Chưa thu',
    OVERDUE: 'Quá hạn',
  }[status];
}

function statusClass(status: Tuition['status']) {
  return {
    PAID: 'is-paid',
    PARTIALLY_PAID: 'is-partial',
    PENDING: 'is-pending',
    OVERDUE: 'is-overdue',
  }[status];
}

function dueDateLabel(tuition: Tuition) {
  if (!tuition.dueDate) return 'Chưa đặt hạn';
  return new Date(tuition.dueDate).toLocaleDateString('vi-VN');
}

// --- Create tuition ---
const createOpen = ref(false);
const error = ref<string | null>(null);
const form = reactive({ studentId: '', classId: '', totalAmount: 0, dueDate: '', notes: '' });

async function create() {
  if (createTuition.isPending.value) return;
  error.value = null;
  try {
    await createTuition.mutateAsync({
      studentId: form.studentId,
      classId: form.classId,
      totalAmount: Number(form.totalAmount),
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
    });
    createOpen.value = false;
    Object.assign(form, { studentId: '', classId: '', totalAmount: 0, dueDate: '', notes: '' });
  } catch (e) {
    error.value = extractApiError(e) ?? 'Không thể tạo hóa đơn';
  }
}

// --- Detail / record payment ---
const detailOpen = ref(false);
const selectedId = ref<string | null>(null);
const { data: detail } = useTuitionDetail(selectedId);
const payForm = reactive<{
  amount: number;
  method: (typeof PAYMENT_METHODS)[number];
  note: string;
}>({ amount: 0, method: 'cash', note: '' });
const payError = ref<string | null>(null);

function openDetail(tuition: Tuition) {
  selectedId.value = tuition.id;
  Object.assign(payForm, { amount: 0, method: 'cash', note: '' });
  payError.value = null;
  reminderSent.value = false;
  detailOpen.value = true;
}

async function pay() {
  if (recordPayment.isPending.value) return;
  if (!selectedId.value) return;
  payError.value = null;
  try {
    await recordPayment.mutateAsync({
      id: selectedId.value,
      body: { amount: Number(payForm.amount), method: payForm.method, note: payForm.note || undefined },
    });
    payForm.amount = 0;
    payForm.note = '';
  } catch (e) {
    payError.value = extractApiError(e) ?? 'Không thể ghi nhận thanh toán';
  }
}
</script>

<template>
  <div class="teacher-payments">
    <header class="teacher-payments__header">
      <div>
        <h1>Học phí</h1>
        <p>Quản lý hóa đơn và tình trạng đóng học phí</p>
      </div>

      <div class="teacher-payments__actions">
        <v-btn class="teacher-payments__export" variant="flat">
          <v-icon start size="16">mdi-download-outline</v-icon>
          Xuất Excel
        </v-btn>
        <v-btn v-if="canManage" class="teacher-payments__create" color="primary" @click="createOpen = true">
          <v-icon start size="18">mdi-plus</v-icon>
          Tạo hoá đơn
        </v-btn>
      </div>
    </header>

    <AppSkeleton v-if="isLoading && !tuitions.length" variant="stats" :cards="3" />

    <section v-else class="teacher-payments__stats" aria-label="Tổng quan học phí">
      <article class="teacher-payments__stat is-total">
        <span><v-icon size="24">mdi-cash-multiple</v-icon></span>
        <div>
          <small>Tổng dự thu</small>
          <strong>{{ moneyDong(totalExpected) }}</strong>
        </div>
      </article>
      <article class="teacher-payments__stat is-paid">
        <span><v-icon size="24">mdi-cash-check</v-icon></span>
        <div>
          <small>Đã thu</small>
          <strong>{{ moneyDong(totalPaid) }}</strong>
        </div>
      </article>
      <article class="teacher-payments__stat is-debt">
        <span><v-icon size="24">mdi-cash-clock</v-icon></span>
        <div>
          <small>Còn nợ / Quá hạn</small>
          <strong>{{ moneyDong(totalRemaining) }}</strong>
        </div>
      </article>
    </section>

    <section class="teacher-payments__panel">
      <div class="teacher-payments__toolbar">
        <label class="teacher-payments__search" for="payment-search">
          <v-icon size="16">mdi-magnify</v-icon>
          <input
            id="payment-search"
            v-model="search"
            autocomplete="off"
            placeholder="Tìm kiếm hoá đơn, học viên..."
            type="search"
          >
        </label>

        <v-btn class="teacher-payments__filter" icon="mdi-filter-variant" size="small" variant="flat" />
      </div>

      <div class="teacher-payments__table-wrap">
        <AppSkeleton v-if="isLoading && !filteredTuitions.length" variant="table" :rows="5" :columns="6" />

        <table v-else-if="filteredTuitions.length" class="teacher-payments__table">
          <thead>
            <tr>
              <th>Học viên & Lớp</th>
              <th>Tổng tiền (VNĐ)</th>
              <th>Đã thu (VNĐ)</th>
              <th>Còn lại (VNĐ)</th>
              <th>Trạng thái</th>
              <th class="is-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tuition in filteredTuitions" :key="tuition.id" @click="openDetail(tuition)">
              <td>
                <strong>{{ tuition.student?.fullName ?? 'Không rõ học viên' }}</strong>
                <small>{{ tuition.class?.name ?? 'Chưa gán lớp' }}</small>
              </td>
              <td class="is-money">{{ money(tuition.totalAmount) }}</td>
              <td class="is-money is-paid">{{ money(tuition.paidAmount) }}</td>
              <td class="is-money" :class="{ 'is-zero': remainingAmount(tuition) === 0 }">
                {{ money(remainingAmount(tuition)) }}
              </td>
              <td>
                <span :class="['teacher-payments__status', statusClass(tuition.status)]">
                  {{ statusLabel(tuition.status) }}
                </span>
                <small class="teacher-payments__due">Hạn: {{ dueDateLabel(tuition) }}</small>
              </td>
              <td class="is-right">
                <div class="teacher-payments__row-actions">
                  <v-btn
                    v-if="canManage && remainingAmount(tuition) > 0"
                    :disabled="!!remindingTuitionId"
                    :loading="remindingTuitionId === tuition.id"
                    class="teacher-payments__remind"
                    icon="mdi-email-fast-outline"
                    size="x-small"
                    variant="text"
                    @click.stop="remind(tuition.id)"
                  />
                  <v-btn
                    class="teacher-payments__menu"
                    icon="mdi-dots-horizontal"
                    size="x-small"
                    variant="text"
                    @click.stop="openDetail(tuition)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="teacher-payments__empty">
          <v-icon size="38">mdi-cash-register</v-icon>
          <strong>Chưa có hóa đơn học phí</strong>
          <span>Tạo hóa đơn đầu tiên để theo dõi thanh toán của học viên.</span>
        </div>
      </div>
    </section>

    <TablePager v-if="meta" v-model:page="page" v-model:limit="limit" :meta="meta" />

    <!-- Create tuition -->
    <v-dialog v-model="createOpen" max-width="480">
      <v-card class="teacher-payments__dialog">
        <v-card-title>Tạo hóa đơn</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-select v-model="form.studentId" :items="students" item-title="fullName" item-value="id" label="Học viên" />
          <v-select v-model="form.classId" :items="classes" item-title="name" item-value="id" label="Lớp" />
          <v-text-field v-model="form.totalAmount" type="number" label="Tổng tiền" />
          <v-text-field v-model="form.dueDate" type="date" label="Hạn đóng (tuỳ chọn)" />
          <v-textarea v-model="form.notes" label="Ghi chú" rows="2" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createOpen = false">Hủy</v-btn>
          <v-btn
            color="primary"
            :loading="createTuition.isPending.value"
            :disabled="!form.studentId || !form.classId || form.totalAmount <= 0"
            @click="create"
          >
            Tạo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Detail + record payment -->
    <v-dialog v-model="detailOpen" max-width="680" scrollable>
      <v-card v-if="detail" class="teacher-payments__dialog teacher-payments__detail">
        <v-card-title class="teacher-payments__detail-title">
          <span>{{ detail.student?.fullName }} - {{ detail.class?.name }}</span>
          <span :class="['teacher-payments__status', statusClass(detail.status)]">
            {{ statusLabel(detail.status) }}
          </span>
        </v-card-title>
        <v-card-text>
          <div class="teacher-payments__detail-stats">
            <div>
              <strong>{{ moneyDong(detail.totalAmount) }}</strong>
              <span>Tổng tiền</span>
            </div>
            <div>
              <strong>{{ moneyDong(detail.paidAmount) }}</strong>
              <span>Đã thu</span>
            </div>
            <div>
              <strong>{{ moneyDong(remainingAmount(detail)) }}</strong>
              <span>Còn lại</span>
            </div>
          </div>

          <template v-if="canManage && detail.status !== 'PAID'">
            <v-alert v-if="payError" type="error" variant="tonal" density="compact" class="mb-3">
              {{ payError }}
            </v-alert>
            <div class="teacher-payments__pay-form">
              <v-text-field v-model="payForm.amount" type="number" label="Số tiền" density="compact" hide-details />
              <v-select
                v-model="payForm.method"
                :items="PAYMENT_METHODS"
                label="Phương thức"
                density="compact"
                hide-details
              />
              <v-text-field v-model="payForm.note" label="Ghi chú" density="compact" hide-details />
              <v-btn color="primary" :loading="recordPayment.isPending.value" :disabled="payForm.amount <= 0" @click="pay">
                Ghi nhận
              </v-btn>
            </div>
          </template>

          <h3>Lịch sử thanh toán</h3>
          <div class="teacher-payments__history">
            <table v-if="detail.payments.length">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Biên lai</th>
                  <th>Phương thức</th>
                  <th class="is-right">Số tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in detail.payments" :key="payment.id">
                  <td>{{ new Date(payment.paidAt).toLocaleDateString('vi-VN') }}</td>
                  <td>{{ payment.receiptNumber }}</td>
                  <td>{{ payment.method || '-' }}</td>
                  <td class="is-right">{{ moneyDong(payment.amount) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="teacher-payments__history-empty">Chưa có lịch sử thanh toán.</div>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn
            v-if="canManage && detail.status !== 'PAID'"
            variant="text"
            color="warning"
            prepend-icon="mdi-email-fast"
            :disabled="!!remindingTuitionId"
            :loading="remindingTuitionId === selectedId"
            @click="remind()"
          >
            {{ reminderSent ? 'Đã gửi nhắc nhở' : 'Gửi nhắc nhở' }}
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="detailOpen = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
      <AppSkeleton v-else-if="selectedId" variant="detail" :rows="5" />
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.teacher-payments {
  --payments-blue: #0071f9;
  --payments-text: #1e293b;
  --payments-muted: #64748b;
  --payments-border: #e2e8f0;

  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  max-width: 1152px;
  padding-bottom: 24px;
  width: 100%;

  &__header {
    align-items: center;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 24px;

    h1 {
      color: var(--payments-text);
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.33;
      margin: 0;
    }

    p {
      color: var(--payments-muted);
      font-size: 14px;
      font-weight: 500;
      margin: 4px 0 0;
    }
  }

  &__actions {
    align-items: center;
    display: flex;
    gap: 12px;
  }

  &__export,
  &__create {
    border-radius: 8px !important;
    box-shadow: 0 1px 2px rgb(15 23 42 / 8%) !important;
    font-size: 14px;
    font-weight: 800;
    height: 38px !important;
    letter-spacing: 0;
    padding: 0 16px !important;
  }

  &__export {
    background: #fff !important;
    border: 1px solid var(--payments-border);
    color: #334155 !important;
  }

  &__create {
    background: var(--payments-blue) !important;
    color: #fff !important;
  }

  &__stats {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 24px;
  }

  &__stat {
    align-items: center;
    background: #fff;
    border: 1px solid var(--payments-border);
    border-radius: 12px;
    box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
    display: flex;
    gap: 16px;
    min-height: 92px;
    padding: 20px;

    > span {
      align-items: center;
      border-radius: 50%;
      display: inline-flex;
      flex: 0 0 48px;
      height: 48px;
      justify-content: center;
      width: 48px;
    }

    small {
      color: var(--payments-muted);
      display: block;
      font-size: 14px;
      font-weight: 800;
      margin-bottom: 4px;
    }

    strong {
      color: var(--payments-text);
      display: block;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.1;
      white-space: nowrap;
    }

    &.is-total > span {
      background: #eff6ff;
      color: var(--payments-blue);
    }

    &.is-paid > span {
      background: #ecfdf5;
      color: #10b981;
    }

    &.is-debt {
      > span {
        background: #fef2f2;
        color: #ef4444;
      }

      strong {
        color: #dc2626;
      }
    }
  }

  &__panel {
    background: #fff;
    border: 1px solid var(--payments-border);
    border-radius: 12px;
    box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  &__toolbar {
    align-items: center;
    background: #f8fafc;
    border-bottom: 1px solid var(--payments-border);
    display: flex;
    gap: 16px;
    justify-content: space-between;
    padding: 16px;
  }

  &__search {
    align-items: center;
    background: #fff;
    border: 1px solid var(--payments-border);
    border-radius: 8px;
    color: #94a3b8;
    display: flex;
    flex: 1 1 448px;
    gap: 8px;
    height: 38px;
    max-width: 448px;
    padding: 0 12px;
    transition: border-color 180ms ease, box-shadow 180ms ease;

    &:focus-within {
      border-color: var(--payments-blue);
      box-shadow: 0 0 0 3px rgb(0 113 249 / 12%);
    }

    input {
      color: #334155;
      font-size: 14px;
      font-weight: 500;
      min-width: 0;
      outline: 0;
      width: 100%;

      &::placeholder {
        color: #94a3b8;
      }
    }
  }

  &__filter {
    background: #fff !important;
    border: 1px solid var(--payments-border);
    border-radius: 8px !important;
    box-shadow: none !important;
    color: var(--payments-muted) !important;
  }

  &__table-wrap {
    overflow-x: auto;
  }

  &__table {
    border-collapse: collapse;
    font-size: 14px;
    min-width: 980px;
    text-align: left;
    width: 100%;

    thead {
      background: #fff;
      border-bottom: 1px solid var(--payments-border);
      color: var(--payments-muted);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    th,
    td {
      padding: 16px 24px;
      vertical-align: middle;
      white-space: nowrap;
    }

    tbody tr {
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background 180ms ease;

      &:hover {
        background: #f8fafc;
      }

      &:last-child {
        border-bottom: 0;
      }
    }

    td > strong {
      color: var(--payments-text);
      display: block;
      font-weight: 800;
      line-height: 1.2;
    }

    td > small {
      color: var(--payments-blue);
      display: block;
      font-size: 12px;
      font-weight: 700;
      margin-top: 3px;
    }

    .is-right {
      text-align: right;
    }

    .is-money {
      color: #dc2626;
      font-weight: 800;

      &.is-paid {
        color: #059669;
      }

      &.is-zero {
        color: #334155;
      }
    }
  }

  &__status {
    border-radius: 999px;
    display: inline-flex;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;
    padding: 7px 10px;

    &.is-paid {
      background: #d1fae5;
      color: #047857;
    }

    &.is-partial {
      background: #fef3c7;
      color: #b45309;
    }

    &.is-pending {
      background: #f1f5f9;
      color: #334155;
    }

    &.is-overdue {
      background: #fee2e2;
      color: #b91c1c;
    }
  }

  &__due {
    color: #94a3b8;
    display: block;
    font-size: 10px;
    font-weight: 700;
    margin-top: 5px;
  }

  &__row-actions {
    align-items: center;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  &__remind {
    color: #f97316 !important;

    &:hover {
      background: #fff7ed !important;
    }
  }

  &__menu {
    color: #94a3b8 !important;

    &:hover {
      background: #eff6ff !important;
      color: var(--payments-blue) !important;
    }
  }

  &__empty {
    align-items: center;
    color: var(--payments-muted);
    display: grid;
    gap: 10px;
    justify-items: center;
    min-height: 320px;
    padding: 40px;
    text-align: center;

    strong {
      color: var(--payments-text);
      font-size: 18px;
      font-weight: 800;
    }
  }

  &__dialog {
    border-radius: 12px !important;
  }

  &__detail-title {
    align-items: center;
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }

  &__detail-stats {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 20px;

    div {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 10px;
      padding: 14px;
    }

    strong {
      color: var(--payments-text);
      display: block;
      font-size: 18px;
      font-weight: 800;
      line-height: 1.2;
    }

    span {
      color: var(--payments-muted);
      display: block;
      font-size: 12px;
      font-weight: 700;
      margin-top: 4px;
    }
  }

  &__pay-form {
    align-items: center;
    display: grid;
    gap: 10px;
    grid-template-columns: 130px 130px minmax(0, 1fr) auto;
    margin-bottom: 20px;
  }

  h3 {
    color: var(--payments-text);
    font-size: 15px;
    font-weight: 800;
    margin: 0 0 10px;
  }

  &__history {
    border: 1px solid var(--payments-border);
    border-radius: 10px;
    overflow: hidden;

    table {
      border-collapse: collapse;
      font-size: 13px;
      width: 100%;
    }

    th,
    td {
      border-bottom: 1px solid #f1f5f9;
      padding: 10px 12px;
      text-align: left;
    }

    th {
      background: #f8fafc;
      color: var(--payments-muted);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }

    tr:last-child td {
      border-bottom: 0;
    }

    .is-right {
      text-align: right;
    }
  }

  &__history-empty {
    color: var(--payments-muted);
    font-size: 14px;
    padding: 20px;
    text-align: center;
  }
}

@media (max-width: 900px) {
  .teacher-payments {
    &__stats {
      grid-template-columns: 1fr;
    }

    &__pay-form {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 720px) {
  .teacher-payments {
    &__header {
      align-items: stretch;
      flex-direction: column;
    }

    &__actions {
      align-items: stretch;
      flex-direction: column;
    }

    &__export,
    &__create {
      width: 100%;
    }

    &__toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    &__search {
      flex-basis: auto;
      max-width: none;
      width: 100%;
    }

    &__detail-title,
    &__detail-stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
