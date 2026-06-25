<script setup lang="ts">
import { useActiveSessions, useProfileMutations, avatarUrl } from '~/composables/useProfile';
import { useBranding, useBrandingMutations, brandLogoUrl } from '~/composables/useBranding';

const auth = useAuthStore();
const { request } = useApi();
const { t } = useI18n();
const isTeacher = computed(() => auth.role === 'TEACHER');

const error = ref<string | null>(null);
const saved = ref(false);
const loading = ref(false);

// Every authenticated user can manage their own password + sessions.
const canManageSecurity = computed(() => true);

const form = reactive({
  fullName: auth.user?.fullName ?? '',
  phone: '',
  timezone: auth.user?.timezone ?? detectBrowserTimezone(),
});

const timezones = (() => {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
      .supportedValuesOf;
    if (fn) return fn('timeZone');
  } catch {
    /* ignore */
  }
  return ['UTC', 'Asia/Ho_Chi_Minh', 'Asia/Tokyo', 'America/New_York', 'Europe/London'];
})();

// ---- Avatar ----
const { uploadAvatar, changePassword, revokeSession } = useProfileMutations();
const avatarVersion = ref(0);
const avatarFile = ref<File | null>(null);
const hasAvatar = computed(() => !!auth.user?.avatarKey || avatarVersion.value > 0);
const avatarSrc = computed(() =>
  auth.user ? avatarUrl(auth.user.id, avatarVersion.value) : '',
);

async function doUploadAvatar() {
  if (!avatarFile.value) return;
  error.value = null;
  try {
    const res = await uploadAvatar.mutateAsync(avatarFile.value);
    if (auth.user) auth.user.avatarKey = res?.data?.avatarKey ?? 'set';
    avatarVersion.value++;
    avatarFile.value = null;
  } catch (e) {
    error.value = extractApiError(e);
  }
}

onMounted(async () => {
  try {
    const profile = await request<{
      fullName: string;
      phone?: string | null;
      timezone?: string | null;
      avatarKey?: string | null;
    }>('/users/me/profile');
    form.fullName = profile.fullName;
    form.phone = profile.phone ?? '';
    form.timezone = profile.timezone ?? detectBrowserTimezone();
    if (auth.user) auth.user.avatarKey = profile.avatarKey ?? null;
  } catch {
    // keep store defaults
  }
});

async function save() {
  error.value = null;
  saved.value = false;
  loading.value = true;
  try {
    await request('/users/me/profile', {
      method: 'PATCH',
      body: {
        fullName: form.fullName,
        phone: form.phone || undefined,
        timezone: form.timezone || undefined,
      },
    });
    if (auth.user) {
      auth.user.fullName = form.fullName;
      auth.user.timezone = form.timezone;
    }
    saved.value = true;
  } catch (e) {
    error.value = extractApiError(e);
  } finally {
    loading.value = false;
  }
}

// ---- Branding (teacher) ----
const { data: branding } = useBranding();
const { update: updateBranding, uploadLogo } = useBrandingMutations();
const brandForm = reactive({ brandName: '', address: '', phone: '' });
const logoFile = ref<File | null>(null);
const logoVersion = ref(0);
const brandSaved = ref(false);
const hasLogo = computed(() => !!branding.value?.logoKey || logoVersion.value > 0);
const logoSrc = computed(() => (auth.user ? brandLogoUrl(auth.user.id, logoVersion.value) : ''));
watch(branding, (b) => {
  if (!b) return;
  brandForm.brandName = b.brandName ?? '';
  brandForm.address = b.address ?? '';
  brandForm.phone = b.phone ?? '';
});
async function saveBranding() {
  brandSaved.value = false;
  error.value = null;
  try {
    await updateBranding.mutateAsync({ ...brandForm });
    brandSaved.value = true;
  } catch (e) {
    error.value = extractApiError(e);
  }
}
async function doUploadLogo() {
  if (!logoFile.value) return;
  error.value = null;
  try {
    await uploadLogo.mutateAsync(logoFile.value);
    logoVersion.value++;
    logoFile.value = null;
  } catch (e) {
    error.value = extractApiError(e);
  }
}

// ---- Change password ----
const pwForm = reactive({ currentPassword: '', newPassword: '' });
const pwError = ref<string | null>(null);
const pwSaved = ref(false);
async function submitPassword() {
  pwError.value = null;
  pwSaved.value = false;
  try {
    await changePassword.mutateAsync({ ...pwForm });
    pwSaved.value = true;
    pwForm.currentPassword = '';
    pwForm.newPassword = '';
  } catch (e) {
    pwError.value = extractApiError(e);
  }
}

// ---- Active sessions ----
const { data: sessions } = useActiveSessions();

function deviceLabel(ua?: string | null) {
  if (!ua) return 'Thiết bị không xác định';
  if (/mobile/i.test(ua)) return 'Mobile';
  const browser = /edg/i.test(ua)
    ? 'Edge'
    : /chrome/i.test(ua)
      ? 'Chrome'
      : /firefox/i.test(ua)
        ? 'Firefox'
        : /safari/i.test(ua)
          ? 'Safari'
          : 'Trình duyệt';
  const os = /windows/i.test(ua)
    ? 'Windows'
    : /mac/i.test(ua)
      ? 'macOS'
      : /android/i.test(ua)
        ? 'Android'
        : /linux/i.test(ua)
          ? 'Linux'
          : '';
  return `${browser}${os ? ' · ' + os : ''}`;
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">{{ t('nav.profile') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ t('profile.subtitle') }}</p>

    <v-row>
      <v-col cols="12" md="6">
        <!-- Profile + avatar -->
        <v-card class="pa-6 mb-4">
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-alert v-if="saved" type="success" variant="tonal" density="compact" class="mb-4">
            {{ t('profile.updated') }}
          </v-alert>

          <div class="d-flex align-center ga-4 mb-4">
            <v-avatar size="72" color="secondary">
              <v-img v-if="hasAvatar" :src="avatarSrc" />
              <span v-else class="text-h5 text-white">{{ auth.user?.fullName?.[0] ?? 'U' }}</span>
            </v-avatar>
            <div class="flex-grow-1">
              <v-file-input
                v-model="avatarFile"
                accept="image/png,image/jpeg,image/webp"
                :label="t('profile.avatar')"
                density="compact"
                hide-details
                prepend-icon="mdi-camera"
              />
            </div>
            <v-btn
              color="primary"
              :loading="uploadAvatar.isPending.value"
              :disabled="!avatarFile"
              @click="doUploadAvatar"
            >
              {{ t('common.save') }}
            </v-btn>
          </div>

          <v-divider class="mb-4" />

          <v-text-field :model-value="auth.user?.email" :label="t('auth.email')" disabled />
          <v-text-field v-model="form.fullName" :label="t('auth.fullName')" />
          <v-text-field v-model="form.phone" :label="t('profile.phone')" />
          <v-autocomplete
            v-model="form.timezone"
            :items="timezones"
            :label="t('profile.timezone')"
            prepend-inner-icon="mdi-earth"
          />
          <v-chip size="small" class="mb-4">{{ auth.role }}</v-chip>
          <div class="d-flex justify-end">
            <v-btn color="primary" :loading="loading" @click="save">{{ t('common.save') }}</v-btn>
          </div>
        </v-card>

        <!-- Branding (teacher) — shown on exported PDF headers -->
        <v-card v-if="isTeacher" class="pa-6 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ t('branding.title') }}</h3>
          <p class="text-caption text-medium-emphasis mb-3">{{ t('branding.subtitle') }}</p>
          <v-alert v-if="brandSaved" type="success" variant="tonal" density="compact" class="mb-3">
            {{ t('branding.saved') }}
          </v-alert>

          <div class="d-flex align-center ga-4 mb-3">
            <v-avatar size="64" rounded="lg" color="grey-lighten-3">
              <v-img v-if="hasLogo" :src="logoSrc" />
              <v-icon v-else class="text-medium-emphasis">mdi-image-outline</v-icon>
            </v-avatar>
            <v-file-input
              v-model="logoFile"
              accept="image/png,image/jpeg"
              :label="t('branding.logo')"
              density="compact"
              hide-details
              prepend-icon="mdi-image-plus"
              class="flex-grow-1"
            />
            <v-btn color="primary" :loading="uploadLogo.isPending.value" :disabled="!logoFile" @click="doUploadLogo">
              {{ t('common.save') }}
            </v-btn>
          </div>

          <v-text-field v-model="brandForm.brandName" :label="t('branding.name')" />
          <v-text-field v-model="brandForm.address" :label="t('branding.address')" />
          <v-text-field v-model="brandForm.phone" :label="t('branding.phone')" />
          <div class="d-flex justify-end">
            <v-btn color="primary" :loading="updateBranding.isPending.value" @click="saveBranding">
              {{ t('common.save') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col v-if="canManageSecurity" cols="12" md="6">
        <!-- Change password -->
        <v-card class="pa-6 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ t('profile.changePassword') }}</h3>
          <v-alert v-if="pwError" type="error" variant="tonal" density="compact" class="mb-3">
            {{ pwError }}
          </v-alert>
          <v-alert v-if="pwSaved" type="success" variant="tonal" density="compact" class="mb-3">
            {{ t('profile.passwordChanged') }}
          </v-alert>
          <v-text-field
            v-model="pwForm.currentPassword"
            :label="t('profile.currentPassword')"
            type="password"
            autocomplete="current-password"
          />
          <v-text-field
            v-model="pwForm.newPassword"
            :label="t('profile.newPassword')"
            type="password"
            autocomplete="new-password"
          />
          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              :loading="changePassword.isPending.value"
              :disabled="!pwForm.currentPassword || pwForm.newPassword.length < 8"
              @click="submitPassword"
            >
              {{ t('profile.changePassword') }}
            </v-btn>
          </div>
        </v-card>

        <!-- Active sessions -->
        <v-card class="pa-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ t('profile.activeSessions') }}</h3>
          <v-list>
            <v-list-item v-for="s in sessions ?? []" :key="s.id" class="px-0">
              <template #prepend>
                <v-icon class="mr-3">mdi-monitor-cellphone</v-icon>
              </template>
              <v-list-item-title>
                {{ deviceLabel(s.userAgent) }}
                <v-chip v-if="s.current" size="x-small" color="success" variant="tonal" class="ml-1">
                  {{ t('profile.thisDevice') }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ s.ipAddress || '—' }} · {{ new Date(s.createdAt).toLocaleString() }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  v-if="!s.current"
                  size="small"
                  variant="text"
                  color="error"
                  :loading="revokeSession.isPending.value"
                  @click="revokeSession.mutate(s.id)"
                >
                  {{ t('profile.signOut') }}
                </v-btn>
              </template>
            </v-list-item>
            <div v-if="!sessions?.length" class="text-medium-emphasis text-caption">
              {{ t('profile.noSessions') }}
            </div>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
