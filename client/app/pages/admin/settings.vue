<script setup lang="ts">
import { useAdminSettings, useSettingsMutation, useFaviconUpload, useTestEmail } from '~/composables/useAdmin';

const { data } = useAdminSettings();
const updateSettings = useSettingsMutation();
const faviconUpload = useFaviconUpload();
const testEmail = useTestEmail();
const config = useRuntimeConfig();

const faviconFile = ref<File | null>(null);
const faviconVersion = ref(0); // cache-buster after upload
const faviconUrl = computed(() =>
  data.value?.faviconKey
    ? `${config.public.apiBase}/settings/favicon?v=${faviconVersion.value}`
    : null,
);

async function uploadFavicon() {
  if (!faviconFile.value) return;
  await faviconUpload.mutateAsync(faviconFile.value);
  faviconFile.value = null;
  faviconVersion.value++;
}

const saved = ref(false);
const error = ref<string | null>(null);
const form = reactive({
  platformName: '',
  supportEmail: '',
  allowRegistration: true,
  defaultTimezone: 'Asia/Ho_Chi_Minh',
  // SEO
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  // operational
  maintenanceMode: false,
  storageDriver: 'local',
  healthRefreshSeconds: 300,
  // integrations
  emailFrom: '',
  resendApiKey: '',
  r2AccountId: '',
  r2AccessKeyId: '',
  r2SecretAccessKey: '',
  r2Bucket: '',
  r2PublicUrl: '',
  // announcement banner
  announcement: '',
  announcementActive: false,
});

const timezones = (() => {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
    if (fn) return fn('timeZone');
  } catch {
    /* ignore */
  }
  return ['UTC', 'Asia/Ho_Chi_Minh', 'Asia/Tokyo', 'America/New_York', 'Europe/London'];
})();

watch(
  data,
  (s) => {
    if (!s) return;
    form.platformName = s.platformName;
    form.supportEmail = s.supportEmail ?? '';
    form.allowRegistration = s.allowRegistration;
    form.defaultTimezone = s.defaultTimezone;
    form.seoTitle = s.seoTitle ?? '';
    form.seoDescription = s.seoDescription ?? '';
    form.seoKeywords = s.seoKeywords ?? '';
    form.maintenanceMode = s.maintenanceMode ?? false;
    form.storageDriver = s.storageDriver ?? 'local';
    form.healthRefreshSeconds = s.healthRefreshSeconds ?? 300;
    form.emailFrom = s.emailFrom ?? '';
    form.resendApiKey = s.resendApiKey ?? '';
    form.r2AccountId = s.r2AccountId ?? '';
    form.r2AccessKeyId = s.r2AccessKeyId ?? '';
    form.r2SecretAccessKey = s.r2SecretAccessKey ?? '';
    form.r2Bucket = s.r2Bucket ?? '';
    form.r2PublicUrl = s.r2PublicUrl ?? '';
    form.announcement = s.announcement ?? '';
    form.announcementActive = s.announcementActive ?? false;
  },
  { immediate: true },
);

// ---- Test email ----
const testTo = ref('');
const testMsg = ref<string | null>(null);
const testErr = ref<string | null>(null);
async function sendTestEmail() {
  testMsg.value = null;
  testErr.value = null;
  try {
    const res = await testEmail.mutateAsync(testTo.value || undefined);
    testMsg.value = `Đã gửi email thử tới ${res.to}.`;
  } catch (e) {
    testErr.value = extractApiError(e);
  }
}

async function save() {
  error.value = null;
  saved.value = false;
  try {
    await updateSettings.mutateAsync({ ...form });
    saved.value = true;
  } catch (e) {
    error.value = extractApiError(e);
  }
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">{{ $t('nav.settings') }}</h1>
    <p class="text-medium-emphasis mb-6">Cấu hình nền tảng & tích hợp dịch vụ.</p>

    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
      {{ error }}
    </v-alert>
    <v-alert v-if="saved" type="success" variant="tonal" density="compact" class="mb-4">
      Đã lưu cài đặt.
    </v-alert>

    <v-row>
      <!-- General -->
      <v-col cols="12" md="6">
        <v-card class="pa-5 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Chung</h3>
          <v-text-field v-model="form.platformName" label="Tên nền tảng" />
          <v-text-field v-model="form.supportEmail" label="Email hỗ trợ" type="email" />
          <v-autocomplete
            v-model="form.defaultTimezone"
            :items="timezones"
            label="Múi giờ mặc định"
            prepend-inner-icon="mdi-earth"
          />
          <v-switch
            v-model="form.allowRegistration"
            color="primary"
            label="Cho phép đăng ký tài khoản mới"
            hide-details
            class="mb-4"
          />

          <v-divider class="mb-4" />
          <div class="text-caption text-medium-emphasis mb-2">Favicon</div>
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar v-if="faviconUrl" rounded="lg" size="40" class="border">
              <v-img :src="faviconUrl" />
            </v-avatar>
            <v-icon v-else size="40" class="text-medium-emphasis">mdi-image-outline</v-icon>
            <v-file-input
              v-model="faviconFile"
              accept="image/png,image/x-icon,image/svg+xml,image/jpeg"
              label="Chọn ảnh favicon"
              density="compact"
              hide-details
              class="flex-grow-1"
            />
            <v-btn
              color="primary"
              :loading="faviconUpload.isPending.value"
              :disabled="!faviconFile"
              @click="uploadFavicon"
            >
              Tải lên
            </v-btn>
          </div>

          <v-divider class="mb-4" />
          <div class="text-caption text-medium-emphasis mb-2">SEO</div>
          <v-text-field v-model="form.seoTitle" label="SEO Title" />
          <v-textarea v-model="form.seoDescription" label="SEO Description" rows="2" />
          <v-text-field
            v-model="form.seoKeywords"
            label="SEO Keywords"
            hint="Cách nhau bằng dấu phẩy"
            persistent-hint
          />
        </v-card>

        <!-- Operational -->
        <v-card class="pa-5 mt-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Vận hành</h3>
          <v-switch
            v-model="form.maintenanceMode"
            color="warning"
            :label="`Chế độ bảo trì${form.maintenanceMode ? ' (đang BẬT)' : ''}`"
            hint="Khi bật, người dùng thường thấy trang bảo trì; Super Admin vẫn vào được."
            persistent-hint
            class="mb-2"
          />
          <v-select
            v-model="form.storageDriver"
            :items="[
              { value: 'local', title: 'Local (thư mục uploads)' },
              { value: 'r2', title: 'Cloudflare R2 (S3)' },
            ]"
            label="Nơi lưu tệp"
            hint="Chọn Local để dùng tạm khi R2/S3 gặp sự cố."
            persistent-hint
          />
          <v-text-field
            v-model.number="form.healthRefreshSeconds"
            type="number"
            label="Chu kỳ tự cập nhật trang Health (giây)"
            hint="Khuyến nghị ≥ 300s để tiết kiệm tài nguyên."
            persistent-hint
            class="mt-2"
          />
        </v-card>

        <!-- Announcement banner -->
        <v-card class="pa-5 mt-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-1">Thông báo toàn hệ thống</h3>
          <p class="text-caption text-medium-emphasis mb-3">
            Hiển thị một dải băng thông báo trên đầu trang cho tất cả người dùng.
          </p>
          <v-switch
            v-model="form.announcementActive"
            color="primary"
            :label="`Hiển thị thông báo${form.announcementActive ? ' (đang BẬT)' : ''}`"
            hide-details
            class="mb-2"
          />
          <v-textarea
            v-model="form.announcement"
            label="Nội dung thông báo"
            rows="2"
            counter
            placeholder="VD: Hệ thống sẽ bảo trì lúc 22:00 hôm nay."
          />
        </v-card>

        <!-- Email integration -->
        <v-card class="pa-5">
          <h3 class="text-subtitle-1 font-weight-bold mb-1">Email (Resend)</h3>
          <p class="text-caption text-medium-emphasis mb-3">
            Dùng để gửi nhắc lịch, xác minh email, nhắc học phí.
          </p>
          <v-text-field v-model="form.emailFrom" label="Email gửi đi (From)" />
          <v-text-field
            v-model="form.resendApiKey"
            label="Resend API Key"
            type="password"
            autocomplete="off"
          />

          <v-divider class="my-3" />
          <div class="text-caption text-medium-emphasis mb-2">
            Gửi email thử để kiểm tra cấu hình Resend (lưu cài đặt trước khi thử).
          </div>
          <v-alert v-if="testMsg" type="success" variant="tonal" density="compact" class="mb-2">
            {{ testMsg }}
          </v-alert>
          <v-alert v-if="testErr" type="error" variant="tonal" density="compact" class="mb-2">
            {{ testErr }}
          </v-alert>
          <div class="d-flex ga-2 align-center">
            <v-text-field
              v-model="testTo"
              label="Gửi tới (mặc định: email hỗ trợ)"
              type="email"
              density="compact"
              hide-details
              class="flex-grow-1"
            />
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-email-fast"
              :loading="testEmail.isPending.value"
              @click="sendTestEmail"
            >
              Gửi thử
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- Storage (R2 / S3) -->
      <v-col cols="12" md="6">
        <v-card class="pa-5 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-1">Lưu trữ tệp (Cloudflare R2)</h3>
          <p class="text-caption text-medium-emphasis mb-3">
            Lưu tài liệu PDF/MP3. Chưa cấu hình thì hệ thống dùng ổ đĩa cục bộ.
          </p>
          <v-text-field v-model="form.r2AccountId" label="R2 Account ID" />
          <v-text-field v-model="form.r2AccessKeyId" label="R2 Access Key ID" autocomplete="off" />
          <v-text-field
            v-model="form.r2SecretAccessKey"
            label="R2 Secret Access Key"
            type="password"
            autocomplete="off"
          />
          <v-text-field v-model="form.r2Bucket" label="R2 Bucket" />
          <v-text-field v-model="form.r2PublicUrl" label="R2 Public URL" />
        </v-card>

        <v-alert type="info" variant="tonal" density="comfortable">
          Các khóa tích hợp được lưu an toàn (chỉ Super Admin xem được) và sẽ được
          các dịch vụ áp dụng ở bước sau. Hạ tầng (PostgreSQL/Redis) cấu hình qua
          biến môi trường — xem trạng thái ở trang <b>Health</b>.
        </v-alert>
      </v-col>
    </v-row>

    <div class="d-flex justify-end mt-2">
      <v-btn color="primary" size="large" :loading="updateSettings.isPending.value" @click="save">
        Lưu cài đặt
      </v-btn>
    </div>
  </div>
</template>
